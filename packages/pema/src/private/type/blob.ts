import ValidatedInstance from "#type/ValidatedInstance";

class BlobType extends ValidatedInstance<Blob> {
  constructor() {
    super("blob", Blob);
  }
}

export default new BlobType();
