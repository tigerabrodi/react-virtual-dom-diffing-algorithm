/** Could be more type safe e.g. all event handlers, but this is fine for the current scope */
export type PropValue =
  | string
  | number
  | boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((event: any) => void)
  | object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Array<any>
  | null
  | undefined

export type Props = Record<string, PropValue>

// For the VDOM
export type StaticVNode = {
  kind: 'static'
  type: string
  props: Props
  children: Array<VNode>
  key?: string | number // Add optional key
}

// A component takes props and returns a VNode
export type ComponentFunction = (props: Props) => VNode

/** Regular component */
export type RegularComponentVNode = {
  kind: 'regular'
  type: ComponentFunction
  props: Props
  children: Array<VNode>
  key?: string | number // Add optional key
}

/** Memoized component */
export type MemoComponentVNode = {
  kind: 'memo'
  type: ComponentFunction
  compare: (prevProps: Props, nextProps: Props) => boolean
  props: Props
  children: Array<VNode>
  key?: string | number // Add optional key
}

export type ComponentVNode = RegularComponentVNode | MemoComponentVNode

export type VNode = StaticVNode | ComponentVNode

// For patches
export type ReplacePatch = {
  type: 'REPLACE'
  oldNode: VNode
  newNode: VNode
}

export type PropsPatch = {
  type: 'PROPS'
  node: VNode
  newProps: Props
}

export type ReorderPatch = {
  type: 'REORDER'
  node: VNode
  fromIndex: number
  toIndex: number
}

// Here we need to know the index
// Otherwise we won't know where to insert the node
export type InsertPatch = {
  type: 'INSERT'
  node: VNode
  index: number
}

// Here index doesn't matter
// When we find the node, we know to remove it
// We know it's already in the tree
export type RemovePatch = {
  type: 'REMOVE'
  node: VNode
}

export type Patch =
  | ReplacePatch
  | PropsPatch
  | ReorderPatch
  | InsertPatch
  | RemovePatch
