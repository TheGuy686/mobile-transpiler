import Parser from '.';
import { outputLogging } from '../../classes/logger';

const projectPath: string = `${__dirname}/../../../test-project`;

console.clear();
const pes = Parser.parse(projectPath);
// console.log(JSON.stringify(pes, null, 2));

outputLogging();
console.log('Project Result: ', pes);