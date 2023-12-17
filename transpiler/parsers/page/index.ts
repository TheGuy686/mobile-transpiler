import { addLog, outputLogging, addError } from '../../classes/logger';

import PagePrarser from '../page';
import EventsPrarser from '../events';
import PropsPrarser from '../props';
import HooksPrarser from '../hooks';
import WatchersPrarser from '../watchers';

const fs = require('fs');

const COMPS: any = {
	'Page': {
		name: 'Page',
		props: {
			'id': '',
			'padding': '',
			'something': '',
			'blabla': ''
		}
	},
	'Image': {
		name: 'Image',
		props: {
			'id': '',
			'source': '',
		}
	},
	'Button': {
		name: 'Button',
		props: {
			'id': ''
		}
	},
	'Text': {
		name: 'Text',
		props: {
			'id': ''
		}
	},
	'Column': {
		name: 'Column',
		props: {
			'id': ''
		}
	},
	'Row': {
		name: 'Row',
		props: {
			'id': ''
		}
	}
};

export function parsePage(pagePath: string) {
    let page     = {}, 
        events   = {}, 
        props    = {}, 
        hooks    = {}, 
        watchers = {};
    
    try {
        page = PagePrarser.run(pagePath);
    }
    catch (err) {
        outputLogging();
        console.log(`There was an error parsing your page `, err);
        process.exit(1);
    }

    try {
        events = EventsPrarser.run(pagePath);
    }
    catch (err) {
        outputLogging();
        console.log(`There was an error parsing your events `, err);
        process.exit(1);
    }

    try {
        props = PropsPrarser.run(pagePath);
    }
    catch (err) {
        outputLogging();
        console.log(`There was an error parsing your props `, err);
        process.exit(1);
    }

    try {
        hooks = HooksPrarser.run(pagePath);
    }
    catch (err) {
        outputLogging();
        console.log(`There was an error parsing your hooks `, err);
        process.exit(1);
    }

    try {
        watchers = WatchersPrarser.run(pagePath);
    }
    catch (err) {
        outputLogging();
        console.log(`There was an error parsing your watchers `, err);
        process.exit(1);
    }

    console.log('Final output: ', {
        page, events, props, hooks, watchers
    });
}

export default class Parser {
	public static parse(componentCode: string): any {
		let lines: any = componentCode.split('\n');
		let stack: any = [];
		let result: any = {};

		let codeBlock = '', tmpProp;

		for (let line of lines) {
			let trimmedLine: string = line.trim();

			if (trimmedLine.startsWith('{')) {
				let component: any = {
					component: stack.pop(),
					props: [],
					children: []
				};

				let parentComponent = stack[stack.length - 1];

				if (parentComponent && Array.isArray(parentComponent.children)) {
					parentComponent.children.push(component);
				}
				else {
					result = component;
				}

				stack.push(component);
			} 
			else if (trimmedLine.startsWith('}') && !codeBlock) {
				stack.pop();
			} 
			else if (/\s*?[a-zA-Z]+\s*?:\s*\{.*?/.test(trimmedLine)) {
				codeBlock = `${trimmedLine}\n`;
				let [propertyName, value] = trimmedLine.split(':').map((part: any) => part.trim());
				tmpProp = {
					name: propertyName,
					type: 'string',
					value: [ { type: 'assignment', value: '' } ]
				}
			}
			else if (codeBlock) {
				codeBlock += `${trimmedLine}\n`;
				
				if (trimmedLine.startsWith('}')) {
					let currentComponent = stack[stack.length - 1];

					tmpProp.value[0].value = codeBlock;

					currentComponent.props.push({...tmpProp});

					codeBlock = '';
					tmpProp = null;
				}
			}
			else if (trimmedLine.includes(':')) {
				let [propertyName, value] = trimmedLine.split(':').map((part: any) => part.trim());
				let currentComponent = stack[stack.length - 1];

				let prop = {
					name: propertyName,
					type: 'string',
					value: [{ type: 'assignment', value }]
				};
				currentComponent.props.push(prop);
			} 
			else if (trimmedLine) {
				let component: any = {
					component: trimmedLine.replace(/^\s*/, '').trim().replace(/\s*{/, ''),
					props: [],
					children: []
				};

				let parentComponent = stack[stack.length - 1];

				if (parentComponent && Array.isArray(parentComponent.children)) {
					parentComponent.children.push(component);
				} 
				else {
					result = component;
				}

				stack.push(component);
			}
		}

		return result;
	}

	static run(pagePath: string): any {
		const path = `${pagePath}/page.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "page.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parse(fileCont);
	}
}