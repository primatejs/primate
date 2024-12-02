import { handler } from "#serve";
import identity from "@rcompat/function/identity";
import { txt } from "@rcompat/http/mime";

/**
 * Return a plaintext response
 * @param body plaintext body
 * @param options response options
 * @return Response rendering function
 */
export default handler<string>(txt, identity);
