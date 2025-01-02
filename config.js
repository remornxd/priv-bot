const { ActivityType } = require('discord.js');

module.exports = {
    // Bot Ayarları
    token: 'XYZ',
    prefix: '!',
    mongoUri: 'mongodb://localhost:313131/locadb',
    
    // Sunucu Ayarları
    guildId: '1320854724467232818',
    
    // Oda Sistemi
    odaSistemi: {
        joinToCreate: {
            name: '➕ Oda Oluştur',
            category: '🎭 Özel Odalar'
        },
        odaAyarlar: {
            name: '⚙️-oda-ayarları',
            description: [
                'Sunucudaki özel oda sistemi, bu panel aracılığıyla kolayca yönetilebilir.',
                '',
                'Aşağıdaki butonlarla özel odanızın tüm ayarlarını yapabilirsiniz:',
                '',
                '🔒 **Kilit**: Odanın bağlantısını kilitleyerek, kullanıcıların odaya katılmalarını engellersiniz.',
                '🔓 **Kilit Kaldır**: Odanın bağlantısını açarak, kullanıcıların odaya katılmasına izin verirsiniz.',
                '✏️ **İsim Değiştir**: Odanın adını değiştirebilirsiniz.',
                '👥 **Üye Limiti**: Odanın kullanıcı limitini ayarlayarak, yalnızca belirli sayıda kişiyi kabul edebilirsiniz.',
                '⚫ **Sesten At**: Oda katılımcılarından birini sesli kanaldan atabilirsiniz.',
                '',
                '**Not**: Bu sistem yalnızca yöneticiler veya uygun izinlere sahip kullanıcılar tarafından yönetilebilir.'
            ].join('\n')
        },
        buttons: {
            lock: { emoji: '🔒', label: 'Kilit Aç/Kapat', style: 'PRIMARY' },
            name: { emoji: '✏️', label: 'İsim Değiştir', style: 'PRIMARY' },
            limit: { emoji: '👥', label: 'Üye Limiti', style: 'PRIMARY' },
            kick: { emoji: '⚫', label: 'Sesten At', style: 'DANGER' }
        },
        defaultSettings: {
            userLimit: 0,
            bitrate: 64000,
            position: 1
        }
    },
    
    // Görünüm Ayarları
    embedColor: '#2F3136',
    botStatus: {
        text: '🎭 Özel Odalar',
        type: ActivityType.Watching
    },
    
    // Log Ayarları
    logChannel: {
        name: 'oda-log',
        topic: 'Özel oda sistemi logları'
    },
    
    // Premium Ayarları
    premium: {
        maxRooms: 3,
        defaultMaxRooms: 1
    },
    
    // Emoji Ayarları
    emojis: {
        lock: '🔒',
        unlock: '🔓',
        owner: '👑',
        member: '👤',
        voice: '🔊',
        settings: '⚙️',
        stats: '📊',
        time: '⏰',
        plus: '➕',
        minus: '➖',
        delete: '🗑️'
    }
}; 