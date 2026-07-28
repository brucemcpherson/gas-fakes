import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvBigQueryTables = (...args) =>
  Proxies.guard(new FakeAdvBigQueryTables(...args));

/**
 * @see https://cloud.google.com/bigquery/docs/reference/rest/v2/tables
 */
class FakeAdvBigQueryTables extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, "tables", Syncit.fxBigQuery);
    this.bigquery = mainService;
    this.__fakeObjectType = "BigQuery.Tables";
  }

  list(projectId, datasetId, options) {
    const { response, data } = this._call("list", { projectId, datasetId, ...options });
    return data;
  }

  get(projectId, datasetId, tableId, options) {
    const { response, data } = this._call("get", { projectId, datasetId, tableId, ...options });
    return data;
  }

  insert(requestBody, projectId, datasetId, options) {
    const { response, data } = this._call("insert", { projectId, datasetId, requestBody, ...options });
    return data;
  }

  update(requestBody, projectId, datasetId, tableId, options) {
    const { response, data } = this._call("update", { projectId, datasetId, tableId, requestBody, ...options });
    return data;
  }

  patch(requestBody, projectId, datasetId, tableId, options) {
    const { response, data } = this._call("patch", { projectId, datasetId, tableId, requestBody, ...options });
    return data;
  }

  delete(projectId, datasetId, tableId, options) {
    const { response, data } = this._call("delete", { projectId, datasetId, tableId, ...options });
    return data;
  }
}
