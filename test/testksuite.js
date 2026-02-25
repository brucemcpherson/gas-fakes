import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { wrapupTest } from './testassist.js'
import is from '@sindresorhus/is'

export const testKSuite = (pack) => {
  const { unit, fixes } = pack || initTests()

  // Only run this test in fake mode as it requires KSUITE_TOKEN and platform switching
  if (!ScriptApp.isFake) {
    console.log('...skipping KSuite tests as not in fake mode')
    return { unit, fixes }
  }

  if (!process.env.KSUITE_TOKEN) {
    console.log('...skipping KSuite tests as KSUITE_TOKEN is not available')
    return { unit, fixes }
  }

  unit.section('KSuite platform basics', t => {
    const originalPlatform = ScriptApp.__platform
    const behavior = ScriptApp.isFake ? ScriptApp.__behavior : null
    
    ScriptApp.__platform = 'ksuite'

    // Disable sandbox for KSuite tests
    const wasSandbox = behavior ? behavior.sandboxMode : false
    if (behavior) {
      behavior.sandboxMode = false
    }

    try {
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
      if (folderList.length > 0) {
        console.log(`Root creation might be denied, trying inside ${folderList[0].getName()}...`)
        targetFolder = folderList[0]
      }

      try {
        const newFolder = targetFolder.createFolder(folderName)
        console.log(`Created folder: ${newFolder.getName()} (ID: ${newFolder.getId()})`)
        t.is(newFolder.getName(), folderName, 'createFolder should return folder with correct name')
        t.true(is.nonEmptyString(newFolder.getId()), 'createFolder should return folder with an ID')
        
        // Verify it exists
        const verifyFolder = DriveApp.getFolderById(newFolder.getId())
        t.is(verifyFolder.getName(), folderName, 'Verified folder name matches')

        // Test renaming
        const renamedFolderName = folderName + '-renamed'
        console.log(`Renaming folder to: ${renamedFolderName}...`)
        newFolder.setName(renamedFolderName)
        t.is(newFolder.getName(), renamedFolderName, 'setName should update name locally')
        
        // Test creating a file in the new folder
        const fileName = fixes.PREFIX + 'ksuite-test-file-' + Date.now() + '.txt'
        const content = 'Hello KSuite! ' + new Date().toISOString()
        console.log(`Creating file: ${fileName} in folder ID: ${newFolder.getId()}...`)
        const newFile = newFolder.createFile(fileName, content)
        console.log(`Created file: ${newFile.getName()} (ID: ${newFile.getId()})`)
        t.is(newFile.getName(), fileName, 'createFile should return file with correct name')
        
        // Verify it exists
        const verifyFile = DriveApp.getFileById(newFile.getId())
        t.is(verifyFile.getName(), fileName, 'Verified file name matches')
        t.is(verifyFile.getBlob().getDataAsString(), content, 'Verified file content matches')

        // CLEANUP
        console.log('Cleaning up...')
        newFile.setTrashed(true)
        newFolder.setTrashed(true)

      } catch (err) {
        console.warn(`Failed to create resource: ${err.message}`)
        t.true(err.message.includes('permissions') || err.message.includes('denied') || err.message.includes('already_exists'), 'Expected error if creation fails')
      }

    } finally {
      ScriptApp.__platform = originalPlatform
      if (behavior) behavior.sandboxMode = wasSandbox
    }
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

wrapupTest(testKSuite);
