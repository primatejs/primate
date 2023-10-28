import rootname from "./rootname.js";

export default `
const { liveview } = components;
window.addEventListener("DOMContentLoaded", _ => liveview((props, update) => {
  dispose();
  dispose = render_solid(() => components.${rootname}({
    components: props.names.map(name => components[name]),
    data: props.data,
    request: {
      ...props.request,
      url: new URL(location.href),
    },
  }), globalThis.window.document.body);
}));`;
