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

1. Parse the file and extract code from `<script>` tags and build a list of non-`<script>` tags.
2. Parse the code and determine props (anything with `export let ...` is a prop)
3. Parse the tags recursively and make an ordered list of nodes and event listeners
4. Generate the code using props, nodes, listeners, and code from script tags
5. Format the code
6. Print the result to `stdout`

## Dependencies

It uses similar dependencies to svelte.js (except for tag parsing).

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

And run the compiler on it:

```bash
msv examples/basic.svelte > examples/basic.js
```

It generates a JavaScript file that looks like this:

```js
export default function component({ target, props }) {
  let { name } = props;

  function handleClick(e) {
    e.preventDefault();
    alert(`Hello ${name}!`);
  }

  let t0, e1, t2, b3, t4, t5;

  return {
    create() {
      t0 = document.createTextNode("\n\n")
      e1 = document.createElement("h1")
      t2 = document.createTextNode("Hello ")
      b3 = document.createTextNode(name)
      t4 = document.createTextNode("!")
      t5 = document.createTextNode("\n")

      e1.setAttribute("class", "snazzy")
      e1.addEventListener("click", handleClick)
    },
    mount() {
      e1.appendChild(t2)
      e1.appendChild(b3)
      e1.appendChild(t4)

      target.append(t0)
      target.append(e1)
      target.append(t5)
    },
    update(changes) {
      if (changes.name) {
        b3.data = name = changes.name
      }
    },
    detach() {
      target.removeChild(t0)
      target.removeChild(e1)
      target.removeChild(t5)
    }
  };
}
```

Now you can host this component in the browser:

```html
<script src="example/basic.js"></script>
<script>
  // instantiate the component with a target node and some props
  const c = component({target: document.body, props: {name: "Steve Wozniak"}})
  // create DOM nodes
  c.create()
  // mount DOM nodes
  c.mount()

  // later you can update props:
  c.update({name: "Elon Musk"})

  // and unmount works too
  c.detach()
</script>
```

## License

MIT
