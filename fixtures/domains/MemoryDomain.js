import {Domain} from "../../exports.js";

export default class MemoryDomain extends Domain {
  static get store() {
    return this._store ?? super.store;
  }
}
