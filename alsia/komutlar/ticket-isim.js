const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ChannelType } = require('discord.js');
const ayarlar = require('../../ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-isim')
        .setDescription('Ticket ismini değiştirir.')
        .addStringOption(option => 
            option.setName('isim')
                .setDescription('Yeni isim')
                .setRequired(true)
        ),
    async execute(interaction) {
        const newName = interaction.options.getString('isim');
        const categoryId = ayarlar.Ticket.ticketCategory;
        const channel = interaction.channel;

        if (channel.type === ChannelType.GuildText && channel.parentId === categoryId) {
            const oldName = channel.name;
            await channel.setName(newName);

            const embed = new EmbedBuilder()
                .setColor('#101356')
                .setTitle('Ticket İsim Sistemi')
                .setDescription(` <a:5961darkbluetea:1327585257578561548>・${interaction.user} *tarafından* <#${channel.id}> *isimli kanalın ismi* \`${oldName}\` *iken* \`${newName}\` *olarak güncellenmiştir.*`);

            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannelId = ayarlar.Ticket.ticketLog2;
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#101356')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`<:8676gasp:1327585524231176192>・*Kullanıcı* <@${interaction.user.id}> <#${channel.id}> *kanalında ticket ismini değiştirdi.*`)
                    .addFields(
                        { name: '**Eski Kanal İsmi**', value: `\`\`\`diff\n- ${oldName}\`\`\``, inline: true },
                        { name: '**Yeni Kanal İsmi**', value: `\`\`\`diff\n+ ${newName}\`\`\``, inline: true }
                    )
                    .setFooter({ text: ayarlar.Embed.footerText });

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error('Log kanalı bulunamadı!');
            }
        } else {
            await interaction.reply({ content: 'Bu komut sadece belirli bir kategori altındaki metin kanallarında kullanılabilir.', ephemeral: true });
        }
    }
};
