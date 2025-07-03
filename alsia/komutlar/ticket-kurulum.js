const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle } = require('discord.js');
const ayarlar = require('../../ayarlar.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-kurulum')
    .setDescription('Ticket Oluşturulacak Embedi Atar.'),

  async execute(interaction) {
    const kullaniciRolleri = interaction.member.roles.cache;
    const yetkiliMi = ayarlar.Yetkiler.Staff.some(rolID => kullaniciRolleri.has(rolID));
    const admin = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);

    if (!yetkiliMi && !admin) {
      const uyarı = new EmbedBuilder()
        .setColor('490404')
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setDescription('<a:unlemsel:1327600285597569066>・ Uyarı: Yetersiz veya geçersiz yetki.')
        .setTimestamp();

      return interaction.reply({
        embeds: [uyarı],
        ephemeral: true,
      });
    }

    const ticket = new EmbedBuilder()
      .setAuthor({ name: ayarlar.Embed.authorembed, iconURL: ayarlar.Resimler.moderasyonURL })
      .setDescription(
        ` <a:utility:1327600287367696515> ・\`ᴅᴇꜱᴛᴇᴋ ꜱıꜱᴛᴇᴍı:\`<:onday:1327600263242059848>
        <:8676gasp:1327585524231176192>・\` ᴅᴇꜱᴛᴇᴋ ʙıʟɢı:\` <#${ayarlar.Kanallar.bilgiKanal}>

        <a:gzlk:1327600232963248239>・\`ᴏʏᴜɴ ɪᴄɪ ᴅᴇꜱᴛᴇᴋ:\` *Oyun içi konularda desteğe ihtiyacınız varsa bu kategoriyi seçebilirsiniz.*

        <a:5961darkbluetea:1327585257578561548>・\`ᴏʏᴜɴ ᴅıꜱı ᴅᴇꜱᴛᴇᴋ:\` *Oyun dışı konularda yardıma ihtiyacınız varsa bu kategoriyi seçebilirsiniz.*

        <:kizgin:1327600239485522001>・\`ꜱɪᴋᴀʏᴇᴛ ᴅᴇꜱᴛᴇᴋ:\` *Şikayet için bu kategoriyi seçebilirsiniz.*`
      )
      .setColor('#050404')
      .setImage(ayarlar.Resimler.moderasyonURL)
      .setThumbnail(ayarlar.Resimler.moderasyonURL)
      .setFooter({ text: ayarlar.Embed.footerText, iconURL: ayarlar.Embed.iconURL });

    const genelButton = new ButtonBuilder()
      .setCustomId('oyun-ici')
      .setLabel('ᴏʏᴜɴ ɪᴄɪ ᴅᴇꜱᴛᴇᴋ')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('<a:gzlk:1327600232963248239>');

    const mulakatButton = new ButtonBuilder()
      .setCustomId('oyun-disi')
      .setLabel('ᴏʏᴜɴ ᴅıꜱı ᴅᴇꜱᴛᴇᴋ')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('<a:5961darkbluetea:1327585257578561548>');

    const sikayetButton = new ButtonBuilder()
      .setCustomId('sikayet')
      .setLabel('ꜱɪᴋᴀʏᴇᴛ ᴅᴇꜱᴛᴇᴋ')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('<:kizgin:1327600239485522001>');

    const buttonRow = new ActionRowBuilder().addComponents(genelButton, mulakatButton, sikayetButton);

    await interaction.reply({ embeds: [ticket], components: [buttonRow] });
  },
};
