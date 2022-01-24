const express = require('express');
const server = express();

server.all('/', (req, res)=>{
    res.send('im a bot, bein hot')
})

function keepAlive(){
    server.listen(3000, ()=>{console.log("boop, server up")});
}

module.exports = keepAlive;
