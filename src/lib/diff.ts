import { Patch, VNode } from './types'

export function diffNodes(oldNode: VNode, newNode: VNode): Array<Patch> {
  const patches: Array<Patch> = []

  if (oldNode.kind !== newNode.kind) {
    patches.push({
      type: 'REPLACE',
      oldNode,
      newNode,
    })
  }

  if (oldNode.kind === 'static' && newNode.kind === 'static') {
    if (oldNode.type !== newNode.type) {
      patches.push({
        type: 'REPLACE',
        oldNode,
        newNode,
      })
    }
  }

  return patches
}
