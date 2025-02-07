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
    } else {
      // Check props
      const oldProps = oldNode.props
      const newProps = newNode.props

      for (const key in oldProps) {
        if (oldProps[key] !== newProps[key]) {
          patches.push({
            type: 'PROPS',
            node: oldNode,
            newProps,
          })
        }
      }
    }
  }

  return patches
}
