type Predicate<T> = {
  [K in keyof T]: {
    type: T[K]
    validate(o: T[K]): T,
  }
};

export { Predicate as default };
