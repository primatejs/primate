export default ({ app, name, ...rest }) => {
  const filename = `root_${name}.js`;

  const root = app.get_component(filename);
  return {
    root,
    async make(name, props) {
      const component = await app.get_component(name);
      return { name, props, component };
    },
    ...rest,
  };
};
