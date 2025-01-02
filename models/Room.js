const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    categoryId: { type: String, required: true },
    owner: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    users: [{ type: String }],
    settings: {
        isLocked: { type: Boolean, default: false },
        userLimit: { type: Number, default: 0 },
        bannedUsers: [{ type: String }]
    },
    stats: {
        totalJoins: { type: Number, default: 0 },
        totalTime: { type: Number, default: 0 },
        lastActive: { type: Date, default: Date.now }
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema); 