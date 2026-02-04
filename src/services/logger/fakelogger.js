import { format } from 'util';
import { Proxies } from '../../support/proxies.js';


// --- Cloud Logging Integration ---
// instead of using the node client for this, which is out of date and uses conflicting version of google-auth-library
// im going to use its json api

/**
 * @class
 * @implements {GoogleAppsScript.Base.Logger}
 */
export class FakeLogger {
  constructor() {
    /**
     * @private
     * @type {string[]}
     */
    this.__log = [];
    /**
     * @private
     * @type {string}
     */
    this.__destination = (process.env.LOG_DESTINATION || 'CONSOLE').toUpperCase();
    this.__startedLoggingAt = new Date()
    this.__cloudLogLink = 'No cloud logging enabled - use Logger.__logDestination = "CLOUD" or "BOTH" to enable'
    if (['CLOUD', 'BOTH'].includes(this.__destination)) {
      writeToCloudOrConsole("...Initializing cloud logging", this)
    }
  }

  /**
   * Clears the log.
   */
  clear() {
    this.__log = [];
  }

  /**
   * Returns the log contents.
   * @returns {string}
   */
  getLog() {
    return this.__log.join('\n');
  }

  /**
   * Logs a message.
   * @param {string} formatOrData
   * @param {...any} values
   * @returns {FakeLogger}
   */
  log(formatOrData, ...values) {
    // Check the instance's destination property.
    if (this.__destination === 'NONE') {
      // Still push to the internal log for getLog(), but don't output.
      const message = format(formatOrData, ...values);
      this.__log.push(message);
      return this;
    }

    const message = format(formatOrData, ...values);
    this.__log.push(message);


    // Pass the destination and instance context to the writer function.
    writeToCloudOrConsole(message, this);

    return this;
  }

  /**
   * Returns 'Logger'.
   * @returns {string}
   */
  toString() {
    return 'Logger';
  }

  /**
   * Sets the logging destination dynamically.
   * @param {string} destination - The destination ('CONSOLE', 'CLOUD', 'BOTH', 'NONE').
   * @returns {FakeLogger}
   */
  __setLogDestination(destination) {
    if (['CONSOLE', 'CLOUD', 'BOTH', 'NONE'].includes(destination.toUpperCase())) {
      this.__destination = destination.toUpperCase();
    }
    // we need to send a logger message to initialize and test
    this.log(`...setting destination to ${this.__destination}`)
    return this;
  }

  // to allow code compatibility without error on apps script, we should use the setter since it'll be undefined on Apps live Script
  set __logDestination(destination) {
    return this.__setLogDestination(destination);
  }

}

/**
 * @returns {FakeLogger}
 */
export const newFakeLogger = (...args) => Proxies.guard(new FakeLogger(...args));

/**
 * Writes a log message to the configured destination (Cloud Logging or console).
 * @param {string} message The log message.
 * @private
 * @param {FakeLogger} loggerInstance The logger instance, to access its destination.
 */
const writeToCloudOrConsole = (message, loggerInstance) => {
  const logDestination = loggerInstance.__destination;
  const useConsoleLogging = logDestination === 'CONSOLE' || logDestination === 'BOTH';
  const useCloudLogging = logDestination === 'CLOUD' || logDestination === 'BOTH';
  const logName = 'gas-fakes/console_logs';
  const projectId = ScriptApp.__projectId;
  const scriptId = ScriptApp.getScriptId();
  const userId = ScriptApp.__userId;


  // Write to console if CONSOLE or BOTH is specified.
  if (useConsoleLogging) {
    // Write structured JSON to stdout for agent-based collection or local viewing.
    const logEntry = {
      message: message,
      severity: 'INFO',
    };
    console.log(JSON.stringify(logEntry));
  }

  // Write to Cloud Logging if CLOUD or BOTH is specified and client is ready.
  if (useCloudLogging) {

    const metadata = {
      // Use the 'global' resource type, which is a generic fallback for applications
      // not running on a specific GCP compute service.
      resource: { type: 'global' },
      labels: {
        'gas-fakes-scriptId': scriptId,
        'gas-fakes-userId': userId,
      },
      jsonPayload: { message: message },
      severity: 'INFO',
    };

    // filter on user/script/priject and run times
    // we'll extend the end date filter to a little more than now
    const aLittleMore = 7 * 1000
    const endDate = new Date(new Date().getTime() + aLittleMore)
    const startDate = loggerInstance.__startedLoggingAt

    const base = `https://console.cloud.google.com/logs/query;`

    // B. Build the RAW LQL Filter String (NO "query=" prefix here)
    const lqlParts = [
      // LogName filter
      `logName="projects/${projectId}/logs/${logName.replace('/', '%2F')}"`,
      // Labels filter
      ...Object.keys(metadata.labels).map(k => `jsonPayload.labels.${k}="${metadata.labels[k]}"`),
      // Date filter (recommended for query stability)
      `timestamp>="${startDate.toISOString()}"`,
      `timestamp<="${endDate.toISOString()}"`
    ];
    const fullLQLQuery = lqlParts.join(' AND ');

    // C. Encode ONLY the filter content, then prepend the literal 'query='
    const encodedQueryParam = `query=${encodeURIComponent(fullLQLQuery)}`;

    // D. Create the timeRange parameter (correct casing)
    const timeRangeParam = `;timeRange=${startDate.getTime()}/${endDate.getTime()}`;

    // E. Assemble the final URL
    loggerInstance.__cloudLogLink = base + encodedQueryParam + `?project=${projectId}`;

    const apiBase = 'https://logging.googleapis.com/v2/entries:write'
    // Log the actual entry with its logName
    metadata.logName = `projects/${projectId}/logs/${logName.replace('/', '%2F')}`

    const payload = JSON.stringify({
      entries: [
        metadata
      ]
    })
    const token = ScriptApp.__getSourceOAuthToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      'content-type': "application/json",
    }
    const response = UrlFetchApp.fetch(apiBase, {
      method: 'post',
      headers,
    })
    if (response.getResponseCode() !== 200) {
      console.error('logging failure', response.getContentText())
    }

  }

};
