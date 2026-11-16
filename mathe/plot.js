/* Graphen auf Karopapier + Formeln. Seite legt window.G = {id: spec} an und nutzt <div data-plot="id">. */
(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';let uid=0;
function E(t,a,p,x){const e=document.createElementNS(NS,t);if(a)for(const k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;if(p)p.appendChild(e);return e;}
const de=n=>{const r=Math.round(n*1000)/1000;return (r<0?'−':'')+String(Math.abs(r)).replace('.',',');};
function sample(f,a,b,X,Y,lo,hi){const N=Math.max(240,Math.round((b-a)*80)),span=hi-lo;let d='',down=false,prev=null;
  for(let i=0;i<=N;i++){const x=a+(b-a)*i/N,y=f(x);if(!Number.isFinite(y)||y<lo-span||y>hi+span){down=false;prev=null;continue;}
    if(prev!==null&&Math.abs(y-prev)>span)down=false;d+=(down?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1)+' ';down=true;prev=y;}return d;}
function plot(o){
  const [x0,x1]=o.x,[y0,y1]=o.y,u=26,p=16,st=o.step||1,ls=o.lstep||st,on=v=>Math.abs(v/ls-Math.round(v/ls))<1e-9;
  const W=(x1-x0)*u+2*p,H=(y1-y0)*u+2*p,X=x=>p+(x-x0)*u,Y=y=>p+(y1-y)*u;
  const svg=E('svg',{viewBox:`0 0 ${W} ${H}`,class:'plot',role:'img','aria-label':o.alt||'Graph'});svg.style.maxWidth=Math.round(Math.min(420,W*1.4))+'px';
  const g=E('g',{},svg);
  for(let k=Math.ceil(x0*2);k<=Math.floor(x1*2);k++){const x=k/2;E('line',{x1:X(x),y1:Y(y0),x2:X(x),y2:Y(y1),class:k%2?'g1':'g2'},g);}
  for(let k=Math.ceil(y0*2);k<=Math.floor(y1*2);k++){const y=k/2;E('line',{x1:X(x0),y1:Y(y),x2:X(x1),y2:Y(y),class:k%2?'g1':'g2'},g);}
  const a=E('g',{},svg);
  if(y0<=0&&y1>=0){const yy=Y(0),xe=X(x1)+p*.75;E('line',{x1:X(x0),y1:yy,x2:xe,y2:yy,class:'axis'},a);E('path',{d:`M${xe+1} ${yy} l-7 -3.5 v7 z`,class:'arrow'},a);E('text',{x:xe-2,y:yy-7,class:'axl','text-anchor':'end'},a,o.xl||'x');
    for(let k=Math.ceil(x0/st);k<=Math.floor(x1/st);k++){const x=k*st;if(Math.abs(x)<1e-9||x>=x1-1e-9)continue;E('line',{x1:X(x),y1:yy-3,x2:X(x),y2:yy+3,class:'axis'},a);if(on(x))E('text',{x:X(x),y:yy+13,class:'tick','text-anchor':'middle'},a,de(x));}}
  if(x0<=0&&x1>=0){const xx=X(0),ye=Y(y1)-p*.75;E('line',{x1:xx,y1:Y(y0),x2:xx,y2:ye,class:'axis'},a);E('path',{d:`M${xx} ${ye-1} l-3.5 7 h7 z`,class:'arrow'},a);E('text',{x:xx+7,y:ye+9,class:'axl'},a,o.yl||'y');
    const yst=o.ystep||st,yls=o.ylstep||yst;
    for(let k=Math.ceil(y0/yst);k<=Math.floor(y1/yst);k++){const y=k*yst;if(Math.abs(y)<1e-9||y>=y1-1e-9)continue;E('line',{x1:xx-3,y1:Y(y),x2:xx+3,y2:Y(y),class:'axis'},a);if(Math.abs(y/yls-Math.round(y/yls))<1e-9)E('text',{x:xx-5,y:Y(y)+3.5,class:'tick','text-anchor':'end'},a,de(y));}
    if(y0<=0)E('text',{x:xx-5,y:Y(0)+13,class:'tick','text-anchor':'end'},a,'0');}
  const id='cp'+(++uid),cp=E('clipPath',{id},E('defs',{},svg));E('rect',{x:X(x0),y:Y(y1),width:(x1-x0)*u,height:(y1-y0)*u},cp);
  const c=E('g',{'clip-path':`url(#${id})`},svg),ln=l=>'curve thin '+(l.cls||'s-muted')+(l.dash?' dash':'');
  for(const l of o.lines||[]){if('m' in l)E('line',{x1:X(x0),y1:Y(l.y+l.m*(x0-l.x)),x2:X(x1),y2:Y(l.y+l.m*(x1-l.x)),class:ln(l)},c);
    else if('vx' in l)E('line',{x1:X(l.vx),y1:Y(y0),x2:X(l.vx),y2:Y(y1),class:ln(l)},c);
    else if('hy' in l)E('line',{x1:X(x0),y1:Y(l.hy),x2:X(x1),y2:Y(l.hy),class:ln(l)},c);
    else E('line',{x1:X(l.x1),y1:Y(l.y1),x2:X(l.x2),y2:Y(l.y2),class:ln(l)},c);}
  for(const k of o.curves||[]){const A=k.dom?Math.max(k.dom[0],x0):x0,B=k.dom?Math.min(k.dom[1],x1):x1;E('path',{d:sample(k.f,A,B,X,Y,y0,y1),class:'curve '+(k.cls||'s-pen')+(k.dash?' dash':'')},c);}
  for(const q of o.pts||[]){E('circle',{cx:X(q.x),cy:Y(q.y),r:3.6,class:'pt f-'+(q.c||'pen')},svg);if(q.t)E('text',{x:X(q.x)+(q.dx??6),y:Y(q.y)+(q.dy??-7),class:'plbl','text-anchor':q.anchor||'start'},svg,q.t);}
  for(const t of o.texts||[])E('text',{x:X(t.x),y:Y(t.y),class:'plbl '+(t.cls||''),'text-anchor':t.anchor||'start'},svg,t.t);
  return svg;}
function boot(){
  const G=window.G||{};for(const el of document.querySelectorAll('[data-plot]')){const s=G[el.dataset.plot];if(s)el.replaceChildren(plot(s));}
  if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],output:'mathml',throwOnError:false,strict:false});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
