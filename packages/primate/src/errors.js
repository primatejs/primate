import {Path} from "runtime-compat/fs";
import Logger from "./Logger.js";

const errors = await new Path(import.meta.url).up(1).join("errors.json").json();

export default Logger.err(errors, "primate");
