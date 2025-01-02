const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    settings: {
        voiceChannel: { type: String, default: null },
        logChannel: { type: String, default: null },
        autoRename: { type: Boolean, default: true },
        defaultLimit: { type: Number, default: 0 },
        maxRooms: { type: Number, default: 1 },
        premiumUsers: [{ type: String }]
    },
    stats: {
        totalRoomsCreated: { type: Number, default: 0 },
        activeRooms: { type: Number, default: 0 },
        totalTime: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema); 