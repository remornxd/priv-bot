const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Room = require('../models/Room');

module.exports = {
    name: 'oda',
    description: 'Özel oda yönetim sistemi',
    async execute(message, args, client) {
        if (!args[0]) {
            const existingRoom = await Room.findOne({ owner: message.author.id, guildId: message.guild.id });
            
            const kontrolPaneli = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('🎭 Özel Oda Kontrol Paneli')
                .setDescription(existingRoom ? 'Aşağıdaki butonları kullanarak odanızı yönetebilirsiniz.' : 'Henüz bir odanız yok. Oda oluşturmak için `!oda oluştur` komutunu kullanın.')
                .addFields(
                    { name: 'Oda Yönetimi', value: 'Limit ayarlama, kilitleme ve isim değiştirme işlemleri için üst sıradaki butonları kullanın.', inline: false },
                    { name: 'Kullanıcı Yönetimi', value: 'Kullanıcı ekleme, çıkarma ve oda silme işlemleri için alt sıradaki butonları kullanın.', inline: false }
                )
                .setFooter({ text: 'Detaylı bilgi için menüyü kullanabilirsiniz.' });

            const components = existingRoom ? [...client.utils.createOdaButtons(message.author.id), client.utils.createOdaMenu(message.author.id)] : [];

            const msg = await message.reply({
                embeds: [kontrolPaneli],
                components
            });

            if (existingRoom) {
                client.odaMenuleri.set(message.author.id, msg.id);
            }
            return;
        }

        if (args[0] === 'oluştur') {
            const existingRoom = await Room.findOne({ owner: message.author.id, guildId: message.guild.id });
            if (existingRoom) {
                return message.reply('Zaten bir özel odan var!');
            }

            try {
                const category = await message.guild.channels.create({
                    name: '🎭 Özel Odalar',
                    type: ChannelType.GuildCategory
                });

                const odaIsmi = args.slice(1).join(' ') || `${message.author.username}'in Odası`;
                const voiceChannel = await message.guild.channels.create({
                    name: `🔊 ${odaIsmi}`,
                    type: ChannelType.GuildVoice,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionFlagsBits.Connect]
                        },
                        {
                            id: message.author.id,
                            allow: [
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.MoveMembers,
                                PermissionFlagsBits.MuteMembers,
                                PermissionFlagsBits.DeafenMembers
                            ]
                        }
                    ]
                });

                const newRoom = new Room({
                    guildId: message.guild.id,
                    channelId: voiceChannel.id,
                    categoryId: category.id,
                    owner: message.author.id,
                    users: [message.author.id]
                });

                await newRoom.save();

                const embed = new EmbedBuilder()
                    .setColor('#2F3136')
                    .setTitle('🎭 Özel Oda Oluşturuldu')
                    .setDescription(`
                        **Oda Sahibi:** ${message.author}
                        **Oda İsmi:** ${odaIsmi}
                        **Ses Kanalı:** ${voiceChannel}
                    `)
                    .setTimestamp();

                const buttons = client.utils.createOdaButtons(message.author.id);
                const menu = client.utils.createOdaMenu(message.author.id);

                const msg = await message.reply({
                    embeds: [embed],
                    components: [...buttons, menu]
                });

                client.odaMenuleri.set(message.author.id, msg.id);
            } catch (error) {
                console.error(error);
                message.reply('Oda oluşturulurken bir hata oluştu!');
            }
        }
    }
}; 