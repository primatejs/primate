import serve_asset from "primate/serve-asset";
import file from "@rcompat/fs/file";

const load = async resource_map =>
  Object.fromEntries(await Promise.all(Object.entries(resource_map).map(
    async ([key, url]) => [key, await file(url).text()])));

export default async ({
  pages_app,
  page_imports,
  static_imports,
  Webview,
}) => {
  const statics = Object.fromEntries(Object.entries(static_imports).map(
    ([key, url]) => [key, file(url)]));
  const pages = await load(page_imports);

  return {
    page(name) {
      return pages[name] ?? pages[pages_app];
    },
    asset(pathname) {
      const root_asset = statics[pathname];
      if (root_asset !== undefined) {
        return serve_asset(root_asset);
      }
      const static_asset = statics[`/static${pathname}`];
      if (static_asset !== undefined) {
        return serve_asset(static_asset);
      }
    },
    webview() {
      return Webview;
    },
  };
};
