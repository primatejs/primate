import { File } from "rcompat/fs";
import { DefaultRubyVM as rubyvm } from "./rubyvm.js";

const ruby_path = (await File.root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await File.arrayBuffer(ruby_path);
const module = await WebAssembly.compile(ruby_wasm);
const { vm } = await rubyvm(module);

// export { default as make_request } from "./make_request.js";
export { default as make_response } from "./make_response.js";
// export { default as wrap } from "./wrap.js";
export { vm };
