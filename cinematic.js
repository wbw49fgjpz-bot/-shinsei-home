(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)];
  const update=()=>{
    const max=document.documentElement.scrollHeight-innerHeight,y=scrollY,p=max?y/max:0;
    q('.progress').style.width=`${p*100}%`;
    const process=q('.process');
    if(process){
      const r=process.getBoundingClientRect();
      const travel=Math.max(1,process.offsetHeight+innerHeight*.35);
      const total=Math.max(0,Math.min(1,(innerHeight*.82-r.top)/travel));
      qa('.step-ring',process).forEach((ring,i)=>{
        const drawn=reduce?1:Math.max(0,Math.min(1,total*6-i));
        ring.style.setProperty('--ring',drawn);
      });
    }
    if(!reduce){
      const depth=(selector,amount=18)=>qa(selector).forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.bottom< -r.height||r.top>innerHeight+r.height)return;
        const t=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));
        el.style.setProperty('--depth',String(Math.abs(t)));
        const image=q('img',el);
        if(image)image.style.transform=`translate3d(0,${-t*amount}px,0) scale(1.1) rotateX(${t*3.5}deg)`;
      });
      depth('.gateway-card',20);
      depth('.business-grid a',16);
      depth('.philosophy-feature',22);
      const hero=q('.hero-media');
      if(hero&&y<innerHeight*1.2)hero.style.transform=`scale(${1.08+y/innerHeight*.09}) translateY(${y*.12}px)`;
      const stage=q('.transform-stage');
      if(stage){
        const r=stage.getBoundingClientRect(),total=stage.offsetHeight-innerHeight,t=Math.max(0,Math.min(1,-r.top/total));
        const bg=q('.problem-bg'),old=q('.transform-copy h2 span'),next=q('.transform-copy h2 b'),card=q('.value-card');
        if(bg){bg.style.clipPath=`inset(${18*(1-t)}% ${26*(1-t)}% ${18*(1-t)}% ${26*(1-t)}% round 2px)`;bg.style.transform=`perspective(1100px) rotateX(${(1-t)*7}deg) translateZ(${t*46}px) scale(${.96+t*.04})`}
        if(old){old.style.opacity=String(1-Math.max(0,(t-.25)*2.5));old.style.transform=`translateY(${-50*t}px)`}
        if(next){next.style.opacity=String(Math.max(0,(t-.35)*2.3));next.style.transform=`translateY(${Math.max(0,40-90*t)}px)`}
        qa('.problem-cloud span').forEach((el,i)=>{const fade=Math.max(0,Math.min(1,(t-.28-i*.012)*2.2));el.style.opacity=String(1-fade);el.style.transform=`translate(${(i%2?1:-1)*fade*45}px,${fade*25}px)`});
        if(card){card.style.opacity=String(Math.max(0,(t-.65)*3));card.style.transform=`translate(-50%,${Math.max(0,60-100*(t-.6))}px)`}
      }
    }
  };
  let ticking=false;addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{update();ticking=false});ticking=true}},{passive:true});update();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.14});qa('.reveal').forEach(el=>io.observe(el));
  const countIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting||e.target.dataset.done)return;e.target.dataset.done='1';const n=+e.target.dataset.count;if(reduce){e.target.textContent=n;return}const start=performance.now(),dur=900;const run=now=>{const t=Math.min(1,(now-start)/dur);e.target.textContent=Math.round(n*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(run)};requestAnimationFrame(run)}),{threshold:.5});qa('[data-count]').forEach(el=>countIO.observe(el));
  qa('.gateway-card').forEach(card=>card.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||reduce)return;
    e.preventDefault();
    const href=card.href,transition=q('.page-transition');
    card.classList.add('is-departing');
    if(transition){transition.style.setProperty('--tap-x',`${e.clientX}px`);transition.style.setProperty('--tap-y',`${e.clientY}px`);transition.classList.add('is-active')}
    setTimeout(()=>location.href=href,430);
  }));
  if(!reduce){addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',`${e.clientX}px`);document.documentElement.style.setProperty('--my',`${e.clientY}px`)});qa('.btn,.service-links a').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.04}px,${(e.clientY-r.top-r.height/2)*.08}px)`}));qa('.btn,.service-links a').forEach(el=>el.addEventListener('pointerleave',()=>el.style.transform=''))}
})();
