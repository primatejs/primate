import { Status, MediaType } from "rcompat/http";

import respond from "./respond.js";

const app = {
  respond(body, { status = Status.OK, headers = {} } = {}) {
    return new Response(body, {
      status,
      headers: {
        "Content-Type": MediaType.TEXT_HTML, ...headers,
      },
    });
  },
};

export default test => {
  test.case("guess URL", async assert => {
    const url = "https://primatejs.com/";
    const status = Status.FOUND;
    const response = respond(new URL(url))(app);
    // assert(await response.text()).null();
    assert(response.status).equals(status);
    assert(response.headers.get("Location")).equals(url);
  });
};
