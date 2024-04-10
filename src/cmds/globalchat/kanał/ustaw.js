const { CommandInteraction, Client, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { getDatabase, ref, get, set } = require("@firebase/database")
const { firebaseApp, ownersID, customEmoticons, botID, supportServer, debug, constPremiumServersIDs } = require("../../../config")

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const supportButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Bądź na bieżąco z botem!").setURL("https://discord.gg/7S3P2DUwAm")

        if (debug && !ownersID.includes(interaction.user.id))
            return interaction.reply({
                ephemeral: true,
                content: "Komenda jest niestety wyłączona dla każdego; bot przeszedł właśnie w tryb debugowania i trwają prace nad nim. Przepraszamy za utrudnienia!",
                components: [new ActionRowBuilder({ components: [supportButton] })],
            })
        if (interaction.guildId == null) return interaction.reply(`${customEmoticons.denided} Nie możesz wykonać tej funkcji w prywatnej konserwacji!`)

        //argument kanału i serwer
        var channel = interaction.options.get("kanał", true)
        var guild = client.guilds.cache.get(interaction.guildId)
        var bot = guild.members.cache.get(botID)
        if (
            !(
                (interaction.member.permissions.has(PermissionFlagsBits.ManageWebhooks & PermissionFlagsBits.ManageChannels) ||
                    interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
                    interaction.user.id == guild.ownerId ||
                    ownersID.includes(interaction.user.id)) &&
                (bot.permissions.has(PermissionFlagsBits.Administrator) || bot.permissions.has(PermissionFlagsBits.ManageWebhooks))
            )
        )
            //zwraca informację widoczną tylko dla niego za pomocą interaction.reply(), że nie ma odpowiednich permisji.
            return interaction.reply({
                ephemeral: true,
                content: `${customEmoticons.denided} Nie możesz wykonać tej funkcji! Możliwe powody:
                    - Nie masz obu uprawnień: **Zarządzanie webhoookami** oraz **Zarządzanie kanałami**
                    - Nie masz permisji administratora
                    - Nie jesteś właścicielem serwera
                    - Bot nie ma permisji administrotara lub uprawnienia **Zarządzanie Webhookami**
                    - Nie jesteś na liście developerów bota`
                    .split("\n")
                    .map((x) => x.trim())
                    .join("\n"),
            })

        interaction.deferReply().then(() => {
            //wczytywanie danych
            get(ref(getDatabase(firebaseApp), `serverData/${interaction.guildId}/gc`)).then((allsnpsht) => {
                var gccount = allsnpsht.exists() ? Object.keys(allsnpsht.val()).length : 0

                if (gccount > 0 && supportServer.id !== interaction.guildId && !constPremiumServersIDs.includes(interaction.guildId)) {
                    return interaction.editReply(`${customEmoticons.denided} Przekroczony został limit ustawionych stacji!`)
                }

                var $stacja = interaction.options.get("stacja", true).value

                if (allsnpsht.exists())
                    var channelsInOtherStations = Object.values(allsnpsht.val())
                        .filter((x, y) => y == Object.keys(allsnpsht.val()).indexOf(interaction.options.get("stacja", true).value))
                        .map((x) => x.channel)
                else var channelsInOtherStations = []

                if (channelsInOtherStations.includes(channel.value)) {
                    return interaction.editReply(`${customEmoticons.denided} Ten kanał ma już odrębną stację!`)
                }
                get(ref(getDatabase(firebaseApp), `serverData/${interaction.guildId}/gc/${$stacja}`)).then((snapshot) => {
                    //sprawdzanie, czy już jest w bazie danych serwer i czy zawiera ten kanał bazie
                    var _bool = snapshot.exists()
                    var data = snapshot.val()

                    if (_bool && data.channel == channel.value) return interaction.editReply(`${customEmoticons.denided} Na tym kanale jest już ustawiony GlobalChat o tej stacji!`)

                    set(ref(getDatabase(firebaseApp), `serverData/${interaction.guildId}/gc/${$stacja}`), {
                        channel: channel.value,
                        webhook: "none",
                    }).then(() => {
                        //informacja o zapisie
                        if (!_bool) interaction.editReply(`${customEmoticons.approved} Dodano pomyślnie kanał na stacji \`${$stacja}\`!`)
                        else {
                            interaction.editReply(
                                `${customEmoticons.info} Jako że ten serwer już miał ustawiony kanał GlobalChata na kanale <#${data.channel}> (stacja \`${$stacja}\`), spowodowało to nadpis na nowy kanał.`
                            )
                        }
                    })
                })
            })
        })
    },
}
