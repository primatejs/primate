import { WASI } from 'wasi';

let DATA_VIEW = new DataView(new ArrayBuffer());

function data_view(mem) {
  if (DATA_VIEW.buffer !== mem.buffer) DATA_VIEW = new DataView(mem.buffer);
  return DATA_VIEW;
}

function to_uint32(val) {
  return val >>> 0;
}
const UTF8_DECODER = new TextDecoder('utf-8');

const UTF8_ENCODER = new TextEncoder('utf-8');

function utf8_encode(s, realloc, memory) {
  if (typeof s !== 'string') throw new TypeError('expected a string');
  
  if (s.length === 0) {
    UTF8_ENCODED_LEN = 0;
    return 1;
  }
  
  let alloc_len = 0;
  let ptr = 0;
  let writtenTotal = 0;
  while (s.length > 0) {
    ptr = realloc(ptr, alloc_len, 1, alloc_len + s.length);
    alloc_len += s.length;
    const { read, written } = UTF8_ENCODER.encodeInto(
    s,
    new Uint8Array(memory.buffer, ptr + writtenTotal, alloc_len - writtenTotal),
    );
    writtenTotal += written;
    s = s.slice(read);
  }
  if (alloc_len > writtenTotal)
  ptr = realloc(ptr, alloc_len, 1, writtenTotal);
  UTF8_ENCODED_LEN = writtenTotal;
  return ptr;
}
let UTF8_ENCODED_LEN = 0;

class Slab {
  constructor() {
    this.list = [];
    this.head = 0;
  }
  
  insert(val) {
    if (this.head >= this.list.length) {
      this.list.push({
        next: this.list.length + 1,
        val: undefined,
      });
    }
    const ret = this.head;
    const slot = this.list[ret];
    this.head = slot.next;
    slot.next = -1;
    slot.val = val;
    return ret;
  }
  
  get(idx) {
    if (idx >= this.list.length)
    throw new RangeError('handle index not valid');
    const slot = this.list[idx];
    if (slot.next === -1)
    return slot.val;
    throw new RangeError('handle index not valid');
  }
  
  remove(idx) {
    const ret = this.get(idx); // validate the slot
    const slot = this.list[idx];
    slot.val = undefined;
    slot.next = this.head;
    this.head = idx;
    return ret;
  }
}

function throw_invalid_bool() {
  throw new RangeError("invalid variant discriminant for bool");
}

class RbAbiGuest {
  constructor() {
    this._resource0_slab = new Slab();
    this._resource1_slab = new Slab();
  }
  addToImports(imports) {
    if (!("canonical_abi" in imports)) imports["canonical_abi"] = {};
    
    imports.canonical_abi['resource_drop_rb-iseq'] = i => {
      this._resource0_slab.remove(i).drop();
    };
    imports.canonical_abi['resource_clone_rb-iseq'] = i => {
      const obj = this._resource0_slab.get(i);
      return this._resource0_slab.insert(obj.clone())
    };
    imports.canonical_abi['resource_get_rb-iseq'] = i => {
      return this._resource0_slab.get(i)._wasm_val;
    };
    imports.canonical_abi['resource_new_rb-iseq'] = i => {
      this._registry0;
      return this._resource0_slab.insert(new RbIseq(i, this));
    };
    
    imports.canonical_abi['resource_drop_rb-abi-value'] = i => {
      this._resource1_slab.remove(i).drop();
    };
    imports.canonical_abi['resource_clone_rb-abi-value'] = i => {
      const obj = this._resource1_slab.get(i);
      return this._resource1_slab.insert(obj.clone())
    };
    imports.canonical_abi['resource_get_rb-abi-value'] = i => {
      return this._resource1_slab.get(i)._wasm_val;
    };
    imports.canonical_abi['resource_new_rb-abi-value'] = i => {
      this._registry1;
      return this._resource1_slab.insert(new RbAbiValue(i, this));
    };
  }
  
  async instantiate(module, imports) {
    imports = imports || {};
    this.addToImports(imports);
    
    if (module instanceof WebAssembly.Instance) {
      this.instance = module;
    } else if (module instanceof WebAssembly.Module) {
      this.instance = await WebAssembly.instantiate(module, imports);
    } else if (module instanceof ArrayBuffer || module instanceof Uint8Array) {
      const { instance } = await WebAssembly.instantiate(module, imports);
      this.instance = instance;
    } else {
      const { instance } = await WebAssembly.instantiateStreaming(module, imports);
      this.instance = instance;
    }
    this._exports = this.instance.exports;
    this._registry0 = new FinalizationRegistry(this._exports['canonical_abi_drop_rb-iseq']);
    this._registry1 = new FinalizationRegistry(this._exports['canonical_abi_drop_rb-abi-value']);
  }
  rubyShowVersion() {
    this._exports['ruby-show-version: func() -> ()']();
  }
  rubyInit() {
    this._exports['ruby-init: func() -> ()']();
  }
  rubySysinit(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const vec1 = arg0;
    const len1 = vec1.length;
    const result1 = realloc(0, 0, 4, len1 * 8);
    for (let i = 0; i < vec1.length; i++) {
      const e = vec1[i];
      const base = result1 + i * 8;
      const ptr0 = utf8_encode(e, realloc, memory);
      const len0 = UTF8_ENCODED_LEN;
      data_view(memory).setInt32(base + 4, len0, true);
      data_view(memory).setInt32(base + 0, ptr0, true);
    }
    this._exports['ruby-sysinit: func(args: list<string>) -> ()'](result1, len1);
  }
  rubyOptions(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const vec1 = arg0;
    const len1 = vec1.length;
    const result1 = realloc(0, 0, 4, len1 * 8);
    for (let i = 0; i < vec1.length; i++) {
      const e = vec1[i];
      const base = result1 + i * 8;
      const ptr0 = utf8_encode(e, realloc, memory);
      const len0 = UTF8_ENCODED_LEN;
      data_view(memory).setInt32(base + 4, len0, true);
      data_view(memory).setInt32(base + 0, ptr0, true);
    }
    const ret = this._exports['ruby-options: func(args: list<string>) -> handle<rb-iseq>'](result1, len1);
    return this._resource0_slab.remove(ret);
  }
  rubyScript(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = UTF8_ENCODED_LEN;
    this._exports['ruby-script: func(name: string) -> ()'](ptr0, len0);
  }
  rubyInitLoadpath() {
    this._exports['ruby-init-loadpath: func() -> ()']();
  }
  rbEvalStringProtect(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = UTF8_ENCODED_LEN;
    const ret = this._exports['rb-eval-string-protect: func(str: string) -> tuple<handle<rb-abi-value>, s32>'](ptr0, len0);
    return [this._resource1_slab.remove(data_view(memory).getInt32(ret + 0, true)), data_view(memory).getInt32(ret + 4, true)];
  }
  rbFuncallvProtect(arg0, arg1, arg2) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const obj0 = arg0;
    if (!(obj0 instanceof RbAbiValue)) throw new TypeError('expected instance of RbAbiValue');
    const vec2 = arg2;
    const len2 = vec2.length;
    const result2 = realloc(0, 0, 4, len2 * 4);
    for (let i = 0; i < vec2.length; i++) {
      const e = vec2[i];
      const base = result2 + i * 4;
      const obj1 = e;
      if (!(obj1 instanceof RbAbiValue)) throw new TypeError('expected instance of RbAbiValue');
      data_view(memory).setInt32(base + 0, this._resource1_slab.insert(obj1.clone()), true);
    }
    const ret = this._exports['rb-funcallv-protect: func(recv: handle<rb-abi-value>, mid: u32, args: list<handle<rb-abi-value>>) -> tuple<handle<rb-abi-value>, s32>'](this._resource1_slab.insert(obj0.clone()), to_uint32(arg1), result2, len2);
    return [this._resource1_slab.remove(data_view(memory).getInt32(ret + 0, true)), data_view(memory).getInt32(ret + 4, true)];
  }
  rbIntern(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["cabi_realloc"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = UTF8_ENCODED_LEN;
    const ret = this._exports['rb-intern: func(name: string) -> u32'](ptr0, len0);
    return ret >>> 0;
  }
  rbErrinfo() {
    const ret = this._exports['rb-errinfo: func() -> handle<rb-abi-value>']();
    return this._resource1_slab.remove(ret);
  }
  rbClearErrinfo() {
    this._exports['rb-clear-errinfo: func() -> ()']();
  }
  rstringPtr(arg0) {
    const memory = this._exports.memory;
    const obj0 = arg0;
    if (!(obj0 instanceof RbAbiValue)) throw new TypeError('expected instance of RbAbiValue');
    const ret = this._exports['rstring-ptr: func(value: handle<rb-abi-value>) -> string'](this._resource1_slab.insert(obj0.clone()));
    const ptr1 = data_view(memory).getInt32(ret + 0, true);
    const len1 = data_view(memory).getInt32(ret + 4, true);
    const result1 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr1, len1));
    this._exports["cabi_post_rstring-ptr"](ret);
    return result1;
  }
  rbVmBugreport() {
    this._exports['rb-vm-bugreport: func() -> ()']();
  }
  rbGcEnable() {
    const ret = this._exports['rb-gc-enable: func() -> bool']();
    const bool0 = ret;
    return bool0 == 0 ? false : (bool0 == 1 ? true : throw_invalid_bool());
  }
  rbGcDisable() {
    const ret = this._exports['rb-gc-disable: func() -> bool']();
    const bool0 = ret;
    return bool0 == 0 ? false : (bool0 == 1 ? true : throw_invalid_bool());
  }
  rbSetShouldProhibitRewind(arg0) {
    const ret = this._exports['rb-set-should-prohibit-rewind: func(new-value: bool) -> bool'](arg0 ? 1 : 0);
    const bool0 = ret;
    return bool0 == 0 ? false : (bool0 == 1 ? true : throw_invalid_bool());
  }
}

class RbIseq {
  constructor(wasm_val, obj) {
    this._wasm_val = wasm_val;
    this._obj = obj;
    this._refcnt = 1;
    obj._registry0.register(this, wasm_val, this);
  }
  
  clone() {
    this._refcnt += 1;
    return this;
  }
  
  drop() {
    this._refcnt -= 1;
    if (this._refcnt !== 0)
    return;
    this._obj._registry0.unregister(this);
    const dtor = this._obj._exports['canonical_abi_drop_rb-iseq'];
    const wasm_val = this._wasm_val;
    delete this._obj;
    delete this._refcnt;
    delete this._wasm_val;
    dtor(wasm_val);
  }
}

class RbAbiValue {
  constructor(wasm_val, obj) {
    this._wasm_val = wasm_val;
    this._obj = obj;
    this._refcnt = 1;
    obj._registry1.register(this, wasm_val, this);
  }
  
  clone() {
    this._refcnt += 1;
    return this;
  }
  
  drop() {
    this._refcnt -= 1;
    if (this._refcnt !== 0)
    return;
    this._obj._registry1.unregister(this);
    const dtor = this._obj._exports['canonical_abi_drop_rb-abi-value'];
    const wasm_val = this._wasm_val;
    delete this._obj;
    delete this._refcnt;
    delete this._wasm_val;
    dtor(wasm_val);
  }
}

function addRbJsAbiHostToImports(imports, obj, get_export) {
  if (!("rb-js-abi-host" in imports)) imports["rb-js-abi-host"] = {};
  imports["rb-js-abi-host"]["eval-js: func(code: string) -> variant { success(handle<js-abi-value>), failure(handle<js-abi-value>) }"] = function(arg0, arg1, arg2) {
    const memory = get_export("memory");
    const ptr0 = arg0;
    const len0 = arg1;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.evalJs(result0);
    const variant1 = ret0;
    switch (variant1.tag) {
      case "success": {
        const e = variant1.val;
        data_view(memory).setInt8(arg2 + 0, 0, true);
        data_view(memory).setInt32(arg2 + 4, resources0.insert(e), true);
        break;
      }
      case "failure": {
        const e = variant1.val;
        data_view(memory).setInt8(arg2 + 0, 1, true);
        data_view(memory).setInt32(arg2 + 4, resources0.insert(e), true);
        break;
      }
      default:
      throw new RangeError("invalid variant specified for JsAbiResult");
    }
  };
  imports["rb-js-abi-host"]["is-js: func(value: handle<js-abi-value>) -> bool"] = function(arg0) {
    const ret0 = obj.isJs(resources0.get(arg0));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["instance-of: func(value: handle<js-abi-value>, klass: handle<js-abi-value>) -> bool"] = function(arg0, arg1) {
    const ret0 = obj.instanceOf(resources0.get(arg0), resources0.get(arg1));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["global-this: func() -> handle<js-abi-value>"] = function() {
    const ret0 = obj.globalThis();
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["int-to-js-number: func(value: s32) -> handle<js-abi-value>"] = function(arg0) {
    const ret0 = obj.intToJsNumber(arg0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["float-to-js-number: func(value: float64) -> handle<js-abi-value>"] = function(arg0) {
    const ret0 = obj.floatToJsNumber(arg0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["string-to-js-string: func(value: string) -> handle<js-abi-value>"] = function(arg0, arg1) {
    const memory = get_export("memory");
    const ptr0 = arg0;
    const len0 = arg1;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.stringToJsString(result0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["bool-to-js-bool: func(value: bool) -> handle<js-abi-value>"] = function(arg0) {
    const bool0 = arg0;
    const ret0 = obj.boolToJsBool(bool0 == 0 ? false : (bool0 == 1 ? true : throw_invalid_bool()));
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["proc-to-js-function: func(value: u32) -> handle<js-abi-value>"] = function(arg0) {
    const ret0 = obj.procToJsFunction(arg0 >>> 0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["rb-object-to-js-rb-value: func(raw-rb-abi-value: u32) -> handle<js-abi-value>"] = function(arg0) {
    const ret0 = obj.rbObjectToJsRbValue(arg0 >>> 0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["js-value-to-string: func(value: handle<js-abi-value>) -> string"] = function(arg0, arg1) {
    const memory = get_export("memory");
    const realloc = get_export("cabi_realloc");
    const ret0 = obj.jsValueToString(resources0.get(arg0));
    const ptr0 = utf8_encode(ret0, realloc, memory);
    const len0 = UTF8_ENCODED_LEN;
    data_view(memory).setInt32(arg1 + 4, len0, true);
    data_view(memory).setInt32(arg1 + 0, ptr0, true);
  };
  imports["rb-js-abi-host"]["js-value-to-integer: func(value: handle<js-abi-value>) -> variant { f64(float64), bignum(string) }"] = function(arg0, arg1) {
    const memory = get_export("memory");
    const realloc = get_export("cabi_realloc");
    const ret0 = obj.jsValueToInteger(resources0.get(arg0));
    const variant1 = ret0;
    switch (variant1.tag) {
      case "f64": {
        const e = variant1.val;
        data_view(memory).setInt8(arg1 + 0, 0, true);
        data_view(memory).setFloat64(arg1 + 8, +e, true);
        break;
      }
      case "bignum": {
        const e = variant1.val;
        data_view(memory).setInt8(arg1 + 0, 1, true);
        const ptr0 = utf8_encode(e, realloc, memory);
        const len0 = UTF8_ENCODED_LEN;
        data_view(memory).setInt32(arg1 + 12, len0, true);
        data_view(memory).setInt32(arg1 + 8, ptr0, true);
        break;
      }
      default:
      throw new RangeError("invalid variant specified for RawInteger");
    }
  };
  imports["rb-js-abi-host"]["export-js-value-to-host: func(value: handle<js-abi-value>) -> ()"] = function(arg0) {
    obj.exportJsValueToHost(resources0.get(arg0));
  };
  imports["rb-js-abi-host"]["import-js-value-from-host: func() -> handle<js-abi-value>"] = function() {
    const ret0 = obj.importJsValueFromHost();
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["js-value-typeof: func(value: handle<js-abi-value>) -> string"] = function(arg0, arg1) {
    const memory = get_export("memory");
    const realloc = get_export("cabi_realloc");
    const ret0 = obj.jsValueTypeof(resources0.get(arg0));
    const ptr0 = utf8_encode(ret0, realloc, memory);
    const len0 = UTF8_ENCODED_LEN;
    data_view(memory).setInt32(arg1 + 4, len0, true);
    data_view(memory).setInt32(arg1 + 0, ptr0, true);
  };
  imports["rb-js-abi-host"]["js-value-equal: func(lhs: handle<js-abi-value>, rhs: handle<js-abi-value>) -> bool"] = function(arg0, arg1) {
    const ret0 = obj.jsValueEqual(resources0.get(arg0), resources0.get(arg1));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["js-value-strictly-equal: func(lhs: handle<js-abi-value>, rhs: handle<js-abi-value>) -> bool"] = function(arg0, arg1) {
    const ret0 = obj.jsValueStrictlyEqual(resources0.get(arg0), resources0.get(arg1));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["reflect-apply: func(target: handle<js-abi-value>, this-argument: handle<js-abi-value>, arguments: list<handle<js-abi-value>>) -> variant { success(handle<js-abi-value>), failure(handle<js-abi-value>) }"] = function(arg0, arg1, arg2, arg3, arg4) {
    const memory = get_export("memory");
    const len0 = arg3;
    const base0 = arg2;
    const result0 = [];
    for (let i = 0; i < len0; i++) {
      const base = base0 + i * 4;
      result0.push(resources0.get(data_view(memory).getInt32(base + 0, true)));
    }
    const ret0 = obj.reflectApply(resources0.get(arg0), resources0.get(arg1), result0);
    const variant1 = ret0;
    switch (variant1.tag) {
      case "success": {
        const e = variant1.val;
        data_view(memory).setInt8(arg4 + 0, 0, true);
        data_view(memory).setInt32(arg4 + 4, resources0.insert(e), true);
        break;
      }
      case "failure": {
        const e = variant1.val;
        data_view(memory).setInt8(arg4 + 0, 1, true);
        data_view(memory).setInt32(arg4 + 4, resources0.insert(e), true);
        break;
      }
      default:
      throw new RangeError("invalid variant specified for JsAbiResult");
    }
  };
  imports["rb-js-abi-host"]["reflect-construct: func(target: handle<js-abi-value>, arguments: list<handle<js-abi-value>>) -> handle<js-abi-value>"] = function(arg0, arg1, arg2) {
    const memory = get_export("memory");
    const len0 = arg2;
    const base0 = arg1;
    const result0 = [];
    for (let i = 0; i < len0; i++) {
      const base = base0 + i * 4;
      result0.push(resources0.get(data_view(memory).getInt32(base + 0, true)));
    }
    const ret0 = obj.reflectConstruct(resources0.get(arg0), result0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["reflect-delete-property: func(target: handle<js-abi-value>, property-key: string) -> bool"] = function(arg0, arg1, arg2) {
    const memory = get_export("memory");
    const ptr0 = arg1;
    const len0 = arg2;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.reflectDeleteProperty(resources0.get(arg0), result0);
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["reflect-get: func(target: handle<js-abi-value>, property-key: string) -> variant { success(handle<js-abi-value>), failure(handle<js-abi-value>) }"] = function(arg0, arg1, arg2, arg3) {
    const memory = get_export("memory");
    const ptr0 = arg1;
    const len0 = arg2;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.reflectGet(resources0.get(arg0), result0);
    const variant1 = ret0;
    switch (variant1.tag) {
      case "success": {
        const e = variant1.val;
        data_view(memory).setInt8(arg3 + 0, 0, true);
        data_view(memory).setInt32(arg3 + 4, resources0.insert(e), true);
        break;
      }
      case "failure": {
        const e = variant1.val;
        data_view(memory).setInt8(arg3 + 0, 1, true);
        data_view(memory).setInt32(arg3 + 4, resources0.insert(e), true);
        break;
      }
      default:
      throw new RangeError("invalid variant specified for JsAbiResult");
    }
  };
  imports["rb-js-abi-host"]["reflect-get-own-property-descriptor: func(target: handle<js-abi-value>, property-key: string) -> handle<js-abi-value>"] = function(arg0, arg1, arg2) {
    const memory = get_export("memory");
    const ptr0 = arg1;
    const len0 = arg2;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.reflectGetOwnPropertyDescriptor(resources0.get(arg0), result0);
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["reflect-get-prototype-of: func(target: handle<js-abi-value>) -> handle<js-abi-value>"] = function(arg0) {
    const ret0 = obj.reflectGetPrototypeOf(resources0.get(arg0));
    return resources0.insert(ret0);
  };
  imports["rb-js-abi-host"]["reflect-has: func(target: handle<js-abi-value>, property-key: string) -> bool"] = function(arg0, arg1, arg2) {
    const memory = get_export("memory");
    const ptr0 = arg1;
    const len0 = arg2;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.reflectHas(resources0.get(arg0), result0);
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["reflect-is-extensible: func(target: handle<js-abi-value>) -> bool"] = function(arg0) {
    const ret0 = obj.reflectIsExtensible(resources0.get(arg0));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["reflect-own-keys: func(target: handle<js-abi-value>) -> list<handle<js-abi-value>>"] = function(arg0, arg1) {
    const memory = get_export("memory");
    const realloc = get_export("cabi_realloc");
    const ret0 = obj.reflectOwnKeys(resources0.get(arg0));
    const vec0 = ret0;
    const len0 = vec0.length;
    const result0 = realloc(0, 0, 4, len0 * 4);
    for (let i = 0; i < vec0.length; i++) {
      const e = vec0[i];
      const base = result0 + i * 4;
      data_view(memory).setInt32(base + 0, resources0.insert(e), true);
    }
    data_view(memory).setInt32(arg1 + 4, len0, true);
    data_view(memory).setInt32(arg1 + 0, result0, true);
  };
  imports["rb-js-abi-host"]["reflect-prevent-extensions: func(target: handle<js-abi-value>) -> bool"] = function(arg0) {
    const ret0 = obj.reflectPreventExtensions(resources0.get(arg0));
    return ret0 ? 1 : 0;
  };
  imports["rb-js-abi-host"]["reflect-set: func(target: handle<js-abi-value>, property-key: string, value: handle<js-abi-value>) -> variant { success(handle<js-abi-value>), failure(handle<js-abi-value>) }"] = function(arg0, arg1, arg2, arg3, arg4) {
    const memory = get_export("memory");
    const ptr0 = arg1;
    const len0 = arg2;
    const result0 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr0, len0));
    const ret0 = obj.reflectSet(resources0.get(arg0), result0, resources0.get(arg3));
    const variant1 = ret0;
    switch (variant1.tag) {
      case "success": {
        const e = variant1.val;
        data_view(memory).setInt8(arg4 + 0, 0, true);
        data_view(memory).setInt32(arg4 + 4, resources0.insert(e), true);
        break;
      }
      case "failure": {
        const e = variant1.val;
        data_view(memory).setInt8(arg4 + 0, 1, true);
        data_view(memory).setInt32(arg4 + 4, resources0.insert(e), true);
        break;
      }
      default:
      throw new RangeError("invalid variant specified for JsAbiResult");
    }
  };
  imports["rb-js-abi-host"]["reflect-set-prototype-of: func(target: handle<js-abi-value>, prototype: handle<js-abi-value>) -> bool"] = function(arg0, arg1) {
    const ret0 = obj.reflectSetPrototypeOf(resources0.get(arg0), resources0.get(arg1));
    return ret0 ? 1 : 0;
  };
  if (!("canonical_abi" in imports)) imports["canonical_abi"] = {};
  
  const resources0 = new Slab();
  imports.canonical_abi["resource_drop_js-abi-value"] = (i) => {
    const val = resources0.remove(i);
    if (obj.dropJsAbiValue)
    obj.dropJsAbiValue(val);
  };
}

/**
 * A Ruby VM instance
 *
 * @example
 *
 * const wasi = new WASI();
 * const vm = new RubyVM();
 * const imports = {
 *   wasi_snapshot_preview1: wasi.wasiImport,
 * };
 *
 * vm.addToImports(imports);
 *
 * const instance = await WebAssembly.instantiate(rubyModule, imports);
 * await vm.setInstance(instance);
 * wasi.initialize(instance);
 * vm.initialize();
 *
 */
class RubyVM {
    constructor() {
        this.instance = null;
        this.interfaceState = {
            hasJSFrameAfterRbFrame: false,
        };
        // Wrap exported functions from Ruby VM to prohibit nested VM operation
        // if the call stack has sandwitched JS frames like JS -> Ruby -> JS -> Ruby.
        const proxyExports = (exports) => {
            const excludedMethods = [
                "addToImports",
                "instantiate",
                "rbSetShouldProhibitRewind",
                "rbGcDisable",
                "rbGcEnable",
            ];
            const excluded = ["constructor"].concat(excludedMethods);
            // wrap all methods in RbAbi.RbAbiGuest class
            for (const key of Object.getOwnPropertyNames(RbAbiGuest.prototype)) {
                if (excluded.includes(key)) {
                    continue;
                }
                const value = exports[key];
                if (typeof value === "function") {
                    exports[key] = (...args) => {
                        const isNestedVMCall = this.interfaceState.hasJSFrameAfterRbFrame;
                        if (isNestedVMCall) {
                            const oldShouldProhibitRewind = this.guest.rbSetShouldProhibitRewind(true);
                            const oldIsDisabledGc = this.guest.rbGcDisable();
                            const result = Reflect.apply(value, exports, args);
                            this.guest.rbSetShouldProhibitRewind(oldShouldProhibitRewind);
                            if (!oldIsDisabledGc) {
                                this.guest.rbGcEnable();
                            }
                            return result;
                        }
                        else {
                            return Reflect.apply(value, exports, args);
                        }
                    };
                }
            }
            return exports;
        };
        this.guest = proxyExports(new RbAbiGuest());
        this.transport = new JsValueTransport();
        this.exceptionFormatter = new RbExceptionFormatter();
    }
    /**
     * Initialize the Ruby VM with the given command line arguments
     * @param args The command line arguments to pass to Ruby. Must be
     * an array of strings starting with the Ruby program name.
     */
    initialize(args = ["ruby.wasm", "--disable-gems", "-EUTF-8", "-e_=0"]) {
        const c_args = args.map((arg) => arg + "\0");
        this.guest.rubyInit();
        this.guest.rubySysinit(c_args);
        this.guest.rubyOptions(c_args);
    }
    /**
     * Set a given instance to interact JavaScript and Ruby's
     * WebAssembly instance. This method must be called before calling
     * Ruby API.
     *
     * @param instance The WebAssembly instance to interact with. Must
     * be instantiated from a Ruby built with JS extension, and built
     * with Reactor ABI instead of command line.
     */
    async setInstance(instance) {
        this.instance = instance;
        await this.guest.instantiate(instance);
    }
    /**
     * Add intrinsic import entries, which is necessary to interact JavaScript
     * and Ruby's WebAssembly instance.
     * @param imports The import object to add to the WebAssembly instance
     */
    addToImports(imports) {
        this.guest.addToImports(imports);
        function wrapTry(f) {
            return (...args) => {
                try {
                    return { tag: "success", val: f(...args) };
                }
                catch (e) {
                    if (e instanceof RbFatalError) {
                        // RbFatalError should not be caught by Ruby because it Ruby VM
                        // can be already in an inconsistent state.
                        throw e;
                    }
                    return { tag: "failure", val: e };
                }
            };
        }
        imports["rb-js-abi-host"] = {
            rb_wasm_throw_prohibit_rewind_exception: (messagePtr, messageLen) => {
                const memory = this.instance.exports.memory;
                const str = new TextDecoder().decode(new Uint8Array(memory.buffer, messagePtr, messageLen));
                throw new RbFatalError("Ruby APIs that may rewind the VM stack are prohibited under nested VM operation " +
                    `(${str})\n` +
                    "Nested VM operation means that the call stack has sandwitched JS frames like JS -> Ruby -> JS -> Ruby " +
                    "caused by something like `window.rubyVM.eval(\"JS.global[:rubyVM].eval('Fiber.yield')\")`\n" +
                    "\n" +
                    "Please check your call stack and make sure that you are **not** doing any of the following inside the nested Ruby frame:\n" +
                    "  1. Switching fibers (e.g. Fiber#resume, Fiber.yield, and Fiber#transfer)\n" +
                    "     Note that `evalAsync` JS API switches fibers internally\n" +
                    "  2. Raising uncaught exceptions\n" +
                    "     Please catch all exceptions inside the nested operation\n" +
                    "  3. Calling Continuation APIs\n");
            },
        };
        // NOTE: The GC may collect objects that are still referenced by Wasm
        // locals because Asyncify cannot scan the Wasm stack above the JS frame.
        // So we need to keep track whether the JS frame is sandwitched by Ruby
        // frames or not, and prohibit nested VM operation if it is.
        const proxyImports = (imports) => {
            for (const [key, value] of Object.entries(imports)) {
                if (typeof value === "function") {
                    imports[key] = (...args) => {
                        const oldValue = this.interfaceState.hasJSFrameAfterRbFrame;
                        this.interfaceState.hasJSFrameAfterRbFrame = true;
                        const result = Reflect.apply(value, imports, args);
                        this.interfaceState.hasJSFrameAfterRbFrame = oldValue;
                        return result;
                    };
                }
            }
            return imports;
        };
        addRbJsAbiHostToImports(imports, proxyImports({
            evalJs: wrapTry((code) => {
                return Function(code)();
            }),
            isJs: (value) => {
                // Just for compatibility with the old JS API
                return true;
            },
            globalThis: () => {
                if (typeof globalThis !== "undefined") {
                    return globalThis;
                }
                else if (typeof global !== "undefined") {
                    return global;
                }
                else if (typeof window !== "undefined") {
                    return window;
                }
                throw new Error("unable to locate global object");
            },
            intToJsNumber: (value) => {
                return value;
            },
            floatToJsNumber: (value) => {
                return value;
            },
            stringToJsString: (value) => {
                return value;
            },
            boolToJsBool: (value) => {
                return value;
            },
            procToJsFunction: (rawRbAbiValue) => {
                const rbValue = this.rbValueOfPointer(rawRbAbiValue);
                return (...args) => {
                    rbValue.call("call", ...args.map((arg) => this.wrap(arg)));
                };
            },
            rbObjectToJsRbValue: (rawRbAbiValue) => {
                return this.rbValueOfPointer(rawRbAbiValue);
            },
            jsValueToString: (value) => {
                // According to the [spec](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-constructor-string-value)
                // `String(value)` always returns a string.
                return String(value);
            },
            jsValueToInteger(value) {
                if (typeof value === "number") {
                    return { tag: "f64", val: value };
                }
                else if (typeof value === "bigint") {
                    return { tag: "bignum", val: BigInt(value).toString(10) + "\0" };
                }
                else if (typeof value === "string") {
                    return { tag: "bignum", val: value + "\0" };
                }
                else if (typeof value === "undefined") {
                    return { tag: "f64", val: 0 };
                }
                else {
                    return { tag: "f64", val: Number(value) };
                }
            },
            exportJsValueToHost: (value) => {
                // See `JsValueExporter` for the reason why we need to do this
                this.transport.takeJsValue(value);
            },
            importJsValueFromHost: () => {
                return this.transport.consumeJsValue();
            },
            instanceOf: (value, klass) => {
                if (typeof klass === "function") {
                    return value instanceof klass;
                }
                else {
                    return false;
                }
            },
            jsValueTypeof(value) {
                return typeof value;
            },
            jsValueEqual(lhs, rhs) {
                return lhs == rhs;
            },
            jsValueStrictlyEqual(lhs, rhs) {
                return lhs === rhs;
            },
            reflectApply: wrapTry((target, thisArgument, args) => {
                return Reflect.apply(target, thisArgument, args);
            }),
            reflectConstruct: function (target, args) {
                throw new Error("Function not implemented.");
            },
            reflectDeleteProperty: function (target, propertyKey) {
                throw new Error("Function not implemented.");
            },
            reflectGet: wrapTry((target, propertyKey) => {
                return target[propertyKey];
            }),
            reflectGetOwnPropertyDescriptor: function (target, propertyKey) {
                throw new Error("Function not implemented.");
            },
            reflectGetPrototypeOf: function (target) {
                throw new Error("Function not implemented.");
            },
            reflectHas: function (target, propertyKey) {
                throw new Error("Function not implemented.");
            },
            reflectIsExtensible: function (target) {
                throw new Error("Function not implemented.");
            },
            reflectOwnKeys: function (target) {
                throw new Error("Function not implemented.");
            },
            reflectPreventExtensions: function (target) {
                throw new Error("Function not implemented.");
            },
            reflectSet: wrapTry((target, propertyKey, value) => {
                return Reflect.set(target, propertyKey, value);
            }),
            reflectSetPrototypeOf: function (target, prototype) {
                throw new Error("Function not implemented.");
            },
        }), (name) => {
            return this.instance.exports[name];
        });
    }
    /**
     * Print the Ruby version to stdout
     */
    printVersion() {
        this.guest.rubyShowVersion();
    }
    /**
     * Runs a string of Ruby code from JavaScript
     * @param code The Ruby code to run
     * @returns the result of the last expression
     *
     * @example
     * vm.eval("puts 'hello world'");
     * const result = vm.eval("1 + 2");
     * console.log(result.toString()); // 3
     *
     */
    eval(code) {
        return evalRbCode(this, this.privateObject(), code);
    }
    /**
     * Runs a string of Ruby code with top-level `JS::Object#await`
     * Returns a promise that resolves when execution completes.
     * @param code The Ruby code to run
     * @returns a promise that resolves to the result of the last expression
     *
     * @example
     * const text = await vm.evalAsync(`
     *   require 'js'
     *   response = JS.global.fetch('https://example.com').await
     *   response.text.await
     * `);
     * console.log(text.toString()); // <html>...</html>
     */
    evalAsync(code) {
        const JS = this.eval("require 'js'; JS");
        return new Promise((resolve, reject) => {
            JS.call("__eval_async_rb", this.wrap(code), this.wrap({
                resolve,
                reject: (error) => {
                    reject(new RbError(this.exceptionFormatter.format(error, this, this.privateObject())));
                },
            }));
        });
    }
    /**
     * Wrap a JavaScript value into a Ruby JS::Object
     * @param value The value to convert to RbValue
     * @returns the RbValue object representing the given JS value
     *
     * @example
     * const hash = vm.eval(`Hash.new`)
     * hash.call("store", vm.eval(`"key1"`), vm.wrap(new Object()));
     */
    wrap(value) {
        return this.transport.importJsValue(value, this);
    }
    privateObject() {
        return {
            transport: this.transport,
            exceptionFormatter: this.exceptionFormatter,
        };
    }
    rbValueOfPointer(pointer) {
        const abiValue = new RbAbiValue(pointer, this.guest);
        return new RbValue(abiValue, this, this.privateObject());
    }
}
/**
 * Export a JS value held by the Ruby VM to the JS environment.
 * This is implemented in a dirty way since wit cannot reference resources
 * defined in other interfaces.
 * In our case, we can't express `function(v: rb-abi-value) -> js-abi-value`
 * because `rb-js-abi-host.wit`, that defines `js-abi-value`, is implemented
 * by embedder side (JS) but `rb-abi-guest.wit`, that defines `rb-abi-value`
 * is implemented by guest side (Wasm).
 *
 * This class is a helper to export by:
 * 1. Call `function __export_to_js(v: rb-abi-value)` defined in guest from embedder side.
 * 2. Call `function takeJsValue(v: js-abi-value)` defined in embedder from guest side with
 *    underlying JS value of given `rb-abi-value`.
 * 3. Then `takeJsValue` implementation escapes the given JS value to the `_takenJsValues`
 *    stored in embedder side.
 * 4. Finally, embedder side can take `_takenJsValues`.
 *
 * Note that `exportJsValue` is not reentrant.
 *
 * @private
 */
class JsValueTransport {
    constructor() {
        this._takenJsValue = null;
    }
    takeJsValue(value) {
        this._takenJsValue = value;
    }
    consumeJsValue() {
        return this._takenJsValue;
    }
    exportJsValue(value) {
        value.call("__export_to_js");
        return this._takenJsValue;
    }
    importJsValue(value, vm) {
        this._takenJsValue = value;
        return vm.eval('require "js"; JS::Object').call("__import_from_js");
    }
}
/**
 * A RbValue is an object that represents a value in Ruby
 */
class RbValue {
    /**
     * @hideconstructor
     */
    constructor(inner, vm, privateObject) {
        this.inner = inner;
        this.vm = vm;
        this.privateObject = privateObject;
    }
    /**
     * Call a given method with given arguments
     *
     * @param callee name of the Ruby method to call
     * @param args arguments to pass to the method. Must be an array of RbValue
     *
     * @example
     * const ary = vm.eval("[1, 2, 3]");
     * ary.call("push", 4);
     * console.log(ary.call("sample").toString());
     *
     */
    call(callee, ...args) {
        const innerArgs = args.map((arg) => arg.inner);
        return new RbValue(callRbMethod(this.vm, this.privateObject, this.inner, callee, innerArgs), this.vm, this.privateObject);
    }
    /**
     * @see {@link https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive}
     * @param hint Preferred type of the result primitive value. `"number"`, `"string"`, or `"default"`.
     */
    [Symbol.toPrimitive](hint) {
        if (hint === "string" || hint === "default") {
            return this.toString();
        }
        else if (hint === "number") {
            return null;
        }
        return null;
    }
    /**
     * Returns a string representation of the value by calling `to_s`
     */
    toString() {
        const rbString = callRbMethod(this.vm, this.privateObject, this.inner, "to_s", []);
        return this.vm.guest.rstringPtr(rbString);
    }
    /**
     * Returns a JavaScript object representation of the value
     * by calling `to_js`.
     *
     * Returns null if the value is not convertible to a JavaScript object.
     */
    toJS() {
        const JS = this.vm.eval("JS");
        const jsValue = JS.call("try_convert", this);
        if (jsValue.call("nil?").toString() === "true") {
            return null;
        }
        return this.privateObject.transport.exportJsValue(jsValue);
    }
}
var ruby_tag_type;
(function (ruby_tag_type) {
    ruby_tag_type[ruby_tag_type["None"] = 0] = "None";
    ruby_tag_type[ruby_tag_type["Return"] = 1] = "Return";
    ruby_tag_type[ruby_tag_type["Break"] = 2] = "Break";
    ruby_tag_type[ruby_tag_type["Next"] = 3] = "Next";
    ruby_tag_type[ruby_tag_type["Retry"] = 4] = "Retry";
    ruby_tag_type[ruby_tag_type["Redo"] = 5] = "Redo";
    ruby_tag_type[ruby_tag_type["Raise"] = 6] = "Raise";
    ruby_tag_type[ruby_tag_type["Throw"] = 7] = "Throw";
    ruby_tag_type[ruby_tag_type["Fatal"] = 8] = "Fatal";
    ruby_tag_type[ruby_tag_type["Mask"] = 15] = "Mask";
})(ruby_tag_type || (ruby_tag_type = {}));
class RbExceptionFormatter {
    constructor() {
        this.literalsCache = null;
    }
    format(error, vm, privateObject) {
        const [zeroLiteral, oneLiteral, newLineLiteral] = (() => {
            if (this.literalsCache == null) {
                const zeroOneNewLine = [
                    evalRbCode(vm, privateObject, "0"),
                    evalRbCode(vm, privateObject, "1"),
                    evalRbCode(vm, privateObject, `"\n"`),
                ];
                this.literalsCache = zeroOneNewLine;
                return zeroOneNewLine;
            }
            else {
                return this.literalsCache;
            }
        })();
        const backtrace = error.call("backtrace");
        if (backtrace.call("nil?").toString() === "true") {
            return this.formatString(error.call("class").toString(), error.toString());
        }
        const firstLine = backtrace.call("at", zeroLiteral);
        const restLines = backtrace
            .call("drop", oneLiteral)
            .call("join", newLineLiteral);
        return this.formatString(error.call("class").toString(), error.toString(), [
            firstLine.toString(),
            restLines.toString(),
        ]);
    }
    formatString(klass, message, backtrace) {
        if (backtrace) {
            return `${backtrace[0]}: ${message} (${klass})\n${backtrace[1]}`;
        }
        else {
            return `${klass}: ${message}`;
        }
    }
}
const checkStatusTag = (rawTag, vm, privateObject) => {
    switch (rawTag & ruby_tag_type.Mask) {
        case ruby_tag_type.None:
            break;
        case ruby_tag_type.Return:
            throw new RbError("unexpected return");
        case ruby_tag_type.Next:
            throw new RbError("unexpected next");
        case ruby_tag_type.Break:
            throw new RbError("unexpected break");
        case ruby_tag_type.Redo:
            throw new RbError("unexpected redo");
        case ruby_tag_type.Retry:
            throw new RbError("retry outside of rescue clause");
        case ruby_tag_type.Throw:
            throw new RbError("unexpected throw");
        case ruby_tag_type.Raise:
        case ruby_tag_type.Fatal:
            const error = new RbValue(vm.guest.rbErrinfo(), vm, privateObject);
            if (error.call("nil?").toString() === "true") {
                throw new RbError("no exception object");
            }
            // clear errinfo if got exception due to no rb_jump_tag
            vm.guest.rbClearErrinfo();
            throw new RbError(privateObject.exceptionFormatter.format(error, vm, privateObject));
        default:
            throw new RbError(`unknown error tag: ${rawTag}`);
    }
};
function wrapRbOperation(vm, body) {
    try {
        return body();
    }
    catch (e) {
        if (e instanceof RbError) {
            throw e;
        }
        // All JS exceptions triggered by Ruby code are translated to Ruby exceptions,
        // so non-RbError exceptions are unexpected.
        vm.guest.rbVmBugreport();
        if (e instanceof WebAssembly.RuntimeError && e.message === "unreachable") {
            const error = new RbError(`Something went wrong in Ruby VM: ${e}`);
            error.stack = e.stack;
            throw error;
        }
        else {
            throw e;
        }
    }
}
const callRbMethod = (vm, privateObject, recv, callee, args) => {
    const mid = vm.guest.rbIntern(callee + "\0");
    return wrapRbOperation(vm, () => {
        const [value, status] = vm.guest.rbFuncallvProtect(recv, mid, args);
        checkStatusTag(status, vm, privateObject);
        return value;
    });
};
const evalRbCode = (vm, privateObject, code) => {
    return wrapRbOperation(vm, () => {
        const [value, status] = vm.guest.rbEvalStringProtect(code + "\0");
        checkStatusTag(status, vm, privateObject);
        return new RbValue(value, vm, privateObject);
    });
};
/**
 * Error class thrown by Ruby execution
 */
class RbError extends Error {
    /**
     * @hideconstructor
     */
    constructor(message) {
        super(message);
    }
}
/**
 * Error class thrown by Ruby execution when it is not possible to recover.
 * This is usually caused when Ruby VM is in an inconsistent state.
 */
class RbFatalError extends RbError {
    /**
     * @hideconstructor
     */
    constructor(message) {
        super("Ruby Fatal Error: " + message);
    }
}

const DefaultRubyVM = async (rubyModule, options = {}) => {
    const wasi = new WASI({ env: options.env, version: 'preview1' });
    const vm = new RubyVM();
    const imports = {
        wasi_snapshot_preview1: wasi.wasiImport,
    };
    vm.addToImports(imports);
    const instance = await WebAssembly.instantiate(rubyModule, imports);
    await vm.setInstance(instance);
    wasi.initialize(instance);
    vm.initialize();
    return {
        vm,
        wasi,
        instance,
    };
};

export { DefaultRubyVM };
