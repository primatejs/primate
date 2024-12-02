import { handler } from "#serve";
import { sse } from "@rcompat/http/mime";

type Body = {
  open(events: { send(name: string, data: unknown): undefined }): undefined,
  close?(): undefined;
};

const encode = (input: string) => new TextEncoder().encode(input);

const handle = (body: Body) => new ReadableStream({
  start(controller) {
    body.open({
      send(name, data) {
        const event = data === undefined ? "" : `event: ${name}\n`;
        const _data = JSON.stringify(data === undefined ? name : data);
        controller.enqueue(encode(`${event}data:${_data}\n\n`));
      },
    });
  },
  cancel() {
    body.close?.();
  },
});

/**
 * Open a server-sent event stream
 * @param body implementation body
 * @param options response options
 * @return Response rendering function
 */
export default handler<Body>(sse, handle);
