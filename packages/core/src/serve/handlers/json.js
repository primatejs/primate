import { json } from "@rcompat/http/mime";
import base from "./shared/base.js";

/**
 * Issue a JSON response
 * @param {object} body object
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
export default base(json, JSON.stringify);
