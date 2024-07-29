import { FOUND, OK } from "@rcompat/http/status";
import { TEXT_HTML } from "@rcompat/http/media-type";

import respond from "./respond.js";

const app = {
  respond(body, { status = OK, headers = {} } = {}) {
    return new Response(body, {
      status,
      headers: {
        "Content-Type": TEXT_HTML, ...headers,
      },
    });
  },
};

export default test => {
  test.case("guess URL", async assert => {
    const url = "https://primatejs.com/";
    const status = FOUND;
    const response = respond(new URL(url))(app);
    // assert(await response.text()).null();
    assert(response.status).equals(status);
    assert(response.headers.get("Location")).equals(url);
  });
};
