/* RGB + alpha packed into one silent MP4; Canvas 2D works without WebGL. */
(() => {
 const host=document.querySelector('.hero-poster__portrait');
 const still=host?.querySelector('img');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!still || reduced.matches || navigator.connection?.saveData) return;
 const canvas=document.createElement('canvas');
 canvas.className='hero-entrance';canvas.width=1440;canvas.height=1440;
 canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d');
 if(!ctx)return;
 const scratch=document.createElement('canvas');scratch.width=2880;scratch.height=1440;
 const source=scratch.getContext('2d',{willReadFrequently:true});
 const output=ctx.createImageData(1440,1440);
 const video=document.createElement('video');
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';
 video.src='/hamamatsu/assets/video/hero-entrance-v2-packed.mp4';
 let stopped=false,frame,timer,previous=-1;
 function fallback(reason){
  stopped=true;clearTimeout(timer);cancelAnimationFrame(frame);video.pause();
  host.dataset.entrance='fallback';host.dataset.entranceReason=reason?.message || 'Video unavailable';
  host.classList.remove('hero-entrance-active');canvas.remove();observer.disconnect();
 }
 function fit(){const box=still.getBoundingClientRect();const h=Math.min(box.height,box.width*1.5);canvas.style.height=h+'px';canvas.style.width=h+'px';}
 const observer=new ResizeObserver(fit);observer.observe(still);host.append(canvas);fit();
 function draw(){
  if(stopped)return;
  if(video.readyState>=2 && video.currentTime!==previous){
   try{
    source.drawImage(video,0,0,2880,1440);
    const pixels=source.getImageData(0,0,2880,1440).data;
    const dest=output.data;
    for(let y=0;y<1440;y++){
     const start=y*2880*4,offset=y*1440*4;
     dest.set(pixels.subarray(start,start+1440*4),offset);
     for(let x=0;x<1440;x++) dest[offset+x*4+3]=pixels[start+(1440+x)*4];
    }
    ctx.putImageData(output,0,0);previous=video.currentTime;
    clearTimeout(timer);host.classList.add('hero-entrance-active');
   }catch(e){return fallback(e);}
  }
  if(!video.ended)frame=requestAnimationFrame(draw);
 }
 video.addEventListener('playing',draw,{once:true});
 video.addEventListener('ended',()=>{draw();stopped=true;cancelAnimationFrame(frame);host.dataset.entrance='complete';video.pause();},{once:true});
 video.addEventListener('error',()=>fallback(new Error('Video error '+video.error?.code)),{once:true});
 reduced.addEventListener('change',e=>{if(e.matches)fallback(new Error('Reduced motion'));});
 timer=setTimeout(()=>fallback(new Error('Loading timeout')),15000);
 video.play().catch(fallback);
})();
