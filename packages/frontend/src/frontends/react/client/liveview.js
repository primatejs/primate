import rootname from "./rootname.js";

export default `
const {liveview} = components;
window.addEventListener("DOMContentLoaded", _ => liveview((props, update) => {
  root.render(
    createElement(components.${rootname}, {
      components: props.names.map(name => components[name]),
      data: props.data,
    })
  );
}));`;
