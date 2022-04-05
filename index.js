const config = require("./config.json");
const schedule = require('node-schedule');
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], ws: { properties: { $browser: "Discord Android" } } });

client.on('ready', async () => {
    client.user.setActivity(config.Status_Message, { type: "WATCHING" })
    console.log(`Connected to: ${client.user.tag}`)

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
    config.Servers.forEach(server => {
        let WipeTime = parseInt(server.Timestamp);
        let CurrentTime = Math.floor(Date.now() / 1000);
        let i = 0;

        if (server.WipeCycle_Days.length == 0) {
            return;
        }

        if (CurrentTime > WipeTime) {
            do {
                WipeTime = WipeTime + (parseInt(server.WipeCycle_Days[i]) * 86400);
                i++;
                if(server.WipeCycle_Days.length == i){
                    i = 0;
                }
            } while (CurrentTime > WipeTime);
        }
        Embed.addField(server.Name, server.Description + "\n" + `Next wipe: (<t:${WipeTime}:D>) - <t:${WipeTime}:R>`, config.Inline_Fields)
    });
    return Embed;
}

client.login(config.Token);