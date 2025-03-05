import FileRef from "@rcompat/fs/FileRef";
import root from "@rcompat/package/root";

const ruby_path = (await root())
  .join("node_modules/@ruby/head-wasm-wasi/dist/ruby+stdlib.wasm");
const ruby_wasm = await new FileRef(ruby_path).arrayBuffer();

export default await WebAssembly.compile(ruby_wasm);
