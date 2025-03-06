import handler from "#handler";
import { json } from "@rcompat/http/mime";

/**
 * Issue a JSON response
 * @param body body object
 * @param options response options
 * @return Response rendering function
 */
export default handler<unknown>(json, JSON.stringify);
