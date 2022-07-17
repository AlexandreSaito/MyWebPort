import fs from 'fs';

class Observer {
	constructor() {
		this.subscribers = [];
	}

	subscribe(f) {
		this.subscribers.push(f);
	}

	unsubscribe(f) {
		var index = this.subscribers.indexOf((func) => func == f);
		if (index == -1)
			return;

		this.subscribers.splice(index, 1);
	}

	notify(data) {
		var sLength = this.subscribers.length;
		for (var i = 0; i < sLength; i++) {
			this.subscribers[i](data);
		}
	}
}

async function getModule(path) {
	var m = null;
	var lastMod = fs.statSync(path).mtime;
	await import(`${path}?version=${lastMod}`)
		.then((module) => { m = module; })
		.catch((error) => { console.error(error) });
	return m;
}

export { Observer, getModule }