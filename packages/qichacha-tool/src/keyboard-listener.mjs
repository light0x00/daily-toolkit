import keypress from 'keypress';

keypress(process.stdin);


export function registerExitListener(listener) {

	process.stdin.on('keypress', function (ch, key) {
		if (key && key.ctrl && key.name == 'c' || key.name == 'l') {

			listener()

		}
	});
	
}
// listen for the "keypress" event


process.stdin.setRawMode(true);
process.stdin.resume();