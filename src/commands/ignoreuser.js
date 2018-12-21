const data = require('../data');

/**
 * Command to add a new user to the ignore list
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 * @param {string[]} params - Array of command parameters
 */
function ignoreuser(target, context, messageFunction, params) {
	if (context.mod || context.badges.broadcaster) {
		data.ignoreUser(params[0]);
		messageFunction(
			target,
			context,
			`${params[0]} is now on the ignored list and will not accumulate points.`
		);
	} else {
		messageFunction(
			target,
			context,
			`@${context.username} only moderators are allowed to use this command.`
		);
	}
}
module.exports = ignoreuser;