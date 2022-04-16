const config = require("./config.json");
const schedule = require('node-schedule');
const fetch = require("node-fetch");
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], ws: { properties: { $browser: "Discord Android" } } });
let guild;

client.on('ready', async () => {
    client.user.setActivity(config.Status_Message, { type: "WATCHING" })

    console.log(`Connected to: ${client.user.tag}`)
    guild = client.guilds.cache.get(config.Guild_ID);

    if (config.Channel_ID) {
        const Channel = client.channels.cache.get(config.Channel_ID);
        const ChannelMessages = await Channel.messages.fetch();
        let SentMessageID;
        let SentMessage;

        for (let [id, values] of ChannelMessages) {
            if (values.author.id == client.user.id) {
                SentMessageID = id;
            }
        }

        if (SentMessageID) {
            SentMessage = await Channel.messages.fetch(SentMessageID);
            SentMessage.edit({ embeds: [CreateEmbed()] });
        }
        else {
            SentMessage = await Channel.send({ embeds: [CreateEmbed()] });
        }

        schedule.scheduleJob('0 0 * * *', () => {
            SentMessage.edit({ embeds: [CreateEmbed()] });
            console.log(`${new Date()}Updated Wipes`);
        })
    }
})

function CreateEmbed() {
    const Embed = new MessageEmbed()
        .setColor(config.Color)
        .setTitle(config.Title)
        .setThumbnail(config.Thumbnail)
        .setImage(config.Image)
        .setDescription(config.Description)
        .setFooter({ text: config.Footer });
    config.Servers.forEach(async server => {
        let WipeTime = server.Timestamp;
        let CurrentTime = Math.floor(Date.now() / 1000);
        let i = 0;
        if (server.WipeCycle_Days.length == 0) {
            return;
        }

        if (CurrentTime > WipeTime) {
            do {
                WipeTime = WipeTime + server.WipeCycle_Days[i] * 86400;
                i++;

                if (server.WipeCycle_Days.length == i) {
                    i = 0;
                }
            } while (CurrentTime > WipeTime);
        }
        Embed.addField(server.Name, server.Description + "\n" + `Next wipe: (<t:${WipeTime}:D>) - <t:${WipeTime}:R>`, config.Inline_Fields)

        if (CurrentTime > WipeTime - 86400) {
            let found = false;
            client.channels.cache.forEach((channel) => {
                if (channel.name == server.map_vote.channel_name) {
                    found = true;
                    return;
                }
            })

            if (found == true) {
                return;
            }

            const response = await (await fetch(`https://rustmaps.com/api/v2/maps/filter/${server.map_vote.rustmaps_filter_id}?page=${Random(1, 5)}`, {
                headers: {
                    "X-API-Key": config.rustmaps_api_key,
                    "Content-Type": "application/json"
                }
            })).json()
            if(!response["results"]){
                console.log("Map vote failed: no result");
                console.log(response);
                return;
            }
            if (response["results"].length == 0) {
                console.log("Map vote failed: no maps found on rustmaps.");
                console.log(response);
                return;
            }

            let mapchannel = await guild.channels.create(server.map_vote.channel_name);
            mapchannel.setParent(config.categoryid);

            let maps = [];
            if (server.map_vote.map_count > response.results.length) {
                maps = response.results;
            }
            else {
                for (let i = 0; i < server.map_vote.map_count; i++) {
                    let number;
                    do {
                        number = Random(0, response.results.length -1);
                    } while (maps.includes((response.results[number])));
                    maps.push(response.results[number]);
                }
            }

            for (const map of maps) {
                let sentmap = await mapchannel.send(`https://rustmaps.com/map/${map.size}_${map.seed}?embed=img_i_l`);
                sentmap.react("✅");
                sentmap.react("❌");
            }
        }
        else {
            client.channels.cache.forEach((channel) => {
                if (channel.name == server.map_vote.channel_name) {
                    channel.delete();
                }
            })
        }
    });
    return Embed;
}

function Random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.login(config.Token);