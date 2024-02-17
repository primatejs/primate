import o from "rcompat/object";

const dict_converter = value => o.from(value);

const normalize = response =>
  response instanceof Map ? o.from(response.entries()) : response;
const qualify = (response, destroy = true) => {
  if (response?.toJs !== undefined) {
    const py_proxy = response;
    const converted = py_proxy.toJs({ dict_converter });
    destroy && py_proxy.destroy();
    return converted;
  }
  return response;
};

export const unwrap = response => normalize(qualify(response));

export const unwrap_async = response => normalize(qualify(response, false));
