import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvBigQueryJobs = (...args) =>
  Proxies.guard(new FakeAdvBigQueryJobs(...args));

/**
 * @see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs
 */
class FakeAdvBigQueryJobs extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, "jobs", Syncit.fxBigQuery);
    this.bigquery = mainService;
    this.__fakeObjectType = "BigQuery.Jobs";
  }

  list(projectId, options) {
    const { response, data } = this._call("list", { projectId, ...options });
    return data;
  }

  get(projectId, jobId, options) {
    const { response, data } = this._call("get", { projectId, jobId, ...options });
    return data;
  }

  insert(requestBody, projectId, options) {
    const { response, data } = this._call("insert", { projectId, requestBody, ...options });
    return data;
  }

  query(requestBody, projectId, options) {
    const { response, data } = this._call("query", { projectId, requestBody, ...options });
    return data;
  }

  getQueryResults(projectId, jobId, options) {
    const { response, data } = this._call("getQueryResults", { projectId, jobId, ...options });
    return data;
  }

  cancel(projectId, jobId, options) {
    const { response, data } = this._call("cancel", { projectId, jobId, ...options });
    return data;
  }
}
