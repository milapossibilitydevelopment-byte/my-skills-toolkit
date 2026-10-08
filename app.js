const state = {
  xp: Number(localStorage.getItem("mst_xp") || 0),
  coins: Number(localStorage.getItem("mst_coins") || 0),
  quest: localStorage.getItem("mst_quest") || "",
  goal: localStorage.getItem("mst_goal") || "",
  likes: JSON.parse(localStorage.getItem("mst_likes") || "[]"),
  strengths: JSON.parse(localStorage.getItem("mst_strengths") || "[]"),
  avatar: localStorage.getItem("mst_avatar") || "🧑🏽‍🚀",
  completed: localStorage.getItem("mst_week1") === "true"
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(message){
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>el.classList.remove("show"), 2200);
}

function updateStats(){
  const xp = Math.min(state.xp,100);
  $("#xpBar").style.width = xp + "%";
  $("#xpText").textContent = `${xp} / 100`;
  $("#coinCount").textContent = state.coins;
}

function addXP(amount){
  const before = Math.min(state.xp,100);
  state.xp = Math.min(100, state.xp + amount);
  state.coins += Math.max(1, Math.floor(amount/5));
  localStorage.setItem("mst_xp",state.xp);
  localStorage.setItem("mst_coins",state.coins);
  updateStats();
  if(state.xp > before) toast(`+${amount} XP! Quest progress unlocked.`);
}

function selectTiles(container, key, max=99){
  $$(container + " button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      btn.classList.toggle("selected");
      const selected = $$(container+" button.selected");
      if(selected.length > max){
        btn.classList.remove("selected");
        toast(`Choose up to ${max}.`);
      }
    });
  });
}
selectTiles("#strengths","strengths",5);
selectTiles("#likes","likes",99);

$$(".quest-options button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".quest-options button").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    state.quest = btn.textContent.replace(/^[^\w]+/,"").trim();
    localStorage.setItem("mst_quest",state.quest);
    $("#questStatus").textContent = `Selected: ${state.quest}`;
  });
});

$$(".quick-goals button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".quick-goals button").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    $("#goal").value = btn.textContent;
    $("#goalCount").textContent = `${$("#goal").value.length}/140`;
  });
});

$$(".choice-row button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const group = btn.parentElement.dataset.group;
    $$(`.choice-row[data-group="${group}"] button`).forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    if(group === "face") state.avatar = btn.dataset.value;
    $("#avatarPreview").textContent = state.avatar;
    $("#topAvatar").textContent = state.avatar;
  });
});

$("#goal").addEventListener("input",()=>{
  $("#goalCount").textContent = `${$("#goal").value.length}/140`;
});

function completeAvatar(){
  localStorage.setItem("mst_avatar",state.avatar);
  addXP(5); toast("Avatar saved! +5 XP");
}
function saveStrengths(){
  state.strengths = $$("#strengths button.selected").map(b=>b.textContent.trim());
  localStorage.setItem("mst_strengths",JSON.stringify(state.strengths));
  addXP(10); toast("Strengths saved! +10 XP");
}
function acceptQuest(){
  if(!state.quest){toast("Pick a quest first!");return;}
  addXP(10); localStorage.setItem("mst_quest",state.quest);
  $("#questStatus").textContent = `Quest accepted: ${state.quest} 🎯`;
  $("#readyTitle").textContent = "QUEST READY!";
  $("#readyText").textContent = "Your mission is loaded. Small steps → big progress!";
}
function saveGoal(){
  const value = $("#goal").value.trim();
  if(!value){toast("Type a small goal first.");return;}
  state.goal=value; localStorage.setItem("mst_goal",value); addXP(10); toast("Goal saved! +10 XP");
}
function finishWeek(){
  if(!state.quest || !state.goal){toast("Choose a quest and save a goal first.");return;}
  state.completed=true;
  localStorage.setItem("mst_week1","true");
  addXP(20);
  $("#readyTitle").textContent="WEEK 1 COMPLETE!";
  $("#readyText").textContent="You earned your first badge: 🏆 Getting Started!";
  toast("🏆 Week 1 complete! Badge earned.");
}
function saveAll(){
  localStorage.setItem("mst_avatar",state.avatar);
  localStorage.setItem("mst_goal",$("#goal").value.trim());
  localStorage.setItem("mst_quest",state.quest);
  state.strengths=$$("#strengths button.selected").map(b=>b.textContent.trim());
  state.likes=$$("#likes button.selected").map(b=>b.textContent.trim());
  localStorage.setItem("mst_strengths",JSON.stringify(state.strengths));
  localStorage.setItem("mst_likes",JSON.stringify(state.likes));
  toast("💾 Saved on this device.");
}
function showProgress(){
  toast(`Level 1 • ${state.xp}/100 XP • ${state.coins} coins`);
}
function scrollToSection(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth"});}
function printPage(){window.print();}
function resetGame(){
  if(confirm("Reset Week 1 on this device?")){
    ["mst_xp","mst_coins","mst_quest","mst_goal","mst_likes","mst_strengths","mst_avatar","mst_week1"].forEach(k=>localStorage.removeItem(k));
    location.reload();
  }
}

(function init(){
  updateStats();
  $("#avatarPreview").textContent=state.avatar;
  $("#topAvatar").textContent=state.avatar;
  if(state.quest){
    $$(".quest-options button").find(b=>b.textContent.includes(state.quest))?.classList.add("selected");
    $("#questStatus").textContent=`Selected: ${state.quest}`;
  }
  if(state.goal){$("#goal").value=state.goal;$("#goalCount").textContent=`${state.goal.length}/140`;}
  if(state.completed){
    $("#readyTitle").textContent="WEEK 1 COMPLETE!";
    $("#readyText").textContent="You earned your first badge: 🏆 Getting Started!";
  }
})();
