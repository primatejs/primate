import fs from "fs";
import {join} from "path";
import Directory from "./Directory.js";
import EagerPromise from "./EagerPromise.js";

const array = maybe => Array.isArray(maybe) ? maybe : [maybe];

const filter_files = (files, filter) =>
  files.filter(file => array(filter).some(ending => file.endsWith(ending)));

export default class File {
  constructor(...args) {
    this.path = join(...args);
    return EagerPromise.resolve(new Promise(resolve => {
      fs.lstat(this.path, (error, stats) => {
        this.stats = stats;
        resolve(this);
      });
    }));
  }

  get modified() {
    return Math.round(this.stats.mtimeMs);
  }

  get exists() {
    return this.stats !== undefined;
  }

  get is_file() {
    return this.exists && !this.stats.isDirectory();
  }

  get stream() {
    return this.read_stream;
  }

  get read_stream() {
    return fs.createReadStream(this.path, {"flags": "r"});
  }

  get write_stream() {
    return fs.createWriteStream(this.path);
  }

  remove() {
    return new Promise((resolve, reject) => fs.rm(this.path,
      {"recursive": true, "force": true},
      error => error === null ? resolve(this) : reject(error)
    ));
  }

  create() {
    return new Promise((resolve, reject) => fs.mkdir(this.path, error =>
      error === null ? resolve(this) : reject(error)
    ));
  }

  async copy(to, recreate = true) {
    if (this.stats.isDirectory()) {
      if (recreate) {
        await new File(`${to}`).recreate();
      }
      // copy all files
      return Promise.all((await this.list()).map(file =>
        new File(`${this.path}/${file}`).copy(`${to}/${file}`)
      ));
    } else {
      return new Promise((resolve, reject) => fs.copyFile(this.path, to,
        error => error === null ? resolve(this) : reject(error)));
    }
  }

  async list(filter) {
    if (!this.exists) {
      return [];
    }
    const files = await Directory.list(this.path);
    return filter !== undefined ? filter_files(files, filter) : files;
  }

  async recreate() {
    return (await this.remove()).create();
  }

  read(options = {"encoding": "utf8"}) {
    return new Promise((resolve, reject) =>
      fs.readFile(this.path, options, (error, nonerror) =>
        error === null ? resolve(nonerror) : reject(error)));
  }

  write(data, options = {"encoding": "utf8"}) {
    return new Promise((resolve, reject) => fs.writeFile(this.path, data,
      options,
      error => error === null ? resolve(this) : reject(error)));
  }

  static read_sync(path, options = {"encoding": "utf8"}) {
    return fs.readFileSync(path, options);
  }

  static exists(...args) {
    return new File(...args).exists;
  }

  static read(...args) {
    return new File(...args).read();
  }

  static write(path, data, options) {
    return new File(path).write(data, options);
  }

  static remove(...args) {
    return new File(...args).remove();
  }

  static copy(from, to, recreate) {
    return new File(from).copy(to, recreate);
  }
}
