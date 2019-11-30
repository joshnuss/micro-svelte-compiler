# Micro Svelte Compiler

A demonstration of how [Svelte.js](https://svelte.dev) works under the hood.

## Installation

Download and install dependencies

```bash
git clone https://github.com/joshnuss/msv
cd msv && yarn
```

## Compiler Stages

The compiler has multiple stages

1. Parse the file and extract code from `<script>` tags and a list of tags.
2. Parse the code and determine props (anything with `export let ...`)
3. Parse the tags and make and ordered list of nodes and event listeners
4. Generate the code using the lists of props, nodes, listeners and code from script tags
5. Format the code
6. Print to code to `stdout`

## Dependencies

This uses the same dependencies as svelte.js, except for tag parsing.

- [acorn](https://www.npmjs.com/package/acorn) parses JavaScript text into AST
- [code-red](https://www.npmjs.com/package/code-red) generates JavaScript AST from template strings
- [js-beautify](https://www.npmjs.com/package/js-beautify) formats JavaScript text
- [parse5](https://www.npmjs.com/package/parse5) parses HTML into tags

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

It generates a JavaScript version of the component:

```js
export default function component({ target, props }) {
  let { name, foo } = props;

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

Now you can run this in the browser:

```js
// instantiate the component with target node and props
const c = component({target: document.body, props: {name: "Steve Wozniak"}})
// create DOM nodes
c.create()
// mount DOM nodes
c.mount()

// later you can update props:
c.update({name: "Elon Musk"})

// if you want to unmount
c.detach()
```

## License

MIT
