export const render = (component, ...args) => {
  const { html, head } = component.render(...args);
  return { body: html, head };
};
