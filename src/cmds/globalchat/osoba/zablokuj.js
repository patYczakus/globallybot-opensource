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
        if (!ownersID.includes(interaction.user.id) && !GCmodsID.includes(interaction.user.id))
            //zwraca informację widoczną tylko dla niego za pomocą interaction.reply(), że nie ma odpowiednich permisji.
            return interaction.reply({
                ephemeral: true,
                content: `${customEmoticons.denided} Nie możesz wykonać tej funkcji! Możliwe powody:\n- Nie jesteś na liście developerów bota\n- Nie jesteś na liście moderatorów GlobalChata`,
            })

        try {
            var uID = interaction.options.getUser("osoba", true).id
            interaction
                .deferReply({
                    ephemeral: interaction.inGuild(),
                })
                .then(() => {
                    get(ref(getDatabase(firebaseApp), `userData/${uID}/gc/block`)).then((snapshot) => {
                        block = snapshot.val()

                        if (!snapshot.exists()) {
                            interaction.editReply({
                                content: `${customEmoticons.minus} Ta osoba jeszcze nie utworzyła profilu...`,
                            })
                            return
                        }

                        if (block.is) {
                            interaction.editReply({
                                content: `${customEmoticons.denided} Ta osoba jest zablokowana!`,
                            })
                            return
                        }

                        block.is = true
                        block.reason = interaction.options.get("powód") == null ? "" : interaction.options.get("powód").value
                        const embedblock = new EmbedBuilder()
                            .setTitle("Zostałeś zablokowany!")
                            .setDescription(`Od teraz nie będziesz miał dostępu do GlobalChata do odwołania!`)
                            .setColor("Red")
                            .setFields(
                                {
                                    name: "Blokowany przez",
                                    value: `${(interaction.user.discriminator = "0"
                                        ? interaction.user.username
                                        : `${interaction.user.username}#${interaction.user.discriminator}`)}`,
                                },
                                {
                                    name: "Powód",
                                    value: interaction.options.get("powód") == null ? customEmoticons.denided : `\`\`\`${interaction.options.get("powód", false).value}\`\`\``,
                                }
                            )

                        client.users.send(uID, {
                            embeds: [embedblock],
                        })

                        interaction.editReply({
                            content: `${customEmoticons.approved} Pomyślnie zablokowano użytkownika <@${uID}> \`${uID}\``,
                        })
                        set(ref(getDatabase(firebaseApp), `userData/${uID}/gc/block`), block)
                    })
                })
        } catch (err) {
            interaction.reply({
                content: "Coś poszło nie tak... spróbuj ponownie!",
            })
            console.warn(err)
        }
    },
}
