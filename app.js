const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();
require('dotenv').config()

const prefix = "!";

const findPokemon = (name, evolutionInfo) => {
    specyName = evolutionInfo.species.name
    evolutionInfo = evolutionInfo.evolves_to[0]
    if (specyName === name) {
        if (!evolutionInfo) return `${name} doesn't evolve`;
        else {
            let details = evolutionInfo.evolution_details[0]
            let { min_level, trigger } = details;
            if (min_level) return `${name} evolves to ${evolutionInfo.species.name} at ${min_level}`;
            else return `${name} evolves to ${evolutionInfo.species.name} with ${trigger.name}`;
        }
    }
    else return findPokemon(name, evolutionInfo)
}

client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

    if (command === "tier") {
        const category = args.shift().toUpperCase();

        axios('https://www.pockettactics.com/super-smash-bros-ultimate/tier-list')
            .then(res => {
                let { data } = res;
                let regex = new RegExp("<td>" + category + "<\/td>\\n<td>([a-zA-Z, ();.&nbsp/-]+)<\/td>")
                let tier = data.match(regex);
                message.reply(tier[1])
            })
    }

    if (command === "pokemon") {
        const pokemon = args.shift().toLowerCase();
        axios('https://pokeapi.co/api/v2/pokemon-species/' + pokemon)
            .then(res => {
                let { data } = res;
                let { evolution_chain } = data;
                axios(evolution_chain.url)
                    .then(response => {
                        let { data } = response;
                        let evolution = findPokemon(pokemon, data.chain)
                        message.reply(evolution)
                    })
            })
            .catch(err => message.reply("Pokemon unknown"))
    }

    if (command === "clean") {
        async function clear() {
            await message.channel.messages.fetch({ limit: 10 })
                .then(messages => {
                    console.log(`messages`, messages)
                    message.channel.bulkDelete(messages);
                });
        }
        clear();
    }
})

client.login(process.env.BOT_TOKEN)