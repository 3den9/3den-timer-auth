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
    + '.t3-auth-badge{position:fixed;top:14px;right:142px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 14px;display:flex;align-items:center;gap:10px;z-index:9000;font-size:13px;color:#e2e8f0}'
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
      + '    <button class="t3-auth-guest" id="t3ep-pick">📷 Choose image (max 2MB)</button>'
      + '    <p class="t3-auth-hint">PNG/JPG, will be cropped to square</p>'
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
    fileIn.addEventListener('change', function(){
      var f = fileIn.files[0];
      if (!f) return;
      if (f.size > 2*1024*1024){ msg('Max 2MB', 'error'); return; }
      msg('Uploading...', 'info');
      var ext = (f.name.split('.').pop()||'jpg').toLowerCase();
      var path = profile.id + '/avatar.' + ext;
      sb.storage.from('avatars').upload(path, f, {upsert:true, contentType:f.type}).then(function(r){
        if (r.error){ msg('Upload error: '+r.error.message, 'error'); return; }
        var pub = sb.storage.from('avatars').getPublicUrl(path);
        url = pub.data.publicUrl + '?t=' + Date.now();
        msg('Uploaded ✓', 'success');
        refreshPreview();
      });
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
    ['t3-auth-badge','t3-trophy','t3-sync','t3-feed-icon'].forEach(function(id){ var x=document.getElementById(id); if(x)x.remove(); });
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
      ['t3-auth-badge','t3-trophy','t3-sync','t3-feed-icon'].forEach(function(id){var x=document.getElementById(id); if(x)x.remove();});
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
    var tabs = page.querySelectorAll('.t3lb-tab');
    var list = page.querySelector('#t3lb-list');
    function loadAndRender(){
      list.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">Loading...</div>';
      var puzzle = puzzleSel.value;
      var view = 'leaderboard_' + currentTab;
      var col = currentTab === 'single' ? 'best_single' : 'best_'+currentTab;
      sb.from(view).select('*').eq('puzzle', puzzle).order(col, {ascending:true}).limit(100).then(function(r){
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
      followBtn = '<button class="t3p-follow-btn '+(follow.isFollowing?'following':'')+'" id="t3p-follow-btn">'+(follow.isFollowing?'✓ Following':'+ Follow')+'</button>';
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
      if (fb) fb.onclick = function(){
        toggleFollow(p.id, follow.isFollowing, function(){
          follow.isFollowing = !follow.isFollowing;
          follow.followers += follow.isFollowing ? 1 : -1;
          fb.className = 't3p-follow-btn ' + (follow.isFollowing ? 'following' : '');
          fb.textContent = follow.isFollowing ? '✓ Following' : '+ Follow';
          page.querySelector('#t3p-c-followers').innerHTML = '<b>'+follow.followers+'</b> followers';
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
      + '</div></div></div>';
    container.innerHTML = html;
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
          return '<a href="/u?u='+encodeURIComponent(pr.username)+'" style="text-decoration:none">'
            + '<div class="t3p-feed-card">'+avatarHtml
            + '<div style="flex:1;min-width:0"><div style="color:#fff;font-weight:700">'+flag+'@'+escapeHTML(pr.username)+' <span style="color:#22c55e;font-weight:600">🏅 PR</span></div>'
            + '<div style="color:#94a3b8;font-size:13px;margin-top:2px">'+puzzleLabel(pr.puzzle)+' · '+timeAgo(pr.solve_date)+'</div>'
            + '</div><div class="t3p-feed-time">'+formatTime(pr.time_ms + (pr.penalty===1?2000:0))+'</div></div></a>';
        }).join('');
      });
    });
  }

  /* ===== INIT ===== */
  function init(){
    injectCSS();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:true,autoRefreshToken:true}});
    window.__t3denSb = sb;

    var path = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    var isSubPage = path === '/leaderboard' || path === '/u';

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
