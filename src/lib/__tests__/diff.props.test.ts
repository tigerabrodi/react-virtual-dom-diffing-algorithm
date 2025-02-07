import { diffNodes } from '../diff'
import { VNode } from '../types'

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

  // For regular components
  test('returns PROPS patch when regular component props have different values')
  test('returns PROPS patch when regular component props has new prop')
  test('returns PROPS patch when regular component props is missing a prop')

  // For memo
  test(
    'returns PROPS patch when memo component props change and compare returns false'
  )
  test(
    'returns no patches when memo component props change but compare returns true'
  )
})
