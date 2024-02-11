const live = Symbol.for("@primate/live.live");

export default initial_value => {
  let value = initial_value;
  const subscribers = [];
  return {
    id: crypto.randomUUID(),
    value,
    set(next) {
      value = next;
      subscribers.map(subscriber => subscriber(next));
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
    },
    live,
  };
};

