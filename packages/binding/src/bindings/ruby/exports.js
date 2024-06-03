import { File } from "rcompat/fs";
import * as P from "rcompat/package";
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/node";

const ruby_path = (await P.root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await File.arrayBuffer(ruby_path);
const module = await WebAssembly.compile(ruby_wasm);

export { default as make_response } from "./make_response.js";
export { module };
export { DefaultRubyVM as rubyvm };

const helpers = {
  wrap(value) {
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return "integer";
      }
      return "float";
    }
    if (typeof value === "boolean") {
      return "boolean";
    }
    if (typeof value === "string") {
      return "string";
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return "array";
      }

      if (value === "null") {
        return "nil";
      }

      return "object";
    }

    return undefined;
  },
};

export { helpers };
