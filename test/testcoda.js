import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, createTrashCollector, trasher, checkBackend } from "./testassist.js";

console.log (DriveApp.getRootFolder().getName())

export const testCoda = (pack) => {
  const isCodaActive = checkBackend('coda');
  const currentPlatform = ScriptApp.__platform;

  ScriptApp.__platform = "coda";
  if (!isCodaActive) {
    console.log("Skipping Coda tests: CODA_API_KEY is not defined.");
    return pack;
  }

  const { unit, fixes } = pack || initTests();
  const toTrash = createTrashCollector();

  unit.section("Coda lists", (t) => {

    const root = DriveApp.getRootFolder();
    t.is(root.getName(), "My docs", "Should be in Coda root folder 'My docs'");

    const top = root.getFiles() 
    /*
    while (top.hasNext()) {
        const f = top.next();
        t.true(is.nonEmptyString(f.getName()));
    }
        */
  });



  if (!pack) {
    unit.report();
  }

  if (fixes.CLEAN) trasher(toTrash);

  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda);
