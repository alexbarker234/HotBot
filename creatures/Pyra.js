module.exports = {
    name: "Pyra",
    desc: "Pyras are the self-conscious cousins of bats. They are rather clumsy with their large flaming wings, often bumping into walls and proceeding to hurry off and hide out of embarassment. If you look at a pyra for too long, it may get angry and try to attack you. It wont succeed. Pyras tend to migrate away during Thursday to Sunday",
    requirements: "Monday-Wednesday",
    price: 0,
    hatchTime: 5 * 60 * 60 * 1000,
    weight: (client, user) => {
        const time = Date.nowWA();
        return (time.getDay() < 4 && time.getDay() > 0) ? 0.4 : 0;
    }
}