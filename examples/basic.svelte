<script>
  export let name, foo;

  function handleClick(e) {
    e.preventDefault()
    alert(`Hello ${name}!`)
  }
</script>

<h1 class="foo" on:click=handleClick>Hello {name}!</h1>
