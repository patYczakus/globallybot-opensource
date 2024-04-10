//szkielet komendy, jak w całym folderze ./cmds
const { CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const fs = require("fs")
const { customEmoticons } = require("../../../config")

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        var fileN = interaction.options.get("ga", true).value
        var file = require(`../globalactions/${fileN}`)
        var use

        if (file.data.prompt_type == "cmd") use = "```{nazwa_wywoławcza}!<komenda>```"
        if (file.data.prompt_type == "chat") use = "```{nazwa_wywoławcza}, <polecenie>```"
        if (file.data.prompt_type == "chat2.0") use = "Wystarczy użyć w kwadratowe nawiasy nazwę wywoławczą (tutaj: `[{nazwa_wywoławcza}]`)"

        var embed = new EmbedBuilder()
            .setTitle(`${file.data.name}`)
            .setThumbnail(file.data.avatar)
            .setDescription(file.data.description)
            .addFields({ name: "Nazwa wywoławcza", value: `\`${fileN}\`` }, { name: "Użycie", value: use.replace("{nazwa_wywoławcza}", fileN) })
            .setColor("Random")

        return interaction.reply({
            content: "",
            embeds: [embed],
        })
    },
}
