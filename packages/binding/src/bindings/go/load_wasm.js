import { Path } from "rcompat/fs";

const js = ".js";
const wasm = ".wasm";

export default async file => {
  const path = `${file}`.slice(0, - js.length).concat(wasm);
  return new Uint8Array(await new Path(path).arrayBuffer());
};
