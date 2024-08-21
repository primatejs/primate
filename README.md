<img src="https://raw.githubusercontent.com/primatejs/primate/master/assets/logo.svg" alt="Primate" width="60"/>

# Primate

Polymorphic development platform. To start [read guide].

[![npm](https://img.shields.io/npm/v/primate?style=for-the-badge&colorB=a16836)](https://npmjs.com/primate)
![npm](https://img.shields.io/npm/dt/primate?style=for-the-badge)
[![GitHub issues](https://img.shields.io/github/issues/primatejs/primate?style=for-the-badge&logo=issues)](https://github.com/primatejs/primate/issues)
[![GitHub stars](https://img.shields.io/github/stars/primatejs/primate?style=for-the-badge)](https://github.com/primatejs/primate/stargazers)
![Node.js Version](https://img.shields.io/node/v/primate?style=for-the-badge)
[![GitHub last commit](https://img.shields.io/github/last-commit/primatejs/primate?style=for-the-badge)](https://github.com/primatejs/primate/commits/master)
[![Discord](https://img.shields.io/discord/1256590312177012806?style=for-the-badge&logo=discord&label=Discord&logoColor=fff&color=5865f2)](https://discord.gg/RSg4NNwM4f)

## Why Primate?

### Mix and match the best web tech, in one stack

Primate is a frontend and backend-agnostic tool, allowing you to seamlessly
integrate and start coding within any major frontend framework and several
backend languages, eliminating the constraints of being tied to specific
options like Next, Nuxt, or others. Primate runs on Node, Deno and Bun with the
same codebase.

### Supported backends

- Go
- JavaScript
- Python
- Ruby
- TypeScript

### Supported frontends

- Angular
- Eta
- Handlebars
- HTML
- HTMX
- Markdown
- Marko
- React
- Solid
- Svelte
- Voby
- Vue
- Web Components

### Supported databases

- MongoDB
- MySQL
- Postgresql
- SQLite
- SurrealDB

## Packages

| Package                                     | Description                   |
|---------------------------------------------|-------------------------------|
|[primate](packages/primate)                  | Primate framework             |
|[@primate/core](packages/core)               | Core framework                |
|[@primate/go](packages/go)                   | Go backend                    |
|[@primate/python](packages/python)           | Python backend                |
|[@primate/ruby](packages/ruby)               | Ruby backend                  |
|[@primate/typescript](packages/typescript)   | TypeScript backend            |
|[@primate/angular](packages/angular)         | Angular frontend              |
|[@primate/eta](packages/eta)                 | Eta frontend                  |
|[@primate/handlebars](packages/handlebars)   | Handlebars frontend           |
|[@primate/html](packages/html)               | HTML frontend                 |
|[@primate/htmx](packages/htmx)               | HTMX frontend                 |
|[@primate/markdown](packages/markdown)       | Markdown frontend             |
|[@primate/marko](packages/marko)             | Marko frontend                |
|[@primate/react](packages/react)             | React frontend                |
|[@primate/solid](packages/solid)             | Solid frontend                |
|[@primate/svelte](packages/svelte)           | Svelte frontend               |
|[@primate/voby](packages/voby)               | Voby frontend                 |
|[@primate/vue](packages/vue)                 | Vue frontend                  |
|[@primate/webc](packages/webc)               | Web Components frontend       |
|[@primate/store](packages/store)             | Databases                     |
|[@primate/mongodb](packages/mongodb)         | MongoDB database              |
|[@primate/mysql](packages/mysql)             | MySQL database                |
|[@primate/postgresql](packages/postgresql)   | PostgreSQL database           |
|[@primate/sqlite](packages/sqlite)           | SQLite database               |
|[@primate/surrealdb](packages/surrealdb)     | SurrealDB database            |
|[@primate/types](packages/types)             | Schema validation             |
|[@primate/session](packages/session)         | User sessions                 |
|[@primate/i18n](packages/i18n)               | Internationalization          |
|[@primate/native](packages/native)           | Compile native apps           |
|[website](packages/website)                  | Primate website               |
|[create-primate](packages/create-primate)    | GUI for creating Primate apps |

## Comparison with other frameworks

|Feature           |Next  |Nuxt  |SvelteKit|Primate                                                 |
|------------------|------|------|---------|--------------------------------------------------------|
|Backend           |JS, TS|JS, TS|JS, TS   |JS, TS, Go, Python, Ruby                                |
|Frontend          |React |Vue   |Svelte   |React, Vue, Svelte, Solid, Angular, HTMX, Handlebars, WC|
|Runtime           |Node  |Node  |Node     |Node, Deno, Bun                                         |
|I18N              |✓     |✓     |✗        |@primate/i18n                                           |
|Head Component    |✓     |✓     |✗        |React, Svelte, Solid                                    |
|Route guards      |✗     |✗     |✗        |✓                                                       |
|Recursive layouts |✓     |✓     |✓        |✓                                                       |
|Data stores/ORM   |✗     |✗     |✗        |MongoDB, MySQL, PostgreSQL, SQLite, SurrealDb           |
|WebSockets        |✗     |✗     |✗        |✓                                                       |
|Server-sent events|✗     |✗     |✗        |✓                                                       |
|User sessions     |✗     |✓     |✗        |@primate/session                                        |

## Resources

* Website: https://primatejs.com
* Discord: https://discord.gg/RSg4NNwM4f
* Reddit: [r/primatejs](https://reddit.com/r/primatejs)
* Twitter (X): [@primatejs](https://x.com/primatejs)
* Blog: https://primatejs.com/blog
* StackOverflow: https://stackoverflow.com/questions/tagged/primate
* Demo app: https://github.com/primatejs/app

## License

MIT

## Contributing

By contributing to Primate, you agree that your contributions will be licensed
under its MIT license.

Clone this repo and https://github.com/primatejs/app in the same location,
and switch to the `dev` branch in the app repo. Then, in the app repo, run

* `npm run node` for Node in development mode
* `npm run node:prod` for Node in production mode
* `npm run deno` for Deno in development mode
* `npm run deno:prod` for Deno in production mode
* `npm run bun` for Bun in development mode
* `npm run bun:prod` for Bun in production mode
* `npm run bun:compile` for compiling desktop app with Bun

[read guide]: https://primatejs.com/guide/getting-started
