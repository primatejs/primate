import { TEXT_EVENT_STREAM } from "@rcompat/http/media-type";
import base from "./shared/base.js";

/**
 * Open a server-sent event stream
 * @param {object} body docs1
 * @param {object} options docs2
 * @return {ResponseFn}
 */
export default base(TEXT_EVENT_STREAM, implementation =>
  new ReadableStream({
    start(controller) {
      implementation.open({
        send(name, data) {
          const event = data === undefined ? "" : `event: ${name}\n`;
          const $data = data === undefined ? name : data;
          controller.enqueue(`${event}data:${JSON.stringify($data)}\n\n`);
        },
      });
    },
    cancel() {
      implementation.close?.();
    },
  }));
