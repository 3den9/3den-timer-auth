/* 3DEN Timer — Auth v3 (login + leaderboard + profiles + edit + heatmap + sync + reset) */
(function(){
  if (window.__t3denAuthLoaded) return;
  window.__t3denAuthLoaded = true;

  var SUPABASE_URL = 'https://jnszsffkrcdovshhdifo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_rkWS91kcBgMSmOS7dFE2ww_F_UDk2xM';
  var STORAGE_KEY = 't3den_v4';
  var GUEST_KEY = 't3den_guest_mode';

  /* ===== COUNTRIES (ISO + flag) — top 60, then big alphabet ===== */
  var COUNTRIES = [
    ['PL','Poland','🇵🇱'],['BE','Belgium','🇧🇪'],['FR','France','🇫🇷'],['DE','Germany','🇩🇪'],['NL','Netherlands','🇳🇱'],
    ['LU','Luxembourg','🇱🇺'],['ES','Spain','🇪🇸'],['IT','Italy','🇮🇹'],['PT','Portugal','🇵🇹'],['CH','Switzerland','🇨🇭'],
    ['AT','Austria','🇦🇹'],['CZ','Czech Republic','🇨🇿'],['SK','Slovakia','🇸🇰'],['HU','Hungary','🇭🇺'],['RO','Romania','🇷🇴'],
    ['BG','Bulgaria','🇧🇬'],['GR','Greece','🇬🇷'],['HR','Croatia','🇭🇷'],['SI','Slovenia','🇸🇮'],['LT','Lithuania','🇱🇹'],
    ['LV','Latvia','🇱🇻'],['EE','Estonia','🇪🇪'],['FI','Finland','🇫🇮'],['SE','Sweden','🇸🇪'],['NO','Norway','🇳🇴'],
    ['DK','Denmark','🇩🇰'],['IS','Iceland','🇮🇸'],['IE','Ireland','🇮🇪'],['GB','United Kingdom','🇬🇧'],['UA','Ukraine','🇺🇦'],
    ['BY','Belarus','🇧🇾'],['RU','Russia','🇷🇺'],['TR','Turkey','🇹🇷'],['US','United States','🇺🇸'],['CA','Canada','🇨🇦'],
    ['MX','Mexico','🇲🇽'],['BR','Brazil','🇧🇷'],['AR','Argentina','🇦🇷'],['CL','Chile','🇨🇱'],['CO','Colombia','🇨🇴'],
    ['PE','Peru','🇵🇪'],['VE','Venezuela','🇻🇪'],['CN','China','🇨🇳'],['JP','Japan','🇯🇵'],['KR','South Korea','🇰🇷'],
    ['IN','India','🇮🇳'],['ID','Indonesia','🇮🇩'],['VN','Vietnam','🇻🇳'],['TH','Thailand','🇹🇭'],['PH','Philippines','🇵🇭'],
    ['MY','Malaysia','🇲🇾'],['SG','Singapore','🇸🇬'],['HK','Hong Kong','🇭🇰'],['TW','Taiwan','🇹🇼'],['AE','UAE','🇦🇪'],
    ['SA','Saudi Arabia','🇸🇦'],['IL','Israel','🇮🇱'],['EG','Egypt','🇪🇬'],['ZA','South Africa','🇿🇦'],['MA','Morocco','🇲🇦'],
    ['NG','Nigeria','🇳🇬'],['KE','Kenya','🇰🇪'],['AU','Australia','🇦🇺'],['NZ','New Zealand','🇳🇿']
  ];

  var PUZZLES = [
    ['333','3x3'],['222','2x2'],['444','4x4'],['555','5x5'],['666','6x6'],['777','7x7'],
    ['333oh','3x3 OH'],['333bld','3BLD'],['333fm','FMC'],['444bld','4BLD'],['555bld','5BLD'],
    ['333mbf','MBLD'],['pyram','Pyraminx'],['skewb','Skewb'],['clock','Clock'],['minx','Megaminx'],['sq1','Sq-1']
  ];

  var AVATAR_COLORS = ['#ef4444','#f97316','#fbbf24','#22c55e','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#ec4899','#94a3b8'];

  function loadSDK(cb){
    if (window.supabase && window.supabase.createClient) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = cb;
    s.onerror = function(){ console.error('[3DEN] SDK fail'); };
    document.head.appendChild(s);
  }

  /* ===== STYLES ===== */
  var css = ''
    + '.t3-auth-overlay{position:fixed;inset:0;background:rgba(10,14,26,.92);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;animation:t3aFade .25s ease;padding:20px;box-sizing:border-box}'
    + '.t3-auth-modal{background:linear-gradient(135deg,#161a2e 0%,#0a0e1a 100%);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:32px;width:min(94vw,460px);box-shadow:0 25px 50px -12px rgba(239,68,68,.25);animation:t3aPop .3s cubic-bezier(.34,1.56,.64,1);max-height:92vh;overflow-y:auto}'
    + '.t3-auth-logo{text-align:center;margin-bottom:24px}'
    + '.t3-auth-logo h1{font-size:28px;font-weight:800;letter-spacing:-1px;color:#fff;margin:0}'
    + '.t3-auth-logo h1 span{color:#ef4444}'
    + '.t3-auth-logo p{color:#94a3b8;font-size:13px;margin:6px 0 0}'
    + '.t3-auth-tabs{display:flex;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:20px}'
    + '.t3-auth-tab{flex:1;padding:10px;background:none;border:0;color:#94a3b8;font-weight:600;border-radius:8px;cursor:pointer;transition:all .2s;font-size:14px}'
    + '.t3-auth-tab.active{background:rgba(239,68,68,.15);color:#ef4444}'
    + '.t3-auth-input,.t3-auth-select,.t3-auth-textarea{width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;color:#fff;font-size:14px;margin-bottom:12px;box-sizing:border-box;transition:border .2s;font-family:inherit}'
    + '.t3-auth-textarea{resize:vertical;min-height:60px}'
    + '.t3-auth-input:focus,.t3-auth-select:focus,.t3-auth-textarea:focus{outline:0;border-color:#ef4444}'
    + '.t3-auth-btn{width:100%;background:#ef4444;color:#fff;border:0;border-radius:10px;padding:14px;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;margin-top:8px}'
    + '.t3-auth-btn:hover:not(:disabled){background:#dc2626;transform:translateY(-1px)}'
    + '.t3-auth-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}'
    + '.t3-auth-guest{width:100%;background:none;color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px;font-size:13px;cursor:pointer;margin-top:14px;transition:all .2s}'
    + '.t3-auth-guest:hover{color:#fff;border-color:rgba(255,255,255,.3)}'
    + '.t3-auth-link{display:block;text-align:center;color:#94a3b8;font-size:12px;margin-top:14px;cursor:pointer;text-decoration:none}'
    + '.t3-auth-link:hover{color:#ef4444}'
    + '.t3-auth-msg{font-size:13px;padding:10px 12px;border-radius:8px;margin-bottom:12px;display:none}'
    + '.t3-auth-msg.error{background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3);display:block}'
    + '.t3-auth-msg.success{background:rgba(34,197,94,.15);color:#86efac;border:1px solid rgba(34,197,94,.3);display:block}'
    + '.t3-auth-msg.info{background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.3);display:block}'
    + '.t3-auth-hint{font-size:11px;color:#64748b;margin-top:-8px;margin-bottom:12px;padding-left:4px}'
    + '.t3-auth-label{font-size:12px;color:#cbd5e1;margin-bottom:6px;display:block;font-weight:600;text-transform:uppercase;letter-spacing:.4px}'
    + '.t3-auth-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}'
    + '.t3-auth-chip{padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:12px;cursor:pointer;transition:all .15s;user-select:none;font-weight:600}'
    + '.t3-auth-chip.active{background:rgba(6,182,212,.15);border-color:#06b6d4;color:#06b6d4}'
    + '.t3-auth-chip.disabled{opacity:.4;cursor:not-allowed}'
    + '.t3-auth-color-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin-bottom:12px}'
    + '.t3-auth-color{width:100%;aspect-ratio:1;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .15s}'
    + '.t3-auth-color.active{border-color:#fff;transform:scale(1.1)}'
    + '.t3-auth-avatar-tabs{display:flex;background:rgba(0,0,0,.2);border-radius:8px;padding:3px;margin-bottom:12px}'
    + '.t3-auth-avatar-tabs button{flex:1;padding:8px;background:none;border:0;color:#94a3b8;font-size:12px;border-radius:6px;cursor:pointer;font-weight:600}'
    + '.t3-auth-avatar-tabs button.active{background:rgba(239,68,68,.2);color:#ef4444}'
    + '.t3-auth-preview{display:flex;align-items:center;gap:14px;padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:12px}'
    + '.t3-auth-preview-circle{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:24px;border:2px solid #ef4444;background-size:cover;background-position:center}'
    + '.t3-auth-badge{position:fixed;top:14px;right:440px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 14px;display:flex;align-items:center;gap:10px;z-index:9000;font-size:13px;color:#e2e8f0}'
    + '.t3-auth-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e}'
    + '.t3-auth-badge .dot.guest{background:#94a3b8}'
    + '.t3-auth-badge .dot.syncing{background:#fbbf24;animation:t3pulse 1s infinite}'
    + '.t3-auth-badge a{color:#e2e8f0;text-decoration:none}'
    + '.t3-auth-badge a:hover{color:#ef4444}'
    + '.t3-auth-badge button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:color .15s}'
    + '.t3-auth-badge button:hover{color:#ef4444}'
    + '.t3-sync{position:fixed;top:14px;right:54px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(34,197,94,.3);border-radius:999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;z-index:9000;color:#22c55e;font-size:13px;cursor:default;transition:all .2s}'
    + '.t3-sync.syncing{border-color:rgba(251,191,36,.5);color:#fbbf24}'
    + '.t3-sync.error{border-color:rgba(239,68,68,.5);color:#ef4444}'
    + '.t3-trophy{position:fixed;top:14px;right:14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;z-index:9000;cursor:pointer;transition:all .2s;color:#fbbf24;font-size:16px;text-decoration:none}'
    + '.t3-trophy:hover{background:rgba(251,191,36,.15);border-color:#fbbf24;transform:scale(1.05)}'
    + '@keyframes t3aFade{from{opacity:0}to{opacity:1}}'
    + '@keyframes t3aPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    + '@keyframes t3pulse{0%,100%{opacity:1}50%{opacity:.4}}'
    + '@keyframes t3pop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}'
    + '@keyframes t3slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}'
    + '@media (max-width:640px){'
    + '  .t3-auth-modal{padding:24px 20px;width:100%;border-radius:12px}'
    + '  .t3-auth-badge{right:54px !important;padding:5px 10px;font-size:12px;max-width:160px;overflow:hidden}'
    + '  .t3-auth-badge a{max-width:80px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;display:inline-block;vertical-align:middle}'
    + '  .t3-trophy,.t3-sync{width:32px;height:32px;font-size:14px}'
    + '  .t3-auth-color-grid{grid-template-columns:repeat(5,1fr) !important}'
    + '  .t3p-tabs{gap:0;font-size:12px}'
    + '  .t3p-tab{padding:10px 8px;font-size:13px}'
    + '  .t3p-grid2{grid-template-columns:1fr !important}'
    + '  .t3p-grid3{grid-template-columns:repeat(2,1fr) !important}'
    + '  .t3lb-row{grid-template-columns:40px 1fr auto !important;padding:10px 12px}'
    + '  .t3lb-count{display:none}'
    + '  .t3p-feed-card{padding:12px;gap:10px}'
    + '  .t3p-feed-avatar{width:36px;height:36px}'
    + '  .t3p-feed-time{font-size:15px}'
    + '}'
    + '.t3p-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:24px;gap:8px;overflow-x:auto}'
    + '.t3p-tab{background:none;border:0;color:#94a3b8;padding:12px 16px;cursor:pointer;font-weight:600;font-size:14px;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap}'
    + '.t3p-tab.active{color:#ef4444;border-bottom-color:#ef4444}'
    + '.t3p-tab:hover{color:#fff}'
    + '.t3p-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:20px;margin-bottom:16px}'
    + '.t3p-card h3{margin:0 0 12px;font-size:14px;font-weight:600;color:#cbd5e1;text-transform:uppercase;letter-spacing:.4px}'
    + '.t3p-stat{font-size:32px;font-weight:800;color:#fff;font-family:monospace}'
    + '.t3p-stat-sub{font-size:12px;color:#64748b;margin-top:4px}'
    + '.t3p-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}'
    + '.t3p-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}'
    + '.t3p-follow-btn{padding:8px 20px;background:#ef4444;color:#fff;border:0;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;transition:all .2s}'
    + '.t3p-follow-btn.following{background:rgba(34,197,94,.15);color:#22c55e;border:1px solid #22c55e}'
    + '.t3p-follow-btn.following:hover{background:rgba(239,68,68,.15);color:#ef4444;border-color:#ef4444}'
    + '.t3p-follow-btn:hover:not(.following){background:#dc2626}'
    + '.t3p-counter{display:inline-flex;align-items:center;gap:6px;color:#cbd5e1;font-size:14px;cursor:pointer}'
    + '.t3p-counter:hover{color:#ef4444}'
    + '.t3p-counter b{color:#fff;font-weight:700}'
    + '.t3p-feed-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;gap:14px;align-items:center}'
    + '.t3p-feed-avatar{width:42px;height:42px;border-radius:50%;background-size:cover;background-position:center;border:2px solid #ef4444;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}'
    + '.t3p-feed-time{color:#fbbf24;font-family:monospace;font-weight:700;font-size:18px;margin-left:auto;flex-shrink:0}'
    + '.t3p-wca{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:16px;margin-bottom:16px}'
    + '.t3p-wca a{color:#a5b4fc;text-decoration:none}'
    + '.t3p-wca a:hover{text-decoration:underline}';

  function injectCSS(){
    if (document.getElementById('t3-auth-css')) return;
    var st = document.createElement('style');
    st.id = 't3-auth-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ===== STATE ===== */
  var sb = null;
  var session = null;
  var profile = null;
  var mode = 'signin';
  var followCache = {};  // username -> {followers, following, isFollowing}
  var wcaCache = {};     // wca_id -> data

  /* ===== UTILS ===== */
  function escapeHTML(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function validUsername(u){ return /^[a-z0-9_-]{3,20}$/.test(u); }
  function puzzleLabel(p){
    var f = PUZZLES.find(function(x){return x[0]===p;});
    return f ? f[1] : p;
  }
  function countryFlag(code){
    if (!code) return '';
    var c = COUNTRIES.find(function(x){return x[0]===code;});
    return c ? c[2] : '';
  }
  function countryName(code){
    if (!code) return '';
    var c = COUNTRIES.find(function(x){return x[0]===code;});
    return c ? c[1] : code;
  }
  function formatTime(ms){
    if (ms == null) return '—';
    var s = Number(ms)/1000;
    if (s < 60) return s.toFixed(2);
    var m = Math.floor(s/60); var rs = s - m*60;
    return m+':'+(rs<10?'0':'')+rs.toFixed(2);
  }
  function msg(text, type){
    var el = document.getElementById('t3am');
    if (!el) return;
    el.className = 't3-auth-msg' + (type ? ' ' + type : '');
    el.textContent = text || '';
  }
  function closeModal(){
    var ov = document.getElementById('t3-auth-overlay');
    if (ov) ov.remove();
  }

  /* ===== MODALS ===== */
  function buildModal(){
    closeModal();
    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>3<span>DEN</span></h1><p>Speedcubing timer</p></div>'
      + '  <div class="t3-auth-tabs">'
      + '    <button class="t3-auth-tab active" data-mode="signin">Sign in</button>'
      + '    <button class="t3-auth-tab" data-mode="signup">Sign up</button>'
      + '  </div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <div id="t3a-username-row" style="display:none">'
      + '    <input type="text" class="t3-auth-input" id="t3au" placeholder="Username (3-20 chars, a-z 0-9 _ -)" autocomplete="username" maxlength="20"/>'
      + '    <p class="t3-auth-hint">Public name. Cannot be changed later.</p>'
      + '  </div>'
      + '  <input type="email" class="t3-auth-input" id="t3ae" placeholder="Email" autocomplete="email"/>'
      + '  <input type="password" class="t3-auth-input" id="t3ap" placeholder="Password (min 6 chars)" autocomplete="current-password"/>'
      + '  <button class="t3-auth-btn" id="t3ab">Sign in</button>'
      + '  <a class="t3-auth-link" id="t3a-forgot">Forgot password?</a>'
      + '  <button class="t3-auth-guest" id="t3ag">Continue as guest →</button>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var tabs = ov.querySelectorAll('.t3-auth-tab');
    var btn = ov.querySelector('#t3ab');
    var emailIn = ov.querySelector('#t3ae');
    var passIn = ov.querySelector('#t3ap');
    var userIn = ov.querySelector('#t3au');
    var userRow = ov.querySelector('#t3a-username-row');
    tabs.forEach(function(t){
      t.onclick = function(){
        tabs.forEach(function(x){ x.classList.remove('active'); });
        t.classList.add('active');
        mode = t.getAttribute('data-mode');
        btn.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
        userRow.style.display = mode === 'signup' ? 'block' : 'none';
        passIn.setAttribute('autocomplete', mode === 'signin' ? 'current-password' : 'new-password');
        msg('');
      };
    });
    btn.onclick = function(){
      if (mode === 'signup') doSignup(userIn.value.trim().toLowerCase(), emailIn.value.trim(), passIn.value);
      else doSignin(emailIn.value.trim(), passIn.value);
    };
    ov.querySelector('#t3ag').onclick = function(){
      localStorage.setItem(GUEST_KEY, '1');
      closeModal();
      buildBadge(null);
    };
    ov.querySelector('#t3a-forgot').onclick = function(){ buildResetPasswordModal(); };
    [emailIn, passIn, userIn].forEach(function(i){
      i.addEventListener('keydown', function(e){ if (e.key === 'Enter') btn.click(); });
    });
    setTimeout(function(){ emailIn.focus(); }, 100);
  }

  function buildResetPasswordModal(){
    closeModal();
    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>Reset <span>password</span></h1><p>We will send you a reset link</p></div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <input type="email" class="t3-auth-input" id="t3ae-reset" placeholder="Your email" autocomplete="email"/>'
      + '  <button class="t3-auth-btn" id="t3ab-reset">Send reset link</button>'
      + '  <a class="t3-auth-link" id="t3a-back">← Back to sign in</a>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    var input = ov.querySelector('#t3ae-reset');
    var btn = ov.querySelector('#t3ab-reset');
    btn.onclick = function(){
      var email = input.value.trim();
      if (!email){ msg('Email required', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Sending...';
      sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + '/timer'
      }).then(function(r){
        if (r.error){ msg(r.error.message, 'error'); btn.disabled=false; btn.textContent='Send reset link'; return; }
        msg('Email sent! Check your inbox.', 'success');
        btn.textContent = '✓ Sent';
      });
    };
    ov.querySelector('#t3a-back').onclick = buildModal;
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') btn.click(); });
    setTimeout(function(){ input.focus(); }, 100);
  }

  function buildUsernamePrompt(user){
    closeModal();
    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>Choose a <span>username</span></h1><p>This will be your public name</p></div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <input type="text" class="t3-auth-input" id="t3au" placeholder="Username (3-20 chars, a-z 0-9 _ -)" maxlength="20"/>'
      + '  <p class="t3-auth-hint">Cannot be changed later.</p>'
      + '  <button class="t3-auth-btn" id="t3ab-pick">Save</button>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    var input = ov.querySelector('#t3au');
    var btn = ov.querySelector('#t3ab-pick');
    btn.onclick = function(){
      var u = input.value.trim().toLowerCase();
      if (!validUsername(u)){ msg('3-20 chars: a-z 0-9 _ -', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Saving...';
      sb.from('profiles').insert({id:user.id, username:u}).then(function(r){
        if (r.error){
          var m = r.error.message;
          if (m.indexOf('duplicate')>=0||m.indexOf('unique')>=0) m = 'Username taken';
          msg(m, 'error'); btn.disabled=false; btn.textContent='Save'; return;
        }
        profile = {id:user.id, username:u, avatar_color:'#ef4444', avatar_type:'letter', main_events:[]};
        closeModal(); buildBadge(user); syncOnLogin();
      });
    };
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') btn.click(); });
    setTimeout(function(){ input.focus(); }, 100);
  }

  /* ===== EDIT PROFILE MODAL ===== */
  function buildEditProfile(){
    if (!profile) return;
    closeModal();
    var p = profile;
    var avatarType = p.avatar_type || 'letter';
    var color = p.avatar_color || '#ef4444';
    var url = p.avatar_url || '';
    var events = (p.main_events || []).slice();

    var countryOpts = '<option value="">— Select country —</option>' + COUNTRIES.map(function(c){
      return '<option value="'+c[0]+'"'+(p.country===c[0]?' selected':'')+'>'+c[2]+' '+c[1]+'</option>';
    }).join('');

    var colorGrid = AVATAR_COLORS.map(function(c){
      return '<div class="t3-auth-color'+(c===color?' active':'')+'" style="background:'+c+'" data-color="'+c+'"></div>';
    }).join('');

    var eventChips = PUZZLES.map(function(x){
      var sel = events.indexOf(x[0]) >= 0;
      return '<div class="t3-auth-chip'+(sel?' active':'')+'" data-ev="'+x[0]+'">'+x[1]+'</div>';
    }).join('');

    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>Edit <span>profile</span></h1></div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <div class="t3-auth-preview">'
      + '    <div id="t3ep-preview" class="t3-auth-preview-circle"></div>'
      + '    <div><div style="font-weight:700;color:#fff">@'+escapeHTML(p.username)+'</div><div style="font-size:12px;color:#64748b">Preview</div></div>'
      + '  </div>'
      + '  <label class="t3-auth-label">Avatar</label>'
      + '  <div class="t3-auth-avatar-tabs">'
      + '    <button class="'+(avatarType==='letter'?'active':'')+'" data-type="letter">Letter + color</button>'
      + '    <button class="'+(avatarType==='image'?'active':'')+'" data-type="image">Upload image</button>'
      + '  </div>'
      + '  <div id="t3ep-letter-pane" style="display:'+(avatarType==='letter'?'block':'none')+'">'
      + '    <div class="t3-auth-color-grid">'+colorGrid+'</div>'
      + '  </div>'
      + '  <div id="t3ep-image-pane" style="display:'+(avatarType==='image'?'block':'none')+'">'
      + '    <input type="file" id="t3ep-file" accept="image/*" style="display:none"/>'
      + '    <button class="t3-auth-guest" id="t3ep-pick" style="transition:all .2s">📷 Choose image or drag & drop (max 5MB)</button>'
      + '    <p class="t3-auth-hint">PNG/JPG, you can crop and rotate</p>'
      + '  </div>'
      + '  <label class="t3-auth-label">Bio</label>'
      + '  <textarea class="t3-auth-textarea" id="t3ep-bio" placeholder="Tell us about yourself..." maxlength="200">'+escapeHTML(p.bio||'')+'</textarea>'
      + '  <p class="t3-auth-hint" id="t3ep-bio-count">0 / 200</p>'
      + '  <label class="t3-auth-label">Country</label>'
      + '  <select class="t3-auth-select" id="t3ep-country">'+countryOpts+'</select>'
      + '  <label class="t3-auth-label">Main events <span style="color:#64748b;font-weight:400;text-transform:none">(max 5)</span></label>'
      + '  <div class="t3-auth-row" id="t3ep-events">'+eventChips+'</div>'
      + '  <button class="t3-auth-btn" id="t3ab-save">Save changes</button>'
      + '  <a class="t3-auth-link" id="t3a-cancel">Cancel</a>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var preview = ov.querySelector('#t3ep-preview');
    var bioIn = ov.querySelector('#t3ep-bio');
    var bioCount = ov.querySelector('#t3ep-bio-count');
    var countrySel = ov.querySelector('#t3ep-country');
    var letterPane = ov.querySelector('#t3ep-letter-pane');
    var imagePane = ov.querySelector('#t3ep-image-pane');
    var fileIn = ov.querySelector('#t3ep-file');

    function refreshPreview(){
      if (avatarType === 'letter'){
        preview.style.background = color;
        preview.style.backgroundImage = '';
        preview.textContent = (p.username||'?').charAt(0).toUpperCase();
      } else {
        preview.textContent = '';
        if (url) preview.style.backgroundImage = 'url('+url+')';
        else { preview.style.background = '#1e293b'; preview.textContent = '?'; }
      }
    }
    refreshPreview();

    bioCount.textContent = (bioIn.value.length) + ' / 200';
    bioIn.addEventListener('input', function(){ bioCount.textContent = bioIn.value.length + ' / 200'; });

    // Avatar tabs
    ov.querySelectorAll('.t3-auth-avatar-tabs button').forEach(function(b){
      b.onclick = function(){
        ov.querySelectorAll('.t3-auth-avatar-tabs button').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        avatarType = b.getAttribute('data-type');
        letterPane.style.display = avatarType==='letter' ? 'block' : 'none';
        imagePane.style.display = avatarType==='image' ? 'block' : 'none';
        refreshPreview();
      };
    });

    // Color picker
    ov.querySelectorAll('.t3-auth-color').forEach(function(c){
      c.onclick = function(){
        ov.querySelectorAll('.t3-auth-color').forEach(function(x){ x.classList.remove('active'); });
        c.classList.add('active');
        color = c.getAttribute('data-color');
        refreshPreview();
      };
    });

    // File upload
    ov.querySelector('#t3ep-pick').onclick = function(){ fileIn.click(); };
    function handleFile(f){
      if (!f) return;
      if (!f.type.startsWith('image/')){ msg('Not an image', 'error'); return; }
      if (f.size > 5*1024*1024){ msg('Max 5MB', 'error'); return; }
      buildCropModal(f, function(blob){
        msg('Uploading...', 'info');
        var path = profile.id + '/avatar.jpg';
        sb.storage.from('avatars').upload(path, blob, {upsert:true, contentType:'image/jpeg'}).then(function(r){
          if (r.error){ msg('Upload error: '+r.error.message, 'error'); return; }
          var pub = sb.storage.from('avatars').getPublicUrl(path);
          url = pub.data.publicUrl + '?t=' + Date.now();
          msg('Uploaded ✓', 'success');
          refreshPreview();
        });
      });
    }
    fileIn.addEventListener('change', function(){ handleFile(fileIn.files[0]); });
    
    // Drag & drop on image pane
    var imgPane = ov.querySelector('#t3ep-image-pane');
    var dropZone = ov.querySelector('#t3ep-pick');
    ['dragenter','dragover'].forEach(function(ev){
      imgPane.addEventListener(ev, function(e){ e.preventDefault(); e.stopPropagation(); dropZone.style.background='rgba(239,68,68,.1)'; dropZone.style.borderColor='#ef4444'; });
    });
    ['dragleave','drop'].forEach(function(ev){
      imgPane.addEventListener(ev, function(e){ e.preventDefault(); e.stopPropagation(); dropZone.style.background=''; dropZone.style.borderColor=''; });
    });
    imgPane.addEventListener('drop', function(e){
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });

    // Event chips (max 5)
    ov.querySelectorAll('#t3ep-events .t3-auth-chip').forEach(function(ch){
      ch.onclick = function(){
        var ev = ch.getAttribute('data-ev');
        var idx = events.indexOf(ev);
        if (idx >= 0){
          events.splice(idx, 1);
          ch.classList.remove('active');
        } else {
          if (events.length >= 5){ msg('Max 5 events', 'error'); return; }
          events.push(ev);
          ch.classList.add('active');
        }
      };
    });

    ov.querySelector('#t3ab-save').onclick = function(){
      var btn = ov.querySelector('#t3ab-save');
      btn.disabled = true; btn.textContent = 'Saving...';
      var update = {
        bio: bioIn.value.trim() || null,
        country: countrySel.value || null,
        avatar_type: avatarType,
        avatar_color: color,
        avatar_url: avatarType === 'image' ? url : null,
        main_events: events
      };
      sb.from('profiles').update(update).eq('id', profile.id).then(function(r){
        if (r.error){ msg(r.error.message, 'error'); btn.disabled=false; btn.textContent='Save changes'; return; }
        Object.assign(profile, update);
        msg('Saved ✓', 'success');
        setTimeout(function(){ closeModal(); /* refresh badge in case */ buildBadge(session.user); }, 600);
      });
    };
    ov.querySelector('#t3a-cancel').onclick = closeModal;
  }

  /* ===== BADGE / SYNC ===== */
  function buildBadge(user){
    ['t3-auth-badge','t3-trophy','t3-sync','t3-feed-icon','t3-bell-icon','t3-daily-icon','t3-weekly-icon','t3-inbox-icon','t3-lib-icon'].forEach(function(id){ var x=document.getElementById(id); if(x)x.remove(); });
    // Feed icon (only when logged in)
    if (user){
      var f = document.createElement('a');
      f.className = 't3-trophy';
      f.id = 't3-feed-icon';
      f.href = '/feed';
      f.title = 'Feed';
      f.innerHTML = '📰';
      f.style.right = '94px';
      f.style.color = '#ef4444';
      document.body.appendChild(f);
      
      var bell = document.createElement('div');
      bell.className = 't3-trophy';
      bell.id = 't3-bell-icon';
      bell.title = 'Notifications';
      bell.style.right = '194px';
      bell.style.color = '#fbbf24';
      bell.style.cursor = 'pointer';
      bell.innerHTML = '🔔';
      var bellBadge = document.createElement('span');
      bellBadge.id = 't3-bell-badge';
      bellBadge.style.cssText = 'position:absolute;top:-2px;right:-2px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:none;align-items:center;justify-content:center;border:2px solid #0a0e1a;box-sizing:border-box;line-height:1';
      bell.appendChild(bellBadge);
      bell.onclick = buildBellPanel;
      document.body.appendChild(bell);
      updateBellBadge();
      startNotificationPolling();
      
      // Daily challenge icon
      var daily = document.createElement('a');
      daily.className = 't3-trophy';
      daily.id = 't3-daily-icon';
      daily.title = 'Daily Challenge';
      daily.href = '/daily';
      daily.style.right = '244px';
      daily.style.color = '#fbbf24';
      daily.innerHTML = '⚡';
      document.body.appendChild(daily);
      
      // Weekly competition icon
      var weekly = document.createElement('a');
      weekly.className = 't3-trophy';
      weekly.id = 't3-weekly-icon';
      weekly.title = 'Weekly Competition';
      weekly.href = '/weekly';
      weekly.style.right = '294px';
      weekly.style.color = '#a855f7';
      weekly.innerHTML = '🏆';
      document.body.appendChild(weekly);
      
      // Inbox/messages icon
      var inbox = document.createElement('div');
      inbox.className = 't3-trophy';
      inbox.id = 't3-inbox-icon';
      inbox.title = 'Messages';
      inbox.style.right = '344px';
      inbox.style.color = '#06b6d4';
      inbox.style.cursor = 'pointer';
      inbox.innerHTML = '💬';
      var inboxBadge = document.createElement('span');
      inboxBadge.id = 't3-inbox-badge';
      inboxBadge.style.cssText = 'position:absolute;top:-2px;right:-2px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:none;align-items:center;justify-content:center;border:2px solid #0a0e1a;box-sizing:border-box;line-height:1';
      inbox.appendChild(inboxBadge);
      inbox.onclick = buildInboxModal;
      document.body.appendChild(inbox);
      updateInboxBadge();
      
      // Library / Algorithms icon
      var lib = document.createElement('a');
      lib.className = 't3-trophy';
      lib.id = 't3-lib-icon';
      lib.title = 'Algorithms (PLL/OLL/F2L)';
      lib.href = '/algs?set=pll';
      lib.style.right = '394px';
      lib.style.color = '#10b981';
      lib.innerHTML = '📚';
      document.body.appendChild(lib);
    }
    // Trophy
    var t = document.createElement('a');
    t.className = 't3-trophy';
    t.id = 't3-trophy';
    t.href = '/leaderboard';
    t.title = 'Leaderboard';
    t.innerHTML = '🏆';
    document.body.appendChild(t);
    // Sync indicator
    var s = document.createElement('div');
    s.className = 't3-sync';
    s.id = 't3-sync';
    s.title = user ? 'Synced with cloud' : 'Local only (sign in to sync)';
    s.innerHTML = user ? '✓' : '○';
    if (!user) s.style.opacity = '.4';
    document.body.appendChild(s);
    // Badge
    var div = document.createElement('div');
    div.className = 't3-auth-badge';
    div.id = 't3-auth-badge';
    if (user && profile){
      var avatar = profile.avatar_type === 'image' && profile.avatar_url
        ? '<span style="width:18px;height:18px;border-radius:50%;background:url('+escapeHTML(profile.avatar_url)+') center/cover;display:inline-block"></span>'
        : '<span class="dot"></span>';
      var flag = profile.country ? countryFlag(profile.country)+' ' : '';
      div.innerHTML = avatar + '<a href="/u?u='+encodeURIComponent(profile.username)+'">'+flag+escapeHTML(profile.username)+'</a><button id="t3b-edit" title="Edit profile">⚙</button><button id="t3blo">logout</button>';
      document.body.appendChild(div);
      document.getElementById('t3b-edit').onclick = buildEditProfile;
      document.getElementById('t3blo').onclick = doLogout;
    } else {
      div.innerHTML = '<span class="dot guest"></span><span>Guest</span><button id="t3bli">login</button>';
      document.body.appendChild(div);
      document.getElementById('t3bli').onclick = function(){
        localStorage.removeItem(GUEST_KEY);
        var b=document.getElementById('t3-auth-badge'); if(b)b.remove();
        buildModal();
      };
    }
  }

  function setSyncStatus(state){
    var el = document.getElementById('t3-sync');
    if (!el) return;
    el.className = 't3-sync ' + (state || '');
    if (state === 'syncing'){ el.innerHTML = '⟳'; el.title = 'Syncing...'; }
    else if (state === 'error'){ el.innerHTML = '✗'; el.title = 'Sync error'; }
    else { el.innerHTML = '✓'; el.title = 'Synced with cloud'; }
  }

  /* ===== AUTH ===== */
  function doSignup(username, email, password){
    if (!validUsername(username)){ msg('Username: 3-20 chars, a-z 0-9 _ -', 'error'); return; }
    if (!email || !password){ msg('Email and password required', 'error'); return; }
    if (password.length < 6){ msg('Password min 6 chars', 'error'); return; }
    var btn = document.getElementById('t3ab');
    btn.disabled = true; btn.textContent = 'Checking...';
    sb.from('profiles').select('username').eq('username', username).maybeSingle().then(function(r){
      if (r.data){ msg('Username taken', 'error'); btn.disabled=false; btn.textContent='Create account'; return; }
      btn.textContent = 'Creating...';
      sb.auth.signUp({email:email, password:password}).then(function(res){
        if (res.error){
          var m = res.error.message;
          if (m.indexOf('User already')>=0) m = 'Email already registered';
          msg(m, 'error'); btn.disabled=false; btn.textContent='Create account'; return;
        }
        session = res.data.session;
        sb.from('profiles').insert({id:res.data.user.id, username:username}).then(function(p){
          if (p.error){ msg('Profile err: '+p.error.message, 'error'); return; }
          profile = {id:res.data.user.id, username:username, avatar_color:'#ef4444', avatar_type:'letter', main_events:[]};
          msg('Welcome '+username+'!', 'success');
          setTimeout(function(){ closeModal(); buildBadge(res.data.user); syncOnLogin(); }, 600);
        });
      });
    });
  }

  function doSignin(email, password){
    if (!email || !password){ msg('Email and password required', 'error'); return; }
    var btn = document.getElementById('t3ab');
    btn.disabled = true; btn.textContent = 'Signing in...';
    sb.auth.signInWithPassword({email:email, password:password}).then(function(res){
      if (res.error){
        var m = res.error.message;
        if (m.indexOf('Invalid login')>=0) m = 'Wrong email or password';
        msg(m, 'error'); btn.disabled=false; btn.textContent='Sign in'; return;
      }
      session = res.data.session;
      loadProfile(session.user.id, function(p){
        profile = p;
        if (!p) buildUsernamePrompt(session.user);
        else { closeModal(); buildBadge(session.user); syncOnLogin(); }
      });
    });
  }

  function loadProfile(uid, cb){
    sb.from('profiles').select('*').eq('id', uid).maybeSingle().then(function(r){ cb(r.data || null); });
  }

  function doLogout(){
    if (!sb) return;
    sb.auth.signOut().then(function(){
      session=null; profile=null;
      ['t3-auth-badge','t3-trophy','t3-sync','t3-feed-icon','t3-bell-icon','t3-daily-icon','t3-weekly-icon','t3-inbox-icon','t3-lib-icon'].forEach(function(id){var x=document.getElementById(id); if(x)x.remove();});
      buildModal();
    });
  }

  /* ===== SYNC ===== */
  function syncOnLogin(){
    if (!session) return;
    setSyncStatus('syncing');
    var uid = session.user.id;
    sb.from('solves').select('*').eq('user_id', uid).order('solve_date', {ascending:true}).then(function(r){
      if (r.error){ console.error('[3DEN] pull', r.error); setSyncStatus('error'); return; }
      var remote = r.data || [];
      var local = readLocal();
      var sessions = local.sessions || {};
      var toUpload = [];
      Object.keys(sessions).forEach(function(p){
        (sessions[p]||[]).forEach(function(s){
          if (!s||!s.d) return;
          var found = remote.some(function(rr){ return rr.puzzle===p && rr.solve_date==Math.round(s.d) && rr.time_ms==Math.round(s.t); });
          if (!found){
            toUpload.push({user_id:uid, puzzle:p, time_ms:Math.round(s.t), scramble:s.s||'', penalty:s.pen||0, solve_date:Math.round(s.d)});
          }
        });
      });
      if (toUpload.length){
        sb.from('solves').insert(toUpload).then(function(rr){
          if (rr.error){ console.error('[3DEN] upload', rr.error); setSyncStatus('error'); }
          else { setSyncStatus('ok'); }
        });
      } else {
        setSyncStatus('ok');
      }
      mergeRemoteIntoLocal(remote);
    });
    hookSave();
  }

  function readLocal(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); } catch(e){ return {}; } }
  function writeLocal(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

  function mergeRemoteIntoLocal(remote){
    var local = readLocal();
    if (!local.sessions) local.sessions = {};
    var changed = false;
    remote.forEach(function(r){
      if (!local.sessions[r.puzzle]) local.sessions[r.puzzle] = [];
      var arr = local.sessions[r.puzzle];
      var found = arr.some(function(s){ return s.d == r.solve_date && s.t == r.time_ms; });
      if (!found){ arr.push({t:r.time_ms, s:r.scramble, d:r.solve_date, pen:r.penalty||0}); changed=true; }
    });
    if (changed){
      Object.keys(local.sessions).forEach(function(p){
        local.sessions[p].sort(function(a,b){ return (a.d||0)-(b.d||0); });
      });
      writeLocal(local);
      if (window.__t3denRender) try { window.__t3denRender(); } catch(e){}
    }
  }

  function hookSave(){
    if (window.__t3denSaveHooked) return;
    window.__t3denSaveHooked = true;
    var origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(k, v){
      origSet(k, v);
      if (k === STORAGE_KEY && session){
        try {
          var data = JSON.parse(v||'{}');
          if (window.__t3denLastPushed === v) return;
          var prev = JSON.parse(window.__t3denLastPushed||'{}');
          window.__t3denLastPushed = v;
          var newSolves = diffSolves(prev, data);
          if (newSolves.length){
            setSyncStatus('syncing');
            var rows = newSolves.map(function(x){
              return {user_id:session.user.id, puzzle:x.puzzle, time_ms:Math.round(x.solve.t), scramble:x.solve.s||'', penalty:x.solve.pen||0, solve_date:Math.round(x.solve.d)};
            });
            sb.from('solves').insert(rows).then(function(rr){
              if (rr.error){ setSyncStatus('error'); }
              else { setSyncStatus('ok'); }
            });
          }
          syncUpdatesAndDeletes(prev, data);
        } catch(e){}
      }
    };
    window.__t3denLastPushed = localStorage.getItem(STORAGE_KEY)||'{}';
  }

  function diffSolves(prev, curr){
    var out = [];
    var sessions = (curr&&curr.sessions)||{};
    var prevSessions = (prev&&prev.sessions)||{};
    Object.keys(sessions).forEach(function(p){
      var arr = sessions[p]||[];
      var prevArr = prevSessions[p]||[];
      arr.forEach(function(s){
        if (!s||!s.d) return;
        var f = prevArr.some(function(x){ return x&&x.d==s.d&&x.t==s.t; });
        if (!f) out.push({puzzle:p, solve:s});
      });
    });
    return out;
  }

  function syncUpdatesAndDeletes(prev, curr){
    if (!session) return;
    var uid = session.user.id;
    var sessions = (curr&&curr.sessions)||{};
    var prevSessions = (prev&&prev.sessions)||{};
    Object.keys(sessions).forEach(function(p){
      var arr = sessions[p]||[];
      var prevArr = prevSessions[p]||[];
      arr.forEach(function(s){
        var m = prevArr.find(function(x){ return x&&x.d==s.d&&x.t==s.t; });
        if (m && (m.pen||0) !== (s.pen||0)){
          sb.from('solves').update({penalty:s.pen||0}).match({user_id:uid,puzzle:p,solve_date:Math.round(s.d),time_ms:Math.round(s.t)}).then(function(){});
        }
      });
      prevArr.forEach(function(s){
        if (!s||!s.d) return;
        var st = arr.some(function(x){ return x&&x.d==s.d&&x.t==s.t; });
        if (!st){
          sb.from('solves').delete().match({user_id:uid,puzzle:p,solve_date:Math.round(s.d),time_ms:Math.round(s.t)}).then(function(){});
        }
      });
    });
  }

  /* ===== LEADERBOARD ===== */
  function renderLeaderboard(){
    document.title = 'Leaderboard — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-leaderboard';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:1200px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px">'
      + '  <a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a>'
      + '  <h1 style="margin:0;font-size:32px;font-weight:800">🏆 <span style="color:#fbbf24">Leaderboard</span></h1>'
      + '  <div style="width:100px"></div>'
      + '</div>'
      + '<div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap">'
      + '  <select id="t3lb-puzzle" class="t3-auth-select" style="width:auto;margin:0">'
      + PUZZLES.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join('')
      + '  </select>'
      + '  <select id="t3lb-country" class="t3-auth-select" style="width:auto;margin:0">'
      + '    <option value="">🌍 World</option>'
      + COUNTRIES.map(function(c){return '<option value="'+c[0]+'">'+c[2]+' '+c[1]+'</option>';}).join('')
      + '  </select>'
      + '  <div style="display:flex;background:rgba(255,255,255,.04);border-radius:8px;padding:4px;gap:2px">'
      + '    <button class="t3lb-tab active" data-tab="single">Single</button>'
      + '    <button class="t3lb-tab" data-tab="ao5">AO5</button>'
      + '    <button class="t3lb-tab" data-tab="ao12">AO12</button>'
      + '  </div>'
      + '</div>'
      + '<div id="t3lb-list" style="background:#0a0e1a;border:1px solid rgba(255,255,255,.05);border-radius:12px;overflow:hidden"></div>'
      + '</div>';
    var st2 = document.createElement('style');
    st2.textContent = ''
      + '.t3lb-tab{background:none;border:0;color:#94a3b8;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;transition:all .2s}'
      + '.t3lb-tab.active{background:rgba(251,191,36,.15);color:#fbbf24}'
      + '.t3lb-row{display:grid;grid-template-columns:60px 1fr auto auto;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s;gap:12px}'
      + '.t3lb-row:hover{background:rgba(255,255,255,.02)}'
      + '.t3lb-row:last-child{border-bottom:0}'
      + '.t3lb-rank{font-weight:700;font-size:16px;color:#64748b}'
      + '.t3lb-rank.gold{color:#fbbf24;font-size:20px}'
      + '.t3lb-rank.silver{color:#cbd5e1;font-size:18px}'
      + '.t3lb-rank.bronze{color:#fb923c;font-size:18px}'
      + '.t3lb-user{display:flex;align-items:center;gap:12px}'
      + '.t3lb-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;background-size:cover;background-position:center;border:2px solid #ef4444;box-sizing:border-box}'
      + '.t3lb-username{color:#fff;font-weight:600;text-decoration:none}'
      + '.t3lb-username:hover{color:#ef4444}'
      + '.t3lb-time{font-family:monospace;font-size:18px;font-weight:700;color:#fff}'
      + '.t3lb-count{color:#64748b;font-size:12px}';
    document.head.appendChild(st2);
    document.body.appendChild(page);

    var currentTab = 'single';
    var puzzleSel = page.querySelector('#t3lb-puzzle');
    var countrySel = page.querySelector('#t3lb-country');
    var tabs = page.querySelectorAll('.t3lb-tab');
    var list = page.querySelector('#t3lb-list');
    function loadAndRender(){
      list.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">Loading...</div>';
      var puzzle = puzzleSel.value;
      var country = countrySel.value;
      var view = 'leaderboard_' + currentTab;
      var col = currentTab === 'single' ? 'best_single' : 'best_'+currentTab;
      var query = sb.from(view).select('*').eq('puzzle', puzzle);
      if (country) query = query.eq('country', country);
      query.order(col, {ascending:true}).limit(100).then(function(r){
        if (r.error){ list.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444">'+r.error.message+'</div>'; return; }
        var rows = r.data || [];
        if (!rows.length){ list.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">No data yet — be the first!</div>'; return; }
        list.innerHTML = rows.map(function(row, i){
          var rank = i+1;
          var rankClass = rank===1?'gold':rank===2?'silver':rank===3?'bronze':'';
          var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'#'+rank;
          var color = row.avatar_color || '#ef4444';
          var avatarHtml;
          if (row.avatar_type === 'image' && row.avatar_url){
            avatarHtml = '<div class="t3lb-avatar" style="background-image:url('+escapeHTML(row.avatar_url)+')"></div>';
          } else {
            var initial = (row.username||'?').charAt(0).toUpperCase();
            avatarHtml = '<div class="t3lb-avatar" style="background:'+color+'">'+initial+'</div>';
          }
          var flag = row.country ? countryFlag(row.country)+' ' : '';
          return '<div class="t3lb-row">'
            + '<div class="t3lb-rank '+rankClass+'">'+medal+'</div>'
            + '<div class="t3lb-user">'+avatarHtml+'<a href="/u?u='+encodeURIComponent(row.username)+'" class="t3lb-username">'+flag+escapeHTML(row.username)+'</a></div>'
            + '<div class="t3lb-time">'+formatTime(row[col])+'</div>'
            + '<div class="t3lb-count">'+(row.solve_count?row.solve_count+' solves':'')+'</div>'
            + '</div>';
        }).join('');
      });
    }
    tabs.forEach(function(t){ t.onclick = function(){ tabs.forEach(function(x){x.classList.remove('active');}); t.classList.add('active'); currentTab=t.getAttribute('data-tab'); loadAndRender(); }; });
    puzzleSel.onchange = loadAndRender;
    countrySel.onchange = loadAndRender;
    loadAndRender();
  }

  /* ===== FOLLOW HELPERS ===== */
  function loadFollowData(profileId, cb){
    var promises = [
      sb.from('user_follow_counts').select('followers_count,following_count').eq('id', profileId).maybeSingle(),
      session ? sb.from('follows').select('follower_id').eq('follower_id', session.user.id).eq('following_id', profileId).maybeSingle() : Promise.resolve({data: null})
    ];
    Promise.all(promises).then(function(results){
      var counts = (results[0] && results[0].data) || {followers_count:0, following_count:0};
      var isFollowing = !!(results[1] && results[1].data);
      cb({followers: counts.followers_count || 0, following: counts.following_count || 0, isFollowing: isFollowing});
    });
  }

  function toggleFollow(profileId, isFollowing, cb){
    if (!session) { buildModal(); return; }
    if (isFollowing){
      sb.from('follows').delete().match({follower_id:session.user.id, following_id:profileId}).then(cb);
    } else {
      sb.from('follows').insert({follower_id:session.user.id, following_id:profileId}).then(cb);
    }
  }

  function renderFollowList(profileId, mode, container){
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">Loading...</div>';
    var col = mode === 'followers' ? 'follower_id' : 'following_id';
    var otherCol = mode === 'followers' ? 'following_id' : 'follower_id';
    sb.from('follows').select(col).eq(otherCol, profileId).then(function(r){
      if (r.error || !r.data || !r.data.length){
        container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">No '+mode+' yet</div>';
        return;
      }
      var ids = r.data.map(function(x){ return x[col]; });
      sb.from('profiles').select('*').in('id', ids).then(function(pr){
        if (pr.error || !pr.data){ container.innerHTML = 'Error'; return; }
        container.innerHTML = pr.data.map(function(p){
          var color = p.avatar_color || '#ef4444';
          var initial = (p.username||'?').charAt(0).toUpperCase();
          var avatarHtml = (p.avatar_type === 'image' && p.avatar_url)
            ? '<div class="t3p-feed-avatar" style="background-image:url('+escapeHTML(p.avatar_url)+')"></div>'
            : '<div class="t3p-feed-avatar" style="background:'+color+'">'+initial+'</div>';
          var flag = p.country ? countryFlag(p.country)+' ' : '';
          return '<a href="/u?u='+encodeURIComponent(p.username)+'" style="text-decoration:none">'
            + '<div class="t3p-feed-card">'+avatarHtml+'<div><div style="color:#fff;font-weight:700">'+flag+'@'+escapeHTML(p.username)+'</div>'+(p.bio?'<div style="color:#94a3b8;font-size:12px;margin-top:2px">'+escapeHTML(p.bio.substring(0,60))+'</div>':'')+'</div></div></a>';
        }).join('');
      });
    });
  }

  /* ===== WCA HELPERS ===== */
  function fetchWCA(wcaId, cb){
    if (wcaCache[wcaId]) { cb(wcaCache[wcaId]); return; }
    fetch('https://www.worldcubeassociation.org/api/v0/persons/'+encodeURIComponent(wcaId))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ if (d) wcaCache[wcaId] = d; cb(d); })
      .catch(function(){ cb(null); });
  }

  function loadUserWCA(profileId, cb){
    sb.from('wca_profiles').select('*').eq('user_id', profileId).maybeSingle().then(function(r){
      cb(r.data || null);
    });
  }

  function buildLinkWCAModal(){
    closeModal();
    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>Link <span>WCA</span> Profile</h1><p>Connect your World Cube Association ID</p></div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <input type="text" class="t3-auth-input" id="t3wca-id" placeholder="WCA ID (e.g. 2025DUQU04)" maxlength="10" style="text-transform:uppercase"/>'
      + '  <p class="t3-auth-hint">Find yours at worldcubeassociation.org</p>'
      + '  <div id="t3wca-preview" style="display:none;background:rgba(0,0,0,.2);border-radius:10px;padding:14px;margin-bottom:12px"></div>'
      + '  <button class="t3-auth-btn" id="t3wca-link" disabled>Verify & Link</button>'
      + '  <a class="t3-auth-link" id="t3a-cancel">Cancel</a>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var input = ov.querySelector('#t3wca-id');
    var preview = ov.querySelector('#t3wca-preview');
    var btn = ov.querySelector('#t3wca-link');
    var lastFetched = null;

    var debounce;
    input.addEventListener('input', function(){
      var id = input.value.trim().toUpperCase();
      input.value = id;
      btn.disabled = true;
      preview.style.display = 'none';
      if (id.length < 4){ return; }
      clearTimeout(debounce);
      debounce = setTimeout(function(){
        msg('Looking up...', 'info');
        fetchWCA(id, function(d){
          if (!d || !d.person){ msg('WCA ID not found', 'error'); return; }
          msg('');
          lastFetched = d;
          var p = d.person;
          var ranks = (d.personal_records && Object.keys(d.personal_records).length) || 0;
          preview.innerHTML = '<div style="color:#fff;font-weight:700;font-size:16px">'+escapeHTML(p.name)+'</div>'
            + '<div style="color:#94a3b8;font-size:12px;margin-top:4px">'+escapeHTML(p.country_iso2||'')+' · '+ranks+' personal records</div>';
          preview.style.display = 'block';
          btn.disabled = false;
        });
      }, 500);
    });

    btn.onclick = function(){
      if (!lastFetched) return;
      btn.disabled = true; btn.textContent = 'Linking...';
      sb.from('wca_profiles').upsert({
        user_id: session.user.id,
        wca_id: lastFetched.person.id,
        data: lastFetched
      }).then(function(r){
        if (r.error){ msg(r.error.message, 'error'); btn.disabled=false; btn.textContent='Verify & Link'; return; }
        msg('Linked ✓', 'success');
        setTimeout(function(){ closeModal(); location.reload(); }, 800);
      });
    };
    ov.querySelector('#t3a-cancel').onclick = closeModal;
  }

  function timeAgo(ts){
    var s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    if (s < 604800) return Math.floor(s/86400) + 'd ago';
    return Math.floor(s/604800) + 'w ago';
  }

  /* ===== STATS HELPERS ===== */
  function computeStats(solves){
    // solves: array of {puzzle, time_ms, solve_date, penalty}
    var byPuzzle = {};
    var totalTime = 0;
    var totalSessions = 0;
    var weeklyData = {}; // weekStart -> {puzzle: {time, count}}
    var sessionsByDay = {};
    
    solves.forEach(function(s){
      if (!byPuzzle[s.puzzle]) byPuzzle[s.puzzle] = {times:[], totalTime:0};
      var t = (s.penalty === 1 ? s.time_ms + 2000 : s.time_ms);
      byPuzzle[s.puzzle].times.push(s.penalty === 2 ? null : t);
      byPuzzle[s.puzzle].totalTime += s.time_ms;
      totalTime += s.time_ms;
      
      var day = new Date(s.solve_date).toISOString().substring(0,10);
      sessionsByDay[day] = true;
      
      // Week starts on Monday
      var d = new Date(s.solve_date);
      var dayOfWeek = (d.getDay() + 6) % 7;
      var weekStart = new Date(d);
      weekStart.setDate(d.getDate() - dayOfWeek);
      var wk = weekStart.toISOString().substring(0,10);
      if (!weeklyData[wk]) weeklyData[wk] = {};
      if (!weeklyData[wk][s.puzzle]) weeklyData[wk][s.puzzle] = {time:0, count:0};
      weeklyData[wk][s.puzzle].time += s.time_ms;
      weeklyData[wk][s.puzzle].count += 1;
    });
    
    totalSessions = Object.keys(sessionsByDay).length;
    
    // Compute PB/AO5/AO12 per puzzle
    var stats = {};
    Object.keys(byPuzzle).forEach(function(p){
      var times = byPuzzle[p].times;
      var validTimes = times.filter(function(t){ return t != null; });
      if (!validTimes.length) return;
      stats[p] = {
        count: times.length,
        totalTime: byPuzzle[p].totalTime,
        best: Math.min.apply(null, validTimes),
        ao5: computeBestAvg(times, 5),
        ao12: computeBestAvg(times, 12)
      };
    });
    
    return {
      totalTime: totalTime,
      totalSessions: totalSessions,
      totalSolves: solves.length,
      byPuzzle: stats,
      weeklyData: weeklyData
    };
  }

  function computeBestAvg(times, size){
    if (times.length < size) return null;
    var best = null;
    for (var i = 0; i <= times.length - size; i++){
      var w = times.slice(i, i+size);
      var avg = computeAvg(w, 1);
      if (avg !== null && (best === null || avg < best)) best = avg;
    }
    return best;
  }

  function computeAvg(window, drop){
    var sorted = window.slice().sort(function(a,b){
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    });
    if (sorted.length < drop*2 + 1) return null;
    var trim = sorted.slice(drop, sorted.length - drop);
    if (trim.some(function(t){ return t === null; })) return null;
    var sum = trim.reduce(function(a,b){ return a+b; }, 0);
    return sum / trim.length;
  }

  function formatDuration(ms){
    var s = Math.floor(ms/1000);
    var h = Math.floor(s/3600);
    var m = Math.floor((s%3600)/60);
    if (h) return h+'h '+m+'m';
    if (m) return m+'m';
    return s+'s';
  }

  /* ===== STATS RENDERING (uses Canvas) ===== */
  function renderDonut(canvas, data, colors){
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth * 2;
    var h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(1,1);
    var cx = w/2, cy = h/2;
    var r = Math.min(w,h)/2 * 0.85;
    var ir = r * 0.6;
    var total = data.reduce(function(a,b){ return a + b.value; }, 0);
    if (!total){ return; }
    var start = -Math.PI/2;
    data.forEach(function(d, i){
      var angle = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      start += angle;
    });
    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, ir, 0, 2*Math.PI);
    ctx.fillStyle = '#0a0e1a';
    ctx.fill();
  }

  function renderBars(canvas, data, color){
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth * 2;
    var h = canvas.height = canvas.offsetHeight * 2;
    if (!data.length) return;
    var max = Math.max.apply(null, data.map(function(d){ return d.value; }));
    if (!max) return;
    var pad = 30 * 2;
    var barW = (w - pad*2) / data.length;
    data.forEach(function(d, i){
      var bh = (d.value / max) * (h - pad*2);
      var x = pad + i * barW + barW * 0.15;
      var y = h - pad - bh;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barW * 0.7, bh);
      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW*0.35, h - 8);
    });
  }

  function renderStackedBars(canvas, weekData, puzzleColors){
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth * 2;
    var h = canvas.height = canvas.offsetHeight * 2;
    var weeks = Object.keys(weekData).sort().slice(-12); // last 12 weeks
    if (!weeks.length){ return; }
    
    // Find total per week (in seconds for time, count for solves)
    var maxTotal = 0;
    weeks.forEach(function(wk){
      var total = 0;
      Object.keys(weekData[wk]).forEach(function(p){ total += weekData[wk][p].time; });
      if (total > maxTotal) maxTotal = total;
    });
    if (!maxTotal) return;
    
    var pad = 40 * 2;
    var barW = (w - pad*2) / weeks.length;
    
    weeks.forEach(function(wk, i){
      var puzzles = Object.keys(weekData[wk]);
      var stack = 0;
      var x = pad + i * barW + barW * 0.15;
      puzzles.forEach(function(p){
        var v = weekData[wk][p].time;
        var bh = (v / maxTotal) * (h - pad*2);
        ctx.fillStyle = puzzleColors[p] || '#ef4444';
        ctx.fillRect(x, h - pad - stack - bh, barW * 0.7, bh);
        stack += bh;
      });
      // Label (week date)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      var dateLabel = wk.substring(5);
      ctx.fillText(dateLabel, x + barW*0.35, h - 12);
    });
  }

  /* ===== PROFILE ===== */
  function renderProfile(username){
    var page = document.createElement('div');
    page.id = 't3-profile';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:900px;margin:0 auto;text-align:center;color:#64748b;padding:80px">Loading profile...</div>';
    document.body.appendChild(page);
    document.title = '@'+username+' — 3DEN';

    sb.from('profiles').select('*').eq('username', username).maybeSingle().then(function(pr){
      if (pr.error || !pr.data){
        page.innerHTML = '<div style="text-align:center;padding:80px"><h1>404</h1><p style="color:#64748b">User @'+escapeHTML(username)+' not found</p><a href="/" style="color:#ef4444">← Back</a></div>';
        return;
      }
      var p = pr.data;
      Promise.all([
        sb.from('solves').select('user_id,puzzle,time_ms,scramble,penalty,solve_date').eq('user_id', p.id),
        new Promise(function(r){ loadFollowData(p.id, r); }),
        new Promise(function(r){ loadUserWCA(p.id, r); })
      ]).then(function(results){
        var allSolves = (results[0] && results[0].data) || [];
        var follow = results[1];
        var wca = results[2];
        renderProfileContent(page, p, allSolves, follow, wca);
      });
    });
  }

  function renderProfileContent(page, p, allSolves, follow, wca){
    var color = p.avatar_color || '#ef4444';
    var initial = (p.username||'?').charAt(0).toUpperCase();
    var joined = new Date(p.created_at).toLocaleDateString();
    var avatarStyle = p.avatar_type === 'image' && p.avatar_url
      ? 'background:url('+p.avatar_url+') center/cover;'
      : 'background:'+color+';';
    var flag = p.country ? countryFlag(p.country) : '';
    var isOwn = profile && profile.id === p.id;
    var stats = computeStats(allSolves);
    var hasStats = stats.totalSolves > 0;

    var eventBadges = (p.main_events||[]).map(function(e){
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(6,182,212,.15);color:#06b6d4;border-radius:999px;font-size:12px;font-weight:600;border:1px solid rgba(6,182,212,.3)">'+puzzleLabel(e)+'</span>';
    }).join(' ');

    var followBtn = '';
    if (!isOwn){
      followBtn = '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="t3p-follow-btn '+(follow.isFollowing?'following':'')+'" id="t3p-follow-btn">'+(follow.isFollowing?'✓ Following':'+ Follow')+'</button>';
      if (session) followBtn += '<button class="t3p-follow-btn" id="t3p-msg-btn" style="background:rgba(6,182,212,.15);color:#06b6d4;border:1px solid #06b6d4">💬 Message</button>';
      followBtn += '</div>';
    } else {
      followBtn = '<button id="t3p-edit" style="background:rgba(239,68,68,.15);border:1px solid #ef4444;color:#ef4444;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600">⚙ Edit profile</button>';
    }

    var html = '<div style="max-width:1100px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/leaderboard" style="color:#94a3b8;text-decoration:none;font-size:14px">← Leaderboard</a>'
      + '  ' + followBtn
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;flex-wrap:wrap">'
      + '  <div style="width:96px;height:96px;border-radius:50%;'+avatarStyle+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;font-weight:800;border:3px solid #ef4444;box-sizing:border-box;flex-shrink:0">'
      + (p.avatar_type === 'image' ? '' : initial)
      + '  </div>'
      + '  <div style="flex:1;min-width:200px">'
      + '    <h1 style="margin:0;font-size:32px;font-weight:800">'+(flag?flag+' ':'')+'@'+escapeHTML(p.username)+'</h1>'
      + (p.country ? '<p style="color:#64748b;margin:4px 0 0;font-size:13px">📍 '+escapeHTML(countryName(p.country))+'</p>' : '')
      + '    <p style="color:#64748b;margin:4px 0 0;font-size:13px">Joined '+joined+'</p>'
      + (eventBadges ? '<div style="margin-top:10px">'+eventBadges+'</div>' : '')
      + '    <div style="margin-top:12px;display:flex;gap:20px">'
      + '      <span class="t3p-counter" id="t3p-c-followers"><b>'+follow.followers+'</b> followers</span>'
      + '      <span class="t3p-counter" id="t3p-c-following"><b>'+follow.following+'</b> following</span>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + (p.bio ? '<p style="color:#cbd5e1;background:rgba(255,255,255,.03);padding:16px;border-radius:10px;margin-bottom:24px;border-left:3px solid #ef4444;line-height:1.5">'+escapeHTML(p.bio)+'</p>' : '')
      + '<div class="t3p-tabs">'
      + '  <button class="t3p-tab active" data-tab="overview">Overview</button>'
      + '  <button class="t3p-tab" data-tab="stats">Stats</button>'
      + '  <button class="t3p-tab" data-tab="pbs">PBs</button>'
      + '  <button class="t3p-tab" data-tab="followers">Followers</button>'
      + '  <button class="t3p-tab" data-tab="wca">WCA</button>'
      + '</div>'
      + '<div id="t3p-content"></div>'
      + '</div>';

    page.innerHTML = html;

    if (isOwn){
      var eb = page.querySelector('#t3p-edit');
      if (eb) eb.onclick = buildEditProfile;
    } else {
      var fb = page.querySelector('#t3p-follow-btn');
      var msgBtn = page.querySelector('#t3p-msg-btn');
      if (msgBtn) msgBtn.onclick = function(){ buildDMModal(p.id, p); };
      if (fb) fb.onclick = function(){
        toggleFollow(p.id, follow.isFollowing, function(){
          follow.isFollowing = !follow.isFollowing;
          follow.followers += follow.isFollowing ? 1 : -1;
          fb.className = 't3p-follow-btn ' + (follow.isFollowing ? 'following' : '');
          fb.textContent = follow.isFollowing ? '✓ Following' : '+ Follow';
          fb.style.animation = 't3pop .3s ease';
          setTimeout(function(){ fb.style.animation=''; }, 300);
          var c = page.querySelector('#t3p-c-followers');
          c.innerHTML = '<b>'+follow.followers+'</b> followers';
          c.style.animation = 't3pop .3s ease';
          setTimeout(function(){ c.style.animation=''; }, 300);
        });
      };
    }

    var tabs = page.querySelectorAll('.t3p-tab');
    var content = page.querySelector('#t3p-content');
    var puzzleColors = {'333':'#ef4444','222':'#06b6d4','444':'#fbbf24','555':'#22c55e','666':'#3b82f6','777':'#8b5cf6','333oh':'#f97316','333bld':'#ec4899','pyram':'#14b8a6','skewb':'#a855f7','clock':'#facc15','minx':'#10b981','sq1':'#0ea5e9','333fm':'#6366f1','444bld':'#d946ef','555bld':'#f43f5e','333mbf':'#fb7185'};

    function showTab(name){
      tabs.forEach(function(t){
        t.classList.toggle('active', t.getAttribute('data-tab') === name);
      });
      content.innerHTML = '';
      if (name === 'overview') renderOverviewTab(content, p, allSolves);
      else if (name === 'stats') renderStatsTab(content, stats, puzzleColors);
      else if (name === 'pbs') renderPBsTab(content, stats);
      else if (name === 'followers') renderFollowersTab(content, p);
      else if (name === 'wca') renderWCATab(content, p, wca, isOwn);
    }
    tabs.forEach(function(t){ t.onclick = function(){ showTab(t.getAttribute('data-tab')); }; });
    showTab('overview');
  }

  function renderOverviewTab(container, p, allSolves){
    var heatmap = buildHeatmap(allSolves);
    var html = '<div class="t3p-card">'
      + '<h3>🔥 Activity '+heatmap.totalSolves+' solves in '+heatmap.activeDays+' days</h3>'
      + '<div style="overflow-x:auto"><div style="display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;gap:3px;width:max-content">'
      + heatmap.cells.map(function(c){
          var alpha = c.count === 0 ? 0.05 : Math.min(0.2 + c.count*0.15, 1);
          return '<div title="'+c.date+': '+c.count+' solves" style="width:12px;height:12px;background:rgba(239,68,68,'+alpha+');border-radius:2px"></div>';
        }).join('')
      + '</div></div></div>'
      + '<div class="t3p-card" id="t3p-achievements-card"><h3>🏆 Achievements</h3><div id="t3p-achievements">Loading...</div></div>';
    container.innerHTML = html;
    
    loadAchievements(p.id, function(achs){
      var ach_div = container.querySelector('#t3p-achievements');
      if (!ach_div) return;
      if (!achs.length){
        ach_div.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px">No achievements yet — keep cubing!</p>';
        return;
      }
      ach_div.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">'
        + achs.map(function(a){
          var info = ACHIEVEMENTS_CATALOG[a.type] || {emoji:'⭐', label:a.type, desc:''};
          return '<div title="'+escapeHTML(info.desc)+'" style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:12px;text-align:center"><div style="font-size:28px">'+info.emoji+'</div><div style="color:#fbbf24;font-weight:700;font-size:12px;margin-top:4px">'+escapeHTML(info.label)+'</div></div>';
        }).join('')
        + '</div>';
    });
  }

  function renderStatsTab(container, stats, puzzleColors){
    if (!stats.totalSolves){
      container.innerHTML = '<p style="text-align:center;color:#64748b;padding:40px">No solves yet</p>';
      return;
    }
    var puzzles = Object.keys(stats.byPuzzle);
    var html = '<div class="t3p-grid2">'
      + '<div class="t3p-card"><h3>Total Practice</h3><div class="t3p-stat">'+formatDuration(stats.totalTime)+'</div><div class="t3p-stat-sub">'+stats.totalSolves+' solves over '+stats.totalSessions+' days</div></div>'
      + '<div class="t3p-card"><h3>Time per Event</h3><canvas id="t3s-donut" style="width:100%;height:200px"></canvas><div id="t3s-donut-legend" style="margin-top:12px;font-size:12px;display:flex;flex-wrap:wrap;gap:8px"></div></div>'
      + '</div>'
      + '<div class="t3p-card"><h3>Weekly Practice (last 12 weeks)</h3><canvas id="t3s-weekly" style="width:100%;height:240px"></canvas></div>'
      + '<div class="t3p-card"><h3>Solve Analytics</h3><div class="t3p-grid3" id="t3s-analytics"></div></div>'
      + '<div class="t3p-card"><h3>Event Breakdown</h3><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="border-bottom:1px solid rgba(255,255,255,.1)"><th style="text-align:left;padding:8px;color:#94a3b8;font-weight:600">Event</th><th style="text-align:right;padding:8px;color:#94a3b8;font-weight:600">Time</th><th style="text-align:right;padding:8px;color:#94a3b8;font-weight:600">Solves</th><th style="text-align:right;padding:8px;color:#94a3b8;font-weight:600">% Total</th></tr></thead><tbody id="t3s-breakdown"></tbody></table></div>';
    container.innerHTML = html;

    // Donut data
    var donutData = puzzles.map(function(p){ return {label: puzzleLabel(p), value: stats.byPuzzle[p].totalTime}; }).sort(function(a,b){return b.value-a.value;});
    var donutColors = donutData.map(function(d){
      var pcode = puzzles.find(function(x){ return puzzleLabel(x) === d.label; });
      return puzzleColors[pcode] || '#94a3b8';
    });
    setTimeout(function(){
      renderDonut(container.querySelector('#t3s-donut'), donutData, donutColors);
    }, 50);

    // Donut legend
    container.querySelector('#t3s-donut-legend').innerHTML = donutData.map(function(d, i){
      var pct = (d.value / stats.totalTime * 100).toFixed(1);
      return '<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:2px;background:'+donutColors[i]+'"></span><span style="color:#cbd5e1">'+d.label+' '+pct+'%</span></span>';
    }).join('');

    // Weekly stacked bars
    setTimeout(function(){
      renderStackedBars(container.querySelector('#t3s-weekly'), stats.weeklyData, puzzleColors);
    }, 50);

    // Analytics cards (PB/AO5/AO12 per puzzle)
    var analyticsHtml = puzzles.sort(function(a,b){ return stats.byPuzzle[b].count - stats.byPuzzle[a].count; }).map(function(p){
      var s = stats.byPuzzle[p];
      return '<div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:14px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="color:#cbd5e1;font-weight:700;font-size:14px">'+puzzleLabel(p)+'</span><span style="color:#64748b;font-size:11px">'+s.count+' solves</span></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px">'
        + '<div><div style="color:#64748b;text-transform:uppercase">Best</div><div style="color:#fbbf24;font-family:monospace;font-weight:700;font-size:14px">'+formatTime(s.best)+'</div></div>'
        + '<div><div style="color:#64748b;text-transform:uppercase">AO5</div><div style="color:#fff;font-family:monospace;font-weight:700;font-size:14px">'+formatTime(s.ao5)+'</div></div>'
        + '<div><div style="color:#64748b;text-transform:uppercase">AO12</div><div style="color:#fff;font-family:monospace;font-weight:700;font-size:14px">'+formatTime(s.ao12)+'</div></div>'
        + '</div></div>';
    }).join('');
    container.querySelector('#t3s-analytics').innerHTML = analyticsHtml;

    // Event breakdown table
    var breakdownHtml = puzzles.sort(function(a,b){ return stats.byPuzzle[b].totalTime - stats.byPuzzle[a].totalTime; }).map(function(p){
      var s = stats.byPuzzle[p];
      var pct = (s.totalTime / stats.totalTime * 100).toFixed(1);
      return '<tr style="border-bottom:1px solid rgba(255,255,255,.04)"><td style="padding:8px;color:#fff">'+puzzleLabel(p)+'</td><td style="text-align:right;padding:8px;color:#cbd5e1;font-family:monospace">'+formatDuration(s.totalTime)+'</td><td style="text-align:right;padding:8px;color:#cbd5e1">'+s.count+'</td><td style="text-align:right;padding:8px;color:#94a3b8">'+pct+'%</td></tr>';
    }).join('');
    container.querySelector('#t3s-breakdown').innerHTML = breakdownHtml;
  }

  function renderPBsTab(container, stats){
    if (!stats.totalSolves){
      container.innerHTML = '<p style="text-align:center;color:#64748b;padding:40px">No solves yet</p>';
      return;
    }
    var puzzles = Object.keys(stats.byPuzzle).sort(function(a,b){ return stats.byPuzzle[b].count - stats.byPuzzle[a].count; });
    container.innerHTML = '<div class="t3p-grid3">' + puzzles.map(function(p){
      var s = stats.byPuzzle[p];
      return '<div class="t3p-card" style="margin:0">'
        + '<div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.5px">'+puzzleLabel(p)+'</div>'
        + '<div style="font-family:monospace;font-size:28px;font-weight:800;color:#fbbf24;margin-top:6px">'+formatTime(s.best)+'</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;font-size:11px">'
        + '<div><div style="color:#64748b;text-transform:uppercase">AO5</div><div style="color:#fff;font-family:monospace;font-weight:700;font-size:14px">'+formatTime(s.ao5)+'</div></div>'
        + '<div><div style="color:#64748b;text-transform:uppercase">AO12</div><div style="color:#fff;font-family:monospace;font-weight:700;font-size:14px">'+formatTime(s.ao12)+'</div></div>'
        + '</div>'
        + '<div style="color:#64748b;font-size:11px;margin-top:10px">'+s.count+' solves</div>'
        + '</div>';
    }).join('') + '</div>';
  }

  function renderFollowersTab(container, p){
    container.innerHTML = '<div style="display:flex;gap:8px;margin-bottom:16px"><button class="t3p-tab active" data-mode="followers">Followers</button><button class="t3p-tab" data-mode="following">Following</button></div><div id="t3p-follow-list"></div>';
    var tabs = container.querySelectorAll('.t3p-tab');
    var list = container.querySelector('#t3p-follow-list');
    function show(mode){
      tabs.forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-mode')===mode); });
      renderFollowList(p.id, mode, list);
    }
    tabs.forEach(function(t){ t.onclick = function(){ show(t.getAttribute('data-mode')); }; });
    show('followers');
  }

  function renderWCATab(container, p, wca, isOwn){
    if (!wca){
      if (isOwn){
        container.innerHTML = '<div class="t3p-card" style="text-align:center;padding:40px"><div style="font-size:48px;margin-bottom:12px">🏅</div><h3 style="margin:0 0 8px;color:#fff;text-transform:none;letter-spacing:0">No WCA Profile linked</h3><p style="color:#94a3b8;margin:0 0 16px">Connect your World Cube Association ID to show official records</p><button class="t3-auth-btn" id="t3wca-btn" style="max-width:200px;margin:0 auto;display:block">Link WCA Profile</button></div>';
        var btn = container.querySelector('#t3wca-btn');
        btn.onclick = buildLinkWCAModal;
      } else {
        container.innerHTML = '<p style="text-align:center;color:#64748b;padding:40px">No WCA profile linked</p>';
      }
      return;
    }
    var d = wca.data;
    var person = d && d.person;
    var prs = d && d.personal_records;
    if (!person){ container.innerHTML = '<p style="text-align:center;color:#64748b;padding:40px">WCA data not loaded</p>'; return; }
    var html = '<div class="t3p-wca">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px"><div><div style="font-weight:700;color:#fff;font-size:18px">'+escapeHTML(person.name)+'</div>'
      + '<div style="color:#94a3b8;font-size:13px;margin-top:4px">WCA ID: <a href="https://www.worldcubeassociation.org/persons/'+encodeURIComponent(wca.wca_id)+'" target="_blank">'+escapeHTML(wca.wca_id)+'</a></div></div>'
      + (isOwn ? '<button id="t3wca-relink" style="background:none;border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">Change</button>' : '')
      + '</div></div>';
    if (prs){
      var rows = Object.keys(prs).map(function(ev){
        var r = prs[ev];
        var single = r.single ? r.single.best : null;
        var avg = r.average ? r.average.best : null;
        var singleRank = r.single ? r.single.world_rank : null;
        var avgRank = r.average ? r.average.world_rank : null;
        return '<tr style="border-bottom:1px solid rgba(255,255,255,.04)"><td style="padding:10px;color:#fff;font-weight:600">'+escapeHTML(ev)+'</td>'
          + '<td style="padding:10px;text-align:right;font-family:monospace;color:#fbbf24">'+(single?(single/100).toFixed(2):'—')+'</td>'
          + '<td style="padding:10px;text-align:right;color:#64748b;font-size:11px">'+(singleRank?'WR #'+singleRank:'')+'</td>'
          + '<td style="padding:10px;text-align:right;font-family:monospace;color:#cbd5e1">'+(avg?(avg/100).toFixed(2):'—')+'</td>'
          + '<td style="padding:10px;text-align:right;color:#64748b;font-size:11px">'+(avgRank?'WR #'+avgRank:'')+'</td></tr>';
      }).join('');
      html += '<div class="t3p-card"><h3>🏅 Official WCA Records</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="border-bottom:1px solid rgba(255,255,255,.1)"><th style="text-align:left;padding:10px;color:#94a3b8;font-weight:600">Event</th><th style="text-align:right;padding:10px;color:#94a3b8;font-weight:600">Single</th><th></th><th style="text-align:right;padding:10px;color:#94a3b8;font-weight:600">Average</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
    }
    container.innerHTML = html;
    if (isOwn){
      var rb = container.querySelector('#t3wca-relink');
      if (rb) rb.onclick = buildLinkWCAModal;
    }
  }

  function buildHeatmap(solves){
    var now = new Date();
    var days = 365;
    var cells = [];
    var byDay = {};
    solves.forEach(function(s){
      var d = new Date(s.solve_date);
      var k = d.toISOString().substring(0,10);
      byDay[k] = (byDay[k]||0)+1;
    });
    var totalSolves = solves.length;
    var activeDays = Object.keys(byDay).length;
    // Start from Sunday of (today - 364 days)
    var start = new Date(now);
    start.setDate(start.getDate() - days + 1);
    start.setDate(start.getDate() - start.getDay()); // back to Sunday
    var end = new Date(now);
    end.setDate(end.getDate() + (6 - end.getDay())); // forward to Saturday
    var d = new Date(start);
    while (d <= end){
      var k = d.toISOString().substring(0,10);
      cells.push({date:k, count:(byDay[k]||0)});
      d.setDate(d.getDate()+1);
    }
    return {cells:cells, totalSolves:totalSolves, activeDays:activeDays};
  }

  /* ===== REACTIONS ===== */
  var REACTIONS = [
    {key:'fire', emoji:'🔥'},
    {key:'clap', emoji:'👏'},
    {key:'party', emoji:'🎉'},
    {key:'rocket', emoji:'🚀'},
    {key:'heart', emoji:'❤️'}
  ];

  function reactionRowHTML(data){
    return REACTIONS.map(function(rx){
      var d = data[rx.key];
      var count = d ? d.count : 0;
      var mine = d ? d.mine : false;
      if (count === 0 && !session) return '';
      var bg = mine ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.04)';
      var border = mine ? '#ef4444' : 'rgba(255,255,255,.08)';
      return '<button class="t3-react-btn" data-emoji="'+rx.key+'" style="background:'+bg+';border:1px solid '+border+';color:#fff;padding:4px 10px;border-radius:999px;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:4px;transition:all .15s;font-family:inherit">'+rx.emoji+(count?' '+count:'')+'</button>';
    }).join('');
  }

  function bindReactionRow(row, data, uid, puzzle, solveDate){
    row.querySelectorAll('.t3-react-btn').forEach(function(btn){
      btn.onclick = function(){
        if (!session){ buildModal(); return; }
        var emoji = btn.getAttribute('data-emoji');
        var d = data[emoji] || {count:0, mine:false};
        btn.style.animation = 't3pop .3s ease';
        setTimeout(function(){ btn.style.animation=''; }, 300);
        if (d.mine){
          sb.from('reactions').delete().match({user_id:session.user.id, target_user_id:uid, target_puzzle:puzzle, target_solve_date:solveDate, emoji:emoji}).then(function(){
            d.count = Math.max(0, d.count-1); d.mine = false; data[emoji] = d;
            row.innerHTML = reactionRowHTML(data);
            bindReactionRow(row, data, uid, puzzle, solveDate);
          });
        } else {
          sb.from('reactions').insert({user_id:session.user.id, target_user_id:uid, target_puzzle:puzzle, target_solve_date:solveDate, emoji:emoji}).then(function(rr){
            if (rr.error){ console.error('react err', rr.error); return; }
            d.count += 1; d.mine = true; data[emoji] = d;
            row.innerHTML = reactionRowHTML(data);
            bindReactionRow(row, data, uid, puzzle, solveDate);
          });
        }
      };
    });
  }

  function renderReactionsFor(rows, container){
    if (!rows.length) return;
    var uids = Array.from(new Set(rows.map(function(r){ return r.user_id; })));
    sb.from('reactions').select('*').in('target_user_id', uids).then(function(r){
      var byKey = {};
      (r.data || []).forEach(function(rx){
        var k = rx.target_user_id+'|'+rx.target_puzzle+'|'+rx.target_solve_date;
        if (!byKey[k]) byKey[k] = {};
        if (!byKey[k][rx.emoji]) byKey[k][rx.emoji] = {count:0, mine:false};
        byKey[k][rx.emoji].count += 1;
        if (session && rx.user_id === session.user.id) byKey[k][rx.emoji].mine = true;
      });
      container.querySelectorAll('.t3p-react-row').forEach(function(row){
        var key = row.getAttribute('data-key');
        var uid = row.getAttribute('data-uid');
        var puzzle = row.getAttribute('data-puzzle');
        var solveDate = parseInt(row.getAttribute('data-date'), 10);
        var data = byKey[key] || {};
        row.innerHTML = reactionRowHTML(data);
        bindReactionRow(row, data, uid, puzzle, solveDate);
      });
    });
  }

  /* ===== NOTIFICATIONS ===== */
  function loadNotifications(cb){
    if (!session){ cb([]); return; }
    sb.from('notifications').select('*').eq('recipient_id', session.user.id).order('created_at',{ascending:false}).limit(30).then(function(r){
      cb(r.data || []);
    });
  }

  function getUnreadCount(cb){
    if (!session){ cb(0); return; }
    sb.from('notifications').select('id', {count:'exact', head:true}).eq('recipient_id', session.user.id).eq('read', false).then(function(r){
      cb(r.count || 0);
    });
  }

  function markAllRead(){
    if (!session) return Promise.resolve();
    return sb.from('notifications').update({read:true}).eq('recipient_id', session.user.id).eq('read', false);
  }

  function buildBellPanel(){
    closeModal();
    var html = '<div class="t3-auth-modal" style="max-width:420px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h2 style="color:#fff;margin:0;font-size:18px">🔔 Notifications</h2><button id="t3n-close" style="background:none;border:0;color:#94a3b8;font-size:20px;cursor:pointer">×</button></div>'
      + '<div id="t3n-list" style="max-height:60vh;overflow-y:auto"><div style="padding:30px;text-align:center;color:#64748b">Loading...</div></div>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.querySelector('#t3n-close').onclick = closeModal;
    ov.onclick = function(e){ if (e.target === ov) closeModal(); };
    var list = ov.querySelector('#t3n-list');
    
    loadNotifications(function(notes){
      markAllRead().then(function(){ updateBellBadge(); });
      
      if (!notes.length){
        list.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b">No notifications yet</div>';
        return;
      }
      var actorIds = Array.from(new Set(notes.filter(function(n){return n.actor_id;}).map(function(n){return n.actor_id;})));
      sb.from('profiles').select('id,username,avatar_color,avatar_url,avatar_type,country').in('id', actorIds).then(function(pr){
        var byId = {};
        (pr.data || []).forEach(function(p){ byId[p.id] = p; });
        list.innerHTML = notes.map(function(n){
          var actor = byId[n.actor_id];
          var avatarHtml = '<div style="width:36px;height:36px;border-radius:50%;background:#94a3b8;flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">?</div>';
          var name = 'Someone';
          if (actor){
            var color = actor.avatar_color || '#ef4444';
            var initial = (actor.username||'?').charAt(0).toUpperCase();
            avatarHtml = (actor.avatar_type === 'image' && actor.avatar_url)
              ? '<div style="width:36px;height:36px;border-radius:50%;background:url('+escapeHTML(actor.avatar_url)+') center/cover;flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box"></div>'
              : '<div style="width:36px;height:36px;border-radius:50%;background:'+color+';flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">'+initial+'</div>';
            var flag = actor.country ? countryFlag(actor.country)+' ' : '';
            name = '<a href="/u?u='+encodeURIComponent(actor.username)+'" style="color:#fff;text-decoration:none;font-weight:700">'+flag+'@'+escapeHTML(actor.username)+'</a>';
          }
          var text = '';
          if (n.type === 'follow') text = name + ' started following you';
          else if (n.type === 'pr') text = name + ' set a PR on '+puzzleLabel(n.data.puzzle)+': <span style="color:#fbbf24;font-family:monospace">'+formatTime(n.data.time_ms)+'</span>';
          else if (n.type === 'reaction'){
            var emojiMap = {fire:'🔥', clap:'👏', party:'🎉', rocket:'🚀', heart:'❤️'};
            text = name + ' reacted '+(emojiMap[n.data.emoji]||'')+' to your PR';
          }
          else if (n.type === 'comment') text = name + ' commented on your PR';
          else if (n.type === 'message') text = name + ' sent you a message: <span style="color:#cbd5e1;font-style:italic">"'+escapeHTML((n.data && n.data.preview)||'')+'"</span>';
          var unread = !n.read ? 'background:rgba(239,68,68,.05);' : '';
          return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:10px;margin-bottom:6px;'+unread+'">'+avatarHtml+'<div style="flex:1"><div style="color:#cbd5e1;font-size:13px">'+text+'</div><div style="color:#64748b;font-size:11px;margin-top:2px">'+timeAgo(n.created_at)+'</div></div></div>';
        }).join('');
      });
    });
  }

  function updateBellBadge(){
    var badge = document.getElementById('t3-bell-badge');
    if (!badge) return;
    getUnreadCount(function(n){
      if (n > 0){
        badge.textContent = n > 99 ? '99+' : n;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  function updateInboxBadge(){
    var badge = document.getElementById('t3-inbox-badge');
    if (!badge || !session) return;
    sb.from('messages').select('id', {count:'exact', head:true}).eq('recipient_id', session.user.id).eq('read', false).then(function(r){
      var n = r.count || 0;
      if (n > 0){
        badge.textContent = n > 99 ? '99+' : n;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  function startNotificationPolling(){
    if (window.__t3NotifPolling) return;
    window.__t3NotifPolling = true;
    setInterval(updateBellBadge, 30000);
  }

  /* ===== ACHIEVEMENTS CATALOG ===== */
  var ACHIEVEMENTS_CATALOG = {
    first_solve: {emoji:'🎯', label:'First solve', desc:'Welcome to speedcubing!'},
    solves_100: {emoji:'💯', label:'100 solves', desc:'Practice makes perfect'},
    solves_500: {emoji:'🏃', label:'500 solves', desc:'Getting serious'},
    solves_1000: {emoji:'🚀', label:'1000 solves', desc:'Dedicated cuber'},
    solves_5000: {emoji:'👑', label:'5000 solves', desc:'Legend'},
    sub_60_333: {emoji:'⏱️', label:'Sub-60 (3x3)', desc:'Under 1 minute'},
    sub_30_333: {emoji:'⚡', label:'Sub-30 (3x3)', desc:'Faster than fast'},
    sub_20_333: {emoji:'🔥', label:'Sub-20 (3x3)', desc:'Speedcuber tier'},
    sub_15_333: {emoji:'💎', label:'Sub-15 (3x3)', desc:'Top 1% tier'},
    sub_10_333: {emoji:'🏆', label:'Sub-10 (3x3)', desc:'Elite cuber'},
    streak_7: {emoji:'🔥', label:'7-day streak', desc:'Cubed every day for a week'},
    daily_winner: {emoji:'🥇', label:'Daily winner', desc:'Won a daily challenge'}
  };

  function loadAchievements(userId, cb){
    sb.from('achievements').select('*').eq('user_id', userId).order('unlocked_at', {ascending:false}).then(function(r){
      cb(r.data || []);
    });
  }

  /* ===== DAILY CHALLENGE ===== */
  function todayDateStr(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function generateScramble3(){
    // Simple 3x3 scramble: 20 random moves, no repeats on same axis
    var moves = ['U','D','R','L','F','B'];
    var modifiers = ['', '\'', '2'];
    var axes = {U:'UD',D:'UD',R:'RL',L:'RL',F:'FB',B:'FB'};
    var out = [];
    var lastAxis = '';
    for (var i=0; i<20; i++){
      var m;
      do { m = moves[Math.floor(Math.random()*moves.length)]; } while (axes[m] === lastAxis);
      lastAxis = axes[m];
      out.push(m + modifiers[Math.floor(Math.random()*3)]);
    }
    return out.join(' ');
  }

  function getOrCreateDaily(cb){
    var date = todayDateStr();
    sb.from('daily_challenges').select('*').eq('challenge_date', date).maybeSingle().then(function(r){
      if (r.data) { cb(r.data); return; }
      // Create today's challenge
      var scramble = generateScramble3();
      sb.from('daily_challenges').insert({challenge_date:date, puzzle:'333', scramble:scramble}).select().single().then(function(c){
        if (c.error) {
          // Race: someone else created it
          sb.from('daily_challenges').select('*').eq('challenge_date', date).maybeSingle().then(function(rr){
            cb(rr.data);
          });
        } else cb(c.data);
      });
    });
  }

  function loadMyDailyResult(date, cb){
    if (!session) { cb(null); return; }
    sb.from('daily_results').select('*').eq('user_id', session.user.id).eq('challenge_date', date).maybeSingle().then(function(r){
      cb(r.data || null);
    });
  }

  function loadDailyLeaderboard(date, cb){
    sb.from('daily_leaderboard').select('*').eq('challenge_date', date).order('rank').limit(50).then(function(r){
      cb(r.data || []);
    });
  }

  function renderDaily(){
    if (!session){ buildModal(); return; }
    document.title = 'Daily Challenge — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-daily';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:800px;margin:0 auto"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px"><a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a><h1 style="margin:0;font-size:28px;font-weight:800">⚡ <span style="color:#fbbf24">Daily Challenge</span></h1><div style="width:100px"></div></div><div id="t3-daily-content"><div style="padding:40px;text-align:center;color:#64748b">Loading...</div></div></div>';
    document.body.appendChild(page);
    var content = page.querySelector('#t3-daily-content');
    
    getOrCreateDaily(function(challenge){
      if (!challenge){ content.innerHTML = '<div style="text-align:center;color:#ef4444;padding:40px">Could not load challenge</div>'; return; }
      loadMyDailyResult(challenge.challenge_date, function(myResult){
        loadDailyLeaderboard(challenge.challenge_date, function(rows){
          renderDailyContent(content, challenge, myResult, rows);
        });
      });
    });
  }

  function renderDailyContent(container, challenge, myResult, rows){
    var date = challenge.challenge_date;
    var html = '<div class="t3p-card" style="text-align:center;background:linear-gradient(135deg,rgba(251,191,36,.1) 0%,rgba(239,68,68,.1) 100%);border-color:rgba(251,191,36,.3)">'
      + '<div style="color:#fbbf24;font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">⚡ Today\'s scramble · '+date+'</div>'
      + '<div style="font-family:monospace;font-size:20px;color:#fff;line-height:1.6;padding:16px;background:rgba(0,0,0,.3);border-radius:10px;letter-spacing:1px">'+escapeHTML(challenge.scramble)+'</div>'
      + '<p style="color:#94a3b8;font-size:13px;margin:14px 0 0">3x3 · One attempt per day · Resets at midnight (your local time)</p>'
      + '</div>';
    
    if (myResult){
      var t = myResult.penalty===1 ? myResult.time_ms+2000 : myResult.time_ms;
      var label = myResult.penalty===2 ? 'DNF' : formatTime(t);
      html += '<div class="t3p-card" style="text-align:center"><h3>Your time</h3><div class="t3p-stat" style="color:#fbbf24">'+label+'</div></div>';
    } else {
      html += '<div class="t3p-card" style="text-align:center"><h3>You haven\'t attempted yet</h3><p style="color:#94a3b8;font-size:13px;margin:8px 0 16px">Solve the scramble in your timer (3x3 mode), then click "Submit my time" with your latest 3x3 solve.</p>'
        + '<button class="t3-auth-btn" id="t3d-submit" style="max-width:280px;margin:0 auto;display:block">Submit my latest 3x3 solve</button></div>';
    }
    
    html += '<div class="t3p-card"><h3>🏆 Today\'s ranking ('+rows.length+' players)</h3>';
    if (!rows.length){
      html += '<p style="text-align:center;color:#64748b;padding:24px">No submissions yet — be the first!</p>';
    } else {
      html += '<div>'+rows.map(function(row, i){
        var rank = row.rank;
        var rankClass = rank===1?'gold':rank===2?'silver':rank===3?'bronze':'';
        var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'#'+rank;
        var color = row.avatar_color || '#ef4444';
        var avatarHtml = (row.avatar_type === 'image' && row.avatar_url)
          ? '<div class="t3lb-avatar" style="background-image:url('+escapeHTML(row.avatar_url)+')"></div>'
          : '<div class="t3lb-avatar" style="background:'+color+'">'+(row.username||'?').charAt(0).toUpperCase()+'</div>';
        var flag = row.country ? countryFlag(row.country)+' ' : '';
        var t = row.penalty===2 ? 'DNF' : formatTime(row.effective_time);
        var isMe = session && row.user_id === session.user.id;
        var bg = isMe ? 'background:rgba(239,68,68,.05)' : '';
        return '<div class="t3lb-row" style="'+bg+'"><div class="t3lb-rank '+rankClass+'">'+medal+'</div><div class="t3lb-user">'+avatarHtml+'<a href="/u?u='+encodeURIComponent(row.username)+'" class="t3lb-username">'+flag+escapeHTML(row.username)+(isMe?' (you)':'')+'</a></div><div class="t3lb-time">'+t+'</div></div>';
      }).join('')+'</div>';
    }
    html += '</div>';
    container.innerHTML = html;
    
    var sb_btn = container.querySelector('#t3d-submit');
    if (sb_btn){
      sb_btn.onclick = function(){
        // Find latest 3x3 solve from local storage
        var local = JSON.parse(localStorage.getItem('t3den_v4')||'{}');
        var solves = (local.sessions||{})['333']||[];
        if (!solves.length){ alert('Solve the scramble in your timer first (3x3 mode)'); return; }
        var last = solves[solves.length-1];
        if (!confirm('Submit your latest 3x3 time ('+formatTime(last.t)+')?\nScramble used in timer may differ from daily — make sure you solved the daily scramble!')) return;
        sb_btn.disabled = true; sb_btn.textContent = 'Submitting...';
        sb.from('daily_results').insert({
          user_id: session.user.id,
          challenge_date: date,
          time_ms: Math.round(last.t),
          penalty: last.pen||0
        }).then(function(r){
          if (r.error){ alert(r.error.message); sb_btn.disabled=false; sb_btn.textContent='Submit my latest 3x3 solve'; return; }
          renderDaily(); // refresh
        });
      };
    }
  }

  /* ===== COMMENTS ===== */
  function loadComments(uid, puzzle, solveDate, cb){
    sb.from('comments').select('*').eq('target_user_id', uid).eq('target_puzzle', puzzle).eq('target_solve_date', solveDate).order('created_at',{ascending:true}).then(function(r){
      var comments = r.data || [];
      if (!comments.length){ cb([]); return; }
      var actorIds = Array.from(new Set(comments.map(function(c){ return c.user_id; })));
      sb.from('profiles').select('id,username,avatar_color,avatar_url,avatar_type,country').in('id', actorIds).then(function(pr){
        var byId = {};
        (pr.data || []).forEach(function(p){ byId[p.id] = p; });
        comments.forEach(function(c){ c._actor = byId[c.user_id]; });
        cb(comments);
      });
    });
  }

  function buildCommentsModal(uid, puzzle, solveDate, prInfo){
    closeModal();
    var html = '<div class="t3-auth-modal" style="max-width:500px;max-height:90vh">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h2 style="color:#fff;margin:0;font-size:18px">💬 Comments</h2><button id="t3c-close" style="background:none;border:0;color:#94a3b8;font-size:20px;cursor:pointer">×</button></div>'
      + (prInfo ? '<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px;margin-bottom:16px;font-size:13px;color:#cbd5e1">🏅 PR on '+puzzleLabel(puzzle)+': <span style="color:#fbbf24;font-family:monospace;font-weight:700">'+prInfo+'</span></div>' : '')
      + '<div id="t3c-list" style="max-height:50vh;overflow-y:auto;margin-bottom:14px"><div style="padding:20px;text-align:center;color:#64748b">Loading...</div></div>'
      + (session ? '<textarea class="t3-auth-textarea" id="t3c-input" placeholder="Add a comment..." maxlength="500" style="min-height:60px"></textarea><button class="t3-auth-btn" id="t3c-send">Post comment</button>' : '<button class="t3-auth-btn" id="t3c-login">Sign in to comment</button>')
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.querySelector('#t3c-close').onclick = closeModal;
    ov.onclick = function(e){ if (e.target === ov) closeModal(); };
    var listEl = ov.querySelector('#t3c-list');
    
    function refresh(){
      loadComments(uid, puzzle, solveDate, function(comments){
        if (!comments.length){
          listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b">No comments yet. Be the first!</div>';
          return;
        }
        listEl.innerHTML = comments.map(function(c){
          var actor = c._actor;
          if (!actor) return '';
          var color = actor.avatar_color || '#ef4444';
          var initial = (actor.username||'?').charAt(0).toUpperCase();
          var avatarHtml = (actor.avatar_type === 'image' && actor.avatar_url)
            ? '<div style="width:32px;height:32px;border-radius:50%;background:url('+escapeHTML(actor.avatar_url)+') center/cover;flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box"></div>'
            : '<div style="width:32px;height:32px;border-radius:50%;background:'+color+';flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">'+initial+'</div>';
          var flag = actor.country ? countryFlag(actor.country)+' ' : '';
          var canDelete = session && c.user_id === session.user.id;
          return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;margin-bottom:6px;background:rgba(255,255,255,.02)">'
            + avatarHtml
            + '<div style="flex:1;min-width:0">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><a href="/u?u='+encodeURIComponent(actor.username)+'" style="color:#fff;font-weight:700;text-decoration:none;font-size:13px">'+flag+'@'+escapeHTML(actor.username)+'</a><span style="color:#64748b;font-size:11px">'+timeAgo(c.created_at)+'</span>'
            + (canDelete?'<button data-cid="'+c.id+'" class="t3c-del" style="background:none;border:0;color:#64748b;cursor:pointer;font-size:12px;margin-left:auto">delete</button>':'')
            + '</div>'
            + '<div style="color:#cbd5e1;font-size:13px;line-height:1.5;word-wrap:break-word">'+escapeHTML(c.body)+'</div>'
            + '</div></div>';
        }).join('');
        listEl.querySelectorAll('.t3c-del').forEach(function(b){
          b.onclick = function(){
            if (!confirm('Delete comment?')) return;
            sb.from('comments').delete().eq('id', b.getAttribute('data-cid')).then(function(){ refresh(); });
          };
        });
      });
    }
    refresh();
    
    var sendBtn = ov.querySelector('#t3c-send');
    if (sendBtn){
      sendBtn.onclick = function(){
        var input = ov.querySelector('#t3c-input');
        var body = input.value.trim();
        if (!body) return;
        if (body.length > 500){ alert('Max 500 chars'); return; }
        sendBtn.disabled = true;
        sb.from('comments').insert({
          user_id: session.user.id,
          target_user_id: uid,
          target_puzzle: puzzle,
          target_solve_date: solveDate,
          body: body
        }).then(function(r){
          sendBtn.disabled = false;
          if (r.error){ alert(r.error.message); return; }
          input.value = '';
          refresh();
        });
      };
    }
    var loginBtn = ov.querySelector('#t3c-login');
    if (loginBtn) loginBtn.onclick = function(){ closeModal(); buildModal(); };
  }

  /* ===== AVATAR CROP ===== */
  function buildCropModal(file, cb){
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function(){
      var modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.95);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';
      modal.innerHTML = '<div style="background:linear-gradient(135deg,#161a2e 0%,#0a0e1a 100%);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:24px;width:min(94vw,420px)">'
        + '<h2 style="color:#fff;margin:0 0 16px;font-size:18px;text-align:center">Crop avatar</h2>'
        + '<div style="position:relative;width:100%;height:300px;background:#000;overflow:hidden;border-radius:12px;cursor:move" id="t3cr-canvas-wrap"><canvas id="t3cr-canvas" width="300" height="300" style="position:absolute;top:0;left:0;width:100%;height:100%;touch-action:none"></canvas></div>'
        + '<div style="display:flex;gap:8px;align-items:center;margin-top:16px"><span style="color:#94a3b8;font-size:12px">Zoom</span><input type="range" id="t3cr-zoom" min="1" max="4" step="0.05" value="1" style="flex:1"/></div>'
        + '<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span style="color:#94a3b8;font-size:12px">Rotate</span><button id="t3cr-rot-l" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">↺</button><button id="t3cr-rot-r" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">↻</button></div>'
        + '<div style="display:flex;gap:8px;margin-top:16px"><button class="t3-auth-guest" id="t3cr-cancel" style="margin:0">Cancel</button><button class="t3-auth-btn" id="t3cr-ok" style="margin:0">Use this</button></div>'
        + '</div>';
      document.body.appendChild(modal);
      
      var canvas = modal.querySelector('#t3cr-canvas');
      var wrap = modal.querySelector('#t3cr-canvas-wrap');
      var ctx = canvas.getContext('2d');
      var zoom = 1, rot = 0, ox = 0, oy = 0;
      var dragging = false, lx = 0, ly = 0;
      
      function draw(){
        var w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w/2 + ox, h/2 + oy);
        ctx.rotate(rot * Math.PI/180);
        // Fit image to fill canvas at zoom=1
        var scale = Math.max(w/img.width, h/img.height) * zoom;
        var iw = img.width * scale, ih = img.height * scale;
        ctx.drawImage(img, -iw/2, -ih/2, iw, ih);
        ctx.restore();
        // Circle overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(w/2, h/2, Math.min(w,h)/2 - 5, 0, Math.PI*2, true);
        ctx.fill('evenodd');
        ctx.restore();
        // Circle outline
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, Math.min(w,h)/2 - 5, 0, Math.PI*2);
        ctx.stroke();
      }
      draw();
      
      modal.querySelector('#t3cr-zoom').oninput = function(e){ zoom = parseFloat(e.target.value); draw(); };
      modal.querySelector('#t3cr-rot-l').onclick = function(){ rot -= 90; draw(); };
      modal.querySelector('#t3cr-rot-r').onclick = function(){ rot += 90; draw(); };
      
      function startDrag(x, y){ dragging = true; lx = x; ly = y; }
      function moveDrag(x, y){ if (!dragging) return; ox += (x-lx); oy += (y-ly); lx = x; ly = y; draw(); }
      function endDrag(){ dragging = false; }
      
      wrap.addEventListener('mousedown', function(e){ var r = canvas.getBoundingClientRect(); startDrag((e.clientX-r.left)*canvas.width/r.width, (e.clientY-r.top)*canvas.height/r.height); });
      window.addEventListener('mousemove', function(e){ var r = canvas.getBoundingClientRect(); moveDrag((e.clientX-r.left)*canvas.width/r.width, (e.clientY-r.top)*canvas.height/r.height); });
      window.addEventListener('mouseup', endDrag);
      wrap.addEventListener('touchstart', function(e){ if (e.touches.length){ var t = e.touches[0]; var r = canvas.getBoundingClientRect(); startDrag((t.clientX-r.left)*canvas.width/r.width, (t.clientY-r.top)*canvas.height/r.height); e.preventDefault(); }});
      wrap.addEventListener('touchmove', function(e){ if (e.touches.length){ var t = e.touches[0]; var r = canvas.getBoundingClientRect(); moveDrag((t.clientX-r.left)*canvas.width/r.width, (t.clientY-r.top)*canvas.height/r.height); e.preventDefault(); }});
      wrap.addEventListener('touchend', endDrag);
      
      modal.querySelector('#t3cr-cancel').onclick = function(){ URL.revokeObjectURL(url); modal.remove(); };
      modal.querySelector('#t3cr-ok').onclick = function(){
        // Render circular crop at high res
        var out = document.createElement('canvas');
        out.width = 400; out.height = 400;
        var octx = out.getContext('2d');
        octx.save();
        octx.beginPath();
        octx.arc(200, 200, 200, 0, Math.PI*2);
        octx.clip();
        octx.translate(200 + ox*(400/canvas.width), 200 + oy*(400/canvas.height));
        octx.rotate(rot * Math.PI/180);
        var scale = Math.max(400/img.width, 400/img.height) * zoom;
        var iw = img.width * scale, ih = img.height * scale;
        octx.drawImage(img, -iw/2, -ih/2, iw, ih);
        octx.restore();
        out.toBlob(function(blob){
          URL.revokeObjectURL(url);
          modal.remove();
          cb(blob);
        }, 'image/jpeg', 0.9);
      };
    };
    img.src = url;
  }

  function bindCommentButtons(rows, container){
    if (!rows.length) return;
    // Load comment counts
    var queries = rows.map(function(r){
      return sb.from('comments').select('id', {count:'exact', head:true}).eq('target_user_id', r.user_id).eq('target_puzzle', r.puzzle).eq('target_solve_date', r.solve_date);
    });
    rows.forEach(function(r, i){
      queries[i].then(function(rr){
        var key = r.user_id+'|'+r.puzzle+'|'+r.solve_date;
        var span = container.querySelector('.t3-cmt-count[data-key="'+key+'"]');
        if (span && rr.count) span.textContent = rr.count;
      });
    });
    container.querySelectorAll('.t3-comment-btn').forEach(function(btn){
      btn.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        var uid = btn.getAttribute('data-uid');
        var puzzle = btn.getAttribute('data-puzzle');
        var solveDate = parseInt(btn.getAttribute('data-date'), 10);
        var time = btn.getAttribute('data-time');
        buildCommentsModal(uid, puzzle, solveDate, time);
      };
    });
  }

  /* ===== MESSAGES (DM) ===== */
  var dmRealtimeChannel = null;
  var currentChatPeerId = null;

  function loadConversations(cb){
    if (!session){ cb([]); return; }
    var uid = session.user.id;
    sb.from('recent_conversations').select('*').or('u1.eq.'+uid+',u2.eq.'+uid).order('created_at',{ascending:false}).limit(50).then(function(r){
      var convs = r.data || [];
      // Get profiles of all peers
      var peerIds = convs.map(function(c){ return c.u1 === uid ? c.u2 : c.u1; });
      if (!peerIds.length){ cb([]); return; }
      sb.from('profiles').select('id,username,avatar_color,avatar_url,avatar_type,country').in('id', peerIds).then(function(pr){
        var byId = {};
        (pr.data || []).forEach(function(p){ byId[p.id] = p; });
        convs.forEach(function(c){
          var pid = c.u1 === uid ? c.u2 : c.u1;
          c._peer = byId[pid];
          c._peerId = pid;
        });
        cb(convs);
      });
    });
  }

  function loadMessages(peerId, cb){
    if (!session){ cb([]); return; }
    var uid = session.user.id;
    sb.from('messages').select('*')
      .or('and(sender_id.eq.'+uid+',recipient_id.eq.'+peerId+'),and(sender_id.eq.'+peerId+',recipient_id.eq.'+uid+')')
      .order('created_at',{ascending:true})
      .limit(200)
      .then(function(r){
        cb(r.data || []);
        // Mark received as read
        sb.from('messages').update({read:true}).eq('recipient_id', uid).eq('sender_id', peerId).eq('read', false).then(function(){
          updateBellBadge();
        });
      });
  }

  function sendMessage(peerId, body, cb){
    if (!session){ cb({error:{message:'Not logged in'}}); return; }
    sb.from('messages').insert({
      sender_id: session.user.id,
      recipient_id: peerId,
      body: body
    }).select().single().then(function(r){
      cb(r);
    });
  }

  function subscribeRealtime(peerId, onMessage){
    unsubscribeRealtime();
    if (!session) return;
    var uid = session.user.id;
    dmRealtimeChannel = sb.channel('dm-'+uid+'-'+peerId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: 'recipient_id=eq.'+uid
      }, function(payload){
        var m = payload.new;
        if (m && (m.sender_id === peerId || m.recipient_id === peerId)){
          onMessage(m);
          // Mark as read
          sb.from('messages').update({read:true}).eq('id', m.id).then(function(){});
        }
      })
      .subscribe();
  }

  function unsubscribeRealtime(){
    if (dmRealtimeChannel){
      try { sb.removeChannel(dmRealtimeChannel); } catch(e){}
      dmRealtimeChannel = null;
    }
  }

  function buildDMModal(peerId, peer){
    closeModal();
    currentChatPeerId = peerId;
    var color = peer.avatar_color || '#ef4444';
    var initial = (peer.username||'?').charAt(0).toUpperCase();
    var avatarHtml = (peer.avatar_type === 'image' && peer.avatar_url)
      ? '<div style="width:32px;height:32px;border-radius:50%;background:url('+escapeHTML(peer.avatar_url)+') center/cover;flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box"></div>'
      : '<div style="width:32px;height:32px;border-radius:50%;background:'+color+';flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">'+initial+'</div>';
    var flag = peer.country ? countryFlag(peer.country)+' ' : '';
    var html = '<div class="t3-auth-modal" style="max-width:500px;height:80vh;display:flex;flex-direction:column;padding:0">'
      + '<div style="display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,.05)">'
      + avatarHtml
      + '<div style="flex:1"><a href="/u?u='+encodeURIComponent(peer.username)+'" style="color:#fff;font-weight:700;text-decoration:none;font-size:15px">'+flag+'@'+escapeHTML(peer.username)+'</a><div style="color:#22c55e;font-size:11px">● Online</div></div>'
      + '<button id="t3dm-close" style="background:none;border:0;color:#94a3b8;font-size:24px;cursor:pointer;padding:0 8px">×</button>'
      + '</div>'
      + '<div id="t3dm-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:6px"><div style="text-align:center;color:#64748b;padding:40px">Loading...</div></div>'
      + '<div style="display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.05)">'
      + '<input type="text" class="t3-auth-input" id="t3dm-input" placeholder="Message..." maxlength="2000" style="margin:0;padding:10px 14px"/>'
      + '<button class="t3-auth-btn" id="t3dm-send" style="margin:0;width:auto;padding:10px 20px">Send</button>'
      + '</div>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.querySelector('#t3dm-close').onclick = function(){ unsubscribeRealtime(); currentChatPeerId = null; closeModal(); };
    ov.onclick = function(e){ if (e.target === ov){ unsubscribeRealtime(); currentChatPeerId = null; closeModal(); } };
    var listEl = ov.querySelector('#t3dm-list');
    var input = ov.querySelector('#t3dm-input');
    var sendBtn = ov.querySelector('#t3dm-send');

    function renderMsg(m){
      var isMine = m.sender_id === session.user.id;
      var bg = isMine ? '#ef4444' : 'rgba(255,255,255,.06)';
      var color = '#fff';
      var align = isMine ? 'flex-end' : 'flex-start';
      var br = isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px';
      var div = document.createElement('div');
      div.style.cssText = 'max-width:75%;padding:8px 12px;border-radius:'+br+';background:'+bg+';color:'+color+';align-self:'+align+';word-wrap:break-word;font-size:14px;line-height:1.4;animation:t3slideIn .2s ease';
      div.innerHTML = escapeHTML(m.body) + '<div style="font-size:10px;opacity:.7;margin-top:2px;text-align:right">'+timeAgo(m.created_at)+'</div>';
      listEl.appendChild(div);
      listEl.scrollTop = listEl.scrollHeight;
    }

    loadMessages(peerId, function(msgs){
      listEl.innerHTML = '';
      if (!msgs.length){
        listEl.innerHTML = '<div style="text-align:center;color:#64748b;padding:40px">No messages yet. Say hi!</div>';
      } else {
        msgs.forEach(renderMsg);
      }
      // Subscribe to realtime
      subscribeRealtime(peerId, renderMsg);
    });

    function send(){
      var body = input.value.trim();
      if (!body) return;
      sendBtn.disabled = true;
      sendMessage(peerId, body, function(r){
        sendBtn.disabled = false;
        if (r.error){ alert(r.error.message); return; }
        if (listEl.querySelector('div[style*="No messages"]')){ listEl.innerHTML = ''; }
        renderMsg(r.data);
        input.value = '';
        input.focus();
      });
    }
    sendBtn.onclick = send;
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); }});
    setTimeout(function(){ input.focus(); }, 200);
  }

  function buildInboxModal(){
    closeModal();
    var html = '<div class="t3-auth-modal" style="max-width:480px;max-height:85vh">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h2 style="color:#fff;margin:0;font-size:18px">💬 Messages</h2><button id="t3i-close" style="background:none;border:0;color:#94a3b8;font-size:20px;cursor:pointer">×</button></div>'
      + '<div id="t3i-list" style="max-height:65vh;overflow-y:auto"><div style="padding:30px;text-align:center;color:#64748b">Loading...</div></div>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.querySelector('#t3i-close').onclick = closeModal;
    ov.onclick = function(e){ if (e.target === ov) closeModal(); };
    var listEl = ov.querySelector('#t3i-list');

    loadConversations(function(convs){
      if (!convs.length){
        listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b">No messages yet. Visit a profile and click "Message" to start.</div>';
        return;
      }
      var uid = session.user.id;
      listEl.innerHTML = convs.map(function(c){
        var p = c._peer;
        if (!p) return '';
        var color = p.avatar_color || '#ef4444';
        var initial = (p.username||'?').charAt(0).toUpperCase();
        var avatarHtml = (p.avatar_type === 'image' && p.avatar_url)
          ? '<div style="width:42px;height:42px;border-radius:50%;background:url('+escapeHTML(p.avatar_url)+') center/cover;flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box"></div>'
          : '<div style="width:42px;height:42px;border-radius:50%;background:'+color+';flex-shrink:0;border:2px solid #ef4444;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">'+initial+'</div>';
        var flag = p.country ? countryFlag(p.country)+' ' : '';
        var unread = !c.read && c.recipient_id === uid;
        var prefix = c.sender_id === uid ? 'You: ' : '';
        return '<div data-pid="'+c._peerId+'" data-puser=\''+escapeHTML(JSON.stringify(p))+'\' class="t3i-conv" style="display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;margin-bottom:6px;cursor:pointer;background:'+(unread?'rgba(239,68,68,.05)':'rgba(255,255,255,.02)')+';transition:background .15s">'
          + avatarHtml
          + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px"><div style="color:#fff;font-weight:700;font-size:14px">'+flag+'@'+escapeHTML(p.username)+'</div>'
          + (unread?'<span style="width:8px;height:8px;border-radius:50%;background:#ef4444"></span>':'<span style="color:#64748b;font-size:11px">'+timeAgo(c.created_at)+'</span>')
          + '</div>'
          + '<div style="color:'+(unread?'#cbd5e1':'#94a3b8')+';font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escapeHTML(prefix + c.last_body)+'</div>'
          + '</div></div>';
      }).join('');
      listEl.querySelectorAll('.t3i-conv').forEach(function(el){
        el.onmouseover = function(){ el.style.background = 'rgba(255,255,255,.05)'; };
        el.onmouseout = function(){
          var unread = el.querySelector('span[style*="#ef4444"]');
          el.style.background = unread ? 'rgba(239,68,68,.05)' : 'rgba(255,255,255,.02)';
        };
        el.onclick = function(){
          var pid = el.getAttribute('data-pid');
          var p = JSON.parse(el.getAttribute('data-puser'));
          buildDMModal(pid, p);
        };
      });
    });
  }

  /* ===== WEEKLY COMPETITION ===== */
  function getMondayOfWeek(d){
    d = d || new Date();
    var day = d.getDay() || 7; // Sun=0 -> 7
    var monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    return monday.getFullYear()+'-'+String(monday.getMonth()+1).padStart(2,'0')+'-'+String(monday.getDate()).padStart(2,'0');
  }

  function getOrCreateWeekly(cb){
    var weekStart = getMondayOfWeek();
    sb.from('weekly_competitions').select('*').eq('week_start', weekStart).maybeSingle().then(function(r){
      if (r.data){ cb(r.data); return; }
      // Generate 5 scrambles
      var scrambles = [];
      for (var i=0; i<5; i++) scrambles.push(generateScramble3());
      sb.from('weekly_competitions').insert({week_start:weekStart, puzzle:'333', scrambles:scrambles}).select().single().then(function(c){
        if (c.error){
          sb.from('weekly_competitions').select('*').eq('week_start', weekStart).maybeSingle().then(function(rr){ cb(rr.data); });
        } else cb(c.data);
      });
    });
  }

  function loadMyWeeklyAttempts(weekStart, cb){
    if (!session){ cb([]); return; }
    sb.from('weekly_results').select('*').eq('user_id', session.user.id).eq('week_start', weekStart).order('attempt_idx').then(function(r){
      cb(r.data || []);
    });
  }

  function loadWeeklyLeaderboard(weekStart, cb){
    sb.from('weekly_leaderboard').select('*').eq('week_start', weekStart).order('rank').limit(50).then(function(r){
      cb(r.data || []);
    });
  }

  function renderWeekly(){
    if (!session){ buildModal(); return; }
    document.title = 'Weekly Competition — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-weekly';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:900px;margin:0 auto"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px"><a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a><h1 style="margin:0;font-size:28px;font-weight:800">🏆 <span style="color:#a855f7">Weekly Competition</span></h1><div style="width:100px"></div></div><div id="t3w-content"><div style="padding:40px;text-align:center;color:#64748b">Loading...</div></div></div>';
    document.body.appendChild(page);
    var content = page.querySelector('#t3w-content');

    getOrCreateWeekly(function(comp){
      if (!comp){ content.innerHTML = '<div style="text-align:center;color:#ef4444;padding:40px">Could not load competition</div>'; return; }
      loadMyWeeklyAttempts(comp.week_start, function(myAttempts){
        loadWeeklyLeaderboard(comp.week_start, function(rows){
          renderWeeklyContent(content, comp, myAttempts, rows);
        });
      });
    });
  }

  function renderWeeklyContent(container, comp, myAttempts, rows){
    var weekStart = comp.week_start;
    var weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    var endStr = weekEnd.getFullYear()+'-'+String(weekEnd.getMonth()+1).padStart(2,'0')+'-'+String(weekEnd.getDate()).padStart(2,'0');
    var attemptByIdx = {};
    myAttempts.forEach(function(a){ attemptByIdx[a.attempt_idx] = a; });

    var html = '<div class="t3p-card" style="background:linear-gradient(135deg,rgba(168,85,247,.1) 0%,rgba(239,68,68,.1) 100%);border-color:rgba(168,85,247,.3)">'
      + '<div style="color:#a855f7;font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px;text-align:center">🏆 Week of '+weekStart+' → '+endStr+'</div>'
      + '<p style="color:#94a3b8;font-size:13px;margin:0;text-align:center">3x3 · 5 scrambles · Best AO5 wins (best+worst dropped) · Resets Monday 00:00</p>'
      + '</div>';

    // 5 scrambles with attempt status
    html += '<div class="t3p-card"><h3>This Week\'s Scrambles</h3><div style="display:flex;flex-direction:column;gap:10px">';
    comp.scrambles.forEach(function(scr, i){
      var att = attemptByIdx[i];
      var statusHtml = '';
      if (att){
        var t = att.penalty===2 ? 'DNF' : formatTime(att.penalty===1 ? att.time_ms+2000 : att.time_ms);
        statusHtml = '<div style="color:#fbbf24;font-family:monospace;font-weight:700;font-size:18px">'+t+'</div>';
      } else {
        statusHtml = '<button class="t3-auth-btn" data-idx="'+i+'" style="margin:0;padding:8px 16px;width:auto;font-size:12px">Submit attempt #'+(i+1)+'</button>';
      }
      html += '<div style="background:rgba(0,0,0,.3);border-radius:10px;padding:14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">'
        + '<div style="background:rgba(168,85,247,.2);color:#a855f7;font-weight:700;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">'+(i+1)+'</div>'
        + '<div style="flex:1;min-width:0;font-family:monospace;font-size:14px;color:'+(att?'#64748b':'#fff')+';word-break:break-word">'+escapeHTML(scr)+'</div>'
        + statusHtml
        + '</div>';
    });
    html += '</div></div>';

    // My result
    if (myAttempts.length === 5){
      var myTimes = myAttempts.map(function(a){ return a.penalty===2 ? null : (a.penalty===1 ? a.time_ms+2000 : a.time_ms); });
      var dnfCount = myTimes.filter(function(t){ return t === null; }).length;
      var ao5Display;
      if (dnfCount > 1){ ao5Display = 'DNF'; }
      else {
        var sorted = myTimes.slice().sort(function(a,b){
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        });
        var middle = sorted.slice(1, 4);
        if (middle.indexOf(null) >= 0){ ao5Display = 'DNF'; }
        else {
          var sum = middle.reduce(function(a,b){ return a+b; }, 0);
          ao5Display = formatTime(sum/3);
        }
      }
      html += '<div class="t3p-card" style="text-align:center"><h3>Your AO5</h3><div class="t3p-stat" style="color:#a855f7">'+ao5Display+'</div></div>';
    } else {
      html += '<div class="t3p-card" style="text-align:center"><h3>Progress</h3><div style="color:#94a3b8">'+myAttempts.length+' / 5 attempts submitted</div></div>';
    }

    // Leaderboard
    html += '<div class="t3p-card"><h3>🏆 Weekly Ranking ('+rows.length+' players)</h3>';
    if (!rows.length){
      html += '<p style="text-align:center;color:#64748b;padding:24px">No complete AO5 yet — submit all 5 scrambles to qualify!</p>';
    } else {
      html += '<div>'+rows.map(function(row){
        var rank = row.rank;
        var rankClass = rank===1?'gold':rank===2?'silver':rank===3?'bronze':'';
        var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'#'+rank;
        var color = row.avatar_color || '#ef4444';
        var avatarHtml = (row.avatar_type === 'image' && row.avatar_url)
          ? '<div class="t3lb-avatar" style="background-image:url('+escapeHTML(row.avatar_url)+')"></div>'
          : '<div class="t3lb-avatar" style="background:'+color+'">'+(row.username||'?').charAt(0).toUpperCase()+'</div>';
        var flag = row.country ? countryFlag(row.country)+' ' : '';
        var ao5 = row.ao5 ? formatTime(row.ao5) : 'DNF';
        var isMe = session && row.user_id === session.user.id;
        var bg = isMe ? 'background:rgba(239,68,68,.05)' : '';
        return '<div class="t3lb-row" style="'+bg+'"><div class="t3lb-rank '+rankClass+'">'+medal+'</div><div class="t3lb-user">'+avatarHtml+'<a href="/u?u='+encodeURIComponent(row.username)+'" class="t3lb-username">'+flag+escapeHTML(row.username)+(isMe?' (you)':'')+'</a></div><div class="t3lb-time">'+ao5+'</div></div>';
      }).join('')+'</div>';
    }
    html += '</div>';
    container.innerHTML = html;

    // Bind submit buttons
    container.querySelectorAll('button[data-idx]').forEach(function(btn){
      btn.onclick = function(){
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var time = prompt('Enter your time for scramble #'+(idx+1)+' (in seconds, e.g. 12.45):');
        if (!time) return;
        var ms = Math.round(parseFloat(time) * 1000);
        if (isNaN(ms) || ms <= 0){ alert('Invalid time'); return; }
        var penalty = 0;
        if (confirm('Add +2 penalty?')) penalty = 1;
        else if (confirm('DNF?')) penalty = 2;
        btn.disabled = true; btn.textContent = 'Saving...';
        sb.from('weekly_results').insert({
          user_id: session.user.id,
          week_start: weekStart,
          attempt_idx: idx,
          time_ms: ms,
          penalty: penalty
        }).then(function(r){
          if (r.error){ alert(r.error.message); btn.disabled=false; btn.textContent='Submit attempt #'+(idx+1); return; }
          renderWeekly();
        });
      };
    });
  }

  /* ===== PLL DATA ===== */

  // 21 PLL cases. Setup = scramble that produces this case from solved.
  // Algs: array of strings (multiple variants). difficulty: easy/medium/hard. probability: "1/n"
  var PLL_CASES = [
    {id:'Aa', name:'Aa Perm', setup:"x R' U R' D2 R U' R' D2 R2 x'", probability:'1/18', difficulty:'easy',
      algs:["x R' U R' D2 R U' R' D2 R2 x'", "y x' R2 D2 R' U' R D2 R' U R' x", "R' F R' B2 R F' R' B2 R2"]},
    {id:'Ab', name:'Ab Perm', setup:"x R2 D2 R U R' D2 R U' R x'", probability:'1/18', difficulty:'easy',
      algs:["x R2 D2 R U R' D2 R U' R x'", "y x' R U' R D2 R' U R D2 R2 x", "R B' R F2 R' B R F2 R2"]},
    {id:'E', name:'E Perm', setup:"x' R U' R' D R U R' D' R U R' D R U' R' D' x", probability:'1/18', difficulty:'medium',
      algs:["x' R U' R' D R U R' D' R U R' D R U' R' D' x", "x' L' U L D' L' U' L D L' U' L D' L' U L D x"]},
    {id:'F', name:'F Perm', setup:"R' U' R U' R' U R U R2 F' R U R U' R' F U R", probability:'1/18', difficulty:'hard',
      algs:["R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", "R' U R U' R2 F' U' F U R F R' F' R2"]},
    {id:'Ga', name:'Ga Perm', setup:"R2 U R' U R' U' R U' R2 U' D R' U R D'", probability:'1/18', difficulty:'medium',
      algs:["R2 U R' U R' U' R U' R2 U' D R' U R D'", "R2 u R' U R' U' R u' R2 y' R' U R", "R2 U R' U R' U' R U' R2 D U' R' U R D'"]},
    {id:'Gb', name:'Gb Perm', setup:"R' U' R U D' R2 U R' U R U' R U' R2 D", probability:'1/18', difficulty:'medium',
      algs:["R' U' R U D' R2 U R' U R U' R U' R2 D", "F' U' F R2 u R' U R U' R u' R2", "R' U' R y R2 u R' U R U' R u' R2"]},
    {id:'Gc', name:'Gc Perm', setup:"R2 U' R U' R U R' U R2 U D' R U' R' D", probability:'1/18', difficulty:'medium',
      algs:["R2 U' R U' R U R' U R2 U D' R U' R' D", "R2 F2 R U2 R U2 R' F R U R' U' R' F R2", "R2 u' R U' R U R' u R2 y R U' R'"]},
    {id:'Gd', name:'Gd Perm', setup:"R U R' U' D R2 U' R U' R' U R' U R2 D'", probability:'1/18', difficulty:'medium',
      algs:["R U R' U' D R2 U' R U' R' U R' U R2 D'", "R U R' y' R2 u' R U' R' U R' u R2", "f R f' R2 u' R U' R' U R' u R2"]},
    {id:'H', name:'H Perm', setup:"M2 U M2 U2 M2 U M2", probability:'1/72', difficulty:'easy',
      algs:["M2 U M2 U2 M2 U M2", "R2 U2 R U2 R2 U2 R2 U2 R U2 R2"]},
    {id:'Ja', name:'Ja Perm', setup:"x U2 r' U' r U2 R' F R' F' R2 x'", probability:'1/18', difficulty:'easy',
      algs:["x R2 F R F' R U2 r' U r U2 x'", "L' U' L F L' U' L U L F' L2 U L", "R' U L' U2 R U' R' U2 R L"]},
    {id:'Jb', name:'Jb Perm', setup:"R U R' F' R U R' U' R' F R2 U' R'", probability:'1/18', difficulty:'easy',
      algs:["R U R' F' R U R' U' R' F R2 U' R'", "R U2 R' U' R U2 L' U R' U' L", "y R U2 R' U' R U2 L' U R' U' L"]},
    {id:'Na', name:'Na Perm', setup:"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", probability:'1/72', difficulty:'hard',
      algs:["R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", "z U R' D R2 U' R D' U R' D R2 U' R D' z'"]},
    {id:'Nb', name:'Nb Perm', setup:"R' U R' F R F' R U' R' F' U F R U R' U' R", probability:'1/72', difficulty:'hard',
      algs:["R' U R U' R' F' U' F R U R' F R' F' R U' R", "z U' R D' R2 U R' D U' R D' R2 U R' D z'"]},
    {id:'Ra', name:'Ra Perm', setup:"R U' R' U' R U R D R' U' R D' R' U2 R'", probability:'1/18', difficulty:'medium',
      algs:["R U' R' U' R U R D R' U' R D' R' U2 R'", "R U R' F' R U2 R' U2 R' F R U R U2 R'"]},
    {id:'Rb', name:'Rb Perm', setup:"R' U2 R U2 R' F R U R' U' R' F' R2", probability:'1/18', difficulty:'medium',
      algs:["R2 F R U R U' R' F' R U2 R' U2 R", "R' U2 R U2 R' F R U R' U' R' F' R2"]},
    {id:'T', name:'T Perm', setup:"R U R' U' R' F R2 U' R' U' R U R' F'", probability:'1/18', difficulty:'easy',
      algs:["R U R' U' R' F R2 U' R' U' R U R' F'"]},
    {id:'Ua', name:'Ua Perm', setup:"R U' R U R U R U' R' U' R2", probability:'1/18', difficulty:'easy',
      algs:["R U' R U R U R U' R' U' R2", "M2 U M U2 M' U M2", "R2 U' R' U' R U R U R U' R"]},
    {id:'Ub', name:'Ub Perm', setup:"R2 U R U R' U' R' U' R' U R'", probability:'1/18', difficulty:'easy',
      algs:["R2 U R U R' U' R' U' R' U R'", "M2 U' M U2 M' U' M2", "R' U R' U' R' U' R' U R U R2"]},
    {id:'V', name:'V Perm', setup:"R' U R' U' y R' F' R2 U' R' U R' F R F", probability:'1/18', difficulty:'hard',
      algs:["R' U R' U' y R' F' R2 U' R' U R' F R F", "R' U R' d' R' F' R2 U' R' U R' F R F"]},
    {id:'Y', name:'Y Perm', setup:"F R U' R' U' R U R' F' R U R' U' R' F R F'", probability:'1/18', difficulty:'medium',
      algs:["F R U' R' U' R U R' F' R U R' U' R' F R F'", "F R' F R2 U' R' U' R U R' F' R U R' U' F'"]},
    {id:'Z', name:'Z Perm', setup:"M' U M2 U M2 U M' U2 M2", probability:'1/72', difficulty:'easy',
      algs:["M' U M2 U M2 U M' U2 M2", "M2 U M2 U M' U2 M2 U2 M'"]}
  ];

  var PLL_IMAGES = {
    'Aa': "data:image/png;base64,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",
    'Ab': "data:image/png;base64,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",
    'E': "data:image/png;base64,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",
    'F': "data:image/png;base64,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",
    'Ga': "data:image/png;base64,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",
    'Gb': "data:image/png;base64,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",
    'Gc': "data:image/png;base64,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",
    'Gd': "data:image/png;base64,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",
    'H': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4AeydC7RcVXnHf3OTENIkBEhQIggbWipKeQQEeahcwFWgYJRaC6sgj1ahFQpmQaEoi+eSiiIgCgK1VURrrFAKlAKlwY2lBJCH2CIIFneQCNSQCAmYkOSO/2/OnJm5l7mTeZ0z997Zc/e333v/9/ft/9ln3zmPGSB+ogUysEAkVgZGjV1CJFZkQSYWiMTKxKyx00isyIFMLBCJlYlZY6eRWP3CgZz1jMTK2eD9AheJ1S8znbOekVg5G7xf4CKx+mWmc9YzEitng/cLXCRWv8x0znpGYuVs8CrcxI6NBWL9o0zsc5JFwvmQ5DZJXph3COsIiWHnhXmD8Hrqek2s3aX9CZL9c5IDhWN4hyvMC/MQYR0rMey8MI8R3gGSnrleE2vfkua2Zj2lWJZyk/pPXCEJblXwasZyr/ovucTOX1c8Sx2t7+8JI3GJbZN47n6icO6wFcB9SrFdSn623q9Hdr/5yIwM0hWMxM5vGkMGkO9Un5Mpyk9sq0gvXKJwL5ANs8C+/J4iMyRZu+qkTkqgKpOeJDPxKxgblbqvjqGUzMSbrF53pqA/O+0q0RvXS2LN0XHl2I18PtVJnZIAzk6CTP2Z6r0gYap5vFLys/fMpkXscN0he7D6CL0k1n6lIe1a8rP3qsSaBlN0qlAwHDWj1OwhdTxdAtUxkOmnatOenQ4HMlWwceeJ0nZ0Na7XndLqpOpIni1idafbDfcyx2y8SaledQylZGZe3xNrqk6Gv5uZeYd3XD0N6fxUmuzh5ZmlbJ81sDkF1pIXseYCm8q2kBy85P+xoyl/VBiQod/DPAqKkcvHJrXA61CYA5uT38ewhmxD9zI2BnL67Cnbws5C21iSuxvIHTEBnKfjaSq7Jolc/GTFWg7FWfkTS5Nc5GWSMeSibtm2Nr89+T7LgPNRdDhKskTntb8y7BUU9SdiUegBsWwEK1mBbeQtnr1UD9rE1tkjDkPoL2LBqkR7Oz0lsez9CtbrvEJ+9raToA4h6ddXxDqAraXyZpIGrmtF9j/gqtKk2vfS6rYy2Ypn7SpYu2HjsKtIWUNa/7azMm0L2DVKy8lV8juCErXsi8LLFJ3L8/J3zEnMwDapUKbypwVs3wDkIacIq+QShu2leF56/0RYRabJP12Sq8uaWNtJm6MkX5I8JLFT0QKF0eVoAU3ypYJ7WHKJxG7heYvCTJ0wu9b/76gnuz51tsJbJC9JnpV8R3JqocCeO22FXclSMro8LWD/MbwDdteW60zh/ovkJV0wXapwoeQ0ie3DkuuZSnTDdUIs+27meA3iGsmjkpUSu5HtYoXzN5vOFofrv76LPgKLzoJXVOvhC1RS49asgTxkcLAGVNFttskH13QzLEFW3OBgftgVUEU0MYUlCm+W2EbgIHjbpvBRJa+Q3C8irCrAYsVtq/KnCmUl+W069ddmS7DTm91hdNKkAebt4Rj4pEb7zRPhp1pwl19N4Tad9M6ZDwe+C2ZuXB9nii4JZy31kLPGTPvvFXY9XF3Lwk4pZ6jQliqdTgZ+qPhXJVohpuwCe4tcmjW+qyzjoZ1CFW3ddUKsTWdNY+he0X/VdWCr0VXHwsd0afn3t2x9ILFFbyxgV9SOFLQx6PsK7fz4bwpFQjuDtn13RGvEEmCtW72Wwvt18t5Yq05t/mjxYvKf2WjFMX8MWMBOLPZV/RugxYu2+dF2Q+InWqCBBSKxGhgnFrVvgUis9m0XWzawQCRWA+PEovYtEInVvu1iywYWiMRqYJw+LupY9Uisjk0YO6hngUiselaJeR1bIBKrYxPGDupZIBKrnlViXscWiMRq0oS33gomTVbv+2qRWE1S4IILwKTJ6n1fLRKrCQpcfjk89lgiFm+iSderjLcOI7E2MGPLlsGFF1YrWdzyqjkxVs8CkVj1rFKTZ0R6peZBU4tbXk2VGK1jgUisOkZJsx56CL7ylTRVDS3Pyqo5MTbSApFYIy1Sk260WW9UVtNF30YjsUaZ+oUL4b77YOZMKNi9lCQfi1uelVmdJDf6Iy0QiTXSIuX0UUeB7adMttqqnKnA4pZnYnWUFV0dC0Ri1TFKU1mxUkMLRGI1NE8sbNcCkVjtWi62a2iBjog1ULOpbYhSLrSNbzlaCg4+GA48MHspgY3wWsH91a+qjS3eSttqy2qslfbt1jXbVhHzj3VErDXrKHx7MVx5N5x/M5xyA/zZV+HgL8C7z4Ptz4BZfwmF4xKZ9nGGfbwH78F78B68B+/Be/AevAfvwXvwHrwH78F78B68B+/Be/AevAfvwXvwHrwH78H7YbA89xx4D96D9+A9eA/eg/fgPXgP3oP3ySPxaQ/22Lz34D14D96D9+A9eA/eg/fgPXhPCStta6H34D14D96D9+A9eA/eg/fgPXgP3oP34D14D96D9+A9eA/eg/fgPXgP3oP34D14b2hVORTWHwJvHA7Fo5X915JzJbpaxfUK7ceF9E8wTyj+gmQt2LKxnjY/nRBr3VARjrkGTvsWXPCvcNV/wncegP/4X3h0CW8sWcaLr/6G/9HY7Lc/blf4S0l0PbDAj+BFfd979/3wg7vgCX2b8tJVItpFGssCiY595it8n2QniaZWPvY0tIUtSyfEukRo35DY+xtMjPj2zL+9aWbR5CJPStZN0sKlOvbKgMMUvk0SXW8sYF+a2Bzsr7VoWwZYo2HYQW+/SmZzJq5hc5jOqYWWVrXWXSfEstffHC/IE8py3Az46Nvhg/PgIDF/Vx0BW/8FTD9TFc6SjHz7l72JpXsCjfoSfMU1qlevbJKOjrSxxevVaZSXtrWwUb1ulxleKp/RZJz3YThXcvIHmHHke9jmD3dmj923ZXCb2fzRjKnYm2ds4Urn1ELLS7toKeyEWDOmw9CDgntaskyircvA4zBgh8CNSl8n+ZzkbyVGrDMU1rpnnoEQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQtGRuX4uaxEOAECAECAFCgBAgBAgBQoAQIASYOzdpY77FQ4AQIAQIAUKAECAECAFCgBAgBGsxXLbXWEKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUIAs20tsr315/wjtGWRXHkMfFt73zs1IY9cyKQllzFl5XVMWq816qUvw5OatGlTsLOhrjvU9tJ8vBNiYRs8ex3JHOE105GNVFWjG6MWGCjAWzaBHXUgrU8mq5lpratN2w3r9hYzowXKFojEKhsiBt21QCRWd+0ZeytbIBKrbIgYdNcCWRKruyONvY0rC0RijavpGj+DnXDEGo93dY7HMW+I4hOGWPZww2G6YHHSSRtSeeyV25ht7KbD2BtdeyMa98SyZ/xOPRX23hvuuKM9I4yFVjZ208F0MZ3Gwpg6GcO4JpY9lbyDvvq3x7FSI6xaxZuuGS5enJYm4dKlb67T6DrdC3YfSdIUizeqO7LMsMpNS4GNZWQdG3OpUJ7pYjqZbkqOWzcuiWUv59hjDzhdV7XtoYZa69u75J9/HmrF7qGqrbN+/fDy2rr14lY/bW/xenVGy7P6aVsLbSwj69qYrSwV08l0Mx1N1zR/zIZ1BjYuiVVHj5g1xiwwLok1fz488gh88Yswa9Zwi9rtz1tvDbUyderwOnbrS235huJWP+3B4huqX1tu9dO2FtpYasstbmO2slRMJ9PNdDRd0/zxFI5LYqUGXrAguT3klFPSHJgxg9LtwHb7cSr77FMtt5g9G5iWNRParTLWzsTizbRJ6xiWtUvFxpKWpaGNOS03XeyWF9MtzRuP4bgmlhl8zhy48kp44AE49FDLGZ9iYzcdTBfTaXxqUR31uCdWqspee8Htt8O116Y54ye0MdvYTYfxM+rGI50wxErVHI+PvY/HMaf2Hi2ccMQaTdH+yu+9tpFYvZ+DCTmCSKwJOa29VyoSq/dzMCFHEIk1Iae190pFYvV+DibkCDoiVquNCxPShBNaqZ68u2HVaihsDqTydli/C6w9QKE9m32iyuwp6M8rtKeib1JY6+z2EOfAOXAOnAPnwDlwDpwD58A5cA6cA+fAOXAOnAPnwDlwDpwD58A5cA6cA+fg2WdrUZO4c+AcOAfOgXPgHDgHzoFz4Bw4R+lWmaRVEncOnAPnwDlwDpwD58A5cA6cA+fSVlQiNhbnwDlwDpwD58A5cA6cA+fAOXAOnAPnwDlwDpwD58A5cA6cA+fAOXAOnAPnwGxbAVVkoa5MfPluSi9vOfVbcPQ1cMilsNf5sN3pDG1yEkPpW4EsfGMdtg6sVNO2XKuLTi2ILqTwDcBeCGJy/Wtw4/Pw74+DvwcevRl+8TVY9TlVMoLVXNJTDm+6ppdeO8siLAGWvVb7r731xeKtti/DloJW23ZSvwRY9k7QRBih7HVTVy/itRsf4vl7nuTxh3/OorCM21au5p9V1V4CYnNpYnN7hfLacp0Qy17HcLxQKy8FUfxIyYckB+mK/R8wwEaSJUrb25puVxhfYyQj9MgtFa7Nwb3rh3h23Xomr1vHO4twkPJtzo5SeJwknU+bW1sPlNW664RYk6ZOpvj9s8FkkWj2PS1J12pYF+s8uOAQNvrYfrz18F3Zab8d2H+Ht3LwZtOZa+8HaH2YsUUXLLCV+jhMsv9M2Fnbli13hY20beEjyvyE5G8kmkZMysSYrKy2XLl9W21LjQZ3BJMD3wV/siecOAhnHw6Xiv9f/zjc8im47xwKT3+eyUuvoGAvays1lDc4qLY5ieAqzm4NHhxsHtvuoUobW3xwsPm2hpW2tXBwsPm2g4Od1TU8k0nyfiD5qcTeemmnkMcU13aFmxT+vcRedqY1okQqI5YYpcWstM9SaeuuY2K1DlltcdddcI+0y1qqiNVYK5hbbFFtZ/FW2lZbVmOttG+3rtk2RVyvyA4SU8NIpmizrm1+tN2w2ZHFev1pgb4lVn9Od35aR2LlZ+u+QorEGmW6Fy6k9KCGPdhQ+2ygxS3PxOqM0rzvsyOxRqGA3dX53vfCSn33XPvcn8Utz8qszijN+z47EqsBBc47b/TCRmWjt+qfkkisBnNtDzfY41gjq1ielY3Mj+mqBSKxqraoGzv33GSvlRba3sry0nQM61tg7BCr/vh6nmvP+NUSyeKW1/OBjfEBRGI1MUH2VPK8eWBi8Saa9H2VSKwmKWCbdZMmq/d9tUisJilgL+cwabJ631eLxOp7CmRjgEisbOza971GYvU9BbIxQANiZQMYe+0PC0Ri9cc8565lJFbuJu8PwEis/pjn3LWMxMrd5P0BGInVH/Ocu5aRWLmbfOwBZjGijohlD54t/hmsXtvc0AqF5urFWr2zwGpB/1BSfhtIOVBGi64TYv3MXhyx70Uw/RMU330enPxNuOG/4ekXWxxFrN4zC/yfkL8rsaeg7anorRU/WLKO0sOqv6DNTyfE+pQwt5UcNVTkS48u4cFr7mHtsdfBO86C2Z9kGsOwywAABEtJREFU6IOXw2dvhUU/gZU6FOx+cdUf5tZqtctahgGWE1ljpv2X4YYFaVmW4TDAcmKVwnsll0rsJRvbQ3FPxf9K8g+Sx2FIS5Q9JH21kvbuhjMVtuU6IZYBPifPCL9ApNlbBJuh9L6S05e/xo13/phfnnMTfOASmHUS7H6uSmqcPa6eh3hfA6qovcElD1zDMCxBVpz3YPl5SAVUkfdLbBU4QuHFkrslv4b/V3CL5NOSQclMye6SkyXXS16XtOU6JdZI0DeUsVhymeTIdUPYiyjmKv7H2o994akXeDC+FETW6IF7BtZpDh4QtL1+yhas7RTfUvJhyd9JbDFrm0hqP8x1m1jDOi8nbMd1s+K2rNqqdrri0eVrAVuk7Gxivyp0mqDtXVhBYWYuD2KNHLxWs8JvYDfg1ZzEztiCguUl/7Pyn8pJzhJO4lZQ2g+/wgb17ppd7OTHUgF+RrJGkpvrBbGkXFE7jR8rFL/kZ+/st+dK33XYxhS0uSCvj+hUhnoSNtHeuDSOclaWwcvq3F5YhGxN7p8eEQvtw2RjfkQ+H5vMTQ1wegkvT2JVsbQxnm0DKQ0he+/BFEK2TqP5hT0klilpX8VZmIfMNl01ucKqTrYSGbsEq0jpPcB5Eqti274ilh1OWkEqypP9ZzNBDGwur0gy2eTyMawC5gvbxkBOH7NtwfZVeZ0WhullR/GwjJwSK4XzBDyoI1mxXJzmleIc7Z+XY9NMTh/DKrIMitPAxpAHro5ZHpJti/b1giXyAB2G0Sti2SC0RL+oPYdtMi2ZtdhqUZxCUf8ZVjfUWYPCCmxi7UASlo1BQeZO/yewWra1vWzmYHUBekwsG9N95uUgldXi1fJkt4DZQdUVWiPhtaSHyhiSZGa+nQZLnevgLYW5e70kli3TUrhiBMWzdJVJXcVy8tHbvk1ZVyKWxaRcZQyKZ+kqNr0/S5RGfedj4Poj0FeUBV0XrRihfq2u5VZOQ2vQ7iNdQ7rWfb2ObH+V5OtSu0UqY7BEhmI2LfxcANrbye+B6yWxpG7xv+BRTbNtQ5TM1FVWC7uemc+XpCsqCtkbsZWYLcna2XZOxyzFnq1WpmGPiWWbyzXaZNq38DacLKVCrITF1dUkO9A3YVTGkB0mD6d992x/ZQPoNbHKR5Xd1LGJxpOl2M/FCAISYtnvfOyodJby5+p/mHufUlnqaH1X9CzbVpA9cL0m1iLp/E8Su2UjD7lHWParVncqzAPPMG4Tlt1HZ9iWzkO+JszkuqgivXC9JpbpfLQ8u8msFWm3rv3Sld3YdmiOmPOFdavEsNsdd6vt7DeXBNk7NxaI1TvtI3JmFojEysy0/d1xJFZ/z39m2kdiZWba/u44Equ/5z8z7SOxMjNtf3fcNWL1txmj9iMtEIk10iIx3RULRGJ1xYyxk5EWiMQaaZGY7ooFIrG6YsbYyUgLRGKNtEhMd8UCkVhdMWM/ddKcrr8FAAD//41N/vEAAAAGSURBVAMAiO9ipc1GPGUAAAAASUVORK5CYII=",
    'Ja': "data:image/png;base64,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",
    'Jb': "data:image/png;base64,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",
    'Na': "data:image/png;base64,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",
    'Nb': "data:image/png;base64,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",
    'Ra': "data:image/png;base64,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",
    'Rb': "data:image/png;base64,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",
    'T': "data:image/png;base64,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",
    'Ua': "data:image/png;base64,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",
    'Ub': "data:image/png;base64,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",
    'V': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4AeydCZQkRZnHf9UzgDAzTAOjMOiTUB8K3jNcAm8lBHdBBa/1XETUVVEucXU9EEFWZT1YD1DU1fVYVsEVFgHXhaeD4QWOx3Aoh8rDAB0BHzPTwgwwR3fv/6vs6qqu6W6qqyujuqjIji/jqMz4R3zfPyMiIzOjB8hb1kAJGsjEKkGpOUvIxMosKEUDmVilqDVnmomVOVCKBjKxSlFrzjQTq184kLiemViJFd4vcJlY/WLpxPXMxEqs8H6By8TqF0snrmcmVmKF9wtcJla/WDpxPTOxEiu8DvfwDs0FYn1ZKg6JZIVwXiS5XJIK8/+E9RKJYafCPF94XXXdJtZy1f71kkMSyaHCMbwj5afCPEJYr5UYdirM1wjvOZKuuW4T66Ci5pfKu7dk+ZHyr7qK7S/Rbm3JYk2UIMwVev6KgreULN9S/oUb020RSb0vKpwatY53YBHct/BK3RuN6gA714OlhRowCj0PlQZVz3hvBeczqv2YbhXqgisq3AXgArKiq8o0saiIlrofJ9Y8g2kwukVLkQaMbasAKYg1X0hPo6I/63YV6Y7rJrGWwKiD/RLVfJxY2xhgg9EtWorY5VIpct6u6v21ui9/90xBjLJQ+z0lXXHdJNbBRY2TE2t7MWt0+wK8cV9KeBcYUcYLJJCixULbMySF61p32E1ijVU6ObEWytijhd7L3wvLdLxjFSkTq6qGsnci1iNk4L3KxhnLf92Yz6IxY9fipfrW5YpZO2vMs5lUxFoKDHZ3AK86041NuJUD4AANQRRMUgIbY1XuF+CSnZPgFSCGpb5QXGYNqYiFtv1EZXiaQo+QJHeprNpcsWUwqgHtfs3pJcatxaqsVRO5eKcSUZqzHsOqqP1YQ6rBuxWiGGeZfXXnbQlpxYDTIhZo6gYtkJJYa8SpkWqzZa2IoaeQBqz7WFcdyKeAhYJYhjWmawumky4Ta/90NcUaK9YbYIOxLVqqNGDdrxYrnb6tE1S/r8r1FbH0HGsP1dmGHvKmcJ1LVmPFvWZUm42lwdidg5gipwasZ1ItxhQHdjrZRlZW2wr2jLLTuT9kfqbshzyogwdoXMUnlJ/uW26XZ3fhKWSxsMyqVIc8pylmBk8hJwtrzBkcWCNtN8Ip5CYhj2JTdu9QKKkrm1iPU21eJfm05OcS64reLj+7hBqQkc8W3C8lH5XYKzyPkl+qE2bH8t9BOdnzqffKt9cV7pZ/m+QCycnq7vfTRWpPshTNLqUGNN3Bk2C5bPAu4f6P5G49MF0t/0LJ2yQ2DiueZyrSCTcbYtkA6XUqxOclqyT3SexFtrPkv3AQHnm4AqdKvi2xju8H8hvdxo2QQrxvRIXHPjYNrtXNsBrRvU+H3Ygrw1TMBva6kNnkMNhdNnq5jvmU5GoRYb2Id43CNlR5hXxpSfs2nfJr80yw7s3eMDpOmSzTc8+Bf1RWn5P8QqKmqmJN1TsVfrbEnojK28ptowd3ZctWoEooG7OWv6C2crXfyvS3AlWC2cC6FLOJNVWy0YDZymymFmKbp8OzRC4bqnxThxsPrQtVcOZOnJj5SWNnDGrYPfIdRaxNvUr+xyWvlDxBkl1vaMBsZTYzBlmPYrY0m4qE1oO2/XbEzIjVpKsHwV6owm71aGGr3pe1cFw+pHsasFkKm6rfBGq8aJsfbZ9I3rIGptFAJtY0ysk/ta+BTKz2dZfPnEYDmVjTKCf/1L4GMrHa110+cxoNZGJNo5w+/mnWVc/EmrUKcwaTaSATazKt5LRZayATq0UVnqUnoD/7WYsH58Pan1ntN93tthscpCnpJUvgFXpE+zk9YPvtb/tNC63XN7dYLerq0LH3MNeuhYsughNOgL33hic+EY47Di7UU937728xsz44rGeJdd55cO216SzkHDz5yVvj3XorfPGLcMMNsMMOW//eryk9S6wDD4R99oFHPxqOOQa+/GWIsVwz1lqtZpRTTgEbgzWndzLea3n1LLGWLYOlS+HOO+HrX4c3vhEe/3h46lPh5JPhkkvgrx3+ju85z5ncvOefD0NDk//Wr6k9Sywz2GQtyE03wWc+A+eeC/M7/CL0ZHhWjjVr4AlPgKEhi2UxDQzYrldlqhbE7t4uvxwWFGu8dKx6ixfDwWNr5Nid4UCD9tatK8i13j4X6Rhi72bUoJreq8RULciNN0JZBjbM97ynuAv8znegmVzWHZeF3UsW6mliOTf5nZqNrWwq4G77TqjD1jj88PpA/YgjoJlc99xDdazX7+TqaWIZZ6wFMd+6P+uqLGwyNFTMM3WaXIZj+dfEyLVixcSWK5NL+qgpqFd9G2d5D1deCbfcAoOD9ZoMDRXk2rSpntaxUENGhxwCU5FrxD5JaDi2X4IPixarNlDfdVe4+WYYHKybb2gIfm7fYNeTSglNRa4//7kUuDmfac8Ty7q/xru/yci1ZUsaO9TINW9eHS+3WHVdtByaKSsrTTnbQNjGSJ2WV7+6GNRPN4/VacxafmeeCU9/OlSaK0t9qx1bpm+6rSOmD82UGxNKqKFLxf4RwheUaqtN2MIAb1L47yX2zFaT49hiRbbMiokmyvVL3YUAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhQAhw9dUwVUt1xx0QAoQAIUAIEAKEACFACBAChAAhQAgQAoQAIUAIEAKEACFACBAChAAhFM8wR6f4iDIECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCqOvZQs+DYd3EbjoSRo9WwkmS0yWflHxNomk/fiJfMzXoYQabwS6NYdrcZkOsLTYuPU7AtgqIEetLCl8ssS9qr4dNf4S77oNfK+mHkv+V9OmIQzXvsrtOttBQ83u63n6k+5wbL4S7PysbfVDlsm/qj5X/QsnfSJ4iGbsuzMSKzdzNhljGpa8K0tZvMDHi2zf/l4rqK9QN3Tx/HlvmDaAneOi+iRfo2N0l2XVHA3pcX7XBISMD7DE8wMbRSvWi12QJtjqQuIbZsGZT8y3eVmlnQyxb/uZ1QrX/pmVy7KJH8HK3hKP2fRyHHbo3z3jZ/jzm+MNYcPqL4QzJ++ySoL7ZSiydE6qryEyVXx21HrJZ88c8ZvrzpspvJul1xHooBXYdTaG3SE6UnCD5BxbyfB7LwezD3nh25/nsgK08cyxQs6n5lkY722yItXDBdozc/BH4ix76Dovf936BgT/8GwM//wBc8U74uipzzmvgzJfABySnNRHr97+HGCFGiBFihBghRogRYoQYIUaIEWKEGCFGiBFihBghRogRYoQYIUaIEWKEGIuZ8MmUY3dsNkO+ciXECDFCjBAjxAgxQowQI8QIMUKMECPECDFCjBAjxAgxQowQI8QIMU6GWqQZ9oMPUp17ixFihBghRogRYoQYIUaIEWKEGCFGiBFihBghRogRYoQYIUaIEUy3BdLY/q3yT5ScJDlNcrbExi6XMI+r2IZV8vUAn58q/buS7bDecJFCbbnZEIstw1T20oj8kYIfUP/3UCWYakD7UOd1+ndrLWp5Dg0Vk6idnqGv5d/sN94t1mbojWDNx3UlbmzYRciPlxSjK0tRZOau7RNnDjV3zthdI73BwXp5hobSkWv5crB1sWrod91VtKhzhly1gs3SH5jl+T15urVYk83Ql/XgulFJi9S6/+pXPOzJNdBY6X4KTzZDPzSUpuWyt1xbJVevfqDRt8Syi2iuk+vUU+Gyy6ykvSdlEqsntDEXyLVtw3rFtTHXu/QY4yO64/6BzTb3hCYnFrLviWXq6Da57NOxZnKdbdMBKlwmlpTQy66b5LKPXletgkZy1XRp3y324hfXucWqWVB+N8llH8Mea/PeKkezu8qWpG5OnOPxTKwmA3WLXDZQty+qm4pTjfZid5iJVTXdxF1qctkrPjZpWvu0bGJpILdYzRrp4XhKctkHGmeeCT/+MdiiIxdfDCfquZ51j6ZCS5vTSyhZIZskt1hNCmmMpiRXDXdwEF6iB/bnnAO/+Q3cdht8SQ+Le63VysSqWXQKvxvkaiyKc/CGN4CNwRrT53o4E6sFC3WbXC0Ucc4dkonVokkyuVpU1NhhmVhjimjFy+RqRUvFMZlYhR5a3mdytaaqTKzW9DThqLlPrgnF7UokE6tNtWdyTa+4TKzp9TPtr5lcU6snE2tq3bT0SybX5GrKxJpcLzNKnY5c9pnXjDJ7mBycidUhQ05FrryMURsKbuVbwsZsG7+pa0x/uIQnI1ePt1jF14VtGGg2Ldb6BzZTqRwLNVn0Zob3+Cc273s6w887G47+PJz8X/Av34ZzvwcXNv2Toz33BOfAOXAOnAPnwDlwDpwD58A5cA6cA+fAOXAOnAPnwDlwDpwD58A5cA6cA+eKB7k0bc6Bc+AcOAfOgXPgHDgHzoFz4Bw4B86Bc+AcOAfOgXPgHDgHzoFzcMABsHAhExa9BcbR7aGyc+AcOAfOgXPgHDgHzoFz4Bw4B86Bc+AcOAfOgXPgHDgHzoFz4Bw4B86Bc2C6HQe1gH3dLFvwGUU+JHmn5I0S+4j+MEbYR7KX4jWRbRW7T9KWmw2x9PydrwK2IIjJ19Zv5KI71vDdX91OuPLXrPrmSv742e+z/oxLqBLs9XpKr+PHnS0nlErGQRUoG/NPf4KpWqqysRvzV1XrzpYEMkIZsS5gA1fwJ37G9fyaFazmcjbw3zrYFgExW5p8VfFPSdpysyHWu4VoC0e8Xr6J2i5eqfCLJIep23uq/G2pcLt8W60pL2MkRXTRrRa22eCHDHPbwDDzK8PsrbTDJGazV8k3G5otTcy271FaW242xJq33XxGf6ArwWSFaPatE+ELKtJZal7ffgTbHnMwux75DJ5y8J4csueuHL7TApbOdFzWVq3ySZNp4NFKfIHkkB2352l7LGG35Xuw7d/p8n/1s+DE58L7Ra8zXkx1ZaB5BTPa/t8exelCa9d59ckmhz4ZXrYfvNnDe4+Es8X/r6gPv/QU+MlpVH73Meav/hSVkdE6kvfgPXgP3oP34D14D96D9+A9eA/eg/fgPXgP3oP34D14D96D9+A9eA/eg/fgPXhfx7SQLUHkPXgP3oP34D14D96D9+A9eA/eg/fgPXgP3oP34D14D96D9+A9eA/eg/fgPXhPdWklw2yW+TKZvTnqPXgP3oP34D14D96D9+A9eA/eg/fgPXgP3oP34D14D96D9+A9eA/e1xGNJNd9EO4+F7aok/urxr63aQz8yzPhyn+Gb7xVY+BjNBZ+KdiqQCY6xyxVqecys9CsiTUzuIlH2xLa9mZk2TIRtYiVjVnLv0Dbem/LWNr//bngAqrvtNeO75Rvuq2hDuve7klL4VE7gghTS27Fb5sfbZ/YSqnyMVtrwFqqWurQ0NZrRWzYQMf/a1kNL6Xft8RKqeRGrP33h8HBesrQUJ1cRqqjjipasPoRvRnKxEpsN/vaebIllPbaC2wJQg0mvQAABbJJREFU7RCgF78jbFZjJlazRhLEJ5uht38sZd8XGryNs8zvZcnE6pL1auSy/6zRXAQb1MfYnNpb8UysLtrLHv08xRZVn6QMvd5qZWJNYtQUSbWBeq37a8bs9XFWJlazRRPFbR7rpJOY8Cl9I3RusRq1MZtwn51rY6vJPqU/+mhYqsnMO++Ea6/tXaXkFmuO2M654lP688+H1avBFr+95po5Urg2ipGJ1YbSUpyybBkcf3wKpHIwMrHK0Wvf55qJ1fcUKEcBmVjl6LXvc83E6nsKlKOAaYhVDmDOtT80kInVH3ZOXstMrOQq7w/ATKz+sHPyWmZiJVd5fwBmYvWHnZPXMhMrucrnHmAZJZoVsezDs2tuhQc3t1a0SqW14/JR3dPAA5vAbDr2/edIuyWZDbFu3bSFykEfhAVvYnTfM+CE/4Tzfwq/u6vd4uTzUmvAbGU2M9vtIxsufDOYTbcMY83AH9stz2yIdYpA95C8Suz+9KrbWfn5q9j82n+HJ70bdjmekaM+CR++DFbcBPc9CKPWxOmERrdZrV3Z0ohXC5eNWcu/htfo134r02/Eq4XNBt+/ET4km7zgE7Dz8Yyarcxm562AVZER2dLeAjtP59jaDe+S35abDbEM8A7tvil5u0jzLBVqocIHSd6xdgMXXXEDfz7tYnjuR2HxcbD8dP3S4LbbDlJICA2gCtqKLClwDcOwBDnuQkhTZ8MeB1Vg2fth8Vvgbz8G75dNvns9rNvAX/TTpZJTJV6ySLJccoLka5L7JW252RKrGVQ9NPZ6mq4HXrllBFuIYqkOeqkaq4/fcicr86Ig0kYXnHS/RRe/rVB2juBtVaDHyd9N8mLJv0p+KGmbSDp3gus0sSZkPhaxEdclCluzaq3aOxTOLq0GzhKc9SYHyn+bxNbCKvUDsxTEUj0mOLVmlQfgmcC9icR6bEHB2uqez8pLhf1hYVXduupw+GaFb3kI6dTv1l/AaqG9T7JRksx1g1iq3KhGGjfIF7+0L98tFoTd5GADU4XH+KVQ+W4c62YWMVIlV/mgsE4gRimQrkm+dYlYNg4bUWWvk6RwRqpBA1xQoI0bu4iWuh/HWsROWEFKRRvPfOwSUtzGvPLSui4Syyr6C9slkl2srnbXI7xxYytctqtijYpSOzOoPYm2+jXbV8RaKfWqBUlJrJ0EObCzdqNQNbaCKZxhDQwJyYglL5G7XjgVbFxVp5iSUrmBVEBNOPcprqm6lTKyQklclVNLYECWlkuCaSCGNXIPo2zPIGk2XbJcJ8RRbHrBYqTeukUsq6ea6LsqsMbCCcRarNFtYESWlkuAWEDcY4a1C0kzlEVK6Xs9v2VjtduVjktHmxSgy8SyMv3EdgnEWqwqjOYZqsauRlrbzeaotbp42FDNIVWLVe/8+pJY1kxL36nGWePEWg/3JLqgbCJ7sxGrmFdJRSwbX0mzcldLuuISKXjSumkasCIjpyKWdYXVcmxEww8QdDVa5m68y91cRbHptGqg5J0Rq8IfhHKPpCuum8RShUd/DKs0gLdhiKKluvEWy55nCmnc6AqX5cbHj8NVhHFuV2Pl7Ox6sTHWKF1rraxiXSaWTZRuVFdhs/BWnDJlnFhjLE5BrCaMFF1hXZVdG1+ZFbtNrLGr6tkqy44ly4uUf9WNESspZhWYl8rbq2R5g/Iv3Jhui0jqfbeJtUIV/obEXtlIIVcJy/6r1RXyU+AZxuXC+g+JYVs8hXxJePWHOoqkdt0mltX3aO3sJbOZSLvH2n+6shfbnpcQ84XCukxi2O2We6bnvUl4XXVzgVhdVUAGL0cDmVjl6LXvc83E6nsKlKOATKxy9Nr3uWZi9T0FylFAJlY5eu37XDtGrL7XZFbABA1kYk1QR450SgOZWJ3SZM5nggYysSaoI0c6pYFMrE5pMuczQQOZWBPUkSOd0kAmVqc02Tf5tFbR/wcAAP//BqrcXwAAAAZJREFUAwDTS+ylqjv0vwAAAABJRU5ErkJggg==",
    'Y': "data:image/png;base64,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",
    'Z': "data:image/png;base64,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"
  };



  /* ===== CUBING.JS LOADER ===== */
  function loadCubingJs(cb){
    if (window.__t3cubingLoaded) { cb(); return; }
    if (window.__t3cubingLoading){
      window.__t3cubingCallbacks = window.__t3cubingCallbacks || [];
      window.__t3cubingCallbacks.push(cb);
      return;
    }
    window.__t3cubingLoading = true;
    if (!document.querySelector('script[type="importmap"]')){
      var imp = document.createElement('script');
      imp.type = 'importmap';
      imp.textContent = JSON.stringify({
        imports: {
          'three': 'https://cdn.jsdelivr.net/npm/three@0.150/build/three.module.js',
          'three/': 'https://cdn.jsdelivr.net/npm/three@0.150/'
        }
      });
      document.head.appendChild(imp);
    }
    var s = document.createElement('script');
    s.type = 'module';
    s.textContent = "import('https://cdn.jsdelivr.net/npm/cubing/dist/lib/cubing/twisty/index.js').then(function(){window.__t3cubingLoaded=true;window.dispatchEvent(new Event('t3cubing-ready'));}).catch(function(e){console.error('[3DEN] cubing.js load fail',e);window.__t3cubingLoaded=true;window.dispatchEvent(new Event('t3cubing-ready'));});";
    document.head.appendChild(s);
    window.addEventListener('t3cubing-ready', function(){
      cb();
      (window.__t3cubingCallbacks||[]).forEach(function(c){ c(); });
      window.__t3cubingCallbacks = [];
    }, {once:true});
  }

  /* ===== MINI 3x3 CUBE SIMULATOR ===== */
  // Sticker layout per face (9 stickers each, indices 0-8 = top-left to bottom-right reading row by row)
  // Faces: U(yellow), D(white), F(green), B(blue), L(orange), R(red)
  function newCube(){
    var c = {};
    ['U','D','F','B','L','R'].forEach(function(f){
      c[f] = [f,f,f,f,f,f,f,f,f];
    });
    return c;
  }
  function rotFaceCW(face){
    return [face[6],face[3],face[0], face[7],face[4],face[1], face[8],face[5],face[2]];
  }
  function rotFaceCCW(face){
    return [face[2],face[5],face[8], face[1],face[4],face[7], face[0],face[3],face[6]];
  }
  function applyMove(c, move){
    // Returns new cube after move
    var n = {};
    for (var k in c) n[k] = c[k].slice();
    function cycle(face, idxs, vals){
      // sets face[idxs[i]] = vals[i]
      idxs.forEach(function(i, k){ n[face][i] = vals[k]; });
    }
    function readIdxs(face, idxs){
      return idxs.map(function(i){ return c[face][i]; });
    }
    var letter = move.replace(/[2'\s]/g,'');
    var double = move.indexOf('2') >= 0;
    var prime = move.indexOf("'") >= 0;
    var times = double ? 2 : (prime ? 3 : 1);
    
    for (var t=0; t<times; t++){
      var src = {};
      for (var k in n) src[k] = n[k].slice();
      
      if (letter === 'U'){
        n.U = rotFaceCW(src.U);
        n.F[0] = src.R[0]; n.F[1] = src.R[1]; n.F[2] = src.R[2];
        n.L[0] = src.F[0]; n.L[1] = src.F[1]; n.L[2] = src.F[2];
        n.B[0] = src.L[0]; n.B[1] = src.L[1]; n.B[2] = src.L[2];
        n.R[0] = src.B[0]; n.R[1] = src.B[1]; n.R[2] = src.B[2];
      } else if (letter === 'D'){
        n.D = rotFaceCW(src.D);
        n.F[6] = src.L[6]; n.F[7] = src.L[7]; n.F[8] = src.L[8];
        n.R[6] = src.F[6]; n.R[7] = src.F[7]; n.R[8] = src.F[8];
        n.B[6] = src.R[6]; n.B[7] = src.R[7]; n.B[8] = src.R[8];
        n.L[6] = src.B[6]; n.L[7] = src.B[7]; n.L[8] = src.B[8];
      } else if (letter === 'R'){
        n.R = rotFaceCW(src.R);
        n.U[2] = src.F[2]; n.U[5] = src.F[5]; n.U[8] = src.F[8];
        n.B[6] = src.U[2]; n.B[3] = src.U[5]; n.B[0] = src.U[8];
        n.D[2] = src.B[6]; n.D[5] = src.B[3]; n.D[8] = src.B[0];
        n.F[2] = src.D[2]; n.F[5] = src.D[5]; n.F[8] = src.D[8];
      } else if (letter === 'L'){
        n.L = rotFaceCW(src.L);
        n.U[0] = src.B[8]; n.U[3] = src.B[5]; n.U[6] = src.B[2];
        n.F[0] = src.U[0]; n.F[3] = src.U[3]; n.F[6] = src.U[6];
        n.D[0] = src.F[0]; n.D[3] = src.F[3]; n.D[6] = src.F[6];
        n.B[8] = src.D[0]; n.B[5] = src.D[3]; n.B[2] = src.D[6];
      } else if (letter === 'F'){
        n.F = rotFaceCW(src.F);
        n.U[6] = src.L[8]; n.U[7] = src.L[5]; n.U[8] = src.L[2];
        n.R[0] = src.U[6]; n.R[3] = src.U[7]; n.R[6] = src.U[8];
        n.D[2] = src.R[0]; n.D[1] = src.R[3]; n.D[0] = src.R[6];
        n.L[8] = src.D[0]; n.L[5] = src.D[1]; n.L[2] = src.D[2];
      } else if (letter === 'B'){
        n.B = rotFaceCW(src.B);
        n.U[0] = src.R[2]; n.U[1] = src.R[5]; n.U[2] = src.R[8];
        n.L[0] = src.U[2]; n.L[3] = src.U[1]; n.L[6] = src.U[0];
        n.D[6] = src.L[0]; n.D[7] = src.L[3]; n.D[8] = src.L[6];
        n.R[2] = src.D[8]; n.R[5] = src.D[7]; n.R[8] = src.D[6];
      } else if (letter === 'M'){
        // Middle slice: like L' but middle column - U[1,4,7], F[1,4,7], D[1,4,7], B[7,4,1] (B is mirrored)
        var u1=src.U[1], u4=src.U[4], u7=src.U[7];
        n.U[1] = src.B[7]; n.U[4] = src.B[4]; n.U[7] = src.B[1];
        n.F[1] = u1; n.F[4] = u4; n.F[7] = u7;
        n.D[1] = src.F[1]; n.D[4] = src.F[4]; n.D[7] = src.F[7];
        n.B[7] = src.D[1]; n.B[4] = src.D[4]; n.B[1] = src.D[7];
      } else if (letter === 'E'){
        // Equator: like D but middle row - F[3,4,5], R[3,4,5], B[3,4,5], L[3,4,5]
        n.F[3] = src.L[3]; n.F[4] = src.L[4]; n.F[5] = src.L[5];
        n.R[3] = src.F[3]; n.R[4] = src.F[4]; n.R[5] = src.F[5];
        n.B[3] = src.R[3]; n.B[4] = src.R[4]; n.B[5] = src.R[5];
        n.L[3] = src.B[3]; n.L[4] = src.B[4]; n.L[5] = src.B[5];
      } else if (letter === 'S'){
        // Standing: like F but middle slice
        n.U[3] = src.L[7]; n.U[4] = src.L[4]; n.U[5] = src.L[1];
        n.R[1] = src.U[3]; n.R[4] = src.U[4]; n.R[7] = src.U[5];
        n.D[5] = src.R[1]; n.D[4] = src.R[4]; n.D[3] = src.R[7];
        n.L[7] = src.D[5]; n.L[4] = src.D[4]; n.L[1] = src.D[3];
      } else if (letter === 'r'){
        // Wide R = R + M' equivalent
        n = applyMove(n, 'R');
        n = applyMove(n, "M'");
        continue;
      } else if (letter === 'l'){
        n = applyMove(n, 'L');
        n = applyMove(n, 'M');
        continue;
      } else if (letter === 'u'){
        n = applyMove(n, 'U');
        n = applyMove(n, "E'");
        continue;
      } else if (letter === 'd'){
        n = applyMove(n, 'D');
        n = applyMove(n, 'E');
        continue;
      } else if (letter === 'f'){
        n = applyMove(n, 'F');
        n = applyMove(n, 'S');
        continue;
      } else if (letter === 'b'){
        n = applyMove(n, 'B');
        n = applyMove(n, "S'");
        continue;
      } else if (letter === 'x'){
        // Whole cube rotation around R axis
        var oldU = src.U, oldF = src.F, oldD = src.D, oldB = src.B;
        n.U = oldF.slice();
        n.F = oldD.slice();
        n.D = [oldB[8],oldB[7],oldB[6],oldB[5],oldB[4],oldB[3],oldB[2],oldB[1],oldB[0]];
        n.B = [oldU[8],oldU[7],oldU[6],oldU[5],oldU[4],oldU[3],oldU[2],oldU[1],oldU[0]];
        n.R = rotFaceCW(src.R);
        n.L = rotFaceCCW(src.L);
      } else if (letter === 'y'){
        // Whole cube rotation around U axis
        var oldF = src.F, oldR = src.R, oldB = src.B, oldL = src.L;
        n.F = oldR.slice();
        n.R = oldB.slice();
        n.B = oldL.slice();
        n.L = oldF.slice();
        n.U = rotFaceCW(src.U);
        n.D = rotFaceCCW(src.D);
      } else if (letter === 'z'){
        // Whole cube rotation around F axis
        var oldU = src.U, oldR = src.R, oldD = src.D, oldL = src.L;
        n.U = [oldL[6],oldL[3],oldL[0],oldL[7],oldL[4],oldL[1],oldL[8],oldL[5],oldL[2]];
        n.R = [oldU[6],oldU[3],oldU[0],oldU[7],oldU[4],oldU[1],oldU[8],oldU[5],oldU[2]];
        n.D = [oldR[6],oldR[3],oldR[0],oldR[7],oldR[4],oldR[1],oldR[8],oldR[5],oldR[2]];
        n.L = [oldD[6],oldD[3],oldD[0],oldD[7],oldD[4],oldD[1],oldD[8],oldD[5],oldD[2]];
        n.F = rotFaceCW(src.F);
        n.B = rotFaceCCW(src.B);
      }
    }
    return n;
  }
  function applyScramble(c, scramble){
    var moves = scramble.trim().split(/\s+/);
    moves.forEach(function(m){
      if (m) c = applyMove(c, m);
    });
    return c;
  }
  
  function colorMap(c){
    // D mapped to dark gray for PLL renderer (D shouldn't be visible in correct LL-only setups)
    return {U:'#fbbf24', D:'#3a3a3a', F:'#22c55e', B:'#3b82f6', L:'#f97316', R:'#ef4444'}[c] || '#374151';
  }
  
  function makePLLSvg(caseId, opts){
    opts = opts || {};
    var size = opts.size || 100;
    var src = PLL_IMAGES[caseId];
    if (!src){
      var div = document.createElement('div');
      div.style.cssText = 'width:'+size+'px;height:'+size+'px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px;background:#3a3a3a;border-radius:8px';
      div.textContent = caseId;
      return div;
    }
    var img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:'+size+'px;height:'+size+'px;display:block;border-radius:8px';
    img.alt = caseId + ' Perm';
    return img;
  }
  
  function makeTwisty(setup, opts){
    // Backward compat: if setup is actually a case ID, use SVG renderer
    return makePLLSvg(setup, opts);
  }

  /* ===== ALG STATUS ===== */
  function loadAlgStatuses(caseSet, cb){
    if (!session){ cb({}); return; }
    sb.from('alg_status').select('*').eq('user_id', session.user.id).eq('case_set', caseSet).then(function(r){
      var byId = {};
      (r.data||[]).forEach(function(s){ byId[s.case_id] = s; });
      cb(byId);
    });
  }

  function setAlgStatus(caseSet, caseId, status, cb){
    if (!session) return;
    sb.from('alg_status').upsert({
      user_id: session.user.id,
      case_set: caseSet,
      case_id: caseId,
      status: status,
      updated_at: new Date().toISOString()
    }).then(function(r){ if (cb) cb(r); });
  }

  function deleteAlgStatus(caseSet, caseId, cb){
    if (!session) return;
    sb.from('alg_status').delete().match({user_id: session.user.id, case_set: caseSet, case_id: caseId}).then(function(r){ if (cb) cb(r); });
  }

  function statusBadge(status){
    if (!status) return '<button class="t3-alg-status-btn" data-action="add">+ Add status</button>';
    var colors = {learning:{bg:'rgba(251,191,36,.15)', fg:'#fbbf24'}, learned:{bg:'rgba(34,197,94,.15)', fg:'#22c55e'}, mastered:{bg:'rgba(168,85,247,.15)', fg:'#a855f7'}};
    var icon = {learning:'⏳', learned:'✓', mastered:'⭐'}[status] || '';
    var c = colors[status] || colors.learning;
    return '<button class="t3-alg-status-btn" data-action="cycle" style="background:'+c.bg+';color:'+c.fg+';border-color:'+c.fg+'">'+icon+' '+status.charAt(0).toUpperCase()+status.slice(1)+'</button>';
  }

  /* ===== PLL LIBRARY PAGE ===== */
  function renderAlgsPLL(){
    document.title = 'PLL Library — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-algs-pll';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:32px 20px;box-sizing:border-box';
    
    var st = document.createElement('style');
    st.textContent = ''
      + '.t3-alg-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;color:#fff}'
      + '.t3-alg-card:hover{background:rgba(239,68,68,.08);border-color:#ef4444;transform:translateY(-2px)}'
      + '.t3-alg-card .name{font-weight:700;font-size:13px;text-align:center}'
      + '.t3-alg-card .meta{font-size:11px;color:#64748b;display:flex;gap:6px;align-items:center}'
      + '.t3-alg-card .status-dot{width:8px;height:8px;border-radius:50%}'
      + '.t3-alg-status-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:6px 12px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;font-family:inherit}'
      + '.t3-alg-status-btn:hover{background:rgba(255,255,255,.08);color:#fff}'
      + '.t3-difficulty{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}'
      + '.t3-difficulty.easy{background:rgba(34,197,94,.15);color:#22c55e}'
      + '.t3-difficulty.medium{background:rgba(251,191,36,.15);color:#fbbf24}'
      + '.t3-difficulty.hard{background:rgba(239,68,68,.15);color:#ef4444}'
      + '@media (max-width:640px){.t3-alg-grid{grid-template-columns:repeat(2,1fr) !important}}';
    document.head.appendChild(st);

    var html = '<div style="max-width:1200px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a>'
      + '  <h1 style="margin:0;font-size:28px;font-weight:800">📚 <span style="color:#06b6d4">PLL</span> Library</h1>'
      + '  <a href="/trainer" style="background:rgba(168,85,247,.15);border:1px solid #a855f7;color:#a855f7;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;text-decoration:none;font-size:14px">🚀 Train</a>'
      + '</div>'
      + '<p style="color:#94a3b8;font-size:14px;margin-bottom:24px">21 cases · Click a case to learn the algorithm and see 3D animation</p>'
      + '<div id="t3-pll-stats" style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;font-size:13px"></div>'
      + '<div class="t3-alg-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">'
      + PLL_CASES.map(function(c){
          return '<a href="/algs?set=pll&c='+c.id+'" class="t3-alg-card" data-id="'+c.id+'">'
            + '<div class="t3-cube" data-id="'+c.id+'" style="width:100px;height:100px"></div>'
            + '<div class="name">'+escapeHTML(c.name)+'</div>'
            + '<div class="meta"><span class="status-dot" style="background:#374151"></span><span class="t3-difficulty '+c.difficulty+'">'+c.difficulty+'</span></div>'
            + '</a>';
        }).join('')
      + '</div></div>';
    page.innerHTML = html;
    document.body.appendChild(page);

    // Update statuses + cubes
    loadAlgStatuses('pll', function(byId){
      var statusCounts = {learning:0, learned:0, mastered:0};
      page.querySelectorAll('.t3-alg-card').forEach(function(card){
        var id = card.getAttribute('data-id');
        var s = byId[id];
        if (s){
          statusCounts[s.status] = (statusCounts[s.status]||0) + 1;
          var dot = card.querySelector('.status-dot');
          var color = {learning:'#fbbf24', learned:'#22c55e', mastered:'#a855f7'}[s.status] || '#374151';
          if (dot) dot.style.background = color;
        }
      });
      var total = PLL_CASES.length;
      var done = statusCounts.learned + statusCounts.mastered;
      page.querySelector('#t3-pll-stats').innerHTML = ''
        + '<div style="background:rgba(255,255,255,.04);padding:8px 16px;border-radius:8px"><span style="color:#64748b">Progress</span> <span style="color:#fff;font-weight:700">'+done+'/'+total+'</span></div>'
        + '<div style="background:rgba(251,191,36,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(251,191,36,.2)"><span style="color:#fbbf24">⏳ Learning</span> <b style="color:#fbbf24">'+statusCounts.learning+'</b></div>'
        + '<div style="background:rgba(34,197,94,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(34,197,94,.2)"><span style="color:#22c55e">✓ Learned</span> <b style="color:#22c55e">'+statusCounts.learned+'</b></div>'
        + '<div style="background:rgba(168,85,247,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(168,85,247,.2)"><span style="color:#a855f7">⭐ Mastered</span> <b style="color:#a855f7">'+statusCounts.mastered+'</b></div>';
    });

    // Render PLL SVGs
    page.querySelectorAll('.t3-cube').forEach(function(div){
      var id = div.getAttribute('data-id');
      var svg = makePLLSvg(id, {size:100});
      div.innerHTML = '';
      div.appendChild(svg);
    });
  }

  /* ===== PLL CASE PAGE ===== */
  function renderAlgCase(caseSet, caseId){
    var dataSet = (caseSet === 'pll') ? PLL_CASES : null;
    if (!dataSet){ document.body.innerHTML = '<div style="color:#fff;padding:40px">Case set not implemented yet</div>'; return; }
    var idx = dataSet.findIndex(function(c){ return c.id === caseId; });
    if (idx < 0){ document.body.innerHTML = '<div style="color:#fff;padding:40px">Case not found</div>'; return; }
    var c = dataSet[idx];
    var prev = dataSet[(idx - 1 + dataSet.length) % dataSet.length];
    var next = dataSet[(idx + 1) % dataSet.length];

    document.title = c.name + ' — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-alg-case';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:32px 20px;box-sizing:border-box';

    var html = '<div style="max-width:900px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/algs?set='+caseSet+'" style="color:#06b6d4;text-decoration:none;font-size:14px;font-weight:600">‹ '+caseSet.toUpperCase()+'</a>'
      + '  <h1 style="margin:0;font-size:28px;font-weight:800">'+escapeHTML(c.name)+'</h1>'
      + '  <a href="/trainer" style="background:rgba(168,85,247,.15);border:1px solid #a855f7;color:#a855f7;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;text-decoration:none;font-size:14px">🚀 Train</a>'
      + '</div>'
      + '<div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:32px;flex-wrap:wrap">'
      + '  <a href="/algs?set='+caseSet+'&c='+prev.id+'" style="color:#94a3b8;text-decoration:none;display:flex;align-items:center;gap:10px">'
      + '    <span style="font-size:24px">‹</span>'
      + '    <div class="t3-cube-small" data-id="'+prev.id+'" style="width:80px;height:80px;opacity:.5"></div>'
      + '  </a>'
      + '  <div class="t3-cube-main" data-id="'+c.id+'" style="width:200px;height:200px"></div>'
      + '  <a href="/algs?set='+caseSet+'&c='+next.id+'" style="color:#94a3b8;text-decoration:none;display:flex;align-items:center;gap:10px">'
      + '    <div class="t3-cube-small" data-id="'+next.id+'" style="width:80px;height:80px;opacity:.5"></div>'
      + '    <span style="font-size:24px">›</span>'
      + '  </a>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px">'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Setup</h3><div style="font-family:monospace;font-size:13px;color:#cbd5e1;line-height:1.6">'+escapeHTML(c.setup)+'</div></div>'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Probability</h3><div style="font-size:24px;font-weight:800;color:#06b6d4">'+c.probability+'</div></div>'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Difficulty</h3><div><span class="t3-difficulty '+c.difficulty+'" style="font-size:13px;padding:4px 14px">'+c.difficulty+'</span></div></div>'
      + '</div>'
      + '<h2 style="font-size:18px;margin:24px 0 12px">Algorithms ('+c.algs.length+')</h2>'
      + '<div id="t3-alg-list" style="display:flex;flex-direction:column;gap:8px">'
      + c.algs.map(function(alg, i){
          return '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
            + '<span style="color:#64748b;font-size:13px;font-weight:700;flex-shrink:0">#'+(i+1)+'</span>'
            + '<code style="flex:1;min-width:200px;font-family:monospace;font-size:14px;color:#fff;word-break:break-word">'+escapeHTML(alg)+'</code>'
            + '<button class="t3-copy-alg" data-alg="'+escapeHTML(alg)+'" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">Copy</button>'
            + '<div data-status-target="'+i+'"></div>'
            + '</div>';
        }).join('')
      + '</div>'
      + '</div>';
    page.innerHTML = html;
    document.body.appendChild(page);

    // Status badge for first algorithm (representing the case)
    function refreshStatus(){
      loadAlgStatuses(caseSet, function(byId){
        var s = byId[caseId];
        var target = page.querySelector('[data-status-target="0"]');
        if (target) target.innerHTML = statusBadge(s ? s.status : null);
        // Bind status button
        var btn = target && target.querySelector('.t3-alg-status-btn');
        if (btn){
          btn.onclick = function(){
            if (!session){ buildModal(); return; }
            var current = s ? s.status : null;
            var nextStatus;
            if (!current) nextStatus = 'learning';
            else if (current === 'learning') nextStatus = 'learned';
            else if (current === 'learned') nextStatus = 'mastered';
            else { deleteAlgStatus(caseSet, caseId, function(){ refreshStatus(); }); return; }
            setAlgStatus(caseSet, caseId, nextStatus, function(){ refreshStatus(); });
          };
        }
      });
    }
    refreshStatus();

    // Copy buttons
    page.querySelectorAll('.t3-copy-alg').forEach(function(btn){
      btn.onclick = function(){
        var alg = btn.getAttribute('data-alg');
        try { navigator.clipboard.writeText(alg); btn.textContent = 'Copied ✓'; setTimeout(function(){ btn.textContent='Copy'; }, 1500); } catch(e){}
      };
    });

    // Render PLL SVGs
    var main = page.querySelector('.t3-cube-main');
    if (main){
      var svg = makePLLSvg(main.getAttribute('data-id'), {size:200});
      main.innerHTML = '';
      main.appendChild(svg);
    }
    page.querySelectorAll('.t3-cube-small').forEach(function(div){
      var svg = makePLLSvg(div.getAttribute('data-id'), {size:80});
      div.innerHTML = '';
      div.appendChild(svg);
    });
  }

  /* ===== ROUTING ===== */
  function handleRoute(){
    var path = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    if (path === '/leaderboard' || path.indexOf('/leaderboard') === 0){
      renderLeaderboard();
    } else if (path === '/u'){
      var uname = new URLSearchParams(location.search).get('u') || '';
      if (uname) renderProfile(uname);
    } else if (path === '/feed'){
      renderFeed();
    } else if (path === '/daily'){
      renderDaily();
    } else if (path === '/weekly'){
      renderWeekly();
    } else if (path === '/inbox'){
      if (session) buildInboxModal();
      else buildModal();
    } else if (path === '/algs'){
      var qs = new URLSearchParams(location.search);
      var set = qs.get('set') || 'pll';
      var c = qs.get('c');
      if (c) renderAlgCase(set, c);
      else if (set === 'pll') renderAlgsPLL();
      else { document.body.innerHTML = '<div style="color:#fff;padding:40px;text-align:center"><h1>Coming soon</h1><p style="color:#94a3b8">'+set.toUpperCase()+' library is being built.</p><a href="/algs?set=pll" style="color:#ef4444">Browse PLL ›</a></div>'; }
    }
  }

  /* ===== FEED PAGE ===== */
  function renderFeed(){
    if (!session){ buildModal(); return; }
    document.title = 'Feed — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-feed';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:700px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px"><a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a><h1 style="margin:0;font-size:28px;font-weight:800">📰 <span style="color:#ef4444">Feed</span></h1><div style="width:100px"></div></div>'
      + '<div id="t3-feed-list"><div style="padding:40px;text-align:center;color:#64748b">Loading...</div></div>'
      + '</div>';
    document.body.appendChild(page);

    sb.from('follows').select('following_id').eq('follower_id', session.user.id).then(function(fr){
      var followingIds = (fr.data || []).map(function(x){ return x.following_id; });
      followingIds.push(session.user.id); // include self
      sb.from('recent_prs').select('*').in('user_id', followingIds).order('solve_date',{ascending:false}).limit(50).then(function(r){
        var list = page.querySelector('#t3-feed-list');
        if (r.error){ list.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444">'+r.error.message+'</div>'; return; }
        var rows = r.data || [];
        if (!rows.length){ list.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">No PRs yet. <a href="/leaderboard" style="color:#ef4444">Follow some cubers</a></div>'; return; }
        list.innerHTML = rows.map(function(pr){
          var color = pr.avatar_color || '#ef4444';
          var initial = (pr.username||'?').charAt(0).toUpperCase();
          var avatarHtml = pr.avatar_type === 'image' && pr.avatar_url
            ? '<div class="t3p-feed-avatar" style="background-image:url('+escapeHTML(pr.avatar_url)+')"></div>'
            : '<div class="t3p-feed-avatar" style="background:'+color+'">'+initial+'</div>';
          var flag = pr.country ? countryFlag(pr.country)+' ' : '';
          var feedKey = pr.user_id+'|'+pr.puzzle+'|'+pr.solve_date;
          return '<div class="t3p-feed-card" data-key="'+feedKey+'" data-uid="'+pr.user_id+'" data-puzzle="'+pr.puzzle+'" data-date="'+pr.solve_date+'">'
            + '<a href="/u?u='+encodeURIComponent(pr.username)+'" style="text-decoration:none;display:flex;align-items:center;gap:14px;flex:1;min-width:0">'
            + avatarHtml
            + '<div style="flex:1;min-width:0"><div style="color:#fff;font-weight:700">'+flag+'@'+escapeHTML(pr.username)+' <span style="color:#22c55e;font-weight:600">🏅 PR</span></div>'
            + '<div style="color:#94a3b8;font-size:13px;margin-top:2px">'+puzzleLabel(pr.puzzle)+' · '+timeAgo(pr.solve_date)+'</div>'
            + '</a>'
            + '<div class="t3p-feed-time">'+formatTime(pr.time_ms + (pr.penalty===1?2000:0))+'</div>'
            + '<button class="t3-comment-btn" data-uid="'+pr.user_id+'" data-puzzle="'+pr.puzzle+'" data-date="'+pr.solve_date+'" data-time="'+formatTime(pr.time_ms + (pr.penalty===1?2000:0))+'" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#94a3b8;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;flex-shrink:0">💬 <span class="t3-cmt-count" data-key="'+feedKey+'">0</span></button>'
            + '</div>'
            + '<div class="t3p-react-row" data-key="'+feedKey+'" data-uid="'+pr.user_id+'" data-puzzle="'+pr.puzzle+'" data-date="'+pr.solve_date+'" style="display:flex;gap:6px;margin:-4px 0 12px 56px;flex-wrap:wrap"></div>';
        }).join('');
        renderReactionsFor(rows, list);
        bindCommentButtons(rows, list);
      });
    });
  }

  /* ===== INIT ===== */
  function init(){
    injectCSS();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:true,autoRefreshToken:true}});
    window.__t3denSb = sb;

    var path = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    var isSubPage = path === '/leaderboard' || path === '/u' || path === '/feed' || path === '/daily' || path === '/weekly' || path === '/inbox' || path === '/algs' || path === '/trainer';

    sb.auth.getSession().then(function(r){
      session = r.data.session;
      if (session){
        loadProfile(session.user.id, function(p){
          profile = p;
          if (isSubPage){ handleRoute(); buildBadge(session.user); }
          else if (!p) buildUsernamePrompt(session.user);
          else { buildBadge(session.user); syncOnLogin(); }
        });
      } else if (isSubPage){
        handleRoute();
      } else if (localStorage.getItem(GUEST_KEY)){
        buildBadge(null);
      } else {
        buildModal();
      }
    });
    sb.auth.onAuthStateChange(function(e, s){ session = s; });
  }

  function whenReady(cb){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb);
    else { var t=0; (function ck(){ if(document.body||t>50)cb(); else{t++;setTimeout(ck,100);} })(); }
  }

  whenReady(function(){ loadSDK(init); });
})();
