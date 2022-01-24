module.exports = {
    name: "Tachyon Field",
    desc: "Slight distortions in space-time around your hatchery causes the eggs to travel through time faster than us, with the percieved effect of them hatching faster ",
    effect: "Reduce egg hatch time by 2%",
    price: 2000,
    max: 5,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.eggHatchSpeed += 0.02 * amount;
        statObject.eggHatchSpeedText +=  `Tachyon Field: +${0.02 * amount * 100}%\n`;
    }
}