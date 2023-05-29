# Use cases

Primate can satisfy several different use cases, either individually or in
conjunction. You can use this page as orientation to see what parts of the
guide you should read next to address your use case.

## Static server

By default, if Primate detects a `static` directory in your project root at
runtime, it will copy its contents to `public` and they will be served from
there. If you just need a static server, simply create a `static` directory and
put any files you want to serve in it.

By default those files will be served from the root path. If you have an
`image.png` in `static`, it will be served at the path `/image.png`. If you
want to change that, set [`http.static.root`][http-static-root] to something else
(default is `/`).

By default, Primate will load certain files (JavaScript, CSS) into memory and
not copy them over into `public`. Those files will be served directly from
memory during runtime. If you want Primate to copy everything from `static`
into `public`, set [`http.static.pure`][http-static-pure] to `true`.

If you want to change the `static` or `public` directory to something else,
change [`paths.static`][paths-static] or [`paths.public`][paths-public].

## API

Primate's [filesystem-based routes][routes] are excellent for creating an API.
Primate generally follows the OpenAPI specification in denoting path parameters
with braces (`{}`) and making the body and path, query, cookie and header
parameters easily accessible to the route function.

```js caption=routes/comment/{commentId}.js
export default {
    put(request) {
      const {path, query, cookies, headers, body} = request;

      return `
      You've sent a PUT request with the following data:

      Path:
        /comment/${path.get("commentId")}
      Query:
        timestamps: ${query.get("timestamps")}
      Cookies:
        jar: ${cookies.get("jar")}
      Headers:
        host: ${headers.get("host")}
      Body:
        title: ${body.get("title")}
        text: ${body.get("text")}
      `;
    },
};
```

If we assume a client sent the following HTTP request.

```http
PUT /comment/1?timestamps=UTC HTTP/1.1
Host: primatejs.com
Cookie: jar=full;
Content-Type: application/json

{"title":"Comment title","text":"Comment text"}
```

Then Primate will respond in plain text as follows.

```text
You've sent a PUT request with the following data:

Path:
  /comment/1
Query:
  timestamps: UTC
Cookies:
  jar: full
Headers:
  host: localhost:6161
Body:
  title: Comment title
  text: Comment text
```

## Web app

Primate supports serving HTML either directly from a route function using the
[`html` handler][html-handler] or loaded from the `components` directory using
the [`view` handler][view-handler].

In the [Getting started][quick-start] section, we showed how to build a simple
web page that includes form submission. However, modern apps include many
aspects such as complex [frontend frameworks][frameworks] with server-side
rendering and hydration, [data stores][stores] with transactions,
[bundling][bundling] and [user sessions][sessions]. Primate's [module
system][extending-primate] allows these extensions to be easily added to an app.
Primate's [official modules][official-modules] (those under the NPM
namespace `@primate`) are updated alongside the core framework.

As an example for the web app capabilities of Primate, the Primate team is
working on [Priss][priss], a Primate + Svelte site generator used to facilitate
combining Markdown-based documentation websites with dynamic features (user
login, sessions). The Primate website uses Priss itself.

[http-static-root]: /guide/configuration#http-static-root
[http-static-pure]: /guide/configuration#http-static-pure
[paths-static]: /guide/configuration#paths-static
[paths-public]: /guide/configuration#paths-public
[routes]: /guide/routes
[html-handler]: /guide/responses#html
[view-handler]: /guide/responses#view
[quick-start]: /guide/getting-started#quick-start
[frameworks]: /modules/frameworks
[stores]: /modules/stores
[bundling]: /modules/esbuild
[sessions]: /modules/sessions
[priss]: https://github.com/primatejs/priss
[extending-primate]: /guide/extending-primate
[official-modules]: /modules/official
