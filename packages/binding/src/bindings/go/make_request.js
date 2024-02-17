import o from "rcompat/object";
const to_search_params = url => o.stringify(o.from(url.searchParams.entries()));
const dispatchers = ["path", "query", "cookies", "headers"];

const to_dispatcher = dispatcher => {
  const { get, raw: _, ...rest } = dispatcher;
  return o.valmap(rest, getter => {
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
    ...o.from(dispatchers.map(property => [
      property, {
        stringified: request[property].toString(),
        ...to_dispatcher(request[property]),
      },
    ])),
    ...make_session(request.session),
  };
};
