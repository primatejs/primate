import { view, redirect, error } from "primate";
import { from } from "rcompat/object";

const handlers = {
  view({ name, props = {}, options = {} }) {
    return view(name, props, options);
  },
  redirect({ location, options }) {
    return redirect(location, options);
  },
  error({ body, options }) {
    return error(body, options);
  },
};

const to_object = object_with_maps =>
  JSON.parse(JSON.stringify(object_with_maps, (_, value) =>
    value instanceof Map ? from(value.entries()) : value));

const handle_handler = response => {
  const { __handler__ : handler, ...args } = response;
  return handlers[handler]?.(to_object(args)) ?? error();
};

const handle_other = response => response;

const normalize = response =>
  response instanceof Map ? from(response.entries()) : response;
const qualify = response => response.toJs?.() ?? response;

export default raw_response => {
  const response = normalize(qualify(raw_response));
  return response.__handler__ === undefined
    ? handle_other(response)
    : handle_handler(response);
};
