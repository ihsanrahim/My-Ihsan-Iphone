/* 0.5.5 Tetapan › AI dalam talian: the one place for the online AI provider, keys and model (moved out of Halal › Semak and
   Resepi settings, which keep only their own choices and a link here). Uses window.HalalAI (halal/halal_ai.js).
   AISet.render(box, H) with H = {N, S, esc, L2x, toast, load, save, on, off}. */
(function(){
"use strict";
var H = null, box = null, st = {aiOpen:true, mlist:null, mBusy:false, mOther:false, mTried:null, orModels:null};
function L2(a, b){ return H.L2x(a, b); }
function AI(){ return window.HalalAI; }
function rerender(){ if(box && document.body.contains(box)) render(); }
function render(){ var sc = box.closest(".setpb"), y = sc ? sc.scrollTop : 0; box.innerHTML = aiSettingsHtml(); bindSet(box); bindStt(box); if(sc) sc.scrollTop = y; }
// keys for the video speech (Resepi › videos): Groq, Gemini and OpenAI keys are shared with the AI providers
function sttHtml(){ var c = AI().cfg(), k = c.keys || {};
  return '<div class="card cmp aisetc"><h3>🎙 '+L2("Kunci untuk suara video (Resepi)","Keys for video speech (Recipes)")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2("Dipakai apabila resepi diimport daripada video. Pilihan penyedia ada dalam Resepi › Tetapan resepi.","Used when a recipe is imported from a video. The provider choice is in Recipes › Recipe settings.")+'</div>'+
    [["groq","Groq","https://console.groq.com/keys"],["gemini","Gemini","https://aistudio.google.com/apikey"],["openai","OpenAI",""]].map(function(x){ return '<label class="hfld aikrow"><span><b>'+x[1]+'</b>'+(x[2] ? '<a href="#" data-kurl="'+x[2]+'">'+L2("dapatkan kunci ›","get a key ›")+'</a>' : '')+'</span><input type="password" autocomplete="off" data-sk="'+x[0]+'" value="'+H.esc(k[x[0]]||"")+'" placeholder="'+L2("Tampal kunci","Paste the key")+'"></label>'; }).join("")+
    '<button class="btn" id="aiSttSave" style="margin-top:4px">'+L2("Simpan kunci","Save keys")+'</button></div>'; }
function bindStt(el){
  el.querySelectorAll("[data-kurl]").forEach(function(a){ a.onclick = function(e){ e.preventDefault(); var u = a.getAttribute("data-kurl"); if(H.N.openUrl) H.N.openUrl(u); else window.open(u); }; });
  var b = el.querySelector("#aiSttSave"); if(b) b.onclick = function(){ var c = AI().cfg(); el.querySelectorAll("[data-sk]").forEach(function(i){ c.keys[i.getAttribute("data-sk")] = i.value.trim(); }); AI().saveCfg(c); H.toast(L2("Kunci disimpan","Keys saved")); rerender(); };
}
function aiSettingsHtml(){
  var a = AI(), c = a.cfg(), p = a.PROV[c.prov], en = H.S.lang==="en";
  var grp = function(g, label){ return '<optgroup label="'+label+'">'+Object.keys(a.PROV).filter(function(k){ return a.PROV[k].g===g; }).map(function(k){ return '<option value="'+k+'"'+(k===c.prov?' selected':'')+'>'+H.esc(a.PROV[k].name)+'</option>'; }).join("")+'</optgroup>'; };
  return '<div class="card cmp aisetc" id="aiSetCard"><h3>✨ '+L2("AI dalam talian","Online AI")+' <span class="badge'+(a.ready()?'':' warn')+'">'+(a.ready()?L2("Aktif","On"):L2("Tutup","Off"))+'</span></h3>'+
    '<div class="mut tiny" style="margin:2px 0 6px">'+L2("Untuk Halal (label apa-apa bahasa), Resepi (pautan, gambar, video) dan Tanya AI.","For Halal (labels in any language), Recipes (links, photos, videos) and Ask AI.")+'</div>'+
    '<label class="hrow"><span>'+L2("Guna AI dalam talian","Use online AI")+'</span><input type="checkbox" id="aiOn"'+(c.on?' checked':'')+'></label>'+
    '<label class="hfld">'+L2("Penyedia","Provider")+'<select id="aiProv">'+grp("free",L2("Percuma, tanpa kunci","Free, no key"))+grp("login",L2("Log masuk dengan akaun","Sign in with an account"))+grp("key",L2("Kunci API sendiri","Your own API key"))+'</select></label>'+
    '<div class="mut tiny" style="margin:-2px 0 8px;line-height:1.4">'+H.esc(en?p.en:p.ms)+(p.keyUrl && !p.login?' <a href="#" id="aiKeyLink">'+L2("Dapatkan kunci ›","Get a key ›")+'</a>':'')+'</div>'+
    (p.login?'<button class="btn full" id="aiLogin" style="margin:2px 0 8px">'+(c.keys[c.prov]?'✅ '+L2("Sudah log masuk · log masuk semula","Signed in · sign in again"):'🔑 '+L2("Log masuk dengan OpenRouter","Sign in with OpenRouter"))+'</button>':'')+
    (c.prov==="custom"?'<label class="hfld">'+L2("Alamat API (…/chat/completions)","API address (…/chat/completions)")+'<input type="url" id="aiUrl" value="'+H.esc(c.customUrl||"")+'" placeholder="https://…/v1/chat/completions"></label>':'')+
    (p.nokey?'':'<label class="hfld">'+(p.login?L2("Kunci (diisi automatik selepas log masuk)","Key (filled in after signing in)"):L2("Kunci API","API key"))+'<input type="password" id="aiKey" autocomplete="off" value="'+H.esc(c.keys[c.prov]||"")+'" placeholder="'+L2("Tampal kunci di sini","Paste the key here")+'"></label>')+
    modelHtml(a, c, p)+
    '<button class="btn gold full" id="aiSave" style="margin-top:6px">'+L2("Simpan","Save")+'</button>'+
    '<div class="mut tiny" style="margin-top:8px;line-height:1.45">🔒 '+L2("Kunci disimpan dalam telefon ini sahaja. Apabila AI digunakan, gambar dan teks label dihantar kepada penyedia yang dipilih. Senarai ramuan dan semakan teks yang ditaip tetap berjalan tanpa internet.","The key is kept on this phone only. When the AI is used, the label photo and text are sent to the chosen provider. The ingredient list and typed-text check still work offline.")+'</div></div>'+sttHtml();
}
// 0.2.12: models in a dropdown (suggested list, or the provider's full list once loaded); "Other…" for typing a name.
function modelHtml(a, c, p){
  if(p.nokey) return '';
  var cur = a.modelOf(c);
  if(c.prov==="custom") return '<label class="hfld">'+L2("Model","Model")+'<input type="text" id="aiModel" value="'+H.esc(cur)+'"></label>';
  var live = st.mlist && st.mlist[c.prov], list = live && live.length ? live : (a.MODELS[c.prov]||[]).map(function(id){ return {id:id, name:id}; });
  // 0.2.13: free-tier friendly models first, marked ⭐
  var good = a.liveIds(c.prov).slice(0, 2); if(!good.length) good = [p.model].concat(a.FALLBACK[c.prov]||[]);
  if(!live && c.keys[c.prov] && !st.mBusy && !(st.mTried && st.mTried[c.prov]) && c.prov!=="openrouter"){ st.mTried = st.mTried || {}; st.mTried[c.prov] = 1; setTimeout(function(){ loadList(a, c.prov, c.keys[c.prov], true); }, 50); }
  list = list.map(function(m){ var g = good.indexOf(m.id); return {id:m.id, name:(g>=0 ? "⭐ " : "")+m.name.replace(/^⭐ /,""), g:g<0 ? 99 : g}; }).sort(function(x, y){ return x.g - y.g; });
  var inList = list.some(function(m){ return m.id===cur; }), other = st.mOther || !inList;
  return '<label class="hfld">'+L2("Model","Model")+'<select id="aiModelSel">'+list.map(function(m){ return '<option value="'+H.esc(m.id)+'"'+(m.id===cur && !st.mOther ? ' selected' : '')+'>'+H.esc(m.name.replace(/^⭐ /,"")===m.id ? m.name : m.name+" · "+m.id)+'</option>'; }).join("")+
    '<option value="__other"'+(other ? ' selected' : '')+'>✏️ '+L2("Lain-lain (taip nama)…","Other (type a name)…")+'</option></select></label>'+
    '<input type="text" id="aiModel" class="hmodel" value="'+H.esc(cur)+'" placeholder="'+L2("Nama model, cth. ","Model name, e.g. ")+H.esc(p.model)+'" style="'+(other ? '' : 'display:none')+'">'+
    '<div class="mut tiny" style="margin:-4px 0 8px;line-height:1.4">⭐ '+L2("Paling sesuai untuk kunci percuma. Model pratonton atau baharu mungkin tiada had percuma. Jika had dicapai, aplikasi mencuba model ⭐ seterusnya secara automatik.","Best for free keys. Preview or newest models may have no free allowance. If a limit is reached, the app tries the next ⭐ model on its own.")+'</div>'+
    '<div class="hmrow"><button class="chip" id="aiLoadModels">🔄 '+(st.mBusy ? L2("Memuatkan…","Loading…") : live && live.length ? L2("Muat semula senarai","Reload the list") : L2("Muat semua model daripada penyedia","Load all models from the provider"))+'</button><span class="mut tiny">'+(live && live.length ? live.length+L2(" model daripada penyedia"," models from the provider") : L2("Senarai cadangan","Suggested list"))+'</span></div>';
}
function loadList(a, prov, key, quiet){
  st.mBusy = true; st.aiOpen = true; rerender();
  a.listModels(prov, key).then(function(l){ st.mBusy = false; st.mlist = st.mlist || {}; if(l.length){ st.mlist[prov] = l; a.rememberLive(prov, l); if(prov==="openrouter") st.orModels = l; } else if(!quiet) H.toast(L2("Senarai model tidak dapat dimuatkan. Semak kunci API.","The model list could not be loaded. Check the API key.")); st.aiOpen = true; rerender(); });
}
function bindSet(el){
  var a = AI(), set = el.querySelector("#hAiSet");
  if(set) set.addEventListener("toggle", function(){ st.aiOpen = set.open; });
  var g = el.querySelector("#hAiGo"); if(g) g.onclick = askAI;
  el.querySelectorAll("[data-app]").forEach(function(b){ b.onclick=function(){ sendApp(+b.getAttribute("data-app")); }; });
  var su = el.querySelector("#hAiSetup"); if(su) su.onclick = function(){ st.aiOpen = true; rerender(); var s2=document.getElementById("hAiSet"); if(s2) s2.scrollIntoView({behavior:"smooth", block:"start"}); };
  var pv = el.querySelector("#aiProv"); if(pv) pv.onchange = function(){ var c=a.cfg(); c.prov=pv.value; a.saveCfg(c); st.aiOpen=true; st.mOther=false; rerender(); if(!(st.mlist && st.mlist[c.prov]) && (c.keys[c.prov] || c.prov==="openrouter") && !a.PROV[c.prov].nokey && c.prov!=="custom") loadList(a, c.prov, c.keys[c.prov], true); };
  var kl = el.querySelector("#aiKeyLink"); if(kl) kl.onclick = function(e){ e.preventDefault(); var u=a.PROV[a.cfg().prov].keyUrl; if(H.N.openUrl) H.N.openUrl(u); else window.open(u); };
  var lm = el.querySelector("#aiLoadModels"); if(lm) lm.onclick = function(e){ e.preventDefault(); if(st.mBusy) return; var c=a.cfg(), p=a.PROV[c.prov], k=el.querySelector("#aiKey"), key=(k && k.value.trim()) || c.keys[c.prov] || "";
    if(!key && !p.nokey && c.prov!=="openrouter"){ H.toast(L2("Masukkan kunci API dahulu","Enter the API key first")); return; } if(k && key!==c.keys[c.prov]){ c.keys[c.prov]=key; a.saveCfg(c); } loadList(a, c.prov, key); };
  var ms = el.querySelector("#aiModelSel"), mi = el.querySelector("#aiModel"); if(ms && mi) ms.onchange = function(){ if(ms.value==="__other"){ st.mOther = true; mi.style.display = ""; mi.value = ""; mi.focus(); } else { st.mOther = false; mi.value = ms.value; mi.style.display = "none"; } };
  var lg = el.querySelector("#aiLogin"); if(lg) lg.onclick = function(){
    a.login(L2).then(function(key){ var c=a.cfg(); c.keys.openrouter=key; c.prov="openrouter"; c.on=true; a.saveCfg(c); st.aiOpen=true; H.toast(L2("Log masuk berjaya. AI dalam talian diaktifkan.","Signed in. Online AI is on.")); rerender(); if(!st.orModels) loadModels(); },
      function(e){ H.toast(String(e && e.message || e)); });
  };
  var sv = el.querySelector("#aiSave"); if(sv) sv.onclick = function(){
    var c=a.cfg(), p=a.PROV[c.prov]; c.on=el.querySelector("#aiOn").checked;
    var k=el.querySelector("#aiKey"); if(k) c.keys[c.prov]=k.value.trim();
    var mm=el.querySelector("#aiModel"); if(mm){ var m=a.cleanModel(c.prov, mm.value); c.models[c.prov]= m && m!==p.model ? m : ""; st.mOther=false; }
    var u=el.querySelector("#aiUrl"); if(u) c.customUrl=u.value.trim();
    if(c.on && !p.nokey && !c.keys[c.prov]){ H.toast(p.login?L2("Log masuk dahulu","Sign in first"):L2("Masukkan kunci API dahulu","Enter an API key first")); return; }
    if(c.prov==="custom" && c.on && !/^https:\/\//.test(c.customUrl||"")){ H.toast(L2("Alamat API mesti bermula dengan https://","The API address must start with https://")); return; }
    a.saveCfg(c); st.aiOpen=false; H.toast(c.on?L2("AI dalam talian diaktifkan","Online AI turned on"):L2("AI dalam talian ditutup","Online AI turned off")); rerender();
  };
}
function loadModels(){ loadList(AI(), "openrouter", AI().cfg().keys.openrouter, false); }
window.AISet = {render:function(el, h){ H = h; box = el; if(AI()){ AI()._on = AI()._on || h.on; AI()._off = AI()._off || h.off; } render(); }};
})();
