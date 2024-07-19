import { MediaType } from "rcompat/http";
import base from "./shared/base.js";

/**
 * Issue a JSON response
 * @param {object} body object
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
export default base(MediaType.APPLICATION_JSON, JSON.stringify);
