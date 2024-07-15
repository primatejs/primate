import { stdout } from "rcompat/stdio";

export default (...messages) => stdout.write(messages.join(" "));
