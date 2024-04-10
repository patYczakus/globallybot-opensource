const { Client, Message, EmbedBuilder, WebhookClient } = require("discord.js")
const { getDatabase, ref, get, remove, set } = require("@firebase/database")
const { firebaseApp, customEmoticons, ownersID, GCmodsID } = require("./config")
const axios = require("axios").default
const fs = require("fs")
const { emoticons } = require("./cmds/globalchat/emotki")
const { listenerLog } = require("./functions/useful")

const timestampCooldown = new Date()
const globalCooldown = 1000
const channelCooldown = 3000
const userCooldown = 4500
let cooldownList = {
    channel: [],
    user: [],
}

function formatText(text) {
    text = text.replace(/{(?:emote|e):([^`\n}\s]+)}/g, (match, arg1) => {
        var info = {}
        emoticons.forEach((emoteInfo) => {
            emoteInfo.savenames.forEach((name) => {
                info[name] = emoteInfo.emote
            })
        })

        return info[arg1] ?? customEmoticons.minus
    })

    return text
}

/**
 * GlobalChat v2
 * @param {Client<true>} DiscordClient
 * @param {Message<true>} DiscordMessage
 * @param {{ text: string, msgID: string, author: { id: string, name: string, isUser: boolean, avatar: string | null }, location: string, files: string[] }} GlobalChatMessage
 */
function globalchatFunction(DiscordClient, DiscordMessage, GlobalChatMessage) {
    function calculateAge(birthDate, otherDate) {
        birthDate = new Date(birthDate)
        otherDate = new Date(otherDate)
        var years = otherDate.getFullYear() - birthDate.getFullYear()
        if (otherDate.getMonth() < birthDate.getMonth() || (otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate())) {
            years--
        }
        return years
    }
    var accDate = new Date()
    accDate = `${accDate.getFullYear()}-${accDate.getMonth() + 1}-${accDate.getDate()}`

    function wbName(gID) {
        if (ownersID.includes(GlobalChatMessage.author.id)) var rank = "właściciel"
        else if (GCmodsID.includes(GlobalChatMessage.author.id)) var rank = "moderator GC"
        else var rank = "osoba"

        return DiscordMessage.guildId != gID
            ? `${GlobalChatMessage.author.name} (${rank}; ${GlobalChatMessage.author.id})`
            : `${GlobalChatMessage.author.name} (${rank}; ten serwer)`
    }

    GlobalChatMessage.text = GlobalChatMessage.text.split("```")
    for (let i = 0; i < GlobalChatMessage.text.length; i++) {
        GlobalChatMessage.text[i] = {
            text: GlobalChatMessage.text[i],
            isInCode: i % 2 == 0 ? false : true,
        }
    }
    GlobalChatMessage.text = GlobalChatMessage.text.map(function (x) {
        if (!x.isInCode) {
            x.text = x.text
                .split("\n")
                .filter((c) => !c.startsWith("<##> "))
                .join("\n")
        }

        return x
    })
    GlobalChatMessage.text = GlobalChatMessage.text.map((x) => x.text).join("```")

    if (GlobalChatMessage.files.length == 0 && GlobalChatMessage.text == "") return

    /**
     * @returns {EmbedBuilder | undefined}
     */
    function repliedMessage(gID) {
        if (DiscordMessage.reference !== null) {
            var replayedMSG = DiscordMessage.channel.messages.cache.get(DiscordMessage.reference.messageId)
            if (typeof replayedMSG !== "undefined" && replayedMSG.author.bot) {
                var rContent = replayedMSG.content,
                    rAttachments

                //działanie komentarzy w odpowiadanej wiadomości
                rContent = rContent.split("```")
                for (let i = 0; i < rContent.length; i++) {
                    rContent[i] = {
                        text: rContent[i],
                        isInCode: i % 2 == 0 ? false : true,
                    }
                }
                rContent = rContent.map(function (x) {
                    if (!x.isInCode) {
                        x.text = x.text
                            .split("\n")
                            .filter((c) => !c.startsWith("<##> "))
                            .join("\n")
                    }

                    return x
                })
                rContent = rContent.map((x) => x.text).join("```")
                rContent = rContent.trim()

                var rUser = replayedMSG.author.username.split(" (")[0]

                var embed = { iconURL: replayedMSG.author.avatarURL({ extension: "png" }), name: `W odpowiedzi do ${rUser}` }
                if (gID == DiscordMessage.guildId) embed.url = replayedMSG.url
                embed = new EmbedBuilder().setAuthor(embed).setTimestamp(replayedMSG.createdTimestamp)
                if (rContent) embed = embed.setDescription(rContent)
                if (gID == DiscordMessage.guildId) embed = embed.setFooter({ text: "Kliknięcie w nagłówek spowoduje przeniesienie do odpowiadanej wiadomości" })
                if (replayedMSG.attachments.size > 0) {
                    rAttachments = replayedMSG.attachments.map((x) => `[\`${x.name}\`](<${x.url}>)`).join("\n")
                    embed = embed.addFields({ name: "Przesłane pliki", value: rAttachments })
                }

                return embed
            }
        }
    }

    //dla używania GlobalActions przez komentowanie
    var withoutReply = GlobalChatMessage.text.toLowerCase()

    var prefixes = fs.readdirSync("./src/globalactions/").map((x) => x.replace(".js", ""))
    for (var i = 0; i < prefixes.length; i++) {
        var resType = require(`./globalactions/${prefixes[i]}`).data.prompt_type

        if (
            (withoutReply.startsWith(`${prefixes[i]},`) && resType == "chat") ||
            (withoutReply.includes(`[${prefixes[i]}]`) && resType == "chat2.0") ||
            (withoutReply.startsWith(`${prefixes[i]}!`) && resType == "cmd")
        ) {
            prefixes = prefixes[i]
            break
        }
    }

    if (GlobalChatMessage.author.isUser) {
        get(ref(getDatabase(firebaseApp), "serverData")).then(async (snpsht) => {
            var database = snpsht.val() || {}

            database = Object.entries(database)
                .filter(([n, server]) => "gc" in server)
                .map(([id, data]) => {
                    return { id: id, gc: data.gc }
                })

            var getDataByServerID = (id, classification = "serverID") => {
                return database.map((x) => x[classification]).includes(id) ? database[database.map((x) => x[classification]).indexOf(id)] : null
            }

            var serverdata = getDataByServerID(DiscordMessage.guildId, "id")

            if (
                !database
                    .map((x) => Object.values(x.gc))
                    .flat()
                    .map((x) => x.channel)
                    .includes(DiscordMessage.channelId)
            )
                return

            listenerLog(3, "➿ Spełniono warunek (1/6)")

            {
                const idCheck = cooldownList.user.map((x) => x.id).findIndex((x) => x === GlobalChatMessage.author.id)
                if (idCheck > -1) {
                    DiscordMessage.reply(
                        `${customEmoticons.denided} Osobisty cooldown! Zaczekaj jeszcze \`${userCooldown - (Date.now() - cooldownList.user[idCheck].timestamp)}\` ms`
                    )
                    return
                }
            }

            {
                const idCheck = cooldownList.channel.map((x) => x.loc).findIndex((x) => x === GlobalChatMessage.location)
                if (idCheck > -1) {
                    DiscordMessage.reply(
                        `${customEmoticons.denided} Cooldown na kanale! Zaczekaj jeszcze \`${channelCooldown - (Date.now() - cooldownList.channel[idCheck].timestamp)}\` ms`
                    )
                    return
                }
            }

            if (timestampCooldown.getTime() + globalCooldown > Date.now()) {
                DiscordMessage.reply(`${customEmoticons.denided} Globalny cooldown! Zaczekaj jeszcze \`${globalCooldown - (Date.now() - timestampCooldown.getTime())}\` ms`)
                return
            }

            listenerLog(3, "➿ Spełniono warunek (2/6)")

            var userData = await get(ref(getDatabase(firebaseApp), `userData/${GlobalChatMessage.author.id}/gc`))
            if (userData.exists()) userData = userData.val()
            else {
                DiscordMessage.reply(
                    `${customEmoticons.info} Nie został zarejestrowany profil GlobalChat! Utwórz pod komendą \`profil utwórz typ:GlobalChat\`, aby móc z niego korzystać!`
                ).then((msg) => {
                    setTimeout(() => {
                        if (msg.deletable) msg.delete()
                    }, 10000)
                })
                DiscordMessage.react(customEmoticons.minus)
                return
            }

            listenerLog(3, "➿ Spełniono warunek (3/6)")

            if (userData.block.is) {
                DiscordMessage.react(customEmoticons.denided)
                return
            }

            listenerLog(3, "➿ Spełniono warunek (4/6)")

            if ((GlobalChatMessage.text.includes("discord.gg/") || GlobalChatMessage.text.includes("disboard.org/")) && !ownersID.includes(GlobalChatMessage.author.id)) {
                DiscordMessage.react(customEmoticons.denided)
                return
            }

            listenerLog(3, "➿ Spełniono warunek (5/6)")
            listenerLog(4, `✅ Ma możliwość wysłania wiadomości do GC`)
            listenerLog(5, `Informacje o wiadomości: `)
            listenerLog(5, `📌 ${GlobalChatMessage.location}/${DiscordMessage.id}`)
            if (DiscordMessage.reference !== null)
                listenerLog(
                    5,
                    `➡️ Zawiera odpowiedź na wiadomość (${DiscordMessage.reference.guildId}/${DiscordMessage.reference.channelId}/${DiscordMessage.reference.messageId})`
                )

            var station = Object.values(serverdata.gc)
                .map((x) => x.channel)
                .indexOf(DiscordMessage.channelId)
            station = Object.keys(serverdata.gc)[station]
            database = database.filter((x) => Object.keys(x.gc).includes(station)).map((x) => Object.assign(x.gc[station], { serverID: x.id }))

            listenerLog(4, `📌 Stacja "${station}"`)

            if (
                station === "pl-a" &&
                calculateAge(userData.birth, accDate) < 18 - 2 * GCmodsID.includes(DiscordMessage.author.id) &&
                !ownersID.includes(DiscordMessage.author.id)
            ) {
                DiscordMessage.react(customEmoticons.denided)
                return
            }

            listenerLog(3, "➿ Spełniono warunek (6/6)")
            listenerLog(3, "")
            listenerLog(3, "♻️ Wykonywanie sprawdzania webhooków")
            timestampCooldown.setTime(new Date().getTime())
            var webhooks = await Promise.all(
                database
                    .map((x) => x.serverID)
                    .map(async function (guildID) {
                        /**
                         * @type {WebhookClient}
                         */
                        var webhook

                        listenerLog(4, `➡️ Dla serwera o ID ${guildID}`)

                        //sprawdzanie, czy wgl istnieje serwer i kanał
                        const guild_DClient = DiscordClient.guilds.cache.get(guildID)
                        if (typeof guild_DClient != "undefined") {
                            //console.log(await guild_DClient.fetchOwner())
                            const channel_DClient = guild_DClient.channels.cache.get(getDataByServerID(guildID).channel)
                            if (typeof channel_DClient != "undefined") {
                                const dinfo = new Date()
                                if (getDataByServerID(guildID).webhook != "none") {
                                    try {
                                        var HTTPRes = await axios.get("https://discord.com/api/webhooks/" + getDataByServerID(guildID).webhook)
                                        if (!("code" in HTTPRes.data)) {
                                            webhook = new WebhookClient({
                                                url: "https://discord.com/api/webhooks/" + getDataByServerID(guildID).webhook,
                                            })
                                        } else {
                                            listenerLog(5, "❕ Nie wczytano webhooka, tworzenie nowego...")
                                            webhook = await guild_DClient.channels.createWebhook({
                                                name: `GlobalChat (${dinfo.getFullYear()}-${dinfo.getMonth()}-${dinfo.getDate()} ${dinfo.getHours()}:${dinfo.getMinutes()}:${dinfo.getSeconds()})`,
                                                channel: getDataByServerID(guildID).channel,
                                                reason: "wykonania usługi GlobalChat (brakujący Webhook)",
                                            })
                                            set(
                                                ref(getDatabase(firebaseApp), `serverData/${guildID}/gc/${station}/webhook`),
                                                webhook.url.replace("https://discord.com/api/webhooks/", "")
                                            )
                                        }
                                    } catch (e) {
                                        listenerLog(5, "❕ Wyłapano błąd, ignorowanie i tworzenie nowego...")
                                        webhook = await guild_DClient.channels.createWebhook({
                                            name: `GlobalChat (${dinfo.getFullYear()}-${dinfo.getMonth()}-${dinfo.getDate()} ${dinfo.getHours()}:${dinfo.getMinutes()}:${dinfo.getSeconds()})`,
                                            channel: getDataByServerID(guildID).channel,
                                            reason: "wykonania usługi GlobalChat (brakujący Webhook)",
                                        })
                                        set(
                                            ref(getDatabase(firebaseApp), `serverData/${guildID}/gc/${station}/webhook`),
                                            webhook.url.replace("https://discord.com/api/webhooks/", "")
                                        )
                                    }

                                    return { wh: webhook, gid: guildID }
                                } else {
                                    webhook = await guild_DClient.channels.createWebhook({
                                        name: `GlobalChat (${dinfo.getFullYear()}-${dinfo.getMonth()}-${dinfo.getDate()} ${dinfo.getHours()}:${dinfo.getMinutes()}:${dinfo.getSeconds()})`,
                                        channel: getDataByServerID(guildID).channel,
                                        reason: "wykonania usługi GlobalChat (brakujący Webhook)",
                                    })
                                    set(ref(getDatabase(firebaseApp), `serverData/${guildID}/gc/${station}/webhook`), webhook.url.replace("https://discord.com/api/webhooks/", ""))

                                    return { wh: webhook, gid: guildID }
                                }
                            } else {
                                guild_DClient.fetchOwner().then((gguildOwner) => {
                                    //embed z informacją o braku kanału
                                    const embedError = new EmbedBuilder()
                                        .setTitle("Nieznaleziony kanał")
                                        .setDescription(
                                            "W trakcie wykonywania usługi GlobalChat, nie udało mi się znaleźć kanału, do którego był ono przypisany - dzieje się tak, gdy kanał został usunięty. Usunięto przed chwilą z bazy danych informacje dla tego serwera i należy jeszcze raz ustawić kanał pod komendą `globalchat kanał ustaw`."
                                        )
                                        .addFields({
                                            name: "`Q:` Kanał przypisany do GlobalChata dalej istnieje, nie został on usunięty.",
                                            value: "`A:` Pobierając kanał, nie zwróciło po prostu poprawnej wartości, a dane usunięto. Należy spróbować ustawić kanał, jeżeli trzy próby zakończą się niepowodzeniem, należy **natychmiast zgłosić to do twórców** - do właściciela `patyczakus`, czy do [serwera support](https://discord.gg/536TSYqT)",
                                        })
                                        .setFooter({
                                            text: "Globally, powered by patYczakus",
                                        })
                                        .setColor("Orange")

                                    gguildOwner.send({
                                        content: `${customEmoticons.info} Tu bot Globally. Jako, że jesteś właścicielem serwera *${guild_DClient.name}*, jest bardzo ważna informacja dla Ciebie!`,
                                        embeds: [embedError],
                                    })

                                    remove(ref(getDatabase(firebaseApp), `serverData/${guildID}/gc/${station}`))
                                    return
                                })
                            }
                        } else {
                            remove(ref(getDatabase(firebaseApp), `serverData/${guildID}/gc/${station}`))
                            return
                        }
                    })
            )

            GlobalChatMessage.text = formatText(GlobalChatMessage.text)
            DiscordMessage.content = formatText(DiscordMessage.content)

            Promise.all(
                webhooks.map(async function (w) {
                    var a = repliedMessage(w.gid)
                    a = typeof a === "undefined" ? [] : [a]

                    if (typeof prefixes == "string") {
                        var _file = require(`./globalactions/${prefixes}`)
                        a.push(
                            new EmbedBuilder()
                                .setColor("#663399")
                                .setDescription(
                                    `Użytkownik właśnie użył GlobalAction o nazwie *${_file.data.name}*. Możesz się o nich dowiedzieć więcej pod komendą \`globalchat globalactions about\``
                                )
                        )
                    }

                    await w.wh.send({
                        avatarURL: GlobalChatMessage.author.avatar,
                        username: wbName(w.gid),
                        content: w.gid == DiscordMessage.guildId ? DiscordMessage.content : GlobalChatMessage.text,
                        embeds: a,
                        files: GlobalChatMessage.files,
                        allowedMentions: { parse: [] },
                    })

                    return
                })
            ).then(async () => {
                DiscordMessage.delete()

                cooldownList.channel.push({ loc: GlobalChatMessage.location, timestamp: Date.now() })
                setTimeout(
                    (ind) => {
                        cooldownList.channel = cooldownList.channel.filter((x, i) => x.loc !== ind)
                    },
                    userCooldown,
                    GlobalChatMessage.location
                )

                cooldownList.user.push({ id: GlobalChatMessage.author.id, timestamp: Date.now() })
                setTimeout(
                    (ind) => {
                        cooldownList.user = cooldownList.user.filter((x, i) => x.id !== ind)
                    },
                    userCooldown,
                    GlobalChatMessage.author.id
                )

                if (typeof prefixes == "string") {
                    const file = require(`./globalactions/${prefixes}`)
                    const response = await file.execute(GlobalChatMessage.text, DiscordMessage.author)

                    webhooks.map(async function (w) {
                        await w.wh.send(
                            Object.assign(response, {
                                avatarURL: file.data.avatar,
                                username: `${file.data.name} (GlobalAction)`,
                                allowedMentions: { parse: [] },
                            })
                        )

                        return
                    })
                }
            })
        })
    }
}

module.exports = {
    globalchatFunction,
}
