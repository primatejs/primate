import {URL} from "runtime-compat/http";
import fromNull from "../fromNull.js";
import errors from "../errors.js";

const contents = {
  "application/x-www-form-urlencoded": body =>
    fromNull(Object.fromEntries(body.split("&").map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " "))))),
  "application/json": body => JSON.parse(body),
};
const decoder = new TextDecoder();

export default async request => {
  const parseContentType = (contentType, body) => {
    const type = contents[contentType];
    return type === undefined ? body : type(body);
  };

  const parseContent = async (request, body) => {
    const contentType = request.headers.get("content-type");
    try {
      return parseContentType(contentType, body);
    } catch (error) {
      return errors.CannotParseBody.throw({body, contentType});
    }
  };

  const parseBody = async request => {
    if (request.body === null) {
      return null;
    }
    const reader = request.body.getReader();
    const chunks = [];
    let result;
    do {
      result = await reader.read();
      if (result.value !== undefined) {
        chunks.push(decoder.decode(result.value));
      }
    } while (!result.done);

    return parseContent(request, chunks.join());
  };

  const cookies = request.headers.get("cookie");
  const _url = request.url;
  const url = new URL(_url.endsWith("/") ? _url.slice(0, -1) : _url);

  return {
    original: request,
    url,
    body: await parseBody(request),
    cookies: fromNull(cookies === null
      ? {}
      : Object.fromEntries(cookies.split(";").map(c => c.trim().split("=")))),
    headers: fromNull(Object.fromEntries(request.headers)),
    query: fromNull(Object.fromEntries(url.searchParams)),
  };
};
