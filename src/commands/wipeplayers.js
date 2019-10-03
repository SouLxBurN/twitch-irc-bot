const data = require('../data');

/**
 * Command to add a new user to the ignore list
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 */
function ignoreuser(target, context, messageFunction) {
	if (context.mod || context.badges.broadcaster) {
		data.wipePlayers();
		messageFunction(
			target,
			context,
			'All players and their points have been wiped'
		);
	} else {
		messageFunction(
			target,
			context,
			`${context.username} only moderators are allowed to use this command.`
		);
	}
}
module.exports = ignoreuser;