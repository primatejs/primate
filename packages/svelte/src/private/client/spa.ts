export default `
const { spa } = components;
window.addEventListener("DOMContentLoaded", _ => spa((props, update) => {
  root.p = {
    components: props.names.map(name => components[name]),
    data: props.data,
    request: {
      ...props.request,
      url: new URL(location.href),
    },
    update,
  };
}));`;
