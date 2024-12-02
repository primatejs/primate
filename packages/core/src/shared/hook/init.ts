import type App from "#BaseApp";
import cascade from "@rcompat/async/cascade";

export default async (app: App) => app.modules.init === undefined
 ? app
 : cascade(app.modules.init)(app);
