import root from "@rcompat/package/root";
import tryreturn from "@rcompat/async/tryreturn";
import resolve from "@rcompat/fs/resolve";

// serve from build directory
export default async (from = "build") =>
  (await tryreturn(_ => root()).orelse(_ => resolve()))
    .join(`./${from}/serve.js`).import();
