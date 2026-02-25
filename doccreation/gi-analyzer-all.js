import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sheetRangeMakerPath = path.resolve(__dirname, '../src/services/spreadsheetapp/sheetrangemakers.js');
const { setterList, attrGetList, valuesGetList } = await import(sheetRangeMakerPath);

const utilsPath = path.resolve(__dirname, '../src/support/utils.js');
const { Utils } = await import(utilsPath);

const docEnumsPath = path.resolve(__dirname, '../src/services/enums/docsenums.js');
const { Attribute } = await import(docEnumsPath);

const dynamicSheetRangeMethods = new Map(); // methodName -> { specType, specIndex, specFile }
const dynamicDocMethods = new Map(); // methodName -> { specType, specIndex }

const docServiceClasses = new Set(['Body', 'Paragraph', 'ListItem', 'Table', 'TableRow', 'TableCell', 'Text', 'InlineImage', 'PageBreak', 'HorizontalRule', 'Footnote', 'HeaderSection', 'FooterSection', 'FootnoteSection', 'ContainerElement', 'SectionElement', 'RichLink']);

const giPath = path.resolve(__dirname, 'gi.json');
const projectPath = path.resolve(__dirname, '..');
const outputPath = path.resolve(__dirname, 'gi-fake-all.json');

const getMethodName = (methodString) => {
  const match = methodString.match(/(\w+)/);
  return match ? match[1] : null;
};

const getFilePaths = (dirPath, fileList = []) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (path.basename(filePath) !== 'node_modules') {
        getFilePaths(filePath, fileList);
      }
    } else if (filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const giData = JSON.parse(fs.readFileSync(giPath, 'utf8'));
const allJsFiles = getFilePaths(path.join(projectPath, 'src'));
const fileCache = new Map();
allJsFiles.forEach(file => fileCache.set(file, fs.readFileSync(file, 'utf8')));

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
  'File': ['drivemeta'],
  'Folder': ['drivemeta'],
  'FileIterator': ['iterator'],
  'FolderIterator': ['iterator'],
  'Paragraph': ['containerelement', 'element'],
  'ListItem': ['containerelement', 'element', 'paragraph'],
  'Table': ['containerelement', 'element'],
  'TableRow': ['containerelement', 'element'],
  'TableCell': ['containerelement', 'element'],
  'Text': ['element'],
  'InlineImage': ['element'],
  'CheckboxItem': ['formitem'],
  'DateItem': ['formitem'],
  'DateTimeItem': ['formitem'],
  'DurationItem': ['formitem'],
  'GridItem': ['formitem'],
  'ImageItem': ['formitem'],
  'MultipleChoiceItem': ['formitem'],
  'PageBreakItem': ['formitem'],
  'ParagraphTextItem': ['formitem'],
  'RatingItem': ['formitem'],
  'ScaleItem': ['formitem'],
  'SectionHeaderItem': ['formitem'],
  'TimeItem': ['formitem'],
  'VideoItem': ['formitem'],
  'CheckboxGridItem': ['formitem'],
  'FormResponse': ['itemresponse'],
  'PageBreak': ['element'],
  'HorizontalRule': ['element'],
  'Footnote': ['containerelement', 'element'],
  'HeaderSection': ['containerelement', 'element'],
  'FooterSection': ['containerelement', 'element'],
  'FootnoteSection': ['containerelement', 'element'],
  'ContainerElement': ['element'],
  'SectionElement': ['element'],
  'Range': ['range'],
  'RichTextValue': ['richtextvalue'],
  'TextStyle': ['textstyle'],
  'ConditionalFormatRule': ['conditionalformatrule'],
  'Banding': ['banding'],
  'Borders': ['borders'],
  'Color': ['colorbuilder'],
  'RgbColor': ['rgbcolor'],
  'DataValidation': ['datavalidationbuilder'],
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

// Populate the dynamic methods map with metadata for proper linking
setterList.forEach((item, index) => {
  const single = `set${Utils.capital(item.single || item.name)}`;
  dynamicSheetRangeMethods.set(single, { specType: 'setterList', specIndex: index, specFile: sheetRangeMakerPath });
  if (item.plural !== false) {
    const plural = item.plural || `set${Utils.capital(item.single || item.name)}s`;
    dynamicSheetRangeMethods.set(plural, { specType: 'setterList', specIndex: index, specFile: sheetRangeMakerPath });
  }
});
attrGetList.forEach((item, index) => {
  dynamicSheetRangeMethods.set(item.name, { specType: 'attrGetList', specIndex: index, specFile: sheetRangeMakerPath });
  const plural = item.plural || `${item.name}s`;
  if (!item.skipPlural) {
    dynamicSheetRangeMethods.set(plural, { specType: 'attrGetList', specIndex: index, specFile: sheetRangeMakerPath });
  }
});
valuesGetList.forEach((item, index) => {
  dynamicSheetRangeMethods.set(item.name, { specType: 'valuesGetList', specIndex: index, specFile: sheetRangeMakerPath });
  const plural = item.plural || `${item.name}s`;
  if (!item.skipPlural) {
    dynamicSheetRangeMethods.set(plural, { specType: 'valuesGetList', specIndex: index, specFile: sheetRangeMakerPath });
  }
});

// Populate the dynamic methods map for Document service
const snakeToCamel = str => str.toLowerCase().replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));

Object.keys(Attribute).forEach((key, index) => {
  const propName = snakeToCamel(key);
  const capitalizedProp = Utils.capital(propName);
  dynamicDocMethods.set(`get${capitalizedProp}`, { specType: 'Attribute', specIndex: index });
  dynamicDocMethods.set(`set${capitalizedProp}`, { specType: 'Attribute', specIndex: index });
});
for (const service of giData) {
  const serviceName = service.serviceName;
  const serviceDirectory = serviceToDirectoryMap[serviceName] || serviceName.toLowerCase();

  for (const classData of service.classes) {
    const className = classData.className;
    const fileContents = [];
    const mappedFile = classToFileMap[className];
    if (mappedFile) {
      const filePath = allJsFiles.find(p => p.endsWith(mappedFile));
      if (filePath && fileCache.has(filePath)) {
        fileContents.push({ filePath, content: fileCache.get(filePath) });
      }
    } else {
      const possibleFileNames = [
        `fake${className.toLowerCase()}.js`,
        `fake${serviceName.toLowerCase()}${className.toLowerCase()}.js`,
        `${className.toLowerCase()}.js`,
        'app.js',
      ];

      if (classData.type === 'Enum') {
        possibleFileNames.push(`${serviceDirectory}enums.js`);
        possibleFileNames.push(`enums.js`);
      }

      const synonyms = classSynonyms[className] || [];
      synonyms.forEach(s => {
        possibleFileNames.push(`fake${s}.js`);
      });


      for (const fileName of possibleFileNames) {
        // Search in the service-specific directory first, then in the common directory
        let filePath = allJsFiles.find(p => p.endsWith(`${serviceDirectory}/${fileName}`));
        if (!filePath) {
          filePath = allJsFiles.find(p => p.endsWith(`common/${fileName}`));
        }

        if (filePath && fileCache.has(filePath) && !fileContents.some(f => f.filePath === filePath)) {
          fileContents.push({ filePath, content: fileCache.get(filePath) });
        }
      }

      // Check in the src/services/enums folder for all services
      if (classData.type === 'Enum') {
        // Common pattern: src/services/enums/servicenameenums.js
        // e.g. calendarapp -> calendarenums.js, documentapp -> docsenums.js
        // We need to map serviceName to the prefix used in the enums folder.
        // Service names in gi.json are capitalized, e.g., 'Calendar', 'Document'.
        // The enum files seem to follow a pattern: calendarenums.js, docsenums.js, formsenums.js

        let enumPrefix = serviceName.toLowerCase();
        // Handle specific mapping quirks if any (e.g. Document -> docs, Spreadsheet -> sheets)
        if (serviceName === 'Document') enumPrefix = 'docs';
        if (serviceName === 'Spreadsheet') enumPrefix = 'sheets';
        if (serviceName === 'Forms') enumPrefix = 'forms';
        // Calendar -> calendar (default works)
        // Gmail -> gmail (default works)
        // Slides -> slides (default works)

        const enumFileName = `${enumPrefix}enums.js`;
        const filePath = allJsFiles.find(p => p.endsWith(`enums/${enumFileName}`));

        if (filePath && fileCache.has(filePath) && !fileContents.some(f => f.filePath === filePath)) {
          fileContents.push({ filePath, content: fileCache.get(filePath) });
        }
      }
    }


    for (const method of classData.methods) {
      const methodName = getMethodName(method.method);
      let status = 'not started';
      let implementationLink = null;

      if (methodName) {
        // Check for dynamically generated methods FIRST, before file search
        let handledAsDynamic = false;

        // Special check for dynamically generated Spreadsheet Range methods
        if (serviceName === 'Spreadsheet' && className === 'Range' && dynamicSheetRangeMethods.has(methodName)) {
          handledAsDynamic = true;
          const specInfo = dynamicSheetRangeMethods.get(methodName);
          const specFilePath = path.relative(projectPath, specInfo.specFile);
          const specFileContent = fs.readFileSync(specInfo.specFile, 'utf8');
          const specLines = specFileContent.split('\n');

          // Find the line where the spec list starts
          const listStartPattern = new RegExp(`export const ${specInfo.specType}\\s*=`);
          let lineNumber = specLines.findIndex(line => listStartPattern.test(line));

          if (lineNumber !== -1) {
            // Add offset for the specific item in the array (approximate)
            lineNumber += 1 + specInfo.specIndex;
            status = 'completed';
            implementationLink = `${specFilePath}#L${lineNumber}`;
          }
        }

        // Special check for dynamically generated Document methods
        if (serviceName === 'Document' && docServiceClasses.has(className) && dynamicDocMethods.has(methodName)) {
          handledAsDynamic = true;
          const relativePath = path.relative(projectPath, docEnumsPath);
          status = 'completed';
          implementationLink = `${relativePath}#L1`;
        }

        // Only do file search if not handled as dynamic
        if (!handledAsDynamic) {
          for (const file of fileContents) {
            let isImplemented;
            if (classData.type === 'Enum') {
              // Enums can be keys in an object literal or quoted strings in an array
              // Fix: escape \\s properly and allow ] or } for the last item in a list/object
              const enumRegex = new RegExp(`[\"']?${methodName}[\"']?\\s*[:,\\]\\}]`);
              isImplemented = enumRegex.test(file.content);
            } else {
              isImplemented = file.content.includes(methodName);
            }

            if (isImplemented) {
              let inProgress = false;
              try {
                const ast = acorn.parse(file.content, { ecmaVersion: 'latest', sourceType: 'module' });
                walk.simple(ast, {
                  MethodDefinition(node) {
                    if (node.key.name === methodName) {
                      // Once we find the method, walk its body to check for notYetImplemented
                      walk.simple(node.value.body, {
                        CallExpression(callNode) {
                          if (callNode.callee.name === 'notYetImplemented') {
                            inProgress = true;
                            // We can stop walking this method body now
                            throw 'found';
                          }
                        }
                      });
                      // Stop walking the whole file if we've analyzed the method
                      throw 'found';
                    }
                  }
                });
              } catch (e) {
                if (e !== 'found') {
                  console.error(`Failed to parse ${file.filePath} with acorn. Error: ${e.message}`);
                }
              }

              if (inProgress) {
                status = 'in progress';
              } else {
                status = 'completed';
              }

              const relativePath = path.relative(projectPath, file.filePath);
              const lines = file.content.split('\n');
              const lineNumber = lines.findIndex(line => line.includes(methodName)) + 1;
              implementationLink = `${relativePath}#L${lineNumber}`;
              if (status === 'completed') break; // Stop searching if a completed version is found
            }
          }
        }
      }
      method['gas-fakes status'] = status;
      method['implementationLink'] = implementationLink;
    }
  }
}

fs.writeFileSync(outputPath, JSON.stringify(giData, null, 2));
console.log('gi-fake-all.json has been created for all services.');
