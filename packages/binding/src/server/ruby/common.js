import file from "@rcompat/fs/file";
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/node";
import root from "@rcompat/package/root";

const ruby_path = (await root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await file(ruby_path).arrayBuffer();
const module = await WebAssembly.compile(ruby_wasm);

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

export const name = "ruby";

export const default_extension = ".rb";

export const dependencies = ["@ruby/head-wasm-wasi", "@ruby/wasm-wasi"];

export { module, DefaultRubyVM as rubyvm, helpers };
