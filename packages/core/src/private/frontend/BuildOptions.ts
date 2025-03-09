import type CompileOptions from "#frontend/CompileOptions";
import type Publish from "#frontend/Publish";

export default interface BuildOptions extends CompileOptions {
  expose: string;
  publish: Publish;
  ssr: boolean;
  create_root: (depth: number) => string;
}
