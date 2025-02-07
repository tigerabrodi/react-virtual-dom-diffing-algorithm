import { diffNodes } from '../diff'
import { Props, RegularComponentVNode, StaticVNode, VNode } from '../types'

describe('diffNodes - Children cases', () => {
  test('returns INSERT patch when a new static child is added', () => {
    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'span',
          props: {},
          children: [],
        },
      ],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'INSERT',
        node: newNode.children[0],
        index: 0,
      },
    ])
  })

  test('returns INSERT patch when a new component child is added', () => {
    const oldNode: RegularComponentVNode = {
      kind: 'regular',
      type: () => ({
        kind: 'static',
        type: 'div',
        props: {},
        children: [],
      }),
      props: {},
      children: [],
    }

    const newNode: RegularComponentVNode = {
      kind: 'regular',
      type: () => ({
        kind: 'static',
        type: 'div',
        props: {},
        children: [],
      }),
      props: {},
      children: [
        {
          kind: 'static',
          type: 'span',
          props: {},
          children: [],
        },
      ],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'INSERT',
        node: newNode.children[0],
        index: 0,
      },
    ])
  })

  test('returns REMOVE patch when a static child is removed', () => {
    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'span',
          props: {},
          children: [],
        },
      ],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'REMOVE',
        node: oldNode.children[0],
      },
    ])
  })

  test('returns REMOVE patch when a component child is removed', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'regular',
          type: ComponentFn,
          props: {},
          children: [],
        },
      ],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'REMOVE',
        node: oldNode.children[0],
      },
    ])
  })

  // Simple child operations
  test('returns no patches when static children are identical', () => {
    const child: StaticVNode = {
      kind: 'static',
      type: 'span',
      props: {},
      children: [],
    }

    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [child],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [child],
    }

    const patches = diffNodes(oldNode, newNode)
    expect(patches).toEqual([])
  })

  test('returns no patches when component children are identical', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const child: RegularComponentVNode = {
      kind: 'regular',
      type: ComponentFn,
      props: {},
      children: [],
    }

    const oldNode: RegularComponentVNode = {
      kind: 'regular',
      type: () => ({
        kind: 'static',
        type: 'div',
        props: {},
        children: [child],
      }),
      props: {},
      children: [child],
    }

    const newNode: RegularComponentVNode = {
      kind: 'regular',
      type: () => ({
        kind: 'static',
        type: 'div',
        props: {},
        children: [child],
      }),
      props: {},
      children: [child],
    }

    const patches = diffNodes(oldNode, newNode)
    expect(patches).toEqual([])
  })

  test('handles multiple children additions and removals', () => {
    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'span',
          props: { id: '1' },
          children: [],
          key: '1',
        },
        {
          kind: 'static',
          type: 'span',
          props: { id: '2' },
          children: [],
          key: '2',
        },
      ],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'span',
          props: { id: '3' },
          children: [],
          key: '3', // New key
        },
        {
          kind: 'static',
          type: 'span',
          props: { id: '1' },
          children: [],
          key: '1', // Same key as before
        },
      ],
    }

    const patches = diffNodes(oldNode, newNode)

    // Should generate:
    // - REORDER for id:1 span, fromIndex: 0 toIndex: 1
    // - REMOVE for id:2 span
    // - INSERT for id:3 span
    expect(patches).toEqual([
      {
        type: 'REORDER',
        node: oldNode.children[0], // id:1 span
        fromIndex: 0,
        toIndex: 1,
      },
      {
        type: 'REMOVE',
        node: oldNode.children[1], // id:2 span
      },
      {
        type: 'INSERT',
        node: newNode.children[0], // id:3 span
        index: 0,
      },
    ])
  })

  // Nested structures - Important for recursive diffing
  test('recursively diffs nested children', () => {
    const oldNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'div',
          props: {},
          children: [
            {
              kind: 'static',
              type: 'span',
              props: { value: 'old' },
              children: [],
              key: 'nested',
            },
          ],
          key: 'parent',
        },
      ],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'static',
          type: 'div',
          props: {},
          children: [
            {
              kind: 'static',
              type: 'span',
              props: { value: 'new' },
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
      {
        type: 'PROPS',
        node: oldNode.children[0].children[0],
        newProps: { value: 'new' },
      },
    ])
  })

  // Mixed node kinds - Tests how different node types interact
  test('handles mix of regular and memo component children', () => {
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
        {
          kind: 'regular',
          type: ComponentFn,
          props: { value: 'old' },
          children: [],
          key: 'regular',
        },
        {
          kind: 'memo',
          type: MemoComponentFn,
          props: { value: 'old' },
          children: [],
          compare: (prev, next) => prev.value === next.value,
          key: 'memo',
        },
      ],
    }

    const newNode: StaticVNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [
        {
          kind: 'regular',
          type: ComponentFn,
          props: { value: 'new' },
          children: [],
          key: 'regular',
        },
        {
          kind: 'memo',
          type: MemoComponentFn,
          props: { value: 'old' }, // Same value, shouldn't update
          children: [],
          compare: (prev, next) => prev.value === next.value,
          key: 'memo',
        },
      ],
    }

    const patches = diffNodes(oldNode, newNode)
    expect(patches).toEqual([
      {
        type: 'PROPS',
        node: oldNode.children[0],
        newProps: { value: 'new' },
      },
    ])
  })
})
