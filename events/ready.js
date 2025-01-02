module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} olarak giriş yapıldı!`);
        
        const guild = client.guilds.cache.get(client.config.guildId);
        if (guild) {
            await client.utils.setupGuild(guild, client);
            console.log(`Ana sunucu (${guild.name}) için kurulum tamamlandı!`);
        }

        for (const [id, guild] of client.guilds.cache) {
            if (id !== client.config.guildId) {
                await guild.leave();
                console.log(`${guild.name} sunucusundan ayrıldı!`);
            }
        }

        client.utils.updateBotPresence(client);
        setInterval(() => client.utils.updateBotPresence(client), 5 * 60 * 1000); // Her 5 dakikada bir güncelle
    }
}; 