import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const giPath = path.resolve(__dirname, 'gi.json');
const projectSrcPath = path.resolve(__dirname, '../src');

const giData = JSON.parse(fs.readFileSync(giPath, 'utf8'));

// --- Logic copied from gi-analyzer-all.js ---

const serviceToDirectoryMap = {
    'Drive': 'driveapp',
    'Document': 'documentapp',
    'Spreadsheet': 'spreadsheetapp',
    'Slides': 'slidesapp',
    'Forms': 'formapp',
    'Calendar': 'calendarapp',
    'Gmail': 'gmailapp',
    'Mail': 'mailapp',
    'Base': 'base',
    'Cache': 'cache',
    'Charts': 'charts',
    'Content': 'content',
    'HTML': 'html',
    'Lock': 'lock',
    'Properties': 'properties',
    'Script': 'script',
    'Utilities': 'utilities',
    'URL Fetch': 'urlfetchapp',
    'JDBC': 'jdbc',
    'XML': 'xmlservice',
};

const classSynonyms = {
    'Body': ['containerelement', 'element'],
    'Paragraph': ['containerelement', 'element'],
    'ListItem': ['containerelement', 'element'],
    'Table': ['containerelement', 'element'],
    'TableRow': ['containerelement', 'element'],
    'TableCell': ['containerelement', 'element'],
    'Text': ['element'],
    'InlineImage': ['element'],
    'File': ['fakebasefile', 'fakebaseitem'],
    'Folder': ['fakebasefile', 'fakebaseitem'],
    'User': ['fakeuser'],
    'PageBreak': ['element'],
    'HorizontalRule': ['element'],
    'Footnote': ['containerelement', 'element'],
    'HeaderSection': ['containerelement', 'element'],
    'FooterSection': ['containerelement', 'element'],
    'FootnoteSection': ['containerelement', 'element'],
    'ContainerElement': ['element'],
    'SectionElement': ['element'],
};

const classToFileMap = {
    'Blob': 'utilities/fakeblob.js',
    'User': 'common/fakeuser.js',
    'Session': 'session/fakesession.js',
    'Logger': 'logger/fakelogger.js',
    'Properties': 'stores/fakestores.js',
    'Cache': 'stores/fakestores.js',
    'PropertiesService': 'stores/fakestores.js',
    'CacheService': 'stores/fakestores.js',
    'ScriptApp': 'scriptapp/app.js',
    'DriveApp': 'driveapp/fakedriveapp.js'
};

// --- Analysis Logic ---

console.log('Analyzing file naming conventions...\n');
const anomalies = [];

for (const service of giData) {
    const serviceName = service.serviceName;
    const serviceDirectory = serviceToDirectoryMap[serviceName] || serviceName.toLowerCase();

    for (const classData of service.classes) {
        const className = classData.className;
        let fileFound = false;

        if (classToFileMap[className]) {
            fileFound = true; // Assume explicit maps are correct
        } else {
            const possibleFileNames = [
                `fake${className.toLowerCase()}.js`,
                `fake${serviceName.toLowerCase()}${className.toLowerCase()}.js`,
                `${className.toLowerCase()}.js`,
                'app.js',
            ];

            const synonyms = classSynonyms[className] || [];
            synonyms.forEach(s => possibleFileNames.push(`fake${s}.js`));

            for (const fileName of possibleFileNames) {
                const filePath = path.join(projectSrcPath, 'services', serviceDirectory, fileName);
                if (fs.existsSync(filePath)) {
                    fileFound = true;
                    break;
                }
            }
        }

        if (!fileFound) {
            anomalies.push(`- [${serviceName}.${className}]: No matching file found. Expected names like 'fake${className.toLowerCase()}.js' or 'fake${serviceName.toLowerCase()}${className.toLowerCase()}.js' in '${serviceDirectory}'.`);
        }
    }
}

if (anomalies.length > 0) {
    console.log('Potential Naming Anomalies Found:\n');
    console.log(anomalies.join('\n'));
} else {
    console.log('No file naming anomalies found based on current logic.');
}

console.log('\nAnalysis complete.');


