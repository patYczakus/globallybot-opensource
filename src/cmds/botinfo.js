const { CommandInteraction, Client, EmbedBuilder } = require("discord.js")
const { customEmoticons } = require("../config")
const { codeTime } = require("..")

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const time = Math.floor((Date.now() - codeTime()) / 1000)
        const readyTime = Math.floor(client.readyTimestamp / 1000)
        var guildsName = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)
        var i = 0
        guildsName.forEach((guild) => {
            if (i == 0) guildsName = ""
            if (i < 10) guildsName += `${guild.name} (${guild.id}; ${guild.memberCount} osób)\n`
            i++
        })

        var embed = new EmbedBuilder()
            .setTitle(`${customEmoticons.info} Informacje o bocie`)
            .setDescription(
                "Dodaj bota: [link](https://discord.com/api/oauth2/authorize?client_id=1173734205855911987&permissions=2684726360&scope=applications.commands%20bot)\nSerwer support: [link](https://discord.gg/7S3P2DUwAm)"
            )
            .addFields(
                {
                    name: "Czasy",
                    value: `Uruchomienia bota: <t:${time}:F> (<t:${time}:R>)\nGotowości bota: <t:${readyTime}:F> (<t:${readyTime}:R>)`,
                    inline: false,
                },
                {
                    name: "Serwery",
                    value: `Ilość: ${String(client.guilds.cache.size)}\nNazwy: ||Wyświetlane są max. 10 serwerów|| \`\`\`${guildsName}\`\`\``,
                    inline: false,
                }
            )
            .setFooter({ text: "Globally, powered by patYczakus" })
            .setColor("Yellow")

        interaction.reply({
            content: "",
            embeds: [embed],
        })
    },
}
