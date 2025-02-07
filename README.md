# React Virtual DOM Diffing Algorithm

I'm implementing React's diffing algorithm to really learn the virtual DOM. The goal here isn't a complete implementation, but rather a deep understanding. It's also fun to implement things like this because you can just drive it with tests.

Link to main code: [src/lib/diff.ts](./src/lib/diff.ts)

To be clear, this focuses on the diffing algorithm. It's not the entire React library or every single piece of the VDOM.

I've also chose to structure vnodes in a way that's understandable and not messy. It's a scoped version that doesn't handle every single edge case.

I honestly wanted to build React from scratch. But I wanted to scope it down to something where I can learn, and it doesn't take forever.

I guess I could use babel jsx transform and then implement a scoped version of React from scratch. But maybe another day, or my own framerwork if a full framework from scratch (i got some ideas in mind hehe)

Anyways, the notes you find below is just some research notes. I could turn it into a blog post in hindsight. But I got way too many React blog posts already. I was even referring to my own blog posts when taking this "step back" approach to learning here. I guess my younger self is teaching my older self a thing or two 🤣

# React.createElement

`React.createElement` is the function that React uses to create virtual DOM nodes.

For example, creating a div:

```js
React.createElement('div', { className: 'container' }, ['Hello, world!'])
```

This creates a virtual DOM node with the type `div`, props `{ className: 'container' }`, and a single child text node with the value `Hello, world!`.

It's important to understand that JSX is what you write, yes, but it's transformed into `React.createElement` calls.

---

Another important difference to understand is components vs VDOM nodes.

```js
function Div() {
  return <div>Hello, world!</div>
}
```

Div is a component. When we run its function, it returns a VDOM node. So above becomes:

```js
function Div() {
  return React.createElement('div', null, ['Hello, world!'])
}
```

You can also have components that return other components:

```js
function App() {
  return <Div />
}
```

This would become:

```js
function App() {
  return React.createElement(Div, null)
}
```

And then we call it recursively.

Here you can also see why you need to return a single root node from a component. You can't have siblings in a component.

Writing something like this isn't possible in JavaScript:

```js
// in jsx
function App() {
  return (
    <Comp />
    <Comp />
  )
}

// transformed into
function App() {
  return React.createElement(Div, null)

  // We NEVER reach this line of code
  return React.createElement(Div, null)
}
```

When you understand this, it's easy to know why you can't have siblings in a component.

---

Recap:

- Components are functions that CREATE VDOM nodes.
- Static elements ARE VDOM nodes (created directly by createElement).

# How Virtual DOM Diffing Works

## A simple count example

When you've a React component like this:

```js
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <span>{count}</span>
      <RegularButton /> // without memo
      <div>Static text</div>
    </div>
  )
}
```

What React actually sees after JSX transformation:

```js
function Counter() {
  const [count, setCount] = useState(0)
  return React.createElement(
    'div',
    null,
    React.createElement('span', null, [count]),
    React.createElement(RegularButton, null),
    React.createElement('div', null, ['Static text'])
  )
}
```

When count changes (state), a re render will happen. A re render means React will run the component function again and return a new virtual DOM tree. You've probably heard that re-rendering a component will re-render its children. That's true, but it's not the whole story.

How it looks under the hood:

```js
// New VDOM tree for Counter1
{
  type: 'div',
  props: {},
  children: [
    {
      type: 'span',
      props: {},
      children: [1] // new count value
    },
    {
      type: RegularButton, // No memo
      props: {},           // Always creates new VDOM
      children: []         // Component runs again!
    },
    {
      type: 'div',
      props: {},
      children: ['Static text'] // still same text
    }
  ]
}
```

The span has a new value. React will know that the span has changed and needs to be updated in the real DOM.

The regular button's function runs again. This is what we mean by "re-render". However, React sees that the regular button is the same component in the real DOM, therefore it doesn't update the real DOM node for this button. Even though it doesn't need to do this, it's still a cost to run the function again (re-rendering). **It's just important to understand that re-rendering and updating the real DOM are two different things.**

Static text doesn't re-render. It's the same text as before.

## React compares old and new VDOM trees

One thing that's a bit false with the above example is that React actually compares the full old and new VDOM trees.

When a component's state updates, React knows that the component is "dirty". Meaning, it's a component that has changed and needs to re-render. Re-rendering the component doesn't mean every single element in the component needs to be updated in the real DOM (React figures this out later via diffing algorithm). They may all re-render (unless you're optimizing with memoization)

### Wait, is the new VDOM tree completely new?

"Is the new VDOM tree completely new? Doesn't that mean we need to run the component function from the start? Doesn't that go against re-rendering being efficient?"

As mentioned, React is smart. It knows the components that are dirty. This means, it only needs to run the component function for dirty components.

Pseudo code how all of this works under the hood (much more complicated in reality):

```js
// Storing component states and tracking dirty ones
const componentStates = new Map()
const dirtyComponents = new Set()
let currentVDOM = null // The current/old VDOM tree

function useState(initialValue) {
  // React keeps track of which component is currently running
  const componentId = getCurrentComponentId()

  // Initialize if first render
  if (!componentStates.has(componentId)) {
    componentStates.set(componentId, initialValue)
  }

  const setState = (newValue) => {
    // If new value is different from old value, update state
    if (componentStates.get(componentId) !== newValue) {
      // Update state storage
      componentStates.set(componentId, newValue)
      // Mark THIS component as dirty
      dirtyComponents.add(componentId)
      // Schedule update
      scheduleUpdate()
    }
  }

  return [componentStates.get(componentId), setState]
}

// This is where the magic happens
function createNewVDOMTree(oldVDOM) {
  // If this node represents a component that's dirty
  if (isDirtyComponent(oldVDOM)) {
    // Run the component function to get new VDOM
    // `type` is the component function
    const Component = oldVDOM.type

    // Call it with the old props
    const newVDOM = Component(oldVDOM.props)

    // Just return the new full vdom node
    return newVDOM
  }

  // Not dirty - we can reuse this part of the old tree
  // But we still need to check its children
  if (oldVDOM.children) {
    return {
      ...oldVDOM,
      children: oldVDOM.children.map((child) => createNewVDOMTree(child)),
    }
  }

  // No children and not dirty - can completely reuse
  return oldVDOM
}

function scheduleUpdate() {
  // Get new hybrid VDOM tree (mix of old and new nodes)
  const newVDOM = createNewVDOMTree(currentVDOM)

  // Collect all DOM update operations needed
  const patches = diffNodes(currentVDOM, newVDOM)

  // Apply collected patches to real DOM
  applyPatches(patches)

  // Update the current VDOM tree
  currentVDOM = newVDOM

  // Clear the dirty components
  dirtyComponents.clear()
}

// This is the function I'm implementing in this repo
function diffNodes(oldVDOM, newVDOM) {
  // Updates we need to make in the real DOM
  const patches = []

  // Different node type = full replace
  if (oldVDOM.type !== newVDOM.type) {
    patches.push({ type: 'REPLACE' /* ... */ })
    return patches
  }

  // Check if props changed
  if (propsChanged(oldVDOM, newVDOM)) {
    patches.push({ type: 'PROPS' /* ... */ })
  }

  // Handle children with key matching
  // Returns array of operations like:
  // - REORDER (for keyed elements)
  // - INSERT (new nodes)
  // - REMOVE (removed nodes)
  // For each child, we'll also recursively call diffNodes
  patches.push(...diffChildren(oldVDOM.children, newVDOM.children))

  return patches
}

function applyPatches(patches) {
  patches.forEach((patch) => {
    switch (patch.type) {
      case 'REPLACE': // Replace DOM node
      case 'PROPS': // Update node properties
      case 'REORDER': // Move node to new position
      case 'INSERT': // Add new node
      case 'REMOVE': // Remove node
    }
  })
}
```

## createElement and component ids

How does React identify components?

React uses a unique ID to identify components. This ID is generated when the component is created.

It's not needed if the component is a static element (like a div, span etc).

```js
// Create VDOM nodes (simplified)
function createElement(type, props, ...children) {
  // If type is a function, it's a component (not a 'div' etc)
  if (typeof type === 'function') {
    return {
      type,
      props,
      children,
      componentId: generateComponentId(), // Every component instance gets unique ID
    }
  }

  // Regular element (div, span etc)
  return {
    type,
    props,
    children,
  }
}

// So when we write JSX:
;<div>
  <Counter /> // createElement(Counter) -> gets ID
  <Counter /> // createElement(Counter) -> gets different ID
  <span>hi</span>
</div>

// It becomes:
createElement('div', null, [
  createElement(Counter), // { type: Counter, componentId: 'id1', ... }
  createElement(Counter), // { type: Counter, componentId: 'id2', ... }
  createElement('span', null, 'hi'),
])
```

## Walking through a component that changes state

```js
// JSX
<Counter>
  <span>{count}</span>
</Counter>

// VDOM before update (count = 1)
{
  type: Counter,     // function
  componentId: 'id1',
  props: {},
  children: [{
    type: 'span',    // string
    props: {},
    children: [1]
  }]
}

// After setState(2)
1. Counter marked as dirty
2. React sees Counter type is function -> component
3. Sees it's dirty -> runs Counter function
4. Gets new VDOM with count = 2
5. Diffs with old VDOM
6. Updates just the span's text content
```

6th step here is actually applying the patch and updating the real DOM.

## Diffing static elements

For static elements:

1. First checks if type is same ('div' === 'div')
2. Then checks if props changed
3. Then diffs children recursively to see what changed

```javascript
// Example with static elements
<div>           // Old VDOM        // New VDOM
  <span>       {                   {
    Hello        type: 'div',        type: 'div',
  </span>        props: {},          props: {},
  <span>         children: [{         children: [{
    World          type: 'span',       type: 'span',
  </span>          props: {},          props: {},
</div>           children: ['Hello']   children: ['Hi'] // Changed!
                }, {                 }, {
                  type: 'span',       type: 'span',
                  props: {},          props: {},
                  children: ['World'] children: ['World']
                }]                  }]
              }                   }
```

React's process here:

1. Root 'div' - type is same, props same
2. First 'span' - type is same, props same
   - Children different ('Hello' vs 'Hi') -> update needed
3. Second 'span' - type is same, props same
   - Children same ('World') -> no update needed

React always diffs systematically, whether static or component. It's just that for static elements, it can directly compare values (inside children, after checking the type and props) without having to worry about running functions or checking if things are dirty.

So it's always:

1. Check type
2. Check props
3. Diff children

For components, if step one or two fails, it will run the component function to get the new VDOM (recursively creates vdom nodes). For static elements, it will just replace the node if type is different. If props are different, it will update the props. If children are different, it'll just update children for the static elements.

## Another diffing example

```javascript
// Component example
<Menu>              // Old VDOM          // New VDOM
  <div>            {                    {
    Hi              type: Menu,           type: Menu,
  </div>            componentId: 'id1',   componentId: 'id1',
  <Button>          props: {},            props: { theme: 'dark' }, // Changed (see props)!
    Click           children: [{           children: [{
  </Button>           type: 'div',          type: 'div',
</Menu>               props: {},            props: {},
                      children: ['Hi']      children: ['Hi']
                    }, {                  }, {
                      type: Button,         type: Button,
                      componentId: 'id2',   componentId: 'id2',
                      props: {},            props: {},
                      children: ['Click']   children: ['Click']
                    }]                    }]
                  }                     }
```

Because menu's props changed, it runs the function to get the new VDOM.

This means re-rendering happens recursively. div vdom node gets created, and the button component runs again.

So we get a new vdom subtree there too.

```js
// 1. Menu props changed -> Run Menu function
// This creates entirely new VDOM tree:
{
  type: Menu,
  componentId: 'id1',
  props: { theme: 'dark' },
  children: [{
    type: 'div',            // New VDOM node
    props: {},
    children: ['Hi']
  }, {
    type: Button,           // New VDOM node
    componentId: 'id2',
    props: {},
    children: ['Click']
  }]
}

// 2. But during diffing with old tree:
- Root Menu: Props changed -> will update props in real DOM
- div: Even though it's a new VDOM node
  - type same
  - props same
  - children same
  - Result: No real DOM updates needed!
- Button: Even though it's a new VDOM node
  - type same
  - props same
  - children same
  - Result: No real DOM updates needed!
```

It's important again to note that React only updates the real DOM if there are _actual_ changes. Even if the element or component was re-rendered/re-created.

## How memo is handled

When dealing with memoized components, React sees something like this:

```js
// When React sees:
<MemoButton />

// It actually sees something like:
{
  type: {
    $$typeof: Symbol(react.memo),
    type: OriginalButton,
    compare: defaultCompare  // or custom compare function
  },
  props: {},
  children: []
}
```

This way, it knows to use the compare function to check if the component should be updated. We'd pass old and new props to the compare function. By default, it's a shallow comparison (Object.is).
