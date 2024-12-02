import handler from "#handler";
import stream, { type Streamable } from "@rcompat/fs/stream";
import { bin } from "@rcompat/http/mime";

/**
 * Stream a response
 * @param body streamable body
 * @param options response options
 * @return Response rendering function
 */
export default handler<Streamable<unknown>>(bin, stream);
