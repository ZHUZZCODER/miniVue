let activeFn = null;
class Depend {
  constructor() {
    this.activeFns = new Set();
  }

  depend() {
    if (activeFn) {
      this.activeFns.add(activeFn);
    }
  }

  nogify() {
    this.activeFns.forEach((fn) => {
      fn();
    });
  }
}
const weakMap = new WeakMap();
function getDepend(target, key) {
  let map = weakMap.get(target);
  if (!map) {
    map = new Map();
    weakMap.set(target, map);
  }
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}
function watchEffect(fn) {
  activeFn = fn;
  fn();
  activeFn = null;
}
function reactive(obj) {
  return new Proxy(obj, {
    set(target, key, newValue, receiver) {
      Reflect.set(target, key, newValue, receiver);
      const depend = getDepend(target, key);
      depend.nogify();
    },
    get(target, key, receiver) {
      const depend = getDepend(target, key);
      depend.depend();
      return Reflect.get(target, key, receiver);
    },
  });
}
