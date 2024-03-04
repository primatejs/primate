import load from "./load.js";
import rootpath from "./rootpath.js";

export default ({ app, name, ...rest }) => {
  const location = app.get("location");
  const root = app.root.join(location.components);

  return {
    root: rootpath(app, name),
    async make(name, props) {
      const component = await load(root.join(name));
      return { name, props, component: component.default ?? component };
    },
    ...rest,
  };
};
