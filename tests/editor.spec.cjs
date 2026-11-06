const { chromium } = require('playwright');
const { zipSync, unzipSync, strToU8 } = require('fflate');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawn } = require('child_process');
const KEY = CryptoJS.enc.Utf8.parse('SDroiMod_MRSE_26');
const HEADER = 'SDMOD_ENC_V1:';
function encrypt(text) {
  const c=CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text),KEY,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7});
  const body=Buffer.from(CryptoJS.enc.Hex.stringify(c.ciphertext),'hex');return Buffer.concat([Buffer.from(HEADER,'utf8'),body]);
}
function decrypt(bytes) {
  const b=Buffer.from(bytes);assert.equal(b.subarray(0,HEADER.length).toString('utf8'),HEADER);
  const c=CryptoJS.enc.Hex.parse(b.subarray(HEADER.length).toString('hex'));
  return CryptoJS.AES.decrypt({ciphertext:c},KEY,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
}
(async()=>{
 const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:path.join(__dirname,'..'),stdio:'ignore'});
 await new Promise(r=>setTimeout(r,700));
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();let unexpected=[],pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.route('**/*',route=>{if(route.request().url().startsWith('http://127.0.0.1:8765/'))return route.continue();unexpected.push(route.request().url());return route.abort()});
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/'))unexpected.push(r.url())});
  await page.goto('http://127.0.0.1:8765/');
  const original='character\n{\n\tcoins = 1522078;\n\tfacts = achievement-one:true\\;achievement-two:true;\n\tgold = 25142644;\n\tlevel = 40;\n}\n\nEOF____';
  const zip=zipSync({'slot0.player':encrypt(original)},{level:6});
  await page.locator('#file').setInputFiles({name:'synthetic.sdroimod',mimeType:'application/zip',buffer:Buffer.from(zip)});
  try { await page.getByLabel('Oro (gold)').waitFor({timeout:8000}); } catch (e) { console.error('EDITOR STATUS:', await page.locator('#status').textContent()); console.error('PAGE ERRORS:', pageErrors); throw e; }
  assert.equal(await page.locator('#field-gold').inputValue(),'25142644');
  await page.locator('#field-gold').fill('999888');
  const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Recompilar y descargar .sdroimod'}).click();
  const dl=await promise;assert.match(dl.suggestedFilename(),/\.sdroimod$/);const file='/tmp/'+dl.suggestedFilename();await dl.saveAs(file);
  const rebuilt=unzipSync(new Uint8Array(fs.readFileSync(file)));assert.deepEqual(Object.keys(rebuilt),['slot0.player']);
  const changed=decrypt(rebuilt['slot0.player']);
  assert.equal(changed,original.replace('gold = 25142644;','gold = 999888;'));
  assert.deepEqual(unexpected,[],'browser made an unexpected network request');
  console.log('PASS synthetic UI edit/export/ZIP/AES/lossless test; zero external requests');
  await context.close();
 } finally {await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exit(1)});
