const name = "go";

export default ({ extension = default_extension } = {}) => {

  return {
    name: `primate:${name}`,
    async init(app, next) {

      return next(app);
    },
    async register(app, next) {
      app.register(extension, {
        route: () => {

        },
      });

      return next(app);
    },
  };
};
