import { TEXT_PLAIN } from "@rcompat/http/media-type";
import base from "./shared/base.js";

/**
 * Issue a plaintext response
 * @param {string} body plaintext
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
export default base(TEXT_PLAIN);
