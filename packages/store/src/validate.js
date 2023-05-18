export default async ({driver, input, schema, strict}) =>
  Object.entries(schema).reduce(({errored, document}, [name, field]) => {
    // skip empty fields if not in strict mode
    if (!strict && input[name] === undefined) {
      return {errored, document};
    }

    try {
      const coerced = field.type(input[name], driver);
      return {
        errored,
        document: {...document, [name]: coerced},
      };
    } catch (error) {
      return {
        errored: true,
        document: {...document, [`$${name}`]: error.message},
      };
    }
  }, {errored: false, document: {}});
