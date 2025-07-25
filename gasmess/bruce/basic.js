import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

// put all this stuff in a temp folder for easy deletion
const ss = SpreadsheetApp.create("--gasmess-sheet")
moveToTempFolder(ss.getId())

const sheet = ss.insertSheet()
const values = [[1,2,3],[4,5,6],[7,8,9]]
const range = sheet.getRange(1,1,3,3)
range.setValues(values)

const result = range.getValues()
console.log (JSON.stringify(result) === JSON.stringify(values) ? 'success' : 'true')

deleteTempFile(ss.getId())
