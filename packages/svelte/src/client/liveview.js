import rootname from "./rootname.js";

export default `
const {liveview} = components;
window.addEventListener("DOMContentLoaded", _ => liveview((props, update) => {
  root.$destroy();
  root = new components.${rootname}({
    target: document.body,
    hydrate: true,
    props: {
      components: getComponents(props.names),
      data: props.data,
      update,
    },
  });
}));`;
