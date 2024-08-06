import collect from "@rcompat/fs/collect";
const html = /^.*.html$/u;

export default async app => {
  const location = app.get("location");
  const http = app.get("http");
  const client = app.runpath(location.client);
  const re = /app..*(?:js|css)$/u;

  const import_statics = (await client.collect()).map((path, i) => `
    import static${i} from "./client${path.debase(client)}" with { type: "file" };
    statics["${path.debase(client)}"] = await file(static${i});`)
    .join("\n");

  const $imports = (await Promise.all((await client.collect(re, { recursive: false }))
    .map(async (file, i) => {
      const type = file.extension === ".css" ? "style" : "js";
      const src = `${http.static.root}${file.debase(client).name}`;
      const path = `./${file.debase(`${app.path.build}/`)}`;
      return {
        src,
        path,
        code: `await file(asset${i}).text()`,
        type,
        empty: (await file.text()).length === 0,
      };
    }))).filter(file => !file.empty);
  const d = app.runpath(location.pages);
  const pages = await Promise.all((await collect(d, html, { recursive: true }))
    .map(async file => `${file}`.replace(`${d}/`, _ => "")));
  const app_js = $imports.find($import => $import.src.endsWith(".js"));

  const assets_scripts = `
  import Webview from "@rcompat/webview/worker/${app.build_target}";
  import join from "@rcompat/fs/join";
  import file from "@rcompat/fs/file";
  import stringify from "@rcompat/object/stringify";
  import crypto from "@rcompat/crypto";
  import { OK } from "@rcompat/http/status";
  import { resolve } from "@rcompat/http/mime";

  const encoder = new TextEncoder();
  const hash = async (data, algorithm = "sha-384") => {
    const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
    const prefix = algorithm.replace("-", _ => "");
    return \`\${prefix}-\${btoa(String.fromCharCode(...new Uint8Array(bytes)))}\`;
  };

  const statics = {};
  ${import_statics}

  ${$imports.map(({ path }, i) =>
    `import asset${i} from "${path}" with { type: "file" };
    const file${i} = await file(asset${i}).text();`).join("\n  ")}
  const assets = [${$imports.map(($import, i) => `{
  src: "${$import.src}",
  code: file${i},
  type: "${$import.type}",
  inline: false,
  integrity: await hash(file${i}),
  }`).join(",\n  ")}];

  ${app_js === undefined ? "" :
    `const imports = {
     app: join("${http.static.root}", "${$imports.find($import =>
  $import.src.includes("app") && $import.src.endsWith(".js")).src}").webpath(),
    };
    // importmap
    assets.push({
      inline: true,
      code: stringify({ imports }),
      type: "importmap",
      integrity: await hash(stringify({ imports })),
    });`}

  ${pages.map((page, i) =>
    `import i_page${i} from "./${location.pages}/${page}" with { type: "file" };
    const page${i} = await file(i_page${i}).text();`).join("\n  ")}

  const pages = {
  ${pages.map((page, i) => `"${page}": page${i},`).join("\n  ")}
  };
  const serve_asset = asset => new Response(asset.stream(), {
    status: OK,
    headers: {
      "Content-Type": resolve(asset.name),
    },
  });

  const loader = {
    page(name) {
      return pages[name] ?? pages["${app.get("pages.app")}"];
    },
    asset(pathname) {
      const root_asset = statics[pathname];
      if (root_asset !== undefined) {
        return serve_asset(root_asset);
      }
      const static_asset = statics[\`/static\${pathname}\`];
      if (static_asset !== undefined) {
        return serve_asset(static_asset);
      }
    },
    webview() {
      return Webview;
    }
  };
  const target = "${app.build_target}";

  export { assets, loader, target };
`;
  await app.path.build.join("target.js").write(assets_scripts);

};
