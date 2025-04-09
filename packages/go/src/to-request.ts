//import exclude from "@rcompat/object/exclude";
//import stringify from "@rcompat/object/stringify";
//import valmap from "@rcompat/object/valmap";
import type RequestFacade from "@primate/core/RequestFacade";

/*const to_search_params = url =>
  stringify(Object.fromEntries(url.searchParams.entries()));
const dispatchers = ["path", "query", "cookies", "headers"];

const to_dispatcher = dispatcher =>
  valmap(exclude(dispatcher, ["get", "raw"]), getter => {
    try {
      return getter();
    } catch ({ message }) {
      return () => message;
    }
  });*/

/*const make_session = session => {
  if (session === undefined) {
    return {};
  }

  return {
    session: {
      ...session,
      set: (key, value) => {
        try {
          return session.set(key, value);
        } catch ({ message }) {
          return () => message;
        }
      },
      get: session.get,
      stringified: session.toString(),
    },
  };
};*/

export default (request: RequestFacade) => {
  return {
    url: request.url,
    body: JSON.stringify(request.body),
    path: JSON.stringify(request.path),
    query: JSON.stringify(request.query),
    headers: JSON.stringify(Object.fromEntries(request.headers.entries())),
    cookies: JSON.stringify(request.cookies),
  };
};
