import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { wrapupTest } from './testassist.js'
import is from '@sindresorhus/is'

export const testKSuiteDrive = (pack) => {
  const { unit, fixes } = pack || initTests()

  // Only run this test in fake mode as it requires KSUITE_TOKEN and platform switching
  if (!ScriptApp.isFake) {
    console.log('...skipping KSuite Drive tests as not in fake mode')
    return { unit, fixes }
  }

  if (!process.env.KSUITE_TOKEN) {
    console.log('...skipping KSuite Drive tests as KSUITE_TOKEN is not available')
    return { unit, fixes }
  }

  const behavior = ScriptApp.__behavior
  const toTrash = []

  // Helper to run a section with KSuite platform active and sandbox disabled
  const kSection = (name, fn) => {
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
    })
  }

  kSection('KSuite platform basics', t => {
    const rootFolder = DriveApp.getRootFolder()
    // With the new mapping, root is now the Private folder (usually ID != 1)
    t.not(rootFolder.getId(), '1', 'Root folder should be the Private folder, not the Super Root (1)')
    
    // root name depends on discovery, but should be a string
    t.true(is.string(rootFolder.getName()))

    // Test listing folders in root
    const folders = rootFolder.getFolders()
    const folderList = []
    while (folders.hasNext()) {
      folderList.push(folders.next())
    }
    t.true(folderList.length > 0, 'Should find folders in kDrive root')
    
    if (folderList.length > 0) {
      const firstFolder = folderList[0]
      const checkFolder = DriveApp.getFolderById(firstFolder.getId())
      t.is(checkFolder.getId(), firstFolder.getId(), 'getFolderById should return the same ID')
      t.is(checkFolder.getName(), firstFolder.getName(), 'getFolderById should return the same name')
    }

    // Test creating a folder
    const folderName = fixes.PREFIX + 'ksuite-test-folder-' + Date.now()
    console.log(`Creating folder: ${folderName}...`)
    
    let targetFolder = rootFolder
    const newFolder = targetFolder.createFolder(folderName)
    console.log(`Created folder: ${newFolder.getName()} (ID: ${newFolder.getId()})`)
    t.is(newFolder.getName(), folderName, 'createFolder should return folder with correct name')
    t.true(is.nonEmptyString(newFolder.getId()), 'createFolder should return folder with an ID')
    toTrash.push(newFolder)
    
    // Verify it exists
    const verifyFolder = DriveApp.getFolderById(newFolder.getId())
    t.is(verifyFolder.getName(), folderName, 'Verified folder name matches')

    // Test renaming
    const renamedFolderName = folderName + '-renamed'
    console.log(`Renaming folder to: ${renamedFolderName}...`)
    newFolder.setName(renamedFolderName)
    t.is(newFolder.getName(), renamedFolderName, 'setName should update name locally')
    
    const verifyRenamedFolder = DriveApp.getFolderById(newFolder.getId())
    t.is(verifyRenamedFolder.getName(), renamedFolderName, 'Verified renamed folder name matches from API')

    // Test creating a file in the new folder
    const fileName = fixes.PREFIX + 'ksuite-test-file-' + Date.now() + '.txt'
    const content = 'Hello KSuite! ' + new Date().toISOString()
    console.log(`Creating file: ${fileName} in folder ID: ${newFolder.getId()}...`)
    const newFile = newFolder.createFile(fileName, content)
    console.log(`Created file: ${newFile.getName()} (ID: ${newFile.getId()})`)
    t.is(newFile.getName(), fileName, 'createFile should return file with correct name')
    toTrash.push(newFile)
    
    // Verify it exists
    const verifyFile = DriveApp.getFileById(newFile.getId())
    t.is(verifyFile.getName(), fileName, 'Verified file name matches')
    t.is(verifyFile.getBlob().getDataAsString(), content, 'Verified file content matches')

    // Test renaming file
    const renamedFileName = fileName + '-renamed.txt'
    newFile.setName(renamedFileName)
    t.is(newFile.getName(), renamedFileName, 'File setName should update name locally')
    t.is(DriveApp.getFileById(newFile.getId()).getName(), renamedFileName, 'File setName should update name in API')
  })

  kSection('KSuite advanced drive basics', t => {
    const rootFolder = DriveApp.getRootFolder()
    const rootId = rootFolder.getId()

    // Drive.Files.get
    const advFile = Drive.Files.get(rootId)
    t.is(advFile.id, rootId)
    t.is(advFile.name, rootFolder.getName())
    t.is(advFile.mimeType, 'application/vnd.google-apps.folder')

    // Drive.Files.list
    const list = Drive.Files.list({ q: `'${rootId}' in parents` })
    t.true(is.array(list.files))
    t.true(list.files.length > 0)
    
    const first = list.files[0]
    t.true(is.nonEmptyString(first.id))
    t.true(is.nonEmptyString(first.name))
  })

  kSection('KSuite DriveApp searches and listing', t => {
    const root = DriveApp.getRootFolder()
    
    // Test getFolders()
    const folders = root.getFolders()
    let count = 0
    while (folders.hasNext() && count < 5) {
      const f = folders.next()
      t.true(is.nonEmptyString(f.getId()))
      // Folders don't have getMimeType in GAS, but they should be Folders
      t.is(f.toString(), f.getName())
      count++
    }
    t.true(count > 0, 'Should have at least one folder')

    // Test getFiles()
    const files = root.getFiles()
    count = 0
    while (files.hasNext() && count < 5) {
      const f = files.next()
      t.not(f.getMimeType(), 'application/vnd.google-apps.folder')
      count++
    }
  })

  kSection('KSuite trashing and restoring', t => {
    const root = DriveApp.getRootFolder()
    const folderName = fixes.PREFIX + 'trash-test-' + Date.now()
    const folder = root.createFolder(folderName)
    
    t.false(folder.isTrashed())
    
    folder.setTrashed(true)
    t.true(folder.isTrashed(), 'Folder should be reported as trashed')
    
    const checkFolder = DriveApp.getFolderById(folder.getId())
    t.true(checkFolder.isTrashed(), 'API should report folder as trashed')

    folder.setTrashed(false)
    t.false(folder.isTrashed(), 'Folder should be reported as restored')
    t.false(DriveApp.getFolderById(folder.getId()).isTrashed(), 'API should report folder as restored')

    // Cleanup
    folder.setTrashed(true) 
  })

  kSection('KSuite copying files', t => {
    const root = DriveApp.getRootFolder()
    const sourceName = fixes.PREFIX + 'copy-source-' + Date.now() + '.txt'
    const content = 'Original content'
    const sourceFile = root.createFile(sourceName, content)
    toTrash.push(sourceFile)

    // Test makeCopy()
    const copyName = sourceName + '-copy'
    const copyFile = sourceFile.makeCopy(copyName)
    t.is(copyFile.getName(), copyName)
    t.not(copyFile.getId(), sourceFile.getId())
    t.is(copyFile.getBlob().getDataAsString(), content)
    toTrash.push(copyFile)

    // Test Drive.Files.copy (Advanced Service)
    const advCopyName = sourceName + '-adv-copy'
    const advCopy = Drive.Files.copy({ name: advCopyName }, sourceFile.getId())
    t.is(advCopy.name, advCopyName)
    t.not(advCopy.id, sourceFile.getId())
    t.is(DriveApp.getFileById(advCopy.id).getBlob().getDataAsString(), content)
    toTrash.push(DriveApp.getFileById(advCopy.id))
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

wrapupTest(testKSuiteDrive);
