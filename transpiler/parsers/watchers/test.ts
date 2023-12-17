import Parser from '.';
import { outputLogging } from '../../classes/logger';

const input = `Watcher {
    target: $private.prop1
    
    beforeChange: () {
        console.log('hello ther from 1');
    }
}

Watcher {
    target: $private.prop12
    
    onChange: () {
        console.log('hello ther from 2');
    }
}

Watcher {
    target: $private.prop2
    
    onChange: () {
        console.log('hello ther from 3');
    }
}

Watcher {
    target: $public.prop2
    
    afterChange: () {
        console.log('hello ther from 4');
    }
}

Watcher {
    target: $public.ryansProp2
    
    afterChange: () {
        console.log('hello ther from 4');
    }
}

Watcher {
    target: ryansProp
    
    onChange: () {
        console.log('hello ther from 5');
    }
}`;


console.clear();
const pes = Parser.parse(input);
// console.log(JSON.stringify(pes, null, 2));

outputLogging();
console.log(pes);