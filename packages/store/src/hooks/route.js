import TransactionRollback from "@primate/store/errors/transaction-rollback";
import inflate from "@rcompat/object/inflate";
import override from "@rcompat/object/override";

const make_transaction = async env => {
  const [transaction] = await Promise.all(env.drivers.map(driver =>
    driver.transact(env.stores
      .filter(store => (store.driver ?? env.defaults.driver) === driver),
    )));

  return {
    id: crypto.randomUUID(),
    transaction,
  };
};

export default env => async (request, next) => {
  if (!env.active) {
    return next(request);
  }

  const { id, transaction } = await make_transaction(env);

  try {
    return await transaction([], stores => {
      const store = stores.reduce((base, [name, store]) =>
        override(base, inflate(name, store))
      , {});
      return next({ ...request, store });
    },
    );
  } catch (error) {
    env.log.auto(error);
    TransactionRollback.warn(env.log, id, error.name);

    // let core handle error
    throw error;
  }
};
