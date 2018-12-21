const tmi = require('tmi.js');
const schedule = require('node-schedule');
const data = require('./data');

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
var activeUsers = [];

function sendMessage(target, context, message) {
	if (context['message-type'] === 'whisper') {
		client.whisper(target, message);
	} else {
		client.say(target, message);
	}
}

function createUserIfNotExists(username) {
	if (!data.state.players[username]) {
		data.createUser(username);
	}
}

////////////////////////
// Client Initialization
const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
client.on('cheer', onCheerHandler);
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
	createUserIfNotExists();
	sendMessage(
		target,
		context,
		`${username} has earned ${bits} points for giving bits!`
	);
	data.updatePoints(username, bits);
}

/**
 * Handler callback for message events
 * @param {*} target
 * @param {*} context
 * @param {*} msg
 * @param {*} self
 */
function onMessageHandler(target, context, msg, self) {
	// If its yourself or an ignored username i.e. NightBot. Skip the message.
	if (self || data.state.ignoredUsers.includes(context.username)) {
		console.log(
			`[${target} (${context['message-type']})] ${context.username}: ${msg}`
		);
		return;
	}

	createUserIfNotExists(context.username);
	if (!activeUsers.includes(context.username)) {
		activeUsers.push(context.username);
	}

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
	process.exit(1);
}

schedule.scheduleJob('*/15 * * * *', () => {
	activeUsers.forEach(user => {
		if (data.state.players[user]) {
			data.state.players[user].points += 1;
		}
	});
	activeUsers = [];
	console.log('Updated players scores!');
	data.writeToStateToFile();
});
