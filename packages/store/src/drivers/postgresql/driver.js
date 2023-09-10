import {numeric} from "runtime-compat/dyndef";
import {filter} from "runtime-compat/object";
import {ident} from "../base.js";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";
import wrap from "../../wrap.js";
import Facade from "./Facade.js";

const name = "postgresql";
const dependencies = ["postgres"];
const on = filter(peers, ([key]) => dependencies.includes(key));
const defaults = {
  host: "localhost",
  port: 5432,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  db,
  user,
  pass,
} = {}) => async _ => {
  const [{default: Driver}] = await depend(on, `store:${name}`);

  const driver = new Driver({
    host,
    port,
    db,
    user,
    pass,
  });

  const types = {
    primary: {
      validate(value) {
        if (numeric(value)) {
          return Number(value);
        }
        throw new Error(`\`${value}\` is not a valid primary key value`);
      },
      ...ident,
      out(value) {
        return Number(value);
      },
    },
    object: {
      in(value) {
        return JSON.stringify(value);
      },
      out(value) {
        return JSON.parse(value);
      },
    },
    number: ident,
    bigint: {
      in(value) {
        return value.toString();
      },
      out(value) {
        return BigInt(value);
      },
    },
    boolean: ident,
    date: {
      in(value) {
        return value;
      },
      out(value) {
        return new Date(value);
      },
    },
    string: ident,
  };

  return {
    name,
    types,
    async transact(stores) {
      return (others, next) =>
        driver.begin(async connection => {
          const facade = new Facade(connection);
          return next([
            ...others, ...stores.map(([name, store]) =>
              [name, wrap(store, facade, types)]),
          ]);
        });
    },
  };
};
