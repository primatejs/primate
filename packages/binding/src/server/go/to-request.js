import exclude from "@rcompat/object/exclude";
import stringify from "@rcompat/object/stringify";
import valmap from "@rcompat/object/valmap";

const to_search_params = url =>
  stringify(Object.fromEntries(url.searchParams.entries()));
const dispatchers = ["path", "query", "cookies", "headers"];

const to_dispatcher = dispatcher =>
  valmap(exclude(dispatcher, ["get", "raw"]), getter => {
    try {
      return getter();
    } catch ({ message }) {
      return () => message;
    }
  });

const make_session = session => {
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
};

export default request => {
  dispatchers.map(property => to_dispatcher(request[property]));

  return {
    url: request.url,
    search_params: to_search_params(request.url),
    body: JSON.stringify(request.body),
    ...Object.fromEntries(dispatchers.map(property => [
      property, {
        stringified: request[property].toString(),
        ...to_dispatcher(request[property]),
      },
    ])),
    ...make_session(request.session),
  };
};
