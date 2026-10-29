const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }));
}
document.getElementById('year').textContent = new Date().getFullYear();


// Interactive multi-view superhero display. The supplied images are illustrative view frames,
// not a reconstructed, physically accurate 3D model.
(() => {
  const stage = document.getElementById('figureStage');
  if (!stage) return;
  const wrap = document.getElementById('figureImageWrap');
  const image = document.getElementById('figureImage');
  const slider = document.getElementById('figureRotation');
  const angleValue = document.getElementById('figureAngleValue');
  const angleLabel = document.getElementById('figureAngleLabel');
  const autoButton = document.getElementById('figureAuto');
  const views = [
    {src:'figure-standing.jpg', label:'STANDING VIEW'},
    {src:'figure-front.jpg', label:'FRONT DETAIL'},
    {src:'figure-action.webp', label:'ACTION POSE'},
    {src:'figure-back.webp', label:'BACK VIEW'}
  ];
  let yaw = 0, tilt = 0, auto = false, drag = false, startX = 0, startY = 0, startYaw = 0, startTilt = 0;
  let lastFrame = 0;
  function update() {
    const normalized = ((yaw % 360) + 360) % 360;
    slider.value = Math.round(normalized);
    angleValue.textContent = `${Math.round(normalized)}°`;
    const idx = Math.floor((normalized + 45) / 90) % views.length;
    const next = views[idx];
    if (image.dataset.view !== next.src) {
      image.src = next.src;
      image.dataset.view = next.src;
      image.alt = `${next.label.toLowerCase()} reference of a red-and-blue masked superhero`;
    }
    angleLabel.textContent = `${next.label} · ${Math.round(normalized)}°`;
    wrap.style.setProperty('--yaw', `${normalized}deg`);
    wrap.style.setProperty('--tilt', `${tilt}deg`);
    stage.style.setProperty('--tilt', `${tilt}deg`);
  }
  slider.addEventListener('input', () => { auto = false; autoButton.textContent = '▶ Auto spin'; yaw = Number(slider.value); update(); });
  document.getElementById('rotateLeft').addEventListener('click', () => { auto=false; yaw-=30; update(); });
  document.getElementById('rotateRight').addEventListener('click', () => { auto=false; yaw+=30; update(); });
  document.getElementById('tiltUp').addEventListener('click', () => { tilt = Math.max(-35, tilt-10); update(); });
  document.getElementById('tiltDown').addEventListener('click', () => { tilt = Math.min(35, tilt+10); update(); });
  document.getElementById('figureReset').addEventListener('click', () => { auto=false; yaw=0; tilt=0; autoButton.textContent='▶ Auto spin'; update(); });
  autoButton.addEventListener('click', () => { auto=!auto; autoButton.textContent=auto?'Ⅱ Pause spin':'▶ Auto spin'; });
  stage.addEventListener('pointerdown', e => { drag=true; startX=e.clientX; startY=e.clientY; startYaw=yaw; startTilt=tilt; stage.setPointerCapture(e.pointerId); auto=false; autoButton.textContent='▶ Auto spin'; });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    yaw = startYaw + (e.clientX-startX)*0.8;
    tilt = Math.max(-35, Math.min(35, startTilt + (e.clientY-startY)*0.35));
    update();
  });
  const endDrag = () => { drag=false; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  function animate(ts) {
    if (auto && !drag) {
      if (lastFrame) yaw += Math.min(40, ts-lastFrame) * 0.035;
      update();
    }
    lastFrame=ts;
    requestAnimationFrame(animate);
  }
  update();
  requestAnimationFrame(animate);
})();



/* Spider-Verse effects: canvas web, cursor, scroll progress, and reveal-on-scroll */
(() => {
  const canvas = document.getElementById('webCanvas');
  const ctx = canvas && canvas.getContext('2d');
  if (canvas && ctx) {
    let w=0,h=0,dpr=1,points=[],pointer={x:-1000,y:-1000};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function resize(){
      dpr=Math.min(window.devicePixelRatio||1,1.7);w=window.innerWidth;h=window.innerHeight;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
      const count=Math.max(28,Math.min(76,Math.floor(w/19)));
      points=Array.from({length:count},(_,i)=>({x:(i%Math.ceil(Math.sqrt(count)))/Math.ceil(Math.sqrt(count))*w+(Math.random()-.5)*40,y:Math.floor(i/Math.ceil(Math.sqrt(count)))/Math.ceil(Math.sqrt(count))*h+(Math.random()-.5)*40,vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16}));
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      // Draw a faint geometric web with red/cyan nodes.
      for(let i=0;i<points.length;i++){
        const p=points[i]; if(!reduced){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;}
        for(let j=i+1;j<points.length;j++){
          const q=points[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.hypot(dx,dy);
          if(dist<Math.min(150,w*.14)){
            const alpha=(1-dist/Math.min(150,w*.14))*.13;
            ctx.strokeStyle=(i+j)%5===0?`rgba(255,45,82,${alpha})`:`rgba(0,190,255,${alpha})`;
            ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
          }
        }
        const pd=Math.hypot(pointer.x-p.x,pointer.y-p.y);
        if(pd<145){ctx.strokeStyle=`rgba(255,60,90,${(1-pd/145)*.42})`;ctx.beginPath();ctx.moveTo(pointer.x,pointer.y);ctx.lineTo(p.x,p.y);ctx.stroke();}
      }
      if(!reduced) requestAnimationFrame(draw);
    }
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
    resize();draw();
  }
  const cursor=document.getElementById('spiderCursor');
  if(cursor && matchMedia('(hover:hover) and (pointer:fine)').matches){
    let x=0,y=0,tx=0,ty=0;
    window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;cursor.style.left=tx+'px';cursor.style.top=ty+'px';},{passive:true});
    document.querySelectorAll('a,button,input,[role="button"]').forEach(el=>{
      el.addEventListener('pointerenter',()=>cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave',()=>cursor.classList.remove('is-hover'));
    });
  }
  const progress=document.getElementById('scrollProgressBar');
  function setProgress(){if(!progress)return;const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?window.scrollY/max*100:0)+'%';}
  window.addEventListener('scroll',setProgress,{passive:true});setProgress();
  const cards=document.querySelectorAll('.reveal-card');
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
    cards.forEach((card,i)=>{card.style.transitionDelay=(i%5)*70+'ms';observer.observe(card);});
  }else cards.forEach(card=>card.classList.add('is-visible'));
})();

