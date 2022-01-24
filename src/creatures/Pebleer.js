module.exports = {
    name: "Pebleer",
    desc: "",
    requirements: "First week of the month, alternating weeks after that.",
    price: 0,
    hatchTime: 4 * 60 * 60 * 1000,
    weight: (client, user) => {
        const time = Date.nowWA();
        return (Math.floor(time.getDate() / 7) % 2 == 0) ? 0.3 : 0
    }
}