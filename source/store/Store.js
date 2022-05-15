import {Path} from "runtime-compat/filesystem";
const preset = "../preset/stores";

export default class Store {
  constructor(conf = {}) {
    this.conf = conf;
  }

  get name() {
    return this.conf.name;
  }

  get path() {
    return this.conf.path;
  }

  open() {
    return this;
  }

  static async get(directory, file) {
    let store;
    try {
      store = await import(Path.resolve(`${directory}/${file}`));
    } catch(error) {
      store = await import(`${preset}/${file}`);
    }
    return store.default.open();
  }
}
