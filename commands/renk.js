const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'renk',
    description: 'Renk seçme menüsünü gösterir',
    async execute(message, args, client) {
        try {
            const roles = new Map();
            for (const color of client.config.colors.list) {
                let role = message.guild.roles.cache.find(r => r.name === `${client.config.colors.rolePrefix} ${color.name}`);
                
                if (!role) {
                    role = await message.guild.roles.create({
                        name: `${client.config.colors.rolePrefix} ${color.name}`,
                        color: color.value,
                        position: client.config.colors.defaultPosition,
                        reason: 'Renk rolü oluşturuldu'
                    });
                }
                
                roles.set(color.name, role);
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('color_select')
                        .setPlaceholder('Bir renk seçin')
                        .addOptions(
                            client.config.colors.list.map(color => ({
                                label: color.name,
                                value: color.name,
                                emoji: color.emoji,
                                description: `${color.name} rengini seçer`
                            }))
                        )
                );

            const embed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setTitle('🎨 Renk Seçme Menüsü')
                .setDescription('Aşağıdaki menüden istediğiniz rengi seçebilirsiniz.')
                .addFields(
                    { 
                        name: 'Mevcut Renkler', 
                        value: client.config.colors.list.map(color => 
                            `${color.emoji} ${color.name}`
                        ).join('\n')
                    }
                )
                .setFooter({ text: 'İstediğiniz zaman renginizi değiştirebilirsiniz.' });

            await message.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Renk komutu hatası:', error);
            message.reply('Renk menüsü oluşturulurken bir hata oluştu!');
        }
    }
}; 