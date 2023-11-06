import { view, redirect, error } from "primate";

const handlers = {
  view: ({ component, props = {} }) => view(component, props),
  redirect: ({ location, options = {} }) => redirect(location, options),
};

const handle_function = response => {
  const { handler, ...args } = response;
  return handlers[handler]?.(args) ?? error();
};

export default response => {
  if (typeof response === "function") {
    return handle_function(response());
  }

  return response;
};
