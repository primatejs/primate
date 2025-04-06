import type { PyProxy } from "pyodide/ffi";
import type Dictionary from "@rcompat/record/Dictionary";

type DictConverter = Iterable<[
  key: string,
  value: any
]>;

const dict_converter = (value: DictConverter) => Object.fromEntries(value);

const normalize = (response: Map<string, unknown> | Dictionary) =>
  response instanceof Map ? Object.fromEntries(response.entries()) : response;

const qualify = (response: PyProxy, destroy = true) => {
  if ((response.toJs as any) !== undefined) {
    const py_proxy = response;
    const converted = py_proxy.toJs({ dict_converter });
    destroy && py_proxy.destroy();
    return converted;
  }
  return response;
};

export const unwrap = (response: PyProxy) => normalize(qualify(response));

export const unwrap_async = (response: PyProxy) =>
  normalize(qualify(response, false));
