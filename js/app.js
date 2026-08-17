(function(){
  "use strict";

  // ---------- Drizzle Rain Animation Canvas ----------
  (function initRainCanvas(){
    const canvas = document.getElementById('rainCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', ()=>{
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numDrops = 150;
    const drops = [];
    for(let i=0; i<numDrops; i++){
      drops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: Math.random() * 18 + 10,
        speed: Math.random() * 9 + 7,
        opacity: Math.random() * 0.35 + 0.12,
        width: Math.random() * 0.9 + 0.4
      });
    }

    function drawRain(){
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      for(let i=0; i<numDrops; i++){
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.18, d.y + d.length);
        ctx.lineWidth = d.width;
        ctx.strokeStyle = 'rgba(195, 215, 245, ' + d.opacity + ')';
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.speed * 0.18;

        if(d.y > height){
          d.y = -d.length;
          d.x = Math.random() * (width + 200) - 100;
        }
      }
      requestAnimationFrame(drawRain);
    }
    requestAnimationFrame(drawRain);
  })();

  // ---------- Indian Standard Time (IST) Native Intl Engine ----------
  let timeOffsetMs = 0;

  async function fetchTimeAPIOffset() {
    try {
      const res = await fetch('https://timeapi.io/api/v1/time/current/zone?timeZone=Asia/Kolkata');
      if (res.ok) {
        const data = await res.json();
        if (data.date_time) {
          const serverMs = new Date(data.date_time).getTime();
          timeOffsetMs = serverMs - Date.now();
        }
      }
    } catch(e) {
      try {
        const res2 = await fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata');
        if (res2.ok) {
          const data2 = await res2.json();
          const serverMs = new Date(data2.datetime).getTime();
          timeOffsetMs = serverMs - Date.now();
        }
      } catch(err){}
    }
  }

  function updateISTDateTime() {
    try {
      const targetDate = new Date(Date.now() + timeOffsetMs);

      const timeStr = targetDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const match = timeStr.match(/^(\d+:\d+)\s*([APap][Mm])$/);
      const clockEl = document.getElementById('live-clock');
      if (clockEl) {
        if (match) {
          clockEl.innerHTML = match[1] + '<span>' + match[2].toLowerCase() + '</span>';
        } else {
          clockEl.innerHTML = timeStr;
        }
      }

      const dateStr = targetDate.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      const dateEl = document.getElementById('live-date');
      if (dateEl) {
        dateEl.innerText = dateStr + ' · IST';
      }
    } catch(e){}
  }

  fetchTimeAPIOffset();
  setInterval(fetchTimeAPIOffset, 60000);
  setInterval(updateISTDateTime, 1000);
  updateISTDateTime();

  // ---------- Supabase Realtime Presence Live Listener Counter ----------
  const env = window.ENV || {};
  const SUPABASE_URL = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : '';
  const SUPABASE_KEY = typeof env.SUPABASE_KEY === 'string' ? env.SUPABASE_KEY.trim() : '';
  let supabaseClient = null;

  const isConfigured = SUPABASE_URL && 
                       SUPABASE_KEY && 
                       !SUPABASE_URL.includes('YOUR_SUPABASE') && 
                       !SUPABASE_KEY.includes('YOUR_SUPABASE');

  if (isConfigured && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch(e) {
      console.warn('Supabase initialization failed:', e);
    }
  }

  if (supabaseClient) {
    const listenerId = 'listener_' + Math.random().toString(36).substring(2, 9);
    const channel = supabaseClient.channel('batcave-listeners', {
      config: { presence: { key: listenerId } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      let realCount = 0;
      for (const k in state) {
        realCount += state[k].length;
      }
      const el = document.getElementById('live-listeners');
      if (el) {
        el.innerText = realCount.toLocaleString() + (realCount === 1 ? ' listener' : ' listening');
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
  } else {
    // Graceful offline / unconfigured fallback counter
    const el = document.getElementById('live-listeners');
    if (el) {
      el.innerText = '1 listening';
    }
  }

  const body = document.body;
  const powerToggle = document.getElementById('powerToggle');
  const led = document.getElementById('led');
  const statusText = document.getElementById('statusText');
  const trackTitleEl = document.getElementById('trackTitle');
  const labelName = document.getElementById('labelName');
  const counterEl = document.getElementById('counter');
  const eqEl = document.getElementById('eq');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const stopBtn = document.getElementById('stopBtn');
  const volKnob = document.getElementById('volKnob');
  const volTick = document.getElementById('volTick');
  const fileInput = document.getElementById('fileInput');
  const shelfRow = document.getElementById('shelfRow');

  const EQ_BARS = 24;
  for(let i=0;i<EQ_BARS;i++){
    const bar = document.createElement('i');
    eqEl.appendChild(bar);
  }
  const eqBars = eqEl.querySelectorAll('i');

  // ---------- audio engine ----------
  let ctx = null;
  let masterGain = null;
  let analyser = null;
  let dataArray = null;
  let currentStopFn = null;
  let counterInterval = null;
  let counterValue = 0;
  let volume = 0.7;
  let powered = false;
  let playing = false;
  let rafId = null;
  let mediaEl = null;
  let ytPlayer = null;
  let ytPlayerReady = false;
  let pendingPlay = false;

  const builtIn = [
    { id:'bat-song-main', name:'Gotham Main Patrol Theme', cat:'SIDE A · FEATURED YOUTUBE', type:'youtube', ytid:'fVeI5xcnsd8' },
    { id:'bat-song-1',    name:'Gotham Patrol Track 1',    cat:'SIDE A · FEATURED YOUTUBE', type:'youtube', ytid:'03FC9nMhTf8' },
    { id:'bat-song-2',    name:'Gotham Patrol Track 2',    cat:'SIDE A · FEATURED YOUTUBE', type:'youtube', ytid:'zHCOLqsAvIA' },
    { id:'rain',          name:'Gotham Rain',              cat:'SIDE A · AMBIENT',          type:'synth', gen:genRain },
    { id:'hum',           name:'Batcave Hum',              cat:'SIDE A · DRONE',            type:'synth', gen:genHum },
    { id:'synth',         name:'Night Patrol Synth',       cat:'SIDE B · SYNTH',            type:'synth', gen:genSynth },
  ];
  const uploaded = [];
  let playlist = builtIn.slice();
  let currentIndex = 0;

  function initYTPlayer() {
    if (ytPlayer) return;
    try {
      ytPlayer = new YT.Player('yt-audio-player', {
        height: '1',
        width: '1',
        videoId: builtIn[0].ytid,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: function(e) {
            ytPlayerReady = true;
            try { ytPlayer.setVolume(volume * 100); } catch(err){}
            if (pendingPlay || powered) {
              setPowered(true);
              startPlayback();
            }
          },
          onStateChange: function(event) {
            if (event.data === YT.PlayerState.PLAYING) {
              playing = true;
              body.classList.add('playing');
              playIcon.innerHTML = '<rect x="6" y="5" width="4" height="14"></rect><rect x="14" y="5" width="4" height="14"></rect>';
              statusText.textContent = 'PLAYING';
              startCounter();
              startEQ();
            } else if (event.data === YT.PlayerState.ENDED) {
              loadTrack(currentIndex + 1, true);
            }
          }
        }
      });
    } catch(e){}
  }

  window.onYouTubeIframeAPIReady = function() {
    initYTPlayer();
  };

  if (window.YT && window.YT.Player) {
    initYTPlayer();
  }

  // Auto-start on first user interaction if browser policy blocked audio
  let userInteracted = false;
  document.addEventListener('click', function autoStartOnFirstClick(){
    if(!userInteracted){
      userInteracted = true;
      if(!powered) setPowered(true);
      if(!playing) startPlayback();
    }
  });

  function ensureCtx(){
    if(!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
    }
    if(ctx.state === 'suspended') ctx.resume();
  }

  // -- synthesized ambient generators --
  function genRain(){
    ensureCtx();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1)*0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type='bandpass'; filter.frequency.value=1800; filter.Q.value=0.6;
    const gain = ctx.createGain(); gain.gain.value=0.5;
    noise.connect(filter); filter.connect(gain); gain.connect(masterGain);
    noise.start();

    const thunderTimer = setInterval(()=>{
      if(Math.random() < 0.35){
        const osc = ctx.createOscillator();
        osc.type='sine'; osc.frequency.value = 45 + Math.random()*20;
        const tg = ctx.createGain(); tg.gain.value = 0;
        osc.connect(tg); tg.connect(masterGain);
        const t = ctx.currentTime;
        tg.gain.linearRampToValueAtTime(0.25, t+1.2);
        tg.gain.linearRampToValueAtTime(0, t+4);
        osc.start(t); osc.stop(t+4.2);
      }
    }, 3500);

    return ()=>{ clearInterval(thunderTimer); noise.stop(); noise.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  function genHum(){
    ensureCtx();
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator(); osc1.type='sine'; osc1.frequency.value=55;
    const osc2 = ctx.createOscillator(); osc2.type='sine'; osc2.frequency.value=58.5;
    const filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=300;
    const lfo = ctx.createOscillator(); lfo.frequency.value=0.07;
    const lfoGain = ctx.createGain(); lfoGain.gain.value=120;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
    const gain = ctx.createGain(); gain.gain.value=0.35;
    osc1.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(masterGain);
    osc1.start(t); osc2.start(t); lfo.start(t);

    const dripTimer = setInterval(()=>{
      if(Math.random() < 0.4){
        const d = ctx.createOscillator(); d.type='sine';
        d.frequency.setValueAtTime(1200 + Math.random()*400, ctx.currentTime);
        d.frequency.exponentialRampToValueAtTime(300, ctx.currentTime+0.25);
        const dg = ctx.createGain(); dg.gain.value=0.15;
        d.connect(dg); dg.connect(masterGain);
        dg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.3);
        d.start(); d.stop(ctx.currentTime+0.32);
      }
    }, 2200);

    return ()=>{ clearInterval(dripTimer); osc1.stop(); osc2.stop(); lfo.stop(); osc1.disconnect(); osc2.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  function genSynth(){
    ensureCtx();
    const bassOsc = ctx.createOscillator(); bassOsc.type='sawtooth'; bassOsc.frequency.value=55;
    const bassFilter = ctx.createBiquadFilter(); bassFilter.type='lowpass'; bassFilter.frequency.value=220;
    const bassGain = ctx.createGain(); bassGain.gain.value=0.25;
    bassOsc.connect(bassFilter); bassFilter.connect(bassGain); bassGain.connect(masterGain);
    bassOsc.start();

    const delay = ctx.createDelay(); delay.delayTime.value=0.32;
    const feedback = ctx.createGain(); feedback.gain.value=0.32;
    delay.connect(feedback); feedback.connect(delay);
    const delayOut = ctx.createGain(); delayOut.gain.value=0.5;
    delay.connect(delayOut); delayOut.connect(masterGain);

    const scale = [220,261.6,293.7,329.6,392,440];
    let step = 0;
    const arpGain = ctx.createGain(); arpGain.gain.value=0.16;
    arpGain.connect(masterGain); arpGain.connect(delay);

    const arpTimer = setInterval(()=>{
      const freq = scale[step % scale.length] * (step % 8 < 4 ? 1 : 2);
      step++;
      const o = ctx.createOscillator(); o.type='square'; o.frequency.value=freq;
      const g = ctx.createGain(); g.gain.value=0;
      o.connect(g); g.connect(arpGain);
      const t = ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.5, t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.28);
      o.start(t); o.stop(t+0.3);
    }, 260);

    return ()=>{
      clearInterval(arpTimer);
      bassOsc.stop(); bassOsc.disconnect(); bassFilter.disconnect(); bassGain.disconnect();
      delay.disconnect(); feedback.disconnect(); delayOut.disconnect(); arpGain.disconnect();
    };
  }

  function stopCurrentSource(){
    if(currentStopFn){ try{ currentStopFn(); }catch(e){} currentStopFn = null; }
    if(mediaEl){ mediaEl.pause(); mediaEl.src=''; mediaEl = null; }
    if(ytPlayer && typeof ytPlayer.pauseVideo === 'function'){ try{ ytPlayer.pauseVideo(); }catch(e){} }
  }

  function loadTrack(index, autoplay){
    stopCurrentSource();
    currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    labelName.textContent = track.name;
    trackTitleEl.querySelector('span').textContent = track.name.toUpperCase();
    counterValue = 0;
    counterEl.textContent = '0000';
    renderShelf();
    if(autoplay && powered) startPlayback();
  }

  function startPlayback(){
    if(!powered) setPowered(true);
    ensureCtx();
    const track = playlist[currentIndex];
    if(track.type === 'youtube'){
      if(ytPlayer && ytPlayerReady && typeof ytPlayer.loadVideoById === 'function'){
        try {
          ytPlayer.loadVideoById(track.ytid);
          ytPlayer.playVideo();
        } catch(e){ pendingPlay = true; }
      } else {
        pendingPlay = true;
      }
    } else if(track.type === 'file'){
      if(!mediaEl){
        mediaEl = new Audio(track.url);
        mediaEl.loop = true;
        const src = ctx.createMediaElementSource(mediaEl);
        src.connect(masterGain);
      }
      mediaEl.play();
    } else {
      if(!currentStopFn) currentStopFn = track.gen();
    }
    playing = true;
    body.classList.add('playing');
    playIcon.innerHTML = '<rect x="6" y="5" width="4" height="14"></rect><rect x="14" y="5" width="4" height="14"></rect>';
    statusText.textContent = 'PLAYING';
    startCounter();
    startEQ();
  }

  function pausePlayback(){
    if(mediaEl) mediaEl.pause();
    if(ytPlayer && typeof ytPlayer.pauseVideo === 'function'){ try{ ytPlayer.pauseVideo(); }catch(e){} }
    playing = false;
    body.classList.remove('playing');
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
    statusText.textContent = powered ? 'PAUSED' : 'STANDBY';
    stopCounter();
  }

  function stopPlayback(){
    stopCurrentSource();
    pausePlayback();
    counterValue = 0;
    counterEl.textContent = '0000';
    statusText.textContent = powered ? 'STOPPED' : 'STANDBY';
  }

  function startCounter(){
    stopCounter();
    counterInterval = setInterval(()=>{
      counterValue++;
      counterEl.textContent = String(counterValue % 10000).padStart(4,'0');
    }, 1000);
  }
  function stopCounter(){ if(counterInterval){ clearInterval(counterInterval); counterInterval=null; } }

  function startEQ(){
    if(rafId) return;
    function tick(){
      if(!playing){ rafId = null; eqBars.forEach(b=>b.style.height='6%'); return; }
      
      let hasRealSignal = false;
      if(analyser){
        analyser.getByteFrequencyData(dataArray);
        for(let i=0; i<dataArray.length; i++){
          if(dataArray[i] > 0){
            hasRealSignal = true;
            break;
          }
        }
      }
      
      if(hasRealSignal){
        for(let i=0; i<eqBars.length; i++){
          const v = dataArray[i % dataArray.length] / 255;
          eqBars[i].style.height = Math.max(6, Math.round(v * 100)) + '%';
        }
      } else {
        // Dynamic rhythmic spectrum visualizer for YouTube cross-origin audio & streaming
        const now = Date.now() * 0.003;
        for(let i=0; i<eqBars.length; i++){
          const freqWeight = Math.pow(1 - (i / eqBars.length), 0.45);
          const wave1 = Math.sin(now * 4.2 + i * 0.45) * 0.35 + 0.35;
          const wave2 = Math.cos(now * 8.5 - i * 0.3) * 0.25 + 0.25;
          const wave3 = Math.sin(now * 2.1 + i * 0.15) * 0.2 + 0.2;
          
          let val = (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.20) * freqWeight;
          val = Math.max(0.06, Math.min(0.95, val * 1.15));
          eqBars[i].style.height = Math.round(val * 100) + '%';
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  // ---------- power ----------
  function setPowered(on){
    powered = on;
    powerToggle.setAttribute('aria-checked', on ? 'true' : 'false');
    if(on){
      body.classList.add('powered');
      ensureCtx();
      statusText.textContent = 'BOOTING…';
      setTimeout(()=>{ if(powered && !playing) statusText.textContent = 'STANDBY'; }, 550);
      if(!playlist.length) return;
      if(!trackTitleEl.querySelector('span').textContent || trackTitleEl.querySelector('span').textContent === '—'){
        loadTrack(currentIndex, false);
      }
    } else {
      body.classList.remove('powered');
      stopPlayback();
      statusText.textContent = 'STANDBY';
      if(ctx && ctx.state === 'running') ctx.suspend();
    }
  }

  powerToggle.addEventListener('click', ()=> setPowered(!powered));

  playBtn.addEventListener('click', ()=>{
    if(!powered) setPowered(true);
    if(playing) pausePlayback(); else startPlayback();
  });
  stopBtn.addEventListener('click', stopPlayback);
  prevBtn.addEventListener('click', ()=> loadTrack(currentIndex-1, true));
  nextBtn.addEventListener('click', ()=> loadTrack(currentIndex+1, true));

  // ---------- volume knob (drag to rotate) ----------
  let dragging = false, startY = 0, startVol = volume;
  function setVolumeVisual(v){
    const angle = -135 + v*270;
    volTick.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
  }
  function setVolume(v){
    volume = Math.min(1, Math.max(0, v));
    if(masterGain) masterGain.gain.value = volume;
    if(ytPlayer && typeof ytPlayer.setVolume === 'function') {
      try { ytPlayer.setVolume(volume * 100); } catch(err){}
    }
    setVolumeVisual(volume);
  }
  volKnob.addEventListener('pointerdown', (e)=>{
    dragging = true; startY = e.clientY; startVol = volume;
    volKnob.setPointerCapture(e.pointerId);
  });
  volKnob.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const delta = (startY - e.clientY) / 120;
    setVolume(startVol + delta);
  });
  volKnob.addEventListener('pointerup', ()=> dragging=false);
  volKnob.addEventListener('pointercancel', ()=> dragging=false);
  setVolume(volume);

  // ---------- file upload ----------
  fileInput.addEventListener('change', (e)=>{
    const files = Array.from(e.target.files || []);
    files.forEach(file=>{
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^/.]+$/, '');
      uploaded.push({ id:'up-'+Date.now()+Math.random(), name, cat:'SIDE A · YOUR TAPE', type:'file', url });
    });
    playlist = builtIn.concat(uploaded);
    renderShelf();
    if(files.length){
      loadTrack(playlist.length-1, true);
      if(!powered) setPowered(true);
    }
    fileInput.value = '';
  });

  // ---------- shelf ----------
  function renderShelf(){
    shelfRow.innerHTML = '';
    playlist.forEach((t, i)=>{
      const card = document.createElement('div');
      card.className = 'tape-card' + (i===currentIndex ? ' active' : '');
      card.innerHTML =
        '<div class="cat">'+t.cat+'</div>' +
        '<div class="name">'+t.name+'</div>' +
        '<div class="reel-mini"><i></i><i></i></div>';
      card.addEventListener('click', ()=>{
        if(!powered) setPowered(true);
        loadTrack(i, true);
      });
      shelfRow.appendChild(card);
    });
    const uploadCard = document.createElement('label');
    uploadCard.className = 'tape-card upload';
    uploadCard.innerHTML = '<div class="plus">+</div><span>Insert tape</span>';
    uploadCard.addEventListener('click', (e)=>{ e.preventDefault(); fileInput.click(); });
    shelfRow.appendChild(uploadCard);
  }

  // init
  eqBars.forEach(b=>b.style.height='6%');
  renderShelf();
  loadTrack(0, false);

})();
