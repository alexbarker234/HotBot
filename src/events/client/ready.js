module.exports = (Discord, client) => {
    console.log(`bot moment. logged in with node ${process.version}`);
    client.user.setActivity("being super hot", { type: 'COMPETING' });
}