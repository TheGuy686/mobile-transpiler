import { addLog, addError } from '../../classes/logger';
import regexes, { isNewLine } from '../../classes/globals';

const fs = require('fs');

const REGS: any = {
	// all the component regexes
    IS_PRIVATE: /\s*Private\s*\s*{/,
    IS_PUBLIC: /\s*Public\s*\s*{/,
    IS_COMPUTED: /\s*Computed\s*\s*{/,
};

export default class PropsParser {

    private static parsePrivateTagBody(tl: string, lines: string[], state: any, lineNumber: number, logLbe: string, results: any) {
        if (true) {

        }
        else if (tl === '}') {
        }
    }

    private static parsePublicTagBody(tl: string, lines: string[], state: any, lineNumber: number, logLbe: string, results: any) {
        if (true) {
            
        }
        else if (tl === '}') {
        }
    }

    private static parseComputedTagBody(tl: string, lines: string[], state: any, lineNumber: number, logLbe: string, results: any) {
        if (true) {
            
        }
        else if (tl === '}') {
        }
    }

	public static parse(input: string) {
        const lines: string[] = input.split('\n');
        const result: any = { dict: [], private: {}, public: {}, computed: {} };
    
        let state: any = {
            currentEvent: null,
            isPrivate: false,
            isPublic: false,
            isComputed: false,
        };
    
        let lineNumber = 0;

        while (lines.length > 0) {
            lineNumber++;
    
            const line: string = `${lines.shift()}`;
    
            const tl: string = line.trim();
    
            if (!tl || tl == ' ' || tl == '' || isNewLine(tl)) continue;
    
            const logLbe = `${
                state.isPrivate ? 'Private -> ' : 
                    state.isPublic ? `Public->${state.targetUiElement}`:
                        state.isComputed ? `Computed->${state.targetUiElement}`
                : ''}`;
    
            if (REGS.IS_PRIVATE.test(tl)) {
                state.isPrivate = true;
            }
            else if (REGS.IS_PUBLIC.test(tl)) {
                state.isPublic = true;
            }
            else if (REGS.IS_COMPUTED.test(tl)) {
                state.isComputed = true;
            }
        }
    
        return result;
    }

	// ${fileName}/page.ez
	static run(pagePath: string): any {
        const path = `${pagePath}/props.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "props.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parse(fileCont);
	}
}