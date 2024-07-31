import cascade from "@rcompat/async/cascade";

export default async app => (await cascade(app.modules.init))(app);
