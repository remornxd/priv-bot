const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'say',
    async execute(message, args, client) {
        const guild = message.guild;
        
        const totalMembers = guild.memberCount;
        const boostCount = guild.premiumSubscriptionCount;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2);
        const voiceCount = voiceChannels.reduce((a, c) => a + c.members.size, 0);

        const embed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setDescription([
                `• Sunucumuzda toplam **${totalMembers}** değerli üyemiz bulunmakta. (${guild.members.cache.filter(m => m.user.bot).size} çevrimiçi)`,
                `• Sunucumuzda şu an toplam **${voiceCount}** kişi sesli sohbette aktif olarak yer alıyor.`,
                `• Sunucumuz **${boostCount}** boost'a sahip.`
            ].join('\n'))
            .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
}; 