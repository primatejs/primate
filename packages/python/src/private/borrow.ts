import type { PyProxy } from "pyodide/ffi";

type DictConverter = Iterable<[
  key: string,
  value: any
]>;

const dict_converter = (value: DictConverter) => Object.fromEntries(value);

export default (proxy?: PyProxy) => {
  if (proxy === undefined) {
    return proxy;
  }
  return proxy.toJs({ dict_converter });
}
