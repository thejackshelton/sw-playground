import { $, component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  // This function should have been prefetch when user arrives on the page.
  const click = $(() => alert('Clicked'));
  return (
    <article>
      <Link href="/">Home</Link>
      <h1>About</h1>
      <button onClick$={click}>Trigger action</button>
    </article>
  )
})