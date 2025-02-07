import { diffNodes } from '../diff'
import { Props, StaticVNode, VNode } from '../types'

test('handles complex tree with mixed node types and operations', () => {
  const ComponentFn = (props: Props): VNode => ({
    kind: 'static',
    type: 'div',
    props,
    children: [],
  })

  const MemoComponentFn = (props: Props): VNode => ({
    kind: 'static',
    type: 'span',
    props,
    children: [],
  })

  const oldNode: StaticVNode = {
    kind: 'static',
    type: 'div',
    props: {},
    children: [
      // Regular component that will get new props
      {
        kind: 'regular',
        type: ComponentFn,
        props: { value: 'old' },
        children: [],
        key: 'regular',
      },
      // Memo component that won't update
      {
        kind: 'memo',
        type: MemoComponentFn,
        props: { stable: 'value' },
        children: [],
        compare: (prev, next) => prev.stable === next.stable,
        key: 'memo',
      },
      // Nested static nodes where inner one changes
      {
        kind: 'static',
        type: 'div',
        props: {},
        children: [
          {
            kind: 'static',
            type: 'span',
            props: { inner: 'old' },
            children: [],
            key: 'nested',
          },
        ],
        key: 'parent',
      },
      // This one will be removed
      {
        kind: 'static',
        type: 'p',
        props: {},
        children: [],
        key: 'removed',
      },
    ],
  }

  const newNode: StaticVNode = {
    kind: 'static',
    type: 'div',
    props: {},
    children: [
      // New node that will be inserted
      {
        kind: 'static',
        type: 'header',
        props: {},
        children: [],
        key: 'new',
      },
      // Regular component with updated props
      {
        kind: 'regular',
        type: ComponentFn,
        props: { value: 'new' },
        children: [],
        key: 'regular',
      },
      // Memo component with same stable value
      {
        kind: 'memo',
        type: MemoComponentFn,
        props: { stable: 'value' },
        children: [],
        compare: (prev, next) => prev.stable === next.stable,
        key: 'memo',
      },
      // Nested nodes with inner change
      {
        kind: 'static',
        type: 'div',
        props: {},
        children: [
          {
            kind: 'static',
            type: 'span',
            props: { inner: 'new' },
            children: [],
            key: 'nested',
          },
        ],
        key: 'parent',
      },
    ],
  }

  const patches = diffNodes(oldNode, newNode)

  expect(patches).toEqual([
    // First REORDER
    {
      type: 'REORDER',
      node: oldNode.children[0], // regular component
      fromIndex: 0,
      toIndex: 1,
    },
    // Immediately followed by its PROPS update
    {
      type: 'PROPS',
      node: oldNode.children[0],
      newProps: { value: 'new' },
    },
    // Then next REORDER
    {
      type: 'REORDER',
      node: oldNode.children[1], // memo component
      fromIndex: 1,
      toIndex: 2,
    },
    // Then last REORDER
    {
      type: 'REORDER',
      node: oldNode.children[2], // nested div
      fromIndex: 2,
      toIndex: 3,
    },
    // Props update for nested node
    {
      type: 'PROPS',
      node: oldNode.children[2].children[0],
      newProps: { inner: 'new' },
    },
    // Remove the p tag
    {
      type: 'REMOVE',
      node: oldNode.children[3],
    },
    // Insert new header at start
    {
      type: 'INSERT',
      node: newNode.children[0],
      index: 0,
    },
  ])
})
