const data = require('../data');

/**
 * Command to give points to a user
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 * @param {string[]} params - Array of command parameters
 */
function givepoints(target, context, messageFunction, params) {
	if (context.mod || context.badges.broadcaster) {
		if (params.length === 2 && params[0] && params[1]) {
			if (data.updatePoints(params[0], params[1])) {
				messageFunction(
					target,
					context,
					`${context.username} has given ${params[1]} points to ${params[0]}.`
				);
			} else {
				messageFunction(
					target,
					context,
					`${context.username}, ${params[0]} does not exist, or is ignored.`
				);
			}
		} else {
			messageFunction(
				target,
				context,
				`${context.username} This command requires 2 parameters !givepoints {user} {points}.`
			);
		}
	} else {
		messageFunction(
			target,
			context,
			`${context.username} only moderators are allowed to use this command.`
		);
	}
}
module.exports = givepoints;