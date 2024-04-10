const { debug } = require("../config")

var listenerLog = function (space, info, priority = false) {
    if (!debug && !priority) return

    var text = ""
    for (let index = 0; index < space; index++) {
        text += "|   "
    }
    text += info

    console.log(text)
}

/**
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = {
    listenerLog: listenerLog,
    wait,
}
