import "@mcpher/gas-fakes";

const t = (platform) => {
  ScriptApp.__platform = platform;
  const root = DriveApp.getRootFolder();
  // root comes back as actual folder id of my Drive for coda its the workspace id because My Docs is not the same thing as My Drive
  console.log(platform, root.getId());
  // My Drive for google and mcpher.com for coda
  console.log(platform, root.getName());

  const getParents = (file) => {
    const parents = [];
    let p = file.getParents();
    while (p.hasNext()) {
      const parent = p.next();
      parents.push(parent);
    }
    console.log(
      platform,
      "parents of ",
      file.getName(),
      "are: ",
      parents.map((p) => p.getName()),
    );
    return parents;
  };

  const getFiles = (folder) => {
    console.log(platform, "...files in folder: ", folder.getName());
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      console.log(platform, file.getName(), file.getId());
    }
    return files
  };

  // lets try getting the folders right off the root
  const topFolders = root.getFolders();
  const folders = [];
  while (topFolders.hasNext()) {
    const file = topFolders.next();
    folders.push(file);
    const parents = getParents(file);
    console.log(platform, "name: ", file.getName(), "id: ", file.getId());
  }
  console.log(platform, "folders at top level: ", folders.length);

  // lets try getting the files
  const topFiles = root.getFiles();
  const files = [];
  while (topFiles.hasNext()) {
    const file = topFiles.next();
    files.push(file);
    const parents = getParents(file);
    console.log(platform, "name: ", file.getName(), "id: ", file.getId());
  }
  console.log(platform, "files at top level: ", files.length);

  // now lets try getting files in each folder
  for (const folder of folders) {
    getFiles(folder);
  }
};

// t('google')
t("coda");
