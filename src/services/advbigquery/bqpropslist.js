export const propsList = {
  "newQueryRequest": [
    "query",
    "parameters",
    "useLegacySql",
    "parameterMode",
    "queryParameters",
    "timeoutMs",
    "useQueryCache",
    "dryRun",
    "maxResults",
    "location",
    "defaultDataset",
    "connectionProperties",
    "requestId"
  ],
  "newQueryParameter": [
    "name",
    "parameterType",
    "parameterValue"
  ],
  "newQueryParameterType": [
    "type",
    "structTypes",
    "arrayType"
  ],
  "newQueryParameterValue": [
    "value",
    "arrayValues",
    "structValues"
  ],
  "newDataset": [
    "datasetReference",
    "friendlyName",
    "description",
    "defaultTableExpirationMs",
    "labels",
    "access",
    "location",
    "defaultPartitionExpirationMs",
    "defaultEncryptionConfiguration"
  ],
  "newDatasetReference": [
    "datasetId",
    "projectId"
  ],
  "newTable": [
    "tableReference",
    "friendlyName",
    "description",
    "schema",
    "timePartitioning",
    "rangePartitioning",
    "clustering",
    "requirePartitionFilter",
    "labels",
    "expirationTime",
    "view",
    "materializedView",
    "externalDataConfiguration",
    "encryptionConfiguration"
  ],
  "newTableReference": [
    "projectId",
    "datasetId",
    "tableId"
  ],
  "newTableSchema": [
    "fields"
  ],
  "newTableFieldSchema": [
    "name",
    "type",
    "mode",
    "fields",
    "description",
    "policyTags",
    "categories",
    "maxLength",
    "precision",
    "scale",
    "roundingMode",
    "collation"
  ],
  "newJob": [
    "configuration",
    "jobReference"
  ],
  "newJobReference": [
    "jobId",
    "projectId",
    "location"
  ],
  "newJobConfiguration": [
    "query",
    "load",
    "extract",
    "copy",
    "dryRun",
    "jobType",
    "labels"
  ],
  "newJobConfigurationQuery": [
    "query",
    "destinationTable",
    "writeDisposition",
    "createDisposition",
    "defaultDataset",
    "priority",
    "allowLargeResults",
    "useQueryCache",
    "flattenResults",
    "useLegacySql",
    "parameterMode",
    "queryParameters",
    "schemaUpdateOptions",
    "timePartitioning",
    "rangePartitioning",
    "clustering",
    "connectionProperties",
    "createSession"
  ],
  "newJobConfigurationLoad": [
    "sourceUris",
    "schema",
    "destinationTable",
    "createDisposition",
    "writeDisposition",
    "skipLeadingRows",
    "fieldDelimiter",
    "allowQuotedNewlines",
    "allowJaggedRows",
    "ignoreUnknownValues",
    "projectionFields",
    "autodetect",
    "schemaUpdateOptions",
    "timePartitioning",
    "rangePartitioning",
    "clustering",
    "sourceFormat"
  ],
  "newJobConfigurationExtract": [
    "sourceTable",
    "destinationUris",
    "destinationFormat",
    "compression",
    "fieldDelimiter",
    "printHeader",
    "useAvroLogicalTypes"
  ],
  "newJobConfigurationTableCopy": [
    "sourceTable",
    "sourceTables",
    "destinationTable",
    "createDisposition",
    "writeDisposition",
    "operationType"
  ],
  "newInsertAllRequest": [
    "rows",
    "skipInvalidRows",
    "ignoreUnknownValues",
    "templateSuffix",
    "kind"
  ],
  "newInsertAllRequestRows": [
    "insertId",
    "json"
  ],
  "newTableRow": [
    "f"
  ],
  "newTableCell": [
    "v"
  ]
};
