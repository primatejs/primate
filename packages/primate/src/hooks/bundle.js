import {cascade} from "runtime-compat/async";

export default app => cascade(app.modules.bundle)(app);
