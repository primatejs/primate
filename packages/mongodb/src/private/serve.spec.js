import base from "@primate/store/core/test";
import serve from "#serve";

export default async test => base(test, () => serve({ database: "primate" })());
