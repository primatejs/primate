import { from, stringify, valmap } from "rcompat/object";

const make_search_params = url => stringify(from(url.searchParams.entries()));
const dispatchers = ["path", "query", "cookies", "headers"];

const make_dispatcher = dispatcher => {
  const { get, raw: _, ...rest } = dispatcher;
  return valmap(rest, getter => {
    try {
      return getter();
    } catch ({ message }) {
      return () => message;
    }
  });
};

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
    },
  };
};

export default request => {
  dispatchers.map(property => make_dispatcher(request[property]));

  return {
    url: request.url,
    search_params: make_search_params(request.url),
    body: JSON.stringify(request.body),
    ...from(dispatchers.map(property => [
      property, {
        properties: request[property].toString(),
        ...make_dispatcher(request[property]),
      },
    ])),
    ...make_session(request.session),
  };
};
