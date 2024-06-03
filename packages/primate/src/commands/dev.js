import { build, serve } from "../hooks/exports.js";

// builds the app in development mode and serves it
export default async app => serve(await build(app, "development"));
