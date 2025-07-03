const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { readdirSync } = require('fs');
const moment = require('moment');
const express = require('express');
const ejs = require('ejs');
const app = express();
app.set("view engine", "ejs");
const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
  shards: 'auto',
});

const config = require('./config.json');
const ayarlar = require('./ayarlar.json');

const token = config.token;
client.commandAliases = new Collection();
client.commands = new Collection();
client.slashCommands = new Collection();
client.contextMenuCommands = new Collection();
client.slashData = [];

function log(message) {
  console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${message}`);
}
client.log = log;

const loadCommands = async () => {
  const commandFiles = readdirSync('./alsia/komutlar').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./alsia/komutlar/${file}`);
    if (command.data) {
      client.slashData.push(command.data.toJSON());
      if (command.data.type === 2 || command.data.type === 3) {
        client.contextMenuCommands.set(command.data.name, command);
        console.log(`🪬  » [${command.data.name}] İsimli Context Menu Komutu Aktif!`);
      } else {
        client.slashCommands.set(command.data.name, command);
        console.log(`🪬  » [${command.data.name}] İsimli Slash Komutu Aktif!`);
      }
    } else {
      console.error(`❌ » Error: [${file}] dosyasında 'data' tanımlanmamış!`);
    }
  }
};

const loadEvents = async () => {
  const eventFiles = readdirSync('./alsia/events').filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`./alsia/events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`🪬  » [${event.name}] İsimli Event Aktif!`);
  }
};

process.on('unhandledRejection', e => console.error('❌ » Unhandled Rejection:', e));
process.on('uncaughtException', e => console.error('❌ » Uncaught Exception:', e));
process.on('uncaughtExceptionMonitor', e => console.error('❌ » Uncaught Exception Monitor:', e));

const startBot = async () => {
  await loadCommands();
  await loadEvents();
  client.login(token);
};



client.on('ready', () => {
  const { ActivityType } = require('discord.js');
  
  const guild = client.guilds.cache.get(ayarlar.Bot.SunucuID);
  if (guild) {
    const updateActivity = () => {
      const activities = [
        `ᴅᴇᴠᴏᴛɪ̇ᴏɴꜱ ❤️ ${ayarlar.botDurum[Math.floor(Math.random() * ayarlar.botDurum.length)]}`,
        `ᴅᴇᴠᴏᴛɪ̇ᴏɴꜱ 💜 ${ayarlar.botDurum[Math.floor(Math.random() * ayarlar.botDurum.length)]}`,
        `ᴅᴇᴠᴏᴛɪ̇ᴏɴꜱ 💙 ${ayarlar.botDurum[Math.floor(Math.random() * ayarlar.botDurum.length)]}`
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      client.user.setActivity(randomActivity, {
        type: ActivityType.Custom
      });
    };

    updateActivity();
    setInterval(updateActivity, 10000);
  } else {
    client.user.setActivity(`ᴅᴇᴠᴏᴛɪ̇ᴏɴꜱ ❤️ ${ayarlar.botDurum[0] || 'Sunucu bulunamadı'}`, {
      type: ActivityType.Custom
    });
  }
});

startBot();
