const { Events, InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketEvent = require('../handlers/ticket');
const destekKapatEvent = require('../handlers/destek_kapat');
const db = require("croxydb");
const ayarlar = require('../../ayarlar.json');

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    const client = interaction.client;

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      try {
        let command = client.slashCommands.get(interaction.commandName);
        
        if (!command) {
          command = client.contextMenuCommands.get(interaction.commandName);
        }
        
        if (!command) {
          await interaction.reply({
            content: 'Bu komut geçerli değil.',
            ephemerhlertrue: true,
          });
          return;
        }

        await command.execute(interaction, client);

      } catch (e) {
        console.error('Komut çalıştırılırken bir sorun oluştu:', e);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'Komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
            ephemerhlertrue: true,
          });
        } else {
          await interaction.reply({
            content: 'Komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
            ephemerapertrue: true,
          });
        }
      }

    } else if (interaction.isButton()) {
      try {
    if (['genel', 'mulakat', 'sikayet', 'oyun-ici', 'oyun-disi'].includes(interaction.customId)) {
      await ticketEvent.başlat(interaction);
        } else if (interaction.customId === 'kapat') {
          await destekKapatEvent.başlat(interaction);
        } else if (interaction.customId === 'devral') {
          await handleDevral(interaction);
        } else if (interaction.customId === 'bildir') {
          await handleBildir(interaction);
        }
      } catch (error) {
        console.error('Buton işlenirken bir sorun oluştu:', error);
      }
    } else if (interaction.isContextMenuCommand()) {
      const contextCommand = client.contextMenuCommands.get(interaction.commandName);
      if (contextCommand) {
        try {
          await contextCommand.execute(interaction, client);
        } catch (error) {
          console.error('Context menu komut çalıştırılırken bir sorun oluştu:', error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'Context menu komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
              ephemerapertrue: true,
            });
          } else {
            await interaction.reply({
              content: 'Context menu komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
              ephemerapertrue: true,
            });
          }
        }
      } else {
        await interaction.reply({
          content: 'Bu context menu komutu geçerli değil.',
          ephemeral: true,
        });
      }
    }
  },
};

async function handleDevral(interaction) {
  
  const hasStaffRole = ayarlar.Yetkiler.Staff.some(rolID => interaction.member.roles.cache.has(rolID));
  
  if (!hasStaffRole) {
    const noPermEmbed = new EmbedBuilder()
      .setColor("#490404")
      .setTimestamp()
      .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Yetersiz Veya Geçersiz Yetki.*`);
    return interaction.reply({ embeds: [noPermEmbed], ephemeral: false });
  }

  const channel = interaction.channel;
  const channelId = channel.id;
  const guildId = interaction.guild.id;
  
  const ticketData = db.get(`ticketChannelUser_${guildId}_${channelId}`);
  
  if (!ticketData) {
    return interaction.reply({
      content: 'Bu kanal için ticket bilgisi bulunamadı.',
      ephemeral: true
    });
  }

  const messages = await channel.messages.fetch({ limit: 10 });
  const ticketMessage = messages.find(m => 
    m.embeds.length > 0 && 
    m.embeds[0].description && 
    m.embeds[0].description.includes('ᴅᴇsᴛᴇᴋ ᴀᴄᴀɴ:')
  );

  if (!ticketMessage) {
    return interaction.reply({
      content: 'Ticket mesajı bulunamadı.',
      ephemeral: true
    });
  }

  const oldEmbed = ticketMessage.embeds[0];
  const newEmbed = EmbedBuilder.from(oldEmbed);
  
  const updatedDescription = oldEmbed.description.replace(
    '<:king_crown:1327600238407450697>  ・\`ᴅᴇsᴛᴇᴋ ʏᴇᴛᴋɪʟɪsɪ:\` ',
    `<:king_crown:1327600238407450697>  ・\`ᴅᴇsᴛᴇᴋ ʏᴇᴛᴋɪʟɪsɪ:\` ${interaction.user.toString()}`
  );
  
  newEmbed.setDescription(updatedDescription);
  
  const kapat = new ButtonBuilder()
    .setCustomId('kapat')
    .setLabel('・ᴋᴀᴘᴀᴛ')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('<a:closex:1327586349963808769>');
    
  const devral = new ButtonBuilder()
    .setCustomId('devral')
    .setLabel('・ᴅᴇᴠʀᴀʟ')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('<a:5961darkbluetea:1327585257578561548>')
    .setDisabled(true);
    
  const bildir = new ButtonBuilder()
    .setCustomId('bildir')
    .setLabel('・ʙɪʟᴅɪʀ')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('<:onday:1327600263242059848>');

  const actionRow = new ActionRowBuilder()
    .addComponents(kapat, devral, bildir);
  
  await ticketMessage.edit({ embeds: [newEmbed], components: [actionRow] });
  
  ticketData.yetkili = interaction.user.id;
  db.set(`ticketChannelUser_${guildId}_${channelId}`, ticketData);
  
  const successEmbed = new EmbedBuilder()
    .setColor("#08235b")
    .setDescription(`<:claim:1327586348244140082> ・${interaction.user.toString()} *tarafından incelenmeye başlanmıştır.*`)
    .setTimestamp();
  
  await interaction.reply({ embeds: [successEmbed] });
}

async function handleBildir(interaction) {
  const channel = interaction.channel;
  const channelId = channel.id;
  const guildId = interaction.guild.id;
  
  const ticketData = db.get(`ticketChannelUser_${guildId}_${channelId}`);
  
  if (!ticketData) {
    return interaction.reply({
      content: 'Bu kanal için ticket bilgisi bulunamadı.',
      ephemeral: true
    });
  }
  
  if (ticketData.user !== interaction.user.id) {
    const noPermEmbed = new EmbedBuilder()
      .setColor("#490404")
      .setTimestamp()
      .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Yalnızca bu destek talebini açan kişi bildirim sistemini aktifleştirebilir.*`);
    return interaction.reply({ embeds: [noPermEmbed], ephemeral: false });
  }
  
  ticketData.notify = true;
  ticketData.notified = false; // Reset notification status when bildir button is pressed
  db.set(`ticketChannelUser_${guildId}_${channelId}`, ticketData);
  
  const embed = new EmbedBuilder()
    .setColor('#490404')
    .setTitle(`${ayarlar.Embed.authorembed} - ʙıʟᴅıʀıᴍ ꜱıꜱᴛᴇᴍı`)
    .setDescription(' <a:1360toggleon:1327585184547213363> ・ *Sistem açıldı, mesaj yazılınca sizlere dm yolundan ileticektir.*\n\n**[DM KUTUNUZ AÇIK OLMASI GEREKMEKTEDİR AKSİ HALDE MESAJ GELMEZ]**')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
  
  activateMessageListener(interaction.client, channelId, ticketData.user);
}

function activateMessageListener(client, channelId, userId) {
  if (!client._activeTicketListeners || !client._activeTicketListeners.includes(channelId)) {
    if (!client._activeTicketListeners) {
      client._activeTicketListeners = [];
    }
    
    client._activeTicketListeners.push(channelId);
    
    client.on('messageCreate', async (message) => {
      if (message.channel.id !== channelId || message.author.bot || message.author.id === userId) return;
      
      const member = message.guild.members.cache.get(message.author.id);
      const isStaff = member && ayarlar.Yetkiler.Staff.some(rolID => member.roles.cache.has(rolID));
      if (!isStaff) return;
      
      const ticketData = db.get(`ticketChannelUser_${message.guild.id}_${channelId}`);
      if (!ticketData || !ticketData.notify || ticketData.notified) return;
      
      ticketData.notified = true;
      db.set(`ticketChannelUser_${message.guild.id}_${channelId}`, ticketData);
      
      const ticketUser = await message.client.users.fetch(userId).catch(() => null);
      if (!ticketUser) return;
      
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#490404')
          .setTitle(`${ayarlar.Embed.authorembed} - ʙıʟᴅıʀıᴍ ꜱıꜱᴛᴇᴍı`)
          .setDescription(`<:onday:1327600263242059848> *・ <#${channelId}> kanalındaki destek talebinize yeni bir mesaj geldi.*`)
          .setTimestamp();
        
        await ticketUser.send({ embeds: [dmEmbed] });
      } catch (error) {
        const ticketChannel = message.guild.channels.cache.get(channelId);
        if (ticketChannel) {
          const dmFailEmbed = new EmbedBuilder()
            .setColor("#490404")
            .setTimestamp()
            .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Destek talebinize yanıt verildi ancak özel mesajlarınız kapalı olduğu için bildirim gönderilemedi.*`);
          await ticketChannel.send({ content: `<@${userId}>`, embeds: [dmFailEmbed] });
        }
      }
    });
  }
}
