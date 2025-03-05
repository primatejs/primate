import serve_asset from "primate/serve-asset";
import FileRef from "@rcompat/fs/FileRef";

export default ({
  pages_app,
  pages,
  rootfile,
  static_root,
}) => {
  const buildroot = new FileRef(rootfile).join("..");

  return {
    page(name) {
      return pages[name] ?? pages[pages_app];
    },
    async asset(pathname) {
      const client_file = buildroot.join(`client/${pathname}`);
      if (await client_file.isFile()) {
        return serve_asset(client_file);
      }
      if (pathname.startsWith(static_root)) {
        const assetname = pathname.slice(static_root.length);
        const static_file = buildroot.join(`server/static/${assetname}`);
        if (await static_file.isFile()) {
          return serve_asset(static_file);
        }
      }
    },
  };
};
