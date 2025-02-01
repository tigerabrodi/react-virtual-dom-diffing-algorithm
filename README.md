# React Virtual DOM Diffing Algorithm

I'm implementing React's Virtual DOM Diffing Algorithm to really understand how React works. The goal here isn't a complete implementation, but rather a deep understanding. It's also fun to implement things like this because you can just drive it with tests.

To be clear, this focuses on the diffing algorithm. It's not the entire React library or every single piece of the VDOM.

# React.createElement

`React.createElement` is the function that React uses to create virtual DOM nodes.

For example, creating a div:

```js
React.createElement('div', { className: 'container' }, 'Hello, world!')
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
  return React.createElement('div', null, 'Hello, world!')
}
```

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
    React.createElement('span', null, count),
    React.createElement(RegularButton, null),
    React.createElement('div', null, 'Static text')
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
      children: ['Static text']
    }
  ]
}
```
