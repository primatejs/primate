import type Actions from "@rcompat/http/Actions";
import type { ResponseFunction } from "#serve";

export default (implementation: Actions): ResponseFunction => (app, _, { request }) =>
  app.server().upgrade(request, implementation);
