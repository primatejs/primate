import base from "@primate/store/base/test";
import serve from "./index.js";

export default test => base(test, () => serve()());
