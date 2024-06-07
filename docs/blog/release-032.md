Today we're announcing the availability of the Primate 0.32 preview release.
This release revamps the build system to build and start Primate separately,
adds supports for a new frontend handler, Eta, and XXX.

!!!
If you're new to Primate, we recommend reading the [Getting started] page to
get an idea of it.
!!!

## Revamped build system

Primate now strictly separates building an app and starting, allowing you to
build your Primate app on one server and deploy it on another.

## Supporting Eta

[Eta] describes itself as a faster, more lightweight, and more configurable EJS
alternative.

Create a Eta component in `components`.

```html caption=components/post-index.eta
<h1>All posts</h1>
<div>
<% it.posts.forEach(function(post){ %>
<h2><a href="/post/view/<%= post.id %>"><%= post.title %></a></h2>
<% }) %>
</div>
```

Serve it from a route.

```js caption=routes/eta.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.eta", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/eta.

## Quality of life improvements

## Migrating from 0.31

## Next on the road

Some of the things we plan to tackle in the upcoming weeks are,

* Multidriver transactions
* Add a `command` hook that would allow modules to register command line
  namespaces, to be able to run `npx primate [namespace] [command] [flags]`
* Use this new hook to create database migrations for SQL-flavored databases
* Add hydration and SPA support for `@primate/vue`
* Flesh out stores with default values, additional predicates and relations
  between tables/collections
* Add more type variants

This list isn't exhaustive or binding. None, some or all of these features may
be included in 0.33, and other features may be prioritized according to
feedback.

## Fin

If you like Primate, consider [joining our channel #primate][irc] on
irc.libera.chat.

Otherwise, have a blast with the new version!

[rcompat]: /blog/introducing-rcompat
[Getting started]: /guide/getting-started
[irc]: https://web.libera.chat#primate
[changelog]: https://github.com/primatejs/primate/releases/tag/0.32.0
[Eta]: https://eta.js.org
