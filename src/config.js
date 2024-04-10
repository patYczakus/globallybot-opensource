const { initializeApp } = require("@firebase/app")

const firebaseConfig = {
    /* Konfiguracja połączenia z Firebase */
}

module.exports = {
    TOKEN: "",
    firebaseApp: initializeApp(firebaseConfig),
    ownersID: [],
    GCmodsID: [], // moderatorzy GC
    supportServer: {
        id: "",
    },
    botID: "",
    customEmoticons: {
        loading: "",
        info: "",
        denided: "",
        approved: "",
        minus: "",
    },
    constPremiumServersIDs: [],
    debug: false,
}
