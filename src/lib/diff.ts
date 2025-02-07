import { Patch, VNode } from './types'

// The diffing function
export function diffNodes(oldNode: VNode, newNode: VNode): Array<Patch> {
  const patches: Array<Patch> = []

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
