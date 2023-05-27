import {Path} from "runtime-compat/fs";
import Logger from "./Logger.js";

const json = await new Path(import.meta.url).up(1).join("errors.json").json();

const errors = Logger.err(json, "primate");

export default errors;

export const warn = {
  empty: log => (objects, name, path) => Object.keys(objects).length === 0
    && errors.EmptyDirectory.warn(log, name, path),
};
