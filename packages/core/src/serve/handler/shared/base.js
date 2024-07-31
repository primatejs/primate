import identity from "@rcompat/function/identity";

export default (mediatype, mapper = identity) => (body, options) => app =>
  app.respond(mapper(body), app.media(mediatype, options));
