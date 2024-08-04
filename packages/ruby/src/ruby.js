import file from "@rcompat/fs/file";
import root from "@rcompat/package/root";

const ruby_path = (await root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await file(ruby_path).arrayBuffer();

export default await WebAssembly.compile(ruby_wasm);
