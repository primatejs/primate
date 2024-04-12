import FS from "rcompat/fs";
import Logger from "./Logger.js";

const json = await new FS.File(import.meta.url).up(1).join("errors.json").json();

const errors = Logger.err(json.errors, json.module);

export default errors;
