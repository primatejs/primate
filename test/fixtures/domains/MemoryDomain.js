import {Domain} from "../../../output/exports.js";

export default class MemoryDomain extends Domain {
  static get store() {
    return this._store ?? super.store;
  }
}
