(()=>{
'use strict';
const DATA_URL='./data/schedule.json';
const META_URL='./data/metadata.json';
const INTERVAL=300000;
let lastGenerated=null;
let timer=null;
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function getFrame(){return document.getElementById('calendarFrame')}
function makeStatus(text,state){let e=document.getElementById('syncStatus');if(!e){e=document.createElement('div');e.id='syncStatus';document.body.appendChild(e)}e.textContent=text;e.dataset.state=state||'idle'}
function parseShift(doc){const t=(doc.getElementById('shiftCaption')?.textContent||'').toUpperCase();const m=t.match(/SHIFT\s*([ABCDT])/);return m?m[1]:'A'}
function parseMonth(doc){const t=(doc.querySelector('.monthTitle')?.textContent||'')+' '+(doc.querySelector('#monthSelect')?.value||'');const found=monthNames.find(x=>new RegExp(x,'i').test(t));if(found)return found;return monthNames[new Date().getMonth()]}
function statusClass(v){if(v.ot&&v.status==='Day')return 'ot';if(v.ot&&v.status==='Night')return 'nightOt';if(v.status==='Day')return 'work';if(v.status==='Night')return 'night';if(v.status==='Off')return 'off';return 'other'}
function label(v){if(v.status==='Day')return v.ot?'Day OT':'Day';if(v.status==='Night')return v.ot?'Night OT':'Night';return v.status||v.raw||'-'}
function apply(doc,payload){const shift=parseShift(doc), mon=parseMonth(doc);const rows=payload.months?.[`2026_${mon}`]||[];if(!rows.length)return false;const people=rows.filter(p=>p.shift===shift);if(!people.length)return false;doc.querySelectorAll('.day:not(.empty)').forEach(day=>{const n=Number(day.querySelector('.num')?.textContent);if(!n)return;const badges=day.querySelector('.badges');if(!badges)return;const counts=new Map();people.forEach(p=>{const v=p.schedule?.[String(n)];if(!v)return;const key=label(v);if(!counts.has(key))counts.set(key,{count:0,cls:statusClass(v)});counts.get(key).count++});if(!counts.size)return;badges.innerHTML='';counts.forEach((x,k)=>{const b=doc.createElement('div');b.className='badge '+x.cls;b.textContent=`${k} ${x.count}`;badges.appendChild(b)})});return true}
async function sync(){try{makeStatus('Syncing…','busy');const r=await fetch(DATA_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('schedule unavailable');const payload=await r.json();if(!payload.generatedAt||!payload.months||!Object.keys(payload.months).length){makeStatus('Waiting for Excel sync','idle');return}const frame=getFrame();const doc=frame?.contentDocument;if(doc){apply(doc,payload);const observer=new MutationObserver(()=>apply(doc,payload));observer.observe(doc.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),1000)}lastGenerated=payload.generatedAt;const d=new Date(payload.generatedAt);makeStatus('Excel synced '+(isNaN(d)?payload.generatedAt:d.toLocaleString()),'ok')}catch(err){makeStatus('Sync unavailable','error');console.warn('[Shift Calendar Sync]',err)}}
window.addEventListener('load',()=>{const f=getFrame();if(f)f.addEventListener('load',sync);sync();if(timer)clearInterval(timer);timer=setInterval(sync,INTERVAL)});
})();
