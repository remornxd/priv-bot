const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Guild = require('../models/Guild');
const Room = require('../models/Room');
const moment = require('moment');

module.exports = {
    name: 'odastat',
    description: 'Sunucu oda istatistiklerini gösterir',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok!');
        }

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        const activeRooms = await Room.find({ guildId: message.guild.id });
        
        const embed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle('📊 Sunucu Oda İstatistikleri')
            .addFields(
                { name: 'Toplam Oluşturulan Oda', value: `${guildData.stats.totalRoomsCreated}`, inline: true },
                { name: 'Aktif Oda Sayısı', value: `${activeRooms.length}`, inline: true },
                { name: 'Toplam Kullanım Süresi', value: moment.duration(guildData.stats.totalTime).humanize(), inline: true }
            )
            .setFooter({ text: message.guild.name });

        message.reply({ embeds: [embed] });
    }
}; 