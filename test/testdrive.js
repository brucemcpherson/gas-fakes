
// all these imports 
// this is loaded by npm, but is a library on Apps Script side



import '@mcpher/gas-fakes'
import { getDrivePerformance, wrapupTest, trasher } from './testassist.js';
import is from '@sindresorhus/is';
// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testDrive = (pack) => {
  const toTrash = []
  const { unit, fixes } = pack || initTests()
  unit.section('create and copy files with driveapp and compare content with adv drive and urlfetch', t => {


    const rootFolder = DriveApp.getRootFolder()
    t.is(rootFolder.toString(), "My Drive")


    // folders
    const fname = fixes.PREFIX + "folder--of-junk"
    const folder = DriveApp.createFolder(fname)
    const mfolder = DriveApp.getFolderById(folder.getId())
    t.is(mfolder.getId(), folder.getId())
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0)
    toTrash.push(folder)

    // adv drive creating
    const aname = fixes.PREFIX + "a-adc---.txt"
    const adc = Drive.Files.create({ name: aname, mimeType: fixes.TEXT_FILE_TYPE }, Utilities.newBlob(fixes.TEXT_FILE_CONTENT))
    t.true(is.nonEmptyString(adc.id))
    t.is(adc.name, aname)
    t.is(adc.mimeType, fixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adc.id).getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adc.id))

    // adv drive copying
    const cname = fixes.PREFIX + "copy-adcopy---.txt"
    const adcopy = Drive.Files.copy({ name: cname }, adc.id)
    t.is(adcopy.name, cname)
    t.true(is.nonEmptyString(adcopy.id))
    t.is(adcopy.mimeType, fixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adcopy.id).getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adcopy.id))

    // drivapp copying
    const rcname = fixes.PREFIX + "copy-drive-junk-rename---.txt"
    const dcfile = DriveApp.getFileById(adcopy.id)
    const dcopy1 = dcfile.makeCopy()
    t.is(dcopy1.getName(), cname)
    t.true(is.nonEmptyString(dcopy1.getId()))
    t.not(dcopy1.getId(), dcfile.getId())
    t.is(dcopy1.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy1.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(dcopy1.getParents().next().getId(), dcfile.getParents().next().getId())
    toTrash.push(dcopy1)

    const dcopy2 = dcfile.makeCopy(rcname)
    t.is(dcopy2.getName(), rcname)
    t.not(dcopy2.getId(), dcfile.getId())
    t.is(dcopy2.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy2.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
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
    const rname = fixes.PREFIX + 'loado--f--utterjunk.txt'
    const rootFile = rootFolder.createFile(rname, fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    const checkFile = DriveApp.getFileById(rootFile.getId())
    t.deepEqual(checkFile.getBlob().getBytes(), rootFile.getBlob().getBytes())
    t.deepEqual(checkFile.getBlob().getBytes(), Utilities.newBlob(fixes.TEXT_FILE_CONTENT).getBytes())
    toTrash.push(rootFile)

    // cant create file by meta data only with DriveApp - so give it min required
    const mname = fixes.PREFIX + 'loado--m--utterjunk.txt'
    const metaFile = rootFolder.createFile(mname, "")
    const mfile = Drive.Files.get(metaFile.getId(), { fields: "parents,id,name" })
    t.is(mfile.name, metaFile.getName())
    t.is(mfile.parents[0], rootFolder.getId())
    toTrash.push(metaFile)


    // files in folders
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
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
    const headers = {
      Authorization: `Bearer ${token}`
    }
    // can we use the url to download
    const r = Drive.Files.download(mffile.getId())
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    const rblob = response.getBlob()
    t.deepEqual(rblob.getBytes(), blob.getBytes())
    const rmffile = DriveApp.getFileById(mffile.getId())
    t.deepEqual(rblob.getBytes(), rmffile.getBlob().getBytes())
    t.is(rblob.getContentType(), rmffile.getMimeType())
    const dr = DriveApp.getFileById(mffile.getId())
    t.deepEqual(dr.getBlob().getBytes(), blob.getBytes())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getSize(), mffile.getSize())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getParents().next().getId(), mffile.getParents().next().getId())
    t.is(dr.getParents().next().getId(), mfolder.getId())



    // check errors are thrown
    t.rxMatch(t.threw(() => DriveApp.createFile()).toString(), /The parameters \(\) don't match/)
    t.rxMatch(t.threw(() => DriveApp.createFile("")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(null, "")).toString(), /Invalid argument: name/)
    t.rxMatch(t.threw(() => DriveApp.createFile(blob, "")).toString(), /The parameters \(Blob,String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(mname)).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(Utilities.newBlob(""))).toString(), /Blob object must have non-null name for this operation./)
    t.rxMatch(t.threw(() => Drive.Files.create({ name: aname }, "foo")).toString(), /The mediaData parameter only supports Blob types for upload./)
    t.rxMatch(t.threw(() => Drive.Files.copy(null, null)).toString(), /API call to drive\.files\.copy failed with error: Required/)
    t.rxMatch(t.threw(() => dcfile.makeCopy(folder, "xx")).toString(), /The parameters \(DriveApp.Folder,String\) don't match/)
    t.rxMatch(t.threw(() => dcfile.makeCopy("yy", "xx")).toString(), /The parameters \(String,String\) don't match/)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })
  unit.section('driveapp permission management', t => {

    const fname = fixes.PREFIX + "permission-test-file.txt";
    const file = DriveApp.createFile(fname, "some content");
    toTrash.push(file);

    const editorEmail = fixes.SCRATCH_EDITOR;
    const viewerEmail = fixes.SCRATCH_VIEWER;
    const editorEmail2 = fixes.SCRATCH_B_EDITOR;
    const viewerEmail2 = fixes.SCRATCH_B_VIEWER;
    const editorEmails = [editorEmail, editorEmail2];
    const viewerEmails = [viewerEmail, viewerEmail2];


    // Test addEditor
    file.addEditor(editorEmail);
    let editors = file.getEditors().map(u => u.getEmail());
    t.true(editors.includes(editorEmail), "addEditor should add a single editor");

    // Test addViewer
    file.addViewer(viewerEmail);
    let viewers = file.getViewers().map(u => u.getEmail());
    t.true(viewers.includes(viewerEmail), "addViewer should add a single viewer");

    // Test addEditors
    file.addEditors(editorEmails);
    editors = file.getEditors().map(u => u.getEmail());
    t.true(editorEmails.every(e => editors.includes(e)), "addEditors should add multiple editors");

    // Test addViewers
    file.addViewers(viewerEmails);
    viewers = file.getViewers().map(u => u.getEmail());
    t.true(viewerEmails.every(v => viewers.includes(v)), "addViewers should add multiple viewers");

    // Test removals
    file.removeEditor(editorEmail).removeViewer(viewerEmail);
    t.false(file.getEditors().map(u => u.getEmail()).includes(editorEmail), "removeEditor should remove a single editor");
    t.false(file.getViewers().map(u => u.getEmail()).includes(viewerEmail), "removeViewer should remove a single viewer");

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  });



  unit.section("advanced drive basics", t => {


    t.true(is.nonEmptyString(Drive.toString()))
    t.true(is.nonEmptyString(Drive.Files.toString()))
    t.is(Drive.getVersion(), 'v3')
    t.is(Drive.About.toString(), Drive.toString())
    t.is(Drive.About.toString(), Drive.Files.toString())
    const file = Drive.Files.get(fixes.TEXT_FILE_ID, { fields: "id,name,mimeType,kind" })
    t.is(file.id, fixes.TEXT_FILE_ID)
    t.is(file.name, fixes.TEXT_FILE_NAME)
    t.is(file.mimeType, fixes.TEXT_FILE_TYPE)
    t.is(file.kind, fixes.KIND_DRIVE)
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  })


  unit.section("root folder checks", t => {
    const rootFolder = DriveApp.getRootFolder()
    t.false(rootFolder.getParents().hasNext())
    const root = Drive.Files.get('root', { fields: 'parents' })
    // TODO - slight difference fake returns null for no parents, gas undefined
    t.true(is.undefined(root.parents), { skip: Drive.isFake })
    t.true(is.null(root.parents), { skip: !Drive.isFake })

    // cant set meta data
    t.rxMatch(t.threw(() => rootFolder.setStarred(true)).toString(), /Access denied/)
    //TODO find out whether we can set permissions etc.
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })


  unit.section("driveapp searches", t => {
    const behavior = ScriptApp.isFake ? ScriptApp.__behavior : null;
    const wasStrict = behavior ? behavior.strictSandbox : null;
    if (behavior) {
      // Temporarily disable strict sandbox for this section.
      // Listing files/folders can involve checking parent folders that may not be
      // explicitly whitelisted, causing errors in strict mode.
      behavior.strictSandbox = false;
    }

    try {
      // driveapp itself isnt actually a folder although it shares many of the methods
      // this is the folder that DriveApp represents
      const root = DriveApp.getRootFolder()

      // this gets the folders directly under root
      const folders = root.getFolders()

      const parentCheck = (folders, grandad, folderPile = []) => {
        while (folders.hasNext()) {
          const folder = folders.next()
          folderPile.push(folder)

          // note that parents is an iterator, not an array
          const parents = folder.getParents()
          t.true(Reflect.has(parents, "next"))
          t.true(Reflect.has(parents, "hasNext"))

          // and the next operation should get the meta data of the parent, not just the id
          // in this case there should one be 1
          const parentPile = []
          while (parents.hasNext()) {
            const parent = parents.next()
            t.is(parent.getName(), grandad.getName())
            t.is(parent.getId(), grandad.getId())
            parentPile.push(parent)
          }
          // not really expecting multiple parents nowadays.
          t.is(parentPile.length, 1, { skip: fixes.SKIP_SINGLE_PARENT })
        }
        return folderPile
      }
      const folderPile = parentCheck(folders, root)

      // MYDRIVE I know i have at least thes number of folders in the root
      t.true(folderPile.length > fixes.MIN_FOLDERS_ROOT)

      // I know i have a folder called this
      const knownTestFolder = folderPile.find(f => f.getName() === fixes.TEST_FOLDER_NAME)
      t.is(knownTestFolder.getName(), fixes.TEST_FOLDER_NAME)
      const files = knownTestFolder.getFiles()
      const pile = parentCheck(files, knownTestFolder)

      // i know i have this number of files in the folder
      t.is(pile.length, fixes.TEST_FOLDER_FILES)

      if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
    } finally {
      if (behavior) {
        behavior.strictSandbox = wasStrict;
      }
    }
  })

  unit.section('updates and moves advdrive and driveapp', t => {



    // create a text file with nothing in it
    const aname = fixes.PREFIX + "u-afile---.txt"
    const zfile = Drive.Files.create({ name: aname, mimeType: fixes.TEXT_FILE_TYPE })

    const afile = Drive.Files.get(zfile.id, { fields: "id,parents,mimeType,name" })
    t.is(afile.name, aname)
    t.is(afile.mimeType, fixes.TEXT_FILE_TYPE)
    t.is(afile.id, zfile.id)
    toTrash.push(DriveApp.getFileById(afile.id))


    // now get a pdf blob and update it with that and change the name
    const pdfBlob = DriveApp.getFileById(fixes.PDF_ID).getBlob()
    const pname = fixes.PREFIX + pdfBlob.getName()
    const pfile = Drive.Files.update({ name: pname }, afile.id, pdfBlob)
    t.deepEqual(DriveApp.getFileById(pfile.id).getBlob().getBytes(), pdfBlob.getBytes())
    t.is(pfile.id, afile.id)
    t.is(pfile.mimeType, "application/pdf", 'media should have redone the mimetype')
    t.is(pfile.name, pname)

    // move it somewhere else
    const dfile = DriveApp.getFileById(pfile.id)
    t.is(dfile.getParents().next().getId(), afile.parents[0])
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    const mfile = dfile.moveTo(folder)
    t.is(mfile.getId(), dfile.getId())
    t.deepEqual(mfile.getBlob().getBytes(), dfile.getBlob().getBytes())
    t.is(mfile.getSize(), dfile.getBlob().getBytes().length)
    t.is(mfile.getMimeType(), pfile.mimeType)
    // TODO -moveTo is not updating cache probably because we'er not retrieving the parents property
    t.is(mfile.getParents().next().getId(), folder.getId())

    // set some content
    const cfname = fixes.PREFIX + "u-cfile.txt"
    const cf = DriveApp.createFile(Utilities.newBlob(fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE, cfname))
    toTrash.push(cf)

    cf.setContent("foo")
    t.is(cf.getBlob().getDataAsString(), "foo")
    t.not(cf.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    cf.setContent(cf.getBlob())
    t.is(cf.getBlob().getDataAsString(), "Blob", "Bizarrely set content only takes a string and does a toString() on other things")

    // set some props
    t.false(cf.isTrashed())
    t.false(cf.isStarred())
    t.true(cf.isShareableByEditors())
    cf.setDescription("foo")
    cf.setStarred(true)
    cf.setTrashed(true)
    cf.setShareableByEditors(false)
    t.true(cf.isTrashed())
    t.true(cf.isStarred())
    t.false(cf.isShareableByEditors())
    t.is(cf.getDescription(), "foo")
    cf.setStarred(false)
    cf.setTrashed(false)
    cf.setShareableByEditors(true)
    t.false(cf.isTrashed())
    t.false(cf.isStarred())
    t.true(cf.isShareableByEditors())

    // check bad args
    t.rxMatch(t.threw(() => mfile.moveTo()).toString(), /The parameters \(\) don't match/)
    t.rxMatch(t.threw(() => mfile.moveTo("rubbish")).toString(), /The parameters \(String\)/)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())


  })



  unit.section('driveapp and adv permissions', t => {

    const { permissions } = Drive.Permissions.list(fixes.TEXT_FILE_ID)
    t.is(permissions.length, 1)
    const [p0] = permissions
    t.true(is.nonEmptyString(p0.id))
    t.is(p0.type, "user")
    t.is(p0.role, "owner")

    const { permissions: extras } = Drive.Permissions.list(fixes.TEXT_FILE_ID, { fields: "permissions(kind,id,role,type,emailAddress,deleted)" })
    const [e0] = extras
    t.is(e0.id, p0.id)
    t.is(e0.kind, p0.kind)
    t.is(e0.emailAddress, fixes.EMAIL)
    t.false(e0.deleted)

    const rootFolder = DriveApp.getRootFolder()
    const owner = rootFolder.getOwner()
    t.is(owner.getName(), fixes.OWNER_NAME)
    t.is(owner.getEmail(), fixes.EMAIL)

    const file = DriveApp.getFileById(fixes.SHARED_FILE_ID)
    t.is(file.getOwner().getEmail(), fixes.EMAIL)

    const viewers = file.getViewers()
    t.is(viewers.length, 1)
    viewers.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    const editors = file.getEditors()
    t.is(editors.length, 1)
    editors.forEach(f => t.true(is.nonEmptyString(f.getName())))
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  })



  unit.section('create files with driveapp and compare content with adv drive and urlfetch', t => {

    const rootFolder = DriveApp.getRootFolder()
    t.is(rootFolder.toString(), "My Drive")
    const rname = '--loado--f--utterjunk.txt'


    const rootFile = rootFolder.createFile(rname, fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    const checkFile = DriveApp.getFileById(rootFile.getId())
    t.deepEqual(checkFile.getBlob().getBytes(), rootFile.getBlob().getBytes())
    t.deepEqual(checkFile.getBlob().getBytes(), Utilities.newBlob(fixes.TEXT_FILE_CONTENT).getBytes())
    toTrash.push(rootFile)

    // cant create file by meta data only with DriveApp - so give it min required
    const mname = "m-" + rname
    const metaFile = rootFolder.createFile(mname, "")
    const mfile = Drive.Files.get(metaFile.getId(), { fields: "parents,id,name" })
    t.is(mfile.name, metaFile.getName())
    t.is(mfile.parents[0], rootFolder.getId())
    toTrash.push(metaFile)

    // folders
    const fname = "--folder--of-junk"
    const folder = DriveApp.createFolder(fname)
    const mfolder = DriveApp.getFolderById(folder.getId())
    t.is(mfolder.getId(), folder.getId())
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0)
    toTrash.push(mfolder)

    // files in folders
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
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
    const headers = {
      Authorization: `Bearer ${token}`
    }
    // can we use the url to download
    const r = Drive.Files.download(mffile.getId())
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    const rblob = response.getBlob()
    t.deepEqual(rblob.getBytes(), blob.getBytes())
    const rmffile = DriveApp.getFileById(mffile.getId())
    t.deepEqual(rblob.getBytes(), rmffile.getBlob().getBytes())
    t.is(rblob.getContentType(), rmffile.getMimeType())
    const dr = DriveApp.getFileById(mffile.getId())
    t.deepEqual(dr.getBlob().getBytes(), blob.getBytes())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getSize(), mffile.getSize())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getParents().next().getId(), mffile.getParents().next().getId())
    t.is(dr.getParents().next().getId(), mfolder.getId())

    // check errors are thrown
    t.rxMatch(t.threw(() => DriveApp.createFile()).toString(), /The parameters \(\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile("")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(null, "")).toString(), /Invalid argument: name/)
    t.rxMatch(t.threw(() => DriveApp.createFile(blob, "")).toString(), /The parameters \(Blob,String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(mname)).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(Utilities.newBlob(""))).toString(), /Blob object must have non-null name for this operation./)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  })


  unit.section('drive JSON api tests with urlfetchapp directly', t => {

    const token = ScriptApp.getOAuthToken()
    const endpoint = 'https://www.googleapis.com/drive/v3'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const response = UrlFetchApp.fetch(`${endpoint}/files`, { headers })

    t.is(response.getResponseCode(), 200)
    t.true(is.object(response.getHeaders()))
    const text = response.getContentText()
    t.true(is.string(text))

    const rootResponse = UrlFetchApp.fetch(`${endpoint}/files/root`, { headers })
    const root = JSON.parse(rootResponse.getContentText())
    t.is(root.name, "My Drive")
    t.is(root.mimeType, "application/vnd.google-apps.folder")
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  }, { skip: false })


  unit.section('drive thumbnails', t => {


    const df = Drive.Files.get(fixes.TEXT_FILE_ID, { fields: "id,hasThumbnail,thumbnailLink" })
    const af = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    t.is(df.id, af.getId())
    t.true(df.hasThumbnail)
    t.true(is.nonEmptyString(df.thumbnailLink))

    // now try with a spreadsheet
    const tdf = Drive.Files.get(fixes.TEST_SHEET_ID, { fields: "id,hasThumbnail,thumbnailLink" })
    const taf = DriveApp.getFileById(fixes.TEST_SHEET_ID)
    t.is(tdf.id, taf.getId())
    t.true(tdf.hasThumbnail)
    t.true(is.nonEmptyString(tdf.thumbnailLink))
    const tblob = taf.getThumbnail()
    t.true(is.array(tblob.getBytes()))

    // now fetch it with the link and check the same as returned by get thumbnail
    const ublob = UrlFetchApp.fetch(tdf.thumbnailLink).getBlob()
    t.true(is.array(ublob.getBytes()))
    // this test doesnt work because thumbnail returns a compressed version, whereas the link itself is not compressed
    // t.deepEqual (tblob.getBytes(), ublob.getBytes())
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())


  })

  unit.section('driveapp basics and Drive equivalence', t => {


    t.is(DriveApp.toString(), "Drive")
    t.is(DriveApp.getRootFolder().toString(), "My Drive")

    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), 'fake.txt')
    t.is(file.getParents().next().getId(), folder.getId())
    t.is(folder.getName(), Drive.Files.get(fixes.TEST_FOLDER_ID).name)
    t.is(folder.toString(), folder.getName())
    t.is(file.getParents().next().getId(), Drive.Files.get(fixes.TEST_FOLDER_ID).id)
    t.true(file.getParents().hasNext())
    const blob = file.getBlob()
    t.is(blob.getDataAsString(), fixes.TEXT_FILE_CONTENT)

    t.is(file.getDownloadUrl(), Drive.Files.get(file.getId(), { fields: "webContentLink" }).webContentLink)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  })

  unit.section('adv drive downloads', t => {


    const r = Drive.Files.download(fixes.TEXT_FILE_ID)
    t.true(is.object(r.metadata))
    t.true(is.nonEmptyString(r.name))
    t.true(is.nonEmptyObject(r.response))
    t.true(is.nonEmptyString(r.response.downloadUri))


    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    const headers = {
      Authorization: `Bearer ${token}`
    }

    // can we use the url to download
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    t.is(response.getResponseCode(), 200)
    t.true(is.object(response.getHeaders()))
    const text = response.getContentText()
    t.is(text, fixes.TEXT_FILE_CONTENT)

    // and driveapp to compare and do the same things
    const aFile = Drive.Files.get(fixes.TEXT_FILE_ID)
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const blob = file.getBlob()
    t.is(blob.getName(), aFile.name)
    t.is(blob.getDataAsString(), text)
    t.is(file.getId(), aFile.id)
    t.deepEqual(response.getBlob().getBytes(), blob.getBytes())
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  })

  unit.section('check where google doesnt support in adv drive', t => {
    t.rxMatch(t.threw(() => Drive.Operations.list()).toString(), /is not/)

  })

  unit.section("exotic driveapps versus Drive", t => {
    const behavior = ScriptApp.isFake ? ScriptApp.__behavior : null;
    const wasStrict = behavior ? behavior.strictSandbox : null;
    if (behavior) {
      // Temporarily disable strict sandbox for this section.
      // Listing files/folders can involve checking parent folders that may not be
      // explicitly whitelisted, causing errors in strict mode.
      behavior.strictSandbox = false;
    }

    try {
      const appPdf = DriveApp.getFilesByType('application/pdf')
      const appPdfPile = []
      while (appPdf.hasNext()) {
        const file = appPdf.next()
        t.is(file.getMimeType(), "application/pdf")
        appPdfPile.push(file)
      }

      t.true(appPdfPile.length >= fixes.MIN_PDFS)

      const rootPdf = DriveApp.getRootFolder().getFilesByType('application/pdf')
      const rootPdfPile = []
      while (rootPdf.hasNext()) {
        const file = rootPdf.next()
        t.is(file.getMimeType(), "application/pdf")
        rootPdfPile.push(file)
      }

      t.true(rootPdfPile.length >= fixes.MIN_ROOT_PDFS)
      if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
    } finally {
      if (behavior) {
        behavior.strictSandbox = wasStrict;
      }
    }
  })

  unit.section("driveapp searching with queries", t => {


    const root = DriveApp.getRootFolder()

    // this gets the folders directly under root folder with given name
    const behavior = ScriptApp.isFake ? ScriptApp.__behavior : null;
    const wasStrict = behavior ? behavior.strictSandbox : null;
    if (behavior) {
      // Temporarily disable strict sandbox for this section.
      // Listing files/folders can involve checking parent folders that may not be
      // explicitly whitelisted, causing errors in strict mode.
      behavior.strictSandbox = false;
    }

    try {
      const folders = root.getFoldersByName(fixes.TEST_FOLDER_NAME)

      const folderPile = []
      while (folders.hasNext()) {
        folderPile.push(folders.next())
      }

      t.is(folderPile.length, 1)

      const filePile = []
      const [folder] = folderPile
      const dapMatches = DriveApp.getFoldersByName(folder.getName())
      t.true(dapMatches.hasNext())
      t.is(dapMatches.next().getName(), folder.getName())

      const files = folder.getFiles()
      while (files.hasNext()) {
        filePile.push(files.next())
      }
      t.is(filePile.length, fixes.TEST_FOLDER_FILES)
      filePile.forEach(file => {
        const matches = folder.getFilesByName(file.getName())
        t.true(matches.hasNext())
        t.is(matches.next().getId(), file.getId())
        t.false(matches.hasNext())
        const dapMatches = DriveApp.getFilesByName(file.getName())
        t.true(dapMatches.hasNext())
        t.is(dapMatches.next().getName(), file.getName())
      })

      if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
    } finally {
      if (behavior) {
        behavior.strictSandbox = wasStrict;
      }
    }
  }, { skip: false })


  unit.section('getting content', t => {


    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), 'fake.txt')
    t.is(file.getParents().next().getId(), folder.getId())
    const blob = file.getBlob()
    t.is(blob.getDataAsString(), fixes.TEXT_FILE_CONTENT)
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  })

  unit.section('extended meta data', t => {

    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    t.true(is.date(file.getLastUpdated()))
    t.true(is.date(file.getDateCreated()))

    t.true(is.string(file.getDescription()) || is.null(file.getDescription()))
    t.true(is.number(file.getSize()))
    t.is(file.getSize(), fixes.TEXT_FILE_CONTENT.length)
    t.false(file.isStarred())
    t.false(file.isTrashed())

    // make sure that nothing got overwritten with enhanced props
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getId(), fixes.TEXT_FILE_ID)

    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.true(is.function(folder.getLastUpdated().getTime))
    t.true(is.date(folder.getLastUpdated()))
    t.true(is.function(folder.getDateCreated().getTime))
    t.true(is.date(folder.getDateCreated()))
    t.true(is.number(folder.getSize()))

    const sheetFile = DriveApp.getFileById(fixes.TEST_SHEET_ID)

    t.true(is.function(sheetFile.getLastUpdated().getTime))
    t.true(is.date(sheetFile.getLastUpdated()))
    t.true(is.function(sheetFile.getDateCreated().getTime))
    t.true(is.date(sheetFile.getDateCreated()))

    t.true(is.nonEmptyString(sheetFile.getName()))
    t.true(is.number(sheetFile.getSize()))
    // dont really know what size to expect for a sheet
    t.true(sheetFile.getSize() > 0)
    t.is(sheetFile.getMimeType(), 'application/vnd.google-apps.spreadsheet')
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())

  }, {
    skip: false
  })



  unit.section('adv drive Apps - drive.apps script is blocked on adc so cant test this for now', t => {
    const { items } = Drive.Apps.list()
    t.true(is.array(items))
    const [i0] = items
    console.log(i0)
    t.deepEqual(Drive.Apps.get(i0.id), i0)
  }, {
    skip: true
  })


  unit.section('trap null ids', t => {
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
    // on live Apps Script, empty string throws "Unexpected error"
    check(() => DriveApp.getFileById(""), /Invalid argument: id|Unexpected error/, 'getFileById("")')

    check(() => DriveApp.getFolderById(null), /Invalid argument: id/, 'getFolderById(null)')
    check(() => DriveApp.getFolderById(undefined), /Invalid argument: id/, 'getFolderById(undefined)')
    check(() => DriveApp.getFolderById(""), /Invalid argument: id|Unexpected error/, 'getFolderById("")')

    // Advanced service behavior varies and might not throw on all platforms for null
    check(() => Drive.Files.get(null), /Invalid argument: id|Unexpected error|required/, 'Drive.Files.get(null)')
    check(() => Drive.Files.get(undefined), /Invalid argument: id|Unexpected error|required/, 'Drive.Files.get(undefined)')
    check(() => Drive.Files.get(""), /Invalid argument: id|Unexpected error|required/, 'Drive.Files.get("")')
  })


  if (!pack) {
    unit.report()
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testDrive);