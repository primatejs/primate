const dict_converter = value => Object.fromEntries(value);

const normalize = response =>
  response instanceof Map ? Object.fromEntries(response.entries()) : response;
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
