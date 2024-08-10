import serve_asset from "primate/serve-asset";
import file from "@rcompat/fs/file";

export default ({
  pages_app,
  pages,
  rootfile,
}) => {
  const buildroot = file(rootfile).join("..");

  return {
    page(name) {
      return pages[name] ?? pages[pages_app];
    },
    async asset(pathname) {
      const root_asset = buildroot.join(`client/${pathname}`);
      if (await root_asset.isFile()) {
        return serve_asset(root_asset);
      }
      const static_asset = buildroot.join(`client/static/${pathname}`);
      if (await static_asset.isFile()) {
        return serve_asset(static_asset);
      }
    },
  };
};
