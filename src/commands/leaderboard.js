const data = require('../data');

/**
 * Command for printing out the player leaderboard.
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 */
function leaderboard(target, context, messageFunction) {
	const leaders = determineLeaders();
	leaders.forEach(player => {
		messageFunction(
			target,
			context,
			`${player.username} - ${player.points} points`
		);
	});
}

function determineLeaders(leaderCount = 3) {
	var leaders = [];
	for (let key in data.state.players) {
		let player = data.state.players[key];
		if (leaders.length === 0) {
			leaders.push({ username: key, points: player.points });
		} else {
			for (let i = leaders.length - 1; i >= 0; i--) {
				if (player.points > leaders[i].points) {
					if (leaders.length === leaderCount && i === leaders.length - 1) {
						leaders[i] = { username: key, points: player.points };
					} else {
						leaders[i + 1] = leaders[i];
						leaders[i] = { username: key, points: player.points };
					}
				} else if (leaders.length < leaderCount) {
					leaders[i + 1] = { username: key, points: player.points };
				}
			}
		}
	}
	return leaders;
}

module.exports = leaderboard;
