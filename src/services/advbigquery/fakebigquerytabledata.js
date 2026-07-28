import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvBigQueryTabledata = (...args) =>
  Proxies.guard(new FakeAdvBigQueryTabledata(...args));

/**
 * @see https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata
 */
class FakeAdvBigQueryTabledata extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, "tabledata", Syncit.fxBigQuery);
    this.bigquery = mainService;
    this.__fakeObjectType = "BigQuery.Tabledata";
  }

  insertAll(requestBody, projectId, datasetId, tableId, options) {
    const { response, data } = this._call("insertAll", { projectId, datasetId, tableId, requestBody, ...options });
    return data;
  }

  list(projectId, datasetId, tableId, options) {
    const { response, data } = this._call("list", { projectId, datasetId, tableId, ...options });
    return data;
  }
}
