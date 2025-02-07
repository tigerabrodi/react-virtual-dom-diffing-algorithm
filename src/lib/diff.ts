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

  if (oldNode.kind === 'memo' && newNode.kind === 'memo') {
    // If props are NOT the same
    // Means not true
    // Then we update all props with newProps
    const oldProps = oldNode.props
    const newProps = newNode.props
    if (oldNode.compare(oldProps, newProps) === false) {
      patches.push({
        type: 'PROPS',
        node: oldNode,
        newProps,
      })
    }
  }

  if (oldNode.kind === 'regular' && newNode.kind === 'regular') {
    const oldProps = oldNode.props
    const newProps = newNode.props

    // Check if props are different at all
    const hasChanges =
      // Different number of props
      Object.keys(oldProps).length !== Object.keys(newProps).length ||
      // Or any prop value is different
      Object.keys(oldProps).some((key) => oldProps[key] !== newProps[key])

    if (hasChanges) {
      // If so, we update all props with `newProps`
      patches.push({
        type: 'PROPS',
        node: oldNode,
        newProps,
      })
    }
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
