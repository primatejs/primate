import { from, stringify, valmap } from "rcompat/object";

const make_search_params = url => stringify(from(url.searchParams.entries()));
const dispatchables = ["body", "path", "query", "cookies", "headers"];

const make_dispatchable = dispatchable => {
  const { get, getAll: _, raw: _1, ...rest } = dispatchable;
  return valmap(rest, getter => {
    try {
      return getter();
    } catch ({ message }) {
      return () => message;
    }
  });
};

const make_session = session => {
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
      getAll: () => JSON.stringify(session.getAll()),
    },
  };
};

export default request => {
  dispatchables.map(property => make_dispatchable(request[property]));

  const t = {
    url: request.url,
    search_params: make_search_params(request.url),
    ...from(dispatchables.map(property => [
      property, {
        properties: JSON.stringify(request[property].getAll()),
        ...make_dispatchable(request[property]),
      },
    ])),
    ...make_session(request.session),
  };
  return t;
};
