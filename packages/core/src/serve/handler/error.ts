import ResponseFunction from "#ResponseFunction";
import type { Known } from "@rcompat/http/Status";
import Status from "@rcompat/http/Status";

type Options = {
  status?: Known,
  page?: string,
}

/**
 * Render an error page
 * @param body replacement for %body%
 * @param options rendering options
 * @return Response rendering function
 */
export default (body?: string, options?: Options): ResponseFunction =>
  app => app.view({
    body: body ?? "Not Found",
    status: options?.status ?? Status.NOT_FOUND,
    page: options?.page ?? app.config("pages.error"),
  });
