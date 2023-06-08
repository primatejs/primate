import {URL} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/flow";
import errors from "../errors.js";

const {fromEntries: from} = Object;

const contents = {
  "application/x-www-form-urlencoded": body => from(body.split("&")
    .map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  "application/json": body => JSON.parse(body),
};
const decoder = new TextDecoder();

export default dispatch => async request => {
  const parseContentType = (contentType, body) => {
    const type = contents[contentType];
    return type === undefined ? body : type(body);
  };

  const parseContent = async (contentType, body) =>
    tryreturn(_ => parseContentType(contentType, body))
      .orelse(_ => errors.CannotParseBody.throw(body, contentType));

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

    return parseContent(request.headers.get("content-type"), chunks.join());
  };

  const cookies = request.headers.get("cookie");
  const _url = request.url;
  const url = new URL(_url.endsWith("/") ? _url.slice(0, -1) : _url);

  const body = await parseBody(request);
  return {
    original: request,
    url,
    body: dispatch(body),
    cookies: dispatch(cookies === null
      ? {}
      : from(cookies.split(";").map(c => c.trim().split("=")))),
    headers: dispatch(from(request.headers)),
    query: dispatch(from(url.searchParams)),
  };
};
