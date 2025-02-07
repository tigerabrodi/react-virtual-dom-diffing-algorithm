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

    // Get all keys and map to index for both old and new children
    const oldKeys = new Map<string | number, number>()
    const newKeys = new Map<string | number, number>()

    // Track which indices we've handled
    // When handling children without keys, we need to know which ones we've already handled
    const handledIndices = new Set<number>()

    // Gather all keys for both old and new children
    oldChildren.forEach((child, index) => {
      if (child.key) oldKeys.set(child.key, index)
    })

    newChildren.forEach((child, index) => {
      if (child.key) newKeys.set(child.key, index)
    })

    // Handle keyed nodes first
    oldChildren.forEach((oldChild, indexInOldVDom) => {
      if (!oldChild.key) return // Skip keyless for now

      if (!newKeys.has(oldChild.key)) {
        // Key no longer exists -> REMOVE
        patches.push({
          type: 'REMOVE',
          node: oldChild,
        })
      } else {
        const indexInNewVDom = newKeys.get(oldChild.key)!
        const hasMoved = indexInNewVDom !== indexInOldVDom
        if (hasMoved) {
          // Position changed -> REORDER
          patches.push({
            type: 'REORDER',
            node: oldChild,
            fromIndex: indexInOldVDom,
            toIndex: indexInNewVDom,
          })
        }

        const newChild = newChildren[indexInNewVDom]

        // Handle the keyed child recursively using both its old and new child
        patches.push(...diffNodes(oldChild, newChild))

        handledIndices.add(indexInNewVDom)
      }
    })

    newChildren.forEach((newChild, indexInNewVDom) => {
      if (!newChild.key) return // Skip keyless for now

      if (!oldKeys.has(newChild.key)) {
        // New key -> INSERT
        patches.push({
          type: 'INSERT',
          node: newChild,
          index: indexInNewVDom,
        })

        handledIndices.add(indexInNewVDom)
      }
    })

    // Now handle keyless nodes by position
    // But only for indices we haven't handled yet!
    const maxLength = Math.max(oldChildren.length, newChildren.length)

    for (let index = 0; index < maxLength; index++) {
      const hasAlreadyBeenHandled = handledIndices.has(index)
      if (hasAlreadyBeenHandled) continue

      const oldChild = oldChildren[index]
      const newChild = newChildren[index]

      if (!oldChild && newChild) {
        // New child for this position (index)
        // We know it won't collide with the keyed children because we're always skipping them
        patches.push({
          type: 'INSERT',
          node: newChild,
          index: index,
        })
      } else if (oldChild && !newChild) {
        // Old child exists, but new child doesn't
        // Remove the old child
        patches.push({
          type: 'REMOVE',
          node: oldChild,
        })
      } else if (oldChild && newChild) {
        // Both exist, diff them recursively
        patches.push(...diffNodes(oldChild, newChild))
      }
    }
  }

  // For the first level, this returns patches from the root
  // For recursive diff, it returns patches for the lower levels up to the parents
  return patches
}
