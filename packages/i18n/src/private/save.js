import header from "#header";

export default locale => fetch("/", {
  headers: { [header]: locale },
  method: "post",
  body: null,
});
