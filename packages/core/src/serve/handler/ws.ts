export default implementation => ({ server }, _, { original }) =>
  server.upgrade(original, implementation);
