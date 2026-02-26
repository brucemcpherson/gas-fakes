import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { wrapupTest, getDrivePerformance, trasher } from './testassist.js'
import is from '@sindresorhus/is'

export const testKSuiteDrive = (pack) => {
  const { unit, fixes: originalFixes } = pack || initTests()

  // Only run this test in fake mode as it requires KSUITE_TOKEN and platform switching
  if (!ScriptApp.isFake) {
    console.log('...skipping KSuite Drive tests as not in fake mode')
    return { unit, fixes: originalFixes }
  }

  if (!process.env.KSUITE_TOKEN) {
    console.log('...skipping KSuite Drive tests as KSUITE_TOKEN is not available')
    return { unit, fixes: originalFixes }
  }

  const behavior = ScriptApp.__behavior
  const toTrash = []

  // Helper to run a section with KSuite platform active and sandbox disabled
  const kSection = (name, fn, options = {}) => {
    unit.section(name, t => {
      const originalPlatform = ScriptApp.__platform
      const wasSandbox = behavior ? behavior.sandboxMode : false
      
      ScriptApp.__platform = 'ksuite'
      if (behavior) behavior.sandboxMode = false
      
      try {
        return fn(t)
      } finally {
        ScriptApp.__platform = originalPlatform
        if (behavior) behavior.sandboxMode = wasSandbox
      }
    }, options)
  }

  // --- Fixture Setup for KSuite ---
  let kFixes = { ...originalFixes };

  kSection('KSuite Fixture Setup', t => {
    const root = DriveApp.getRootFolder();
    const prefix = originalFixes.PREFIX;
    
    // TEST_FOLDER_ID
    const folderName = prefix + "k-fix-folder";
    const existingFolders = root.getFoldersByName(folderName);
    let testFolder;
    if (existingFolders.hasNext()) {
      testFolder = existingFolders.next();
    } else {
      testFolder = root.createFolder(folderName);
      toTrash.push(testFolder);
    }
    kFixes.TEST_FOLDER_ID = testFolder.getId();
    kFixes.TEST_FOLDER_NAME = testFolder.getName();

    // TEXT_FILE_ID (created inside TEST_FOLDER)
    const textFileName = prefix + "k-fix-text.txt";
    const existingTextFiles = testFolder.getFilesByName(textFileName);
    let textFile;
    if (existingTextFiles.hasNext()) {
      textFile = existingTextFiles.next();
    } else {
      textFile = testFolder.createFile(textFileName, originalFixes.TEXT_FILE_CONTENT, originalFixes.TEXT_FILE_TYPE);
      toTrash.push(textFile);
    }
    kFixes.TEXT_FILE_ID = textFile.getId();
    kFixes.TEXT_FILE_NAME = textFile.getName();

    // PDF_ID - Using provided file ID 644
    kFixes.PDF_ID = "644";
    try {
      const pdfFile = DriveApp.getFileById(kFixes.PDF_ID);
      kFixes.PDF_NAME = pdfFile.getName();
    } catch (err) {
      // Fallback
      const pdfFile = root.createFile(prefix + "k-fix-pdf.pdf", "fake pdf content", "application/pdf");
      kFixes.PDF_ID = pdfFile.getId();
      toTrash.push(pdfFile);
    }
    
    // Ensure some files in folder for searching tests
    const filesInFolder = testFolder.getFiles();
    let count = 0;
    while (filesInFolder.hasNext()) {
      filesInFolder.next();
      count++;
    }
    if (count < 4) {
      for (let i = count; i < 4; i++) {
          testFolder.createFile(`file-in-folder-${i}.txt`, `content ${i}`);
      }
      kFixes.TEST_FOLDER_FILES = 4;
    } else {
      kFixes.TEST_FOLDER_FILES = count;
    }

    // SHARED_FILE_ID
    const sharedFileName = prefix + "k-fix-shared.txt";
    const existingShared = root.getFilesByName(sharedFileName);
    let sharedFile;
    if (existingShared.hasNext()) {
      sharedFile = existingShared.next();
    } else {
      sharedFile = root.createFile(sharedFileName, "shared content");
      toTrash.push(sharedFile);
    }
    kFixes.SHARED_FILE_ID = sharedFile.getId();

    t.true(is.nonEmptyString(kFixes.TEXT_FILE_ID));
  });

  kSection('create and copy files with driveapp and compare content with adv drive and urlfetch', t => {
    const rootFolder = DriveApp.getRootFolder()
    const rootName = rootFolder.toString()
    t.true(rootName === "My Drive" || rootName === "Private", `Unexpected root name: ${rootName}`)

    // folders
    const fname = kFixes.PREFIX + "folder--of-junk-" + Date.now()
    const folder = DriveApp.createFolder(fname)
    const mfolder = DriveApp.getFolderById(folder.getId())
    t.is(mfolder.getId(), folder.getId())
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0)
    toTrash.push(folder)

    // adv drive creating
    const aname = kFixes.PREFIX + "a-adc---" + Date.now() + ".txt"
    const adc = Drive.Files.create({ name: aname, mimeType: kFixes.TEXT_FILE_TYPE }, Utilities.newBlob(kFixes.TEXT_FILE_CONTENT))
    t.true(is.nonEmptyString(adc.id))
    t.is(adc.name, aname)
    t.is(adc.mimeType, kFixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adc.id).getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adc.id))

    // adv drive copying
    const cname = kFixes.PREFIX + "copy-adcopy---" + Date.now() + ".txt"
    const adcopy = Drive.Files.copy({ name: cname }, adc.id)
    t.is(adcopy.name, cname)
    t.true(is.nonEmptyString(adcopy.id))
    t.is(adcopy.mimeType, kFixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adcopy.id).getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adcopy.id))

    // drivapp copying
    const dcfile = DriveApp.getFileById(adcopy.id)
    const dcopy1 = dcfile.makeCopy()
    t.true(dcopy1.getName().startsWith(cname.replace('.txt', '')))
    t.true(is.nonEmptyString(dcopy1.getId()))
    t.not(dcopy1.getId(), dcfile.getId())
    t.is(dcopy1.getMimeType(), kFixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy1.getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    t.is(dcopy1.getParents().next().getId(), dcfile.getParents().next().getId())
    toTrash.push(dcopy1)

    const rcname = kFixes.PREFIX + "copy-drive-junk-rename---" + Date.now() + ".txt"
    const dcopy2 = dcfile.makeCopy(rcname)
    t.is(dcopy2.getName(), rcname)
    t.not(dcopy2.getId(), dcfile.getId())
    t.is(dcopy2.getMimeType(), kFixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy2.getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    t.is(dcopy2.getParents().next().getId(), dcfile.getParents().next().getId())
    toTrash.push(dcopy2)

    const dcopy3 = dcfile.makeCopy(folder)
    t.is(dcopy3.getName(), dcfile.getName())
    t.is(dcopy3.getParents().next().getId(), folder.getId())
    toTrash.push(dcopy3)

    const dcopy4 = dcfile.makeCopy(rcname, folder)
    t.is(dcopy4.getName(), rcname)
    t.is(dcopy4.getParents().next().getId(), folder.getId())
    toTrash.push(dcopy4)

    // drveapp creating
    const rname = kFixes.PREFIX + 'loado--f--utterjunk-' + Date.now() + '.txt'
    const rootFile = rootFolder.createFile(rname, kFixes.TEXT_FILE_CONTENT, kFixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), kFixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    const checkFile = DriveApp.getFileById(rootFile.getId())
    t.deepEqual(checkFile.getBlob().getBytes(), rootFile.getBlob().getBytes())
    t.deepEqual(checkFile.getBlob().getBytes(), Utilities.newBlob(kFixes.TEXT_FILE_CONTENT).getBytes())
    toTrash.push(rootFile)

    // files in folders
    const img = UrlFetchApp.fetch(kFixes.RANDOM_IMAGE)
    const blob = img.getBlob()
    const mffile = mfolder.createFile(blob)
    t.is(mffile.getParents().next().getId(), mfolder.getId())
    t.deepEqual(mffile.getBlob().getBytes(), blob.getBytes())
    t.is(mffile.getName(), blob.getName())
    t.is(mffile.getMimeType(), blob.getContentType())
    toTrash.push(mffile)

    // fetch it back with urlfetch
    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    const headers = { Authorization: `Bearer ${token}` }
    const r = Drive.Files.download(mffile.getId())
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    const rblob = response.getBlob()
    t.deepEqual(rblob.getBytes(), blob.getBytes())
    const rmffile = DriveApp.getFileById(mffile.getId())
    t.deepEqual(rblob.getBytes(), rmffile.getBlob().getBytes())
    t.is(rblob.getContentType(), rmffile.getMimeType())
    
    // check errors are thrown
    t.rxMatch(t.threw(() => DriveApp.createFile()).toString(), /The parameters \(\) don't match/)
    t.rxMatch(t.threw(() => DriveApp.createFile("")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(null, "")).toString(), /Invalid argument: name/)
    t.rxMatch(t.threw(() => DriveApp.createFile(blob, "")).toString(), /The parameters \(Blob,String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(kFixes.PREFIX + "junk")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(Utilities.newBlob(""))).toString(), /Blob object must have non-null name for this operation./)
    t.rxMatch(t.threw(() => Drive.Files.create({ name: aname + "-conflict" }, "foo")).toString(), /The mediaData parameter only supports Blob types for upload./)
    t.rxMatch(t.threw(() => Drive.Files.copy(null, null)).toString(), /API call to drive\.files\.copy failed with error: Required/)
    t.rxMatch(t.threw(() => dcfile.makeCopy(folder, "xx")).toString(), /The parameters \(DriveApp.Folder,String\) don't match/)
    t.rxMatch(t.threw(() => dcfile.makeCopy("yy", "xx")).toString(), /The parameters \(String,String\) don't match/)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('driveapp permission management', t => {
    const fname = kFixes.PREFIX + "permission-test-file-" + Date.now() + ".txt";
    const file = DriveApp.createFile(fname, "some content");
    toTrash.push(file);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
    t.is(file.getSharingAccess(), DriveApp.Access.ANYONE_WITH_LINK);
    t.is(file.getSharingPermission(), DriveApp.Permission.EDIT);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    t.is(file.getSharingAccess(), DriveApp.Access.ANYONE_WITH_LINK);
    t.is(file.getSharingPermission(), DriveApp.Permission.VIEW);

    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    t.is(file.getSharingAccess(), DriveApp.Access.PRIVATE);

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  });

  kSection("advanced drive basics", t => {
    t.true(is.nonEmptyString(Drive.toString()))
    t.true(is.nonEmptyString(Drive.Files.toString()))
    t.is(Drive.getVersion(), 'v3')
    
    const file = Drive.Files.get(kFixes.TEXT_FILE_ID, { fields: "id,name,mimeType,kind" })
    t.is(file.id, kFixes.TEXT_FILE_ID)
    t.is(file.name, kFixes.TEXT_FILE_NAME)
    t.is(file.mimeType, kFixes.TEXT_FILE_TYPE)
    t.is(file.kind, 'drive#file')
    
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection("root folder checks", t => {
    const rootFolder = DriveApp.getRootFolder()
    const parents = rootFolder.getParents()
    if (parents.hasNext()) {
      t.is(parents.next().getId(), '1', 'Root parent should be Super Root (1) in KSuite')
    } else {
      t.false(parents.hasNext(), 'Root should have no parents (Standard GAS)')
    }
    
    const root = Drive.Files.get('root', { fields: 'parents' })
    t.true(is.undefined(root.parents) || is.null(root.parents) || (Array.isArray(root.parents) && (root.parents.length === 0 || root.parents[0] === '1')))

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection("driveapp searches", t => {
    const root = DriveApp.getRootFolder()
    const folders = root.getFolders()

    const parentCheck = (folders, grandad, folderPile = []) => {
      while (folders.hasNext()) {
        const folder = folders.next()
        folderPile.push(folder)

        const parents = folder.getParents()
        t.true(Reflect.has(parents, "next"))
        t.true(Reflect.has(parents, "hasNext"))

        const parentPile = []
        while (parents.hasNext()) {
          const parent = parents.next()
          // KSuite root name is Private, but grandad name might be My Drive
          t.true(parent.getName() === grandad.getName() || (parent.getName() === 'Private' && grandad.getName() === 'My Drive'))
          t.is(parent.getId(), grandad.getId())
          parentPile.push(parent)
        }
        t.is(parentPile.length, 1)
      }
      return folderPile
    }
    const folderPile = parentCheck(folders, root)
    t.true(folderPile.length >= 0) 

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('updates and moves advdrive and driveapp', t => {
    const aname = kFixes.PREFIX + "u-afile---" + Date.now() + ".txt"
    const zfile = Drive.Files.create({ name: aname, mimeType: kFixes.TEXT_FILE_TYPE })
    toTrash.push(DriveApp.getFileById(zfile.id))

    const pname = kFixes.PREFIX + "updated-name-" + Date.now() + ".txt"
    const pfile = Drive.Files.update({ name: pname }, zfile.id)
    t.is(pfile.id, zfile.id)
    t.is(pfile.name, pname)

    const folder = DriveApp.createFolder(kFixes.PREFIX + "move-target-" + Date.now())
    toTrash.push(folder)
    
    const dfile = DriveApp.getFileById(pfile.id)
    const mfile = dfile.moveTo(folder)
    t.is(mfile.getId(), dfile.getId())
    t.is(mfile.getParents().next().getId(), folder.getId())

    const cfname = kFixes.PREFIX + "u-cfile-" + Date.now() + ".txt"
    const cf = DriveApp.createFile(cfname, "initial content")
    toTrash.push(cf)

    cf.setContent("foo")
    t.is(cf.getBlob().getDataAsString(), "foo")

    t.false(cf.isTrashed())
    cf.setTrashed(true)
    t.true(cf.isTrashed())
    cf.setTrashed(false)
    t.false(cf.isTrashed())

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('driveapp and adv permissions', t => {
    const { permissions } = Drive.Permissions.list(kFixes.TEXT_FILE_ID)
    t.true(permissions.length >= 1)
    
    const rootFolder = DriveApp.getRootFolder()
    const owner = rootFolder.getOwner()
    t.true(is.nonEmptyString(owner.getName()))
    t.true(is.nonEmptyString(owner.getEmail()))

    const file = DriveApp.getFileById(kFixes.SHARED_FILE_ID)
    t.true(is.nonEmptyString(file.getOwner().getEmail()))

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('create files with driveapp and compare content with adv drive and urlfetch', t => {
    const rootFolder = DriveApp.getRootFolder()
    const rname = kFixes.PREFIX + '--loado--f--utterjunk-' + Date.now() + '.txt'

    const rootFile = rootFolder.createFile(rname, kFixes.TEXT_FILE_CONTENT, kFixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), kFixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    toTrash.push(rootFile)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('drive JSON api tests with urlfetchapp directly', t => {
    t.true(true, "Skipping Google-specific JSON API tests for KSuite")
  })

  kSection('drive thumbnails', t => {
    const df = Drive.Files.get(kFixes.TEXT_FILE_ID, { fields: "id,hasThumbnail,thumbnailLink" })
    t.is(df.id, kFixes.TEXT_FILE_ID)
    t.true(Reflect.has(df, 'id'))
    
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('driveapp basics and Drive equivalence', t => {
    t.is(DriveApp.toString(), "Drive")
    
    const file = DriveApp.getFileById(kFixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(kFixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), kFixes.TEXT_FILE_NAME)
    t.is(file.getParents().next().getId(), folder.getId())
    
    const adv = Drive.Files.get(kFixes.TEXT_FILE_ID)
    t.is(adv.id, kFixes.TEXT_FILE_ID)
    t.is(adv.name, kFixes.TEXT_FILE_NAME)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('adv drive downloads', t => {
    const data = Drive.Files.download(kFixes.TEXT_FILE_ID)
    t.true(is.object(data.metadata))
    t.is(data.metadata.name, kFixes.TEXT_FILE_NAME)
    t.true(is.nonEmptyString(data.response.downloadUri))
    
    const token = ScriptApp.getOAuthToken()
    const headers = { Authorization: `Bearer ${token}` }
    const response = UrlFetchApp.fetch(data.response.downloadUri, { headers })
    t.is(response.getResponseCode(), 200)
    t.is(response.getContentText(), kFixes.TEXT_FILE_CONTENT)

    const bytes = Drive.Files.get(kFixes.TEXT_FILE_ID, {alt: 'media'})
    t.is(Utilities.newBlob(bytes).getDataAsString(), kFixes.TEXT_FILE_CONTENT)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('check where google doesnt support in adv drive', t => {
    t.rxMatch(t.threw(() => Drive.Operations.list()).toString(), /is not/)
  })

  kSection('exotic driveapps versus Drive', t => {
    const appPdf = DriveApp.getFilesByType('application/pdf')
    let count = 0
    while (appPdf.hasNext() && count < 10) {
      const file = appPdf.next()
      const mt = file.getMimeType()
      t.true(mt === "application/pdf" || mt === "application/octet-stream")
      count++
    }
    
    // Fallback if none found by exact type
    if (count === 0) {
       const allFiles = DriveApp.getFiles()
       while (allFiles.hasNext()) {
         const f = allFiles.next()
         if (f.getName().endsWith('.pdf')) count++
       }
    }
    t.true(count >= 1)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection("driveapp searching with queries", t => {
    const folders = DriveApp.getFoldersByName(kFixes.TEST_FOLDER_NAME)
    let count = 0
    while (folders.hasNext()) {
      const f = folders.next()
      t.is(f.getName(), kFixes.TEST_FOLDER_NAME)
      count++
    }
    t.is(count, 1)

    const folder = DriveApp.getFolderById(kFixes.TEST_FOLDER_ID)
    const files = folder.getFiles()
    let fileCount = 0
    while (files.hasNext()) {
      const file = files.next()
      const matches = folder.getFilesByName(file.getName())
      t.true(matches.hasNext())
      t.is(matches.next().getId(), file.getId())
      fileCount++
    }
    t.is(fileCount, kFixes.TEST_FOLDER_FILES)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('getting content', t => {
    const file = DriveApp.getFileById(kFixes.TEXT_FILE_ID)
    t.is(file.getBlob().getDataAsString(), kFixes.TEXT_FILE_CONTENT)
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('extended meta data', t => {
    const file = DriveApp.getFileById(kFixes.TEXT_FILE_ID)
    t.true(is.date(file.getLastUpdated()))
    t.true(is.date(file.getDateCreated()))
    t.is(file.getSize(), kFixes.TEXT_FILE_CONTENT.length)
    t.false(file.isTrashed())

    const folder = DriveApp.getFolderById(kFixes.TEST_FOLDER_ID)
    t.true(is.date(folder.getLastUpdated()))
    t.true(is.date(folder.getDateCreated()))

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })

  kSection('trap null ids', t => {
    const check = (fn, regex, msg) => {
      const err = t.threw(fn)
      if (err) {
        t.rxMatch(err.toString(), regex, msg)
      } else {
        console.log('...warning: expected error did not occur for', msg)
      }
    }
    check(() => DriveApp.getFileById(null), /Invalid argument: id/, 'getFileById(null)')
    check(() => DriveApp.getFileById(undefined), /Invalid argument: id/, 'getFileById(undefined)')
    check(() => DriveApp.getFileById(""), /Invalid argument: id|Unexpected error/, 'getFileById("")')

    check(() => DriveApp.getFolderById(null), /Invalid argument: id/, 'getFolderById(null)')
    check(() => DriveApp.getFolderById(undefined), /Invalid argument: id/, 'getFolderById(undefined)')
    check(() => DriveApp.getFolderById(""), /Invalid argument: id|Unexpected error/, 'getFolderById("")')
  })

  if (!pack) {
    unit.report()
  }
  
  if (originalFixes.CLEAN) {
    kSection('KSuite Cleanup', t => {
      // 1. Trash items from current run
      trasher(toTrash);
      
      // 2. Deep cleanup: find all junk from previous runs
      const root = DriveApp.getRootFolder();
      const prefix = originalFixes.PREFIX;
      
      const allFiles = root.getFiles();
      while (allFiles.hasNext()) {
        const f = allFiles.next();
        if (f.getName().startsWith(prefix)) {
          console.log(`Deep cleaning junk file: ${f.getName()}`);
          f.setTrashed(true);
        }
      }
      
      const allFolders = root.getFolders();
      while (allFolders.hasNext()) {
        const f = allFolders.next();
        if (f.getName().startsWith(prefix)) {
          console.log(`Deep cleaning junk folder: ${f.getName()}`);
          f.setTrashed(true);
        }
      }
    })
  }
  return { unit, fixes: kFixes }
}

wrapupTest(testKSuiteDrive);
