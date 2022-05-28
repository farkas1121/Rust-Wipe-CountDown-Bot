const config = require("./config.json");
const schedule = require("node-schedule");
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
    client.user.setActivity("Wipes", { type: "WATCHING" });
    console.log(`Connected to: ${client.user.tag}`);

    SendEmbeds();
});

async function SendEmbeds() {
    const channel = client.channels.cache.get(config.channel_id);
    const sentmessages = Array.from((await channel.messages.fetch()).filter((m) => m.author.id === client.user.id).values());
    forcewipeinfo = sentmessages[1];
    serverinfo = sentmessages[0];

    if (forcewipeinfo) {
        forcewipeinfo.edit({ embeds: [CreateForceWipeEmbed()] });
    } else {
        forcewipeinfo = await channel.send({ embeds: [CreateForceWipeEmbed()] });
    }

    if (serverinfo) {
        serverinfo.edit({ embeds: [CreateEmbed()] });
    } else {
        serverinfo = await channel.send({ embeds: [CreateEmbed()] });
    }

    StartSchedule(forcewipeinfo, serverinfo);
}

function StartSchedule(forcewipeinfo, serverinfo) {
    schedule.scheduleJob("0 0 * * *", () => {
        forcewipeinfo.edit({ embeds: [CreateForceWipeEmbed()] });
        serverinfo.edit({ embeds: [CreateEmbed()] });
    });
}

function CreateEmbed() {
    const Embed = new MessageEmbed()
        .setColor(config.color)
        .setTitle("__**Server Information & Wipe Schedule**__")
        .setThumbnail(config.thumbnail)
        .setImage(config.image)
        .setFooter({ text: "📆 Dates are converted to your timezone." });

    for (let i = 0; i < config.servers.length; i++) {
        if (config.inline_fields) {
            if ((i + 1) % 2 == 0) {
                Embed.addField("\u200b", "\u200b", true);
            }
        }

        Embed.addField(
            config.servers[i].name,
            config.servers[i].description +
                "\n" +
                `• Map Wipe: <t:${GetWipe(config.servers[i].timestamp, config.servers[i].wipecycle_days)}:D> <t:${GetWipe(
                    config.servers[i].timestamp,
                    config.servers[i].wipecycle_days
                )}:R>`,
            config.inline_fields
        );
    }

    return Embed;
}

function CreateForceWipeEmbed() {
    const Embed = new MessageEmbed()
        .setColor(config.color)
        .setTitle("__**Forced Wipe**__")
        .setDescription(
            `:map: Forced wipe will always happen on the first Thursday of the month.\n:map: The next forced wipe is going to be <t:${GetForcedWipe()}:D> <t:${GetForcedWipe()}:R>`
        );
    return Embed;
}

function GetWipe(wipetime, wipecycle_days) {
    const currenttime = Math.floor(new Date() / 1000);
    let i = 0;

    if (currenttime > wipetime) {
        do {
            wipetime += wipecycle_days[i] * 86400;
            i++;

            if (wipecycle_days.length == i) {
                i = 0;
            }
        } while (currenttime > wipetime);
    }
    if (wipetime > GetForcedWipe()) {
        wipetime = GetForcedWipe();
    }

    return wipetime;
}

function GetForcedWipe() {
    const date = new Date();
    const firstthursday = GetFirstThursdayOfMonth(date.getUTCFullYear(), date.getUTCMonth());

    if (date < firstthursday) {
        return firstthursday / 1000;
    }

    return GetFirstThursdayOfMonth(date.getUTCFullYear(), date.getUTCMonth() + 1) / 1000;
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
