import Parser from '.';
import { outputLogging } from '../../classes/logger';

const input = `

Hooks {
    beforeCreate: () {
        if (true) {
            console.log('going to there');
        }
        else if (true == true) {
            console.log('getting to there');
        }
    }
    beforeEnter: () { true }
    beforeLeave: () {
        switch (true) {
            case 'one': // do something 
                break;

            case 'two': this.doSomthing();
            default: 
                this.isDefault();
        }
    }
    loaded: () {
        this.isJustGreat();
    }
}
`;


console.clear();
const pes = Parser.parseHooks(input);
// console.log(JSON.stringify(pes, null, 2));

outputLogging();
console.log(pes);