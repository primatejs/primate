import { MediaType } from "rcompat/http";
import base from "./shared/base.js";

/**
 * Issue a plaintext response
 * @param {string} body plaintext
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
export default base(MediaType.TEXT_PLAIN);
