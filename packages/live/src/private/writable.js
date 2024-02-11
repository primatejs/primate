const live = Symbol.for("@primate/live.live");

export default initial_value => {
  let value = initial_value;
  const subscribers = [];
  return {
    id: crypto.randomUUID(),
    value,
    set(setter) {
      value = setter(value);
      subscribers.map(subscriber => subscriber(value));
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
    },
    live,
  };
};
