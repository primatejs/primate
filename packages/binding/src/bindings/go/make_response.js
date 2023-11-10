import { view, redirect, error } from "primate";

const handlers = {
  view: ({ component, props = {} }) => view(component, JSON.parse(props)),
  redirect: ({ location, options = {} }) => redirect(location, options),
};

const handle_function = response => {
  const { handler, ...args } = response;
  return handlers[handler]?.(args) ?? error();
};

export default response => typeof response === "function"
  ? handle_function(response())
  : response;
