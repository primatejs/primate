export default locale => fetch("/", {
  headers: {
    "Primate-I18N-Locale": locale,
  },
  method: "post",
  body: null,
});
