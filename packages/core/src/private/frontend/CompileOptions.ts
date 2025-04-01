import type { BuildApp } from "#build/app";
import type FileRef from "@rcompat/fs/FileRef";
import type MaybePromise from "pema/MaybePromise";

export default interface CompileOptions {
  extension: string;
  name: string;
  compile: {
    server?: (text: string, component?: FileRef, app?: BuildApp) =>
      MaybePromise<string>,
    client?: (text: string, component: FileRef) => MaybePromise<{
      js: string,
      css?: string | null,
    }>,
  }
  create_root?: (depth: number) => string;
};
