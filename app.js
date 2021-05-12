const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();
require('dotenv').config()

const prefix = "!";

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
})


client.login(process.env.BOT_TOKEN)