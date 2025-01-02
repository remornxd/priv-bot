const { EmbedBuilder } = require('discord.js');
const Room = require('../models/Room');
const moment = require('moment');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Renk seçimi kontrolü
        if (interaction.isStringSelectMenu() && interaction.customId === 'color_select') {
            try {
                const selectedColor = interaction.values[0];
                const colorData = client.config.colors.list.find(c => c.name === selectedColor);
                
                if (!colorData) {
                    return interaction.reply({
                        content: 'Geçersiz renk seçimi!',
                        ephemeral: true
                    });
                }

                // Eski renk rollerini kaldır
                const oldColorRoles = interaction.member.roles.cache.filter(role => 
                    client.config.colors.list.some(color => 
                        role.name === `${client.config.colors.rolePrefix} ${color.name}`
                    )
                );
                
                if (oldColorRoles.size > 0) {
                    await interaction.member.roles.remove(oldColorRoles);
                }

                // Yeni renk rolünü ekle
                const newRole = interaction.guild.roles.cache.find(r => 
                    r.name === `${client.config.colors.rolePrefix} ${colorData.name}`
                );

                if (!newRole) {
                    return interaction.reply({
                        content: 'Renk rolü bulunamadı!',
                        ephemeral: true
                    });
                }

                await interaction.member.roles.add(newRole);
                
                return interaction.reply({
                    content: `${colorData.emoji} **${colorData.name}** rengini seçtiniz!`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Renk seçimi hatası:', error);
                return interaction.reply({
                    content: 'Renk seçilirken bir hata oluştu!',
                    ephemeral: true
                });
            }
        }

        // Oda sistemi kontrolleri
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
        if (!interaction.customId.includes('_')) return;

        const [action, authorId] = interaction.customId.split('_');
        if (interaction.user.id !== authorId) {
            return interaction.reply({ 
                content: 'Bu butonu sadece oda sahibi kullanabilir!', 
                ephemeral: true 
            });
        }

        const odaData = await Room.findOne({ owner: authorId, guildId: interaction.guild.id });
        if (!odaData) {
            return interaction.reply({ 
                content: 'Aktif bir özel odan yok!', 
                ephemeral: true 
            });
        }

        const channel = interaction.guild.channels.cache.get(odaData.channelId);
        if (!channel) {
            await Room.deleteOne({ _id: odaData._id });
            return interaction.reply({ 
                content: 'Oda bulunamadı! Oda verisi silindi.', 
                ephemeral: true 
            });
        }

        try {
            switch(action) {
                case 'limit':
                    const limitModal = {
                        title: 'Oda Limiti Ayarla',
                        custom_id: `limit_modal_${authorId}`,
                        components: [{
                            type: 1,
                            components: [{
                                type: 4,
                                custom_id: 'limit_value',
                                label: 'Limit (0-99)',
                                style: 1,
                                min_length: 1,
                                max_length: 2,
                                placeholder: 'Örn: 5',
                                required: true
                            }]
                        }]
                    };
                    await interaction.showModal(limitModal);
                    break;

                case 'kilit':
                    const yeniDurum = !odaData.settings.isLocked;
                    await channel.permissionOverwrites.edit(interaction.guild.id, {
                        Connect: !yeniDurum
                    });
                    odaData.settings.isLocked = yeniDurum;
                    await odaData.save();
                    await interaction.reply({ 
                        content: yeniDurum ? 'Oda kilitlendi! 🔒' : 'Oda kilidi açıldı! 🔓', 
                        ephemeral: true 
                    });
                    break;

                case 'menu':
                    const value = interaction.values[0];
                    let embed;

                    switch(value) {
                        case 'bilgi':
                            embed = new EmbedBuilder()
                                .setColor(client.config.embedColor)
                                .setTitle('ℹ️ Oda Bilgileri')
                                .addFields(
                                    { name: 'Oda Sahibi', value: `<@${odaData.owner}>`, inline: true },
                                    { name: 'Oluşturulma', value: moment(odaData.createdAt).format('LLL'), inline: true },
                                    { name: 'Durum', value: odaData.settings.isLocked ? '🔒 Kilitli' : '🔓 Açık', inline: true },
                                    { name: 'Limit', value: `${odaData.settings.userLimit || 'Sınırsız'}`, inline: true },
                                    { name: 'Yetkili Sayısı', value: `${odaData.users.length}`, inline: true }
                                );
                            break;

                        case 'yetkililer':
                            const yetkililer = odaData.users.map(id => `<@${id}>`).join('\n') || 'Yetkili yok';
                            embed = new EmbedBuilder()
                                .setColor(client.config.embedColor)
                                .setTitle('👑 Oda Yetkilileri')
                                .setDescription(yetkililer);
                            break;

                        case 'istatistik':
                            embed = new EmbedBuilder()
                                .setColor(client.config.embedColor)
                                .setTitle('📊 Oda İstatistikleri')
                                .addFields(
                                    { name: 'Toplam Giriş', value: `${odaData.stats.totalJoins}`, inline: true },
                                    { name: 'Toplam Süre', value: `${Math.floor(odaData.stats.totalTime / 3600000)} saat`, inline: true },
                                    { name: 'Son Aktivite', value: moment(odaData.stats.lastActive).fromNow(), inline: true }
                                );
                            break;
                    }

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Bir hata oluştu!', 
                ephemeral: true 
            });
        }
    }
}; 