
  import loader from "primate/loader";
  import load_text from "primate/load-text";

  const asset0 = await load_text(import.meta.url, ".././client/app.js");
  const assets = [{
  src: "/app.js",
  code: asset0,
  type: "js",
  inline: false,
  }];

  const imports = {
    app: "/app.js"
  };
  // importmap
  assets.push({
    inline: true,
    code: { imports },
    type: "importmap",
  });

  const pages = {
    
  };

  export default {
    assets,
    loader: loader({
      pages,
      rootfile: import.meta.url,
      pages_app: "app.html",
      static_root: "/",
    }),
    target: "web",
  };
