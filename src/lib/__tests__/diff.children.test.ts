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
      props: {},
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

  // Text and number nodes
  test('handles text node changes')
  test('handles number node changes')
  test('handles mixed node types (elements, text, numbers)')

  // Nested structures
  test('recursively diffs nested children')
  test('handles deeply nested structure changes')
  test('correctly patches nested children props changes')

  // Edge cases
  test('handles empty children array to non-empty')
  test('handles non-empty children array to empty')
  test('handles null/undefined children')
  test('handles children type changes (text to element)')

  // Mixed node kinds
  test('handles mix of static and component children')
  test('handles mix of regular and memo component children')
  test('preserves memoization in nested children')
})
