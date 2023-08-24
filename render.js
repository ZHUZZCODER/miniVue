/**
 * h函数简单实现
 * @param {*} tag
 * @param {*} props
 * @param {*} children
 * @returns
 */
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};

/**
 * mount函数将vnode挂载DOM上
 * @param {*} vnode
 * @param {*} container
 */
const mount = (vnode, container) => {
  //创建元素
  const el = (vnode.el = document.createElement(vnode.tag));
  //设置props属性
  const props = vnode.props || {};
  for (const propsKey in props) {
    const propsItemValue = props[propsKey];
    if (propsKey.startsWith("on")) {
      el.addEventListener(propsKey.slice(2).toLowerCase(), propsItemValue);
    } else {
      el.setAttribute(propsKey, propsItemValue);
    }
  }
  //递归挂载子元素
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((elementVnode) => {
        mount(elementVnode, el);
      });
    }
  }
  //挂载到container
  container.appendChild(el);
};

/**
 * patch对比两个vnode进行diff算法
 * @param {*} vnode1
 * @param {*} vnode2
 */
const patch = (vnode1, vnode2) => {
  //如果同一类标签元素
  if (vnode1.tag === vnode2.tag) {
    const vnode1Props = vnode1.props || {};
    const vnode2Props = vnode2.props || {};
    //添加新的props
    for (let newPropsKey in vnode2Props) {
      if (vnode2Props[newPropsKey] !== vnode1Props[newPropsKey]) {
        const newPropsValue = vnode2Props[newPropsKey];
        if (newPropsKey.startsWith("on")) {
          vnode1.addEventListener(
            newPropsKey.slice(2).toLowerCase(),
            newPropsValue
          );
        } else {
          vnode1.setAttribute(newPropsKey, newPropsValue);
        }
      }
    }
    //移除旧的props
    for (let oldPropsKey in vnode1Props) {
      if (!oldPropsKey in vnode2Props) {
        const oldPropsValue = vnode1Props[oldPropsKey];
        if (oldPropsKey.startsWith("on")) {
          vnode1.removeAddEventListener(
            oldPropsKey.slice(2).toLowerCase(),
            oldPropsValue
          );
        } else {
          vnode1.removeAttribute(oldPropsKey);
        }
      }
    }
    //处理children
    const vnode1Children = vnode1.children || [];
    const vnode2Children = vnode2.children || [];
    const vnode1El = (vnode2.el = vnode1.el);
    //如果新子节点是字符串
    if (typeof vnode2Children === "string") {
      if (typeof vnode1Children === "string") {
        if (vnode1Children !== vnode2Children) {
          vnode1El.textContent = vnode2Children;
        }
      } else {
        vnode1El.innerHTML = vnode2Children;
      }
    } else if (Array.isArray(vnode2Children)) {
      //如果新子节点是数组，老节点是字符串
      if (typeof vnode1Children === "string") {
        vnode1El.textContent = "";
        vnode2Children.forEach((vnode2ChildrenElement) => {
          mount(vnode2ChildrenElement, vnode1El);
        });
      } else {
        //如果新老子节点都是数组
        const baseChildrenLength = Math.min(
          vnode1Children.length,
          vnode2Children.length
        );
        for (let i = 0; i < baseChildrenLength; i++) {
          patch(vnode1Children[i], vnode2Children[i]);
        }

        //如果新子节点比较长: 直接在末尾添加
        if (vnode2Children.length > vnode1Children.length) {
          vnode2Children
            .slice(vnode1Children.length)
            .forEach((vn2ChildrenElement) => {
              mount(vn2ChildrenElement, vnode1El);
            });
        }

        //如果旧的子节点比较长
        if (vnode1Children.length > vnode2Children.length) {
          vnode1Children
            .slice(vnode2Children.length)
            .forEach((vn1ChildrenElement) => {
              vnode1El.removeChild(vn1ChildrenElement);
            });
        }
      }
    }
  } else {
    //如果不是同一类标签元素
    const vnode1ParentElement = vnode1.el.parentElement();
    vnode1ParentElement.removeChild(vnode1);
    mount(vnode2, vnode1ParentElement);
  }
};
