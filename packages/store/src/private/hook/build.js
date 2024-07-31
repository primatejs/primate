import no_store_directory from "#error/no-store-directory";

export default directory => async (app, next) => {
  const root = app.root.join(directory);
  if (!await root.exists()) {
    no_store_directory(root);
    return next(app);
  }

  await app.stage(app.root.join(directory), directory);

  app.server_build.push("stores");

  return next(app);
};
