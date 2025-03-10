import log from "#log";
import type { LogLevel } from "#loglevel";
import FileRef from "@rcompat/fs/FileRef";
import type StringLike from "@rcompat/string/StringLike";

export default (level: LogLevel) =>
  (module: string) => 
    (url: string, { message, fix }: { message: string, fix: string }) =>
      (...params: StringLike[]) =>
        log[level]({
          params,
          module,
          name: new FileRef(url).base,
          message,
          fix,
        });

