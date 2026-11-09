/* My Ihsan app - prototype 0.5.15 */
(function(){
"use strict";
// ---------- native bridge ----------
var N = window.Native || {
  info:function(){return '{"sdk":0,"version":"web"}'}, hasPerm:function(){return true},
  requestPerm:function(w){setTimeout(function(){window.onNative('perm',{which:w,granted:true})},100)},
  getLocation:function(){setTimeout(function(){window.onNative('location',{lat:3.139,lon:101.687,acc:30})},200)},
  startCompass:function(){var d=0;clearInterval(window.__cmp);window.__cmp=setInterval(function(){d=(d+3)%360;window.onNative('heading',{deg:d,acc:3})},120)},
  stopCompass:function(){clearInterval(window.__cmp)},
  fetchUrl:function(id,url){setTimeout(function(){window.onNative('fetch',{id:id,status:0,body:'offline (web preview)'})},300)},
  setSchedule:function(a,b){window.__sched=[a,b]}, setExtras:function(j){window.__ex=j}, testNotification:function(){toast('Notifikasi ujian (web)')},
  openMaps:function(q,la,lo){window.open('https://www.google.com/maps/search/'+encodeURIComponent(q)+'/@'+la+','+lo+',14z')},
  openUrl:function(u){window.open(u)}, keepScreenOn:function(){}, vibrate:function(){},
  startSujud:function(){window.onNative('sujud',{type:'ready',faceHw:false,prox:false})}, stopSujud:function(){}
};
// 0.5.16: web build (iPhone / browser). index.html of the web copy sets window.IHSAN_WEB; Android pages are hidden.
var WEB = !!window.IHSAN_WEB && !window.Native;
var WEB_OFF = ["kiblat","dengar","tanya","senaman","fokus","statistik","tukaran","halal","cari"];
if(WEB){
  N.fetchUrl=function(id,url){ fetch(url).then(function(r){ return r.text().then(function(t){ window.onNative("fetch",{id:id,status:r.status,body:t}); }); }).catch(function(e){ window.onNative("fetch",{id:id,status:0,body:String(e)}); }); };
  N.getLocation=function(){ if(!navigator.geolocation){ window.onNative("location",{error:"none"}); return; }
    navigator.geolocation.getCurrentPosition(function(p){ window.onNative("location",{lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy}); }, function(e){ window.onNative("location",{error:String(e && e.message || "denied")}); }, {enableHighAccuracy:false, timeout:15000, maximumAge:600000}); };
  N.openUrl=function(u){ window.open(u,"_blank"); };
  N.vibrate=function(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||30); }catch(e){} };
  (function(){ var A=["q-qibla","q-kiblat","q-finder","q-stat","q-resepi","q-rplan","barcode","saham","player"], W=["kiblat","qibla","qcam","fokus","senaman","statistik","stat","tukaran","saham","halal","barcode","cari","finder","dengar","tanya","radio","podcast","live","player","steps","screen"];
    var css=A.map(function(x){ return '[data-act="'+x+'"]'; }).concat(W.map(function(x){ return '[data-wsc*="'+x+'"],[data-learn="'+x+'"],[data-go="'+x+'"]'; })).join(",")+'{display:none!important}';
    var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st); })();
  N.testNotification=function(){ toast(L2x("Notifikasi hanya dalam aplikasi Android","Notifications are only in the Android app")); };
}
var listeners = {};
function on(type, fn){ (listeners[type]=listeners[type]||[]).push(fn); }
function off(type, fn){ var l=listeners[type]||[]; var i=l.indexOf(fn); if(i>=0) l.splice(i,1); }
window.onNative = function(type, data){ (listeners[type]||[]).slice().forEach(function(f){ try{f(data)}catch(e){console.error(e)} }); };

// ---------- storage & settings ----------
function load(k, d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }
function save(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
var DEF = {lang:"ms", zone:"WLY01", state:"KUL", zoneAuto:true, lat:null, lon:null, notif:{subuh:true,zohor:true,asar:true,maghrib:true,isyak:true},
  countdown:true, preMin:0, hijriOffset:0, arSize:26, theme:"black", rmode:"camera", tapStep:0.5, vib:false, showStat:false,
  sujud:{threshold:0.45, face:true, light:true, prox:true}, onboard:false, appTheme:"green", rdisp:"ring", rnum:"latin", rdir:"up", arFont:"system", srcLinks:false, showTr:true,
  homeCards:null, quietPray:false, alertStyle:"sound", softSubuh:false, lockShow:false, pauseMode:null, pauseUntil:0, endMin:0,
  imsakOn:false, imsakRamadan:true, syurukOn:false, tahajjud:false, mathAlarm:false, fastRem:false, fastRemT:{mk:true,bidh:true,special:true},
  adj:{subuh:0,zohor:0,asar:0,maghrib:0,isyak:0}, locMode:"auto", calcMethod:"MWL", overseas:false, home:null, musafirAuto:true, musafirOn:false,
  textZoom:100, showRumi:false, autoNight:false, ramadanForce:false, favs:[], ganti:{owe:0,done:[]}, volTasbih:false, sirahWind:false, sirahCalm:false, kidLock:false, appLock:false, senior:false, jnRem:false, mq:{on:false,list:[],r:100}};
var S = load("ihsan_settings", {});
for (var k in DEF) if (S[k]===undefined) S[k]=JSON.parse(JSON.stringify(DEF[k]));
if(S.alertStyle==="azan") S.alertStyle="sound";
var APP_THEMES=[["green","Hijau (asal)","#07130d","#c9a646","Green (original)","#07130d",false],["white","Putih cerah","#ffffff","#0b5d3b","Light white","#f6f7f5",true],["lightgy","Hijau muda & kuning","#eaf3dc","#e0b020","Light green & yellow","#f3f8ec",true],["blue","Biru gelap & indigo","#0b1020","#5b6cff","Dark blue & indigo","#0b1020",false],["blackgold","Hitam & emas","#000000","#d8b452","Black & gold","#000000",false],["night","Malam (merah malap)","#000000","#9c3a2e","Night (dim red)","#000000",false]];
var AR_FONTS=[["system","Naskh (sistem)","Naskh (system)",'"Noto Naskh Arabic","Droid Arabic Naskh",serif'],["amiri","Amiri","Amiri",'"AmiriL","Noto Naskh Arabic",serif'],["scheherazade","Scheherazade","Scheherazade",'"ScheherazadeL","Noto Naskh Arabic",serif']];
function applyFont(){ var f=AR_FONTS.filter(function(x){return x[0]===S.arFont;})[0]||AR_FONTS[0]; document.documentElement.style.setProperty("--ar", f[3]); document.documentElement.classList.toggle("notr", !S.showTr); }
function nightNow(){ if(!S.autoNight) return false; var h=new Date().getHours(); if(h>=22) return true; try{ var t=getDay(new Date()); var sy=t.syuruk.split(":"); var now=new Date(); return now.getHours()*60+now.getMinutes() < (+sy[0])*60+(+sy[1]); }catch(e){ return h<7; } }
var themeNow=null;
function applyTheme(){ var want=nightNow()?"night":S.appTheme; themeNow=want; var th=APP_THEMES.filter(function(t){return t[0]===want;})[0]||APP_THEMES[0]; document.documentElement.setAttribute("data-th", th[0]); try{ if(N.setBars) N.setBars(th[5], th[6]); }catch(e){} }
function saveS(){ save("ihsan_settings", S); pushSchedule(); }
document.documentElement.style.setProperty('--arsize', S.arSize+'px');

// ---------- i18n ----------
var L = {
 home:["Solat","Solat"], sunat:["Amalan","Practice"], doa:["Doa","Doa"], apptheme:["Tema aplikasi","App theme"], qibla:["Kiblat","Qibla"], rakaat:["Rakaat","Rakaat"], zikir:["Zikir","Zikir"], cal:["Masa","Time"], more:["Tetapan","Settings"],
 next:["Solat seterusnya","Next prayer"], in_:["lagi","in"], today:["Waktu solat hari ini","Today's prayer times"],
 imsak:["Imsak","Imsak"], dhuha:["Dhuha","Dhuha"], subuh:["Subuh","Subuh"], syuruk:["Syuruk","Sunrise"], zohor:["Zohor","Zohor"], jumaat:["Jumaat","Jumu'ah"], asar:["Asar","Asar"], maghrib:["Maghrib","Maghrib"], isyak:["Isyak","Isyak"],
 jakim:["Sumber: JAKIM e-Solat","Source: JAKIM e-Solat"], est:["Anggaran (luar talian) - menunggu data JAKIM","Estimate (offline) - waiting for JAKIM data"],
 refresh:["Kemas kini","Refresh"], zone:["Zon","Zone"], tasbih:["Tasbih","Tasbih"], after:["Selepas Solat","After Solat"], mathurat:["Al-Ma'thurat","Al-Ma'thurat"], daily:["Doa Harian","Daily Doa"],
 pagi:["Pagi","Morning"], petang:["Petang","Evening"], start:["Mula","Start"], done:["Selesai","Done"], undo:["Undur","Undo"], reset:["Set semula","Reset"],
 why:["Mengapa dibaca","Why we read it"], source:["Sumber","Source"], times:["kali","times"],
 settings:["Tetapan","Settings"], lang:["Bahasa","Language"], masjid:["Masjid berdekatan","Nearby masjid"], surau:["Surau berdekatan","Nearby surau"],
 finder:["Cari masjid & surau (Google Maps)","Find masjid & surau (Google Maps)"], log:["Rekod solat","Prayer log"], qada:["Solat qada'","Qada' prayers"],
 notifs:["Notifikasi","Notifications"], countdownN:["Notifikasi kiraan detik & bar","Countdown & progress notification"], pre:["Peringatan awal","Early reminder"],
 test:["Uji notifikasi","Test notification"], exact:["Benarkan penggera tepat","Allow exact alarms"], detect:["Kesan zon automatik (GPS)","Auto-detect zone (GPS)"],
 state:["Negeri (cuti)","State (holidays)"], hoff:["Pelarasan tarikh Hijri","Hijri date adjustment"], arsize:["Saiz tulisan Arab","Arabic text size"],
 camera:["Kamera (sujud)","Camera (sujud)"], tap:["Ketik skrin","Tap screen"], theme:["Tema sejadah","Sejadah theme"],
 tblack:["Hitam","Black"], tgreen:["Hijau & Putih","Green & White"], tgold:["Hitam & Emas","Black & Gold"],
 calib:["Kalibrasi sujud","Sujud calibration"], ph:["Cuti umum","Public holiday"], sc:["Cuti sekolah","School holiday"], is:["Hari Islam","Islamic day"],
 allst:["Semua negeri","All states"], about:["Tentang & penafian","About & disclaimer"], utama:["Utama","Home"], solat:["Solat","Solat"], learn:["Ilmu","Learn"], kids:["Mod kanak-kanak","Kids mode"], halal:["Halal","Halal"], asma:["Asmaul Husna","Asmaul Husna"]
};
function T(k){ var u=S.ulang||S.lang; if(UTXT[u]){ var i=UKEYS.indexOf(k); if(i>=0) return UTXT[u][i]; } var v=L[k]; return v ? v[S.lang==="en"?1:0] : k; }
if(S.ulang!=="ms" && S.ulang!=="en" && S.ulang!=="id"){ S.ulang=S.lang==="en"?"en":"ms"; }
function locTag(){ return ULOC[S.ulang||S.lang]||"en-GB"; }
function tr(o){ return S.lang==="en" ? (o.en||o.ms) : (o.ms||o.en); }
var SRC_MAP=[[/Sahih al-Bukhari (\d+)/g,"bukhari"],[/Sahih Muslim (\d+)/g,"muslim"],[/Sunan Abi Dawud (\d+)/g,"abudawud"],[/Jami' at-Tirmidhi (\d+)/g,"tirmidhi"],[/Sunan an-Nasa'i (\d+)/g,"nasai"],[/Sunan Ibn Majah (\d+)/g,"ibnmajah"],[/Musnad Ahmad (\d+)/g,"ahmad"]];
function srcMarks(h){ var en=S.lang==="en"; return h.replace(/ \[weak\]/g,' <b class="weak">'+(en?"(weak)":"(dhaif)")+'</b>').replace(/ \[disputed\]/g,' <b class="weak">'+(en?"(grading disputed)":"(darjat diperselisihkan)")+'</b>'); }
function srcHtml(src){
  var h=esc(src);
  h=h.replace(/Al-Quran (\d+)(?::(\d+)(?:-(\d+))?)?/g, function(all,su,a){ return '<a class="qref" data-qref="'+su+':'+(a||1)+'">📖 '+all+'</a>'; });
  if(!S.srcLinks) return srcMarks(h);
  SRC_MAP.forEach(function(m){ h=h.replace(m[0], function(all,n){ return '<a href="https://sunnah.com/'+m[1]+':'+n+'">'+all+'</a>'; }); });
  return srcMarks(h);
}
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function toast(msg){ var t=document.getElementById("toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(toast._t); toast._t=setTimeout(function(){t.classList.add("hidden")},2600); }
window.toast = toast;

// ---------- dates ----------
var PR = ["subuh","zohor","asar","maghrib","isyak"];
var ALL = ["imsak","subuh","syuruk","zohor","asar","maghrib","isyak"];
function pad(n){ return (n<10?"0":"")+n; }
function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function parseYmd(s){ var p=s.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
function addDays(d,n){ var x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }
function at(dateStr, hm){ var p=hm.split(":"); var d=parseYmd(dateStr); d.setHours(+p[0], +p[1], 0, 0); return d; }
function fmt12(hm){ if(!hm) return "--"; var p=hm.split(":"), h=+p[0], m=p[1]; var ap=h>=12?"PM":"AM"; h=h%12; if(h===0)h=12; return h+":"+m+" "+ap; }
var MON = {jan:0,feb:1,mar:2,apr:3,may:4,mei:4,jun:5,jul:6,aug:7,ogo:7,sep:8,oct:9,okt:9,nov:10,dec:11,dis:11};
function parseJakimDate(s){
  if(!s) return null; var m;
  if((m=/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s))) return new Date(+m[3], MON[m[2].toLowerCase()], +m[1]);
  if((m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return new Date(+m[1], +m[2]-1, +m[3]);
  if((m=/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(s))) return new Date(+m[3], +m[2]-1, +m[1]);
  return null;
}
function hm(s){ if(!s) return null; var m=/(\d{1,2}):(\d{2})/.exec(s); return m ? pad(+m[1])+":"+m[2] : null; }

// ---------- prayer time calculation (offline estimate, JAKIM-like parameters) ----------
var D2R=Math.PI/180;
function fixA(a){ a=a-360*Math.floor(a/360); return a<0?a+360:a; }
function fixH(a){ a=a-24*Math.floor(a/24); return a<0?a+24:a; }
function julian(y,m,d){ if(m<=2){y--;m+=12;} var A=Math.floor(y/100), B=2-A+Math.floor(A/4); return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5; }
function sunPos(jd){ var D=jd-2451545, g=fixA(357.529+0.98560028*D), q=fixA(280.459+0.98564736*D), Lm=fixA(q+1.915*Math.sin(g*D2R)+0.020*Math.sin(2*g*D2R)), e=23.439-0.00000036*D;
  var RA=Math.atan2(Math.cos(e*D2R)*Math.sin(Lm*D2R), Math.cos(Lm*D2R))/D2R/15; return {decl:Math.asin(Math.sin(e*D2R)*Math.sin(Lm*D2R))/D2R, eqt:q/15-fixH(RA)}; }
function calcDay(date, lat, lon, o){
  o=o||{fa:20,ia:18,tz:8,ik:2};
  var tz=o.tz, jd=julian(date.getFullYear(), date.getMonth()+1, date.getDate())-lon/(15*24);
  function mid(t){ return fixH(12-sunPos(jd+t).eqt); }
  function angT(ang,t,ccw){ var s=sunPos(jd+t), n=mid(t); var v=(-Math.sin(ang*D2R)-Math.sin(s.decl*D2R)*Math.sin(lat*D2R))/(Math.cos(s.decl*D2R)*Math.cos(lat*D2R)); var T2=Math.acos(Math.max(-1,Math.min(1,v)))/D2R/15; return n+(ccw?-T2:T2); }
  function asrT(t){ var s=sunPos(jd+t); var ang=-Math.atan(1/(1+Math.tan(Math.abs(lat-s.decl)*D2R)))/D2R; return angT(ang,t,false); }
  var t={f:5/24,s:6/24,d:12/24,a:13/24,m:18/24,i:18/24}, r;
  for(var it=0;it<2;it++){ r={f:angT(o.fa,t.f,true), s:angT(0.833,t.s,true), d:mid(t.d), a:asrT(t.a), m:angT(0.833,t.m,false), i:o.im?0:angT(o.ia,t.i,false)}; if(o.im) r.i=r.m+o.im/60; t={f:r.f/24,s:r.s/24,d:r.d/24,a:r.a/24,m:r.m/24,i:r.i/24}; }
  function out(h, add){ h=h+tz-lon/15+add/60; var mm=Math.ceil(h*60); mm=((mm%1440)+1440)%1440; return pad(Math.floor(mm/60))+":"+pad(mm%60); }
  var ik=o.ik, sub=out(r.f,ik);
  var im=adjTime(sub,-10);
  return {imsak:im, subuh:sub, syuruk:out(r.s,-ik), zohor:out(r.d,ik), asar:out(r.a,ik), maghrib:out(r.m,ik), isyak:out(r.i,ik), src:"calc"};
}
function zoneById(id){ for(var i=0;i<ZONES.length;i++) if(ZONES[i][0]===id) return ZONES[i]; return ZONES[ZONES.length-2]; }
function zonePoint(){ if(S.lat!=null) return [S.lat,S.lon]; return zoneById(S.zone)[3][0]; }
function nearestZone(lat, lon){
  var best=null, bd=1e9;
  ZONES.forEach(function(z){ if(z[4]) return; z[3].forEach(function(p){ var d=Math.pow(p[0]-lat,2)+Math.pow((p[1]-lon)*Math.cos(lat*D2R),2); if(d<bd){bd=d;best=z;} }); });
  return best;
}

// ---------- JAKIM data ----------
function cacheKey(zone, y){ return "pt_"+zone+"_"+y; }
var METHODS={MWL:[18,17,0,"Muslim World League"],UQ:[18.5,0,90,"Umm al-Qura (Makkah)"],EG:[19.5,17.5,0,"Egypt"],ISNA:[15,15,0,"ISNA (N. America)"],MUIS:[20,18,0,"MUIS / JAKIM angles"]};
function overseasNow(){ return S.locMode==="overseas" || (S.locMode==="auto" && S.overseas && S.lat!=null); }
function inMalaysia(lat,lon){
  var box=(lat>=1.15&&lat<=6.75&&lon>=99.5&&lon<=104.7)||(lat>=0.8&&lat<=7.6&&lon>=109.4&&lon<=119.6);
  if(!box) return false;
  var bd=1e9; ZONES.forEach(function(z){ if(z[4]) return; z[3].forEach(function(p){ var d=Math.pow(p[0]-lat,2)+Math.pow((p[1]-lon)*Math.cos(lat*D2R),2); if(d<bd) bd=d; }); });
  return bd<1.0;
}
function adjTime(hm0, m){ if(!hm0||!m) return hm0; var p=hm0.split(":"), t=(+p[0])*60+(+p[1])+m; t=(t+1440)%1440; return pad(Math.floor(t/60))+":"+pad(t%60); }
function getDay0(date){
  if(overseasNow()){ var M=METHODS[S.calcMethod]||METHODS.MWL, tz=-new Date(date.getFullYear(),date.getMonth(),date.getDate(),12).getTimezoneOffset()/60;
    var r=calcDay(date, S.lat, S.lon, {fa:M[0], ia:M[1], im:M[2], tz:tz, ik:1}); r.src="abroad"; return r; }
  var ds=ymd(date), c=load(cacheKey(S.zone, date.getFullYear()), null);
  if(c && c.days && c.days[ds]) { var o=c.days[ds]; o.src="jakim"; return o; }
  var p=zonePoint(); return calcDay(date, p[0], p[1]);
}
function getDay(date){
  var o=getDay0(date), a=S.adj||{}, r={};
  for(var k in o) r[k]=o[k];
  PR.forEach(function(k){ if(a[k]) r[k]=adjTime(o[k], a[k]); });
  if(a.subuh && o.imsak) r.imsak=adjTime(o.imsak, a.subuh);
  return r;
}
var fetching={};
function fetchJakim(zone, year, cb){
  var id=zone+"_"+year; if(fetching[id]) return; fetching[id]=true;
  var url="https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=year&zone="+zone;
  var h=function(res){
    if(res.id!==id) return; off("fetch", h); fetching[id]=false;
    var ok=false;
    try{
      var j=JSON.parse(res.body), arr=j.prayerTime||j.prayertime||[];
      var days={};
      arr.forEach(function(r){ var d=parseJakimDate(r.date); if(!d) return;
        days[ymd(d)]={imsak:hm(r.imsak), subuh:hm(r.fajr||r.subuh), syuruk:hm(r.syuruk), zohor:hm(r.dhuhr||r.zohor), asar:hm(r.asr||r.asar), maghrib:hm(r.maghrib), isyak:hm(r.isha||r.isyak), hijri:r.hijri||null}; });
      if(Object.keys(days).length>20){ save(cacheKey(zone,year), {fetched:Date.now(), days:days}); ok=true; }
    }catch(e){}
    cb && cb(ok, res);
  };
  on("fetch", h); N.fetchUrl(id, url);
}
function ensureData(force){
  var y=new Date().getFullYear(), c=load(cacheKey(S.zone,y), null);
  var stale = !c || (Date.now()-c.fetched > 7*864e5);
  if(force || stale) fetchJakim(S.zone, y, function(ok){ if(ok){ pushSchedule(); render(); if(force) toast(S.lang==="en"?"JAKIM times updated":"Waktu JAKIM dikemas kini"); } else if(force) toast(S.lang==="en"?"Could not reach JAKIM. Using estimate.":"Tidak dapat capai JAKIM. Guna anggaran."); });
  var now=new Date(); if(now.getMonth()>=10 && !load(cacheKey(S.zone,y+1),null)) fetchJakim(S.zone, y+1, function(ok){ if(ok) pushSchedule(); });
}

// ---------- schedule for native notifications ----------
function upcoming(days){
  var out=[], now=new Date();
  for(var i=-1;i<days;i++){ var d=addDays(now,i), t=getDay(d), ds=ymd(d);
    PR.forEach(function(k){ var kk=(k==="zohor"&&d.getDay()===5)?"jumaat":k; if(t[k]) out.push({t:at(ds,t[k]).getTime(), k:k, n:L[kk][0], ne:L[kk][1]}); }); }
  out.sort(function(a,b){return a.t-b.t}); return out;
}
function pushSchedule(){
  try{ N.setSchedule(JSON.stringify(upcoming(10)), JSON.stringify({lang:S.lang, zone:zoneShort(), countdown:S.countdown, preMin:S.preMin, notif:S.notif, rnum:S.rnum, rdir:S.rdir, vib:S.vib, sujud:S.sujud,
    quietPray:S.quietPray, alertStyle:S.alertStyle, lockShow:S.lockShow, pauseUntil:(S.pauseMode==="haid"?S.pauseUntil:0)})); }catch(e){}
  try{ if(N.setExtras) N.setExtras(JSON.stringify(buildExtras())); }catch(e){ console.error(e); }
}
function zoneShort(){ if(overseasNow()) return S.lang==="en"?"Overseas":"Luar negara"; var z=zoneById(S.zone); return z[2].split(",")[0]; }
function nextPrev(){
  var u=upcoming(3), now=Date.now(), prev=null, next=null;
  for(var i=0;i<u.length;i++){ if(u[i].t<=now) prev=u[i]; else { next=u[i]; break; } }
  return {prev:prev, next:next};
}
function currentPrayer(){ var np=nextPrev(); return np.prev ? np.prev.k : "isyak"; }
// 0.9.1: from syuruk until Zohor the current time is Dhuha, not Subuh
function inDhuha(){ try{ var d=new Date(), t=getDay(d), now=d.getTime(); return now>=at(ymd(d),t.syuruk).getTime() && now<at(ymd(d),t.zohor).getTime(); }catch(e){ return false; } }
function curWaktu(){ return inDhuha()?"dhuha":currentPrayer(); }
// One cell of the five-prayer row: Subuh's cell turns into Dhuha (from syuruk) once the sun is up
// Dhuha prayer may start about 15 minutes after syuruk (same figure as the forbidden-times card in Amal)
function dhuhaHM(t){ return adjTime(t.syuruk, 15); }
function prCell(k, t){ if(k==="subuh" && inDhuha()) return {k:"dhuha", hm:dhuhaHM(t), cur:true}; return {k:k, hm:t[k], cur:false}; }

// ---------- hijri ----------
var hijriFmt=null; try{ hijriFmt=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric"}); }catch(e){}
var hjMemo={};
function hijriOf(date){
  var mk=ymd(date)+"|"+S.zone+"|"+(S.hijriOffset||0); if(hjMemo[mk]!==undefined) return hjMemo[mk];
  return (hjMemo[mk]=hijriOf0(date));
}
function hijriOf0(date){
  var c=load(cacheKey(S.zone, date.getFullYear()), null), ds=ymd(date);
  if(c && c.days && c.days[ds] && c.days[ds].hijri){ var p=c.days[ds].hijri.split("-"); if(p.length===3) return {y:+p[0], m:+p[1], d:+p[2], src:"jakim"}; }
  if(!hijriFmt) return null;
  var parts=hijriFmt.formatToParts(addDays(date, S.hijriOffset||0)), o={src:"est"};
  parts.forEach(function(x){ if(x.type==="day") o.d=+x.value; if(x.type==="month") o.m=+x.value; if(x.type==="year") o.y=parseInt(x.value,10); });
  return o;
}
function hijriStr(h){ return h ? h.d+" "+HIJRI_MONTHS[h.m-1]+" "+h.y+"H" : ""; }

// ---------- holidays ----------
function groupOf(st){ return GROUP_A.indexOf(st)>=0 ? "A" : "B"; }
var islHolDone={};
function addIslamicHolidays(y){
  if(islHolDone[y]) return; islHolDone[y]=1;
  var L=[[1,1,"Awal Muharram","Awal Muharram (Islamic New Year)"],[3,12,"Maulidur Rasul","Prophet's Birthday"],[10,1,"Hari Raya Aidilfitri","Hari Raya Aidilfitri"],[10,2,"Hari Raya Aidilfitri (Hari Kedua)","Hari Raya Aidilfitri (2nd day)"],[12,10,"Hari Raya Aidiladha","Hari Raya Aidiladha"]];
  for(var d=new Date(y,0,1); d.getFullYear()===y; d=addDays(d,1)){
    var h=hijriOf(d); if(!h) continue;
    L.forEach(function(x){ if(h.m===x[0] && h.d===x[1]){ HOLIDAYS.push([ymd(d), x[2]+" (anggaran)", x[3]+" (estimate)", "ALL"]); } });
  }
}
function miniYear(y){
  var est=!HOLIDAYS.some(function(h){ return h[0].slice(0,4)===String(y) && /Aidilfitri/.test(h[1]) && !/anggaran/.test(h[1]); });
  if(est) addIslamicHolidays(y);
  var M=S.lang==="en"?ME:MS, wd=S.lang==="en"?["M","T","W","T","F","S","S"]:["I","S","R","K","J","S","A"], h='<div class="card"><h3>'+(S.lang==="en"?"Calendar ":"Kalendar ")+y+'</h3><div class="legend"><span><i class="ph"></i>'+T("ph")+'</span><span><i class="is"></i>'+T("is")+'</span></div><div class="minis">';
  for(var m=0;m<12;m++){
    var first=new Date(y,m,1), dim=new Date(y,m+1,0).getDate();
    h+='<div class="mini" data-mm="'+m+'" data-my="'+y+'"><div class="mn">'+M[m]+'</div><div class="mg">'+wd.map(function(x){return '<b>'+x+'</b>';}).join("");
    for(var i=0;i<(first.getDay()+6)%7;i++) h+='<span></span>';
    for(var d=1;d<=dim;d++){ var dt=new Date(y,m,d), ds=ymd(dt), ph=holidaysOn(ds,false), is=islamicOn(dt);
      h+='<span class="'+(ph.length?"r":"")+(dt.getDay()===5?" f":"")+(ds<ymd(new Date())?" p":"")+'"><i>'+(ph.length?'<em class="ph"></em>':'')+(is.length?'<em class="is"></em>':'')+'</i>'+d+'</span>'; }
    h+='</div></div>';
  }
  return h+'</div>'+(est?'<div class="mut small" style="margin-top:6px">'+(S.lang==="en"?"Islamic and lunar dates for "+y+" are estimates until the official announcement. School holidays will be added when KPM publishes the "+y+" calendar.":"Tarikh Islam dan bulan qamari bagi "+y+" adalah anggaran sehingga pengumuman rasmi. Cuti sekolah akan ditambah apabila KPM menerbitkan kalendar "+y+".")+'</div>':'')+'</div>';
}
function holidaysOn(ds, allStates){
  var res=[];
  HOLIDAYS.forEach(function(h){ if(h[0]!==ds) return; var s=h[3], applies, where="";
    if(s==="ALL"){ applies=true; where=S.lang==="en"?"National":"Kebangsaan"; }
    else if(s.except){ applies=s.except.indexOf(S.state)<0; where=(S.lang==="en"?"All except ":"Semua kecuali ")+s.except.join(", "); }
    else { applies=s.indexOf(S.state)>=0; where=s.join(", "); }
    if(applies||allStates) res.push({ms:h[1], en:h[2], where:where, mine:applies}); });
  return res;
}
function schoolOn(ds, allStates){
  var res=[], g=groupOf(S.state);
  SCHOOL.forEach(function(s){ if(ds<s[0]||ds>s[1]) return;
    var mine = s[4]===g || (s[4]==="B-SWK" && g==="B" && S.state!=="SWK") || (s[4]==="SWK" && S.state==="SWK");
    if(mine||allStates) res.push({ms:s[2], en:s[3], where:s[4]==="A"?"Kumpulan A":(s[4]==="SWK"?"Sarawak":(s[4]==="B-SWK"?"Kumpulan B (kecuali Sarawak)":"Kumpulan B")), mine:mine}); });
  return res;
}
function islamicOn(date){
  var h=hijriOf(date), res=[]; if(!h) return res;
  ISLAMIC_DAYS.forEach(function(x){ if(x[0]===h.m && x[1]===h.d) res.push({ms:x[2], en:x[3]}); });
  return res;
}
function sunnahFastOn(date){
  var h=hijriOf(date), res=[], wd=date.getDay();
  if(h && h.m===9) return res;
  if(h && h.m===10 && h.d===1) return res;
  if(h && h.m===12 && h.d>=10 && h.d<=13) return res;
  if(wd===1) res.push({ms:"Puasa sunat Isnin",en:"Sunnah fast (Monday)"});
  if(wd===4) res.push({ms:"Puasa sunat Khamis",en:"Sunnah fast (Thursday)"});
  if(h && h.d>=13 && h.d<=15) res.push({ms:"Puasa sunat Ayyamul Bidh",en:"Sunnah fast (Ayyamul Bidh)"});
  return res;
}

// ---------- prayer log ----------
var LOG = load("ihsan_log", {});
function logGet(ds,k){ return (LOG[ds]||{})[k]; }
function logSet(ds,k,v){ LOG[ds]=LOG[ds]||{}; if(v) LOG[ds][k]=v; else delete LOG[ds][k]; save("ihsan_log", LOG); }
// ---------- 0.9.0 usage time + prayer sessions ----------
// USAGE[ymd] = {t: seconds the app was open that day, v: {view: seconds}}. Counted only while the app is on screen.
var USAGE = load("ihsan_usage", {}), uMark = Date.now(), uOn = !document.hidden;
function uView(){ var ov=document.getElementById("overlay"); if(ov && /theme-/.test(ov.className) && !ov.classList.contains("hidden")) return "rakaat"; return view==="learn"&&learnPg?("learn:"+learnPg):view; }
function usageFlush(){
  var now=Date.now(), a=uMark; uMark=now;
  if(!uOn) return;
  if(now-a>90000) a=now-15000; // timers were frozen (phone asleep): count only one tick
  var v=uView();
  while(a<now){ var d=new Date(a), nd=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(), b=Math.min(now,nd), sec=(b-a)/1000, k=ymd(d);
    var u=USAGE[k]=USAGE[k]||{t:0,v:{}}; u.t+=sec; u.v[v]=(u.v[v]||0)+sec; a=b; }
  save("ihsan_usage", USAGE);
}
function usageOn(on_){ usageFlush(); uOn=on_; uMark=Date.now(); }
setInterval(usageFlush, 15000);
document.addEventListener("visibilitychange", function(){ usageOn(!document.hidden); });
function useSec(ds){ return USAGE[ds]?USAGE[ds].t:0; }
function durStr(sec, short){ sec=Math.round(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  if(h) return h+(short?"j ":L2x(" jam "," h "))+m+(short?"m":L2x(" min"," min"));
  if(m) return m+(short?"m":L2x(" min"," min"))+(short||m>=10?"":" "+s+"s");
  return s+"s"; }
function durEn(sec){ sec=Math.round(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60); return h?(h+(en_()?"h ":"j ")+m+"m"):(m?m+"m":sec+"s"); }
// PLOG: rakaat counter sessions [{d:ymd, s:solat key, n:name, w:waktu when started, t0:ms, sec, c:counted, tg:target}]
var PLOG = load("ihsan_prlog", []);
function plogAdd(r){ PLOG.push(r); if(PLOG.length>3000) PLOG=PLOG.slice(-3000); save("ihsan_prlog", PLOG); }
function plogDay(ds){ return PLOG.filter(function(r){ return r.d===ds; }); }
function plogSec(ds){ return plogDay(ds).reduce(function(a,r){ return a+r.sec; },0); }
// Which of the five daily prayers were counted on a day: {subuh:{sec,c,tg,t0}, ...}
function fardDay(ds){ var o={}; plogDay(ds).forEach(function(r){ var k=r.s==="jumaat"?"zohor":PR.indexOf(r.s)>=0?r.s:(r.q||null); if(!k) return; if(!o[k]||r.c>=r.tg) o[k]=r; }); return o; }
function prRegister(ds, small){
  var f=fardDay(ds);
  return '<div class="preg'+(small?' sm':'')+'">'+PR.map(function(k){ var r=f[k], ok=r&&r.c>=r.tg; return '<div class="pr'+(ok?' ok':r?' part':'')+'"><b>'+(k==="zohor"&&isFri(ds+"T12:00:00")?T("jumaat"):T(k))+'</b><span>'+(r?(ok?'✓ ':'')+durEn(r.sec):'–')+'</span>'+(r&&!small?'<small>'+hm12(r.t0)+'</small>':'')+'</div>'; }).join("")+'</div>';
}
var QADA = load("ihsan_qada", {subuh:0,zohor:0,asar:0,maghrib:0,isyak:0});

// ---------- views ----------
var view = load("ihsan_view", "home"), sub = {zikir:"tasbih", doa:"mathurat"}, timers=[];
if(view==="rakaat"||view==="qibla") view="solat";
if(view==="kids") view="home";
if(view==="halal"){ view="alat"; } if(view==="more") view="home";
if(view==="home" && launcherOn()) view="solat";
var NAV = [["home","🏠"],["solat","🕌"],["sunat","🌙"],["learn","📚"],["halal","🔍"],["cal","📅"],["more","⚙️"]];
var sunPage = load("ihsan_sunpage","zikir");
if(["zikir","doa","mathurat"].indexOf(view)>=0){ sunPage=view; view="sunat"; }
function clearTimers(){ timers.forEach(function(t){clearInterval(t)}); timers=[]; }
function go(v){ if(S.kidLock && v!=="kids" && !(v==="learn" && learnFrom==="kids")) v="kids"; if(S.appLock && !S.kidLock && v==="more"){ toast(L2x("Tetapan dikunci. Sapu 🔒 di atas 5 kali untuk buka.","Settings are locked. Swipe the 🔒 at the top 5 times to unlock.")); return; } if(["zikir","doa","mathurat","amal","wirid"].indexOf(v)>=0){ sunPage=v; save("ihsan_sunpage",v); v="sunat"; } if(view==="solat" && v!=="solat") N.stopCompass(); if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){} view=v; save("ihsan_view", v); render(); document.getElementById("view").scrollTop=0; }
window.onBack = function(){
  var ov=document.getElementById("overlay");
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(view==="learn" && (learnPg==="radio"||learnPg==="podcast") && window.IbMedia && IbMedia.back()) return true;
  if(view==="learn" && ILMU_PG[learnPg] && window.IlmuView && IlmuView.back()) return true;
  if(view==="learn" && learnPg){ learnBack(); return true; }
  if(S.kidLock) return true; // 0.31.0: Back does nothing while kids mode is locked (Home and Recents are blocked by screen pinning)
  if(view!=="home"){ go("home"); return true; }
  return false;
};
function closeOverlay(){ var ov=document.getElementById("overlay"); ov.classList.add("hidden"); ov.innerHTML=""; ov._close=null; ov.className="hidden"; }
function render(){
  clearTimers(); hjMemo={}; SAY=[]; SHR=[]; var _sn=document.getElementById("subnav"); if(_sn && view!=="sunat") _sn.remove(); document.getElementById("view").classList.remove("hasSub"); if(N.setVolumeKeys) N.setVolumeKeys(false);
  var nav=document.getElementById("nav");
  var appEl=document.getElementById("app"); appEl.classList.toggle("kidlock", !!S.kidLock); appEl.classList.toggle("senior", !!S.senior && !S.kidLock);
  nav.innerHTML = S.senior && !S.kidLock ? (view==="home"?'':'<button data-v="home" class="snHome">🏠 '+L2x("Kembali ke Utama","Back to Home")+'</button>') : NAV.map(function(n){ return '<button data-v="'+n[0]+'" class="'+(view===n[0]?"on":"")+'"><span class="ic">'+n[1]+'</span>'+T(n[0]==="home"?"utama":n[0])+'</button>'; }).join("");
  nav.querySelectorAll("button").forEach(function(b){ b.onclick=function(){ go(b.getAttribute("data-v")); }; });
  hdrTick();
  var el=document.getElementById("view");
  ({home:vHome, solat:vSolat, sunat:vSunatHub, zikir:vZikir, doa:vDoa, mathurat:vMathurat, cal:vCal, more:vMore, learn:vLearn, kids:vKids, halal:vHalal}[view]||vHome)(el);
  dockFix(); setTimeout(dockFix,60);
}
// Shortcut chips live in a .dock bar fixed above the bottom nav (and the Sunat sub-bar)
function dockFix(){
  var el=document.getElementById("view"), d=el.querySelector(".dock"), nav=document.getElementById("nav"), sn=document.getElementById("subnav");
  if(sn) sn.style.bottom=nav.offsetHeight+"px"; var snH=sn?sn.offsetHeight:0, mini=document.getElementById("mini"), mH=mini&&!mini.classList.contains("hidden")?mini.offsetHeight:0;
  if(mini) mini.style.bottom=(nav.offsetHeight+snH)+"px";
  if(!d){ el.style.paddingBottom=mH?(90+snH+mH)+"px":""; notchFix(nav.offsetHeight+snH+mH); return; }
  // 0.34.0: more than one dock (Alat › Kewangan pages under a page's own dock) stack upwards
  var ds=[].slice.call(el.querySelectorAll(".dock")).filter(function(x){ return !x.closest(".ibghost"); }), b0=nav.offsetHeight+snH+mH, hh=0;
  ds.forEach(function(x){ x.style.bottom=(b0+hh)+"px"; hh+=x.offsetHeight; });
  el.style.paddingBottom=(90+snH+mH+hh+8)+"px";
  notchFix(b0+hh);
}

// 0.18.0 notch: ▾ hides the header and every bottom bar (▴ brings them back); ✕ turns on auto-hide while scrolling down
var barsOff=false;
function notchFix(h){
  var app=document.getElementById("app"), n=document.getElementById("notch");
  if(!n){ n=document.createElement("div"); n.id="notch"; n.innerHTML='<button id="ntT" aria-label="Sembunyi / tunjuk bar"></button><button id="ntA" aria-label="Auto">✕</button><button id="ntL" aria-label="Kunci bar">🔒</button>'; app.appendChild(n);
    n.querySelector("#ntL").onclick=function(e){ e.stopPropagation(); barEditSet(!barEdit); };
    n.querySelector("#ntT").onclick=function(e){ e.stopPropagation(); setBars(!barsOff); };
    n.querySelector("#ntA").onclick=function(e){ e.stopPropagation(); S.barsAuto=!S.barsAuto; saveS(); toast(S.barsAuto?L2x("Auto-sembunyi hidup: bar hilang bila tatal ke bawah","Auto-hide on: bars hide as you scroll down"):L2x("Auto-sembunyi dimatikan","Auto-hide off")); if(!S.barsAuto) setBars(false); else notchFix(); };
    var v=document.getElementById("view"), lastY=0; v.addEventListener("scroll", function(){ var y=v.scrollTop, d=y-lastY; if(Math.abs(d)<14) return; lastY=y; if(!S.barsAuto) return; if(d>0 && y>60 && !barsOff) setBars(true); else if(d<0 && barsOff) setBars(false); }, {passive:true}); }
  n.classList.toggle("off", barsOff); n.classList.toggle("auto", !!S.barsAuto); n.classList.toggle("hidden", !!S.kidLock);
  n.querySelector("#ntT").textContent=barsOff?"▴":"▾";
  // 0.5.3: 🔒 unlocks the bars for reordering and resizing; Tetapan › Paparan can hide any of the three notch buttons
  var nh=S.ntHide||{}, lk=n.querySelector("#ntL"); lk.textContent=barEdit?"🔓":"🔒"; lk.classList.toggle("on", barEdit);
  n.querySelector("#ntT").classList.toggle("hidden", !!nh.T); n.querySelector("#ntA").classList.toggle("hidden", !!nh.A); lk.classList.toggle("hidden", !!nh.L || !!S.appLock || !!S.kidLock || barsOff);
  var vis=[].slice.call(n.querySelectorAll("button")).filter(function(b){ return !b.classList.contains("hidden"); }); n.classList.toggle("none", !vis.length);
  [].forEach.call(n.querySelectorAll("button"), function(b){ b.classList.remove("first","last"); }); if(vis.length){ vis[0].classList.add("first"); vis[vis.length-1].classList.add("last"); }
  if(h!=null && !barsOff) n.style.bottom=h+"px"; else if(barsOff) n.style.bottom="calc(4px + env(safe-area-inset-bottom))";
}
// ---------- 0.5.3 bar edit mode: drag tabs to reorder, pull the handle to resize (S.tabOrder, S.subOrder, S.barSize 0-4) ----------
var barEdit=false, barEditT=null;
function barSizeApply(n){ var a=document.getElementById("app"); for(var i=1;i<=5;i++) a.classList.toggle("bs"+i, n===i); }
function barEditSet(on){ if(on && (S.appLock || S.kidLock)) return; barEdit=on; clearTimeout(barEditT);
  document.getElementById("app").classList.toggle("editBars", on);
  if(on){ toast(L2x("Seret tab untuk susun semula · tarik pemegang untuk ubah saiz","Drag tabs to reorder · pull the handle to resize")); barEditIdle(); }
  barEditBind(); notchFix(); }
function barEditIdle(){ clearTimeout(barEditT); if(barEdit) barEditT=setTimeout(function(){ barEditSet(false); }, 60000); }
document.addEventListener("pointerdown", function(){ if(barEdit) barEditIdle(); }, true);
document.addEventListener("visibilitychange", function(){ if(document.hidden && barEdit) barEditSet(false); });
function barEditBind(){
  var nav=document.getElementById("nav"), sn=document.getElementById("subnav"), app=document.getElementById("app"), g=document.getElementById("barGrip"), rs=document.getElementById("barReset");
  if(!barEdit){ if(g) g.remove(); if(rs) rs.remove(); return; }
  if(nav && !nav._srt){ nav._srt=1; IbSort(nav, {items:"button[data-v]", axis:"x", on:function(){ return barEdit; }, done:function(ids){ var all=TABS_ALL.map(function(t){ return t[0]; }); S.tabOrder=ids.concat(all.filter(function(k){ return ids.indexOf(k)<0; })); saveS(); render(); }, key:"data-v"}); }
  if(sn && !sn._srt){ sn._srt=1; var v0=view; IbSort(sn, {items:"button[data-sp]", axis:"x", on:function(){ return barEdit; }, key:"data-sp", done:function(ids){ S.subOrder=S.subOrder||{};
    // keep a hidden sub-tab (Haid) where it was
    if(v0==="cal" && periodHidden() && ids.indexOf("haid")<0){ var old=ordered(SUBS_FULL.cal, S.subOrder.cal).map(function(x){ return x[0]; }); ids.splice(Math.min(Math.max(0, old.indexOf("haid")), ids.length), 0, "haid"); }
    S.subOrder[v0]=ids; saveS(); render(); }}); }
  if(!g){ g=document.createElement("div"); g.id="barGrip"; g.innerHTML='<i></i>'; g.setAttribute("aria-label", L2x("Tarik untuk ubah saiz bar","Pull to resize the bar")); app.appendChild(g);
    var y0=null, s0=0; g.addEventListener("pointerdown", function(e){ y0=e.clientY; s0=S.barSize||0; try{ g.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
    g.addEventListener("pointermove", function(e){ if(y0===null) return; var n=Math.max(0, Math.min(5, s0+Math.round((e.clientY-y0)/20))); if(n!==(S.barSize||0)){ S.barSize=n; barSizeApply(n); dockFix(); barGripPos(); if(N.vibrate) N.vibrate(12); } });
    var up=function(){ if(y0===null) return; y0=null; saveS(); dockFix(); barGripPos(); }; g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up); }
  if(!rs){ rs=document.createElement("button"); rs.id="barReset"; rs.className="chip"; rs.textContent="↺ "+L2x("Set semula susunan","Reset order"); app.appendChild(rs);
    rs.onclick=function(){ S.tabOrder=null; S.subOrder={}; S.barSize=0; barSizeApply(0); saveS(); render(); toast(L2x("Susunan dan saiz asal","Original order and size")); }; }
  barGripPos();
}
// 0.5.4 (Ihsan): the handle sits centred just above the notch, as wide as the notch, breathing
function barGripPos(){ var g=document.getElementById("barGrip"), rs=document.getElementById("barReset"), nav=document.getElementById("nav"), nt=document.getElementById("notch"); if(!g||!nav) return; var t=nav.getBoundingClientRect().top;
  var nr=nt && nt.offsetWidth ? nt.getBoundingClientRect() : null; g.style.width=(nr ? Math.max(60, nr.width) : 84)+"px"; g.style.top=((nr ? nr.top : t)-16)+"px"; if(rs){ var top=t; [].forEach.call(document.querySelectorAll("#subnav, #view .dock"), function(x){ var r=x.getBoundingClientRect().top; if(x.offsetHeight && r<top) top=r; }); rs.style.top=(top-40)+"px"; } }
// drag to reorder (tabs, sub-tabs, family rows): items move aside as the dragged one passes; done(ids) gets the new order
function IbSort(box, o){
  var drag=null, hold=null;
  var list=function(){ return [].slice.call(box.querySelectorAll(o.items)); };
  var startDrag=function(it, e){ var L=list(), x=o.axis==="x"; drag={it:it, L:L, i:L.indexOf(it), p0:x?e.clientX:e.clientY, r:L.map(function(b){ var r=b.getBoundingClientRect(); return x?[r.left, r.width]:[r.top, r.height]; }), to:L.indexOf(it), id:e.pointerId};
    it.classList.add("ibdrag"); try{ it.setPointerCapture(e.pointerId); }catch(er){} if(N.vibrate) N.vibrate(20); };
  box.addEventListener("pointerdown", function(e){ if(o.on && !o.on()) return; var it=e.target.closest(o.items); if(!it || !box.contains(it)) return;
    if(o.handle && !e.target.closest(o.handle)) return; e.preventDefault();
    if(o.hold){ var sx=e.clientX, sy=e.clientY; hold={t:setTimeout(function(){ hold=null; startDrag(it, e); }, o.hold), sx:sx, sy:sy}; } else startDrag(it, e); });
  box.addEventListener("pointermove", function(e){ if(hold){ if(Math.abs(e.clientX-hold.sx)+Math.abs(e.clientY-hold.sy)>8){ clearTimeout(hold.t); hold=null; } return; }
    if(!drag) return; e.preventDefault(); var x=o.axis==="x", d=(x?e.clientX:e.clientY)-drag.p0, me=drag.r[drag.i], c=me[0]+me[1]/2+d, to=drag.i;
    drag.r.forEach(function(r, k){ if(k<drag.i && c<r[0]+r[1]/2) to=Math.min(to, k); if(k>drag.i && c>r[0]+r[1]/2) to=Math.max(to, k); });
    drag.to=to; drag.it.style.transform=(x?"translateX(":"translateY(")+d+"px)";
    drag.L.forEach(function(b, k){ if(b===drag.it) return; var sh=0; if(k>drag.i && k<=to) sh=-me[1]; else if(k<drag.i && k>=to) sh=me[1]; b.style.transform=sh?(x?"translateX(":"translateY(")+sh+"px)":""; }); });
  var end=function(){ if(hold){ clearTimeout(hold.t); hold=null; } if(!drag) return; var L=drag.L, i=drag.i, to=drag.to; L.forEach(function(b){ b.style.transform=""; b.classList.remove("ibdrag"); }); drag=null;
    if(to===i) return; var m=L.splice(i, 1)[0]; L.splice(to, 0, m); o.done(L.map(function(b){ return b.getAttribute(o.key); })); };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  box.addEventListener("touchmove", function(e){ if(drag && e.cancelable) e.preventDefault(); }, {passive:false});
  box.addEventListener("click", function(e){ if(o.on && o.on() && !o.handle) { e.stopPropagation(); } }, true);
}
window.IbSort=IbSort;
// ---------- 0.5.3/0.5.4 dropdown (never the Android one): tap the value for the list; hold it and slide up/down, release to choose ----------
// items [[value, label]]; multi: the value is an array and a pick toggles the item.
function ibDdWire(v, items, get, multi, pick){
  var t=null, wh=null, y0=0, i0=0, idx=0, rowH=40, sx=0, sy=0, moved=false;
  var its=function(){ return typeof items==="function"?items():items; };
  var draw=function(){ wh.querySelectorAll("[data-di]").forEach(function(r){ r.classList.toggle("on", +r.getAttribute("data-di")===idx); }); wh.querySelector(".ibddwl").style.transform="translateY("+(-idx*rowH)+"px)"; };
  v.addEventListener("pointerdown", function(e){ if(e.button) return; sx=e.clientX; sy=e.clientY; y0=e.clientY; moved=false; try{ v.setPointerCapture(e.pointerId); }catch(er){}
    t=setTimeout(function(){ t=null; var L=its(), cur=get(), r=v.getBoundingClientRect(); i0=multi?0:Math.max(0, L.findIndex(function(x){ return String(x[0])===String(cur); })); idx=i0;
      wh=document.createElement("div"); wh.className="ibddw"; wh.style.left=r.left+"px"; wh.style.width=Math.max(r.width, 150)+"px"; wh.style.top=(r.top+r.height/2-rowH/2)+"px";
      wh.innerHTML='<div class="ibddwl">'+L.map(function(x, k){ var on=multi&&(cur||[]).indexOf(x[0])>=0; return '<div data-di="'+k+'">'+(multi?(on?"☑ ":"☐ "):"")+esc(x[1])+'</div>'; }).join("")+'</div>';
      document.body.appendChild(wh); draw(); if(N.vibrate) N.vibrate(15); }, 280); });
  v.addEventListener("pointermove", function(e){ if(t){ if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10){ clearTimeout(t); t=null; moved=true; } return; } if(!wh) return; e.preventDefault();
    var n=Math.max(0, Math.min(its().length-1, i0+Math.round((e.clientY-y0)/rowH))); if(n!==idx){ idx=n; draw(); if(N.vibrate) N.vibrate(8); } });
  v.addEventListener("pointerup", function(){ if(t){ clearTimeout(t); t=null; if(!moved) ibDdList(v, its, get, multi, pick); return; } if(!wh) return; wh.remove(); wh=null; pick(its()[idx][0]); });
  v.addEventListener("pointercancel", function(){ if(t){ clearTimeout(t); t=null; } if(wh){ wh.remove(); wh=null; } });
  v.addEventListener("touchmove", function(e){ if(wh && e.cancelable) e.preventDefault(); }, {passive:false});
  v.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  v.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); ibDdList(v, its, get, multi, pick); } });
}
// the full list, opened next to the value (below it, or above when there is no room over the bottom bars)
function ibDdList(v, its, get, multi, pick){
  var old=document.querySelector(".ibddl"); if(old){ var same=old._v===v; old._close(); if(same) return; }
  var r=v.getBoundingClientRect(), l=document.createElement("div"); l.className="ibddl"; l._v=v;
  var fill=function(){ var cur=get(); l.innerHTML=its().map(function(x, k){ var on=multi?(cur||[]).indexOf(x[0])>=0:String(cur)===String(x[0]); return '<button data-dk="'+k+'" data-dv="'+esc(x[0])+'" class="'+(on?"on":"")+'"'+(x[2]?' disabled':'')+'>'+(multi?(on?"☑ ":"☐ "):(on?"✓ ":""))+esc(x[1])+'</button>'; }).join("");
    l.querySelectorAll("[data-dk]").forEach(function(o2){ o2.onclick=function(ev){ ev.stopPropagation(); pick(its()[+o2.getAttribute("data-dk")][0]); if(multi) fill(); else l._close(); }; }); };
  fill(); document.body.appendChild(l);
  var bars=window.innerHeight; [].forEach.call(document.querySelectorAll("#nav, #subnav, #view .dock"), function(x){ var tp=x.getBoundingClientRect().top; if(x.offsetHeight && tp>0 && tp<bars && !(document.getElementById("overlay").contains(v))) bars=tp; });
  var below=bars-r.bottom-8, above=r.top-60, h=Math.min(l.scrollHeight, 320), w=Math.max(r.width, 170), left=Math.min(r.left, window.innerWidth-w-8);
  if(below>=Math.min(h, 200) || below>=above){ h=Math.min(h, below); l.style.top=(r.bottom+4)+"px"; } else { h=Math.min(h, above); l.style.top=(r.top-h-4)+"px"; }
  l.style.maxHeight=h+"px"; l.style.left=Math.max(8, left)+"px"; l.style.width=w+"px";
  var on=l.querySelector(".on"); if(on) l.scrollTop=Math.max(0, on.offsetTop-h/2);
  var off=function(ev){ if(!l.contains(ev.target) && ev.target!==v && !v.contains(ev.target)) l._close(); };
  l._close=function(){ l.remove(); document.removeEventListener("pointerdown", off, true); window.removeEventListener("scroll", cl, true); };
  var cl=function(ev){ if(!l.contains(ev.target)) l._close(); };
  setTimeout(function(){ document.addEventListener("pointerdown", off, true); window.addEventListener("scroll", cl, true); }, 0);
}
var IbDrop={html:function(id, items, val, multi, ph){ return '<div class="ibdd" data-dd="'+esc(id)+'"><div class="ibddv noswipe" role="button" tabindex="0">'+IbDrop.label(items, val, multi, ph)+'</div></div>'; },
  label:function(items, val, multi, ph){ if(multi){ var l=items.filter(function(x){ return (val||[]).indexOf(x[0])>=0; }).map(function(x){ return esc(x[1]); }); return l.length?l.join(", "):'<span class="mut">'+esc(ph||"—")+'</span>'; }
    var f=items.filter(function(x){ return String(x[0])===String(val); })[0]; return f&&f[0]!==""?esc(f[1]):'<span class="mut">'+esc(ph||"—")+'</span>'; },
  bind:function(root, id, items, get, multi, onPick){ var w=root.querySelector('[data-dd="'+id+'"]'); if(!w) return;
    ibDdWire(w.querySelector(".ibddv"), items, get, multi, function(k){ var cur=get(); if(multi){ var a=(cur||[]).slice(), i=a.indexOf(k); if(i>=0) a.splice(i,1); else a.push(k); onPick(a); } else onPick(k); }); }};
// every <select> in the app becomes this dropdown (the real select stays hidden and still fires "change")
function ibSelect(sel){ if(sel._ib || sel.multiple || sel.hasAttribute("data-native")) return; sel._ib=1;
  var b=document.createElement("div"); b.className="ibsel noswipe"+(sel.className?" "+sel.className:""); b.setAttribute("role","button"); b.tabIndex=0; if(sel.id) b.setAttribute("data-for", sel.id);
  var st=sel.getAttribute("style"); if(st) b.setAttribute("style", st);
  sel.classList.add("ibselh"); sel.parentNode.insertBefore(b, sel.nextSibling);
  var lab=function(){ var o=sel.options[sel.selectedIndex]; b.textContent=o?o.text:"—"; b.classList.toggle("dis", sel.disabled); };
  var its=function(){ return [].map.call(sel.options, function(o){ return [o.value, o.text, o.disabled]; }); };
  ibDdWire(b, its, function(){ return sel.value; }, false, function(k){ if(sel.disabled) return; if(sel.value!==k){ sel.value=k; lab(); sel.dispatchEvent(new Event("input", {bubbles:true})); sel.dispatchEvent(new Event("change", {bubbles:true})); } });
  sel.addEventListener("change", lab); b.addEventListener("pointerdown", lab, true);
  new MutationObserver(lab).observe(sel, {childList:true, subtree:true, attributes:true}); lab();
  // code that sets sel.value without an event: keep the label right
  try{ var d=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value"); Object.defineProperty(sel, "value", {get:function(){ return d.get.call(sel); }, set:function(x){ d.set.call(sel, x); lab(); }}); }catch(e){}
}
function ibSelectAll(root){ (root.tagName==="SELECT"?[root]:[].slice.call(root.querySelectorAll?root.querySelectorAll("select"):[])).forEach(ibSelect); }
new MutationObserver(function(ms){ ms.forEach(function(m){ [].forEach.call(m.addedNodes, function(n){ if(n.nodeType===1) ibSelectAll(n); }); }); }).observe(document.body, {childList:true, subtree:true});
ibSelectAll(document.body);
window.IbDrop=IbDrop; window.ibSelectAll=ibSelectAll;
// ---------- 0.5.5 folder sidebar for galleries (Books, Recipes): collapsible, ＋ new folder, ⋮ on each folder ----------
// html(o): o = {open, cur, items:[{k, ic, n, c (count), menu (bool)}], body (the gallery html)}; bind(root, {pick(k), add(), menu(k, btn), toggle(open)})
var IbFold={html:function(o){ return '<div class="ibfw'+(o.open?' open':'')+'"><aside class="ibfold noswipe"><div class="ibfh"><button class="ibft" data-fx="1" aria-label="📁">'+(o.open?'◀':'📁')+'</button>'+(o.open?'<b>'+esc(L2x("Folder","Folders"))+'</b><button class="ibfa" data-fa="1" aria-label="＋">＋</button>':'')+'</div>'+
    '<div class="ibfl">'+o.items.map(function(x){ return '<div class="ibfi'+(o.cur===x.k?' on':'')+'" data-fk="'+esc(x.k)+'" title="'+esc(x.n)+'"><span class="ibfic">'+x.ic+'</span>'+(o.open?'<span class="ibfn">'+esc(x.n)+'</span><small>'+(x.c==null?'':x.c)+'</small>'+(x.menu?'<button class="ibfm" data-fm="'+esc(x.k)+'" aria-label="⋮">⋮</button>':'<i class="ibfm0"></i>'):'')+'</div>'; }).join("")+
    (o.open?'':'<div class="ibfi" data-fa="1" title="＋"><span class="ibfic">＋</span></div>')+'</div></aside><div class="ibfmain">'+o.body+'</div></div>'; },
  bind:function(root, o){ var w=root.querySelector(".ibfw"); if(!w) return;
    w.querySelectorAll("[data-fk]").forEach(function(b){ b.onclick=function(e){ if(e.target.closest("[data-fm]")) return; o.pick(b.getAttribute("data-fk")); }; });
    w.querySelectorAll("[data-fa]").forEach(function(b){ b.onclick=function(){ o.add(); }; });
    w.querySelectorAll("[data-fm]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); o.menu(b.getAttribute("data-fm"), b); }; });
    var t=w.querySelector("[data-fx]"); if(t) t.onclick=function(){ o.toggle(!w.classList.contains("open")); }; },
  // ask for a folder name; done(name)
  ask:function(title, val, done){ var ov=showSheet(title, '<div class="radd"><input id="ibfN" class="rin" value="'+esc(val||"")+'" maxlength="40" placeholder="'+esc(L2x("Nama folder","Folder name"))+'"><button class="btn gold" id="ibfOk">✓</button></div>');
    var i=ov.querySelector("#ibfN"); setTimeout(function(){ i.focus(); }, 80); var go_=function(){ var v=i.value.trim(); if(!v) return; closeOverlay(); done(v); };
    ov.querySelector("#ibfOk").onclick=go_; i.onkeydown=function(e){ if(e.key==="Enter") go_(); }; },
  // ⋮ menu for one folder: rename / delete
  menu:function(name, onRen, onDel){ var ov=showSheet("📁 "+esc(name), '<div class="btns"><button class="btn alt" id="ibfR">✏️ '+L2x("Namakan semula","Rename")+'</button><button class="btn alt" id="ibfD">🗑️ '+L2x("Padam folder","Delete folder")+'</button></div><div class="mut tiny" style="margin-top:8px">'+L2x("Memadam folder tidak memadam isinya.","Deleting a folder does not delete what is in it.")+'</div>');
    ov.querySelector("#ibfR").onclick=function(){ closeOverlay(); IbFold.ask("✏️ "+L2x("Namakan semula","Rename"), name, onRen); };
    ov.querySelector("#ibfD").onclick=function(){ closeOverlay(); if(confirm(L2x("Padam folder ","Delete folder ")+name+"?")) onDel(); }; }};
window.IbFold=IbFold;
// 0.5.4: after a swipe or ‹ › the selected page button scrolls into view in its row (e.g. Haid › Kesihatan at the far right)
function ibChips(){ var vw=document.getElementById("view"); if(!vw) return;
  [].forEach.call(vw.querySelectorAll(".on, .cur"), function(c){ if(c.closest(".ibghost")) return; for(var n=c.parentNode; n && n!==vw && n.nodeType===1; n=n.parentNode){ if(n.scrollWidth>n.clientWidth+4){ var ox=getComputedStyle(n).overflowX; if(ox==="auto"||ox==="scroll"){
    var r=c.getBoundingClientRect(), b=n.getBoundingClientRect(); if(r.left<b.left+4 || r.right>b.right-4){ var x=n.scrollLeft+(r.left-b.left)-(b.width-r.width)/2; try{ n.scrollTo({left:x, behavior:"smooth"}); }catch(e){ n.scrollLeft=x; } } break; } } } }); }
window.ibChips=ibChips;
function setBars(off){ barsOff=off; document.getElementById("app").classList.toggle("barsOff", off); dockFix(); }

// Sticky header: date + Hijri, current prayer and time left
var hdrLastDay=null;
function hdrTick(){
  var e=function(id){return document.getElementById(id)}; if(!e("hCur")) return;
  var d=new Date(), dk=ymd(d)+S.lang+S.hijriOffset;
  if(hdrLastDay!==dk){ hdrLastDay=dk; e("topSub").innerHTML='<bdi>'+d.toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short",year:"numeric"})+'</bdi> · '+hijriStr(hijriOf(d)); }
  var np=nextPrev(); if(!np.next){ e("hCur").textContent=""; e("hLeft").textContent=""; return; }
  var now=Date.now(), f=function(t){ var x=new Date(t); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); };
  if(inDhuha()){ e("hCur").innerHTML='<b><bdi>'+T("dhuha")+'</bdi></b> '+fmt12(dhuhaHM(getDay(d))); }
  else e("hCur").innerHTML = np.prev ? '<b><bdi>'+prN(np.prev.k,np.prev.t)+'</bdi></b> '+f(np.prev.t) : '';
  var left=Math.max(0,np.next.t-now), s=Math.floor(left/1000), hh=Math.floor(s/3600), mm=Math.floor(s%3600/60), ss=s%60;
  e("hLeft").innerHTML='<bdi>'+prN(np.next.k,np.next.t)+'</bdi> <span class="hl">−'+(hh?hh+":"+pad(mm):mm)+":"+pad(ss)+'</span>';
  var pt=np.prev?np.prev.t:np.next.t-3*36e5; e("hBar").style.width=Math.max(0,Math.min(100,(now-pt)*100/(np.next.t-pt))).toFixed(1)+"%";
  if(S.autoNight && (nightNow()?"night":S.appTheme)!==themeNow) applyTheme();
  if(left<1000 && !hdrTick._r){ hdrTick._r=true; setTimeout(function(){ hdrTick._r=false; render(); },1500); }
}
setInterval(hdrTick,1000);
// SOLAT (home + rakaat)
function vSolat(el){
  var now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now), en=S.lang==="en";
  var html='';
  if(false){
    html+='<div class="card"><h3>'+(S.lang==="en"?"Welcome":"Selamat datang")+'</h3><div class="small mut">'+(S.lang==="en"?"Allow location to pick your JAKIM zone and Qibla, and notifications for prayer alerts.":"Benarkan lokasi untuk zon JAKIM dan kiblat, serta notifikasi untuk makluman waktu solat.")+'</div><div class="btns" style="margin-top:10px"><button class="btn" id="obLoc">📍 '+(S.lang==="en"?"Location":"Lokasi")+'</button><button class="btn" id="obNot">🔔 '+T("notifs")+'</button><button class="btn alt" id="obDone">OK</button></div></div>';
  }
  html+='<div class="card trow">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+
    '<div class="trow2">'+["imsak","syuruk"].map(function(k){ return '<span>'+T(k)+' <b>'+fmt12(t[k])+'</b></span>'; }).join("")+(S.tahajjud||true?'<span>'+(en?"Last third":"1/3 malam akhir")+' <b>'+lastThird(now)+'</b></span>':'')+'</div>'+
    '<div class="src0"><span class="badge '+(t.src==="jakim"?"":"warn")+'" id="refresh">'+(t.src==="jakim"?T("jakim"):t.src==="abroad"?(en?"Calculated: ":"Kiraan: ")+(METHODS[S.calcMethod]||METHODS.MWL)[3]:T("est"))+' ↻</span>'+(adjAny()?' <span class="badge">± '+(en?"adjusted":"dilaras")+'</span>':'')+'</div></div>';
  if(musafirNow()) html+=musafirBanner();
  html+='<div class="card qmini" id="qCard"></div>';
  html+=rakaatSetup();
  el.innerHTML=html;
  qiblaCard(el.querySelector("#qCard"), true);
  el.querySelector("#refresh").onclick=function(){ ensureData(true); };
  if(false){
    el.querySelector("#obLoc").onclick=function(){ askLocation(true); };
    el.querySelector("#obNot").onclick=function(){ N.requestPerm("notif"); };
    el.querySelector("#obDone").onclick=function(){ S.onboard=true; saveS(); render(); };
  }
  bindRakaat(el);
  bindMusafir(el);
}
function askLocation(setZone){
  var hl=function(r){ off("location",hl); if(r.error){ toast(S.lang==="en"?"Location unavailable":"Lokasi tidak tersedia"); return; }
    S.lat=r.lat; S.lon=r.lon; S.locAt=Date.now();
    var wasAbroad=S.overseas; S.overseas=!inMalaysia(r.lat,r.lon);
    if(S.overseas && !wasAbroad && S.locMode==="auto") toast(S.lang==="en"?"Outside Malaysia: using calculated prayer times":"Di luar Malaysia: guna waktu solat kiraan");
    var wasMus=musafirNow._last; var mNow=musafirNow(); if(mNow && !wasMus) toast(S.lang==="en"?"You are travelling (musafir): qasar and jamak shown on Solat":"Anda musafir: qasar dan jamak dipaparkan di tab Solat"); musafirNow._last=mNow;
    if(!S.overseas && (setZone || S.zoneAuto)){ var z=nearestZone(r.lat,r.lon); if(z && z[0]!==S.zone){ S.zone=z[0]; S.state=z[1]; toast(T("zone")+": "+z[0]+" · "+z[2].split(",")[0]); ensureData(true);} }
    saveS(); render(); };
  var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } else toast(S.lang==="en"?"Location permission denied":"Kebenaran lokasi ditolak"); };
  if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { on("perm",hp); N.requestPerm("location"); }
}
function openFinder(q){
  var p=zonePoint();
  var go2=function(){ N.openMaps(q, S.lat!=null?S.lat:p[0], S.lon!=null?S.lon:p[1]); };
  if(S.lat==null && N.hasPerm("location")){ var hl=function(r){ off("location",hl); if(!r.error){S.lat=r.lat;S.lon=r.lon;save("ihsan_settings",S);} go2(); }; on("location",hl); N.getLocation(); setTimeout(function(){ if((listeners.location||[]).indexOf(hl)>=0){ off("location",hl); go2(); } },4000); }
  else go2();
}

// QIBLA
var KAABA=[21.4225,39.8262];
function qiblaBearing(lat,lon){ var p1=lat*D2R, p2=KAABA[0]*D2R, dl=(KAABA[1]-lon)*D2R; var b=Math.atan2(Math.sin(dl)*Math.cos(p2), Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))/D2R; return (b+360)%360; }
function qiblaPoint(){ return overseasNow()?[S.lat,S.lon]:zonePoint(); }
function qiblaDiff(heading, qb){ return ((qb-heading+540)%360)-180; } // signed degrees to turn; |x|<3 counts as facing the Qibla
function qiblaCard(el, compact){
  var p=qiblaPoint(), qb=qiblaBearing(p[0],p[1]);
  var ticks=""; for(var i=0;i<360;i+=10){ var big=i%30===0; ticks+='<line x1="150" y1="'+(big?14:20)+'" x2="150" y2="28" stroke="var(--mut)" stroke-width="'+(big?2:1)+'" transform="rotate('+i+' 150 150)"/>'; }
  var lbl=[["U",0],["T",90],["S",180],["B",270]]; if(S.lang==="en") lbl=[["N",0],["E",90],["S",180],["W",270]];
  var lt=lbl.map(function(l){ return '<text x="150" y="48" fill="'+(l[1]===0?"#e0605a":"var(--fg)")+'" font-size="16" font-weight="700" text-anchor="middle" transform="rotate('+l[1]+' 150 150)">'+l[0]+'</text>'; }).join("");
  el.innerHTML='<div style="text-align:center"><h3>🧭 '+T("qibla")+'</h3><div class="compass'+(compact?" sm":"")+'" id="cmp"><svg viewBox="0 0 300 300" class="dial" id="dial"><circle class="ring" cx="150" cy="150" r="140" fill="var(--well)" stroke="var(--line)" stroke-width="4"/>'+ticks+lt+
  '<g transform="rotate('+qb.toFixed(1)+' 150 150)"><line x1="150" y1="150" x2="150" y2="62" stroke="#c9a646" stroke-width="5" stroke-linecap="round"/><rect x="137" y="40" width="26" height="26" rx="3" fill="#111" stroke="#c9a646" stroke-width="2"/><rect x="137" y="46" width="26" height="4" fill="#c9a646"/></g><circle cx="150" cy="150" r="7" fill="#c9a646"/></svg>'+
  '<div class="needle">▲</div></div><div style="font-size:28px;font-weight:300" id="qDeg">'+qb.toFixed(1)+'°</div><div class="mut small">'+(S.lang==="en"?"Qibla bearing from true north":"Arah kiblat dari utara benar")+' · '+(S.lat!=null?(S.lang==="en"?"from your location":"dari lokasi anda"):(S.lang==="en"?"from zone centre":"dari pusat zon"))+'</div><div class="mut small" id="qHead" style="margin-top:6px"></div>'+
  '<div class="warnbox" id="qCal" style="display:none">'+(S.lang==="en"?"Low compass accuracy. Move the phone in a figure-of-eight, away from metal and magnets.":"Ketepatan kompas rendah. Gerakkan telefon dalam bentuk angka 8, jauh dari logam dan magnet.")+'</div>'+
  '<div class="btns" style="margin-top:10px"><button class="btn alt" id="qLoc">📍 '+(S.lang==="en"?"Use my location":"Guna lokasi saya")+'</button><button class="btn alt" id="qCamB">📷 '+(S.lang==="en"?"Camera view":"Paparan kamera")+'</button></div><div class="mut small" style="margin-top:10px">'+(S.lang==="en"?"Lay the phone flat. When the gold Kaabah marker is at the top arrow, you are facing the Qibla.":"Letakkan telefon mendatar. Apabila penanda Kaabah emas berada di anak panah atas, anda menghadap kiblat.")+'</div></div>';
  el.querySelector("#qLoc").onclick=function(){ askLocation(false); };
  el.querySelector("#qCamB").onclick=function(){ openQiblaCam(); };
  var dial=el.querySelector("#dial"), cmp=el.querySelector("#cmp"), last=null, rot=0;
  var hh=function(r){ if(view!=="solat" || !document.body.contains(dial)){ off("heading",hh); return; } if(qcamOn) return; if(r.error){ el.querySelector("#qHead").textContent=S.lang==="en"?"No compass sensor on this phone":"Tiada sensor kompas pada telefon ini"; return; }
    var target=-r.deg; if(last!==null){ var d=((target-last+540)%360)-180; rot+=d; } else rot=target; last=target;
    dial.style.transform="rotate("+rot+"deg)";
    var diff=Math.abs(qiblaDiff(r.deg,qb)); cmp.classList.toggle("ok", diff<3);
    if(diff<3 && !hh._v){ hh._v=true; N.vibrate(40);} if(diff>6) hh._v=false;
    el.querySelector("#qHead").textContent=(S.lang==="en"?"Phone heading ":"Arah telefon ")+Math.round(r.deg)+"° · "+(diff<3?(S.lang==="en"?"✓ Facing Qibla":"✓ Menghadap kiblat"):(Math.round(diff)+"°"));
    el.querySelector("#qCal").style.display = r.acc<2 ? "block":"none"; };
  on("heading", hh); N.startCompass(p[0],p[1]);
}

// RAKAAT
var RAK={subuh:2,zohor:4,asar:4,maghrib:3,isyak:4,jumaat:2};
// 0.19.0: on Friday Zohor is shown as Jumaat, and the counter's Jumaat chip is 2 rakaat (Zohor 4 stays as a second chip)
function isFri(t){ return (t?new Date(t):new Date()).getDay()===5; }
function prN(k, t){ return k==="zohor" && isFri(t) ? T("jumaat") : T(k); }
var rk = {solat:null};
var SUNAT=[["sunat2",[2],"Sunat 2","Sunnah 2"],["t8",[8,3],"Tarawih 8+3","Tarawih 8+3"],["t20",[20,3],"Tarawih 20+3","Tarawih 20+3"]];
function rkPhases(){ if(rk.solat==="custom") return [rk.customN||2]; for(var i=0;i<SUNAT.length;i++) if(SUNAT[i][0]===rk.solat) return SUNAT[i][1]; return [RAK[rk.solat]||4]; }
function rkName(){ if(rk.solat==="custom") return rk.customName||"Sunat"; for(var i=0;i<SUNAT.length;i++) if(SUNAT[i][0]===rk.solat) return SUNAT[i][S.lang==="en"?3:2]; return T(rk.solat); }
function rkTarget(){ return rkPhases().reduce(function(a,b){return a+b;},0); }
function chipsRow(label, items){ return '<div class="opt"><span class="ol">'+label+'</span><div class="chips">'+items+'</div></div>'; }
function rakaatSetup(){
  if(!rk.solat || (rk.solat==="custom" && !rk.keep)){ rk.solat=inDhuha()?"sunat2":currentPrayer(); if(rk.solat==="zohor" && isFri()) rk.solat="jumaat"; }
  if(rk.solat==="jumaat" && !isFri()) rk.solat="zohor";
  if(rk.solat==="sunat") rk.solat="sunat2";
  var target=rkTarget(), en=S.lang==="en";
  var seg=function(attr,cur,opts){ return '<span class="seg">'+opts.map(function(o){ return '<button class="'+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'"'+(o[2]?' style="'+o[2]+'"':'')+'>'+o[1]+'</button>'; }).join("")+'</span>'; };
  var row=function(label,ctl){ return '<div class="rrow"><span>'+label+'</span>'+ctl+'</div>'; };
  var html='<div class="card rk"><div class="row"><h3 style="margin:0">'+T("rakaat")+'</h3></div>';
  html+='<div class="chips rksel">'+(isFri()?["subuh","jumaat","zohor","asar","maghrib","isyak"]:PR).map(function(k){ return '<button class="chip '+(rk.solat===k?"on":"")+'" data-s="'+k+'">'+T(k)+' <b>'+RAK[k]+'</b></button>'; }).join("")+
    SUNAT.map(function(x){ return '<button class="chip '+(rk.solat===x[0]?"on":"")+'" data-s="'+x[0]+'">'+(en?x[3]:x[2])+'</button>'; }).join("")+
    (musafirNow()?["zohor","asar","isyak"].map(function(k){ return '<button class="chip '+(rk.solat==="custom"&&rk.customName===T(k)+" (qasar)"?"on":"")+'" data-qasar="'+k+'">'+T(k)+' <b>2</b> qasar</button>'; }).join(""):'')+'</div>';
  html+=rkBanner(target);
  html+='<div class="rkday"><div class="mut tiny">'+(en?"Today (rakaat counter)":"Hari ini (kiraan rakaat)")+'</div>'+prRegister(ymd(new Date()), true)+'</div>';
  return html+'</div>';
}
// 0.34.0 (Farah): the counter settings left the Rakaat page and live in Tetapan › Kiraan rakaat
function rkSetCard(){
  var en=S.lang==="en", dsel=S.rdisp==="dots"?"dots":S.rdisp==="lines"?"lines":(S.rnum==="arabic"?"ar":"lat");
  var seg=function(attr,cur,opts){ return '<span class="seg">'+opts.map(function(o){ return '<button class="'+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'"'+(o[2]?' style="'+o[2]+'"':'')+'>'+o[1]+'</button>'; }).join("")+'</span>'; };
  var row=function(label,ctl){ return '<div class="rrow"><span>'+label+'</span>'+ctl+'</div>'; };
  return '<div class="card cmp" id="rkSetC"><h3>🤲 '+(en?"Counter display":"Paparan kiraan")+'</h3><div class="rkset">'+
      (WEB?'':row(en?"Count by":"Kira dengan", seg("data-m",S.rmode,[["tap","👆 "+T("tap")],["camera","📷 "+T("camera")]])))+
      row(en?"Show as":"Papar", seg("data-dp",dsel,[["lat","123"],["ar","١٢٣","font-family:var(--ar)"],["dots","●●○"],["lines","│╱─"]]))+
      row(en?"Direction":"Arah", seg("data-dir",S.rdir==="down"?"down":"up",[["up","↑ "+(en?"Up":"Naik")],["down","↓ "+(en?"Down":"Turun")]]))+
      row(en?"Brightness":"Kecerahan", seg("data-op",S.rop||1,[[1,"100"],[0.6,"60"],[0.3,"30"],[0.1,"10"]]))+
      row(en?"Sejadah":"Sejadah", '<span class="seg sw3">'+[["black","#1a1a1a"],["green","#0e6b45"],["gold","#c9a646"]].map(function(t){ return '<button class="'+(S.theme===t[0]?"on":"")+'" data-t="'+t[0]+'" title="'+T("t"+t[0])+'"><i style="background:'+t[1]+'"></i></button>'; }).join("")+'</span>')+
      row("🧭 "+(en?"Qibla arrow":"Anak panah kiblat"), sw("rkQibSw",S.rQibla!==false))+
      row("⏱ "+(en?"Show time":"Papar masa"), sw("rkTimeSw",!!S.rTime))+
      '<div class="mut tiny" style="margin:-2px 0 4px">'+(en?"Time is always recorded (from the end of the countdown until you exit) and shown in Time › Stats, even when hidden here.":"Masa sentiasa direkod (dari tamat kiraan mula hingga keluar) dan dipapar dalam Masa › Statistik, walaupun disembunyikan di sini.")+'</div>'+
      '<div class="mut tiny" style="padding-top:6px">'+(S.rmode==="camera"?
       (en?"Phone face-up just beyond where your forehead touches. Each sujud counts 0.5.":"Telefon menghadap ke atas, sedikit di hadapan tempat dahi sujud. Setiap sujud dikira 0.5.")
       :(en?"Tap anywhere to add "+S.tapStep+", hold to undo.":"Ketik di mana-mana untuk tambah "+S.tapStep+", tekan lama untuk undur."))+'</div></div></div>';
}
// 0.34.0 (Farah): the Start button is a banner whose sky follows the time of day of the chosen solat
// (Subuh dawn, Dhuha morning, Zohor midday, Asar afternoon, Maghrib sunset, Isyak night)
function rkTod(){
  var k=rk.solat; if(k==="jumaat") return "zohor"; if(PR.indexOf(k)>=0) return k; if(k==="t8"||k==="t20") return "isyak";
  if(inDhuha()) return "dhuha"; return currentPrayer();
}
var RKSKY={
  subuh:{a:"#16224d",b:"#5a4f8a",c:"#f0a77c",lb:["Fajar menyingsing","Dawn"],tx:"#fff"},
  dhuha:{a:"#3d95d6",b:"#7cc0ee",c:"#d8f0ff",lb:["Pagi","Morning"],tx:"#0b2a45"},
  zohor:{a:"#1f74c9",b:"#4fa6ec",c:"#bfe4ff",lb:["Tengah hari","Midday"],tx:"#0b2a45"},
  asar:{a:"#e58c3c",b:"#f4b765",c:"#fde6b0",lb:["Petang","Afternoon"],tx:"#3b1d05"},
  maghrib:{a:"#2e1846",b:"#b23f69",c:"#f59a45",lb:["Senja","Sunset"],tx:"#fff"},
  isyak:{a:"#070c22",b:"#121d45",c:"#24346b",lb:["Malam","Night"],tx:"#fff"}
};
function rkSkySvg(k){
  var P=RKSKY[k]||RKSKY.zohor, g='<defs><linearGradient id="rkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.a+'"/><stop offset=".55" stop-color="'+P.b+'"/><stop offset="1" stop-color="'+P.c+'"/></linearGradient>'+
    '<radialGradient id="rkS"><stop offset="0" stop-color="#fff8d6"/><stop offset=".45" stop-color="'+(k==="maghrib"?"#ff8a3d":k==="asar"?"#ffc35a":k==="subuh"?"#ffc58a":"#fff1a6")+'"/><stop offset="1" stop-color="#fff1a6" stop-opacity="0"/></radialGradient>'+
    '<mask id="rkM"><rect width="360" height="130" fill="#fff"/><circle cx="228" cy="26" r="15" fill="#000"/></mask></defs>';
  var b='<rect width="360" height="130" fill="url(#rkG)"/>', i;
  var star=function(n, h){ var o=''; for(i=0;i<n;i++){ var x=(i*67+23)%350+5, y=(i*37+11)%h+4, r=(i%3===0)?1.3:0.8; o+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" opacity="'+(0.45+(i%4)*0.15)+'"/>'; } return o; };
  if(k==="isyak"){ b+=star(26,80)+'<circle cx="220" cy="30" r="17" fill="#f6efc8" mask="url(#rkM)"/>'; }
  else if(k==="subuh"){ b+=star(12,40)+'<circle cx="250" cy="118" r="46" fill="url(#rkS)"/><circle cx="250" cy="120" r="14" fill="#ffe3b0"/>'; }
  else if(k==="dhuha"){ b+='<circle cx="250" cy="52" r="52" fill="url(#rkS)"/><circle cx="250" cy="52" r="15" fill="#fffbe6"/>'; }
  else if(k==="zohor"){ b+='<circle cx="270" cy="22" r="60" fill="url(#rkS)"/><circle cx="270" cy="22" r="16" fill="#fffef2"/>'; }
  else if(k==="asar"){ b+='<circle cx="292" cy="72" r="56" fill="url(#rkS)"/><circle cx="292" cy="72" r="16" fill="#fff3cf"/>'; }
  else if(k==="maghrib"){ b+='<circle cx="268" cy="112" r="64" fill="url(#rkS)"/><circle cx="268" cy="114" r="22" fill="#ffb067"/>'; }
  if(k==="dhuha"||k==="zohor"||k==="asar") b+='<g fill="#fff" opacity=".55"><ellipse cx="205" cy="24" rx="26" ry="7"/><ellipse cx="224" cy="19" rx="15" ry="8"/><ellipse cx="338" cy="70" rx="22" ry="5"/></g>';
  var sil=k==="isyak"?"#03060f":k==="maghrib"?"#1c0d24":k==="subuh"?"#0e1430":"#0d3b2a", op=(k==="dhuha"||k==="zohor")?".78":".92";
  // masjid silhouette: hills, a main dome, two small domes and two minarets
  b+='<path d="M0 116 Q60 102 120 112 T240 108 T360 112 V130 H0Z" fill="'+sil+'" opacity=".55"/>'+
    '<g transform="translate(92 0)"><g fill="'+sil+'" opacity="'+op+'"><rect x="128" y="96" width="104" height="34"/><path d="M146 97 Q180 52 214 97Z"/><rect x="178" y="58" width="4" height="10"/><path d="M180 50 l3 6 h-6z"/>'+
    '<path d="M128 103 Q140 84 152 103Z"/><path d="M208 103 Q220 84 232 103Z"/>'+
    '<rect x="110" y="62" width="9" height="68"/><path d="M108 62 h13 l-6.5 -14z"/><rect x="241" y="62" width="9" height="68"/><path d="M239 62 h13 l-6.5 -14z"/>'+
    '<rect x="107" y="76" width="15" height="3"/><rect x="238" y="76" width="15" height="3"/></g>'+
    '<g fill="'+(k==="isyak"||k==="maghrib"||k==="subuh"?"#ffd27a":"#ffffff")+'" opacity="'+(k==="isyak"||k==="maghrib"||k==="subuh"?".85":".35")+'"><path d="M172 130 v-14 a8 8 0 0 1 16 0 v14z"/><rect x="140" y="110" width="6" height="9" rx="3"/><rect x="214" y="110" width="6" height="9" rx="3"/></g></g>';
  return '<svg class="rkbsky" viewBox="0 0 360 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+g+b+'</svg>';
}
function rkBanner(target){
  var k=rkTod(), P=RKSKY[k]||RKSKY.zohor, t=getDay(new Date()), en=S.lang==="en";
  var tm=k==="dhuha"?(typeof dhuhaHM==="function"?dhuhaHM(t):""):(t&&t[k]?t[k]:"");
  var when=L2x(P.lb[0],P.lb[1])+(tm?" · "+fmt12(tm):"");
  return '<button class="rkban rb-'+k+'" id="rkStart" style="color:'+P.tx+'">'+rkSkySvg(k)+
    '<span class="rbt"><span class="rbw">'+esc(when)+'</span><b class="rbn">'+esc(rkName())+'</b><span class="rbr">'+(rkPhases().length>1?rkPhases().join(" + "):target)+' rakaat</span></span>'+
    '<span class="rbgo">▶ '+T("start")+'</span></button>';
}
function bindRkSet(c){
  if(!c) return;
  c.querySelectorAll("[data-dir]").forEach(function(b){ b.onclick=function(){ S.rdir=b.getAttribute("data-dir"); saveS(); pushSchedule(); render(); }; });
  c.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ S.rmode=b.getAttribute("data-m"); saveS(); render(); }; });
  c.querySelectorAll("[data-t]").forEach(function(b){ b.onclick=function(){ S.theme=b.getAttribute("data-t"); saveS(); render(); }; });
  c.querySelectorAll("[data-dp]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-dp"); if(v==="dots"||v==="lines") S.rdisp=v; else { S.rdisp="ring"; S.rnum = v==="ar" ? "arabic" : "latin"; } saveS(); render(); }; });
  c.querySelectorAll("[data-op]").forEach(function(b){ b.onclick=function(){ S.rop=+b.getAttribute("data-op"); saveS(); render(); }; });
  var qs=c.querySelector("#rkQibSw"); if(qs) qs.onchange=function(){ S.rQibla=this.checked; saveS(); };
  var tsw=c.querySelector("#rkTimeSw"); if(tsw) tsw.onchange=function(){ S.rTime=this.checked; saveS(); };
}
function bindRakaat(el){
  el.querySelectorAll("[data-s]").forEach(function(b){ b.onclick=function(){ rk.solat=b.getAttribute("data-s"); rk.keep=false; render(); }; });
  el.querySelectorAll("[data-qasar]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-qasar"); rk.solat="custom"; rk.customN=2; rk.customName=T(k)+" (qasar)"; rk.keep=true; render(); }; });
  var rs=el.querySelector(".rksel .on"); if(rs) setTimeout(function(){ rs.parentNode.scrollLeft=Math.max(0,rs.offsetLeft-rs.parentNode.offsetLeft-80); },0);
  el.querySelectorAll("[data-nm]").forEach(function(b){ b.onclick=function(){ S.rnum=b.getAttribute("data-nm"); saveS(); pushSchedule(); render(); }; });
  el.querySelector("#rkStart").onclick=function(){
    var target=rkTarget();
    if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(target); else toast(S.lang==="en"?"Camera permission needed, or use tap mode":"Perlu kebenaran kamera, atau guna mod ketik"); }; on("perm",hp); N.requestPerm("camera"); }
    else startPraying(target);
  };
}
function themeSvg(t){
  if(t==="black") return '';
  var c = t==="green" ? "#ffffff" : "#c9a646", o = t==="green" ? 0.9 : 0.85, bg2 = t==="green" ? "#0e6b45" : "#0d0d0d";
  var pat='<pattern id="p'+t+'" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="'+bg2+'"/><path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="'+c+'" stroke-opacity=".18" stroke-width="1.2"/><circle cx="20" cy="20" r="4" fill="none" stroke="'+c+'" stroke-opacity=".22"/></pattern>';
  var border='<pattern id="b'+t+'" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="none"/><path d="M12 1 L23 12 L12 23 L1 12 Z" fill="'+c+'" fill-opacity=".55"/></pattern>';
  return '<svg class="mihrab" viewBox="0 0 360 640" preserveAspectRatio="none"><defs>'+pat+border+'</defs><rect width="360" height="640" fill="url(#p'+t+')"/>'+
   '<rect x="8" y="8" width="344" height="624" fill="none" stroke="url(#b'+t+')" stroke-width="16"/><rect x="22" y="22" width="316" height="596" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="2"/>'+
   '<path d="M70 600 L70 230 Q70 120 180 70 Q290 120 290 230 L290 600" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="3"/>'+
   '<path d="M88 600 L88 236 Q88 140 180 96 Q272 140 272 236 L272 600" fill="none" stroke="'+c+'" stroke-opacity=".5" stroke-width="1.5"/>'+
   '<circle cx="180" cy="150" r="10" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="2"/></svg>';
}
var AR_DIG="٠١٢٣٤٥٦٧٨٩";
function num(n){ var s=(Math.round(n*2)/2).toString(); if(S.rnum==="arabic") s=s.replace(/\d/g,function(d){return AR_DIG[+d];}).replace(".","٫"); return s; }
// 0.17.0 "Ayat in your solat": the surah picked for rakaat 1 and 2 shows under the counter
function qsolatLine(r){ var Q=load("ihsan_qsolat",{on:false,r:[]}); if(!Q.on || r>2) return ""; var x=(Q.r||[])[r-1]; if(!x) return "";
  return '<div class="qsl"><small>'+L2x("Rakaat ","Rakaat ")+r+' · '+esc(x[1])+'</small><span dir="rtl">'+esc(x[2])+'</span></div>'; }
function startPraying(target){
  var ov=document.getElementById("overlay"), cam=S.rmode==="camera", bars=false, lines=S.rdisp==="lines", dots=S.rdisp==="dots"||lines, down=S.rdir==="down", phases=rkPhases();
  var col = S.theme==="gold"?"#c9a646":S.theme==="green"?"#ffffff":"#5a5a5a";
  ov.className="theme-"+S.theme; ov.innerHTML='<div class="pray">'+themeSvg(S.theme)+'<div class="pmid" id="pMid"></div><div class="sub" id="pSub" style="position:relative;min-height:22px"></div>'+
   '<button class="close" id="pClose" aria-label="close">✕</button>'+(S.rTime?'<div class="ptime" id="pTime">0:00</div>':'')+(cam&&!dots?'<div class="dot" id="pDot"></div>':'')+'<div class="stat" id="pStat"></div>'+
   '<div class="ptop">'+(dots?'<div class="dtop'+(lines?' dlines':'')+'" id="pDots"></div>':'')+(S.rQibla!==false?'<div class="qarrow" id="pQ"><svg viewBox="0 0 24 60" width="16" height="40"><path d="M12 2 L12 58 M12 2 L6 12 M12 2 L18 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="qcal" id="pQc">∞ '+(S.lang==="en"?"calibrate":"kalibrasi")+'</div>':'')+'</div></div>';
  var count=0, doneAt=0, settle=cam?3:0, history=[], builtPhase=-1, tStart=cam?0:Date.now(), waktu=curWaktu(), sName=rkName(), sKey=rk.solat, qKey=rk.solat==="custom"&&/qasar/.test(rk.customName||"")?(["zohor","asar","isyak"].filter(function(k){ return (rk.customName||"").indexOf(T(k))===0; })[0]||null):null;
  var ptEl=ov.querySelector("#pTime"); if(ptEl) ptEl.style.opacity=Math.max(0.35,S.rop||1);
  var subEl=ov.querySelector("#pSub"), stat=ov.querySelector("#pStat"), midEl=ov.querySelector("#pMid");
  midEl.style.opacity=S.rop||1; if(ov.querySelector("#pDots")) ov.querySelector("#pDots").style.opacity=S.rop||1;
  N.keepScreenOn(true, cam?0.05:0.1);
  if(S.quietPray && N.quiet) N.quiet(true);
  // Small qibla arrow: points to the Qibla, turns green with a 1 s buzz when the phone faces it exactly.
  // Uses the same bearing, sensor reading and 3° "facing" rule as the Qibla compass on the Solat page.
  var qp=qiblaPoint(), qbr=qiblaBearing(qp[0],qp[1]), qEl=ov.querySelector("#pQ"), qCal=ov.querySelector("#pQc"), qOk=false, qRot=null;
  var qh=function(r){ if(!qEl) return; if(r.error){ qEl.style.display="none"; return; } var d=qiblaDiff(r.deg,qbr);
    qRot = qRot===null ? d : qRot+(((d-qRot)%360+540)%360-180); qEl.style.transform="rotate("+qRot.toFixed(1)+"deg)";
    var ok=Math.abs(d)<3; qEl.classList.toggle("ok",ok); if(ok && !qOk){ qOk=true; N.vibrate(1000); } if(Math.abs(d)>6) qOk=false;
    if(qCal) qCal.style.visibility = r.acc<2 ? "visible" : "hidden"; };
  if(qEl){ on("heading",qh); N.startCompass(qp[0],qp[1]); }
  function phaseInfo(){ var c=count; for(var i=0;i<phases.length;i++){ if(c<phases[i] || i===phases.length-1) return {i:i, n:phases[i], c:Math.min(c,phases[i])}; c-=phases[i]; } }
  function build(ph){
    var n=ph.n, lbl = phases.length>1 ? '<div class="phl">'+(ph.i===phases.length-1?"Witir":"Tarawih")+'</div>' : '';
    if(bars){
      var gap = n>10?5:12, bw=Math.max(6, Math.min(30, Math.floor(300/n)-gap));
      var m=lbl+'<div class="bars" style="gap:'+gap+'px">'; for(var i=0;i<n;i++) m+='<div class="rb" style="width:'+bw+'px;border-color:'+col+'"><div class="rf" style="background:'+col+'"></div></div>'; midEl.innerHTML=m+'</div>';
    } else {
      midEl.innerHTML='<svg width="300" height="300" viewBox="0 0 300 300" style="position:absolute"><circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle id="pRing" cx="150" cy="150" r="130" fill="none" stroke="'+(S.theme==="black"?"#3d3d3d":col)+'" stroke-width="10" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="816.8" stroke-dashoffset="816.8"/></svg>'+lbl+
        '<div class="big" id="pBig" style="position:relative"></div><div class="of" style="position:relative">'+(down?'':'/ '+num(n))+'</div>';
    }
    builtPhase=ph.i;
  }
  function updDots(){
    var de=ov.querySelector("#pDots"), done=count>=target, ph=done?{n:phases[phases.length-1],c:phases[phases.length-1],i:phases.length-1}:phaseInfo();
    var oc = "#ffffff", h="";
    for(var i=0;i<ph.n;i++){
      var f = done ? 1 : (down ? Math.max(0,Math.min(1,(ph.n-ph.c)-i)) : Math.max(0,Math.min(1,ph.c-i)));
      var bg = f>=1 ? "#fff" : f>0 ? "linear-gradient(90deg,#fff 50%,transparent 50%)" : "transparent";
      if(lines) h+='<span class="dl"><i style="transform:rotate('+Math.round(f*90)+'deg)"></i></span>';
      else h+='<span class="dd" style="border-color:'+oc+';background:'+bg+'"></span>';
    }
    if(done) h+='<svg class="dtick" viewBox="0 0 100 100"><path d="M18 54 L40 76 L84 28" fill="none" stroke="#2ecc71" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if(settle>0){ var sc=settle>=3?"#e0605a":(settle===2?"#f1c40f":"#2ecc71"); h+='<div class="dset">'; for(var j=0;j<settle;j++) h+='<span style="background:'+sc+'"></span>'; h+='</div>'; }
    if(lines) de.style.setProperty("--dl", Math.max(12,Math.min(32,Math.floor(224/ph.n)))+"px");
    de.innerHTML=h; midEl.innerHTML=""; subEl.innerHTML="";
  }
  function upd(){
    if(dots){ updDots(); return; }
    if(count>=target){
      midEl.innerHTML='<svg width="170" height="170" viewBox="0 0 100 100"><path d="M22 52 L42 72 L80 30" fill="none" stroke="'+(S.theme==="black"?"#2ecc71":col)+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      subEl.innerHTML=""; builtPhase=-2; return;
    }
    var ph=phaseInfo(); if(ph.i!==builtPhase) build(ph);
    var frac = down ? (ph.n-ph.c)/ph.n : ph.c/ph.n;
    if(bars){ var fills=midEl.querySelectorAll(".rf"); for(var i=0;i<fills.length;i++){ var f = down ? Math.max(0,Math.min(1,(ph.n-ph.c)-i)) : Math.max(0,Math.min(1,ph.c-i)); fills[i].style.height=(f*100)+"%"; } }
    else { midEl.querySelector("#pBig").textContent=num(down?ph.n-ph.c:ph.c); midEl.querySelector("#pRing").setAttribute("stroke-dashoffset",(816.8*(1-frac)).toFixed(1)); }
    if(settle>0){ var c2=settle>=3?"#e0605a":(settle===2?"#f1c40f":"#2ecc71"), dh=""; for(var j=0;j<settle;j++) dh+='<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin:0 4px;background:'+c2+'"></span>'; subEl.innerHTML=dh; }
    else subEl.innerHTML=qsolatLine(Math.floor(ph.c)+1);
  }
  function add(step){
    if(count>=target) return;
    var before=phaseInfo().i;
    count=Math.min(target, count+step); history.push(step);
    if(S.vib) N.vibrate(count%1===0?120:50);
    if(count<target && phaseInfo().i!==before) N.vibrate(400);
    if(count>=target) doneAt=Date.now();
    upd();
  }
  function undo(){ if(!history.length || count>=target) return; count=Math.max(0,count-history.pop()); upd(); N.vibrate(30); }
  var st=setInterval(function(){ if(settle>0){ settle--; if(settle===0 && !tStart) tStart=Date.now(); upd(); } if(ptEl) ptEl.textContent=tStart?cdStr(Date.now()-tStart):"0:00"; },1000);
  var hs=function(r){ var dot=ov.querySelector("#pDot");
    if(r.type==="down"){ if(settle>0) return; if(doneAt) return; add(0.5); if(dot) dot.style.background="#c9a646"; }
    else if(r.type==="up"){ if(dot) dot.style.background="#2ecc71"; }
    else if(r.type==="error"){ toast((S.lang==="en"?"Camera error: ":"Ralat kamera: ")+r.error); } };
  var hst=function(r){ if(S.showStat) stat.textContent="face "+(r.face||0).toFixed(2)+" / "+S.sujud.threshold.toFixed(2)+" · light "+Math.round(r.luma)+"/"+Math.round(r.base)+" · prox "+(r.prox?"near":"far")+(r.faceHw?"":" · no hw face"); };
  if(cam){ on("sujud",hs); on("sujudStatus",hst); N.startSujud(JSON.stringify({threshold:S.sujud.threshold, face:S.sujud.face, light:S.sujud.light, prox:S.sujud.prox})); }
  var pressT=null, longP=false, pray=ov.querySelector(".pray");
  pray.addEventListener("touchstart", function(e){ if(e.target.id==="pClose") return; longP=false; pressT=setTimeout(function(){ longP=true; undo(); },700); }, {passive:true});
  pray.addEventListener("touchend", function(e){ if(e.target.id==="pClose") return; clearTimeout(pressT); if(!longP && !cam && settle<=0) add(S.tapStep); e.preventDefault(); });
  pray.addEventListener("click", function(e){ if(e.target.id==="pClose") return; if(!("ontouchstart" in window) && !cam) add(S.tapStep); });
  function finish(){ clearInterval(st);
    if(tStart){ var sec=Math.round((Date.now()-tStart)/1000); if(sec>=5) plogAdd({d:ymd(new Date(tStart)), s:sKey, q:qKey, n:sName, w:waktu, t0:tStart, sec:sec, c:count, tg:target}); } if(N.quiet) N.quiet(false); if(qEl){ off("heading",qh); N.stopCompass(); } if(cam){ off("sujud",hs); off("sujudStatus",hst); N.stopSujud(); } N.keepScreenOn(false,-1); applyTheme(); closeOverlay(); render(); if(count>=target && !S.kidLock) setTimeout(myDoaRemind, 350); }
  ov.querySelector("#pClose").onclick=function(e){ e.stopPropagation(); finish(); };
  ov._close=finish;
  upd();
}
// ZIKIR
var zstate=load("ihsan_zstate",{});
function trToggle(){ return ''; }
function trToggleOld(){ return '<label class="trt"><span>'+(S.lang==="en"?"Meaning":"Maksud")+'</span><span class="switch sm"><input type="checkbox" id="trT" '+(S.showTr?"checked":"")+'><span></span></span></label>'; }
function bindTrToggle(el){ var t=el.querySelector("#trT"); if(t) t.onchange=function(){ S.showTr=this.checked; save("ihsan_settings",S); applyFont(); }; }
var zScroll=null;
function vZikir(el){
  var tabs=[["tasbih","tasbih"],["after","after"],["asma","asma"],["mine",L2x("Zikir saya","My zikir")]], keys=tabs.map(function(t){return t[0];});
  el.innerHTML='<div class="dock"><div class="grp3 g4">'+tabs.map(function(t){return '<button class="chip '+(sub.zikir===t[0]?"on":"")+'" data-z="'+t[0]+'">'+(t[0]==="mine"?esc(t[1]):T(t[1]))+'</button>';}).join("")+'</div></div><div class="hpager" id="hp"><div class="hpage" id="pg0"></div><div class="hpage" id="pg1"></div><div class="hpage" id="pg2"></div><div class="hpage" id="pg3"></div></div>';
  bindTrToggle(el);
  var hp=el.querySelector("#hp");
  zTasbih(el.querySelector("#pg0")); zAfter(el.querySelector("#pg1")); zAsma(el.querySelector("#pg2")); zMine(el.querySelector("#pg3"));
  var idx = Math.max(0, keys.indexOf(sub.zikir));
  hp.scrollLeft = idx*hp.clientWidth;
  var pages=[el.querySelector("#pg0"), el.querySelector("#pg1"), el.querySelector("#pg2"), el.querySelector("#pg3")];
  function fitH(){ var pg=pages[Math.max(0,keys.indexOf(sub.zikir))]; if(pg) hp.style.height=pg.scrollHeight+"px"; }
  if(window.ResizeObserver){ var ro=new ResizeObserver(fitH); pages.forEach(function(pg){ ro.observe(pg); }); }
  fitH(); setTimeout(fitH,400);
  function mark(){ var k=Math.round(hp.scrollLeft/Math.max(1,hp.clientWidth)); sub.zikir=keys[k]||"tasbih"; fitH(); if(N.setVolumeKeys) N.setVolumeKeys(sub.zikir==="tasbih" && S.volTasbih); el.querySelectorAll("[data-z]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-z")===sub.zikir); }); }
  hp.addEventListener("scroll", function(){ clearTimeout(zScroll); zScroll=setTimeout(mark,80); }, {passive:true});
  el.querySelectorAll("[data-z]").forEach(function(b){ b.onclick=function(){ var k=keys.indexOf(b.getAttribute("data-z")); hp.scrollTo({left:k*hp.clientWidth, behavior:"smooth"}); }; });
  // 0.36.0: ◀ ▶ arrows move the Zikir pages too
  var zi=function(){ return Math.round(hp.scrollLeft/Math.max(1,hp.clientWidth)); };
  ibArrPager({el:hp, can:function(s){ var k=zi()-s; return k>=0 && k<keys.length; }, go:function(s){ var k=zi()-s; if(k>=0 && k<keys.length) hp.scrollTo({left:k*hp.clientWidth, behavior:"smooth"}); }});
  hp.addEventListener("scroll", function(){ clearTimeout(hp._at); hp._at=setTimeout(ibArr,120); }, {passive:true});
  if(N.setVolumeKeys) N.setVolumeKeys(sub.zikir==="tasbih" && S.volTasbih);
}
function catName(c){ var p=c.cat.split(" / "); return S.lang==="en" ? (p[1]||p[0]) : p[0]; }
function vDoa(el){
  var g=doaGroupOf(doaCat);
  var html='<div class="dsearch"><input id="dq" type="search" placeholder="🔍 '+(S.lang==="en"?"Search: travel, sick, exam, rain, angry...":"Cari: musafir, sakit, periksa, hujan, marah...")+'" value="'+esc(doaQ)+'"><button class="chip '+(doaFav?"on":"")+'" id="dFav">★</button><button class="chip '+(doaMine?"on":"")+'" id="dMine">🤲 '+L2x("Doa saya","My doa")+'</button></div>';
  var subs=DOA_GROUPS[g][2], cols=Math.ceil(subs.length/2), GIC=["🏠","💼","💚"];
  html+='<div class="dock" id="dTabs" style="'+(doaQ||doaFav||doaMine?"display:none":"")+'">'+
    '<div class="dsubs dsubs12" style="grid-template-columns:repeat('+cols+',minmax(29%,1fr))">'+subs.map(function(i){return '<button class="dsub '+(doaCat===i?"on":"")+'" data-c="'+i+'">'+esc(catName(DOA[i]))+'</button>';}).join("")+'</div>'+
    '<div class="dgrps">'+DOA_GROUPS.map(function(x,i){return '<button class="dgrp '+(g===i?"on":"")+'" data-g="'+i+'"><span>'+GIC[i]+'</span>'+(S.lang==="en"?x[1]:x[0])+'</button>';}).join("")+'</div></div><div id="zv"></div>';
  el.innerHTML=html; bindTrToggle(el);
  el.querySelectorAll("[data-g]").forEach(function(b){ b.onclick=function(){ doaCat=DOA_GROUPS[+b.getAttribute("data-g")][2][0]; render(); }; });
  el.querySelectorAll("[data-c]").forEach(function(b){ b.onclick=function(){ doaCat=+b.getAttribute("data-c"); render(); }; });
  var zv=el.querySelector("#zv"), dq=el.querySelector("#dq");
  function show(){ var tabs=el.querySelector("#dTabs"); tabs.style.display=(doaQ||doaFav||doaMine)?"none":""; dockFix(); if(doaQ) doaSearch(zv, doaQ); else if(doaMine) myDoaPage(zv); else if(doaFav) doaFavList(zv); else zDaily(zv); }
  dq.oninput=function(){ doaQ=dq.value.trim(); show(); };
  el.querySelector("#dFav").onclick=function(){ doaFav=!doaFav; doaMine=false; doaQ=""; render(); };
  el.querySelector("#dMine").onclick=function(){ doaMine=!doaMine; doaFav=false; doaQ=""; render(); };
  show();
}
function vMathurat(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  el.innerHTML='<div class="dock"><div class="tabrow"><div class="chips"><button class="chip '+(!mathEvening?"on":"")+'" data-e="0">☀️ '+T("pagi")+'</button><button class="chip '+(mathEvening?"on":"")+'" data-e="1">🌙 '+T("petang")+'</button></div><label class="trt"><span>↔</span><span class="switch sm"><input type="checkbox" id="mH" '+(S.mathH?"checked":"")+'><span></span></span></label>'+trToggle()+'</div></div><div id="zv"></div>';
  bindTrToggle(el);
  el.querySelector("#mH").onchange=function(){ S.mathH=this.checked; save("ihsan_settings",S); zMathurat(el.querySelector("#zv")); };
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  zMathurat(el.querySelector("#zv"));
}
var sunCat="rutin", sunTop="solat", sunOpen=null;
function vSunat0(el){
  var en=S.lang==="en", L2=function(o){ return o ? (en?o.en:o.ms) : ""; };
  var td=getDay(new Date()), addm=function(hm,m){ if(!hm) return "--"; var p=hm.split(":"), t=+p[0]*60+(+p[1])+m; return fmt12(pad(Math.floor(t/60))+":"+pad(t%60)); };
  // 0.9.1: level 2 (Solat, Puasa...) and level 3 (Harian & rutin...) sit at the top; level 1 (Zikir/Doa/Ma'thurat/Amal) stays at the bottom.
  var TOPIC={solat:"🕌",puasa:"🍽",sedekah:"💝",bersuci:"💧",haji:"🕋",lain:"✨"};
  var dock='';
  var html='<div class="amhdr"><div class="lv2">'+SUNAT_TOP.map(function(c){ return '<button class="'+(sunTop===c[0]?"on":"")+'" data-st="'+c[0]+'"><span>'+(TOPIC[c[0]]||"•")+'</span>'+(en?c[2]:c[1])+'</button>'; }).join("")+'</div>'+
    (sunTop==="solat"?'<div class="lv3">'+SUNAT_CATS.map(function(c){ return '<button class="'+(sunCat===c[0]?"on":"")+'" data-sc="'+c[0]+'">'+(en?c[2]:c[1])+'</button>'; }).join("")+'</div>':'')+'</div>';
  if(sunTop==="solat") html+='<div class="card forb"><h3>⛔ '+(en?"Forbidden times for sunnah prayers (today)":"Waktu dilarang solat sunat (hari ini)")+'</h3>'+
    '<div class="fr"><span>'+(en?"After Subuh until the sun has risen":"Selepas solat Subuh hingga matahari naik")+'</span><b>'+addm(td.subuh,0)+' – '+addm(td.syuruk,15)+'</b></div>'+
    '<div class="fr"><span>'+(en?"When the sun is at its zenith (istiwa')":"Ketika matahari tegak (istiwa')")+'</span><b>~'+addm(td.zohor,-10)+' – '+addm(td.zohor,0)+'</b></div>'+
    '<div class="fr"><span>'+(en?"After Asar until sunset":"Selepas solat Asar hingga terbenam matahari")+'</span><b>'+addm(td.asar,0)+' – '+addm(td.maghrib,0)+'</b></div>'+
    '<div class="mut small" style="margin-top:6px;line-height:1.45">'+(en?"In the Shafi'i school, prayers with a reason that comes before or with them (e.g. Tahiyyatul Masjid, after wudhu, eclipse, qada') remain allowed. The zenith time shown is an estimate.":"Dalam mazhab Syafi'i, solat yang mempunyai sebab yang mendahului atau bersamanya (cth. Tahiyyatul Masjid, sunat wuduk, gerhana, qada') tetap dibenarkan. Waktu istiwa' adalah anggaran.")+'</div>'+
    '<div class="src">'+srcHtml("Sahih Muslim 831; Sahih al-Bukhari 586")+'</div></div>';
  SUNAT_LIST.filter(function(x){ return x.top===sunTop && (sunTop!=="solat" || x.cat===sunCat); }).forEach(function(x){
    var open=sunOpen===x.id, rk=x.n.length>1 ? x.n[0]+"–"+x.n[x.n.length-1] : x.n[0];
    html+='<div class="card sn lvl3"><div class="row snh" data-so="'+x.id+'"><h3 style="margin:0">'+esc(L2(x.name))+'</h3><span class="row" style="gap:6px">'+(x.n.length?'<span class="badge">'+rk+' rakaat</span>':'')+'<span class="mut">'+(open?"▴":"▾")+'</span></span></div>';
    if(open){
      if(x.niat && x.niat.length){ html+='<div class="snf niatbox"><div class="snl">'+(en?"Intention (niat)":"Niat")+'</div>'+x.niat.map(function(nt){ return (nt.label?'<div class="mut small" style="margin-top:6px">'+esc(L2(nt.label))+'</div>':'')+'<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+nt.ar+'</div>'+rumiDiv(nt.ar)+'<div class="tr">'+esc(L2(nt))+'</div>'; }).join("")+'</div>'; }
      [["what",en?"What":"Apa"],["why",en?"Why":"Mengapa"],["how",en?"How":"Cara"],["when",en?"When":"Bila"]].forEach(function(f){ html+='<div class="snf"><div class="snl">'+f[1]+'</div><div>'+glz(esc(L2(x[f[0]])))+'</div></div>'; });
      if(x.steps) html+='<div class="snf"><div class="snl">'+(en?"Readings, step by step":"Bacaan & cara, langkah demi langkah")+'</div>'+x.steps.map(function(stp){ return '<div class="jstep"><div class="jt">'+esc(L2(stp.t))+'</div><div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+stp.ar+'</div>'+rumiDiv(stp.ar)+'<div class="tr">'+esc(L2(stp.tr))+'</div><div class="src" style="margin:4px 0 0">'+srcHtml(stp.src)+'</div></div>'; }).join("")+'</div>';
      html+='<div class="snf"><div class="snl">'+(en?"Source":"Sumber")+'</div><div class="src" style="margin:0">'+srcHtml(x.src)+'</div></div>';
      if(x.note) html+='<div class="warnbox" style="margin:8px 0 0">'+glz(esc(L2(x.note)))+'</div>';
      if(x.id==="istikharah"||x.id==="hajat") html+='<button class="btn alt full" style="margin-top:8px" data-guide="'+x.id+'">📘 '+(en?"Step-by-step guide with doa":"Panduan langkah demi langkah & doa")+'</button>';
      if(x.n.length) html+='<div class="btns" style="margin-top:10px">'+x.n.map(function(n){ return '<button class="btn gold" data-cnt-sunat="'+x.id+'" data-n="'+n+'">'+(en?"Count ":"Kira ")+n+(x.id==="tarawih"?"+3":"")+'</button>'; }).join("")+'</div>';
    }
    html+='</div>';
  });
  html+='<div class="mut small" style="padding:4px 4px 12px">'+(en?"Prototype content: please have an ustaz review before relying on it. The intention is made in the heart; saying it aloud (talaffuz) is recommended in the Shafi'i school to help the heart.":"Kandungan prototaip: sila dapatkan semakan ustaz. Niat dilakukan dalam hati; melafazkannya disunatkan dalam mazhab Syafi'i untuk membantu hati.")+'</div>';
  el.innerHTML=html+dock;
  el.querySelectorAll("[data-st]").forEach(function(b){ b.onclick=function(){ sunTop=b.getAttribute("data-st"); sunOpen=null; render(); }; });
  el.querySelectorAll("[data-sc]").forEach(function(b){ b.onclick=function(){ sunCat=b.getAttribute("data-sc"); sunOpen=null; render(); }; });
  el.querySelectorAll("[data-so]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-so"); sunOpen = sunOpen===id ? null : id; render(); }; });
  el.querySelectorAll("[data-guide]").forEach(function(b){ b.onclick=function(){ learnPg="g_"+b.getAttribute("data-guide"); go("learn"); }; });
  el.querySelectorAll("[data-cnt-sunat]").forEach(function(b){ b.onclick=function(){
    var x=SUNAT_LIST.filter(function(y){return y.id===b.getAttribute("data-cnt-sunat");})[0], n=+b.getAttribute("data-n");
    if(x.id==="tarawih"){ rk.solat = n===8?"t8":"t20"; n=rkTarget(); } else { rk.solat="custom"; rk.customN=n; rk.customName=L2(x.name); }
    if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(n); }; on("perm",hp); N.requestPerm("camera"); }
    else startPraying(n);
  }; });
}
var tb=load("ihsan_tasbih",{i:0,left:33});
// 0.19.0 (idea 32) My zikir: your own zikir with a target, tap counter, today and lifetime totals. Storage ihsan_myzikir
function myZ(){ return load("ihsan_myzikir",[]); }
function myZSave(a){ save("ihsan_myzikir",a); }
function zMine(el){
  var A=myZ(), td=ymd(new Date());
  var h='<div class="card"><h3>📿 '+L2x("Zikir saya","My zikir")+'</h3><div class="mut small">'+L2x("Tambah zikir sendiri dengan sasaran bilangan. Ketik untuk mengira; butang volum juga boleh digunakan.","Add your own zikir with a target count. Tap to count; the volume buttons work too.")+'</div>'+
    '<button class="btn gold full g3d" id="mzAdd" style="margin-top:10px">＋ '+L2x("Tambah zikir","Add zikir")+'</button></div>';
  if(!A.length) h+='<div class="card mut small">'+L2x("Belum ada zikir. Contoh: Astaghfirullah 100×, Selawat 100×, La hawla wala quwwata illa billah 33×.","No zikir yet. Examples: Astaghfirullah 100×, Selawat 100×, La hawla wala quwwata illa billah 33×.")+
    '<div class="chips" style="margin-top:8px">'+MZ_PRE.map(function(p,i){ return '<button class="chip g3d" data-mzp="'+i+'">＋ '+esc(L2x(p.t,p.te))+'</button>'; }).join("")+'</div></div>';
  A.forEach(function(z,i){ var c=(z.d===td?z.c:0)||0, f=Math.min(1,c/Math.max(1,z.n));
    h+='<div class="card mzc"><div class="row"><h3 style="margin:0">'+esc(z.t||"Zikir")+'</h3><span class="badge">'+c+' / '+z.n+'</span></div>'+
      (z.ar?'<div class="ar" style="text-align:center;font-size:28px;line-height:1.8">'+esc(z.ar)+'</div>':'')+(z.m?'<div class="tr" style="text-align:center">'+esc(z.m)+'</div>':'')+
      '<div class="ubar1" style="margin:8px 0"><i style="width:'+Math.round(f*100)+'%"></i></div>'+
      '<div class="mut tiny">'+L2x("Jumlah sepanjang masa: ","All-time total: ")+(z.tot||0)+(z.done?' · '+L2x("Sasaran dicapai ","Target reached ")+z.done+'×':'')+'</div>'+
      '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" data-mzc="'+i+'">▶ '+L2x("Kira","Count")+'</button><button class="btn alt g3d" data-mze="'+i+'">✎</button><button class="btn alt g3d" data-mzd="'+i+'">🗑</button></div></div>';
  });
  el.innerHTML=h;
  el.querySelector("#mzAdd").onclick=function(){ mzEdit(-1); };
  el.querySelectorAll("[data-mzp]").forEach(function(b){ b.onclick=function(){ var p=MZ_PRE[+b.getAttribute("data-mzp")], a=myZ(); a.push({t:L2x(p.t,p.te), ar:p.ar, m:L2x(p.m,p.me), n:p.n, c:0, tot:0}); myZSave(a); render(); }; });
  el.querySelectorAll("[data-mzc]").forEach(function(b){ b.onclick=function(){ mzCount(+b.getAttribute("data-mzc")); }; });
  el.querySelectorAll("[data-mze]").forEach(function(b){ b.onclick=function(){ mzEdit(+b.getAttribute("data-mze")); }; });
  el.querySelectorAll("[data-mzd]").forEach(function(b){ b.onclick=function(){ var a=myZ(), i=+b.getAttribute("data-mzd"); if(!confirm(L2x("Padam zikir ini?","Delete this zikir?"))) return; a.splice(i,1); myZSave(a); render(); }; });
}
var MZ_PRE=[{t:"Istighfar",te:"Istighfar",ar:"أَسْتَغْفِرُ اللّٰهَ",m:"Aku memohon ampun kepada Allah",me:"I seek Allah's forgiveness",n:100},
  {t:"Selawat",te:"Salawat",ar:"اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",m:"Ya Allah, limpahkan rahmat ke atas junjungan kami Muhammad",me:"O Allah, send blessings upon our master Muhammad",n:100},
  {t:"Hauqalah",te:"Hawqala",ar:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",m:"Tiada daya dan kekuatan melainkan dengan Allah",me:"There is no power and no strength except with Allah",n:33}];
function mzEdit(i){
  var a=myZ(), z=i>=0?a[i]:{t:"",ar:"",m:"",n:33};
  var ov=showSheet((i>=0?"✎ ":"＋ ")+L2x("Zikir saya","My zikir"),
    '<label class="fl">'+L2x("Nama","Name")+'<input id="mzT" value="'+esc(z.t)+'" placeholder="'+L2x("cth. Istighfar","e.g. Istighfar")+'"></label>'+
    '<label class="fl">'+L2x("Teks Arab (pilihan)","Arabic text (optional)")+'<input id="mzA" dir="rtl" value="'+esc(z.ar||"")+'"></label>'+
    '<label class="fl">'+L2x("Maksud / bacaan rumi (pilihan)","Meaning / transliteration (optional)")+'<input id="mzM" value="'+esc(z.m||"")+'"></label>'+
    '<label class="fl">'+L2x("Sasaran","Target")+'<input id="mzN" type="number" min="1" max="100000" value="'+(z.n||33)+'"></label>'+
    '<div class="chips">'+[3,7,10,33,99,100,1000].map(function(n){ return '<button class="chip" data-mzn="'+n+'">'+n+'</button>'; }).join("")+'</div>'+
    '<button class="btn gold full g3d" id="mzOk" style="margin-top:10px">✓ '+L2x("Simpan","Save")+'</button>');
  ov.querySelectorAll("[data-mzn]").forEach(function(b){ b.onclick=function(){ ov.querySelector("#mzN").value=b.getAttribute("data-mzn"); }; });
  ov.querySelector("#mzOk").onclick=function(){ var t=ov.querySelector("#mzT").value.trim(), ar=ov.querySelector("#mzA").value.trim();
    if(!t && !ar){ toast(L2x("Isi nama atau teks","Fill in a name or text")); return; }
    z.t=t||ar; z.ar=ar; z.m=ov.querySelector("#mzM").value.trim(); z.n=Math.max(1,parseInt(ov.querySelector("#mzN").value,10)||33);
    if(i<0){ z.c=0; z.tot=0; a.push(z); } myZSave(a); closeOverlay(); render(); };
}
function mzCount(i){
  var a=myZ(), z=a[i], td=ymd(new Date()); if(!z) return; if(z.d!==td){ z.d=td; z.c=0; }
  var ov=document.getElementById("overlay"); ov.className="sheetov";
  ov.innerHTML='<div class="sheet mzov"><div class="row"><h3 style="margin:0">📿 '+esc(z.t)+'</h3><button class="chip" id="mzX">✕</button></div>'+
    (z.ar?'<div class="ar" style="text-align:center;font-size:30px;line-height:1.8">'+esc(z.ar)+'</div>':'')+(z.m?'<div class="tr" style="text-align:center">'+esc(z.m)+'</div>':'')+
    '<div class="tap" id="mzTap"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="136" fill="var(--well)" stroke="var(--line)" stroke-width="12"/><circle id="mzR" cx="150" cy="150" r="136" fill="none" stroke="#c9a646" stroke-width="12" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="854.5" stroke-dashoffset="854.5"/></svg><div class="num" id="mzNum" style="position:relative">0</div><div class="mut" style="position:relative">/ '+z.n+'</div></div>'+
    '<div class="btns"><button class="btn alt" id="mzU">↶ '+T("undo")+'</button><button class="btn alt" id="mzZ">⟲ '+T("reset")+'</button></div></div>';
  var upd=function(){ ov.querySelector("#mzNum").textContent=z.c; ov.querySelector("#mzR").setAttribute("stroke-dashoffset",(854.5*(1-Math.min(1,z.c/z.n))).toFixed(1)); };
  var inc=function(){ z.c++; z.tot=(z.tot||0)+1; if(z.c===z.n){ z.done=(z.done||0)+1; N.vibrate(900); toast(L2x("Sasaran dicapai. MasyaAllah!","Target reached. MasyaAllah!")); } else N.vibrate(z.c%33===0?300:25); myZSave(a); upd(); };
  ov.querySelector("#mzTap").onclick=inc;
  ov.querySelector("#mzU").onclick=function(){ if(z.c>0){ z.c--; z.tot=Math.max(0,(z.tot||0)-1); myZSave(a); upd(); } };
  ov.querySelector("#mzZ").onclick=function(){ z.c=0; myZSave(a); upd(); N.vibrate(150); };
  var close=function(){ volHook=null; if(N.setVolumeKeys) N.setVolumeKeys(false); closeOverlay(); render(); };
  ov.querySelector("#mzX").onclick=close; ov._close=close;
  volHook=inc; if(N.setVolumeKeys) N.setVolumeKeys(true);
  upd();
}
function zTasbih(el){
  function draw(){
    var item=TASBIH[tb.i], total=item.n, frac=total?(total-tb.left)/total:1;
    el.innerHTML='<div class="card tasbih"><div class="steps">'+TASBIH.map(function(x,i){return '<span class="'+(i<tb.i?"done":i===tb.i?"on":"")+'"></span>';}).join("")+'</div>'+
    '<div class="ar" style="text-align:center;font-size:'+(tb.i===3?24:34)+'px;line-height:1.8;margin-top:6px">'+item.ar+'</div>'+rumiDiv(item.ar,true)+'<div class="tr" style="text-align:center">'+esc(tr(item))+'</div>'+
    '<div class="tap" id="tapC"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="136" fill="var(--well)" stroke="var(--line)" stroke-width="12"/><circle cx="150" cy="150" r="136" fill="none" stroke="#c9a646" stroke-width="12" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="854.5" stroke-dashoffset="'+(854.5*(1-frac)).toFixed(1)+'"/></svg><div class="num" style="position:relative">'+tb.left+'</div><div class="mut" style="position:relative">'+(tb.left===0?T("done"):(S.lang==="en"?"tap":"ketik"))+'</div></div>'+
    '<div class="btns tasbihPad"><button class="btn alt" id="tUndo">↶ '+T("undo")+'</button><button class="btn alt" id="tReset">⟲ '+T("reset")+'</button></div>'+
    '<div class="set" style="margin-top:8px"><span>🔈 '+(S.lang==="en"?"Count with volume buttons":"Kira guna butang volum")+'</span>'+sw("tVol",S.volTasbih)+'</div>'+
    '<button class="btn alt full" id="tDark">🌑 '+(S.lang==="en"?"Dark screen (pocket mode)":"Skrin gelap (mod poket)")+'</button></div>'+
    '<div class="card"><h3>'+T("why")+'</h3><div class="why">'+esc(S.lang==="en"?TASBIH_WHY.en:TASBIH_WHY.ms)+'</div><div class="src">'+srcHtml(TASBIH_WHY.src)+'</div></div>';
    tbTap=function(){ el.querySelector("#tapC").onclick(); };
    el.querySelector("#tVol").onchange=function(){ S.volTasbih=this.checked; saveS(); if(N.setVolumeKeys) N.setVolumeKeys(S.volTasbih); toast(S.volTasbih?(S.lang==="en"?"Press volume up or down to count":"Tekan volum naik atau turun untuk mengira"):(S.lang==="en"?"Volume buttons back to normal":"Butang volum kembali biasa")); };
    el.querySelector("#tDark").onclick=function(){ tasbihDark(); };
    el.querySelector("#tapC").onclick=function(){
      if(tb.left>0){ tb.left--; N.vibrate(tb.left===0?(tb.i===TASBIH.length-1?900:450):25); }
      if(tb.left===0){ if(tb.i<TASBIH.length-1){ save("ihsan_tasbih",tb); draw(); setTimeout(function(){ if(tb.left===0 && tb.i<TASBIH.length-1){ tb.i++; tb.left=TASBIH[tb.i].n; save("ihsan_tasbih",tb); draw(); } },900); return; } else toast(S.lang==="en"?"Tasbih complete - 100":"Tasbih selesai - 100"); }
      save("ihsan_tasbih",tb); draw(); };
    el.querySelector("#tUndo").onclick=function(){ if(tb.left<TASBIH[tb.i].n) tb.left++; else if(tb.i>0){ tb.i--; tb.left=0+1; } save("ihsan_tasbih",tb); draw(); };
    el.querySelector("#tReset").onclick=function(){ N.vibrate(200); tb={i:0,left:33}; save("ihsan_tasbih",tb); draw(); };
  }
  draw();
}
function cardItem(it, key, idx, opts){
  var n=it.n, st=zstate[key+idx]||0, ar=opts&&opts.evening&&it.ev?it.ev:it.ar;
  if(opts && opts.triple && it.n3) n=3;
  var h='<div class="card"><div class="row"><h3>'+(it.title?(opts&&opts.num?(idx+1)+'. ':'')+esc(it.title):(idx+1)+'.')+'</h3>'+(n>1?'<span class="badge">'+n+'×</span>':'')+'</div>';
  if(it.mushaf) h+='<div class="warnbox">📖 '+esc(tr(it))+'</div>';
  else { var mt = (opts&&opts.evening&&(it.ev_ms||it.ev_en)) ? (S.lang==="en"?it.ev_en:it.ev_ms) : tr(it); h+='<div class="ar">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(mt)+'</div>'+toolRow(ar, mt, it.src, it.title||""); }
  if(it.why_ms) h+='<div class="why"><b>'+T("why")+':</b> '+esc(S.lang==="en"?it.why_en:it.why_ms)+'</div>';
  h+='<div class="src">'+T("source")+': '+srcHtml(it.src)+'</div>';
  if(it.tasbih) h+='<div class="counter"><button class="btn gold full" data-open-tasbih="1">📿 '+esc(tr(it))+'</button></div>';
  else h+='<div class="counter"><div class="cnt '+(st>=n?"done":"")+'" data-cnt="'+key+idx+'" data-n="'+n+'">'+(st>=n?"✓ "+T("done"):st+" / "+n)+'</div></div>';
  return h+'</div>';
}
function bindCounters(el){
  el.querySelectorAll("[data-cnt]").forEach(function(c){ c.onclick=function(){ var k=c.getAttribute("data-cnt"), n=+c.getAttribute("data-n"); var v=(zstate[k]||0); v = v>=n ? 0 : v+1; zstate[k]=v; save("ihsan_zstate",zstate); N.vibrate(v>=n?120:20); c.className="cnt "+(v>=n?"done":""); c.textContent = v>=n ? "✓ "+T("done") : v+" / "+n; }; });
  el.querySelectorAll("[data-open-tasbih]").forEach(function(b){ b.onclick=function(){ sub.zikir="tasbih"; tb={i:0,left:33}; save("ihsan_tasbih",tb); render(); }; });
}
function resetKeys(prefix){ Object.keys(zstate).forEach(function(k){ if(k.indexOf(prefix)===0) delete zstate[k]; }); save("ihsan_zstate",zstate); }
var afterSolat=null;
function zAfter(el){
  if(!afterSolat) afterSolat=currentPrayer();
  var triple = afterSolat==="subuh"||afterSolat==="maghrib";
  var html='<div class="chips">'+PR.map(function(k){return '<button class="chip '+(afterSolat===k?"on":"")+'" data-a="'+k+'">'+T(k)+'</button>';}).join("")+'</div>';
  POST_PRAYER.forEach(function(it,i){ if(it.only && it.only.indexOf(afterSolat)<0) return; html+=cardItem(it,"pp"+afterSolat,i,{triple:triple}); });
  html+='<button class="btn alt full" id="ppReset">⟲ '+T("reset")+'</button>';
  html+='<div class="warnbox">'+(S.lang==="en"?"The longer wirid and doa commonly read in Malaysian masjid after jemaah is an arrangement by scholars. It will be added in a separate tab after review by an ustaz.":"Wirid dan doa yang lebih panjang yang biasa dibaca di masjid Malaysia selepas solat berjemaah ialah susunan ulama. Ia akan ditambah dalam tab berasingan selepas disemak oleh ustaz.")+'</div>';
  el.innerHTML=html;
  el.querySelectorAll("[data-a]").forEach(function(b){ b.onclick=function(){ afterSolat=b.getAttribute("data-a"); zAfter(el); }; });
  el.querySelector("#ppReset").onclick=function(){ N.vibrate(200); resetKeys("pp"+afterSolat); zAfter(el); };
  bindCounters(el);
}
var mathEvening=null, mIdx=0;
// 0.28.0: Wirid pagi & petang (the Prophet's own morning/evening adhkar, wirid.js), the tab left of Ma'thurat
var wIdx=0;
function vWirid(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  var key=(mathEvening?"we":"wp")+ymd(new Date()), html='<div class="mut small">'+L2x("Zikir pagi dan petang yang diamalkan Rasulullah ﷺ, setiap satu dengan sumbernya. Pagi: selepas Subuh hingga syuruk. Petang: selepas Asar hingga Maghrib.","The morning and evening adhkar the Prophet ﷺ practised, each with its source. Morning: after Subuh until sunrise. Evening: after Asar until Maghrib.")+'</div>'+
    '<div class="warnbox">'+L2x("Lafaz dan sumber ditulis daripada ingatan dan perlu disemak oleh ustaz.","Wording and sources were written from memory and need an ustaz's review.")+'</div>';
  var done=0, tot=0, IT=[];
  WIRID.forEach(function(it,i){ if((it.m && mathEvening) || (it.e && !mathEvening)) return; tot++; IT.push(i); if((zstate[key+i]||0)>=it.n) done++; });
  var hs=!!S.wiridH, NW=IT.length; if(wIdx>=NW) wIdx=0;
  var one=function(j){ var i=IT[j]; return cardItem(WIRID[i],key,i,{evening:mathEvening}); };
  // 0.34.0: like Ma'thurat, ↔ shows one wirid at a time; swipe sideways, the next one rides in beside it
  if(hs) html+='<div class="mut small" id="wPos" style="text-align:center;margin:4px 0"></div><div id="wOne"></div>';
  else IT.forEach(function(i,j){ html+=one(j); });
  html='<div class="dock"><div class="tabrow"><div class="chips"><button class="chip '+(!mathEvening?"on":"")+'" data-e="0">☀️ '+T("pagi")+'</button><button class="chip '+(mathEvening?"on":"")+'" data-e="1">🌙 '+T("petang")+'</button></div><span class="small" id="wProg">'+done+'/'+tot+'</span><label class="trt"><span>↔</span><span class="switch sm"><input type="checkbox" id="wH" '+(hs?"checked":"")+'><span></span></span></label>'+trToggle()+'</div>'+
    (hs?'<div class="mbar indock"><button class="chip" id="wPrev">‹</button><input type="range" id="wRange" min="1" max="'+NW+'" value="'+(wIdx+1)+'"><button class="chip" id="wNext">›</button></div>':'')+'</div>'+html+
    '<button class="btn alt full" id="wReset">⟲ '+T("reset")+'</button>';
  el.innerHTML=html; bindTrToggle(el);
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  el.querySelector("#wH").onchange=function(){ S.wiridH=this.checked; save("ihsan_settings",S); vWirid(el); dockFix(); };
  el.querySelector("#wReset").onclick=function(){ N.vibrate(200); resetKeys(key); vWirid(el); dockFix(); };
  if(hs){
    var box=el.querySelector("#wOne"), pos=el.querySelector("#wPos"), rng=el.querySelector("#wRange"), vw=document.getElementById("view");
    var show=function(j, dir){ wIdx=Math.max(0,Math.min(NW-1,j)); box.innerHTML=one(wIdx); if(dir) IbSwipe.inFrom(box, -dir); pos.textContent=(wIdx+1)+" / "+NW; rng.value=wIdx+1; bindCounters(box);
      var top=pos.offsetTop-8; if(vw.scrollTop>top) vw.scrollTop=top; };
    show(wIdx,0);
    IbSwipe(box, {can:function(s){ return s<0 ? wIdx<NW-1 : wIdx>0; }, go:function(s){ show(wIdx+(s<0?1:-1), 0); }, peek:function(s){ var j=wIdx+(s<0?1:-1); return j>=0&&j<NW?one(j):null; }});
    el.querySelector("#wPrev").onclick=function(){ show(wIdx-1,-1); };
    el.querySelector("#wNext").onclick=function(){ show(wIdx+1,1); };
    rng.oninput=function(){ show(+rng.value-1,0); };
    box.addEventListener("click", function(e){ var c=e.target.closest(".cnt"); if(!c) return; setTimeout(function(){ if(c.classList.contains("done") && wIdx<NW-1) show(wIdx+1,1); },350); });
  } else bindCounters(el);
  el.addEventListener("click", function(e){ if(!e.target.closest("[data-cnt]")) return; setTimeout(function(){ var d=0; IT.forEach(function(i){ if((zstate[key+i]||0)>=WIRID[i].n) d++; }); var p=el.querySelector("#wProg"); if(p) p.textContent=d+"/"+tot; },50); });
}
function zMathurat(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  var key=(mathEvening?"me":"mp")+ymd(new Date());
  var html='<div class="mut small">'+(S.lang==="en"?"Wazifah Sughra. Read after Subuh (morning) and after Asar or Maghrib (evening).":"Wazifah Sughra. Dibaca selepas Subuh (pagi) dan selepas Asar atau Maghrib (petang).")+'</div>';
  html+='<div class="warnbox">'+(S.lang==="en"?"Prototype content: the order, wording and counts must be checked against an endorsed printed Al-Ma'thurat.":"Kandungan prototaip: susunan, lafaz dan bilangan perlu disemak dengan buku Al-Ma'thurat bercetak yang disahkan.")+'</div>';
  var hs=!!S.mathH, NM=MATHURAT.length, oldBar=document.querySelector("#view .dock .mbar"); if(oldBar){ oldBar.remove(); setTimeout(dockFix,0); }
  if(!hs){
    html+='<div class="mcards" id="mCards">';
    MATHURAT.forEach(function(it,i){ html+=cardItem(it,key,i,{evening:mathEvening, num:true}); });
    el.innerHTML=html+'</div>';
  } else {
    // One card at a time: swipe left/right, normal vertical page scroll, slider at the bottom.
    if(mIdx>=NM) mIdx=0;
    html+='<div class="mut small" id="mPos" style="text-align:center;margin:4px 0"></div><div id="mOne"></div>'+
      '<div class="mbar"><button class="chip" id="mPrev">‹</button><input type="range" id="mRange" min="1" max="'+NM+'" value="'+(mIdx+1)+'"><button class="chip" id="mNext">›</button></div>';
    el.innerHTML=html;
    var one=el.querySelector("#mOne"), pos=el.querySelector("#mPos"), rng=el.querySelector("#mRange"), view=document.getElementById("view");
    // 0.26.0: the slider lives inside the bottom dock (pinned with the Pagi/Petang bar) so the two never overlap
    var mb=el.querySelector(".mbar"), vd=document.querySelector("#view .dock");
    if(vd && !el.contains(vd)){ mb.classList.add("indock"); vd.appendChild(mb); setTimeout(dockFix,0); }
    else mb.style.bottom=(document.getElementById("nav").offsetHeight+(document.getElementById("subnav")?document.getElementById("subnav").offsetHeight:0))+"px";
    var show=function(i, dir){
      mIdx=Math.max(0,Math.min(NM-1,i));
      one.innerHTML=cardItem(MATHURAT[mIdx],key,mIdx,{evening:mathEvening, num:true});
      if(dir) IbSwipe.inFrom(one, -dir);
      pos.textContent=(mIdx+1)+" / "+NM; rng.value=mIdx+1;
      bindCounters(one);
      var top=pos.offsetTop-8; if(view.scrollTop>top) view.scrollTop=top;
    };
    show(mIdx,0);
    // 0.33.0: the card follows the finger
    IbSwipe(one, {can:function(s){ return s<0 ? mIdx<NM-1 : mIdx>0; }, go:function(s){ show(mIdx+(s<0?1:-1), 0); },
      peek:function(s){ var j=mIdx+(s<0?1:-1); return MATHURAT[j]?cardItem(MATHURAT[j],key,j,{evening:mathEvening, num:true}):null; }});
    mb.querySelector("#mPrev").onclick=function(){ show(mIdx-1,-1); };
    mb.querySelector("#mNext").onclick=function(){ show(mIdx+1,1); };
    rng.oninput=function(){ show(+rng.value-1,0); };
    one.addEventListener("click", function(e){ var c=e.target.closest(".cnt"); if(!c) return; setTimeout(function(){ if(c.classList.contains("done") && mIdx<NM-1) show(mIdx+1,1); },350); });
  }
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  bindCounters(el);
}
var doaCat=0;
// 0.28.0: 12 sub-categories in each group (Farah); 18-35 come from doa_more.js
var DOA_GROUPS=[["Harian","Daily life",[0,1,2,3,4,5,6,7,18,19,20,21]],["Keperluan hidup","Life & needs",[9,12,13,11,14,15,22,23,24,25,26,27]],["Hati & akhirat","Heart & Hereafter",[8,10,17,16,28,29,30,31,32,33,34,35]]];
function doaGroupOf(i){ for(var g=0;g<DOA_GROUPS.length;g++) if(DOA_GROUPS[g][2].indexOf(i)>=0) return g; return 0; }
function zDaily(el){
  var html='';
  DOA[doaCat].items.forEach(function(it,ii){ html+=doaCard(it, doaCat, ii); });
  el.innerHTML=html;
}

// 0.28.0: the whole coming (or current) Ramadan as a Hijri month, small Masihi date in each cell. Each day ticks and lights up
// exactly when its Maghrib arrives; the last 10 nights have a frame; Syawal 1 (Eid) closes the month. Tap a past day to mark it missed (for qadha).
var RMD=load("ihsan_ramadan",{});
function ramadanMonth(){
  var ev=nextHijriEvent(9,1,10,1); if(!ev) return '';
  var st=ev.start, y=ev.y, n=29; var d30=addDays(st,29), h30=hijriOf(d30); if(h30 && h30.m===9) n=30;
  var eid=addDays(st,n), now=Date.now(), missed=(RMD[y]||{}), done=0, lead=(st.getDay()+6)%7, en=en_();
  var h='<div class="card rmCard"><div class="row"><h3>🌙 Ramadan '+y+'H</h3><span class="small gold" id="rmCount"></span></div>'+
    '<div class="mut small">'+ymdNice(st)+' – '+ymdNice(addDays(st,n-1))+' · '+n+' '+L2x("hari","days")+'</div>'+
    '<div class="rmGrid">'+(en?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Isn","Sel","Rab","Kha","Jum","Sab","Ahd"]).map(function(x){ return '<div class="rmH">'+x+'</div>'; }).join("");
  for(var i=0;i<lead;i++) h+='<div class="rmC out"></div>';
  for(var d=1; d<=n; d++){
    var dt=addDays(st,d-1), ds=ymd(dt), t=null; try{ t=getDay(dt); }catch(e){}
    var mg=t&&t.maghrib?at(ds,t.maghrib).getTime():new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),19,20).getTime();
    var past=now>=mg, today=ds===ymd(new Date()), miss=!!missed[d], last10=d>=21;
    if(past && !miss) done++;
    h+='<button class="rmC'+(past?(miss?" miss":" done"):"")+(today?" today":"")+(last10?" l10":"")+(d===21?" l10s":"")+(last10&&d%2===1?" odd":"")+'" data-rmd="'+d+'"'+(past?'':' disabled')+'>'+
      '<b>'+d+'</b><small>'+dt.getDate()+' '+(en?ME:MS)[dt.getMonth()].slice(0,3)+'</small>'+(past?'<i>'+(miss?"✕":"✓")+'</i>':'')+(last10&&d%2===1?'<em>✦</em>':'')+'</button>';
  }
  h+='<div class="rmC eid'+(now>=eid.getTime()?" done":"")+'"><b>🌙</b><small>'+L2x("1 Syawal","1 Syawal")+'</small><small>'+eid.getDate()+' '+(en?ME:MS)[eid.getMonth()].slice(0,3)+'</small></div></div>';
  h+='<div class="rmLeg"><span><i class="lg done"></i>'+L2x("Selesai (selepas Maghrib)","Done (after Maghrib)")+'</span><span><i class="lg l10"></i>'+L2x("10 malam terakhir","Last 10 nights")+'</span><span>✦ '+L2x("malam ganjil","odd nights")+'</span><span><i class="lg miss"></i>'+L2x("Tidak berpuasa (ketik)","Missed (tap)")+'</span></div></div>';
  ramadanMonth.st={done:done, n:n, y:y};
  clearTimeout(ramadanMonth._t); var nx=null;
  for(var k=1;k<=n;k++){ var dk=addDays(st,k-1), tk=null; try{ tk=getDay(dk); }catch(e){} if(!tk||!tk.maghrib) continue; var mk=at(ymd(dk),tk.maghrib).getTime(); if(mk>now){ nx=mk; break; } }
  if(nx && nx-now<864e5) ramadanMonth._t=setTimeout(function(){ if(view==="cal" && SUB2.cal==="puasa") render(); }, nx-now+1000);
  return h.replace('<span class="small gold" id="rmCount"></span>','<span class="small gold" id="rmCount">'+done+' / '+n+'</span>');
}
function ymdNice(d){ return d.getDate()+" "+(en_()?ME:MS)[d.getMonth()]+" "+d.getFullYear(); }
function bindRamadan(el){
  el.querySelectorAll("[data-rmd]").forEach(function(b){ b.onclick=function(){ var y=ramadanMonth.st.y, d=+b.getAttribute("data-rmd"); RMD[y]=RMD[y]||{}; if(RMD[y][d]) delete RMD[y][d]; else RMD[y][d]=1; save("ihsan_ramadan",RMD); N.vibrate(20); render(); }; });
}
// CALENDAR
var cal={y:null,m:null,sel:null,all:false,lay:{ph:true,sc:true,is:true}};
var MS=["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"], ME=["January","February","March","April","May","June","July","August","September","October","November","December"];
// Find the Gregorian date of Hijri (hy, hm, hd) near an estimate.
function hijriToDate(hy,hm,hd){
  var t=new Date(), h0=hijriOf(t); if(!h0) return null; t.setHours(12,0,0,0);
  var diff=((hy*12+hm)-(h0.y*12+h0.m))*29.5306+(hd-h0.d), est=addDays(t,Math.round(diff));
  for(var k=0;k<=6;k++){ for(var sgn=-1;sgn<=1;sgn+=2){ var d=addDays(est,k*sgn), h=hijriOf(d); if(h && h.y===hy && h.m===hm && h.d===hd) return d; if(k===0) break; } }
  return null;
}
function nextHijriEvent(m,d,endM,endD){
  var t=new Date(); t.setHours(0,0,0,0); var h=hijriOf(t); if(!h) return null;
  for(var y=h.y; y<=h.y+1; y++){
    var st=hijriToDate(y,m,d); if(!st) continue;
    st=new Date(st.getFullYear(),st.getMonth(),st.getDate());
    var en=endM?hijriToDate(y,endM,endD):st; if(!en) en=st; en=new Date(en.getFullYear(),en.getMonth(),en.getDate());
    if(endM ? en>t : en>=t) return {start:st, end:en, y:y, inProgress: st<=t};
  }
  return null;
}
var CD_EVENTS=[["ramadhan",9,1,10,1,"Ramadan","Ramadan"],["fitri",10,1,0,0,"Aidilfitri","Eid al-Fitr"],["adha",12,10,0,0,"Aidiladha","Eid al-Adha"],["muharram",1,1,0,0,"Awal Muharram","Islamic New Year"]];
function countdownBoxes(){
  var t=new Date(); t.setHours(0,0,0,0); var en=S.lang==="en";
  return '<div class="stick cdbox">'+CD_EVENTS.map(function(e){
    var ev=nextHijriEvent(e[1],e[2],e[3],e[4]);
    if(!ev) return '<div class="cdb"><div class="cdn">'+(en?e[6]:e[5])+'</div><div class="cdd">--</div></div>';
    var days=Math.round((ev.start-t)/864e5), big, unit;
    if(ev.inProgress && e[3]){ big=Math.round((t-ev.start)/864e5)+1; unit=en?"day":"hari ke"; }
    else if(days===0){ big="✓"; unit=en?"today":"hari ini"; }
    else { big=days; unit=en?"days":"hari"; }
    var gd=ev.start.toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"});
    return '<div class="cdb'+(ev.inProgress||days===0?" now":"")+'"><div class="cdn">'+(en?e[6]:e[5])+'</div><div class="cdd">'+(ev.inProgress&&e[3]?'<small>'+unit+'</small> '+big:big+' <small>'+unit+'</small>')+'</div><div class="cdg">'+gd+'</div><div class="cdh">'+e[2]+' '+HIJRI_MONTHS[e[1]-1]+' '+ev.y+'H</div></div>';
  }).join("")+'</div>';
}
var JNd=null;
function calCell(dt, big, small, smallIsHijri, tds){
  var ds=ymd(dt), ph=cal.lay.ph?holidaysOn(ds,cal.all):[], sc=cal.lay.sc?schoolOn(ds,cal.all):[], is=cal.lay.is?islamicOn(dt):[];
  var mineph=ph.some(function(x){return x.mine;}), minesc=sc.some(function(x){return x.mine;});
  var cls="d"+(ds<tds?" past":"")+(ds===tds?" today":"")+(ds===cal.sel?" sel":"")+(mineph?" ph":"")+(minesc?" sch":"")+(dt.getDay()===5?" fri":"")+(JNd&&JNd[ds]?" jn":"");
  return '<div class="'+cls+'" data-d="'+ds+'"><span class="g">'+big+'</span><span class="hj'+(smallIsHijri?'':' gs')+'">'+small+'</span><span class="dots">'+(ph.length?'<i class="ph"></i>':'')+(sc.length?'<i class="sc"></i>':'')+(is.length?'<i class="is"></i>':'')+'</span>'+(cal.uMax&&useSec(ds)>0?'<span class="ub" style="width:'+Math.max(8,Math.round(useSec(ds)*100/cal.uMax))+'%"></span>':'')+'</div>';
}
// Usage card in Calendar: selected day, its week (Mon-Sun) and all-time totals
function usageCard(selDs,noPr){
  usageFlush();
  var en=en_(), sd=parseYmd(selDs), mon=addDays(sd,-((sd.getDay()+6)%7)), days=[], wkT=0, wkP=0, mx=60;
  for(var i=0;i<7;i++){ var d=addDays(mon,i), k=ymd(d), u=useSec(k), p=plogSec(k); days.push({d:d,k:k,u:u,p:p}); wkT+=u; wkP+=p; mx=Math.max(mx,u,p); }
  var all=Object.keys(USAGE).sort(), tot=0, ptot=0; all.forEach(function(k){ tot+=USAGE[k].t; }); PLOG.forEach(function(r){ ptot+=r.sec; });
  var act=all.filter(function(k){ return USAGE[k].t>=30; }).length;
  var dU=useSec(selDs), dP=plogSec(selDs), vv=USAGE[selDs]?USAGE[selDs].v:{};
  var VN={home:T("utama"),solat:T("solat"),sunat:T("sunat"),learn:T("learn"),halal:T("halal"),cal:T("cal"),more:T("more"),kids:T("kids"),rakaat:L2x("Kira rakaat","Rakaat counter")};
  var vtop=Object.keys(vv).map(function(k){ return [k.split(":")[0],vv[k]]; }).reduce(function(m,x){ m[x[0]]=(m[x[0]]||0)+x[1]; return m; },{});
  vtop=Object.keys(vtop).map(function(k){ return [k,vtop[k]]; }).sort(function(a,b){ return b[1]-a[1]; }).slice(0,5);
  var h='<div class="card ucard"><h3>⏱ '+L2x("Masa penggunaan","Time spent")+'</h3>';
  h+='<div class="urow"><div><div class="mut tiny">'+esc(sd.toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"}))+'</div><div class="ubig">'+durEn(dU)+'</div><div class="mut tiny">'+L2x("dalam aplikasi","in the app")+'</div></div>'+
     '<div><div class="mut tiny">'+L2x("Solat (kiraan)","Prayer (counter)")+'</div><div class="ubig gold">'+durEn(dP)+'</div><div class="mut tiny">'+plogDay(selDs).length+L2x(" sesi"," sessions")+'</div></div></div>';
  h+='<div class="ubar1"><i style="width:'+Math.min(100,Math.round(dU*100/Math.max(dU,3600)))+'%"></i></div>';
  if(vtop.length) h+='<div class="uvs">'+vtop.map(function(x){ return '<span>'+esc(VN[x[0]]||x[0])+' <b>'+durEn(x[1])+'</b></span>'; }).join("")+'</div>';
  h+='<div class="snl" style="margin-top:12px">'+L2x("Minggu ini","This week")+' · '+durEn(wkT)+' <span class="mut tiny">('+L2x("solat ","prayer ")+durEn(wkP)+')</span></div><div class="uweek">'+days.map(function(x){
    return '<div class="uw'+(x.k===selDs?' sel':'')+'" data-d="'+x.k+'"><div class="uwb"><i class="a" style="height:'+Math.round(x.u*100/mx)+'%"></i><i class="p" style="height:'+Math.round(x.p*100/mx)+'%"></i></div><div class="uwl">'+x.d.toLocaleDateString(locTag(),{weekday:"narrow"})+'</div><div class="uwv">'+(x.u?durEn(x.u):'')+'</div></div>'; }).join("")+'</div>';
  h+='<div class="legend" style="margin-top:4px"><span><i style="background:var(--green)"></i>'+L2x("Aplikasi","App")+'</span><span><i style="background:var(--gold)"></i>'+L2x("Solat","Prayer")+'</span></div>';
  h+='<div class="snl" style="margin-top:12px">'+L2x("Keseluruhan","Overall")+'</div><div class="urow3"><div><b>'+durEn(tot)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+durEn(act?tot/act:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+durEn(ptot)+'</b><span class="mut tiny">'+L2x("solat dikira","prayer counted")+'</span></div></div>'+
     '<div class="mut tiny" style="margin-top:4px">'+(all.length?L2x("Sejak ","Since ")+parseYmd(all[0]).toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"})+' · '+act+L2x(" hari aktif"," active days"):L2x("Mula direkod hari ini.","Recording starts today."))+'</div>';
  if(noPr) return h+'</div>';
  // which prayers were counted that day
  var pl=plogDay(selDs);
  h+='<div class="snl" style="margin-top:12px">'+L2x("Solat hari ini","Prayers that day")+'</div>'+prRegister(selDs,false);
  if(pl.length) h+='<div class="plist">'+pl.map(function(r){ return '<div class="pli"><span>'+hm12(r.t0)+'</span><b>'+esc(r.n)+'</b><span class="mut tiny">'+L2x("waktu ","in ")+T(r.w)+'</span><span>'+num(r.c)+'/'+r.tg+'</span><span>'+durEn(r.sec)+'</span></div>'; }).join("")+'</div>';
  return h+'</div>';
}
function vCal0(el){
  var now=new Date(); if(cal.y===null){ cal.y=now.getFullYear(); cal.m=now.getMonth(); cal.sel=ymd(now); }
  var tds=ymd(now), en=S.lang==="en", MO=en?ME:MS;
  usageFlush(); cal.uMax=0; Object.keys(USAGE).forEach(function(k){ cal.uMax=Math.max(cal.uMax,USAGE[k].t); }); cal.uMax=Math.max(cal.uMax,1800);
  if(cal.hy==null){ var h0=hijriOf(now); if(h0){ cal.hy=h0.y; cal.hm=h0.m; } }
  var html=countdownBoxes()+'<div class="kadRow"><button class="chip" data-kad="">🎴 '+L2x("Buat kad ucapan","Make a greeting card")+'</button></div>';
  JNd=jnData().d;
  var dockGH='<div class="grp2"><button class="chip '+(cal.mode!=="h"?"on":"")+'" data-cm="g">📅 '+(en?"Gregorian":"Masihi")+'</button><button class="chip '+(cal.mode==="h"?"on":"")+'" data-cm="h">🌙 '+(en?"Hijri":"Hijrah")+'</button></div>', dock='<div class="dock">';
  var hdr, sub, cells=[], lead;
  if(cal.mode==="h" && cal.hy!=null){
    var st=hijriToDate(cal.hy,cal.hm,1), len=0;
    if(st){ for(var k=0;k<31;k++){ var hd=hijriOf(addDays(st,k)); if(!hd||hd.m!==cal.hm) break; len++; } }
    hdr=HIJRI_MONTHS[cal.hm-1]+" "+cal.hy+"H";
    var gEnd=st?addDays(st,len-1):null; sub=st?(MO[st.getMonth()]+(st.getMonth()!==gEnd.getMonth()?" – "+MO[gEnd.getMonth()]:"")+" "+gEnd.getFullYear()):"";
    lead=st?(st.getDay()+6)%7:0;
    for(var k2=0;k2<len;k2++){ var dt=addDays(st,k2); cells.push(calCell(dt, k2+1, dt.getDate()+(dt.getDate()===1?" "+MO[dt.getMonth()].slice(0,3):""), false, tds)); }
  } else {
    var first=new Date(cal.y,cal.m,1), dim=new Date(cal.y,cal.m+1,0).getDate();
    var h1=hijriOf(first), h2=hijriOf(new Date(cal.y,cal.m,dim));
    hdr=MO[cal.m]+" "+cal.y; sub=h1&&h2?(HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H"):"";
    lead=(first.getDay()+6)%7;
    for(var d=1; d<=dim; d++){ var dt2=new Date(cal.y,cal.m,d), hj=hijriOf(dt2); cells.push(calCell(dt2, d, hj?hj.d+(hj.d===1?" "+HIJRI_MONTHS[hj.m-1].slice(0,3):""):"", true, tds)); }
  }
  // 0.26.0 (Farah): Export, holiday layers and All states sit at the top of the calendar
  html+='<div class="chips calTop"><button class="chip g3d" id="cExp">⇪ '+(en?"Export":"Eksport")+'</button><button class="chip g3d '+(cal.lay.ph?"on":"")+'" data-l="ph">'+T("ph")+'</button><button class="chip g3d '+(cal.lay.sc?"on":"")+'" data-l="sc">'+T("sc")+'</button><button class="chip g3d '+(cal.lay.is?"on":"")+'" data-l="is">'+T("is")+'</button><button class="chip g3d '+(cal.all?"on":"")+'" id="cAll">'+T("allst")+'</button></div>';
  html+='<div class="card" id="calCard"><div class="row"><button class="chip" id="cPrev">‹</button><div style="text-align:center"><div style="font-weight:700;font-size:17px">'+hdr+'</div><div style="color:var(--gold);font-size:12px">'+sub+'</div></div><button class="chip" id="cNext">›</button></div>';
  html+='<div class="legend"><span><i class="ph"></i>'+T("ph")+'</span><span><i class="sc"></i>'+T("sc")+'</span><span><i class="is"></i>'+T("is")+'</span></div>';
  html+='<div class="cal">'+(en?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Isn","Sel","Rab","Kha","Jum","Sab","Ahd"]).map(function(d){return '<div class="h">'+d+'</div>';}).join("");
  for(var i=0;i<lead;i++) html+='<div class="d out"></div>';
  html+=cells.join("");
  dock+=dockGH+'</div>';
  html+='</div><div class="mut small" style="margin-top:8px">'+T("state")+': <b>'+STATES[S.state]+'</b> · '+(S.lang==="en"?"School group ":"Kumpulan sekolah ")+groupOf(S.state)+'</div></div>';
  // selected day details
  var sd=parseYmd(cal.sel), sh=hijriOf(sd), list=[];
  holidaysOn(cal.sel,cal.all).forEach(function(x){ list.push('<div class="ev"><i class="ph"></i><div><b>'+esc(tr(x))+'</b><div class="mut small">'+esc(x.where)+'</div></div></div>'); });
  schoolOn(cal.sel,cal.all).forEach(function(x){ list.push('<div class="ev"><i class="sc"></i><div><b>'+esc(tr(x))+'</b><div class="mut small">'+esc(x.where)+'</div></div></div>'); });
  islamicOn(sd).forEach(function(x){ list.push('<div class="ev"><i class="is"></i><div><b>'+esc(tr(x))+'</b></div></div>'); });
  sunnahFastOn(sd).forEach(function(x){ list.push('<div class="ev"><i style="background:#666"></i><div>'+esc(tr(x))+'</div></div>'); });
  var dl=sd.toLocaleDateString(S.lang==="en"?"en-GB":"ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  html+='<div class="card"><h3>'+esc(dl)+'</h3><div style="color:var(--gold)">'+hijriStr(sh)+(sh&&sh.src!=="jakim"?' <span class="badge warn">'+(S.lang==="en"?"estimate":"anggaran")+'</span>':'')+'</div>'+(list.length?list.join(""):'<div class="mut small" style="margin-top:6px">'+(S.lang==="en"?"No holidays or Islamic days.":"Tiada cuti atau hari kebesaran.")+'</div>')+'</div>';
  var kOcc=sh?(sh.m===10&&sh.d<=7?"fitri":sh.m===12&&sh.d>=9&&sh.d<=13?"adha":sh.m===9?"ramadan":sh.m===1&&sh.d<=10?"hijrah":""):"";
  if(kOcc) html+='<div class="kadRow"><button class="chip" data-kad="'+kOcc+'">🎴 '+L2x("Buat kad ","Make a card: ")+L2x(KAD_OCC.filter(function(o){ return o[0]===kOcc; })[0][1],KAD_OCC.filter(function(o){ return o[0]===kOcc; })[0][2])+'</button></div>';
  html+=jnCard(cal.sel);
  html+=usageCard(cal.sel);
  html+='<div class="mut small" style="padding:0 4px 10px">'+(S.lang==="en"?"Holiday data: 2026 federal & state gazette and KPM academic calendar. Islamic-calendar holidays depend on the official moon-sighting announcement.":"Data cuti: warta persekutuan & negeri 2026 dan Kalendar Akademik KPM. Cuti berasaskan kalendar Islam tertakluk kepada pengisytiharan rasmi.")+'</div>';
  html+=miniYear(now.getFullYear())+miniYear(now.getFullYear()+1);
  el.innerHTML=html+dock;
  el.querySelectorAll("[data-mm]").forEach(function(c){ c.onclick=function(){ cal.y=+c.getAttribute("data-my"); cal.m=+c.getAttribute("data-mm"); cal.sel=ymd(new Date(cal.y,cal.m,1)); render(); document.getElementById("view").scrollTop=0; }; });
  var step=function(dir, noDraw){
    if(cal.mode==="h"){ cal.hm+=dir; if(cal.hm<1){cal.hm=12;cal.hy--;} if(cal.hm>12){cal.hm=1;cal.hy++;} var d1=hijriToDate(cal.hy,cal.hm,1); if(d1) cal.sel=ymd(d1); }
    else { cal.m+=dir; if(cal.m<0){cal.m=11;cal.y--;} if(cal.m>11){cal.m=0;cal.y++;} cal.sel=ymd(new Date(cal.y,cal.m,1)); }
    if(!noDraw) render();
  };
  el.querySelector("#cPrev").onclick=function(){ step(-1); };
  el.querySelector("#cNext").onclick=function(){ step(1); };
  // 0.33.0: the month follows the finger, the next one slides in
  // 0.34.0: the next month rides in beside it while you drag (no gap)
  IbSwipe(el.querySelector("#calCard"), {can:function(){ return true; }, go:function(s){ var y=document.getElementById("view").scrollTop; step(s<0?1:-1); document.getElementById("view").scrollTop=y; IbSwipe.inFrom(document.querySelector("#calCard"), s); },
    find:function(){ return document.querySelector("#view #calCard"); },
    peek:function(s){ var c0=JSON.stringify({y:cal.y,m:cal.m,hy:cal.hy,hm:cal.hm,sel:cal.sel}), b=IbSwipe.shot(function(){ step(s<0?1:-1, true); }, vCal0, function(){ var c1=JSON.parse(c0); for(var k in c1) cal[k]=c1[k]; JNd=jnData().d; });
      return b && b.querySelector("#calCard"); }});
  el.querySelectorAll("[data-cm]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-cm"); if(m===(cal.mode||"g")) return; cal.mode=m;
    var sd=parseYmd(cal.sel), hs=hijriOf(sd); if(m==="h" && hs){ cal.hy=hs.y; cal.hm=hs.m; } else { cal.y=sd.getFullYear(); cal.m=sd.getMonth(); } render(); }; });
  el.querySelectorAll("[data-d]").forEach(function(c){ c.onclick=function(){ cal.sel=c.getAttribute("data-d"); render(); }; });
  el.querySelectorAll("[data-l]").forEach(function(c){ c.onclick=function(){ var l=c.getAttribute("data-l"); cal.lay[l]=!cal.lay[l]; render(); }; });
  el.querySelector("#cAll").onclick=function(){ cal.all=!cal.all; render(); };
  el.querySelector("#cExp").onclick=function(){ calExportSheet(); };
}

// MORE / SETTINGS
function sw(id, on){ return '<label class="switch"><input type="checkbox" id="'+id+'" '+(on?"checked":"")+'><span></span></label>'; }
function vMore0(el){
  var html=finderCard();
  html+='<div class="card cmp shmCard"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri.","The official SC list, your saved stocks and a self-screen.")+'</div><button class="btn alt full" data-saham="1" style="margin-top:8px">'+L2x("Buka","Open")+'</button></div>';
  // settings
  var en=S.lang==="en";
  var zopts=Object.keys(STATES).map(function(st){ var zs=ZONES.filter(function(z){return z[1]===st;}); if(!zs.length) return ""; return '<optgroup label="'+STATES[st]+'">'+zs.map(function(z){return '<option value="'+z[0]+'" '+(z[0]===S.zone?"selected":"")+'>'+z[0]+' · '+esc(z[2])+'</option>';}).join("")+'</optgroup>'; }).join("");
  html+='<div class="card cmp"><h3>🌐 '+(en?"Language & text":"Bahasa & teks")+'</h3>'+
   '<div class="set"><span style="flex:none">'+T("lang")+'</span><select id="sLang" style="flex:1;min-width:0;max-width:62%;padding:6px">'+ULANGS.map(function(x){ return '<option value="'+x[0]+'" '+((S.ulang||S.lang)===x[0]?"selected":"")+'>'+x[1]+'</option>'; }).join("")+'</select></div>'+
   '<div class="set"><span>'+(en?"Show translation (meaning)":"Papar terjemahan (maksud)")+'</span>'+sw("sTr",S.showTr)+'</div>'+
   '<div class="set"><span>'+L2x("Papar bacaan Rumi","Show Rumi reading")+'</span>'+sw("sRumi",S.showRumi)+'</div>'+
   (S.showRumi?'<div class="mut tiny" style="margin:-2px 0 6px">'+L2x("Rumi dijana automatik dari teks Arab dan mungkin tidak tepat sepenuhnya. Utamakan bacaan Arab.","Rumi is generated automatically from the Arabic and may not be fully accurate. The Arabic takes priority.")+'</div>':'')+
   '<div class="set"><span>🔊 '+L2x("Suara bacaan Arab","Arabic reading voice")+'</span><button class="chip" id="vList">'+L2x("Pilih suara","Choose voice")+'</button></div>'+
   '<div id="vBox"></div>'+
   '<div class="set"><span>'+L2x("Nada suara","Voice pitch")+'</span>'+chipSet("data-pitch",S.pitch||0.8,[[1,L2x("Biasa","Normal")],[0.8,L2x("Dalam","Deep")],[0.65,L2x("Lebih dalam","Deeper")]])+'</div>'+
   '<div class="set"><span>'+(en?"Arabic font":"Fon Arab")+'</span><span class="chips" style="margin:0">'+AR_FONTS.map(function(f){return '<button class="chip '+(S.arFont===f[0]?"on":"")+'" data-font="'+f[0]+'">'+(en?f[2]:f[1])+'</button>';}).join("")+'</span></div>'+
   '<div class="set"><span>'+T("arsize")+'</span><span class="row"><button class="chip" id="aMinus">A−</button><b>'+S.arSize+'</b><button class="chip" id="aPlus">A+</button></span></div>'+
   '<div class="ar" style="text-align:center;padding:2px 0 0">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div></div>';
  html+='<div class="card cmp"><h3>⚙️ '+T("settings")+'</h3>'+
   '<div class="set"><span style="flex:none">'+T("zone")+'</span><span class="row" style="gap:6px;flex:1;min-width:0"><select id="sZone" style="flex:1;min-width:0;padding:6px">'+zopts+'</select><button class="chip" id="sDetect" title="'+T("detect")+'">📍</button></span></div>'+
   '<div class="set"><span style="flex:none">'+T("state")+'</span><select id="sState" style="flex:1;min-width:0;padding:6px">'+Object.keys(STATES).map(function(s){return '<option value="'+s+'" '+(s===S.state?"selected":"")+'>'+STATES[s]+'</option>';}).join("")+'</select></div>'+
   '<div class="set"><span>'+T("hoff")+'</span><span class="row"><button class="chip" id="hMinus">−</button><b>'+(S.hijriOffset>0?"+":"")+S.hijriOffset+'</b><button class="chip" id="hPlus">+</button></span></div>'+
   '<div class="set"><span>'+(en?"Sources as links":"Sumber sebagai pautan")+'</span>'+sw("sLinks",S.srcLinks)+'</div></div>';
  html+='<div class="card cmp"><h3>🎨 '+T("apptheme")+'</h3><div class="throw">'+APP_THEMES.map(function(t){ return '<button class="ths '+(S.appTheme===t[0]?"on":"")+'" data-th="'+t[0]+'" title="'+(en?t[4]:t[1])+'"><span class="sw" style="background:linear-gradient(135deg,'+t[2]+' 50%,'+t[3]+' 50%)"></span><span>'+(en?t[4]:t[1])+'</span></button>'; }).join("")+'</div></div>';
  html+='<div class="card cmp"><h3>🔔 '+T("notifs")+'</h3><div class="nrow">'+PR.map(function(k){return '<button class="chip '+(S.notif[k]?"on":"")+'" data-nt="'+k+'">'+T(k)+'</button>';}).join("")+'</div>'+
   '<div class="set"><span>'+T("countdownN")+'</span>'+sw("sCount",S.countdown)+'</div>'+
   '<div class="set"><span>'+T("pre")+'</span><span class="chips" style="margin:0">'+[0,5,10,15].map(function(m){return '<button class="chip '+(S.preMin===m?"on":"")+'" data-pre="'+m+'">'+(m?m+"m":(en?"Off":"Tutup"))+'</button>';}).join("")+'</span></div>'+
   '<div class="nrow act" style="margin-top:8px"><button class="chip" id="sNotif">'+(en?"Allow":"Benarkan")+'</button><button class="chip" id="sExact">'+T("exact")+'</button><button class="chip" id="sTest">'+T("test")+'</button></div></div>';
  html+=moreNewCards();
  html+=rkSetCard();
  html+='<div class="card cmp"><h3>🤲 '+T("rakaat")+'</h3>'+
   '<div class="set"><span>'+(S.lang==="en"?"Silent while counting":"Senyap semasa mengira")+'</span>'+sw("sQuiet",S.quietPray)+'</div>'+
   '<div class="mut tiny" style="margin:-2px 0 6px">'+(N.hasPerm("dnd")?(S.lang==="en"?"Do Not Disturb access: allowed. Calls and notifications are silenced, alarms still ring.":"Akses Jangan Ganggu: dibenarkan. Panggilan dan notifikasi disenyapkan, penggera masih berbunyi."):(S.lang==="en"?"Without Do Not Disturb access, the phone only switches to vibrate. ":"Tanpa akses Jangan Ganggu, telefon hanya bertukar ke mod getar. ")+'<a href="#" id="sDnd">'+(S.lang==="en"?"Allow access":"Benarkan akses")+'</a>')+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Tap step":"Langkah ketik")+'</span><span class="chips" style="margin:0"><button class="chip '+(S.tapStep===0.5?"on":"")+'" data-step="0.5">0.5</button><button class="chip '+(S.tapStep===1?"on":"")+'" data-step="1">1</button></span></div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Vibrate on each count":"Getar setiap kiraan")+'</span>'+sw("sVib",S.vib)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by face size":"Kesan saiz wajah")+'</span>'+sw("dFace",S.sujud.face)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by darkness (camera covered)":"Kesan kegelapan (kamera terlindung)")+'</span>'+sw("dLight",S.sujud.light)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by proximity sensor":"Kesan sensor jarak")+'</span>'+sw("dProx",S.sujud.prox)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Show sensor status":"Papar status sensor")+'</span>'+sw("sStat",S.showStat)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Face threshold":"Ambang wajah")+'</span><b>'+S.sujud.threshold.toFixed(2)+'</b></div>'+
   '<button class="btn alt full" id="sCalib" style="margin-top:8px">🎯 '+T("calib")+'</button></div>';
  html+=mqCard();
  html+='<div class="card"><h3>ℹ️ '+T("about")+'</h3><div class="small" style="line-height:1.55"><img src="logo.svg" alt="" width="56" height="56" style="border-radius:14px;float:right;margin:0 0 6px 10px">My Ihsan 0.5.15 ('+L2x("prototaip","prototype")+').<br>'+(S.lang==="en"?"Prayer times: JAKIM e-Solat (estimate shown until data loads). All Arabic text, translations and hadith references are pending review by a qualified ustaz. Please report errors. Camera frames are processed on the phone only and never saved or sent. Halal checker: the ingredient database and list work on the phone; label photos are read by the online AI you choose; its verdicts are a guide only, not a fatwa. Recipe builder: recipes are read from the shared page or post (or by the online AI you choose for posts, photos and videos); halal swaps come from the swap table in the app and are a guide only, not a fatwa. Hajj & Umrah 3D uses Three.js (MIT licence), bundled in the app; the scene is stylised and not to scale. Umrah DIY maps use MapLibre GL (BSD licence) with map data © OpenStreetMap contributors via OpenFreeMap; prices and distances are estimates. Al-Quran: KFGQPC Uthmani Hafs text and font (King Fahd Complex) via quran.ws (CC BY 4.0); tajwid text and word meanings from Quran.com; English by Saheeh International; Malay by Abdullah Muhammad Basmeih (downloaded from AlQuran Cloud); recitation by Mishary Rashid Alafasy (EveryAyah); tafsir, surah introductions and Indonesian word meanings from Quran.com; word roots from the Quranic Arabic Corpus, University of Leeds (GPL). Shafi'i Fiqh mind map: chapter tree, ayat references and hadith from Fiqh Syafii by H. Idris Ahmad (Pustaka Antara), read from a scan and pending ustaz review. Books: PDFs are shown with pdf.js (Mozilla, Apache-2.0) and written with pdf-lib (MIT), both inside the app.":"Waktu solat: JAKIM e-Solat (anggaran dipaparkan sehingga data dimuatkan). Semua teks Arab, terjemahan dan rujukan hadis sedang menunggu semakan ustaz bertauliah. Sila laporkan kesilapan. Imej kamera diproses dalam telefon sahaja dan tidak disimpan atau dihantar. Penyemak halal: pangkalan data dan senarai ramuan berjalan di dalam telefon; gambar label dibaca oleh AI dalam talian yang anda pilih; keputusannya panduan sahaja, bukan fatwa. Pembina resepi: resepi dibaca daripada laman atau hantaran yang dikongsi (atau oleh AI dalam talian pilihan anda untuk hantaran, gambar dan video); tukaran halal daripada jadual tukaran dalam aplikasi, panduan sahaja dan bukan fatwa. Haji & Umrah 3D menggunakan Three.js (lesen MIT) yang disertakan dalam aplikasi; paparannya ilustrasi dan tidak mengikut skala. Peta Umrah DIY menggunakan MapLibre GL (lesen BSD) dengan data peta © penyumbang OpenStreetMap melalui OpenFreeMap; harga dan jarak ialah anggaran. Al-Quran: teks dan fon KFGQPC Uthmani Hafs (Kompleks Raja Fahd) melalui quran.ws (CC BY 4.0); teks tajwid dan maksud perkataan daripada Quran.com; terjemahan Inggeris Saheeh International; terjemahan Melayu Abdullah Muhammad Basmeih (dimuat turun daripada AlQuran Cloud); bacaan Mishary Rashid Alafasy (EveryAyah); tafsir, pengenalan surah dan maksud perkataan Bahasa Indonesia daripada Quran.com; akar kata daripada Quranic Arabic Corpus, Universiti Leeds (GPL). Peta minda Fiqh Syafi'i: susunan bab, rujukan ayat dan hadis daripada Fiqh Syafii oleh H. Idris Ahmad (Pustaka Antara), dibaca daripada imbasan dan menunggu semakan ustaz. Buku: PDF dipaparkan dengan pdf.js (Mozilla, Apache-2.0) dan ditulis dengan pdf-lib (MIT), kedua-duanya dalam aplikasi.")+'</div></div>';
  el.innerHTML=html;
  el.querySelectorAll("[data-maps]").forEach(function(b){ b.onclick=function(){ openFinder(b.getAttribute("data-maps")); }; });
  bindMoreNew(el); bindMq(el); bindRkSet(el.querySelector("#rkSetC"));
  var sSen=el.querySelector("#sSenior"); if(sSen) sSen.onchange=function(){ S.senior=this.checked; saveS(); applyZoom(); if(S.senior){ toast(L2x("Mod warga emas dihidupkan","Senior mode on")); go("home"); } else render(); };
  el.querySelector("#sQuiet").onchange=function(){ S.quietPray=this.checked; saveS(); if(S.quietPray && !N.hasPerm("dnd")) N.requestPerm("dnd"); render(); };
  var sd=el.querySelector("#sDnd"); if(sd) sd.onclick=function(e){ e.preventDefault(); N.requestPerm("dnd"); };
  el.querySelectorAll("[data-font]").forEach(function(b){ b.onclick=function(){ S.arFont=b.getAttribute("data-font"); saveS(); applyFont(); render(); }; });
  el.querySelector("#sLinks").onchange=function(){ S.srcLinks=this.checked; saveS(); };
  el.querySelectorAll("[data-th]").forEach(function(b){ b.onclick=function(){ S.appTheme=b.getAttribute("data-th"); saveS(); applyTheme(); render(); }; });
  el.querySelector("#sLang").onchange=function(){ S.ulang=this.value; S.lang = this.value==="en" ? "en" : "ms"; hdrLastDay=null; saveS(); pushHadith(); if(window.IdLang) IdLang.set(S.ulang==="id"); render(); };
  el.querySelector("#sZone").onchange=function(){ S.zone=this.value; S.zoneAuto=false; if(S.locMode==="auto") S.overseas=false; S.state=zoneById(S.zone)[1]; saveS(); ensureData(true); render(); };
  el.querySelector("#sDetect").onclick=function(){ S.zoneAuto=true; askLocation(true); };
  el.querySelector("#sState").onchange=function(){ S.state=this.value; saveS(); render(); };
  el.querySelector("#hMinus").onclick=function(){ S.hijriOffset=Math.max(-2,S.hijriOffset-1); saveS(); render(); };
  el.querySelector("#hPlus").onclick=function(){ S.hijriOffset=Math.min(2,S.hijriOffset+1); saveS(); render(); };
  el.querySelector("#aMinus").onclick=function(){ S.arSize=Math.max(18,S.arSize-2); document.documentElement.style.setProperty('--arsize',S.arSize+'px'); saveS(); render(); };
  el.querySelector("#aPlus").onclick=function(){ S.arSize=Math.min(40,S.arSize+2); document.documentElement.style.setProperty('--arsize',S.arSize+'px'); saveS(); render(); };
  el.querySelectorAll("[data-nt]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-nt"); S.notif[k]=!S.notif[k]; saveS(); pushSchedule(); render(); }; });
  el.querySelector("#sTr").onchange=function(){ S.showTr=this.checked; saveS(); applyFont(); };
  el.querySelector("#sCount").onchange=function(){ S.countdown=this.checked; saveS(); };
  el.querySelectorAll("[data-pre]").forEach(function(b){ b.onclick=function(){ S.preMin=+b.getAttribute("data-pre"); saveS(); render(); }; });
  el.querySelector("#sNotif").onclick=function(){ N.requestPerm("notif"); };
  el.querySelector("#sExact").onclick=function(){ if(N.hasPerm("exact")) toast(S.lang==="en"?"Exact alarms already allowed":"Penggera tepat sudah dibenarkan"); else N.requestPerm("exact"); };
  el.querySelector("#sTest").onclick=function(){ if(!N.hasPerm("notif")) N.requestPerm("notif"); N.testNotification(); };
  el.querySelectorAll("[data-step]").forEach(function(b){ b.onclick=function(){ S.tapStep=+b.getAttribute("data-step"); saveS(); render(); }; });
  el.querySelector("#sVib").onchange=function(){ S.vib=this.checked; saveS(); };
  el.querySelector("#dFace").onchange=function(){ S.sujud.face=this.checked; saveS(); };
  el.querySelector("#dLight").onchange=function(){ S.sujud.light=this.checked; saveS(); };
  el.querySelector("#dProx").onchange=function(){ S.sujud.prox=this.checked; saveS(); };
  el.querySelector("#sStat").onchange=function(){ S.showStat=this.checked; saveS(); };
  el.querySelector("#sCalib").onclick=function(){ if(!N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) calibrate(); }; on("perm",hp); N.requestPerm("camera"); } else calibrate(); };
}
function calibrate(){
  var ov=document.getElementById("overlay"); ov.className=""; var mx=0;
  ov.innerHTML='<div style="padding:24px;max-width:420px;width:100%;text-align:center"><h3 style="color:var(--gold)">🎯 '+T("calib")+'</h3><p class="small" style="line-height:1.5">'+(S.lang==="en"?"Place the phone where you will pray, front camera facing up. Do one practice sujud now, then rise.":"Letakkan telefon di tempat solat, kamera hadapan menghadap ke atas. Lakukan satu sujud latihan sekarang, kemudian bangun.")+'</p><div style="font-size:56px;font-weight:200" id="cVal">0.00</div><div class="mut small">'+(S.lang==="en"?"face size now · closest":"saiz wajah sekarang · paling dekat")+': <b id="cMax">0.00</b></div><div class="mut small" id="cHw" style="margin-top:6px"></div><div class="btns" style="margin-top:18px"><button class="btn gold" id="cSave">'+(S.lang==="en"?"Save":"Simpan")+'</button><button class="btn alt" id="cCancel">'+(S.lang==="en"?"Cancel":"Batal")+'</button></div></div>';
  var hs=function(r){ var f=r.face||0; if(f>mx) mx=f; ov.querySelector("#cVal").textContent=f.toFixed(2); ov.querySelector("#cMax").textContent=mx.toFixed(2); ov.querySelector("#cHw").textContent=r.faceHw?"":(S.lang==="en"?"This phone has no built-in face detection: use darkness or proximity detection, or tap mode.":"Telefon ini tiada pengesanan wajah terbina: guna pengesanan kegelapan atau sensor jarak, atau mod ketik."); };
  on("sujudStatus",hs); N.keepScreenOn(true,-1); N.startSujud(JSON.stringify({threshold:9,face:true,light:false,prox:false}));
  function end(){ off("sujudStatus",hs); N.stopSujud(); N.keepScreenOn(false,-1); applyTheme(); closeOverlay(); render(); }
  ov.querySelector("#cSave").onclick=function(){ if(mx>0.05){ S.sujud.threshold=Math.max(0.12, Math.round(mx*0.8*100)/100); saveS(); toast((S.lang==="en"?"Threshold saved: ":"Ambang disimpan: ")+S.sujud.threshold); } else toast(S.lang==="en"?"No face detected":"Tiada wajah dikesan"); end(); };
  ov.querySelector("#cCancel").onclick=end; ov._close=end;
}

// ================= 0.3.0 features =================
if(DOA.length===18){ DOA.push(DOA_SITUASI); DOA_GROUPS[1][2].push(18); }
var SAY=[], SHR=[], tbTap=null, onTasbihCount=null, darkTap=null, doaQ="", doaFav=false, learnPg=null;
function en_(){ return S.lang==="en"; }
function L2x(ms,en){ return S.lang==="en"?en:ms; }

// ---------- helpers ----------
function distKm(a1,o1,a2,o2){ var R=6371, dA=(a2-a1)*D2R, dO=(o2-o1)*D2R; var h=Math.sin(dA/2)*Math.sin(dA/2)+Math.cos(a1*D2R)*Math.cos(a2*D2R)*Math.sin(dO/2)*Math.sin(dO/2); return 2*R*Math.asin(Math.sqrt(h)); }
function musafirNow(){ if(S.musafirOn) return true; if(!S.musafirAuto||!S.home||S.lat==null) return false; return distKm(S.home.lat,S.home.lon,S.lat,S.lon)>=81; }
function adjAny(){ return PR.some(function(k){ return S.adj && S.adj[k]; }); }
function lastThirdMs(date){ var t=getDay(date), d2=addDays(date,1), t2=getDay(d2); var m=at(ymd(date),t.maghrib).getTime(), s=at(ymd(d2),t2.subuh).getTime(); return m+(s-m)*2/3; }
function lastThird(date){ var x=new Date(lastThirdMs(date)); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); }
function hm12(ms){ var x=new Date(ms); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); }
function cdStr(ms){ var s=Math.max(0,Math.floor(ms/1000)), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+pad(m):m)+":"+pad(x); }
function rumiDiv(ar, center){ if(!S.showRumi || !ar) return ''; var r=""; try{ r=Rumi.conv(ar); }catch(e){ return ''; } return r?'<div class="rumi"'+(center?' style="text-align:center"':'')+'>'+esc(r)+'</div>':''; }
function sayBtn(ar){ SAY.push(ar); return '<button class="ib" data-say="'+(SAY.length-1)+'" aria-label="audio">🔊</button>'; }
function shareBtn(o){ SHR.push(o); return '<button class="ib" data-share="'+(SHR.length-1)+'">↗ '+L2x("Kongsi","Share")+'</button>'; }
function toolRow(ar, text, src, title){ return '<div class="tools">'+(ar?sayBtn(ar):'')+shareBtn({ar:ar,text:text,src:src,title:title})+'</div>'; }
// 0.26.0: stop on sukun (tanda mati) at the end of each ayat, like a qari's waqf, instead of reading the final baris.
function waqfAr(t){
  return String(t).split(" . ").map(function(seg){
    var m=seg.match(/^([\s\S]*?)(\S+)(\s*)$/); if(!m || !/[\u0621-\u064A]/.test(m[2])) return seg;
    var w=m[2];
    w=w.replace(/\u064B(\u0627|\u0649)$/,"\u064E$1").replace(/(\u0627|\u0649)\u064B$/,"\u064E$1");      // fathatain -> long a
    w=w.replace(/\u0629[\u064B-\u0652]*$/,"\u0647\u0652");                                     // ta marbuta -> ha sakinah
    w=w.replace(/[\u064B-\u0650\u0652]+$/,"");                                                    // drop the final vowel/tanwin (keep shaddah)
    if(/[\u0628-\u064A\u0621-\u0627]\u0651?$/.test(w) && !/[\u0627\u0648\u064A\u0649]$/.test(w)) w+="\u0652";
    return m[1]+w+m[3];
  }).join(" . ");
}
function speakAr(text){
  // Ayah numbers and end-of-ayah marks become a pause; the number itself is never read out.
  var t=String(text||"").replace(/<[^>]*>/g," ").replace(/[﴿(]?\s*[٠-٩۰-۹0-9]+\s*[﴾)]?/g," . ").replace(/[۝۞﴿﴾]/g," . ").replace(/[\u06D6-\u06DC\u06DE-\u06ED]/g,"").replace(/(\s*\.\s*)+/g," . ").replace(/^\s*\.\s*/,""); t=waqfAr(t);
  if(window.Native && N.speak){ N.speak(t,"ar"); return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang="ar-SA"; u.rate=0.8; u.pitch=S.pitch||0.8; var vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); }); var pv=vs.filter(function(v){ return v.name===S.voice; })[0]||vs.filter(function(v){ return /male/i.test(v.name)&&!/female/i.test(v.name); })[0]; if(pv) u.voice=pv; speechSynthesis.speak(u); }catch(e){ toast("Audio tidak tersedia"); }
}
function showSheet(title, body, onClose){
  var ov=document.getElementById("overlay"); ov.className="sheetov";
  ov.innerHTML='<div class="sheet"><div class="row"><h3 style="margin:0">'+title+'</h3><button class="chip" id="shX">✕</button></div><div class="shb">'+body+'</div></div>';
  var close=function(){ closeOverlay(); if(onClose) onClose(); };
  ov.querySelector("#shX").onclick=close; ov._close=close;
  var t0=Date.now(); ov.onclick=function(e){ if(e.target===ov && Date.now()-t0>400) close(); };   // 0.33.8: ignore the stray click from the tap that opened it
  return ov;
}

// ---------- glossary ----------
var GL_RE=null, GL_MAP={};
function glz(html){
  if(!GL_RE){ var words=[]; GLOSSARY.forEach(function(g){ g.w.forEach(function(w){ words.push(w); GL_MAP[w.toLowerCase()]=g.k; }); });
    words.sort(function(a,b){return b.length-a.length;});
    GL_RE=new RegExp("(^|[^A-Za-z'])("+words.map(function(w){return w.replace(/[.*+?^${}()|[\]\\']/g,"\\$&");}).join("|")+")(?=$|[^A-Za-z])","gi"); }
  return html.replace(GL_RE, function(m,a,w){ return a+'<span class="gl" data-gl="'+GL_MAP[w.toLowerCase()]+'">'+w+'</span>'; });
}
function glossSheet(k){ var g=GLOSSARY.filter(function(x){return x.k===k;})[0]; if(!g) return; showSheet(esc(g.w[0].charAt(0).toUpperCase()+g.w[0].slice(1)), '<div style="line-height:1.55">'+esc(L2x(g.ms,g.en))+'</div>'); }

function globalClick(e){
  var t=e.target, b;
  if((b=t.closest("[data-say]"))){ e.preventDefault(); speakAr(SAY[+b.getAttribute("data-say")]); return; }
  if((b=t.closest("[data-share]"))){ e.preventDefault(); shareCard(SHR[+b.getAttribute("data-share")]); return; }
  if((b=t.closest("[data-fav]"))){ e.preventDefault(); var k=b.getAttribute("data-fav"), i=S.favs.indexOf(k); if(i>=0) S.favs.splice(i,1); else S.favs.push(k); saveS(); b.classList.toggle("on", i<0); b.textContent=i<0?"★":"☆"; toast(i<0?L2x("Disimpan dalam kegemaran","Saved to favourites"):L2x("Dibuang dari kegemaran","Removed from favourites")); return; }
  if((b=t.closest(".gl"))){ e.preventDefault(); e.stopPropagation(); glossSheet(b.getAttribute("data-gl")); return; }
  if((b=t.closest("[data-sirah]"))){ e.preventDefault(); openSirah(b.getAttribute("data-sirah")==="kids"); return; }
  if((b=t.closest("[data-hajj]"))){ e.preventDefault(); openHajj(); return; }
  if((b=t.closest("[data-umrah]"))){ e.preventDefault(); openUmrah(); return; }
  if((b=t.closest("[data-pksk]"))){ e.preventDefault(); openPksk(); return; }
  if((b=t.closest("[data-fiqh]"))){ e.preventDefault(); openFiqh(+b.getAttribute("data-fiqh")); return; }
  if((b=t.closest("[data-xquiz]"))){ e.preventDefault(); withExtra(null, function(){ IbExtra.openQuiz(xH()); }); return; }
  if((b=t.closest("[data-tawaf]"))){ e.preventDefault(); openTawaf(); return; }
  if((b=t.closest("[data-prac]"))){ e.preventDefault(); openPractice(); return; }
  if((b=t.closest("[data-saham]"))){ e.preventDefault(); openSaham(); return; }
  if((b=t.closest("[data-jn]"))){ e.preventDefault(); jnEdit(b.getAttribute("data-jn")); return; }
  if((b=t.closest("[data-jnu]"))){ e.preventDefault(); jnUnlock(); return; }
  if((b=t.closest("[data-kad]"))){ e.preventDefault(); openCardMaker(b.getAttribute("data-kad")||null); return; }
  if((b=t.closest("[data-n40]"))){ e.preventDefault(); ilmuSt.n40Open=+b.getAttribute("data-n40"); learnFrom=null; learnPg="n40"; go("learn"); return; }
  if((b=t.closest("[data-learn]"))){ e.preventDefault(); learnPg=b.getAttribute("data-learn")||null; learnFrom=b.getAttribute("data-from"); if(b.hasAttribute("data-kmode")) ilmuSt.sbMode=b.getAttribute("data-kmode"); go("learn"); return; }
  if((b=t.closest("[data-go]"))){ e.preventDefault(); var v=b.getAttribute("data-go"); if(v==="asma"){ sub.zikir="asma"; v="zikir"; } if(v==="learn") learnPg=null; go(v); return; }
}

// ---------- share card ----------
function wrapLines(ctx, text, maxW){ var words=String(text||"").split(/\s+/), lines=[], cur=""; words.forEach(function(w){ var tst=cur?cur+" "+w:w; if(ctx.measureText(tst).width>maxW && cur){ lines.push(cur); cur=w; } else cur=tst; }); if(cur) lines.push(cur); return lines; }
function shareCard(o){
  if(!o) return;
  var W=1080, H=1350, cv=document.createElement("canvas"); cv.width=W; cv.height=H; var ctx=cv.getContext("2d");
  var draw=function(){
    var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#0e6b45"); g.addColorStop(1,"#07130d"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#c9a646"; ctx.lineWidth=6; ctx.strokeRect(40,40,W-80,H-80); ctx.lineWidth=2; ctx.strokeRect(58,58,W-116,H-116);
    var arF='"AmiriL","ScheherazadeL","Noto Naskh Arabic",serif', y=150, maxW=W-200;
    ctx.textAlign="center"; ctx.fillStyle="#c9a646"; ctx.font="600 40px sans-serif"; if(o.title){ ctx.fillText(String(o.title).slice(0,48), W/2, y); y+=40; }
    var arSize=66, txSize=38, arL, txL;
    for(var tries=0; tries<8; tries++){
      ctx.font=arSize+"px "+arF; ctx.direction="rtl"; arL=o.ar?wrapLines(ctx,o.ar,maxW):[]; ctx.direction="ltr";
      ctx.font=txSize+"px sans-serif"; txL=wrapLines(ctx,o.text,maxW);
      var need=arL.length*arSize*1.75+txL.length*txSize*1.4+160;
      if(y+need < H-160) break; arSize=Math.round(arSize*0.88); txSize=Math.max(24,Math.round(txSize*0.9));
    }
    y+=40;
    ctx.fillStyle="#ffffff"; ctx.font=arSize+"px "+arF; ctx.direction="rtl";
    arL.forEach(function(l){ y+=arSize*1.75; ctx.fillText(l, W/2, y); });
    ctx.direction="ltr"; y+=arL.length?40:0;
    ctx.fillStyle="#e8efe9"; ctx.font=txSize+"px sans-serif";
    txL.forEach(function(l){ y+=txSize*1.4; ctx.fillText(l, W/2, y); });
    if(o.src){ ctx.fillStyle="#a9b8ae"; ctx.font="italic 28px sans-serif"; y+=70; wrapLines(ctx, String(o.src).replace(/ \[[a-z]+\]/g,""), maxW).slice(0,2).forEach(function(l){ ctx.fillText(l, W/2, y); y+=36; }); }
    ctx.fillStyle="#c9a646"; ctx.font="600 30px sans-serif"; ctx.fillText("My Ihsan", W/2, H-90);
    var url=cv.toDataURL("image/png"), txt=(o.text||"")+(o.src?"\n("+String(o.src).replace(/ \[[a-z]+\]/g,"")+")":"");
    if(window.Native && N.shareImage) N.shareImage(url, txt);
    else { var a=document.createElement("a"); a.href=url; a.download="my-ihsan.png"; document.body.appendChild(a); a.click(); a.remove(); }
  };
  try{ Promise.all([document.fonts.load('60px "AmiriL"'), document.fonts.load('60px "ScheherazadeL"')]).then(draw, draw); }catch(e){ draw(); }
}

// ---------- doa: cards, search, favourites ----------
function doaCard(it, c, i, showCat){
  var key=c+"-"+i, fav=S.favs.indexOf(key)>=0, title=S.lang==="en"?it.t_en:it.t_ms;
  return '<div class="card"><div class="row"><h3>'+esc(title)+'</h3><button class="ib fav'+(fav?" on":"")+'" data-fav="'+key+'" aria-label="favourite">'+(fav?"★":"☆")+'</button></div>'+(showCat?'<div class="mut tiny" style="margin:-4px 0 4px">'+esc(catName(DOA[c]))+'</div>':'')+
    '<div class="ar">'+it.ar+'</div>'+rumiDiv(it.ar)+'<div class="tr">'+esc(tr(it))+'</div><div class="src">'+T("source")+': '+srcHtml(it.src)+'</div>'+toolRow(it.ar, tr(it), it.src, title)+'</div>';
}
function doaSearch(el, q){
  var ql=q.toLowerCase(), terms=[ql].concat(DOA_SYN[ql]||[]);
  Object.keys(DOA_SYN).forEach(function(k){ if(k.length>=4 && ql.length>=3 && k.indexOf(ql)===0) terms=terms.concat(DOA_SYN[k]); });
  var html='', n=0, hits=[];
  DOA.forEach(function(c,ci){ c.items.forEach(function(it,ii){ var ttl=(it.t_ms+" "+it.t_en).toLowerCase(), hay=(ttl+" "+it.ms+" "+it.en+" "+c.cat).toLowerCase(), sc=0;
    if(ttl.indexOf(ql)>=0) sc=4; else if(hay.indexOf(ql)>=0) sc=3; else if(terms.some(function(t){ return t && ttl.indexOf(t)>=0; })) sc=2; else if(terms.some(function(t){ return t && hay.indexOf(t)>=0; })) sc=1;
    if(sc) hits.push({sc:sc,it:it,ci:ci,ii:ii}); }); });
  hits.sort(function(a,b){ return b.sc-a.sc; }).forEach(function(h){ html+=doaCard(h.it,h.ci,h.ii,true); n++; });
  el.innerHTML = n ? '<div class="mut small" style="margin:2px 4px 6px">'+n+' '+L2x("doa dijumpai","found")+'</div>'+html : '<div class="card mut">'+L2x("Tiada padanan. Cuba: musafir, sakit, periksa, hujan, marah, tidur, hutang.","No match. Try: travel, sick, exam, rain, angry, sleep, debt.")+'</div>';
}
function favItems(){ return S.favs.map(function(k){ var p=k.split("-"), c=+p[0], i=+p[1]; return DOA[c]&&DOA[c].items[i]?{c:c,i:i,it:DOA[c].items[i]}:null; }).filter(Boolean); }
function doaFavList(el){
  var f=favItems();
  el.innerHTML = f.length ? f.map(function(x){ return doaCard(x.it,x.c,x.i,true); }).join("") : '<div class="card mut">'+L2x("Tiada kegemaran lagi. Tekan ☆ pada mana-mana doa untuk menyimpannya di sini dan di Utama.","No favourites yet. Tap ☆ on any doa to keep it here and on Home.")+'</div>';
}

// ---------- Asmaul Husna ----------
function zAsma(el){
  var st=load("ihsan_asma",{i:0}), en=en_();
  function draw(){
    var a=ASMAUL_HUSNA[st.i];
    var html='<div class="card asma"><div class="tap asmaTap" id="asTap"><div class="mut small">'+(st.i+1)+' / 99</div><div class="ar" style="font-size:44px;line-height:1.6;text-align:center">'+a[0]+'</div><div style="font-weight:700;font-size:18px">'+esc(a[1])+'</div><div class="mut">'+esc(en?a[3]:a[2])+'</div>'+(window.ASMA_INFO&&ASMA_INFO[st.i]?'<div class="asx">'+esc(en?ASMA_INFO[st.i][1]:ASMA_INFO[st.i][0])+'</div><div class="src" style="text-align:center">📖 '+esc(ASMA_INFO[st.i][2])+'</div>':'')+'<div class="mut tiny" style="margin-top:6px">'+L2x("ketik untuk seterusnya","tap for next")+'</div></div>'+
      '<div class="btns"><button class="btn alt" id="asPrev">'+L2x("Sebelum","Back")+' ›</button>'+sayBtn("يَا "+a[0].replace(/^ال/,""))+'<button class="btn alt" id="asReset">⟲</button></div></div>';
    html+='<div class="card"><div class="asgrid">'+ASMAUL_HUSNA.map(function(x,i){ return '<button class="asc'+(i===st.i?" on":"")+'" data-as="'+i+'"><span class="ar">'+x[0]+'</span><small>'+(i+1)+'. '+esc(x[1])+'</small></button>'; }).join("")+'</div></div>';
    html+='<div class="card"><div class="why">'+esc(L2x(ASMA_NOTE.ms,ASMA_NOTE.en))+'</div><div class="src">'+srcHtml(ASMA_NOTE.src)+'</div><div class="mut tiny" style="margin-top:6px">'+L2x("Penerangan dan rujukan ayat bagi setiap nama ditulis daripada ingatan. Sila semak dengan ustaz. \"Bentuk kata kerja\" bermaksud ayat itu menyebut perbuatan Allah, bukan nama itu sendiri.","Each name's explanation and ayat reference was written from memory. Please check with an ustaz. \"Verb form\" means the ayah describes Allah doing it rather than using the name itself.")+'</div></div>';
    el.innerHTML=html;
    el.querySelector("#asTap").onclick=function(){ if(st.i<98){ st.i++; N.vibrate(20); } else { N.vibrate(500); toast(L2x("Selesai 99 nama. MasyaAllah!","All 99 names done. MasyaAllah!")); st.i=0; } save("ihsan_asma",st); draw(); };
    el.querySelector("#asPrev").onclick=function(){ if(st.i>0) st.i--; save("ihsan_asma",st); draw(); };
    el.querySelector("#asReset").onclick=function(){ st.i=0; save("ihsan_asma",st); draw(); };
    el.querySelectorAll("[data-as]").forEach(function(b){ b.onclick=function(){ st.i=+b.getAttribute("data-as"); save("ihsan_asma",st); draw(); el.scrollIntoView&&document.getElementById("view").scrollTo({top:0,behavior:"smooth"}); }; });
  }
  draw();
}

// ---------- tasbih pocket mode ----------
function tasbihDark(){
  var ov=document.getElementById("overlay"); ov.className="darkov";
  ov.innerHTML='<div class="darkc" id="dkC"></div><button class="close" id="dkX">✕</button><div class="darkh">'+L2x("Ketik di mana-mana atau tekan butang volum. Tekan ✕ untuk keluar.","Tap anywhere or press a volume button. Press ✕ to exit.")+'</div>';
  N.keepScreenOn(true, 0.01); if(N.setVolumeKeys) N.setVolumeKeys(true);
  var c=ov.querySelector("#dkC");
  function upd(){ c.textContent=tb.left+" · "+(tb.i+1)+"/"+TASBIH.length; }
  darkTap=function(){ if(tbTap) tbTap(); setTimeout(upd,30); };
  ov.onclick=function(e){ if(e.target.id==="dkX") return; darkTap(); };
  function end(){ darkTap=null; N.keepScreenOn(false,-1); applyTheme(); if(N.setVolumeKeys) N.setVolumeKeys(S.volTasbih); closeOverlay(); render(); }
  ov.querySelector("#dkX").onclick=function(e){ e.stopPropagation(); end(); };
  ov._close=end; upd();
}

// ---------- extras schedule (native one-off reminders) ----------
function fastList(date){
  var r=sunnahFastOn(date).map(function(x){ return {ms:x.ms,en:x.en,t:/Isnin|Khamis/.test(x.ms)?"mk":"bidh"}; }), h=hijriOf(date);
  if(h){ if(h.m===12&&h.d===9) r.push({ms:"Puasa sunat Arafah",en:"Arafah fast",t:"special"});
    if(h.m===1&&h.d===9) r.push({ms:"Puasa sunat Tasu'a",en:"Tasu'a fast",t:"special"});
    if(h.m===1&&h.d===10) r.push({ms:"Puasa sunat Asyura",en:"Ashura fast",t:"special"});
    if(h.m===10&&h.d>=2&&h.d<=30) r.push({ms:"Puasa enam Syawal",en:"Six fasts of Syawal",t:"syawal",first:h.d===2}); }
  return r;
}
function buildExtras(){
  var out=[], now=Date.now(), en=en_(), base=new Date(); base.setHours(0,0,0,0);
  var paused = S.pauseMode==="haid" ? (S.pauseUntil||0) : 0;
  function push(t,id,title,body,loud,open){ if(t>now && t>paused) out.push({t:Math.round(t),id:id,title:title,body:body,loud:!!loud,open:open||"home"}); }
  function pushAny(t,id,title,body,loud,open){ if(t>now) out.push({t:Math.round(t),id:id,title:title,body:body,loud:!!loud,open:open||"home"}); }
  for(var i=0;i<10;i++){
    var d=addDays(base,i), ds=ymd(d), t=getDay(d), h=hijriOf(d);
    if(S.imsakOn && t.imsak && (!S.imsakRamadan || (h&&h.m===9)))
      push(at(ds,t.imsak).getTime(),"imsak"+ds, en?"Imsak "+fmt12(t.imsak):"Imsak "+fmt12(t.imsak), en?"Stop eating sahur. Subuh at "+fmt12(t.subuh)+".":"Berhenti makan sahur. Subuh pada "+fmt12(t.subuh)+".", true);
    if(S.syurukOn && t.syuruk) pushAny(at(ds,t.syuruk).getTime(),"syuruk"+ds, en?"Syuruk "+fmt12(t.syuruk):"Syuruk "+fmt12(t.syuruk), en?"The sun has risen. Subuh time has ended.":"Matahari telah terbit. Waktu Subuh telah tamat.", false);
    if(S.endMin>0) [["subuh","syuruk"],["zohor","asar"],["asar","maghrib"],["maghrib","isyak"]].forEach(function(p){
      if(!S.notif[p[0]] || !t[p[1]]) return;
      push(at(ds,t[p[1]]).getTime()-S.endMin*60000, "end"+p[0]+ds, en?T(p[0])+" ends in "+S.endMin+" min":"Waktu "+T(p[0])+" tamat dalam "+S.endMin+" minit", en?"If you have not prayed "+T(p[0])+" yet, pray now.":"Jika belum solat "+T(p[0])+", tunaikan sekarang.", true, "solat"); });
    if(S.tahajjud){ var lt=lastThirdMs(d); push(lt,"tahajjud"+ds, en?"Tahajjud: last third of the night":"Tahajjud: sepertiga malam terakhir", en?"A good time for night prayer and doa. Subuh is at "+fmt12(getDay(addDays(d,1)).subuh)+".":"Waktu terbaik untuk solat malam dan berdoa. Subuh pada "+fmt12(getDay(addDays(d,1)).subuh)+".", true, "sunat"); }
    if(S.mathAlarm){ pushAny(at(ds,t.subuh).getTime()+25*60000,"mp"+ds,"Al-Ma'thurat "+(en?"(morning)":"pagi"), en?"Time for the morning adhkar.":"Masa untuk wirid pagi.", false, "mathurat");
      pushAny(at(ds,t.asar).getTime()+25*60000,"me"+ds,"Al-Ma'thurat "+(en?"(evening)":"petang"), en?"Time for the evening adhkar.":"Masa untuk wirid petang.", false, "mathurat"); }
    if(S.fastRem){ var nd=addDays(d,1), fl=fastList(nd).filter(function(f){ if(f.t==="syawal") return S.fastRemT.special && f.first; return S.fastRemT[f.t]; });
      if(fl.length){ var r=new Date(d); r.setHours(21,0,0,0); push(r.getTime(),"fast"+ds, en?"Sunnah fast tomorrow":"Puasa sunat esok", fl.map(function(f){return en?f.en:f.ms;}).join(", ")+(en?". Remember to set your intention and wake for sahur.":". Jangan lupa niat dan bangun sahur."), false, "home"); } }
  }
  var qr=((load("ihsan_quran",{})||{}).set||{}).rem||{};
  for(var q2=0;q2<10;q2++){ var dq=addDays(base,q2), tq=getDay(dq), dsq=ymd(dq), dow=dq.getDay();
    if(qr.kahf && dow===5 && tq.subuh) pushAny(at(dsq,tq.subuh).getTime()+60*60000, "qkahf"+dsq, L2x("Hari Jumaat: Surah Al-Kahf","Friday: Surah Al-Kahf"), L2x("Luangkan masa membaca Al-Kahf hari ini.","Take some time to read Al-Kahf today."), false, "quran");
    if(qr.yasin && dow===4 && tq.maghrib) pushAny(at(dsq,tq.maghrib).getTime()+15*60000, "qyas"+dsq, L2x("Malam Jumaat: Yasin","Thursday night: Yasin"), L2x("Masa yang baik untuk membaca Yasin.","A good time to read Yasin."), false, "quran");
    if(qr.mulk && tq.isyak) pushAny(at(dsq,tq.isyak).getTime()+120*60000, "qmulk"+dsq, L2x("Sebelum tidur: Al-Mulk","Before sleep: Al-Mulk"), L2x("Surah Al-Mulk dan 2 ayat akhir Al-Baqarah sebelum tidur.","Surah Al-Mulk and the last 2 ayat of Al-Baqarah before you sleep."), false, "quran");
    if(qr.daily && tq.subuh){ var qg=(load("ihsan_quran",{}).goal)||{}; pushAny(at(dsq,tq.subuh).getTime()+40*60000, "qday"+dsq, L2x("Bacaan Al-Quran hari ini","Today's Quran reading"), L2x("Sasaran hari ini: ","Today's goal: ")+(qg.n||10)+" "+(qg.k==="page"?L2x("muka surat","pages"):qg.k==="min"?L2x("minit","min"):"ayat"), false, "quran"); } }
  if(S.jnRem) for(var j=0;j<10;j++){ var dj=addDays(base,j), tj=getDay(dj); if(tj.isyak) pushAny(at(ymd(dj),tj.isyak).getTime()+90*60000, "jn"+ymd(dj), L2x("Muhasabah harian","Daily reflection"), L2x("Luangkan seminit: apa yang anda syukuri hari ini, dan apa yang ingin diperbaiki?","Take a minute: what are you grateful for today, and what would you like to improve?"), false, "cal"); }
  // 0.21.0 finance reminders at 9:00: commitments with 🔔 (on the day or days before) and debts with a due date
  var F=load("ihsan_fin",null);
  if(F && window.FinNextDue){ var nine=function(d){ var x=new Date(d); x.setHours(9,0,0,0); return x.getTime(); };
    (F.com||[]).forEach(function(c){ if(!c.ntf) return; var d=FinNextDue(c, base), guard=0;
      while(d && guard++<12 && (d-base)/864e5<=10+(c.pre||0)){ var tt=nine(addDays(d,-(c.pre||0))); pushAny(tt, "fc"+c.id+ymd(d), "📆 "+c.name+" · RM "+(+c.amt).toFixed(2), (c.pre?L2x("Perlu dibayar pada ","Due on "):L2x("Perlu dibayar hari ini","Due today"))+(c.pre?d.toLocaleDateString(locTag(),{day:"numeric",month:"short"}):""), false, "fin"); d=FinNextDue(c, addDays(d,1)); } });
    (F.debts||[]).forEach(function(x){ if(x.done || !x.due || x.rem===false) return; var p=x.due.split("-"), d=new Date(+p[0],+p[1]-1,+p[2]);
      pushAny(nine(d), "fd"+x.id, (x.dir==="owed"?"⬅ ":"➡ ")+L2x("Hutang: ","Debt: ")+(x.who||""), (x.dir==="owed"?L2x("Tarikh dijanjikan untuk bayaran kepada anda hari ini.","Promised repayment to you is due today."):L2x("Tarikh akhir bayaran hutang anda hari ini.","Your debt payment is due today."))+(x.desc?" ("+x.desc+")":""), false, "fin"); }); }
  // 0.23.0 birthdays (Gregorian and Hijri) at 8:00
  var FM=load("ihsan_family",null);
  if(FM && FM.rem!==false && window.FamView && FM.p){ FamView.data(famH()); FM.p.forEach(function(p){ if(!p.b || p.dd) return; var nx=FamNext(p), e8=function(d){ var x=new Date(d); x.setHours(8,0,0,0); return x.getTime(); };
      if(nx.g && (nx.g-base)/864e5<=10) pushAny(e8(nx.g), "bdg"+p.id+ymd(nx.g), "🎂 "+p.n, L2x("Hari lahir hari ini. Doakan dan hubungi"+(p.tel?" ("+p.tel+")":""),"Birthday today. Pray for them and get in touch"+(p.tel?" ("+p.tel+")":"")), false, "alat");
      if(nx.h && (nx.h-base)/864e5<=10) pushAny(e8(nx.h)+60000, "bdh"+p.id+ymd(nx.h), "🌙 "+p.n, L2x("Hari lahir Hijrah hari ini","Hijri birthday today"), false, "alat"); }); }
  // 0.35.0 vaccine due dates (Baby) and events, tasks, RSVP dates (Majlis): worked out by family/baby.js and family/events.js
  var FR=load("ihsan_famrem",null);
  if(FR) ["baby","ev"].forEach(function(k){ (FR[k]||[]).forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.k, r.ti, r.b, false, "alat"); }); });
  // 0.37.0 workout reminders on plan days (fit/fit.js writes ihsan_fitrem)
  var FTR=load("ihsan_fitrem",null);
  if(FTR && FTR.list) FTR.list.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.k, r.ti, r.b, false, "side:cal/senaman"); });
  // 0.5.1 focus: end of session, Pomodoro breaks and focus plan starts (focus/focus.js writes ihsan_focus_ex)
  // 0.5.2 weekly screen-time report, Sunday 20:00 (only with Usage access; switch in Statistik › insights)
  if((load("ihsan_insights",{})||{}).rep!==false && hasUsageAcc() && N.focusInsights) for(var w=0;w<10;w++){ var dw=addDays(base,w); if(dw.getDay()===0){ var t20=new Date(dw); t20.setHours(20,0,0,0);
    pushAny(t20.getTime(), "insw"+ymd(dw), "🧭 "+L2x("Laporan mingguan masa skrin","Weekly screen-time report"), L2x("Lihat minggu anda: masa skrin, aplikasi utama, fokus dan solat.","See your week: screen time, top apps, focus and prayers."), false, "statw"); } }
  var FOX=load("ihsan_focus_ex",null);
  if(FOX && FOX.forEach) FOX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:cal/fokus"); });
  out.sort(function(a,b){return a.t-b.t;});
  return out.slice(0,120);
}

// ---------- hadith of the day ----------
function dayIndex(d){ var y=d.getFullYear(), doy=Math.floor((new Date(y,d.getMonth(),d.getDate())-new Date(y,0,0))/864e5); return y*400+doy; }
function hadithToday(){ return HADITH_DAILY[dayIndex(new Date())%HADITH_DAILY.length]; }
function pushHadith(){ try{ if(N.setHadith) N.setHadith(JSON.stringify(HADITH_DAILY.map(function(h){ return {t:tr(h), s:h.src.replace(/ \[[a-z]+\]/g,"")}; }))); }catch(e){} }
function applyZoom(){ var z=S.textZoom||100; if(S.senior && !S.kidLock) z=Math.max(z,125); if(window.Native && N.setTextZoom) N.setTextZoom(z); else document.getElementById("app").style.zoom=z/100; }

// ---------- backup ----------
function makeBackup(){
  var data={}; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k.indexOf("ihsan_")===0 && k.indexOf("ihsan_podf_")!==0 && k!=="ihsan_radio_cache") data[k]=localStorage.getItem(k); }
  var home=null; try{ if(window.Native && N.homeExport){ home=JSON.parse(N.homeExport()); } }catch(e){}   // 0.4.7: the phone home screen too
  var json=JSON.stringify({app:"My Ihsan", v:"0.3.0", at:new Date().toISOString(), data:data, home:home}), name="my-ihsan-backup-"+ymd(new Date())+".json";
  if(window.Native && N.saveFile) N.saveFile(name, json);
  else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([json],{type:"application/json"})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
}
function openBackup(){
  if(window.Native && N.openFile){ N.openFile(); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept=".json,application/json"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ restoreBackup(r.result); }; r.readAsText(f); }; inp.click();
}
function restoreBackup(body){
  var j=null; try{ j=JSON.parse(body); }catch(e){}
  if(!j || j.app!=="My Ihsan" || !j.data){ toast(L2x("Fail ini bukan sandaran My Ihsan","This is not a My Ihsan backup")); return; }
  var n=Object.keys(j.data).length;
  var ov=showSheet(L2x("Pulihkan sandaran?","Restore backup?"), '<div>'+L2x("Sandaran dari ","Backup from ")+esc((j.at||"").slice(0,10))+' ('+n+L2x(" item). Tetapan dan kiraan semasa akan diganti."," items). Current settings and counts will be replaced.")+'</div><div class="btns" style="margin-top:12px"><button class="btn gold" id="rbOk">'+L2x("Pulihkan","Restore")+'</button></div>');
  ov.querySelector("#rbOk").onclick=function(){ Object.keys(j.data).forEach(function(k){ if(k.indexOf("ihsan_")===0) try{ localStorage.setItem(k, j.data[k]); }catch(e){} }); if(j.home && window.Native && N.homeImport) try{ N.homeImport(JSON.stringify(j.home)); }catch(e){} location.reload(); };
}

// ---------- HOME ----------
var HOME_CARDS=[["next","Waktu solat seterusnya","Next prayer"],["quick","Pintasan","Shortcuts"],["pause","Mod uzur (bila aktif)","Uzur mode (when on)"],["musafir","Musafir (bila dalam perjalanan)","Travelling (when away)"],["ramadan","Ramadan (bila hampir)","Ramadan (when near)"],["events","Hari kebesaran Islam","Islamic days"],["fast","Puasa sunat","Sunnah fasts"],["hadith","Hadis hari ini","Hadith of the day"],["fav","Doa kegemaran","Favourite doa"],["ganti","Puasa ganti","Make-up fasts"]];
function homeCards(){
  var hc=(S.homeCards||[]).filter(function(x){ return HOME_CARDS.some(function(c){return c[0]===x.id;}); });
  HOME_CARDS.forEach(function(c){ if(!hc.some(function(x){return x.id===c[0];})) hc.push({id:c[0],on:true}); });
  S.homeCards=hc; return hc;
}
var EV_NAMES={"9-29":["Akhir Ramadan","End of Ramadan"],"10-1":["Hari Raya Aidilfitri","Eid al-Fitr"],"10-2":["Puasa enam Syawal","Six fasts of Syawal"],"12-1":["Awal Zulhijjah","Start of Dhul Hijjah"],"12-8":["Hari Tarwiyah","Day of Tarwiyah"],"12-9":["Hari Arafah","Day of Arafah"],"12-10":["Hari Raya Aidiladha","Eid al-Adha"]};
function upcomingEvents(n, days){
  var res=[], t=new Date(); t.setHours(0,0,0,0);
  for(var i=0;i<=days && res.length<n;i++){ var d=addDays(t,i), h=hijriOf(d); if(!h) continue;
    EVENT_AMALAN.forEach(function(e){ if(e[0]===h.m && e[1]===h.d){ var nm=ISLAMIC_DAYS.filter(function(x){return x[0]===h.m&&x[1]===h.d;})[0], k=h.m+"-"+h.d;
      var name=EV_NAMES[k]?EV_NAMES[k][en_()?1:0]:(nm?(en_()?nm[3]:nm[2]):""); res.push({d:d,i:i,name:name,am:en_()?e[3]:e[2],h:h}); } }); }
  return res;
}
var HC={
  next:function(){
    var now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now);
    if(!np.next) return '';
    return '<div class="card hnext"><div class="row"><div><div class="mut small">'+T("next")+'</div><div class="hn-name">'+T(np.next.k)+' <span class="hn-time">'+hm12(np.next.t)+'</span></div></div><div class="hn-cd" id="hnCd">'+cdStr(np.next.t-Date.now())+'</div></div>'+
      '<div class="trow sm">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+'</div>'+
      '<div class="mut tiny" style="margin-top:4px">📍 '+esc(zoneShort())+(t.src==="jakim"?' · JAKIM':(t.src==="abroad"?' · '+L2x("kiraan","calculated"):' · '+L2x("anggaran","estimate")))+(S.pauseMode==="haid"?' · 🌸 '+L2x("makluman dijeda","alerts paused"):'')+'</div></div>';
  },
  quick:function(){
    var Q=[["rk","🕌",L2x("Kira rakaat","Count rakaat")],["qibla","🧭",T("qibla")],["tasbih","📿","Tasbih"],["mathurat","📖","Ma'thurat"],["doa","🤲","Doa"],["amal","🌙",L2x("Amal sunat","Sunnah deeds")],["kids","🧒",T("kids")],["finder","📍",L2x("Cari","Find")]];
    return '<div class="card qgrid">'+Q.map(function(q){ return '<button class="qt" data-act="q-'+q[0]+'"><span>'+q[1]+'</span>'+q[2]+'</button>'; }).join("")+'</div>';
  },
  pause:function(){
    if(S.pauseMode==="haid"){
      if(S.pauseUntil && Date.now()>S.pauseUntil){ S.pauseMode=null; saveS(); return ''; }
      var dt=new Date(S.pauseUntil).toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"});
      return '<div class="card pz"><h3>🌸 '+L2x("Cuti solat (haid / nifas)","Prayer break (haid / nifas)")+'</h3><div class="mut small">'+L2x("Makluman solat dijeda sehingga ","Prayer alerts paused until ")+'<b>'+dt+'</b></div>'+
        '<div class="snl" style="margin-top:8px">'+L2x("Amalan yang masih boleh dilakukan","What you can still do")+'</div><ul class="ul">'+(en_()?HAID_AMALAN.en:HAID_AMALAN.ms).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>'+
        '<div class="mut tiny">'+glz(esc(L2x(HAID_AMALAN.note_ms,HAID_AMALAN.note_en)))+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-act="pz-end">'+L2x("Sudah suci: sambung makluman","Purified: resume alerts")+'</button><button class="btn alt" data-go="asma">'+T("asma")+'</button></div></div>';
    }
    if(S.pauseMode==="sakit") return '<div class="card pz"><h3>🏥 '+L2x("Solat ketika sakit","Praying while sick")+'</h3><ul class="ul">'+(en_()?SICK_GUIDE.en:SICK_GUIDE.ms).map(function(x){return '<li>'+glz(esc(x))+'</li>';}).join("")+'</ul><div class="src">'+srcHtml(SICK_GUIDE.src)+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-act="pz-end">'+L2x("Sudah sihat","I am well again")+'</button></div></div>';
    return '';
  },
  musafir:function(){ return musafirNow()?musafirBanner():''; },
  ramadan:function(){
    var now=new Date(), h=hijriOf(now), inR=h&&h.m===9, en=en_();
    if(!inR){
      var ev=nextHijriEvent(9,1,10,1); if(!ev) return ''; var t0=new Date(); t0.setHours(0,0,0,0); var days=Math.round((ev.start-t0)/864e5);
      if(days>30 && !S.ramadanForce) return '';
      return '<div class="card rmd"><h3>🌙 Ramadan '+L2x("dalam ","in ")+days+L2x(" hari"," days")+'</h3><div class="mut small">'+ev.start.toLocaleDateString(locTag(),{day:"numeric",month:"long",year:"numeric"})+' ('+L2x("anggaran","estimate")+')</div>'+
        (S.ganti.owe>0?'<div class="warnbox">'+L2x("Anda masih ada "+S.ganti.owe+" hari puasa ganti. Selesaikan sebelum Ramadan.","You still owe "+S.ganti.owe+" make-up fasts. Finish them before Ramadan.")+'</div>':'')+'</div>';
    }
    var t=getDay(now), im=at(ymd(now),t.imsak).getTime(), mg=at(ymd(now),t.maghrib).getTime(), bk=DOA[0].items[3];
    var html='<div class="card rmd"><h3>🌙 Ramadan · '+L2x("Hari ke-","Day ")+h.d+'</h3><div class="rgrid">'+
      '<div><div class="mut small">'+L2x("Sahur tamat (imsak)","Sahur ends (imsak)")+'</div><div class="rbig">'+fmt12(t.imsak)+'</div><div class="mut tiny" id="rSahur">'+(Date.now()<im?"−"+cdStr(im-Date.now()):"✓")+'</div></div>'+
      '<div><div class="mut small">'+L2x("Berbuka (Maghrib)","Iftar (Maghrib)")+'</div><div class="rbig">'+fmt12(t.maghrib)+'</div><div class="mut tiny" id="rIftar">'+(Date.now()<mg?"−"+cdStr(mg-Date.now()):"✓")+'</div></div></div>';
    html+='<div class="snl" style="margin-top:8px">'+esc(en?bk.t_en:bk.t_ms)+'</div><div class="ar" style="font-size:calc(var(--arsize) - 4px)">'+bk.ar+'</div>'+rumiDiv(bk.ar)+'<div class="tr">'+esc(tr(bk))+'</div>';
    html+='<div class="btns" style="margin-top:8px"><button class="btn gold" data-act="r-t8">Tarawih 8+3</button><button class="btn gold" data-act="r-t20">Tarawih 20+3</button></div>';
    html+='<div class="set"><span>'+L2x("Penggera imsak","Imsak alarm")+'</span>'+sw("rImsak",S.imsakOn)+'</div></div>';
    return html;
  },
  events:function(){
    var ev=upcomingEvents(3,30); if(!ev.length) ev=upcomingEvents(1,160); if(!ev.length) return '';
    return '<div class="card"><h3>✨ '+L2x("Hari kebesaran Islam","Islamic days")+'</h3>'+ev.map(function(e){ return '<div class="evh"><div class="evd">'+(e.i===0?L2x("Hari ini","Today"):e.i===1?L2x("Esok","Tomorrow"):e.i+L2x(" hari"," days"))+'</div><div><b>'+esc(e.name)+'</b> <span class="mut tiny">'+e.h.d+' '+HIJRI_MONTHS[e.h.m-1]+'</span><div class="small">'+esc(e.am)+'</div></div></div>'; }).join("")+'</div>';
  },
  fast:function(){
    var t=new Date(), a=fastList(t), b=fastList(addDays(t,1)); if(!a.length && !b.length && !S.fastRem) return '';
    var row=function(lbl,l){ return l.length?'<div class="evh"><div class="evd">'+lbl+'</div><div>'+l.map(function(f){return esc(en_()?f.en:f.ms);}).join(", ")+'</div></div>':''; };
    return '<div class="card"><h3>🍽 '+L2x("Puasa sunat","Sunnah fasts")+'</h3>'+row(L2x("Hari ini","Today"),a)+row(L2x("Esok","Tomorrow"),b)+(!a.length&&!b.length?'<div class="mut small">'+L2x("Tiada puasa sunat khusus hari ini atau esok.","No special sunnah fast today or tomorrow.")+'</div>':'')+
      '<div class="set"><span>'+L2x("Ingatkan malam sebelumnya (9 PM)","Remind the night before (9 PM)")+'</span>'+sw("hFastRem",S.fastRem)+'</div></div>';
  },
  hadith:function(){
    var h=hadithToday();
    return '<div class="card"><h3>📜 '+L2x("Hadis hari ini","Hadith of the day")+'</h3><div class="hq">'+esc(tr(h))+'</div><div class="src">'+srcHtml(h.src)+'</div><div class="tools">'+shareBtn({text:tr(h),src:h.src,title:L2x("Hadis hari ini","Hadith of the day")})+(h.n40?'<button class="ib" data-n40="'+h.n40+'">📜 '+L2x("Baca penuh","Read in full")+'</button>':'<button class="ib" data-learn="n40">📜 '+L2x("40 Hadis Nawawi","40 Hadith Nawawi")+'</button>')+'</div>'+
      '<div class="mut tiny">'+L2x("Tip: tambah widget \"Hadis Harian\" di skrin utama telefon.","Tip: add the \"Hadis Harian\" widget to your phone's home screen.")+'</div></div>';
  },
  fav:function(){
    var f=favItems();
    return '<div class="card"><div class="row"><h3>★ '+L2x("Doa kegemaran","Favourite doa")+'</h3>'+(f.length?'<button class="chip" data-act="fav-all">'+L2x("Semua","All")+'</button>':'')+'</div>'+
      (f.length?f.slice(0,4).map(function(x){ return '<div class="fvi"><div class="row"><b class="small">'+esc(en_()?x.it.t_en:x.it.t_ms)+'</b>'+sayBtn(x.it.ar)+'</div><div class="ar" style="font-size:calc(var(--arsize) - 6px)">'+x.it.ar+'</div>'+rumiDiv(x.it.ar)+'</div>'; }).join(""):'<div class="mut small">'+L2x("Tekan ☆ pada doa di tab Doa untuk menyimpannya di sini.","Tap ☆ on a doa in the Doa tab to keep it here.")+'</div>')+'</div>';
  },
  ganti:function(){
    var g=S.ganti, last=g.done.length?g.done[g.done.length-1]:null, ev=nextHijriEvent(9,1,10,1), t0=new Date(); t0.setHours(0,0,0,0);
    var left=ev&&!ev.inProgress?Math.round((ev.start-t0)/864e5):null;
    return '<div class="card"><h3>🗓 '+L2x("Puasa ganti","Make-up fasts")+'</h3><div class="gnt"><button class="chip" data-act="g-minus">−</button><div><div class="gbig">'+g.owe+'</div><div class="mut tiny">'+L2x("hari lagi","days left")+'</div></div><button class="chip" data-act="g-plus">+</button></div>'+
      '<button class="btn gold full" data-act="g-done" '+(g.owe>0?'':'disabled')+'>✓ '+L2x("Saya ganti puasa hari ini","I made up a fast today")+'</button>'+
      '<div class="mut tiny" style="margin-top:6px">'+L2x("Selesai: ","Done: ")+g.done.length+(last?' · '+L2x("terakhir ","last ")+last:'')+(left!=null&&g.owe>0?' · Ramadan '+L2x("dalam ","in ")+left+L2x(" hari"," days"):'')+'</div></div>';
  }
};
function musafirBanner(){
  var d=(S.home&&S.lat!=null)?Math.round(distKm(S.home.lat,S.home.lon,S.lat,S.lon)):null;
  return '<div class="card mus"><h3>🚗 '+L2x("Anda musafir","You are travelling")+(d!=null?' · '+d+' km':'')+'</h3><div class="small">'+glz(esc(L2x("Zohor, Asar dan Isyak boleh diqasar kepada 2 rakaat. Boleh jamak Zohor dengan Asar, dan Maghrib dengan Isyak.","Zohor, Asar and Isyak may be shortened (qasar) to 2 rakaat. You may combine (jamak) Zohor with Asar, and Maghrib with Isyak.")))+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-learn="musafir">📘 '+L2x("Panduan musafir","Traveller's guide")+'</button></div></div>';
}
function bindMusafir(el){}
// ---------- 0.9.0 HOME: editable widget grid ----------
// S.widgets = [{id, w, h}] in order; the grid is 4 columns, rows of fixed height, packed top to bottom ("dense").
// Each widget snaps to whole cells; resize with the corner grip, move with the top-left grip, while editing.
var WCAT=[["solat","🕌","Solat","Prayer"],["zikir","📿","Zikir & doa","Dhikr & doa"],["kal","📅","Puasa & kalendar","Fasting & calendar"],["learn","📚","Belajar","Learn"],["media","📻","Radio & podcast","Radio & podcast"],["tools","🧰","Alat","Tools"],["stats","📊","Statistik","Stats"]];
function scW(cat, ic, ms, en, act, dms, den){ return {cat:cat, ic:ic, ms:ms, en:en, sc:act, d:[dms||"",den||""], def:[1,1], min:[1,1], max:[4,2]}; }
function cardW(cat, ic, ms, en, fn, def, min, cond){ return {cat:cat, ic:ic, ms:ms, en:en, r:fn, def:def, min:min||[2,2], max:[4,8], cond:cond}; }
var WG={
  // cards
  next: cardW("solat","🕌","Waktu solat seterusnya","Next prayer",function(w,h){ return w>=4?HC.next():wNextSmall(w,h); },[4,3],[2,2]),
  times: cardW("solat","🕰","Waktu solat hari ini","Today's prayer times",function(w,h){ return wTimes(w,h); },[4,2],[2,2]),
  prtoday: cardW("solat","✅","Solat dikira hari ini","Prayers counted today",function(w){ return '<div class="card"><h3>✅ '+L2x("Solat hari ini","Prayers today")+'</h3>'+prRegister(ymd(new Date()), w<4)+'</div>'; },[4,2],[2,2]),
  musafir: cardW("solat","🚗","Musafir (bila dalam perjalanan)","Travelling (when away)",function(){ return HC.musafir(); },[4,3],[2,2],L2x("Muncul bila anda lebih 81 km dari rumah","Shows when you are 81 km+ from home")),
  pause: cardW("solat","🌸","Mod uzur (bila aktif)","Uzur mode (when on)",function(){ return HC.pause(); },[4,4],[2,2],L2x("Muncul bila mod uzur dihidupkan","Shows when uzur mode is on")),
  quick: cardW("solat","⚡","Pintasan (8 dalam satu)","Shortcuts (8 in one)",function(){ return HC.quick(); },[4,2],[4,2]),
  tasbihw: cardW("zikir","📿","Tasbih (ketik untuk kira)","Tasbih (tap to count)",function(w,h){ return wTasbih(w,h); },[2,2],[1,1]),
  hadith: cardW("zikir","📜","Hadis hari ini","Hadith of the day",function(){ return HC.hadith(); },[4,3],[2,2]),
  fav: cardW("zikir","★","Doa kegemaran","Favourite doa",function(){ return HC.fav(); },[4,3],[2,2]),
  asmaday: cardW("zikir","✨","Asmaul Husna hari ini","Name of Allah today",function(w,h){ return wAsma(w,h); },[2,2],[2,1]),
  clock: cardW("kal","🗓","Jam & tarikh Hijrah","Clock & Hijri date",function(w,h){ return wClock(w,h); },[4,1],[2,1]),
  countdown: cardW("kal","⏳","Kiraan ke Ramadan & Hari Raya","Countdown to Ramadan & Eid",function(w,h){ return '<div class="card wcd">'+countdownBoxes()+(h>=3?'<div class="kadRow"><button class="chip" data-kad="">🎴 '+L2x("Buat kad ucapan","Make a greeting card")+'</button></div>':'')+'</div>'; },[4,2],[4,2]),
  journal: cardW("kal","📓","Muhasabah hari ini","Today's reflection",function(){ return wJournal(); },[4,2],[2,2]),
  mydoa: cardW("zikir","🤲","Doa saya","My doa list",function(){ return wMyDoa(); },[4,3],[2,2]),
  ramadanm: cardW("kal","🌙","Bulan Ramadan (tanda selepas Maghrib)","Ramadan month (ticks at Maghrib)",function(){ return ramadanMonth().replace('class="card rmCard"','class="rmCard"'); },[4,6],[4,4]),
  ramadan: cardW("kal","🌙","Ramadan (bila hampir)","Ramadan (when near)",function(){ return HC.ramadan(); },[4,4],[2,2],L2x("Muncul 30 hari sebelum Ramadan","Shows 30 days before Ramadan")),
  events: cardW("kal","✨","Hari kebesaran Islam","Islamic days",function(){ return HC.events(); },[4,3],[2,2]),
  fast: cardW("kal","🍽","Puasa sunat","Sunnah fasts",function(){ return HC.fast(); },[4,2],[2,2]),
  ganti: cardW("kal","🗓","Puasa ganti","Make-up fasts",function(){ return HC.ganti(); },[4,3],[2,2]),
  nowplay: cardW("media","🎧","Sedang dimainkan","Now playing",function(w,h){ return window.IbMedia?IbMedia.widget(w,h):'<div class="card"><h3>🎧 '+L2x("Radio & podcast","Radio & podcast")+'</h3></div>'; },[4,1],[2,1]),
  usage: cardW("stats","⏱","Masa penggunaan hari ini","Time spent today",function(w,h){ return wUsage(w,h); },[2,2],[2,1]),
  usageweek: cardW("stats","📊","Masa penggunaan minggu ini","Time spent this week",function(w,h){ return wUsageWeek(w,h); },[4,2],[2,2]),
  // shortcuts
  "sc-rk": scW("solat","🕌","Kira rakaat","Count rakaat","q-rk","Mula kira solat waktu ini","Start counting the current prayer"),
  "sc-qibla": scW("solat","🧭","Kiblat","Qibla","q-qibla"),
  "sc-qcam": scW("solat","📷","Kiblat kamera","Qibla camera","qcam"),
  "sc-solat": scW("solat","🕰","Tab Solat","Solat tab","go:solat"),
  "sc-t8": scW("solat","🌙","Tarawih 8+3","Tarawih 8+3","r-t8"),
  "sc-t20": scW("solat","🌙","Tarawih 20+3","Tarawih 20+3","r-t20"),
  "sc-tasbih": scW("zikir","📿","Tasbih","Tasbih","q-tasbih"),
  "sc-zikir": scW("zikir","📿","Zikir selepas solat","After-prayer dhikr","z:after"),
  "sc-mathurat": scW("zikir","📖","Ma'thurat","Ma'thurat","q-mathurat"),
  "sc-wirid": scW("zikir","🌄","Wirid pagi & petang","Morning & evening wirid","q-wirid"),
  "sc-doa": scW("zikir","🤲","Doa","Doa","q-doa"),
  "sc-favdoa": scW("zikir","★","Doa kegemaran","Favourite doa","fav-all"),
  "sc-amal": scW("zikir","🌙","Amal sunat","Sunnah deeds","q-amal"),
  "sc-asma": scW("zikir","✨","Asmaul Husna","Names of Allah","go:asma"),
  "sc-cal": scW("kal","📅","Masa","Time","go:cal"),
  "sc-jadual": scW("kal","🗒","Jadual waktu solat bulan ini","This month's prayer timetable","jadual"),
  "sc-quran": scW("learn","📖","Al-Quran","Quran","quran"),
  "sc-kahf": scW("learn","🕳","Al-Kahf (Jumaat)","Al-Kahf (Friday)","quran:18:1","Baca Al-Kahf pada hari Jumaat","Read Al-Kahf on Friday"),
  "sc-mulk": scW("learn","🌙","Al-Mulk (sebelum tidur)","Al-Mulk (before sleep)","quran:67:1","Bacaan sebelum tidur","Before you sleep"),
  "sc-yasin": scW("learn","💚","Yasin","Yasin","quran:36:1"),
  "sc-baq": scW("learn","🛡","2 ayat akhir Al-Baqarah","Last 2 ayat of Al-Baqarah","quran:2:285","Dibaca pada waktu malam","Read at night"),
  "sc-sirah": scW("learn","🐪","Sirah Nabi ﷺ","Sirah ﷺ","sirah"),
  "sc-hajj": scW("learn","🕋","Haji & Umrah 3D","Hajj & Umrah 3D","hajj"),
  "sc-umrahdiy": scW("learn","🧳","Umrah DIY","Umrah DIY","umrahdiy"),
  "sc-tawaf": scW("learn","🔢","Kaunter tawaf & sa'ie","Tawaf & sa'ie counter","tawaf"),
  "sc-prac": scW("learn","🔊","Latihan solat berpandu","Guided solat practice","prac"),
  "sc-learn": scW("learn","📚","Belajar","Learn","go:learn"),
  "sc-kids": scW("learn","🧒","Mod kanak-kanak","Kids mode","q-kids"),
  "sc-radio": scW("media","📻","Radio Islam","Islamic radio","learn:radio"),
  "sc-podcast": scW("media","🎙","Podcast","Podcasts","learn:podcast"),
  "sc-live": scW("media","📺","Siaran langsung Makkah & Madinah","Live Makkah & Madinah","learn:live"),
  "sc-player": scW("media","🎧","Pemain muzik (sedang main)","Player (now playing)","player"),
  "sc-halal": scW("tools","🔍","Semak halal","Halal check","go:halal"),
  "sc-barcode": scW("tools","🛒","Imbas kod bar halal","Scan a halal barcode","barcode"),
  "sc-saham": scW("tools","📈","Saham patuh Syariah","Shariah stocks","saham"),
  "sc-kad": scW("kal","🎴","Kad ucapan Raya & Ramadan","Raya & Ramadan cards","kad"),
  "sc-finder": scW("tools","📍","Cari masjid & makanan","Find mosque & food","q-finder"),
  "sc-more": scW("tools","⚙️","Tetapan","Settings","go:more")
};
// ---------- 0.25.0 WIDGETS: every page as a shortcut, finance, family, find, sirah, quiz, qibla; half transparency; phone widgets ----------
// Farah's rule (2026-11-06): every display element that can be a widget should be one, now and in future builds.
WCAT.splice(5,0,["fin","💰","Kewangan","Finance"],["fam","👨‍👩‍👧","Keluarga","Family"]);
WCAT.push(["page","🗂","Semua halaman (pintasan)","Every page (shortcuts)"]);
function wMoney(n){ return "RM "+(+n||0).toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function wFin(){ return load("ihsan_fin",null)||{}; }
function wDebtLeft(x){ var p=(x.pays||[]).reduce(function(a,b){ return a+(+b.amt||0); },0); return x.done?0:Math.max(0,Math.round((x.amt-p)*100)/100); }
function wDebtSum(){ var o={owe:0,owed:0,n:0,due:null}, t=new Date(); t.setHours(0,0,0,0);
  (wFin().debts||[]).forEach(function(x){ var l=wDebtLeft(x); if(!l) return; o.n++; if(x.dir==="owed") o.owed+=l; else o.owe+=l; if(x.due){ var d=new Date(x.due+"T00:00:00"); if(!o.due || d<o.due.d) o.due={d:d,x:x}; } }); return o; }
function wDebt(w,h){ var s=wDebtSum();
  return '<div class="card wfin" data-wsc="sc-n-fin/hutang"><h3>🤝 '+L2x("Hutang","Debts")+'</h3>'+(s.n?'<div class="wfr"><div><small>'+L2x("Saya berhutang","I owe")+'</small><b class="fneg">'+wMoney(s.owe)+'</b></div>'+(w>=3?'<div><small>'+L2x("Orang berhutang pada saya","Owed to me")+'</small><b class="fpos">'+wMoney(s.owed)+'</b></div>':'')+'</div>'+
    (h>=2&&s.due?'<div class="mut tiny">⏰ '+esc(s.due.x.who||s.due.x.desc||"")+' · '+s.due.d.toLocaleDateString(locTag(),{day:"numeric",month:"short"})+'</div>':''):'<div class="mut small">'+L2x("Tiada hutang direkod. Alhamdulillah.","No debts recorded. Alhamdulillah.")+'</div>')+'</div>'; }
function wKomit(w,h){ var t=new Date(); t.setHours(0,0,0,0); var L=[];
  (wFin().com||[]).forEach(function(c){ var d=window.FinNextDue?FinNextDue(c,t):null; if(d && (d-t)/864e5<=31) L.push({c:c,d:d}); }); L.sort(function(a,b){ return a.d-b.d; });
  var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-n-fin/komitmen"><h3>📆 '+L2x("Komitmen bulan ini","Commitments this month")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.d-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.c.name)+'</span><b>'+wMoney(x.c.amt)+'</b><small>'+(dd===0?L2x("Hari ini","Today"):dd===1?L2x("Esok","Tomorrow"):x.d.toLocaleDateString(locTag(),{day:"numeric",month:"short"}))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tiada bayaran dalam 31 hari.","Nothing due in 31 days.")+'</div>')+'</div>'; }
function wZakat(w,h){ var y=new Date().getFullYear(), tot=0, n=0; (wFin().zakat||[]).forEach(function(z){ if(String(z.d||"").slice(0,4)===String(y)){ tot+=+z.amt||0; n++; } });
  return '<div class="card wfin" data-wsc="sc-n-fin/zakat"><h3>💰 '+L2x("Zakat ","Zakat ")+y+'</h3><div class="ubig">'+wMoney(tot)+'</div><div class="mut tiny">'+n+' '+L2x("rekod","records")+'</div></div>'; }
function wBday(w,h){ var F=load("ihsan_family",null)||{}, L=[], t=new Date(); t.setHours(0,0,0,0);
  (F.p||[]).forEach(function(p){ if(p.dd || !p.b || !window.FamNext) return; var nx=FamNext(p); if(nx.g) L.push({p:p,d:nx.g,h:false}); if(nx.h) L.push({p:p,d:nx.h,h:true}); });
  L.sort(function(a,b){ return a.d-b.d; }); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-n-alat/keluarga"><h3>🎂 '+L2x("Hari lahir akan datang","Upcoming birthdays")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.d-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.p.n)+(x.h?' <em class="gold">'+L2x("Hijrah","Hijri")+'</em>':'')+'</span><small>'+(dd===0?"🎉 "+L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tambah keluarga dan tarikh lahir di Alat › Keluarga.","Add family and birth dates in Tools › Family.")+'</div>')+'</div>'; }
// 0.35.0: next vaccines (Bayi) and next events (Majlis), from ihsan_famrem written by family/baby.js and family/events.js
function wVax(w,h){ var R=load("ihsan_famrem",null)||{}, L=R.vx||[], t=new Date(); t.setHours(0,0,0,0); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-baby"><h3>💉 '+L2x("Vaksin seterusnya","Next vaccines")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.t-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.kid)+' · '+esc(x.v)+'</span><small>'+(dd<0?"⏰ "+L2x("lewat","overdue"):dd===0?L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tambah anak di Alat › Keluarga › Bayi.","Add a child in Tools › Family › Baby.")+'</div>')+'</div>'; }
function wEvents(w,h){ var R=load("ihsan_famrem",null)||{}, L=(R.evs||[]).filter(function(x){ return x.t>=Date.now()-864e5; }), t=new Date(); t.setHours(0,0,0,0); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-events"><h3>🎉 '+L2x("Majlis akan datang","Upcoming events")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.t-t)/864e5);
    return '<div class="wfl"><span>'+x.ic+' '+esc(x.n)+'</span><small>'+(dd<=0?"🎉 "+L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Rancang majlis di Alat › Keluarga › Majlis.","Plan an event in Tools › Family › Events.")+'</div>')+'</div>'; }
function wSirah(w,h){ setTimeout(function(){ var b=document.getElementById("wSirahB"); if(b) withExtra(null, function(){ IbExtra.sirahSnippet(b, xH()); }); }, 0);
  return '<div id="wSirahB" class="wsir"><div class="card mut small">🐪 '+L2x("Sirah hari ini…","Today's Sirah…")+'</div></div>'; }
function wDonate(){ return '<div class="card"><h3>💝 '+L2x("Derma berdekatan","Give nearby")+'</h3><div class="btns">'+[["rumah anak yatim","🧒","Anak yatim","Orphanage"],["rumah jagaan warga emas","👵","Warga emas","Elderly home"],["yayasan islam","🤲","Yayasan","Foundation"],["maahad tahfiz","📖","Tahfiz","Tahfiz"]].map(function(x){ return '<button class="btn alt g3d" data-maps="'+x[0]+'">'+x[1]+' '+esc(L2x(x[2],x[3]))+'</button>'; }).join("")+'</div></div>'; }
function wSurau(w,h){ var d=load("ihsan_extra",null)||{}, L=(d.surau||[]); var n=Math.max(1,h*2-1);
  return '<div class="card" data-wsc="sc-n-alat/cari"><h3>🛖 '+L2x("Surau saya","My surau")+'</h3>'+(L.length?L.slice(-n).reverse().map(function(s){ return '<div class="wfl"><span>'+esc(s.n)+'</span><small>'+(s.tg||[]).map(function(t){ return {w:"🧕",u:"💧",o:"♿",t:"🧣",p:"🅿",a:"❄"}[t]||""; }).join("")+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Simpan surau di Alat › Cari.","Save surau in Tools › Find.")+'</div>')+'</div>'; }
function wQibla(w,h){ var p=qiblaPoint(), b=qiblaBearing(p[0],p[1]);
  return '<div class="card wqib" data-wsc="sc-qibla"><div class="wqd" style="--qb:'+b.toFixed(1)+'deg"><i></i></div><div><b>'+b.toFixed(1)+'°</b><div class="mut tiny">'+L2x("Kiblat dari utara","Qibla from north")+'</div></div></div>'; }
// 0.37.0: exercise today and this week (reads ihsan_fit directly)
function wFit(w,h){ var F=load("ihsan_fit",null)||{}, L=F.log||[], t=ymd(new Date()), d=new Date(), mon=ymd(addDays(d,-((d.getDay()+6)%7))), tk=0, tm=0, wm=0, days={};
  L.forEach(function(x){ days[x.d]=1; if(x.d===t){ tk+=x.kcal||0; tm+=x.min||0; } if(x.d>=mon) wm+=x.min||0; });
  var c=0, q=new Date(); if(!days[ymd(q)]) q=addDays(q,-1); while(days[ymd(q)]){ c++; q=addDays(q,-1); }
  return '<div class="card wfin" data-wsc="sc-n-cal/senaman"><h3>🏃 '+L2x("Senaman","Exercise")+'</h3><div class="wfl"><span>🔥 '+Math.round(tk)+' kcal · '+Math.round(tm)+' min</span><small>🔥 '+c+L2x(" hari"," days")+'</small></div>'+
    '<div class="ubar1"><i style="width:'+Math.min(100,Math.round(wm*100/150))+'%"></i></div><div class="mut tiny">'+Math.round(wm)+' / 150 '+L2x("minit minggu ini","min this week")+'</div></div>'; }
Object.assign(WG,{
  fitw: cardW("kal","🏃","Senaman hari ini","Exercise today",wFit,[4,2],[2,2]),
  debt: cardW("fin","🤝","Ringkasan hutang","Debt summary",wDebt,[4,2],[2,1]),
  komit: cardW("fin","📆","Komitmen akan datang","Upcoming commitments",wKomit,[4,2],[2,2]),
  zakatw: cardW("fin","💰","Zakat tahun ini","Zakat this year",wZakat,[2,2],[2,1]),
  bday: cardW("fam","🎂","Hari lahir keluarga","Family birthdays",wBday,[4,2],[2,2]),
  vaxw: cardW("fam","💉","Vaksin anak","Children's vaccines",wVax,[4,2],[2,2]),
  eventw: cardW("fam","🎉","Majlis akan datang","Upcoming events",wEvents,[4,2],[2,2]),
  sirahday: cardW("learn","🐪","Sirah hari ini","Today's Sirah",wSirah,[4,4],[4,3]),
  donate: cardW("tools","💝","Derma berdekatan","Give nearby",wDonate,[4,2],[4,2]),
  surau: cardW("tools","🛖","Surau saya","My surau list",wSurau,[4,2],[2,2]),
  qiblaw: cardW("solat","🧭","Arah kiblat","Qibla direction",wQibla,[2,1],[2,1]),
  "sc-quiz": scW("learn","🧠","Kuiz Islam","Islamic quiz","x:quiz"),
  "sc-pksk": scW("learn","📝","Latihan PKSK","PKSK practice exam","pksk","Nota & latihan ujian kemasukan sekolah khusus","Notes & practice for the special school entry test"),
  "sc-flight": scW("solat","✈","Solat dalam pesawat","Praying on a flight","x:flight"),
  "sc-ziarah": scW("zikir","🪦","Doa ziarah kubur","Grave visit doa","x:ziarah"),
  "sc-famtree": scW("fam","🌳","Salasilah 3D","3D family tree","side:alat/keluarga"),
  "sc-baby": scW("fam","👶","Bayi: vaksin & kenangan","Baby: vaccines & memories","fam:baby"),
  "sc-events": scW("fam","🎉","Perancang majlis","Event planner","fam:events"),
  "sc-hutang": scW("fin","🤝","Hutang","Debts","side:fin/hutang"),
  "sc-zakat": scW("fin","💰","Log zakat","Zakat log","side:fin/zakat"),
  "sc-wasiat": scW("fin","📜","Wasiat & faraid","Will & faraid","side:fin/wasiat"),
  "sc-fx": scW("fin","💱","Tukaran mata wang","Currency converter","side:fin/tukaran"),
  fx: cardW("fin","💱","Kadar mata wang kegemaran","Favourite currency rates",function(){ if(!window.FxView){ loadJs(["finance/fx.js"], function(){ if(view==="home") render(); }); return '<div class="card mut small" data-go="fin">💱 …</div>'; }
    var l=FxView.card(finH2()); return '<div class="card" data-act="side:fin/tukaran"><h3>💱 '+L2x("Kadar mata wang","Currency rates")+'</h3>'+l.map(function(x){ return '<div class="set"><span>'+esc(x.p)+'</span><span><b>'+esc(x.r)+'</b>'+(x.ch==null?'':' <small style="color:'+(x.ch>=0?'#3fb27f':'#e5484d')+'">'+(x.ch>=0?'▲':'▼')+Math.abs(x.ch).toFixed(2)+'%</small>')+'</span></div>'; }).join("")+'<div class="mut tiny">'+L2x("Kadar harian","Daily rate")+'</div></div>'; },[4,2],[2,2])
});
var wPagesDone=false;
function wPages(){ if(wPagesDone) return; wPagesDone=true;
  var keep=S.lang, tree={};
  ["ms","en"].forEach(function(lg){ S.lang=lg; try{ var walk=function(arr, par){ arr.forEach(function(x){ if(x.id==="search") return; var t=tree[x.id]||(tree[x.id]={ic:x.ic, par:par}); t[lg]=(par&&tree[par]?tree[par][lg]+" › ":"")+x.lb; if(x.k) walk(x.k, x.id); }); }; walk(sideTree(), null); }catch(e){} });
  S.lang=keep;
  Object.keys(tree).forEach(function(id){ var t=tree[id]; if(t.ms) WG["sc-n-"+id]=scW("page", t.ic, t.ms, t.en||t.ms, "side:"+id); });
}
function sideFind(id){ id={"alat/buku":"alat/nota/buku","fin/saham":"fin/tukaran","alat/saham":"fin/tukaran"}[id]||id; var f=null, walk=function(arr){ arr.forEach(function(x){ if(f) return; if(x.id===id) f=x; else if(x.k) walk(x.k); }); }; walk(sideTree()); return f; }
// half transparency for home widgets and phone widgets
function wAlphaCls(){ var a=S.wAlpha||100; return a<100?" wa"+a:""; }
// phone home-screen widgets: data for the native widgets (prayer times come from the schedule)
var wPushLast="";
function pushWidgets(){ if(!window.Native || !N.setWidgetData) return; try{
  var d=wDebtSum(), t=new Date(); t.setHours(0,0,0,0); var o={a:S.wAlpha||100, lang:S.lang};
  var com=[]; (wFin().com||[]).forEach(function(c){ var x=window.FinNextDue?FinNextDue(c,t):null; if(x && (x-t)/864e5<=31) com.push([x.getTime(), c.name+" · "+wMoney(c.amt)]); }); com.sort(function(a,b){ return a[0]-b[0]; });
  o.fin={t:L2x("Kewangan","Finance"), l:[L2x("Saya berhutang ","I owe ")+wMoney(d.owe), L2x("Orang berhutang ","Owed to me ")+wMoney(d.owed)].concat(com.slice(0,3).map(function(x){ return "📆 "+new Date(x[0]).toLocaleDateString(locTag(),{day:"numeric",month:"short"})+" · "+x[1]; }))};
  var F=load("ihsan_family",null)||{}, B=[]; (F.p||[]).forEach(function(p){ if(p.dd||!p.b||!window.FamNext) return; var nx=FamNext(p); if(nx.g) B.push([nx.g.getTime(), p.n]); if(nx.h) B.push([nx.h.getTime(), p.n+" ("+L2x("Hijrah","Hijri")+")"]); }); B.sort(function(a,b){ return a[0]-b[0]; });
  o.fam={t:L2x("Hari lahir keluarga","Family birthdays"), l:B.slice(0,4).map(function(x){ var dd=Math.round((x[0]-t)/864e5); return "🎂 "+x[1]+" · "+(dd===0?L2x("hari ini","today"):dd+" "+L2x("hari","days")); })};
  if(window.SIRAH && SIRAH.length){ o.sirah=SIRAH.map(function(e){ var f=String(L2x(e.f[0],e.f[1])||"").split("\n")[0]; return {t:L2x(e.t[0],e.t[1]), b:f.length>260?f.slice(0,f.lastIndexOf(" ",250))+"…":f}; }); }
  else if(!pushWidgets.sl){ pushWidgets.sl=1; loadJs(["sirah_data_0.js","sirah_data_1.js","sirah_data_2.js","sirah_data_3.js"], function(){ wPushLast=""; pushWidgets(); }); }
  try{ var hj=hijriOf(new Date()); o.today={h:hijriStr(hj)}; }catch(e){}
  // 0.4.7: timely cards for the launcher feed page (Hijri special days, sunnah fasts, Ramadan)
  try{ var C=[], t0=new Date(), t1=new Date(Date.now()+864e5), h0=hijriOf(t0), h1=hijriOf(t1), e0=h0&&EV_NAMES[h0.m+"-"+h0.d], e1=h1&&EV_NAMES[h1.m+"-"+h1.d];
    if(e0) C.push({t:"🌙 "+L2x(e0[0],e0[1]), b:L2x("Hari ini · ","Today · ")+hijriStr(h0), v:"cal"});
    if(e1) C.push({t:"🌙 "+L2x(e1[0],e1[1]), b:L2x("Esok","Tomorrow"), v:"cal"});
    if(h0 && h0.m===9) C.push({t:"🌙 Ramadan · "+L2x("hari ke-"+h0.d,"day "+h0.d), b:L2x("Semoga puasa dan ibadah kita diterima.","May our fasting and worship be accepted."), v:"cal"});
    if(h1 && h1.m!==9 && h1.d>=13 && h1.d<=15) C.push({t:"🍽 "+L2x("Puasa Ayyamul Bidh esok","Ayyamul Bidh fast tomorrow"), b:L2x(h1.d+" "+HIJRI_MONTHS[h1.m-1],h1.d+" "+HIJRI_MONTHS[h1.m-1]), v:"cal"});
    var dw=t1.getDay(); if((dw===1||dw===4) && !(h1&&h1.m===9) && !(h1&&h1.m===10&&h1.d===1)) C.push({t:"🍽 "+L2x("Puasa sunat "+(dw===1?"Isnin":"Khamis")+" esok","Sunnah fast tomorrow ("+(dw===1?"Monday":"Thursday")+")"), b:L2x("Niat dan bersahur.","Make the intention and have suhoor."), v:"cal"});
    o.cards=C; }catch(e){}
  // 0.4.4: any Utama widget as text for the "My Ihsan" phone widget (only the ones placed on the phone home screen)
  try{ var CATV={solat:"solat", zikir:"zikir", kal:"cal", kalendar:"cal", ilmu:"learn", alat:"alat", fin:"fin", fam:"alat"};
    o.wgCat=Object.keys(WG).filter(function(k){ return WG[k].r && (!WG[k].cond || true); }).map(function(k){ return [k, WG[k].ic, WG[k].ms, WG[k].en]; });
    var wk=[]; try{ wk=JSON.parse(N.homeWidgetKeys?N.homeWidgetKeys():"[]")||[]; }catch(e){}
    o.wg={}; wk.forEach(function(k){ var d=WG[k]; if(!d||!d.r) return; var html=""; try{ html=d.r((d.def||[4,2])[0], (d.def||[4,2])[1])||""; }catch(e){}
      var div=document.createElement("div"); div.innerHTML=String(html).replace(/<br\s*\/?>/gi,"\n").replace(/<\/(div|p|li|h\d|tr|section)>/gi,"$&\n").replace(/<\/(span|b|i|small|strong|em|td|th|a|label)>/gi,"$& ");
      div.querySelectorAll("button,script,style,input,select,svg,.tools,canvas").forEach(function(x){ x.remove(); });
      var lines=(div.textContent||"").split("\n").map(function(x){ return x.replace(/\s+/g," ").trim(); }).filter(Boolean);
      if(lines.length && lines[0].indexOf(L2x(d.ms,d.en))>=0) lines.shift();
      o.wg[k]={ic:d.ic, t:L2x(d.ms,d.en), l:lines.slice(0,10).map(function(x){ return x.length>90?x.slice(0,88)+"…":x; }), v:CATV[d.cat]||"solat"}; });
  }catch(e){ console.error(e); }
  try{ wPages(); o.pages=Object.keys(WG).filter(function(k){ return k.indexOf("sc-n-")===0; }).slice(0,120).map(function(k){ var w=WG[k]; return {ic:w.ic||"🕌", ms:w.ms||"", en:w.en||w.ms||"", v:w.sc||("side:"+k.slice(5))}; }); }catch(e){}
  var j=JSON.stringify(o); if(j!==wPushLast){ wPushLast=j; N.setWidgetData(j); } }catch(e){ console.error(e); } }
var WDEF=["next","sc-rk","sc-qibla","sc-tasbih","sc-mathurat","sc-doa","sc-amal","sc-radio","sc-finder","pause","musafir","ramadan","prtoday","events","fast","hadith","usage","nowplay","fav","ganti"];
// 0.5.16: home widgets that need the Android app are left out of the web build
var WEB_W=["kiblat","qibla","qcam","fokus","senaman","statistik","stat","tukaran","saham","halal","barcode","cari","finder","dengar","tanya","radio","podcast","live","player","nowplay","usage","steps","pause"];
function webOffW(id){ return WEB_W.some(function(k){ return String(id).indexOf(k)>=0; }); }
function wDefaults(){
  var off={}; (S.homeCards||[]).forEach(function(c){ if(!c.on) off[c.id]=1; });
  var wd=WDEF.slice(); if(WEB) wd.splice(wd.indexOf("sc-amal")+1,0,"sc-sirah","sc-hajj","sc-quran");
  return wd.filter(function(id){ return !off[id] && !(WEB && webOffW(id)) && WG[id]; }).map(function(id){ var d=WG[id]; return {id:id, w:id==="nowplay"?2:d.def[0], h:id==="nowplay"?2:d.def[1]}; }).map(function(x){ if(x.id==="usage"){ x.w=2; x.h=2; } x.w*=2; x.h*=2; return x; });
}
function wList(){
  wPages();
  if(!WG["sc-l-wudhu"]) LEARN.forEach(function(x){ WG["sc-l-"+x[0]]=scW("learn",x[1],x[2],x[3],"learn:"+x[0]); });
  if(!Array.isArray(S.widgets)){ S.widgets=wDefaults(); S.wGrid=2; }
  if(S.wGrid!==2){ S.widgets.forEach(function(x){ x.w*=2; x.h*=2; }); S.wGrid=2; } // 0.9.1: grid doubled to 8 columns
  S.widgets=S.widgets.filter(function(x){ return WG[x.id]; });
  if(WEB) return S.widgets.filter(function(x){ return !webOffW(x.id); });
  return S.widgets;
}
function wName(id){ var d=WG[id]; return d?(en_()?d.en:d.ms):id; }
// Sizes in WG are in the old 4-column units; the grid is now 8 columns of half-size cells, so x.w/x.h are doubled.
function wClamp(x){ var d=WG[x.id], mw=Math.max(2,d.min[0]*2-(d.sc?0:1)), mh=Math.max(2,d.min[1]*2-(d.sc?0:1));
  x.w=Math.max(mw,Math.min(d.max[0]*2,8,x.w|0||2)); x.h=Math.max(mh,Math.min(d.max[1]*2,x.h|0||2)); return x; }
// --- small widget bodies
function wNextSmall(w,h){ var np=nextPrev(); if(!np.next) return ''; var t=getDay(new Date()), cur=currentPrayer();
  return '<div class="card hnext wns"><div class="mut tiny" style="margin:0">'+T("next")+'</div><div class="hn-name">'+T(np.next.k)+'</div><div class="mut small">'+hm12(np.next.t)+'</div><div class="hn-cd" id="hnCd">'+cdStr(np.next.t-Date.now())+'</div>'+
    (h>=4||w>=3?'<div class="wnsl">'+PR.map(function(k0){ var c=prCell(k0,t); return '<div class="'+(c.k===cur||c.cur?"cur":"")+'"><span>'+prN(c.k)+'</span><b>'+fmt12(c.hm)+'</b></div>'; }).join("")+'</div>':'')+'</div>'; }
function wTimes(w,h){ var t=getDay(new Date()), dh=inDhuha(), cur=dh?"dhuha":currentPrayer(), ks=w>=4||h>=3?ALL:PR;
  // 0.9.1: after sunrise Dhuha is shown and highlighted instead of Subuh (full list drops the past Imsak to make room)
  if(dh) ks = ks===ALL ? ["subuh","syuruk","dhuha","zohor","asar","maghrib","isyak"] : ["dhuha","zohor","asar","maghrib","isyak"];
  var tm=function(k){ return k==="dhuha"?dhuhaHM(t):t[k]; };
  if(w<4) return '<div class="card wns"><div class="wnsl" style="margin:0">'+ks.map(function(k){ return '<div class="'+(k===cur?"cur":"")+'"><span>'+T(k)+'</span><b>'+fmt12(tm(k))+'</b></div>'; }).join("")+'</div></div>';
  return '<div class="card wtimes"><div class="wtg c'+(w>=4?(ks.length>5?7:5):2)+'">'+ks.map(function(k){ var p=fmt12(tm(k)).split(" "); return '<div class="'+(k===cur?"cur":"")+'"><span>'+T(k)+'</span><b>'+p[0]+'</b><small>'+(p[1]||"")+'</small></div>'; }).join("")+'</div></div>'; }
function wClock(w,h){ var d=new Date();
  if(w<3) return '<div class="card wclock sm"><b id="wClk">'+hm12(d.getTime())+'</b><span class="gold">'+hijriStr(hijriOf(d))+'</span>'+(h>=2?'<span>'+esc(d.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"short"}))+'</span>':'')+'</div>';
  return '<div class="card wclock"><b id="wClk">'+hm12(d.getTime())+'</b><span>'+esc(d.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"short"}))+'<br><span class="gold">'+hijriStr(hijriOf(d))+'</span></span></div>'; }
function wAsma(w,h){ var a=ASMAUL_HUSNA[dayIndex(new Date())%ASMAUL_HUSNA.length];
  return '<div class="card wasma" data-wsc="sc-asma"><div class="ar">'+a[0]+'</div><b>'+esc(a[1])+'</b>'+(h>=2?'<div class="mut small">'+esc(en_()?a[3]:a[2])+'</div>':'')+'</div>'; }
function wTasbih(w,h){ var c=S.wTasbih||0;
  return '<div class="card wtasbih" data-wtap="1"><div class="wtn" id="wTb">'+c+'</div>'+(h>=2?'<div class="mut tiny">'+L2x("Ketik untuk kira","Tap to count")+(c?' · '+(Math.floor(c/33))+'×33':'')+'</div>':'')+(c?'<button class="ib wtr" data-wreset="1" aria-label="reset">↺</button>':'')+'</div>'; }
function wUsage(w,h){ usageFlush(); var k=ymd(new Date()), u=useSec(k), p=plogSec(k), y=useSec(ymd(addDays(new Date(),-1)));
  return '<div class="card wuse" data-wsc="sc-cal"><div class="mut tiny">⏱ '+L2x("Hari ini","Today")+'</div><div class="ubig" id="wUse">'+durEn(u)+'</div>'+(h>=2?'<div class="ubar1"><i style="width:'+Math.min(100,Math.round(u*100/Math.max(u,y,1800)))+'%"></i></div><div class="mut tiny">'+L2x("Solat ","Prayer ")+durEn(p)+' · '+L2x("semalam ","yesterday ")+durEn(y)+'</div>':'')+'</div>'; }
function wUsageWeek(w,h){ usageFlush(); var t=new Date(), mon=addDays(t,-((t.getDay()+6)%7)), mx=60, ds=[], tot=0;
  for(var i=0;i<7;i++){ var d=addDays(mon,i), k=ymd(d); ds.push({d:d,k:k,u:useSec(k),p:plogSec(k)}); mx=Math.max(mx,useSec(k)); tot+=useSec(k); }
  return '<div class="card wusew" data-wsc="sc-cal"><div class="row"><span class="mut tiny">📊 '+L2x("Minggu ini","This week")+'</span><b class="small">'+durEn(tot)+'</b></div><div class="uweek">'+ds.map(function(x){ return '<div class="uw'+(x.k===ymd(t)?' sel':'')+'"><div class="uwb"><i class="a" style="height:'+Math.round(x.u*100/mx)+'%"></i><i class="p" style="height:'+Math.round(x.p*100/mx)+'%"></i></div><div class="uwl">'+x.d.toLocaleDateString(locTag(),{weekday:"narrow"})+'</div></div>'; }).join("")+'</div></div>'; }
function wShortcut(id,w,h){ var d=WG[id], nm=String(en_()?d.en:d.ms).split(" › ").pop(), ds=d.d[en_()?1:0];
  var cw=Math.max(1,Math.floor(w)), ch=Math.max(1,Math.floor(h));
  return '<button class="wsc s'+cw+'x'+ch+(w*2<=2&&h*2<=2?'':'')+'" data-wsc="'+id+'"><span class="wi">'+d.ic+'</span><span class="wn">'+esc(nm)+'</span>'+(w>=2&&h>=2&&ds?'<span class="wd">'+esc(ds)+'</span>':'')+'</button>'; }
function runSc(id){
  var d=WG[id]; if(!d) return; var a=d.sc;
  if(!a) return;
  if(a.indexOf("go:")===0){ var v=a.slice(3); if(v==="asma"){ sub.zikir="asma"; v="zikir"; } if(v==="learn") learnPg=null; go(v); return; }
  if(a.indexOf("learn:")===0){ learnPg=a.slice(6); learnFrom=null; go("learn"); return; }
  if(a==="kad"){ openCardMaker(); return; }
  if(a.indexOf("fam:")===0){ famOpen(a.slice(4)); return; }
  if(a.indexOf("side:")===0){ var sn=sideFind(a.slice(5)); if(sn && sn.f) sn.f(); return; }
  if(a.indexOf("x:")===0){ var xa=a.slice(2); withExtra(null, function(){ if(xa==="quiz") IbExtra.openQuiz(xH()); else if(xa==="flight") IbExtra.openFlight(xH()); else if(xa==="ziarah") IbExtra.ziarah(xH()); }); return; }
  if(a==="z:after"){ sub.zikir="after"; go("zikir"); return; }
  if(a==="sirah"){ openSirah(false); return; }
  if(a==="pksk"){ openPksk(); return; }
  if(a==="hajj"){ openHajj(); return; }
  if(a==="umrahdiy"){ openUmrah(); return; }
  if(a==="quran"){ openQuran(false); return; }
  if(a.indexOf("quran:")===0){ var qp=a.split(":"); openQuranAt(+qp[1], +(qp[2]||1)); return; }
  if(a==="tawaf"){ openTawaf(); return; }
  if(a==="prac"){ openPractice(); return; }
  if(a==="qcam"){ openQiblaCam(); return; }
  if(a==="barcode"){ halalAuto="barcode"; go("halal"); return; }
  if(a==="saham"){ openSaham(); return; }
  if(a==="jadual"){ var nd=new Date(); timetableImage(nd.getFullYear(), nd.getMonth()); return; }
  if(a==="player"){ if(window.IbMedia) IbMedia.openPlayer(); return; }
  homeAct(a);
}
function homeAct0(a){
    if(a==="q-rk"){ rk.solat=inDhuha()?"sunat2":currentPrayer(); rk.keep=false; var tg=rkTarget(); if(S.rmode==="camera" && !N.hasPerm("camera")){ go("solat"); return; } startPraying(tg); }
    else if(a==="q-qibla"){ go("qibla"); }
    else if(a==="q-tasbih"){ sub.zikir="tasbih"; go("zikir"); }
    else if(a==="q-mathurat"){ go("mathurat"); }
    else if(a==="q-wirid"){ go("wirid"); }
    else if(a==="q-ramadanm"){ SUB2.cal="puasa"; go("cal"); }
    else if(a==="q-doa"){ go("doa"); }
    else if(a==="q-amal"){ go("amal"); }
    else if(a==="q-kids"){ go("kids"); }
    else if(a==="q-finder"){ showSheet("📍 "+L2x("Cari berdekatan","Find nearby"), finderBtns()); document.querySelectorAll("#overlay [data-maps]").forEach(function(x){ x.onclick=function(){ openFinder(x.getAttribute("data-maps")); }; }); }
    else if(a==="pz-end"){ S.pauseMode=null; S.pauseUntil=0; saveS(); render(); toast(L2x("Makluman solat disambung","Prayer alerts resumed")); }
    else if(a==="r-t8"||a==="r-t20"){ rk.solat=a==="r-t8"?"t8":"t20"; rk.keep=true; startPraying(rkTarget()); }
    else if(a==="fav-all"){ doaFav=true; doaMine=false; doaQ=""; go("doa"); }
    else if(a==="mydoa"){ doaMine=true; doaFav=false; doaQ=""; go("doa"); }
    else if(a==="g-minus"){ S.ganti.owe=Math.max(0,S.ganti.owe-1); saveS(); render(); }
    else if(a==="g-plus"){ S.ganti.owe++; saveS(); render(); }
    else if(a==="g-done"){ if(S.ganti.owe>0){ S.ganti.owe--; S.ganti.done.push(ymd(new Date())); saveS(); N.vibrate(120); toast(L2x("Alhamdulillah, dicatat","Alhamdulillah, recorded")); render(); } }
}
var hEditing=false;
function wBody(x){
  var d=WG[x.id], h="";
  if(d.sc) return wShortcut(x.id,x.w/2,x.h/2);
  try{ h=d.r(x.w/2,x.h/2)||""; }catch(e){ console.error(e); h=""; }
  return h;
}
function vHome(el){
  if(S.senior){ vSenior(el); return; }
  var html='', en=en_(), L=wList();
  if(!S.onboard) html+='<div class="card"><h3>'+(en?"Welcome":"Selamat datang")+'</h3><div class="small mut">'+(en?"Allow location to pick your JAKIM zone and Qibla, and notifications for prayer alerts.":"Benarkan lokasi untuk zon JAKIM dan kiblat, serta notifikasi untuk makluman waktu solat.")+'</div><div class="btns" style="margin-top:10px"><button class="btn" id="obLoc">📍 '+(en?"Location":"Lokasi")+'</button><button class="btn" id="obNot">🔔 '+T("notifs")+'</button><button class="btn alt" id="obDone">OK</button></div></div>';
  html+='<div class="wbar'+(hEditing?' editbar':'')+'">'+(hEditing?
    '<button class="chip on" id="wAdd">＋ '+L2x("Tambah widget","Add widget")+'</button><button class="chip" id="wReset">⟲ '+L2x("Asal","Default")+'</button><button class="chip gold" id="wDone">✓ '+L2x("Siap & kunci","Done & lock")+'</button>'
    :'<span class="mut tiny">'+L2x("Tekan lama mana-mana widget untuk ubah","Long-press any widget to edit")+'</span><button class="chip" id="wEdit">✎ '+L2x("Ubah","Edit")+'</button>')+'</div>';
  if(hEditing) html+='<div class="wbar editbar wabar"><span class="mut tiny">◐ '+L2x("Latar widget","Widget background")+'</span>'+[100,75,50].map(function(a){ return '<button class="chip'+((S.wAlpha||100)===a?' on':'')+'" data-walpha="'+a+'">'+(a===100?L2x("Penuh","Solid"):a+"%")+'</button>'; }).join("")+'</div>';
  html+='<div class="wgrid'+(hEditing?' editing':'')+wAlphaCls()+'" id="wGrid">';
  // 0.14.0: in edit mode the visible widgets keep their places; empty ones are listed after them
  var ORD=L.map(function(x,i){ wClamp(x); return {x:x,i:i,b:wBody(x)}; });
  if(hEditing) ORD=ORD.filter(function(o){ return o.b; }).concat(ORD.filter(function(o){ return !o.b; }));
  ORD.forEach(function(o){ var x=o.x, i=o.i, body=o.b;
    if(!body && !hEditing) return;
    if(!body) body='<div class="card wempty"><b>'+WG[x.id].ic+' '+esc(wName(x.id))+'</b><span class="mut tiny">'+esc(WG[x.id].cond||L2x("Tiada untuk dipapar sekarang","Nothing to show right now"))+'</span></div>';
    html+='<div class="wg'+(WG[x.id].sc?' isSc':'')+'" data-wi="'+i+'" style="grid-column:span '+x.w+';grid-row:span '+x.h+'"><div class="wgc">'+body+'</div>'+
      (hEditing?'<div class="wctl"><button class="wmv" aria-label="move">⠿</button><span class="wsz">'+x.w+'×'+x.h+'</span><button class="wx" data-wx="'+i+'" aria-label="remove">✕</button><span class="wrs" aria-label="resize"></span></div>':'')+'</div>';
  });
  html+='</div>';
  if(!L.length) html+='<div class="card mut small" style="text-align:center">'+L2x("Tiada widget. Tekan ✎ Ubah, kemudian ＋ Tambah widget.","No widgets. Tap ✎ Edit, then ＋ Add widget.")+'</div>';
  el.innerHTML=html;
  if(!S.onboard){ el.querySelector("#obLoc").onclick=function(){ askLocation(true); }; el.querySelector("#obNot").onclick=function(){ N.requestPerm("notif"); }; el.querySelector("#obDone").onclick=function(){ S.onboard=true; saveS(); render(); }; }
  var q=function(id){ return el.querySelector(id); };
  if(q("#wEdit")) q("#wEdit").onclick=function(){ hEditing=true; render(); };
  if(q("#wDone")) q("#wDone").onclick=function(){ hEditing=false; saveS(); render(); toast(L2x("Susunan dikunci","Layout locked")); };
  if(q("#wAdd")) q("#wAdd").onclick=wAddSheet;
  el.querySelectorAll("[data-walpha]").forEach(function(b){ b.onclick=function(){ S.wAlpha=+b.getAttribute("data-walpha"); saveS(); wPushLast=""; pushWidgets(); render(); }; });
  el.querySelectorAll("#wGrid [data-maps]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); openFinder(b.getAttribute("data-maps")); }; });
  pushWidgets(); document.getElementById("view").classList.toggle("hwall", (S.wAlpha||100)<100);
  if(q("#wReset")) q("#wReset").onclick=function(){ if(!confirm(L2x("Kembalikan susunan asal?","Restore the default layout?"))) return; S.widgets=null; S.homeCards=null; wList(); saveS(); render(); };
  var fr=el.querySelector("#hFastRem"); if(fr) fr.onchange=function(){ S.fastRem=this.checked; saveS(); toast(S.fastRem?L2x("Peringatan puasa sunat dihidupkan","Sunnah fast reminders on"):L2x("Peringatan puasa sunat dimatikan","Sunnah fast reminders off")); };
  var ri=el.querySelector("#rImsak"); if(ri) ri.onchange=function(){ S.imsakOn=this.checked; saveS(); };
  var grid=q("#wGrid");
  el.onclick=function(e){
    if(hEditing){ var x=e.target.closest("[data-wx]"); if(x){ e.stopPropagation(); S.widgets.splice(+x.getAttribute("data-wx"),1); saveS(); render(); } return; }
    var r=e.target.closest("[data-wreset]"); if(r){ e.stopPropagation(); S.wTasbih=0; save("ihsan_settings",S); render(); return; }
    var tp=e.target.closest("[data-wtap]"); if(tp){ S.wTasbih=(S.wTasbih||0)+1; save("ihsan_settings",S); N.vibrate(S.wTasbih%33===0?400:25); var n=el.querySelector("#wTb"); if(n) n.textContent=S.wTasbih; if(S.wTasbih===1||S.wTasbih%33===0) render(); return; }
    var s=e.target.closest("[data-wsc]"); if(s){ runSc(s.getAttribute("data-wsc")); return; }
    var b=e.target.closest("[data-act]"); if(!b) return; homeAct(b.getAttribute("data-act"));
  };
  // long-press anywhere on a widget enters edit mode
  if(!hEditing){ var lp=null, sx=0, sy=0;
    grid.addEventListener("pointerdown", function(e){ if(!e.target.closest(".wg")) return; sx=e.clientX; sy=e.clientY; clearTimeout(lp); lp=setTimeout(function(){ N.vibrate(40); hEditing=true; render(); },650); });
    grid.addEventListener("pointermove", function(e){ if(lp && Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10){ clearTimeout(lp); lp=null; } });
    ["pointerup","pointercancel","pointerleave"].forEach(function(t){ grid.addEventListener(t, function(){ clearTimeout(lp); lp=null; }); });
  } else wDrag(grid);
  timers.push(setInterval(function(){
    var c=document.getElementById("hnCd"); if(c){ var np=nextPrev(); if(np.next) c.textContent=cdStr(np.next.t-Date.now()); }
    var t=getDay(new Date()), now=Date.now(), s=document.getElementById("rSahur"), f=document.getElementById("rIftar");
    if(s){ var im=at(ymd(new Date()),t.imsak).getTime(); s.textContent=now<im?"−"+cdStr(im-now):"✓"; }
    if(f){ var mg=at(ymd(new Date()),t.maghrib).getTime(); f.textContent=now<mg?"−"+cdStr(mg-now):"✓"; }
    var ck=document.getElementById("wClk"); if(ck) ck.textContent=hm12(now);
    var wu=document.getElementById("wUse"); if(wu && now%15000<1000){ usageFlush(); wu.textContent=durEn(useSec(ymd(new Date()))); }
    if(window.IbMedia) IbMedia.tickWidget();
  },1000));
}
// Move (top-left grip) and resize (bottom-right grip) while editing. Everything snaps to the 4-column grid.
function wDrag(grid){
  var GAP=6;
  function cell(){ var w=grid.clientWidth; return {cw:(w-GAP*7)/8+GAP, rh:parseFloat(getComputedStyle(grid).gridAutoRows)+GAP}; }
  grid.querySelectorAll(".wg").forEach(function(g){
    var i=+g.getAttribute("data-wi"), x=S.widgets[i], rs=g.querySelector(".wrs"), mv=g.querySelector(".wmv"), lab=g.querySelector(".wsz");
    rs.addEventListener("pointerdown", function(e){ e.preventDefault(); e.stopPropagation(); rs.setPointerCapture(e.pointerId);
      var c=cell(), w0=x.w, h0=x.h, x0=e.clientX, y0=e.clientY; g.classList.add("sizing");
      var mvF=function(ev){ var nw=Math.round(w0+(ev.clientX-x0)/c.cw), nh=Math.round(h0+(ev.clientY-y0)/c.rh); var o={id:x.id,w:nw,h:nh}; wClamp(o);
        if(o.w!==x.w||o.h!==x.h){ x.w=o.w; x.h=o.h; g.style.gridColumn="span "+x.w; g.style.gridRow="span "+x.h; lab.textContent=x.w+"×"+x.h; N.vibrate(10); } };
      var upF=function(){ rs.removeEventListener("pointermove",mvF); rs.removeEventListener("pointerup",upF); rs.removeEventListener("pointercancel",upF); g.classList.remove("sizing"); saveS(); render(); };
      rs.addEventListener("pointermove",mvF); rs.addEventListener("pointerup",upF); rs.addEventListener("pointercancel",upF);
    });
    mv.addEventListener("pointerdown", function(e){ e.preventDefault(); e.stopPropagation(); g.classList.add("moving");
      var vw=document.getElementById("view"), lastY=e.clientY, scr=setInterval(function(){ var r=vw.getBoundingClientRect(); if(lastY<r.top+60) vw.scrollTop-=12; else if(lastY>r.bottom-140) vw.scrollTop+=12; },30);
      var mvF=function(ev){ lastY=ev.clientY; var t=document.elementFromPoint(ev.clientX, ev.clientY);
        var tg=t&&t.closest(".wg"); if(!tg||tg===g||tg.parentNode!==grid) return;
        var kids=[].slice.call(grid.children), a=kids.indexOf(g), b=kids.indexOf(tg);
        grid.insertBefore(g, a<b?tg.nextSibling:tg); N.vibrate(10); };
      var upF=function(){ clearInterval(scr); window.removeEventListener("pointermove",mvF); window.removeEventListener("pointerup",upF); window.removeEventListener("pointercancel",upF); g.classList.remove("moving");
        var order=[].slice.call(grid.children).map(function(n){ return S.widgets[+n.getAttribute("data-wi")]; });
        // keep hidden (empty) widgets in their old slots at the end of the visible order
        S.widgets.forEach(function(w){ if(order.indexOf(w)<0) order.push(w); });
        S.widgets=order; saveS(); render(); };
      window.addEventListener("pointermove",mvF); window.addEventListener("pointerup",upF); window.addEventListener("pointercancel",upF);
    });
  });
}
function wAddSheet(){
  var en=en_(), qy="";
  function body(){
    var have={}; S.widgets.forEach(function(x){ have[x.id]=1; });
    var ids=Object.keys(WG).filter(function(id){ return !qy || wName(id).toLowerCase().indexOf(qy)>=0; });
    return '<input type="search" id="waQ" placeholder="🔍 '+L2x("Cari widget","Search widgets")+'" value="'+esc(qy)+'" style="width:100%;margin-bottom:6px">'+
      '<div class="chips wacats">'+WCAT.map(function(c){ return '<button class="chip" data-wcat="'+c[0]+'">'+c[1]+' '+esc(en?c[3]:c[2])+'</button>'; }).join("")+'</div>'+
      WCAT.map(function(c){ var l=ids.filter(function(id){ return WG[id].cat===c[0]; }); if(!l.length) return '';
        return '<div class="snl wahd" id="wac_'+c[0]+'">'+c[1]+' '+esc(en?c[3]:c[2])+' <span class="mut tiny">'+l.length+'</span></div>'+l.map(function(id){ var d=WG[id];
          return '<div class="wai"><span class="wi">'+d.ic+'</span><span class="wan"><b>'+esc(wName(id))+'</b><span class="mut tiny">'+(d.sc?L2x("Pintasan","Shortcut"):"Widget")+' · '+d.def[0]+'×'+d.def[1]+(d.cond?' · '+esc(d.cond):'')+'</span></span>'+
            (have[id]?'<span class="badge">✓</span>':'<button class="chip on" data-wadd="'+id+'">＋</button>')+'</div>'; }).join(""); }).join("");
  }
  var ov=showSheet("＋ "+L2x("Tambah widget","Add widget"), body(), function(){ render(); });
  function bind(){ var b=ov.querySelector(".shb");
    b.querySelectorAll("[data-wadd]").forEach(function(x){ x.onclick=function(){ var id=x.getAttribute("data-wadd"), d=WG[id]; S.widgets.push({id:id,w:d.def[0]*2,h:d.def[1]*2}); saveS(); N.vibrate(20); toast("＋ "+wName(id)); var st=b.scrollTop; b.innerHTML=body(); bind(); b.scrollTop=st; }; });
    b.querySelectorAll("[data-wcat]").forEach(function(x){ x.onclick=function(){ var h=b.querySelector("#wac_"+x.getAttribute("data-wcat")); if(h) b.scrollTop=h.offsetTop-b.offsetTop-6; }; });
    var qi=b.querySelector("#waQ"); qi.oninput=function(){ qy=qi.value.trim().toLowerCase(); b.innerHTML=body(); bind(); var n=b.querySelector("#waQ"); n.focus(); n.setSelectionRange(n.value.length,n.value.length); };
  }
  bind();
}

// ---------- finder & links ----------
function finderBtns(){ return '<div class="btns"><button class="btn" data-maps="masjid">🕌 '+T("masjid")+'</button><button class="btn" data-maps="surau">'+T("surau")+'</button><button class="btn" data-maps="restoran halal">🍛 '+L2x("Makanan halal","Halal food")+'</button><button class="btn" data-maps="surau R&R">🛣 '+L2x("Surau R&R lebuh raya","Highway R&R surau")+'</button><button class="btn" data-maps="musolla">🏬 '+L2x("Musolla (pusat beli-belah)","Musolla (malls)")+'</button></div><div class="mut small" style="margin-top:8px">'+(en_()?"Opens Google Maps around your location.":"Membuka Google Maps di sekitar lokasi anda.")+'</div>'; }
function finderCard(){ return '<div class="card"><h3>📍 '+L2x("Cari berdekatan","Find nearby")+'</h3>'+finderBtns()+'</div>'; }
function learnLinksCard(){ return '<div class="card"><h3>📚 '+T("learn")+'</h3><div class="btns"><button class="btn alt" data-go="learn">📚 '+L2x("Panduan & kisah","Guides & stories")+'</button><button class="btn alt" data-go="kids">🧒 '+T("kids")+'</button><button class="btn alt" data-go="asma">✨ '+T("asma")+'</button></div></div>'; }

// ---------- MORE: new settings ----------
function chipSet(attr, cur, opts){ return '<span class="chips cs" style="margin:0">'+opts.map(function(o){ return '<button class="chip '+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</span>'; }
function moreNewCards(){
  var en=en_(), h='';
  if(S.alertStyle==="azan") S.alertStyle="sound";
  h+='<div class="card cmp"><h3>🔔 '+L2x("Makluman & peringatan","Alerts & reminders")+'</h3>'+
   '<div class="set"><span>'+L2x("Gaya makluman waktu","Prayer alert style")+'</span>'+chipSet("data-as2",S.alertStyle,[["sound",L2x("Bunyi","Sound")],["vibrate",L2x("Getar sahaja","Vibrate only")]])+'</div>';
  h+='<div class="set"><span>'+L2x("Peringatan sebelum waktu tamat","Reminder before the time ends")+'</span>'+chipSet("data-endm",S.endMin,[[0,L2x("Tutup","Off")],[10,"10m"],[15,"15m"],[20,"20m"],[30,"30m"]])+'</div>'+
   '<div class="set"><span>'+L2x("Penggera imsak","Imsak alarm")+'</span>'+sw("sImsak",S.imsakOn)+'</div>'+
   (S.imsakOn?'<div class="set"><span class="mut">'+L2x("Imsak bulan Ramadan sahaja","Imsak in Ramadan only")+'</span>'+sw("sImsakR",S.imsakRamadan)+'</div>':'')+
   '<div class="set"><span>'+L2x("Peringatan syuruk (Subuh tamat)","Syuruk reminder (Subuh ends)")+'</span>'+sw("sSyuruk",S.syurukOn)+'</div>'+
   '<div class="set"><span>'+L2x("Penggera Tahajjud (sepertiga malam terakhir)","Tahajjud alarm (last third of the night)")+'</span>'+sw("sTahajjud",S.tahajjud)+'</div>'+
   '<div class="set"><span>'+L2x("Peringatan Al-Ma'thurat pagi & petang","Al-Ma'thurat morning & evening reminder")+'</span>'+sw("sMath",S.mathAlarm)+'</div>'+
   '<div class="set"><span>'+L2x("Peringatan puasa sunat (malam sebelum, 9 PM)","Sunnah fast reminder (night before, 9 PM)")+'</span>'+sw("sFast",S.fastRem)+'</div>'+
   (S.fastRem?'<div class="set"><span class="mut">'+L2x("Jenis","Types")+'</span><span class="chips cs" style="margin:0"><button class="chip '+(S.fastRemT.mk?"on":"")+'" data-ft="mk">'+L2x("Isnin & Khamis","Mon & Thu")+'</button><button class="chip '+(S.fastRemT.bidh?"on":"")+'" data-ft="bidh">Ayyamul Bidh</button><button class="chip '+(S.fastRemT.special?"on":"")+'" data-ft="special">'+L2x("Arafah, Asyura, Syawal","Arafah, Ashura, Syawal")+'</button></span></div>':'')+
   '<div class="set"><span>'+L2x("Papar waktu seterusnya di skrin kunci","Show next prayer on the lock screen")+'</span>'+sw("sLock",S.lockShow)+'</div></div>';
  // adjustments
  h+='<div class="card cmp"><h3>⏱ '+L2x("Pelarasan waktu (minit)","Time adjustment (minutes)")+'</h3><div class="mut tiny" style="margin-bottom:4px">'+L2x("Laraskan supaya sama dengan masjid tempatan anda. Notifikasi dan widget ikut pelarasan ini.","Adjust to match your local masjid. Alerts and the widget follow these.")+'</div>'+
   PR.map(function(k){ var v=(S.adj&&S.adj[k])||0; return '<div class="set"><span>'+T(k)+'</span><span class="row"><button class="chip" data-adj="'+k+'" data-d="-1">−</button><b style="min-width:30px;text-align:center">'+(v>0?"+":"")+v+'</b><button class="chip" data-adj="'+k+'" data-d="1">+</button></span></div>'; }).join("")+
   (adjAny()?'<button class="btn alt full" id="adjReset">⟲ '+L2x("Set semula semua","Reset all")+'</button>':'')+'</div>';
  // location & travel
  var homeTxt=S.home?(S.lat!=null?Math.round(distKm(S.home.lat,S.home.lon,S.lat,S.lon))+" km "+L2x("dari rumah","from home"):L2x("ditetapkan","set")):L2x("belum ditetapkan","not set");
  h+='<div class="card cmp"><h3>🌍 '+L2x("Lokasi & perjalanan","Location & travel")+'</h3>'+
   '<div class="set"><span>'+L2x("Sumber waktu","Prayer time source")+'</span>'+chipSet("data-lm",S.locMode,[["auto","Auto"],["my","Malaysia (JAKIM)"],["overseas",L2x("Luar negara","Overseas")]])+'</div>'+
   '<div class="mut tiny" style="margin:-2px 0 6px">'+(overseasNow()?L2x("Sekarang: waktu dikira untuk lokasi anda (zon waktu telefon).","Now: times are calculated for your location (phone time zone)."):L2x("Sekarang: waktu JAKIM bagi zon ","Now: JAKIM times for zone ")+esc(S.zone))+(S.locMode==="overseas"&&S.lat==null?' · '+L2x("perlukan lokasi","needs location"):'')+'</div>'+
   ((overseasNow()||S.locMode==="overseas")?'<div class="set"><span>'+L2x("Kaedah kiraan","Calculation method")+'</span><select id="sMeth" style="max-width:60%;padding:6px">'+Object.keys(METHODS).map(function(k){ return '<option value="'+k+'" '+(S.calcMethod===k?"selected":"")+'>'+METHODS[k][3]+'</option>'; }).join("")+'</select></div>':'')+
   '<div class="set"><span>'+L2x("Rumah: ","Home: ")+'<b class="mut">'+homeTxt+'</b></span><button class="chip" id="sHome">📍 '+L2x("Tetapkan di sini","Set here")+'</button></div>'+
   '<div class="set"><span>'+L2x("Kesan musafir automatik (≥ 81 km)","Detect travel automatically (≥ 81 km)")+'</span>'+sw("sMusA",S.musafirAuto)+'</div>'+
   '<div class="set"><span>'+L2x("Saya sedang musafir (manual)","I am travelling (manual)")+'</span>'+sw("sMusOn",S.musafirOn)+'</div></div>';
  // offline data
  var y=new Date().getFullYear(), st=function(yy){ var c=load(cacheKey(S.zone,yy),null); return c&&c.days?Object.keys(c.days).length+L2x(" hari"," days")+" · "+new Date(c.fetched).toLocaleDateString(locTag(),{day:"numeric",month:"short"}):L2x("belum dimuat turun","not downloaded"); };
  h+='<div class="card cmp"><h3>💾 '+L2x("Waktu solat luar talian","Offline prayer times")+'</h3><div class="mut tiny" style="margin-bottom:4px">'+L2x("Waktu JAKIM disimpan setahun penuh dalam telefon, jadi ia berfungsi tanpa internet.","JAKIM times are kept for the whole year on the phone, so they work without internet.")+'</div>'+
   '<div class="set"><span>'+esc(S.zone)+' '+y+'</span><b class="mut small">'+st(y)+'</b></div><div class="set"><span>'+esc(S.zone)+' '+(y+1)+'</span><b class="mut small">'+st(y+1)+'</b></div>'+
   '<div class="btns"><button class="chip" id="offNow">↻ '+y+'</button><button class="chip" id="offNext">⬇ '+(y+1)+'</button></div></div>';
  // uzur
  h+='<div class="card cmp"><h3>🌸 '+L2x("Mod uzur","Uzur mode")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2x("Haid/nifas menjeda makluman solat dan menunjukkan amalan yang masih boleh dibuat. Sakit menunjukkan panduan solat orang sakit (makluman tetap berjalan).","Haid/nifas pauses prayer alerts and shows what you can still do. Sick shows how to pray when ill (alerts keep running).")+'</div>'+
   '<div class="set"><span>'+L2x("Haid / nifas","Haid / nifas")+'</span>'+chipSet("data-hd",S.pauseMode==="haid"?"on":"",[[7,"7 "+L2x("hari","days")],[10,"10"],[15,"15"]])+'</div>'+
   '<div class="btns"><button class="chip '+(S.pauseMode==="sakit"?"on":"")+'" id="pzSick">🏥 '+L2x("Sakit","Sick")+'</button>'+(S.pauseMode?'<button class="chip" id="pzEnd">✓ '+L2x("Tamatkan mod","End mode")+'</button>':'')+'</div>'+
   (S.pauseMode==="haid"?'<div class="mut small" style="margin-top:6px">'+L2x("Dijeda sehingga ","Paused until ")+new Date(S.pauseUntil).toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"})+'</div>':'')+'</div>';
  // display
  h+='<div class="card cmp"><h3>🖥 '+L2x("Paparan","Display")+'</h3>'+
   '<div class="set"><span>'+L2x("Saiz teks","Text size")+'</span>'+chipSet("data-tz",S.textZoom,[[85,"A−"],[100,"A"],[115,"A+"],[130,"A++"],[150,"A+++"]])+'</div>'+
   '<div class="set"><span>'+L2x("Tema malam automatik (10 PM hingga syuruk)","Automatic night theme (10 PM to sunrise)")+'</span>'+sw("sNight",S.autoNight)+'</div>'+
   '<div class="set"><span>'+L2x("Sentiasa papar kad Ramadan","Always show the Ramadan card")+'</span>'+sw("sRam",S.ramadanForce)+'</div>'+
   '<div class="set"><span>👓 '+L2x("Mod warga emas","Senior mode")+'<div class="mut tiny">'+L2x("Teks besar, warna terang dan empat butang besar di Utama","Large text, strong contrast and four big buttons on Home")+'</div></span>'+sw("sSenior",S.senior)+'</div></div>';
  // backup
  h+='<div class="card cmp"><h3>🗄 '+L2x("Sandaran","Backup")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2x("Simpan tetapan, kiraan zikir, kegemaran dan puasa ganti ke fail, kemudian pulihkan di telefon baharu.","Save settings, zikir counts, favourites and make-up fasts to a file, then restore on a new phone.")+'</div><div class="btns"><button class="btn alt" id="bkSave">⬇ '+L2x("Simpan sandaran","Save backup")+'</button><button class="btn alt" id="bkOpen">⬆ '+L2x("Pulihkan","Restore")+'</button></div></div>';
  return h;
}
function bindMoreNew(el){
  var q=function(s){ return el.querySelector(s); }, on2=function(id,fn){ var x=q("#"+id); if(x) x.onchange=function(){ fn(this.checked); saveS(); render(); }; };
  el.querySelectorAll("[data-as2]").forEach(function(b){ b.onclick=function(){ S.alertStyle=b.getAttribute("data-as2"); saveS(); render(); }; });
  el.querySelectorAll("[data-endm]").forEach(function(b){ b.onclick=function(){ S.endMin=+b.getAttribute("data-endm"); saveS(); render(); }; });
  on2("sImsak",function(v){ S.imsakOn=v; }); on2("sImsakR",function(v){ S.imsakRamadan=v; }); on2("sSyuruk",function(v){ S.syurukOn=v; });
  on2("sTahajjud",function(v){ S.tahajjud=v; }); on2("sMath",function(v){ S.mathAlarm=v; }); on2("sFast",function(v){ S.fastRem=v; }); on2("sLock",function(v){ S.lockShow=v; });
  el.querySelectorAll("[data-ft]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-ft"); S.fastRemT[k]=!S.fastRemT[k]; saveS(); render(); }; });
  el.querySelectorAll("[data-adj]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-adj"); S.adj=S.adj||{}; S.adj[k]=Math.max(-15,Math.min(15,(S.adj[k]||0)+(+b.getAttribute("data-d")))); saveS(); render(); }; });
  var ar=q("#adjReset"); if(ar) ar.onclick=function(){ S.adj={subuh:0,zohor:0,asar:0,maghrib:0,isyak:0}; saveS(); render(); };
  el.querySelectorAll("[data-lm]").forEach(function(b){ b.onclick=function(){ S.locMode=b.getAttribute("data-lm"); saveS(); if(S.locMode==="overseas" && S.lat==null) askLocation(false); render(); }; });
  var sm=q("#sMeth"); if(sm) sm.onchange=function(){ S.calcMethod=this.value; saveS(); render(); };
  q("#sHome").onclick=function(){ var hl=function(r){ off("location",hl); if(r.error){ toast(L2x("Lokasi tidak tersedia","Location unavailable")); return; } S.home={lat:r.lat,lon:r.lon}; S.lat=r.lat; S.lon=r.lon; saveS(); toast(L2x("Lokasi rumah disimpan","Home location saved")); render(); };
    if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } }; on("perm",hp); N.requestPerm("location"); } };
  on2("sMusA",function(v){ S.musafirAuto=v; }); on2("sMusOn",function(v){ S.musafirOn=v; });
  q("#offNow").onclick=function(){ ensureData(true); };
  q("#offNext").onclick=function(){ var y=new Date().getFullYear()+1; fetchJakim(S.zone, y, function(ok){ toast(ok?L2x("Waktu "+y+" dimuat turun","Times for "+y+" downloaded"):L2x("JAKIM belum menerbitkan "+y+" atau tiada internet","JAKIM has not published "+y+" yet, or no internet")); if(ok){ pushSchedule(); render(); } }); };
  el.querySelectorAll("[data-hd]").forEach(function(b){ b.onclick=function(){ S.pauseMode="haid"; S.pauseUntil=Date.now()+(+b.getAttribute("data-hd"))*864e5; saveS(); toast(L2x("Makluman solat dijeda","Prayer alerts paused")); render(); }; });
  q("#pzSick").onclick=function(){ S.pauseMode=S.pauseMode==="sakit"?null:"sakit"; S.pauseUntil=0; saveS(); render(); };
  var pe=q("#pzEnd"); if(pe) pe.onclick=function(){ S.pauseMode=null; S.pauseUntil=0; saveS(); render(); };
  el.querySelectorAll("[data-tz]").forEach(function(b){ b.onclick=function(){ S.textZoom=+b.getAttribute("data-tz"); saveS(); applyZoom(); render(); }; });
  on2("sRumi",function(v){ S.showRumi=v; }); on2("sNight",function(v){ S.autoNight=v; applyTheme(); }); on2("sRam",function(v){ S.ramadanForce=v; });
  q("#vList").onclick=function(){ var box=q("#vBox"); box.innerHTML='<div class="mut small">…</div>';
    var hv=function(list){ off("voices",hv); if(!list.length){ box.innerHTML='<div class="mut small" style="padding:4px 0">'+L2x("Tiada suara Arab dipasang. Buka Tetapan telefon → Teks ke pertuturan → Enjin Google → Pasang data suara → Arab.","No Arabic voice installed. Open phone Settings → Text-to-speech → Google engine → Install voice data → Arabic.")+'</div>'; return; }
      box.innerHTML='<div class="chips cs" style="padding:4px 0 8px;justify-content:flex-start">'+list.map(function(v,i){ return '<button class="chip '+(S.voice===v.n?"on":"")+'" data-vn="'+esc(v.n)+'">'+L2x("Suara ","Voice ")+(i+1)+(v.male?" ♂":"")+(v.net?" ☁":"")+'</button>'; }).join("")+'</div><div class="mut tiny">♂ = '+L2x("dikesan sebagai lelaki (anggaran nama)","detected as male (guessed from its name)")+' · ☁ = '+L2x("perlukan internet","needs internet")+'. '+L2x("Ketik untuk dengar dan pilih.","Tap to listen and choose.")+'</div>';
      box.querySelectorAll("[data-vn]").forEach(function(b){ b.onclick=function(){ S.voice=b.getAttribute("data-vn"); saveS(); if(N.setVoice) N.setVoice(S.voice, S.pitch||0.8); box.querySelectorAll("[data-vn]").forEach(function(x){ x.classList.toggle("on", x===b); }); speakAr("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"); }; }); };
    on("voices",hv);
    if(window.Native && N.getVoices) N.getVoices();
    else { var vs=[]; try{ vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); }).map(function(v){ return {n:v.name, male:/male/i.test(v.name)&&!/female/i.test(v.name), net:!v.localService}; }); }catch(e){} hv(vs); } };
  el.querySelectorAll("[data-pitch]").forEach(function(b){ b.onclick=function(){ S.pitch=+b.getAttribute("data-pitch"); saveS(); if(N.setVoice) N.setVoice(S.voice||"", S.pitch); render(); speakAr("سُبْحَانَ اللَّهِ"); }; });
  q("#bkSave").onclick=makeBackup; q("#bkOpen").onclick=openBackup;
}

// ---------- SUNAT hub: Zikir / Doa / Ma'thurat / Amal ----------
var SUBNAV=[["zikir","📿","Zikir","Zikir"],["doa","🤲","Doa","Doa"],["mathurat","📖","Ma'thurat","Ma'thurat"],["amal","🌙","Amal","Amal"]];
function vSunatHub(el){
  var old=document.getElementById("subnav"); if(old) old.remove();
  var f={zikir:vZikir, doa:vDoa, mathurat:vMathurat, amal:vSunat}[sunPage]||vZikir;
  var sn=document.createElement("div"); sn.id="subnav";
  sn.innerHTML=SUBNAV.map(function(x){ return '<button class="'+(sunPage===x[0]?"on":"")+'" data-sp="'+x[0]+'"><span>'+x[1]+'</span>'+(en_()?x[3]:x[2])+'</button>'; }).join("");
  document.getElementById("app").appendChild(sn);
  sn.style.bottom=document.getElementById("nav").offsetHeight+"px";
  sn.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick=function(){ go(b.getAttribute("data-sp")); }; });
  el.classList.add("hasSub");
  f(el);
}
// ---------- LEARN ----------
var LEARN=[["wudhu","💧","Cara berwuduk","How to make wudhu"],["x_mandi","🚿","Mandi wajib","Obligatory bath (ghusl)"],["x_tayammum","🏜","Tayammum","Tayammum"],["x_istinja","🚽","Istinjak & najis","Istinja' & najis"],["solat","🧎","Cara solat","How to pray"],["bacaan","📜","Bacaan dalam solat","Readings in solat"],["g_istikharah","🧭","Solat Istikharah","Istikharah prayer"],["g_hajat","🤲","Solat Hajat","Hajat prayer"],["x_jenazah","🕊","Solat jenazah","Funeral prayer"],["x_raya","🌙","Solat Hari Raya","Eid prayer"],["x_gerhana","🌘","Solat gerhana","Eclipse prayer"],["sakit","🏥","Solat ketika sakit","Praying when sick"],["musafir","🚗","Solat musafir","Praying when travelling"],["haid","🌸","Ketika haid & nifas","During haid & nifas"],["nabi","🌿","Kisah 25 Nabi","The 25 Prophets"],["n40","📜","40 Hadis Nawawi","40 Hadith Nawawi"],["sahabat","🏅","Kisah Sahabat","Companion stories"],["hijaiyah","🔤","Huruf Hijaiyah","Arabic letters"],["qwords","📗","Kata al-Quran","Quran words"],["askai","💬","Tanya AI","Ask AI"],["glosari","📖","Glosari istilah","Glossary"]];
function poseSvg(p){
  var L=function(a,b,c,d){ return '<line x1="'+a+'" y1="'+b+'" x2="'+c+'" y2="'+d+'"/>'; }, H=function(x,y){ return '<circle cx="'+x+'" cy="'+y+'" r="5" fill="currentColor"/>'; }, g='';
  if(p==="stand") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,26,36)+L(32,19,38,36);
  else if(p==="takbir") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,24,22)+L(24,22,25,11)+L(32,19,40,22)+L(40,22,39,11);
  else if(p==="qiyam") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,26,28)+L(26,28,36,28);
  else if(p==="rukuk") g=H(14,30)+L(19,31,42,31)+L(42,31,42,58)+L(23,31,40,44);
  else if(p==="sujud") g=H(12,53)+L(17,51,40,40)+L(40,40,44,56)+L(44,56,56,57)+L(22,49,17,58);
  else if(p==="sit") g=H(36,16)+L(36,22,36,46)+L(36,46,20,52)+L(20,56,46,57)+L(36,28,24,46);
  else if(p==="salam") g='<circle cx="40" cy="16" r="5" fill="currentColor"/>'+L(36,22,36,46)+L(36,46,20,52)+L(20,56,46,57)+L(36,28,24,46)+'<path d="M48 10 l6 4 l-6 4" fill="none"/>';
  return '<svg class="pose" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">'+g+'<line x1="4" y1="60" x2="60" y2="60" stroke-width="1.5" opacity=".4"/></svg>';
}
function arBlock(ar, ms, en, src){ return '<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(L2x(ms,en))+'</div>'+(src?'<div class="src">'+srcHtml(src)+'</div>':'')+'<div class="tools">'+sayBtn(ar)+shareBtn({ar:ar,text:L2x(ms,en),src:src||""})+'</div>'; }
// ---------- HALAL CHECKER (lazy-loaded; no offline OCR since 0.39.0, photos go to the online AI) ----------
var halalReady=false, halalAuto=null;
function vHalal(el){
  var start=function(){ try{ var au=halalAuto; halalAuto=null; HalalView(el,{S:S, N:N, save:save, load:load, toast:toast, esc:esc, L2x:L2x, on:on, off:off, closeOverlay:closeOverlay, showSheet:showSheet, appRender:function(){ render(); }, fetch:nFetch, auto:au, IbFold:IbFold}); }catch(err){ el.innerHTML='<div class="card">'+L2x("Penyemak halal gagal dibuka","The halal checker could not open")+'</div>'; } };
  if(halalReady){ start(); return; }
  el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="halal/halal.css"; document.head.appendChild(lk); }
  var files=["halal/halal_db.js","halal/halal_ai.js","halal/barcode.js","halal/recipe_subs.js","halal/recipe.js","halal/halal.js"], i=0;
  var next=function(){ if(i>=files.length){ halalReady=true; if(view==="halal"||(view==="alat"&&SUB2.alat==="halal")) start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ el.innerHTML='<div class="card">'+L2x("Penyemak halal gagal dimuatkan","The halal checker could not load")+'</div>'; }; document.body.appendChild(sc); };
  next();
}
// ---------- SIRAH (lazy-loaded, all files bundled in the app) ----------
var sirahReady=false, sirahLoading=false;
function openSirah(kids, jump){
  if(sirahLoading) return;
  var start=function(){ try{ SirahOpen(kids,{jump:jump||null, S:S, saveS:saveS, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, speakAr:speakAr, shareCard:shareCard, on:on, off:off, onExit:function(){ render(); }}); }catch(err){ closeOverlay(); toast(L2x("Garis masa Sirah gagal dibuka","The Sirah timeline could not open")); } };
  if(sirahReady){ start(); return; }
  sirahLoading=true; var ov=document.getElementById("overlay"); ov.className="sirahov"; ov.innerHTML='<div class="sk-load">'+L2x("Menyediakan padang pasir…","Preparing the desert…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="sirah.css"; document.head.appendChild(lk);
  var files=["sirah_art.js","sirah_data_0.js","sirah_data_1.js","sirah_data_2.js","sirah_data_3.js","sirah.js"], i=0;
  var next=function(){ if(i>=files.length){ sirahReady=true; sirahLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ sirahLoading=false; closeOverlay(); toast(L2x("Garis masa Sirah gagal dimuatkan","The Sirah timeline could not load")); }; document.body.appendChild(sc); };
  next();
}
// ---------- HAJI & UMRAH 3D (lazy-loaded; Three.js and every asset bundled in the app) ----------
var hajjReady=false, hajjLoading=false;
function openHajj(){
  if(hajjLoading) return;
  var start=function(){ try{ HajjOpen({S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, speakAr:speakAr, on:on, off:off, hijri:function(){ return hijriOf(new Date()); }, tawaf:function(){ openTawaf(); }, onExit:function(){ render(); }}); }catch(err){ closeOverlay(); toast(L2x("Panduan Haji & Umrah gagal dibuka","The Hajj & Umrah guide could not open")); } };
  if(hajjReady){ start(); return; }
  hajjLoading=true; var ov=document.getElementById("overlay"); ov.className="hajjov"; ov.innerHTML='<div class="sk-load hj-load">'+L2x("Menyediakan Tanah Suci…","Preparing the Holy Land…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="hajj/hajj.css"; document.head.appendChild(lk);
  var files=["hajj/three.min.js","hajj/hajj_data.js","hajj/hajj_world.js","hajj/hajj.js"], i=0;
  var next=function(){ if(i>=files.length){ hajjReady=true; hajjLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ hajjLoading=false; closeOverlay(); toast(L2x("Panduan Haji & Umrah gagal dimuatkan","The Hajj & Umrah guide could not load")); }; document.body.appendChild(sc); };
  next();
}
// ---------- UMRAH DIY itinerary maker (lazy-loaded; MapLibre bundled, OpenFreeMap tiles when online) ----------
var umrahReady=false, umrahLoading=false;
function openUmrah(){
  if(umrahLoading) return;
  var start=function(){ try{ UmrahOpen({S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, on:on, off:off, fetch:nFetch, openWeb:openWeb, speakAr:speakAr,
    calcDay:calcDay, hijri:function(d){ return hijriOf(d); }, hijriMonth:function(m){ return HIJRI_MONTHS[m-1]; },
    tawaf:function(){ openTawaf(); }, hajj:function(){ openHajj(); }, onExit:function(){ render(); }}); }catch(err){ console.error(err); closeOverlay(); toast(L2x("Umrah DIY gagal dibuka","Umrah DIY could not open")); } };
  if(umrahReady){ start(); return; }
  umrahLoading=true; var ov=document.getElementById("overlay"); ov.className="umov"; ov.innerHTML='<div class="sk-load">'+L2x("Menyediakan perancang umrah…","Preparing the umrah planner…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="umrah/umrah.css"; document.head.appendChild(lk);
  var lk2=document.createElement("link"); lk2.rel="stylesheet"; lk2.href="umrah/maplibre-gl.css"; document.head.appendChild(lk2);
  var files=["umrah/maplibre-gl.js","umrah/umrah_world.js","umrah/umrah_data.js","hajj/hajj_data.js","umrah/umrah_more_data.js","umrah/umrah_more.js","umrah/umrah.js"], i=0;
  if(window.HJ_DOA) files.splice(3,1);
  var next=function(){ if(i>=files.length){ umrahReady=true; umrahLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ if(/maplibre|hajj_data/.test(sc.src)){ next(); return; } umrahLoading=false; closeOverlay(); toast(L2x("Umrah DIY gagal dimuatkan","Umrah DIY could not load")); }; document.body.appendChild(sc); };
  next();
}
function umrahHero(){ return '<button class="bnHero bn-umrah" data-umrah="1"><span class="bnSc"></span><span class="bnI">🧳</span><span class="shTxt"><b>'+L2x("Umrah DIY: rancang sendiri","Umrah DIY: plan it yourself")+'</b><small>'+L2x("Bajet Asas, Biasa atau Selesa. Penerbangan, hotel, makanan, ziarah, peta dan jadual lengkap","Basic, Normal or Comfort budget. Flights, hotels, food, ziarah, a map and a full itinerary")+'</small></span><span class="shGo">›</span></button>'; }
// 0.24.0 banner heroes, same size as the Haji 3D hero
function kidsHero(){ return '<button class="bnHero bn-kids" data-go="kids"><span class="bnSc"></span><span class="bnI">🧒</span><span class="shTxt"><b>'+L2x("Mod kanak-kanak","Kids mode")+'</b><small>'+L2x("Bintang, lencana, kisah dan permainan untuk anak","Stars, badges, stories and games for children")+'</small></span><span class="shGo">›</span></button>'; }
function iqraHero(){ return '<button class="bnHero bn-iqra" data-learn="iqra"><span class="bnSc"></span><span class="bnI">📗</span><span class="shTxt"><b>'+L2x("Asas Membaca al-Quran (Tahap 1–6)","Learn to Read the Quran (Levels 1–6)")+'</b><small>'+L2x("Seperti Iqra\': dari huruf pertama hingga membaca ayat","Like Iqra\': from the first letters to reading ayat")+'</small></span><span class="shGo">›</span></button>'; }
function radioHero(){ return '<button class="bnHero bn-radio" data-learn="radio"><span class="bnSc"></span><span class="bnI">📻</span><span class="shTxt"><b>'+L2x("Radio Islam","Islamic radio")+'</b><small>'+L2x("Stesen Al-Quran, kuliah & nasyid dari seluruh dunia","Quran, talks & nasheed stations worldwide")+'</small></span><span class="shGo">›</span></button>'; }
function podHero(){ return '<button class="bnHero bn-pod" data-learn="podcast"><span class="bnSc"></span><span class="bnI">🎙</span><span class="shTxt"><b>'+L2x("Podcast","Podcast")+'</b><small>'+L2x("82 penceramah lelaki & wanita, ikut topik. Langgan & dengar","82 speakers, men & women, by topic. Subscribe & listen")+'</small></span><span class="shGo">›</span></button>'; }
function liveHero(){ return '<button class="bnHero bn-live" data-learn="live"><span class="bnSc"></span><span class="bnI">📺</span><span class="shTxt"><b>'+L2x("Siaran langsung Makkah & Madinah","Live from Makkah & Madinah")+'</b><small>'+L2x("Masjidil Haram dan Masjid Nabawi, 24 jam","Masjid al-Haram and the Prophet\'s Mosque, 24 hours")+'</small></span><span class="shGo">›</span></button>'; }
// PKSK (Pentaksiran Kemasukan Sekolah Khusus) notes and practice exam: a free, offline page bundled in pksk/pksk.html, opened in a full-screen frame
function tajwidHero(){ return '<button class="bnHero bn-tajwid" data-learn="tajwid"><span class="bnSc"></span><span class="bnI">🎨</span><span class="shTxt"><b>'+L2x("Tajwid","Tajweed")+'</b><small>'+L2x("Hukum nun mati, mim mati, mad dan lain-lain, berwarna dan boleh didengar","Rules of nun and mim sakinah, madd and more, colour-coded with audio")+'</small></span><span class="shGo">›</span></button>'; }
// 0.2.4: Fiqh Syafi'i 3D mind map (fiqh/fiqh.js, three.js from hajj/), opened full screen like Haji & Umrah 3D
function fiqhHero(){ return '<button class="bnHero bn-fiqh" data-fiqh="-1"><span class="bnSc"></span><span class="bnI">⚖️</span><span class="shTxt"><b>'+L2x("Fiqh Syafi'i: peta minda 3D","Shafi'i Fiqh: 3D mind map")+'</b><small>'+L2x("Ibadat, Muamalat, Munakahat dan Jinayat. Ayat dan hadis untuk setiap topik","Worship, transactions, marriage and criminal law. Ayat and hadith for every topic")+'</small></span><span class="shGo">›</span></button>'; }
var fiqhReady=false, fiqhLoading=false;
function openFiqh(rubu){
  if(fiqhLoading) return;
  var start=function(){ try{ FiqhOpen({rubu:rubu, S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, on:on, off:off, onExit:function(){ render(); }}); }catch(err){ console.error(err); closeOverlay(); toast(L2x("Fiqh Syafi'i gagal dibuka","Shafi'i Fiqh could not open")); } };
  if(fiqhReady){ start(); return; }
  fiqhLoading=true; var ov=document.getElementById("overlay"); ov.className="fqov"; ov.innerHTML='<div class="sk-load" style="color:#5d4a1f">'+L2x("Menyusun peta minda…","Building the mind map…")+'</div>'; ov._close=function(){};
  if(!document.getElementById("fqCss")){ var lk=document.createElement("link"); lk.id="fqCss"; lk.rel="stylesheet"; lk.href="fiqh/fiqh.css"; document.head.appendChild(lk); }
  var files=(window.THREE?[]:["hajj/three.min.js"]).concat(["fiqh/fiqh_data.js","fiqh/fiqh.js"]);
  loadJs(files, function(){ fiqhReady=true; fiqhLoading=false; start(); }, function(){ fiqhLoading=false; closeOverlay(); toast(L2x("Fiqh Syafi'i gagal dimuatkan","Shafi'i Fiqh could not load")); });
}
// 0.2.5: the four rubu' as a 2 x 2 grid under the Fiqh hero (Belajar page)
function fiqhCard(){
  return '<div class="card"><h3>⚖️ '+L2x("Peta minda Fiqh Syafi'i","Shafi'i Fiqh mind map")+'</h3><div class="small" style="line-height:1.55">'+L2x("Empat rubu' (Ibadat, Muamalat, Munakahat, Jinayat) berkembang dari tengah ke setiap kitab, bab dan subtopik. Setiap topik memaparkan ayat al-Quran dan hadis yang menjadi dalilnya, dengan butang main. Kandungan penuh boleh dibuka di tepi.","Four quarters (Worship, Transactions, Marriage, Criminal law) open from the centre into every book, chapter and subtopic. Each topic shows the Quran verses and hadith it rests on, with a play button. The full contents open from the side.")+'</div>'+
    '<div class="fq2x2">'+[["0","🕌","Ibadat","Worship"],["1","🤝","Muamalat","Transactions"],["2","💍","Munakahat","Marriage"],["3","⚖️","Jinayat","Criminal law"]].map(function(x){ return '<button class="btn alt" data-fiqh="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div></div>';
}
function pkskHero(){ return '<button class="bnHero bn-pksk" data-pksk="1"><span class="bnSc"></span><span class="bnI">📝</span><span class="shTxt"><b>'+L2x("Latihan PKSK (Tingkatan 1)","PKSK practice exam (Form 1)")+'</b><small>'+L2x("Nota & soalan latihan Bahagian A, B dan C. Percuma untuk semua","Notes & practice questions for Parts A, B and C. Free for everyone")+'</small></span><span class="shGo">›</span></button>'; }
function openPksk(){
  var ov=document.getElementById("overlay");
  ov.className="pkskov";
  ov.innerHTML='<div class="pkBar"><button class="pkX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Latihan PKSK","PKSK practice exam")+'</b></div><iframe class="pkF" src="pksk/pksk.html" title="PKSK"></iframe>';
  var f=ov.querySelector(".pkF");
  var close=function(){ closeOverlay(); render(); };
  ov._close=function(){ try{ var w=f.contentWindow; if(w && w.PKSKBack && w.PKSKBack()) return; }catch(e){} close(); };
  ov.querySelector(".pkX").onclick=close;
}
function quizHero(){ return '<button class="bnHero bn-quiz" data-xquiz="1"><span class="bnSc"></span><span class="bnI">🧠</span><span class="shTxt"><b>'+L2x("Kuiz Islam","Islamic quiz")+'</b><small>'+L2x("Rukun, al-Quran, para nabi, fiqh asas dan sirah. 10 soalan setiap pusingan","Pillars, Quran, prophets, basic fiqh and sirah. 10 questions a round")+'</small></span><span class="shGo">›</span></button>'; }
function hajjHero(kids){ return '<button class="hajjHero'+(kids?' kids':'')+'" data-hajj="1"><span class="hhSky"></span><span class="hhGround"></span><span class="hhKaabah"></span><span class="shTxt"><b>'+(kids?L2x("Jom ke Makkah!","Let's go to Makkah!"):L2x("Haji & Umrah 3D","Hajj & Umrah 3D"))+'</b><small>'+(kids?L2x("Gerakkan watak comel, tawaf, sa\'ie dan lontar jamrah","Walk a cute pilgrim, do tawaf, sa\'i and stone the jamarat"):L2x("Miqat hingga tawaf wada\', dan ziarah Masjid Nabawi. Ikut langkah atau jelajah bebas","Miqat to the farewell tawaf, plus the Prophet\'s Mosque. Step by step or free explore"))+'</small></span><span class="shGo">›</span></button>'; }
function vLearn0(el){
  if(S.kidLock && (!learnPg || learnFrom!=="kids")){ learnPg=null; view="kids"; vKids(el); return; }
  var en=en_(), html='';
  if(!learnPg){
    html+='<button class="sirahHero" data-sirah="adult"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>'+L2x("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ")+'</b><small>'+L2x("Garis masa interaktif, dari Tahun Gajah hingga wafat","Interactive timeline, from the Year of the Elephant to his passing")+'</small></span><span class="shGo">›</span></button>';
    html+=hajjHero(false);
    html+=umrahHero();
    html+='<div class="lchips"><button class="lchip" data-tawaf="1">🔢 '+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</button><button class="lchip" data-prac="1">🔊 '+L2x("Latihan solat berpandu","Guided solat practice")+'</button><button class="lchip" data-learn="live">📺 '+L2x("Siaran langsung Makkah & Madinah","Live Makkah & Madinah")+'</button><button class="lchip" data-learn="askai">💬 '+L2x("Tanya AI tentang Islam","Ask AI about Islam")+'</button></div>';
    html+=radioHero()+podHero();
    html+='<div class="card"><h3>📚 '+T("learn")+'</h3><div class="lgrid">'+LEARN.map(function(x){ return '<button class="qt" data-lp="'+x[0]+'"><span>'+x[1]+'</span>'+(en?x[3]:x[2])+'</button>'; }).join("")+
      '<button class="qt" data-go="asma"><span>✨</span>'+T("asma")+'</button><button class="qt" data-go="kids"><span>🧒</span>'+T("kids")+'</button></div></div>';
    html+='<div class="mut small" style="padding:0 4px 12px">'+L2x("Kandungan prototaip mengikut mazhab Syafi'i: sila dapatkan semakan ustaz.","Prototype content following the Shafi'i school: please have it reviewed by an ustaz.")+'</div>';
    el.innerHTML=html;
    el.querySelectorAll("[data-lp]").forEach(function(b){ b.onclick=function(){ learnPg=b.getAttribute("data-lp"); render(); document.getElementById("view").scrollTop=0; }; });
    return;
  }
  if(learnPg==="radio"||learnPg==="podcast"){ if(window.IbMedia) IbMedia.render(el, learnPg); else el.innerHTML='<div class="card mut">…</div>'; return; }
  if(learnPg==="live"){ vLive(el); return; }
  if(learnPg==="tajwid"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Belajar","Study")+'</button><b>🎨 '+L2x("Tajwid","Tajweed")+'</b><span></span></div><div id="bcBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.BacaanView && BacaanView.back()) return; learnBack(); }; vBacaan(el.querySelector("#bcBox"), "tajwid"); return; }
  if(learnPg==="iqra"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+T("learn")+'</button><b>📗 '+L2x("Asas Membaca","Learn to Read")+'</b><span></span></div><div id="bcBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.BacaanView && BacaanView.back()) return; learnBack(); }; vBacaan(el.querySelector("#bcBox"), "iqra"); return; }
  if(learnPg==="jamma"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+(learnFrom==="kids"?T("kids"):T("learn"))+'</button><b>📖 Juz Amma</b><span></span></div><div id="jmBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.QuranView && QuranView.kidsBack()) return; learnBack(); }; vJamma(el.querySelector("#jmBox")); return; }
  var meta=LEARN.filter(function(x){return x[0]===learnPg;})[0]||["","","",""];
  if(ILMU_PG[learnPg]){
    el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+(learnFrom==="kids"?T("kids"):T("learn"))+'</button><b>'+meta[1]+' '+esc(en?meta[3]:meta[2])+'</b><span></span></div><div id="ilmuBox"></div>';
    el.querySelector("#lBack").onclick=learnBack; vIlmu(el.querySelector("#ilmuBox"), learnPg); return;
  }
  html+='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+T("learn")+'</button><b>'+meta[1]+' '+esc(en?meta[3]:meta[2])+'</b><span></span></div>';
  if(learnPg==="wudhu"){
    html+=WUDHU_STEPS.map(function(s,i){ return '<div class="card lstep"><div class="row"><b>'+(i+1)+'. '+s.ic+'</b><span class="badge '+(s.f?"":"warn")+'">'+(s.f?L2x("Rukun","Obligatory"):L2x("Sunat","Sunnah"))+'</span></div><div>'+glz(esc(L2x(s.ms,s.en)))+'</div>'+
      (s.niat?'<div class="snl" style="margin-top:6px">Niat</div>'+arBlock(s.niat,s.niat_ms,s.niat_en):'')+(s.ar?arBlock(s.ar,s.ar_ms,s.ar_en,s.src):'')+'</div>'; }).join("");
    html+='<div class="card"><h3>⚠️ '+L2x("Batal wuduk","What breaks wudhu")+'</h3><div class="small">'+glz(esc(L2x(WUDHU_BREAK.ms,WUDHU_BREAK.en)))+'</div></div>';
  } else if(learnPg==="solat"){
    html+=SOLAT_STEPS.map(function(s,i){ return '<div class="card lstep row" style="align-items:center;gap:12px">'+poseSvg(s.p)+'<div style="flex:1"><b>'+(i+1)+'.</b> '+glz(esc(L2x(s.ms,s.en)))+'</div></div>'; }).join("");
    html+='<button class="btn gold full" data-prac="1" style="margin-bottom:8px">🔊 '+L2x("Latih solat dengan suara","Practise with the voice")+'</button>';
    html+='<button class="btn alt full" data-lp2="bacaan" style="margin-bottom:12px">📜 '+L2x("Lihat bacaan dalam solat","See the readings in solat")+'</button>';
  } else if(learnPg==="bacaan"){
    html+=BACAAN_SOLAT.map(function(b,i){ return '<div class="card"><h3>'+(i+1)+'. '+esc(L2x(b.t_ms,b.t_en))+'</h3>'+arBlock(b.ar,b.ms,b.en,b.src)+(b.note_ms?'<div class="why">'+glz(esc(L2x(b.note_ms,b.note_en)))+'</div>':'')+'</div>'; }).join("");
  } else if(learnPg.indexOf("g_")===0){
    var g=GUIDE_SPECIAL.filter(function(x){return "g_"+x.id===learnPg;})[0];
    html+='<div class="card"><h3>'+L2x("Langkah","Steps")+'</h3><ol class="ul">'+(en?g.steps_en:g.steps_ms).map(function(s){return '<li>'+glz(esc(s))+'</li>';}).join("")+'</ol></div>';
    html+='<div class="card"><h3>Niat</h3>'+arBlock(g.niat,g.niat_ms,g.niat_en)+'</div>';
    html+='<div class="card"><h3>Doa</h3>'+arBlock(g.doa,g.doa_ms,g.doa_en,g.src)+'</div>';
    html+='<button class="btn gold full" id="lCount" style="margin-bottom:12px">'+L2x("Kira 2 rakaat","Count 2 rakaat")+'</button>';
  } else if(learnPg.indexOf("x_")===0 && GUIDE_MORE[learnPg.slice(2)]){
    var gm=GUIDE_MORE[learnPg.slice(2)], LL=function(x){ return x?esc(L2x(x[0],x[1])):""; };
    gm.parts.forEach(function(pt){
      if(pt.k==="p") html+='<div class="card" style="line-height:1.55">'+glz(LL(pt.t))+'</div>';
      else if(pt.k==="ol"||pt.k==="ul") html+='<div class="card"><h3>'+LL(pt.h)+'</h3><'+pt.k+' class="ul">'+pt.li.map(function(x){ return '<li>'+glz(LL(x))+'</li>'; }).join("")+'</'+pt.k+'></div>';
      else if(pt.k==="ar") html+='<div class="card"><h3>'+LL(pt.h)+'</h3>'+arBlock(pt.ar,pt.m[0],pt.m[1],pt.src)+'</div>';
      else if(pt.k==="tbl") html+='<div class="card"><h3>'+LL(pt.h)+'</h3><div class="gtw"><table class="gtbl"><thead><tr>'+pt.head.map(function(x){ return '<th>'+LL(x)+'</th>'; }).join("")+'</tr></thead><tbody>'+pt.rows.map(function(r){ return '<tr>'+r.map(function(x){ return '<td>'+LL(x)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table></div></div>';
    });
    if(gm.count) html+='<button class="btn gold full" id="lCount" style="margin-bottom:12px">'+L2x("Kira 2 rakaat","Count 2 rakaat")+'</button>';
  } else if(learnPg==="sakit"||learnPg==="musafir"){
    var G=learnPg==="sakit"?SICK_GUIDE:MUSAFIR;
    html+='<div class="card"><ol class="ul">'+(en?G.en:G.ms).map(function(s){return '<li>'+glz(esc(s))+'</li>';}).join("")+'</ol><div class="src">'+srcHtml(G.src)+'</div></div>';
    if(learnPg==="musafir") html+='<div class="card"><div class="small">'+L2x("Tetapkan lokasi rumah di Lagi → Lokasi & perjalanan. Apabila anda lebih 81 km dari rumah, tab Solat memaparkan butang qasar 2 rakaat.","Set your home in More → Location & travel. When you are more than 81 km away, the Solat tab shows 2-rakaat qasar buttons.")+'</div></div>';
  } else if(learnPg==="haid"){
    html+='<div class="card"><h3>'+L2x("Amalan yang masih boleh dilakukan","What you can still do")+'</h3><ul class="ul">'+(en?HAID_AMALAN.en:HAID_AMALAN.ms).map(function(s){return '<li>'+esc(s)+'</li>';}).join("")+'</ul><div class="why">'+glz(esc(L2x(HAID_AMALAN.note_ms,HAID_AMALAN.note_en)))+'</div></div>';
    html+='<div class="card small">'+L2x("Hidupkan Mod uzur di Lagi untuk menjeda makluman solat.","Turn on Uzur mode in More to pause prayer alerts.")+'</div>';
  } else if(learnPg==="nabi" && learnFrom!=="kids" && nabiMode!=="kids"){
    html+=nabiTabs();
    if(!window.NABI_ADULT){ html+='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["ilmu/nabi_adult.js"], function(){ if(learnPg==="nabi") render(); }); }
    else if(nabiMode==="isteri") html+='<div class="mut small" style="margin:0 4px 8px">'+L2x("Ummahatul Mukminin, para isteri Rasulullah ﷺ dan ibu kepada orang beriman (al-Ahzab 33:6).","Ummahat al-Mu'minin, the wives of the Prophet ﷺ and mothers of the believers (al-Ahzab 33:6).")+'</div>'+ISTERI_NABI.map(function(w,i){ return '<details class="card nabiA"><summary>'+nabiArt(w.art,["#3a2a3a","#140c14"])+'<span class="nAt"><b>'+(i+1)+'. '+esc(w.n)+' r.a.</b><small>'+esc(L2x(w.t_ms,w.t_en))+'</small></span></summary><div class="nBody"><p>'+esc(L2x(w.ms,w.en))+'</p><div class="src">'+srcHtml(w.src)+'</div></div></details>'; }).join("");
    else html+=NABI_ADULT.map(function(n,i){ var ps=en_()?n.en:n.ms; return '<details class="card nabiA"><summary>'+nabiArt(n.art,n.sky)+'<span class="nAt"><b>'+(i+1)+'. '+(n.n.indexOf("Muhammad")===0?esc(n.n):L2x("Nabi ","Prophet ")+esc(n.n))+'</b><small>'+esc(L2x(n.l_ms,n.l_en))+'</small></span></summary><div class="nBody">'+ps.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join("")+'<div class="why"><b>'+L2x("Pengajaran","Lesson")+':</b> '+esc(L2x(n.l_ms,n.l_en))+'</div><div class="src">'+srcHtml("Al-Quran "+n.q+(n.h?"; "+n.h:""))+'</div>'+(n.n.indexOf("Muhammad")===0?'<button class="btn gold full g3d" data-sirah="adult" style="margin-top:8px">🐪 '+L2x("Buka Garis masa Sirah","Open the Sirah timeline")+'</button>':'')+'</div></details>'; }).join("");
    html+='<div class="mut tiny" style="padding:6px 4px 12px">'+L2x("Kisah ditulis berpandukan al-Quran dan hadis sahih; riwayat yang lemah disebut sebagai riwayat. Gambar latar hanya objek dan pemandangan, tiada lukisan nabi atau manusia. Perlu semakan ustaz.","Stories follow the Quran and authentic hadith; weaker reports are marked as reports. Backgrounds show objects and scenes only, never prophets or people. Needs an ustaz's review.")+'</div>';
  } else if(learnPg==="nabi"){
    if(learnFrom!=="kids") html+=nabiTabs();
    html+=NABI.map(function(n,i){ return '<details class="card nabi"><summary><b>'+(i+1)+'. '+L2x("Nabi ","Prophet ")+esc(n.n)+'</b></summary><div style="margin-top:6px;line-height:1.55">'+esc(L2x(n.ms,n.en))+'</div><div class="why"><b>'+L2x("Pengajaran","Lesson")+':</b> '+esc(L2x(n.l_ms,n.l_en))+'</div><div class="src">'+srcHtml("Al-Quran "+n.q)+'</div></details>'; }).join("");
  } else if(learnPg==="glosari"){
    html+='<input id="glq" type="search" class="full" placeholder="🔍 '+L2x("Cari istilah","Search a term")+'" style="width:100%;margin-bottom:8px">';
    html+='<div id="glL">'+glossList("")+'</div>';
  }
  el.innerHTML=html;
  el.querySelector("#lBack").onclick=learnBack;
  el.querySelectorAll("[data-nmode]").forEach(function(b){ b.onclick=function(){ nabiMode=b.getAttribute("data-nmode"); render(); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll(".nabiA [data-sirah]").forEach(function(b){ b.onclick=function(){ openSirah(false); }; });
  var lp2=el.querySelector("[data-lp2]"); if(lp2) lp2.onclick=function(){ learnPg=lp2.getAttribute("data-lp2"); render(); document.getElementById("view").scrollTop=0; };
  var lc=el.querySelector("#lCount"); if(lc) lc.onclick=function(){ rk.solat="custom"; rk.customN=2; rk.customName=L2x(meta[2],meta[3]); rk.keep=true; startPraying(2); };
  var gq=el.querySelector("#glq"); if(gq) gq.oninput=function(){ el.querySelector("#glL").innerHTML=glossList(gq.value.trim().toLowerCase()); };
}
function glossList(q){ return GLOSSARY.slice().sort(function(a,b){ return a.w[0].localeCompare(b.w[0]); }).filter(function(g){ return !q || g.w.join(" ").toLowerCase().indexOf(q)>=0 || L2x(g.ms,g.en).toLowerCase().indexOf(q)>=0; }).map(function(g){ return '<div class="card gli"><b>'+esc(g.w[0])+'</b><div class="small">'+esc(L2x(g.ms,g.en))+'</div></div>'; }).join("")||'<div class="mut card">'+L2x("Tiada","None")+'</div>'; }

// ---------- ILMU (0.12.0): 40 Hadith, Kisah Sahabat, Huruf Hijaiyah, Quran words, Ask AI. Pages load on first use ----------
var ILMU_PG={n40:["ilmu/nawawi.js"], sahabat:["ilmu/sahabat.js"], hijaiyah:["ilmu/huruf.js"], qwords:["ilmu/huruf.js"], askai:["halal/halal_ai.js"]}, jsDone={}, ilmuSt={}, learnFrom=null;
function loadJs(list, ok, bad){ var i=0; var next=function(){
  while(i<list.length && (jsDone[list[i]] || (list[i]==="halal/halal_ai.js" && window.HalalAI))) i++;
  if(i>=list.length){ ok(); return; }
  var f=list[i], sc=document.createElement("script"); sc.src=f; sc.onload=function(){ jsDone[f]=1; next(); }; sc.onerror=bad; document.body.appendChild(sc); }; next(); }
// 0.29.0: Kisah 25 Nabi has a kids version (short), an adult version (longer, with scene art) and the wives of the Prophet ﷺ
var nabiMode="adult";
function nabiTabs(){ return '<div class="chips nTabs">'+[["kids","🧒","Ringkas (kanak-kanak)","Short (kids)"],["adult","📖","Dewasa","Adult"],["isteri","🌸","Isteri Nabi ﷺ","Wives of the Prophet ﷺ"]].map(function(x){ return '<button class="chip g3d'+(nabiMode===x[0]?" on":"")+'" data-nmode="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div>'; }
function learnBack(){ if(window.IlmuView) IlmuView.stop(); var k=learnFrom==="kids"; learnFrom=null; learnPg=null; if(k) go("kids"); else render(); }
function vIlmu(bx, pg, sub){
  // 0.26.0 fix: the Tanya AI tab (sub=true) is not a learn page, so it must not wait for learnPg; it used to stay on "Loading…" forever
  var start=function(){ if((!sub && learnPg!==pg) || !document.body.contains(bx)) return; try{ IlmuView(bx, pg, {S:S, N:N, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, load:load, save:save, on:on, off:off,
    srcHtml:srcHtml, speakAr:speakAr, shareCard:shareCard, openWeb:openWeb, st:ilmuSt, open:function(p){ learnPg=p; render(); document.getElementById("view").scrollTop=0; }}); }
    catch(err){ bx.innerHTML='<div class="card">'+L2x("Halaman ini gagal dibuka","This page could not open")+'</div>'; } };
  if(window.IlmuView && (ILMU_PG[pg]||[]).every(function(f){ return jsDone[f] || (f==="halal/halal_ai.js" && window.HalalAI); })){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(["ilmu/ilmu.js"].concat(ILMU_PG[pg]||[]), start, function(){ bx.innerHTML='<div class="card">'+L2x("Halaman ini gagal dimuatkan","This page could not load")+'</div>'; });
}

// ---------- QIBLA CAMERA (0.10.0) ----------
// The back camera shows the real view; a Kaabah marker sits where the Qibla is. Same bearing and 3° rule as the compass.
var qcamOn=false;
function kaabahIcon(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 12 L20 6 L34 12 L34 32 L20 37 L6 32 Z" fill="#141414" stroke="#c9a646" stroke-width="1.6"/><path d="M6 12 L20 18 L34 12 M20 18 L20 37" fill="none" stroke="#3a3a3a" stroke-width="1.2"/><path d="M6 16 L20 22 L34 16" fill="none" stroke="#c9a646" stroke-width="2.4"/></svg>'; }
function openQiblaCam(){
  if(!N.hasPerm("camera")){ var ph=function(r){ if(r.which!=="camera") return; off("perm",ph); if(r.granted) openQiblaCam(); else toast(L2x("Kebenaran kamera diperlukan untuk paparan kamera","Camera permission is needed for the camera view")); }; on("perm",ph); N.requestPerm("camera"); return; }
  var p=qiblaPoint(), qb=qiblaBearing(p[0],p[1]), ov=document.getElementById("overlay"), stream=null, sm=null, buzzed=false, FOV=50, closed=false;
  qcamOn=true; ov.className="qcamov";
  ov.innerHTML='<video id="qcV" autoplay muted playsinline></video><div class="qcShade"></div>'+
    '<div class="qcTop"><button class="qcX" id="qcX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Kiblat kamera","Qibla camera")+'</b><span>'+qb.toFixed(1)+'°</span></div>'+
    '<div class="qcHz"></div><div class="qcAim"></div>'+
    '<div class="qcMark" id="qcM" style="display:none">'+kaabahIcon()+'<small>'+L2x("Kiblat","Qibla")+'</small></div>'+
    '<div class="qcEdge l" id="qcL" style="display:none"><span>‹</span><small></small></div><div class="qcEdge r" id="qcR" style="display:none"><span>›</span><small></small></div>'+
    '<div class="qcBot"><div class="qcStat" id="qcS">'+L2x("Mencari arah…","Finding the direction…")+'</div><div class="qcTip" id="qcT">'+L2x("Pegang telefon tegak dan pusing perlahan-lahan sehingga penanda Kaabah berada di tengah.","Hold the phone upright and turn slowly until the Kaabah marker is in the middle.")+'</div></div>';
  var V=ov.querySelector("#qcV"), M=ov.querySelector("#qcM"), EL=ov.querySelector("#qcL"), ER=ov.querySelector("#qcR"), ST=ov.querySelector("#qcS"), TP=ov.querySelector("#qcT");
  var camStart=function(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ camFail(); return; }
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}, width:{ideal:1280}}, audio:false}).then(function(s){ if(closed){ s.getTracks().forEach(function(t){ t.stop(); }); return; } stream=s; V.srcObject=s; var pl=V.play(); if(pl&&pl.catch) pl.catch(function(){}); ov.classList.remove("nocam"); }).catch(camFail);
  };
  var camFail=function(){ ov.classList.add("nocam"); TP.textContent=L2x("Kamera tidak dapat dibuka. Arah kiblat masih ditunjukkan di sini.","The camera could not open. The Qibla direction is still shown here."); };
  var camStop=function(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } V.srcObject=null; };
  var hh=function(r){
    if(r.error){ ST.textContent=L2x("Tiada sensor kompas pada telefon ini","No compass sensor on this phone"); return; }
    var d=qiblaDiff(r.deg, qb); if(sm===null) sm=d; else { var dd=((d-sm+540)%360)-180; sm=((sm+dd*0.35)+540)%360-180; }
    var a=Math.abs(sm), ok=a<3;
    if(a<=FOV/2+4){ M.style.display=""; M.style.left=(50+sm/FOV*100).toFixed(1)+"%"; EL.style.display=ER.style.display="none"; }
    else { M.style.display="none"; var side=sm>0?ER:EL; side.style.display=""; (sm>0?EL:ER).style.display="none"; side.querySelector("small").textContent=Math.round(a)+"°"; }
    ov.classList.toggle("ok", ok);
    ST.textContent= ok ? L2x("✓ Menghadap kiblat","✓ Facing the Qibla") : (sm>0 ? L2x("Pusing ke kanan ","Turn right ") : L2x("Pusing ke kiri ","Turn left "))+Math.round(a)+"°";
    if(ok && !buzzed){ buzzed=true; N.vibrate(200); } if(a>6) buzzed=false;
    if(r.acc!=null && r.acc<2) TP.textContent=L2x("Ketepatan kompas rendah. Gerakkan telefon dalam bentuk angka 8, jauh dari logam.","Low compass accuracy. Move the phone in a figure of eight, away from metal.");
    else if(r.pitch!=null && Math.abs(r.pitch)>50) TP.textContent=L2x("Pegang telefon tegak, bukan mendatar.","Hold the phone upright, not flat.");
    else if(!ov.classList.contains("nocam")) TP.textContent=L2x("Penanda bergerak apabila anda berpusing. Ikut arah anak panah.","The marker moves as you turn. Follow the arrow.");
  };
  var compassOn=function(){ if(N.setCompassCam) N.setCompassCam(true); N.startCompass(p[0],p[1]); };
  var onP=function(){ camStop(); }, onR=function(){ if(!closed){ compassOn(); camStart(); } };
  var close=function(){ if(closed) return; closed=true; qcamOn=false; camStop(); off("heading",hh); off("pause",onP); off("resume",onR); if(N.setCompassCam) N.setCompassCam(false); N.stopCompass(); closeOverlay(); render(); };
  ov.querySelector("#qcX").onclick=close; ov._close=close;
  on("heading",hh); on("pause",onP); on("resume",onR); compassOn(); camStart();
}

// ---------- GUIDED SOLAT PRACTICE (0.10.0) ----------
// The phone reads each part of the prayer in Arabic and waits, while the screen shows the position and meaning.
function arSpeech(text){ return waqfAr(String(text||"").replace(/<[^>]*>/g," ").replace(/[﴿(]?\s*[٠-٩۰-۹0-9]+\s*[﴾)]?/g," . ").replace(/[۝۞﴿﴾]/g," . ").replace(/[ۖ-ۜ۞-ۭ]/g,"").replace(/(\s*\.\s*)+/g," . ").replace(/^\s*\.\s*/,"")); }
var spkTok=0;
function speakThen(text, cb){
  var tok=++spkTok, t=arSpeech(text), est=Math.max(1600, t.length*95), done=false, tm=0;
  var fin=function(){ if(done) return; done=true; off("ttsdone",td); off("tts",te); clearTimeout(tm); if(tok===spkTok && cb) cb(); };
  var td=function(r){ if(r && r.stopped) return; fin(); };
  var te=function(r){ if(r && r.error){ clearTimeout(tm); tm=setTimeout(fin, est); } };
  tm=setTimeout(fin, est*2+4000);
  if(window.Native && N.speak){ on("ttsdone",td); on("tts",te); N.speak(t,"ar"); return; }
  try{ speechSynthesis.cancel(); var vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); });
    if(!vs.length){ clearTimeout(tm); tm=setTimeout(fin, est); return; }
    var u=new SpeechSynthesisUtterance(t); u.lang="ar-SA"; u.rate=0.8; u.voice=vs.filter(function(v){ return v.name===S.voice; })[0]||vs[0]; u.onend=fin; u.onerror=fin; speechSynthesis.speak(u);
  }catch(e){ clearTimeout(tm); tm=setTimeout(fin, est); }
}
function speakStop(){ spkTok++; if(N.stopSpeak) try{ N.stopSpeak(); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} }
var PR_NIAT={subuh:["الصُّبْحِ رَكْعَتَيْنِ","Subuh dua rakaat","Subuh, two rakaat",2], zohor:["الظُّهْرِ أَرْبَعَ رَكَعَاتٍ","Zohor empat rakaat","Zohor, four rakaat",4],
  asar:["الْعَصْرِ أَرْبَعَ رَكَعَاتٍ","Asar empat rakaat","Asar, four rakaat",4], maghrib:["الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ","Maghrib tiga rakaat","Maghrib, three rakaat",3], isyak:["الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ","Isyak empat rakaat","Isyak, four rakaat",4]};
function practiceSteps(k){
  var B=BACAAN_SOLAT, P=PR_NIAT[k], n=P[3], out=[], AK="اللّٰهُ أَكْبَرُ";
  var add=function(r, pose, b, o){ o=o||{}; var ar=o.ar||b.ar, sayAr=o.rep?new Array(o.rep+1).join(ar+" . "):ar;
    out.push({r:r, p:pose, t:o.t||[b.t_ms,b.t_en], ar:ar, m:o.m||[b.ms,b.en], say:(o.pre?AK+" . ":"")+sayAr, note:o.note}); };
  for(var r=1;r<=n;r++){
    if(r===1){
      add(r,"stand",B[0],{t:["Niat","Intention"], ar:B[0].ar.replace("الظُّهْرِ أَرْبَعَ رَكَعَاتٍ",P[0]), m:[B[0].ms.replace("Zohor empat rakaat",P[1]), B[0].en.replace("Zohor, four rakaat",P[2])], note:["Niat di dalam hati. Melafazkannya ialah sunat.","The intention is in the heart. Saying it aloud is sunnah."]});
      add(r,"takbir",B[1]); add(r,"qiyam",B[2]);
    } else add(r,"takbir",B[1],{t:["Bangun ke rakaat "+r,"Rise for rakaat "+r], m:["Allah Maha Besar.","Allah is the Greatest."]});
    add(r,"qiyam",B[3]);
    if(r<=2) add(r,"qiyam",B[4]);
    add(r,"rukuk",B[5],{pre:1,rep:3,t:["Rukuk","Rukuk (bowing)"]});
    add(r,"stand",B[6]);
    if(k==="subuh" && r===2) add(r,"takbir",B[9],{t:["Qunut","Qunut"]});
    add(r,"sujud",B[7],{pre:1,rep:3,t:["Sujud pertama","First sujud"]});
    add(r,"sit",B[8],{pre:1});
    add(r,"sujud",B[7],{pre:1,rep:3,t:["Sujud kedua","Second sujud"]});
    if(r===2 && n>2) add(r,"sit",B[10],{pre:1});
    if(r===n){ add(r,"sit",B[10],{pre:1,t:["Tahiyat akhir","Final tashahhud"]}); add(r,"sit",B[11]); add(r,"sit",B[12]); add(r,"salam",B[13],{rep:2,t:["Salam ke kanan, kemudian ke kiri","Salam to the right, then the left"]}); }
  }
  return out;
}
function openPractice(){
  var ov=document.getElementById("overlay"), keys=["subuh","zohor","asar","maghrib","isyak"], k=null, steps=[], i=0, playing=false, auto=S.prAuto!==false, nx=0, closed=false;
  ov.className="pracov";
  var stopAll=function(){ clearTimeout(nx); speakStop(); };
  var close=function(){ closed=true; stopAll(); N.keepScreenOn(false,-1); closeOverlay(); };
  var pick=function(){ stopAll(); k=null;
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Latihan solat berpandu","Guided solat practice")+'</b><span></span></div>'+
      '<div class="prPick"><p>'+L2x("Pilih solat. Suara membaca setiap bacaan dalam bahasa Arab dan berhenti seketika supaya anda boleh mengikut.","Choose a prayer. The voice reads each part in Arabic and pauses so you can follow along.")+'</p>'+
      '<div class="prKs">'+keys.map(function(x){ return '<button class="prK" data-k="'+x+'"><b>'+T(x)+'</b><small>'+PR_NIAT[x][3]+' rakaat</small></button>'; }).join("")+'</div>'+
      '<div class="set"><span>'+L2x("Teruskan sendiri selepas setiap bacaan","Move on by itself after each part")+'</span>'+sw("prAuto",auto)+'</div>'+
      '<div class="mut small" style="margin-top:12px">'+L2x("Untuk belajar dan berlatih. Bilangan ayat tidak dibaca. Solat sebenar tidak memerlukan telefon.","For learning and practice. Ayat numbers are not read out. A real prayer needs no phone.")+'</div></div>';
    ov.querySelector("#prX").onclick=close;
    ov.querySelector("#prAuto").onchange=function(){ auto=this.checked; S.prAuto=auto; saveS(); };
    ov.querySelectorAll("[data-k]").forEach(function(b){ b.onclick=function(){ k=b.getAttribute("data-k"); steps=practiceSteps(k); i=0; playing=true; N.keepScreenOn(true,-1); show(); }; });
  };
  var show=function(){ if(closed) return; stopAll(); var s=steps[i], n=PR_NIAT[k][3];
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Kembali","Back")+'">‹</button><b>'+T(k)+' · '+L2x("Rakaat ","Rakaat ")+s.r+'/'+n+'</b><span>'+(i+1)+'/'+steps.length+'</span></div>'+
      '<div class="prBar"><i style="width:'+((i+1)/steps.length*100).toFixed(1)+'%"></i></div>'+
      '<div class="prBody"><div class="prPose">'+poseSvg(s.p)+'</div><div class="prT">'+esc(L2x(s.t[0],s.t[1]))+'</div>'+
      '<div class="ar prAr">'+s.ar+'</div>'+rumiDiv(s.ar)+'<div class="tr">'+esc(L2x(s.m[0],s.m[1]))+'</div>'+(s.note?'<div class="mut small" style="margin-top:6px">'+esc(L2x(s.note[0],s.note[1]))+'</div>':'')+'</div>'+
      '<div class="prCtl"><button id="prPrev" aria-label="'+L2x("Sebelum","Previous")+'"'+(i===0?" disabled":"")+'>⏮</button><button id="prPlay" class="big" aria-label="'+(playing?L2x("Jeda","Pause"):L2x("Main","Play"))+'">'+(playing?"⏸":"▶")+'</button><button id="prNext" aria-label="'+L2x("Seterusnya","Next")+'">⏭</button></div>';
    ov.querySelector("#prX").onclick=pick;
    ov.querySelector("#prPrev").onclick=function(){ if(i>0){ i--; show(); } };
    ov.querySelector("#prNext").onclick=function(){ next(); };
    ov.querySelector("#prPlay").onclick=function(){ playing=!playing; show(); };
    if(playing) speakThen(s.say, function(){ if(auto && playing && !closed) nx=setTimeout(next, 1400); });
  };
  var next=function(){ if(i<steps.length-1){ i++; show(); } else finish(); };
  var finish=function(){ stopAll(); playing=false;
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+T(k)+'</b><span></span></div><div class="prDone"><div class="prDoneI">🤲</div><h2>'+L2x("Alhamdulillah, latihan selesai","Alhamdulillah, practice complete")+'</h2><p>'+L2x("Ulang beberapa kali sehingga anda hafal urutannya.","Repeat a few times until you know the order by heart.")+'</p>'+
      '<button class="btn gold full" id="prAgain">'+L2x("Ulang solat ini","Practise this prayer again")+'</button><button class="btn alt full" id="prOther" style="margin-top:8px">'+L2x("Pilih solat lain","Choose another prayer")+'</button></div>';
    ov.querySelector("#prX").onclick=close; ov.querySelector("#prAgain").onclick=function(){ i=0; playing=true; show(); }; ov.querySelector("#prOther").onclick=pick;
  };
  ov._close=function(){ if(k) pick(); else close(); };
  pick();
}

// ---------- TAWAF & SA'IE COUNTER (0.10.0) ----------
// A big tap counter for the real trip, with the doa for each stage from the Haji & Umrah guide. Survives closing the app.
var volHook=null;
function withHajjData(cb){ if(window.HJ_DOA){ cb(); return; } var sc=document.createElement("script"); sc.src="hajj/hajj_data.js"; sc.onload=cb; sc.onerror=cb; document.body.appendChild(sc); }
function openTawaf(){
  withHajjData(function(){
    var ov=document.getElementById("overlay"), T7=load("ihsan_tawaf",{m:"tawaf",n:0,t0:0}), closed=false, tick=0;
    ov.className="tawafov"; N.keepScreenOn(true,-1); if(N.setVolumeKeys) N.setVolumeKeys(true);
    var D=function(key){ var d=window.HJ_DOA&&HJ_DOA[key]; if(!d||!d.ar) return ''; return '<div class="twDoa"><b>'+esc(L2x(d.t[0],d.t[1]))+'</b><div class="ar">'+d.ar+'</div>'+(S.showRumi&&d.r?'<div class="rumi">'+esc(d.r)+'</div>':'')+'<div class="tr">'+esc(L2x(d.m[0],d.m[1]))+'</div><div class="tools">'+sayBtn(d.ar)+'</div></div>'; };
    var guide=function(){ var n=T7.n, cur=n+1, h='';
      if(T7.m==="tawaf"){
        if(n===0) h='<p>'+L2x("Mula di garisan Hajar Aswad dengan Kaabah di sebelah kiri. Berniat, kemudian istilam: angkat tangan kanan ke arah Hajar Aswad.","Start at the Black Stone line with the Kaabah on your left. Make the intention, then raise your right hand towards the Black Stone (istilam).")+'</p>'+D("niat_tawaf")+D("istilam");
        else if(n<7) h='<p>'+L2x("Pusingan ke-"+cur+". Istilam setiap kali melintasi garisan Hajar Aswad. Baca apa-apa zikir atau doa yang anda tahu.","Round "+cur+". Raise your hand each time you pass the Black Stone line. Recite any dhikr or doa you know.")+(cur<=3?' '+L2x("Lelaki: berlari-lari anak (ramal) dalam tawaf umrah atau qudum.","Men: walk briskly with short steps (ramal) in the tawaf of umrah or arrival."):'')+'</p>'+D("rabbana")+D("istilam");
        else h='<p>'+L2x("Selesai tujuh pusingan. Jika boleh, solat sunat tawaf dua rakaat di belakang Maqam Ibrahim, kemudian minum air Zamzam.","Seven rounds done. If you can, pray two rakaat of tawaf behind Maqam Ibrahim, then drink Zamzam.")+'</p>'+D("maqam")+D("solat_tawaf")+D("zamzam");
      } else {
        if(n===0) h='<p>'+L2x("Mula di Bukit Safa. Hadap Kaabah, bertakbir dan berdoa, kemudian berjalan ke Marwah.","Start on Safa. Face the Kaabah, say takbir and make doa, then walk to Marwah.")+'</p>'+D("safa")+D("safa_zikir");
        else if(n<7) h='<p>'+(cur%2?L2x("Pusingan ke-"+cur+": Safa ke Marwah.","Round "+cur+": Safa to Marwah."):L2x("Pusingan ke-"+cur+": Marwah ke Safa.","Round "+cur+": Marwah to Safa."))+' '+L2x("Di antara lampu hijau, lelaki berlari-lari anak. Di atas bukit, hadap Kaabah dan berzikir.","Between the green lights, men jog. On each hill, face the Kaabah and make dhikr.")+'</p>'+D("hijau")+D("safa_zikir");
        else h='<p>'+L2x("Selesai di Marwah. Untuk umrah, bertahallul dengan bercukur atau menggunting rambut.","Finished at Marwah. For umrah, leave ihram by shaving or cutting the hair.")+'</p>'+D("cukur");
      }
      return h; };
    var ring=function(){ var n=T7.n, segs=''; for(var j=0;j<7;j++){ var a0=-90+j*360/7+2, a1=-90+(j+1)*360/7-2, r=92, x0=110+r*Math.cos(a0*Math.PI/180), y0=110+r*Math.sin(a0*Math.PI/180), x1=110+r*Math.cos(a1*Math.PI/180), y1=110+r*Math.sin(a1*Math.PI/180);
        segs+='<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A'+r+' '+r+' 0 0 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'" class="'+(j<n?"on":"")+'"/>'; }
      var sub = T7.m==="saie" ? (n>=7?L2x("Selesai di Marwah","Done at Marwah"):((n+1)%2?L2x("Safa → Marwah","Safa → Marwah"):L2x("Marwah → Safa","Marwah → Safa"))) : (n>=7?L2x("Tawaf selesai","Tawaf complete"):L2x("Pusingan ke-"+(n+1),"Round "+(n+1)));
      return '<svg viewBox="0 0 220 220" class="twSvg">'+segs+'</svg><span class="twN">'+n+'<small>/7</small></span><span class="twSub">'+esc(sub)+'</span>'; };
    var mins=function(){ return T7.t0 ? Math.max(0,Math.round((Date.now()-T7.t0)/60000)) : 0; };
    var draw=function(){ if(closed) return;
      ov.innerHTML='<div class="twTop"><button class="prX" id="twX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</b><span id="twT">'+(T7.t0?mins()+" min":"")+'</span></div>'+
        '<div class="twSeg" role="group"><button data-m="tawaf" class="'+(T7.m==="tawaf"?"on":"")+'">Tawaf</button><button data-m="saie" class="'+(T7.m==="saie"?"on":"")+'">'+L2x("Sa'ie","Sa'i")+'</button></div>'+
        '<button class="twRing'+(T7.n>=7?" done":"")+'" id="twTap" aria-label="'+L2x("Tambah satu pusingan","Add one round")+'">'+ring()+'</button>'+
        '<div class="mut small twHint">'+L2x("Ketik bulatan atau tekan butang volum selepas setiap pusingan.","Tap the circle or press a volume button after each round.")+'</div>'+
        '<div class="twBtns"><button class="btn alt" id="twUndo"'+(T7.n?"":" disabled")+'>−1</button><button class="btn alt" id="twReset">'+L2x("Mula semula","Start over")+'</button></div>'+
        '<div class="twInfo">'+guide()+'</div>';
      ov.querySelector("#twX").onclick=close; ov.querySelector("#twTap").onclick=inc;
      ov.querySelector("#twUndo").onclick=function(){ if(T7.n>0){ T7.n--; save("ihsan_tawaf",T7); N.vibrate(30); draw(); } };
      ov.querySelector("#twReset").onclick=function(){ if(T7.n && !confirm(L2x("Kosongkan kiraan?","Clear the count?"))) return; T7.n=0; T7.t0=0; save("ihsan_tawaf",T7); draw(); };
      ov.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-m"); if(m===T7.m) return; if(T7.n && T7.n<7 && !confirm(L2x("Tukar dan kosongkan kiraan?","Switch and clear the count?"))) return; T7={m:m,n:0,t0:0}; save("ihsan_tawaf",T7); draw(); }; });
    };
    var inc=function(){ if(T7.n>=7) return; if(!T7.t0) T7.t0=Date.now(); T7.n++; save("ihsan_tawaf",T7);
      if(T7.n===7){ N.vibrate(600); toast(L2x("MasyaAllah, 7 pusingan selesai","MasyaAllah, 7 rounds done")); } else N.vibrate(60); draw(); };
    var close=function(){ closed=true; volHook=null; clearInterval(tick); if(N.setVolumeKeys) N.setVolumeKeys(false); N.keepScreenOn(false,-1); closeOverlay(); render(); };
    volHook=inc; ov._close=close; tick=setInterval(function(){ var t=ov.querySelector("#twT"); if(t&&T7.t0) t.textContent=mins()+" min"; }, 30000);
    draw();
  });
}

// ---------- 0.11.0 shared: in-app browser for official portals ----------
// 0.27.0: Friday khutbah of every state. Each row searches for that department's latest khutbah text, so a changed web address never breaks it.
var KHUTBAH=[["KUL","JAWI","Jabatan Agama Islam Wilayah Persekutuan"],["SGR","JAIS","Jabatan Agama Islam Selangor"],["JHR","JAINJ","Jabatan Agama Islam Negeri Johor"],["KDH","JHEAIK","Jabatan Hal Ehwal Agama Islam Negeri Kedah"],
  ["KTN","JAHEAIK","Jabatan Hal Ehwal Agama Islam Kelantan"],["MLK","JAIM","Jabatan Agama Islam Melaka"],["NSN","JHEAINS","Jabatan Hal Ehwal Agama Islam Negeri Sembilan"],["PHG","JAIP","Jabatan Agama Islam Pahang"],
  ["PRK","JAIPk","Jabatan Agama Islam Perak"],["PLS","JAIPs","Jabatan Hal Ehwal Agama Islam Perlis"],["PNG","JHEAIPP","Jabatan Hal Ehwal Agama Islam Pulau Pinang"],["SBH","JHEAINS","Jabatan Hal Ehwal Agama Islam Negeri Sabah"],
  ["SWK","JAIS Sarawak","Jabatan Agama Islam Sarawak"],["TRG","JHEAT","Jabatan Hal Ehwal Agama Terengganu"],["","JAKIM","Jabatan Kemajuan Islam Malaysia (teks khutbah seragam)"]];
function khutbahSheet(){
  var mine=S.state==="PJY"||S.state==="LBN"?"KUL":S.state, rows=KHUTBAH.slice().sort(function(a,b){ return (b[0]===mine)-(a[0]===mine); });
  var ov=showSheet("🕌 "+L2x("Khutbah Jumaat","Friday khutbah"), '<div class="mut small" style="margin-bottom:8px">'+L2x("Ketik negeri untuk membuka teks khutbah terkini daripada jabatan agama negeri itu.","Tap a state to open the latest khutbah text from that state's religious department.")+'</div>'+
    rows.map(function(r,i){ return '<button class="set g3d kbRow" data-kb="'+i+'"><span><b>'+esc(r[0]?STATES[r[0]]:"Malaysia")+'</b>'+(r[0]===mine?' <span class="badge">'+L2x("Negeri anda","Your state")+'</span>':'')+'<br><small class="mut">'+esc(r[1]+" · "+r[2])+'</small></span><span class="chev">↗</span></button>'; }).join(""));
  ov.querySelectorAll("[data-kb]").forEach(function(b){ b.onclick=function(){ var r=rows[+b.getAttribute("data-kb")]; openWeb("https://www.google.com/search?q="+encodeURIComponent("teks khutbah Jumaat terkini "+r[1]+" "+r[2]), "Khutbah "+r[1]); }; });
}
WG["sc-khutbah"]=scW("khutbah","🕌","Khutbah Jumaat","Friday khutbah","q-khutbah","Teks khutbah setiap negeri","Khutbah text for every state");
function openWeb(u, title){ if(window.Native && N.openWeb) N.openWeb(u, title||""); else N.openUrl(u); }
function strHash(s){ var h=0; s=String(s); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return (h>>>0).toString(36); }
function downloadText(name, mime, text){ try{ var b=new Blob([text],{type:mime}), a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }catch(e){} }

// ---------- SHARIAH STOCKS (idea 73) ----------
// The official list comes only from the Securities Commission (SAC), updated at the end of May and November.
// The app opens that list, keeps the person's own watchlist with the list date they checked, and offers a
// self-screen using the SC's published quantitative benchmarks (5% business activity, 33% cash, 33% debt).
var SC_LIST_URL="https://www.sc.com.my/permalink.aspx?id=A978BB30-65DB-4B26-97D5-DB4E14173A7D";
var SC_METHOD_URL="https://www.sc.com.my/permalink.aspx?id=A204B479-16C3-4AD0-85D7-66451C2CBAB0";
var SC_ACTS=[["Perbankan dan pinjaman konvensional","Conventional banking and lending"],["Insurans konvensional","Conventional insurance"],["Perjudian","Gambling"],["Arak dan aktiviti berkaitan","Liquor and related activities"],["Babi dan aktiviti berkaitan","Pork and related activities"],["Makanan dan minuman tidak halal, termasuk tanpa sijil halal","Non-halal food and drinks, including those without halal certification"],["Tembakau, rokok dan rokok elektronik","Tobacco, cigarettes and e-cigarettes"],["Faedah daripada akaun dan instrumen konvensional","Interest from conventional accounts and instruments"],["Dividen daripada pelaburan tidak patuh Syariah","Dividends from Shariah non-compliant investments"],["Hiburan tidak patuh Syariah","Shariah non-compliant entertainment"],["Dagangan saham dan pembrokeran saham","Share trading and stockbroking"],["Pawagam","Cinema"],["Sewa daripada aktiviti tidak patuh Syariah","Rent from Shariah non-compliant activities"]];
function scPeriod(d){ d=d||new Date(); var y=d.getFullYear(), m=d.getMonth()+1, dd=d.getDate();
  if(m===12 || (m===11 && dd>=25)) return y+"-11";
  if(m>=6 || (m===5 && dd>=25)) return y+"-05";
  return (y-1)+"-11"; }
function scPeriodName(p){ var a=String(p).split("-"); return (a[1]==="05"?L2x("Mei","May"):"Nov")+" "+a[0]; }
function openSaham(){
  var ov=document.getElementById("overlay"), D=load("ihsan_saham",{list:[], calc:{}}), cur=scPeriod(), add={s:"y"};
  D.list=D.list||[]; D.calc=D.calc||{};
  var sv=function(){ save("ihsan_saham", D); };
  var num=function(v){ v=String(v==null?"":v).replace(/,/g,"").trim(); return v===""?null:parseFloat(v); };
  var calcRes=function(){
    var c=D.calc, ti=num(c.ti), ni=num(c.ni), ta=num(c.ta), ca=num(c.ca), de=num(c.de), rows=[], all=true, any=false;
    var row=function(label, a, b, lim){ if(a==null||b==null||!(b>0)) return; any=true; var p=a/b*100, ok=p<lim; if(!ok) all=false;
      rows.push('<div class="shR '+(ok?"ok":"no")+'"><span>'+label+'</span><b>'+p.toFixed(1)+'%</b><em>'+(ok?"✓ ":"✗ ")+L2x("bawah ","under ")+lim+'%</em></div>'); };
    row(L2x("Pendapatan tidak patuh ÷ jumlah pendapatan","Non-compliant income ÷ total income"), ni, ti, 5);
    row(L2x("Tunai konvensional ÷ jumlah aset","Conventional cash ÷ total assets"), ca, ta, 33);
    row(L2x("Hutang berfaedah ÷ jumlah aset","Interest-bearing debt ÷ total assets"), de, ta, 33);
    if(!any) return '<div class="mut small">'+L2x("Isi angka dari laporan tahunan syarikat (unit yang sama, contohnya RM juta).","Fill in figures from the company's annual report (same unit, for example RM million).")+'</div>';
    return rows.join("")+'<div class="shV '+(all&&rows.length===3?"ok":(all?"":"no"))+'">'+(rows.length<3?L2x("Lengkapkan semua angka untuk keputusan penuh.","Fill in all the figures for a full result."):(all?L2x("✓ Lulus ketiga-tiga penanda aras kuantitatif SC","✓ Passes all three SC quantitative benchmarks"):L2x("✗ Tidak lulus sekurang-kurangnya satu penanda aras","✗ Fails at least one benchmark")))+'</div>';
  };
  var draw=function(){
    var en=en_(), h='<div class="prTop"><button class="prX" id="shX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</b><span></span></div><div class="shBody">';
    h+='<div class="card"><h3>📋 '+L2x("Senarai rasmi Suruhanjaya Sekuriti","Official Securities Commission list")+'</h3><div class="small" style="line-height:1.5">'+
      L2x("Majlis Penasihat Syariah (SAC) Suruhanjaya Sekuriti menerbitkan senarai sekuriti patuh Syariah di Bursa Malaysia dua kali setahun, pada hujung Mei dan November. Senarai terkini: ","The Shariah Advisory Council (SAC) of the Securities Commission publishes the list of Shariah-compliant securities on Bursa Malaysia twice a year, at the end of May and November. Latest list: ")+'<b>'+scPeriodName(cur)+'</b>.</div>'+
      '<button class="btn gold full" id="shOpen" style="margin-top:10px">'+L2x("Buka senarai rasmi","Open the official list")+' ↗</button>'+
      '<div class="mut tiny" style="margin-top:6px">'+L2x("Dibuka dari laman sc.com.my. Pilih dokumen terkini dan cari nama syarikat.","Opens sc.com.my. Choose the latest document and look for the company name.")+'</div></div>';
    // watchlist
    h+='<div class="card"><h3>⭐ '+L2x("Saham saya","My stocks")+'</h3><div class="mut small">'+L2x("Simpan status yang anda semak dalam senarai rasmi. Aplikasi mengingatkan anda untuk menyemak semula selepas setiap kemas kini SC.","Save the status you checked in the official list. The app reminds you to check again after each SC update.")+'</div>'+
      '<div class="shAdd"><input id="shN" type="text" maxlength="40" placeholder="'+L2x("Nama atau kod saham","Stock name or code")+'"><div class="grp2"><button class="chip '+(add.s==="y"?"on":"")+'" data-sa="y">✓ '+L2x("Patuh","Compliant")+'</button><button class="chip '+(add.s==="n"?"on":"")+'" data-sa="n">✗ '+L2x("Tidak patuh","Non-compliant")+'</button></div><button class="btn alt full" id="shAddB">＋ '+L2x("Tambah","Add")+' ('+L2x("senarai ","list ")+scPeriodName(cur)+')</button></div>';
    if(D.list.length){
      var old=D.list.filter(function(x){ return x.p<cur; }).length;
      if(old) h+='<div class="shWarn">🔔 '+old+L2x(" saham perlu disemak semula dalam senarai "," stock(s) need checking again in the ")+scPeriodName(cur)+L2x(""," list")+'</div>';
      h+=D.list.map(function(x,i){ var stale=x.p<cur; return '<div class="shI'+(stale?' stale':'')+'"><span class="shS '+(x.s==="y"?"ok":"no")+'">'+(x.s==="y"?"✓":"✗")+'</span><div class="shT"><b>'+esc(x.n)+'</b><span class="mut tiny">'+(x.s==="y"?L2x("Patuh Syariah","Shariah-compliant"):L2x("Tidak patuh Syariah","Not Shariah-compliant"))+' · '+L2x("senarai ","list ")+scPeriodName(x.p)+(stale?' · <b class="warnT">'+L2x("semak semula","check again")+'</b>':'')+'</span></div>'+
        (stale?'<button class="chip" data-shk="'+i+'" title="'+L2x("Masih sama dalam senarai terkini","Still the same in the latest list")+'">✓ '+L2x("Sama","Same")+'</button><button class="chip" data-shf="'+i+'">⇄</button>':'')+'<button class="chip" data-shd="'+i+'" aria-label="'+L2x("Padam","Delete")+'">🗑</button></div>'; }).join("");
    }
    h+='</div>';
    // self-screen
    var c=D.calc, f=function(id, label){ return '<label class="shF"><span>'+label+'</span><input inputmode="decimal" data-cf="'+id+'" value="'+esc(c[id]==null?"":String(c[id]))+'" placeholder="0"></label>'; };
    h+='<div class="card"><h3>🧮 '+L2x("Saringan sendiri (kaedah SC)","Self-screen (SC method)")+'</h3><div class="mut small">'+L2x("Anggaran pembelajaran mengikut penanda aras kuantitatif yang diterbitkan SC. Gunakan angka dari laporan tahunan.","A learning estimate using the SC's published quantitative benchmarks. Use figures from the annual report.")+'</div>'+
      '<div class="shFs">'+f("ti",L2x("Jumlah pendapatan kumpulan","Group total income"))+f("ni",L2x("Pendapatan daripada aktiviti tidak patuh","Income from non-compliant activities"))+f("ta",L2x("Jumlah aset","Total assets"))+f("ca",L2x("Tunai dalam akaun konvensional","Cash in conventional accounts"))+f("de",L2x("Hutang berfaedah (bukan pembiayaan Islam atau sukuk)","Interest-bearing debt (not Islamic financing or sukuk)"))+'</div>'+
      '<div id="shRes">'+calcRes()+'</div>'+
      '<details class="small" style="margin-top:10px"><summary>'+L2x("Aktiviti yang dikira tidak patuh (had 5%)","Activities counted as non-compliant (5% limit)")+'</summary><ul class="ul" style="margin-top:6px">'+SC_ACTS.map(function(a){ return '<li>'+esc(en?a[1]:a[0])+'</li>'; }).join("")+'</ul></details>'+
      '<button class="chip" id="shMeth" style="margin-top:8px">'+L2x("Kaedah saringan penuh (SC)","Full screening method (SC)")+' ↗</button></div>';
    h+='<div class="card hdisc"><h3>⚖️ '+L2x("Bukan nasihat pelaburan","Not investment advice")+'</h3><div class="small">'+L2x("Status rasmi hanya daripada senarai SAC Suruhanjaya Sekuriti. SAC juga menilai aspek kualitatif seperti imej dan persepsi awam, jadi saringan sendiri boleh berbeza daripada status rasmi.","The official status comes only from the SAC list of the Securities Commission. The SAC also weighs qualitative points such as public image, so a self-screen can differ from the official status.")+'</div></div>';
    h+='</div>';
    ov.innerHTML=h;
    ov.querySelector("#shX").onclick=close;
    ov.querySelector("#shOpen").onclick=function(){ openWeb(SC_LIST_URL, L2x("Senarai patuh Syariah (SC)","Shariah-compliant list (SC)")); };
    ov.querySelector("#shMeth").onclick=function(){ openWeb(SC_METHOD_URL, L2x("Kaedah saringan SC","SC screening method")); };
    ov.querySelectorAll("[data-sa]").forEach(function(b){ b.onclick=function(){ add.s=b.getAttribute("data-sa"); ov.querySelectorAll("[data-sa]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
    ov.querySelector("#shAddB").onclick=function(){ var n=ov.querySelector("#shN").value.trim(); if(!n){ toast(L2x("Taip nama saham dahulu","Type the stock name first")); return; }
      D.list=D.list.filter(function(x){ return x.n.toLowerCase()!==n.toLowerCase(); }); D.list.unshift({n:n, s:add.s, p:cur}); sv(); draw(); };
    ov.querySelectorAll("[data-shk]").forEach(function(b){ b.onclick=function(){ D.list[+b.getAttribute("data-shk")].p=cur; sv(); draw(); }; });
    ov.querySelectorAll("[data-shf]").forEach(function(b){ b.onclick=function(){ var x=D.list[+b.getAttribute("data-shf")]; x.s=x.s==="y"?"n":"y"; x.p=cur; sv(); draw(); }; });
    ov.querySelectorAll("[data-shd]").forEach(function(b){ b.onclick=function(){ D.list.splice(+b.getAttribute("data-shd"),1); sv(); draw(); }; });
    ov.querySelectorAll("[data-cf]").forEach(function(inp){ inp.oninput=function(){ D.calc[inp.getAttribute("data-cf")]=inp.value; sv(); ov.querySelector("#shRes").innerHTML=calcRes(); }; });
  };
  var close=function(){ closeOverlay(); render(); };
  ov.className="pracov shmov"; ov._close=close; draw();
}

// ---------- LIVE MAKKAH & MADINAH (idea 75) ----------
// Opens live broadcasts on YouTube and shows the prayer times there (Umm al-Qura estimate) in the person's own time.
var HARAM=[{k:"makkah", ms:"Masjidil Haram, Makkah", en:"Masjid al-Haram, Makkah", lat:21.4225, lon:39.8262, q:"Makkah live"},
           {k:"madinah", ms:"Masjid Nabawi, Madinah", en:"Masjid an-Nabawi, Madinah", lat:24.4672, lon:39.6111, q:"Madinah live"}];
function domeIcon(){ return '<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><rect x="6" y="18" width="5" height="38" fill="#e8e1cf"/><path d="M8.5 8l3 10h-6z" fill="#c9a646"/><rect x="53" y="18" width="5" height="38" fill="#e8e1cf"/><path d="M55.5 8l3 10h-6z" fill="#c9a646"/><rect x="14" y="38" width="36" height="18" fill="#e8e1cf"/><path d="M18 38a14 14 0 0 1 28 0z" fill="#1f9d63"/><rect x="31" y="14" width="2" height="10" fill="#c9a646"/><circle cx="32" cy="13" r="2" fill="#c9a646"/><rect x="28" y="46" width="8" height="10" rx="4" fill="#0e6b45"/></svg>'; }
function ksaDay(p, off){
  var k=new Date(Date.now()+3*36e5), y=k.getUTCFullYear(), m=k.getUTCMonth(), d=k.getUTCDate()+off;
  var loc=new Date(y, m, d), hj=hijriOf(new Date()), ram=hj && hj.m===9;
  var t=calcDay(loc, p.lat, p.lon, {fa:18.5, ia:0, im:ram?120:90, tz:3, ik:0});
  var at=function(hm0){ var a=hm0.split(":"); return Date.UTC(loc.getFullYear(), loc.getMonth(), loc.getDate(), +a[0], +a[1]) - 3*36e5; };
  return PR.map(function(k){ return {k:k, ksa:t[k], ms:at(t[k])}; });
}
function inStr(ms){ var m=Math.max(0,Math.round(ms/60000)), h=Math.floor(m/60); m=m%60; return (h?h+L2x(" jam "," h "):"")+m+L2x(" min"," min"); }
function vLive(el){
  var now=Date.now(), ksaNow=new Date(now+3*36e5), ksaHM=pad(ksaNow.getUTCHours())+":"+pad(ksaNow.getUTCMinutes());
  var h='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lvBack">‹ '+T("learn")+'</button><b>📺 '+L2x("Siaran langsung Makkah & Madinah","Live Makkah & Madinah")+'</b><span></span></div>';
  HARAM.forEach(function(p){
    var list=ksaDay(p,0), nxt=list.filter(function(x){ return x.ms>now; })[0] || ksaDay(p,1)[0];
    h+='<div class="card lvC"><div class="lvH">'+(p.k==="makkah"?'<span class="lvI">'+kaabahIcon()+'</span>':'<span class="lvI">'+domeIcon()+'</span>')+'<div><b>'+esc(L2x(p.ms,p.en))+'</b><div class="mut small">'+L2x("Waktu di sana: ","Time there: ")+'<b class="lvClk">'+fmt12(ksaHM)+'</b></div></div></div>'+
      '<div class="lvN">'+L2x("Solat seterusnya di sana: ","Next prayer there: ")+'<b>'+T(nxt.k)+' '+fmt12(nxt.ksa)+'</b><br><span class="mut small">= '+hm12(nxt.ms)+' '+L2x("waktu anda","your time")+' · '+L2x("dalam ","in ")+inStr(nxt.ms-now)+'</span></div>'+
      '<table class="lvT"><tr><th></th><th>'+L2x("Di sana","There")+'</th><th>'+L2x("Waktu anda","Your time")+'</th></tr>'+list.map(function(x){ return '<tr'+(x===nxt?' class="on"':'')+'><td>'+T(x.k)+'</td><td>'+fmt12(x.ksa)+'</td><td>'+hm12(x.ms)+'</td></tr>'; }).join("")+'</table>'+
      '<button class="btn gold full" data-yt="'+esc(p.q)+'" style="margin-top:10px">▶ '+L2x("Tonton siaran langsung","Watch the live broadcast")+'</button></div>';
  });
  h+='<div class="btns" style="margin:0 0 10px"><button class="btn alt" id="lvRadio">🎧 '+L2x("Radio Al-Quran","Quran radio")+'</button></div>';
  h+='<div class="mut small" style="padding:0 4px 14px">'+L2x("Siaran langsung disediakan oleh saluran YouTube; aplikasi membuka carian siaran langsung di YouTube. Waktu solat di Makkah dan Madinah ialah anggaran kiraan (kaedah Umm al-Qura); masjid boleh berbeza beberapa minit.","Live broadcasts are provided by YouTube channels; the app opens a search for live streams on YouTube. Prayer times in Makkah and Madinah are calculated estimates (Umm al-Qura method); the mosques can differ by a few minutes.")+'</div>';
  el.innerHTML=h;
  el.querySelector("#lvBack").onclick=function(){ learnPg=null; render(); };
  el.querySelector("#lvRadio").onclick=function(){ if(window.IbMedia && IbMedia.filter) IbMedia.filter("quran"); learnPg="radio"; render(); document.getElementById("view").scrollTop=0; };
  el.querySelectorAll("[data-yt]").forEach(function(b){ b.onclick=function(){ N.openUrl("https://www.youtube.com/results?search_query="+encodeURIComponent(b.getAttribute("data-yt"))+"&sp=EgJAAQ%253D%253D"); }; });
  timers.push(setInterval(function(){ if(view!=="learn"||learnPg!=="live") return; var k=new Date(Date.now()+3*36e5), s=fmt12(pad(k.getUTCHours())+":"+pad(k.getUTCMinutes()));
    var c=el.querySelector(".lvClk"); if(c && c.textContent!==s){ var v=document.getElementById("view"), st=v.scrollTop; render(); v.scrollTop=st; } }, 15000));
}

// ---------- 0.3.1 SYNC TO THE PHONE'S CALENDAR (Google Calendar, Outlook, Samsung, Exchange…) ----------
// The app writes its items into a calendar chosen on the phone (Native.calSync via CalendarContract); that calendar's account
// syncs them to Google / Outlook. Re-syncing updates changed items and removes ones no longer there; only events this app
// made are touched. S.cs = {on, cal, calName, acc, ty:{is,ph,fast,pray,rem,meal,period,priv}, last, res}.
function csCfg(){ var c=S.cs||{}; c.ty=c.ty||{is:true, ph:true, fast:true, pray:false, rem:true, meal:true, period:false, priv:true}; return c; }
function csItems(){
  var c=csCfg(), ty=c.ty, out=[], base=new Date(); base.setHours(12,0,0,0);
  var day=function(k,ds,t,d,n){ out.push({k:k, day:ds, t:t, d:d||"", days:n||1}); };
  // Islamic days, public holidays (1 year), sunnah fasts (60 days): all-day
  if(ty.is||ty.ph||ty.fast){ for(var y=base.getFullYear(); y<=base.getFullYear()+1; y++){ if(!HOLIDAYS.some(function(hd){ return hd[0].slice(0,4)===String(y) && /Aidilfitri/.test(hd[1]) && !/anggaran/.test(hd[1]); })) addIslamicHolidays(y); }
    for(var i=0;i<366;i++){ var d=addDays(base,i), ds=ymd(d), h=hijriOf(d), keys=[], hs=hijriStr(h);
      var add=function(pfx,t){ var k=evKey(t); if(keys.some(function(x){ return x && k && (x.indexOf(k)>=0 || k.indexOf(x)>=0); })) return; keys.push(k); day(pfx+ds+"-"+strHash(t), ds, t, hs); };
      if(ty.is) islamicOn(d).forEach(function(x){ add("is-", "☪️ "+tr(x)); });
      if(ty.ph) holidaysOn(ds,false).forEach(function(x){ add("ph-", "🇲🇾 "+tr(x)); });
      if(ty.fast && i<60) sunnahFastOn(d).forEach(function(x){ add("fs-", "🌙 "+tr(x)); }); } }
  // prayer times (7 days): timed, from the start of each prayer to the next
  if(ty.pray){ var nx={subuh:"syuruk", zohor:"asar", asar:"maghrib", maghrib:"isyak"};
    for(var j=0;j<7;j++){ var dj=addDays(base,j), dsj=ymd(dj), t=getDay(dj);
      PR.forEach(function(k){ if(!t[k]) return; var s0=at(dsj,t[k]).getTime(), e0=nx[k]&&t[nx[k]] ? at(dsj,t[nx[k]]).getTime() : s0+60*60000;
        out.push({k:"pr-"+dsj+"-"+k, s:s0, e:Math.min(e0, s0+90*60000), t:"🕌 "+T((k==="zohor"&&dj.getDay()===5)?"jumaat":k)+" "+fmt12(t[k]), d:zoneShort()}); }); } }
  // reminders already worked out for notifications: bills, debts, birthdays, Majlis events & tasks, baby vaccines, workouts
  if(ty.rem){ try{ buildExtras().forEach(function(x){ if(/^(imsak|syuruk|end|tahajjud|mp|me|fast|qkahf|qyas|qmulk|qday|jn)/.test(x.id)) return; out.push({k:"rm-"+x.id, s:x.t, e:x.t+30*60000, t:x.title, d:x.body||""}); }); }catch(e){} }
  // meal plan (Halal › Rancang)
  if(ty.meal){ var mp=load("ihsan_rcp_plan",{}), rs=load("ihsan_recipes",[]), t0=ymd(new Date());
    Object.keys(mp).forEach(function(ds){ if(ds<t0) return; (mp[ds]||[]).forEach(function(id){ var r=rs.filter(function(x){ return x.id===id; })[0]; if(r) day("ml-"+ds+"-"+id, ds, "🍽️ "+r.title, L2x("Menu dari My Ihsan","Menu from My Ihsan")); }); }); }
  // period (Kalendar › Haid): only when switched on; private titles unless the person chooses otherwise
  if(ty.period && window.PeriodView && !periodHidden()) out=out.concat(PeriodView.syncItems(perH(), ty.priv!==false));
  return out;
}
var csBusy=false;
function csRun(manual, cb){
  var c=csCfg();
  if(!(window.Native && N.calSync)){ if(manual) toast(L2x("Penyegerakan kalendar hanya dalam aplikasi telefon","Calendar sync works in the phone app")); return; }
  if(!N.hasPerm("calendar")){ if(!manual) return; var hp=function(p){ if(p.which!=="calendar") return; off("perm",hp); if(p.granted) csRun(true, cb); else toast(L2x("Perlu kebenaran kalendar","Calendar permission is needed")); }; on("perm",hp); N.requestPerm("calendar"); return; }
  if(!c.cal){ if(manual) csPick(cb); return; }
  if(csBusy) return; csBusy=true;
  var go_=function(){ var items=csItems(), id="cs"+Date.now(), h=function(r){ if(r.id!==id) return; off("calsync",h); csBusy=false;
      if(r.error){ if(manual) toast(L2x("Penyegerakan gagal: ","Sync failed: ")+r.error); return; }
      c.last=Date.now(); c.res=r; S.cs=c; saveS(); if(manual) toast("📅 "+L2x("Disegerakkan: ","Synced: ")+r.added+L2x(" baharu, "," new, ")+r.updated+L2x(" dikemas kini, "," updated, ")+r.removed+L2x(" dibuang"," removed")); if(cb) cb(r); };
    on("calsync",h); N.calSync(id, String(c.cal), JSON.stringify(items)); };
  if(c.ty.period && !window.PeriodView && !periodHidden()) loadJs(PERJS, go_, go_); else go_();
}
function csPick(cb){
  var l=[]; try{ l=JSON.parse(N.calList()||"[]"); }catch(e){}
  if(!l.length){ showSheet("📅 "+L2x("Tiada kalendar","No calendars"), '<div class="small" style="line-height:1.5">'+L2x("Tiada kalendar yang boleh ditulis pada telefon ini. Tambah akaun Google (Tetapan › Akaun) atau hidupkan \"Segerak kalendar\" dalam aplikasi Outlook, kemudian cuba lagi.","No writable calendars on this phone. Add a Google account (Settings › Accounts) or turn on \"Sync calendars\" in the Outlook app, then try again.")+'</div>'); return; }
  var kind=function(x){ var t=(x.type||"").toLowerCase(); return /google/.test(t)?"Google":/outlook|microsoft|exchange|office/.test(t)?"Outlook":/samsung/.test(t)?"Samsung":/local|phone/.test(t)?L2x("Telefon sahaja","Phone only"):x.type; };
  var ov=showSheet("📅 "+L2x("Pilih kalendar","Choose a calendar"), '<div class="mut small" style="margin-bottom:8px">'+L2x("Acara My Ihsan akan ditulis ke kalendar ini dan disegerakkan oleh akaunnya.","My Ihsan events will be written to this calendar and synced by its account.")+'</div>'+
    l.map(function(x,i){ return '<button class="hhist" data-csc="'+i+'"><span style="width:12px;height:12px;border-radius:50%;background:'+esc(x.color)+';flex:none"></span><span class="hhs"><b>'+esc(x.name)+'</b> · '+esc(kind(x))+'<br><small class="mut">'+esc(x.account||"")+'</small></span></button>'; }).join(""));
  ov.querySelectorAll("[data-csc]").forEach(function(b){ b.onclick=function(){ var x=l[+b.getAttribute("data-csc")], c=csCfg(); c.cal=x.id; c.calName=x.name; c.acc=x.account+" · "+kind(x); c.on=true; S.cs=c; saveS(); closeOverlay(); csRun(true, function(){ render(); if(cb) cb(); }); }; });
}
function csCard(){
  var c=csCfg(), ty=c.ty, chip=function(k,ic,ms,en){ return '<button class="chip'+(ty[k]?' on':'')+'" data-cst="'+k+'">'+ic+' '+L2x(ms,en)+'</button>'; };
  return '<div class="card cscard"><h3>📅 '+L2x("Segerak ke Google / Outlook","Sync to Google / Outlook")+'</h3>'+
    '<div class="small" style="line-height:1.45">'+(c.on&&c.cal?'✅ '+esc(c.calName||"")+' <span class="mut">('+esc(c.acc||"")+')</span>'+(c.last?'<br><span class="mut tiny">'+L2x("Terakhir: ","Last: ")+new Date(c.last).toLocaleString(locTag(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+(c.res?' · '+(c.res.added+c.res.updated+c.res.kept)+L2x(" acara"," events"):'')+'</span>':''):L2x("Tulis hari Islam, cuti, puasa sunat, peringatan, menu dan lain-lain ke kalendar telefon anda; akaun Google atau Outlook menyegerakkannya ke mana-mana peranti.","Write Islamic days, holidays, sunnah fasts, reminders, menus and more into your phone's calendar; its Google or Outlook account syncs them everywhere."))+'</div>'+
    '<div class="rseg" style="margin:10px 0 6px;display:flex;flex-wrap:wrap;gap:6px">'+chip("is","☪️","Hari Islam","Islamic days")+chip("ph","🇲🇾","Cuti umum","Public holidays")+chip("fast","🌙","Puasa sunat","Sunnah fasts")+chip("rem","🔔","Peringatan","Reminders")+chip("meal","🍽️","Menu dirancang","Planned meals")+chip("pray","🕌","Waktu solat (7 hari)","Prayer times (7 days)")+(periodHidden()?'':chip("period","🌸","Haid (jangkaan)","Period (expected)")+(ty.period?chip("priv","🔒","Tajuk peribadi","Private titles"):''))+'</div>'+
    (ty.rem?'<div class="mut tiny" style="margin:-2px 0 6px">🔔 '+L2x("Peringatan: bil & hutang, hari lahir, majlis & tugasan, vaksin bayi, senaman (10 hari ke depan).","Reminders: bills & debts, birthdays, events & tasks, baby vaccines, workouts (next 10 days).")+'</div>':'')+
    (ty.period&&!ty.priv?'<div class="mut tiny" style="margin-bottom:6px">⚠ '+L2x("Tajuk haid akan kelihatan kepada sesiapa yang berkongsi kalendar ini.","Period titles will be visible to anyone this calendar is shared with.")+'</div>':'')+
    '<div class="btns">'+(c.on&&c.cal?'<button class="btn gold" id="csNow">🔄 '+L2x("Segerak sekarang","Sync now")+'</button><button class="btn alt" id="csPick">'+L2x("Tukar kalendar","Change calendar")+'</button><button class="btn alt" id="csOff">'+L2x("Tutup & buang acara","Turn off & remove events")+'</button>':'<button class="btn gold" id="csOn">📅 '+L2x("Pilih kalendar & hidupkan","Choose a calendar & turn on")+'</button>')+'</div>'+
    '<details class="small" style="margin-top:8px"><summary class="mut">'+L2x("Google, Outlook & cara ia berfungsi","Google, Outlook & how it works")+'</summary><div class="mut" style="line-height:1.45;margin-top:6px">'+
    L2x("Google: akaun Google mesti ada pada telefon (Tetapan › Akaun). Outlook: dalam aplikasi Outlook, buka Tetapan › akaun anda › hidupkan \"Segerak kalendar\", kemudian pilih kalendar Outlook di sini. Aplikasi menyegerak secara automatik apabila dibuka (paling kerap setiap 6 jam) dan hanya mengubah acara yang dibuatnya sendiri.","Google: the Google account must be on the phone (Settings › Accounts). Outlook: in the Outlook app open Settings › your account › turn on \"Sync calendars\", then choose the Outlook calendar here. The app syncs by itself when opened (at most every 6 hours) and only changes events it made itself.")+'</div></details></div>';
}
function bindCs(el){
  el.querySelectorAll("[data-cst]").forEach(function(b){ b.onclick=function(){ var c=csCfg(), k=b.getAttribute("data-cst"); c.ty[k]=!c.ty[k]; S.cs=c; saveS(); render(); }; });
  var on_=el.querySelector("#csOn"); if(on_) on_.onclick=function(){ csRun(true); };
  var nw=el.querySelector("#csNow"); if(nw) nw.onclick=function(){ csRun(true, function(){ render(); }); };
  var pk=el.querySelector("#csPick"); if(pk) pk.onclick=function(){ csPick(); };
  var of=el.querySelector("#csOff"); if(of) of.onclick=function(){ var c=csCfg(); if(!c.cal || !(window.Native && N.calSync)) return; var id="cs"+Date.now(), h=function(r){ if(r.id!==id) return; off("calsync",h); toast(L2x("Acara My Ihsan dibuang: ","My Ihsan events removed: ")+(r.removed||0)); }; on("calsync",h); N.calSync(id, String(c.cal), "[]"); c.on=false; S.cs=c; saveS(); render(); };
}
on("resume", function(){ var c=csCfg(); if(c.on && c.cal && Date.now()-(c.last||0) > 6*36e5) csRun(false); });
setTimeout(function(){ var c=csCfg(); if(c.on && c.cal && Date.now()-(c.last||0) > 6*36e5) csRun(false); }, 4000);

// ---------- CALENDAR EXPORT + MONTHLY TIMETABLE (idea 74) ----------
function icsEsc(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"); }
function icsFold(line){ var out=[], s=line; while(s.length>73){ out.push(s.slice(0,73)); s=" "+s.slice(73); } out.push(s); return out.join("\r\n"); }
function evKey(t){ return String(t).toLowerCase().replace(/\(.*?\)/g,"").replace(/hari raya|hari kedua/g,"").replace(/[^a-z]/g,""); }
function buildIcs(o){
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Ihsan//Calendar 0.11//MS","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:"+icsEsc(L2x("My Ihsan: hari Islam","My Ihsan: Islamic days"))];
  var stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""), n=0, start=new Date(); start.setHours(12,0,0,0);
  var end=addDays(start, o.m===6?183:366);
  for(var y=start.getFullYear(); y<=end.getFullYear(); y++){ if(!HOLIDAYS.some(function(hd){ return hd[0].slice(0,4)===String(y) && /Aidilfitri/.test(hd[1]) && !/anggaran/.test(hd[1]); })) addIslamicHolidays(y); }
  for(var d=new Date(start); d<end; d=addDays(d,1)){
    var ds=ymd(d), ev=[], keys=[], h=hijriOf(d), est=h && h.src!=="jakim";
    var push=function(t){ var k=evKey(t); if(keys.some(function(x){ return x && k && (x.indexOf(k)>=0 || k.indexOf(x)>=0); })) return; keys.push(k); ev.push(t); };
    if(o.is) islamicOn(d).forEach(function(x){ push(tr(x)); });
    if(o.ph) holidaysOn(ds,false).forEach(function(x){ push(tr(x)); });
    if(o.bidh||o.mk) sunnahFastOn(d).forEach(function(x){ var mk=/Isnin|Khamis/.test(x.ms); if(mk?o.mk:o.bidh) push(tr(x)); });
    ev.forEach(function(t){ n++; var d1=ds.replace(/-/g,""), d2=ymd(addDays(d,1)).replace(/-/g,"");
      L.push("BEGIN:VEVENT","UID:"+d1+"-"+strHash(t)+"@my.ihsan.app","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+d1,"DTEND;VALUE=DATE:"+d2,
        "SUMMARY:"+icsEsc(t),"DESCRIPTION:"+icsEsc(hijriStr(h)+(est?" ("+L2x("tarikh Hijrah anggaran","estimated Hijri date")+")":"")),"TRANSP:TRANSPARENT","END:VEVENT"); });
  }
  L.push("END:VCALENDAR");
  return {text:L.map(icsFold).join("\r\n")+"\r\n", n:n};
}
function icsOut(o, share){
  var r=buildIcs(o); if(!r.n){ toast(L2x("Pilih sekurang-kurangnya satu jenis","Choose at least one type")); return; }
  var name="my-ihsan-"+ymd(new Date())+".ics";
  if(window.Native && N.openTextFile){
    var h=function(x){ off("fileOpen",h); if(!x.ok && !share){ toast(L2x("Tiada aplikasi kalendar yang boleh membuka fail ini. Kongsi fail itu, kemudian import di Google Calendar.","No calendar app here can open this file. Share it, then import it in Google Calendar.")); N.openTextFile(name,"text/calendar",r.text,true); } };
    on("fileOpen",h); N.openTextFile(name,"text/calendar",r.text,!!share);
  } else downloadText(name,"text/calendar",r.text);
  toast(r.n+L2x(" acara disediakan"," events prepared"));
}
function calExportSheet(){
  var o=load("ihsan_icsopt",{is:true, ph:true, bidh:true, mk:false, m:12}), en=en_(), MO=en?ME:MS;
  var tm=cal.mode==="h"?parseYmd(cal.sel):new Date(cal.y==null?new Date().getFullYear():cal.y, cal.m==null?new Date().getMonth():cal.m, 1);
  var tg=function(k,label){ return '<button class="chip '+(o[k]?"on":"")+'" data-ix="'+k+'">'+label+'</button>'; };
  var body='<div class="small" style="margin-bottom:6px">'+L2x("Masukkan hari kebesaran, cuti dan puasa sunat ke dalam aplikasi kalendar telefon anda (fail .ics).","Add Islamic days, holidays and sunnah fasts to your phone's calendar app (.ics file).")+'</div>'+
    '<div class="chips" style="flex-wrap:wrap">'+tg("is",L2x("Hari kebesaran Islam","Islamic days"))+tg("ph",L2x("Cuti umum (negeri saya)","Public holidays (my state)"))+tg("bidh","Ayyamul Bidh")+tg("mk",L2x("Isnin & Khamis","Mon & Thu"))+'</div>'+
    '<div class="set"><span>'+L2x("Tempoh","Period")+'</span>'+chipSet("data-im",o.m,[[6,L2x("6 bulan","6 months")],[12,L2x("12 bulan","12 months")]])+'</div>'+
    '<div class="btns"><button class="btn gold" id="ixOpen">📅 '+L2x("Buka dalam kalendar","Open in calendar")+'</button><button class="btn alt" id="ixShare">📤 '+L2x("Kongsi fail","Share file")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2x("Tarikh Hijrah masa depan ialah anggaran sehingga pengisytiharan rasmi.","Future Hijri dates are estimates until the official announcement.")+'</div>'+
    '<h3 style="margin:16px 0 6px">🕌 '+L2x("Jadual waktu solat bulanan","Monthly prayer timetable")+'</h3><div class="small">'+L2x("Gambar jadual ","A timetable image for ")+'<b>'+MO[tm.getMonth()]+' '+tm.getFullYear()+'</b>'+L2x(" untuk zon anda, sedia untuk dikongsi atau dicetak."," for your zone, ready to share or print.")+'</div>'+
    '<button class="btn alt full" id="ixTt" style="margin-top:8px">🖼 '+L2x("Buat gambar jadual","Make the timetable image")+'</button>';
  var ov=showSheet("⇪ "+L2x("Eksport","Export"), body);
  var sv=function(){ save("ihsan_icsopt",o); };
  ov.querySelectorAll("[data-ix]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-ix"); o[k]=!o[k]; b.classList.toggle("on",o[k]); sv(); }; });
  ov.querySelectorAll("[data-im]").forEach(function(b){ b.onclick=function(){ o.m=+b.getAttribute("data-im"); ov.querySelectorAll("[data-im]").forEach(function(x){ x.classList.toggle("on",x===b); }); sv(); }; });
  ov.querySelector("#ixOpen").onclick=function(){ icsOut(o,false); };
  ov.querySelector("#ixShare").onclick=function(){ icsOut(o,true); };
  ov.querySelector("#ixTt").onclick=function(){ timetableImage(tm.getFullYear(), tm.getMonth()); };
}
function timetableImage(y, m){
  var en=en_(), MO=en?ME:MS, WD=en?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"], dim=new Date(y,m+1,0).getDate(), rows=[], jk=true, tds=ymd(new Date());
  for(var d=1; d<=dim; d++){ var dt=new Date(y,m,d), t=getDay(dt); if(t.src!=="jakim") jk=false; rows.push({dt:dt, t:t, h:hijriOf(dt)}); }
  var cols=["imsak","subuh","syuruk","zohor","asar","maghrib","isyak"], W=1080, top=250, rh=50, Hh=top+rh*(dim+1)+170;
  var cv=document.createElement("canvas"); cv.width=W; cv.height=Hh; var x=cv.getContext("2d");
  var g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#0e6b45"); g.addColorStop(1,"#07130d"); x.fillStyle=g; x.fillRect(0,0,W,Hh);
  x.strokeStyle="#c9a646"; x.lineWidth=5; x.strokeRect(30,30,W-60,Hh-60);
  var h1=rows[0].h, h2=rows[dim-1].h, z=overseasNow()?L2x("Lokasi semasa","Current location"):(S.zone+" · "+zoneById(S.zone)[2]);
  x.textAlign="center"; x.fillStyle="#c9a646"; x.font="700 46px sans-serif"; x.fillText(L2x("Waktu Solat ","Prayer Times ")+MO[m]+" "+y, W/2, 100);
  x.fillStyle="#e8efe9"; x.font="26px sans-serif"; var zl=wrapLines(x, z, W-160); x.fillText(zl[0], W/2, 145);
  if(h1&&h2){ x.fillStyle="#c9a646"; x.font="24px sans-serif"; x.fillText(HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H", W/2, 185); }
  var cx=[60,172], cw=(W-60-305)/7, HS=["Muh","Saf","R.Awal","R.Akhir","J.Awal","J.Akhir","Rejab","Syaaban","Ramadan","Syawal","Zulkaedah","Zulhijjah"]; for(var i=0;i<7;i++) cx.push(305+i*cw);
  var head=[L2x("Tarikh","Date"),L2x("Hijrah","Hijri")].concat(cols.map(function(k){ return k==="imsak"?"Imsak":k==="syuruk"?L2x("Syuruk","Sunrise"):T(k); }));
  x.fillStyle="#c9a646"; x.font="700 22px sans-serif";
  head.forEach(function(t,i){ x.textAlign=i<2?"left":"center"; x.fillText(t, i<2?cx[i]:cx[i]+cw/2, top); });
  var t12=function(hm0){ if(!hm0) return "--"; var a=hm0.split(":"), hh=+a[0]%12||12; return hh+":"+a[1]; };
  rows.forEach(function(r,i){ var yy=top+rh*(i+1), fri=r.dt.getDay()===5, td=ymd(r.dt)===tds;
    if(fri){ x.fillStyle="rgba(201,166,70,.18)"; x.fillRect(44,yy-rh+14,W-88,rh); }
    else if(i%2){ x.fillStyle="rgba(255,255,255,.05)"; x.fillRect(44,yy-rh+14,W-88,rh); }
    if(td){ x.strokeStyle="#ffffff"; x.lineWidth=2; x.strokeRect(46,yy-rh+15,W-92,rh-2); }
    x.fillStyle="#ffffff"; x.font=(fri?"700 ":"")+"24px sans-serif"; x.textAlign="left";
    x.fillText(r.dt.getDate()+" "+WD[r.dt.getDay()], cx[0], yy);
    x.fillStyle="#c9d8cd"; x.font="22px sans-serif"; x.fillText(r.h?(r.h.d+((r.h.d===1||i===0)?" "+HS[r.h.m-1]:"")):"", cx[1], yy);
    x.fillStyle="#ffffff"; x.font="24px sans-serif"; x.textAlign="center";
    cols.forEach(function(k,j){ x.fillText(t12(r.t[k]), cx[j+2]+cw/2, yy); });
  });
  x.textAlign="center"; x.fillStyle="#a9b8ae"; x.font="italic 22px sans-serif";
  x.fillText((jk?L2x("Sumber: JAKIM e-Solat","Source: JAKIM e-Solat"):L2x("Sebahagian waktu ialah anggaran kiraan (data JAKIM belum dimuat)","Some times are calculated estimates (JAKIM data not loaded)"))+" · "+L2x("format 12 jam","12-hour format"), W/2, Hh-105);
  x.fillStyle="#c9a646"; x.font="600 28px sans-serif"; x.fillText("My Ihsan", W/2, Hh-62);
  var url=cv.toDataURL("image/png"), txt=L2x("Waktu Solat ","Prayer Times ")+MO[m]+" "+y+" · "+z;
  if(window.Native && N.shareImage) N.shareImage(url, txt);
  else { var a=document.createElement("a"); a.href=url; a.download="waktu-solat-"+y+"-"+pad(m+1)+".png"; document.body.appendChild(a); a.click(); a.remove(); }
}

// ================= 0.13.0: family & personal (ideas 76 to 80) and auto silent at the masjid (62) =================
// ---------- parent PIN: used by the kids lock (77) and the journal lock (80) ----------
function pinData(){ return load("ihsan_pin",null); }
function pinHas(){ var p=pinData(); return !!(p && p.h); }
function pinHash(pin, salt){ return strHash(salt+"|"+pin+"|ibadah")+strHash(pin+"#"+salt+"#"+pin.length); }
function pinPad(title, sub, check, extra){
  var ov=showSheet(title, '<div class="mut small" style="text-align:center">'+sub+'</div><div class="pinDots" id="pinD"><i></i><i></i><i></i><i></i></div><div class="pinErr" id="pinE"></div>'+
    '<div class="pinPad">'+["1","2","3","4","5","6","7","8","9","⌫","0","✓"].map(function(k){ return '<button data-pk="'+k+'"'+(k==="✓"?' class="ok"':'')+'>'+k+'</button>'; }).join("")+'</div>'+(extra||''));
  var v="", D=ov.querySelectorAll("#pinD i"), E=ov.querySelector("#pinE"), box=ov.querySelector("#pinD");
  var draw=function(){ Array.prototype.forEach.call(D,function(d,i){ d.classList.toggle("on", i<v.length); }); };
  var submit=function(){ if(v.length<4){ E.textContent=L2x("Masukkan 4 angka","Enter 4 digits"); return; } var r=check(v); if(r===true) return; E.textContent=r||""; v=""; draw(); box.classList.add("shake"); setTimeout(function(){ box.classList.remove("shake"); },420); N.vibrate(80); };
  Array.prototype.forEach.call(ov.querySelectorAll("[data-pk]"), function(b){ b.onclick=function(){ var k=b.getAttribute("data-pk");
    if(k==="⌫") v=v.slice(0,-1); else if(k==="✓"){ submit(); return; } else if(v.length<4){ v+=k; if(v.length===4){ draw(); setTimeout(submit,150); return; } }
    E.textContent=""; draw(); }; });
  return ov;
}
function pinSet(done){
  var first="";
  pinPad("🔐 "+L2x("Tetapkan PIN ibu bapa","Set a parent PIN"), L2x("Pilih 4 angka yang anak tidak tahu.","Choose 4 digits your child does not know."), function(p){
    first=p;
    setTimeout(function(){ pinPad("🔐 "+L2x("Sahkan PIN","Confirm the PIN"), L2x("Masukkan PIN yang sama sekali lagi.","Enter the same PIN again."), function(p2){
      if(p2!==first) return L2x("PIN tidak sama. Cuba lagi.","The PINs do not match. Try again.");
      var salt=Date.now().toString(36); save("ihsan_pin",{h:pinHash(p2,salt), s:salt}); closeOverlay(); toast(L2x("PIN disimpan","PIN saved")); if(done) done(); return true; }); },0);
    return true; });
}
function pinAsk(title, ok){
  if(!pinHas()){ ok(); return; }
  var P=pinData();
  var ov=pinPad("🔒 "+title, L2x("Masukkan PIN ibu bapa","Enter the parent PIN"), function(p){ if(pinHash(p,P.s)===P.h){ closeOverlay(); ok(); return true; } return L2x("PIN salah","Wrong PIN"); },
    '<button class="chip" id="pinF" style="display:block;margin:10px auto 0">'+L2x("Lupa PIN?","Forgot the PIN?")+'</button>');
  ov.querySelector("#pinF").onclick=function(){
    var a=12+Math.floor(Math.random()*8), b=6+Math.floor(Math.random()*4);
    var o2=showSheet("🔐 "+L2x("Lupa PIN","Forgot the PIN"), '<div class="small" style="line-height:1.5">'+L2x("Untuk ibu bapa: jawab soalan ini untuk menetapkan PIN baharu.","For parents: answer this to set a new PIN.")+'</div><div style="font-size:26px;font-weight:700;text-align:center;margin:12px 0">'+a+' × '+b+' = ?</div><input id="pfA" type="number" inputmode="numeric" class="ilq" style="text-align:center"><button class="btn gold full" id="pfGo">'+L2x("Semak","Check")+'</button>');
    o2.querySelector("#pfGo").onclick=function(){ if(+o2.querySelector("#pfA").value===a*b) pinSet(ok); else { toast(L2x("Jawapan salah","Wrong answer")); closeOverlay(); } };
  };
}

// ---------- 77: kids profiles and the kids lock ----------
var KID_KEYS=["ihsan_kids","ihsan_sirah_kids","ihsan_hijaiyah","ihsan_sbk","ihsan_jamma"], KID_EMO=["🌸","⭐","🌙","🐪","🌴","🦋","🐢","🍉","🚀","🌈"];
function kprof(){ var p=load("ihsan_kprof",{list:[],cur:null}); p.list=p.list||[]; return p; }
function kidStash(id){ var o={}; KID_KEYS.forEach(function(k){ var v=null; try{ v=localStorage.getItem(k); }catch(e){} if(v!=null) o[k]=v; }); save("ihsan_kp_"+id,o); }
function kidLoad(id){ var o=load("ihsan_kp_"+id,{}); KID_KEYS.forEach(function(k){ try{ if(o[k]!=null) localStorage.setItem(k,o[k]); else localStorage.removeItem(k); }catch(e){} }); }
function kidClear(){ KID_KEYS.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} }); }
function kidSwitch(id){ var p=kprof(); if(p.cur===id) return; if(p.cur) kidStash(p.cur); kidLoad(id); p.cur=id; save("ihsan_kprof",p); }
function kidAdd(name, emo){ var p=kprof(), id="k"+Date.now().toString(36);
  if(p.list.length && p.cur){ kidStash(p.cur); kidClear(); } // the first child keeps the progress already on the phone
  p.list.push({id:id, n:name, e:emo}); p.cur=id; save("ihsan_kprof",p); }
function kidDel(id){ var p=kprof(); p.list=p.list.filter(function(x){ return x.id!==id; }); try{ localStorage.removeItem("ihsan_kp_"+id); }catch(e){}
  if(p.cur===id){ kidClear(); p.cur=null; if(p.list.length){ kidLoad(p.list[0].id); p.cur=p.list[0].id; } } save("ihsan_kprof",p); }
function kidCur(){ var p=kprof(); return p.list.filter(function(x){ return x.id===p.cur; })[0]||null; }
function kidAddSheet(){
  var emo=KID_EMO[kprof().list.length%KID_EMO.length];
  var ov=showSheet("＋ "+L2x("Profil anak","Child profile"), '<input id="kpN" class="ilq" maxlength="20" placeholder="'+L2x("Nama anak","Child's name")+'"><div class="kpEmo">'+KID_EMO.map(function(e){ return '<button class="chip'+(e===emo?' on':'')+'" data-ke="'+e+'">'+e+'</button>'; }).join("")+'</div>'+
    '<div class="mut tiny" style="margin:8px 0">'+(kprof().list.length?L2x("Profil baharu bermula dengan bintang dan lencana kosong.","A new profile starts with empty stars and badges."):L2x("Bintang dan lencana yang sudah ada menjadi milik profil ini.","The stars and badges already on the phone go to this profile."))+'</div><button class="btn gold full" id="kpSave">'+L2x("Simpan","Save")+'</button>');
  Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"), function(b){ b.onclick=function(){ emo=b.getAttribute("data-ke"); Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"),function(x){ x.classList.toggle("on",x===b); }); }; });
  ov.querySelector("#kpSave").onclick=function(){ var n=ov.querySelector("#kpN").value.trim(); if(!n){ toast(L2x("Tulis nama dahulu","Type a name first")); return; } kidAdd(n.slice(0,20), emo); closeOverlay(); render(); };
}
function kidManage(){
  var p=kprof();
  var ov=showSheet("⚙ "+L2x("Urus profil anak","Manage child profiles"), p.list.map(function(k){ return '<div class="kpRow"><span class="kpE">'+k.e+'</span><input data-kr="'+k.id+'" value="'+esc(k.n)+'" maxlength="20"><button class="chip" data-kd="'+k.id+'" aria-label="'+L2x("Padam","Delete")+'">🗑</button></div>'; }).join("")+
    '<button class="btn gold full" id="kpOk" style="margin-top:10px">'+L2x("Simpan nama","Save names")+'</button>'+
    '<div class="mut tiny" style="margin-top:10px;line-height:1.45">'+L2x("Setiap anak ada bintang solat, lencana Kisah Sahabat, bintang huruf dan kemajuan Jejak Sirah sendiri. Kemajuan Haji & Umrah 3D dikongsi.","Each child has their own prayer stars, Companion badges, letter stars and Sirah Trail progress. Hajj & Umrah 3D progress is shared.")+'</div>');
  ov.querySelector("#kpOk").onclick=function(){ var p2=kprof(); Array.prototype.forEach.call(ov.querySelectorAll("[data-kr]"),function(i){ p2.list.forEach(function(k){ if(k.id===i.getAttribute("data-kr") && i.value.trim()) k.n=i.value.trim().slice(0,20); }); }); save("ihsan_kprof",p2); closeOverlay(); render(); };
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kd]"), function(b){ b.onclick=function(){ var id=b.getAttribute("data-kd"), k=kprof().list.filter(function(x){ return x.id===id; })[0];
    pinAsk(L2x("Padam profil ","Delete profile ")+(k?k.n:""), function(){ kidDel(id); render(); toast(L2x("Profil dipadam","Profile deleted")); }); }; });
}
function kidLockOn(){ var go2=function(){ S.kidLock=true; saveS(); learnPg=null; learnFrom=null; go("kids"); toast(L2x("Mod kanak-kanak dikunci","Kids mode is locked")); kidPin(true); }; if(pinHas()) go2(); else pinSet(go2); }
function kidLockOff(){ pinAsk(L2x("Buka kunci mod kanak-kanak","Unlock kids mode"), function(){ if(!S.appLock) kidPin(false); S.kidLock=false; saveS(); render(); toast(L2x("Kunci dibuka","Unlocked")); }); }
// 0.31.0: screen pinning keeps the child inside the app (Home and Recents are blocked until unpinned)
function kidPin(on_){ if(!window.Native || !N.lockTask) return; N.lockTask(on_); if(on_ && !S.kidPinTip) setTimeout(kidPinTip, 900); }
function kidPinTip(){ S.kidPinTip=true; saveS();
  var b='<div class="small">'+L2x("Telefon akan bertanya \u201CSemat aplikasi?\u201D. Tekan <b>Faham / Got it</b>. Selepas itu butang Utama dan Terkini tidak berfungsi, dan butang Kembali tidak keluar dari mod kanak-kanak.","The phone will ask \u201CPin app?\u201D. Tap <b>Got it</b>. After that the Home and Recents buttons do nothing, and Back does not leave kids mode.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Supaya anak tidak boleh menyahsemat sendiri, hidupkan dalam Tetapan telefon: <b>Keselamatan › Semat aplikasi › Minta PIN sebelum nyahsemat</b>. (Nama menu berbeza ikut jenama telefon.)","So the child cannot unpin it, turn this on in phone Settings: <b>Security › App pinning › Ask for PIN before unpinning</b>. (Menu names differ by phone brand.)")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Jika telefon tidak bertanya apa-apa, hidupkan <b>Semat aplikasi</b> dahulu di tempat yang sama, kemudian kunci semula.","If the phone asks nothing, turn on <b>App pinning</b> there first, then lock again.")+'</div>'+
    '<button class="btn gold full g3d" id="kpSet" style="margin-top:10px">⚙ '+L2x("Buka Tetapan keselamatan","Open security settings")+'</button>';
  var ov=showSheet("📌 "+L2x("Kunci skrin untuk anak","Screen lock for children"), b);
  ov.querySelector("#kpSet").onclick=function(){ N.requestPerm("pinning"); };
}
function kidsTop(){
  var p=kprof(), h='<div class="kpBar">';
  if(p.list.length) h+=p.list.map(function(k){ return '<button class="chip'+(k.id===p.cur?' on':'')+'" data-kpid="'+k.id+'">'+k.e+' '+esc(k.n)+'</button>'; }).join("")+(S.kidLock?'':'<button class="chip" id="kpAdd" aria-label="'+L2x("Tambah profil","Add profile")+'">＋</button><button class="chip" id="kpMan" aria-label="'+L2x("Urus profil","Manage profiles")+'">⚙</button>');
  else if(!S.kidLock) h+='<button class="chip" id="kpAdd">＋ '+L2x("Profil anak","Child profile")+'</button>';
  h+=S.kidLock?swUnHtml("kpUnlock","kpLock"):'';
  return h+'</div>';
}
function kidsLockCard(){
  if(S.kidLock) return '';
  return '<div class="card"><h3>🔒 '+L2x("Kunci mod kanak-kanak","Lock kids mode")+'</h3><div class="small" style="line-height:1.5">'+L2x("Anak hanya boleh guna halaman ini dan pelajarannya. PIN ibu bapa diperlukan untuk keluar.","Your child can only use this page and its lessons. The parent PIN is needed to leave.")+'</div><button class="btn alt full" id="kpLockOn" style="margin-top:8px">🔒 '+L2x("Kunci sekarang","Lock now")+'</button></div>';
}
function bindKidsTop(el){
  el.querySelectorAll("[data-kpid]").forEach(function(b){ b.onclick=function(){ kidSwitch(b.getAttribute("data-kpid")); render(); }; });
  var a=el.querySelector("#kpAdd"); if(a) a.onclick=kidAddSheet;
  var m=el.querySelector("#kpMan"); if(m) m.onclick=kidManage;
  var u=el.querySelector("#kpUnlock"); if(u) swUnBind(u, kidLockOff);
  var l=el.querySelector("#kpLockOn"); if(l) l.onclick=kidLockOn;
}

// ---------- 0.38.0: app-wide lock and the 5-swipe unlock ----------
// The app lock keeps the whole app usable but fenced in: screen pinning blocks Home and Recents, Back never leaves the app,
// Tetapan is closed. Unlocking (here and in kids mode) takes 5 sideways swipes on the 🔒 handle, then the parent PIN.
// Android does not let an app change the phone's own unpin gesture; that one is guarded by the phone's
// "Ask for PIN before unpinning" setting, and the app pins itself again when it is opened while still locked.
var SWUN=5;
function swUnHtml(id, cls){ var d=""; for(var i=0;i<SWUN;i++) d+="<i></i>";
  return '<div class="swUn noswipe '+(cls||"")+'" id="'+id+'" role="button" tabindex="0" aria-label="'+L2x("Sapu 5 kali untuk buka kunci","Swipe 5 times to unlock")+'"><span class="swL">🔒</span><span class="swD">'+d+'</span><span class="swA">‹ ›</span></div>'; }
function swUnBind(el, done){
  var n=0, x0=null, y0=0, last=0, D=el.querySelectorAll(".swD i"), dir=0;
  var draw=function(){ Array.prototype.forEach.call(D,function(d,i){ d.classList.toggle("on", i<n); }); };
  var stop=function(e){ e.stopPropagation(); };
  ["touchstart","touchmove","touchend","click"].forEach(function(t){ el.addEventListener(t, stop, {passive:true}); });
  el.addEventListener("pointerdown", function(e){ x0=e.clientX; y0=e.clientY; try{ el.setPointerCapture(e.pointerId); }catch(er){} });
  el.addEventListener("pointerup", function(e){ if(x0===null) return; var dx=e.clientX-x0, dy=e.clientY-y0; x0=null;
    if(Math.abs(dx)<24 || Math.abs(dx)<Math.abs(dy)){ if(Math.abs(dx)<8 && Math.abs(dy)<8){ el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint"); toast(L2x("Sapu ke kiri dan kanan 5 kali","Swipe left and right 5 times")); } return; }
    var now=Date.now(), s=dx>0?1:-1; if(now-last>3000) n=0; last=now;
    n++; dir=s; draw(); if(N.vibrate) N.vibrate(25);
    if(n>=SWUN){ n=0; setTimeout(draw, 300); done(); } });
  el.addEventListener("pointercancel", function(){ x0=null; });
}
function appLockOn(){ var go2=function(){ S.appLock=true; saveS(); closeOverlay(); if(setOn) setShow(false); if(view==="more") go("home"); else render(); appPin(true);
    toast(L2x("Aplikasi dikunci. Sapu 🔒 di atas 5 kali untuk buka.","The app is locked. Swipe the 🔒 at the top 5 times to unlock.")); };
  if(pinHas()) go2(); else pinSet(go2); }
function appLockOff(){ pinAsk(L2x("Buka kunci aplikasi","Unlock the app"), function(){ S.appLock=false; saveS(); if(!S.kidLock) kidPin(false); render(); toast(L2x("Kunci dibuka","Unlocked")); }); }
function appPin(on_){ if(!window.Native || !N.lockTask) return; N.lockTask(on_); if(on_ && !S.appPinTip) setTimeout(appPinTip, 900); }
function appPinTip(){ S.appPinTip=true; saveS();
  var b='<div class="small">'+L2x("Telefon akan bertanya “Semat aplikasi?”. Tekan <b>Faham / Got it</b>. Selepas itu butang Utama dan Terkini tidak berfungsi, dan butang Kembali tidak keluar dari aplikasi. Semua halaman lain boleh dibuka seperti biasa, kecuali Tetapan.","The phone will ask “Pin app?”. Tap <b>Got it</b>. After that the Home and Recents buttons do nothing, and Back does not leave the app. Every other page opens as usual, except Settings.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Untuk buka kunci: sapu ikon 🔒 di bahagian atas ke kiri dan kanan <b>5 kali</b>, kemudian masukkan PIN.","To unlock: swipe the 🔒 handle at the top left and right <b>5 times</b>, then enter the PIN.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Telefon juga ada cara sendiri untuk menyahsemat (sapu atau tekan lama butang). Aplikasi tidak boleh mengubah cara itu. Supaya orang lain tidak boleh menyahsemat, hidupkan dalam Tetapan telefon: <b>Keselamatan › Semat aplikasi › Minta PIN sebelum nyahsemat</b>. Jika aplikasi dinyahsemat, ia kekal dikunci dan menyemat semula apabila dibuka.","The phone also has its own way to unpin (a swipe, or holding buttons). An app cannot change that. So nobody else can unpin, turn this on in phone Settings: <b>Security › App pinning › Ask for PIN before unpinning</b>. If the app does get unpinned, it stays locked and pins itself again when it is opened.")+'</div>'+
    '<button class="btn gold full g3d" id="apSet" style="margin-top:10px">⚙ '+L2x("Buka Tetapan keselamatan","Open security settings")+'</button>';
  var ov=showSheet("📌 "+L2x("Kunci seluruh aplikasi","Lock the whole app"), b);
  ov.querySelector("#apSet").onclick=function(){ N.requestPerm("pinning"); };
}
function appLockBar(){
  var h=document.getElementById("hBtns"); if(!h) return;
  var w=document.getElementById("apUn");
  if(S.appLock && !S.kidLock){ if(!w){ h.insertAdjacentHTML("afterbegin", swUnHtml("apUn","apUn")); w=document.getElementById("apUn"); swUnBind(w, appLockOff); } }
  else if(w) w.remove();
  var st=document.getElementById("hSet"); if(st) st.style.display = S.appLock ? "none" : "";
}
// pinned again when a locked app comes back (for example after the phone's own unpin gesture)
function lockRepin(){ if(!(S.kidLock||S.appLock) || !window.Native || !N.lockTask) return; try{ if(N.isPinned && N.isPinned()) return; }catch(e){} N.lockTask(true); }

// ---------- 78: senior mode ----------
function srDur(ms){ var m=Math.max(0,Math.round(ms/60000)), h=Math.floor(m/60); m=m%60;
  return en_() ? (h?h+(h===1?" hour ":" hours "):"")+m+(m===1?" minute":" minutes") : (h?h+" jam ":"")+m+" minit"; }
function vSenior(el){
  var np=nextPrev(), t=getDay(new Date()), cur=inDhuha()?"dhuha":currentPrayer();
  var html='<div class="snNext"><div class="snL">'+L2x("Solat seterusnya","Next prayer")+'</div><div class="snN">'+(np.next?T(np.next.k):"")+'</div><div class="snT">'+(np.next?hm12(np.next.t):"")+'</div><div class="snC" id="snCd">'+(np.next?L2x("lagi ","in ")+srDur(np.next.t-Date.now()):"")+'</div></div>';
  html+='<div class="snTimes">'+PR.map(function(k){ var c=prCell(k,t); return '<div class="'+(c.k===cur?'on':'')+'"><span>'+prN(c.k)+'</span><b>'+fmt12(c.hm)+'</b></div>'; }).join("")+'</div>';
  html+='<div class="snGrid">'+[["solat","🕰",L2x("Waktu solat","Prayer times")],["qibla","🧭",L2x("Kiblat","Qibla")],["tasbih","📿",L2x("Tasbih","Tasbih")],["doa","🤲",L2x("Doa","Doa")]].map(function(b){ return '<button data-sn="'+b[0]+'"><span>'+b[1]+'</span>'+b[2]+'</button>'; }).join("")+'</div>';
  html+='<button class="snSet" id="snSet">⚙ '+L2x("Tetapan","Settings")+'</button>';
  el.innerHTML=html;
  el.querySelectorAll("[data-sn]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-sn");
    if(k==="solat") go("solat");
    else if(k==="qibla"){ go("solat"); setTimeout(function(){ var q=document.getElementById("qCard"); if(q) q.scrollIntoView({block:"center"}); },120); }
    else if(k==="tasbih"){ sub.zikir="tasbih"; go("zikir"); }
    else go("doa"); }; });
  el.querySelector("#snSet").onclick=function(){ go("more"); };
  timers.push(setInterval(function(){ var c=document.getElementById("snCd"), n2=nextPrev(); if(!c || view!=="home" || !S.senior) return; if(!np.next || !n2.next || n2.next.k!==np.next.k){ render(); return; } c.textContent=L2x("lagi ","in ")+srDur(n2.next.t-Date.now()); }, 20000));
}

// ---------- 79: my doa list ----------
var MYDOA_CATS=[["kel","🏠","Keluarga","Family"],["sakit","🏥","Yang sakit","The sick"],["ilmu","📚","Belajar & peperiksaan","Study & exams"],["rezeki","💼","Kerja & rezeki","Work & provision"],["arwah","🕊","Yang telah pergi","Those who have passed away"],["lain","✨","Hajat lain","Other needs"]];
var MYDOA_DOA={
  kel:{ar:"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", ms:"Wahai Tuhanku, kasihanilah mereka berdua sebagaimana mereka telah mendidikku semasa kecil", en:"My Lord, have mercy on them as they brought me up when I was small", src:"Al-Quran 17:24"},
  sakit:{ar:"اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا", ms:"Ya Allah, Tuhan manusia, hilangkanlah penyakit; sembuhkanlah, Engkaulah Yang Maha Menyembuhkan; tiada penyembuhan melainkan penyembuhan-Mu, penyembuhan yang tidak meninggalkan sebarang penyakit", en:"O Allah, Lord of mankind, remove the harm and heal; You are the Healer; there is no healing but Yours, a healing that leaves no illness", src:"Sahih al-Bukhari 5743; Sahih Muslim 2191"},
  ilmu:{ar:"رَبِّ زِدْنِي عِلْمًا", ms:"Ya Tuhanku, tambahkanlah ilmuku", en:"My Lord, increase me in knowledge", src:"Al-Quran 20:114"},
  rezeki:{ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", ms:"Ya Allah, aku memohon ilmu yang bermanfaat, rezeki yang baik dan amalan yang diterima", en:"O Allah, I ask You for beneficial knowledge, good provision and accepted deeds", src:"Sunan Ibn Majah 925"},
  arwah:{ar:"اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ", ms:"Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia (tukar لَهُ kepada لَهَا bagi perempuan)", en:"O Allah, forgive him, have mercy on him, keep him safe and pardon him (use لَهَا for a woman)", src:"Sahih Muslim 963"},
  lain:{ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", ms:"Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka", en:"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire", src:"Al-Quran 2:201"}};
var doaMine=false, mdCat="kel";
function mdData(){ var d=load("ihsan_mydoa",{list:[],rp:0,rem:true}); d.list=d.list||[]; if(d.rem==null) d.rem=true; return d; }
function mdCatOf(k){ return MYDOA_CATS.filter(function(c){ return c[0]===k; })[0]||MYDOA_CATS[5]; }
function mdAgo(t){ var d=Math.floor((Date.now()-t)/864e5); return d<=0?L2x("hari ini","today"):d===1?L2x("semalam","yesterday"):d+L2x(" hari lalu"," days ago"); }
function myDoaPage(zv){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; }), ans=D.list.filter(function(x){ return x.a; });
  var html='<div class="card mdIntro"><h3>🤲 '+L2x("Doa saya","My doa list")+'</h3><div class="small" style="line-height:1.5">'+L2x("Senarai peribadi orang dan hajat yang ingin anda doakan. Disimpan dalam telefon ini sahaja.","A private list of people and needs you want to pray for. Kept on this phone only.")+'</div>'+
    '<input id="mdN" class="ilq" style="margin-top:10px" maxlength="80" placeholder="'+L2x("Contoh: Mak, Ali yang sakit, peperiksaan SPM","For example: Mum, Ali who is ill, my exams")+'">'+
    '<div class="mdCats">'+MYDOA_CATS.map(function(c){ return '<button class="chip'+(mdCat===c[0]?' on':'')+'" data-mdc="'+c[0]+'">'+c[1]+' '+L2x(c[2],c[3])+'</button>'; }).join("")+'</div>'+
    '<button class="btn gold full" id="mdAdd">＋ '+L2x("Tambah ke senarai","Add to the list")+'</button>'+
    '<div class="set" style="margin-top:8px"><span>'+L2x("Ingatkan selepas solat (kaunter rakaat)","Remind me after solat (rakaat counter)")+'</span>'+sw("mdRem",D.rem)+'</div></div>';
  if(!act.length) html+='<div class="card mut small">'+L2x("Senarai masih kosong.","The list is empty.")+'</div>';
  MYDOA_CATS.forEach(function(c){
    var xs=act.filter(function(x){ return (x.c||"lain")===c[0]; }); if(!xs.length) return;
    var d=MYDOA_DOA[c[0]];
    html+='<div class="card"><h3>'+c[1]+' '+L2x(c[2],c[3])+'</h3>'+xs.map(function(x){ return '<div class="mdRow"><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+L2x("Ditambah ","Added ")+mdAgo(x.t)+'</div></div><button class="chip" data-mda="'+x.id+'" title="'+L2x("Dimakbulkan","Answered")+'">✓</button><button class="chip" data-mdx="'+x.id+'" aria-label="'+L2x("Padam","Delete")+'">✕</button></div>'; }).join("")+
      '<details class="mdDoa"><summary>'+L2x("Doa yang sesuai","A fitting doa")+'</summary>'+arBlock(d.ar,d.ms,d.en,d.src)+'</details></div>';
  });
  if(ans.length) html+='<div class="card"><h3>🌿 '+L2x("Alhamdulillah, dimakbulkan","Alhamdulillah, answered")+'</h3>'+ans.map(function(x){ return '<div class="mdRow done"><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+new Date(x.a).toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"})+'</div></div><button class="chip" data-mdu="'+x.id+'">↺</button><button class="chip" data-mdx="'+x.id+'">✕</button></div>'; }).join("")+'</div>';
  zv.innerHTML=html;
  var upd=function(f){ var D2=mdData(); f(D2); save("ihsan_mydoa",D2); myDoaPage(zv); };
  zv.querySelectorAll("[data-mdc]").forEach(function(b){ b.onclick=function(){ mdCat=b.getAttribute("data-mdc"); zv.querySelectorAll("[data-mdc]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  zv.querySelector("#mdAdd").onclick=function(){ var n=zv.querySelector("#mdN").value.trim(); if(!n){ toast(L2x("Tulis nama atau hajat dahulu","Type a name or need first")); return; } upd(function(D2){ D2.list.unshift({id:"d"+Date.now().toString(36), n:n.slice(0,80), c:mdCat, t:Date.now(), a:0}); }); toast(L2x("Ditambah","Added")); };
  zv.querySelector("#mdRem").onchange=function(){ var on2=this.checked; upd(function(D2){ D2.rem=on2; }); };
  zv.querySelectorAll("[data-mda]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mda"); upd(function(D2){ D2.list.forEach(function(x){ if(x.id===id) x.a=Date.now(); }); }); N.vibrate(60); toast(L2x("Alhamdulillah","Alhamdulillah")); }; });
  zv.querySelectorAll("[data-mdu]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mdu"); upd(function(D2){ D2.list.forEach(function(x){ if(x.id===id) x.a=0; }); }); }; });
  zv.querySelectorAll("[data-mdx]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mdx"); upd(function(D2){ D2.list=D2.list.filter(function(x){ return x.id!==id; }); }); }; });
}
// After a prayer is counted to the end: a gentle reminder of up to 3 names, taking turns.
function myDoaRemind(){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; }); if(!D.rem || !act.length) return;
  var n=Math.min(3,act.length), st=(D.rp||0)%act.length, pick=[]; for(var i=0;i<n;i++) pick.push(act[(st+i)%act.length]);
  D.rp=(st+n)%act.length; save("ihsan_mydoa",D);
  var d=MYDOA_DOA[pick[0].c||"lain"]||MYDOA_DOA.lain;
  var ov=showSheet("🤲 "+L2x("Jangan lupa doakan","Remember to pray for"), '<div class="mdRem">'+pick.map(function(x){ return '<div>'+mdCatOf(x.c)[1]+' <b>'+esc(x.n)+'</b></div>'; }).join("")+'</div>'+arBlock(d.ar,d.ms,d.en,d.src)+
    '<div class="btns" style="margin-top:10px"><button class="btn alt" id="mdOpen">'+L2x("Buka senarai","Open the list")+'</button><button class="btn gold" id="mdOk">'+L2x("Aamiin","Aamiin")+'</button></div>');
  ov.querySelector("#mdOk").onclick=function(){ closeOverlay(); };
  ov.querySelector("#mdOpen").onclick=function(){ closeOverlay(); doaMine=true; doaFav=false; doaQ=""; go("doa"); };
}
function wMyDoa(){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; });
  return '<div class="card"><div class="row"><h3>🤲 '+L2x("Doa saya","My doa list")+'</h3><button class="chip" data-act="mydoa">'+(act.length?L2x("Semua","All"):"＋")+'</button></div>'+
    (act.length?act.slice(0,4).map(function(x){ return '<div class="small" style="padding:3px 0">'+mdCatOf(x.c)[1]+' '+esc(x.n)+'</div>'; }).join("")+(act.length>4?'<div class="mut tiny">+'+(act.length-4)+'</div>':''):'<div class="mut small">'+L2x("Tambah orang dan hajat yang ingin anda doakan.","Add people and needs you want to pray for.")+'</div>')+'</div>';
}

// ---------- 80: muhasabah journal ----------
var jnOpen=false;
function jnData(){ var j=load("ihsan_muhasabah",{d:{},lock:false}); j.d=j.d||{}; return j; }
var JN_TIPS=[["Satu perkara kecil yang menggembirakan hari ini?","One small thing that made today good?"],["Siapa yang telah membantu anda hari ini?","Who helped you today?"],["Nikmat apa yang mudah terlepas pandang?","Which blessing is easy to overlook?"]];
var JN_TIPS2=[["Satu tabiat yang ingin diperbaiki esok?","One habit to improve tomorrow?"],["Adakah solat hari ini tepat pada waktunya?","Were today's prayers on time?"],["Adakah kata-kata saya hari ini baik?","Were my words kind today?"]];
function jnLabelDate(ds){ return parseYmd(ds).toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"long"}); }
function jnCard(ds){
  if(ds>ymd(new Date())) return '';
  var J=jnData(), e=J.d[ds], locked=J.lock && !jnOpen, h='<div class="card jnC"><h3>📓 '+L2x("Muhasabah harian","Daily reflection")+(J.lock?' <span class="badge">🔒</span>':'')+'</h3>';
  if(locked) h+='<div class="mut small">'+(e?L2x("Ada catatan untuk hari ini. ","There is a note for this day. "):"")+L2x("Jurnal dikunci dengan PIN.","The journal is locked with a PIN.")+'</div><button class="chip" data-jnu="'+ds+'" style="margin-top:8px">🔓 '+L2x("Buka","Unlock")+'</button>';
  if(!locked && e && e.tt) h+='<div class="jnQ">📖 '+L2x("Tadabbur","Tadabbur")+(e.tk!=null && window.QMETA?'':'')+'</div><div class="jnA">'+esc(e.tt)+'</div>';
  if(locked){} else if(e && (e.g||e.i)) h+='<div class="jnQ">'+L2x("Saya bersyukur kerana","I am grateful for")+'</div><div class="jnA">'+esc(e.g||"·")+'</div><div class="jnQ">'+L2x("Saya ingin memperbaiki","I want to improve")+'</div><div class="jnA">'+esc(e.i||"·")+'</div><button class="chip" data-jn="'+ds+'" style="margin-top:8px">✎ '+L2x("Ubah","Edit")+'</button>';
  else h+='<div class="mut small" style="line-height:1.5">'+L2x("Dua soalan ringkas untuk menutup hari: satu perkara yang disyukuri dan satu perkara untuk diperbaiki.","Two short questions to close the day: one thing you are grateful for and one thing to improve.")+'</div><button class="btn gold" data-jn="'+ds+'" style="margin-top:8px">✎ '+L2x("Tulis","Write")+'</button>';
  return h+'</div>';
}
function jnUnlock(then){ pinAsk(L2x("Buka jurnal","Unlock the journal"), function(){ jnOpen=true; if(then) then(); else render(); }); }
function jnEdit(ds){
  var J=jnData(); if(J.lock && !jnOpen){ jnUnlock(function(){ jnEdit(ds); }); return; }
  var e=J.d[ds]||{g:"",i:""}, k=dayIndex(parseYmd(ds))%3;
  var ov=showSheet("📓 "+esc(jnLabelDate(ds)), '<label class="jnQ">'+L2x("Satu perkara yang saya syukuri","One thing I am grateful for")+'</label><textarea id="jnG" class="jnT" maxlength="600" placeholder="'+esc(L2x(JN_TIPS[k][0],JN_TIPS[k][1]))+'">'+esc(e.g)+'</textarea>'+
    '<label class="jnQ">'+L2x("Satu perkara yang ingin saya perbaiki","One thing I want to improve")+'</label><textarea id="jnI" class="jnT" maxlength="600" placeholder="'+esc(L2x(JN_TIPS2[k][0],JN_TIPS2[k][1]))+'">'+esc(e.i)+'</textarea>'+
    '<div class="set"><span>🔒 '+L2x("Kunci jurnal dengan PIN","Lock the journal with a PIN")+'</span>'+sw("jnL",J.lock)+'</div>'+
    '<div class="set"><span>🔔 '+L2x("Ingatkan saya selepas Isyak","Remind me after Isyak")+'</span>'+sw("jnR",S.jnRem)+'</div>'+
    '<div class="btns" style="margin-top:8px">'+(J.d[ds]?'<button class="btn alt" id="jnDel">🗑 '+L2x("Padam","Delete")+'</button>':'')+'<button class="btn gold" id="jnSave" style="flex:1">'+L2x("Simpan","Save")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px">'+L2x("Disimpan dalam telefon ini sahaja, dan dalam fail sandaran jika anda membuatnya.","Kept on this phone only, and in your backup file if you make one.")+'</div>');
  ov.querySelector("#jnSave").onclick=function(){ var J2=jnData(), g=ov.querySelector("#jnG").value.trim(), i=ov.querySelector("#jnI").value.trim(); if(g||i) J2.d[ds]={g:g, i:i, t:Date.now()}; else delete J2.d[ds]; save("ihsan_muhasabah",J2); closeOverlay(); toast(L2x("Disimpan","Saved")); render(); };
  var dl=ov.querySelector("#jnDel"); if(dl) dl.onclick=function(){ var J2=jnData(); delete J2.d[ds]; save("ihsan_muhasabah",J2); closeOverlay(); render(); };
  ov.querySelector("#jnL").onchange=function(){ var on2=this.checked, sw2=this, setL=function(v){ var J2=jnData(); J2.lock=v; save("ihsan_muhasabah",J2); if(v) jnOpen=true; };
    if(on2 && !pinHas()){ var g0=ov.querySelector("#jnG").value, i0=ov.querySelector("#jnI").value; pinSet(function(){ setL(true); jnEdit(ds); setTimeout(function(){ var o=document.getElementById("overlay"); if(o.querySelector("#jnG")){ o.querySelector("#jnG").value=g0; o.querySelector("#jnI").value=i0; } },0); }); return; }
    if(!on2){ sw2.checked=true; pinAsk(L2x("Buang kunci jurnal","Remove the journal lock"), function(){ setL(false); render(); toast(L2x("Kunci jurnal dibuang","Journal lock removed")); }); return; }
    setL(true); };
  ov.querySelector("#jnR").onchange=function(){ S.jnRem=this.checked; saveS(); pushSchedule(); };
}
function wJournal(){
  var ds=ymd(new Date()), J=jnData(), e=J.d[ds];
  return '<div class="card"><h3>📓 '+L2x("Muhasabah hari ini","Today's reflection")+'</h3>'+(e?'<div class="small">✓ '+L2x("Sudah ditulis. Semoga Allah memberkati hari anda.","Written. May Allah bless your day.")+'</div><button class="chip" data-jn="'+ds+'" style="margin-top:6px">'+(J.lock?'🔒 ':'✎ ')+L2x("Buka","Open")+'</button>':'<div class="small mut">'+L2x("Apa yang anda syukuri hari ini?","What are you grateful for today?")+'</div><button class="btn gold" data-jn="'+ds+'" style="margin-top:6px">✎ '+L2x("Tulis","Write")+'</button>')+'</div>';
}

// ---------- 76: Raya, Ramadan and Maal Hijrah cards (patterns drawn in code; no people) ----------
var KAD_OCC=[["fitri","Aidilfitri","Eid al-Fitr"],["adha","Aidiladha","Eid al-Adha"],["ramadan","Ramadan","Ramadan"],["hijrah","Maal Hijrah","Islamic New Year"]];
var KAD_DES=[["geo","Geometri","Geometric"],["sabit","Bulan sabit","Crescent"],["ketupat","Ketupat","Ketupat"],["pelita","Pelita","Oil lamps"]];
var KAD_COL=[["hijau","#0b5d3b","#04261a","#e3bf5c","#ffffff"],["malam","#16206b","#060a26","#ecc96a","#ffffff"],["krim","#fbf3e2","#ecdcb6","#9c6c12","#3a2a10"],["maroon","#7a1636","#2a0512","#eabd62","#ffffff"]];
var KAD_COLN={hijau:["Hijau","Green"],malam:["Biru malam","Night blue"],krim:["Krim","Cream"],maroon:["Merah hati","Maroon"]};
function kadText(o){
  var hy=(nextHijriEvent(1,1,0,0)||{}).y||"", en=en_();
  return {fitri:{h:en?"Eid Mubarak":"Selamat Hari Raya Aidilfitri", s:en?"Happy Eid al-Fitr":"Maaf Zahir dan Batin", ar:"تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ", m:en?"May this Eid bring you and your family blessings, good health and joy.":"Semoga Syawal ini membawa keberkatan, kesihatan dan kegembiraan untuk anda sekeluarga."},
    adha:{h:en?"Eid al-Adha Mubarak":"Selamat Hari Raya Aidiladha", s:en?"Happy Eid al-Adha":"Salam Aidiladha", ar:"عِيدٌ مُبَارَكٌ", m:en?"May Allah accept our sacrifices and bring us closer to Him.":"Semoga pengorbanan kita diterima Allah dan mendekatkan kita kepada-Nya."},
    ramadan:{h:en?"Ramadan Mubarak":"Salam Ramadan", s:en?"A blessed month of fasting":"Ramadan Al-Mubarak", ar:"رَمَضَانُ مُبَارَكٌ", m:en?"May this Ramadan be full of mercy, forgiveness and peace.":"Semoga Ramadan ini penuh rahmat, keampunan dan ketenangan."},
    hijrah:{h:en?"Happy Islamic New Year":"Salam Maal Hijrah", s:hy?(en?hy+" AH":hy+"H"):"", ar:"كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", m:en?"May this new year bring a change for the better.":"Semoga tahun baharu ini membawa hijrah diri ke arah yang lebih baik."}}[o];
}
function kadDefaultOcc(){ var t=new Date(); t.setHours(0,0,0,0); var best=null, bd=1e9, map={ramadhan:"ramadan",fitri:"fitri",adha:"adha",muharram:"hijrah"};
  CD_EVENTS.forEach(function(e){ var ev=nextHijriEvent(e[1],e[2],e[3],e[4]); if(!ev) return; var d=ev.inProgress?0:Math.round((ev.start-t)/864e5); if(d<bd){ bd=d; best=map[e[0]]; } }); return best||"fitri"; }
function kadRand(seed){ var s=seed; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
function kadDraw(cv, K){
  var W=1080, H=1350, x=cv.getContext("2d"), C=KAD_COL.filter(function(c){ return c[0]===K.col; })[0]||KAD_COL[0], acc=C[3], fg=C[4], R=kadRand(7);
  var g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,C[1]); g.addColorStop(1,C[2]); x.fillStyle=g; x.fillRect(0,0,W,H);
  x.save();
  var star8=function(cx,cy,r){ x.beginPath(); for(var i=0;i<16;i++){ var a=Math.PI/8*i-Math.PI/2, rr=i%2?r*0.55:r; x.lineTo(cx+Math.cos(a)*rr, cy+Math.sin(a)*rr); } x.closePath(); };
  var twinkle=function(n,y0,y1){ for(var i=0;i<n;i++){ var sx=R()*W, sy=y0+R()*(y1-y0), sr=2+R()*5; x.globalAlpha=0.35+R()*0.6; x.fillStyle=acc; star8(sx,sy,sr*1.6); x.fill(); } x.globalAlpha=1; };
  if(K.des==="geo"){
    x.globalAlpha=0.16; x.strokeStyle=acc; x.lineWidth=3;
    for(var gy=-60; gy<H+120; gy+=150) for(var gx=-60+((gy/150)%2?75:0); gx<W+120; gx+=150){ star8(gx,gy,62); x.stroke(); x.beginPath(); x.rect(gx-30,gy-30,60,60); x.save(); x.translate(gx,gy); x.rotate(Math.PI/4); x.strokeRect(-30,-30,60,60); x.restore(); x.stroke(); }
    x.globalAlpha=1;
  } else if(K.des==="sabit"){
    twinkle(70,0,H*0.55);
    var mc=document.createElement("canvas"); mc.width=420; mc.height=420; var m=mc.getContext("2d"); m.fillStyle=acc; m.beginPath(); m.arc(210,210,170,0,7); m.fill(); m.globalCompositeOperation="destination-out"; m.beginPath(); m.arc(285,170,150,0,7); m.fill();
    x.drawImage(mc, W-470, 60);
    x.fillStyle=acc; star8(W-190, 300, 26); x.fill();
    x.globalAlpha=0.28; x.fillStyle=acc; var bx=0, by=H-150; x.beginPath(); x.moveTo(0,H);
    [[0,by+40],[120,by+40],[120,by-10],[150,by-90],[180,by-10],[180,by+20],[300,by+20],[320,by-40],[400,by-110],[480,by-40],[500,by+20],[560,by+20],[560,by-150],[580,by-200],[600,by-150],[600,by+10],[700,by+10],[720,by-30],[780,by-80],[840,by-30],[860,by+30],[960,by+30],[960,by-60],[985,by-120],[1010,by-60],[1010,by+40],[W,by+40],[W,H]].forEach(function(p){ x.lineTo(p[0],p[1]); });
    x.closePath(); x.fill(); x.globalAlpha=1;
  } else if(K.des==="ketupat"){
    var kt=function(cx,cy,s,rot){ x.save(); x.translate(cx,cy); x.rotate(rot);
      x.strokeStyle=acc; x.lineWidth=2; x.beginPath(); x.moveTo(0,-s*0.7-cy); x.lineTo(0,-s*0.7); x.stroke();
      x.fillStyle=acc; x.globalAlpha=0.92; x.beginPath(); x.moveTo(0,-s*0.7); x.lineTo(s*0.7,0); x.lineTo(0,s*0.7); x.lineTo(-s*0.7,0); x.closePath(); x.fill();
      x.globalAlpha=1; x.strokeStyle=C[2]; x.lineWidth=3; for(var k=-2;k<=2;k++){ var o=k*s*0.23; x.beginPath(); x.moveTo(-s*0.35+o/2, -s*0.35-o/2); x.lineTo(s*0.35+o/2, s*0.35-o/2); x.stroke(); x.beginPath(); x.moveTo(s*0.35-o/2, -s*0.35-o/2); x.lineTo(-s*0.35-o/2, s*0.35-o/2); x.stroke(); }
      x.strokeStyle=acc; x.lineWidth=5; x.beginPath(); x.moveTo(0,s*0.7); x.quadraticCurveTo(s*0.25,s*1.0,s*0.05,s*1.3); x.stroke(); x.beginPath(); x.moveTo(0,s*0.7); x.quadraticCurveTo(-s*0.3,s*0.95,-s*0.15,s*1.25); x.stroke();
      x.restore(); };
    kt(180,190,110,-0.06); kt(400,120,80,0.05); kt(W-380,140,90,-0.04); kt(W-170,210,120,0.07);
    x.globalAlpha=0.18; x.fillStyle=acc; for(var i2=0;i2<14;i2++){ var px=R()*W, py=H*0.55+R()*H*0.45; x.save(); x.translate(px,py); x.rotate(Math.PI/4); x.fillRect(-14,-14,28,28); x.restore(); } x.globalAlpha=1;
  } else {
    twinkle(40,0,H*0.5);
    var pl=function(cx,cy,s){ var gl=x.createRadialGradient(cx,cy-s*0.9,2,cx,cy-s*0.9,s*1.6); gl.addColorStop(0,"rgba(255,200,90,.55)"); gl.addColorStop(1,"rgba(255,200,90,0)"); x.fillStyle=gl; x.beginPath(); x.arc(cx,cy-s*0.9,s*1.6,0,7); x.fill();
      x.fillStyle="#ffcf5a"; x.beginPath(); x.moveTo(cx,cy-s*1.45); x.quadraticCurveTo(cx+s*0.22,cy-s*0.95,cx,cy-s*0.62); x.quadraticCurveTo(cx-s*0.22,cy-s*0.95,cx,cy-s*1.45); x.fill();
      x.fillStyle=acc; x.fillRect(cx-s*0.06,cy-s*0.66,s*0.12,s*0.2); x.beginPath(); x.moveTo(cx-s*0.18,cy-s*0.46); x.lineTo(cx+s*0.18,cy-s*0.46); x.lineTo(cx+s*0.32,cy); x.lineTo(cx-s*0.32,cy); x.closePath(); x.fill();
      x.fillRect(cx-s*0.12,cy,s*0.24,s*0.5); x.fillRect(cx-s*0.3,cy+s*0.5,s*0.6,s*0.1); };
    for(var i3=0;i3<6;i3++) pl(110+i3*172, H-90, 90);
    x.strokeStyle=acc; x.globalAlpha=0.5; x.lineWidth=2; x.beginPath(); x.moveTo(0,60); for(var lx=0; lx<=W; lx+=40) x.lineTo(lx, 60+Math.sin(lx/90)*18); x.stroke(); x.globalAlpha=1;
    for(var lx2=20; lx2<W; lx2+=60){ x.fillStyle=acc; x.globalAlpha=0.75; x.beginPath(); x.arc(lx2, 72+Math.sin(lx2/90)*18, 6, 0, 7); x.fill(); } x.globalAlpha=1;
  }
  x.restore();
  x.strokeStyle=acc; x.lineWidth=5; x.strokeRect(40,40,W-80,H-80); x.lineWidth=2; x.strokeRect(58,58,W-116,H-116);
  var arF='"AmiriL","ScheherazadeL","Noto Naskh Arabic",serif', y=K.des==="ketupat"?470:(K.des==="sabit"?520:400), maxW=W-220;
  x.textAlign="center";
  if(K.ar){ x.direction="rtl"; x.fillStyle=acc; x.font="64px "+arF; x.fillText(K.ar, W/2, y); x.direction="ltr"; y+=110; }
  x.fillStyle=fg; var hs=86; x.font="700 "+hs+"px Georgia, serif"; var hl=wrapLines(x, K.h, maxW); while(hl.length>3 && hs>56){ hs-=6; x.font="700 "+hs+"px Georgia, serif"; hl=wrapLines(x,K.h,maxW); }
  hl.forEach(function(l){ x.fillText(l, W/2, y); y+=hs*1.15; });
  if(K.s){ x.fillStyle=acc; x.font="italic 46px Georgia, serif"; x.fillText(K.s, W/2, y+8); y+=86; }
  x.fillStyle=fg; x.globalAlpha=0.94; x.font="38px sans-serif"; wrapLines(x, K.m, maxW-40).slice(0,7).forEach(function(l){ y+=52; x.fillText(l, W/2, y); }); x.globalAlpha=1;
  if(K.f){ x.fillStyle=acc; x.font="600 40px sans-serif"; x.fillText(K.f, W/2, Math.min(y+110, K.des==="pelita"?H-260:H-130)); }
}
function openCardMaker(occ){
  var P=load("ihsan_kad",{}), o=occ||kadDefaultOcc(), D0=kadText(o);
  var K={occ:o, des:P.des||"geo", col:P.col||"hijau", h:D0.h, s:D0.s, ar:D0.ar, m:D0.m, f:P.f||"", showAr:true};
  var ov=document.getElementById("overlay"); ov.className="kadov"; var closed=false;
  ov.innerHTML='<div class="kadTop"><button class="chip" id="kdX">✕</button><b>🎴 '+L2x("Kad ucapan","Greeting card")+'</b><span></span></div><div class="kadBody"><canvas id="kdCv" width="1080" height="1350"></canvas>'+
    '<div class="kadF"><div class="ilChips">'+KAD_OCC.map(function(c){ return '<button class="chip" data-ko="'+c[0]+'">'+L2x(c[1],c[2])+'</button>'; }).join("")+'</div>'+
    '<div class="ilChips">'+KAD_DES.map(function(c){ return '<button class="chip" data-kds="'+c[0]+'">'+L2x(c[1],c[2])+'</button>'; }).join("")+'</div>'+
    '<div class="ilChips">'+KAD_COL.map(function(c){ return '<button class="chip kcol" data-kc="'+c[0]+'"><i style="background:'+c[1]+';border-color:'+c[3]+'"></i>'+L2x(KAD_COLN[c[0]][0],KAD_COLN[c[0]][1])+'</button>'; }).join("")+'</div>'+
    '<label class="kL">'+L2x("Ucapan","Greeting")+'</label><input id="kdH" class="ilq" maxlength="60"><input id="kdS" class="ilq" maxlength="60">'+
    '<label class="kL">'+L2x("Mesej anda","Your message")+'</label><textarea id="kdM" class="ilq" rows="3" maxlength="260"></textarea>'+
    '<label class="kL">'+L2x("Daripada","From")+'</label><input id="kdF" class="ilq" maxlength="50" placeholder="'+L2x("Contoh: Keluarga Ahmad","For example: The Ahmad family")+'">'+
    '<div class="set"><span>'+L2x("Ucapan dalam tulisan Arab","Greeting in Arabic script")+'</span>'+sw("kdA",true)+'</div>'+
    '<div class="btns" style="margin:10px 0 18px"><button class="btn gold" id="kdWa" style="flex:1">'+L2x("Hantar ke WhatsApp","Send to WhatsApp")+'</button><button class="btn alt" id="kdSh">↗ '+L2x("Kongsi","Share")+'</button></div></div></div>';
  var cv=ov.querySelector("#kdCv"), tm=0;
  var fill=function(){ ov.querySelector("#kdH").value=K.h; ov.querySelector("#kdS").value=K.s; ov.querySelector("#kdM").value=K.m; ov.querySelector("#kdF").value=K.f;
    Array.prototype.forEach.call(ov.querySelectorAll("[data-ko]"),function(b){ b.classList.toggle("on",b.getAttribute("data-ko")===K.occ); });
    Array.prototype.forEach.call(ov.querySelectorAll("[data-kds]"),function(b){ b.classList.toggle("on",b.getAttribute("data-kds")===K.des); });
    Array.prototype.forEach.call(ov.querySelectorAll("[data-kc]"),function(b){ b.classList.toggle("on",b.getAttribute("data-kc")===K.col); }); };
  var draw=function(){ if(closed) return; kadDraw(cv, {des:K.des, col:K.col, h:K.h, s:K.s, ar:K.showAr?K.ar:"", m:K.m, f:K.f?(en_()?"From ":"Daripada ")+K.f:""}); };
  var later=function(){ clearTimeout(tm); tm=setTimeout(draw,180); };
  var keep=function(){ save("ihsan_kad",{des:K.des, col:K.col, f:K.f}); };
  fill(); try{ Promise.all([document.fonts.load('64px "AmiriL"'), document.fonts.load('64px "ScheherazadeL"')]).then(draw, draw); }catch(e){ draw(); }
  Array.prototype.forEach.call(ov.querySelectorAll("[data-ko]"),function(b){ b.onclick=function(){ K.occ=b.getAttribute("data-ko"); var t=kadText(K.occ); K.h=t.h; K.s=t.s; K.ar=t.ar; K.m=t.m; fill(); draw(); }; });
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kds]"),function(b){ b.onclick=function(){ K.des=b.getAttribute("data-kds"); keep(); fill(); draw(); }; });
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kc]"),function(b){ b.onclick=function(){ K.col=b.getAttribute("data-kc"); keep(); fill(); draw(); }; });
  ov.querySelector("#kdH").oninput=function(){ K.h=this.value; later(); };
  ov.querySelector("#kdS").oninput=function(){ K.s=this.value; later(); };
  ov.querySelector("#kdM").oninput=function(){ K.m=this.value; later(); };
  ov.querySelector("#kdF").oninput=function(){ K.f=this.value; keep(); later(); };
  ov.querySelector("#kdA").onchange=function(){ K.showAr=this.checked; draw(); };
  var out=function(pkg){ draw(); var url=cv.toDataURL("image/png"), txt=K.h+(K.s?" · "+K.s:"")+(K.f?"\n"+(en_()?"From ":"Daripada ")+K.f:"");
    if(window.Native && pkg && N.shareTo) N.shareTo(pkg, url, txt);
    else if(window.Native && N.shareImage) N.shareImage(url, txt);
    else { var a=document.createElement("a"); a.href=url; a.download=L2x("kad-","card-")+K.occ+".png"; document.body.appendChild(a); a.click(); a.remove(); } };
  ov.querySelector("#kdWa").onclick=function(){ out("com.whatsapp"); };
  ov.querySelector("#kdSh").onclick=function(){ out(""); };
  var close=function(){ closed=true; clearTimeout(tm); closeOverlay(); };
  ov.querySelector("#kdX").onclick=close; ov._close=close;
}

// ---------- 62: auto silent at the masjid ----------
function mqCfg(){ var m=S.mq||{}; m.list=m.list||[]; m.r=m.r||100; return m; }
function mqPush(){ try{ if(N.setMasjids) N.setMasjids(JSON.stringify({on:!!mqCfg().on, list:mqCfg().list})); }catch(e){} }
function mqCard(){
  var m=mqCfg(), bg=N.hasPerm("bgloc"), fine=N.hasPerm("location"), dnd=N.hasPerm("dnd");
  var h='<div class="card cmp" id="mqCard"><h3>🕌 '+L2x("Senyap automatik di masjid","Auto silent at the masjid")+'</h3><div class="mut tiny" style="line-height:1.45;margin-bottom:6px">'+L2x("Telefon disenyapkan apabila anda tiba di masjid atau surau yang disimpan, dan berbunyi semula apabila anda keluar. Lokasi diperiksa oleh telefon sahaja dan tidak dihantar ke mana-mana. Android mungkin lewat beberapa minit mengesan anda tiba atau keluar.","The phone goes silent when you arrive at a saved masjid or surau, and rings again when you leave. Your location is checked on the phone only and is not sent anywhere. Android may take a few minutes to notice you arriving or leaving.")+'</div>'+
    '<div class="set"><span>'+L2x("Hidupkan","Turn on")+'</span>'+sw("mqOn",m.on)+'</div>';
  if(m.on) h+='<div class="mqPerm"><div>'+(fine?'✅':'⚠️')+' '+L2x("Lokasi: Semasa apl digunakan","Location: While using the app")+(fine?'':' <button class="chip" id="mqBg">'+L2x("Benarkan","Allow")+'</button>')+'</div><div class="mut tiny">'+L2x("Lokasi diperiksa hanya semasa My Ihsan atau skrin utamanya dibuka. My Ihsan tidak menggunakan lokasi di latar belakang.","Location is checked only while My Ihsan or its home screen is open. My Ihsan does not use location in the background.")+'</div>'+
    '<div>'+(dnd?'✅':'ℹ️')+' '+L2x("Akses Jangan Ganggu","Do Not Disturb access")+(dnd?'':' <button class="chip" id="mqDnd">'+L2x("Benarkan","Allow")+'</button>')+'</div>'+(dnd?'':'<div class="mut tiny">'+L2x("Tanpa akses ini, telefon ditukar ke mod getar sahaja.","Without this access the phone switches to vibrate only.")+'</div>')+'</div>';
  h+=(m.list.length?m.list.map(function(x,i){ return '<div class="mqRow"><span>🕌</span><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+x.lat.toFixed(5)+', '+x.lon.toFixed(5)+' · '+x.r+' m</div></div><button class="chip" data-mqx="'+i+'" aria-label="'+L2x("Padam","Delete")+'">✕</button></div>'; }).join(""):'<div class="mut small" style="margin:6px 0">'+L2x("Belum ada masjid atau surau disimpan.","No masjid or surau saved yet.")+'</div>');
  h+='<details class="mqAdd"'+(m.list.length?'':' open')+'><summary>＋ '+L2x("Tambah masjid atau surau","Add a masjid or surau")+'</summary>'+
    '<input id="mqN" class="ilq" maxlength="60" placeholder="'+L2x("Nama, contoh: Masjid Al-Hidayah","Name, for example: Masjid Al-Hidayah")+'">'+
    '<div class="set"><span>'+L2x("Jejari","Radius")+'</span>'+chipSet("data-mqr",m.r,[[60,"60 m"],[100,"100 m"],[150,"150 m"]])+'</div>'+
    '<button class="btn alt full" id="mqHere">📍 '+L2x("Saya di masjid sekarang: simpan lokasi ini","I am at the masjid now: save this location")+'</button>'+
    '<input id="mqC" class="ilq" style="margin-top:8px" placeholder="'+L2x("Atau tampal koordinat: 3.13900, 101.68690","Or paste coordinates: 3.13900, 101.68690")+'"><button class="btn alt full" id="mqCo">'+L2x("Simpan koordinat","Save coordinates")+'</button>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2x("Dalam Google Maps, tekan lama pada masjid untuk melihat dan menyalin koordinatnya.","In Google Maps, press and hold on the masjid to see and copy its coordinates.")+'</div></details></div>';
  return h;
}
function bindMq(el){
  var c=el.querySelector("#mqCard"); if(!c) return;
  var setM=function(f){ var m=mqCfg(); f(m); S.mq=m; saveS(); mqPush(); render(); };
  var askBg=function(){ if(!N.hasPerm("location")){ var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted) askBg(); else render(); }; on("perm",hp); N.requestPerm("location"); return; }
    mqPush(); };
  c.querySelector("#mqOn").onchange=function(){ var on2=this.checked; setM(function(m){ m.on=on2; }); if(on2) askBg(); };
  var b1=c.querySelector("#mqBg"); if(b1) b1.onclick=askBg;
  var b2=c.querySelector("#mqDnd"); if(b2) b2.onclick=function(){ N.requestPerm("dnd"); };
  c.querySelectorAll("[data-mqx]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-mqx"); setM(function(m){ m.list.splice(i,1); }); }; });
  c.querySelectorAll("[data-mqr]").forEach(function(b){ b.onclick=function(){ var r=+b.getAttribute("data-mqr"); var m=mqCfg(); m.r=r; S.mq=m; saveS(); c.querySelectorAll("[data-mqr]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  var nameOf=function(){ return (c.querySelector("#mqN").value.trim()||L2x("Masjid","Masjid")).slice(0,60); };
  var addAt=function(lat,lon){ if(mqCfg().list.length>=20){ toast(L2x("Maksimum 20 tempat","20 places at most")); return; } var n=nameOf(); setM(function(m){ m.list.push({n:n, lat:+lat, lon:+lon, r:m.r||100}); m.on=true; }); toast(L2x("Disimpan: ","Saved: ")+n); if(!N.hasPerm("location")) askBg(); };
  c.querySelector("#mqHere").onclick=function(){ var hl=function(r){ off("location",hl); if(r.error){ toast(L2x("Lokasi tidak tersedia","Location unavailable")); return; } addAt(r.lat,r.lon); };
    if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } }; on("perm",hp); N.requestPerm("location"); } };
  c.querySelector("#mqCo").onclick=function(){ var mm=String(c.querySelector("#mqC").value).match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
    if(!mm || Math.abs(+mm[1])>90 || Math.abs(+mm[2])>180){ toast(L2x("Koordinat tidak sah","Coordinates not valid")); return; } addAt(+mm[1], +mm[2]); };
}

// ---------- KIDS ----------
function vKids(el){
  var K=load("ihsan_kids",{}), ds=ymd(new Date()), today=K[ds]||{}, en=en_(), n=PR.filter(function(k){return today[k];}).length;
  var html=kidsTop()+'<div class="card kids"><h3 style="font-size:22px">🧒 '+L2x("Assalamualaikum! Sudah solat hari ini?","Assalamualaikum! Have you prayed today?")+'</h3><div class="kgrid">'+PR.map(function(k){ return '<button class="kb'+(today[k]?" on":"")+'" data-kp="'+k+'"><span class="kst">'+(today[k]?"⭐":"☆")+'</span>'+T(k)+'</button>'; }).join("")+'</div>'+
    '<div class="kcount">'+n+' / 5 '+L2x("bintang hari ini","stars today")+'</div></div>';
  html+='<button class="sirahHero kids" data-sirah="kids"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>🐪 '+L2x("Jejak Sirah Nabi ﷺ","The Prophet's ﷺ Sirah Trail")+'</b><small>'+L2x("Ikut unta merentas padang pasir dan kumpul lencana!","Follow the camel across the desert and collect badges!")+'</small></span><span class="shGo">›</span></button>';
  html+=hajjHero(true);
  var hjS=Object.keys((load("ihsan_hijaiyah",{s:{}}).s)||{}).length, sbD=Object.keys((load("ihsan_sbk",{done:{}}).done)||{}).length;
  var jmS=Object.keys((load("ihsan_jamma",{s:{}}).s)||{}).length;
  html+='<button class="kHero jm" data-learn="jamma" data-from="kids" style="width:100%;margin-bottom:10px"><span class="ar">عَمَّ</span><b>'+L2x("Juz Amma","Juz Amma")+'</b><small>⭐ '+jmS+'/37 '+L2x("surah","surahs")+'</small></button>';
  html+='<div class="kHero2"><button class="kHero hj" data-learn="hijaiyah" data-from="kids"><span class="ar">ا ب ت</span><b>'+L2x("Huruf Hijaiyah","Arabic letters")+'</b><small>⭐ '+hjS+'/29</small></button>'+
    '<button class="kHero sb" data-learn="sahabat" data-from="kids" data-kmode="k"><span class="kI">🏅</span><b>'+L2x("Kisah Sahabat","Companion stories")+'</b><small>'+L2x("Lencana ","Badges ")+sbD+'/16</small></button></div>';
  var wk=''; for(var i=6;i>=0;i--){ var d=addDays(new Date(),-i), k2=K[ymd(d)]||{}, c=PR.filter(function(k){return k2[k];}).length; wk+='<div class="kd"><div class="mut tiny">'+d.toLocaleDateString(locTag(),{weekday:"short"})+'</div><div class="kds">'+(c?"⭐".repeat(Math.min(c,5)):"·")+'</div></div>'; }
  html+='<div class="card"><h3>'+L2x("Minggu ini","This week")+'</h3><div class="kweek">'+wk+'</div></div>';
  html+='<div class="card"><h3>🤲 '+L2x("Doa harian","Daily doa")+'</h3>'+KIDS_DOA.map(function(t){ var it=null; DOA.forEach(function(c){ c.items.forEach(function(x){ if(!it && x.t_ms===t) it=x; }); }); if(!it) return ''; return '<div class="kdoa"><div class="row"><b>'+esc(en?it.t_en:it.t_ms)+'</b>'+sayBtn(it.ar)+'</div><div class="ar" style="font-size:28px">'+it.ar+'</div><div class="rumi">'+esc(Rumi.conv(it.ar))+'</div><div class="tr">'+esc(tr(it))+'</div></div>'; }).join("")+'</div>';
  html+='<div class="btns" style="margin-bottom:14px"><button class="btn gold" data-learn="nabi" data-from="kids">🌿 '+L2x("Kisah Nabi","Prophet stories")+'</button><button class="btn alt" data-learn="wudhu" data-from="kids">💧 '+L2x("Cara wuduk","Wudhu")+'</button><button class="btn alt" data-learn="solat" data-from="kids">🧎 '+L2x("Cara solat","How to pray")+'</button></div>';
  html+=kidsLockCard();
  el.innerHTML=html; bindKidsTop(el);
  el.querySelectorAll("[data-kp]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-kp"); K[ds]=K[ds]||{}; K[ds][k]=!K[ds][k]; save("ihsan_kids",K); N.vibrate(60);
    var c=PR.filter(function(x){return K[ds][x];}).length; if(c===5 && K[ds][k]){ N.vibrate(600); toast(L2x("MasyaAllah! 5 bintang hari ini 🌟","MasyaAllah! 5 stars today 🌟")); } render(); }; });
}

// ---------- helpers for media.js (radio & podcast) ----------
var fSeq=0;
function nFetch(url, cb){ var id="m"+(++fSeq)+"_"+Date.now(); var h=function(r){ if(r.id!==id) return; off("fetch",h); cb(r.status, r.body); }; on("fetch",h);
  if(window.Native && N.fetchText) N.fetchText(id,url); else if(window.Native) N.fetchUrl(id,url);
  else fetch(url).then(function(r){ return r.text().then(function(t){ window.onNative("fetch",{id:id,status:r.status,body:t}); }); }).catch(function(e){ window.onNative("fetch",{id:id,status:0,body:String(e)}); }); }
window.IBH={N:N, on:on, off:off, load:load, save:save, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, render:render, go:go,
  fetch:nFetch, dockFix:dockFix, view:function(){ return view; }, learnPg:function(){ return learnPg; }, setLearn:function(p){ learnPg=p; }, durEn:durEn, cdStr:cdStr, locTag:locTag};
// ---------- 0.14.0 REORGANIZATION ----------
// Six tabs (Utama, Solat, Amalan, Ilmu, Kalendar, Alat); levels 2 and 3 sit at the bottom above the tab bar;
// settings (Tetapan) and search open from the header. Function declarations here replace the older ones of the same name.
var TABS_ALL=[["home","🏠","utama"],["solat","🕌","solat"],["sunat","✨","sunat"],["learn","📚","learn"],["cal","📅","cal"],["alat","🧰",["Alat","Tools"]]];
// 0.4.3: when My Ihsan is the phone's home screen (launcher), the Utama tab is gone: its content is the feed page on the left of the
// phone home screen and its widgets live on the phone home screen. "home" then means Solat inside the app.
function launcherOn(){ try{ if(!window.Native || !Native.homeState) return false; if(launcherOn.c==null || Date.now()-launcherOn.t>4000){ var s=JSON.parse(Native.homeState()); launcherOn.c=!!(s.on && s.def); launcherOn.t=Date.now(); } return launcherOn.c; }catch(e){ return false; } }
function homeV(){ return launcherOn() ? "solat" : "home"; }
function tabsNow(){ var t=ordered(TABS_ALL, S.tabOrder); return launcherOn() ? t.filter(function(x){ return x[0]!=="home"; }) : t; }
// 0.5.3: the person's own order (saved ids first, tabs added in a later version at the end, removed ones dropped)
function ordered(list, saved){ if(!saved || !saved.length) return list.slice(); var by={}, out=[]; list.forEach(function(x){ by[x[0]]=x; });
  saved.forEach(function(k){ if(by[k]){ out.push(by[k]); delete by[k]; } }); list.forEach(function(x){ if(by[x[0]]) out.push(x); }); return out; }
// 0.34.0 (Farah): Kewangan is no longer a bottom tab; it is the last (right-most) page of Alat, with its own pages in the bottom dock.
var SUBS={
  solat:[["waktu","🕰","Waktu","Times"],["rakaat","🧎","Rakaat","Rakaat"],["zikir","📿","Zikir","Zikir"],["kiblat","🧭","Kiblat","Qibla"],["ssunat","🌅","Solat sunat","Sunnah prayers"]],
  sunat:[["quran","📖","Al-Quran","Quran"],["doa","🤲","Doa","Doa"],["wirid","🌄","Wirid","Wirid"],["mathurat","📖","Ma'thurat","Ma'thurat"],["amal","🌱","Amal sunat","Sunnah deeds"]],
  learn:[["panduan","📘","Panduan","Guides"],["kisah","🐪","Kisah","Stories"],["bahasa","🎓","Belajar","Study"],["dengar","🎧","Dengar","Listen"],["tanya","💬","Tanya AI","Ask AI"]],
  cal:[["bulan","🗓","Bulan","Month"],["puasa","🍽","Puasa","Fasting"],["haid","🌸","Haid","Period"],["senaman","🏃","Senaman","Exercise"],["fokus","🎯","Fokus","Focus"],["statistik","📊","Statistik","Stats"]],
  fin:[["hutang","🤝","Hutang","Debts"],["komitmen","📆","Komitmen","Commitments"],["zakat","💰","Zakat","Zakat"],["wasiat","📜","Wasiat","Will"],["tukaran","💱","Tukaran","Currency"]],
  alat:[["keluarga","👨‍👩‍👧","Keluarga","Family"],["halal","🏷️","Halal","Halal"],["cari","📍","Cari","Find"],["nota","📖","Baca","Read"],["majlis","🎉","Majlis","Events"],["kewangan","💰","Kewangan","Finance"]]
};
// 0.3.0: the Haid (period) tab can be hidden (men who do not track a spouse): Kalendar sub-tabs read through this getter
function periodHidden(){ var p=load("ihsan_period",{}); return !!(p && p.who==="off"); }
// 0.5.3: every sub-tab list follows the person's order (S.subOrder); hidden Haid is filtered after ordering
var SUBS_FULL={};
Object.keys(SUBS).forEach(function(k){ var c=SUBS[k]; SUBS_FULL[k]=c; Object.defineProperty(SUBS, k, {enumerable:true, get:function(){ var l=ordered(c, (S.subOrder||{})[k]); if(WEB) l=l.filter(function(x){ return WEB_OFF.indexOf(x[0])<0; }); return k==="cal" && periodHidden() ? l.filter(function(x){ return x[0]!=="haid"; }) : l; }}); });
// Rakaat (Solat) and Al-Quran (Amalan, since 0.18.0) are the default pages each time the app starts; Panduan keeps Haji & Umrah as its default.
sunPage="quran";
// 0.19.0: Zikir moved to Solat, between Rakaat and Kiblat
if(view==="sunat" && load("ihsan_sunpage","")==="zikir") save("ihsan_sunpage","quran");
var SUB2={solat:"rakaat", learn:"panduan", cal:"bulan", alat:"keluarga", fin:"hutang"}, pandL3="haji", moreGrp=null, aiJump=false, pgKey="";
function subOf(v){ return v==="sunat"?sunPage:SUB2[v]; }
function subName(x){ return en_()?x[3]:x[2]; }
function go(v){
  if(v==="home" && launcherOn()) v="solat";
  if(S.kidLock && v!=="kids" && !(v==="learn" && learnFrom==="kids")) v="kids";
  if(S.appLock && !S.kidLock && v==="more"){ toast(L2x("Tetapan dikunci. Sapu 🔒 di atas 5 kali untuk buka.","Settings are locked. Swipe the 🔒 at the top 5 times to unlock.")); return; }
  if(v==="more"){ setShow(true); return; }
  if(setOn) setShow(false);
  if(v==="zikir"){ SUB2.solat="zikir"; v="solat"; }
  if(v==="alat" && SUB2.alat==="saham"){ SUB2.alat="kewangan"; SUB2.fin="tukaran"; finStk=true; }
  if(v==="saham"){ v="tukaran"; finStk=true; }
  if(v==="alat" && SUB2.alat==="buku"){ SUB2.alat="nota"; wrTab="buku"; }
  if(["hutang","komitmen","zakat","tukaran","wasiat"].indexOf(v)>=0){ SUB2.fin=v; v="fin"; }
  if(v==="fin"){ SUB2.alat="kewangan"; v="alat"; }
  if(["doa","mathurat","amal","wirid"].indexOf(v)>=0){ sunPage=v; save("ihsan_sunpage",v); v="sunat"; }
  if(v==="halal"){ SUB2.alat="halal"; v="alat"; }
  if(v==="qibla"){ SUB2.solat="kiblat"; v="solat"; }
  if(v==="rakaat"){ SUB2.solat="rakaat"; v="solat"; }
  if(view==="solat" && (v!=="solat" || SUB2.solat!=="kiblat")) N.stopCompass();
  if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){}
  if(v!=="more") moreGrp=null;
  view=v; save("ihsan_view", v==="more"?"home":v); render(); document.getElementById("view").scrollTop=0;
}
function setSub(tab, s){
  if(tab==="sunat"){ sunPage=s; save("ihsan_sunpage",s); } else SUB2[tab]=s;
  if(tab==="learn"){ if(window.IlmuView) try{ IlmuView.stop(); }catch(e){} learnPg=null; learnFrom=null; }
  if(tab==="solat" && s!=="kiblat") N.stopCompass();
  if(N.setVolumeKeys) N.setVolumeKeys(false);
  render(); document.getElementById("view").scrollTop=0;
}
window.onBack = function(){
  var ov=document.getElementById("overlay");
  if(sideOpen){ sideShow(false); return true; }
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(view==="learn" && (learnPg==="radio"||learnPg==="podcast") && window.IbMedia && IbMedia.back()) return true;
  if(view==="learn" && ILMU_PG[learnPg] && window.IlmuView && IlmuView.back()) return true;
 if(view==="learn" && learnPg==="jamma" && window.QuranView && QuranView.kidsBack()) return true;
  if(view==="learn" && (learnPg==="iqra" || learnPg==="tajwid") && window.BacaanView && BacaanView.back()) return true;
  if(view==="learn" && learnPg){ learnBack(); return true; }
  if(view==="sunat" && sunPage==="quran" && window.QuranView && QuranView.back()) return true;
  if(view==="more" && moreGrp){ moreGrp=null; render(); return true; }
  if(S.kidLock) return true; // 0.31.0: Back never leaves a locked kids mode
  if(window.HomeSet && HomeSet.isOpen()){ HomeSet.close(); return true; }
  if(view!==homeV()){ go(homeV()); return true; }
  return false;
};
function render(){
  ibPager=null;
  if(view==="fin"){ view="alat"; SUB2.alat="kewangan"; }
  if(WEB){ if(S.rmode!=="tap") S.rmode="tap"; Object.keys(SUB2).forEach(function(k){ if(WEB_OFF.indexOf(SUB2[k])>=0 && SUBS[k] && SUBS[k][0]) SUB2[k]=SUBS[k][0][0]; }); }
  clearTimers(); hjMemo={}; SAY=[]; SHR=[]; if(N.setVolumeKeys) N.setVolumeKeys(false);
  if(window.QuranView) QuranView.stop();
  var vEl=document.getElementById("view"); vEl.classList.remove("hasSub"); vEl.classList.remove("finv"); vEl.classList.remove("hwall"); if(window.FamView) try{ FamView.stop(); }catch(e){}
  var old=document.getElementById("subnav"); if(old) old.remove();
  var appEl=document.getElementById("app"); appEl.classList.toggle("kidlock", !!S.kidLock); appEl.classList.toggle("senior", !!S.senior && !S.kidLock);
  var nav=document.getElementById("nav");
  if(S.senior && !S.kidLock) nav.innerHTML = view==="home"?'':'<button data-v="home" class="snHome">🏠 '+L2x("Kembali ke Utama","Back to Home")+'</button>';
  else nav.innerHTML = tabsNow().map(function(n){ var lb=typeof n[2]==="string"?T(n[2]==="home"?"utama":n[2]):L2x(n[2][0],n[2][1]); return '<button data-v="'+n[0]+'" class="g3d'+(view===n[0]?" on":"")+'"><span class="ic">'+n[1]+'</span><span class="lb">'+esc(lb)+'</span></button>'; }).join("");
  nav.querySelectorAll("button").forEach(function(b){ var lb0=(b.querySelector(".lb")||b).textContent.trim(); b.setAttribute("aria-label", lb0);
    b.onclick=function(){ if(barEdit) return; var v=b.getAttribute("data-v"); if(v==="learn" && view==="learn"){ learnPg=null; learnFrom=null; } go(v); };
    b.addEventListener("contextmenu", function(e){ if((S.barSize||0)>=3 && !barEdit){ e.preventDefault(); toast(lb0); } }); });
  // level 2: sub-bar just above the tab bar
  var subs=SUBS[view];
  if(subs && !(S.senior&&!S.kidLock) && !S.kidLock){
    var cur=subOf(view), sn=document.createElement("div"); sn.id="subnav";
    sn.innerHTML=subs.map(function(x){ return '<button class="g3d'+(cur===x[0]&&!(view==="learn"&&learnPg)?" on":"")+(cur===x[0]?" cur":"")+'" data-sp="'+x[0]+'"><span>'+x[1]+'</span><b>'+esc(subName(x))+'</b></button>'; }).join("");
    appEl.appendChild(sn);
    sn.querySelectorAll("[data-sp]").forEach(function(b){ b.setAttribute("aria-label", b.textContent.trim()); b.onclick=function(){ if(barEdit) return; setSub(view, b.getAttribute("data-sp")); }; });
    vEl.classList.add("hasSub");
  }
  barEditBind();
  hdrTick(); hdrBtns();
  ({home:vHome, solat:vSolat, sunat:vSunatHub, cal:vCal, more:vMore, learn:vLearn, kids:vKids, alat:vAlat, fin:vFin, derma:vDerma, hadiah:vHadiah}[view]||vHome)(vEl);
  // 0.3 s fade and slide (up, from the left) whenever the page itself changes
  var key=view+"|"+(subOf(view)||"")+"|"+(learnPg||"")+"|"+(view==="learn"?pandL3:"")+"|"+(view==="sunat"&&sunPage==="amal"?sunTop:"")+"|"+(view==="solat"&&SUB2.solat==="ssunat"?sunCat:"")+"|"+(moreGrp||"")+(view==="alat"&&SUB2.alat==="kewangan"?"|"+SUB2.fin:"")+(view==="alat"&&SUB2.alat==="nota"?"|"+wrTab:"");
  // 0.34.1: a page reached by a finger swipe is already in place, so it gets no entrance animation (that was the jitter)
  if(key!==pgKey && IbSwipe._q){ pgKey=key; vEl.classList.remove("pgin"); }
  if(key!==pgKey){ pgKey=key; vEl.classList.remove("pgin"); void vEl.offsetWidth; vEl.classList.add("pgin");
    // 0.34.0: drop the class once the 0.3 s entrance is over; its "fill: both" would otherwise pin transform and block swipes
    clearTimeout(vEl._pgT); vEl._pgT=setTimeout(function(){ vEl.classList.remove("pgin"); }, 360); }
  barsIn(key);
  dockFix(); setTimeout(dockFix,60); setTimeout(ibArr,140); setTimeout(barGripPos,80); setTimeout(ibChips,120);
  sideMark();
  navTick();
  if(setOn) setDraw();
}
// 0.19.0: the bottom bars slide up in 0.3 s, level by level (tab bar, then level 2, then level 3), whenever that level's content changes
var barKey={n:null,s:null,d:null};
function barsIn(key){
  var up=function(e, lv){ if(!e) return; e.classList.remove("barin","bl1","bl2","bl3"); void e.offsetWidth; e.classList.add("barin","bl"+lv); };
  var nk="nav", sk=view, dk=key;
  var nav=document.getElementById("nav"), sn=document.getElementById("subnav"), dk_=document.querySelectorAll("#view .dock");
  var nNew=barKey.n!==nk, sNew=barKey.s!==sk, dNew=barKey.d!==dk;
  if(IbSwipe._q){ barKey={n:nk,s:sk,d:dk}; return; }
  if(nNew) up(nav,1);
  if(sNew || nNew) up(sn, nNew?2:1);
  if(dNew || sNew || nNew) for(var i=0;i<dk_.length;i++) up(dk_[i], nNew?3:sNew?2:1);
  barKey={n:nk,s:sk,d:dk};
}
// Header: search and settings buttons
function hdrBtns(){
  var h=document.getElementById("hBtns"); if(!h) return;
  h.style.display = S.kidLock ? "none" : "";
  var hm=document.getElementById("hMenu"); if(hm){ hm.style.display = S.kidLock ? "none" : ""; hm.onclick=function(){ sideShow(!sideOpen); }; }
  appLockBar();
  if(h._b) return; h._b=1;
  document.getElementById("hSearch").onclick=function(){ openSearch(); };
  document.getElementById("hDon").onclick=function(){ go("derma"); };
  document.getElementById("hGift").onclick=function(){ go("hadiah"); };
  document.getElementById("hSet").onclick=function(){ moreGrp=null; go("more"); };
}

// ---------- SOLAT: Waktu / Rakaat / Kiblat / Solat sunat ----------
function vSolat(el){
  var s=SUB2.solat, now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now), en=S.lang==="en", html='';
  if(s==="waktu"){
    html+='<div class="card trow">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+
      '<div class="trow2">'+["imsak","syuruk"].map(function(k){ return '<span>'+T(k)+' <b>'+fmt12(t[k])+'</b></span>'; }).join("")+'<span>'+(en?"Last third":"1/3 malam akhir")+' <b>'+lastThird(now)+'</b></span></div>'+
      '<div class="src0"><span class="badge '+(t.src==="jakim"?"":"warn")+'" id="refresh">'+(t.src==="jakim"?T("jakim"):t.src==="abroad"?(en?"Calculated: ":"Kiraan: ")+(METHODS[S.calcMethod]||METHODS.MWL)[3]:T("est"))+' ↻</span>'+(adjAny()?' <span class="badge">± '+(en?"adjusted":"dilaras")+'</span>':'')+'</div></div>';
    if(musafirNow()) html+=musafirBanner();
    html+=monthCard();
    el.innerHTML=html;
    el.querySelector("#refresh").onclick=function(){ ensureData(true); };
    bindMusafir(el); bindMonth(el);
  } else if(s==="rakaat"){
    // 0.34.0 (Farah): guided practice at the top; one Settings button opens Tetapan › Kiraan rakaat
    html+='<button class="btn alt full g3d" data-prac="1" style="margin-bottom:10px">🔊 '+L2x("Latihan solat berpandu","Guided solat practice")+'</button>';
    html+=rakaatSetup();
    html+='<button class="btn alt full" data-mg="rakaat" style="margin-bottom:12px">⚙ '+L2x("Tetapan","Settings")+' ›</button>';
    el.innerHTML=html; bindRakaat(el); bindMusafir(el);
    el.querySelector("[data-mg]").onclick=function(){ moreGrp="rakaat"; go("more"); };
  } else if(s==="zikir"){ vZikir(el);
  } else if(s==="kiblat"){
    el.innerHTML='<div class="card" id="qCard"></div><div id="xFlyC"></div>';
    qiblaCard(el.querySelector("#qCard"), false);
    var wx=document.createElement("div"); wx.className="card"; wx.id="wxCard"; el.insertBefore(wx, el.querySelector("#xFlyC")); weatherInto(wx, false);
    withExtra(null, function(){ var c=el.querySelector("#xFlyC"); if(!c) return; c.innerHTML=IbExtra.flightCard(xH()); c.querySelector("#xFly").onclick=function(){ IbExtra.openFlight(xH()); }; });
  } else vSunatMode(el, "ssunat");
}
// Whole month of prayer times; swipe or slide across every month of this year and next
var wmIdx=null;
function monthCard(){
  var y=new Date().getFullYear(), MO=en_()?ME:MS, pages='';
  for(var i=0;i<24;i++) pages+='<div class="wmp" data-i="'+i+'"></div>';
  if(wmIdx===null) wmIdx=new Date().getMonth();
  return '<div class="card wmon"><div class="wmh"><button class="chip g3d" id="wmP" aria-label="prev">‹</button><div><b id="wmT"></b><div class="mut tiny" id="wmS"></div></div><button class="chip g3d" id="wmN" aria-label="next">›</button></div>'+
    '<input type="range" id="wmR" min="0" max="23" step="1" value="'+wmIdx+'" aria-label="'+L2x("Bulan","Month")+'"><div class="wmlab"><span>'+MO[0].slice(0,3)+' '+y+'</span><span>'+MO[11].slice(0,3)+' '+(y+1)+'</span></div>'+
    '<div class="wmpg" id="wmPg">'+pages+'</div></div>';
}
function monthTable(i){
  var y=new Date().getFullYear()+Math.floor(i/12), m=i%12, dim=new Date(y,m+1,0).getDate(), tds=ymd(new Date()), est=false, rows='';
  var DN=en_()?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
  var hm=function(x){ return x?fmt12(x).split(" ")[0]:"--"; };
  for(var d=1; d<=dim; d++){
    var dt=new Date(y,m,d), t=getDay(dt), hj=hijriOf(dt), ds=ymd(dt); if(t.src!=="jakim") est=true;
    rows+='<tr class="'+(ds===tds?"today":"")+(dt.getDay()===5?" fri":"")+'"'+(ds===tds?' id="wmToday"':'')+'><td class="wd"><b>'+d+'</b> <span>'+DN[dt.getDay()]+'</span>'+(hj?'<small>'+hj.d+' '+HIJRI_MONTHS[hj.m-1].slice(0,6)+'</small>':'')+'</td>'+ALL.map(function(k){ return '<td>'+hm(t[k])+'</td>'; }).join("")+'</tr>';
  }
  return {html:'<table class="wmt"><thead><tr><th>'+L2x("Tarikh","Date")+'</th>'+ALL.map(function(k){ return '<th>'+T(k)+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody></table>', est:est};
}
function bindMonth(el){
  var pg=el.querySelector("#wmPg"), R=el.querySelector("#wmR"), done={}, est={}, y=new Date().getFullYear(), MO=en_()?ME:MS, tmr=null;
  if(!pg) return;
  var fill=function(i){ if(i<0||i>23||done[i]) return; var r=monthTable(i); done[i]=1; est[i]=r.est; pg.children[i].innerHTML=r.html; };
  var label=function(i){ fill(i); fill(i-1); fill(i+1); el.querySelector("#wmT").textContent=MO[i%12]+" "+(y+Math.floor(i/12));
    var h1=hijriOf(new Date(y+Math.floor(i/12),i%12,1)), h2=hijriOf(new Date(y+Math.floor(i/12),i%12+1,0));
    el.querySelector("#wmS").innerHTML=(h1&&h2?HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H · ":"")+(est[i]?'<span class="badge warn">'+T("est")+'</span>':'<span class="badge">'+T("jakim")+'</span>');
    R.value=i; wmIdx=i; pg.style.height=pg.children[i].scrollHeight+"px"; };
  var to=function(i, smooth){ i=Math.max(0,Math.min(23,i)); label(i); pg.scrollTo({left:i*pg.clientWidth, behavior:smooth?"smooth":"auto"}); };
  pg.addEventListener("scroll", function(){ clearTimeout(tmr); tmr=setTimeout(function(){ var i=Math.round(pg.scrollLeft/Math.max(1,pg.clientWidth)); if(i!==wmIdx) label(i); },90); }, {passive:true});
  R.oninput=function(){ to(+R.value, false); };
  el.querySelector("#wmP").onclick=function(){ to(wmIdx-1, true); };
  el.querySelector("#wmN").onclick=function(){ to(wmIdx+1, true); };
  label(wmIdx); setTimeout(function(){ to(wmIdx,false); },0);
}

// ---------- Sunat list (Amal) shown in four places: Solat sunat, Amal sunat, Ilmu > Bersuci, Ilmu > Haji & Umrah ----------
var SN_GUIDE={istikharah:"g_istikharah", hajat:"g_hajat", raya:"x_raya", gerhana:"x_gerhana", jenazah:"x_jenazah", b_wuduk:"wudhu", b_mandi:"x_mandi", b_tayammum:"x_tayammum"};
function vSunatMode(el, mode){
  if(mode==="ssunat") sunTop="solat";
  else if(mode==="amal"){ if(["solat","bersuci","haji"].indexOf(sunTop)>=0) sunTop="puasa"; }
  else sunTop=mode;
  vSunat0(el);
  el.querySelectorAll("[data-guide]").forEach(function(b){ b.remove(); });
  var open=sunOpen && el.querySelector('[data-so="'+sunOpen+'"]');
  if(open && SN_GUIDE[sunOpen]){ var card=open.closest(".card"), b=document.createElement("button"); b.className="btn alt full g3d"; b.style.marginTop="8px";
    b.innerHTML='📘 '+L2x("Panduan penuh langkah demi langkah","Full step-by-step guide");
    b.onclick=function(){ learnPg=SN_GUIDE[sunOpen]; learnFrom=null; go("learn"); };
    var cnt=card.querySelector("[data-cnt-sunat]"); if(cnt) card.insertBefore(b, cnt.parentNode); else card.appendChild(b); }
  var hdr=el.querySelector(".amhdr"); if(!hdr) return;
  if(mode==="bersuci"||mode==="haji"){ hdr.remove(); var d=el.querySelector(".mut.small:last-child"); if(d) d.remove(); return; }
  var lv2=hdr.querySelector(".lv2");
  if(mode==="ssunat"){ if(lv2) lv2.remove(); }
  else if(lv2){ lv2.querySelectorAll("[data-st]").forEach(function(b){ if(["solat","bersuci","haji"].indexOf(b.getAttribute("data-st"))>=0) b.remove(); }); }
  var dock=document.createElement("div"); dock.className="dock amdock"; dock.appendChild(hdr); el.appendChild(dock);
  if(mode==="amal"){ var c=document.createElement("div"); c.className="card"; c.innerHTML='<div class="small">'+L2x("Solat sunat, Bersuci dan Haji & Umrah kini ada tempat sendiri:","Sunnah prayers, Purification and Hajj & Umrah now have their own place:")+'</div><div class="chips"><button class="chip g3d" data-j="s">🌅 '+L2x("Solat sunat","Sunnah prayers")+'</button><button class="chip g3d" data-j="b">💧 '+L2x("Bersuci","Purification")+'</button><button class="chip g3d" data-j="h">🕋 '+L2x("Haji & Umrah","Hajj & Umrah")+'</button></div>';
    el.insertBefore(c, dock);
    c.querySelectorAll("[data-j]").forEach(function(b){ b.onclick=function(){ var j=b.getAttribute("data-j"); sunOpen=null; if(j==="s"){ SUB2.solat="ssunat"; go("solat"); } else { pandL3=j==="b"?"bersuci":"haji"; SUB2.learn="panduan"; learnPg=null; go("learn"); } }; }); }
  if(mode==="amal"||mode==="ssunat") sunSwipe(el, mode);
}
// 0.34.0: swipe sideways between the topics (Amal sunat) or categories (Solat sunat); the next one rides in beside it
function sunSwipe(el, mode){
  var amal=mode==="amal", L=amal?SUNAT_TOP.filter(function(c){ return ["solat","bersuci","haji"].indexOf(c[0])<0; }).map(function(c){ return c[0]; }):SUNAT_CATS.map(function(c){ return c[0]; });
  var cur=function(){ return L.indexOf(amal?sunTop:sunCat); }, set=function(k){ if(amal) sunTop=k; else sunCat=k; };
  var nb=function(s){ return L[cur()+(s<0?1:-1)]; };
  var pg=ibWrap(el);
  IbSwipe(pg, {can:function(s){ return !!nb(s); },
    go:function(s){ set(nb(s)); sunOpen=null; render(); },
    find:function(){ return document.querySelector("#view .ibpg"); },
    peek:function(s){ var k=nb(s), t0=sunTop, c0=sunCat, o0=sunOpen, b=IbSwipe.shot(function(){ set(k); sunOpen=null; }, function(x){ vSunatMode(x, mode); }, function(){ sunTop=t0; sunCat=c0; sunOpen=o0; });
      if(!b) return null; var w=b.querySelector(".ibpg"); return w; }});
}
function vSunatHub(el){
  var f={quran:function(e){ e.innerHTML='<div id="quranBox"></div>'; vQuran(e.querySelector("#quranBox")); }, zikir:vZikir, doa:vDoa, wirid:vWirid, mathurat:vMathurat, amal:function(e){ vSunatMode(e,"amal"); }}[sunPage];
  if(!f){ sunPage="quran"; return vSunatHub(el); }
  f(el);
}

// ---------- ILMU ----------
function lTile(id, ic, ms, en){ return '<button class="qt g3d" data-learn="'+id+'"><span>'+ic+'</span>'+esc(L2x(ms,en))+'</button>'; }
function vLearn(el){
  if(learnPg || S.kidLock){ vLearn0(el); return; }
  var s=SUB2.learn, h='';
  if(s==="quran"){ SUB2.learn="panduan"; s="panduan"; }
  if(s==="tajwid" || s==="fiqh"){ SUB2.learn="bahasa"; s="bahasa"; }
  if(s==="panduan"){
    if(pandL3==="bersuci") h+='<div class="lgrid">'+lTile("wudhu","💧","Cara berwuduk","How to make wudhu")+lTile("x_mandi","🚿","Mandi wajib","Obligatory bath")+lTile("x_tayammum","🏜","Tayammum","Tayammum")+lTile("x_istinja","🚽","Istinjak & najis","Istinja' & najis")+lTile("haid","🌸","Haid & nifas","Haid & nifas")+'</div><div class="snl" style="margin:14px 2px 0">'+L2x("Ringkasan amalan","Quick summaries")+'</div><div id="pSn"></div>';
    else if(pandL3==="solat") h+='<div class="lgrid">'+'<button class="qt g3d" data-prac="1"><span>🔊</span>'+L2x("Latihan berpandu","Guided practice")+'</button>'+lTile("solat","🧎","Cara solat","How to pray")+lTile("bacaan","📜","Bacaan dalam solat","Readings in solat")+lTile("sakit","🏥","Solat ketika sakit","Praying when sick")+lTile("musafir","🚗","Solat musafir","Praying when travelling")+'<button class="qt g3d" data-jss="1"><span>🌅</span>'+L2x("Solat khas ›","Special prayers ›")+'</button></div><div class="mut small" style="margin:8px 2px">'+L2x("Istikharah, Hajat, Hari Raya, Gerhana dan Jenazah ada dalam Solat › Solat sunat, dengan panduan penuh.","Istikharah, Hajat, Eid, Eclipse and Funeral prayers are in Solat › Sunnah prayers, with the full guide.")+'</div>';
    if(pandL3==="solat") h+='<button class="kbHero g3d" data-khutbah="1"><span>🕌</span><span><b>'+L2x("Khutbah Jumaat semua negeri","Friday khutbah for every state")+'</b><small>'+L2x("Teks khutbah terkini dari jabatan agama setiap negeri","The latest khutbah text from each state's religious department")+'</small></span><span class="shGo">›</span></button>';
    else if(pandL3!=="bersuci") {
      h+=hajjHero(false)+umrahHero();
      h+='<div class="lgrid"><button class="qt g3d" data-tawaf="1"><span>🔢</span>'+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</button>'+lTile("live","📺","Siaran langsung & waktu Makkah","Live & Makkah times")+'</div>';
      h+='<div class="snl" style="margin:14px 2px 0">'+L2x("Rukun, wajib & sunat","Pillars, obligations & sunnah")+'</div><div id="pSn"></div>';
    }
    h+='<div class="dock"><div class="grp3">'+[["bersuci","💧",L2x("Bersuci","Purification")],["solat","🧎","Solat"],["haji","🕋",L2x("Haji & Umrah","Hajj & Umrah")]].map(function(x){ return '<button class="chip g3d'+(pandL3===x[0]?" on":"")+'" data-pl="'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</div></div>';
  } else if(s==="kisah"){
    h+=kidsHero();
    h+='<button class="sirahHero" data-sirah="adult"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>'+L2x("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ")+'</b><small>'+L2x("Garis masa interaktif, dari Tahun Gajah hingga wafat","Interactive timeline, from the Year of the Elephant to his passing")+'</small></span><span class="shGo">›</span></button>';
    h+='<div id="xSnip"></div>'+quizHero();
    h+='<div class="lgrid">'+lTile("nabi","🌿","Kisah 25 Nabi","The 25 Prophets")+'<button class="qt g3d" data-isteri="1"><span>🌸</span>'+L2x("Isteri Nabi ﷺ","Wives of the Prophet ﷺ")+'</button>'+lTile("sahabat","🏅","Kisah Sahabat","Companion stories")+lTile("n40","📜","40 Hadis Nawawi","40 Hadith Nawawi")+'</div>';
  } else if(s==="bahasa"){
    h+=fiqhHero()+fiqhCard()+pkskHero()+iqraHero()+tajwidHero();
    h+='<div class="lgrid">'+lTile("hijaiyah","🔤","Huruf Hijaiyah","Arabic letters")+lTile("qwords","📗","Kata al-Quran","Quran words")+lTile("glosari","📖","Glosari istilah","Glossary")+'</div>';
  } else if(s==="dengar"){
    h+=radioHero()+podHero()+liveHero();
  } else if(s==="tanya"){
    h+='<div id="ilmuBox"></div>';
  }
  h+='<div class="mut small" style="padding:10px 4px 12px">'+L2x("Kandungan prototaip mengikut mazhab Syafi'i: sila dapatkan semakan ustaz.","Prototype content following the Shafi'i school: please have it reviewed by an ustaz.")+'</div>';
  el.innerHTML=h;
  var ist=el.querySelector("[data-isteri]"); if(ist) ist.onclick=function(){ nabiMode="isteri"; learnPg="nabi"; learnFrom=null; render(); document.getElementById("view").scrollTop=0; };
  var xs=el.querySelector("#xSnip"); if(xs) withExtra(null, function(){ IbExtra.sirahSnippet(xs, xH()); });
  el.querySelectorAll("[data-pl]").forEach(function(b){ b.onclick=function(){ pandL3=b.getAttribute("data-pl"); sunOpen=null; render(); document.getElementById("view").scrollTop=0; }; });
  var js=el.querySelector("[data-jss]"); if(js) js.onclick=function(){ SUB2.solat="ssunat"; sunCat="khas"; go("solat"); };
  var kb=el.querySelector("[data-khutbah]"); if(kb) kb.onclick=khutbahSheet;
  var ps=el.querySelector("#pSn"); if(ps) vSunatMode(ps, pandL3==="bersuci"?"bersuci":"haji");
  var ib=el.querySelector("#ilmuBox"); if(ib) vIlmu(ib, "askai", true);
}
// 0.18.0 tajwid lessons and Iqra'-style reading levels (ilmu/bacaan.js)
function vBacaan(bx, k){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(!document.body.contains(bx)) return; var h=qHelpers(); h.speakAr=speakAr; try{ BacaanView(bx, k, h); }catch(err){ console.error(err); bx.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.BacaanView && window.QuranView && window.QMETA){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(QJS.concat(["ilmu/bacaan.js"]), start, function(){ bx.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; });
}

// ---------- AL-QURAN (0.15.0, 0.16.0 tafsir/roots/topics): reader in quran/quran.js, data loaded on first use ----------
function qHelpers(){ return {N:N, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, load:load, save:save,
      on:on, off:off, fetch:nFetch, dockFix:dockFix, shareCard:shareCard, hijri:hijriOf, addDays:addDays, resched:pushSchedule, openSirahAt:function(id){ openSirah(false, id); },
      jnTad:function(ds, k, t){ var J=jnData(), e=J.d[ds]||{}; e.tk=k; e.tt=t; J.d[ds]=e; save("ihsan_muhasabah", J); },
      kidStar:function(){ var c=kidCur(); return c?c.n:null; }}; }
function vQuran(bx){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(!document.body.contains(bx)) return; try{ QuranView(bx, qHelpers()); }catch(err){ console.error(err); bx.innerHTML='<div class="card">'+L2x("Al-Quran gagal dibuka","The Quran could not open")+'</div>'; } };
  if(window.QuranView && window.QMETA){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(QJS, start, function(){ bx.innerHTML='<div class="card">'+L2x("Al-Quran gagal dimuatkan","The Quran could not load")+'</div>'; });
}
function openQuran(playing){ sunPage="quran"; save("ihsan_sunpage","quran"); learnPg=null; learnFrom=null;
  var g=function(){ if(playing && window.QuranView) QuranView.openPlaying(); go("sunat"); };
  if(playing && !window.QuranView) loadJs(["quran/qmeta.js","quran/quran_ms.js","quran/qtopic.js","quran/quran.js"], g, function(){ go("sunat"); }); else g(); }
window.openQuran=openQuran;
// 0.17.0: open the reader at any ayat (doa sources, shortcuts, reminders, Sirah links)
var QJS=["quran/qmeta.js","quran/quran_ms.js","quran/qtopic.js","quran/quran.js"];
function openQuranAt(su, a, mode){ if(S.kidLock) return; var f=function(){ QuranView.open(QMETA.sa[su-1]+Math.max(1,a||1)-1, mode); openQuran(false); };
  if(document.getElementById("overlay") && !document.getElementById("overlay").classList.contains("hidden")) closeOverlay();
  if(window.QuranView && window.QMETA) f(); else loadJs(QJS, f, function(){ toast(L2x("Al-Quran gagal dimuatkan","The Quran could not load")); }); }
window.openQuranAt=openQuranAt;
document.addEventListener("click", function(e){ var a=e.target.closest && e.target.closest("[data-qref]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var p=a.getAttribute("data-qref").split(":"); openQuranAt(+p[0], +p[1]); }, true);
// 0.17.0 Juz Amma for kids (inside Kids mode)
function vJamma(bx){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(document.body.contains(bx)) QuranView.kids(bx, qHelpers()); };
  if(window.QuranView && window.QMETA) start(); else { bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(QJS, start); } }

// ---------- KALENDAR: Bulan / Puasa / Statistik ----------
function vCal(el){
  var s=SUB2.cal;
  if(s==="bulan"){
    vCal0(el);
    var cd=el.querySelector(".cdbox"); if(cd) cd.remove();
    var kr=el.querySelector(".kadRow"); if(kr && !kr.querySelector('[data-kad]:not([data-kad=""])')) kr.remove();
    var uc=el.querySelector(".ucard"); if(uc) uc.remove();
    el.insertAdjacentHTML("beforeend", csCard()); bindCs(el);
    return;
  }
  if(s==="puasa"){
    var h=ramadanMonth()+countdownBoxes();
    h+=(HC.ramadan()||'')+(HC.fast()||'')+(HC.ganti()||'');
    h+='<div class="card"><div class="small">'+L2x("Niat, cara dan kelebihan setiap puasa sunat:","Intention, how-to and virtues of each sunnah fast:")+'</div><button class="btn alt full g3d" id="pzAmal" style="margin-top:8px">🌱 '+L2x("Amal sunat › Puasa","Sunnah deeds › Fasting")+' ›</button></div>';
    el.innerHTML=h;
    el.querySelector("#pzAmal").onclick=function(){ sunTop="puasa"; sunOpen=null; go("amal"); };
    el.onclick=function(e){ var b=e.target.closest("[data-act]"); if(b){ homeAct(b.getAttribute("data-act")); } };
    var fr=el.querySelector("#hFastRem"); if(fr) fr.onchange=function(){ S.fastRem=this.checked; saveS(); };
    bindRamadan(el);
    return;
  }
  if(s==="senaman"){ vFit(el); return; }
  if(s==="fokus"){ vFocus(el); return; }
  if(s==="haid"){ if(periodHidden()){ SUB2.cal="bulan"; vCal(el); return; } vPeriod(el); return; }
  // statistik (0.30.0: day / month / year, steps, phone screen time, swipe between periods)
  vStats(el);
}
// ---------- 0.37.0 SENAMAN (fit/fit.js): 3D figure, 50 moves, routines with timers, plan, tracker, health ----------
var FITJS=["fit/fit_data.js","fit/fit3d.js","fit/fit.js"];
function fitH(){ var h=finH(); h.loadJs=loadJs; h.locTag=locTag; h.steps=function(){ try{ return !S.stepsOn?null:((stepMap()[ymd(new Date())]||{}).s||0); }catch(e){ return null; } }; return h; }
function vFit(el){ var go_=function(){ if(document.body.contains(el)) try{ FitView.view(el, fitH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FitView && window.THREE) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(FITJS), go_, function(){ el.innerHTML='<div class="card">'+L2x("Senaman gagal dimuatkan","Exercise could not load")+'</div>'; }); } }
// ---------- 0.5.1 FOKUS (focus/focus.js): focus sessions, Pomodoro, Do Not Disturb, focus plans, focus screen lock, Time Nudge.
// It helps the person choose: it never stops or closes other apps.
// ---------- 0.5.14 Derma (Donate) and Hadiah (Gift), from the top bar (give/give.js) ----------
function giveH(){ var h=finH(); h.fetch=nFetch; return h; }
function giveCss(){ if(!document.querySelector('link[href="give/give.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="give/give.css"; document.head.appendChild(lk); }
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lh=document.createElement("link"); lh.rel="stylesheet"; lh.href="halal/halal.css"; document.head.appendChild(lh); } }
function vGive(el, k){ giveCss(); var go_=function(){ if(document.body.contains(el)) try{ GiveView[k](el, giveH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.GiveView && window.DONATE_DATA) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["give/donate_data.js","give/give.js"], go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function vDerma(el){ vGive(el, "derma"); }
function vHadiah(el){ vGive(el, "gift"); }
var FOJS=["focus/focus.js"];
function focusH(){ var h=finH(); h.S=S; h.ymd=ymd; h.prayerTimes=function(){ return upcoming(4); }; h.pushSchedule=pushSchedule;
  h.setCal=function(s){ SUB2.cal=s; go("cal"); }; h.swUnHtml=swUnHtml; h.swUnBind=swUnBind; h.appPin=appPin; h.openQuran=openQuran; h.usageOk=hasUsageAcc; return h; }
// 0.5.2 screen-time insights in Statistik (focus/insights.js)
function insH(){ var h=finH(); h.ymd=ymd; h.prCount=prCount; h.quranSec=function(k){ return qListenMap()[k]||0; }; h.pushSchedule=pushSchedule;
  h.focusMin=function(k){ return ((load("ihsan_focus",{})||{}).log||{})[k]||0; };
  h.shareImage=function(url, txt){ if(window.Native && N.shareImage) N.shareImage(url, txt); else { var a=document.createElement("a"); a.href=url; a.download="masa-skrin.png"; document.body.appendChild(a); a.click(); a.remove(); } }; return h; }
function foCss(){ if(!document.querySelector('link[href="focus/focus.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="focus/focus.css"; document.head.appendChild(lk); } }
function vFocus(el){ foCss(); var go_=function(){ if(document.body.contains(el)) try{ FocusView.view(el, focusH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FocusView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(FOJS, go_, function(){ el.innerHTML='<div class="card">'+L2x("Fokus gagal dimuatkan","Focus could not load")+'</div>'; }); } }
WG["fokus"]=cardW("kal","🎯","Fokus","Focus",function(){
  if(!window.FocusView){ loadJs(FOJS, function(){ if(view==="home") render(); }, function(){}); return '<div class="card mut small" data-act="side:cal/fokus">🎯 …</div>'; }
  var w=FocusView.widget(focusH()), m=w.today, t=m>=60?Math.floor(m/60)+L2x(" j "," h ")+(m%60)+" min":m+" min";
  var l=w.on&&w.end?Math.max(0,Math.round((w.end-Date.now())/60000)):0;
  return '<div class="card" data-act="side:cal/fokus"><h3>🎯 '+L2x("Fokus","Focus")+'</h3>'+(w.on?'<div class="small"><b>'+(w.work?esc(w.name||L2x("Sedang fokus","Focusing")):"☕ "+L2x("Rehat","Break"))+'</b>'+(w.end?' · '+l+L2x(" min lagi"," min left"):'')+'</div>':'<div class="small">▶ '+L2x("Ketik untuk mula fokus","Tap to start focusing")+'</div>')+'<div class="mut tiny">'+L2x("Hari ini: ","Today: ")+t+'</div></div>'; },[4,1],[2,1]);
WG["sc-fokus"]=scW("kal","🎯","Fokus","Focus","side:cal/fokus","Sesi fokus, Pomodoro & kunci skrin fokus","Focus sessions, Pomodoro & focus screen lock");
// ---------- 0.4.0 BUKU (books/books.js): PDF library + reader + PDF tools; files from Share / Open with "My Ihsan Books" ----------
var BKJS=["books/books.js"];
function bkH(){ var h=finH(); h.S=S; h.loadJs=loadJs; return h; }
function bkCss(){ if(!document.querySelector('link[href="halal/halal.css"]')){ var lh=document.createElement("link"); lh.rel="stylesheet"; lh.href="halal/halal.css"; document.head.appendChild(lh); }   // shared buttons, fields and lists
  if(!document.querySelector('link[href="books/books.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="books/books.css"; document.head.appendChild(lk); } }
function withBooks(fn){ bkCss(); if(window.BooksView) fn(); else loadJs(BKJS, fn, function(){ toast(L2x("Buku gagal dimuatkan","Books could not load")); }); }
function vBooks(el){ el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; withBooks(function(){ if(document.body.contains(el)) try{ BooksView.view(el, bkH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } }); }
function toBooksTab(){ if(S.kidLock) return false; var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden") && !ov.classList.contains("bkov")){ if(ov._close) ov._close(); else closeOverlay(); } if(!(view==="alat" && SUB2.alat==="nota" && wrTab==="buku")){ SUB2.alat="nota"; wrTab="buku"; go("alat"); } return true; }
on("bookstart", function(){ if(toBooksTab()) toast(L2x("Menerima PDF…","Receiving the PDF…")); });
on("book", function(d){ if(!toBooksTab()) return; withBooks(function(){ BooksView.got(d, bkH()); }); });
on("bookimgs", function(d){ if(!toBooksTab()) return; withBooks(function(){ setTimeout(function(){ BooksView.images(d.images||[], bkH()); }, 300); }); });
WG["books"]=cardW("tools","📖","Sambung membaca","Continue reading",function(){
  if(!window.BooksView){ withBooks(function(){ if(view==="home") render(); }); return '<div class="mut small" data-act="q-books">📖 …</div>'; }
  var w=BooksView.widget(bkH()); if(!w) return '<div class="mut small" data-act="q-books">📚 '+L2x("Belum ada buku. Ketik untuk buka PDF.","No books yet. Tap to open a PDF.")+'</div>';
  return '<div class="bkw" data-act="q-book:'+w.id+'" style="display:flex;gap:10px;align-items:center">'+(w.cover?'<img src="'+w.cover+'" alt="" style="width:44px;border-radius:4px;background:#fff">':'')+'<div style="min-width:0"><div class="mut tiny">📖 '+L2x("Sambung membaca","Continue reading")+'</div><b class="small" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.name)+'</b><div class="mut tiny">'+L2x("Hlm ","p. ")+w.page+(w.pages?" / "+w.pages:"")+' · '+w.prog+'%</div></div></div>'; },[4,2],[2,1]);
WG["sc-books"]=scW("tools","📚","Buku","Books","q-books","PDF: baca, serlah, tandatangan","PDF: read, highlight, sign");
// ---------- 0.3.0 HAID (period/period.js): haid, nifas, istihadhah (Shafi'i), predictions, ganti puasa, health ----------
var PERJS=["period/period_data.js","period/period.js"];
function perH(){ var h=finH(); h.S=S; h.times=getDay; h.hijri=hijriOf;
  h.addGanti=function(n){ S.ganti=S.ganti||{owe:0,done:[]}; S.ganti.owe=(S.ganti.owe||0)+n; saveS(); };
  h.pause=function(days){ if(days>0){ S.pauseMode="haid"; S.pauseUntil=Date.now()+days*864e5; } else if(S.pauseMode==="haid"){ S.pauseMode=null; S.pauseUntil=0; } saveS(); };
  return h; }
function perCss(){ if(!document.querySelector('link[href="period/period.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="period/period.css"; document.head.appendChild(lk); } }
function vPeriod(el){ perCss(); var go_=function(){ if(document.body.contains(el)) try{ PeriodView.view(el, perH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.PeriodView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(PERJS, go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
WG["period"]=cardW("kal","🌸","Haid (hari ini)","Period (today)",function(){
  if(periodHidden()) return '<div class="mut small" data-act="q-period">🌸 '+L2x("Tab Haid disembunyikan","The Period tab is hidden")+'</div>';
  if(!window.PeriodView){ loadJs(PERJS, function(){ if(view==="home") render(); }, function(){}); return '<div class="mut small" data-act="q-period">🌸 …</div>'; }
  var t=PeriodView.widget(perH()); return '<div data-act="q-period"><div class="mut tiny">🌸 '+L2x("Haid","Period")+'</div><div class="small"><b>'+esc(t||"")+'</b></div></div>'; },[2,1],[2,1]);
WG["sc-period"]=scW("kal","🌸","Haid","Period","q-period","Haid, istihadhah & ganti puasa","Periods, istihadhah & make-up fasts");
// ---------- 0.30.0 STATISTIK ----------
var STV={p:"d", d:null, m:null, y:null, mt:"steps"}, SCR=load("ihsan_screen",{});
function qListenMap(){ try{ return JSON.parse((window.Native && N.qListen)?N.qListen():"{}")||{}; }catch(e){ return {}; } }
function stepMap(){ try{ return JSON.parse((window.Native && N.stepsDays)?N.stepsDays():"{}")||{}; }catch(e){ return {}; } }
function hasUsageAcc(){ return !!(window.Native && N.hasPerm && N.hasPerm("usage")); }
function screenMap(from, to){
  if(hasUsageAcc() && N.screenDays){ try{ var o=JSON.parse(N.screenDays(from,to)||"{}"), t=ymd(new Date()), ch=false; for(var k in o){ if(k<t){ if(SCR[k]!==o[k]){ SCR[k]=o[k]; ch=true; } } } if(ch) save("ihsan_screen",SCR); var r={}; for(var k2 in SCR) r[k2]=SCR[k2]; for(var k3 in o) r[k3]=o[k3]; return r; }catch(e){} }
  return SCR; }
function prCount(ds){ var f=fardDay(ds), n=0; PR.forEach(function(k){ if(f[k]&&f[k].c>=f[k].tg) n++; }); return n; }
function fmtSteps(n){ n=Math.round(n||0); return n>=10000?(n/1000).toFixed(n>=100000?0:1)+"k":String(n).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function hmShort(ms){ var m=Math.round((ms||0)/60000); return m>=60?Math.floor(m/60)+"j "+(m%60)+"m":m+"m"; }
var STM=[["steps","🚶",["Langkah","Steps"]],["active","⚡",["Aktif","Active"]],["screen","📱",["Skrin","Screen"]],["app","⏱",["Aplikasi","App"]],["prayer","🕌",["Solat","Prayers"]],["quran","🎧",["Al-Quran","Quran"]]];
function stVal(mt, k, D){ if(mt==="steps") return (D.st[k]||{}).s||0; if(mt==="active") return (D.st[k]||{}).a||0; if(mt==="screen") return D.sc[k]||0; if(mt==="app") return useSec(k); if(mt==="prayer") return prCount(k); if(mt==="quran") return D.ql[k]||0; return 0; }
function stFmt(mt, v){ if(mt==="steps") return fmtSteps(v); if(mt==="active") return Math.round(v)+L2x(" min"," min"); if(mt==="screen") return hmShort(v); if(mt==="app") return hmShort(v*1000); if(mt==="prayer") return String(Math.round(v)); if(mt==="quran") return Math.round(v/60)+"m"; return String(v); }
function stShort(mt, v){ if(!v) return ""; if(mt==="steps") return v>=1000?(v/1000).toFixed(v>=10000?0:1)+"k":String(v); if(mt==="screen") return Math.round(v/360000)/10+"j"; if(mt==="app") return Math.round(v/60)+"m"; if(mt==="quran") return Math.round(v/60)+"m"; return String(Math.round(v)); }
function vStats(el){
  var now=new Date(), today=ymd(now); if(!STV.d) STV.d=today; if(!STV.m) STV.m=today.slice(0,7); if(!STV.y) STV.y=now.getFullYear();
  var en=en_(), MO=en?ME:MS, D={st:stepMap(), ql:qListenMap(), sc:{}};
  var h='<div class="stTop"><div class="chips stP">'+[["d","Hari","Day"],["m","Bulan","Month"],["y","Tahun","Year"]].map(function(x){ return '<button class="chip g3d'+(STV.p===x[0]?" on":"")+'" data-stp="'+x[0]+'">'+L2x(x[1],x[2])+'</button>'; }).join("")+'</div>';
  var lab, canNext;
  if(STV.p==="d"){ var sd=parseYmd(STV.d); lab=sd.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"long",year:"numeric"}); canNext=STV.d<today; }
  else if(STV.p==="m"){ var mp=STV.m.split("-"); lab=MO[+mp[1]-1]+" "+mp[0]; canNext=STV.m<today.slice(0,7); }
  else { lab=String(STV.y); canNext=STV.y<now.getFullYear(); }
  h+='<div class="stNav"><button class="chip g3d" data-stn="-1">‹</button><b>'+esc(lab)+'</b>'+(STV.p==="d"?'<input type="date" id="stDate" value="'+STV.d+'" max="'+today+'">':'')+'<button class="chip g3d" data-stn="1"'+(canNext?'':' disabled')+'>›</button></div></div><div id="stBox">';
  if(STV.p==="d"){
    var k=STV.d; D.sc=screenMap(k,k);
    var stp=D.st[k]||{s:0,a:0}, goal=S.stepGoal||6000, on=!!S.stepsOn, nat=!!(window.Native && N.stepsDays), sens=nat&&N.stepsSensor?N.stepsSensor():nat;
    h+='<div class="card"><h3>🚶 '+L2x("Langkah & pergerakan aktif","Steps & active movement")+'</h3>';
    if(!on) h+='<div class="small">'+(sens?L2x("Kira langkah anda menggunakan sensor telefon. Data kekal dalam telefon.","Count your steps with the phone's sensor. The data stays on the phone."):L2x("Telefon ini tiada sensor langkah.","This phone has no step sensor."))+'</div>'+(sens||!nat?'<button class="btn gold full g3d" id="stOn" style="margin-top:8px">🚶 '+L2x("Hidupkan pengiraan langkah","Turn on step counting")+'</button>':'');
    else h+='<div class="urow"><div><div class="mut tiny">'+L2x("Langkah","Steps")+'</div><div class="ubig">'+fmtSteps(stp.s)+'</div></div><div><div class="mut tiny">'+L2x("Masa aktif","Active time")+'</div><div class="ubig gold">'+(stp.a||0)+' min</div></div></div>'+
      '<div class="ubar1"><i style="width:'+Math.min(100,Math.round(stp.s*100/goal))+'%"></i></div><div class="mut tiny">'+L2x("Sasaran ","Goal ")+fmtSteps(goal)+' · <button class="linkb" id="stGoal">'+L2x("ubah","change")+'</button> · '+L2x("Masa aktif ialah minit berjalan pada kadar 80+ langkah seminit (anggaran). Dikemas kini lebih kurang setiap jam.","Active time is minutes walked at 80+ steps a minute (estimate). Updated about hourly.")+'</div>';
    h+='</div>';
    h+='<div class="card"><h3>📱 '+L2x("Masa skrin telefon","Phone screen time")+'</h3>';
    if(!hasUsageAcc()) h+='<div class="small">'+L2x("Untuk melihat masa skrin seluruh telefon, benarkan “Akses penggunaan” untuk My Ihsan dalam Tetapan telefon. Aplikasi hanya membaca jumlah masa, dan tiada data dihantar keluar.","To see whole-phone screen time, allow “Usage access” for My Ihsan in phone Settings. The app only reads time totals, and nothing leaves the phone.")+'</div><button class="btn alt full g3d" id="stUse" style="margin-top:8px">⚙ '+L2x("Benarkan akses penggunaan","Allow usage access")+'</button>';
    else { var apps=[]; try{ apps=JSON.parse(N.topApps(k)||"[]"); }catch(e){}
      h+='<div class="urow"><div><div class="mut tiny">'+L2x("Skrin hidup","Screen on")+'</div><div class="ubig">'+hmShort(D.sc[k]||0)+'</div></div><div><div class="mut tiny">'+L2x("Dalam My Ihsan","In My Ihsan")+'</div><div class="ubig gold"'+(k===today?' data-ulive="1"':'')+'>'+durHMS(k===today?usageLive():useSec(k))+'</div></div></div>'+
        (apps.length?'<div class="uvs">'+apps.map(function(a){ return '<span>'+esc(a.n)+' <b>'+hmShort(a.ms)+'</b></span>'; }).join("")+'</div>':''); }
    h+='</div>';
    if(hasUsageAcc() && N.focusInsights) h+='<div id="stIns"></div>';
    var pc=prCount(k);
    h+='<div class="card"><h3>🕌 '+L2x("Solat hari itu","Prayers that day")+'</h3><div class="stPr"><b>'+pc+'</b><span>/ 5</span></div>'+prRegister(k,false);
    var pl=plogDay(k); if(pl.length) h+='<div class="plist">'+pl.map(function(r){ return '<div class="pli"><span>'+hm12(r.t0)+'</span><b>'+esc(r.n)+'</b><span class="mut tiny">'+L2x("waktu ","in ")+T(r.w)+'</span><span>'+(Math.round(r.c*2)/2)+'/'+r.tg+'</span><span>'+durEn(r.sec)+'</span></div>'; }).join("")+'</div>';
    h+='</div>';
    var qv=D.ql[k]||0; h+='<div class="card"><h3>🎧 '+L2x("Dengar Al-Quran","Quran listening")+'</h3><div class="ubig">'+Math.round(qv/60)+' min</div></div>';
    h+=usageCard(k,true);
  } else {
    var from, to, cells=[], mt=STV.mt;
    h+='<div class="chips stM">'+STM.map(function(x){ return '<button class="chip'+(mt===x[0]?" on":"")+'" data-stm="'+x[0]+'">'+x[1]+' '+L2x(x[2][0],x[2][1])+'</button>'; }).join("")+'</div>';
    if(STV.p==="m"){
      var mp2=STV.m.split("-"), y=+mp2[0], m=+mp2[1]-1, dim=new Date(y,m+1,0).getDate(); from=ymd(new Date(y,m,1)); to=ymd(new Date(y,m,dim)); D.sc=screenMap(from,to);
      var vals=[], mx=0, sum=0, cnt=0, best=null;
      for(var d=1; d<=dim; d++){ var kk=ymd(new Date(y,m,d)), v=kk>today?0:stVal(mt,kk,D); vals.push([kk,v]); mx=Math.max(mx,v); if(v){ sum+=v; cnt++; if(!best||v>best[1]) best=[kk,v]; } }
      var lead=(new Date(y,m,1).getDay()+6)%7;
      h+='<div class="card"><div class="urow3"><div><b>'+stFmt(mt,sum)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+stFmt(mt,cnt?sum/cnt:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+(best?parseYmd(best[0]).getDate()+" "+MO[m].slice(0,3):"–")+'</b><span class="mut tiny">'+L2x("hari terbaik","best day")+'</span></div></div>';
      h+='<div class="stGrid">'+(en?["M","T","W","T","F","S","S"]:["I","S","R","K","J","S","A"]).map(function(x){ return '<div class="stH">'+x+'</div>'; }).join("");
      for(var z=0;z<lead;z++) h+='<div></div>';
      vals.forEach(function(x){ var a=mx?x[1]/mx:0; h+='<button class="stC'+(x[0]===today?" today":"")+(x[0]>today?" fut":"")+'" data-std="'+x[0]+'" style="--a:'+(x[1]?0.18+a*0.82:0)+'"><b>'+parseYmd(x[0]).getDate()+'</b><small>'+stShort(mt,x[1])+'</small></button>'; });
      h+='</div><div class="mut tiny" style="margin-top:6px">'+L2x("Ketik hari untuk butiran. Leret kiri/kanan untuk bulan lain.","Tap a day for details. Swipe left/right for other months.")+'</div></div>';
    } else {
      var yy=STV.y; from=yy+"-01-01"; to=yy+"-12-31"; D.sc=screenMap(from,to);
      var ms=[], mx2=0, tot=0, days=0;
      for(var mo=0; mo<12; mo++){ var dm=new Date(yy,mo+1,0).getDate(), sm=0, c2=0; for(var dd=1; dd<=dm; dd++){ var k2=ymd(new Date(yy,mo,dd)); if(k2>today) break; var v2=stVal(mt,k2,D); if(v2){ sm+=v2; c2++; } } ms.push([sm,c2]); mx2=Math.max(mx2,sm); tot+=sm; days+=c2; }
      h+='<div class="card"><div class="urow3"><div><b>'+stFmt(mt,tot)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+stFmt(mt,days?tot/days:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+days+'</b><span class="mut tiny">'+L2x("hari direkod","days recorded")+'</span></div></div>';
      h+='<div class="stYear">'+ms.map(function(x,i){ return '<button class="stMo" data-stmo="'+i+'"><div class="stBar"><i style="height:'+(mx2?Math.round(x[0]*100/mx2):0)+'%"></i></div><small>'+MO[i].slice(0,3)+'</small><em>'+stShort(mt,x[0])+'</em></button>'; }).join("")+'</div>'+
        '<div class="mut tiny" style="margin-top:6px">'+L2x("Ketik bulan untuk butiran. Leret untuk tahun sebelumnya dan seterusnya.","Tap a month for details. Swipe for earlier and later years.")+'</div></div>';
    }
  }
  h+='</div>';
  el.innerHTML=h;
  var ib=el.querySelector("#stIns"); if(ib){ var insGo=function(){ if(!document.body.contains(ib)) return; if(STV.insW){ STV.insW=false; InsightsView.week(); } try{ InsightsView.render(ib, insH(), STV.d); }catch(err){ console.error(err); } };
    if(window.InsightsView) insGo(); else { foCss(); loadJs(["focus/insights.js"], insGo, function(){}); } }
  var mut=function(dir){ if(STV.p==="d"){ var nd=ymd(addDays(parseYmd(STV.d),dir)); if(nd>today) return false; STV.d=nd; } else if(STV.p==="m"){ var p2=STV.m.split("-"), dt=new Date(+p2[0],+p2[1]-1+dir,1), nm=ymd(dt).slice(0,7); if(nm>today.slice(0,7)) return false; STV.m=nm; } else { if(STV.y+dir>now.getFullYear()) return false; STV.y+=dir; } return true; };
  var go_=function(dir, sw2){ if(!mut(dir)) return; vStats(el); dockFix(); var b=el.querySelector("#stBox"); if(b) IbSwipe.inFrom(b, sw2||-dir); };
  el.querySelectorAll("[data-stp]").forEach(function(b){ b.onclick=function(){ STV.p=b.getAttribute("data-stp"); vStats(el); }; });
  el.querySelectorAll("[data-stn]").forEach(function(b){ b.onclick=function(){ go_(+b.getAttribute("data-stn")); }; });
  el.querySelectorAll("[data-stm]").forEach(function(b){ b.onclick=function(){ STV.mt=b.getAttribute("data-stm"); vStats(el); }; });
  el.querySelectorAll("[data-std]").forEach(function(b){ b.onclick=function(){ var d=b.getAttribute("data-std"); if(d>today) return; STV.d=d; STV.p="d"; vStats(el); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll("[data-stmo]").forEach(function(b){ b.onclick=function(){ var m=+b.getAttribute("data-stmo"); STV.m=STV.y+"-"+pad(m+1); STV.p="m"; vStats(el); }; });
  var di=el.querySelector("#stDate"); if(di) di.onchange=function(){ if(di.value && di.value<=today){ STV.d=di.value; vStats(el); } };
  // 0.33.0: the period follows the finger
  var nxtOk=function(dir){ if(STV.p==="d") return ymd(addDays(parseYmd(STV.d),dir))<=today; if(STV.p==="m"){ var p2=STV.m.split("-"); return ymd(new Date(+p2[0],+p2[1]-1+dir,1)).slice(0,7)<=today.slice(0,7); } return STV.y+dir<=now.getFullYear(); };
  IbSwipe(el.querySelector("#stBox"), {can:function(s){ return nxtOk(s<0?1:-1); }, go:function(s){ go_(s<0?1:-1, s); }, find:function(){ return el.querySelector("#stBox"); },
    peek:function(s){ var v0=JSON.stringify(STV), b=IbSwipe.shot(function(){ mut(s<0?1:-1); }, vStats, function(){ var v1=JSON.parse(v0); for(var k in v1) STV[k]=v1[k]; }); return b && b.querySelector("#stBox"); }});
  var so=el.querySelector("#stOn"); if(so) so.onclick=function(){ var en_on=function(){ S.stepsOn=true; saveS(); if(N.stepsOn) N.stepsOn(true); if(N.stepsNow){ var hs=function(){ off("steps",hs); vStats(el); }; on("steps",hs); N.stepsNow(); } vStats(el); };
    if(!window.Native || !N.hasPerm || N.hasPerm("steps")) en_on(); else { var hp=function(p){ if(p.which!=="steps") return; off("perm",hp); if(p.granted) en_on(); else toast(L2x("Kebenaran aktiviti fizikal diperlukan","Physical activity permission is needed")); }; on("perm",hp); N.requestPerm("steps"); } };
  var sg=el.querySelector("#stGoal"); if(sg) sg.onclick=function(){ var v=prompt(L2x("Sasaran langkah sehari","Daily step goal"), S.stepGoal||6000); if(v && +v>0){ S.stepGoal=Math.round(+v); saveS(); vStats(el); } };
  var su=el.querySelector("#stUse"); if(su) su.onclick=function(){ if(window.Native && N.requestPerm) N.requestPerm("usage"); var hr=function(){ off("resume",hr); vStats(el); }; on("resume",hr); };
}
on("resume", function(){ if(S.stepsOn && window.Native && N.stepsNow && view==="cal" && SUB2.cal==="statistik"){ var hs=function(){ off("steps",hs); render(); }; on("steps",hs); N.stepsNow(); } });
function qListenCard(){ var o={}; try{ o=JSON.parse((window.Native && N.qListen)?N.qListen():"{}")||{}; }catch(e){}
  var t=new Date(), wk=0, mo=0, all=0, bars='', mx=1, d7=[]; for(var i=6;i>=0;i--){ var v=o[ymd(addDays(t,-i))]||0; d7.push(v); mx=Math.max(mx,v); }
  for(var k in o){ all+=o[k]; if(k.slice(0,7)===ymd(t).slice(0,7)) mo+=o[k]; } d7.forEach(function(v){ wk+=v; });
  d7.forEach(function(v,i){ bars+='<div class="qday"><i style="height:'+Math.round(v*100/mx)+'%"></i><small>'+addDays(t,i-6).getDate()+'</small></div>'; });
  var m=function(s){ return Math.round(s/60)+" "+L2x("min","min"); };
  return '<div class="card"><h3>🎧 '+L2x("Dengar Al-Quran","Quran listening")+'</h3><div class="urow"><div><div class="mut tiny">'+L2x("Hari ini","Today")+'</div><div class="ubig">'+m(o[ymd(t)]||0)+'</div></div><div><div class="mut tiny">'+L2x("7 hari","7 days")+'</div><div class="ubig gold">'+m(wk)+'</div></div></div>'+
    '<div class="qdays">'+bars+'</div><div class="mut tiny">'+L2x("Bulan ini ","This month ")+m(mo)+' · '+L2x("Jumlah ","Total ")+m(all)+'. '+L2x("Dikira ketika bacaan ayat Al-Quran dimainkan dalam aplikasi, termasuk ketika skrin tertutup.","Counted while Quran ayat audio plays in the app, including with the screen off.")+'</div></div>'; }
function weekFard(){ var t=new Date(), mon=addDays(t,-((t.getDay()+6)%7)), n=0; for(var i=0;i<7;i++){ var f=fardDay(ymd(addDays(mon,i))); PR.forEach(function(k){ if(f[k]&&f[k].c>=f[k].tg) n++; }); } return n; }
// usage with a live seconds counter
function usageLive(){ var u=useSec(ymd(new Date())); if(uOn) u+=Math.max(0,Math.min(90000,Date.now()-uMark))/1000; return u; }
function durHMS(sec){ sec=Math.floor(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60; return (h?h+":"+pad(m):m)+":"+pad(s); }
setInterval(function(){ var e=document.querySelectorAll("[data-ulive]"); if(!e.length) return; var v=durHMS(usageLive()); for(var i=0;i<e.length;i++) e[i].textContent=v; }, 1000);
function wUsage(w,h){ usageFlush(); var k=ymd(new Date()), u=useSec(k), p=plogSec(k), y=useSec(ymd(addDays(new Date(),-1)));
  return '<div class="card wuse" data-wsc="sc-stat"><div class="mut tiny">⏱ '+L2x("Hari ini","Today")+'</div><div class="ubig" data-ulive="1">'+durHMS(usageLive())+'</div>'+(h>=2?'<div class="ubar1"><i style="width:'+Math.min(100,Math.round(u*100/Math.max(u,y,1800)))+'%"></i></div><div class="mut tiny">'+L2x("Solat ","Prayer ")+durEn(p)+' · '+L2x("semalam ","yesterday ")+durEn(y)+'</div>':'')+'</div>'; }

// ---------- ALAT: Halal / Saham / Cari / Kad / Senyap ----------
function vAlat(el){
  var s=SUB2.alat;
  if(s==="keluarga"){ vFam(el); return; }
  if(s==="kewangan"){
    // 0.5.13 (Ihsan): Hutang … Tukaran as tabs on top; swipe or the ◀ ▶ arrows at the bottom move between them
    if(SUB2.fin==="saham"){ SUB2.fin="tukaran"; finStk=true; }
    var FL=SUBS.fin, fi=function(){ var i=0; FL.forEach(function(x, k){ if(x[0]===SUB2.fin) i=k; }); return i; };
    el.innerHTML='<div class="fintabs">'+FL.map(function(x){ return '<button class="chip g3d'+(SUB2.fin===x[0]?" on":"")+'" data-fs="'+x[0]+'">'+x[1]+' '+esc(subName(x))+'</button>'; }).join("")+'</div><div id="finHost"></div>';
    el.querySelectorAll("[data-fs]").forEach(function(b){ b.onclick=function(){ SUB2.fin=b.getAttribute("data-fs"); render(); document.getElementById("view").scrollTop=0; }; });
    var fh=el.querySelector("#finHost"); vFin(fh);
    IbSwipe(fh, {can:function(sd){ var i=fi(); return sd<0 ? i<FL.length-1 : i>0; }, go:function(sd){ SUB2.fin=FL[fi()+(sd<0?1:-1)][0]; render(); document.getElementById("view").scrollTop=0; },
      find:function(){ return document.querySelector("#view #finHost"); }, skip:function(){ var a=document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }});
    return; }
  if(s==="halal"){ vHalal(el); if(aiJump){ aiJump=false; var n=0, iv=setInterval(function(){ var a=document.getElementById("hAiSet"); if(a||++n>30){ clearInterval(iv); if(a){ a.open=true; a.scrollIntoView({behavior:"smooth"}); } } },120); } return; }
  if(s==="saham"){ el.innerHTML='<div class="card"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri (5% / 33% / 33%).","The official SC list, your saved stocks and a self-screen (5% / 33% / 33%).")+'</div><button class="btn gold full g3d" data-saham="1" style="margin-top:10px">📈 '+L2x("Buka","Open")+'</button></div>'; return; }
  if(s==="senyap"){ s=SUB2.alat="cari"; }
  // 0.36.0 (Farah): Nota became "Tulis" (Write) and holds the greeting cards; Majlis (events planner) is its own page left of Kewangan
  if(s==="kad"){ s=SUB2.alat="nota"; wrTab="kad"; }
  if(s==="nota"){ vWrite(el); return; }
  if(s==="buku"){ SUB2.alat="nota"; wrTab="buku"; vWrite(el); return; }
  if(s==="majlis"){ vMajlis(el); return; }
  if(s==="cari"){ withExtra(el, function(){ el.innerHTML=IbExtra.vCari(el, xH())+'<div id="mqSlot" style="margin-top:12px"><div class="snl">🔕 '+L2x("Senyap di masjid (hanya tempat yang anda tambah)","Silent at the masjid (only places you add)")+'</div>'+mqCard()+'</div>'; IbExtra.bindCari(el, xH()); bindMq(el); }); return; }
  el.innerHTML=mqCard(); bindMq(el);
}

// ---------- 0.21.0 KEWANGAN: Hutang / Komitmen / Zakat / Saham (finance/finance.js) ----------
// 0.4.8: helpers for the currency page (finance helpers + network fetch + settings)
var fxPair=null;
function finH2(){ var h=finH(); h.fetch=nFetch; h.S=S; return h; }
function finH(){ return {N:N, on:on, off:off, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, load:load, save:save, render:render, go:go,
  resched:pushSchedule, hijri:hijriOf, addDays:addDays, dockFix:dockFix, openQuranAt:openQuranAt, openWeb:openWeb, IbFold:IbFold}; }
var finStk=false;
function stkHtml(){ return '<div class="card"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri (5% / 33% / 33%).","The official SC list, your saved stocks and a self-screen (5% / 33% / 33%).")+'</div><button class="btn gold full g3d" data-saham="1" style="margin-top:10px">📈 '+L2x("Buka","Open")+'</button></div>'; }
function vFin(el){
  var s=SUB2.fin;
  if(s==="saham"){ s=SUB2.fin="tukaran"; finStk=true; }
  if(s==="tukaran"){ var pr=fxPair; fxPair=null;
    // 0.5.13 (Ihsan): Saham (Shariah stocks + live gold price) now sits at the bottom of Tukaran
    el.innerHTML='<div id="fxBox"></div><div id="stkBox">'+stkHtml()+'<div id="goldC"></div></div>'; var fx=el.querySelector("#fxBox"), sb=el.querySelector("#stkBox"); goldCard(sb.querySelector("#goldC"));
    if(finStk){ finStk=false; setTimeout(function(){ if(document.body.contains(sb)) sb.scrollIntoView({block:"start"}); }, 250); }
    var go2=function(){ if(document.body.contains(fx)) try{ FxView.view(fx, finH2(), pr); }catch(err){ console.error(err); fx.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
    if(window.FxView) go2(); else { fx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["finance/fx.js"], go2); } return; }
  var start=function(){ if(!document.body.contains(el)) return; try{ FinView(el, s, finH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FinView && (s!=="wasiat" || window.FinMore)) start(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["finance/finance.js"].concat(s==="wasiat"?["finance/wasiat.js"]:[]), start); }
}

// 0.36.0 (Farah): live gold price chart on the Saham page (TradingView widget, needs internet). Currency and range are remembered.
var GOLD=load("ihsan_gold",{c:"MYR", r:"1M"});
function goldCard(box){
  if(!box) return;
  var cur=GOLD.c==="USD"?"USD":"MYR", rg=GOLD.r||"1M", sym=cur==="USD"?"OANDA:XAUUSD":"FX_IDC:XAUMYR", th=APP_THEMES.filter(function(t){ return t[0]===themeNow; })[0], dark=!(th && th[6]);
  box.innerHTML='<div class="card goldc"><div class="row"><h3 style="margin:0">🪙 '+L2x("Harga emas (langsung)","Gold price (live)")+'</h3><span class="seg">'+["MYR","USD"].map(function(c){ return '<button class="'+(cur===c?"on":"")+'" data-gc="'+c+'">'+c+'</button>'; }).join("")+'</span></div>'+
    '<div class="chips" style="margin:8px 0 4px">'+[["1D","1H","1D"],["1M","1B","1M"],["12M","1T","1Y"],["60M","5T","5Y"]].map(function(x){ return '<button class="chip g3d'+(rg===x[0]?" on":"")+'" data-gr="'+x[0]+'">'+L2x(x[1],x[2])+'</button>'; }).join("")+'</div>'+
    '<div class="goldw" id="goldW"><div class="mut small" style="padding:30px 0;text-align:center">'+L2x("Memuatkan carta… (perlu internet)","Loading chart… (needs the internet)")+'</div></div>'+
    '<div class="mut tiny" style="margin-top:6px;line-height:1.45">'+L2x("Harga emas dunia bagi 1 auns troy (31.1 g), daripada TradingView. Harga kedai emas dan akaun emas bank berbeza (upah, spread). Bukan nasihat pelaburan.","World gold price for 1 troy ounce (31.1 g), from TradingView. Jewellers' and bank gold-account prices differ (workmanship, spread). Not investment advice.")+'</div></div>';
  box.querySelectorAll("[data-gc]").forEach(function(b){ b.onclick=function(){ GOLD.c=b.getAttribute("data-gc"); save("ihsan_gold",GOLD); goldCard(box); }; });
  box.querySelectorAll("[data-gr]").forEach(function(b){ b.onclick=function(){ GOLD.r=b.getAttribute("data-gr"); save("ihsan_gold",GOLD); goldCard(box); }; });
  var w=box.querySelector("#goldW"), cfg={symbols:[[cur==="USD"?"XAU/USD":"XAU/MYR", sym+"|"+rg]], chartOnly:false, width:"100%", height:300, locale:en_()?"en":"ms_MY", colorTheme:dark?"dark":"light", autosize:true, showVolume:false, hideDateRanges:true, hideMarketStatus:false, scalePosition:"right", scaleMode:"Normal", fontFamily:"inherit", fontSize:"10", noTimeScale:false, valuesTracking:"1", changeMode:"price-and-percent", chartType:"area", lineColor:"#c9a646", topColor:"rgba(201,166,70,.35)", bottomColor:"rgba(201,166,70,0)", lineWidth:2, backgroundColor:"rgba(0,0,0,0)", isTransparent:true, dateRanges:[rg.toLowerCase()]};
  if(!navigator.onLine){ w.innerHTML='<div class="mut small" style="padding:30px 0;text-align:center">📶 '+L2x("Tiada internet. Carta emas perlu sambungan.","No internet. The gold chart needs a connection.")+'</div>'; return; }
  var c=document.createElement("div"); c.className="tradingview-widget-container"; c.style.height="300px"; c.innerHTML='<div class="tradingview-widget-container__widget" style="height:100%"></div>';
  var sc=document.createElement("script"); sc.type="text/javascript"; sc.async=true; sc.src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"; sc.text=JSON.stringify(cfg);
  c.appendChild(sc); c.style.position="absolute"; c.style.inset="0"; c.style.opacity="0"; c.style.transition="opacity .3s";
  setTimeout(function(){ if(!document.body.contains(w)) return; w.style.position="relative"; w.appendChild(c);
    // show the chart once TradingView's frame has loaded; if it never does, say so
    var n=0, iv=setInterval(function(){ var f=c.querySelector("iframe"); if(!document.body.contains(w)){ clearInterval(iv); return; }
      if(f && !f._ib){ f._ib=1; f.addEventListener("load", function(){ c.style.opacity="1"; var m=w.firstChild; if(m && m!==c) m.style.visibility="hidden"; }); }
      if(++n>60){ clearInterval(iv); if(c.style.opacity!=="1"){ var m2=w.firstChild; if(m2 && m2!==c) m2.textContent="📶 "+L2x("Carta tidak dapat dimuatkan. Semak internet dan cuba lagi.","The chart could not load. Check the internet and try again."); } } }, 250); }, 50);
}

// ---------- 0.24.0 EXTRA (extra/extra.js): Cari for donors, surau list, graves + ziarah, flight solat, quiz, sirah snippet ----------
function xH(){ var h=finH(); h.loadJs=loadJs; h.openFinder=openFinder; h.qiblaBearing=qiblaBearing; h.openSirah=function(id){ openSirah(false, id); };
  h.timesAt=function(lat,lon){ var d=new Date(), r=calcDay(d, lat, lon, {fa:18, ia:17, tz:-d.getTimezoneOffset()/60, ik:1}); return [["Subuh",r.subuh],[L2x("Syuruk","Sunrise"),r.syuruk],["Zohor",r.zohor],["Asar",r.asar],["Maghrib",r.maghrib],["Isyak",r.isyak]]; };
  return h; }
function withExtra(el, fn){ var ok=function(){ if(!el || document.body.contains(el)) fn(); };
  if(window.IbExtra) ok(); else { if(el) el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["extra/extra.js"], ok); } }

// ---------- 0.23.0 KELUARGA (Alat): salasilah 3D, birthdays, baby names, nikah (family/family.js) ----------
function famH(){ var h=finH(); if(window.FinUI){ FinUI.setH(h); h.fld=FinUI.fld; h.ayat=FinUI.ayat; } h.loadJs=loadJs; h.cc=phoneCC; return h; }
// 0.33.5: phone country code from the app's location (Malaysia unless the location is set abroad)
function phoneCC(){ if(!overseasNow() || S.lat==null) return S.ulang==="id"?"62":"60"; var a=S.lat, o=S.lon, in_=function(a1,a2,o1,o2){ return a>=a1&&a<=a2&&o>=o1&&o<=o2; };
  if(in_(1.15,1.48,103.6,104.1)) return "65"; if(in_(4,5.1,114,115.4)) return "673"; if(in_(-11,6,95,141.1)) return "62"; if(in_(5.6,20.5,97,106)) return "66"; if(in_(16,32.2,34.5,55.7)) return "966"; if(in_(22.5,26.1,51.5,56.4)) return "971";
  if(in_(49.9,60.9,-8.2,1.8)) return "44"; if(in_(-44,-10,112,154)) return "61"; if(in_(24,72,-170,-52)) return "1"; return "60"; }
function vFam(el){ var go_=function(){ if(document.body.contains(el)) FamView(el, famH()); };
  if(window.FamView && window.BABY_NAMES && window.BabyView && window.EventView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["family/family.js","family/names.js","family/baby.js","family/events.js"], go_); } }
// 0.35.0: open Keluarga at a section ("baby", "events") from a widget
function famOpen(sec){ if(sec==="events"||sec==="nikah"){ SUB2.alat="majlis"; go("alat"); return; } window.FamOpenSec=sec; SUB2.alat="keluarga"; go("alat"); }
// 0.36.0: Majlis (family/events.js) as its own Alat page
function vMajlis(el){
  var go_=function(){ if(!document.body.contains(el)) return; var h=famH(); try{ FamView.data(h); }catch(e){}
    EventView._draw=function(){ if(!document.body.contains(el)){ EventView._draw=null; return; } var v=document.getElementById("view"), y=v.scrollTop; EventView.view(el, famH(), ''); v.scrollTop=y; };
    EventView.view(el, h, ''); };
  if(window.FamView && window.EventView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["family/family.js","family/names.js","family/baby.js","family/events.js"], go_); } }
// 0.36.0: Tulis (Write) = Notes + Greeting cards, switched in the bottom bar
var wrTab="buku";   // 0.5.13 (Ihsan): Tulis became Baca (Read): Books first, then Notes and Greeting cards
var WRT=[["buku","📚","Buku","Books"],["nota","📝","Nota","Notes"],["kad","🎴","Kad ucapan","Greeting cards"]];
function kadHtml(){ return '<div class="card"><h3>🎴 '+L2x("Kad ucapan","Greeting cards")+'</h3><div class="mut small">'+L2x("Pilih sambutan, reka kad dan kongsi ke WhatsApp.","Pick an occasion, design a card and share it to WhatsApp.")+'</div><div class="lgrid" style="margin-top:10px">'+KAD_OCC.map(function(o){ return '<button class="qt g3d" data-kad="'+o[0]+'"><span>'+({fitri:"🌙",adha:"🐑",ramadan:"🏮",hijrah:"✨"}[o[0]]||"🎴")+'</span>'+esc(L2x(o[1],o[2]))+'</button>'; }).join("")+'</div></div>'; }
function vWrite(el){
  if(!WRT.some(function(x){ return x[0]===wrTab; })) wrTab="buku";
  el.innerHTML='<div class="dock"><div class="grp3">'+WRT.map(function(x){ return '<button class="chip g3d'+(wrTab===x[0]?" on":"")+'" data-wr="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div></div><div id="wrBody"></div>';
  el.querySelectorAll("[data-wr]").forEach(function(b){ b.onclick=function(){ wrTab=b.getAttribute("data-wr"); render(); document.getElementById("view").scrollTop=0; }; });
  var body=el.querySelector("#wrBody"), draw=function(t, box){ if(t==="kad") box.innerHTML=kadHtml(); else if(t==="buku") vBooks(box); else vNotes(box); }, wi=function(){ var i=0; WRT.forEach(function(x, k){ if(x[0]===wrTab) i=k; }); return i; };
  draw(wrTab, body);
  // swipe between Notes and Cards, the other one riding in beside the finger
  IbSwipe(body, {can:function(s){ var i=wi(); return s<0 ? i<WRT.length-1 : i>0; }, go:function(s){ wrTab=WRT[wi()+(s<0?1:-1)][0]; render(); },
    find:function(){ return document.querySelector("#view #wrBody"); },
    skip:function(){ var a=document.activeElement; return a && /INPUT|TEXTAREA/.test(a.tagName); },
    peek:function(s){ var w=WRT[wi()+(s<0?1:-1)]; if(!w) return null; if(w[0]==="buku") return '<div class="card mut">📚 '+L2x("Buku","Books")+'</div>'; var b=document.createElement("div"); draw(w[0], b); return b.innerHTML; }});
}

// ---------- TETAPAN: a hub of seven pages ----------
var MGRP=[["paparan","🖥","Paparan & bahasa","Display & language",["🌐","🎨","🖥"]],["lokasi","🌍","Lokasi & waktu","Location & times",["⚙","⏱","🌍","💾"]],["makluman","🔔","Makluman","Alerts",["🔔"]],["rakaat","🧎","Kiraan rakaat","Rakaat counter",["🤲"]],["khas","🌸","Mod khas","Special modes",["🌸"]],["ai","✨","AI dalam talian","Online AI",[]],["sandaran","🗄","Sandaran & tentang","Backup & about",["🗄","ℹ"]]];
var MGRP_KW={paparan:"bahasa language rumi suara voice nada pitch tema theme saiz teks text size malam night pautan links ramadan",lokasi:"zon zone negeri state hijrah hijri pelarasan adjust minit minutes rumah home musafir travel luar talian offline kaedah method",makluman:"notifikasi notifications makluman alerts imsak syuruk tahajjud ma'thurat puasa fast skrin kunci lock screen azan penggera alarm",rakaat:"senyap silent jangan ganggu dnd getar vibrate sensor wajah face kalibrasi calibrate langkah step",khas:"uzur haid nifas sakit sick warga emas senior kanak-kanak kids pin kunci lock fokus focus pomodoro",ai:"ai kunci key api model halal tanya",sandaran:"sandaran backup pulih restore tentang about lesen licence"};
// 0.26.0: Tetapan is one continuous page; every group is collapsed and only the one you tap opens (accordion).
// 0.27.0: 8 voice styles for each reading language (Arabic, Malay, English): every installed phone voice, then pitch/speed variations of them
var VSTY=[[1,1,"Biasa","Normal"],[0.85,0.92,"Dalam","Deep"],[1.15,1,"Ringan","Light"],[1,0.8,"Perlahan","Slow"],[0.72,0.88,"Paling dalam","Deepest"],[1.3,1.05,"Tinggi","High"],[1,1.15,"Laju","Fast"],[0.9,0.75,"Tenang","Calm"]], vLang="ar", vCache={};
var VSAMPLE={ar:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", ms:"Assalamualaikum. Semoga hari anda diberkati Allah.", en:"Peace be upon you. May Allah bless your day."};
function vStyles(list){ var out=[], nv=list.length;
  for(var i=0;i<8;i++){ var v=nv?list[i%nv]:null, pr=nv?(i<nv?VSTY[0]:VSTY[1+Math.floor((i-nv)/nv)%7]):VSTY[i]; out.push({n:v?v.n:"", male:v?v.male:null, net:v?v.net:false, p:pr[0], r:pr[1], lab:L2x(pr[2],pr[3])}); }
  return out; }
function vSay(lang, st){
  var t=VSAMPLE[lang];
  if(window.Native && N.speak){ if(N.setVoiceFor) N.setVoiceFor(lang, st.n, st.p, st.r); N.speak(lang==="ar"?waqfAr(t):t, lang); return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=lang==="ar"?"ar-SA":lang==="ms"?"ms-MY":"en-GB"; u.pitch=st.p; u.rate=st.r*(lang==="ar"?0.8:0.95); var vv=speechSynthesis.getVoices().filter(function(v){ return v.name===st.n; })[0]; if(vv) u.voice=vv; speechSynthesis.speak(u); }catch(e){}
}
function voiceCard(){
  var c=document.createElement("div"); c.className="card"; c.id="vStyCard";
  var draw=function(){
    var list=vCache[vLang], cur=(S.vsty||{})[vLang];
    c.innerHTML='<h3>🌐 '+L2x("Suara bacaan: 8 pilihan setiap bahasa","Reading voice: 8 choices per language")+'</h3><div class="chips vlang">'+[["ar","العربية"],["ms","Melayu"],["en","English"]].map(function(x){ return '<button class="chip g3d'+(vLang===x[0]?" on":"")+'" data-vl="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'+
      (list?'<div class="vsty">'+vStyles(list).map(function(v,i){ return '<button class="chip g3d'+(cur&&cur.i===i?" on":"")+'" data-vs="'+i+'"><b>'+L2x("Suara ","Voice ")+(i+1)+'</b><small>'+(v.male===true?"♂ ":v.male===false&&v.n?"♀ ":"")+esc(v.lab)+(v.net?" ☁":"")+'</small></button>'; }).join("")+'</div>'+
        '<div class="mut tiny">'+(list.length?list.length+L2x(" suara dipasang di telefon ini; selebihnya ialah gaya nada dan kelajuan."," voices are installed on this phone; the rest are pitch and speed styles."):L2x("Tiada suara khusus dipasang, jadi 8 pilihan ini ialah gaya nada dan kelajuan suara asal. Pasang lebih banyak suara: Tetapan telefon → Teks ke pertuturan → Enjin Google → Pasang data suara.","No extra voices are installed, so these 8 are pitch and speed styles of the default voice. Add voices: phone Settings → Text-to-speech → Google engine → Install voice data."))+' '+L2x("Ketik untuk dengar dan pilih.","Tap to hear and choose.")+'</div>'
        :'<div class="mut small">…</div>');
    c.querySelectorAll("[data-vl]").forEach(function(b){ b.onclick=function(){ vLang=b.getAttribute("data-vl"); draw(); load_(); }; });
    c.querySelectorAll("[data-vs]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-vs"), st=vStyles(vCache[vLang])[i]; S.vsty=S.vsty||{}; S.vsty[vLang]={i:i, n:st.n, p:st.p, r:st.r}; if(vLang==="ar"){ S.voice=st.n; S.pitch=st.p; } saveS(); draw(); vSay(vLang, st); }; });
  };
  var load_=function(){ if(vCache[vLang]) return; var lg=vLang;
    if(window.Native && N.getVoicesFor){ var hv=function(r){ if(!r || r.lang!==lg) return; off("voices2",hv); vCache[lg]=r.list||[]; if(document.body.contains(c)) draw(); }; on("voices2",hv); N.getVoicesFor(lg); }
    else { var vs=[]; try{ vs=speechSynthesis.getVoices().filter(function(v){ return (lg==="ms"?/^(ms|id|in)/i:new RegExp("^"+lg,"i")).test(v.lang); }).map(function(v){ return {n:v.name, male:/male/i.test(v.name)&&!/female/i.test(v.name), net:!v.localService}; }); }catch(e){} vCache[lg]=vs; } };
  load_(); draw(); return c;
}
// 0.5.3 Tetapan › Paparan: tab bar order and size, and which notch buttons show
function barCard(){ var c=document.createElement("div"); c.className="card"; var nh=S.ntHide||{};
  c.innerHTML='<h3>🖥 '+L2x("Bar tab & takuk","Tab bar & notch")+'</h3><div class="btns"><button class="btn alt g3d" id="bcEdit">🔓 '+L2x("Susun tab","Arrange tabs")+'</button><button class="btn alt g3d" id="bcReset">↺ '+L2x("Set semula","Reset")+'</button></div>'+
    '<label class="set" style="margin-top:8px"><span>'+L2x("Saiz bar tab","Tab bar size")+' <b id="bcSzV">'+(S.barSize||0)+'</b></span><input type="range" min="0" max="5" step="1" id="bcSz" value="'+(S.barSize||0)+'"></label>'+
    '<div class="mut tiny">'+L2x("0 biasa · 2 tanpa jarak · 3 tanpa label · 4 ikon kecil · 5 teks sahaja","0 default · 2 no margins · 3 no labels · 4 small icons · 5 text only")+'</div>'+
    '<div class="snl" style="margin-top:10px">'+L2x("Butang takuk (atas bar tab)","Notch buttons (above the tab bar)")+'</div>'+
    [["T","▾",L2x("Sembunyi / tunjuk semua bar","Hide / show all bars")],["A","✕",L2x("Auto-sembunyi semasa tatal","Auto-hide while scrolling")],["L","🔒",L2x("Kunci / susun bar","Lock / arrange bars")]].map(function(x){ return '<label class="set"><span>'+x[1]+' '+x[2]+'</span><input type="checkbox" data-nth="'+x[0]+'"'+(nh[x[0]]?'':' checked')+'></label>'; }).join("");
  c.querySelector("#bcEdit").onclick=function(){ go(homeV()); setTimeout(function(){ barEditSet(true); }, 200); };
  c.querySelector("#bcReset").onclick=function(){ S.tabOrder=null; S.subOrder={}; S.barSize=0; barSizeApply(0); saveS(); render(); toast(L2x("Susunan dan saiz asal","Original order and size")); };
  var sz=c.querySelector("#bcSz"); sz.oninput=function(){ S.barSize=+sz.value; c.querySelector("#bcSzV").textContent=sz.value; barSizeApply(S.barSize); dockFix(); }; sz.onchange=function(){ saveS(); };
  c.querySelectorAll("[data-nth]").forEach(function(x){ x.onchange=function(){ S.ntHide=S.ntHide||{}; S.ntHide[x.getAttribute("data-nth")]=!x.checked; saveS(); notchFix(); }; });
  return c; }
function vMore(el){
  vMore0(el);
  if(!WEB) el.appendChild(voiceCard());
  el.appendChild(nameCard());
  el.appendChild(barCard());
  var cards=[].slice.call(el.children);
  var sen=el.querySelector("#sSenior"), senRow=sen?sen.closest(".set"):null;
  var acc=document.createElement("div"); acc.className="macc";
  MGRP.forEach(function(G){
    if(WEB && ["makluman","rakaat","ai"].indexOf(G[0])>=0) return;
    var sec=document.createElement("div"); sec.className="mSec g3d"+(moreGrp===G[0]?" open":""); sec.setAttribute("data-sec",G[0]);
    sec.innerHTML='<button class="mHd" data-mg="'+G[0]+'"><span class="mgi">'+G[1]+'</span><span class="mgn">'+esc(L2x(G[2],G[3]))+'</span><span class="chev">⌄</span></button><div class="mBd"></div>';
    var bd=sec.querySelector(".mBd");
    cards.forEach(function(c){ if(c.id==="mqCard") return; var h=c.querySelector("h3"), tx=h?h.textContent.trim():""; if(G[4].some(function(e){ return tx.indexOf(e)===0; })){ c.style.display=""; bd.appendChild(c); } });
    if(G[0]==="khas"){
      var k=document.createElement("div"); k.className="card cmp"; k.innerHTML='<h3>👓 '+L2x("Warga emas & kanak-kanak","Seniors & children")+'</h3><div id="senSlot"></div><div class="btns" style="margin-top:8px"><button class="btn alt g3d" data-go="kids">🧒 '+T("kids")+'</button>'+(S.kidLock?'':'<button class="btn alt g3d" id="kLock">🔒 '+L2x("Kunci mod kanak-kanak","Lock kids mode")+'</button>')+(S.appLock||S.kidLock||WEB?'':'<button class="btn alt g3d" id="aLock">📌 '+L2x("Kunci seluruh aplikasi","Lock the whole app")+'</button>')+'</div><div class="mut tiny" style="margin-top:6px">'+L2x("Profil anak dan PIN diurus dalam Mod kanak-kanak.","Child profiles and the PIN are managed in Kids mode.")+'</div>';
      bd.appendChild(k); if(senRow) k.querySelector("#senSlot").appendChild(senRow);
      var kl=k.querySelector("#kLock"); if(kl) kl.onclick=function(){ kidLockOn(); };
      var al=k.querySelector("#aLock"); if(al) al.onclick=function(){ appLockOn(); };
      var fo=document.createElement("div"); fo.className="card cmp"; fo.innerHTML='<h3>🎯 '+L2x("Fokus","Focus")+'</h3><div class="mut small" style="margin-bottom:8px">'+L2x("Sesi fokus, Pomodoro, Jangan Ganggu, pelan fokus waktu solat, kunci skrin fokus dan peringatan masa.","Focus sessions, Pomodoro, Do Not Disturb, prayer-time focus plans, focus screen lock and Time Nudge.")+'</div><button class="btn alt g3d" id="foOpen">🎯 '+L2x("Masa › Fokus","Time › Focus")+' ›</button>';
      if(!WEB) bd.appendChild(fo); fo.querySelector("#foOpen").onclick=function(){ SUB2.cal="fokus"; go("cal"); };
      var pw=(load("ihsan_period",{})||{}).who||"", pc=document.createElement("div"); pc.className="card cmp";
      pc.innerHTML='<h3>🌸 '+L2x("Tab Haid (Masa)","Period tab (Time)")+'</h3><div class="mut small" style="margin-bottom:8px">'+L2x("Untuk wanita, suami yang menjejak isteri, atau sembunyikan.","For women, husbands tracking their wife, or hide it.")+'</div><div class="btns">'+
        [["self",L2x("Saya","Me")],["spouse",L2x("Isteri saya","My wife")],["off",L2x("Sembunyi","Hidden")]].map(function(o){ return '<button class="chip'+(pw===o[0]?' on':'')+'" data-pwho="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>';
      pc.querySelectorAll("[data-pwho]").forEach(function(b){ b.onclick=function(){ var p=load("ihsan_period",{})||{}; p.who=b.getAttribute("data-pwho"); save("ihsan_period",p); toast(p.who==="off"?L2x("Tab Haid disembunyikan","Period tab hidden"):L2x("Tab Haid ditunjukkan dalam Masa","Period tab shown in Time")); render(); }; });
      bd.appendChild(pc);
    }
    acc.appendChild(sec);
  });
  cards.forEach(function(c){ if(c.parentNode===el) c.style.display="none"; });
  el.insertBefore(acc, el.firstChild);
  // 0.4.3: the launcher tickbox is the first thing in Paparan & bahasa
  var pap=acc.querySelector('[data-sec="paparan"] .mBd'); if(pap && !WEB){ var hc=document.createElement("div"); hc.className="card cmp"; hc.id="homeCard"; pap.insertBefore(hc, pap.firstChild); homeCard(hc); }
  var ver=document.createElement("div"); ver.className="mut tiny"; ver.style.padding="0 4px 12px"; ver.textContent="My Ihsan "+APP_VER; acc.appendChild(ver);
  acc.querySelectorAll("[data-mg]").forEach(function(b){ b.onclick=function(){ var g=b.getAttribute("data-mg");
    var sec=b.parentNode, was=sec.classList.contains("open");
    acc.querySelectorAll(".mSec.open").forEach(function(x){ x.classList.remove("open"); });
    if(!was){ sec.classList.add("open"); moreGrp=g; if(g==="ai") aiSetMount(sec.querySelector(".mBd")); var v=el.closest(".setpb")||document.getElementById("view"); setTimeout(function(){ v.scrollTop=Math.max(0, sec.offsetTop-8); },0); } else moreGrp=null; }; });
  if(moreGrp==="ai"){ var aiB=acc.querySelector('[data-sec="ai"] .mBd'); if(aiB) aiSetMount(aiB); }
}
// ---------- 0.5.5 Tetapan as a right-hand panel: 80% wide by default; drag the notch on its left edge (60-100%) ----------
var setOn=false;
function setPanel(){ var p=document.getElementById("setp"); if(p) return p;
  p=document.createElement("aside"); p.id="setp";
  p.innerHTML='<div class="setph"><b>⚙ <span id="setT"></span></b><button class="sdc" id="setX" aria-label="✕">✕</button></div><div class="setpb" id="setB"></div><div class="setpg noswipe" id="setG"><i></i></div>';
  var sc=document.createElement("div"); sc.id="setScrim"; document.body.appendChild(sc); document.body.appendChild(p);
  sc.onclick=function(){ setShow(false); }; p.querySelector("#setX").onclick=function(){ setShow(false); };
  var g=p.querySelector("#setG"), x0=null, w=0;
  g.addEventListener("pointerdown", function(e){ x0=e.clientX; w=0; p.classList.add("drag"); try{ g.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  g.addEventListener("pointermove", function(e){ if(x0===null) return; w=Math.max(60, Math.min(100, Math.round((window.innerWidth-e.clientX)*100/window.innerWidth))); p.style.width=w+"vw"; });
  var up=function(){ if(x0===null) return; x0=null; p.classList.remove("drag"); if(w){ S.setW=w; saveS(); } }; g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
  return p; }
function setShow(on){ if(on && S.appLock && !S.kidLock) return; var p=setPanel(); setOn=!!on; p.style.width=(S.setW||80)+"vw";
  p.querySelector("#setT").textContent=L2x("Tetapan","Settings"); p.querySelector("#setG").setAttribute("aria-label", L2x("Seret untuk ubah lebar","Drag to resize"));
  p.classList.toggle("on", setOn); document.getElementById("setScrim").classList.toggle("on", setOn);
  if(setOn){ if(sideOpen) sideShow(false); setDraw(); } }
function setDraw(){ var b=document.getElementById("setB"); if(!b || !setOn) return; var y=b.scrollTop; b.innerHTML=""; try{ vMore(b); }catch(err){ console.error(err); } b.scrollTop=y; }
window.openSettings=function(g){ moreGrp=g||null; var was=setOn; setShow(true); var b=document.getElementById("setB"); if(g && b){ setTimeout(function(){ var sec=b.querySelector('[data-sec="'+g+'"]'); if(sec) b.scrollTop=Math.max(0, sec.offsetTop-8); }, 60); } else if(!was && b) b.scrollTop=0; };
// Tetapan › AI dalam talian (ai/aiset.js, with halal/halal_ai.js)
function aiSetMount(bd){ if(!bd) return; bd.innerHTML='<div class="mut small" style="padding:8px">'+L2x("Memuatkan…","Loading…")+'</div>';
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="halal/halal.css"; document.head.appendChild(lk); }
  var go_=function(){ if(document.body.contains(bd)) try{ AISet.render(bd, {N:N, S:S, esc:esc, L2x:L2x, toast:toast, load:load, save:save, on:on, off:off}); }catch(err){ console.error(err); } };
  if(window.AISet && window.HalalAI) go_(); else loadJs((window.HalalAI?[]:["halal/halal_ai.js"]).concat(window.AISet?[]:["ai/aiset.js"]), go_, function(){ bd.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); }
var APP_VER="0.5.15";
// ---------- 0.4.3 phone home screen (launcher) ----------
function homeCard(c){
  var st={}; try{ st=JSON.parse(N.homeState?N.homeState():"{}"); }catch(e){}
  c.innerHTML='<h3>📱 '+L2x("Skrin utama telefon","Phone home screen")+'</h3><label class="set" style="gap:10px"><span><b>'+L2x("Jadikan My Ihsan skrin utama telefon","Use My Ihsan as the phone's home screen")+'</b></span><input type="checkbox" id="hmOn"'+(st.on?' checked':'')+' style="width:22px;height:22px;accent-color:var(--gold)"></label>'+
    '<div class="mut tiny" style="margin:2px 0 8px;line-height:1.45">'+(st.on&&st.def?'✅ '+L2x("Aktif. Tab Utama kini halaman suapan di kiri skrin utama telefon.","Active. The Utama tab is now the feed page on the left of the phone home screen."):st.on?'⚠ '+L2x("Pilih My Ihsan sebagai pelancar dalam tetingkap Android.","Choose My Ihsan as the launcher in the Android window."):L2x("Seperti Nova Launcher: widget telefon, folder, laci aplikasi, isyarat, grid hingga 15×15, dengan widget My Ihsan.","Like Nova Launcher: phone widgets, folders, app drawer, gestures, grid up to 15×15, with My Ihsan widgets."))+'</div>'+
    '<div class="btns"><button class="btn alt g3d" id="hmSet">⚙ '+L2x("Tetapan skrin utama","Home screen settings")+'</button>'+(st.on?'<button class="btn alt g3d" id="hmGo">🏠 '+L2x("Buka","Open")+'</button>':'')+'</div>';
  var cb=c.querySelector("#hmOn"); cb.onchange=function(){ if(!window.Native||!N.homeEnable){ toast(L2x("Dalam aplikasi telefon sahaja","In the phone app only")); cb.checked=false; return; } N.homeEnable(cb.checked); launcherOn.c=null; };
  c.querySelector("#hmSet").onclick=function(){ openHomeSet(); };
  var g=c.querySelector("#hmGo"); if(g) g.onclick=function(){ N.homeGo(); };
}
function openHomeSet(sec){
  if(!document.querySelector('link[href="home/homeset.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="home/homeset.css"; document.head.appendChild(lk); }
  loadJs(["home/homeset.js"], function(){ HomeSet.open({L2x:L2x, esc:esc, showSheet:showSheet, closeOverlay:closeOverlay, toast:toast, S:S, onClose:function(){ launcherOn.c=null; render(); }}, sec); });
}
on("homeimport", function(r){ if(r && r.cancel) return; toast(r && r.ok ? "✅ "+L2x("Diimport: ","Imported: ")+(r.msg||"") : "⚠ "+L2x("Tidak dapat diimport","Could not import")+(r && r.msg ? ": "+r.msg : "")); if(window.HomeSet) HomeSet.refresh(); });
on("homestate", function(){ launcherOn.c=null; if(window.HomeSet) HomeSet.refresh(); var hc=document.getElementById("homeCard"); if(hc) homeCard(hc); render(); });

// ---------- Home shortcuts: pick your own 8 ----------
var Q8=[["rk","🕌",["Kira rakaat","Count rakaat"],"q-rk"],["qibla","🧭",["Kiblat","Qibla"],"q-qibla"],["tasbih","📿",["Tasbih","Tasbih"],"q-tasbih"],["mathurat","📖",["Ma'thurat","Ma'thurat"],"q-mathurat"],["doa","🤲",["Doa","Doa"],"q-doa"],["amal","🌱",["Amal sunat","Sunnah deeds"],"q-amal"],["kids","🧒",["Kanak-kanak","Kids"],"q-kids"],["finder","📍",["Cari","Find"],"q-finder"],
  ["halal","🏷️",["Halal","Halal"],"w:sc-halal"],["barcode","🛒",["Kod bar","Barcode"],"w:sc-barcode"],["sirah","🐪",["Sirah","Sirah"],"w:sc-sirah"],["hajj","🕋",["Haji 3D","Hajj 3D"],"w:sc-hajj"],["umrah","🧳",["Umrah DIY","Umrah DIY"],"w:sc-umrahdiy"],["tawaf","🔢",["Tawaf","Tawaf"],"w:sc-tawaf"],["cal","📅",["Masa","Time"],"w:sc-cal"],["radio","📻",["Radio","Radio"],"w:sc-radio"],["qcam","📷",["Kiblat kamera","Qibla camera"],"w:sc-qcam"],["kad","🎴",["Kad ucapan","Cards"],"w:sc-kad"],["saham","📈",["Saham","Stocks"],"w:sc-saham"],["stat","📊",["Statistik","Stats"],"w:sc-stat"]];
HC.quick=function(){
  var sel=(S.quick8&&S.quick8.length)?S.quick8:["rk","qibla","tasbih","mathurat","doa","amal","kids","finder"];
  if(WEB){ var WQ=["qibla","finder","halal","barcode","radio","qcam","saham","stat"]; if(!(S.quick8&&S.quick8.length)) sel=["rk","tasbih","mathurat","doa","amal","kids","sirah","hajj"]; sel=sel.filter(function(k){ return WQ.indexOf(k)<0; }); }
  return '<div class="card qgrid">'+sel.map(function(k){ var q=Q8.filter(function(x){ return x[0]===k; })[0]; if(!q) return ''; var a=q[3].indexOf("w:")===0?'data-wsc="'+q[3].slice(2)+'"':'data-act="'+q[3]+'"'; return '<button class="qt g3d" '+a+'><span>'+q[1]+'</span>'+esc(L2x(q[2][0],q[2][1]))+'</button>'; }).join("")+'<button class="qt g3d q8e" data-act="pick8" aria-label="edit"><span>✎</span>'+L2x("Pilih","Pick")+'</button></div>';
};
function homeAct(a){ if(a==="pick8"){ pick8(); return; } if(a==="q-books"){ SUB2.alat="nota"; wrTab="buku"; go("alat"); return; } if(a.indexOf("q-book:")===0){ var bid=a.slice(7); SUB2.alat="nota"; wrTab="buku"; go("alat"); withBooks(function(){ BooksView.open(bid, bkH()); }); return; } if(a==="q-period"){ SUB2.cal="haid"; go("cal"); return; } if(a==="q-resepi"||a==="q-rplan"){ halalAuto=a==="q-rplan"?"rplan":"recipes"; if(window.HalalRecipe) HalalRecipe.open(a==="q-rplan"?"plan":"list"); SUB2.alat="halal"; go("alat"); return; } if(a==="q-khutbah"){ khutbahSheet(); return; } if(a==="q-stat"){ SUB2.cal="statistik"; go("cal"); return; } if(a==="q-nota"){ SUB2.alat="nota"; go("alat"); return; } if(a==="q-kiblat"){ SUB2.solat="kiblat"; go("solat"); return; } homeAct0(a); }
// 0.2.9: recipe builder shortcut + today's menu from the meal plan
WG["sc-resepi"]=scW("tools","🍲","Resepi halal","Halal recipes","q-resepi","Simpan & tukar resepi jadi halal","Save recipes & make them halal");
WG["rcp-today"]=cardW("tools","🍽️","Menu hari ini","Today's menu",function(){ var p=load("ihsan_rcp_plan",{}), rs=load("ihsan_recipes",[]), ids=p[ymd(new Date())]||[];
  var l=ids.map(function(id){ for(var i=0;i<rs.length;i++) if(rs[i].id===id) return rs[i].title; return null; }).filter(Boolean);
  return '<div data-act="q-rplan"><div class="mut tiny">🍽️ '+L2x("Menu hari ini","Today's menu")+'</div>'+(l.length?l.slice(0,3).map(function(t){ return '<div class="small"><b>'+esc(t)+'</b></div>'; }).join(""):'<div class="mut small">'+L2x("Belum dirancang. Ketik untuk merancang.","Nothing planned. Tap to plan.")+'</div>')+'</div>'; },[2,2],[2,1]);
WG["sc-stat"]=scW("stats","📊","Statistik","Stats","q-stat","Masa guna & solat dikira","Time spent & prayers counted");
WG["steps"]=cardW("stats","🚶","Langkah hari ini","Steps today",function(){ var t=ymd(new Date()), o=stepMap()[t]||{s:0,a:0}, g=S.stepGoal||6000;
  if(!S.stepsOn) return '<div class="small">🚶 '+L2x("Pengiraan langkah belum dihidupkan. Buka Statistik untuk mula.","Step counting is off. Open Stats to start.")+'</div><button class="btn alt full g3d" data-act="q-stat" style="margin-top:6px">📊 '+L2x("Statistik","Stats")+'</button>';
  return '<div class="urow" data-act="q-stat"><div><div class="mut tiny">'+L2x("Langkah","Steps")+'</div><div class="ubig">'+fmtSteps(o.s)+'</div></div><div><div class="mut tiny">'+L2x("Aktif","Active")+'</div><div class="ubig gold">'+(o.a||0)+' min</div></div></div><div class="ubar1"><i style="width:'+Math.min(100,Math.round(o.s*100/g))+'%"></i></div>'; },[4,2],[2,2]);
WG["screen"]=cardW("stats","📱","Masa skrin telefon","Phone screen time",function(){ var t=ymd(new Date());
  if(!hasUsageAcc()) return '<div class="small">📱 '+L2x("Benarkan akses penggunaan dalam Statistik untuk melihat masa skrin.","Allow usage access in Stats to see screen time.")+'</div><button class="btn alt full g3d" data-act="q-stat" style="margin-top:6px">📊 '+L2x("Statistik","Stats")+'</button>';
  var sc=screenMap(t,t)[t]||0; return '<div class="urow" data-act="q-stat"><div><div class="mut tiny">'+L2x("Skrin hidup hari ini","Screen on today")+'</div><div class="ubig">'+hmShort(sc)+'</div></div><div><div class="mut tiny">My Ihsan</div><div class="ubig gold">'+durHMS(usageLive())+'</div></div></div>'; },[4,2],[2,2]);
function pick8(){
  var sel=((S.quick8&&S.quick8.length)?S.quick8:["rk","qibla","tasbih","mathurat","doa","amal","kids","finder"]).slice();
  var body=function(){ return '<div class="mut small" style="margin-bottom:6px">'+L2x("Pilih hingga 8 pintasan. Dipilih: ","Pick up to 8 shortcuts. Picked: ")+'<b>'+sel.length+'/8</b></div>'+Q8.map(function(q){ var on_=sel.indexOf(q[0])>=0; return '<div class="set"><span>'+q[1]+' '+esc(L2x(q[2][0],q[2][1]))+'</span><button class="chip g3d'+(on_?" on":"")+'" data-q8="'+q[0]+'">'+(on_?"✓":"＋")+'</button></div>'; }).join("")+'<button class="btn gold full g3d" id="q8Ok" style="margin-top:10px">'+L2x("Simpan","Save")+'</button>'; };
  var ov=showSheet("✎ "+L2x("Pintasan (8 dalam satu)","Shortcuts (8 in one)"), body());
  var bind=function(){ var b=ov.querySelector(".shb");
    b.querySelectorAll("[data-q8]").forEach(function(x){ x.onclick=function(){ var k=x.getAttribute("data-q8"), i=sel.indexOf(k); if(i>=0) sel.splice(i,1); else if(sel.length<8) sel.push(k); else { toast(L2x("Maksimum 8","8 at most")); return; } var st=b.scrollTop; b.innerHTML=body(); bind(); b.scrollTop=st; }; });
    b.querySelector("#q8Ok").onclick=function(){ S.quick8=sel; saveS(); closeOverlay(); render(); }; };
  bind();
}

// ---------- report a mistake under Arabic text ----------
function arBlock(ar, ms, en, src){ var o={ar:ar,text:L2x(ms,en),src:src||""}; return '<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(L2x(ms,en))+'</div>'+(src?'<div class="src">'+srcHtml(src)+'</div>':'')+'<div class="tools">'+sayBtn(ar)+shareBtn(o)+'<button class="ib" data-rep="'+(SHR.length-1)+'">⚑ '+L2x("Lapor kesilapan","Report a mistake")+'</button></div>'; }
document.addEventListener("click", function(e){ var b=e.target.closest&&e.target.closest("[data-rep]"); if(!b) return; e.preventDefault(); var o=SHR[+b.getAttribute("data-rep")]||{};
  var pg=view+(learnPg?" › "+learnPg:"");
  var txt=L2x("Laporan kesilapan · My Ihsan 0.5.15","Mistake report · My Ihsan 0.5.15")+"\n"+L2x("Halaman: ","Page: ")+pg+"\n"+(o.ar?o.ar+"\n":"")+(o.text?o.text+"\n":"")+(o.src?L2x("Sumber: ","Source: ")+o.src+"\n":"")+L2x("Catatan saya: ","My note: ");
  if(window.Native && N.shareTo) N.shareTo("", "", txt); else if(navigator.share) navigator.share({text:txt}).catch(function(){}); else toast(txt); }, true);

// ---------- global search ----------
var SIDX=null;
function buildSearch(){
  var I=[], add=function(t,p,f){ I.push({t:t,p:p,f:f}); };
  tabsNow().forEach(function(n){ var lb=typeof n[2]==="string"?T(n[2]==="home"?"utama":n[2]):L2x(n[2][0],n[2][1]); add(n[1]+" "+lb, L2x("Tab","Tab"), function(){ go(n[0]); });
    (SUBS[n[0]]||[]).forEach(function(x){ add(x[1]+" "+subName(x), lb, function(){ if(n[0]==="sunat"){ sunPage=x[0]; save("ihsan_sunpage",x[0]); } else SUB2[n[0]]=x[0]; if(n[0]==="learn"){ learnPg=null; } go(n[0]); }); }); });
  LEARN.forEach(function(x){ add(x[1]+" "+L2x(x[2],x[3]), T("learn"), function(){ learnPg=x[0]; learnFrom=null; go("learn"); }); });
  SUNAT_LIST.forEach(function(x){ var nm=L2x(x.name.ms,x.name.en), where=x.top==="solat"?"Solat › "+L2x("Solat sunat","Sunnah prayers"):x.top==="bersuci"?T("learn")+" › "+L2x("Bersuci","Purification"):x.top==="haji"?T("learn")+" › "+L2x("Haji & Umrah","Hajj & Umrah"):T("sunat")+" › "+L2x("Amal sunat","Sunnah deeds");
    add(nm, where, function(){ sunOpen=x.id; if(x.top==="solat"){ sunCat=x.cat; SUB2.solat="ssunat"; go("solat"); } else if(x.top==="bersuci"||x.top==="haji"){ pandL3=x.top; SUB2.learn="panduan"; learnPg=null; go("learn"); } else { sunTop=x.top; go("amal"); } }); });
  DOA.forEach(function(c,i){ add("🤲 "+catName(c), "Doa", function(){ doaCat=i; doaQ=""; doaFav=false; doaMine=false; go("doa"); });
    (c.items||[]).forEach(function(it){ var nm=L2x(it.t_ms,it.t_en); if(nm) add(nm, "Doa › "+catName(c), function(){ doaQ=nm; doaFav=false; doaMine=false; go("doa"); }); }); });
  [["✨ "+T("asma"),"Zikir",function(){ sub.zikir="asma"; go("zikir"); }],["📿 Tasbih","Zikir",function(){ sub.zikir="tasbih"; go("zikir"); }],
   ["🐪 "+L2x("Sirah Nabi ﷺ","Sirah ﷺ"),T("learn"),function(){ openSirah(false); }],["🕋 "+L2x("Haji & Umrah 3D","Hajj & Umrah 3D"),T("learn"),function(){ openHajj(); }],["🧳 Umrah DIY",T("learn"),function(){ openUmrah(); }],
   ["🔢 "+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter"),T("learn"),function(){ openTawaf(); }],["🔊 "+L2x("Latihan solat berpandu","Guided solat practice"),"Solat",function(){ openPractice(); }],["📷 "+L2x("Kiblat kamera","Qibla camera"),"Solat",function(){ openQiblaCam(); }],
   ["🧒 "+T("kids"),T("utama"),function(){ go("kids"); }],["📓 "+L2x("Muhasabah (jurnal)","Reflection journal"),T("cal"),function(){ SUB2.cal="bulan"; go("cal"); }],["🗒 "+L2x("Jadual waktu solat bulanan","Monthly prayer timetable"),"Solat",function(){ SUB2.solat="waktu"; go("solat"); }],
   ["📈 "+L2x("Saham patuh Syariah","Shariah stocks"),L2x("Kewangan","Finance"),function(){ SUB2.fin="tukaran"; finStk=true; go("fin"); }],["🛒 "+L2x("Imbas kod bar halal","Scan a halal barcode"),L2x("Alat","Tools"),function(){ halalAuto="barcode"; SUB2.alat="halal"; go("alat"); }],
   ["⏱ "+L2x("Masa penggunaan","Time spent"),T("cal"),function(){ SUB2.cal="statistik"; go("cal"); }]].forEach(function(x){ add(x[0],x[1],x[2]); });
  MGRP.forEach(function(g){ add(g[1]+" "+L2x(g[2],g[3]), T("more"), function(){ if(g[0]==="ai"){ openSettings("ai"); return; } moreGrp=g[0]; go("more"); }); });
  return I;
}
function openSearch(q0){
  var q=typeof q0==="string"?q0:"", MGK=Object.keys(MGRP_KW);
  var ov=showSheet("🔍 "+L2x("Cari dalam aplikasi","Search the app"), '<input type="search" id="gsQ" class="ilq" placeholder="'+L2x("Doa, solat, panduan, tetapan…","Doa, prayers, guides, settings…")+'" autocomplete="off" style="width:100%"><div id="gsR" class="gsr"></div>');
  SIDX=buildSearch();
  var R=ov.querySelector("#gsR"), Q=ov.querySelector("#gsQ"), list=[];
  var show=function(){ var v=q.toLowerCase(); list=[];
    if(v.length>=2){ SIDX.forEach(function(x){ if((x.t+" "+x.p).toLowerCase().indexOf(v)>=0) list.push(x); });
      MGK.forEach(function(k){ if(MGRP_KW[k].indexOf(v)>=0){ var g=MGRP.filter(function(m){ return m[0]===k; })[0]; list.push({t:"⚙ "+L2x(g[2],g[3]), p:T("more"), f:function(){ if(k==="ai"){ openSettings("ai"); return; } moreGrp=k; go("more"); }}); } });
      list=list.slice(0,40); }
    R.innerHTML=v.length<2?'<div class="mut small" style="padding:10px 2px">'+L2x("Taip sekurang-kurangnya 2 huruf. Cuba: hujan, wuduk, tahajjud, tema.","Type at least 2 letters. Try: rain, wudhu, tahajjud, theme.")+'</div>':(list.length?list.map(function(x,i){ return '<button class="gsi" data-gi="'+i+'"><b>'+esc(x.t)+'</b><small>'+esc(x.p)+'</small></button>'; }).join(""):'<div class="mut small" style="padding:10px 2px">'+L2x("Tiada padanan.","No matches.")+'</div>');
    R.querySelectorAll("[data-gi]").forEach(function(b){ b.onclick=function(){ var x=list[+b.getAttribute("data-gi")]; closeOverlay(); setTimeout(x.f,0); }; }); };
  Q.oninput=function(){ q=Q.value.trim(); show(); }; if(q) Q.value=q; show(); setTimeout(function(){ try{ Q.focus(); }catch(e){} },80);
}

// 0.19.0 SIDEBAR: the ☰ button at the top left opens every tab and its pages as dropdowns.
// Closing it keeps which dropdowns are open and where the list was scrolled (also across restarts: ihsan_side).
var sideOpen=false, SD=load("ihsan_side",{o:{},st:0}), sideLang=null, sideF={};
function sideTree(){
  var L=function(a,b){ return L2x(a,b); }, n=function(id,ic,lb,f,kids){ return {id:id,ic:ic,lb:lb,f:f,k:kids}; };
  var sub2=function(tab,s){ return function(){ if(tab==="sunat"){ sunPage=s; save("ihsan_sunpage",s); } else SUB2[tab]=s; if(tab==="learn"){ learnPg=null; learnFrom=null; } go(tab); }; };
  var lp=function(parent,id){ return function(){ SUB2.learn=parent; learnPg=id; learnFrom=null; go("learn"); }; };
  var pl=function(x){ return function(){ pandL3=x; SUB2.learn="panduan"; learnPg=null; learnFrom=null; go("learn"); }; };
  var zk=function(z){ return function(){ sub.zikir=z; go("zikir"); }; };
  var tabLb=function(t){ return typeof t[2]==="string"?T(t[2]==="home"?"utama":t[2]):L(t[2][0],t[2][1]); };
  var lps=function(pre,parent,list){ return list.map(function(x){ return n(pre+x[0],x[1],L(x[2],x[3]),lp(parent,x[0])); }); };
  var L3={
    "solat/zikir":[n("solat/zikir/tasbih","📿",T("tasbih"),zk("tasbih")),n("solat/zikir/after","🤲",T("after"),zk("after")),n("solat/zikir/asma","✨",T("asma"),zk("asma")),n("solat/zikir/mine","📿",L("Zikir saya","My zikir"),zk("mine"))],
    "solat/kiblat":[n("solat/kiblat/c","🧭",L("Kompas kiblat","Qibla compass"),sub2("solat","kiblat")),n("solat/kiblat/cam","📷",L("Kiblat kamera","Qibla camera"),function(){ openQiblaCam(); })],
    "solat/ssunat":SUNAT_CATS.map(function(c){ return n("solat/ssunat/"+c[0],"🌅",L(c[1],c[2]),function(){ sunCat=c[0]; sunOpen=null; SUB2.solat="ssunat"; go("solat"); }); }),
    "sunat/doa":DOA_GROUPS.map(function(g,gi){ return n("sunat/doa/"+gi,["🏠","💼","💚"][gi],L(g[0],g[1]),function(){ doaCat=g[2][0]; doaQ=""; doaFav=false; doaMine=false; go("doa"); },
      g[2].map(function(i){ return n("sunat/doa/"+gi+"/"+i,"🤲",catName(DOA[i]),function(){ doaCat=i; doaQ=""; doaFav=false; doaMine=false; go("doa"); }); })); })
      .concat([n("sunat/doa/fav","★",L("Doa kegemaran","Favourite doa"),function(){ doaFav=true; doaMine=false; doaQ=""; go("doa"); }),n("sunat/doa/mine","🤲",L("Doa saya","My doa list"),function(){ doaMine=true; doaFav=false; doaQ=""; go("doa"); })]),
    "sunat/mathurat":[n("sunat/mathurat/p","☀️",T("pagi"),function(){ mathEvening=false; go("mathurat"); }),n("sunat/mathurat/e","🌙",T("petang"),function(){ mathEvening=true; go("mathurat"); })],
    "sunat/amal":SUNAT_TOP.filter(function(c){ return ["solat","bersuci","haji"].indexOf(c[0])<0; }).map(function(c){ return n("sunat/amal/"+c[0],"🌱",L(c[1],c[2]),function(){ sunTop=c[0]; sunOpen=null; go("amal"); }); }),
    "learn/panduan":[
      n("learn/panduan/bersuci","💧",L("Bersuci","Purification"),pl("bersuci"),lps("learn/panduan/bersuci/","panduan",[["wudhu","💧","Cara berwuduk","How to make wudhu"],["x_mandi","🚿","Mandi wajib","Obligatory bath"],["x_tayammum","🏜","Tayammum","Tayammum"],["x_istinja","🚽","Istinjak & najis","Istinja' & najis"],["haid","🌸","Haid & nifas","Haid & nifas"]])),
      n("learn/panduan/solat","🧎","Solat",pl("solat"),[n("learn/panduan/solat/prac","🔊",L("Latihan berpandu","Guided practice"),function(){ openPractice(); })]
        .concat(lps("learn/panduan/solat/","panduan",[["solat","🧎","Cara solat","How to pray"],["bacaan","📜","Bacaan dalam solat","Readings in solat"],["sakit","🏥","Solat ketika sakit","Praying when sick"],["musafir","🚗","Solat musafir","Praying when travelling"]]))),
      n("learn/panduan/haji","🕋",L("Haji & Umrah","Hajj & Umrah"),pl("haji"),[n("learn/panduan/haji/3d","🕋",L("Haji & Umrah 3D","Hajj & Umrah 3D"),function(){ openHajj(); }),n("learn/panduan/haji/diy","🧳","Umrah DIY",function(){ openUmrah(); }),
        n("learn/panduan/haji/tawaf","🔢",L("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter"),function(){ openTawaf(); }),n("learn/panduan/haji/live","📺",L("Siaran langsung & waktu Makkah","Live & Makkah times"),lp("panduan","live"))])],
    "learn/kisah":[n("learn/kisah/kids","🧒",T("kids"),function(){ go("kids"); }),n("learn/kisah/sirah","🐪",L("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ"),function(){ openSirah(false); })].concat(lps("learn/kisah/","kisah",[["nabi","🌿","Kisah 25 Nabi","The 25 Prophets"],["sahabat","🏅","Kisah Sahabat","Companion stories"],["n40","📜","40 Hadis Nawawi","40 Hadith Nawawi"]])),
    "learn/bahasa":[n("learn/bahasa/fiqh/map","⚖️",L("Peta minda 3D","3D mind map"),function(){ openFiqh(-1); })].concat([["0","🕌","Ibadat","Worship"],["1","🤝","Muamalat","Transactions"],["2","💍","Munakahat","Marriage"],["3","⚖️","Jinayat","Criminal law"]].map(function(x){ return n("learn/bahasa/fiqh/"+x[0],x[1],L(x[2],x[3]),function(){ openFiqh(+x[0]); }); })).concat([n("learn/bahasa/pksk","📝",L("Latihan PKSK","PKSK practice exam"),function(){ openPksk(); })].concat(lps("learn/bahasa/","bahasa",[["iqra","📗","Asas Membaca al-Quran","Learn to Read the Quran"],["tajwid","🎨","Tajwid","Tajweed"],["hijaiyah","🔤","Huruf Hijaiyah","Arabic letters"],["qwords","📗","Kata al-Quran","Quran words"],["glosari","📖","Glosari istilah","Glossary"]]))),
    "alat/nota":WRT.map(function(x){ return n("alat/nota/"+x[0],x[1],L(x[2],x[3]),function(){ wrTab=x[0]; SUB2.alat="nota"; go("alat"); }); }),
    "alat/kewangan":SUBS.fin.map(function(x){ return n("fin/"+x[0],x[1],subName(x),function(){ SUB2.fin=x[0]; SUB2.alat="kewangan"; go("alat"); }); }),
    "learn/dengar":lps("learn/dengar/","dengar",[["radio","📻","Radio Islam","Islamic radio"],["podcast","🎙","Podcast","Podcast"],["live","📺","Siaran langsung Makkah & Madinah","Live Makkah & Madinah"]])
  };
  var out=tabsNow().map(function(t){ var subs=SUBS[t[0]];
    var kids = subs ? subs.map(function(x){ var id=t[0]+"/"+x[0]; return n(id,x[1],subName(x),sub2(t[0],x[0]),L3[id]); })
      : t[0]==="home" ? [n("home/w","🏠",L("Widget utama","Home widgets"),function(){ go("home"); }),n("home/kids","🧒",T("kids"),function(){ go("kids"); })] : null;
    return n(t[0],t[1],tabLb(t),function(){ go(t[0]); },kids); });
  out.push(n("more","⚙",L("Tetapan","Settings"),function(){ moreGrp=null; go("more"); },MGRP.map(function(g){ return n("more/"+g[0],g[1],L(g[2],g[3]),function(){ if(g[0]==="ai"){ openSettings("ai"); return; } moreGrp=g[0]; go("more"); }); })));
  out.push(n("search","🔍",L("Cari dalam aplikasi","Search the app"),function(){ openSearch(); }));
  return out;
}
function sideHtml(nodes, lv){
  return nodes.map(function(x){ sideF[x.id]=x.f; var has=x.k&&x.k.length, op=!!SD.o[x.id];
    return '<div class="sdn sl'+lv+(op?" open":"")+'" data-sid="'+esc(x.id)+'"><div class="sdr"><button class="sdg" data-sgo="'+esc(x.id)+'"><span class="sdi">'+x.ic+'</span><span class="sdt">'+esc(x.lb)+'</span></button>'+
      (has?'<button class="sdx" data-stg="'+esc(x.id)+'" aria-label="▾">▾</button>':'')+'</div>'+(has?'<div class="sdk">'+sideHtml(x.k, lv+1)+'</div>':'')+'</div>'; }).join("");
}
function sideBuild(){
  var sd=document.getElementById("side");
  if(!sd){ sd=document.createElement("aside"); sd.id="side";
    sd.innerHTML='<div class="sdh"><b>My Ihsan</b><button class="sdc" id="sdAll" aria-label="'+L2x("Tutup semua","Collapse all")+'">⊟</button></div><div class="sdl" id="sdL"></div>';
    var sc=document.createElement("div"); sc.id="sideScrim"; document.body.appendChild(sc); document.body.appendChild(sd);
    sc.onclick=function(){ sideShow(false); };
    var lst=sd.querySelector("#sdL"), t=null;
    lst.addEventListener("scroll", function(){ clearTimeout(t); t=setTimeout(function(){ SD.st=lst.scrollTop; save("ihsan_side",SD); },150); }, {passive:true});
    lst.addEventListener("click", function(e){ var g=e.target.closest("[data-stg]");
      if(g){ var id=g.getAttribute("data-stg"), nd=g.closest(".sdn"), o=!nd.classList.contains("open"); nd.classList.toggle("open",o); if(o) SD.o[id]=1; else delete SD.o[id]; save("ihsan_side",SD); return; }
      var b=e.target.closest("[data-sgo]"); if(!b) return; var id2=b.getAttribute("data-sgo"), f=sideF[id2], nd2=b.closest(".sdn");
      // a heading without its own page (a doa group) just opens its dropdown
      if(!f && nd2.querySelector(".sdx")){ nd2.querySelector(".sdx").click(); return; }
      sideShow(false); if(f) setTimeout(function(){ try{ f(); }catch(err){ console.error(err); } },0); });
    // 0.5.5: the same button collapses everything (⊟) or, when all is closed, expands everything (⊞)
    sd.querySelector("#sdAll").onclick=function(){ var any=!!sd.querySelector(".sdn.open");
      if(any){ SD.o={}; sd.querySelectorAll(".sdn.open").forEach(function(x){ x.classList.remove("open"); }); }
      else sd.querySelectorAll(".sdn").forEach(function(x){ if(x.querySelector(".sdx")){ x.classList.add("open"); SD.o[x.getAttribute("data-sid")]=1; } });
      save("ihsan_side",SD); sideAllIc(); };
    lst.addEventListener("click", function(){ setTimeout(sideAllIc, 0); });
  }
  var lk=(S.ulang||S.lang)+"|"+JSON.stringify(SUBS.solat.length);
  if(sideLang!==lk){ sideLang=lk; sideF={}; var l=sd.querySelector("#sdL"); l.innerHTML=sideHtml(sideTree(),1); l.scrollTop=SD.st||0; }
  return sd;
}
function sideAllIc(){ var sd=document.getElementById("side"); if(!sd) return; var b=sd.querySelector("#sdAll"), any=!!sd.querySelector(".sdn.open"); b.textContent=any?"⊟":"⊞"; b.setAttribute("aria-label", any?L2x("Tutup semua","Collapse all"):L2x("Buka semua","Expand all")); }
function sideShow(on_){
  var sd=sideBuild(), hm=document.getElementById("hMenu"); sideOpen=!!on_;
  sd.classList.toggle("on",sideOpen); document.getElementById("sideScrim").classList.toggle("on",sideOpen);
  if(hm){ hm.textContent=sideOpen?"✕":"☰"; hm.classList.toggle("on",sideOpen); }
  if(sideOpen){ var l=sd.querySelector("#sdL"); if(Math.abs(l.scrollTop-(SD.st||0))>2) l.scrollTop=SD.st||0; sideMark(); sideAllIc(); }
}
// highlight where you are now
function sideMark(){
  var sd=document.getElementById("side"); if(!sd) return;
  var here=[view], s=subOf(view);
  if(s){ here.push(view+"/"+s);
    if(view==="solat"&&s==="zikir") here.push("solat/zikir/"+sub.zikir);
    if(view==="learn"&&s==="panduan"){ here.push("learn/panduan/"+pandL3); if(learnPg) here.push("learn/panduan/"+pandL3+"/"+learnPg); }
    else if(view==="learn"&&learnPg) here.push(view+"/"+s+"/"+learnPg); }
  if(view==="more"&&moreGrp) here.push("more/"+moreGrp);
  if(view==="alat"&&s==="kewangan") here.push("fin/"+SUB2.fin);
  sd.querySelectorAll(".sdn.cur").forEach(function(x){ x.classList.remove("cur"); });
  here.forEach(function(id){ var x=sd.querySelector('.sdn[data-sid="'+id+'"]'); if(x) x.classList.add("cur"); });
}
// open on the first launch too (hidden), so the first ☰ tap is instant
setTimeout(sideBuild, 800);

// ---------- 0.32.0 WEATHER (Open-Meteo, no key) ----------
var WXC={0:["☀️","Cerah","Clear"],1:["🌤","Kebanyakan cerah","Mostly clear"],2:["⛅","Berawan separa","Partly cloudy"],3:["☁️","Mendung","Overcast"],45:["🌫","Berkabus","Fog"],48:["🌫","Kabus beku","Freezing fog"],
  51:["🌦","Gerimis ringan","Light drizzle"],53:["🌦","Gerimis","Drizzle"],55:["🌧","Gerimis lebat","Heavy drizzle"],61:["🌦","Hujan ringan","Light rain"],63:["🌧","Hujan","Rain"],65:["🌧","Hujan lebat","Heavy rain"],
  80:["🌦","Hujan renyai","Showers"],81:["🌧","Hujan sederhana","Moderate showers"],82:["⛈","Hujan sangat lebat","Violent showers"],95:["⛈","Ribut petir","Thunderstorm"],96:["⛈","Ribut petir + hujan batu","Thunderstorm + hail"],99:["⛈","Ribut petir + hujan batu","Thunderstorm + hail"],
  71:["🌨","Salji ringan","Light snow"],73:["🌨","Salji","Snow"],75:["❄️","Salji lebat","Heavy snow"],56:["🌧","Gerimis beku","Freezing drizzle"],57:["🌧","Gerimis beku","Freezing drizzle"],66:["🌧","Hujan beku","Freezing rain"],67:["🌧","Hujan beku","Freezing rain"],77:["🌨","Butir salji","Snow grains"],85:["🌨","Salji","Snow showers"],86:["❄️","Salji lebat","Heavy snow showers"]};
function wxName(c){ var x=WXC[c]||["🌡","–","–"]; return [x[0], L2x(x[1],x[2])]; }
function weatherGet(cb, force){
  var p=qiblaPoint(), c=load("ihsan_wx",null), key=p[0].toFixed(2)+","+p[1].toFixed(2);
  if(c && c.k===key && !force && Date.now()-c.t<30*60000){ cb(c.d, c.t); return; }
  var url="https://api.open-meteo.com/v1/forecast?latitude="+p[0].toFixed(4)+"&longitude="+p[1].toFixed(4)+"&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=5";
  nFetch(url, function(st, body){ var d=null; try{ if(st>=200 && st<300) d=JSON.parse(body); }catch(e){}
    if(d && d.current){ var t=Date.now(); save("ihsan_wx",{k:key,t:t,d:d}); cb(d,t); } else cb(c?c.d:null, c?c.t:0, true); });
}
function weatherInto(box, compact){
  box.innerHTML='<h3>🌦 '+L2x("Cuaca di lokasi anda","Weather where you are")+'</h3><div class="mut small">'+L2x("Memuatkan…","Loading…")+'</div>';
  weatherGet(function(d, t, failed){
    if(!document.body.contains(box)) return;
    if(!d){ box.innerHTML='<h3>🌦 '+L2x("Cuaca","Weather")+'</h3><div class="mut small">'+L2x("Cuaca memerlukan internet. Cuba lagi kemudian.","Weather needs the internet. Try again later.")+'</div><button class="btn alt full g3d" id="wxR" style="margin-top:8px">↻ '+L2x("Cuba lagi","Try again")+'</button>'; box.querySelector("#wxR").onclick=function(){ weatherInto(box, compact); }; return; }
    var c=d.current, w=wxName(c.weather_code), dl=d.daily||{}, hr=d.hourly||{}, now=new Date(), en=en_();
    var rainNext=0; if(hr.time){ for(var i=0;i<hr.time.length;i++){ var ht=new Date(hr.time[i]); if(ht>=now && ht-now<6*3600000) rainNext=Math.max(rainNext, hr.precipitation_probability[i]||0); } }
    if(compact){ box.innerHTML='<div class="wxMini"><span class="wxI">'+w[0]+'</span><div><b>'+Math.round(c.temperature_2m)+'°C</b><div class="mut tiny">'+esc(w[1])+' · '+L2x("hujan 6j: ","rain 6h: ")+rainNext+'%</div></div></div>'; return; }
    var h='<h3>🌦 '+L2x("Cuaca di lokasi anda","Weather where you are")+'</h3><div class="wxNow"><span class="wxI">'+w[0]+'</span><div><div class="wxT">'+Math.round(c.temperature_2m)+'°C</div><div>'+esc(w[1])+'</div><div class="mut tiny">'+L2x("Terasa ","Feels ")+Math.round(c.apparent_temperature)+'°C · '+L2x("Lembapan ","Humidity ")+c.relative_humidity_2m+'% · '+L2x("Angin ","Wind ")+Math.round(c.wind_speed_10m)+' km/j</div></div></div>';
    h+='<div class="wxRain">☔ '+L2x("Peluang hujan 6 jam akan datang: ","Chance of rain in the next 6 hours: ")+'<b>'+rainNext+'%</b>'+(rainNext>=60?' · '+L2x("bawa payung ke masjid","take an umbrella to the masjid"):'')+'</div>';
    if(dl.time){ h+='<div class="wxDays">'+dl.time.map(function(ds,i){ var dd=parseYmd(ds), x=wxName(dl.weather_code[i]); return '<div><small>'+(i===0?L2x("Hari ini","Today"):dd.toLocaleDateString(locTag(),{weekday:"short"}))+'</small><span>'+x[0]+'</span><b>'+Math.round(dl.temperature_2m_max[i])+'°</b><em>'+Math.round(dl.temperature_2m_min[i])+'°</em><i>☔'+(dl.precipitation_probability_max[i]||0)+'%</i></div>'; }).join("")+'</div>'; }
    h+='<div class="mut tiny" style="margin-top:6px">'+L2x("Sumber: Open-Meteo · ","Source: Open-Meteo · ")+(failed?L2x("luar talian, data lama ","offline, old data "):"")+new Date(t).toLocaleTimeString(locTag(),{hour:"numeric",minute:"2-digit"})+' · <button class="linkb" id="wxR">'+L2x("muat semula","refresh")+'</button></div>';
    box.innerHTML=h; box.querySelector("#wxR").onclick=function(){ box.innerHTML='<div class="mut small">'+L2x("Memuatkan…","Loading…")+'</div>'; weatherGet(function(){ weatherInto(box, compact); }, true); };
  });
}
WG["weather"]=cardW("solat","🌦","Cuaca","Weather",function(){ setTimeout(function(){ var b=document.getElementById("wxW"); if(b) weatherInto(b, true); },0); return '<div id="wxW" data-act="q-kiblat"></div>'; },[2,1],[2,1]);

// ---------- 0.32.0 NOTES (like Keep): colours, checklists, pin, labels, search ----------
var NOTES=load("ihsan_notes",[]), ntQ="", ntLab="", NTC=[["","Tiada","None"],["#5c2b29","Merah","Red"],["#614a19","Oren","Orange"],["#635d19","Kuning","Yellow"],["#345920","Hijau","Green"],["#16504b","Teal","Teal"],["#2d555e","Biru","Blue"],["#42275e","Ungu","Purple"],["#5b2245","Merah jambu","Pink"],["#442f19","Coklat","Brown"],["#3c3f43","Kelabu","Grey"]];
function ntSave(){ save("ihsan_notes", NOTES); }
function ntLabels(){ var m={}; NOTES.forEach(function(n){ (n.lb||[]).forEach(function(l){ m[l]=1; }); }); return Object.keys(m).sort(); }
function ntHit(n){ if(n.arch && ntLab!=="__arch") return false; if(!n.arch && ntLab==="__arch") return false; if(ntLab && ntLab!=="__arch" && (n.lb||[]).indexOf(ntLab)<0) return false;
  if(!ntQ) return true; var q=ntQ.toLowerCase(); return ((n.t||"")+" "+(n.b||"")+" "+(n.cl||[]).map(function(x){ return x.x; }).join(" ")+" "+(n.lb||[]).join(" ")).toLowerCase().indexOf(q)>=0; }
function ntCardH(n){
  var body=n.cl? '<div class="ntCl">'+n.cl.slice(0,8).map(function(x,i){ return '<div class="'+(x.d?'dn':'')+'"><button class="ntTk" data-ntk="'+n.id+'|'+i+'">'+(x.d?'☑':'☐')+'</button>'+esc(x.x)+'</div>'; }).join("")+(n.cl.length>8?'<div class="mut tiny">+'+(n.cl.length-8)+'</div>':'')+'</div>' : '<div class="ntB">'+esc((n.b||"").slice(0,400))+'</div>';
  return '<div class="ntCard" data-nt="'+n.id+'" style="'+(n.c?'background:'+n.c:'')+'">'+(n.p?'<span class="ntPin">📌</span>':'')+(n.t?'<b>'+esc(n.t)+'</b>':'')+body+((n.lb||[]).length?'<div class="ntLb">'+n.lb.map(function(l){ return '<span>'+esc(l)+'</span>'; }).join("")+'</div>':'')+'</div>'; }
function vNotes(el){
  var labs=ntLabels(), list=NOTES.filter(ntHit).sort(function(a,b){ return b.u-a.u; }), pins=list.filter(function(n){ return n.p; }), rest=list.filter(function(n){ return !n.p; });
  var h='<div class="ntTop"><input id="ntSrch" class="ilq" placeholder="🔍 '+L2x("Cari nota","Search notes")+'" value="'+esc(ntQ)+'"></div>';
  h+='<div class="chips ntLabs"><button class="chip'+(!ntLab?' on':'')+'" data-ntl="">'+L2x("Semua","All")+'</button>'+labs.map(function(l){ return '<button class="chip'+(ntLab===l?' on':'')+'" data-ntl="'+esc(l)+'">🏷 '+esc(l)+'</button>'; }).join("")+'<button class="chip'+(ntLab==="__arch"?' on':'')+'" data-ntl="__arch">🗄 '+L2x("Arkib","Archive")+'</button></div>';
  h+='<div class="ntNew"><button class="btn gold g3d" id="ntAdd">＋ '+L2x("Nota baharu","New note")+'</button><button class="btn alt g3d" id="ntAddL">☑ '+L2x("Senarai semak","Checklist")+'</button></div>';
  if(!list.length) h+='<div class="card mut small" style="text-align:center">'+(NOTES.length?L2x("Tiada nota yang sepadan.","No matching notes."):L2x("Belum ada nota. Tulis senarai tugasan, nota kuliah, atau senarai barang.","No notes yet. Write a to-do list, class notes or a shopping list."))+'</div>';
  if(pins.length) h+='<div class="snl">📌 '+L2x("Disemat","Pinned")+'</div><div class="ntGrid">'+pins.map(ntCardH).join("")+'</div>'+(rest.length?'<div class="snl">'+L2x("Lain-lain","Others")+'</div>':'');
  if(rest.length) h+='<div class="ntGrid">'+rest.map(ntCardH).join("")+'</div>';
  el.innerHTML=h;
  var q=el.querySelector("#ntSrch"); q.oninput=function(){ ntQ=q.value; var pos=q.selectionStart; vNotes(el); var q2=el.querySelector("#ntSrch"); q2.focus(); try{ q2.setSelectionRange(pos,pos); }catch(e){} };
  el.querySelectorAll("[data-ntl]").forEach(function(b){ b.onclick=function(){ ntLab=b.getAttribute("data-ntl"); vNotes(el); }; });
  el.querySelector("#ntAdd").onclick=function(){ ntEdit(null,false,el); };
  el.querySelector("#ntAddL").onclick=function(){ ntEdit(null,true,el); };
  el.querySelectorAll("[data-ntk]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var p=b.getAttribute("data-ntk").split("|"), n=NOTES.filter(function(x){ return x.id===p[0]; })[0]; if(!n) return; n.cl[+p[1]].d=!n.cl[+p[1]].d; n.u=Date.now(); ntSave(); vNotes(el); }; });
  el.querySelectorAll("[data-nt]").forEach(function(c){ c.onclick=function(){ var n=NOTES.filter(function(x){ return x.id===c.getAttribute("data-nt"); })[0]; if(n) ntEdit(n,!!n.cl,el); }; });
}
function ntEdit(n, asList, el){
  var isNew=!n; n=n?JSON.parse(JSON.stringify(n)):{id:"n"+Date.now().toString(36), t:"", b:"", cl:asList?[{x:"",d:false}]:null, c:"", p:false, lb:ntLab&&ntLab!=="__arch"?[ntLab]:[], u:Date.now()};
  var ov=document.getElementById("overlay"); ov.className="sheetov";
  var draw=function(){
    var h='<div class="sheet ntEd" style="'+(n.c?'background:'+n.c:'')+'"><div class="row"><button class="chip" id="ntPin">'+(n.p?'📌 '+L2x("Disemat","Pinned"):'📍 '+L2x("Semat","Pin"))+'</button><button class="chip" id="ntDone">✓ '+L2x("Siap","Done")+'</button></div>'+
      '<input id="ntTit" class="ntTi" placeholder="'+L2x("Tajuk","Title")+'" value="'+esc(n.t)+'">';
    if(n.cl){ h+='<div class="ntEl">'+n.cl.map(function(x,i){ return '<div class="ntRow'+(x.d?' dn':'')+'"><button class="ntTk" data-tg="'+i+'">'+(x.d?'☑':'☐')+'</button><input data-ci="'+i+'" value="'+esc(x.x)+'" placeholder="'+L2x("Item","Item")+'"><button class="ntX" data-cx="'+i+'">✕</button></div>'; }).join("")+'<button class="linkb" id="ntAddI">＋ '+L2x("Tambah item","Add item")+'</button></div>'; }
    else h+='<textarea id="ntBd" class="ntBdy" placeholder="'+L2x("Tulis nota…","Write a note…")+'">'+esc(n.b)+'</textarea>';
    h+='<div class="ntCols">'+NTC.map(function(c){ return '<button class="ntCo'+(n.c===c[0]?' on':'')+'" data-co="'+c[0]+'" style="background:'+(c[0]||'var(--card2)')+'" aria-label="'+esc(L2x(c[1],c[2]))+'"></button>'; }).join("")+'</div>'+
      '<input id="ntLbl" class="ilq" placeholder="🏷 '+L2x("Label, pisahkan dengan koma","Labels, separated by commas")+'" value="'+esc((n.lb||[]).join(", "))+'">'+
      '<div class="btns" style="margin-top:10px"><button class="btn alt g3d" id="ntMode">'+(n.cl?'📝 '+L2x("Jadikan teks","Make text"):'☑ '+L2x("Jadikan senarai","Make checklist"))+'</button>'+(isNew?'':'<button class="btn alt g3d" id="ntArc">🗄 '+(n.arch?L2x("Nyaharkib","Unarchive"):L2x("Arkib","Archive"))+'</button><button class="btn alt g3d" id="ntShare">↗ '+L2x("Kongsi","Share")+'</button><button class="btn alt g3d" id="ntDel">🗑 '+L2x("Padam","Delete")+'</button>')+'</div></div>';
    ov.innerHTML=h;
    var grab=function(){ n.t=ov.querySelector("#ntTit").value; var bd=ov.querySelector("#ntBd"); if(bd) n.b=bd.value; ov.querySelectorAll("[data-ci]").forEach(function(i){ n.cl[+i.getAttribute("data-ci")].x=i.value; });
      n.lb=ov.querySelector("#ntLbl").value.split(",").map(function(x){ return x.trim().slice(0,24); }).filter(Boolean); };
    var commit=function(){ grab(); if(n.cl) n.cl=n.cl.filter(function(x){ return x.x.trim(); }); var empty=!n.t.trim() && !(n.b||"").trim() && !(n.cl&&n.cl.length);
      var i=NOTES.map(function(x){ return x.id; }).indexOf(n.id);
      if(empty){ if(i>=0) NOTES.splice(i,1); } else { n.u=Date.now(); if(i>=0) NOTES[i]=n; else NOTES.unshift(n); }
      ntSave(); closeOverlay(); if(el && document.body.contains(el)) vNotes(el); };
    ov._close=commit; ov.onclick=function(e){ if(e.target===ov) commit(); };
    ov.querySelector("#ntDone").onclick=commit;
    ov.querySelector("#ntPin").onclick=function(){ grab(); n.p=!n.p; draw(); };
    ov.querySelectorAll("[data-co]").forEach(function(b){ b.onclick=function(){ grab(); n.c=b.getAttribute("data-co"); draw(); }; });
    ov.querySelectorAll("[data-tg]").forEach(function(b){ b.onclick=function(){ grab(); var i=+b.getAttribute("data-tg"); n.cl[i].d=!n.cl[i].d; draw(); }; });
    ov.querySelectorAll("[data-cx]").forEach(function(b){ b.onclick=function(){ grab(); n.cl.splice(+b.getAttribute("data-cx"),1); draw(); }; });
    ov.querySelectorAll("[data-ci]").forEach(function(inp){ inp.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); grab(); var i=+inp.getAttribute("data-ci"); n.cl.splice(i+1,0,{x:"",d:false}); draw(); var nx=ov.querySelector('[data-ci="'+(i+1)+'"]'); if(nx) nx.focus(); } }; });
    var ai=ov.querySelector("#ntAddI"); if(ai) ai.onclick=function(){ grab(); n.cl.push({x:"",d:false}); draw(); var l=ov.querySelectorAll("[data-ci]"); if(l.length) l[l.length-1].focus(); };
    ov.querySelector("#ntMode").onclick=function(){ grab(); if(n.cl){ n.b=n.cl.map(function(x){ return x.x; }).filter(Boolean).join("\n"); n.cl=null; } else { n.cl=(n.b||"").split("\n").filter(function(x){ return x.trim(); }).map(function(x){ return {x:x,d:false}; }); if(!n.cl.length) n.cl=[{x:"",d:false}]; n.b=""; } draw(); };
    var ar=ov.querySelector("#ntArc"); if(ar) ar.onclick=function(){ grab(); n.arch=!n.arch; commit(); };
    var sh=ov.querySelector("#ntShare"); if(sh) sh.onclick=function(){ grab(); var t=(n.t?n.t+"\n\n":"")+(n.cl?n.cl.map(function(x){ return (x.d?"☑ ":"☐ ")+x.x; }).join("\n"):n.b); if(window.Native && N.shareText) N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast(L2x("Disalin","Copied")); }); };
    var dl=ov.querySelector("#ntDel"); if(dl) dl.onclick=function(){ if(!confirm(L2x("Padam nota ini?","Delete this note?"))) return; var i=NOTES.map(function(x){ return x.id; }).indexOf(n.id); if(i>=0) NOTES.splice(i,1); ntSave(); closeOverlay(); if(el && document.body.contains(el)) vNotes(el); };
    if(isNew){ var f=n.cl?ov.querySelector('[data-ci="0"]'):ov.querySelector("#ntBd"); if(f && !ov._fx){ ov._fx=1; setTimeout(function(){ f.focus(); },50); } }
  };
  draw();
}
WG["notes"]=cardW("tools","📝","Nota","Notes",function(){ var l=NOTES.filter(function(n){ return !n.arch; }).sort(function(a,b){ return (b.p?1:0)-(a.p?1:0) || b.u-a.u; }).slice(0,3);
  return '<div data-act="q-nota">'+(l.length?l.map(function(n){ return '<div class="ntW" style="'+(n.c?'background:'+n.c:'')+'">'+(n.p?'📌 ':'')+'<b>'+esc(n.t||(n.cl?(n.cl[0]||{}).x:(n.b||"").split("\n")[0])||"…")+'</b>'+(n.cl?' <span class="mut tiny">'+n.cl.filter(function(x){ return x.d; }).length+'/'+n.cl.length+'</span>':'')+'</div>'; }).join(""):'<div class="mut small">📝 '+L2x("Belum ada nota. Ketik untuk menulis.","No notes yet. Tap to write.")+'</div>')+'</div>'; },[2,2],[2,2]);
WG["sc-nota"]=scW("tools","📝","Nota","Notes","q-nota","Nota & senarai semak","Notes & checklists");

// ---------- 0.31.0 ONBOARDING: name, language, syahadah ----------
var SYH=[["أَشْهَدُ","Asyhadu","اشهد",["ashhad","asyhad","ashad","eshhed"]],["أَنْ","an","ان",["an"]],["لَا","lā","لا",["la"]],["إِلٰهَ","ilāha","اله",["ilah","ilaa"]],["إِلَّا","illā","الا",["illa","ila"]],["اللّٰهُ","Allāh","الله",["allah","alla","llah","ullah"]],
  ["وَأَشْهَدُ","wa asyhadu","واشهد",["wa","washhad","wasyhad","ashhad","asyhad"]],["أَنَّ","anna","ان",["anna","ann"]],["مُحَمَّدًا","Muḥammadan","محمدا",["muhammad","mohammad","muhamad","mohamad","mohammed","muhammed"]],["رَسُولُ","rasūlu","رسول",["rasul","rasool","rosul"]],["اللّٰهِ","Allāh","الله",["allah","alla","llah","ullah"]]];
function arNorm(t){ return String(t||"").replace(/[ً-ٰٟـۖ-ۭ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[^ء-ي\s]/g," "); }
function lev(a,b){ if(a===b) return 0; var m=a.length, n=b.length, d=[], i, j; for(i=0;i<=m;i++){ d[i]=[i]; } for(j=0;j<=n;j++) d[0][j]=j; for(i=1;i<=m;i++) for(j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[m][n]; }
// how many syahadah words (in order) one heard sentence covers
function syhProgress(txt, from){
  var best=from;
  String(txt||"").split(" | ").forEach(function(alt){
    var ar=/[؀-ۿ]/.test(alt), toks=(ar?arNorm(alt):alt.toLowerCase().replace(/[^a-z\s]/g," ")).split(/\s+/).filter(Boolean), i=from;
    var eat=function(tok){ if(i>=SYH.length) return; var w=SYH[i];
      if(ar){ var sk=w[2], t2=tok; if(t2===sk || (sk.length>=3 && lev(t2,sk)<=1) || (sk.charAt(0)==="و" && t2===sk.slice(1))){ i++; return; }
        // words heard joined together, e.g. "لااله"
        if(t2.indexOf(sk)===0 && t2.length>sk.length){ i++; eat(t2.slice(sk.length)); } }
      else { var hit=null; w[3].some(function(r){ if(tok.indexOf(r)===0 || (r.length>=4 && lev(tok.slice(0,r.length),r)<=1)){ hit=r; return true; } return false; });
        if(hit!==null){ if(w[1]==="wa asyhadu" && tok==="wa") return; i++; var rest=tok.slice(hit.length); if(rest.length>=3) eat(rest); } }
    };
    toks.forEach(eat); best=Math.max(best,i);
  });
  return best;
}
function obNeeded(){ if(!S.onboard) return true; if(S.obAsk===false) return false; return S.obSeen!==APP_VER; }
function applyName(){ var t=document.getElementById("topTitle"); if(t) t.textContent=(S.showName && S.uname)? "Salam, "+S.uname : "My Ihsan"; }
function onboardShow(){
  var ov=document.createElement("div"); ov.id="obx"; document.body.appendChild(ov);
  var step=0, prog=0, mode=null, listening=false, upd=!!S.onboard;
  var stopMic=function(){ if(listening && window.Native && N.stopListen) N.stopListen(); listening=false; off("speech",hs); };
  var hs=function(p){ if(p.err!==undefined){ listening=false; var mb=ov.querySelector("#obMic"); if(mb){ mb.classList.remove("rec"); mb.innerHTML="🎙 "+L2x("Cuba lagi","Try again"); } if(p.err!==7 && p.err!==6){ var e=ov.querySelector("#obErr"); if(e) e.textContent=L2x("Mikrofon tidak dapat mendengar. Cuba lagi, atau ketik perkataan.","The mic could not hear you. Try again, or tap the words."); } return; }
    if(p.ready){ var e2=ov.querySelector("#obErr"); if(e2) e2.textContent=L2x("Sedang mendengar… bacalah perlahan-lahan.","Listening… read slowly."); return; }
    var np=syhProgress(p.t, prog); if(np>prog){ prog=np; lightUp(); }
    if(p.final){ listening=false; if(prog<SYH.length){ var mb2=ov.querySelector("#obMic"); if(mb2){ mb2.classList.remove("rec"); mb2.innerHTML="🎙 "+L2x("Sambung bacaan","Keep reading"); } } } };
  var lightUp=function(){ ov.querySelectorAll(".syW").forEach(function(w,i){ w.classList.toggle("lit", i<prog); w.classList.toggle("nx", i===prog); });
    if(prog>=SYH.length){ stopMic(); var d=ov.querySelector("#obSyhDone"); if(d){ d.style.display=""; } var mb=ov.querySelector("#obMic"); if(mb) mb.style.display="none"; var er=ov.querySelector("#obErr"); if(er) er.textContent=""; var nb=ov.querySelector("#obNext"); if(nb) nb.textContent=L2x("Seterusnya","Next")+" ›"; if(window.Native && N.vibrate) try{ N.vibrate(60); }catch(e){} } };
  var foot=function(next){ return '<div class="obF">'+(step>0?'<button class="btn alt g3d" id="obBack">‹ '+L2x("Kembali","Back")+'</button>':'<span></span>')+'<div class="obDots">'+[0,1,2,3].map(function(i){ return '<i'+(i===step?' class="on"':'')+'></i>'; }).join("")+'</div><button class="btn gold g3d" id="obNext">'+next+'</button></div>'; };
  var draw=function(){
    var h='<div class="obIn">';
    if(step===0){
      h+='<div class="obLogo"><img src="logo.svg" alt="My Ihsan" width="96" height="96" style="border-radius:24px"></div><h2>'+(upd?L2x("My Ihsan telah dikemas kini","My Ihsan has been updated")+' · '+APP_VER:L2x("Selamat datang ke My Ihsan","Welcome to My Ihsan"))+'</h2>'+
        '<label class="obL">'+L2x("Nama anda","Your name")+'</label><input id="obName" class="obInp" maxlength="24" placeholder="'+L2x("cth. Farah","e.g. Farah")+'" value="'+esc(S.uname||"")+'">'+
        '<label class="obChk"><input type="checkbox" id="obShow"'+(S.showName!==false?' checked':'')+'> '+L2x("Tunjuk nama saya di bar atas","Show my name in the top bar")+'</label>'+
        '<div class="mut tiny">'+L2x("Nama hanya disimpan dalam telefon ini.","Your name is only kept on this phone.")+'</div>';
      h+='</div>'+foot(L2x("Seterusnya","Next")+' ›');
    } else if(step===1){
      var cur=S.ulang||S.lang||"ms";
      h+='<div class="obLogo">🌐</div><h2>'+L2x("Pilih bahasa","Choose a language")+'</h2><div class="obLang">'+[["ms","🇲🇾","Bahasa Melayu"],["en","🇬🇧","English"],["id","🇮🇩","Bahasa Indonesia"]].map(function(x){ return '<button class="g3d'+(cur===x[0]?' on':'')+'" data-oblang="'+x[0]+'"><span>'+x[1]+'</span>'+x[2]+'</button>'; }).join("")+'</div>';
      h+='</div>'+foot(L2x("Seterusnya","Next")+' ›');
    } else if(step===2){
      h+='<div class="obLogo">☝️</div><h2>'+L2x("Ucapkan dua kalimah syahadah","Say the two testimonies of faith")+'</h2>'+
        '<div class="mut small">'+L2x("Baca dengan mikrofon dan setiap perkataan akan menyala, atau ketik perkataan mengikut turutan.","Read with the microphone and each word lights up, or tap the words in order.")+'</div>'+
        '<div class="syG" dir="rtl">'+SYH.map(function(w,i){ return '<button class="syW'+(i<prog?' lit':'')+(i===prog?' nx':'')+'" data-sy="'+i+'"><b>'+w[0]+'</b><small>'+w[1]+'</small></button>'; }).join("")+'</div>'+
        '<div class="obMean small">'+L2x("“Aku bersaksi bahawa tiada tuhan selain Allah, dan aku bersaksi bahawa Muhammad itu utusan Allah.”","“I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.”")+'</div>'+
        (WEB?'<button id="obMic" style="display:none"></button>':'<button class="btn gold full g3d" id="obMic">🎙 '+L2x("Baca dengan mikrofon","Read with the microphone")+'</button>')+'<div class="mut tiny" id="obErr" style="text-align:center;margin-top:6px"></div>'+
        '<div id="obSyhDone" class="obDone" style="display:none">✨ '+L2x("Alhamdulillah. Semoga Allah menetapkan iman kita.","Alhamdulillah. May Allah keep our faith firm.")+'</div>';
      h+='</div>'+foot(prog>=SYH.length?L2x("Seterusnya","Next")+' ›':L2x("Langkau","Skip")+' ›');
    } else {
      h+='<div class="obLogo">✅</div><h2>'+L2x("Hampir siap","Almost done")+'</h2>';
      if(!upd) h+='<div class="small">'+(WEB?L2x("Benarkan lokasi untuk zon waktu solat JAKIM.","Allow location for the JAKIM prayer zone."):L2x("Benarkan lokasi untuk zon waktu solat JAKIM dan kiblat, dan notifikasi untuk makluman waktu solat.","Allow location for the JAKIM prayer zone and Qibla, and notifications for prayer alerts."))+'</div><div class="btns" style="margin:10px 0"><button class="btn alt g3d" id="obLoc2">📍 '+L2x("Lokasi","Location")+'</button>'+(WEB?'':'<button class="btn alt g3d" id="obNot2">🔔 '+L2x("Notifikasi","Notifications")+'</button>')+'</div>';
      h+='<label class="obChk"><input type="checkbox" id="obAsk"'+(S.obAsk!==false?' checked':'')+'> '+L2x("Tunjuk skrin alu-aluan ini setiap kali aplikasi dikemas kini","Show this welcome screen every time the app is updated")+'</label>'+
        '<div class="mut tiny">'+L2x("Boleh diubah kemudian dalam Tetapan › Paparan & bahasa.","You can change this later in Settings › Display & language.")+'</div>';
      h+='</div>'+foot(L2x("Mula","Start")+' ✓');
    }
    ov.innerHTML=h;
    var nx=ov.querySelector("#obNext"), bk=ov.querySelector("#obBack");
    if(bk) bk.onclick=function(){ stopMic(); step--; draw(); };
    nx.onclick=function(){
      if(step===0){ S.uname=(ov.querySelector("#obName").value||"").trim().slice(0,24); S.showName=ov.querySelector("#obShow").checked; saveS(); applyName(); }
      if(step===2) stopMic();
      if(step===3){ S.obAsk=ov.querySelector("#obAsk").checked; S.onboard=true; S.obSeen=APP_VER; saveS(); ov.remove(); render(); return; }
      step++; draw(); };
    ov.querySelectorAll("[data-oblang]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-oblang"); S.ulang=v; S.lang=v==="en"?"en":"ms"; hdrLastDay=null; saveS(); if(window.IdLang) IdLang.set(v==="id"); draw(); }; });
    ov.querySelectorAll("[data-sy]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-sy"); if(i===prog){ prog++; lightUp(); if(window.Native && N.speak && i<SYH.length) try{ N.speak(SYH[i][0],"ar"); }catch(e){} } else if(i>prog){ b.classList.add("shake"); setTimeout(function(){ b.classList.remove("shake"); },400); } }; });
    var mic=ov.querySelector("#obMic"); if(mic) mic.onclick=function(){
      if(!window.Native || !N.listen){ ov.querySelector("#obErr").textContent=L2x("Mikrofon hanya dalam aplikasi telefon. Ketik perkataan.","The microphone works in the phone app only. Tap the words."); return; }
      if(N.canListen && !N.canListen()){ ov.querySelector("#obErr").textContent=L2x("Telefon ini tiada pengecaman suara. Ketik perkataan.","This phone has no speech recognition. Tap the words."); return; }
      var start=function(){ off("speech",hs); on("speech",hs); listening=true; mic.classList.add("rec"); mic.innerHTML="⏺ "+L2x("Sedang mendengar…","Listening…"); N.listen("ar-SA"); };
      if(listening){ stopMic(); mic.classList.remove("rec"); mic.innerHTML="🎙 "+L2x("Baca dengan mikrofon","Read with the microphone"); return; }
      if(N.hasPerm("mic")) start(); else { var hp=function(p){ if(p.which!=="mic") return; off("perm",hp); if(p.granted) start(); else ov.querySelector("#obErr").textContent=L2x("Kebenaran mikrofon ditolak. Ketik perkataan.","Microphone permission denied. Tap the words."); }; on("perm",hp); N.requestPerm("mic"); } };
    var l2=ov.querySelector("#obLoc2"); if(l2) l2.onclick=function(){ askLocation(true); };
    var n2=ov.querySelector("#obNot2"); if(n2) n2.onclick=function(){ N.requestPerm("notif"); };
    if(step===2 && prog>=SYH.length) lightUp();
  };
  draw();
}
function nameCard(){
  var c=document.createElement("div"); c.className="card";
  c.innerHTML='<h3>🌐 '+L2x("Nama & skrin alu-aluan","Name & welcome screen")+'</h3><div class="set"><span>'+L2x("Nama","Name")+'</span><input id="nmIn" class="obInp" maxlength="24" value="'+esc(S.uname||"")+'" style="max-width:170px;font-size:15px;padding:8px"></div>'+
    '<label class="obChk"><input type="checkbox" id="nmShow"'+(S.showName?' checked':'')+'> '+L2x("Tunjuk nama di bar atas","Show name in the top bar")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="nmAsk"'+(S.obAsk!==false?' checked':'')+'> '+L2x("Tunjuk skrin alu-aluan setiap kali dikemas kini","Show the welcome screen after every update")+'</label>'+
    '<button class="btn alt full g3d" id="nmAgain" style="margin-top:6px">👋 '+L2x("Buka skrin alu-aluan sekarang","Open the welcome screen now")+'</button>';
  c.querySelector("#nmIn").onchange=function(){ S.uname=this.value.trim().slice(0,24); saveS(); applyName(); };
  c.querySelector("#nmShow").onchange=function(){ S.showName=this.checked; saveS(); applyName(); };
  c.querySelector("#nmAsk").onchange=function(){ S.obAsk=this.checked; saveS(); };
  c.querySelector("#nmAgain").onclick=onboardShow;
  return c;
}

// ---------- boot ----------
applyTheme(); applyFont(); if(window.IdLang && S.ulang==="id") IdLang.set(true);
applyName(); if((S.kidLock||S.appLock) && window.Native && N.lockTask) setTimeout(function(){ N.lockTask(true); }, 600);
on("resume", function(){ setTimeout(lockRepin, 400); });
setTimeout(function(){ if(obNeeded() && !S.kidLock && !S.appLock) onboardShow(); }, 250);
on("pause", function(){ usageOn(false); if(jnOpen && jnData().lock){ jnOpen=false; var o=document.getElementById("overlay"); if(o && o.querySelector("#jnG")) closeOverlay(); if(view==="cal") render(); } jnOpen=false; });
on("resume", function(){ usageOn(true); });
on("widgetRakaat", function(){
  var ov0=document.getElementById("overlay"); if(ov0._close) ov0._close(); else closeOverlay(); view="home"; render();
  rk.solat=currentPrayer(); var target=rkTarget();
  if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(target); }; on("perm",hp); N.requestPerm("camera"); }
  else startPraying(target);
});
on("perm", function(p){ if(p.which==="notif" && p.granted){ pushSchedule(); toast(S.lang==="en"?"Notifications on":"Notifikasi diaktifkan"); } });
on("resume", function(){ ensureData(false); pushSchedule(); if(S.zoneAuto && N.hasPerm("location") && Date.now()-(S.locAt||0) > 20*60000) askLocation(false); if(view==="home"||view==="solat") render(); });
on("openView", function(d){ var v=d.v; var ov0=document.getElementById("overlay"); if(!ov0.classList.contains("hidden")) return; if(v==="player"){ if(window.IbMedia) IbMedia.openPlayer(); return; } if(v.indexOf("side:")===0){ var sn=sideFind(v.slice(5)); if(sn && sn.f) sn.f(); return; } if(v==="quran"){ openQuran(false); return; } if(v==="homeset"){ openHomeSet(); return; } if(v.indexOf("find:")===0){ openSearch(v.slice(5)); return; } if(v==="statw"){ SUB2.cal="statistik"; STV.p="d"; STV.d=ymd(new Date()); STV.insW=true; go("cal"); return; } if(v.indexOf("fx:")===0){ fxPair=v.slice(3); SUB2.fin="tukaran"; go("fin"); return; } if(["home","solat","zikir","sunat","doa","mathurat","amal","cal","more","learn","kids","alat","halal","qibla","rakaat","fin"].indexOf(v)>=0) go(v); });
on("volkey", function(){ if(volHook) { volHook(); return; } if(darkTap) { darkTap(); return; } if((view==="zikir"||(view==="solat"&&SUB2.solat==="zikir")) && sub.zikir==="tasbih" && tbTap) tbTap(); });
on("tts", function(r){ if(r.error==="nolang") toast(S.lang==="en"?"No Arabic voice on this phone. Install it in Settings > Text-to-speech.":"Tiada suara Arab pada telefon ini. Pasang di Tetapan > Teks ke pertuturan."); });
// 0.2.9 recipe builder: text, links, photos or a video shared to My Ihsan from another app (Share › My Ihsan)
on("share", function(d){
  if(S.kidLock){ if(d.kind!=="start") toast(L2x("Mod kanak-kanak dikunci: resepi tidak diterima.","Kids mode is locked: the recipe was not taken.")); return; }
  var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); }
  window.__rcpShare=d; halalAuto="recipe"; SUB2.alat="halal";
  if(view!=="alat") go("alat"); else { render(); document.getElementById("view").scrollTop=0; }
});
// 0.5.6: a salasilah .json shared or opened with "My Ihsan Family" goes to Alat › Keluarga, which asks who you are in it
on("famshare", function(d){ if(S.kidLock) return; var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); }
  SUB2.alat="keluarga"; go("alat"); var n=0, t=setInterval(function(){ if(window.FamImportText && document.querySelector("#view .finv") || ++n>40){ clearInterval(t); if(window.FamImportText) try{ FamImportText(d.body||""); }catch(e){ console.error(e); } } }, 150); });
on("opened", function(r){ if(window.IbOpenOnce){ var f=window.IbOpenOnce; window.IbOpenOnce=null; f(r.body); return; } restoreBackup(r.body); });
on("saved", function(){ toast(S.lang==="en"?"Backup saved":"Sandaran disimpan"); });
on("fileError", function(r){ toast("Error: "+r.error); });
document.addEventListener("click", globalClick);
// ---------- 0.33.0 BACK HISTORY ----------
// Every change of tab, page, sub-page or opened item is remembered (up to 80 steps). The Android back button walks back
// through exactly what was seen before (previous item, page or tab), never straight to Home or the parent level.
// Modules (Quran, Ilmu, Bacaan, media, Keluarga) expose navGet()/navSet() so their own inner pages join the same history.
var NAVH=[], navCur=null, navRest=false, NAVMOD=[["quran","QuranView"],["ilmu","IlmuView"],["bacaan","BacaanView"],["media","IbMedia"],["fam","FamView"],["ev","EventView"],["fit","FitView"],["rcp","HalalRecipe"],["period","PeriodView"]];
function navState(){
  var o={v:view, s2:JSON.parse(JSON.stringify(SUB2)), sp:sunPage, lp:learnPg, lf:learnFrom, p3:pandL3, st:sunTop, sc:sunCat, mg:moreGrp, zk:sub.zikir, dc:doaCat, me:mathEvening, m:{}}, k=[];
  NAVMOD.forEach(function(x){ var M=window[x[1]]; if(M && M.navGet){ try{ var s=M.navGet(); if(s){ o.m[x[0]]=s; k.push(x[0]+":"+s.k); } }catch(e){} } });
  var a={}, mk={}; for(var p in o) if(p!=="m") a[p]=o[p]; for(var q in o.m) mk[q]=o.m[q].k;
  return {o:o, j:JSON.stringify(a)+"#"+k.join("|"), a:JSON.stringify(a), mk:mk};
}
// a real step = the app page changed, or a module that was already there changed its own page (a module that only just loaded is not a step)
function navDiff(x, y){ if(x.a!==y.a) return true; for(var q in x.mk) if(y.mk[q]!==undefined && y.mk[q]!==x.mk[q]) return true; return false; }
function navTick(){
  if(!NAVH || navRest || S.kidLock) return;
  var s=navState();
  if(navCur && navCur.j===s.j) return;
  if(navCur && navDiff(navCur, s)){ NAVH.push(navCur); if(NAVH.length>80) NAVH.shift(); s.y=document.getElementById("view").scrollTop; }
  else if(navCur){ s.y=navCur.y; }
  else s.y=document.getElementById("view").scrollTop;
  navCur=s;
}
function navRestore(s){
  var o=s.o; navRest=true;
  try{
    if(view==="solat" && !(o.v==="solat" && o.s2.solat==="kiblat")) N.stopCompass();
    if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){}
    if(window.IlmuView && o.lp!==learnPg) try{ IlmuView.stop(); }catch(e){}
    view=o.v; for(var k in o.s2) SUB2[k]=o.s2[k]; sunPage=o.sp; learnPg=o.lp; learnFrom=o.lf; pandL3=o.p3; sunTop=o.st; sunCat=o.sc; moreGrp=o.mg; sub.zikir=o.zk; doaCat=o.dc; mathEvening=o.me;
    save("ihsan_view", view==="more"?"home":view); if(view==="sunat") save("ihsan_sunpage", sunPage);
    NAVMOD.forEach(function(x){ var M=window[x[1]]; if(M && M.navSet && o.m[x[0]]) try{ M.navSet(o.m[x[0]]); }catch(e){} });
    render();
  }catch(e){ console.error(e); }
  var vEl=document.getElementById("view"), y=s.y||0; vEl.scrollTop=y; [60,250,600].forEach(function(t){ setTimeout(function(){ if(navCur===s && Math.abs(vEl.scrollTop-y)>4) vEl.scrollTop=y; },t); });
  navRest=false; navCur=s;
}
function navBack(){ if(S.appLock && !S.kidLock) while(NAVH.length && NAVH[NAVH.length-1].o.v==="more") NAVH.pop(); if(!NAVH.length) return false; navRestore(NAVH.pop()); return true; }
document.addEventListener("click", function(){ setTimeout(navTick, 40); }, true);
document.addEventListener("touchend", function(){ setTimeout(navTick, 450); }, {passive:true, capture:true});
document.getElementById("view").addEventListener("scroll", function(){ if(navCur && !navRest) navCur.y=this.scrollTop; }, {passive:true});
var onBack0=window.onBack;
window.onBack=function(){
  var ov=document.getElementById("overlay");
  if(sideOpen){ sideShow(false); return true; }
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(setOn){ if(moreGrp){ moreGrp=null; setDraw(); } else setShow(false); return true; }
  if(S.kidLock) return onBack0();          // a locked kids mode keeps its own fenced-in back steps
  navTick();
  if(navBack()) return true;
  // 0.2.6: Back only ever returns to the page or tab seen just before. It never jumps up a level, never goes Home
  // on its own and never leaves the app: with nothing earlier in this session it stays put.
  toast(L2x("Tiada halaman sebelum ini","No earlier page"));
  return true;
};

// ---------- 0.33.0 FINGER-FOLLOWING SWIPES ----------
// IbSwipe(el, {can(s), go(s), peek(s), find(), skip()}): the element follows the finger sideways (like the Zikir pages).
// s = +1 when the finger moves right. 0.34.0: with peek(s) (HTML string, or a ready node) the neighbour item rides in
// beside it during the drag, like the Zikir pager, so there is never a blank gap. Let go past a quarter of the width
// (or flick) and the neighbour settles in place; go(s) then draws the real item in the same frame. find() returns the
// new element after go(s) so a tall item keeps its top where the neighbour was.
function IbSwipe(el, o){
  if(!el) return; el._ibo=o; if(el._ibsw) return; el._ibsw=1; el.classList.add("ibsw");
  var sx=0, sy=0, lock=0, dx=0, W=0, t0=0, on2=false, G={}, GAP=14;
  var clear=function(){ el.style.transition=""; el.style.transform=""; el.style.opacity=""; };
  var killG=function(){ for(var k in G){ var g=G[k]; if(g && g.parentNode) g.parentNode.removeChild(g); } G={}; };
  var scroller=function(t){ for(var n=t; n && n!==el && n.nodeType===1; n=n.parentNode){ if(n.scrollWidth>n.clientWidth+4){ var ox=getComputedStyle(n).overflowX; if(ox==="auto"||ox==="scroll") return true; } } return false; };
  var ghost=function(s){ if(G[s]!==undefined) return G[s]; G[s]=null; var O=el._ibo; if(!O.peek || !O.can(s)) return null;
    var c=null; try{ c=O.peek(s); }catch(err){ console.error(err); } if(c==null || c===false) return null;
    var g;
    if(typeof c==="string"){ g=document.createElement(el.tagName); g.className=el.className; var cs=el.getAttribute("style"); if(cs) g.setAttribute("style", cs); g.innerHTML=c; }
    else g=c;
    g.classList.add("ibghost"); g.style.position="absolute"; g.style.top="0px"; g.style.left="0px"; g.style.margin="0"; g.style.boxSizing="border-box"; g.style.width=W+"px";
    g.style.transition="none"; g.style.opacity="1"; g.style.pointerEvents="none"; g.style.zIndex="1";
    el.parentNode.insertBefore(g, el.nextSibling);
    var r=el.getBoundingClientRect(), rg=g.getBoundingClientRect(), vw=document.getElementById("view"), vt=vw?vw.getBoundingClientRect().top:0, top=Math.max(r.top, vt);
    g.style.left=(r.left-dx-rg.left)+"px"; g.style.top=(top-rg.top)+"px"; g._gy=top;
    if(O.fit) try{ O.fit(g); }catch(err){}
    G[s]=g; return g; };
  var place=function(){ var s=dx>0?1:-1, g=ghost(s), o2=G[-s];
    if(o2) o2.style.visibility="hidden";
    el.style.transform="translate3d("+dx+"px,0,0)";
    if(g){ g.style.visibility=""; g.style.transform="translate3d("+(dx-s*(W+GAP))+"px,0,0)"; el.style.opacity=""; }
    else el.style.opacity=String(1-Math.min(0.4, Math.abs(dx)/W*0.5)); };
  el.addEventListener("touchstart", function(e){ var O=el._ibo; killG(); on2=!(e.touches.length>1 || (O.skip && O.skip()) || e.target.closest("input[type=range],.noswipe") || scroller(e.target)); if(!on2) return;
    var t=e.touches[0]; sx=t.clientX; sy=t.clientY; lock=0; dx=0; t0=Date.now(); W=el.offsetWidth||window.innerWidth; el.style.transition="none"; }, {passive:true});
  el.addEventListener("touchmove", function(e){ if(!on2) return; var t=e.touches[0], x=t.clientX-sx, y=t.clientY-sy;
    if(!lock){ if(Math.abs(x)<9 && Math.abs(y)<9) return; lock=Math.abs(x)>Math.abs(y)*1.15?1:-1; if(lock===1){ sx=t.clientX-(x>0?9:-9); x=t.clientX-sx; } }
    if(lock!==1) return; if(e.cancelable) e.preventDefault();
    var s=x>0?1:-1; dx=el._ibo.can(s)?x:x/4; place(); }, {passive:false});
  var end=function(){ if(!on2) return; on2=false; if(lock!==1){ clear(); killG(); return; } var O=el._ibo, s=dx>0?1:-1, fast=Math.abs(dx)>35 && Date.now()-t0<260, g=G[s];
    var tr="transform .2s cubic-bezier(.2,.7,.3,1), opacity .2s";
    el.style.transition=tr; if(g) g.style.transition=tr;
    if((Math.abs(dx)>W*0.25 || fast) && O.can(s)) commit(s, g);
    else { el.style.transform="translate3d(0,0,0)"; el.style.opacity="1"; if(g){ g.style.transform="translate3d("+(-s*(W+GAP))+"px,0,0)"; } setTimeout(function(){ clear(); killG(); }, 210); } };
  var commit=function(s, g){ var O=el._ibo;
      el.style.transform="translate3d("+(s*(W+GAP))+"px,0,0)";
      if(g){ g.style.transform="translate3d(0,0,0)"; } else el.style.opacity="0";
      setTimeout(function(){ var gy=g?g._gy:null; killG(); el._ibIn=0;
        if(g){ IbSwipe._q=1; try{ O.go(s); }catch(err){ console.error(err); } IbSwipe._q=0; el.style.transition="none"; el.style.transform=""; el.style.opacity="";
          var ne=O.find?O.find():el, vw=document.getElementById("view");
          if(ne && vw && gy!=null && document.body.contains(ne)){ var d=ne.getBoundingClientRect().top-gy; if(Math.abs(d)>2) vw.scrollTop+=d; }
          setTimeout(function(){ el.style.transition=""; },30); }
        else { O.go(s); if(document.body.contains(el) && !el._ibIn) IbSwipe.inFrom(el, s); }
        setTimeout(ibArr, 60); setTimeout(ibChips, 30); }, g?235:200); };
  el.addEventListener("touchend", end); el.addEventListener("touchcancel", end);
  // 0.36.0: the ◀ ▶ arrows run the same slide as a finger (s=+1 brings in what is on the left)
  el._ibGo=function(s){ var O=el._ibo; if(el._ibBusy || !O.can(s)) return; el._ibBusy=1; setTimeout(function(){ el._ibBusy=0; },320);
    killG(); W=el.offsetWidth||window.innerWidth; dx=0; var g=ghost(s);
    el.style.transition="none"; if(g){ g.style.transform="translate3d("+(-s*(W+GAP))+"px,0,0)"; void g.offsetWidth; }
    var tr="transform .26s cubic-bezier(.3,.6,.3,1), opacity .26s"; el.style.transition=tr; if(g) g.style.transition=tr; commit(s, g); };
  IbSwipe.list.push(el); clearTimeout(IbSwipe._at); IbSwipe._at=setTimeout(ibArr, 60);
}
IbSwipe.list=[];
// 0.36.0 (Farah): every swipeable screen also gets two small arrows at the bottom left and right.
// They belong to the newest swipeable item on the page (or a pager registered with ibArrPager).
var ibPager=null;
function ibArrPager(p){ ibPager=p; clearTimeout(IbSwipe._at); IbSwipe._at=setTimeout(ibArr, 60); }
function ibArr(){
  var L=document.getElementById("ibArL"), R=document.getElementById("ibArR");
  if(!L){ L=document.createElement("button"); L.id="ibArL"; L.className="ibarr"; L.textContent="◀"; L.setAttribute("aria-label","◀");
    R=document.createElement("button"); R.id="ibArR"; R.className="ibarr"; R.textContent="▶"; R.setAttribute("aria-label","▶");
    document.getElementById("app").appendChild(L); document.getElementById("app").appendChild(R);
    var hit=function(s){ return function(e){ e.preventDefault(); e.stopPropagation(); var t=ibArrTarget(); if(t) t.go(s); setTimeout(ibArr, 380); }; };
    L.onclick=hit(1); R.onclick=hit(-1); }
  var t=ibArrTarget(), ov=document.getElementById("overlay"), hide=!t || (ov && !ov.classList.contains("hidden")) || S.kidLock;
  L.classList.toggle("hidden", hide || !t.can(1)); R.classList.toggle("hidden", hide || !t.can(-1));
  if(hide) return;
  var bars=window.innerHeight; [].slice.call(document.querySelectorAll("#view .dock, #subnav, #nav, #mini:not(.hidden)")).forEach(function(x){ if(!x.offsetHeight) return; var r=x.getBoundingClientRect().top; if(r>0 && r<bars) bars=r; });
  var b=(window.innerHeight-bars+8)+"px"; L.style.bottom=b; R.style.bottom=b;
}
function ibArrTarget(){
  var vw=document.getElementById("view");
  IbSwipe.list=IbSwipe.list.filter(function(e){ return document.body.contains(e); });
  for(var i=IbSwipe.list.length-1;i>=0;i--){ var e=IbSwipe.list[i]; if(vw.contains(e) && !e.closest(".ibghost") && e.offsetParent!==null) return {can:function(s){ return !!e._ibo.can(s); }, go:function(s){ e._ibGo(s); }}; }
  if(ibPager && ibPager.el && document.body.contains(ibPager.el) && ibPager.el.offsetParent!==null) return ibPager;
  return null;
}
window.ibArr=ibArr;
// The new item enters from the side opposite to the finger's motion, finishing the same movement.
// (Skipped while a swipe with a neighbour preview is finishing: that item is already in place.)
IbSwipe.inFrom=function(el, s){ if(!el || !s || IbSwipe._q) return; el._ibIn=1; var W=el.offsetWidth||window.innerWidth;
  el.style.transition="none"; el.style.transform="translate3d("+(-s*W*0.85)+"px,0,0)"; el.style.opacity="0.3"; void el.offsetWidth;
  el.style.transition="transform .24s cubic-bezier(.2,.7,.3,1), opacity .24s"; el.style.transform="translate3d(0,0,0)"; el.style.opacity="1";
  setTimeout(function(){ el.style.transition=""; el.style.transform=""; el.style.opacity=""; }, 260); };
// Render a view into a detached box (for a neighbour preview): state changes made by mut() are undone by undo() afterwards.
IbSwipe.shot=function(mut, draw, undo){ var box=document.createElement("div"); try{ mut(); draw(box); }catch(err){ console.error(err); box=null; } try{ undo(); }catch(e){} return box; };
// Wrap a page's content (everything except its fixed bottom dock) so it can slide as one piece.
function ibWrap(el){ var w=document.createElement("div"); w.className="ibpg";
  [].slice.call(el.childNodes).forEach(function(c){ if(c.nodeType===1 && (c.classList.contains("dock") || getComputedStyle(c).position==="fixed")) return; w.appendChild(c); });
  el.insertBefore(w, el.firstChild);
  // 0.34.1: a short page still fills the screen, so a swipe on the empty part below it works too
  var fill=function(){ var vw=document.getElementById("view"); if(!vw || !document.body.contains(w)) return;
    var vr=vw.getBoundingClientRect(), top=w.getBoundingClientRect().top-vr.top+vw.scrollTop, bars=window.innerHeight;
    [].slice.call(document.querySelectorAll("#view .dock, #subnav, #nav")).forEach(function(x){ var t=x.getBoundingClientRect().top; if(t>0 && t<bars) bars=t; });
    var h=Math.round(bars-vr.top-top-6); if(h>0) w.style.minHeight=h+"px"; };
  if(document.body.contains(w)){ setTimeout(fill, 90); } return w; }
window.ibWrap=ibWrap;
window.IbSwipe=IbSwipe;
if(S.kidLock){ view="kids"; learnPg=null; }
barSizeApply(S.barSize||0);
applyZoom(); pushHadith(); mqPush();
render();
pushSchedule();
ensureData(false);
if(S.zoneAuto && N.hasPerm("location")) askLocation(false);
})();
