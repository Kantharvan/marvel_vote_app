<script>
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

let data=null, voted=false;

onSnapshot(doc(db,"config","active"), snap=>{
  data = snap.data();
});

function device(){
  let id=localStorage.getItem("dev");
  if(!id){ id=crypto.randomUUID(); localStorage.setItem("dev",id); }
  return id;
}

async function vote(opt){
  await setDoc(doc(db,"votes", data.award, device()),{
    choice: opt,
    ts: Date.now()
  });
  voted=true;
}
</script>

{#if !data}
  <p>No active voting.</p>
{:else if voted}
  <p>Thank you for voting!</p>
{:else}
  <h1>{data.award}</h1>
  {#each data.nominees as n}
    <button on:click={()=>vote(n)}>{n}</button>
  {/each}
{/if}
