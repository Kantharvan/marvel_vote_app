<script>
  import { db } from '$lib/firebase';
  import { doc, onSnapshot, setDoc } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { awardsDetails } from '../../data/teams';

  /**
   * @typedef {object} ActiveAward
   * @property {string} award
   * @property {string[]} nominees
   * @property {number} ts
   * @property {string} [team] // Optional team property
   */

  /** @type {ActiveAward | null} */
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
        activeAward = /** @type {ActiveAward} */ (docSnap.data());
        voteStatus = 'idle'; // Reset vote status when award changes
      } else {
        activeAward = null;
        voteStatus = 'idle';
      }
    });

    return () => unsub(); // Unsubscribe on component destroy
  });

  /** @type {string} */
  let votedNominee = ''; // To display the chosen nominee on the thank you screen

  async function castVote(/** @type {string} */ nominee) {
    if (voteStatus === 'voted') {
      // If already voted, just show the thank you screen
      votedNominee = nominee; // Set voted nominee
      voteStatus = 'voted';
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
    max-width: 900px; /* Slightly wider container */
    margin: 40px auto;
    padding: 30px; /* More padding */
    background-color: rgba(30, 30, 30, 0.9); /* Slightly transparent dark background */
    color: var(--text-color);
    border-radius: 12px; /* More rounded corners */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4); /* Deeper shadow */
    font-family: 'Roboto', sans-serif; /* A more modern font */
    text-align: center;
    border: 1px solid var(--marvel-gold); /* Subtle gold border */
  }
  h1 {
    font-size: 2.8em; /* Larger heading */
    color: var(--marvel-gold);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Text shadow for pop */
    margin-bottom: 25px;
  }
  h2 {
    font-size: 1.8em; /* Larger subheading */
    color: var(--text-color);
    margin-bottom: 30px;
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
  .award-description {
    font-size: 1.1em;
    color: #bbb;
    margin-bottom: 20px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.4;
  }
  .no-active-voting {
    font-size: 1.5em;
    color: var(--marvel-gold);
    margin-top: 50px;
  }
  .nominee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .nominee-card {
    background-color: var(--bg-color);
    border: 2px solid var(--marvel-red);
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Center content vertically */
    align-items: center;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .nominee-card:hover:not(.disabled) {
    transform: translateY(-8px) scale(1.03); /* More pronounced lift */
    border-color: var(--marvel-gold);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6); /* Stronger shadow */
  }

  .nominee-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    border-color: #666; /* Slightly lighter border */
    background-color: #2a2a2a; /* Slightly darker disabled background */
    transform: none; /* No lift for disabled cards */
    box-shadow: none;
  }


  .nominee-card-content h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.1em;
    font-weight: bold;
    text-transform: uppercase;
  }

  .thank-you-screen {
    background-color: var(--bg-color);
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    margin-top: 50px;
    text-align: center;
    border: 2px solid var(--marvel-gold);
  }

  .thank-you-screen h1 {
    color: var(--marvel-gold);
    font-size: 2.5em;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .thank-you-screen p {
    font-size: 1.2em;
    color: var(--text-color);
    margin-bottom: 10px;
  }

  .thank-you-screen p strong {
    color: var(--marvel-red);
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .container {
      margin: 20px auto;
      padding: 15px;
      border-radius: 8px;
    }

    h1 {
      font-size: 2em; /* Smaller heading for mobile */
      margin-bottom: 20px;
    }

  h2 {
    color: var(--text-color);
    margin-bottom: 30px;
  }

  h3.active-team {
    color: var(--marvel-gold); /* Styling for team name */
    font-size: 1.4em;
    margin-bottom: 15px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  }

    .nominee-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); /* Smaller cards */
      gap: 15px;
      margin-top: 20px;
    }

    .nominee-card {
      padding: 10px;
    }

    .nominee-card-content h3 {
      font-size: 0.9em; /* Smaller nominee name */
    }

    .thank-you-screen {
      padding: 25px;
    }

    .thank-you-screen h1 {
      font-size: 1.8em;
    }

    .thank-you-screen p {
      font-size: 1em;
    }

    .no-active-voting {
      font-size: 1.2em;
    }
  }

  @media (max-width: 480px) {
    .nominee-grid {
      grid-template-columns: 1fr; /* Stack cards vertically on very small screens */
    }
  }
</style>

<div class="container">
  {#if activeAward}
    {#if voteStatus === 'voted'}
      <div class="thank-you-screen">
        <h1>Mission Accomplished!</h1>
        <p>Your vote for **{votedNominee}** in the "{activeAward.award}" is secure, hero!</p>
        <p>Thank you for participating.</p>
      </div>
    {:else}
      <h1>Vote for: {activeAward.award}</h1>
      {#if awardsDetails[/** @type {keyof typeof awardsDetails} */ (activeAward.award)]}
        <p class="award-description">{awardsDetails[/** @type {keyof typeof awardsDetails} */ (activeAward.award)].description}</p>
      {/if}
      <h2>Choose your champion: {#if activeAward.team}from {activeAward.team}{/if}</h2>
      <div class="nominee-grid">
        {#each activeAward.nominees as nominee}
          <div
            class="nominee-card"
            class:disabled={voteStatus === 'voting'}
            on:click={() => castVote(nominee)}
            role="button"
            tabindex="0"
          >
            <div class="nominee-card-content">
              <h3>{nominee}</h3>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <h1 class="no-active-voting">No active voting at the moment. Please check back later!</h1>
  {/if}
</div>
