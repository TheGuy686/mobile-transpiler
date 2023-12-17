import { addLog, addError, outputLogging } from '../../classes/logger';
import { parsePage } from '../page';

import ParseApp from '../app';

const YAML = require('yaml');
const fs = require('fs');

export default class ProjectParser {

    public static parse(projectPath: string) {
        const ezzConfig = `${projectPath}/eezze-config.json`,
              themeYml = `${projectPath}/src/theme.yml`,
              pagesDir = `${projectPath}/src/pages`;

        let config, theme, app, pages: any = {};

        if (!fs.existsSync(ezzConfig)) {
            addError(`"${ezzConfig}" didn't exist`);
            return;
        }

        let cont;

        try {
            cont = fs.readFileSync(ezzConfig).toString();
            config = JSON.parse(cont);
        }
        catch (err) {
            addError(`The given Eezze config was not valid JSON "${ezzConfig}", Got "${cont}"`);
            return;
        }

        // here we need to load in the users theme.yml
        if (fs.existsSync(themeYml)) {
            // first load in the users theme yaml content
            try {
                cont = fs.readFileSync(themeYml).toString();
                theme = YAML.parse(cont);
            }
            catch (err) {
                addError(`The given Eezze config was not valid YAML "${themeYml}", Got "${cont}"`);
                return;
            }

            // then we need to merge / override the styles in the default to the user defined styles
            // @Note: This is something we can do later as this is too much for now. we'll just ship 
            //        a full file with all the defaults in the main theme.yml and we'll take all the
            //        styles from that for now.
            // try {
            //     cont = fs.readFileSync(`${__dirname}/../../classes/defaults/theme.yml`).toString();
            //     theme = YAML.parse(cont);
            // }
            // catch (err) {
            //     addError(`The given Eezze config was not valid YAML "${themeYml}", Got "${cont}"`);
            //     return;
            // }
        }

        // first we need to get all the pages into an object
        // Only need to loop over the pages if the dir exists
        if (fs.existsSync(pagesDir)) {
            const files = fs.readdirSync(pagesDir, { withFileTypes: true });

            files.forEach((file: any) => {
                const fp = `${pagesDir}/${file.name}`;

                try {
                    const page = parsePage(fp);

                    pages[file.name] = pages;
                }
                catch (err) {
                    outputLogging();
                    console.log(`There was an error parsing the page "${file.name}" `, err);
                    process.exit(1);
                }
            });
        }

        // then we need to parse the app file to determine what type of application to generate
        try {
            app = ParseApp.run(projectPath);

            app.pages = pages;
        }
        catch (err) {
            outputLogging();
            console.log(`There was an error parsing the app.ez `, err);
            process.exit();
        }

        return {
            config, theme, app, 
        }
    }
}