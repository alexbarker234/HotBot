var fs = require('fs');

module.exports = {
    name: 'todo',
    description: 'add to the todo list',
    usage: "%PREFIX%todo <what>",
    admin: true,
    execute(client, message, args, user, userStats){
        fs.appendFile('todo.txt', "-" + args.join(' ') + "\n", function (err) {
        if (err) throw err;
        });

        message.delete();
    }
}   