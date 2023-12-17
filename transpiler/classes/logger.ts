const colors = require('colors/safe');

const logs: string[] = [];
const errors: string[] = [];

export function outputLogging() {
	console.log('Logs: ');

	console.log(logs.join('\n'));

	console.log(' ---------------------------------------------------- ');

	const indentation = '          ';

	console.log(`Errors: \n${indentation}- ${errors.join(`\n${indentation}- `)}`);
}

export function addLog(message: string, src: number = 1) {
	if (src == 1) {
		logs.push(colors.cyan('   ' + message));
	}
	else if (src == 1) {
		logs.push(colors.green('   ' + message));
	}
	else if (src == 2) {
		logs.push(colors.blue('   ' + message));
	}
	else if (src == 3) {
		logs.push(colors.rainbow('   ' + message));
	}
	else {
		logs.push(colors.red('   ' + message));
	}
}

export function addError(error: string) {
	errors.push(colors.red(error));
}

export function l(arg1: any, lbe: string = 'LBE') {
	console.log('                ');
	console.log('                ');
	console.log('                ');
	console.log('                ');
	console.log(`[${lbe}]: `, arg1);
}