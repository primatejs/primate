import Storeable from "./Storeable.js";

export default class DomainType extends Storeable {
  static type_error({name}) {
    return `Must be a ${name}`;
  }

  static async is(_id, DomainClass) {
    return await DomainClass.count({_id}) === 1;
  }
}
