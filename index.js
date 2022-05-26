const config = require("./config.json");
const schedule = require("node-schedule");
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], ws: { properties: { $browser: "Discord Android" } } });

client.on("ready", async () => {
    client.user.setActivity(config.status_message, { type: "WATCHING" });
    console.log(`Connected to: ${client.user.tag}`);

    if (config.channel_id) {
        const channel = client.channels.cache.get(config.channel_id);
        let sentmessage = (await channel.messages.fetch()).filter((m) => m.author.id === client.user.id).first();

        if (sentmessage) {
            sentmessage.edit({ embeds: [CreateEmbed()] });
        } else {
            sentmessage = await channel.send({ embeds: [CreateEmbed()] });
        }

        schedule.scheduleJob("0 0 * * *", () => {
            sentmessage.edit({ embeds: [CreateEmbed()] });
        });
    }
});

function CreateEmbed() {
    const Embed = new MessageEmbed()
        .setColor(config.color)
        .setTitle(config.title)
        .setThumbnail(config.thumbnail)
        .setImage(config.image)
        .setDescription(config.description)
        .setFooter({ text: config.footer });
    config.servers.forEach((server) => {
        let wipetime = server.timestamp;
        let currenttime = Math.floor(Date.now() / 1000);
        let i = 0;

        if (server.wipecycle_days.length == 0) {
            return;
        }

        if (currenttime > wipetime) {
            do {
                wipetime = wipetime + server.wipecycle_days[i] * 86400;
                i++;

                if (server.wipecycle_days.length == i) {
                    i = 0;
                }
            } while (currenttime > wipetime);
        }
        Embed.addField(server.name, server.description + "\n" + `Next wipe: (<t:${wipetime}:D>) - <t:${wipetime}:R>`, config.inline_fields);
    });
    return Embed;
}

client.login(config.token);
