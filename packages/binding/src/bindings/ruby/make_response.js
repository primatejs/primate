import { view, redirect, error } from "primate";
import { HANDLER_PROPERTY } from "../common/exports.js";

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

const handle_handler = response => {
  const { [HANDLER_PROPERTY] : handler, ...args } = response;
  return handlers[handler]?.(args) ?? error();
};

const handle_other = response => response;
export default response => {
  return response[HANDLER_PROPERTY] === undefined
    ? handle_other(response)
    : handle_handler(response);
};
