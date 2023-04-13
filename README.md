# Primate 

Expressive, minimal and extensible web framework

## Getting started

Run `npx -y primate@latest create` to create a project structure.

Create a route in `routes/index.js`

```js
export default {
  get() {
    return "Hello, world!";
  },
};
```

Run `npm i && npm start` and visit http://localhost:6161 in your browser.

## Packages

| Package                                     | Description                   |
|---------------------------------------------|-------------------------------|
|[primate](packages/primate)                  | Primate framework             |
|[@primate/svelte](packages/svelte)           | Serving Svelte components     |
|[@primate/react](packages/react)             | Serving React/JSX components  |
|[@primate/vue](packages/vue)                 | Serving Vue/SFC components    |
|[@primate/htmx](packages/htmx)               | Serving HTMX files            |
|[@primate/esbuild](packages/esbuild)         | Bundling JS/CSS               |
|[@primate/session](packages/session)         | User sessions                 |

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT
