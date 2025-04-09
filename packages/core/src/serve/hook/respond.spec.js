import { html } from "@rcompat/http/mime";
import Status from "@rcompat/http/status";

import respond from "./respond.js";

const app = {
  respond(body, { status = Status.OK, headers = {} } = {}) {
    return new Response(body, {
      status,
      headers: {
        "content-type": html, ...headers,
      },
    });
  },
};

export default test => {
  test.case("guess URL", async assert => {
    const url = "https://primate.run";
    const status = Status.FOUND;
    const response = respond(new URL(url))(app);
    // assert(await response.text()).null();
    assert(response.status).equals(status);
    assert(response.headers.get("location")).equals(url);
  });
};
