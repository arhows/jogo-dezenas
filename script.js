const units = [
  { n: 1, emoji: "🦁", name: "Léo", color: "#ffe0a8" },
  { n: 2, emoji: "🐼", name: "Panda", color: "#e8e8ef" },
  { n: 3, emoji: "🦊", name: "Lili", color: "#ffd8bf" },
  { n: 4, emoji: "🐸", name: "Pipo", color: "#d9f4cf" },
  { n: 5, emoji: "🐵", name: "Nino", color: "#f2ddc4" },
  { n: 6, emoji: "🐯", name: "Tico", color: "#ffe6b5" },
  { n: 7, emoji: "🐨", name: "Kiko", color: "#e3e7eb" },
  { n: 8, emoji: "🐧", name: "Pingu", color: "#dbe9ff" },
  { n: 9, emoji: "🐰", name: "Bia", color: "#ffe2ee" }
];

const teamColors = [
  "#5b5bd6", "#8c63d9", "#3f8dc4", "#2ca86f", "#e5a12f",
  "#e97950", "#d65674", "#725cc7", "#4d7f8a"
];

const unitsGrid = document.querySelector("#unitsGrid");
const tensGrid = document.querySelector("#tensGrid");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

units.forEach(unit => {
  const card = document.createElement("article");
  card.className = "unit-card";
  card.innerHTML = `
    <div class="character" style="background:${unit.color}">${unit.emoji}</div>
    <div class="unit-number">${unit.n}</div>
    <div class="unit-name">${unit.name}</div>
  `;
  card.addEventListener("click", () => {
    showToast(`${unit.n} representa ${unit.n === 1 ? "uma unidade" : unit.n + " unidades"}.`);
  });
  unitsGrid.appendChild(card);
});


/* =========================================================
   TIMES DAS DEZENAS INTERATIVOS
   Cada time possui exatamente a quantidade de unidades
   indicada pelo número: 10, 20, 30 ... 90.
   ========================================================= */

const teamStates = {};

function getTeamState(value) {
  if (!teamStates[value]) {
    teamStates[value] = Array.from({ length: value }, () => true);
  }
  return teamStates[value];
}

function getTeamCounts(value) {
  const state = getTeamState(value);
  const unitsCount = state.filter(Boolean).length;
  return {
    unitsCount,
    fullTens: Math.floor(unitsCount / 10),
    looseUnits: unitsCount % 10
  };
}

function teamExplanation(unitsCount, fullTens, looseUnits) {
  const dezenaWord = fullTens === 1 ? "dezena completa" : "dezenas completas";
  const unidadeWord = looseUnits === 1 ? "unidade" : "unidades";

  if (looseUnits === 0) {
    return `${unitsCount} unidades = ${fullTens} ${dezenaWord}.`;
  }

  return `${unitsCount} unidades = ${fullTens} ${dezenaWord} + ${looseUnits} ${unidadeWord}.`;
}

function renderTeamCard(value) {
  const d = value / 10;
  const state = getTeamState(value);
  const { unitsCount, fullTens, looseUnits } = getTeamCounts(value);
  const color = teamColors[d - 1];

  const card = document.createElement("article");
  card.className = "ten-card interactive-team";
  card.dataset.teamValue = value;

  const groupsMarkup = Array.from({ length: d }, (_, groupIndex) => {
    const slots = Array.from({ length: 10 }, (_, slotInGroup) => {
      const index = groupIndex * 10 + slotInGroup;
      const u = units[index % units.length];
      const isFilled = state[index];

      return `
        <button
          type="button"
          class="team-slot ${isFilled ? "filled" : "empty"}"
          data-team="${value}"
          data-slot="${index}"
          aria-label="${isFilled ? `Remover unidade ${index + 1}` : `Adicionar unidade ${index + 1}`}"
          aria-pressed="${isFilled ? "true" : "false"}"
          title="${isFilled ? "Clique para tirar este amigo" : "Clique para trazer o amigo de volta"}"
        >
          <span class="slot-character">${u.emoji}</span>
        </button>
      `;
    }).join("");

    return `
      <div class="ten-group" data-group-label="${groupIndex + 1}ª dezena">
        ${slots}
      </div>
    `;
  }).join("");

  card.innerHTML = `
    <div class="ten-header" style="background:${color}">
      <span>Time do ${value}</span>
      <strong>${value}</strong>
    </div>

    <div class="team-body">
      <p class="team-instruction">
        Cada quadro com 10 lugares forma uma dezena. Clique em um amigo para tirá-lo do time.
      </p>

      <div class="team-groups">
        ${groupsMarkup}
      </div>

      <div class="team-summary">
        <div class="team-summary-main">
          <strong>Quantos amigos ficaram?</strong>
          <span class="team-summary-number">${unitsCount}</span>
        </div>

        <div class="team-summary-explain">
          ${teamExplanation(unitsCount, fullTens, looseUnits)}
        </div>

        <div class="team-progress" aria-hidden="true">
          <span style="width:${(unitsCount / value) * 100}%; background:${color}"></span>
        </div>

        <div class="team-actions">
          <button type="button" class="team-action-btn" data-team-action="fill" data-team="${value}">
            Completar time
          </button>
          <button type="button" class="team-action-btn" data-team-action="clear" data-team="${value}">
            Esvaziar time
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

function renderAllTeams() {
  tensGrid.innerHTML = "";
  for (let d = 1; d <= 9; d++) {
    tensGrid.appendChild(renderTeamCard(d * 10));
  }
}

function updateTeamCard(value) {
  const oldCard = tensGrid.querySelector(`[data-team-value="${value}"]`);
  if (!oldCard) return;

  const newCard = renderTeamCard(value);
  oldCard.replaceWith(newCard);
}

tensGrid.addEventListener("click", event => {
  const slot = event.target.closest(".team-slot");

  if (slot) {
    const value = Number(slot.dataset.team);
    const index = Number(slot.dataset.slot);
    const state = getTeamState(value);

    state[index] = !state[index];
    updateTeamCard(value);

    const { unitsCount, fullTens, looseUnits } = getTeamCounts(value);
    showToast(teamExplanation(unitsCount, fullTens, looseUnits));
    return;
  }

  const actionButton = event.target.closest("[data-team-action]");
  if (actionButton) {
    const value = Number(actionButton.dataset.team);
    const action = actionButton.dataset.teamAction;
    const state = getTeamState(value);

    const fillValue = action === "fill";
    for (let i = 0; i < state.length; i++) {
      state[i] = fillValue;
    }

    updateTeamCard(value);

    const { unitsCount, fullTens, looseUnits } = getTeamCounts(value);
    showToast(teamExplanation(unitsCount, fullTens, looseUnits));
  }
});

renderAllTeams();


let tens = 2;
let ones = 3;

const tensValue = document.querySelector("#tensValue");
const unitsValue = document.querySelector("#unitsValue");
const resultNumber = document.querySelector("#resultNumber");
const resultSentence = document.querySelector("#resultSentence");
const visualTens = document.querySelector("#visualTens");
const visualUnits = document.querySelector("#visualUnits");

function renderBuilder() {
  tensValue.textContent = tens;
  unitsValue.textContent = ones;
  const total = tens * 10 + ones;
  resultNumber.textContent = total;

  visualTens.innerHTML = "";
  visualUnits.innerHTML = "";

  for (let i = 0; i < tens; i++) {
    const block = document.createElement("div");
    block.className = "ten-block";
    block.title = "1 dezena = 10 unidades";
    for (let j = 0; j < 10; j++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      block.appendChild(dot);
    }
    visualTens.appendChild(block);
  }

  for (let i = 0; i < ones; i++) {
    const dot = document.createElement("span");
    dot.className = "unit-dot";
    dot.textContent = units[i % units.length].emoji;
    visualUnits.appendChild(dot);
  }

  const tenText = tens === 1 ? "dezena" : "dezenas";
  const oneText = ones === 1 ? "unidade" : "unidades";
  resultSentence.textContent = `${total} é formado por ${tens} ${tenText} e ${ones} ${oneText}.`;
}

document.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (!action) return;

  if (action === "ten-plus") tens = Math.min(9, tens + 1);
  if (action === "ten-minus") tens = Math.max(0, tens - 1);
  if (action === "unit-plus") ones = Math.min(9, ones + 1);
  if (action === "unit-minus") ones = Math.max(0, ones - 1);

  renderBuilder();
});

renderBuilder();


/* =========================================================
   SOM E EFEITOS DE ACERTO / ERRO
   ========================================================= */

const celebrationLayer = document.querySelector("#celebrationLayer");
const balloon = document.querySelector("#balloon");
const confettiContainer = document.querySelector("#confettiContainer");
const sadReaction = document.querySelector("#sadReaction");

let audioContext;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, startTime, duration, type = "sine", volume = 0.12) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    [523.25, 0.00, 0.16],
    [659.25, 0.14, 0.16],
    [783.99, 0.28, 0.18],
    [1046.50, 0.43, 0.38]
  ];

  notes.forEach(([freq, delay, duration], index) => {
    playTone(freq, now + delay, duration, index === 3 ? "triangle" : "sine", 0.13);
  });

  // Pequeno "pop" no momento em que o balão estoura.
  setTimeout(() => {
    const popTime = ctx.currentTime;
    playTone(150, popTime, 0.08, "square", 0.08);
    playTone(95, popTime + 0.01, 0.09, "triangle", 0.07);
  }, 800);
}

function playWrongSound() {
  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime;
    playTone(330, now, 0.20, "sawtooth", 0.055);
    playTone(285, now + 0.22, 0.20, "sawtooth", 0.05);
    playTone(235, now + 0.44, 0.28, "sawtooth", 0.045);
  }

  // Se o navegador permitir fala, diz "nhé, nhé, nhé".
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("nhé... nhé... nhé...");
    utterance.lang = "pt-BR";
    utterance.rate = 0.8;
    utterance.pitch = 0.75;
    utterance.volume = 0.75;
    window.speechSynthesis.speak(utterance);
  }
}

function createConfetti() {
  confettiContainer.innerHTML = "";

  const colors = [
    "#ff4d6d",
    "#ffd166",
    "#06d6a0",
    "#118ab2",
    "#7b61e8",
    "#ff8c42",
    "#43aa8b"
  ];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 330;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + 90;

    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);
    piece.style.setProperty("--spin", `${Math.floor(Math.random() * 900 - 450)}deg`);
    piece.style.animationDelay = `${Math.random() * 0.12}s`;
    piece.style.width = `${7 + Math.random() * 8}px`;
    piece.style.height = `${10 + Math.random() * 12}px`;

    confettiContainer.appendChild(piece);
  }
}

function celebrateCorrectAnswer() {
  celebrationLayer.classList.remove("active");
  balloon.style.animation = "none";

  // Força o navegador a reiniciar a animação.
  void celebrationLayer.offsetWidth;
  balloon.style.animation = "";

  createConfetti();
  celebrationLayer.classList.add("active");
  playSuccessSound();

  setTimeout(() => {
    celebrationLayer.classList.remove("active");
    confettiContainer.innerHTML = "";
  }, 1550);
}

function showWrongReaction() {
  sadReaction.classList.remove("active");
  void sadReaction.offsetWidth;
  sadReaction.classList.add("active");
  playWrongSound();

  setTimeout(() => {
    sadReaction.classList.remove("active");
  }, 1700);
}


const quizVisual = document.querySelector("#quizVisual");
const quizOptions = document.querySelector("#quizOptions");
const quizFeedback = document.querySelector("#quizFeedback");
const nextQuestion = document.querySelector("#nextQuestion");

let correctAnswer = 0;
let answered = false;

function makeTenVisual() {
  const el = document.createElement("div");
  el.className = "ten-block";
  for (let j = 0; j < 10; j++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    el.appendChild(dot);
  }
  return el;
}

function makeUnitVisual(index) {
  const el = document.createElement("span");
  el.className = "unit-dot";
  el.textContent = units[index % units.length].emoji;
  return el;
}

function newQuiz() {
  answered = false;
  quizFeedback.textContent = "";
  quizVisual.innerHTML = "";
  quizOptions.innerHTML = "";

  const qTens = Math.floor(Math.random() * 5) + 1;
  const qUnits = Math.floor(Math.random() * 10);
  correctAnswer = qTens * 10 + qUnits;

  for (let i = 0; i < qTens; i++) {
    quizVisual.appendChild(makeTenVisual());
  }

  for (let i = 0; i < qUnits; i++) {
    quizVisual.appendChild(makeUnitVisual(i));
  }

  const candidates = new Set([correctAnswer]);
  while (candidates.size < 3) {
    const deltaOptions = [-10, -1, 1, 10, -2, 2];
    const delta = deltaOptions[Math.floor(Math.random() * deltaOptions.length)];
    const candidate = Math.max(0, Math.min(99, correctAnswer + delta));
    if (candidate !== correctAnswer) candidates.add(candidate);
  }

  [...candidates]
    .sort(() => Math.random() - 0.5)
    .forEach(value => {
      const button = document.createElement("button");
      button.textContent = value;
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        document.querySelectorAll("#quizOptions button").forEach(btn => {
          const v = Number(btn.textContent);
          if (v === correctAnswer) btn.classList.add("correct");
        });

        if (value === correctAnswer) {
          quizFeedback.textContent = "Muito bem, Dudu! Você acertou! 🎉";
          celebrateCorrectAnswer();
        } else {
          button.classList.add("wrong");
          quizFeedback.textContent = `Quase, Dudu! A resposta correta é ${correctAnswer}. Vamos tentar outra!`;
          showWrongReaction();
        }
      });
      quizOptions.appendChild(button);
    });
}

nextQuestion.addEventListener("click", newQuiz);
newQuiz();
