const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require("croxydb");
const ayarlar = require('../../ayarlar.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('database-sıfırla')
        .setDescription('Ticket verilerini sıfırlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.user;
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor("#490404")
                .setTimestamp()
                .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.*`);
            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor("#490404")
            .setTitle(`${ayarlar.Embed.authorembed} - ᴅᴀᴛᴀʙᴀꜱᴇ ꜱıꜰıʀʟᴀᴍᴀ`)
            .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Tüm ticket verileri ve istatistikler kalıcı olarak silinecektir. Bu işlem geri alınamaz.*\n\nOnaylamak istediğinize emin misiniz?`)
            .setTimestamp()
            .setFooter({ text: `${user.tag} tarafından istendi`, iconURL: user.displayAvatarURL() });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_reset')
                    .setLabel('ᴏɴᴀʏʟıʏᴏʀᴜᴍ')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<a:onay:1327600261698420767>'),
                new ButtonBuilder()
                    .setCustomId('cancel_reset')
                    .setLabel('ᴏɴᴀʏʟᴀᴍıʏᴏʀᴜᴍ')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('<a:red:1327600270032764928>')
            );

        const response = await interaction.reply({
            embeds: [confirmEmbed],
            components: [buttons],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'Bu butonları yalnızca komutu kullanan kişi kullanabilir.',
                    ephemeral: true
                });
            }

            await i.deferUpdate();

            if (i.customId === 'confirm_reset') {
                const allKeys = Object.keys(db.all());
                
                let deletedCount = 0;
                
                for (const key of allKeys) {
                    if (
                        key.startsWith('ticketChannelUser_') ||
                        key.startsWith('staffTicketStats_') ||
                        key.startsWith('closedTicket_') ||
                        key.startsWith('ticketType_')
                    ) {
                        db.delete(key);
                        deletedCount++;
                    }
                }
                
                // Ticket counter'ı koruyoruz, sıfırlamıyoruz
                // Böylece ticket numaralandırması devam eder
                
                const successEmbed = new EmbedBuilder()
                    .setColor("#141212")
                    .setTitle(`${ayarlar.Embed.authorembed} - ᴅᴀᴛᴀʙᴀꜱᴇ ꜱıꜰıʀʟᴀɴᴅı`)
                    .setDescription(`<a:5961darkbluetea:1327585257578561548> ・ *Veritabanı başarıyla sıfırlandı.*`)
                    .setTimestamp()
                    .setFooter({ text: `${user.tag} tarafından sıfırlandı`, iconURL: user.displayAvatarURL() });
                
                await interaction.editReply({
                    embeds: [successEmbed],
                    components: []
                });
                
                // Log kanalına bilgi gönder
                const logChannelId = ayarlar.Ticket.ticketLog2;
                if (logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor("#490404")
                            .setTitle(`ᴅᴀᴛᴀʙᴀꜱᴇ ꜱıꜰıʀʟᴀɴᴅı`)
                            .setDescription(`<a:unlemsel:1327600285597569066> ・ ${interaction.user} *tarafından ticket veritabanı sıfırlandı.*`)
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            } else {
                const cancelEmbed = new EmbedBuilder()
                    .setColor("#490404")
                    .setTitle(`${ayarlar.Embed.authorembed} - ɪꜱʟᴇᴍ ɪᴘᴛᴀʟɪ`)
                    .setDescription(`<a:closex:1327586349963808769> ・ *Database sıfırlama işlemi iptal edildi.*`)
                    .setTimestamp()
                    .setFooter({ text: `${user.tag} tarafından iptal edildi`, iconURL: user.displayAvatarURL() });
                
                await interaction.editReply({
                    embeds: [cancelEmbed],
                    components: []
                });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor("#490404")
                    .setTitle(`${ayarlar.Embed.authorembed} - ꜱᴜʀᴇ ᴅᴏʟᴅᴜ`)
                    .setDescription(`<a:closex:1327586349963808769> ・ *İşlem için ayrılanꜱᴜʀᴇ ᴅᴏʟᴅᴜ.*`)
                    .setTimestamp()
                    .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL() });
                
                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }
        });
    }
};
