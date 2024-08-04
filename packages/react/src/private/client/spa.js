export default `
const { spa } = components;
window.addEventListener("DOMContentLoaded", _ => spa((props, update) => {
  root.render(
    createElement(components.root_react, {
      components: props.names.map(name => components[name]),
      data: props.data,
      context: props.context,
      request: {
        ...props.request,
        url: new URL(location.href),
      },
    })
  );
}));`;
