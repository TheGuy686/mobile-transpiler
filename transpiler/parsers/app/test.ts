import Parser from '.';
import { outputLogging } from '../../classes/logger';

const input = `

AuthApp {
    splash: Splash,
    app: Home,
}

`;


console.clear();
const pes = Parser.parse(input);
// console.log(JSON.stringify(pes, null, 2));

outputLogging();
console.log(pes);