const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const canvafy = require('canvafy');
const db = require("croxydb");
const ayarlar = require('../../ayarlar.json');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-top')
        .setDescription('En çok ticket bakan yetkilileri gösterir.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const hasStaffRole = ayarlar.Yetkiler.Staff.some(rolID => interaction.member.roles.cache.has(rolID));
            if (!hasStaffRole) {
                const noPermEmbed = new EmbedBuilder()
                    .setColor("#490404")
                    .setTimestamp()
                    .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Yetersiz Veya Geçersiz Yetki.*`);
                return interaction.editReply({ embeds: [noPermEmbed] });
            }

            const allStats = Object.entries(db.all()).filter(([key]) => key.startsWith('staffTicketStats_'));
            const oldTickets = Object.entries(db.all()).filter(([key]) => key.startsWith('ticketChannelUser_'));
            const processedStaffIds = new Set();
            const staffStats = {};
            
            for (const [key, stats] of allStats) {
                const parts = key.split('_');
                if (parts.length < 3) continue;
                
                const staffId = parts[2];
                processedStaffIds.add(staffId);
                
                staffStats[staffId] = {
                    total: stats.total || 0,
                    ic: stats.ic || 0,
                    ooc: stats.ooc || 0
                };
            }
            
            for (const [key, ticket] of oldTickets) {
                if (!ticket.yetkili || processedStaffIds.has(ticket.yetkili)) continue;
                
                if (!staffStats[ticket.yetkili]) {
                    staffStats[ticket.yetkili] = {
                        total: 0,
                        ic: 0,
                        ooc: 0
                    };
                }
                
                staffStats[ticket.yetkili].total++;
                
                const parts = key.split('_');
                if (parts.length < 3) continue;
                
                const guildId = parts[1];
                const channelId = parts[2];
                
                const ticketType = db.get(`ticketType_${guildId}_${channelId}`);
                
                if (ticketType === 'oyun-ici' || ticketType === 'genel') {
                    staffStats[ticket.yetkili].ic++;
                } else if (ticketType === 'oyun-disi' || ticketType === 'mulakat') {
                    staffStats[ticket.yetkili].ooc++;
                }
            }
            
            const sortedStaff = Object.entries(staffStats)
                .sort((a, b) => b[1].total - a[1].total)
                .filter(([_, stats]) => stats.total > 0); 
            
            if (sortedStaff.length === 0) {
                return interaction.editReply('Henüz ticket verisi bulunmamaktadır.');
            }
            
            const itemsPerPage = 5;
            const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
            let currentPage = 0;
            
            const showPage = async (page) => {
                const start = page * itemsPerPage;
                const end = Math.min(start + itemsPerPage, sortedStaff.length);
                const pageStaff = sortedStaff.slice(start, end);
                
                const usersData = [];
                
                for (let i = 0; i < pageStaff.length; i++) {
                    const [userId, stats] = pageStaff[i];
                    try {
                        const user = await interaction.client.users.fetch(userId);
                        usersData.push({
                            top: start + i + 1,
                            avatar: user.displayAvatarURL({ extension: 'png', size: 512 }),
                            tag: user.tag,
                            score: stats.total
                        });
                    } catch (error) {
                        console.error(`Kullanıcı bilgisi alınamadı: ${userId}`, error);
                        usersData.push({
                            top: start + i + 1,
                            avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
                            tag: "Bilinmeyen Kullanıcı",
                            score: stats.total
                        });
                    }
                }
                
                for (let i = usersData.length; i < 5; i++) {
                    usersData.push({
                        top: i + 1,
                        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
                        tag: "",
                        score: 0
                    });
                }
                
                const top = await new canvafy.Top()
                    .setOpacity(0.6)
                    .setScoreMessage("Ticket Sayısı:") 
                    .setabbreviateNumber(false) 
                    .setBackground("image", ayarlar.Resimler.moderasyonURL) 
                    .setColors({ 
                        box: '#212121', 
                        username: '#ffffff', 
                        score: '#ffffff', 
                        firstRank: '#f7c716', 
                        secondRank: '#9e9e9e', 
                        thirdRank: '#94610f' 
                    })
                    .setUsersData(usersData)
                    .build();
                
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Önceki Sayfa')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⬅️')
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Sonraki Sayfa')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                            .setDisabled(page === totalPages - 1 || totalPages === 1)
                    );
                
                return {
                    files: [{
                        attachment: top,
                        name: `alsia-ticket-top-${interaction.user.id}-${page}.png`
                    }],
                    components: [buttons]
                };
            };
            
            const response = await interaction.editReply(await showPage(currentPage));
            
            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.Button,
                time: 60000
            });
            
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ 
                        content: 'Bu butonları yalnızca komutu kullanan kişi kullanabilir.', 
                        ephemeral: true 
                    });
                }
                
                await i.deferUpdate();
                
                if (i.customId === 'prev') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }
                
                await interaction.editReply(await showPage(currentPage));
            });
            
            collector.on('end', async () => {
                const disabledButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Önceki Sayfa')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⬅️')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Sonraki Sayfa')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                            .setDisabled(true)
                    );
                
                await interaction.editReply({ components: [disabledButtons] }).catch(() => {});
            });
            
        } catch (error) {
            console.error('Ticket istatistikleri oluşturulurken hata:', error);
            await interaction.editReply('İstatistikler oluşturulurken bir hata oluştu.');
        }
    },
};
