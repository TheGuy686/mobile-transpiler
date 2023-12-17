import regexes, { isNewLine, processFuncBlock, processLineSyntaxErrors } from '../../classes/globals';
import { addLog, addError } from '../../classes/logger';

const fs = require('fs');

const REGS: any = {
	IS_GLOBAL: /\s*Globals\s*\s*{/,
	IS_EVENTS: /\s*Events\s*{/,
	IS_EVENT: /\s*Event\s*{/,
	IS_NAME: /\s*name\s*:\s*([a-zA-Z0-9_]+)\s*/,
	IS_TARGET: /\s*target\s*:\s*([a-zA-Z0-9_]+)\s*/,
	// condition: ('|"|`")hello there how are you('|"|`")
	IS_SIMPLE_PROP_QUOTE: /\s*([a-zA-Z]+)\s*:\s*(['|"|`]{1}.*['|"|`]{1})\s*/,
	// camelCase_09: camelCase_09
	IS_SIMPLE_PROP_CUS_CONST: /\s*([a-zA-Z]+)\s*:\s*([a-zA-Z0-9_]+)\s*/,
	IS_SIMPLE_PROP_BOOL: /\s*([a-zA-Z]+)\s*:\s*(true|false)\s*/,
};

export default class EventsParser {
    private static parseGlobalTagBody(tl: string, lines: string[], state: any, lineNumber: number, logLbe: string) {
        if (REGS.IS_EVENT.test(tl)) {
            addLog(`${logLbe}Got an Event`, 1);
            state.currentEvent = {};
            state.eventName = '';
            addLog(`${logLbe}Reset event name to empty string from "IS_EVENT"`, 1);
        }
        // first we need to parse the name of the event
        else if (REGS.IS_NAME.test(tl)) {
            const matches = tl.match(REGS.IS_NAME);
            state.eventName = matches?.[1] ?? '';
            addLog(`${logLbe}Got an event name "${state.eventName}"`, 1);
        }
        // parse any "prop: '...'" syntax props
        else if (REGS.IS_SIMPLE_PROP_QUOTE.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_QUOTE);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 1);
        }
        // parse any "prop: camelCase_019" syntax props
        // else if (REGS.IS_SIMPLE_PROP_QUOTE.test(tl)) {
        // 	const matches = tl.match(REGS.IS_SIMPLE_PROP_QUOTE);
        // 	currentEvent[`${matches?.[1]}`] = matches?.[2];
        // 	addLog(`${logLbe}Got simple prop syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, true);
        // }
        // parse any "prop: true" (bool types) syntax props
        else if (REGS.IS_SIMPLE_PROP_BOOL.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_BOOL);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop bool syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 1);
        }
        // parse any "prop: () { ... }" (bool types) syntax props
        else if (regexes.IS_FUNC_PROP.test(tl)) {
            const matches = tl.match(regexes.IS_FUNC_PROP);
            state.currentEvent[`${matches?.[1]}`] = processFuncBlock(`(${matches?.[2]}) {`, lines, lineNumber);
            addLog(`${logLbe}Got func type assignment "${`${matches?.[1]}`}:${state.currentEvent[`${matches?.[1]}`]}"`, 1);
        }
        // parse any "prop: true" (bool types) syntax props
        else if (REGS.IS_SIMPLE_PROP_CUS_CONST.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_CUS_CONST);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop custom const syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 1);
        }
        // add the current event to the currently editing section
        else if (tl === '}') {
            // this should be the end of a component
            if (state.currentEvent == null && state.eventName == '') {
                addLog(`${logLbe}Reset event name to empty string from "Closing tag"`, 1);
                state.isGlobal = false;
                return;
            }
    
            // the ending tag of an event
            if (state.eventName != '') {
                // here we need to set the inital event to an object if not already set
                if (typeof state.currentSection[state.eventName] == 'undefined') {
                    state.currentSection[state.eventName] = { ...state.currentEvent, message: 'from set evt to obj only' }
                }
                // if there is alredy more than one event then just append to the current array
                else if (Array.isArray(state.currentSection[state.eventName])) {
                    state.currentSection[state.eventName].push({ ...state.currentEvent, message: 'added to the already existing array' });
                }
                // if an event with the same name alredy exists then we need to cache the object and
                // then reset to an array as there is now more events with that name to append to
                else {
                    const obj = {...state.currentSection[state.eventName], messgae: 'copied currenly existing event'};
    
                    state.currentSection[state.eventName] = [
                        obj,
                        { ...state.currentEvent },
                        { message: 'merged the old event and the new event to an array' }
                    ];
                }
    
                addLog(`${logLbe}Set event "${state.eventName}" and then reset`, 1);
                state.eventName = '';
            }
            else {
                addLog(`${logLbe}Closing Tag`, 1);
            }
    
            addLog(`${logLbe}Set currentEvent to null`, 1);
            state.currentEvent = null;
        }
        else {
            addError(`There was an unsupported format "${processLineSyntaxErrors(tl) || tl}" at line "${lineNumber}"`);
        }
    }

    private static parseEventsTagBody(tl: string, lines: string[], state: any, lineNumber: number, logLbe: string, results: any) {
        // first we need to parse the name of the event
        if (REGS.IS_TARGET.test(tl)) {
            const matches = tl.match(REGS.IS_TARGET);
            state.eventTarget = matches?.[1] ?? '';
            addLog(`${logLbe}Got an event target "${state.eventTarget}"`, 2);
            // the bug below comes from here but if doesn't work if i get rid of this
            state.currentSection[state.eventTarget] = {};
        }
        // first we need to parse the name of the event
        else if (REGS.IS_NAME.test(tl)) {
            const matches = tl.match(REGS.IS_NAME);
            state.eventName = matches?.[1] ?? '';
            addLog(`${logLbe}Got an event name "${state.eventName}"`, 2);
        }
        // parse any "prop: '...'" syntax props
        else if (REGS.IS_SIMPLE_PROP_QUOTE.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_QUOTE);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 2);
        }
        // parse any "prop: camelCase_019" syntax props
        // else if (REGS.IS_SIMPLE_PROP_QUOTE.test(tl)) {
        // 	const matches = tl.match(REGS.IS_SIMPLE_PROP_QUOTE);
        // 	currentEvent[`${matches?.[1]}`] = matches?.[2];
        // 	addLog(`${logLbe}Got simple prop syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, true);
        // }
        // parse any "prop: true" (bool types) syntax props
        else if (REGS.IS_SIMPLE_PROP_BOOL.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_BOOL);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop bool syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 2);
        }
        // parse any "prop: () { ... }" (bool types) syntax props
        else if (regexes.IS_FUNC_PROP.test(tl)) {
            const matches = tl.match(regexes.IS_FUNC_PROP);
            state.currentEvent[`${matches?.[1]}`] = processFuncBlock(`(${matches?.[2]}) {`, lines, lineNumber);
            addLog(`${logLbe}Got func type assignment "${`${matches?.[1]}`}:${state.currentEvent[`${matches?.[1]}`]}"`, 2);
        }
        // parse any "prop: true" (bool types) syntax props
        else if (REGS.IS_SIMPLE_PROP_CUS_CONST.test(tl)) {
            const matches = tl.match(REGS.IS_SIMPLE_PROP_CUS_CONST);
            state.currentEvent[`${matches?.[1]}`] = matches?.[2];
            addLog(`${logLbe}Got simple prop custom const syntax "${`${matches?.[1]}`}:${matches?.[2]}"`, 2);
        }
        else if (tl === '}') {
            // we can only set the array of events to link up to a UI element as and when 
            // there is a "target" (the UI id prop) set for us to target
            if (!state.eventTarget || state.eventTarget == '') {
                addError(`${logLbe}Can't set an array of events without a valid "target" defined`);
            }
            else {
                // this will catch the ending tag of an event
                if (state.eventName != '') {
                    if (!state.currentEventGroup[state.eventName]) {
                        state.currentEventGroup[state.eventName] = [];
                    }
    
                    if (state.currentEvent) {
                        state.currentEventGroup[state.eventName].push({...state.currentEvent});
                    }
                    
                    state.eventName = '';
                }
                else {
                    addLog(`${logLbe}Closing Tag "${state.eventName}"`, 3);
    
                    // This is a hack. Get Rolf and the magic debugger to fix this. I can seem to 
                    // find where it is coming from
                    if (typeof state.currentSection[state.eventTarget] != 'undefined') {
                        delete state.currentSection[state.eventTarget];
                    }
    
                    results.handlers[state.eventTarget] = {...state.currentSection};
                }
            }
        }
    }

	public static parseEvents(input: string) {
        const lines: string[] = input.split('\n');
        const result: any = { global: {}, handlers: {} };
    
        let state: any = {
            currentSection: null,
            currentEvent: null,
            currentEventGroup: null,
            eventName: '',
            eventTarget: '',
            targetUiElement: '',
            isGlobal: false,
        };
    
        let lineNumber = 0;
    
        while (lines.length > 0) {
            lineNumber++;
    
            const line: string = `${lines.shift()}`;
    
            const tl: string = line.trim();
    
            if (!tl || tl == ' ' || tl == '' || isNewLine(tl)) continue;
    
            const logLbe = `${state.isGlobal ? 'Globals -> ' : state.isEvents ? `Events->${state.targetUiElement}` : ''}`;
    
            // if (isEvents) console.log(`Line: "${line}"`);
    
            // the target object / source should all be assigned at the top of the if 
            // to make sure that this is the first thing that is evaluated
            if (REGS.IS_GLOBAL.test(tl)) {
                state.currentSection = result.global;
                state.isGlobal = true;
    
                addLog(`${logLbe}Opened up tags from "IS_GLOBAL"`, 0);
            }
            else if (REGS.IS_EVENTS.test(tl)) {
                state.currentEventGroup = {};
                state.currentEvent = {};
    
                state.currentSection = state.currentEventGroup;
    
                state.isEvents = true;
    
                addLog(`${logLbe}Opened up tags from "IS_EVENTS"`, 0);
            }
            else if (state.isGlobal) {
                this.parseGlobalTagBody(tl, lines, state, lineNumber, logLbe);
            }
            else if (state.isEvents) {
                this.parseEventsTagBody(tl, lines, state, lineNumber, logLbe, result);
            }
        }
    
        return result;
    }

	// ${fileName}/events.ez
	static run(pagePath: string): any {
        const path = `${pagePath}/events.ez`;

        if (!fs.existsSync(path)) {
            addError(`No "events.ez" existed at "${path}"`);
            return;
        }

		const fileCont = fs.readFileSync(path).toString();

		return this.parseEvents(fileCont);
	}
}