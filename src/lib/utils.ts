import {
  MemoComponentVNode,
  RegularComponentVNode,
  StaticVNode,
  VNode,
} from './types'

export function isStaticVNode(node: VNode): node is StaticVNode {
  return node.kind === 'static'
}

export function isMemoComponentVNode(node: VNode): node is MemoComponentVNode {
  return node.kind === 'memo'
}

export function isRegularComponentVNode(
  node: VNode
): node is RegularComponentVNode {
  return node.kind === 'regular'
}
