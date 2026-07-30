/**
 * @file advbigquery/fakebigquery.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced BigQuery service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { propsList } from "./bqpropslist.js";
import { newFakeAdvBigQueryDatasets } from "./fakebigquerydatasets.js";
import { newFakeAdvBigQueryJobs } from "./fakebigqueryjobs.js";
import { newFakeAdvBigQueryProjects } from "./fakebigqueryprojects.js";
import { newFakeAdvBigQueryTabledata } from "./fakebigquerytabledata.js";
import { newFakeAdvBigQueryTables } from "./fakebigquerytables.js";

class FakeAdvBigQuery {
  constructor() {
    this.__fakeObjectType = "BigQuery";

    Reflect.ownKeys(propsList).forEach((p) => {
      this[p] = () => advClassMaker(propsList[p]);
    });
  }

  toString() {
    return "AdvancedServiceIdentifier{name=bigquery, version=v2}";
  }

  getVersion() {
    return "v2";
  }

  get Datasets() {
    return newFakeAdvBigQueryDatasets(this);
  }

  get Jobs() {
    return newFakeAdvBigQueryJobs(this);
  }

  get Projects() {
    return newFakeAdvBigQueryProjects(this);
  }

  get Tabledata() {
    return newFakeAdvBigQueryTabledata(this);
  }

  get Tables() {
    return newFakeAdvBigQueryTables(this);
  }
}

export const newFakeBigQuery = (...args) =>
  Proxies.guard(new FakeAdvBigQuery(...args));
