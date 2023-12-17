import { parsePage } from './parsers/page';

(async () => {

    console.clear();

    const target = 'login';

    console.log('Final output: ', parsePage(target));

})();