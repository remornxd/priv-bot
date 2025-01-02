const { EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Room = require('../models/Room');
const Guild = require('../models/Guild');
const moment = require('moment');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        if (!oldState.channel && newState.channel) {
            const guildData = await Guild.findOne({ guildId: newState.guild.id });
            
            if (newState.channel.name === client.config.odaSistemi.joinToCreate.name) {
                const userRoomCount = await Room.countDocuments({ 
                    guildId: newState.guild.id, 
                    owner: newState.member.id 
                });

                const maxRooms = guildData?.premium?.includes(newState.member.id) ? 
                    client.config.premium.maxRooms : client.config.premium.defaultMaxRooms;

                if (userRoomCount >= maxRooms) {
                    await newState.member.voice.disconnect();
                    return newState.member.send('Maksimum oda limitine ulaştınız! Premium üye olarak daha fazla oda oluşturabilirsiniz.');
                }

                let category = newState.guild.channels.cache.find(c => 
                    c.type === ChannelType.GuildCategory && 
                    c.name === client.config.odaSistemi.joinToCreate.category
                );

                if (!category) {
                    category = await newState.guild.channels.create({
                        name: client.config.odaSistemi.joinToCreate.category,
                        type: ChannelType.GuildCategory
                    });
                }

                const voiceChannel = await newState.guild.channels.create({
                    name: `🔊 | ${newState.member.displayName}'in Odası`,
                    type: ChannelType.GuildVoice,
                    parent: category,
                    bitrate: client.config.odaSistemi.defaultSettings.bitrate,
                    userLimit: client.config.odaSistemi.defaultSettings.userLimit,
                    position: client.config.odaSistemi.defaultSettings.position,
                    permissionOverwrites: [
                        {
                            id: newState.guild.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.ManageChannels]
                        },
                        {
                            id: newState.member.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.MoveMembers,
                                PermissionFlagsBits.MuteMembers,
                                PermissionFlagsBits.DeafenMembers,
                                PermissionFlagsBits.Stream
                            ]
                        }
                    ]
                });

                const settingsChannel = await newState.guild.channels.create({
                    name: client.config.odaSistemi.odaAyarlar.name,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: newState.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: newState.member.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ReadMessageHistory
                            ],
                            deny: [PermissionFlagsBits.SendMessages]
                        }
                    ]
                });

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        Object.entries(client.config.odaSistemi.buttons).map(([key, data]) =>
                            new ButtonBuilder()
                                .setCustomId(`oda_${key}_${newState.member.id}`)
                                .setLabel(data.label)
                                .setEmoji(data.emoji)
                                .setStyle(ButtonStyle[data.style])
                        )
                    );

                const embed = new EmbedBuilder()
                    .setColor(client.config.embedColor)
                    .setTitle('🎭 Özel Oda Kontrol Paneli')
                    .setDescription(client.config.odaSistemi.odaAyarlar.description)
                    .setFooter({ text: `${newState.member.displayName} • Oda Sahibi` });

                const controlMsg = await settingsChannel.send({
                    embeds: [embed],
                    components: [buttons]
                });

                const newRoom = new Room({
                    guildId: newState.guild.id,
                    channelId: voiceChannel.id,
                    settingsChannelId: settingsChannel.id,
                    controlMessageId: controlMsg.id,
                    categoryId: category.id,
                    owner: newState.member.id,
                    users: [newState.member.id]
                });

                await newRoom.save();

                await newState.setChannel(voiceChannel);

                const logEmbed = new EmbedBuilder()
                    .setColor(client.config.embedColor)
                    .setTitle('🎭 Yeni Oda Oluşturuldu')
                    .setDescription(`
                        **Oda Sahibi:** ${newState.member}
                        **Oda İsmi:** ${voiceChannel.name}
                        **Oluşturulma:** ${moment().format('LLL')}
                    `)
                    .setFooter({ text: `ID: ${voiceChannel.id}` });

                await client.utils.logToChannel(newState.guild, logEmbed);
            }
        }

        if (oldState.channel) {
            const room = await Room.findOne({ 
                channelId: oldState.channelId,
                guildId: oldState.guild.id 
            });

            if (room) {
                if (oldState.channelId === room.channelId) {
                    const joinTime = oldState.joinedTimestamp;
                    const leaveTime = Date.now();
                    room.stats.totalTime += (leaveTime - joinTime);
                    await room.save();
                }

                const voiceChannel = oldState.guild.channels.cache.get(room.channelId);
                if (voiceChannel && voiceChannel.members.size === 0) {
                    if (voiceChannel) await voiceChannel.delete();
                    
                    const settingsChannel = oldState.guild.channels.cache.get(room.settingsChannelId);
                    if (settingsChannel) await settingsChannel.delete();
                    
                    const category = oldState.guild.channels.cache.get(room.categoryId);
                    if (category && category.children.cache.size === 0) {
                        await category.delete();
                    }

                    await Room.deleteOne({ _id: room._id });

                    const logEmbed = new EmbedBuilder()
                        .setColor(client.config.embedColor)
                        .setTitle('🎭 Oda Silindi')
                        .setDescription(`
                            **Oda Sahibi:** <@${room.owner}>
                            **Oda İsmi:** ${voiceChannel.name}
                            **Toplam Süre:** ${moment.duration(room.stats.totalTime).humanize()}
                        `)
                        .setFooter({ text: `ID: ${voiceChannel.id}` });

                    await client.utils.logToChannel(oldState.guild, logEmbed);
                }
            }
        }
    }
}; 