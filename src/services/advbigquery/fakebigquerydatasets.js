import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvBigQueryDatasets = (...args) =>
  Proxies.guard(new FakeAdvBigQueryDatasets(...args));

/**
 * @see https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets
 */
class FakeAdvBigQueryDatasets extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, "datasets", Syncit.fxBigQuery);
    this.bigquery = mainService;
    this.__fakeObjectType = "BigQuery.Datasets";
  }

  list(projectId, options) {
    const { response, data } = this._call("list", { projectId, ...options });
    return data;
  }

  get(projectId, datasetId, options) {
    const { response, data } = this._call("get", { projectId, datasetId, ...options });
    return data;
  }

  insert(requestBody, projectId, options) {
    const { response, data } = this._call("insert", { projectId, requestBody, ...options });
    return data;
  }

  update(requestBody, projectId, datasetId, options) {
    const { response, data } = this._call("update", { projectId, datasetId, requestBody, ...options });
    return data;
  }

  patch(requestBody, projectId, datasetId, options) {
    const { response, data } = this._call("patch", { projectId, datasetId, requestBody, ...options });
    return data;
  }

  delete(projectId, datasetId, options) {
    const { response, data } = this._call("delete", { projectId, datasetId, ...options });
    return data;
  }
}
