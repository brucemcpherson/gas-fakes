export const testFixes = {
  "SHARED_FILE_OWNER": "bruce@mcpher.com",
  "EMAIL": "bruce@mcpher.com",
  "TIMEZONE": "Europe\/London",
  "TEST_LOCALE": "en",
  "OWNER_NAME": "Bruce Mcpherson",
  "TEST_DOC_WITH_POS_IMAGE_ID": "",
  "TEST_BORDERS_ID": "1hRGdrYHEPixXTuQLeL3Z0qGRZVs_8ojMIm6D4KrCh1o",
  "TEST_AIRPORTS_ID": "1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ",
  "TEST_AIRPORTS_NAME": "airport list",
  "TEST_FOLDER_NAME": "math",
  "TEST_FOLDER_FILES": 3,
  "TEST_FOLDER_ID": "1Zww9oCTFR7zYcUYXxd70yQr3sw6VdLG-",
  "TEXT_FILE_NAME": "fake.txt",
  "TEXT_FILE_ID": "1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p",
  "TEXT_FILE_TYPE": "text\/plain",
  "TEXT_FILE_CONTENT": "foo is not bar",
  "BLOB_NAME": "foo.txt",
  "BLOB_TYPE": "text\/plain",
  "TEST_SHEET_ID": "1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI",
  "TEST_SHEET_NAME": "sharedlibraries",
  "PUBLIC_SHARE_FILE_ID": "1OFJk38kW9TRrEf-B9F1gTZk2uLV-ZSpR",
  "SHARED_FILE_ID": "1uz4cxEDxtQzu0cBb1B4h6fsjgWy7hNFf",
  "PDF_ID": "1-c_5JV1Br5KkEcG6Pu518ocM6CN4BBFz",
  "SCRATCH_VIEWER": "viewer@mcpher.com",
  "SCRATCH_EDITOR": "editor@mcpher.com",
  "SCRATCH_B_VIEWER": "viewer2@mcpher.com",
  "SCRATCH_B_EDITOR": "editor2@mcpher.com",
  "MIN_ROOT_PDFS": 2,
  "MIN_PDFS": 2,
  "MIN_FOLDERS_ROOT": 30,
  "SKIP_SINGLE_PARENT": 1,
  "ZIP_TYPE": "application\/zip",
  "KIND_DRIVE": "drive#file",
  "RANDOM_IMAGE": "https:\/\/picsum.photos\/200",
  "API_URL": "http:\/\/suggestqueries.google.com\/complete\/search?client=chrome&hl=en&q=trump",
  "API_TYPE": "text\/javascript",
  "CLEAN": true,
  get PREFIX() { return ScriptApp.isFake ? "--f" : "--g"; },
  "CODA_WORKSPACE": "mcpher.com",
  "CODA_MY_DRIVE": "My Drive"
};

// altough we are set up to use multiple backends, to save cost i;ve closed the paid for ones down
const permdb = ["neon"]
const alldbs = permdb.concat(["cloudsql-mysql", "cloudsql-pg","aiven"])
const usedbs = permdb

export const getPotentialBackends = (Jdbc, use = usedbs) => {
  const getUseProxy = (envVar) => {
    // only relevant if running on node
    if (!ScriptApp.isFake) return false;
    const connectionString = process.env[envVar];
    return Jdbc.__useProxy(connectionString);
  };


  return [
    {
      prop: "DATABASE_COCKROACH_PG_URL",
      label: "Cockroach DB",
      isGoogle: false,
      type: "pg",
      useProxy: false,
      use: use.includes("cockroach"),
    },
    {
      prop: "DATABASE_AIVEN_MYSQL_URL",
      label: "Aiven MySQL",
      isGoogle: false,
      type: "mysql",
      useProxy: false,
      use: use.includes("aiven"),
    },
    {
      prop: "CLOUD_SQL_DATABASE_MYSQL_URL",
      label: "Google Cloud SQL MySQL",
      isGoogle: true,
      type: "mysql",
      useProxy: getUseProxy("CLOUD_SQL_DATABASE_MYSQL_URL"),
      use: use.includes("cloudsql-mysql"),
    },
    {
      prop: "CLOUD_SQL_DATABASE_PG_URL",
      label: "Google Cloud SQL PG",
      isGoogle: true,
      type: "pg",
      useProxy: getUseProxy("CLOUD_SQL_DATABASE_PG_URL"),
      use: use.includes("cloudsql-pg"),
    },
    {
      prop: "DATABASE_PG_URL",
      label: "Neon Postgres",
      type: "pg",
      isGoogle: false,
      useProxy: false,
      use: use.includes("neon"),
    },
  ].filter((b) => b.use);
};
