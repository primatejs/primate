export default async ({driver, input, schema, strict}) =>
  Object.entries(schema).reduce(({errors, document}, [name, field]) => {
    // skip empty fields if not in strict mode
    if (!strict && input[name] === undefined) {
      return {errors, document};
    }

    try {
      const coerced = field.type(input[name], driver);
      return {
        errors,
        document: {...document, [name]: coerced},
      };
    } catch (error) {
      return {
        errors: {...errors, [name]: error.message},
        document,
      };
    }
  }, {errors: {}, document: {}});
