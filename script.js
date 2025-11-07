const songs = [
  { title: "Bekhayali", artist:"Sachet–Parampara", file: "Song1.mp3", cover: "cover1.jpg" },
  { title: "Dil Diyan Gallan", artist:"Atif Aslam", file: "song2.mp3", cover: "cover2.jpg" },
  { title: "Apna Bana Le Piya", artist:"Arijit Singh", file: "song3.mp3", cover: "cover3.jpg" },
  { title: "Besabriya", artist:"Armaan Malik", file: "song4.mp3", cover: "cover4.jpg" },
  { title: "Ranjha", artist:"B Praak", file: "song5.mp3", cover: "cover5.jpg" },
  { title: "Churake Dil Mera", artist:"Kumar Sanu", file: "song6.mp3", cover: "cover6.jpg" },
  { title: "Falak Tak Chal", artist:"Udit Narayan", file: "song7.mp3", cover: "cover7.jpg" },
  { title: "Mai Royaan", artist:"Tanveer Evan", file: "song8.mp3", cover: "cover8.jpg" },
  { title: "Jaan Nisar", artist:"Arijit Singh", file: "song9.mp3", cover: "cover9.jpg" },
  { title: "Illahi x Night Changes", artist:"Arijit/1D", file: "song10.mp3", cover: "cover10.jpg" }
];

// DOM refs
const playlistEl = document.getElementById("playlistContainer");
const audio = document.getElementById("audio");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");
const nowCover = document.getElementById("nowCover");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const curTime = document.getElementById("curTime");
const durTime = document.getElementById("durTime");
const volume = document.getElementById("volume");
const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const searchInput = document.getElementById("searchInput");
const modeBtn = document.getElementById("modeBtn");

// State
let currentIndex = -1;
let isRepeat = false;
let isShuffle = false;
let filtered = [...songs];

// THEME
(function initTheme(){
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
  modeBtn.setAttribute("aria-pressed", document.body.classList.contains("light"));
  modeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    modeBtn.setAttribute("aria-pressed", document.body.classList.contains("light"));
  });
})();

// BUILD PLAYLIST
function renderPlaylist(list = filtered){
  playlistEl.innerHTML = "";
  list.forEach(song => {
    const idx = songs.indexOf(song); // keeps index even when filtered
    const card = document.createElement("button");
    card.className = "song-card";
    card.innerHTML = `
      <img src="${song.cover}" alt="Cover of ${song.title}" onerror="this.src=''; this.style.background='#222'">
      <div class="meta">
        <h4>${song.title}</h4>
        <p>${song.artist || ""}</p>
      </div>`;
    card.addEventListener("click", () => playAt(idx));
    playlistEl.appendChild(card);
  });
}

// LOAD & PLAY
function playAt(index){
  if (index < 0 || index >= songs.length) return;
  currentIndex = index;
  const s = songs[currentIndex];
  audio.src = s.file;
  audio.play().catch(()=>{});
  updateNow(s);
  updatePlayIcon();
}

function updateNow(s){
  nowTitle.textContent = s.title;
  nowArtist.textContent = s.artist || "—";
  nowCover.src = s.cover || "";
}

function updatePlayIcon(){
  playBtn.textContent = audio.paused ? "▶" : "⏸";
}

// CONTROLS
playBtn.addEventListener("click", () => {
  if (!audio.src && songs.length) playAt(0);
  else audio.paused ? audio.play() : audio.pause();
});
prevBtn.addEventListener("click", () => {
  if (currentIndex <= 0) playAt(songs.length - 1);
  else playAt(currentIndex - 1);
});
nextBtn.addEventListener("click", nextTrack);

function nextTrack(){
  if (isShuffle){
    let r;
    do { r = Math.floor(Math.random() * songs.length); } while (songs.length > 1 && r === currentIndex);
    playAt(r);
  } else {
    playAt((currentIndex + 1) % songs.length);
  }
}

// SEEK + TIME
audio.addEventListener("timeupdate", () => {
  if (!isNaN(audio.duration)) {
    seek.value = Math.floor((audio.currentTime / audio.duration) * 100) || 0;
    curTime.textContent = toTime(audio.currentTime);
    durTime.textContent = toTime(audio.duration);
  }
});
seek.addEventListener("input", () => {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (seek.value / 100) * audio.duration;
  }
});

// VOLUME
volume.addEventListener("input", () => { audio.volume = volume.value; });

// REPEAT/SHUFFLE
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  audio.loop = isRepeat;
  repeatBtn.setAttribute("aria-pressed", isRepeat);
});
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.setAttribute("aria-pressed", isShuffle);
});

// ON END
audio.addEventListener("ended", () => {
  if (!audio.loop) nextTrack();
});
audio.addEventListener("play", updatePlayIcon);
audio.addEventListener("pause", updatePlayIcon);

// SEARCH (debounced)
let t;
searchInput.addEventListener("input", () => {
  clearTimeout(t);
  t = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();
    filtered = songs.filter(s => s.title.toLowerCase().includes(q) || (s.artist||"").toLowerCase().includes(q));
    renderPlaylist(filtered);
  }, 120);
});

// KEYBOARD
window.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  if (e.code === "Space"){ e.preventDefault(); playBtn.click(); }
  if (e.code === "ArrowRight"){ audio.currentTime = Math.min((audio.currentTime||0) + 5, audio.duration||0); }
  if (e.code === "ArrowLeft"){ audio.currentTime = Math.max((audio.currentTime||0) - 5, 0); }
});

function toTime(sec){
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// INIT
renderPlaylist();