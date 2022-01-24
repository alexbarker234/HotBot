const functions = require(global.src + '/functions/functions.js');
module.exports = {
    name: "Bleap",
    desc: "A curious little slime often found in large groups. Sometimes they can be seen harassing lone gorbs. People describe them as pests and often use them as an alternative for footballs. Despite their rocky spines, they get a fair distance due to their elasticity.",
    requirements: "None",
    price: 0,
    hatchTime: 1 * 60 * 60 * 1000,
    weight: (client, user) => 1
}