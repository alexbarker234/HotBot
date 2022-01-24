module.exports = {
    name: "Ignit",
    desc: "Ignits are creatures that possess magical abilties. They use their magic in order to perform tricks, often trying to confuse visitors with seemingly simple, but normally impossible moves. Ignits favourite trick involve them hiding behind a rock until their audience comes to investigate, where they then disappear and reapear behind another rock. Their aura's have an almost time distorting effect- resulting in people getting trapped for hours playing with ignits, sometimes until they die of exhaustion They only come out when the sky is overcast" ,
    requirements: "50% clouds coverage",
    price: 0,
    hatchTime: 24 * 60 * 60 * 1000,
    weight: (client, user) => client.weatherCache.clouds >= 50 ? 0.5 : 0
}
