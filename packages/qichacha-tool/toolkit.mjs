import notifier from 'node-notifier';

export function log(msg) {
	console.log(`[${dateToIsoString(new Date())}]${msg}`)
}

export function logThenNotify(msg) {
	log(msg)
	notifier.notify(msg);
}

export function formatDate(date) {
	let d = new Date()
	return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "T"
}


export function dateToIsoString(date) {
	var tzo = -date.getTimezoneOffset(),
		dif = tzo >= 0 ? '+' : '-',
		pad = function (num) {
			return (num < 10 ? '0' : '') + num;
		};

	return date.getFullYear() +
		'-' + pad(date.getMonth() + 1) +
		'-' + pad(date.getDate()) +
		'T' + pad(date.getHours()) +
		':' + pad(date.getMinutes()) +
		':' + pad(date.getSeconds()) +
		dif + pad(Math.floor(Math.abs(tzo) / 60)) +
		':' + pad(Math.abs(tzo) % 60);
}

export class InterruptError extends Error {

}