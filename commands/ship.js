const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ship',
    async execute(message, args, client) {
        let user1, user2;

        if (message.mentions.users.size >= 2) {
            [user1, user2] = message.mentions.users.values();
        } else if (message.mentions.users.size === 1) {
            user1 = message.author;
            user2 = message.mentions.users.first();
        } else {
            const members = message.guild.members.cache.filter(m => !m.user.bot);
            user1 = message.author;
            user2 = members.random().user;
        }

        if (user1.id === user2.id) {
            return message.reply('❌ Kendinle ship yapamazsın!');
        }

        const lovePercentage = Math.floor(Math.random() * 101);
        let loveLevel = '';
        let emoji = '';

        if (lovePercentage < 20) {
            loveLevel = 'Hiç uyumlu değilsiniz 💔';
            emoji = '💔';
        } else if (lovePercentage < 40) {
            loveLevel = 'Pek uyumlu sayılmazsınız 💝';
            emoji = '💝';
        } else if (lovePercentage < 60) {
            loveLevel = 'Orta derecede uyumlusunuz 💖';
            emoji = '💖';
        } else if (lovePercentage < 80) {
            loveLevel = 'Oldukça uyumlusunuz 💗';
            emoji = '💗';
        } else {
            loveLevel = 'Mükemmel bir uyumunuz var 💘';
            emoji = '💘';
        }

        const progressBar = createProgressBar(lovePercentage);

        const embed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle('💕 Ship Sonucu')
            .setDescription(`**${user1.username}** ${emoji} **${user2.username}**\n\n${progressBar}\n**${lovePercentage}%**\n\n${loveLevel}`)
            .setThumbnail('https://cdn.discordapp.com/emojis/1069710652844519517.webp')
            .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
};

function createProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '❤️'.repeat(filled) + '🖤'.repeat(empty);
} 