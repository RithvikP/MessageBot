const Discord = require('discord.js');
const fs = require('fs');

const config = require('./config.json');

const client = new Discord.Client();

const ONE_DAY = 86400000;

// Keywords
const ping = 'm ping';
const help = 'm help';
const daily = 'm rank';
const cumulative = 'm total';

let data = {};

function getHelp() {
	let helpList = [
		{
			name: 'm ping',
			value: 'Bot ping'
		},
		{
			name: 'm rank',
			value: 'Daily message count rankings'
		},
		{
			name: 'm total',
			value: 'Cumulative message count rankings'
		},
		{
			name: 'm help',
			value: 'This menu'
		}
	];

	return helpList;
}

function getDailyRankings(server) {
	let rankings = '';
	let count = 1;
	for (let d in data[server]) {
		rankings+= count+': '+d+': '+data[server][d].daily+'\n';
		count++;
	}

	return rankings;
}

function getCumulativeRankings(server) {
	let rankings = '';
	let count = 1;
	for (let d in data[server]) {
		rankings+= count+': '+d+': '+data[server][d].total+'\n';
		count++;
	}

	return rankings;
}

function updateRankings(username, server) {

	if(Date.now() - data['time'] > ONE_DAY) {
		for (let s in data) {
			if (s !== 'time') {
				for (let d in data[s]) {
					console.log(d);
					data[s][d].daily = 0;
				}
			}
		}

		let time = new Date();
		time.setHours(0);
		time.setMinutes(0);
		time.setSeconds(0);
		time.setMilliseconds(0);
		time = time.getTime();
		data['time'] = time;
	}


	if (!data[server]) {
		data[server] = {};
	}
	if (!data[server][username]) {
		data[server][username] = {
			total: 1,
			daily: 1
		}
	}
	else {
		data[server][username]['total']++;
		data[server][username]['daily']++;
	}

	fs.writeFile('./data.json', JSON.stringify(data) + '\n', function(err){
		if(err) throw err;
	})
}

client.on('ready', () => {
	fs.readFile('./data.json', 'utf8', function(err, raw) {
		if (err) {
			console.log(err);
			return;
		}
		data = JSON.parse(raw);
		if(!data['time']) {
			let time = new Date();
			time.setHours(0);
			time.setMinutes(0);
			time.setSeconds(0);
			time.setMilliseconds(0);
			time = time.getTime();
	
			data['time'] = time;
			console.log('Time set up');
		}
		console.log('Ready');
	});
});

client.on('message', msg => {
	// Ping
	if (msg.content === ping) {
		msg.reply('Pong! (' + client.ping+'s)');
	}

	// Help
	if (msg.content === help) {
		msg.channel.send({embed: {
			color: 0xe52424,
			title: "Help",
			fields: getHelp()
		}});
	}

	// Daily rankings
	if (msg.content === daily) {
		msg.channel.send({embed: {
			color: 0x437fe0,
			title: "Daily Rankings",
			description: getDailyRankings(msg.guild.id)
		}});
	}

	// Cumulative rankings
	if(msg.content === cumulative) {
		msg.channel.send({embed: {
			color: 0x0c9926,
			title: "Cumulative Rankings",
			description: getCumulativeRankings(msg.guild.id)
		}});
	}

	updateRankings(msg.author.username, msg.guild.id);

});

client.login(config.botToken);