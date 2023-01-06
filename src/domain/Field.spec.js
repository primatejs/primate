import Field from "./Field.js";
import Storable from "../types/Storable.js";

const {resolve} = Field;

export default test => {
  test.case("construct: property required", assert => {
    assert(() => new Field()).throws("`property` required");
  });

  test.case("construct: type must be constructible", assert => {
    assert(() => new Field("name", {type: String})).not_throws();
    assert(() => new Field("name", {})).throws();
    for (const type of [{}, [], undefined, null, "", 0]) {
      assert(() => new Field("name", {type})).throws();
    }
  });

  test.case("construct: type must be Storable", (assert, {Animal}) => {
    // no error, builtin
    assert(() => new Field("name", String)).not_throws();
    // no error, Domain
    assert(() => new Field("name", Animal)).not_throws();
    // no error, extends Storable
    const StorableAnimal = class extends Storable {};
    assert(() => new Field("name", StorableAnimal)).not_throws();
    // error, does not extend Storable
    assert(() => new Field("name", Field))
      .throws("`Field` must subclass Storable");
  });

  test.case("construct: predicates must be array", assert => {
    const field = predicates => new Field("name", {type: String, predicates});

    assert(() => field([])).not_throws();
    // guarded by maybe.array accepting undefined or null
    assert(() => field(undefined)).not_throws();
    assert(() => field(null)).not_throws();

    for (const predicate of [{}, "", 0]) {
      assert(() => field(predicate)).throws(`\`${predicate}\` must be array`);
    }
  });

  test.case("construct: options.{transient,optional} default false", assert => {
    const name = new Field("name", String);
    assert(name.options.transient).false();
    assert(name.options.optional).false();
  });

  test.case("resolve: name required", assert => {
    assert(() => resolve()).throws("`name` required");
  });

  test.case("resolve: transient and optional false per default", assert => {
    const {options} = resolve("title");
    assert(options.optional).false();
    assert(options.transient).false();
  });

  test.case("resolve: resolve property name correctly", assert => {
    assert(resolve("?title").property).equals("title");
    assert(resolve("?~title").property).equals("title");
    assert(resolve("~?title").property).equals("title");
  });

  test.case("resolve: resolves optional correctly", assert => {
    assert(resolve("?title").options.optional).true();
    assert(resolve("?~title").options.optional).true();
    assert(resolve("~?title").options.optional).true();
  });

  test.case("resolve: resolves transient correctly", assert => {
    assert(resolve("~title").options.transient).true();
    assert(resolve("~?title").options.transient).true();
    assert(resolve("?~title").options.transient).true();
  });
};
