import { diffNodes } from '../diff'
import { Props, VNode } from '../types'

describe('diffNodes - Props cases', () => {
  test('returns PROPS patch when static element props change', () => {
    const oldNode: VNode = {
      kind: 'static',
      type: 'div',
      props: { className: 'old' },
      children: [],
    }

    const newNode: VNode = {
      kind: 'static',
      type: 'div',
      props: { className: 'new' },
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'PROPS',
        node: oldNode,
        newProps: { className: 'new' },
      },
    ])
  })

  test('returns no patches when props are unchanged', () => {
    const oldNode: VNode = {
      kind: 'static',
      type: 'div',
      props: { className: 'test', id: 'some-id' },
      children: [],
    }

    const newNode: VNode = {
      kind: 'static',
      type: 'div',
      props: { className: 'test', id: 'some-id' },
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([])
  })

  // For regular components
  test('returns PROPS patch when regular component props have different values', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const oldNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 1 },
      children: [],
    }

    const newNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 2 },
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'PROPS',
        node: oldNode,
        newProps: { count: 2 },
      },
    ])
  })

  test('returns PROPS patch when regular component props has new prop', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const oldNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 1 },
      children: [],
    }

    const newNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 1, newProp: 'test' },
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'PROPS',
        node: oldNode,
        newProps: { count: 1, newProp: 'test' },
      },
    ])
  })

  test('returns PROPS patch when regular component props is missing a prop', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const oldNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 1, toRemove: 'test' },
      children: [],
    }

    const newNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: { count: 1 },
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'PROPS',
        node: oldNode,
        newProps: { count: 1 },
      },
    ])
  })

  // For memo
  test(
    'returns PROPS patch when memo component props change and compare returns false'
  )
  test(
    'returns no patches when memo component props change but compare returns true'
  )
})
