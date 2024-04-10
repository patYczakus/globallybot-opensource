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
        var embed = new EmbedBuilder()
            .setTitle(`${customEmoticons.info} Korzystanie z GlobalActions`)
            .setDescription(
                "GlobalActions są to akcje dostępne do korzystania w GlobalChacie. Dzięki temu możesz urozmaicić usługę ciekawymi rzeczami!\nUżycie może być różne, w zależności od danego GA"
            )
            .addFields(
                {
                    name: "Q: Gdzie mogę sprawdzić listę akcji?",
                    value: "**A:** Podczas korzystania z komendy `globalchat globalactions info`. Argument *`ga`* ma do wyboru wszystkie akcje dostępne do GlobalChat.",
                },
                { name: "Q: Posiadają jakieś ograniczenia?", value: "**A:** Nie wszystkie - w razie ograniczeń w opisie będzie wzmianka na ten temat." },
                {
                    name: "Q: Czy mogę przekształcać nazwę wywoławczą?",
                    value: "**A:** Ułatwienie jest takie, że nazwę wywoławczą możesz pisać małymi, wielkimi lub mieszanką małych i dużych liter, aczkolwiek literówek jeszcze nie przyjmuje.",
                }
            )
            .setColor("Random")

        return interaction.reply({
            content: "",
            embeds: [embed],
        })
    },
}
