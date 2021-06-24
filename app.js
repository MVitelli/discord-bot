const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();
require('dotenv').config()
const friends = require('./examples_data/friends.json');
const quiz = require('./examples_data/quiz.json');
const { BetRepository } = require('./src/modules/bets');

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

const findFriend = (name) => {
    return friends.find(friend => friend.user === name)?.id;
}

const buildHistory = (data) => {
    let history = data.filter(match => match.lobby_type === 6 || match.lobby_type === 7)
        .map((match, index) => {
            let { player_slot, radiant_win } = match;
            if (radiant_win && player_slot < 128 || !radiant_win && player_slot > 127) return `${index}: ✅`;
            return `${index}: ❌`;
        })
    return history;
}

const item = quiz[Math.floor(Math.random() * quiz.length)];
const filter = response => {
    return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
};

const betFilter = response => {
    // let authorCode = response.author.discriminator;
    // if (authorCode != '1532' && authorCode != '1411') return false;
    let betCommand = response.content.split(' ');
    let betPrefix = betCommand.shift().toLowerCase();
    return betPrefix === "bet";
}

const betCount = async (collected) => {
    for (let collectedMsg of collected) {
        let msg = collectedMsg[1];
        let { author, content } = msg;
        let info = content.split(' ');
        info.shift();
        let newBet = {
            "user": author.username,
            "amount": info.shift().toLowerCase(),
            "choice": info.shift().toLowerCase(),
        }
        const res = await BetRepository.add(newBet)
    }
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
        const limit = parseInt(args.shift().toLowerCase());
        async function clear() {
            await message.channel.messages.fetch({ limit: limit })
                .then(messages => {
                    console.log(`messages`, messages)
                    message.channel.bulkDelete(messages);
                });
        }
        clear();
    }

    if (command === "dota") {
        const name = args.shift().toLowerCase();
        const friendId = findFriend(name);
        if (!friendId) {
            message.reply("Not in the users list");
            return;
        }
        axios(`https://api.opendota.com/api/players/${friendId}/recentMatches`)
            .then(res => {
                const { data } = res;
                let history = `${name}: \n` + buildHistory(data)
                message.reply(history)
            })
            .catch(err => message.reply("Working on this."))
    }

    if (command === "question") {
        message.channel.send(item.question).then(() => {
            message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    message.channel.send(`${collected.first().author} got the correct answer!`);
                })
                .catch(collected => {
                    message.channel.send('Looks like nobody got the answer this time.');
                });
        });
    }

    if (command === "startbet") {
        const betContent = args.join(' ');
        message.channel.send(`Bet started: ${betContent}`).then(() => {
            message.channel.awaitMessages(betFilter, { max: 5, time: 20000, errors: ['time'] })
                .then(async (collected) => {
                    await betCount(collected);
                    message.channel.send(`${collected.size} bets received.`);
                })
                .catch(async (collected) => {
                    await betCount(collected);
                    message.channel.send(`${collected.size} bets received.`);
                })
        })
    }

    if (command === "betos") {
        BetRepository.findAll().then(bets => {
            console.log(`bets`, bets)
            bets.forEach(bet => message.channel.send(`${bet.user} bet ${bet.amount} ${bet.choice}.\n`))
        });
    }

    if (command === "sth") {
        // Await !vote messages
        const filter = m => m.content.startsWith('!vote');
        // Errors: ['time'] treats ending because of the time limit as an error
        message.channel.awaitMessages(filter, { max: 4, time: 60000, errors: ['time'] })
            .then(collected => console.log(collected.size))
            .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
    }

})

client.login(process.env.BOT_TOKEN)