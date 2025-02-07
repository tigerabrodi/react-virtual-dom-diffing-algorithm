import { Patch, VNode } from './types'
import {
  isMemoComponentVNode,
  isRegularComponentVNode,
  isStaticVNode,
} from './utils'

export function diffNodes(oldNode: VNode, newNode: VNode): Array<Patch> {
  const patches: Array<Patch> = []

  if (oldNode.kind !== newNode.kind) {
    patches.push({
      type: 'REPLACE',
      oldNode,
      newNode,
    })
  }

  if (isMemoComponentVNode(oldNode) && isMemoComponentVNode(newNode)) {
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

  if (isRegularComponentVNode(oldNode) && isRegularComponentVNode(newNode)) {
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

  if (isStaticVNode(oldNode) && isStaticVNode(newNode)) {
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

  // Did we have children or do we have new children?
  // Could be either cases, but we wanna recursively diff the children if we have any
  if (oldNode.children.length || newNode.children.length) {
    const oldChildren = oldNode.children
    const newChildren = newNode.children

    // maxLength so that we go over all children
    const maxLength = Math.max(oldChildren.length, newChildren.length)

    for (let i = 0; i < maxLength; i++) {
      // Either both exists or one of them doesn't
      // We know because of maxLength, either of them will always exist till the end
      const oldChild = oldChildren[i]
      const newChild = newChildren[i]

      // If old child doesn't exist, we know that newChild exists
      if (!oldChild) {
        patches.push({
          type: 'INSERT',
          node: newChild, // Already VNode which is either static or component node
          index: i,
        })

        // No need to do any more work here
        // Continue to the next child
        continue
      }

      if (!newChild) {
        patches.push({
          type: 'REMOVE',
          node: oldChild, // Already VNode which is either static or component node
        })

        // No need to do any more work here
        continue
      }

      // Both exist! Need to diff them
      // We know that both are VNode
      // diffNodes will return patches for the children
      const patch = diffNodes(oldChild, newChild)
      patches.push(...patch)
    }
  }

  // For the first level, this returns patches from the root
  // For recursive diff, it returns patches for the lower levels up to the parents
  return patches
}
