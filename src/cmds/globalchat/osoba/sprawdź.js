const { CommandInteraction, Client, EmbedBuilder } = require("discord.js")
const { getDatabase, ref, set, get } = require("@firebase/database")
const { firebaseApp, ownersID, customEmoticons, GCmodsID } = require("../../../config")

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        interaction.deferReply().then(() => {
            get(ref(getDatabase(firebaseApp), `userData/${interaction.options.getUser("osoba", true).id}/gc/block`)).then((snapshot) => {
                block = snapshot.val()

                if (!snapshot.exists()) var msg = `Jest zablokowany: ${customEmoticons.minus} (brak profilu)`
                else if (block.is)
                    var msg = `Jest zablokowany: ${customEmoticons.approved}\nPowód blokady: ${block.reason === "" ? customEmoticons.minus : "```" + block.reason + "```"}`
                else var msg = `Jest zablokowany: ${customEmoticons.denided}`

                var embed = new EmbedBuilder()
                    .setAuthor({
                        name: (interaction.options.getUser("osoba", true).discriminator = "0"
                            ? interaction.options.getUser("osoba", true).username
                            : `${interaction.options.getUser("osoba", true).username}#${interaction.options.getUser("osoba", true).discriminator}`),
                        iconURL: interaction.options.getUser("osoba", true).avatarURL({ size: 256 }),
                    })
                    .setTitle("Informacje o blokadzie")
                    .setDescription(msg)
                    .setColor(typeof interaction.options.getUser("osoba", true).hexAccentColor !== "undefined" ? interaction.options.getUser("osoba", true).hexAccentColor : null)
                interaction.editReply({
                    embeds: [embed],
                })
            })
        })
    },
}
