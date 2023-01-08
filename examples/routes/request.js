import {json} from "primate";

export default router => {
  // accessing /site/login -> {"path":["site","login"]}
  router.get("/site/login", request => json`${{path: request.path}}`);

  // or get `path` via destructuring and implicit JSON handler
  router.get("/site/login", ({path}) => ({path})`);
};
