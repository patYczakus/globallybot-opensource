const { CommandInteraction, Client } = require("discord.js")
const { getDatabase, ref, get, set } = require("@firebase/database")
const { firebaseApp, customEmoticons } = require("../../config")

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        interaction
            .deferReply({
                ephemeral: true,
            })
            .then(() => {
                get(ref(getDatabase(firebaseApp), `userData/${interaction.user.id}/${interaction.options.get("typ", true).value}`)).then((snpsht) => {
                    if (snpsht.exists()) return interaction.editReply(`${customEmoticons.denided} Ty już masz ten profil utworzony!`)

                    var structure
                    var name
                    var addMoreWordsAbout = ""
                    switch (interaction.options.get("typ", true).value) {
                        case "gc": {
                            structure = {
                                block: {
                                    is: false,
                                    reason: "",
                                },
                                birth: `${interaction.user.createdAt.getFullYear()}-${interaction.user.createdAt.getMonth() + 1}-${interaction.user.createdAt.getDate()}`,
                            }
                            name = "GlobalChat"
                            addMoreWordsAbout =
                                "Pamiętaj o przestrzeganiu regulaminu - znajdziesz pod komendą `globalchat regulamin`. Weryfikacja wieku powinna być kierowana do użytkownika *patyczakus* na PV/DM!"
                            break
                        }
                    }
                    set(ref(getDatabase(firebaseApp), `userData/${interaction.user.id}/${interaction.options.get("typ", true).value}`), structure).then(() => {
                        interaction.editReply(
                            `${customEmoticons.approved} Dodano pomyślnie profil do usługi *${name}*${
                                addMoreWordsAbout === "" ? "" : `\n${customEmoticons.info} ${addMoreWordsAbout}`
                            }`
                        )
                    })
                })
            })
    },
}
