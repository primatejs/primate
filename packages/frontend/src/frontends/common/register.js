export default ({ app, rootname, ...rest }) => ({
  root: app.get_component(`root_${rootname}.js`),
  async load(name, props) {
    const component = await app.get_component(name);
    return { name, props, component };
  },
  ...rest,
});
