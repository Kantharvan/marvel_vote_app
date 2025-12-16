<script>
  // No script needed for this simple landing page unless you want interactivity
</script>

<style>
  :root {
    --marvel-red: #e62327;
    --marvel-black: #1a1a1a;
    --marvel-gold: #ffbe00;
    --text-color: #eee;
    --bg-color: #333;
    --button-bg: var(--marvel-red);
    --button-hover-bg: #c00;
  }
  .container {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: var(--bg-color);
    color: var(--text-color);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Arial', sans-serif;
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  h1 {
    color: var(--marvel-gold);
    margin-bottom: 30px;
  }
  .links button {
    display: block;
    width: 200px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: var(--button-bg);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
    text-decoration: none; /* For when this becomes an <a> tag */
  }
  .links button:hover {
    background-color: var(--button-hover-bg);
    transform: translateY(-2px);
  }
  .links button:active {
    transform: translateY(0);
  }
</style>

<div class="container">
  <h1>Welcome to Marvel Vote App!</h1>
  <div class="links">
    <a href="/admin"><button>Admin Panel</button></a>
    <a href="/vote"><button>Voter Page</button></a>
  </div>
</div>
