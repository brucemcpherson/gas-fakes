const serviceModules = [
  './support/env-loader.js',
  './services/scriptapp/app.js',
  './services/stores/app.js',
  './services/driveapp/app.js',
  './services/logger/app.js',
  './services/urlfetchapp/app.js',
  './services/xmlservice/app.js',
  './services/utilities/app.js',
  './services/spreadsheetapp/app.js',
  './services/gmailapp/app.js',
  './services/calendarapp/app.js',
  './services/chartsapp/app.js',
  './services/session/app.js',
  './services/base/app.js',
  './services/advdrive/app.js',
  './services/advsheets/app.js',
  './services/advdocs/app.js',
  './services/advgmail/app.js',
  './services/advpeople/app.js',
  './services/advtasks/app.js',
  './services/advcalendar/app.js',
  './services/advworkspacevents/app.js',
  './services/advbigquery/app.js',
  './services/advchat/app.js',
  './services/advslides/app.js',
  './services/documentapp/app.js',
  './services/advforms/app.js',
  './services/formapp/app.js',
  './services/slidesapp/app.js',
  './services/mimetype/app.js',
  './services/lock/app.js',
  './services/libhandlerapp/app.js',
  './services/jdbc/app.js',
  './services/html/app.js',
  './services/content/app.js'

];

for (const mod of serviceModules) {
  console.log(`[Worker] Loading: ${mod}...`);
  try {
    await import(mod);
    console.log(`[Worker] Done: ${mod}`);
  } catch (err) {
    console.error(`❌ [Worker] CRASHED while loading: ${mod}`);
    console.error(err); // This will print the actual syntax/runtime error and stack trace
    process.exitCode = 1;
     // give stdio a chance to flush before exiting
    await new Promise(resolve => process.stderr.write('', resolve));
    process.exit()
  }
}
/*
import './support/env-loader.js';
import './services/scriptapp/app.js'
import './services/driveapp/app.js'
import './services/logger/app.js'
import './services/urlfetchapp/app.js'
import './services/xmlservice/app.js'
import './services/utilities/app.js'
import './services/spreadsheetapp/app.js'
import './services/gmailapp/app.js'
import './services/calendarapp/app.js'
import './services/chartsapp/app.js'
import './services/session/app.js'
import './services/base/app.js'
import './services/advdrive/app.js'
import './services/advsheets/app.js'
import './services/advdocs/app.js'
import './services/advgmail/app.js'
import './services/advpeople/app.js'
import './services/advtasks/app.js'
import './services/advcalendar/app.js'
import './services/advworkspacevents/app.js'
import './services/advbigquery/app.js'
import './services/advchat/app.js'
import './services/advslides/app.js'
import './services/documentapp/app.js'
import './services/advforms/app.js'
import './services/formapp/app.js'
import './services/slidesapp/app.js'
import './services/mimetype/app.js'
import './services/lock/app.js'
import './services/stores/app.js'
import './services/libhandlerapp/app.js'
import './services/jdbc/app.js'
import './services/html/app.js'
import './services/content/app.js'
*/