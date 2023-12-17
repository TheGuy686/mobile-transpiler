const j = require('jscodeshift');

const regexes: any = {
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
	IS_FUNC_PROP: /\s*([a-zA-Z0-9_]+)\s*:\s*\(\s*([^)]*)\s*\)\s*{/,
    IS_ONELINE_FUNC_PROP: /\s*([a-zA-Z0-9_]+)\s*:\s*\(\s*([^)]*)\s*\)\s*{(.*)\}$/,

    // array propName: [ ... ]
    IS_ARRAY: /array\s*?([a-zA-Z0-9_]+)\s*?:\s*?\[/gm,

    // object propName: { ... }
    IS_OBJECT: /object\s*?([a-zA-Z0-9_]+)\s*?:\s*?\[/gm,

	// function block parser regs
	IS_CONDITION_STMT: /\s*{\s*/,
	HAS_OPEN_BRACKET: /\s*?{\s*?/,
	HAS_CLOSING_BRACKET: /\s*?}\s*?/,
	HAS_COMMENT: /\s*(['|"|`]{1}.*['|"|`]{1})\s*/,
	IS_COMMENT: /^\/\//
};

const COMMON_SYNTAX_ERRORS: any = {
	ARROW_FUNC: {
        pattern: /\s*?\(.*?\)\s*?=>\s*?/,
        messgae: `Arrow functions are not supported at "$1"`
    },
	NONE_ASIGN_FUNC: {
        pattern: /\s*([a-zA-Z]+)\s*\(\s*([^)]*)\s*\)\s*{/,
        messgae: `Function assignments must "use name: () { ... }" syntax at "$1"`
    }
};

export function js2dart(jsCode: string) {
    try {
        return j(jsCode)
            .find(j.CallExpression, {
                callee: {
                    name: 'console.log',
                },
            })
            .replaceWith((node: any) =>
                j.expressionStatement(
                    j.callExpression(
                        j.memberExpression(
                            j.identifier('print'),
                            j.identifier('call'),
                        ),
                        [j.stringLiteral(node.value.arguments[0].value)],
                    ),
                ),
            )
            .toSource();
    }
    catch (err) {
        console.log(err);
        return `conversion error`;
    }
}

export function processLineSyntaxErrors(line: string) {
    for (let k in COMMON_SYNTAX_ERRORS) {
        const ce = COMMON_SYNTAX_ERRORS[k];
        if (ce.pattern.test(line)) return ce.messgae.replace('$1', line);
    }
}

export default regexes;

export function kebabCase(str: string) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase(); // Convert to lowercase
}

export function isNewLine(str: string) { return /^[\r\n]+$/.test(str); }

export function stripNewLine(str: string) { return str.replace(/^[\r\n]+$/, '') }

export function processFuncBlock(str: string, lines: string[], lineNumber: number) {
    let parsing = false;

    processFuncBlock: while (lines.length > 0) {
        const l: string = `${lines.shift()?.trim()}`;
        lineNumber = lineNumber + 1;

        if (regexes.HAS_COMMENT.test(l)) {
            str += `${l.replace(/;$/, '')};`;
        }
        else if (regexes.IS_COMMENT.test(l)) {
            continue;
        }
        else if (regexes.HAS_OPEN_BRACKET.test(l)) {
            parsing = true;
            str += `${l}`;
        }
        else if (regexes.HAS_CLOSING_BRACKET.test(l)) {
            str += `${l.replace(/;$/, '')}`;

            // this should break out main loop when we find
            // a } should get the main prop func block
            if (!parsing) break processFuncBlock;
            else parsing = false;
        }
        else str += `${stripNewLine(l.trim().replace(/;$/, ''))};`;
    }

    return str.trim()
               .replace(/;;/g, ';')
               .replace(/{;}/g, '{}')
               .replace(/{;/g, '{')
               .replace(/:;/g, ':')
               .replace(/};/g, '}');
}