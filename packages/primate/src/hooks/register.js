import {cascade} from "runtime-compat/async";

export default async app => (await cascade(app.modules.register))(app);
