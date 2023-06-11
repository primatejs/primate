import respond from "./respond.js";

export default test => {
  test.case("guess URL", assert => {
    const url = "https://primatejs.com/";
    const status = 302;
    const [body, options] = respond(new URL(url))();
    assert(body).null();
    assert(options.status).equals(status);
    assert(options.headers.Location).equals(url);
  });
};
