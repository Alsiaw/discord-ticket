const { PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const moment = require("moment");
const fs = require('fs');
const db = require("croxydb");
require("moment-duration-format");
moment.locale("tr");

const categoryNames = {
    'genel': 'ɢᴇɴᴇʟ ᴅᴇꜱᴛᴇᴋ',
    'mulakat': 'ᴍᴜʟᴀᴋᴀᴀᴛ ᴅᴇꜱᴛᴇᴋ',
    'sikayet': 'ꜱɪᴋᴀʏᴇᴛ ᴅᴇꜱᴛᴇᴋ'
};

let ticketCounter = 0;

if (fs.existsSync('./ticketCounter.json')) {
    const data = fs.readFileSync('./ticketCounter.json', 'utf8');
    ticketCounter = parseInt(data, 10);
}

module.exports = {
    başlat: async(interaction) => {
        if (interaction.isButton()) {
            const selectedCategory = interaction.customId;
            
           
            let categoryKey = selectedCategory;
            if (selectedCategory === 'oyun-ici') categoryKey = 'genel';
            if (selectedCategory === 'oyun-disi') categoryKey = 'mulakat';
            
            if (!['genel', 'mulakat', 'sikayet', 'oyun-ici', 'oyun-disi'].includes(selectedCategory)) {
                return;
            }
            
            const categoryName = categoryNames[categoryKey];

            if (!interaction.guild) {
                return interaction.reply({
                    content: ' ***Sunucu bilgisi bulunamadı!***',
                    flags: 64,
                });
            }

            const guild = interaction.guild;

            if (!categoryName) {
                return interaction.reply({
                    content: ' ***Geçersiz kategori seçimi!***',
                    flags: 64,
                });
            }

            const existingTicket = guild.channels.cache.find(channel => {
                return (
                    channel.type === ChannelType.GuildText &&
                    channel.parentId === ayarlar.Ticket.ticketCategory &&
                    channel.permissionOverwrites.cache.has(interaction.user.id)
                );
            });

            if (existingTicket) {
                const zatenVar = new EmbedBuilder()
                    .setColor('000080')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription('<a:unlemsel:1327600285597569066>・*Zaten bu kategoride açık bir talebiniz bulunmaktadır.*')
                    .setTimestamp();
            
                return interaction.reply({
                    embeds: [zatenVar],
                    flags: 64,
                });
            }

            ticketCounter++;
            fs.writeFileSync('./ticketCounter.json', ticketCounter.toString());

            const channelName = `${ticketCounter}・${interaction.user.username}`;

            const supportChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: ayarlar.Ticket.ticketCategory,
                topic: categoryName,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.SendMessages, 
                            PermissionsBitField.Flags.ViewChannel, 
                            PermissionsBitField.Flags.AttachFiles
                        ],
                    },
                    {
                        id: ayarlar.Yetkiler.yetkili,
                        allow: [
                            PermissionsBitField.Flags.SendMessages, 
                            PermissionsBitField.Flags.ViewChannel, 
                            PermissionsBitField.Flags.AttachFiles
                        ],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            
            db.set(`ticketChannelUser_${interaction.guild.id}_${supportChannel.id}`, { 
                user: interaction.user.id,
                yetkili: null,
                notify: false,
                messageId: null
            });
            
            
            db.set(`ticketType_${interaction.guild.id}_${supportChannel.id}`, selectedCategory);

            const embed = new EmbedBuilder()
                .setColor('#141212')
                .setAuthor({
                    name: `${ayarlar.Embed.authorembed} - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`,
                    iconURL: ayarlar.Resimler.moderasyonURL,
                })
                .setDescription(`<:claim:1327586348244140082>  ・ *Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*
                                 
                <:8676gasp:1327585524231176192>    ・\`ᴅᴇsᴛᴇᴋ ᴀᴄᴀɴ:\` ${interaction.user.toString()}
                <:king_crown:1327600238407450697>  ・\`ᴅᴇsᴛᴇᴋ ʏᴇᴛᴋɪʟɪsɪ:\` 
                <a:utility:1327600287367696515>   ・\`ᴅᴇsᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪsɪ:\` ${categoryName}
            `)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setImage(ayarlar.Resimler.moderasyonURL)

            const kapat = new ButtonBuilder()
                .setCustomId('kapat')
                .setLabel('・ᴋᴀᴘᴀᴛ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<a:closex:1327586349963808769>');
                
            const devral = new ButtonBuilder()
                .setCustomId('devral')
                .setLabel('・ᴅᴇᴠʀᴀʟ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<a:5961darkbluetea:1327585257578561548>');
                
            const bildir = new ButtonBuilder()
                .setCustomId('bildir')
                .setLabel('・ʙɪʟᴅɪʀ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<:onday:1327600263242059848>');

            const actionRow = new ActionRowBuilder()
                .addComponents(kapat, devral, bildir);
            
            await supportChannel.send({ content: `${interaction.user.toString()} | <@&${ayarlar.Yetkiler.yetkili}>`, embeds: [embed], components: [actionRow] });
            
            const ticketaçıldı = new EmbedBuilder()
                .setColor('#141212')
                .setAuthor({
                    name: `${ayarlar.Embed.authorembed} - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`,
                    iconURL: ayarlar.Resimler.moderasyonURL,
                })
                .setDescription(`
                    <:8676gasp:1327585524231176192>  ・ \`ᴏʏᴜɴᴄᴜ:\` ${interaction.user.toString()}
                    <a:utility:1327600287367696515>  ・ \`ᴅᴇsᴛᴇᴋ ᴋᴀɴᴀʟɪ:\` <#${supportChannel.id}>
                    <a:animated_clock29:1327586135039410223>  ・ \`ᴛᴀʀɪʜ: ${moment(Date.now()).format("LLL")}\`
                `);
        
            await interaction.reply({
                embeds: [ticketaçıldı],
                flags: 64
            });
        } 
    }
};
