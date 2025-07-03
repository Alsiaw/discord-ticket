const { Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const ayarlar = require('../../ayarlar.json');
const db = require("croxydb");
const moment = require('moment');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const rest = new REST({ version: '10' }).setToken(client.token);

        console.log(`✅ [${moment(Date.now()).format("LLL")}] » [${client.user.username}] İsimli Bot Aktif Edildi.`);

        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.slashData }
            );
            console.log('🪬  » Slash komutları başarıyla kaydedildi.');
        } catch (error) {
            console.error('❌ » Slash komutları kaydedilirken bir hata oluştu:', error);
        }
    }
};
