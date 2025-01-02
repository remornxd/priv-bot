const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const Room = require('../models/Room');
const Guild = require('../models/Guild');

module.exports = {
    createOdaButtons(authorId) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`limit_${authorId}`)
                    .setLabel('Limit Ayarla')
                    .setEmoji('👥')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`kilit_${authorId}`)
                    .setLabel('Kilitle/Aç')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`isim_${authorId}`)
                    .setLabel('İsim Değiştir')
                    .setEmoji('✏️')
                    .setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ekle_${authorId}`)
                    .setLabel('Kullanıcı Ekle')
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cikar_${authorId}`)
                    .setLabel('Kullanıcı Çıkar')
                    .setEmoji('➖')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`sil_${authorId}`)
                    .setLabel('Odayı Sil')
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Danger)
            );

        return [row1, row2];
    },

    createOdaMenu(authorId) {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`menu_${authorId}`)
                    .setPlaceholder('Oda Ayarları')
                    .addOptions([
                        {
                            label: 'Oda Bilgileri',
                            description: 'Odanızın detaylı bilgilerini görüntüleyin',
                            value: 'bilgi',
                            emoji: 'ℹ️'
                        },
                        {
                            label: 'Yetkili Listesi',
                            description: 'Odanızdaki yetkili kullanıcıları görüntüleyin',
                            value: 'yetkililer',
                            emoji: '👑'
                        },
                        {
                            label: 'Oda İstatistikleri',
                            description: 'Odanızın kullanım istatistiklerini görüntüleyin',
                            value: 'istatistik',
                            emoji: '📊'
                        }
                    ])
            );

        return row;
    },

    async updateBotPresence(client) {
        if (client.guilds.cache.get('GUILD_ID')) {
            const totalRooms = await Room.countDocuments();
            const activeUsers = await Room.aggregate([
                { $group: { _id: null, total: { $sum: { $size: "$users" } } } }
            ]);
            
            const status = `${totalRooms} Oda | ${activeUsers[0]?.total || 0} Kullanıcı`;
            client.user.setPresence({
                activities: [{ name: status, type: client.config.botStatus.type }],
                status: 'online'
            });
        }
    },

    async setupGuild(guild, client) {
        if (guild.id !== 'GUILD_ID') {
            await guild.leave();
            return null;
        }

        let guildData = await Guild.findOne({ guildId: guild.id });
        
        if (!guildData) {
            const voiceChannel = await guild.channels.create({
                name: client.config.defaultVoiceChannel,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [PermissionFlagsBits.Connect],
                        deny: [PermissionFlagsBits.Speak]
                    }
                ]
            });

            const logChannel = await guild.channels.create({
                name: 'oda-log',
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            guildData = new Guild({
                guildId: guild.id,
                settings: {
                    voiceChannel: voiceChannel.id,
                    logChannel: logChannel.id
                }
            });

            await guildData.save();
        }

        return guildData;
    },

    async logToChannel(guild, embed) {
        if (guild.id === 'GUILD_ID') {
            const guildData = await Guild.findOne({ guildId: guild.id });
            if (guildData?.settings?.logChannel) {
                const logChannel = guild.channels.cache.get(guildData.settings.logChannel);
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }
            }
        }
    }
}; 