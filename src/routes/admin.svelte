<script>
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode';

let pin="", ok=false;
const correctPin="1234";

const awards=[
 "Friendly Neighbourhood Award",
 "Extra Cool Vibes Award",
 "I Am Groot Award",
 "Mischief Award",
 "Precision Award",
 "Strategic Shield Award",
 "The Iron Reactor Award",
 "King of Vibranium Award",
 "Honor & Duty Award",
 "Blocker Smasher Award",
 "Mutant Mentor Award",
 "Best Team Award"
];

let selected="", nominees="";
let qr="";

async function activate(){
  await setDoc(doc(db,"config","active"),{
    award:selected,
    nominees: nominees.split('\n').filter(x=>x.trim()),
    ts: Date.now()
  });
  qr = await QRCode.toDataURL(window.location.origin+"/vote");
}
</script>

{#if !ok}
  <input bind:value={pin} placeholder="PIN"/><button on:click={()=>ok=(pin===correctPin)}>Login</button>
{:else}
  <h1>Admin</h1>
  <select bind:value={selected}>
    <option value="">Select Award</option>
    {#each awards as a}<option value={a}>{a}</option>{/each}
  </select>

  <h3>Nominees (one per line)</h3>
  <textarea bind:value={nominees} rows="10"></textarea>

  <button on:click={activate}>Activate Award</button>

  {#if qr}
    <h3>QR Code</h3>
    <img src={qr} width="200">
  {/if}
{/if}
