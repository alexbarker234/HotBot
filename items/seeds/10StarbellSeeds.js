const config = require(global.appRoot + "/config.json");

module.exports = {
    name: "Starbell Seeds",
    desc: "",
    price: 5000,
    hideInShop: true,
    buyRequirements: () => Date.nowWA().getDay() == config.gobbyTraderDay
}