import { APPLICATION_JSON } from "@rcompat/http/media-type";
import base from "./shared/base.js";

/**
 * Issue a JSON response
 * @param {object} body object
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
export default base(APPLICATION_JSON, JSON.stringify);
