export default async app => {
  app.log.info("running compile hooks", {module: "primate"});
  await [...app.modules.compile, _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
};
