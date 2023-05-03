export default async ({primary, input, schema}) => Object.entries({
  ...schema,
  [primary.name]: primary.value,
}).reduce(({error, document}, [field, {coerce, validate, message}]) => {
  // coerce values
  const coerced = coerce?.(input[field]) ?? input[field];
  const result = validate(coerced) ? {} : {[field]: message};

  return {
    error: {...error, ...result},
    document: {...document, [field]: coerced},
  };
}, {error: {}, document: {}});
