const data = require('../data');

/**
 * Command for rolling the dice.
 * @param {Object} target - Target channel information
 * @param {Object} context - Twitch event context
 * @param {function(target, context, string)} messageFunction - function for sending messages to the channel.
 * @param {string[]} params - Array of command parameters
 */
function roll(target, context, messageFunction, params) {
	const points = data.state.players[context.username].points;
	let bet = Number(params[0]);
	if (isNaN(bet)) {
		messageFunction(
			target,
			context,
			`${context.username}, you have to bet points, not words`
		);
		return;
	}
	// If no bet is specified, assume its ALL IN.
	if (!bet) {
		bet = 1;
	}

	if (bet > points || bet === 0) {
		messageFunction(
			target,
			context,
			`${
				context.username
			}, you have ${points} points, and no I won't loan any points to you`
		);
		return;
	}
	const initDice1 = Math.floor(Math.random() * 6 + 1);
	const initDice2 = Math.floor(Math.random() * 6 + 1);
	const initTotal = initDice1 + initDice2;
	if (initTotal === 7 || initTotal === 11) {
		// Victory!
		data.updatePoints(context.username, bet);
		messageFunction(
			target,
			context,
			`${
				context.username
			}, you rolled ${initDice1} + ${initDice2} = ${initTotal} on your first roll on WON ${bet} points. Total = ${data.state.players[context.username].points}`
		);
	} else if (initTotal === 2 || initTotal === 3 || initTotal === 12) {
		// Defeat!
		data.updatePoints(context.username, -bet);
		messageFunction(
			target,
			context,
			`${
				context.username
			}, you rolled ${initDice1} + ${initDice2} = ${initTotal} on your first roll and LOST ${bet} points. Total = ${data.state.players[context.username].points}`
		);
	} else {
		// Roll until you hit 7 or your target/initial roll.
		let rollCount = 0;
		let currentRoll = 0;
		let dice1 = 0;
		let dice2 = 0;
		do {
			dice1 = Math.floor(Math.random() * 6 + 1);
			dice2 = Math.floor(Math.random() * 6 + 1);
			currentRoll = dice1 + dice2;
			rollCount++;
		} while (currentRoll !== 7 && currentRoll !== initTotal);

		if (currentRoll === 7) {
			// Defeat!
			data.updatePoints(context.username, -bet);
			messageFunction(
				target,
				context,
				`${
					context.username
				}, you rolled ${initDice1} + ${initDice2} = ${initTotal} as your target.`
			);
			messageFunction(
				target,
				context,
				`Rolled ${rollCount} more times and hit ${dice1} + ${dice2} = ${currentRoll} and LOST ${bet} points. Total = ${data.state.players[context.username].points}`
			);
		} else {
			// Victory!
			data.updatePoints(context.username, bet);
			messageFunction(
				target,
				context,
				`${
					context.username
				}, you rolled ${initDice1} + ${initDice2} = ${initTotal} as your target.`
			);
			messageFunction(
				target,
				context,
				`Rolled ${rollCount} more times and hit ${dice1} + ${dice2} = ${currentRoll} and WON ${bet} points. Total = ${data.state.players[context.username].points}`
			);
		}
	}
}

module.exports = roll;