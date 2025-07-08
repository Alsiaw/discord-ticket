const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, Events } = require('discord.js');
const moment = require('moment');
const ayarlar = require('../../ayarlar.json');

const db = require("croxydb");

moment.locale('tr');




function calculateTimeDifference(start, end) {
  const difference = end - start;
  const minutes = Math.floor(difference / 60000);
  const seconds = ((difference % 60000) / 1000).toFixed(0);
  return `${minutes} dakika ${seconds} saniye`;
}

module.exports = {
  başlat: async(interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'kapat') {
      const hasStaffRole = ayarlar.Yetkiler.Staff.some(rolID => interaction.member.roles.cache.has(rolID));
      
      if (!hasStaffRole) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor("#490404").setTimestamp().setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Yetersiz Veya Geçersiz Yetki.*`)],
          ephemeral: false,
        });
      }

      const guild = interaction.guild;
      if (!guild) {
        console.error('Sunucu bulunamadı.');
        return;
      }

      const channel = interaction.channel;
      if (!channel) {
        console.error('Kanal bulunamadı.');
        return;
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#490404")
        .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.avatarURL({ dynamic: true }) })
        .setTimestamp()
        .setDescription(`<:carpu:1327586342028316726>・*Destek talebi 5 saniye sonra kapatılacaktır!*`);
      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 5000));

      const topic = channel.topic || 'Belirtilmemiş';
      const openingTime = new Date(channel.createdTimestamp);
      const closingTime = new Date();
      
      const ticketOwner = channel.permissionOverwrites.cache.find(overwrite => 
        overwrite.type === 1 &&
        overwrite.allow.has('ViewChannel') &&
        overwrite.id !== ayarlar.Yetkiler.yetkili &&
        overwrite.id !== guild.roles.everyone.id
      );

      const ticketAcanId = ticketOwner ? ticketOwner.id : db.get(`ticketChannelUser_${interaction.guild.id}_${interaction.channel.id}`)?.user || 'Bilinmiyor';
      
      const timeDifference = calculateTimeDifference(openingTime, closingTime);

      discordTranscripts.createTranscript(channel, {
        fileName: `${interaction.channel.id}.html`,
        saveImages: true,
        footerText: "Dev By Alsia",
        poweredBy: false,
        returnType: "string"
      }).then(async (transcript) => {
        app.get(`/${interaction.channel.id}`, function(req, res) {
          res.send(transcript);
        });

        const logEmbed = new EmbedBuilder()
        .setColor('#090a0a') 
        .setAuthor({
            name: ayarlar.Embed.authorembed + ' - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ',
            iconURL: ayarlar.Resimler.moderasyonURL,
          })
          .setDescription(`
            <:8676gasp:1327585524231176192>  ・ \`ᴛɪᴄᴋᴇᴛ ᴀᴄᴀɴ:\`:  <@${ticketAcanId}>  
            <:king_crown:1327600238407450697>   ・ \`ᴛɪᴄᴋᴇᴛ ᴋᴀᴘᴀᴛᴀɴ:\`: <@${interaction.user.id}>
        
        
           **» DESTEK KANALI**\n\`\`\`ansi\n- ${channel.name}\`\`\`
            **» DESTEK KATEGORİSİ**\n\`\`\`ansi\n- ${topic}\`\`\`
            **» DESTEK AÇILMA - KAPATILMA**\n\`\`\`ansi\n- ${moment(openingTime).format('D MMMM YYYY HH:mm')} - ${moment(closingTime).format('D MMMM YYYY HH:mm')}\n- DESTEK SÜRESİ: ${timeDifference}\`\`\`
          `)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        await guild.channels.cache.get(ayarlar.Ticket.ticketLog)?.send({
          embeds: [logEmbed],
        });

        const ticketData = db.get(`ticketChannelUser_${interaction.guild.id}_${interaction.channel.id}`);
        const ticketType = db.get(`ticketType_${interaction.guild.id}_${interaction.channel.id}`) || 'bilinmiyor';
        
        const closedTicketId = `closedTicket_${interaction.guild.id}_${interaction.channel.id}`;
        db.set(closedTicketId, {
          ticketId: interaction.channel.id,
          opener: ticketAcanId,
          closer: interaction.user.id,
          staff: ticketData?.yetkili || interaction.user.id,
          type: ticketType,
          openTime: openingTime.getTime(),
          closeTime: closingTime.getTime(),
          duration: timeDifference
        });
        
        const staffId = ticketData?.yetkili || interaction.user.id;
        const staffStatsKey = `staffTicketStats_${interaction.guild.id}_${staffId}`;
        const currentStats = db.get(staffStatsKey) || { total: 0, ic: 0, ooc: 0 };
        
        currentStats.total++;
        if (ticketType === 'oyun-ici' || ticketType === 'genel') {
          currentStats.ic++;
        } else if (ticketType === 'oyun-disi' || ticketType === 'mulakat') {
          currentStats.ooc++;
        }
        
        db.set(staffStatsKey, currentStats);
        
        await channel.delete();
      }).catch((err) => {
        console.error('Transkript oluşturulurken hata oluştu:', err);
        
        const simpleLogEmbed = new EmbedBuilder()
        .setColor('#090a0a') 
        .setAuthor({
            name: ayarlar.Embed.authorembed + ' - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ',
            iconURL: ayarlar.Resimler.moderasyonURL,
          })
          .setDescription(`
            <:8676gasp:1327585524231176192>・ \`ᴛɪᴄᴋᴇᴛ ᴀᴄᴀɴ:\`:  <@${ticketAcanId}>  
            <:king_crown:1327600238407450697>・ \`ᴛɪᴄᴋᴇᴛ ᴋᴀᴘᴀᴛᴀɴ:\`: <@${interaction.user.id}>
        
           **» DESTEK KANALI**\n\`\`\`ansi\n- ${channel.name}\`\`\`
            **» DESTEK KATEGORİSİ**\n\`\`\`ansi\n- ${topic}\`\`\`
            **» DESTEK AÇILMA - KAPATILMA**\n\`\`\`ansi\n- ${moment(openingTime).format('D MMMM YYYY HH:mm')} - ${moment(closingTime).format('D MMMM YYYY HH:mm')}\n- DESTEK SÜRESİ: ${timeDifference}\`\`\`
            
            ⚠️ Transcript oluşturulamadı.
          `)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        guild.channels.cache.get(ayarlar.Ticket.ticketLog)?.send({
          embeds: [simpleLogEmbed],
        });

        const ticketData = db.get(`ticketChannelUser_${interaction.guild.id}_${interaction.channel.id}`);
        const ticketType = db.get(`ticketType_${interaction.guild.id}_${interaction.channel.id}`) || 'bilinmiyor';
        
        const closedTicketId = `closedTicket_${interaction.guild.id}_${interaction.channel.id}`;
        db.set(closedTicketId, {
          ticketId: interaction.channel.id,
          opener: ticketAcanId,
          closer: interaction.user.id,
          staff: ticketData?.yetkili || interaction.user.id,
          type: ticketType,
          openTime: openingTime.getTime(),
          closeTime: closingTime.getTime(),
          duration: timeDifference
        });
        
        const staffId = ticketData?.yetkili || interaction.user.id;
        const staffStatsKey = `staffTicketStats_${interaction.guild.id}_${staffId}`;
        const currentStats = db.get(staffStatsKey) || { total: 0, ic: 0, ooc: 0 };
        
        currentStats.total++;
        if (ticketType === 'oyun-ici' || ticketType === 'genel') {
          currentStats.ic++;
        } else if (ticketType === 'oyun-disi' || ticketType === 'mulakat') {
          currentStats.ooc++;
        }
        
        db.set(staffStatsKey, currentStats);
        
        channel.delete();
      });
    }
  },
};
