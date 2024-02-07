import { Response, Status, MediaType } from "rcompat/http";
import { ReadableStream } from "rcompat/streams";

export default implementation => app => new Response(new ReadableStream({
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
}), {
  status: Status.OK,
  headers: { ...app.headers(), "Content-Type": MediaType.TEXT_EVENT_STREAM },
});
