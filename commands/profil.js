const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'profil',
    async execute(message, args, client) {
        const member = message.mentions.members.first() || message.member;
        const user = member.user;
        
        const roles = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, -1);

        const flags = {
            BotHTTPInteractions: '🤖 Bot HTTP Etkileşimleri',
            BugHunterLevel1: '🐛 Bug Avcısı Seviye 1',
            BugHunterLevel2: '🐛 Bug Avcısı Seviye 2',
            CertifiedModerator: '👮‍♂️ Onaylı Moderatör',
            HypeSquadOnlineHouse1: '🏠 Bravery',
            HypeSquadOnlineHouse2: '🏠 Brilliance',
            HypeSquadOnlineHouse3: '🏠 Balance',
            Hypesquad: '🏅 HypeSquad Events',
            Partner: '👑 Partner',
            PremiumEarlySupporter: '👑 Erken Destekçi',
            Staff: '👨‍💼 Discord Çalışanı',
            VerifiedBot: '✅ Doğrulanmış Bot',
            VerifiedDeveloper: '👨‍💻 Doğrulanmış Bot Geliştiricisi'
        };

        const userFlags = user.flags ? user.flags.toArray() : [];

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || client.config.embedColor)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .addFields(
                { name: '👤 Kullanıcı Bilgisi', value: [
                    `**❯ ID:** ${user.id}`,
                    `**❯ Rozetler:** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Yok'}`,
                    `**❯ Hesap Oluşturma:** ${moment(user.createdTimestamp).format('DD/MM/YYYY HH:mm:ss')}`,
                    `**❯ Sunucuya Katılma:** ${moment(member.joinedTimestamp).format('DD/MM/YYYY HH:mm:ss')}`,
                    `**❯ Roller [${roles.length}]:** ${roles.length ? roles.join(', ') : 'Yok'}`
                ].join('\n') }
            )
            .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
}; 