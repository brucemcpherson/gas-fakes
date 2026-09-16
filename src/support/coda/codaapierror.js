/**
 * Custom error class for Coda API HTTP error responses.
 */
export class CodaAPIError extends Error {
  /**
   * Creates an instance of CodaAPIError.
   *
   * @param {string} message - Error message describing the failure.
   * @param {number} status - HTTP status code returned by the Coda API.
   * @param {Object} [data] - Raw JSON response body or payload details.
   */
  constructor(message, status, data) {
    const issues = data?.codaDetail?.issues;
    let fullMessage = message;
    if (issues) {
      fullMessage += issues.map(JSON.stringify).join("\n");
    }
    super(fullMessage);
    this.name = "CodaAPIError";
    this.status = status;
  }
}