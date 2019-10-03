const fs = require('fs');
const dataFile = 'data.json';

module.exports = {
	state: JSON.parse(fs.readFileSync(dataFile)),

	createUserIfNotExists(username) {
		if (!this.state.players[username]) {
			this.createUser(username);
			return true;
		}
		return false;
	},

	writeToStateToFile() {
		fs.writeFile(dataFile, JSON.stringify(this.state), function(err) {
			if (err) {
				console.error(err);
				return;
			}
		});
	},

	writeBackupStateToFile() {
		let today = new Date();
		let backupName = `data${today.getFullYear()}${today.getMonth()}${today.getDay()}${today.getHours()}${today.getMinutes()}${today.getSeconds()}.json`;
		fs.writeFile(backupName, JSON.stringify(this.state), function(err) {
			if (err) {
				console.error(err);
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
		return true;
	},

	updatePoints(username, points) {
		if (!username || !this.userExists(username)) { return false; }
		const lowcasedName = username.toLowerCase();
		this.state.players[lowcasedName].points += parseInt(points);
		return true;
	},

	userExists(username) {
		const lowcasedName = username.toLowerCase();
		if (this.state.players[lowcasedName]) {
			return true;
		}
		return false;
	},

	wipePlayers() {
		this.writeBackupStateToFile();
		this.state.players = {};
		this.writeToStateToFile();
	}
};
