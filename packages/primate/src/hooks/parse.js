import {URL, MediaType} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/sync";
import {stringify} from "runtime-compat/streams";
import {from, valmap} from "runtime-compat/object";
import errors from "../errors.js";

const {APPLICATION_FORM_URLENCODED, APPLICATION_JSON} = MediaType;

const contents = {
  [APPLICATION_FORM_URLENCODED]: body => from(body.split("&")
    .map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  [APPLICATION_JSON]: body => JSON.parse(body),
};

const content = (type, body) =>
  tryreturn(_ => contents[type?.split(";")[0]]?.(body) ?? body)
    .orelse(_ => errors.CannotParseBody.throw(body, type));

export default dispatch => async original => {
  const {headers} = original;
  const url = new URL(original.url);
  const body = await stringify(original.body);
  const cookies = headers.get("cookie");

  return {original, url,
    ...valmap({
      body: [content(headers.get("content-type"), body), body],
      query: [from(url.searchParams), url.search],
      headers: [from(headers), headers, false],
      cookies: [from(cookies?.split(";").map(cookie => cookie.trim().split("="))
        ?? []), cookies],
    }, value => dispatch(...value)),
  };
};
