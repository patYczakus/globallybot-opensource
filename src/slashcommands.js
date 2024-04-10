const { SlashCommandBuilder } = require("@discordjs/builders")
const { ChannelType } = require("discord.js")
const fs = require("fs")

var slashList = [
    new SlashCommandBuilder()
        .setName("globalchat")
        .setDescription("Komendy dotyczące GlobalChata")
        .setDMPermission(true)
        .addSubcommand((subcommand) => subcommand.setName("regulamin").setDescription("Wysyła regulamin dotyczący GlobalChata"))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("emotki")
                .setDescription("Daje listę emotek dostępnych do użycia na GlobalChacie")
                .addStringOption((option) => option.setName("query").setDescription("Wyszukiwanie nazwy emotek").setAutocomplete(true).setMinLength(3))
        )
        .addSubcommandGroup((subcommand_group) =>
            subcommand_group
                .setName("osoba")
                .setDescription("Komendy zarządzające osobą")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("odblokuj")
                        .setDescription("Usuwa osobę z czarnej listy GlobalChata.")
                        .addUserOption((option) => option.setName("osoba").setDescription("@wzmianka lub ID osoby do sprawdzenia").setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("zablokuj")
                        .setDescription("Dodaje osoby do czarnej listy GlobalChata.")
                        .addUserOption((option) => option.setName("osoba").setDescription("@wzmianka lub ID osoby do zablokowania").setRequired(true))
                        .addStringOption((option) => option.setName("powód").setDescription("Powód zablokowania"))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("sprawdź")
                        .setDescription("Sprawdza, czy użytkownik został zablokowany, czy nie.")
                        .addUserOption((option) => option.setName("osoba").setDescription("@wzmianka lub ID osoby do sprawdzenia").setRequired(true))
                )
        )
        .addSubcommandGroup((subcommand_group) =>
            subcommand_group
                .setName("kanał")
                .setDescription("Komendy konfigurujące kanał do Globalchata")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("usuń")
                        .setDescription("Usuwa GlobalChat na serwerze")
                        .addStringOption((option) =>
                            option
                                .setName("stacja")
                                .setDescription("Nazwa tzw. stacji - odpowiada ona za inne dobieranie serwerów")
                                .setRequired(true)
                                .addChoices(
                                    { name: "Polski ogólny #1 (pl-o1)", value: "pl-o1" },
                                    { name: "Polski ogólny #2 (pl-o2)", value: "pl-o2" },
                                    { name: "Polski pełnoletni (pl-a)", value: "pl-a" }
                                )
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("ustaw")
                        .setDescription("Konfiguruje GlobalChat na serwerze")
                        .addChannelOption((option) =>
                            option.setName("kanał").setDescription("Kanał, na którym ma się znajdować GlobalChat").setRequired(true).addChannelTypes(ChannelType.GuildText)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("stacja")
                                .setDescription("Nazwa tzw. stacji - odpowiada ona za inne dobieranie serwerów")
                                .setRequired(true)
                                .addChoices(
                                    { name: "Polski ogólny #1 (pl-o1)", value: "pl-o1" },
                                    { name: "Polski ogólny #2 (pl-o2)", value: "pl-o2" },
                                    { name: "Polski pełnoletni (pl-a)", value: "pl-a" }
                                )
                        )
                )
        )
        .addSubcommandGroup((subcommand_group) =>
            subcommand_group
                .setName("globalactions")
                .setDescription("Akcje dostępne w usłudze GlobalChat")
                .addSubcommand((subcommand) => subcommand.setName("about").setDescription("Informacje na temat GlobalActions"))
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("info")
                        .setDescription("Informacje na temat danej akcji w GlobalActions")
                        .addStringOption((option) =>
                            option
                                .setName("ga")
                                .setDescription("Nazwa akcji")
                                .setRequired(true)
                                .addChoices(
                                    ...fs.readdirSync("./src/globalactions/").map((x) => {
                                        x = x.replace(".js", "")
                                        x = { name: require(`./globalactions/${x}`).data.name, value: x }

                                        return x
                                    })
                                )
                        )
                )
        ),
    new SlashCommandBuilder().setDMPermission(true).setName("botinfo").setDescription("Generuje informacje o bocie"),
    new SlashCommandBuilder()
        .setName("devtools")
        .setDMPermission(true)
        .setDescription("Mega tajemne komendy...")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("eval")
                .setDescription("Wykonuje kod [DLA DEWELOPERÓW]")
                .addStringOption((option) => option.setName("func").setDescription("Funkcja do wykonania").setRequired(true))
        ),
    new SlashCommandBuilder()
        .setName("profil")
        .setDMPermission(true)
        .setDescription("Komedy związane z profilami; nie powinno być wyłączane dla GlobalChata i innych usług!")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("utwórz")
                .setDescription("Tworzy profil danej usługi")
                .addStringOption((option) =>
                    option.setName("typ").setDescription("Typ usługi dla tworzenia profilu").setRequired(true).addChoices({ name: "GlobalChat", value: "gc" })
                )
        ),
]
//console.log(slashList)

module.exports = {
    list: slashList,
}
