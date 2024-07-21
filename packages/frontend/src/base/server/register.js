export default ({ app, name, ...rest }) => ({
  root: app.get_component(`root_${name}.js`),
  async load(name, props) {
    const component = await app.get_component(name);
    return { name, props, component };
  },
  ...rest,
});
