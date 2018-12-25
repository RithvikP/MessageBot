const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log('Setup complete.');
});

client.on('message', msg => {
	// Ping
	if (msg.content === 'm ping') {
		msg.reply('Pong!');
	}
});

client.login(process.env.BOT_TOKEN);