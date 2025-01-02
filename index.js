const { 
    Client, 
    GatewayIntentBits,
    Collection,
    ActivityType
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('./config');
moment.locale('tr');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.config = config;

client.commands = new Collection();
client.odaMenuleri = new Collection();

client.utils = require('./utils/functions');

mongoose.connect(client.config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB bağlantısı başarılı!');
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.on('messageCreate', async (message) => {
    if (message.guild?.id !== client.config.guildId) return;
    if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('Komutu çalıştırırken bir hata oluştu!');
    }
});

client.on('guildCreate', async (guild) => {
    if (guild.id !== client.config.guildId) {
        await guild.leave();
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(client.config.token); 