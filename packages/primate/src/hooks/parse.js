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

const parse = {
  content(content_type, body) {
    return tryreturn(_ => {
      const type = contents[content_type];
      return type === undefined ? body : type(body);
    }).orelse(_ => errors.CannotParseBody.throw(body, content_type));
  },
  async body({body, headers}) {
    return body === null
      ? null
      : this.content(headers.get("content-type"), await stringify(body));
  },
};

export default dispatch => async request => {
  const body = dispatch(await parse.body(request));
  const cookies = dispatch(from(request.headers.get("cookie")?.split(";")
    .map(cookie => cookie.trim().split("=")) ?? []));
  const headers = dispatch(from(request.headers));
  const url = new URL(request.url);
  const query = dispatch(from(url.searchParams));

  return {original: request, url, body, cookies, headers, query};
};
