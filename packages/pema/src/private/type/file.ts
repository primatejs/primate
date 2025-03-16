import ValidatedInstance from "#type/ValidatedInstance";

class FileType extends ValidatedInstance<File> {
  constructor() {
    super("file", File);
  }
}

export default new FileType();
