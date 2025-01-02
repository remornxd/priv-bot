const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        
        try {
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            const avatarEmbed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setTitle(`${user.tag} - Avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL() });

            const bannerEmbed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setTitle(`${user.tag} - Banner`);

            if (fetchedUser.bannerURL()) {
                bannerEmbed.setImage(fetchedUser.bannerURL({ dynamic: true, size: 4096 }));
            } else {
                bannerEmbed.setDescription('❌ Bu kullanıcının banner\'ı bulunmuyor.');
            }

            await message.reply({ embeds: [avatarEmbed] });
            if (fetchedUser.bannerURL()) {
                await message.channel.send({ embeds: [bannerEmbed] });
            }
        } catch (error) {
            console.error(error);
            message.reply('❌ Bir hata oluştu!');
        }
    }
}; 