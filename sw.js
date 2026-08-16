const CACHE = "shift-calendar-pwa-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./calendar.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

const CALENDAR_MODERN_UI_SCRIPT = `
(() => {
  if (window.__shiftCalendarModernUiV10) return;
  window.__shiftCalendarModernUiV10 = true;

  const THEME_KEY = 'shiftCalendarModernTheme';
  const THEMES = {
    white: {name:'White', icon:'○', desc:'Clean • Minimal', cls:'modern-white'},
    black: {name:'Black', icon:'●', desc:'Deep • Focus', cls:'modern-black'},
    gray: {name:'Gray', icon:'◐', desc:'Slate • Professional', cls:'modern-gray'},
    green: {name:'Green Flow', icon:'◉', desc:'Mint → Deep Green', cls:'modern-green'}
  };

  const css = document.createElement('style');
  css.id = 'shift-calendar-modern-ui-v10';
  css.textContent = `
    :root{
      --modern-bg:#f5f7f8;--modern-panel:#ffffff;--modern-panel-2:#f0f3f4;--modern-line:#dbe2e0;
      --modern-text:#17211d;--modern-muted:#66736e;--modern-accent:#2f7652;--modern-accent-2:#1f5c3d;
      --modern-soft:#e6f1eb;--modern-day:#ffffff;--modern-empty:#eef2f1;--modern-dow:#e9efec;
      --modern-control:#ffffff;--modern-shadow:0 12px 34px rgba(24,43,35,.08);--modern-radius:14px;
      --modern-modal:rgba(12,22,18,.48);
    }
    html,body{font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI","Noto Sans Thai",Arial,sans-serif!important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    body{background:var(--modern-bg)!important;color:var(--modern-text)!important}
    .app,main{background:var(--modern-bg)!important;color:var(--modern-text)!important}
    .sidebar,.card,.toolbar,.sideCard,.modal,.stat,.detail,.monthCard{background:var(--modern-panel)!important;color:var(--modern-text)!important;border-color:var(--modern-line)!important;box-shadow:var(--modern-shadow)!important}
    .sidebar{backdrop-filter:blur(16px);border-right-width:1px!important}
    .brand,.title,.monthTitle,.monthName,.sideTitle{font-weight:780!important;letter-spacing:-.025em;color:var(--modern-text)!important}
    .title{font-size:clamp(22px,2.3vw,30px)!important}
    .source,.small,.monthMeta,.mobileHeaderSub{color:var(--modern-muted)!important}
    .btn,.viewBtn,.menuBtn,.mobileHeaderActions button{background:var(--modern-control)!important;color:var(--modern-text)!important;border:1px solid var(--modern-line)!important;border-radius:11px!important;box-shadow:0 2px 8px rgba(24,43,35,.04)!important;transition:.18s ease!important}
    .btn:hover,.viewBtn:hover,.menuBtn:hover,.mobileHeaderActions button:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(24,43,35,.09)!important}
    .btn.primary{background:linear-gradient(135deg,var(--modern-accent),var(--modern-accent-2))!important;color:#fff!important;border-color:transparent!important}
    .viewBtn.active,.navbtn.active{background:var(--modern-soft)!important;color:var(--modern-accent-2)!important;border-color:transparent!important}
    .navbtn{color:var(--modern-muted)!important;border-radius:11px!important}
    .navbtn:hover{background:var(--modern-soft)!important;color:var(--modern-text)!important}
    .calendar{border-color:var(--modern-line)!important;border-radius:13px!important;box-shadow:0 7px 24px rgba(24,43,35,.05)!important}
    .day{background:var(--modern-day)!important;color:var(--modern-text)!important;border-color:var(--modern-line)!important}
    .day.empty{background:var(--modern-empty)!important}
    .dow{background:var(--modern-dow)!important;color:var(--modern-muted)!important;border-color:var(--modern-line)!important;font-weight:750!important}
    .num{color:var(--modern-text)!important}
    .weekend .num{color:#a05454!important}
    .legend span{background:var(--modern-panel-2)!important;color:var(--modern-text)!important;border-color:var(--modern-line)!important}
    .monthCard{border-radius:var(--modern-radius)!important;overflow:hidden}
    .monthCard:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(24,43,35,.12)!important}
    .modalBack{background:var(--modern-modal)!important;backdrop-filter:blur(5px)}
    .modal{border-radius:20px!important}
    .close{background:var(--modern-control)!important;color:var(--modern-text)!important;border:1px solid var(--modern-line)!important}
    .modalActions{background:var(--modern-panel)!important}
    .mobileHeader{background:var(--modern-bg)!important;backdrop-filter:blur(14px)!important}
    .mobileBottomNav{background:var(--modern-panel)!important;border-color:var(--modern-line)!important;backdrop-filter:blur(16px)!important}
    .day.today{box-shadow:inset 0 0 0 3px var(--modern-accent)!important}
    .miniDay.today{box-shadow:inset 0 0 0 2px var(--modern-accent)!important}

    #modernThemeButton{display:inline-flex!important;align-items:center;gap:7px!important}
    #modernThemePanel{position:fixed;top:72px;right:18px;z-index:1000;width:min(380px,calc(100vw - 28px));padding:14px;border:1px solid var(--modern-line);border-radius:18px;background:var(--modern-panel);color:var(--modern-text);box-shadow:0 22px 55px rgba(0,0,0,.18);display:none}
    #modernThemePanel.open{display:block;animation:modernPanelIn .16s ease}
    @keyframes modernPanelIn{from{opacity:0;transform:translateY(-5px) scale(.98)}to{opacity:1;transform:none}}
    .modernThemeHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .modernThemeTitle{font-size:15px;font-weight:800;letter-spacing:-.02em}.modernThemeSub{font-size:10px;color:var(--modern-muted);margin-top:2px}
    .modernThemeGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .modernThemeCard{position:relative;border:1px solid var(--modern-line);background:var(--modern-panel-2);border-radius:14px;padding:10px;text-align:left;cursor:pointer;color:var(--modern-text);transition:.16s ease;min-height:84px;overflow:hidden}
    .modernThemeCard:hover{transform:translateY(-2px);box-shadow:0 9px 22px rgba(0,0,0,.10)}.modernThemeCard.active{outline:2px solid var(--modern-accent);outline-offset:1px}
    .modernThemeSwatch{height:35px;border-radius:9px;margin-bottom:8px;border:1px solid rgba(0,0,0,.08)}
    .sw-white{background:linear-gradient(135deg,#fff,#eef2f0)}.sw-black{background:linear-gradient(135deg,#0b0d0e,#29302d)}.sw-gray{background:linear-gradient(135deg,#dfe3e4,#707a77)}.sw-green{background:linear-gradient(135deg,#d9f2e5 0%,#70b98f 50%,#153e2c 100%)}
    .modernThemeName{font-size:11px;font-weight:800}.modernThemeDesc{font-size:9px;color:var(--modern-muted);margin-top:2px}.modernThemeCheck{position:absolute;right:8px;top:8px;font-size:11px;opacity:0}.modernThemeCard.active .modernThemeCheck{opacity:1;color:var(--modern-accent)}
    @media(max-width:720px){#modernThemePanel{top:auto;bottom:76px;right:9px;width:calc(100vw - 18px);border-radius:19px;padding:13px}#modernThemeButton{font-size:11px!important;padding:8px 9px!important}.modernThemeGrid{grid-template-columns:1fr 1fr}}

    #modernInstallButton{display:inline-flex!important;align-items:center;gap:7px!important}
    #modernInstallPanel{position:fixed;inset:0;z-index:1100;background:rgba(8,14,11,.5);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:18px}
    #modernInstallPanel.open{display:flex}.modernInstallCard{width:min(430px,100%);background:var(--modern-panel);color:var(--modern-text);border:1px solid var(--modern-line);border-radius:22px;box-shadow:0 25px 70px rgba(0,0,0,.25);padding:20px}
    .modernInstallIcon{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,#8fd9ae,#1d6945);color:#fff;font-size:20px;font-weight:900;box-shadow:0 10px 25px rgba(29,105,69,.28);margin-bottom:12px}.modernInstallCard h3{margin:0;font-size:20px;letter-spacing:-.03em}.modernInstallCard p{font-size:12px;color:var(--modern-muted);line-height:1.55;margin:7px 0 14px}
    .modernInstallSteps{display:grid;gap:7px;margin-bottom:15px}.modernInstallStep{display:flex;gap:9px;align-items:flex-start;padding:9px;border-radius:11px;background:var(--modern-panel-2);font-size:11px}.modernInstallStep b{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:var(--modern-soft);color:var(--modern-accent-2);flex:0 0 auto}.modernInstallActions{display:flex;gap:8px}.modernInstallActions button{flex:1;min-height:42px;border-radius:11px;border:1px solid var(--modern-line);background:var(--modern-control);color:var(--modern-text);font-weight:700;cursor:pointer}.modernInstallActions .primary{background:linear-gradient(135deg,var(--modern-accent),var(--modern-accent-2));color:#fff;border-color:transparent}

    html.modern-white{--modern-bg:#f6f8f7;--modern-panel:#fff;--modern-panel-2:#f1f4f2;--modern-line:#d9e0dd;--modern-text:#16201b;--modern-muted:#66736e;--modern-accent:#347451;--modern-accent-2:#20583b;--modern-soft:#e4f0e9;--modern-day:#fff;--modern-empty:#edf1ef;--modern-dow:#e8eeeb;--modern-control:#fff;--modern-modal:rgba(10,20,15,.42)}
    html.modern-black{--modern-bg:#090d0b;--modern-panel:#121815;--modern-panel-2:#1a211e;--modern-line:#2e3934;--modern-text:#edf5f0;--modern-muted:#9ba9a2;--modern-accent:#63c98e;--modern-accent-2:#31805a;--modern-soft:#173c2b;--modern-day:#151c18;--modern-empty:#0e1310;--modern-dow:#1b2420;--modern-control:#151c18;--modern-modal:rgba(0,0,0,.72)}
    html.modern-gray{--modern-bg:#dfe3e4;--modern-panel:#eef1f2;--modern-panel-2:#e0e5e6;--modern-line:#b7c0c2;--modern-text:#20282a;--modern-muted:#596569;--modern-accent:#4e625f;--modern-accent-2:#344845;--modern-soft:#d5dfdc;--modern-day:#f5f7f7;--modern-empty:#d6dcdd;--modern-dow:#d3d9da;--modern-control:#f7f8f8;--modern-modal:rgba(20,27,29,.46)}
    html.modern-green{--modern-bg:#dcefe5;--modern-panel:#f5fbf7;--modern-panel-2:#e6f3eb;--modern-line:#b9d4c4;--modern-text:#12261c;--modern-muted:#557065;--modern-accent:#2e8b5b;--modern-accent-2:#124a31;--modern-soft:#d3ebdc;--modern-day:#f9fdfb;--modern-empty:#d5e8dc;--modern-dow:#cfe4d7;--modern-control:#f8fcfa;--modern-modal:rgba(11,43,27,.46)}
    html.modern-green body{background:linear-gradient(135deg,#e9f7ef 0%,#cfe9da 52%,#9ac7ad 100%)!important}html.modern-green .app,html.modern-green main{background:transparent!important}html.modern-green .card,html.modern-green .monthCard,html.modern-green .toolbar,html.modern-green .sideCard{box-shadow:0 14px 35px rgba(23,72,45,.10)!important}
  `;
  document.head.appendChild(css);

  function safeStorageGet(){try{return localStorage.getItem(THEME_KEY)}catch(e){return null}}
  function safeStorageSet(v){try{localStorage.setItem(THEME_KEY,v)}catch(e){}}
  function applyTheme(theme){
    if(!THEMES[theme]) theme='white';
    Object.values(THEMES).forEach(t=>document.documentElement.classList.remove(t.cls));
    document.documentElement.classList.add(THEMES[theme].cls);
    safeStorageSet(theme);
    document.querySelectorAll('.modernThemeCard').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
  }

  function addThemeLibrary(){
    if(document.getElementById('modernThemeButton')) return;
    const topActions=document.querySelector('.topbar .actions');const mobileActions=document.querySelector('.mobileHeaderActions');
    const button=document.createElement('button');button.id='modernThemeButton';button.className='btn';button.type='button';button.innerHTML='◒ <span>Theme</span>';
    const mobileButton=button.cloneNode(true);mobileButton.id='modernThemeButtonMobile';mobileButton.setAttribute('aria-label','Theme library');
    const panel=document.createElement('div');panel.id='modernThemePanel';panel.innerHTML=`
      <div class="modernThemeHead"><div><div class="modernThemeTitle">Theme Library</div><div class="modernThemeSub">เลือกสไตล์ของ Shift Calendar</div></div><button id="modernThemeClose" class="close" type="button">×</button></div>
      <div class="modernThemeGrid">${Object.entries(THEMES).map(([key,t])=>`<button class="modernThemeCard" type="button" data-theme="${key}"><span class="modernThemeCheck">✓</span><div class="modernThemeSwatch sw-${key}"></div><div class="modernThemeName">${t.name}</div><div class="modernThemeDesc">${t.desc}</div></button>`).join('')}</div>`;
    document.body.appendChild(panel);if(topActions)topActions.appendChild(button);if(mobileActions)mobileActions.appendChild(mobileButton);
    const toggle=()=>panel.classList.toggle('open');button.onclick=toggle;mobileButton.onclick=toggle;
    panel.querySelector('#modernThemeClose').onclick=()=>panel.classList.remove('open');
    panel.addEventListener('click',e=>{const card=e.target.closest('.modernThemeCard');if(!card)return;applyTheme(card.dataset.theme);panel.classList.remove('open')});
    document.addEventListener('click',e=>{if(panel.classList.contains('open')&&!panel.contains(e.target)&&e.target!==button&&e.target!==mobileButton)panel.classList.remove('open')});
    applyTheme(safeStorageGet()||'white');
  }

  function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
  let installAvailable=false;
  window.addEventListener('message',e=>{if(e.data&&e.data.type==='SHIFT_INSTALL_AVAILABLE'){installAvailable=!!e.data.available;updateInstallLabel()}if(e.data&&e.data.type==='SHIFT_APP_INSTALLED'){installAvailable=false;updateInstallLabel()}});
  function updateInstallLabel(){const b=document.getElementById('modernInstallButton');if(!b)return;b.innerHTML=isStandalone()?'✓ <span>Installed</span>':'⌂ <span>Home screen</span>';b.disabled=isStandalone();b.style.opacity=isStandalone()?'.65':'1'}
  function openInstallPanel(){
    if(isStandalone())return;
    if(installAvailable){window.parent.postMessage({type:'SHIFT_INSTALL_REQUEST'},'*');return}
    const panel=document.getElementById('modernInstallPanel');if(panel){panel.classList.add('open');const ios=document.getElementById('modernInstallIos');const generic=document.getElementById('modernInstallGeneric');if(isIOS()){ios.style.display='grid';generic.style.display='none'}else{ios.style.display='none';generic.style.display='grid'}}
  }
  function addInstallPanel(){
    if(document.getElementById('modernInstallButton'))return;
    const topActions=document.querySelector('.topbar .actions');const mobileActions=document.querySelector('.mobileHeaderActions');
    const button=document.createElement('button');button.id='modernInstallButton';button.className='btn primary';button.type='button';button.innerHTML='⌂ <span>Home screen</span>';
    const mobileButton=button.cloneNode(true);mobileButton.id='modernInstallButtonMobile';mobileButton.setAttribute('aria-label','Add to Home Screen');
    const panel=document.createElement('div');panel.id='modernInstallPanel';panel.innerHTML=`<div class="modernInstallCard"><div class="modernInstallIcon">SC</div><h3>Add Shift Calendar</h3><p>ติดตั้งไว้ที่ Desktop / Home Screen เพื่อเปิด Shift Calendar เหมือนแอป</p><div id="modernInstallIos" class="modernInstallSteps" style="display:none"><div class="modernInstallStep"><b>1</b><span>เปิดหน้านี้ด้วย <strong>Safari</strong></span></div><div class="modernInstallStep"><b>2</b><span>กดปุ่ม <strong>Share</strong> ที่แถบด้านล่าง</span></div><div class="modernInstallStep"><b>3</b><span>เลือก <strong>Add to Home Screen</strong> แล้วกด Add</span></div></div><div id="modernInstallGeneric" class="modernInstallSteps"><div class="modernInstallStep"><b>1</b><span>เลือก <strong>Install / Add to Home screen</strong> ใน Browser</span></div><div class="modernInstallStep"><b>2</b><span>ยืนยันการติดตั้ง แล้วไอคอนจะถูกสร้างบน Home Screen / Desktop</span></div></div><div class="modernInstallActions"><button id="modernInstallClose" type="button">Close</button><button id="modernInstallNative" class="primary" type="button">Install</button></div></div>`;
    document.body.appendChild(panel);if(topActions)topActions.appendChild(button);if(mobileActions)mobileActions.appendChild(mobileButton);
    button.onclick=openInstallPanel;mobileButton.onclick=openInstallPanel;panel.querySelector('#modernInstallClose').onclick=()=>panel.classList.remove('open');
    panel.querySelector('#modernInstallNative').onclick=()=>{if(installAvailable){window.parent.postMessage({type:'SHIFT_INSTALL_REQUEST'},'*');panel.classList.remove('open')}else if(isIOS()){panel.classList.remove('open')}else{panel.classList.remove('open')}};
    panel.addEventListener('click',e=>{if(e.target===panel)panel.classList.remove('open')});updateInstallLabel();
  }

  const oldTheme=document.getElementById('themeBtn');if(oldTheme)oldTheme.style.display='none';
  const oldPanel=document.getElementById('themePanel');if(oldPanel)oldPanel.style.display='none';
  function boot(){addThemeLibrary();addInstallPanel();applyTheme(safeStorageGet()||'white');updateInstallLabel()}
  boot();
})();
`;

const PARENT_INSTALL_SCRIPT = `
(() => {
  if(window.__shiftCalendarInstallHostV10)return;
  window.__shiftCalendarInstallHostV10=true;
  let deferredPrompt=null;
  function broadcast(type,available){const f=document.getElementById('calendarFrame');if(f&&f.contentWindow)f.contentWindow.postMessage({type,available},'*')}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;broadcast('SHIFT_INSTALL_AVAILABLE',true)});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;broadcast('SHIFT_APP_INSTALLED',false)});
  window.addEventListener('message',e=>{if(!e.data||e.data.type!=='SHIFT_INSTALL_REQUEST')return;if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;broadcast('SHIFT_INSTALL_AVAILABLE',false)})});
  const f=document.getElementById('calendarFrame');if(f)f.addEventListener('load',()=>broadcast('SHIFT_INSTALL_AVAILABLE',!!deferredPrompt));
})();
`;

function injectIntoHtml(response,scriptId,script){
  return response.text().then(html=>{
    if(html.includes(scriptId))return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const injected=`<script>${script.replace(/<\/script/gi,'<\\/script')}</script>`;
    const marker='</body>';const output=html.includes(marker)?html.replace(marker,`${injected}${marker}`):`${html}${injected}`;
    const headers=new Headers(response.headers);headers.delete('content-length');
    return new Response(output,{status:response.status,statusText:response.statusText,headers});
  });
}

self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  if(req.mode==='navigate'||req.destination==='document'){
    const url=new URL(req.url);const path=url.pathname;const isCalendar=path.endsWith('/calendar.html');const isIndex=path.endsWith('/')||path.endsWith('/index.html');const fallback=isCalendar?'./calendar.html':'./index.html';
    event.respondWith(fetch(req).then(res=>{const transformed=isCalendar?injectIntoHtml(res.clone(),'shift-calendar-modern-ui-v10',CALENDAR_MODERN_UI_SCRIPT):isIndex?injectIntoHtml(res.clone(),'shift-calendar-install-host-v10',PARENT_INSTALL_SCRIPT):Promise.resolve(res);return transformed.then(output=>{const copy=output.clone();caches.open(CACHE).then(c=>c.put(fallback,copy));return output})}).catch(()=>caches.match(fallback)));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})));
});
