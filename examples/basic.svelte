<script>
  export let name;

  function handleClick(e) {
    e.preventDefault()
    alert(`Hello ${name}!`)
  }
</script>

<h1 class="snazzy" on:click=handleClick>Hello {name}!</h1>
