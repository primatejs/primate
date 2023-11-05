import { URL, MediaType } from "rcompat/http";
import { tryreturn } from "rcompat/sync";
import { stringify } from "rcompat/streams";
import { from, valmap } from "rcompat/object";
import errors from "../errors.js";

const { APPLICATION_FORM_URLENCODED, APPLICATION_JSON } = MediaType;

const { decodeURIComponent: decode } = globalThis;
const deslash = url => url.replaceAll(/(?<!http:)\/{2,}/gu, _ => "/");

const contents = {
  [APPLICATION_FORM_URLENCODED]: body => from(body.split("&")
    .map(part => part.split("=")
      .map(subpart => decode(subpart).replaceAll("+", " ")))),
  [APPLICATION_JSON]: body => JSON.parse(body),
};

const content = (type, body) =>
  tryreturn(_ => contents[type?.split(";")[0]]?.(body) ?? body)
    .orelse(_ => errors.CannotParseBody.throw(body, type));

export default dispatch => async original => {
  const { headers } = original;
  const url = new URL(deslash(decode(original.url)));
  const body = await stringify(original.body);
  const cookies = headers.get("cookie");

  return { original, url,
    ...valmap({
      body: [content(headers.get("content-type"), body), body],
      query: [from(url.searchParams), url.search],
      headers: [from(headers), headers, false],
      cookies: [from(cookies?.split(";").map(cookie => cookie.trim().split("="))
        ?? []), cookies],
    }, value => dispatch(...value)),
  };
};
