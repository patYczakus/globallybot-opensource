const { User, WebhookMessageCreateOptions } = require("discord.js")
const { wait } = require("../functions/useful")
const { customEmoticons } = require("../config")

module.exports = {
    data: {
        /**
         * Nazwa dla tego GlobalAction (Wygląd: *`<nazwa akcji> (GlobalAction)`*)
         */
        name: "GA Template",
        /**
         * Opis dla tego GlobalAction. Jeżeli ma limity, należy tutaj o tym wspomnieć!
         */
        description: "Templatka dla programisty. Nie powinien być w użyciu!",
        /**
         * Awatar dla tego GlobalAction, w formie linku
         */
        avatar: "[ jakiś link ]",
        /**
         * Typ zwracania, który ma wykonać tego GlobalAction.
         *
         * Wartość `cmd` odpowiada stylu komendy, dokładnie: *`<nazwa pliku>!<komenda> <argument1> <argument2> ... <argumentN>`*.
         *
         * Wartość `chat` zwraca styl prośby, konkretnie *`<nazwa pliku>, <zdanie>`*. **Jeżeli chcesz używać ścisłych reguł, użyj `cmd`!**.
         *
         * Wartość `chat2.0` odpala tylko wtedy, kiedy wykrywa w chacie *`[<nazwa pliku>]`* (na przykład *`[GPT]`*)
         * @type {"cmd" | "chat2.0" | "chat"}
         */
        prompt_type: "cmd",
    },
    /**
     * @param {string} msg
     * @param {User} user
     * @returns {Promise<WebhookMessageCreateOptions>}
     */
    execute: async function (msg, user) {
        // Jeżeli używasz "cmd", to tutaj masz trochę rzeczy
        var a = msg.slice(msg.split("!")[0].length + 1).split(" ")
        const cmd = a[0]
        const args = [...a.filter((x, i) => i > 0)]

        return { content: "OK" }
    },
}
