/* ==========================================================================
   CONFIGURAÇÕES E ESTADO GLOBAL
   ========================================================================== */
const STORIES_SLIDES = [
  'story-polaroids',
  'story-history',
  'story-stats'
];

let currentSlideIndex = 0;
let isPlaying = false;

// Seletores DOM
const body = document.body;
const progressFills = document.querySelectorAll('.progress-fill');
const footerPlayer = document.getElementById('footer-player');
const playPauseBtn = document.getElementById('btn-play-pause');
const playPauseIcon = document.getElementById('svg-play-pause-icon');
const touchZones = document.getElementById('touch-zones');

/* ==========================================================================
   1. GERADOR DE CORAÇÕES FLUTUANTES (EFEITOS NEON DE FUNDO)
   ========================================================================== */
function createHeartParticle() {
  const container = document.getElementById('hearts-container');
  if (!container) return;

  const heart = document.createElement('div');
  heart.className = 'heart-particle';
  
  const symbols = ['♥', '♦', '♥', '❤', '❥'];
  heart.innerText = symbols[Math.floor(Math.random() * symbols.length)];
  
  const size = Math.floor(Math.random() * 14) + 12; // 12px a 26px
  const left = Math.floor(Math.random() * 100);
  const duration = Math.random() * 4 + 6;
  const delay = Math.random() * 2;
  
  heart.style.fontSize = `${size}px`;
  heart.style.left = `${left}%`;
  heart.style.animationDuration = `${duration}s`;
  heart.style.animationDelay = `${delay}s`;
  
  container.appendChild(heart);
  
  setTimeout(() => {
    heart.remove();
  }, (duration + delay) * 1000);
}

// Inicia a chuva de corações
setInterval(createHeartParticle, 500);

/* ==========================================================================
   2. SINTETIZADOR DE MÚSICA ROMÂNTICA (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let synthInterval = null;
let currentTempoStep = 0;

// Progressão de Acordes (C - G - Am - F)
const CHORDS_BASS = [
  [130.81, 164.81, 196.00], 
  [98.00, 146.83, 196.00],  
  [110.00, 130.81, 220.00], 
  [87.31, 130.81, 174.61]   
];

// Notas de melodia
const MELODIES = [
  [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00], 
  [293.66, 392.00, 493.88, 587.33, 493.88, 392.00, 293.66, 493.88], 
  [440.00, 523.25, 659.25, 880.00, 659.25, 523.25, 440.00, 659.25], 
  [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 523.25]  
];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSynthNote(frequency, startTime, duration, volume = 0.08, type = 'sine') {
  if (!audioCtx || audioCtx.state === 'suspended') return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.06);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function startMusicSequencer() {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Limpa SEMPRE o intervalo anterior se ele existir
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  
  isPlaying = true;
  updatePlayPauseUI(true);

  let stepTime = 0.45;
  let chordIndex = 0;
  
  synthInterval = setInterval(() => {
    if (!isPlaying) return;
    
    const now = audioCtx.currentTime;
    const melodyPattern = MELODIES[chordIndex];
    const noteIndex = currentTempoStep % 8;
    
    const melodyFreq = melodyPattern[noteIndex];
    playSynthNote(melodyFreq, now, 1.3, 0.25, 'sine');
    
    if (noteIndex === 0) {
      const bassChord = CHORDS_BASS[chordIndex];
      bassChord.forEach(freq => {
        playSynthNote(freq, now, 2.8, 0.1, 'triangle');
      });
      
      // Sincronização Visual do Grave
      const beatElements = [
        document.querySelector('.player-album-thumb')
      ];
      beatElements.forEach(el => {
        if (el) {
          el.classList.remove('beat');
          void el.offsetWidth; // Trigger reflow
          el.classList.add('beat');
        }
      });
    }
    
    currentTempoStep++;
    if (currentTempoStep % 8 === 0) {
      chordIndex = (chordIndex + 1) % 4;
    }
  }, stepTime * 1000);
}

function stopMusicSequencer() {
  isPlaying = false;
  updatePlayPauseUI(false);
  
  // Limpa o intervalo ao pausar também para evitar múltiplos sequenciadores rodando
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  
  if (audioCtx) {
    audioCtx.suspend();
  }
}

function updatePlayPauseUI(playing) {
  if (playing) {
    playPauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  } else {
    playPauseIcon.innerHTML = `
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    `;
  }
}

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopMusicSequencer();
  } else {
    startMusicSequencer(); // Inicia o sequenciador de forma limpa
  }
});

/* ==========================================================================
   3. SISTEMA DE STORIES (CONTROLE DE SLIDES E BLOQUEIO DE ROLAGEM)
   ========================================================================== */
function updateProgressBars() {
  progressFills.forEach((fill, i) => {
    if (i < currentSlideIndex) {
      fill.style.width = '100%';
    } else if (i === currentSlideIndex) {
      fill.style.width = '100%';
    } else {
      fill.style.width = '0%';
    }
  });
}

function showSlide(index) {
  STORIES_SLIDES.forEach((id, i) => {
    const slide = document.getElementById(id);
    if (!slide) return;
    
    slide.classList.remove('active', 'exit');
    if (i < index) {
      slide.classList.add('exit');
    }
  });

  const nextSlide = document.getElementById(STORIES_SLIDES[index]);
  if (nextSlide) {
    nextSlide.classList.add('active');
  }
  
  currentSlideIndex = index;
  updateProgressBars();
  
  // CONTROLE DO BLOQUEIO DE ROLAGEM
  if (STORIES_SLIDES[index] === 'story-stats') {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
    setTimeout(animateStatsCounter, 400);
  } else {
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.height = '100dvh';
    document.documentElement.style.height = '100dvh';
  }
  
  // O player deve estar visível em todos os stories
  body.classList.add('has-started');
  footerPlayer.classList.add('visible');
}

function handleNextStory() {
  if (currentSlideIndex < STORIES_SLIDES.length - 1) {
    showSlide(currentSlideIndex + 1);
  } else {
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function handlePrevStory() {
  if (currentSlideIndex > 0) {
    showSlide(currentSlideIndex - 1);
  } else {
    // Voltar para a Hero
    const welcomeCard = document.querySelector('.welcome-card');
    if (welcomeCard) {
      welcomeCard.classList.remove('welcome-exit');
    }
    document.getElementById('stories-viewport').style.display = 'none';
    document.getElementById('hero-viewport').style.display = 'flex';
    body.classList.remove('has-started');
    footerPlayer.classList.remove('visible');
  }
}

document.getElementById('zone-next').addEventListener('click', handleNextStory);
document.getElementById('zone-prev').addEventListener('click', handlePrevStory);

// Variável para armazenar a transição
let matterUpdateFrameId = null; // não mais usado, mas mantido para compatibilidade se houver resquício

// Botão de início com transição super leve
document.getElementById('btn-start-experience').addEventListener('click', (e) => {
  e.stopPropagation();
  startMusicSequencer();
  
  const welcomeCard = document.querySelector('.welcome-card');
  if (welcomeCard) {
    welcomeCard.classList.add('welcome-exit');
  }
  
  const overlay = document.getElementById('giant-hearts-overlay');
  const storiesViewport = document.getElementById('stories-viewport');
  
  // Limpa corações antigos se houver
  const oldHearts = overlay.querySelectorAll('.fast-fall-heart');
  oldHearts.forEach(h => h.remove());
  
  // Restaura propriedades para a transição
  overlay.style.zIndex = '99999';
  overlay.style.opacity = '1';
  
  // Desativa qualquer slide ativo temporariamente para que eles entrem DEPOIS do slide-down
  document.querySelectorAll('.story-slide').forEach(s => s.classList.remove('active'));
  
  // 1. Injeta corações caindo rapidamente com o novo gradiente
  for (let i = 0; i < 45; i++) {
    const heart = document.createElement('div');
    heart.className = 'fast-fall-heart';
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" fill="var(--pink-neon)" stroke="none" style="width: 100%; height: 100%;">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
      </svg>
    `;
    const size = Math.random() * 40 + 30;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${Math.random() * 100}vw`;
    
    heart.style.animationDelay = `${Math.random() * 0.4}s`;
    heart.style.animationDuration = `${Math.random() * 0.4 + 0.8}s`;
    
    overlay.appendChild(heart);
  }
  
  // 2. Quando a tela está chovendo corações
  setTimeout(() => {
    // Esconde a Hero
    document.getElementById('hero-viewport').style.display = 'none';
    
    // O overlay vai para trás do storiesViewport
    overlay.style.zIndex = '100';
    
    // O storiesViewport desce como uma cortina preta/escura
    storiesViewport.style.zIndex = '200';
    storiesViewport.style.display = 'block';
    storiesViewport.classList.add('slide-down-in');
    
  }, 1000); // 1s após clicar
  
  // 3. Quando o storiesViewport termina de descer
  setTimeout(() => {
    // Mostramos o conteúdo e as polaroids saltam!
    showSlide(0);
    
    // Removemos a classe de animação e limpamos os corações
    storiesViewport.classList.remove('slide-down-in');
    const hearts = overlay.querySelectorAll('.fast-fall-heart');
    hearts.forEach(h => h.remove());
  }, 2000); // 1s de duração da cortina descendo
});

/* ==========================================================================
   4. ESTATÍSTICAS: CONTADOR DE NÚMEROS (SLIDE 3)
   ========================================================================== */
function animateStatsCounter() {
  const counter = document.querySelector('.counter');
  if (!counter || counter.classList.contains('animated')) return;
  
  counter.classList.add('animated');
  const target = parseInt(counter.getAttribute('data-target'), 10);
  const duration = 1500;
  const start = 0;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress * (2 - progress);
    
    const value = Math.floor(easeProgress * (target - start) + start);
    counter.innerText = value.toLocaleString('pt-BR');
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.innerText = target.toLocaleString('pt-BR');
    }
  }
  
  requestAnimationFrame(updateCounter);
}

/* ==========================================================================
   5. INTERAÇÕES DO CARROSSEL (BLOCO ÚNICO)
   ========================================================================== */
const prevBtn = document.getElementById('carousel-prev-btn');
const nextBtn = document.getElementById('carousel-next-btn');
const dots = document.querySelectorAll('.carousel-dots .dot');
const carouselContent = document.getElementById('single-carousel-content');

const carouselImgBox = document.getElementById('carousel-img-box');

const carouselData = [
  {
    title: "O Seu Sorriso",
    desc: "Álbum • 1 faixa favorita",
    bg: "transparent",
    imgHtml: `<img src="WhatsApp%20Image%202026-06-12%20at%2011.23.52.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
  },
  {
    title: "Os Nossos Abraços",
    desc: "Playlist • 1.000 memórias salvas",
    bg: "transparent",
    imgHtml: `<img src="WhatsApp%20Image%202026-06-12%20at%2011.24.54.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
  },
  {
    title: "Nossas Aventuras",
    desc: "Single • Lançamento 2026",
    bg: "transparent",
    imgHtml: `<img src="WhatsApp%20Image%202026-06-12%20at%2011.25.29.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
  },
  {
    title: "Nosso Primeiro Encontro",
    desc: "Acústico • Gravação Original",
    bg: "transparent",
    imgHtml: `<img src="WhatsApp%20Image%202026-06-12%20at%2011.20.52.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
  }
];

let currentCarouselIndex = 0;

function updateCarousel(index) {
  if (!carouselContent) return;
  
  // Fade out
  carouselContent.classList.add('fading');
  
  setTimeout(() => {
    // Atualiza dados
    carouselImgBox.style.background = carouselData[index].bg;
    carouselImgBox.innerHTML = carouselData[index].imgHtml;
    
    // Atualiza bolinhas
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Fade in
    carouselContent.classList.remove('fading');
  }, 300); // tempo que bate com a transição CSS de opacity
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    currentCarouselIndex = (currentCarouselIndex - 1 + carouselData.length) % carouselData.length;
    updateCarousel(currentCarouselIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselData.length;
    updateCarousel(currentCarouselIndex);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentCarouselIndex = index;
      updateCarousel(currentCarouselIndex);
    });
  });
}

/* ==========================================================================
   6. BOTÃO "NÃO" ESQUIVO
   ========================================================================== */
const btnNo = document.getElementById('btn-no');

function moveNoButton() {
  const btnRect = btnNo.getBoundingClientRect();
  const margin = 40;
  
  const maxX = window.innerWidth - btnRect.width - margin * 2;
  const maxY = window.innerHeight - btnRect.height - margin * 2;
  
  if (btnNo.style.position !== 'fixed') {
    btnNo.style.position = 'fixed';
    btnNo.style.zIndex = '9999';
  }
  
  const randomX = Math.floor(Math.random() * maxX) + margin;
  const randomY = Math.floor(Math.random() * maxY) + margin;
  
  btnNo.style.left = `${randomX}px`;
  btnNo.style.top = `${randomY}px`;
  
  btnNo.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btnNo.style.transform = 'scale(1)';
  }, 100);
}

btnNo.addEventListener('mouseenter', moveNoButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
});

/* ==========================================================================
   7. CANHÃO DE CONFETES E CARTA DE AMOR (ACEITAR PROPOSTA)
   ========================================================================== */
const btnYes = document.getElementById('btn-yes');
const letterOverlay = document.getElementById('letter-overlay');
const closeLetterBtn = document.getElementById('btn-close-letter');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height + 20;
    
    const angle = Math.random() * Math.PI - Math.PI;
    const speed = Math.random() * 14 + 11;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;
    
    this.size = Math.random() * 8 + 6;
    
    const colors = ['#ff1493', '#ff69b4', '#ffb6c1', '#c70039', '#e0a96d', '#ffffff'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    this.gravity = 0.38;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.opacity = 1;
    this.fade = Math.random() * 0.012 + 0.004;
  }
  
  update() {
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fade;
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(this.opacity, 0);
    
    if (Math.random() > 0.5) {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

function loopConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  confettiParticles.forEach((p, index) => {
    p.update();
    p.draw();
    if (p.opacity <= 0 || p.y > canvas.height + 50) {
      confettiParticles.splice(index, 1);
    }
  });
  
  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(loopConfetti);
  }
}

function launchConfettiExplosion() {
  cancelAnimationFrame(confettiAnimationId);
  confettiParticles = [];
  
  for (let i = 0; i < 220; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  
  if (audioCtx && audioCtx.state !== 'suspended') {
    const now = audioCtx.currentTime;
    playSynthNote(523.25, now, 0.2, 0.08, 'sine'); // C5
    playSynthNote(659.25, now + 0.15, 0.2, 0.08, 'sine'); // E5
    playSynthNote(783.99, now + 0.3, 0.4, 0.12, 'sine'); // G5
  }
  
  loopConfetti();
}

btnYes.addEventListener('click', () => {
  launchConfettiExplosion();
  letterOverlay.classList.add('active');
});

closeLetterBtn.addEventListener('click', () => {
  letterOverlay.classList.remove('active');
});

/* ==========================================================================
   8. INICIALIZAÇÃO E AUTOPLAY FALLBACK
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  // Inicializa o contexto de áudio
  initAudio();
});

// Desbloqueia e inicia áudio no primeiro toque em qualquer parte do site de forma limpa e única
function handleFirstGesture() {
  if (isPlaying) return; // Já está tocando
  if (audioCtx && audioCtx.state === 'running') return;
  startMusicSequencer();
}

document.addEventListener('click', handleFirstGesture, { once: true });
document.addEventListener('touchstart', handleFirstGesture, { once: true });

/* ==========================================================================
   9. ANIMAÇÕES EXCLUSIVAS PARA CELULAR (SWIPE & INTERSECTION OBSERVER)
   ========================================================================== */

// GESTOS DE DESLIZE (SWIPE) NOS STORIES
let touchStartX = 0;
let touchEndX = 0;

const storiesEl = document.getElementById('stories-viewport');
if (storiesEl) {
  storiesEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  storiesEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });
}

function handleSwipeGesture() {
  const swipeThreshold = 45; // sensibilidade em px
  const deltaX = touchEndX - touchStartX;
  
  if (deltaX < -swipeThreshold) {
    // Deslizou para a esquerda -> Avançar Story
    handleNextStory();
  } else if (deltaX > swipeThreshold) {
    // Deslizou para a direita -> Voltar Story
    handlePrevStory();
  }
}

// OBSERVADOR DE INTERSECÇÃO PARA ROLAGEM DINÂMICA
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.single-block-carousel, .track-row, .proposal-box, .heart-divider'
  );
  
  const observerOptions = {
    root: null,
    threshold: 0.1, // Dispara com 10% visível
    rootMargin: '0px 0px -40px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Inicializa no carregamento do DOM
window.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
});
