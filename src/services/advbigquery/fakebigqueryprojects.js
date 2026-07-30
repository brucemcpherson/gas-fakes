import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvBigQueryProjects = (...args) =>
  Proxies.guard(new FakeAdvBigQueryProjects(...args));

/**
 * @see https://cloud.google.com/bigquery/docs/reference/rest/v2/projects
 */
class FakeAdvBigQueryProjects extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, "projects", Syncit.fxBigQuery);
    this.bigquery = mainService;
    this.__fakeObjectType = "BigQuery.Projects";
  }

  list(options) {
    const { response, data } = this._call("list", options);
    return data;
  }
}
