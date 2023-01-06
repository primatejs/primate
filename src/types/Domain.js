import Storable from "./Storable.js";

export default class DomainType extends Storable {
  static type_error({name}) {
    return `Must be a ${name}`;
  }

  static async is(_id, DomainClass) {
    return await DomainClass.count({_id}) === 1;
  }
}
