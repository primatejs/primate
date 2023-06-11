import mime from "./mime.js";

export default test => {
  test.case("match", assert => {
    assert(mime("/app.js")).equals("text/javascript");
  });
  test.case("no extension", assert => {
    assert(mime("/app")).equals("application/octet-stream");
  });
  test.case("unknown extension", assert => {
    assert(mime("/app.unknown")).equals("application/octet-stream");
  });
};
