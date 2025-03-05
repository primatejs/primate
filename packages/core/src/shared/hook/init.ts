import type App from "#App";
import cascade from "@rcompat/async/cascade";

export default async (app: App) => app.modules.init === undefined
 ? app
 : cascade(app.modules.init)(app);
