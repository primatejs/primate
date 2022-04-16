import fs from "fs";
import {join} from "path";

const options = {"encoding": "utf8"};

const readdir = path => new Promise((resolve, reject) =>
  fs.readdir(path, options,
    (error, files) => error === null ? resolve(files) : reject(error)
  ));

const rm = path => new Promise((resolve, reject) =>
  fs.rm(path, {"recursive": true, "force": true},
    error => error === null ? resolve(true) : reject(error)
  ));

const mkdir = path => new Promise((resolve, reject) =>
  fs.mkdir(path, error => error === null ? resolve(true) : reject(error)));

export default class Directory {
  static list(...args) {
    return readdir(join(...args));
  }

  static remove(...args) {
    return rm(join(...args));
  }

  static make(...args) {
    return mkdir(join(...args));
  }

  static async remake(...args) {
    await this.remove(...args) && this.make(...args);
  }
}
