<script>
  import { db } from '$lib/firebase';
  import { doc, onSnapshot, setDoc } from 'firebase/firestore';
  import { onMount } from 'svelte';

  let activeAward = null;
  let deviceId = '';
  let voteStatus = ''; // 'idle', 'voting', 'voted'

  onMount(() => {
    // Get or generate device ID
    let storedDeviceId = localStorage.getItem('dev');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID(); // Generate a unique ID
      localStorage.setItem('dev', storedDeviceId);
    }
    deviceId = storedDeviceId;

    // Real-time listener for active award
    const unsub = onSnapshot(doc(db, 'config', 'active'), (docSnap) => {
      if (docSnap.exists()) {
        activeAward = docSnap.data();
        voteStatus = 'idle'; // Reset vote status when award changes
      } else {
        activeAward = null;
        voteStatus = 'idle';
      }
    });

    return () => unsub(); // Unsubscribe on component destroy
  });

  async function castVote(nominee) {
    if (voteStatus === 'voted') {
      alert("Halt! You've already cast your vote for this mission, hero! One vote per device, as per protocol.");
      return;
    }

    if (!activeAward || !deviceId) {
      alert('No active award or device ID not found.');
      return;
    }

    voteStatus = 'voting';
    const voteData = {
      choice: nominee,
      ts: Date.now()
    };

    try {
      // The Firestore rules will prevent multiple votes for the same deviceId and awardId
      await setDoc(doc(db, 'votes', activeAward.award, 'deviceVotes', deviceId), voteData);
      voteStatus = 'voted';
      alert('Thank you for voting!');
    } catch (error) {
      console.error('Error casting vote:', error);
      // More specific alert for debugging
      alert("Halt! You've already cast your vote for this mission, hero! One vote per device, as per protocol.");
      voteStatus = 'idle'; // Allow retrying if it was a generic error
    }
  }
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
  }
  h1 {
    color: var(--marvel-gold);
    margin-bottom: 20px;
  }
  h2 {
    color: var(--text-color);
    margin-bottom: 25px;
  }
  .nominee-list button {
    display: block;
    width: 100%;
    padding: 15px;
    margin-bottom: 10px;
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
  }
  .nominee-list button:hover:not(:disabled) {
    background-color: var(--button-hover-bg);
    transform: translateY(-2px);
  }
  .nominee-list button:active:not(:disabled) {
    transform: translateY(0);
  }
  .nominee-list button:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
  .no-active-voting {
    font-size: 1.5em;
    color: var(--marvel-gold);
    margin-top: 50px;
  }
  .thank-you {
    font-size: 1.8em;
    color: var(--marvel-gold);
    margin-top: 50px;
  }
</style>

<div class="container">
  {#if activeAward}
    {#if voteStatus === 'voted'}
      <h1 class="thank-you">Thank you for voting for "{activeAward.award}"!</h1>
    {:else}
      <h1>Vote for: {activeAward.award}</h1>
      <h2>Select your nominee:</h2>
      <div class="nominee-list">
        {#each activeAward.nominees as nominee}
          <button on:click={() => castVote(nominee)} disabled={voteStatus === 'voting'}>
            {nominee}
          </button>
        {/each}
      </div>
    {/if}
  {:else}
    <h1 class="no-active-voting">No active voting at the moment. Please check back later!</h1>
  {/if}
</div>
