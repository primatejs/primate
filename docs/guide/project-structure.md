# Project structure

While Primate can run without any project structure at all, here is a typical
setup you would use.

```sh
.
├─ static/
│  └─ [static assets]
├─ pages/
│  └─ app.html
├─ primate.config.js
├─ package.json
├─ routes/
│  └─ [filesystem-based routes]
└─ components/
   └─ [view components]
```

## static

This directory contains static assets such as JavaScript, CSS, font files or
anything else you would want Primate to serve statically.

Every file in this directory is mapped to the root path, `/`. For example, if
you have a `style.css` file, it will be served at the path `/style.css`.

Static assets take precedence over [routes][routes]. You can configure 
Primate to serve static assets from a different path by setting the
`http.static.root` option in your configuration to something else.

## pages

This directory contains a collection of page templates you use with your
components, including the [default `app.html`][default-page] that you can
override.

## primate.config.js

Your project configuration file. If it doesn't exist, Primate will use
its [default configuration][default-config]. If it exists, Primate will merge
your custom configuration with the defaults, using properties you set to
override defaults. Refer to the [configuration](/guide/configuration) section
for an in-depth review of all options.

## package.json

While it is not strictly required to have a package.json file in your project,
it is useful for pinning the version of Primate and of additional modules you
use.

To pin the current version of Primate for your project, run `npm i primate`. A
package.json file will be created for you if it doesn't exist. Make sure you
commit this file into your version control system.

## routes

This directory contains all your [app routes][routes] hierarchically. If you
were creating a blog, this is how a typical layout could look like.

```sh caption=routes | web app
.
├─ index.js # view homepage -> /
└─ post/
   ├─ add.js # add post -> /post/add
   └─ {postId}/
      ├─ comment/
      │  └─ add.js # add comment on post -> /post/1/comment/add
      ├─ comments.js # show comments on posts -> /post/1/comments
      ├─ delete.js # delete post -> /post/1/delete
      └─ edit.js # edit post -> /post/1/edit
```

!!!
Some of the above route examples use `1`, where in fact any value could stand
for `{postId}`. We'll later come back to path parameters in depth.
!!!

Here we chose our paths to represent CRUD actions. This is appropriate for a
web app that uses the same route for showing and submitting a form. However, if
you were developing an API, you might opt for using a wider variety of HTTP
verbs. In that case, your layout might look a little different.

```sh caption=routes | API
.
├─ post/
│  ├─ {postId}/
│  │  ├─ comment.js # create comment, read comments -> /post/1/comment
│  │  └─ {commentId}.js # read, update, delete comment -> post/1/comment/2
│  └─ {postId}.js # read, update, delete post -> post/1
└─ post.js # create post, read posts -> /post
```

## components

This directory contains a collection of [view components][components] for your
app. These can be any type of file supported by Primate's content handlers. In
our initial example, we placed an HTML page in this directory which we then
served with the `view` handler.

If your app is an API or doesn't have any views, you don't need to create this
directory.

Primate's official modules includes support for various [frontend
frameworks](/modules/frameworks) such as React, Vue, Svelte or HTMX.

[routes]: /guide/routes
[components]: /guide/components
[default-config]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/primate.config.js
[default-page]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/page.html
