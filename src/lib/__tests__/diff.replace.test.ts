import { diffNodes } from '../diff'
import { Props, VNode } from '../types'

describe('diffNodes - Replace cases', () => {
  test('returns REPLACE patch when static elements have different types', () => {
    const oldNode: VNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const newNode: VNode = {
      kind: 'static',
      type: 'span',
      props: {},
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'REPLACE',
        oldNode,
        newNode,
      },
    ])
  })

  test('returns REPLACE when static element becomes regular component', () => {
    const oldNode: VNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const newNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: {},
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'REPLACE',
        oldNode,
        newNode,
      },
    ])
  })

  test('returns REPLACE when regular component becomes static element', () => {
    const ComponentFn = (props: Props): VNode => ({
      kind: 'static',
      type: 'div',
      props,
      children: [],
    })

    const oldNode: VNode = {
      kind: 'regular',
      type: ComponentFn,
      props: {},
      children: [],
    }

    const newNode: VNode = {
      kind: 'static',
      type: 'div',
      props: {},
      children: [],
    }

    const patches = diffNodes(oldNode, newNode)

    expect(patches).toEqual([
      {
        type: 'REPLACE',
        oldNode,
        newNode,
      },
    ])
  })

  // test('returns REPLACE when regular component becomes memo component')
  // test('returns REPLACE when memo component becomes regular component')
})
