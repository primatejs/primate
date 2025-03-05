import serve_asset from "primate/serve-asset";
import FileRef from "@rcompat/fs/FileRef";
import map from "@rcompat/object/map";

const load = async resource_map =>
  Object.fromEntries(await Promise.all(Object.entries(resource_map).map(
    async ([key, url]) => [key, await FileRef.text(url)])));

export default async ({
  pages_app,
  page_imports,
  client_imports,
  static_imports,
  static_root,
  Webview,
}) => {
  const clients = map(client_imports, ([key, url]) => [key, new FileRef(url)]);
  const statics = map(static_imports, ([key, url]) => [key, new FileRef(url)]);
  const pages = await load(page_imports);

  return {
    page(name) {
      return pages[name] ?? pages[pages_app];
    },
    asset(pathname) {
      const client_file = clients[pathname];
      if (client_file !== undefined) {
        return serve_asset(client_file);
      }
      if (pathname.startsWith(static_root)) {
        const assetname = pathname.slice(static_root.length);
        const static_file = statics[assetname];
        if (static_file !== undefined) {
          return serve_asset(static_file);
        }
      }
    },
    webview() {
      return Webview;
    },
  };
};
