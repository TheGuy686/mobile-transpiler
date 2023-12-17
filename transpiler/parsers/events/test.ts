import Parser from '.';
import { js2dart } from '../../classes/globals';
import { outputLogging } from '../../classes/logger';

const input = `

Globals {
    Event {
        name: userLoggedIn
        condition: () {
			if (true) {
				console.log('RYAN IF');
			}
			else console.log('RYAN ELSE');

            return true
        }
        do: (user: string, cooke: string, ryan: string) {
            console.log(\`DO Event 1\`);
        }
    }
    
    Event {
        name: anotherEvent
        condition: true
        do: (user: string, wesley: string) {
			if (true) console;
			else something
            console.log('DO Event 2');
        }
    }
}

Events {
    target: emailInput
    
    Event {
		name: ryansEvent
		condition: () {
			return text.includes('@')
		}
		do: (text4) {
			console.log(\`Email changed FROM RYAN: \${text}\`);
		}
	}

	Event {
		name: onTextChanged2
		condition: () {
			return text.includes('@')
		}
		do: (text2) {
			console.log(\`Email changed FROM RYAN: \${text}\`);
		}
	}
}

Events {
    target: emailInput2

	Event {
		name: onTextChanged
		condition: 'ran'
		do: (text1) {
			if (true) {
				console.log('hello 2')
	
				const math = 12 * 75
			}
			else if (true) {
				console.log('Ryan was here')
			}
		}
	}

	Event {
		name: onTextChanged
		condition: () {
			return text.includes('@Ryan');
		}
		do: (text3) {
			// a dance
		} 
	}
}
`;

console.clear();
const pes = Parser.parseEvents(input);
// console.log(JSON.stringify(pes, null, 2));

outputLogging();
console.log(pes);

console.log(`converting: pes['global']['anotherEvent']['do']`, pes['global']['anotherEvent']['do']);

console.log('OUTPUT: ', js2dart(`

const ryan = 'hello';

console.log(ryan);

`));
