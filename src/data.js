const fs = require('fs');
const dataFile = 'data.json';

module.exports = {
	state: JSON.parse(fs.readFileSync(dataFile)),

	writeToStateToFile() {
		fs.writeFile(dataFile, JSON.stringify(this.state), function(err) {
			if (err) {
				console.log(err);
				return;
			}
		});
	},

	ignoreUser(username) {
		if (!username) { return false; }
		const lowcasedName = username.toLowerCase();
		delete this.state.players[lowcasedName];
		if (!this.state.ignoredUsers.includes(lowcasedName)) {
			this.state.ignoredUsers.push(lowcasedName);
		}
		return true;
	},

	createUser(username) {
		this.state.players[username] = {
			points: 5
		};
		this.writeToStateToFile();
	},

	updatePoints(user, points) {
		this.state.players[user].points += parseInt(points);
		this.writeToStateToFile();
	}
};
