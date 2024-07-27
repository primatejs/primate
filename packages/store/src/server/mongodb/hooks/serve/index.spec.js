import base from "@primate/store/base/test";
import serve from "./index.js";

export default async test => base(test, () => serve({ database: "primate" })());
