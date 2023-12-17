import { addLog, addError } from '../../classes/logger';
import regexes, { isNewLine, kebabCase } from '../../classes/globals';

const fs = require('fs');

const REGS: any = {
    IS_APP: /\s*([A-Z]{1}[a-zA-Z]+)?App\s*\s*{/,
};

export default class HooksParser {
	public static parse(input: string) {
        const lines: string[] = input.split('\n');
        let result: any = {};
    
        let state: any = {
            type: 'basic',
            app: null,
            isApp: false
        };
    
        let lineNumber = 0;

        while (lines.length > 0) {
            lineNumber++;
    
            const line: string = `${lines.shift()}`, 
                  tl: string = line.trim();
    
            if (!tl || tl == ' ' || tl == '' || isNewLine(tl)) continue;

            if (REGS.IS_APP.test(tl)) {
                const matches = tl.match(REGS.IS_APP);
                state.app = {};
                state.isApp = true;

                if (matches?.[1]) {
                    state.type = `${kebabCase(matches?.[1])}-app`;
                }
            }
            else if (regexes.IS_SIMPLE_PROP_CUS_CONST.test(tl)) {
                const matches = tl.match(regexes.IS_SIMPLE_PROP_CUS_CONST);
                state.app[`${matches?.[1]}`] = matches?.[2];
                addLog(`Got simple prop custom const syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 1);
            }
            else if (tl === '}') {
                // console.log(state.currentEvent);
                // console.log('End of the hooks');
                result = state.app;
            }
            else {
                addError(`There was an unsupported format "${tl}" at line "${lineNumber}"`);
            }
        }

        result.type = state.type;
        result['pages'] = {};
    
        return result;
    }

	// ${projectPath}/src/app.ez
	static run(projectPath: string): any {
        const path = `${projectPath}/src/app.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "app.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parse(fileCont);
	}
}