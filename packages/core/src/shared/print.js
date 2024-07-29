import { stdout } from "@rcompat/stdio/execute";

export default (...messages) => stdout.write(messages.join(" "));
