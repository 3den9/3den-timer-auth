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
  /* PLL stickers patterns: order [F1,F2,F3, R1,R2,R3, B1,B2,B3, L1,L2,L3]
     where F1 is left side of front face top row, F2 middle, F3 right.
     Standard solved colors: F=#22c55e (green), R=#ef4444 (red), B=#3b82f6 (blue), L=#f97316 (orange) */
  var PLL_PATTERNS = {
    'Aa': {stickers:'GBG GOG ROO BRB', arrows:[['F1','R1'],['R1','B3'],['B3','F1']]},
    'Ab': {stickers:'GGB BOG OOR RBR', arrows:[['F3','B3'],['B3','R3'],['R3','F3']]},
    'E':  {stickers:'GOG OBO BRB RGR', arrows:[['F1','F3'],['B1','B3'],['L3','L1']]},
    'F':  {stickers:'BGB GFG OBO BOB', arrows:[['F1','F3'],['R3','L3']]},
    'Ga': {stickers:'GRG ROR ORO BBB', arrows:[['F1','R1','B3'],['F3','L1','R3']]},
    'Gb': {stickers:'GGG ROR BOB ORO', arrows:[['F3','L1','B1'],['L3','R1','B3']]},
    'Gc': {stickers:'GOG OBO BRB RGR', arrows:[['F3','B1','L1'],['F1','R3','B3']]},
    'Gd': {stickers:'GGG OBO ROR BRB', arrows:[['F1','L3','B1'],['F3','R1','B3']]},
    'H':  {stickers:'GBG ROR BGB ORO', arrows:[['F2','B2'],['L2','R2']]},
    'Ja': {stickers:'GOO BBG GGB ROR', arrows:[['F1','L1'],['L3','B1']]},
    'Jb': {stickers:'GGR ROO BBB OGG', arrows:[['F3','R1'],['R3','B3']]},
    'Na': {stickers:'OBR GGG ORB BBB', arrows:[['F1','B3'],['L1','R3']]},
    'Nb': {stickers:'BGO RRR BGO RRR', arrows:[['F3','B1'],['L3','R1']]},
    'Ra': {stickers:'GBG OOR ROO BGB', arrows:[['F1','L1'],['R1','B1']]},
    'Rb': {stickers:'GGO ROG BBR ORB', arrows:[['F3','R3'],['L3','B3']]},
    'T':  {stickers:'GBG ROO BBB ROR', arrows:[['F1','F3'],['R1','L3']]},
    'Ua': {stickers:'GBG OOO BGB RGR', arrows:[['F2','L2','R2']]},
    'Ub': {stickers:'GGG ORO BBB RBR', arrows:[['F2','R2','L2']]},
    'V':  {stickers:'GGB ROO BBG ORR', arrows:[['F3','L1'],['R1','B3']]},
    'Y':  {stickers:'GOG OBO BRB RGR', arrows:[['F1','R1'],['F3','L3']]},
    'Z':  {stickers:'GOG ROR BRB OGO', arrows:[['F1','F3'],['L1','L3'],['R1','R3']]}
  };


  // 21 PLL cases. Setup = scramble that produces this case from solved.
  // Algs: array of strings (multiple variants). difficulty: easy/medium/hard. probability: "1/n"
  var PLL_CASES = [
    {id:'Aa', name:'Aa Perm', setup:"x R' U R' D2 R U' R' D2 R2 x'", probability:'1/18', difficulty:'easy',
      algs:["x R' U R' D2 R U' R' D2 R2 x'", "y x' R2 D2 R' U' R D2 R' U R' x", "R' F R' B2 R F' R' B2 R2"]},
    {id:'Ab', name:'Ab Perm', setup:"x R2 D2 R U R' D2 R U' R x'", probability:'1/18', difficulty:'easy',
      algs:["x R2 D2 R U R' D2 R U' R x'", "y x' R U' R D2 R' U R D2 R2 x", "R B' R F2 R' B R F2 R2"]},
    {id:'E', name:'E Perm', setup:"x' R U' R' D R U R' D' R U R' D R U' R' D' x", probability:'1/18', difficulty:'medium',
      algs:["x' R U' R' D R U R' D' R U R' D R U' R' D' x", "x' L' U L D' L' U' L D L' U' L D' L' U L D x"]},
    {id:'F', name:'F Perm', setup:"R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", probability:'1/18', difficulty:'hard',
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
    {id:'Ja', name:'Ja Perm', setup:"x R2 F R F' R U2 r' U r U2 x'", probability:'1/18', difficulty:'easy',
      algs:["x R2 F R F' R U2 r' U r U2 x'", "L' U' L F L' U' L U L F' L2 U L", "R' U L' U2 R U' R' U2 R L"]},
    {id:'Jb', name:'Jb Perm', setup:"R U R' F' R U R' U' R' F R2 U' R'", probability:'1/18', difficulty:'easy',
      algs:["R U R' F' R U R' U' R' F R2 U' R'", "R U2 R' U' R U2 L' U R' U' L", "y R U2 R' U' R U2 L' U R' U' L"]},
    {id:'Na', name:'Na Perm', setup:"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", probability:'1/72', difficulty:'hard',
      algs:["R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", "z U R' D R2 U' R D' U R' D R2 U' R D' z'"]},
    {id:'Nb', name:'Nb Perm', setup:"R' U R U' R' F' U' F R U R' F R' F' R U' R", probability:'1/72', difficulty:'hard',
      algs:["R' U R U' R' F' U' F R U R' F R' F' R U' R", "z U' R D' R2 U R' D U' R D' R2 U R' D z'"]},
    {id:'Ra', name:'Ra Perm', setup:"R U' R' U' R U R D R' U' R D' R' U2 R'", probability:'1/18', difficulty:'medium',
      algs:["R U' R' U' R U R D R' U' R D' R' U2 R'", "R U R' F' R U2 R' U2 R' F R U R U2 R'"]},
    {id:'Rb', name:'Rb Perm', setup:"R2 F R U R U' R' F' R U2 R' U2 R", probability:'1/18', difficulty:'medium',
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

  function colorMap(c){
    return {G:'#22c55e', R:'#ef4444', B:'#3b82f6', O:'#f97316', Y:'#fbbf24', W:'#f8fafc'}[c] || '#374151';
  }
  
  function makePLLSvg(caseId, opts){
    opts = opts || {};
    var size = opts.size || 100;
    var pat = PLL_PATTERNS[caseId];
    if (!pat){
      var div = document.createElement('div');
      div.style.cssText = 'width:'+size+'px;height:'+size+'px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px';
      div.textContent = caseId;
      return div;
    }
    var stickers = pat.stickers.split(' ');
    var faces = {F:stickers[0], R:stickers[1], B:stickers[2], L:stickers[3]};
    
    // Build SVG: 5x5 grid of cells where center 3x3 is yellow (U face)
    // top row = B face stickers (reversed for visual)
    // bottom row = F face stickers
    // left col = L face stickers (rotated)
    // right col = R face stickers
    var cell = size / 5.5;
    var gap = cell * 0.08;
    var s = cell - gap;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 '+size+' '+size);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.display = 'block';
    
    // Helper to draw a sticker
    function rect(x, y, color){
      var r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', x);
      r.setAttribute('y', y);
      r.setAttribute('width', s);
      r.setAttribute('height', s);
      r.setAttribute('rx', cell*0.08);
      r.setAttribute('fill', color);
      r.setAttribute('stroke', '#0a0e1a');
      r.setAttribute('stroke-width', gap);
      svg.appendChild(r);
      return r;
    }
    
    var pad = cell * 0.5;
    // U face 3x3 (yellow center)
    for (var i=0; i<3; i++){
      for (var j=0; j<3; j++){
        rect(pad + cell + j*cell, pad + cell + i*cell, '#fbbf24');
      }
    }
    // B face top row (visually above U) - read right-to-left
    for (var i=0; i<3; i++){
      rect(pad + cell + i*cell, pad, colorMap(faces.B[2-i]));
    }
    // F face bottom row (below U)
    for (var i=0; i<3; i++){
      rect(pad + cell + i*cell, pad + 4*cell, colorMap(faces.F[i]));
    }
    // L face left col (left of U) - read bottom-to-top
    for (var i=0; i<3; i++){
      rect(pad, pad + cell + (2-i)*cell, colorMap(faces.L[i]));
    }
    // R face right col
    for (var i=0; i<3; i++){
      rect(pad + 4*cell, pad + cell + i*cell, colorMap(faces.R[i]));
    }
    
    // Draw arrows for permutation cycles
    function getCenter(loc){
      var face = loc[0], idx = parseInt(loc[1])-1;
      if (face === 'F') return [pad + cell + idx*cell + s/2, pad + 4*cell + s/2];
      if (face === 'B') return [pad + cell + (2-idx)*cell + s/2, pad + s/2];
      if (face === 'L') return [pad + s/2, pad + cell + (2-idx)*cell + s/2];
      if (face === 'R') return [pad + 4*cell + s/2, pad + cell + idx*cell + s/2];
      return [size/2, size/2];
    }
    
    if (size >= 100 && pat.arrows){
      var defs = document.createElementNS(ns, 'defs');
      var marker = document.createElementNS(ns, 'marker');
      marker.setAttribute('id', 'arr-'+caseId);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '5');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '4');
      marker.setAttribute('markerHeight', '4');
      marker.setAttribute('orient', 'auto-start-reverse');
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M0,0 L10,5 L0,10 z');
      path.setAttribute('fill', '#fff');
      marker.appendChild(path);
      defs.appendChild(marker);
      svg.appendChild(defs);
      
      pat.arrows.forEach(function(cycle){
        for (var i=0; i<cycle.length; i++){
          var from = getCenter(cycle[i]);
          var to = getCenter(cycle[(i+1) % cycle.length]);
          var line = document.createElementNS(ns, 'path');
          var dx = to[0]-from[0], dy = to[1]-from[1];
          var d = 'M'+from[0]+','+from[1]+' Q'+(from[0]+dx*0.5+dy*0.15)+','+(from[1]+dy*0.5-dx*0.15)+' '+to[0]+','+to[1];
          line.setAttribute('d', d);
          line.setAttribute('stroke', '#fff');
          line.setAttribute('stroke-width', size*0.025);
          line.setAttribute('fill', 'none');
          line.setAttribute('marker-end', 'url(#arr-'+caseId+')');
          line.setAttribute('opacity', '0.85');
          svg.appendChild(line);
        }
      });
    }
    
    return svg;
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
