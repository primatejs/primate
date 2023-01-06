import {json} from "primate";

export default router => {
  // accessing /user/view/1234 -> {"path":["site","login","1234"]}
  // accessing /user/view/abcd -> error 404
  router.get("/user/view/([0-9])+", request => json`${{path: request.path}}`);
};
