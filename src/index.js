const tmi = require('tmi.js');
const schedule = require('node-schedule');
const dataStore = require('./data');
const axios = require('axios');

// Command initialization
const points = require('./commands/points');
const leaderboard = require('./commands/leaderboard');
const roll = require('./commands/roll');
const ignoreuser = require('./commands/ignoreuser');
const givepoints = require('./commands/givepoints');
const knownCommands = { roll, points, leaderboard, ignoreuser, givepoints };

const opts = {
	identity: {
		username: '',
		password: ''
	},
	channels: []
};

const commandPrefix = '!';

function sendMessage(target, context, message) {
	if (context['message-type'] === 'whisper') {
		client.whisper(target, message);
	} else {
		client.say(target, message);
	}
}

////////////////////////
// Client Initialization
const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
// client.on('cheer', onCheerHandler);
client.connect();
////////////////////////

/**
 * Handler callback for cheer events
 * @param {*} target
 * @param {*} context
 * @param {*} msg
 */
function onCheerHandler(target, context, msg) {
	const username = context.username;
	const bits = context.bits;
	dataStore.createUserIfNotExists(username);
	sendMessage(
		target,
		context,
		`${username} has earned ${bits} points for giving bits!`
	);
	dataStore.updatePoints(username, bits);
}

/**
 * Handler callback for message events
 * @param {*} target
 * @param {*} context
 * @param {*} msg
 * @param {*} self
 */
function onMessageHandler(target, context, msg, self) {
	console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`);

	if (notACommand(msg)) {
		return;
	}
	
	const parse = msg.slice(1).split(' ');
	const commandName = parse[0].toLowerCase();
	const params = parse.splice(1);

	if (commandName in knownCommands) {
		const command = knownCommands[commandName];
		command(target, context, sendMessage, params);

		console.log(`* Executed ${commandName} command for ${context.username}`);
	} else {
		console.log(`* Unkown command ${commandName} from ${context.username}`);
	}
}

function notACommand(msg) {
	return msg.substr(0, 1) !== commandPrefix;
}

/**
 * Handler callback for successful connection event
 * @param {*} addr
 * @param {*} port
 */
function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
}

/**
 * Handler callback for server disconnect event
 * @param {*} reason
 */
function onDisconnectedHandler(reason) {
	console.log(`Disconnected: ${reason}`);
	dataStore.writeToStateToFile();
	process.exit(1);
}

schedule.scheduleJob('*/10 * * * *', async () => {
	// TODO This could really be refactored.
	try {
		const response = await axios.get(
			`https://api.twitch.tv/helix/streams?user_login=${opts.channels[0].substr(1)}`,
			{
				headers : {
					'Authorization' : `Bearer ${opts.identity.password.substr(6)}`
				}
			});
		if (response.data.data.length > 0) {
			const { data } = await axios.get(`http://tmi.twitch.tv/group/user/${opts.channels[0].substr(1)}/chatters`);
			const currentViewers = []
				.concat(data.chatters.viewers)
				.concat(data.chatters.broadcaster)
				.concat(data.chatters.moderators)
				.concat(data.chatters.vips);
			currentViewers.forEach(user => {
				if (!dataStore.state.ignoredUsers.includes(user) && !dataStore.createUserIfNotExists(user)) {
					if (dataStore.state.players[user]) {
						dataStore.state.players[user].points += 5;
					}
				}
			});
			console.log('Updated players scores!');
		}
	} catch(err) {
		console.error('Error encountered when fetching list of viewers', err);
	}
});

schedule.scheduleJob('*/5 * * * * *', () => {
	dataStore.writeToStateToFile();
});