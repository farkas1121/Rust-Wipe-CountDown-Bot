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
        .setDescription(
            config.description +
                `\n\nForced wipe will always happen on the first Thursday of the month, which means all of our servers are going to wipe.\nThe next forced wipe is going to be <t:${GetForcedWipe()}:D> <t:${GetForcedWipe()}:R>`
        )
        .setFooter({ text: config.footer });
    config.servers.forEach((server) => {
        let wipetime = server.timestamp;
        const currenttime = Math.floor(Date.now() / 1000);
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
        if (wipetime > GetForcedWipe()) {
            wipetime = GetForcedWipe();
        }
        Embed.addField(server.name, server.description + "\n" + `Next wipe: <t:${wipetime}:D> <t:${wipetime}:R>`, config.inline_fields);
    });
    return Embed;
}

function GetForcedWipe() {
    const date = new Date();
    const firstthursday = GetFirstThursdayOfMonth(date.getUTCFullYear(), date.getUTCMonth());

    if (date < firstthursday) {
        return firstthursday / 1000;
    } else {
        return GetFirstThursdayOfMonth(date.getUTCFullYear(), date.getUTCMonth() + 1) / 1000;
    }
}

function GetFirstThursdayOfMonth(year, month) {
    let first = new Date(year, month, 1);
    first.setUTCHours(18);

    if (first.getUTCDay() != 4) {
        do {
            first.setUTCDate(first.getUTCDate() + 1);
        } while (first.getUTCDay() != 4);
    }
    return first;
}

client.login(config.token);
