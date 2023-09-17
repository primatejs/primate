import Pool from "./Pool.js";
import errors from "./errors.js";

const id_pool = {manager: {new: () => null, kill: () => null}};
const size = 4;

export default test => {
  test.reassert(assert => {
    return {assert, pool: new Pool(id_pool)};
  });

  test.case("constructor invariants", ({assert, pool}) => {
    assert(() => new Pool()).throws();
    assert(() => new Pool({manager: {new: () => null}})).throws();
    assert(() => new Pool({
      manager: {new: () => null, kill: () => null},
    })).nthrows();

    assert(pool.reusable).false();
    assert(pool.inflatable).true();
  });

  test.case("acquire", async ({assert, pool}) => {
    const c = [];
    for (let i = 0; i < size; i++) {
      assert(pool.reusable).false();
      assert(pool.inflatable).true();
      c.push(await pool.acquire());
    }
    assert(pool.inflatable).false();
  });

  test.case("release", async ({assert, pool}) => {
    const c = [];
    for (let i = 0; i < size; i++) {
      c.push(await pool.acquire());
    }
    assert(pool.inflatable).false();
    assert(pool.reusable).false();
    for (let i = 0; i < size; i++) {
      pool.release(c[i]);
      assert(pool.inflatable).false();
      assert(pool.reusable).true();
    }

    assert(() => pool.release(null)).throws(errors.NOT_FOUND);
  });

  test.case("clear", async ({assert, pool}) => {
    const c = [];
    for (let i = 0; i < size; i++) {
      c.push(await pool.acquire());
    }
    pool.release(c[0]);
    pool.release(c[1]);
    assert(pool.reusable).true();
    assert(pool.inflatable).false();

    await pool.clear();

    assert(pool.reusable).false();
    assert(pool.inflatable).true();
  });

  test.case("timeout", async ({assert}) => {
    const timeout = 200;
    const delta = 50;
    const pool = new Pool({
      timeout,
      ...id_pool,
    });

    const c = [];
    for (let i = 0; i < size; i++) {
      c.push(await pool.acquire());
    }
    try {
      await pool.acquire();
    } catch (error) {
      assert(error.message).equals(errors.TIMED_OUT);
    }

    setTimeout(() => {
      pool.release(c[0]);
    }, timeout + delta);

    try {
      c[0] = await pool.acquire();
      assert.fail();
    } catch (error) {
      assert(error.message).equals(errors.TIMED_OUT);
    }

    setTimeout(() => {
      pool.release(c[0]);
    }, timeout - delta);

    try {
      c[0] = await pool.acquire();
      assert(true).equals(true);
    } catch (error) {
      assert.fail();
    }
  });

};
