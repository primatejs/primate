import rootname from "./rootname.js";

export default `
const { spa } = components;
window.addEventListener("DOMContentLoaded", _ => spa((props, update) => {
  root.$destroy();
  root = new components.${rootname}({
    target: document.body,
    hydrate: true,
    props: {
      components: props.names.map(name => components[name]),
      data: props.data,
      context: props.context,
      request: {
        ...props.request,
        url: new URL(location.href),
      },
      update,
    },
  });
}));`;
