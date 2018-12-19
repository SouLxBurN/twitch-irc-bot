const data = require('../data');

/**
 * Command to requesting current points.
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 */
function points(target, context, messageFunction) {
	messageFunction(
		target,
		context,
		`${context.username} you have ${
			data.state.players[context.username].points
		} points`
	);
}
module.exports = points;