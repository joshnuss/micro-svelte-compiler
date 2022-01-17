# Micro Svelte Compiler

A demonstration of how the [Svelte.js](https://svelte.dev) compiler works under the hood.

## Installation

Download and install dependencies:

```bash
git clone https://github.com/joshnuss/micro-svelte-compiler
cd micro-svelte-compiler && yarn
```

## Compiler Stages

This compiler has multiple stages:

1. Parse the `.svelte` file and extract code from `<script>` tags and build a list of non-`<script>` tags.
2. Parse the code and determine props (anything with `export let ...` is a prop)
3. Parse the tags recursively and make an ordered list of nodes and event listeners
4. Generate JavaScript code using props, nodes, listeners, and code from script tags
5. Format the JavaScript code
6. Print the result to `stdout`

## Dependencies

It uses similar dependencies to svelte.js (except for HTML parsing).

- [acorn](https://www.npmjs.com/package/acorn): Parses JavaScript text into AST.
- [code-red](https://www.npmjs.com/package/code-red): Generates JavaScript AST from template strings. Converts AST back to string.
- [js-beautify](https://www.npmjs.com/package/js-beautify): Formats JavaScript text.
- [parse5](https://www.npmjs.com/package/parse5): Parses HTML tags.

## Usage

Say you have a `.svelte` file like `examples/basic.svelte`:

```html
<script>
  export let name;

  function handleClick(e) {
    e.preventDefault()
    alert(`Hello ${name}!`)
  }
</script>

<h1 class="snazzy" on:click=handleClick>Hello {name}!</h1>
```

Run the compiler on it:

```bash
npx msv examples/basic.svelte > examples/basic.js
```

It generates a JavaScript file that looks like this:

```js
export default function component({ target, props }) {
  let { name } = props;

  function handleClick(e) {
    e.preventDefault();
    alert(`Hello ${name}!`);
  }

  let e0, t1, b2, t3;

  return {
    create() {
      e0 = document.createElement("h1")
      t1 = document.createTextNode("Hello ")
      b2 = document.createTextNode(name)
      t3 = document.createTextNode("!")

      e0.setAttribute("class", "snazzy")
      e0.addEventListener("click", handleClick)
    },
    mount() {
      e0.appendChild(t1)
      e0.appendChild(b2)
      e0.appendChild(t3)

      target.append(e0)
    },
    update(changes) {
      if (changes.name) {
        b2.data = name = changes.name
      }
    },
    detach() {
      target.removeChild(e0)
    }
  };
}
```

To host the component in the browser:

```html
<script src="example/basic.js"></script>
<script>
  // instantiate the component with a target node and some props
  const c = component({target: document.body, props: {name: "Steve Wozniak"}})
  // create DOM nodes
  c.create()
  // mount DOM nodes
  c.mount()

  // you can update props anytime:
  c.update({name: "Elon Musk"})

  // and cleanup the dom when it's no longer needed
  c.detach()
</script>
```

## License

MIT
