export default (body, head, { partial = false, app, page, placeholders }) =>
  partial ? body : app.render({ body, head }, page, placeholders);
