import type { PrimateBuildApp } from "#build/app";
import cascade from "@rcompat/async/cascade";

export default async (app: PrimateBuildApp) => app.modules.init === undefined
 ? app
 : cascade(app.modules.init)(app);
