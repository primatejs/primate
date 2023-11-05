import { Status } from "rcompat/http";

import respond from "./respond.js";

export default test => {
  test.case("guess URL", async assert => {
    const url = "https://primatejs.com/";
    const status = Status.FOUND;
    const response = respond(new URL(url))({ headers: () => ({}) });
    // assert(await response.text()).null();
    assert(response.status).equals(status);
    assert(response.headers.get("Location")).equals(url);
  });
};
