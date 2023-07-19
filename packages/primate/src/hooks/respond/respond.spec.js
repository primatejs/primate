import {Status} from "runtime-compat/http";

import respond from "./respond.js";

export default test => {
  test.case("guess URL", assert => {
    const url = "https://primatejs.com/";
    const status = Status.FOUND;
    const [body, options] = respond(new URL(url))({headers: () => ({})});
    assert(body).null();
    assert(options.status).equals(status);
    assert(options.headers.Location).equals(url);
  });
};
