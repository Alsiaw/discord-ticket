const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ayarlar = require('../../ayarlar.json');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Oyuncu Ekle')
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    const user = interaction.targetUser;

    const roles = ayarlar.Yetkiler.Staff;
    
    if (!interaction.member.roles.cache.find(r => roles.includes(r.id))) {
      const noPermEmbed = new EmbedBuilder()
        .setColor("#490404")
        .setTimestamp()
        .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Yetersiz Veya Geçersiz Yetki.*`);
      return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      const notFoundEmbed = new EmbedBuilder()
        .setColor("#490404")
        .setTimestamp()
        .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Belirtilen kullanıcı sunucuda bulunamadı.*`);
      return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
    }

    const channel = interaction.channel;
    if (channel.isTextBased()) {
      try {
        const permissionOverwrite = channel.permissionOverwrites.cache.get(user.id);
        if (permissionOverwrite && permissionOverwrite.allow.has('ViewChannel')) {
          const alreadyAddedEmbed = new EmbedBuilder()
            .setColor("#490404")
            .setTimestamp()
            .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Bu kullanıcı zaten bu ticket kanalına eklenmiş.*`);
          return interaction.reply({ embeds: [alreadyAddedEmbed], ephemeral: true });
        }

        await channel.permissionOverwrites.edit(user.id, {
          'ViewChannel': true,
          'SendMessages': true
        });

        const successEmbed = new EmbedBuilder()
          .setColor("#08235b")
          .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.avatarURL({ dynamic: true }) })
          .setTimestamp()
          .setDescription(`<:8676gasp:1327585524231176192>・${interaction.user} *İsimli Yetkili Tarafından* ${user} *İsimili Oyuncu* *Ticket'a eklendi.*`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: false });

        const logChannel = await interaction.client.channels.fetch(ayarlar.Ticket.ticketLog2);
        const logEmbed = new EmbedBuilder()
          .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.avatarURL({ dynamic: true }) })
          .setColor("#08235b")
          .setTimestamp()
          .setDescription(`<:8676gasp:1327585524231176192>・${interaction.user} *İsimli Yetkili Tarafından* ${user} *İsimili Oyuncu* ${channel} *Ticket'a eklendi.*`);
        await logChannel.send({ embeds: [logEmbed] });
      } catch (error) {
        console.error(error);
        const errorEmbed = new EmbedBuilder()
          .setColor("#490404")
          .setTimestamp()
          .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Hata:*** *Kullanıcıya erişim izni verirken bir hata oluştu.*`);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: false });
      }
    } else {
      const invalidChannelEmbed = new EmbedBuilder()
        .setColor("#490404")
        .setTimestamp()
        .setDescription(`<a:unlemsel:1327600285597569066> ・ ***Uyarı:*** *Bu komut yalnızca metin kanalları için geçerlidir.*`);
      await interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: false });
    }
  }
};
