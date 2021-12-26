const Database = require("@replit/database");
const db = new Database();

module.exports = {
    name: 'cleardb',
    description: 'fully clear the database',
    usage: "%PREFIX%cleardb",
    admin: true,
    execute(client, message, args, user, userStats) {
        db.list().then(keys => {for(let i=0; i<keys.length; ++i) db.delete(keys[i])}); 
    }
}