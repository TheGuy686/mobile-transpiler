import { addLog, addError } from '../../classes/logger';
import regexes, { isNewLine, processFuncBlock, processLineSyntaxErrors } from '../../classes/globals';

const fs = require('fs');

const REGS: any = {
	// all the component regexes
    IS_WATCHER: /\s*Watcher\s*\s*{/,

    IS_TARGET: /\s*target\s*:\s*([a-zA-Z0-9_\.$]+)\s*/,
    IS_SIMPLE_PROP_CUS_CONST: /\s*([a-zA-Z]+)\s*:\s*([a-zA-Z0-9_]+)\s*/,
};

const VALID_WATCHER_HOOKS: any = {
    beforeChange: {},
    onChange: {},
    afterChange: {},
};

export default class HooksParser {
	public static parse(input: string) {
        const lines: string[] = input.split('\n');
        let result: any = { private: {}, public: {} };
    
        let state: any = {
            currentSection: null,
            currentEvent: null,
            isWatcher: false,
            isPrivateScope: false,
            watcherTarget: '',
        };
    
        let lineNumber = 0;

        mainLoop: while (lines.length > 0) {
            lineNumber++;
    
            const line: string = `${lines.shift()}`;
    
            const tl: string = line.trim();

            if (!tl || tl == ' ' || tl == '' || isNewLine(tl)) continue;

            if (REGS.IS_WATCHER.test(tl)) {
                state.currentEvent = {};
                state.isWatcher = true;
            }
            else if (REGS.IS_TARGET.test(tl)) {
                const matches = tl.match(REGS.IS_TARGET);

                const target = (matches?.[1] ?? '').trim().replace(/^[ ]+/g, '');

                let scope;

                if (/\$([a-z]+)\.(.*?)$/.test(target)) {
                    let matches = target.match(/\$([a-z]+)\.(.*?)$/);

                    if (!matches) {
                        addError(`Prop name was not valid "${tl}" at line "${lineNumber}"`);
                        break mainLoop;
                    }

                    scope = matches[1].trim().replace(/^[ ]+/, '');

                    state.watcherTarget = matches[2];

                    if (scope == 'private') {
                        state.isPrivateScope = true;
                    }
                    else if (scope == 'public') {
                        state.isPrivateScope = false;
                    }
                    else {
                        addError(`Invalid prop scope "${scope}". Expected "$public, $private" or just the prop target without a scope ($public is default) at line "${lineNumber}"`);
                        break mainLoop;
                    }
                }
                // here we always default to the public scope
                else {
                    scope = 'public';
                    state.isPrivateScope = false;
                    state.watcherTarget = target;
                }

                if (!state.watcherTarget || state.watcherTarget == '') {
                    addError(`"target" was not successfully parsed. "${tl}" at line "${lineNumber}"`);
                    break mainLoop;
                }

                if (typeof result[scope][state.watcherTarget] != 'undefined') {
                    addError(`"$${scope}.${state.watcherTarget}" already existed. Please use the same watcher for each target. "${tl}" at line "${lineNumber}"`);
                    break mainLoop;
                }

                addLog(`Got a watcher target "${state.watcherTarget}"`, 2);
            }
            // parse any "prop: true" (bool types) syntax props
            else if (REGS.IS_SIMPLE_PROP_CUS_CONST.test(tl)) {
                const matches = tl.match(REGS.IS_SIMPLE_PROP_CUS_CONST);
                state.currentEvent[`${matches?.[1]}`] = matches?.[2];
                addLog(`Got simple prop custom const syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 1);
            }
            else if (regexes.IS_ONELINE_FUNC_PROP.test(tl)) {
                const matches = tl.match(regexes.IS_ONELINE_FUNC_PROP);
                state.currentEvent[`${matches?.[1]}`] = `() {${matches?.[3]})`;
                addLog(`Got func oneline type assignment "${`${matches?.[1]}`}:${matches?.[3]}"`, 1);
            }
            else if (regexes.IS_FUNC_PROP.test(tl)) {
                const matches = tl.match(regexes.IS_FUNC_PROP);
                const prop = `${matches?.[1] ?? ''}`;

                if (prop == '' || !prop) {
                    addError(`Prop name was not valid "${tl}" at line "${lineNumber}"`);
                    break mainLoop;
                }

                if (typeof VALID_WATCHER_HOOKS[prop] == 'undefined') {
                    addError(`Watcher event hook was not a valid hook. Got "${prop}", expected one of the following "${Object.keys(VALID_WATCHER_HOOKS).join(', ')}" at line "${lineNumber}"`);
                    break mainLoop;
                }

                state.currentEvent[prop] = processFuncBlock(`(${matches?.[2]}) {`, lines, lineNumber);

                addLog(`Got func type assignment "${`${matches?.[1]}`}:${state.currentEvent[`${matches?.[1]}`]}"`, 1);
            }
            else if (tl === '}') {
                if (state.isWatcher) {
                    result[`${state.isPrivateScope ? 'private' : 'public'}`][`${state.watcherTarget}`] = { ...state.currentEvent };
                    state.currentEvent = null;
                    state.watcherTarget = '';
                    state.isPrivateScope = false;
                }
            }
            else {
                addError(`There was an unsupported format "${processLineSyntaxErrors(tl) || tl}" at line "${lineNumber}"`);
            }
        }
    
        return result;
    }

	static run(pagePath: string): any {
        const path = `${pagePath}/watchers.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "hooks.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parse(fileCont);
	}
}