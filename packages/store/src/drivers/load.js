import {tryreturn} from "runtime-compat/async";
import errors from "../errors.js";

const message = driver => `npm install ${driver}`;

export default driver =>
  tryreturn(async () => (await import(driver)).default)
    .orelse(_ => errors.CannotFindDriver.throw(driver, message(driver)));
