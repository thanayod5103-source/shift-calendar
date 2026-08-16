/*
 * Shift Calendar Install Helper
 * Standalone PWA installation UX.
 * The browser/OS remains responsible for creating the actual launcher icon.
 */
(() => {
  if (window.__shiftCalendarInstallHelperV2) return;
  window.__shiftCalendarInstallHelperV2 = true;

  let deferredPrompt = null;
  const INSTALL_KEY = 'shiftCalendarPwaInstalled';
  const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const wasInstalled = () => isStandalone() || localStorage.getItem(INSTALL_KEY) === '1';
  const markInstalled = () => localStorage.setItem(INSTALL_KEY, '1');

  const platform = (() => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    if (/Windows|Macintosh|Linux/i.test(ua)) return 'desktop';
    return 'other';
  })();

  const css = document.createElement('style');
  css.id = 'shiftInstallHelperStyle';
  css.textContent = `
    #shiftInstallBar{position:fixed;right:14px;bottom:14px;z-index:10050;display:flex;align-items:center;gap:0;border-radius:14px;box-shadow:0 10px 28px rgba(31,92,61,.28);overflow:hidden}
    #shiftInstallLauncher{border:1px solid #b9d4c6;background:linear-gradient(135deg,#347451,#1f5c3d);color:#fff;border-radius:14px 0 0 14px;padding:10px 14px;font:700 12px Inter,"Segoe UI","Noto Sans Thai",Arial,sans-serif;cursor:pointer}
    #shiftInstallLauncher:hover{filter:brightness(1.05);transform:translateY(-1px)}
    #shiftInstallDismiss{width:30px;height:38px;border:1px solid #b9d4c6;border-left:0;border-radius:0 14px 14px 0;background:#245c40;color:rgba(255,255,255,.82);font:600 15px Arial,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0}
    #shiftInstallDismiss:hover{background:#173f2c;color:#fff}
    #shiftInstallBar[hidden]{display:none}
    #shiftInstallOverlay{position:fixed;inset:0;z-index:10060;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(9,18,14,.48);backdrop-filter:blur(6px)}
    #shiftInstallOverlay.open{display:flex}
    #shiftInstallModal{width:min(430px,100%);background:#fff;color:#17211d;border:1px solid #d8e4de;border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:22px;font:400 14px Inter,"Segoe UI","Noto Sans Thai",Arial,sans-serif}
    .si-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.si-title{font-size:20px;font-weight:800}.si-sub{font-size:11px;color:#6b7872;margin-top:4px}.si-close{border:0;background:#eef3f0;color:#34433c;width:34px;height:34px;border-radius:10px;font-size:20px;cursor:pointer}
    .si-icon{width:64px;height:64px;border-radius:16px;margin:18px auto 14px;display:block;object-fit:cover;box-shadow:0 8px 20px rgba(31,92,61,.18)}
    .si-message{line-height:1.6;color:#34433c}.si-steps{margin:12px 0 0;padding-left:20px;line-height:1.8}.si-note{margin-top:12px;padding:10px 12px;border-radius:11px;background:#edf6f0;color:#315b43;font-size:11px;line-height:1.5}.si-actions{display:flex;gap:8px;margin-top:18px}.si-actions button{flex:1;min-height:44px;border-radius:11px;border:1px solid #d5dfda;cursor:pointer;font-weight:700}.si-cancel{background:#f4f6f5;color:#34433c}.si-confirm{background:#347451;color:#fff;border-color:#347451!important}.si-status{display:none;margin-top:12px;padding:10px;border-radius:10px;font-size:11px;background:#eaf5ee;color:#275f3f}.si-status.show{display:block}
    @media(max-width:720px){#shiftInstallBar{right:10px;bottom:78px}#shiftInstallLauncher{padding:9px 12px;font-size:11px}#shiftInstallDismiss{height:36px;width:28px}}
  `;
  document.head.appendChild(css);

  const bar = document.createElement('div');
  bar.id = 'shiftInstallBar';
  bar.hidden = wasInstalled();
  bar.innerHTML = `
    <button id="shiftInstallLauncher" type="button" aria-label="Install Shift Calendar or add to Home Screen">⌂ Install / Home Screen</button>
    <button id="shiftInstallDismiss" type="button" aria-label="Hide install bar" title="ซ่อน">×</button>`;
  document.body.appendChild(bar);

  const launcher = bar.querySelector('#shiftInstallLauncher');
  const dismiss = bar.querySelector('#shiftInstallDismiss');

  const overlay = document.createElement('div');
  overlay.id = 'shiftInstallOverlay';
  overlay.innerHTML = `
    <div id="shiftInstallModal" role="dialog" aria-modal="true" aria-labelledby="shiftInstallTitle">
      <div class="si-head">
        <div><div class="si-title" id="shiftInstallTitle">Install Shift Calendar</div><div class="si-sub">สร้างทางลัดสำหรับเปิด App ได้เร็วขึ้น</div></div>
        <button class="si-close" type="button" aria-label="Close">×</button>
      </div>
      <img class="si-icon" src="./icon-192.png" alt="Shift Calendar icon">
      <div class="si-message" id="shiftInstallMessage"></div>
      <div class="si-status" id="shiftInstallStatus"></div>
      <div class="si-actions"><button class="si-cancel" type="button">ยกเลิก</button><button class="si-confirm" type="button">ยืนยันการติดตั้ง</button></div>
    </div>`;
  document.body.appendChild(overlay);

  const message = overlay.querySelector('#shiftInstallMessage');
  const status = overlay.querySelector('#shiftInstallStatus');
  const confirm = overlay.querySelector('.si-confirm');
  const close = () => overlay.classList.remove('open');

  function hideInstallBar(permanent = false) {
    if (permanent) markInstalled();
    bar.hidden = true;
  }

  function renderInstructions() {
    if (isStandalone()) {
      message.innerHTML = 'Shift Calendar ถูกติดตั้งเป็น App แล้ว สามารถเปิดจาก Icon บน Desktop / Home Screen ได้ทันที.';
      confirm.textContent = 'ปิด';
      confirm.onclick = close;
      return;
    }
    if (platform === 'ios') {
      message.innerHTML = '<b>iPhone / iPad</b><ol class="si-steps"><li>เปิดหน้านี้ด้วย <b>Safari</b></li><li>กดปุ่ม <b>Share</b></li><li>เลือก <b>Add to Home Screen</b></li><li>กด <b>Add</b> เพื่อสร้าง Icon</li></ol><div class="si-note">iOS ไม่อนุญาตให้เว็บไซต์เรียกหน้าต่างติดตั้ง Native โดยตรง การกด Confirm จะพาไปขั้นตอนที่ต้องทำใน Safari</div>';
      confirm.textContent = 'เข้าใจแล้ว';
      confirm.onclick = close;
      return;
    }
    if (deferredPrompt) {
      message.innerHTML = 'ระบบตรวจพบว่า Browser รองรับการติดตั้ง PWA กด <b>ยืนยันการติดตั้ง</b> เพื่อให้ Browser สร้าง App และ Icon ให้โดยอัตโนมัติ';
      confirm.textContent = 'ยืนยันการติดตั้ง';
      confirm.onclick = install;
      return;
    }
    message.innerHTML = '<b>Desktop / Android</b><div style="margin-top:8px">Browser ยังไม่ส่งคำสั่งติดตั้งให้เว็บไซต์ในขณะนี้ ให้เปิดเมนู Browser แล้วเลือก <b>Install app</b> หรือ <b>Add to Home screen</b></div><div class="si-note">เมื่อ Browser ติดตั้งสำเร็จ Icon จะเปิด URL ของ Shift Calendar ตาม Manifest โดยตรง</div>';
    confirm.textContent = 'ปิด';
    confirm.onclick = close;
  }

  async function install() {
    if (!deferredPrompt) { renderInstructions(); return; }
    confirm.disabled = true;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
    deferredPrompt = null;
    confirm.disabled = false;
    if (result.outcome === 'accepted') {
      markInstalled();
      status.textContent = 'ติดตั้งสำเร็จหรือกำลังสร้าง Icon โดย Browser/ระบบปฏิบัติการ สามารถเปิดจาก Icon ได้เมื่อขั้นตอนของระบบเสร็จสิ้น';
      status.classList.add('show');
      confirm.textContent = 'เสร็จสิ้น';
      confirm.onclick = close;
      hideInstallBar();
    } else {
      status.textContent = 'ยกเลิกการติดตั้งแล้ว สามารถกด Install / Home Screen อีกครั้งภายหลังได้';
      status.classList.add('show');
    }
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!wasInstalled()) bar.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBar(true);
    status.textContent = 'ติดตั้ง App สำเร็จแล้ว';
    status.classList.add('show');
  });

  launcher.addEventListener('click', () => {
    status.classList.remove('show');
    renderInstructions();
    overlay.classList.add('open');
  });
  dismiss.addEventListener('click', () => hideInstallBar(false));
  overlay.querySelector('.si-close').addEventListener('click', close);
  overlay.querySelector('.si-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
})();
