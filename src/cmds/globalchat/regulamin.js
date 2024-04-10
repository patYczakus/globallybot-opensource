const { CommandInteraction, Client } = require("discord.js")
const { customEmoticons } = require("../../config")
module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        let text1 = `` // część pierwsza regulaminu
        let text2 = `` // część druga regulaminu

        interaction.reply(text1).then(() => {
            interaction.followUp(text2)
        })
    },
}
