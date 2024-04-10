const { Client, CommandInteraction, AutocompleteFocusedOption } = require("discord.js")
const { customEmoticons } = require("../../config")

module.exports = {
    emoticons: [
        { savenames: ["paczka.nazwa", "px.kekw"], emote: "<:emotka:012345>" },
        {
            savenames: ["paczka.nazwa1", "paczka.nazwa2"],
            emote: "<a:inna_emotka:678901>",
            server: { id: "213769", iCode: "lMa0" },
        },
    ],

    /**
     * @param {AutocompleteFocusedOption} acFocusedInformation
     */
    autocomplete(acFocusedInformation) {
        var options = this.emoticons.map((x) => x.savenames).flat()
        options = options.filter((x) => x.includes(acFocusedInformation.value)).filter((x, i) => i < 25)
        return options
    },
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const queryOption = interaction.options.get("query")
        this.emoticons = this.emoticons.filter((x) => typeof x.server === "undefined" || typeof client.guilds.cache.get(x.server.id) !== "undefined")
        if (!queryOption) {
            interaction.reply({
                content: `# Lista globalnych emotek\n${customEmoticons.info} Użycie: \`{e:<nazwa>}\` lub \`{emote:<nazwa>}\`\n${this.emoticons
                    .sort(() => Math.random() - 0.5)
                    .filter((x, i) => i < 10)
                    .map((x) => {
                        return `\n${x.emote} - \`${x.savenames[0]}\` (aliasy: ${
                            x.savenames.length > 1 ? `${customEmoticons.approved}, ilość: ${x.savenames.length - 1}` : customEmoticons.denided
                        })${typeof x.server === "undefined" ? "" : ` *//ze serwera [${client.guilds.cache.get(x.server.id).name}](<https://discord.gg/${x.server.iCode}>)*`}`
                    })}\n\nTutaj się wyświetla maksymalnie 10 emotek. Możesz użyć parametru \`query\`, aby wyszukać emotki`,
            })
        } else {
            const queryVal = queryOption.value
            var query = this.emoticons.filter((x) => {
                var have = false
                x.savenames.forEach((savename) => {
                    have ||= savename.includes(queryVal)
                })

                return have
            })

            if (query.length == 0) {
                interaction.reply(`${customEmoticons.denided} Niestety, ta emotka nie istnieje w bazie danych lub jest niedostępna`)
            } else if (query.length == 1) {
                const em = query[0]
                interaction.reply(
                    `# Emotka ${em.emote} jako \`{emote:${em.savenames[0]}}\`\nAlternatywy dla tej emotki: ${
                        em.savenames.filter((x, i) => i > 0).length > 0 ? `\`\`\`\n${em.savenames.filter((x, i) => i > 0).join("\n")}\n\`\`\`` : "brak"
                    }${
                        typeof em.server === "undefined"
                            ? ""
                            : `\nTa emotka pochodzi ze serwera [*${client.guilds.cache.get(em.server.id).name}*](<https://discord.gg/${em.server.iCode}>)*`
                    }\n*Możesz także użyć \`{e:${em.savenames[0]}}\`*`
                )
            } else {
                interaction.reply(
                    `Znaleziono kilka emotek z tym zapytaniem. Wyświetlanie losowych **${Math.min(query.length, 12)}** z **${query.length}**\n${query
                        .sort(() => Math.random() - 0.5)
                        .filter((x, i) => i < 12)
                        .map((x) => {
                            return `\n${x.emote} - \`${x.savenames[0]}\` (aliasy: ${
                                x.savenames.length > 1 ? `${customEmoticons.approved}, ilość: ${x.savenames.length - 1}` : customEmoticons.denided
                            })${typeof x.server === "undefined" ? "" : ` *//ze serwera [${client.guilds.cache.get(x.server.id).name}](<https://discord.gg/${x.server.iCode}>)*`}`
                        })}`
                )
            }
        }
    },
}
