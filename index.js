const Discord = require('discord.js');
const fs = require('fs');
let firebaseAdmin = require('firebase-admin');

const config = require('./config.json');
const client = new Discord.Client();
let dataRef;

const ONE_DAY = 86400000;

// Keywords
const ping = '=ping';
const help = '=help';
const daily = '=rank';
const cumulative = '=total';

function getHelp() {
	let helpList = [
		{
			name: '=ping',
			value: 'Bot ping'
		},
		{
			name: '=rank',
			value: 'Daily message count rankings'
		},
		{
			name: '=total',
			value: 'Cumulative message count rankings'
		},
		{
			name: '=help',
			value: 'This menu'
		}
	];

	return helpList;
}

function sortJsonToArray(values, daily) {
	let arrValues =[];

	for(let v in values) {
		arrValues.push({
			"username": v,
			"daily": values[v]['daily'],
			"cumulative": values[v]['cumulative']
		});
	}

	arrValues.sort((a,b) => {
		if(daily) {
			if(a.daily > b.daily) return -1;
			else return 1;
		}
		else {
			if(a.cumulative > b.cumulative) return -1;
			else return 1;
		}
	});
	
	return arrValues;
}

function getDailyRankings(server, msg) {

	dataRef.child(server).once('value', (data) => {
		let values = data.val();
		let rankings = '';
		let count = 1;

		let sortedValues = sortJsonToArray(values, true);

		sortedValues.forEach((val) => {
			rankings += count + ': '+ val.username +': ' + val.daily + '\n';
			count++;
		});

		msg.channel.send({embed: {
			color: 0x437fe0,
			title: "Daily Rankings",
			description: rankings
		}});
	});

}

function getCumulativeRankings(server, msg) {

	dataRef.child(server).once('value', (data) => {
		let values = data.val();
		let rankings = '';
		let count = 1;

		let sortedValues = sortJsonToArray(values, true);

		sortedValues.forEach((val) => {
			rankings += count + ': '+ val.username +': ' + val.cumulative + '\n';
			count++;
		});

		msg.channel.send({embed: {
			color: 0x0c9926,
			title: "Cumulative Rankings",
			description: rankings
		}});
	});
	
}

function updateRankings(username, server) {
	
	dataRef.child(server).once('value', (data) => {
		let values = data.val();
		let write = {};

		if(values && values[username]) {
			let addition = {"daily": values[username]['daily'] + 1, "cumulative": values[username]['cumulative'] + 1};
			write[username] = addition;

			dataRef.child(server).update(write);
		}
		else {
			let addition = {"daily": 1, "cumulative": 1};
			write[username] = addition;

			dataRef.child(server).update(write);
		}
	});
		  
}

client.on('ready', () => {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert({
		  projectId: config.firebase.projectId,
		  clientEmail: config.firebase.clientEmail,
		  privateKey: config.firebase.privateKey
		}),
		databaseURL: config.firebase.databaseURL,
		databaseAuthVariableOverride: {
			uid: config.firebase.workerUid
		}
	});

	let db = firebaseAdmin.database();
	dataRef = db.ref(config.firebase.dataNode);

	console.log('Ready');
});

client.on('message', (msg) => {
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
		getDailyRankings(msg.guild.id, msg);
	}

	// Cumulative rankings
	if(msg.content === cumulative) {
		getCumulativeRankings(msg.guild.id, msg);
	}

	updateRankings(msg.author.username, msg.guild.id);
});

client.login(config.botToken);