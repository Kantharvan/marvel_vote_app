<script>
  import { db, collection, query, getDocs, writeBatch, deleteDoc } from '$lib/firebase';
  import { setDoc, doc } from 'firebase/firestore';
  import qrcode from 'qrcode';
  import { teams } from '../../data/teams.ts';

  let pin = '';
  let loggedIn = false;
  let selectedAward = '';
  let nomineesText = '';
  /** @type {keyof typeof teams | ''} */
  let selectedTeam = '';
  let qrCodeUrl = '';
  let showQrCode = false;

  const awards = [
    'Friendly Neighbourhood Award',
    'Extra Cool Vibes Award',
    'I Am Groot Award',
    'Mischief Award',
    'Precision Award',
    'Strategic Shield Award',
    'The Iron Reactor Award',
    'King of Vibranium Award',
    'Honor & Duty Award',
    'Blocker Smasher Award',
    'Mutant Mentor Award',
    'Best Team Award'
  ];

  const ADMIN_PIN = '1100'; // Define PIN here

  function login() {
    if (pin === ADMIN_PIN) { // Use constant PIN
      loggedIn = true;
    } else {
      alert('Incorrect PIN');
    }
  }

  function handleTeamChange() {
    // This function is explicitly called when selectedTeam changes.
    // Populate nominees if a team is selected and it's not the Best Team Award.
    // If Best Team Award is selected, its reactive block will handle nomineesText.
    if (selectedAward !== 'Best Team Award' && selectedTeam && teams[selectedTeam]) {
      nomineesText = teams[selectedTeam].join('\n');
    } else if (selectedAward !== 'Best Team Award') {
      nomineesText = '';
    }
    // If Best Team Award is selected, this function won't change nomineesText
    // because the reactive block takes precedence for Best Team Award.
  }

  // Reactive block to handle changes in selectedAward and auto-populate nominees
  $: {
    if (selectedAward === 'Best Team Award') {
      // For 'Best Team Award', nominees are all team names
      nomineesText = Object.keys(teams).filter(teamName => teamName !== 'All').join('\n');
      selectedTeam = ''; // Clear selectedTeam as it's not relevant here
    } else if (selectedTeam && teams[selectedTeam]) {
      // For other awards, if a team is selected, populate with its members
      nomineesText = teams[selectedTeam].join('\n');
    } else {
      // Otherwise, clear nominees (e.g., if award changed from Best Team Award, or team unselected)
      nomineesText = '';
    }
  }

  async function resetAllVotes() {
    if (!confirm('Are you sure you want to reset the active award? This will not delete past votes. To clear all votes, please do so from the Firebase Console.')) {
      return;
    }

    try {
      // Only deactivate current award
      console.log('Attempting to delete config/active...');
      await deleteDoc(doc(db, 'config', 'active'));
      console.log('config/active deleted successfully.');

      alert('Active award has been reset successfully!');
      selectedAward = '';
      nomineesText = '';
      selectedTeam = '';
      qrCodeUrl = '';
      showQrCode = false;
    } catch (error) {
      console.error('Error resetting active award:', error);
      alert('Failed to reset active award.');
    }
  }

  async function activateAward() {
    if (!selectedAward || !nomineesText) {
      alert('Please select an award and enter nominees.');
      return;
    }

    const nominees = nomineesText.split('\n').map(n => n.trim()).filter(n => n);
    const activeConfig = {
      award: selectedAward,
      nominees: nominees,
      ts: Date.now(),
      // Include selectedTeam if one was chosen, otherwise it defaults to undefined
      ...(selectedTeam && { team: selectedTeam })
    };

    try {
      await setDoc(doc(db, 'config', 'active'), activeConfig);
      qrCodeUrl = await qrcode.toDataURL(window.location.origin + '/vote');
      showQrCode = true;
      alert('Award activated successfully!');
    } catch (error) {
      console.error('Error activating award:', error);
      alert('Failed to activate award.');
    }
  }
</script>

<style>
  /* Basic Styling (Marvel-inspired) */
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
  }

  .reset-button {
    background-color: #d32f2f; /* Darker red for reset */
    margin-top: 20px;
  }

  .reset-button:hover {
    background-color: #b71c1c; /* Even darker red on hover */
  }
  h1, h2 {
    color: var(--marvel-gold);
    text-align: center;
    margin-bottom: 20px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input[type="password"],
  select,
  textarea {
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
    background-color: var(--button-bg);
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
    background-color: var(--button-hover-bg);
  }
  .qr-code-section {
    margin-top: 30px;
    text-align: center;
  }
  .qr-code-section p {
    margin-bottom: 15px;
    font-size: 1.1em;
    color: var(--marvel-gold);
  }
</style>

<div class="container">
  {#if !loggedIn}
    <h1>Admin Login</h1>
    <div class="form-group">
      <label for="pin">PIN:</label>
      <input type="password" id="pin" bind:value={pin} on:keypress={(e) => e.key === 'Enter' && login()} />
    </div>
    <button on:click={login}>Login</button>
  {:else}
    <h1>Admin Panel</h1>

    <div class="form-group">
      <label for="award-select">Select Award:</label>
      <select id="award-select" bind:value={selectedAward}>
        <option value="">--Please choose an award--</option>
        {#each awards as award}
          <option value={award}>{award}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="team-select">Select Team (to populate nominees):</label>
      <select id="team-select" bind:value={selectedTeam} on:change={handleTeamChange}>
        <option value="">--Select a team--</option>
        {#each Object.keys(teams) as teamName}
          <option value={teamName}>{teamName}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="nominees-textarea">Nominees (one per line):</label>
      <textarea id="nominees-textarea" bind:value={nomineesText} rows="10"></textarea>
    </div>

    <button on:click={activateAward}>Activate Award</button>

    <div class="form-group">
      <button on:click={resetAllVotes} class="reset-button">Reset All Votes</button>
    </div>

    <div class="form-group">
      <a href="/admin/results"><button>View Results</button></a>
    </div>

    {#if showQrCode}
      <div class="qr-code-section">
        <h2>Scan to Vote!</h2>
        <p>Share this QR code with voters:</p>
        {#if qrCodeUrl}
      <img src={qrCodeUrl} alt="QR Code" width="250" height="250"/>
    {/if}
        <p>{qrCodeUrl}</p>
      </div>
    {/if}
  {/if}
</div>
