const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: "Eyezor",
    desc: "",
    requirements: "Full moon",
    price: 0,
    hatchTime: 24 * 60 * 60 * 1000,
    weight: (client, user) => {
        const time = Date.nowWA();
        return (
            time.betweenHours(18,6) &&
            functions.getMoonPhase(time.getFullYear(), time.getMonth(), time.getDate()).phase == 4) 
            ? 0.7 : 0; 
    }
}