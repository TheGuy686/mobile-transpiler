import { addLog, addError } from '../../classes/logger';
import regexes, { isNewLine, processFuncBlock, processLineSyntaxErrors } from '../../classes/globals';

const fs = require('fs');

const REGS: any = {
	// all the component regexes
    IS_HOOKS: /\s*Hooks\s*\s*{/,
};

export default class HooksParser {
	public static parseHooks(input: string) {
        const lines: string[] = input.split('\n');
        let result: any = {};
    
        let state: any = {
            currentEvent: null,
            isHooks: false
        };
    
        let lineNumber = 0;

        while (lines.length > 0) {
            lineNumber++;
    
            const line: string = `${lines.shift()}`;
    
            const tl: string = line.trim();
    
            if (!tl || tl == ' ' || tl == '' || isNewLine(tl)) continue;

            if (REGS.IS_HOOKS.test(tl)) {
                state.currentEvent = {};
                state.isHooks = true;
            }
            else if (regexes.IS_ONELINE_FUNC_PROP.test(tl)) {
                const matches = tl.match(regexes.IS_ONELINE_FUNC_PROP);
                state.currentEvent[`${matches?.[1]}`] = `() {${matches?.[3]})`;
                addLog(`Got func oneline type assignment "${`${matches?.[1]}`}:${matches?.[3]}"`, 1);
            }
            else if (regexes.IS_FUNC_PROP.test(tl)) {
                const matches = tl.match(regexes.IS_FUNC_PROP);
                state.currentEvent[`${matches?.[1]}`] = processFuncBlock(`(${matches?.[2]}) {`, lines, lineNumber);
                addLog(`Got func type assignment "${`${matches?.[1]}`}:${state.currentEvent[`${matches?.[1]}`]}"`, 1);
            }
            else if (tl === '}') {
                // console.log(state.currentEvent);
                // console.log('End of the hooks');
                result = state.currentEvent;
            }
            else {
                addError(`There was an unsupported format "${processLineSyntaxErrors(tl) || tl}" at line "${lineNumber}"`);
            }
        }
    
        return result;
    }

	// ${fileName}/hooks.ez
	static run(pagePath: string): any {
        const path = `${pagePath}/hooks.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "hooks.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parseHooks(fileCont);
	}
}