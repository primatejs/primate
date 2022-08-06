import {router, json} from "primate";

router.get("/site/login", request => json`${{path: request.path}}`);
// accessing /site/login -> {"path":["site","login"]}

// or get `path` via destructuring
router.get("/site/login", ({path}) => json`${{path}}`);
