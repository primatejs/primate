export default async app => {
  app.log.info("running register hooks", {module: "primate"});
  await [...app.modules.register, _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
};
