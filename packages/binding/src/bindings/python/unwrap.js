import { from } from "rcompat/object";

const to_object = object_with_maps =>
  JSON.parse(JSON.stringify(object_with_maps, (_, value) =>
    value instanceof Map ? from(value.entries()) : value));

const dict_converter = value => from(value);

const normalize = response =>
  response instanceof Map ? from(response.entries()) : response;
const qualify = response => {
  if (response.toJs !== undefined) {
    const py_proxy = response;
    const converted = py_proxy.toJs({ dict_converter });
    py_proxy.destroy();
    return converted;
  }
  return response;
};

export const unwrap = response => normalize(qualify(response));

export { to_object };
