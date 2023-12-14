import { Path } from "rcompat/fs";
import { DefaultRubyVM as rubyvm } from "./rubyvm.js";

const ruby_path = (await Path.root())
  .join("node_modules/@ruby/3.2-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await new Path(ruby_path).arrayBuffer();
const module = await WebAssembly.compile(ruby_wasm);
const { vm } = await rubyvm(module);

// export { default as make_request } from "./make_request.js";
export { default as make_response } from "./make_response.js";
// export { default as wrap } from "./wrap.js";
export { vm };
