import { serve } from "../hooks/exports.js";

// serves the app from the build directory
export default app => serve(app, "build");
