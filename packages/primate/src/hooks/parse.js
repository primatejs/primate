import {URL} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/sync";
import {stringify} from "runtime-compat/streams";
import errors from "../errors.js";

const {fromEntries: from} = Object;

const contents = {
  "application/x-www-form-urlencoded": body => from(body.split("&")
    .map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  "application/json": body => JSON.parse(body),
};

export default dispatch => async request => {
  const parseContentType = (contentType, body) => {
    const type = contents[contentType];
    return type === undefined ? body : type(body);
  };

  const parseContent = (contentType, body) =>
    tryreturn(_ => parseContentType(contentType, body))
      .orelse(_ => errors.CannotParseBody.throw(body, contentType));

  const parseBody = async ({body, headers}) => body === null
    ? null
    : parseContent(headers.get("content-type"), await stringify(body));

  const cookies = request.headers.get("cookie");
  const url = new URL(request.url);

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
