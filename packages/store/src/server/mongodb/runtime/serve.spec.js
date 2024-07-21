import serve from "./serve.js";
import base from "@primate/store/base/test";

export default async test => base(test, () => serve({ database: "primate" })());
