import { from, stringify, valmap } from "rcompat/object";

const make_search_params = url => stringify(from(url.searchParams.entries()));
const dispatchers = ["body", "path", "query", "cookies", "headers"];

const make_dispatcher = dispatcher => {
  const { get, all: _, raw: _1, ...rest } = dispatcher;
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
      all: () => JSON.stringify(session.all()),
    },
  };
};

export default request => {
  dispatchers.map(property => make_dispatcher(request[property]));

  return {
    url: request.url,
    search_params: make_search_params(request.url),
    ...from(dispatchers.map(property => [
      property, {
        properties: JSON.stringify(request[property].all()),
        ...make_dispatcher(request[property]),
      },
    ])),
    ...make_session(request.session),
  };
};
