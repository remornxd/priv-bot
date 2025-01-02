const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'sil',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın!');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('❌ Lütfen 1-100 arası bir sayı belirtin!');
        }

        try {
            const messages = await message.channel.bulkDelete(amount + 1, true);
            const reply = await message.channel.send(`✅ ${messages.size - 1} mesaj silindi!`);
            setTimeout(() => reply.delete(), 3000);
        } catch (error) {
            console.error(error);
            message.reply('❌ 14 günden eski mesajlar silinemez!');
        }
    }
}; 