import header from "#header";

export default (locale: string) => fetch("/", {
  headers: { [header]: locale },
  method: "post",
  body: null,
});
