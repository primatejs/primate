import { File } from "rcompat/fs";
import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/node";

const ruby_path = (await File.root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await File.arrayBuffer(ruby_path);
const module = await WebAssembly.compile(ruby_wasm);

export { default as make_response } from "./make_response.js";
export { module };
export { DefaultRubyVM as rubyvm };
