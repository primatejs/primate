import ValidatedInstance from "#type/ValidatedInstance";

class DateType extends ValidatedInstance<Date> {
  constructor() {
    super("date", Date);
  }
}

export default new DateType();
