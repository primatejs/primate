import load from "./load.js";

export default ({ app, rootname, ...rest }) => {
  const location = app.get("location");
  const filename = `${rootname}.js`;
  const base = app.runpath(location.server, location.components);

  return {
    root: app.runpath(location.server, filename),
    async make(name, props) {
      const component = await load(base.join(name));
      return { name, props, component: component.default ?? component };
    },
    ...rest,
  };
};
