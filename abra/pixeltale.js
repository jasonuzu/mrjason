(function(){
'use strict';
console.log('PIXELTALE: Starting...');

/* ==========================================================================
   CONFIG
   ========================================================================== */
var SUPABASE_URL  = 'https://mhlwfevnjpezaaocbwwr.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obHdmZXZuanBlemFhb2Nid3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTA1NjcsImV4cCI6MjA5NjM2NjU2N30.pIpC9ZrNTd16_A0aLl6TPokhEshElq0dNrMNwyMEJg0';
var BUCKET = 'pixeltale';

/* Image pipeline tuning. */
var MAX_EDGE       = 1280;      // longest edge of a stored scene image
var THUMB_EDGE     = 320;       // portraits + editor grid
var PASSTHRU_BYTES = 200 * 1024;// files under this upload untouched (protects pixel art)
var Q_FULL         = 0.82;
var Q_THUMB        = 0.72;
var AUDIO_WARN     = 8 * 1024 * 1024;
var UPLOAD_LIMIT   = 4;         // parallel uploads

var sb = null;
try {
  if (window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    console.log('Supabase connected');
  }
} catch(e) { console.warn('Supabase failed:', e); }

/* A shared ?story= link is a viewing session, not an editing one. Detected
   before anything renders so the editor is never built or shown. */
var VIEWER_SLUG = (function(){ var m = location.search.match(/[?&]story=([^&]+)/); return m ? decodeURIComponent(m[1]) : null; })();
var VIEWER = !!VIEWER_SLUG;
if (VIEWER) document.documentElement.classList.add('viewer');

var session = null;
var isLoggedIn = false;
var pendingDeleteId = null;
var currentStoryId = null;   // set when editing an existing cloud story
var currentStorySlug = null;
var currentStoryTitle = '';
var W = 320, H = 180;
function $(s) { return document.querySelector(s); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function makeRand(seed) { var s = seed >>> 0; return function() { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function bands(c, cols, y0, y1) { var n = cols.length, h = (y1 - y0) / n; for (var i = 0; i < n; i++) { c.fillStyle = cols[i]; c.fillRect(0, Math.floor(y0 + i*h), W, Math.ceil(h)+1); } }
function circle(c, x, y, r, col) { c.fillStyle = col; for (var j = -r; j <= r; j++) { var w = Math.floor(Math.sqrt(r*r - j*j)); if (w >= 0) c.fillRect(Math.round(x-w), Math.round(y+j), w*2+1, 1); } }
function pine(c, x, base, h, w, col) { c.fillStyle = col; for (var i = 0; i < 3; i++) { var th = h/3 + 2, ty = base - h + i*(h/3), tw = w*(0.45 + 0.55*(i+1)/3); for (var yy = 0; yy < th; yy++) { var ww = Math.max(1, tw*(yy/th)); c.fillRect(Math.round(x-ww/2), Math.round(ty+yy), Math.round(ww), 1); } } }

var BG = {};
BG.blizzard = { name:'BLIZZARD', build:function(){ var r=makeRand(77); this.trees=[]; for(var i=0;i<10;i++) this.trees.push({x:r()*W,h:28+r()*22,w:14+r()*8}); this.flakes=[]; for(var i=0;i<120;i++) this.flakes.push({x:r()*W,y:r()*H,sp:1.2+r()*2,ph:r()*6.28,sz:r()<.3?2:1,drift:r()*4-2}); }, draw:function(c,t){ bands(c,['#3a4a6a','#4a5a7a','#5a6a8a'],0,H-30); c.fillStyle='#c8d4e4'; c.fillRect(0,H-30,W,30); var i; for(i=0;i<this.trees.length;i++) pine(c,this.trees[i].x,H-30,this.trees[i].h,this.trees[i].w,'#2a3a50'); for(i=0;i<this.flakes.length;i++){ var f=this.flakes[i]; var y=(f.y+t*30*f.sp)%(H+10); var x=((f.x+Math.sin(t*1.5+f.ph)*f.drift+t*f.drift*3)%W+W)%W; c.fillStyle='rgba(240,248,255,'+(.4+.6*Math.abs(Math.sin(t*2+f.ph))).toFixed(2)+')'; c.fillRect(x,y,f.sz,f.sz); } } };
BG.desert = { name:'DESERT', build:function(){ this.far=[]; this.near=[]; for(var x=0;x<W;x++){ this.far.push(110+Math.sin(x*.04+1)*8+Math.sin(x*.012)*5); this.near.push(135+Math.sin(x*.028+3)*10+Math.sin(x*.007+1)*6); } }, draw:function(c,t){ bands(c,['#1a0a30','#4a1a40','#8a3040','#d06830','#f0a040','#ffe080'],0,115); circle(c,240,115,14,'#ffe890'); var x; c.fillStyle='#6a3040'; for(x=0;x<W;x++) c.fillRect(x,this.far[x]|0,1,H); c.fillStyle='#3a1828'; for(x=0;x<W;x++) c.fillRect(x,this.near[x]|0,1,H); var cy=this.near[60]|0; c.fillStyle='#1a0c18'; c.fillRect(58,cy-18,3,18); c.fillRect(50,cy-12,8,3); c.fillRect(50,cy-18,3,6); c.fillRect(66,cy-9,6,3); c.fillRect(68,cy-15,3,6); } };
BG.darkforest = { name:'DARK FOREST', build:function(){ var r=makeRand(13); this.trees=[]; for(var i=0;i<18;i++) this.trees.push({x:r()*W,h:40+r()*50,w:12+r()*10,layer:r()<.5?0:1}); this.eyes=[]; for(var i=0;i<8;i++) this.eyes.push({x:r()*W,y:80+r()*70,ph:r()*6.28,on:r()<.6}); }, draw:function(c,t){ bands(c,['#020806','#041210','#061a14','#082218'],0,H); var i; for(i=0;i<this.trees.length;i++){ var tr=this.trees[i]; if(tr.layer===0) pine(c,tr.x,H-20,tr.h,tr.w,'#0a1e14'); } for(i=0;i<this.trees.length;i++){ var t2=this.trees[i]; if(t2.layer===1) pine(c,t2.x,H-10,t2.h*1.2,t2.w*1.3,'#06140c'); } for(i=0;i<this.eyes.length;i++){ var e=this.eyes[i]; var blink=Math.sin(t*1.2+e.ph); if(e.on&&blink>-0.3){ var a=(.5+.5*blink).toFixed(2); c.fillStyle='rgba(255,200,50,'+a+')'; c.fillRect(e.x,e.y,2,1); c.fillRect(e.x+4,e.y,2,1); } } } };
BG.savannah = { name:'SAVANNAH', build:function(){ var r=makeRand(42); this.acacia=[]; for(var i=0;i<3;i++) this.acacia.push({x:60+r()*200,y:108+r()*10}); this.grass=[]; for(var i=0;i<60;i++) this.grass.push({x:r()*W,h:4+r()*8,ph:r()*6.28}); }, draw:function(c,t){ bands(c,['#1a1040','#3a2050','#804030','#d08030','#f0b848','#ffe878'],0,110); circle(c,160,110,18,'#ffd860'); c.fillStyle='#8a6830'; c.fillRect(0,110,W,H-110); var i; for(i=0;i<this.acacia.length;i++){ var a=this.acacia[i]; c.fillStyle='#3a2818'; c.fillRect(a.x,a.y,3,H-a.y-20); c.fillStyle='#4a6828'; c.fillRect(a.x-18,a.y-6,39,5); c.fillRect(a.x-14,a.y-10,31,5); } for(i=0;i<this.grass.length;i++){ var g=this.grass[i]; var sway=Math.sin(t*2+g.ph)*2; c.fillStyle='#9a7838'; c.fillRect(g.x+sway,H-20-g.h,1,g.h); } } };
BG.castle = { name:'CASTLE', build:function(){ var r=makeRand(55); this.bricks=[]; for(var row=0;row<13;row++){ var off=(row%2)*16; for(var x=-32;x<W+32;x+=32) this.bricks.push({x:x+off,y:row*12,s:.8+r()*.4}); } this.torches=[60,160,260]; }, draw:function(c,t){ c.fillStyle='#1a1428'; c.fillRect(0,0,W,H); var i; for(i=0;i<this.bricks.length;i++){ var b=this.bricks[i]; var v=(30*b.s)|0; c.fillStyle='rgb('+(v+12)+','+(v+4)+','+(v+20)+')'; c.fillRect(b.x+1,b.y+1,30,10); } c.fillStyle='#100c1a'; c.fillRect(0,156,W,H-156); for(i=0;i<this.torches.length;i++){ var tx=this.torches[i]; var fl=Math.sin(t*12+tx)*1.5; circle(c,tx,60,22,'rgba(255,140,40,.06)'); c.fillStyle='#5a3a20'; c.fillRect(tx-1,68,3,14); circle(c,tx,64,4+(fl>0?1:0),'#e06020'); circle(c,tx,62,2,'#ffe880'); } } };
BG.ocean = { name:'OCEAN', build:function(){ var r=makeRand(29); this.waves=[]; for(var i=0;i<14;i++) this.waves.push({y:100+i*6,seed:r()*W,sp:6+i*1.8}); }, draw:function(c,t){ bands(c,['#020818','#061430','#0a2048'],0,100); circle(c,260,30,8,'#e0e8f4'); c.fillStyle='#081838'; c.fillRect(0,100,W,H-100); var i; for(i=0;i<this.waves.length;i++){ var w=this.waves[i]; for(var k=0;k<7;k++){ var x=((w.seed+k*(W/7)+t*w.sp)%(W+20))-10; c.fillStyle='rgba(40,90,150,.8)'; c.fillRect(x,w.y,12,1); } } } };
BG.rain = { name:'RAIN', build:function(){ var r=makeRand(33); this.bld=[]; var x=-4; while(x<W+10){ var w=18+((r()*28)|0), h=50+((r()*80)|0), wins=[]; for(var wy=8;wy<h-8;wy+=10) for(var wx=3;wx<w-4;wx+=8) if(r()<.4) wins.push({wx:wx,wy:wy,on:r()<.7}); this.bld.push({x:x,w:w,h:h,col:r()<.5?'#141a2a':'#101624',wins:wins}); x+=w+1+((r()*5)|0); } this.drops=[]; for(var i=0;i<90;i++) this.drops.push({x:Math.random()*W,y:Math.random()*H,s:160+Math.random()*160}); }, draw:function(c,t){ bands(c,['#0a0e1a','#0e1628'],0,H); var gy=H-14,i,j; for(i=0;i<this.bld.length;i++){ var b=this.bld[i]; var top=gy-b.h; c.fillStyle=b.col; c.fillRect(b.x,top,b.w,b.h); for(j=0;j<b.wins.length;j++){ var wn=b.wins[j]; c.fillStyle=wn.on?'rgba(255,210,110,.85)':'rgba(18,24,40,.9)'; c.fillRect(b.x+wn.wx,top+wn.wy,3,4); } } c.fillStyle='rgba(150,185,225,.45)'; for(i=0;i<this.drops.length;i++){ var d=this.drops[i]; c.fillRect((d.x+(d.y+t*d.s)*.15)%(W+4),(d.y+t*d.s)%(H+10),1,5); } } };
BG.sunny = { name:'SUNNY', build:function(){ var r=makeRand(61); this.clouds=[]; for(var i=0;i<5;i++) this.clouds.push({x:r()*W,y:20+r()*40,w:30+r()*40,h:10+r()*8,sp:.4+r()*.6}); }, draw:function(c,t){ bands(c,['#2080d0','#40a0e8','#70c0f0','#a0daf8'],0,120); circle(c,260,35,14,'#fff0a0'); c.fillStyle='#40a030'; c.fillRect(0,120,W,H-120); var i; for(i=0;i<this.clouds.length;i++){ var cl=this.clouds[i]; var cx=(cl.x+t*cl.sp*15)%(W+cl.w*2)-cl.w; c.fillStyle='rgba(255,255,255,.85)'; c.fillRect(cx,cl.y,cl.w,cl.h); c.fillRect(cx+4,cl.y-4,cl.w-8,cl.h+8); } } };
BG.blueskies = { name:'BLUE SKIES', build:function(){ var r=makeRand(88); this.clouds=[]; for(var i=0;i<7;i++) this.clouds.push({x:r()*W,y:15+r()*80,w:25+r()*50,h:8+r()*10,sp:.2+r()*.5}); this.birds=[]; for(var i=0;i<4;i++) this.birds.push({x:r()*W,y:30+r()*50,sp:12+r()*8,ph:r()*6.28}); }, draw:function(c,t){ bands(c,['#1868c0','#2888e0','#48a8f0','#78c8f8','#a8e0ff'],0,H); var i; for(i=0;i<this.clouds.length;i++){ var cl=this.clouds[i]; var cx=(cl.x+t*cl.sp*15)%(W+cl.w*2)-cl.w; c.fillStyle='rgba(255,255,255,.7)'; c.fillRect(cx,cl.y,cl.w,cl.h); c.fillRect(cx+5,cl.y-5,cl.w-10,cl.h+10); } for(i=0;i<this.birds.length;i++){ var b=this.birds[i]; var bx=((t*b.sp+b.x)%(W+40))-20; var by=b.y+Math.sin(t*1.5+b.ph)*5; var flap=Math.sin(t*8+b.ph)>0?0:1; c.fillStyle='#1a3060'; c.fillRect(bx-3,by+flap,3,1); c.fillRect(bx+1,by+(1-flap),3,1); } } };
for (var bk in BG) if (BG[bk].build) BG[bk].build();
console.log('PIXELTALE: Backgrounds ready:', Object.keys(BG).length);

var TRANS = ['none','fade','slide','iris'];
var TLABEL = {'none':'NO FADE','fade':'FADE','slide':'SLIDE','iris':'IRIS WIPE'};

var state = {
  bg:'blueskies', pixelate:true, customBg:null,
  lines:[
    {type:'title', text:'THE PIXEL CHRONICLES', sub:'A Retro Tale', color:'#ffcc33', trans:'iris', hidden:false, autoJump:false, autoJumpTarget:null, slideTitle:'Opening Title'},
    {type:'text', text:'Long ago, in a realm drawn one pixel at a time...', color:'#ffffff', img:null, trans:'none', hidden:false, autoJump:false, autoJumpTarget:null, slideTitle:'Intro'},
    {type:'dialogue', charA:{name:'ELDER',text:'The crystals are dimming.',img:null,color:'#6fe3ff'}, charB:{name:'SCOUT',text:'I saw strange lights.',img:null,color:'#7dee6a'}, trans:'fade', hidden:false, autoJump:false, autoJumpTarget:null, slideTitle:'First Dialogue'}
  ],
  images:[], music:null, speed:5, lighting:'none', autoNext:false, sfx:true, volume:.7
};

/* ==========================================================================
   ASSET PIPELINE
   Images are downscaled and re-encoded as WebP, then stored as BINARY files
   in Supabase Storage. The database row keeps only a short URL. This is the
   single change that takes a save from ~200MB of base64 text to a few KB.
   ========================================================================== */

var encoderMime = null; // 'image/webp' or 'image/jpeg', detected once

function detectEncoder(){
  if (encoderMime) return Promise.resolve(encoderMime);
  return new Promise(function(res){
    try {
      var c = document.createElement('canvas'); c.width = c.height = 2;
      c.toBlob(function(b){
        encoderMime = (b && b.type === 'image/webp') ? 'image/webp' : 'image/jpeg';
        res(encoderMime);
      }, 'image/webp', 0.8);
    } catch(e){ encoderMime = 'image/jpeg'; res(encoderMime); }
  });
}

function extFor(mime){
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/png')  return 'png';
  if (mime === 'image/gif')  return 'gif';
  return 'jpg';
}

/* Decode without blocking the main thread where supported. */
function loadBitmap(blob){
  if (window.createImageBitmap) {
    return createImageBitmap(blob).catch(function(){ return loadViaImg(blob); });
  }
  return loadViaImg(blob);
}
function loadViaImg(blob){
  return new Promise(function(res, rej){
    var u = URL.createObjectURL(blob), im = new Image();
    im.onload  = function(){ URL.revokeObjectURL(u); res(im); };
    im.onerror = function(){ URL.revokeObjectURL(u); rej(new Error('decode failed')); };
    im.src = u;
  });
}

function drawScaled(bmp, maxEdge){
  var w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
  var scale = Math.min(1, maxEdge / Math.max(w, h));
  var tw = Math.max(1, Math.round(w * scale)), th = Math.max(1, Math.round(h * scale));
  var c = document.createElement('canvas'); c.width = tw; c.height = th;
  var cx = c.getContext('2d');
  // Smooth downscale is right for photos. Files small enough to be pixel art
  // never reach this path -- they pass through untouched.
  cx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in cx) cx.imageSmoothingQuality = 'high';
  cx.drawImage(bmp, 0, 0, tw, th);
  return { canvas:c, w:tw, h:th };
}

function canvasToBlob(c, mime, q){
  return new Promise(function(res){ c.toBlob(function(b){ res(b); }, mime, q); });
}

/* Returns { full:Blob, thumb:Blob|null, w, h, mime } */
async function compressImage(file){
  var mime = await detectEncoder();
  var isAnimated = /gif/i.test(file.type);

  // Small files (typically pixel art / sprites) are stored byte-for-byte.
  // Re-encoding them would only add artifacts and rarely saves anything.
  if (file.size <= PASSTHRU_BYTES || isAnimated) {
    var dims = { w:0, h:0 };
    try { var b0 = await loadBitmap(file); dims.w = b0.width||b0.naturalWidth; dims.h = b0.height||b0.naturalHeight; if(b0.close) b0.close(); } catch(e){}
    return { full:file, thumb:null, w:dims.w, h:dims.h, mime:file.type||'image/png', passthrough:true };
  }

  var bmp = await loadBitmap(file);
  var big = drawScaled(bmp, MAX_EDGE);
  var full = await canvasToBlob(big.canvas, mime, Q_FULL);

  // Safety net: never make a file bigger than it started.
  var passthrough = false;
  if (!full || full.size >= file.size) { full = file; passthrough = true; }

  var thumb = null;
  if (Math.max(big.w, big.h) > THUMB_EDGE * 1.4) {
    var small = drawScaled(bmp, THUMB_EDGE);
    thumb = await canvasToBlob(small.canvas, mime, Q_THUMB);
  }
  if (bmp.close) bmp.close();

  return { full:full, thumb:thumb, w:big.w, h:big.h, mime:passthrough ? (file.type||mime) : mime, passthrough:passthrough };
}

async function sha256Hex(blob){
  try {
    var buf = await blob.arrayBuffer();
    var d = await crypto.subtle.digest('SHA-256', buf);
    var a = Array.prototype.map.call(new Uint8Array(d), function(x){ return ('0'+x.toString(16)).slice(-2); });
    return a.join('').slice(0, 40);
  } catch(e){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
}

function publicUrl(path){
  try { return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; }
  catch(e){ return null; }
}

/* Content-addressed upload: identical bytes are stored once and reused across
   every story, so re-saving an unchanged image costs nothing. */
async function uploadBlob(blob, folder, mime){
  if (!sb) throw new Error('No Supabase client');
  var hash = await sha256Hex(blob);
  var path = folder + '/' + hash + '.' + extFor(mime || blob.type);
  var res = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType: mime || blob.type || 'application/octet-stream',
    cacheControl: '31536000',
    upsert: false
  });
  if (res.error) {
    var msg = String(res.error.message || res.error);
    // "already exists" means the identical file is on the CDN. That is a hit.
    if (!/exist|duplicate|409/i.test(msg)) throw res.error;
  }
  return publicUrl(path);
}

async function mapLimit(arr, limit, fn){
  var i = 0, out = new Array(arr.length);
  async function worker(){ while(i < arr.length){ var k = i++; out[k] = await fn(arr[k], k); } }
  var ws = []; for (var j = 0; j < Math.min(limit, arr.length); j++) ws.push(worker());
  await Promise.all(ws);
  return out;
}

/* ==========================================================================
   DOM REFS
   ========================================================================== */
var customImg=null, customName='', imgSeq=0, toastTimer=null;
var selectedLine = -1;

var stageEl=$('#stage'), bgCanvasEl=$('#bgCanvas'), bctx=bgCanvasEl.getContext('2d'), statusBar=$('#statusBar');
var progressEl=$('#progress');
var lightFx=$('#lightFx'), scanFx=$('#scanFx');
var picWindow=$('#picWindow'), storyPic=$('#storyPic'), dialogText=$('#dialogText'), cursorEl=$('#cursor');
var sceneUI=$('#sceneUI'), dialogWrap=$('#dialogWrap');
var endCard=$('#endCard'), playBtn=$('#playBtn'), titleCard=$('#titleCard'), titleText=$('#titleText'), titleSub=$('#titleSub');
var dialoguePanel=$('#dialoguePanel');
var dlgFrameA=$('#dlgFrameA'), dlgPortA=$('#dlgPortA'), dlgNameA=$('#dlgNameA'), dlgTextA=$('#dlgTextA');
var dlgFrameB=$('#dlgFrameB'), dlgPortB=$('#dlgPortB'), dlgNameB=$('#dlgNameB'), dlgTextB=$('#dlgTextB');
var interactivePanel=$('#interactivePanel'), interactiveImg=$('#interactiveImg'), interactiveImgWrap=$('#interactiveImgWrap'), interactiveButtons=$('#interactiveButtons');
var transOverlay=$('#transOverlay'), transFade=$('#transFade'), transSlide=$('#transSlide'), transIris=$('#transIris');
var lineList=$('#lineList'), imgGrid=$('#imgGrid'), bgGrid=$('#bgGrid'), editorEl=$('#editor');

/* preload:none means a 9MB track starts playing in under a second instead of
   downloading in full first. The browser streams it. */
var audio=new Audio(); audio.loop=true; audio.preload='none';
bctx.imageSmoothingEnabled=false;
var tmpCvs=document.createElement('canvas'); tmpCvs.width=128; tmpCvs.height=72; var tctx=tmpCvs.getContext('2d');

function toast(msg){ var el=$('#toast'); el.textContent=msg; el.style.display='block'; clearTimeout(toastTimer); toastTimer=setTimeout(function(){ el.style.display='none'; },3000); }
function setProgress(msg){ if(!progressEl)return; progressEl.textContent=msg||''; progressEl.style.display=msg?'inline':'none'; }
function fmtBytes(n){ if(!n)return '0B'; var u=['B','KB','MB']; var i=Math.min(u.length-1,Math.floor(Math.log(n)/Math.log(1024))); return (n/Math.pow(1024,i)).toFixed(i?1:0)+u[i]; }

/* ==========================================================================
   RENDER LOOP
   Was: redraw 60x/sec forever, even on a static image, even in a hidden tab.
   Now: procedural scenes run at 30fps, static images draw once, and everything
   stops when the tab is in the background.
   ========================================================================== */
var bgDirty = true, lastDraw = 0, FRAME_MS = 1000/30, showOver = false;
function markBgDirty(){ bgDirty = true; }

function frame(ts){
  requestAnimationFrame(frame);
  if (document.hidden || showOver) return;
  var isStatic = !!customImg;
  if (isStatic && !bgDirty) return;
  if (!isStatic && ts - lastDraw < FRAME_MS) return;
  lastDraw = ts;
  var t = ts/1000;
  try {
    if (customImg) {
      if (state.pixelate) {
        tctx.imageSmoothingEnabled=false; tctx.clearRect(0,0,128,72); tctx.drawImage(customImg,0,0,128,72);
        bctx.imageSmoothingEnabled=false; bctx.drawImage(tmpCvs,0,0,W,H);
      } else {
        bctx.imageSmoothingEnabled=true; bctx.drawImage(customImg,0,0,W,H);
      }
      bgDirty = false;
    } else {
      bctx.imageSmoothingEnabled=false; BG[state.bg].draw(bctx,t);
    }
  } catch(e){}
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange', function(){ if(!document.hidden) markBgDirty(); });

/* ==========================================================================
   TRANSITIONS
   ========================================================================== */
var transBusy=false;
function clearTrans(){ transOverlay.className=''; transFade.style.opacity='0'; transSlide.style.transform='translateX(-100%)'; transIris.style.clipPath='circle(0% at 50% 50%)'; }
function runTrans(type,dir,midCb,doneCb){
  if(transBusy){if(doneCb)doneCb();return;}
  if(type==='none'){if(doneCb)doneCb();return;}
  transBusy=true;
  var dur=type==='slide'?700:type==='iris'?900:800;
  if(dir==='out'){
    clearTrans(); void transOverlay.offsetWidth;
    transOverlay.classList.add('trans-'+type+'-out');
    if(midCb)setTimeout(midCb,Math.floor(dur*0.5));
    setTimeout(function(){transBusy=false;if(doneCb)doneCb();},dur);
  } else {
    transFade.style.transition='none'; transSlide.style.transition='none'; transIris.style.transition='none';
    clearTrans();
    if(type==='fade')transFade.style.opacity='1';
    else if(type==='slide')transSlide.style.transform='translateX(0)';
    else if(type==='iris')transIris.style.clipPath='circle(0% at 50% 50%)';
    void transOverlay.offsetWidth;
    transFade.style.transition=''; transSlide.style.transition=''; transIris.style.transition='';
    transOverlay.classList.add('trans-'+type+'-in');
    setTimeout(function(){clearTrans();transBusy=false;if(doneCb)doneCb();},dur);
  }
}

/* ==========================================================================
   BACKGROUND PICKER
   Thumbnails only animate when the picker is actually on screen.
   ========================================================================== */
var thumbJobs=[], bgGridVisible=true, thumbTimer=null;
(function(){
  if(VIEWER)return;
  for(var key in BG){
    (function(k){
      var b=document.createElement('button'); b.className='bgCard'; b.dataset.bg=k; b.type='button';
      var cv=document.createElement('canvas'); cv.width=96; cv.height=54;
      var sp=document.createElement('span'); sp.textContent=BG[k].name;
      b.appendChild(cv); b.appendChild(sp); bgGrid.appendChild(b);
      var tc=cv.getContext('2d'); tc.imageSmoothingEnabled=false; tc.scale(96/W,54/H);
      thumbJobs.push({c:tc,key:k});
      b.addEventListener('click',function(){ state.bg=k; setCustomBg(null); updateBgUI(); });
    })(key);
  }
  if (window.IntersectionObserver) {
    new IntersectionObserver(function(en){ bgGridVisible = en[0].isIntersecting; })
      .observe(bgGrid);
  }
  thumbTimer=setInterval(function(){
    if(document.hidden||!bgGridVisible)return;
    if(document.body.classList.contains('playing'))return;
    try{var t=performance.now()/1000;for(var i=0;i<thumbJobs.length;i++)BG[thumbJobs[i].key].draw(thumbJobs[i].c,t);}catch(e){}
  },200);
})();

function updateBgUI(){
  var cards=document.querySelectorAll('.bgCard');
  for(var i=0;i<cards.length;i++)cards[i].classList.toggle('sel',!customImg&&cards[i].dataset.bg===state.bg);
  $('#bgClearBtn').style.display=customImg?'inline-block':'none';
  markBgDirty(); refreshStatus();
}

/* Custom backgrounds now live in the image library, which means they get
   uploaded and saved like everything else instead of vanishing on reload. */
function setCustomBg(imgId){
  state.customBg = imgId || null;
  if(!imgId){ customImg=null; customName=''; markBgDirty(); return; }
  var rec = imgById(imgId);
  if(!rec){ state.customBg=null; customImg=null; return; }
  var nm=new Image();
  nm.crossOrigin='anonymous';
  nm.onload=function(){ customImg=nm; customName=rec.name; markBgDirty(); updateBgUI(); };
  nm.onerror=function(){
    // Retry without CORS in case the host does not send the header.
    var f=new Image();
    f.onload=function(){ customImg=f; customName=rec.name; markBgDirty(); updateBgUI(); };
    f.onerror=function(){ toast('THAT BACKGROUND IMAGE WOULD NOT LOAD'); };
    f.src=rec.url;
  };
  nm.src=rec.url;
}

$('#bgUploadBtn').addEventListener('click',function(){$('#bgFileInput').click();});
$('#bgFileInput').addEventListener('change',async function(e){
  var f=e.target.files[0]; e.target.value='';
  if(!f)return;
  var rec = await addImageFile(f);
  if(rec) setCustomBg(rec.id);
});
$('#bgClearBtn').addEventListener('click',function(){ setCustomBg(null); updateBgUI(); });
$('#pixelChk').addEventListener('change',function(e){state.pixelate=e.target.checked;markBgDirty();});

/* ==========================================================================
   IMAGE LIBRARY
   ========================================================================== */
var imgIndex = new Map();
function reindexImages(){ imgIndex.clear(); for(var i=0;i<state.images.length;i++) imgIndex.set(state.images[i].id, state.images[i]); }
function imgById(id){ return id ? (imgIndex.get(id)||null) : null; }
function getImgUrl(id){ var r=imgById(id); return r?r.url:''; }
function getThumbUrl(id){ var r=imgById(id); return r?(r.thumbUrl||r.url):''; }

function dataUrlToBlob(u){
  var parts=u.split(','), m=/data:([^;]+)/.exec(parts[0]);
  var mime=m?m[1]:'image/png';
  var bin=atob(parts[1]), len=bin.length, arr=new Uint8Array(len);
  for(var i=0;i<len;i++)arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:mime});
}

async function addImageFile(f){
  if(!/^image\//.test(f.type||'')&&!/\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name)){ toast('NOT AN IMAGE: '+f.name); return null; }
  var out;
  try { out = await compressImage(f); }
  catch(e){ toast('COULD NOT READ '+f.name); return null; }
  imgSeq++;
  var rec = {
    id:'p'+imgSeq,
    name:(f.name.replace(/\.[^.]+$/,'').slice(0,12)||'PIC')+' '+imgSeq,
    url: URL.createObjectURL(out.full),
    thumbUrl: out.thumb ? URL.createObjectURL(out.thumb) : null,
    fullBlob: out.full, thumbBlob: out.thumb,
    w: out.w, h: out.h, bytes: out.full.size, origBytes: f.size,
    remote: null, uploading: false, local: true
  };
  state.images.push(rec); reindexImages();
  return rec;
}

function revokeRec(rec){
  if(!rec)return;
  if(rec.local){ try{ if(rec.url&&rec.url.indexOf('blob:')===0)URL.revokeObjectURL(rec.url); }catch(e){}
                 try{ if(rec.thumbUrl&&rec.thumbUrl.indexOf('blob:')===0)URL.revokeObjectURL(rec.thumbUrl); }catch(e){} }
}

/* Upload happens the moment a file is picked, not at save time. By the time
   the user clicks SAVE CLOUD the assets are already on the CDN and the save
   is just a small JSON row. */
async function ensureUploaded(rec){
  if(!sb || !isLoggedIn) return false;
  if(rec.remote) return true;
  if(rec.uploading) return false;
  rec.uploading = true;
  try {
    var fullBlob = rec.fullBlob;
    if(!fullBlob && rec.url && rec.url.indexOf('data:')===0) fullBlob = dataUrlToBlob(rec.url);
    if(!fullBlob) { rec.uploading=false; return false; }

    var fullUrl = await uploadBlob(fullBlob, 'assets', fullBlob.type);
    var thumbUrl = null;
    if(rec.thumbBlob) thumbUrl = await uploadBlob(rec.thumbBlob, 'assets', rec.thumbBlob.type);

    var oldUrl = rec.url, oldThumb = rec.thumbUrl, wasLocal = rec.local;
    rec.remote = { url:fullUrl, thumb:thumbUrl };
    rec.url = fullUrl; rec.thumbUrl = thumbUrl || fullUrl;
    rec.local = false; rec.fullBlob = null; rec.thumbBlob = null;
    if(wasLocal){
      try{ if(oldUrl&&oldUrl.indexOf('blob:')===0)URL.revokeObjectURL(oldUrl); }catch(e){}
      try{ if(oldThumb&&oldThumb.indexOf('blob:')===0)URL.revokeObjectURL(oldThumb); }catch(e){}
    }
    rec.uploading = false;
    return true;
  } catch(e){
    rec.uploading = false;
    console.warn('upload failed', e);
    return false;
  }
}

async function uploadPending(){
  if(!sb||!isLoggedIn) return;
  var pend = state.images.filter(function(r){ return !r.remote; });
  if(!pend.length && !(state.music && state.music.file)) return;
  var done = 0, total = pend.length + ((state.music&&state.music.file)?1:0);
  setProgress('UPLOADING 0/'+total);
  await mapLimit(pend, UPLOAD_LIMIT, async function(rec){
    await ensureUploaded(rec);
    done++; setProgress('UPLOADING '+done+'/'+total);
  });
  if(state.music && state.music.file){
    try {
      state.music.url = await uploadBlob(state.music.file, 'audio', state.music.file.type||'audio/mpeg');
      state.music.file = null;
      done++; setProgress('UPLOADING '+done+'/'+total);
    } catch(e){ console.warn('music upload failed', e); }
  }
  setProgress('');
  renderImages(); renderLines();
}

function renderImages(){
  if(VIEWER)return;
  imgGrid.innerHTML='';
  var frag=document.createDocumentFragment();
  for(var i=0;i<state.images.length;i++){
    var im=state.images[i];
    var d=document.createElement('div');
    d.className='thumb'; d.dataset.id=im.id;
    var saved = im.remote ? '<span class="tsaved" title="Stored in the cloud">&#9679;</span>' : '';
    d.innerHTML='<img src="'+esc(im.thumbUrl||im.url)+'" alt="" loading="lazy" decoding="async">'+
                '<div class="tname">'+saved+esc(im.name)+'</div>'+
                '<div class="tsize">'+fmtBytes(im.bytes||0)+'</div>'+
                '<div class="tbtns"><button data-k="use" type="button">BG</button><button class="del" data-k="del" type="button">X</button></div>';
    frag.appendChild(d);
  }
  imgGrid.appendChild(frag);
}

imgGrid.addEventListener('click',function(e){
  var b=e.target.closest('button'); if(!b)return;
  var d=b.closest('.thumb'); if(!d)return;
  var id=d.dataset.id, im=imgById(id); if(!im)return;
  if(b.dataset.k==='use'){ setCustomBg(id); updateBgUI(); }
  else {
    if(state.customBg===id) setCustomBg(null);
    state.images=state.images.filter(function(o){ return o.id!==id; });
    revokeRec(im); reindexImages();
    for(var j=0;j<state.lines.length;j++){
      var L=state.lines[j];
      if(L.img===id)L.img=null;
      if(L.type==='dialogue'){ if(L.charA.img===id)L.charA.img=null; if(L.charB.img===id)L.charB.img=null; }
    }
    renderImages(); renderLines();
  }
});

$('#imgUploadBtn').addEventListener('click',function(){$('#imgFileInput').click();});
$('#imgFileInput').addEventListener('change',async function(e){
  var files=Array.prototype.slice.call(e.target.files); e.target.value='';
  if(!files.length)return;
  var savedBytes=0, origBytes=0;
  setProgress('COMPRESSING 0/'+files.length);
  for(var i=0;i<files.length;i++){
    var rec=await addImageFile(files[i]);
    if(rec){ origBytes+=rec.origBytes; savedBytes+=rec.bytes; }
    setProgress('COMPRESSING '+(i+1)+'/'+files.length);
  }
  setProgress('');
  renderImages(); renderLines();
  if(origBytes>0){
    var pct=Math.round((1-savedBytes/origBytes)*100);
    toast(pct>3 ? ('COMPRESSED '+fmtBytes(origBytes)+' \u2192 '+fmtBytes(savedBytes)+' ('+pct+'% SMALLER)')
                : ('ADDED '+files.length+' IMAGE'+(files.length>1?'S':'')));
  }
  uploadPending();
});

/* ==========================================================================
   EDITOR
   ========================================================================== */
function refreshStatus(){
  if(VIEWER)return;
  var el=$('#statusText'); if(!el)return;
  el.textContent='BG: '+(customImg?'CUSTOM':BG[state.bg].name)+' | FX: '+state.lighting.toUpperCase()+' | '+state.lines.length+' ITEMS';
}

/* These three used to be rebuilt inside the per-line loop, which made a long
   story O(lines x images) and O(lines^2). Now they are built once per render
   and each select just has its .value assigned afterwards. */
var OPT_PIC='', OPT_TRANS='', OPT_TARGET='';
function buildOptionCaches(){
  var o='<option value="">- NONE -</option>', i;
  for(i=0;i<state.images.length;i++) o+='<option value="'+esc(state.images[i].id)+'">'+esc(state.images[i].name)+'</option>';
  OPT_PIC=o;
  o=''; for(i=0;i<TRANS.length;i++) o+='<option value="'+TRANS[i]+'">'+TLABEL[TRANS[i]]+'</option>';
  OPT_TRANS=o;
  o='<option value="">- SELECT -</option>';
  for(i=0;i<state.lines.length;i++) o+='<option value="'+i+'">'+lineLabel(i)+'</option>';
  OPT_TARGET=o;
}

function lineLabel(idx){
  var L=state.lines[idx];
  if(!L)return'L'+idx;
  var name='';
  if(L.slideTitle&&L.slideTitle.trim()) name=L.slideTitle.trim();
  else {
    if(L.type==='title')name=L.text||'TITLE';
    else if(L.type==='text')name=(L.text||'').substring(0,25);
    else if(L.type==='dialogue')name='DIALOGUE';
    else if(L.type==='interactive')name='INTERACTIVE';
  }
  return'['+idx+'] '+esc(name)+(L.hidden?' (HIDDEN)':'');
}

function lineHTML(L,i){
  var iT=L.type==='title', iD=L.type==='dialogue', iI=L.type==='interactive';
  var tc=iT?'t-title':(iD?'t-dialogue':(iI?'t-interactive':'t-text'));
  var tl=iT?'TITLE':(iD?'DIALOGUE':(iI?'INTERACTIVE':'TEXT'));
  var ts='<select data-k="trans">'+OPT_TRANS+'</select>';
  var badges='';
  if(L.hidden)badges+='<span style="font-size:6px;color:#ff5d7d;border:1px solid #ff5d7d;padding:1px 3px">HIDDEN</span>';
  if(L.autoJump)badges+='<span style="font-size:6px;color:#7dee6a;border:1px solid #7dee6a;padding:1px 3px">AUTO</span>';
  var metaRow='<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">';
  metaRow+='<input type="text" data-k="slideTitle" value="'+esc(L.slideTitle||'')+'" placeholder="SLIDE TITLE" style="flex:1;max-width:140px">';
  metaRow+='<label class="chk" style="font-size:6px"><input type="checkbox" data-k="hidden" '+(L.hidden?'checked':'')+'> HIDDEN</label>';
  metaRow+='<label class="chk" style="font-size:6px"><input type="checkbox" data-k="autoJump" '+(L.autoJump?'checked':'')+'> AUTO-JUMP</label>';
  if(L.autoJump) metaRow+='<select data-k="autoJumpTarget" style="font-size:6px">'+OPT_TARGET+'</select>';
  metaRow+='</div>';
  var h='<div class="line-top"><span class="lnum">'+String(i+1).padStart(2,'0')+'</span><span class="lid">ID:'+i+'</span><span class="ltype '+tc+'">'+tl+'</span>'+badges;
  if(iI){
    var hsList='',hi;
    for(hi=0;hi<(L.hotspots||[]).length;hi++){
      var hs=L.hotspots[hi];
      hsList+='<div class="int-hotspot-item"><span class="hs-color" style="background:'+esc(hs.color||'#ffcc33')+'"></span><span class="hs-name">'+esc(hs.label||'')+'</span><span class="hs-target">&rarr; L'+hs.target+'</span><button data-hs-edit="'+hi+'" type="button">EDIT</button><button class="del" data-hs-del="'+hi+'" type="button">X</button></div>';
    }
    var bnList='',bi;
    for(bi=0;bi<(L.buttons||[]).length;bi++){
      var bn=L.buttons[bi];
      bnList+='<div class="int-btn-item"><span class="bn-name">'+esc(bn.label||'')+'</span><span class="bn-target">&rarr; L'+bn.target+'</span><button data-bn-edit="'+bi+'" type="button">EDIT</button><button class="del" data-bn-del="'+bi+'" type="button">X</button></div>';
    }
    var imgUrl=L.img?getImgUrl(L.img):'';
    var drawContent=imgUrl?'<img src="'+esc(imgUrl)+'" alt="" loading="lazy" decoding="async">':'<div class="no-img">SELECT AN IMAGE FIRST, THEN DRAW HOTSPOTS HERE</div>';
    h+='<span class="spacer"></span>'+ts+'<button class="ibtn" data-k="up" type="button">&#9650;</button><button class="ibtn" data-k="down" type="button">&#9660;</button><button class="ibtn del" data-k="del" type="button">&#10005;</button></div>';
    h+=metaRow;
    h+='<div class="int-fields"><h3>SCENE IMAGE</h3><select data-k="img" style="width:100%;margin-bottom:6px">'+OPT_PIC+'</select>';
    h+='<h3>DRAW HOTSPOTS ON IMAGE (CLICK+DRAG)</h3><div class="int-draw-area" data-line-idx="'+i+'">'+drawContent+'</div>';
    h+='<h3>HOTSPOTS ('+((L.hotspots||[]).length)+')</h3><div class="int-btn-list">'+hsList+'</div>';
    h+='<h3 style="margin-top:8px">BUTTONS</h3><button class="btn mini orange" data-add-btn="'+i+'" type="button" style="margin-bottom:6px">+ ADD BUTTON</button><div class="int-btn-list">'+bnList+'</div></div>';
  } else if(iD){
    h+='<span class="spacer"></span>'+ts+'<button class="ibtn" data-k="up" type="button">&#9650;</button><button class="ibtn" data-k="down" type="button">&#9660;</button><button class="ibtn del" data-k="del" type="button">&#10005;</button></div>';
    h+=metaRow;
    h+='<div class="dlg-fields"><div class="dlg-field"><label>CHAR A</label><input type="color" value="'+esc(L.charA.color||'#ffffff')+'" data-k="colorA"><input type="text" data-k="nameA" value="'+esc(L.charA.name||'')+'" placeholder="NAME" style="width:80px"><select data-k="imgA">'+OPT_PIC+'</select></div>';
    h+='<textarea rows="1" data-k="textA" placeholder="CHAR A...">'+esc(L.charA.text||'')+'</textarea>';
    h+='<div class="dlg-field"><label>CHAR B</label><input type="color" value="'+esc(L.charB.color||'#ffffff')+'" data-k="colorB"><input type="text" data-k="nameB" value="'+esc(L.charB.name||'')+'" placeholder="NAME" style="width:80px"><select data-k="imgB">'+OPT_PIC+'</select></div>';
    h+='<textarea rows="1" data-k="textB" placeholder="CHAR B...">'+esc(L.charB.text||'')+'</textarea></div>';
  } else if(iT){
    h+='<input type="color" value="'+esc(L.color||'#ffcc33')+'" data-k="color">'+ts+'<span class="spacer"></span><button class="ibtn" data-k="up" type="button">&#9650;</button><button class="ibtn" data-k="down" type="button">&#9660;</button><button class="ibtn del" data-k="del" type="button">&#10005;</button></div>';
    h+=metaRow;
    h+='<textarea rows="1" placeholder="TITLE...">'+esc(L.text||'')+'</textarea>';
    h+='<textarea rows="1" data-k="sub" placeholder="SUBTITLE" style="margin-top:4px;min-height:28px">'+esc(L.sub||'')+'</textarea>';
  } else {
    h+='<input type="color" value="'+esc(L.color||'#ffffff')+'" data-k="color">'+ts+'<select data-k="pic">'+OPT_PIC+'</select><span class="spacer"></span><button class="ibtn" data-k="up" type="button">&#9650;</button><button class="ibtn" data-k="down" type="button">&#9660;</button><button class="ibtn del" data-k="del" type="button">&#10005;</button></div>';
    h+=metaRow;
    h+='<textarea rows="2" placeholder="TYPE SENTENCE...">'+esc(L.text||'')+'</textarea>';
  }
  return h;
}

/* Selects get their value assigned here rather than via a per-line
   selected="" attribute, which is what made rendering quadratic. */
function applySelects(node,L,i){
  var s;
  s=node.querySelector('[data-k="trans"]'); if(s)s.value=L.trans||'none';
  s=node.querySelector('[data-k="pic"]');   if(s)s.value=L.img||'';
  s=node.querySelector('[data-k="img"]');   if(s)s.value=L.img||'';
  s=node.querySelector('[data-k="imgA"]');  if(s&&L.charA)s.value=L.charA.img||'';
  s=node.querySelector('[data-k="imgB"]');  if(s&&L.charB)s.value=L.charB.img||'';
  s=node.querySelector('[data-k="autoJumpTarget"]');
  if(s){
    var self=s.querySelector('option[value="'+i+'"]'); if(self)self.remove();
    s.value=(L.autoJumpTarget===null||L.autoJumpTarget===undefined)?'':String(L.autoJumpTarget);
  }
}

function makeLineNode(L,i){
  var iT=L.type==='title', iD=L.type==='dialogue', iI=L.type==='interactive';
  var d=document.createElement('div');
  d.className='line'+(iT?' title-type':iD?' dialogue-type':iI?' interactive-type':'')+(i===selectedLine?' selected':'')+(L.hidden?' line-hidden':'');
  d.dataset.i=i;
  d.innerHTML=lineHTML(L,i);
  applySelects(d,L,i);
  return d;
}

function renderLines(){
  if(VIEWER)return;
  var scroll=editorEl?editorEl.scrollTop:0;
  buildOptionCaches();
  var frag=document.createDocumentFragment();
  for(var i=0;i<state.lines.length;i++) frag.appendChild(makeLineNode(state.lines[i],i));
  lineList.innerHTML='';
  lineList.appendChild(frag);
  if(editorEl)editorEl.scrollTop=scroll;
}

/* Rebuild a single row. Used for checkbox toggles so typing focus and scroll
   position in the rest of the editor survive. */
function renderLine(i){
  var old=lineList.querySelector('.line[data-i="'+i+'"]');
  if(!old){renderLines();return;}
  var node=makeLineNode(state.lines[i],i);
  old.replaceWith(node);
}

function previewLine(idx){
  if(idx<0||idx>=state.lines.length)return;
  selectedLine=idx;
  var lines=lineList.querySelectorAll('.line');
  for(var i=0;i<lines.length;i++)lines[i].classList.toggle('selected',+lines[i].dataset.i===idx);
  var L=state.lines[idx];
  hideAll();
  if(L.type==='dialogue'){
    sceneUI.style.display='none';
    var uA=getThumbUrl(L.charA.img);
    if(uA){dlgPortA.src=uA;dlgPortA.style.display='block';dlgFrameA.classList.remove('empty');}
    else{dlgPortA.removeAttribute('src');dlgPortA.style.display='none';dlgFrameA.classList.add('empty');}
    dlgNameA.textContent=L.charA.name||'';dlgNameA.style.color=L.charA.color||'#fff';
    dlgTextA.style.color=L.charA.color||'#fff';dlgTextA.textContent=L.charA.text||'';
    var uB=getThumbUrl(L.charB.img);
    if(uB){dlgPortB.src=uB;dlgPortB.style.display='block';dlgFrameB.classList.remove('empty');}
    else{dlgPortB.removeAttribute('src');dlgPortB.style.display='none';dlgFrameB.classList.add('empty');}
    dlgNameB.textContent=L.charB.name||'';dlgNameB.style.color=L.charB.color||'#fff';
    dlgTextB.style.color=L.charB.color||'#fff';dlgTextB.textContent=L.charB.text||'';
    dialoguePanel.classList.add('show');
  } else if(L.type==='title'){
    sceneUI.style.display='none';
    titleText.textContent=L.text;titleText.style.color=L.color||'#fff';
    titleSub.textContent=L.sub||'';titleSub.style.color=L.color||'#fff';
    titleCard.classList.add('show');
  } else if(L.type==='interactive'){
    sceneUI.style.display='none';
    setupInteractive(L,false);
  } else {
    var im=getImgUrl(L.img);
    if(im){storyPic.src=im;picWindow.classList.add('show');}
    dialogText.style.color=L.color||'#fff';
    dialogText.textContent=L.text||'';
  }
}

/* ==========================================================================
   HOTSPOT DRAWING
   Move/up listeners are attached only while a drag is in progress.
   ========================================================================== */
var drawState=null, hsEditState=null, bnEditState=null;

function onDrawMove(e){
  if(!drawState)return;
  var r=drawState.area.getBoundingClientRect();
  var x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
  var y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
  drawState.rect.style.left=Math.min(drawState.startX,x)+'%';
  drawState.rect.style.top=Math.min(drawState.startY,y)+'%';
  drawState.rect.style.width=Math.abs(x-drawState.startX)+'%';
  drawState.rect.style.height=Math.abs(y-drawState.startY)+'%';
}
function onDrawUp(e){
  if(!drawState)return;
  document.removeEventListener('mousemove',onDrawMove);
  document.removeEventListener('mouseup',onDrawUp);
  var r=drawState.area.getBoundingClientRect();
  var x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
  var y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
  var lx=Math.min(drawState.startX,x), ly=Math.min(drawState.startY,y);
  var w=Math.abs(x-drawState.startX), h=Math.abs(y-drawState.startY);
  var rect=drawState.rect, li=drawState.lineIdx;
  if(rect&&rect.parentNode)rect.parentNode.removeChild(rect);
  drawState=null;
  if(w>2&&h>2) openHotspotModal(li,{x:lx,y:ly,w:w,h:h,label:'',color:'#ffcc33',target:''},-1);
}
lineList.addEventListener('mousedown',function(e){
  var area=e.target.closest('.int-draw-area');
  if(!area)return;
  if(e.target.closest('button')||e.target.tagName==='SELECT'||e.target.closest('.no-img'))return;
  if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT')return;
  var r=area.getBoundingClientRect();
  var x=(e.clientX-r.left)/r.width*100, y=(e.clientY-r.top)/r.height*100;
  var rect=document.createElement('div');
  rect.className='int-draw-rect';
  rect.style.left=x+'%';rect.style.top=y+'%';rect.style.width='0';rect.style.height='0';
  area.appendChild(rect);
  drawState={area:area,lineIdx:+area.dataset.lineIdx,rect:rect,startX:x,startY:y};
  document.addEventListener('mousemove',onDrawMove);
  document.addEventListener('mouseup',onDrawUp);
  e.preventDefault();
});

function openHotspotModal(lineIdx,hs,editIdx){
  hsEditState={lineIdx:lineIdx,hs:{x:hs.x,y:hs.y,w:hs.w,h:hs.h},editIdx:editIdx};
  $('#hsModalTitle').textContent=editIdx>=0?'EDIT HOTSPOT':'NEW HOTSPOT';
  $('#hsLabel').value=hs.label||'';
  $('#hsColor').value=hs.color||'#ffcc33';
  buildOptionCaches();
  var sel=$('#hsTarget'); sel.innerHTML=OPT_TARGET;
  var self=sel.querySelector('option[value="'+lineIdx+'"]'); if(self)self.remove();
  sel.value=(hs.target===''||hs.target===undefined||hs.target===null)?'':String(hs.target);
  $('#hotspotModal').classList.add('show');
  setTimeout(function(){$('#hsLabel').focus();},100);
}
$('#hsCancel').addEventListener('click',function(){$('#hotspotModal').classList.remove('show');hsEditState=null;});
$('#hsSave').addEventListener('click',function(){
  if(!hsEditState)return;
  var L=state.lines[hsEditState.lineIdx];if(!L)return;
  var t=$('#hsTarget').value;
  if(t===''){toast('SELECT A TARGET LINE');return;}
  var newHs={x:hsEditState.hs.x,y:hsEditState.hs.y,w:hsEditState.hs.w,h:hsEditState.hs.h,label:$('#hsLabel').value.trim()||'HOTSPOT',color:$('#hsColor').value,target:+t};
  if(!L.hotspots)L.hotspots=[];
  if(hsEditState.editIdx>=0)L.hotspots[hsEditState.editIdx]=newHs;
  else L.hotspots.push(newHs);
  $('#hotspotModal').classList.remove('show');
  var savedIdx=hsEditState.lineIdx; hsEditState=null;
  renderLine(savedIdx);
  if(selectedLine===savedIdx)previewLine(savedIdx);
  toast('HOTSPOT SAVED');
});

function openBtnModal(lineIdx,btn,editIdx){
  bnEditState={lineIdx:lineIdx,editIdx:editIdx};
  $('#btnModalTitle').textContent=editIdx>=0?'EDIT BUTTON':'ADD BUTTON';
  $('#bnLabel').value=btn.label||'';
  $('#bnColor').value=btn.color||'#ffcc33';
  buildOptionCaches();
  var sel=$('#bnTarget'); sel.innerHTML=OPT_TARGET;
  var self=sel.querySelector('option[value="'+lineIdx+'"]'); if(self)self.remove();
  sel.value=(btn.target===''||btn.target===undefined||btn.target===null)?'':String(btn.target);
  $('#btnModal').classList.add('show');
  setTimeout(function(){$('#bnLabel').focus();},100);
}
$('#bnCancel').addEventListener('click',function(){$('#btnModal').classList.remove('show');bnEditState=null;});
$('#bnSave').addEventListener('click',function(){
  if(!bnEditState)return;
  var L=state.lines[bnEditState.lineIdx];if(!L)return;
  var t=$('#bnTarget').value;
  if(t===''){toast('SELECT A TARGET LINE');return;}
  var newBn={label:$('#bnLabel').value.trim()||'BUTTON',color:$('#bnColor').value,target:+t};
  if(!L.buttons)L.buttons=[];
  if(bnEditState.editIdx>=0)L.buttons[bnEditState.editIdx]=newBn;
  else L.buttons.push(newBn);
  $('#btnModal').classList.remove('show');
  var li=bnEditState.lineIdx; bnEditState=null;
  renderLine(li); refreshStatus();
});

/* ---- one delegated click handler instead of two ---- */
lineList.addEventListener('click',function(e){
  var b=e.target.closest('button');
  var d=e.target.closest('.line'); if(!d)return;
  var i=+d.dataset.i;
  if(b){
    var k=b.dataset.k;
    if(k==='del'){
      state.lines.splice(i,1);
      if(!state.lines.length)state.lines.push({type:'text',text:'',color:'#ffffff',img:null,trans:'none',hidden:false,autoJump:false,autoJumpTarget:null,slideTitle:''});
      selectedLine=-1; renderLines(); refreshStatus(); markDirty();
    }
    else if(k==='up'||k==='down'){
      var j=i+(k==='up'?-1:1); if(j<0||j>=state.lines.length)return;
      var t=state.lines[i]; state.lines[i]=state.lines[j]; state.lines[j]=t;
      renderLines(); refreshStatus(); markDirty();
    }
    else if(b.dataset.hsEdit!==undefined){ var L=state.lines[i]; if(L&&L.hotspots)openHotspotModal(i,L.hotspots[+b.dataset.hsEdit],+b.dataset.hsEdit); }
    else if(b.dataset.hsDel!==undefined){ var L2=state.lines[i]; if(L2&&L2.hotspots){L2.hotspots.splice(+b.dataset.hsDel,1);renderLine(i);if(selectedLine===i)previewLine(i);markDirty();} }
    else if(b.dataset.bnEdit!==undefined){ var L3=state.lines[i]; if(L3&&L3.buttons)openBtnModal(i,L3.buttons[+b.dataset.bnEdit],+b.dataset.bnEdit); }
    else if(b.dataset.bnDel!==undefined){ var L4=state.lines[i]; if(L4&&L4.buttons){L4.buttons.splice(+b.dataset.bnDel,1);renderLine(i);markDirty();} }
    else if(b.dataset.addBtn!==undefined){ openBtnModal(+b.dataset.addBtn,{label:'',color:'#ffcc33',target:''},-1); }
    return;
  }
  if(e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'||e.target.closest('.int-draw-area')||e.target.closest('.chk'))return;
  previewLine(i);
});

lineList.addEventListener('input',function(e){
  var d=e.target.closest('.line'); if(!d)return;
  var L=state.lines[+d.dataset.i]; if(!L)return;
  var k=e.target.dataset.k;
  if(k==='sub')L.sub=e.target.value;
  else if(k==='textA')L.charA.text=e.target.value;
  else if(k==='textB')L.charB.text=e.target.value;
  else if(k==='nameA')L.charA.name=e.target.value;
  else if(k==='nameB')L.charB.name=e.target.value;
  else if(k==='slideTitle')L.slideTitle=e.target.value;
  else if(!k&&e.target.tagName==='TEXTAREA')L.text=e.target.value;
  markDirty();
});
lineList.addEventListener('change',function(e){
  var d=e.target.closest('.line'); if(!d)return;
  var i=+d.dataset.i, L=state.lines[i]; if(!L)return;
  var k=e.target.dataset.k, full=false;
  if(k==='color')L.color=e.target.value;
  else if(k==='pic')L.img=e.target.value||null;
  else if(k==='trans')L.trans=e.target.value;
  else if(k==='colorA')L.charA.color=e.target.value;
  else if(k==='colorB')L.charB.color=e.target.value;
  else if(k==='imgA')L.charA.img=e.target.value||null;
  else if(k==='imgB')L.charB.img=e.target.value||null;
  else if(k==='img'){L.img=e.target.value||null;renderLine(i);}
  else if(k==='hidden'){L.hidden=e.target.checked;renderLine(i);}
  else if(k==='autoJump'){L.autoJump=e.target.checked;renderLine(i);}
  else if(k==='autoJumpTarget'){L.autoJumpTarget=e.target.value===''?null:+e.target.value;}
  else if(k==='slideTitle'){L.slideTitle=e.target.value;}
  markDirty();
  if(selectedLine===i)previewLine(i);
});

function addLine(L){ state.lines.push(L); renderLines(); refreshStatus(); markDirty();
  var n=lineList.lastElementChild; if(n&&n.scrollIntoView)n.scrollIntoView({block:'nearest'}); }
$('#addLine').addEventListener('click',function(){addLine({type:'text',text:'',color:'#ffffff',img:null,trans:'none',hidden:false,autoJump:false,autoJumpTarget:null,slideTitle:''});});
$('#addTitle').addEventListener('click',function(){addLine({type:'title',text:'',sub:'',color:'#ffcc33',trans:'iris',hidden:false,autoJump:false,autoJumpTarget:null,slideTitle:''});});
$('#addDialogue').addEventListener('click',function(){addLine({type:'dialogue',charA:{name:'',text:'',img:null,color:'#6fe3ff'},charB:{name:'',text:'',img:null,color:'#7dee6a'},trans:'none',hidden:false,autoJump:false,autoJumpTarget:null,slideTitle:''});});
$('#addInteractive').addEventListener('click',function(){addLine({type:'interactive',img:null,hotspots:[],buttons:[],trans:'fade',hidden:false,autoJump:false,autoJumpTarget:null,slideTitle:''});});

$('#speed').addEventListener('input',function(e){state.speed=+e.target.value;$('#speedVal').textContent=state.speed;markDirty();});
$('#fxRow').addEventListener('click',function(e){
  var b=e.target.closest('.fxbtn');if(!b)return;
  state.lighting=b.dataset.fx;
  var all=document.querySelectorAll('.fxbtn');
  for(var i=0;i<all.length;i++)all[i].classList.toggle('on',all[i]===b);
  lightFx.className=(state.lighting==='none')?'':('fx-'+state.lighting);
  refreshStatus(); markDirty();
});
$('#scanChk').addEventListener('change',function(e){scanFx.style.display=e.target.checked?'block':'none';markDirty();});
$('#autoChk').addEventListener('change',function(e){state.autoNext=e.target.checked;markDirty();});
$('#sfxBtn').addEventListener('click',function(){state.sfx=!state.sfx;$('#sfxBtn').textContent='SFX '+(state.sfx?'ON':'OFF');});
$('#vol').addEventListener('input',function(e){state.volume=e.target.value/100;audio.volume=state.volume;});

/* ---- music: uploaded as a binary file and streamed, never base64 ---- */
$('#musicBtn').addEventListener('click',function(){$('#musicFileInput').click();});
$('#musicFileInput').addEventListener('change',async function(e){
  var f=e.target.files[0]; e.target.value='';
  if(!f)return;
  if(state.music&&state.music.objUrl){ try{URL.revokeObjectURL(state.music.objUrl);}catch(err){} }
  var objUrl=URL.createObjectURL(f);
  state.music={ name:f.name.slice(0,40), url:objUrl, objUrl:objUrl, file:f, bytes:f.size };
  audio.src=objUrl; audio.volume=state.volume;
  $('#musicName').textContent='[MUSIC] '+f.name.slice(0,20)+' ('+fmtBytes(f.size)+')';
  markDirty();
  if(f.size>AUDIO_WARN){
    toast('TRACK IS '+fmtBytes(f.size)+' - IT WILL STREAM, BUT A SMALLER MP3 LOADS FASTER');
  }
  if(isLoggedIn){
    setProgress('UPLOADING MUSIC');
    try{
      state.music.url=await uploadBlob(f,'audio',f.type||'audio/mpeg');
      state.music.file=null;
      toast('MUSIC STORED');
    }catch(err){ toast('MUSIC UPLOAD FAILED'); }
    setProgress('');
  }
});

/* ==========================================================================
   TYPING SFX
   ========================================================================== */
var AC=null,clickBuf=null;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();var sr=AC.sampleRate,len=Math.floor(sr*0.04);clickBuf=AC.createBuffer(1,len,sr);var d=clickBuf.getChannelData(0);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(sr*0.008));}catch(e){}}
function typeClick(){if(!state.sfx||!AC||!clickBuf)return;try{if(AC.state==='suspended')AC.resume();var s=AC.createBufferSource(),g=AC.createGain();s.buffer=clickBuf;s.playbackRate.value=0.8+Math.random()*0.4;g.gain.value=0.3;s.connect(g);g.connect(AC.destination);s.start();}catch(e){}}

/* ==========================================================================
   PLAYBACK
   ========================================================================== */
var playing=false,ended=false,typing=false,waiting=false,lineIdx=0,words=[],wi=0,typeTimer=null,autoTimer=null;
var dlgPhase='';

function wordDelay(){return Math.max(70,780-state.speed*66);}

function hideAll(){
  picWindow.classList.remove('show');titleCard.classList.remove('show');
  dialoguePanel.classList.remove('show');interactivePanel.classList.remove('show');
  sceneUI.style.display='';dialogWrap.style.display='';
  dialogText.textContent='';cursorEl.style.visibility='hidden';
  dlgTextA.textContent='';dlgTextB.textContent='';
  interactiveButtons.innerHTML='';
  var hs=interactiveImgWrap.querySelectorAll('.hotspot');
  for(var i=0;i<hs.length;i++)hs[i].remove();
}

/* Fetch the next slide's artwork while the current one is still being read,
   so transitions never stall on a cold image. */
var preloadCache=[];
function preloadFrom(idx){
  var count=0;
  for(var i=idx+1;i<state.lines.length&&count<2;i++){
    var L=state.lines[i]; if(L.hidden)continue;
    var urls=[];
    if(L.img)urls.push(getImgUrl(L.img));
    if(L.type==='dialogue'){ if(L.charA.img)urls.push(getThumbUrl(L.charA.img)); if(L.charB.img)urls.push(getThumbUrl(L.charB.img)); }
    for(var u=0;u<urls.length;u++){ if(!urls[u])continue; var im=new Image(); im.decoding='async'; im.src=urls[u]; preloadCache.push(im); }
    count++;
  }
  if(preloadCache.length>24)preloadCache=preloadCache.slice(-24);
}

function setupInteractive(L,live){
  var imgUrl=getImgUrl(L.img);
  if(imgUrl){interactiveImg.src=imgUrl;interactiveImg.style.display='block';}
  else{interactiveImg.removeAttribute('src');interactiveImg.style.display='none';}
  var existing=interactiveImgWrap.querySelectorAll('.hotspot');
  for(var i=0;i<existing.length;i++)existing[i].remove();
  var hots=L.hotspots||[];
  for(i=0;i<hots.length;i++){
    (function(hs){
      var el=document.createElement('div');
      el.className='hotspot';
      el.style.left=hs.x+'%';el.style.top=hs.y+'%';el.style.width=hs.w+'%';el.style.height=hs.h+'%';
      var lab=document.createElement('div');
      lab.className='hotspot-label';
      lab.textContent=hs.label||'';
      lab.style.color=hs.color||'#ffcc33';
      lab.style.borderColor=hs.color||'#ffcc33';
      el.appendChild(lab);
      if(live)el.addEventListener('click',function(e){e.stopPropagation();jumpToLine(hs.target);});
      interactiveImgWrap.appendChild(el);
    })(hots[i]);
  }
  var btns=L.buttons||[];
  interactiveButtons.innerHTML='';
  for(var j=0;j<btns.length;j++){
    (function(bn){
      var b=document.createElement('button');
      b.className='interact-btn';
      b.textContent=bn.label||'BUTTON';
      b.style.borderColor=bn.color||'#ffcc33';
      b.style.color=bn.color||'#ffcc33';
      if(live)b.addEventListener('click',function(e){e.stopPropagation();jumpToLine(bn.target);});
      interactiveButtons.appendChild(b);
    })(btns[j]);
  }
  interactivePanel.classList.add('show');
}

function jumpToLine(targetIdx){
  if(!playing||transBusy)return;
  if(targetIdx<0||targetIdx>=state.lines.length){toast('THAT LINK POINTS NOWHERE - PICK A TARGET LINE');return;}
  var curL=state.lines[lineIdx];
  var curTrans=(curL&&curL.trans)||'none';
  function go(){
    lineIdx=targetIdx;
    setupLine(state.lines[targetIdx]);
    preloadFrom(targetIdx);
    var inT=state.lines[targetIdx].trans||'none';
    if(inT!=='none')runTrans(inT,'in',null,function(){startTyping(state.lines[targetIdx]);});
    else startTyping(state.lines[targetIdx]);
  }
  if(curTrans!=='none')runTrans(curTrans,'out',go,null); else go();
}

function setupLine(L){
  hideAll();
  if(L.type==='dialogue'){
    sceneUI.style.display='none';
    var uA=getThumbUrl(L.charA.img);
    if(uA){dlgPortA.src=uA;dlgPortA.style.display='block';dlgFrameA.classList.remove('empty');}
    else{dlgPortA.removeAttribute('src');dlgPortA.style.display='none';dlgFrameA.classList.add('empty');}
    dlgNameA.textContent=L.charA.name||'';dlgNameA.style.color=L.charA.color||'#fff';
    dlgTextA.style.color=L.charA.color||'#fff';dlgTextA.textContent='';
    var uB=getThumbUrl(L.charB.img);
    if(uB){dlgPortB.src=uB;dlgPortB.style.display='block';dlgFrameB.classList.remove('empty');}
    else{dlgPortB.removeAttribute('src');dlgPortB.style.display='none';dlgFrameB.classList.add('empty');}
    dlgNameB.textContent=L.charB.name||'';dlgNameB.style.color=L.charB.color||'#fff';
    dlgTextB.style.color=L.charB.color||'#fff';dlgTextB.textContent='';
    dialoguePanel.classList.add('show');
  } else if(L.type==='title'){
    sceneUI.style.display='none';
    titleText.textContent=L.text;titleText.style.color=L.color||'#fff';
    titleSub.textContent=L.sub||'';titleSub.style.color=L.color||'#fff';
    titleCard.classList.add('show');
  } else if(L.type==='interactive'){
    sceneUI.style.display='none';
    setupInteractive(L,true);
  } else {
    var im=getImgUrl(L.img);
    if(im){storyPic.src=im;picWindow.classList.add('show');}
    dialogText.style.color=L.color||'#fff';
  }
}

function startTyping(L){
  dlgPhase='';
  if(L.type==='title'||L.type==='interactive'){typing=false;waiting=true;return;}
  if(L.type==='dialogue'){
    var tA=(L.charA.text||'').trim(), tB=(L.charB.text||'').trim();
    if(tA){ dlgPhase='typingA'; words=tA.split(/\s+/);wi=0;typing=true;waiting=false; clearTimeout(typeTimer); typeTimer=setTimeout(stepDlgA,260); }
    else if(tB){ dlgPhase='typingB'; words=tB.split(/\s+/);wi=0;typing=true;waiting=false; clearTimeout(typeTimer); typeTimer=setTimeout(stepDlgB,260); }
    else {typing=false;waiting=true;dlgPhase='done';}
    return;
  }
  words=(L.text||'').trim().split(/\s+/);wi=0;typing=true;waiting=false;
  clearTimeout(typeTimer);clearTimeout(autoTimer);
  typeTimer=setTimeout(stepStd,260);
}

function pushWord(target){
  var s=document.createElement('span'); s.textContent=words[wi];
  target.appendChild(s); target.appendChild(document.createTextNode(' '));
  typeClick(); wi++;
}
function stepStd(){ if(!playing||!typing)return; pushWord(dialogText); if(wi<words.length)typeTimer=setTimeout(stepStd,wordDelay()); else finishLine(); }

function stepDlgA(){
  if(!playing||!typing)return;
  pushWord(dlgTextA);
  if(wi<words.length){typeTimer=setTimeout(stepDlgA,wordDelay());return;}
  var L=state.lines[lineIdx];
  var tB=(L.charB.text||'').trim();
  if(tB){
    dlgPhase='waitB'; typing=false; waiting=true;
    var dots=document.createElement('span');
    dots.className='dlg-dots'; dots.textContent=' . . .';
    dots.style.animation='blink .85s steps(1) infinite';
    dlgTextA.appendChild(dots);
  } else { dlgPhase='done'; finishLine(); }
}

function stepDlgB(){
  if(!playing||!typing)return;
  pushWord(dlgTextB);
  if(wi<words.length){typeTimer=setTimeout(stepDlgB,wordDelay());return;}
  dlgPhase='done';
  var dots=document.createElement('span');
  dots.className='dlg-dots'; dots.textContent=' . . .';
  dots.style.animation='blink .85s steps(1) infinite';
  dlgTextB.appendChild(dots);
  typing=false;waiting=true;
  if(state.autoNext)autoTimer=setTimeout(advance,2000);
}

function finishLine(){
  typing=false;waiting=true;
  var L=state.lines[lineIdx];
  if(L&&L.type!=='dialogue'&&L.type!=='interactive')cursorEl.style.visibility='visible';
  if(L&&L.autoJump&&L.autoJumpTarget!==null&&L.autoJumpTarget!==undefined&&L.autoJumpTarget>=0&&L.autoJumpTarget<state.lines.length){
    autoTimer=setTimeout(function(){jumpToLine(L.autoJumpTarget);},1200);
    return;
  }
  if(state.autoNext&&L.type!=='interactive')autoTimer=setTimeout(advance,2000);
}

function revealAll(){
  clearTimeout(typeTimer);
  var L=state.lines[lineIdx];
  if(L.type==='dialogue'){
    if(dlgPhase==='typingA'){
      dlgTextA.textContent=L.charA.text||'';
      if((L.charB.text||'').trim()){dlgPhase='waitB';typing=false;waiting=true;}
      else{dlgPhase='done';dlgTextB.textContent=L.charB.text||'';finishLine();}
    } else if(dlgPhase==='typingB'){
      dlgTextA.textContent=L.charA.text||'';
      dlgTextB.textContent=L.charB.text||'';
      dlgPhase='done'; finishLine();
    }
  } else if(L.type!=='title'&&L.type!=='interactive'){
    while(wi<words.length){var s=document.createElement('span');s.textContent=words[wi];dialogText.appendChild(s);dialogText.appendChild(document.createTextNode(' '));wi++;}
    finishLine();
  }
}

function nextLine(){
  if(!playing)return;
  lineIdx++;
  while(lineIdx<state.lines.length){
    var L=state.lines[lineIdx];
    if(L.hidden){lineIdx++;continue;}
    var has=false;
    if(L.type==='dialogue')has=(L.charA.text||'').trim()||(L.charB.text||'').trim();
    else if(L.type==='interactive')has=true;
    else has=(L.text||'').trim();
    if(has)break;
    lineIdx++;
  }
  if(lineIdx>=state.lines.length){
    ended=true;typing=false;waiting=false;hideAll();sceneUI.style.display='';
    if(VIEWER)endShow(); else endCard.classList.add('show');
    return;
  }
  var L2=state.lines[lineIdx];
  var prev=(lineIdx>0)?(state.lines[lineIdx-1].trans||'none'):'none';
  var cur=L2.trans||'none';
  var doOut=prev!=='none'&&lineIdx>0, doIn=cur!=='none';
  preloadFrom(lineIdx);
  if(doOut){runTrans(prev,'out',function(){setupLine(L2);if(!doIn)startTyping(L2);},function(){if(doIn)runTrans(cur,'in',null,function(){startTyping(L2);});});}
  else if(doIn){setupLine(L2);runTrans(cur,'in',null,function(){startTyping(L2);});}
  else{setupLine(L2);startTyping(L2);}
}

function advance(){
  if(!playing||showOver)return;
  clearTimeout(autoTimer);
  var L=state.lines[lineIdx];
  if(L&&L.type==='interactive')return;
  if(L&&L.type==='dialogue'&&dlgPhase==='waitB'){
    var dotsA=dlgTextA.querySelector('.dlg-dots');
    if(dotsA)dotsA.remove();
    dlgPhase='typingB';
    words=(L.charB.text||'').trim().split(/\s+/);wi=0;typing=true;waiting=false;
    clearTimeout(typeTimer);
    typeTimer=setTimeout(stepDlgB,260);
    return;
  }
  if(typing){revealAll();return;}
  if(waiting){waiting=false;cursorEl.style.visibility='hidden';nextLine();return;}
  if(ended)stopPlay();
}

/* Viewers get a fade to black instead of a THE END card. window.close() only
   succeeds when the page was opened by a script, so the black screen is the
   real ending and closing is a bonus when the browser permits it. */
function fadeOutAudio(ms){
  var v=audio.volume, steps=24, i=0;
  var t=setInterval(function(){
    i++;
    try{ audio.volume = Math.max(0, v*(1-i/steps)); }catch(e){}
    if(i>=steps){ clearInterval(t); try{audio.pause();audio.volume=v;}catch(e){} }
  }, Math.max(16, ms/steps));
}

function endShow(){
  playing=false; typing=false; waiting=false;
  clearTimeout(typeTimer); clearTimeout(autoTimer);
  fadeOutAudio(1200);
  var b=$('#blackout'); if(b)b.classList.add('show');
  setTimeout(function(){
    showOver = true;               // stops the canvas loop entirely
    try{ audio.pause(); }catch(e){}
    try{ window.close(); }catch(e){}
  }, 1400);
}

function startPlay(){
  var has=false;
  for(var i=0;i<state.lines.length;i++){
    var L=state.lines[i]; if(L.hidden)continue;
    if(L.type==='dialogue'){ if((L.charA.text||'').trim()||(L.charB.text||'').trim())has=true; }
    else if(L.type==='interactive')has=true;
    else if((L.text||'').trim())has=true;
  }
  if(!has){toast('ADD AT LEAST ONE LINE WITH TEXT TO PLAY');return;}
  initAudio();
  document.body.classList.add('playing');
  playBtn.textContent='[STOP]';
  playing=true;ended=false;selectedLine=-1;
  var lines=lineList.querySelectorAll('.line');
  for(i=0;i<lines.length;i++)lines[i].classList.remove('selected');
  if(state.music&&state.music.url){
    if(audio.src!==state.music.url)audio.src=state.music.url;
    audio.volume=state.volume;
    try{audio.currentTime=0;}catch(e){}
    audio.play().catch(function(){});
  }
  clearTrans(); lineIdx=-1; dlgPhase=''; nextLine();
}
function stopPlay(){
  playing=false;typing=false;waiting=false;ended=false;dlgPhase='';
  clearTimeout(typeTimer);clearTimeout(autoTimer);
  document.body.classList.remove('playing');
  playBtn.textContent='\u25B6 PLAY';
  audio.pause();
  endCard.classList.remove('show');
  hideAll(); sceneUI.style.display=''; clearTrans();
}
playBtn.addEventListener('click',function(){if(playing)stopPlay();else startPlay();});
stageEl.addEventListener('click',function(e){if(playing&&!transBusy&&!showOver){if(e.target.closest('.interact-btn')||e.target.closest('.hotspot'))return;advance();}});
document.addEventListener('keydown',function(e){
  if(!playing||showOver)return;
  if(e.code==='Space'||e.code==='Enter'){
    e.preventDefault();
    var L=state.lines[lineIdx];
    if(L&&L.type==='interactive')return;
    if(!transBusy)advance();
  } else if(e.code==='Escape'&&!VIEWER)stopPlay();
});

/* ==========================================================================
   SERIALIZATION
   v8 stores URLs. v7 and earlier stored whole base64 images inline; those
   still load, and the next cloud save quietly migrates them to Storage.
   ========================================================================== */
var SAVE_VERSION = 8;

function serialize(imagesMap){
  return {
    v: SAVE_VERSION,
    bg: state.bg, px: state.pixelate, spd: state.speed,
    fx: state.lighting, scan: $('#scanChk').checked, auto: state.autoNext,
    customBg: state.customBg || null,
    lines: state.lines,
    images: imagesMap,
    music: state.music ? { name: state.music.name, url: state.music.url } : null
  };
}

function imagesAsUrls(){
  var im={};
  for(var i=0;i<state.images.length;i++){
    var r=state.images[i];
    im[r.id]={ name:r.name, url:r.url, thumb:r.thumbUrl||null, w:r.w||0, h:r.h||0 };
  }
  return im;
}

function blobToDataUrl(b){
  return new Promise(function(res){
    var fr=new FileReader();
    fr.onload=function(){res(fr.result);};
    fr.onerror=function(){res(null);};
    fr.readAsDataURL(b);
  });
}

/* ---- SAVE FILE ---- */
$('#saveBtn').addEventListener('click',async function(){
  setProgress('BUILDING FILE');
  try{
    var im={};
    for(var i=0;i<state.images.length;i++){
      var r=state.images[i];
      if(r.remote||/^https?:/.test(r.url||'')){
        im[r.id]={name:r.name,url:r.url,thumb:r.thumbUrl||null,w:r.w,h:r.h};
      } else if(r.fullBlob){
        // Not uploaded yet, so embed it -- but the compressed version, which is
        // a fraction of what the old export produced.
        im[r.id]={name:r.name,data:await blobToDataUrl(r.fullBlob),w:r.w,h:r.h};
      } else if(/^data:/.test(r.url||'')){
        im[r.id]={name:r.name,data:r.url,w:r.w,h:r.h};
      }
    }
    var payload=serialize(im);
    if(state.music&&state.music.file) payload.music={name:state.music.name,url:null,pending:true};
    var j=JSON.stringify(payload);
    var bl=new Blob([j],{type:'application/json'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(bl);
    a.download=(currentStoryTitle||'pixeltale-story').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.json';
    a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
    toast('SAVED '+fmtBytes(bl.size)+' TO YOUR DOWNLOADS');
  }catch(e){ toast('COULD NOT BUILD THE FILE'); }
  setProgress('');
});

$('#loadBtn').addEventListener('click',function(){$('#loadFileInput').click();});
$('#loadFileInput').addEventListener('change',function(e){
  var f=e.target.files[0]; e.target.value='';
  if(!f)return;
  var r=new FileReader();
  r.onload=function(ev){
    try{
      var d=JSON.parse(ev.target.result);
      if(!d.v){toast('THAT IS NOT A PIXELTALE FILE');return;}
      currentStoryId=null;currentStorySlug=null;
      loadStateFromData(d);
      toast('STORY LOADED');
    }catch(err){ toast('THAT FILE COULD NOT BE READ'); }
  };
  r.readAsText(f);
});

function loadStateFromData(d){
  for(var k=0;k<state.images.length;k++)revokeRec(state.images[k]);
  if(state.music&&state.music.objUrl){try{URL.revokeObjectURL(state.music.objUrl);}catch(e){}}

  state.bg=d.bg||'blueskies';
  state.pixelate=d.px!==false;
  state.speed=d.spd||5;
  state.lighting=d.fx||'none';
  state.autoNext=!!d.auto;
  $('#scanChk').checked=d.scan!==false;
  $('#autoChk').checked=state.autoNext;
  $('#speed').value=state.speed; $('#speedVal').textContent=state.speed;
  $('#pixelChk').checked=state.pixelate;

  state.images=[]; imgSeq=0;
  if(d.images){
    for(var id in d.images){
      var src=d.images[id];
      var url=src.url||src.data||'';
      var n=parseInt(String(id).replace(/\D/g,''),10);
      if(!isNaN(n)&&n>imgSeq)imgSeq=n;
      state.images.push({
        id:id, name:src.name||id, url:url, thumbUrl:src.thumb||null,
        fullBlob:null, thumbBlob:null, w:src.w||0, h:src.h||0,
        bytes:0, origBytes:0,
        remote: /^https?:/.test(url) ? {url:url,thumb:src.thumb||null} : null,
        uploading:false, local:false
      });
    }
  }
  reindexImages();

  state.lines=d.lines||[{type:'text',text:'',color:'#ffffff',img:null,trans:'none'}];
  for(var i=0;i<state.lines.length;i++){
    var L=state.lines[i];
    if(L.hidden===undefined)L.hidden=false;
    if(L.autoJump===undefined)L.autoJump=false;
    if(L.autoJumpTarget===undefined)L.autoJumpTarget=null;
    if(L.slideTitle===undefined)L.slideTitle='';
    if(L.type==='dialogue'){ if(!L.charA)L.charA={name:'',text:'',img:null,color:'#6fe3ff'}; if(!L.charB)L.charB={name:'',text:'',img:null,color:'#7dee6a'}; }
    if(L.type==='interactive'){ if(!L.buttons)L.buttons=[]; if(!L.hotspots)L.hotspots=[]; }
  }

  state.music = d.music && d.music.url ? {name:d.music.name,url:d.music.url,objUrl:null,file:null,bytes:0} : null;
  if(state.music){ audio.src=state.music.url; audio.volume=state.volume; $('#musicName').textContent='[MUSIC] '+String(state.music.name).slice(0,20); }
  else { audio.removeAttribute('src'); $('#musicName').textContent='NO TRACK'; }

  customImg=null; customName=''; selectedLine=-1;
  state.customBg = d.customBg || null;
  if(state.customBg) setCustomBg(state.customBg);

  var fxAll=document.querySelectorAll('.fxbtn');
  for(var f2=0;f2<fxAll.length;f2++)fxAll[f2].classList.toggle('on',fxAll[f2].dataset.fx===state.lighting);

  renderLines(); renderImages(); updateBgUI(); refreshStatus();
  lightFx.className=(state.lighting==='none')?'':('fx-'+state.lighting);
  scanFx.style.display=$('#scanChk').checked?'block':'none';
}

/* ==========================================================================
   LOCAL DRAFT
   Text and structure only. Cheap insurance against a closed tab.
   ========================================================================== */
var dirtyTimer=null;
function markDirty(){ clearTimeout(dirtyTimer); dirtyTimer=setTimeout(saveDraft,1200); }
function saveDraft(){
  try{
    localStorage.setItem('pt_draft', JSON.stringify({
      t:Date.now(), v:SAVE_VERSION, bg:state.bg, spd:state.speed, fx:state.lighting,
      auto:state.autoNext, lines:state.lines
    }));
  }catch(e){}
}

/* ==========================================================================
   CLOUD
   ========================================================================== */
function genSlug(){return Math.random().toString(36).substring(2,10)+Date.now().toString(36).slice(-4);}

async function saveToCloud(title){
  if(!sb){toast('NO CONNECTION TO THE STORY SERVER');return;}
  if(!isLoggedIn||!session){toast('SIGN IN FIRST');return;}

  await uploadPending();

  var stillLocal=state.images.filter(function(r){return !r.remote && !/^https?:/.test(r.url||'');});
  if(stillLocal.length){ toast(stillLocal.length+' IMAGE(S) DID NOT UPLOAD - TRY AGAIN'); return; }

  setProgress('SAVING');
  var data=serialize(imagesAsUrls());
  var size=JSON.stringify(data).length;
  var row={ title:title, data:data, author_email:session.user.email, owner_id:session.user.id };

  try{
    var res;
    if(currentStoryId){
      res=await sb.from('stories').update(row).eq('id',currentStoryId).select('id,slug').single();
    } else {
      row.slug=genSlug(); row.view_count=0;
      res=await sb.from('stories').insert(row).select('id,slug').single();
    }
    if(res.error)throw res.error;
    currentStoryId=res.data.id; currentStorySlug=res.data.slug; currentStoryTitle=title;
    setProgress('');
    toast('SAVED ('+fmtBytes(size)+' ROW) - USE SHARE TO GET THE LINK');
  }catch(e){
    setProgress('');
    toast('SAVE FAILED: '+(e.message||e));
  }
}

async function loadStoriesList(){
  if(!sb||!session)return[];
  try{
    var res=await sb.from('stories')
      .select('id,slug,title,view_count,created_at')
      .or('owner_id.eq.'+session.user.id+',author_email.eq.'+session.user.email)
      .order('created_at',{ascending:false});
    if(res.error)throw res.error;
    return res.data||[];
  }catch(e){ return []; }
}

async function loadStoryBySlug(slug,inc){
  if(!sb)return null;
  try{
    if(inc){
      // One round trip instead of read-then-write, and it cannot lose counts
      // when two people open the link at the same time.
      sb.rpc('increment_story_views',{story_slug:slug}).then(function(r){
        if(r&&r.error)console.warn('view count rpc missing', r.error.message);
      });
    }
    var res=await sb.from('stories').select('id,slug,title,data').eq('slug',slug).single();
    if(res.error)throw res.error;
    return res.data;
  }catch(e){ return null; }
}

async function deleteStory(id){
  if(!sb)return false;
  try{ var res=await sb.from('stories').delete().eq('id',id); if(res.error)throw res.error; return true; }
  catch(e){ return false; }
}

/* ==========================================================================
   AUTH  (real Supabase sessions -- no password in this file)
   ========================================================================== */
function updateLoginUI(){
  $('#loginBadge').style.display   = isLoggedIn?'inline-block':'none';
  $('#loginBtn').textContent       = isLoggedIn?'SIGN OUT':'SIGN IN';
  $('#storiesBtn').style.display   = isLoggedIn?'inline-block':'none';
  $('#saveCloudBtn').style.display = isLoggedIn?'inline-block':'none';
  if(isLoggedIn&&session)$('#loginBadge').textContent=(session.user.email||'').split('@')[0].toUpperCase().slice(0,12);
}

async function initAuth(){
  if(!sb){updateLoginUI();return;}
  try{
    var r=await sb.auth.getSession();
    session=r.data.session||null;
    isLoggedIn=!!session;
  }catch(e){}
  updateLoginUI();
  sb.auth.onAuthStateChange(function(ev,s){
    session=s||null; isLoggedIn=!!s; updateLoginUI();
    if(isLoggedIn)uploadPending();
  });
}

$('#loginBtn').addEventListener('click',async function(){
  if(isLoggedIn){
    try{await sb.auth.signOut();}catch(e){}
    session=null;isLoggedIn=false;updateLoginUI();toast('SIGNED OUT');
  } else {
    $('#loginEmail').value='';$('#loginPass').value='';
    $('#loginModal').classList.add('show');
    setTimeout(function(){$('#loginEmail').focus();},100);
  }
});
$('#loginCancel').addEventListener('click',function(){$('#loginModal').classList.remove('show');});
$('#loginSubmit').addEventListener('click',async function(){
  var em=$('#loginEmail').value.trim(), pw=$('#loginPass').value;
  if(!em||!pw){toast('ENTER YOUR EMAIL AND PASSWORD');return;}
  if(!sb){toast('NO CONNECTION TO THE STORY SERVER');return;}
  var btn=this; btn.disabled=true; btn.textContent='...';
  try{
    var res=await sb.auth.signInWithPassword({email:em,password:pw});
    if(res.error)throw res.error;
    session=res.data.session; isLoggedIn=true;
    updateLoginUI();
    $('#loginModal').classList.remove('show');
    toast('SIGNED IN');
    uploadPending();
  }catch(e){
    toast('SIGN IN FAILED: '+(e.message||'CHECK YOUR DETAILS'));
    $('#loginPass').value='';
  }
  btn.disabled=false; btn.textContent='SIGN IN';
});
$('#loginPass').addEventListener('keydown',function(e){if(e.key==='Enter')$('#loginSubmit').click();});
$('#loginEmail').addEventListener('keydown',function(e){if(e.key==='Enter')$('#loginPass').focus();});

/* ---- stories list ---- */
function openStories(){
  $('#storiesModal').classList.add('show');
  $('#storiesList').innerHTML='<p class="empty-msg">LOADING...</p>';
  loadStoriesList().then(renderStoriesList);
}
$('#storiesBtn').addEventListener('click',openStories);
$('#storiesRefresh').addEventListener('click',function(){
  $('#storiesList').innerHTML='<p class="empty-msg">LOADING...</p>';
  loadStoriesList().then(renderStoriesList);
});
$('#storiesClose').addEventListener('click',function(){$('#storiesModal').classList.remove('show');});

function renderStoriesList(list){
  var el=$('#storiesList');
  if(!list||list.length===0){el.innerHTML='<p class="empty-msg">NO STORIES YET. BUILD ONE, THEN SAVE TO CLOUD.</p>';return;}
  el.innerHTML='';
  var frag=document.createDocumentFragment();
  for(var i=0;i<list.length;i++){
    var s=list[i];
    var d=document.createElement('div');
    d.className='story-item'; d.dataset.id=s.id; d.dataset.slug=s.slug;
    var dateStr=s.created_at?new Date(s.created_at).toLocaleDateString():'?';
    d.innerHTML='<div class="story-title">'+esc(s.title)+'</div>'+
      '<div class="story-meta">SLUG: '+esc(s.slug)+' &middot; <span class="views">'+(s.view_count||0)+' VIEWS</span> &middot; '+dateStr+'</div>'+
      '<div class="story-actions"><button class="btn mini cyan" data-act="share" type="button">SHARE</button><button class="btn mini" data-act="open" type="button">OPEN</button><button class="btn mini red" data-act="delete" type="button">DELETE</button></div>';
    frag.appendChild(d);
  }
  el.appendChild(frag);
}

$('#storiesList').addEventListener('click',function(e){
  var b=e.target.closest('button'); if(!b)return;
  var item=b.closest('.story-item'); if(!item)return;
  var act=b.dataset.act, id=item.dataset.id, slug=item.dataset.slug;
  if(act==='share'){
    var url=location.origin+location.pathname+'?story='+slug;
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(function(){toast('LINK COPIED');},function(){prompt('COPY THIS LINK:',url);});
    else prompt('COPY THIS LINK:',url);
  } else if(act==='open'){
    toast('OPENING...');
    loadStoryBySlug(slug,false).then(function(row){
      if(row&&row.data){
        loadStateFromData(row.data);
        currentStoryId=row.id; currentStorySlug=row.slug; currentStoryTitle=row.title||'';
        $('#storiesModal').classList.remove('show');
        toast('OPENED - SAVE CLOUD NOW UPDATES THIS STORY');
      } else toast('THAT STORY COULD NOT BE OPENED');
    });
  } else if(act==='delete'){
    pendingDeleteId=id;
    $('#confirmMsg').textContent='DELETE "'+item.querySelector('.story-title').textContent+'"?';
    $('#confirmModal').classList.add('show');
  }
});
$('#confirmNo').addEventListener('click',function(){pendingDeleteId=null;$('#confirmModal').classList.remove('show');});
$('#confirmYes').addEventListener('click',function(){
  if(!pendingDeleteId){$('#confirmModal').classList.remove('show');return;}
  var id=pendingDeleteId; pendingDeleteId=null;
  $('#confirmModal').classList.remove('show');
  toast('DELETING...');
  deleteStory(id).then(function(ok){
    if(ok){
      if(currentStoryId===id){currentStoryId=null;currentStorySlug=null;}
      toast('DELETED');
      loadStoriesList().then(renderStoriesList);
    } else toast('DELETE FAILED');
  });
});

/* ---- save to cloud ---- */
$('#saveCloudBtn').addEventListener('click',function(){
  if(!isLoggedIn){toast('SIGN IN FIRST');return;}
  var t=currentStoryTitle;
  if(!t){
    for(var i=0;i<state.lines.length;i++){
      if(state.lines[i].type==='title'&&(state.lines[i].text||'').trim()){t=state.lines[i].text.trim();break;}
    }
  }
  $('#cloudTitleInput').value=t;
  $('#saveAsNew').style.display=currentStoryId?'inline-block':'none';
  $('#titleModal').classList.add('show');
  setTimeout(function(){$('#cloudTitleInput').focus();},100);
});
$('#titleCancel').addEventListener('click',function(){$('#titleModal').classList.remove('show');});
$('#titleSubmit').addEventListener('click',function(){
  var t=$('#cloudTitleInput').value.trim();
  if(!t){toast('GIVE THE STORY A TITLE');return;}
  $('#titleModal').classList.remove('show');
  saveToCloud(t);
});
$('#saveAsNew').addEventListener('click',function(){
  var t=$('#cloudTitleInput').value.trim();
  if(!t){toast('GIVE THE STORY A TITLE');return;}
  currentStoryId=null; currentStorySlug=null;
  $('#titleModal').classList.remove('show');
  saveToCloud(t);
});
$('#cloudTitleInput').addEventListener('keydown',function(e){if(e.key==='Enter')$('#titleSubmit').click();});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var open=document.querySelector('.modal.show');
    if(open){open.classList.remove('show');}
  }
});

/* ==========================================================================
   BOOT
   ========================================================================== */
(async function boot(){
  await initAuth();

  if(VIEWER){
    var gate=$('#viewerGate'), gateMsg=$('#gateMsg'), gateBtn=$('#gateBtn');
    var row=await loadStoryBySlug(VIEWER_SLUG,true);
    if(!row||!row.data){
      gateMsg.textContent='STORY NOT FOUND';
      return;
    }
    loadStateFromData(row.data);
    document.body.classList.add('playing');

    // One tap before the first frame. Browsers refuse to start audio without a
    // gesture, so without this the music and typing sounds are silently muted
    // on every shared link.
    gateMsg.textContent=(row.title||'').toUpperCase().slice(0,48);
    gateBtn.classList.add('show');
    var started=false;
    function begin(){
      if(started)return; started=true;
      gate.classList.add('gone');
      setTimeout(function(){ gate.style.display='none'; }, 700);
      setTimeout(startPlay, 350);
    }
    gateBtn.addEventListener('click',begin);
    gate.addEventListener('click',begin);
    document.addEventListener('keydown',function(e){
      if(!started&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();begin();}
    });
    return;
  }

  renderLines(); renderImages(); updateBgUI(); refreshStatus();
  $('#statusText').textContent += ' - READY';
  console.log('PIXELTALE: Ready!');
})();

})();
