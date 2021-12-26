module.exports = {
    name: 'coinflip',
    description: 'flip a coin.',
    usage: "%PREFIX%coinflip <guess>",
    execute(client, message, args, user, userStats){

        let flip = Math.floor(Math.random() * 2) == 0 ? "heads" : "tails";

        let guessH = ["heads","h"];
        let guessT = ["tails", "t"];

        if (args[0]){
            args[0] = args[0].toLowerCase();
            if (flip == "heads") message.channel.send("it's heads,"  + (guessH.includes(args[0]) ? " nice guess!" : " sorry babe"));
            else if (flip == "tails") message.channel.send("it's tails," + (guessT.includes(args[0]) ? " nice guess!" : " sorry babe"));
            else message.channel.send("alex is dumb and this is why we love him")
        }
        else message.channel.send("it's " + flip)
    }
}