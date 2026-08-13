const CACHE = 'shift-calendar-pwa-v9';
const APP_SHELL = ['./','./index.html','./calendar.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

const DETAIL_UI_SCRIPT = `
(() => {
  if (window.__shiftCalendarDetailUiV9) return;
  window.__shiftCalendarDetailUiV9 = true;
  const css=document.createElement('style');
  css.id='shift-calendar-detail-ui-v9';
  css.textContent=\`
    .work{background:#c7e4cf!important;color:#164b29!important;border:1px solid #8fbe9c!important}
    .night{background:#c7d9ee!important;color:#173d66!important;border:1px solid #8eacd0!important}
    .ot{background:#24551f!important;color:#fff!important;border:1px solid #173b14!important;font-weight:800!important}
    .nightOt{background:#0b2e57!important;color:#fff!important;border:1px solid #061d38!important;font-weight:800!important}
    .modal .detailGrid{display:none!important}
    .modal .changeList{display:block!important;margin-top:10px!important}
    #compactStatusSummary{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:7px;margin:12px 0 10px}
    #compactStatusSummary .compactStat{border:1px solid #cbd4de;border-radius:9px;padding:8px 9px;background:#f7f9fb}
    #compactStatusSummary .compactStat b{display:block;font-size:16px;color:#1f2d3a}
    #compactStatusSummary .compactStat span{font-size:10px;color:#53606c}
    #compactStatusSummary .work{background:#e8f4eb!important;color:#164b29!important}
    #compactStatusSummary .night{background:#e8eff8!important;color:#173d66!important}
    #compactStatusSummary .leave{background:#fae3e3!important;color:#702727!important}
    #compactStatusSummary .off{background:#eef1f3!important;color:#3e4852!important}
    #compactStatusSummary .train{background:#eee5f7!important;color:#4d2e68!important}
    #compactStatusSummary .ot{background:#e5efe3!important;color:#173b14!important}
    #compactStatusSummary .nightOt{background:#e3eaf2!important;color:#0b2e57!important}
    .modal .change{display:flex;align-items:center;justify-content:space-between;gap:10px}
    @media(max-width:720px){#compactStatusSummary{grid-template-columns:repeat(2,minmax(0,1fr))}.modal .change{padding:8px 0}}
  \`;
  document.head.appendChild(css);

  function normalize(v){return String(v||'').replace(/\\s+/g,' ').trim()}
  function statusFromRow(row){
    const text=normalize(row.textContent).toLowerCase();
    const badge=row.querySelector('.badge,[class*=badge]');
    const bt=normalize(badge?badge.textContent:row.textContent).toLowerCase();
    if(bt.includes('night ot')||bt.includes('nightot'))return ['Night OT','nightOt'];
    if(bt.includes('day ot')||bt.includes('dayot'))return ['Day OT','ot'];
    if(bt.includes('night'))return ['Night','night'];
    if(bt.includes('day'))return ['Day','work'];
    if(bt.includes('training')||bt.includes('idf')||bt.includes('idp')||bt.includes('sop')||bt.includes('psm')||bt.includes('pss'))return ['Training','train'];
    if(bt.includes('leave')||bt==='l')return ['Leave','leave'];
    if(bt.includes('off')||bt==='x')return ['OFF','off'];
    if(text.includes('night'))return ['Night','night'];
    if(text.includes('day'))return ['Day','work'];
    if(text.includes('leave'))return ['Leave','leave'];
    if(text.includes('training'))return ['Training','train'];
    if(text.includes('off'))return ['OFF','off'];
    return null;
  }
  function renumber(list){
    Array.from(list.querySelectorAll('.change')).forEach((row,index)=>{
      const walker=document.createTreeWalker(row,NodeFilter.SHOW_TEXT);let n;
      while(n=walker.nextNode()){
        if(/^\\s*\\d+\\.\\s*/.test(n.nodeValue||'')){n.nodeValue=n.nodeValue.replace(/^\\s*\\d+\\.\\s*/,`${index+1}. `);break}
      }
    });
  }
  function enhance(){
    const modal=document.querySelector('.modal');if(!modal)return;
    const list=modal.querySelector('.changeList');if(!list)return;
    list.style.setProperty('display','block','important');
    renumber(list);
    if(modal.querySelector('#compactStatusSummary'))return;
    const counts=new Map();
    Array.from(list.querySelectorAll('.change')).forEach(row=>{const s=statusFromRow(row);if(s)counts.set(s[0],(counts.get(s[0])||0)+1)});
    const summary=document.createElement('div');summary.id='compactStatusSummary';
    [['Day','work'],['Night','night'],['Day OT','ot'],['Night OT','nightOt'],['Leave','leave'],['OFF','off'],['Training','train']].forEach(([label,cls])=>{
      const count=counts.get(label)||0;if(!count)return;
      const box=document.createElement('div');box.className='compactStat '+cls;box.innerHTML='<b>'+count+'</b><span>'+label+'</span>';summary.appendChild(box);
    });
    list.parentNode.insertBefore(summary,list);
  }
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  enhance();
})();
`;

function transformCalendarHtml(response){
  return response.text().then(html=>{
    if(html.includes('shift-calendar-detail-ui-v9'))return response;
    const injected='<script>'+DETAIL_UI_SCRIPT.replace(/<\/script/gi,'<\\/script')+'</script>';
    const output=html.includes('</body>')?html.replace('</body>',injected+'</body>'):html+injected;
    const headers=new Headers(response.headers);headers.delete('content-length');
    return new Response(output,{status:response.status,statusText:response.statusText,headers});
  });
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  if(req.mode==='navigate'||req.destination==='document'){
    const isCalendar=new URL(req.url).pathname.endsWith('/calendar.html');
    const fallback=isCalendar?'./calendar.html':'./index.html';
    event.respondWith(fetch(req).then(res=>(isCalendar?transformCalendarHtml(res.clone()):Promise.resolve(res)).then(out=>{const copy=out.clone();caches.open(CACHE).then(c=>c.put(fallback,copy));return out})).catch(()=>caches.match(fallback)));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})));
});
