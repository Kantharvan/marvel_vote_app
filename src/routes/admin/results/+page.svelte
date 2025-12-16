<script>
  import { db, collection, query, getDocs, onSnapshot } from '$lib/firebase';
  import { doc } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let loggedIn = false;
  let pin = '';
  /**
   * @typedef {object} ActiveAward
   * @property {string} award
   * @property {string[]} nominees
   * @property {number} ts
   */

  /** @type {ActiveAward | null} */
  let activeAward = null;
  /** @type {Record<string, number>} */
  let results = {}; // Stores { nominee: voteCount }
  /** @type {[string, number][]} */
  let sortedResults = [];
  let loading = true;

  // PIN for admin login (hardcoded)
  const ADMIN_PIN = '1100';

  function login() {
    if (pin === ADMIN_PIN) {
      loggedIn = true;
      fetchResults();
    } else {
      alert('Incorrect PIN');
    }
  }

  onMount(() => {
    // Listen for changes to the active award config
    const unsub = onSnapshot(doc(db, 'config', 'active'), (docSnap) => {
      if (docSnap.exists()) {
        activeAward = /** @type {ActiveAward} */ (docSnap.data());
        if (loggedIn) {
          fetchResults(); // Refetch results if active award changes and admin is logged in
        }
      } else {
        activeAward = null;
        results = {};
        sortedResults = [];
      }
    });

    return () => unsub();
  });

  async function fetchResults() {
    if (!activeAward || !activeAward.award) {
      results = {};
      sortedResults = [];
      loading = false;
      return;
    }

    loading = true;
    const votesRef = collection(db, 'votes', activeAward.award, 'deviceVotes');
    const q = query(votesRef);
    const querySnapshot = await getDocs(q);

    /** @type {Record<string, number>} */
    const voteCounts = {};
    querySnapshot.forEach((doc) => {
      const vote = doc.data();
      const nominee = /** @type {string} */ (vote.choice); // Cast choice to string
      voteCounts[nominee] = (voteCounts[nominee] || 0) + 1;
    });

    results = voteCounts;
    sortedResults = Object.entries(results).sort(([, countA], [, countB]) => countB - countA);
    loading = false;
  }
</script>

<style>
  :root {
    --marvel-red: #e62327;
    --marvel-black: #1a1a1a;
    --marvel-gold: #ffbe00;
    --text-color: #eee;
    --bg-color: #333;
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
  }
  h1 {
    color: var(--marvel-gold);
    margin-bottom: 20px;
  }
  h2, h3 {
    color: var(--text-color);
    margin-bottom: 15px;
  }
  .login-form {
    margin-top: 30px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #555;
    border-radius: 4px;
    background-color: #444;
    color: var(--text-color);
    box-sizing: border-box;
  }
  button {
    display: block;
    width: 100%;
    padding: 12px;
    background-color: var(--marvel-red);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
  }
  button:hover {
    background-color: #c00;
  }
  .results-list {
    list-style: none;
    padding: 0;
    margin-top: 20px;
  }
  .results-list li {
    background-color: #444;
    margin-bottom: 10px;
    padding: 15px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1em;
  }
  .results-list li span:first-child {
    font-weight: bold;
    color: var(--marvel-gold);
  }
  .results-list li span:last-child {
    background-color: var(--marvel-red);
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-weight: bold;
  }
  .no-results {
    font-size: 1.2em;
    color: #aaa;
    margin-top: 30px;
  }
</style>

<div class="container">
  {#if !loggedIn}
    <h1>Admin Login for Results</h1>
    <div class="login-form">
      <div class="form-group">
        <label for="pin">PIN:</label>
        <input type="password" id="pin" bind:value={pin} on:keypress={(e) => e.key === 'Enter' && login()} />
      </div>
      <button on:click={login}>Login</button>
    </div>
  {:else}
    <h1>Voting Results</h1>

    {#if activeAward}
      <h2>Active Award: {activeAward.award}</h2>
      {#if loading}
        <p>Loading results...</p>
      {:else if sortedResults.length > 0}
        <ul class="results-list">
          {#each sortedResults as [nominee, count]}
            <li><span>{nominee}</span> <span>{count} votes</span></li>
          {/each}
        </ul>
      {:else}
        <p class="no-results">No votes cast yet for this award.</p>
      {/if}
    {:else}
      <p class="no-results">No active award to display results for.</p>
    {/if}
  {/if}
</div>
