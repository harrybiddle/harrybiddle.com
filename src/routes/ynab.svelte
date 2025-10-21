<script context="module">
  // This is the old way to run a 'load' function on the server (or universal)
  export async function load() {
    return {
      // 301 for permanent
      status: 301,
      // This is the redirect property
      redirect: 'https://tiger-budget.vercel.app'
    };
  }
</script>

<h1>Redirecting...</h1>