import { isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
  // 调用 patch
  patch(vnode, container);
}

/**
 * @description 能够处理 component 类型和 dom element 类型
 *
 * component 类型会递归调用 patch 继续处理
 * element 类型则会进行渲染
 */
export function patch(vnode, container) {
  const { type } = vnode;

  if (typeof type === 'string') {
    // 真实 DOM
    processElement(vnode, container);
  } else if (isObject(type)) {
    // 处理 component 类型
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;

  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }

  // props
  const { props } = vnode;
  for (const [key, value] of Object.entries(props)) {
    el.setAttribute(key, value);
  }

  container.append(el);
}

function mountChildren(vnode: any, container: any) {
  vnode.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  // 根据 vnode 创建组件实例
  const instance = createComponentInstance(vnode);

  // setup 组件实例
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // subTree 可能是 Component 类型也可能是 Element 类型
  // 调用 patch 去处理 subTree
  // Element 类型则直接挂载
  patch(subTree, container);
}