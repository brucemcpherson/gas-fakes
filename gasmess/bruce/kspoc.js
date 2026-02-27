import '@mcpher/gas-fakes'


// this tells gas-fakes we'd like auth to be available for both ksuite and google
ScriptApp.__platformAuth = ["ksuite", "google"]


const explore = (folder, depth = 0) => {
  const indent = '  '.repeat(depth)
  console.log(`${indent}FOLDER: ${folder.getName()} (ID: ${folder.getId()})`)

  // Show files in this folder
  const files = folder.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    console.log(`${indent}  FILE: ${file.getName()} (ID: ${file.getId()})`)
  }

  // Drill into subfolders
  const folders = folder.getFolders()
  while (folders.hasNext()) {
    explore(folders.next(), depth + 1)
  }
}

// run explore on each platform
const dual = () => {
  ScriptApp.__platform = 'ksuite'
  const rootFolder = DriveApp.getRootFolder()
  console.log('--- KSuite Recursive Explorer ---')
  explore(rootFolder)

  ScriptApp.__platform = 'google'
  const rootFolder2 = DriveApp.getRootFolder()
  console.log('--- Google Workspace Recursive Explorer ---')
  explore(rootFolder2)
}

const demoTransfer = () => {
  // copy the files from ksuite
  copyFiles({
    sourcePlatform: 'ksuite',
    targetPlatform: 'google',
    sourceFolderName: 'gas-fakes-assets',
    targetFolderName: 'from-ksuite-to-google'
  })
  // and back again

  copyFiles({
    sourcePlatform: 'google',
    targetPlatform: 'ksuite',
    sourceFolderName: 'from-ksuite-to-google',
    targetFolderName: 'from-google-to-ksuite'
  })

}

const copyFiles = ({ sourcePlatform, targetPlatform, sourceFolderName, targetFolderName }) => {

  // set whih platform to use
  ScriptApp.__platform = sourcePlatform

  // find the target folder in ksuite
  const sourceFolders = DriveApp.getFoldersByName(sourceFolderName)
  if (!sourceFolders.hasNext()) {
    throw new Error(`Source folder ${sourceFolderName} not found`)
  }


  // get the files in that source folder
  const files = sourceFolders.next().getFiles()
  const blobsToCopy = []
  while (files.hasNext()) {
    const file = files.next()
    blobsToCopy.push(file.getBlob())
  }

  // now use an alternative platform
  ScriptApp.__platform = targetPlatform

  // create the folder if it doesn't exist
  const targetFolders = DriveApp.getFoldersByName(targetFolderName)
  let targetFolder = targetFolders.hasNext() 
    ? targetFolders.next() 
    : DriveApp.createFolder(targetFolderName)

  // now copy the blobs to the target folder
  blobsToCopy.forEach(blob => {
    targetFolder.createFile(blob)
  })
  return blobsToCopy
}

demoTransfer()
