import cascade from "@rcompat/async/cascade";
import type { PrimateBuildApp } from "../app.js";

export default async (app: PrimateBuildApp) => cascade(app.modules.init)(app);
