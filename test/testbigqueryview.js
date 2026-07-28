import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

/**
 * Runs a query against a BigQuery view and summarizes the unique owners per loadId.
 * @param {object} pack - The test packing object (optional).
 */
export const testBigQueryView = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  // 1. Determine the Project ID
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "gas-fakes-474508";

  // 2. Define the SQL query
  const querySql = `
    SELECT loadId, COUNT(DISTINCT ownerId) AS unique_owners 
    FROM \`scrmin.gassypedia.big_join\` 
    GROUP BY loadId
  `;

  unit.section("BigQuery View Query Execution", t => {
    console.log(`Executing query on BigQuery view using project ID: ${projectId}`);
    
    // 3. Execute the query using BigQuery.Jobs.query
    const queryRequest = {
      query: querySql,
      useLegacySql: false,
    };

    const queryResults = BigQuery.Jobs.query(queryRequest, projectId);

    // 4. Process and summarize the results
    if (!queryResults || !queryResults.rows) {
      t.fail("Query execution failed or returned no rows.");
      return;
    }

    console.log("\n--- Query Results Summary ---");
    
    queryResults.rows.forEach((row, index) => {
      const rowData = row.f.map(field => field.v);
      const [loadId, uniqueOwnersStr] = rowData;
      const uniqueOwners = parseInt(uniqueOwnersStr, 10);
      
      console.log(`Row ${index + 1}: Load ID: ${loadId}, Unique Owners: ${uniqueOwners}`);
      
      // Assertions
      t.true(is.string(loadId) || is.number(loadId), "Load ID should be a string or number.");
      t.true(!isNaN(uniqueOwners), "Unique Owners count should be a valid number.");
    });
    
    console.log("-----------------------------\n");
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

// Register the test function for the test runner
wrapupTest(testBigQueryView);
