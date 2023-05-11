export default async ({primary, input, schema, strict}) => Object.entries({
  ...schema,
  [primary.name]: primary.value,
}).reduce(({error, document}, [field, {coerce, validate, message}]) => {
  // skip empty fields if not in strict mode
  if (!strict && input[field] === undefined) {
    return {error, document};
  }
  // coerce values
  const coerced = coerce?.(input[field]) ?? input[field];
  const result = validate(coerced) ? {} : {[field]: message};

  return {
    error: {...error, ...result},
    document: {...document, [field]: coerced},
  };
}, {error: {}, document: {}});
