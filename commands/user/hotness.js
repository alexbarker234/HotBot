const functions = require('../../functions.js')
const seedrandom = require('seedrandom');

/** TODO
 * put all compliments in a file and select from there
 * add weighted randomness above 10 so it becomes increasingly rare
 */

module.exports = {
    name: 'hotness',
    description: 'get your daily hotness',
    usage: "!hotness <previous date>",
    execute(client, message, args, user, userStats){  
        if (Math.floor(Math.random() * 10) == 0 && !args[0]) {
            switch(Math.floor(Math.random() * 3)) {
                case 0:
                    message.channel.send("your bellybutton is kind of adorable");
                    break;
                case 1:
                    message.channel.send("you have cute elbows. for real");
                    break;
                case 2:
                    message.channel.send("i love every inch of you - even your toes");
                    break;
                default:
              }
        }
        let day = Math.trunc((Date.now() + 28800000) / 86400000); // 28800000 is adding 8 hours because timezone
        if (args[0]) {
            let parsedDate = Date.parseWADate(args[0]);
            let parsedDay = Math.trunc(parsedDate / 86400000);

            if (parsedDay > day) return message.channel.send("sorry i cant see the future :(");
            else if (parsedDate < new Date(Date.parse("2021/08/02")).addHours(8)) return message.channel.send("that was before i was born!");

            if (parsedDay == day) args[0] = undefined; // jankyish way but thats my speciality 
            day = parsedDay;
        }

        var rng = seedrandom(message.author.id + day); 
        hotness = functions.getHotness(message.author.id, args[0])

        var compliment = '';

        switch(hotness) {
            case 7:
                options = ["you make flowers look ugly <3",
                            "youre as stunning as ever",
                            "your hair is beautiful today"];
                compliment = options[Math.floor(rng() * options.length)];
                break;
            case 8:
                options = ["everything is brighter around you :)",
                            "If you were a siren, I’d happily drown :kissing_heart:",
                            "id watch you instead of the stars :sparkles: "];
                compliment = options[Math.floor(rng()* options.length)];
                break;
            case 9:
                options = ["you radiate today! you'll be catching everyones eyes :eyes:",
                            "your smile turns us to jelly :smile:",
                            "your eyes are my lucky stars <3"];
                compliment = options[Math.floor(rng() * options.length)];
                break;
            case 10:
                options = ["anyone who interacts with you is extraordinarily lucky to witness such beauty",
                            "you're a 10 amongst these 3's",
                            "you are a sunflower - bright, happy and full of life"];
                compliment = options[Math.floor(rng() * options.length)];
                break;
            case 11:
                options = ["your hotness warms the globe, but i'll be happy to die with you here :D",
                            "i wish i could see through your webcam...",
                            "you make everyone around you hotter, thanks gorgeous"];
                compliment = options[Math.floor(rng() * options.length)];
                break;
            case 12:
                options = ["every step you take ignites fires, just like you've lit a fire in my heart <3",
                            "mirror mirror on the wall, whos the hottest of them all... you are of course <3",
                            "aphrodite trembles in your allure :heart_eyes: "];
                compliment = options[Math.floor(rng() * options.length)];
                break;
            default:
                return message.channel.send("alex cant code, hes a 2/10");
        }
        if (args[0]) message.channel.send("on " + args[0] + ", you were a " + hotness + "/10, " + compliment)
        else message.channel.send(hotness + "/10, " + compliment)
    }
}