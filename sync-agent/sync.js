import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

const tenant = process.env.MS_TENANT_ID;
const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const siteId = process.env.SP_SITE_ID;
const driveId = process.env.SP_DRIVE_ID;
const itemId = process.env.SP_ITEM_ID;

if (![tenant, clientId, clientSecret, siteId, driveId, itemId].every(Boolean)) {
  throw new Error('Missing Microsoft Graph configuration. Set repository secrets: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, SP_SITE_ID, SP_DRIVE_ID, SP_ITEM_ID');
}

async function graphToken() {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials', scope: 'https://graph.microsoft.com/.default' });
  const r = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body });
  if (!r.ok) throw new Error(`Token request failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

async function graph(url, token, options={}) {
  const r = await fetch(`https://graph.microsoft.com/v1.0${url}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers||{}) } });
  if (!r.ok) throw new Error(`Graph ${r.status}: ${await r.text()}`);
  return r;
}

function normalizeCell(cell) {
  const value = String(cell?.v ?? '').trim();
  const fill = cell?.s?.fill || cell?.s?.fgColor || {};
  const fg = fill.fgColor || fill;
  const rgb = String(fg.rgb || '').replace(/^FF/i,'').toUpperCase();
  const status = /^(D|DAY)$/i.test(value) ? 'Day' : /^(N|NIGHT)$/i.test(value) ? 'Night' : /^(OFF|O|พัก)$/i.test(value) ? 'Off' : value;
  let ot = false;
  if (status === 'Day' && ['385724','548235','274E13'].includes(rgb)) ot = true;
  if (status === 'Night' && ['002060','083B82','1F4E78'].includes(rgb)) ot = true;
  return { raw:value, status, ot, fill:{rgb, theme:fg.theme ?? null, tint:fg.tint ?? null} };
}

function parseWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type:'buffer', cellStyles:true, cellNF:true, cellDates:true });
  const months = {};
  for (const name of wb.SheetNames) {
    if (!/^2026_(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.test(name)) continue;
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:null, raw:true });
    const header = rows[2] || [];
    const startCol = header.findIndex(v => Number(v) === 1);
    if (startCol < 0) throw new Error(`${name}: day 1 header not found on row 3`);
    const people = [];
    for (let r=0; r<rows.length; r++) {
      const marker = String(rows[r]?.[0] ?? '').trim();
      const person = String(rows[r]?.[1] ?? '').trim();
      const position = String(rows[r]?.[2] ?? '').trim();
      const id = String(rows[r]?.[4] ?? '').trim();
      if (!person || !id || /signature|approval|approved|prepared/i.test(`${person} ${position}`)) continue;
      const shift = /^([ABCDT])$/i.test(marker) ? marker.toUpperCase() : (marker.includes('Truck') ? 'T' : null);
      if (!shift) continue;
      const schedule = {};
      for (let d=1; d<=31; d++) {
        const cell = ws[XLSX.utils.encode_cell({r, c:startCol+d-1})];
        if (cell) schedule[d] = normalizeCell(cell);
      }
      people.push({shift, name:person, position, id, schedule});
    }
    months[name] = people;
  }
  if (Object.keys(months).length !== 12) throw new Error(`Expected 12 production sheets, found ${Object.keys(months).length}`);
  return { generatedAt:new Date().toISOString(), months };
}

const token = await graphToken();
const meta = await graph(`/sites/${siteId}/drives/${driveId}/items/${itemId}?$select=id,name,eTag,lastModifiedDateTime`, token).then(r=>r.json());
const oldMetaPath = 'data/metadata.json';
let oldMeta = {};
try { oldMeta = JSON.parse(await fs.readFile(oldMetaPath,'utf8')); } catch {}
if (oldMeta.eTag === meta.eTag) {
  console.log(`No change: ${meta.lastModifiedDateTime}`);
  process.exit(0);
}
const content = await graph(`/sites/${siteId}/drives/${driveId}/items/${itemId}/content`, token).then(r=>r.arrayBuffer());
const data = parseWorkbook(Buffer.from(content));
await fs.mkdir('data',{recursive:true});
await fs.writeFile('data/schedule.json', JSON.stringify(data));
await fs.writeFile(oldMetaPath, JSON.stringify({ source:meta.name, itemId:meta.id, eTag:meta.eTag, lastModifiedDateTime:meta.lastModifiedDateTime, syncedAt:new Date().toISOString() }, null, 2));
console.log(`Updated ${meta.name} modified ${meta.lastModifiedDateTime}`);
