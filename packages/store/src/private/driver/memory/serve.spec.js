import serve from "#driver/memory/serve";
import base from "#test";

export default test => base(test, () => serve()());
