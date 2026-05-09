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
    + '.t3-auth-badge{position:fixed;top:14px;right:520px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:8px 18px;display:flex;align-items:center;gap:12px;z-index:9000;font-size:15px;color:#e2e8f0;font-weight:600}'
    + '.t3-auth-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e}'
    + '.t3-auth-badge .dot.guest{background:#94a3b8}'
    + '.t3-auth-badge .dot.syncing{background:#fbbf24;animation:t3pulse 1s infinite}'
    + '.t3-auth-badge a{color:#e2e8f0;text-decoration:none}'
    + '.t3-auth-badge a:hover{color:#ef4444}'
    + '.t3-auth-badge button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:color .15s}'
    + '.t3-auth-badge button:hover{color:#ef4444}'
    + '.t3-sync{position:fixed;top:14px;right:64px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(34,197,94,.3);border-radius:999px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;z-index:9000;color:#22c55e;font-size:15px;cursor:default;transition:all .2s}'
    + '.t3-sync.syncing{border-color:rgba(251,191,36,.5);color:#fbbf24}'
    + '.t3-sync.error{border-color:rgba(239,68,68,.5);color:#ef4444}'
    + '.t3-trophy{position:fixed;top:14px;right:14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;z-index:9000;cursor:pointer;transition:all .2s;color:#fbbf24;font-size:18px;text-decoration:none}'
    + '.t3-trophy:hover{background:rgba(251,191,36,.15);border-color:#fbbf24;transform:scale(1.05)}'
    + '@keyframes t3aFade{from{opacity:0}to{opacity:1}}'
    + '@keyframes t3aPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    + '@keyframes t3pulse{0%,100%{opacity:1}50%{opacity:.4}}'
    + '@keyframes t3pop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}'
    + '@keyframes t3slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}'
    + '/* Vertical puzzle sidebar */ '
    + '#t3-puzzles.t3-vertical{position:fixed !important;left:0;top:0;bottom:0;width:70px;flex-direction:column !important;display:flex !important;background:#0a0e1a;border-right:1px solid rgba(255,255,255,.05);padding:14px 8px;gap:4px;overflow-y:auto;z-index:100;align-items:stretch;justify-content:flex-start;border-radius:0;box-sizing:border-box}'
    + '#t3-puzzles.t3-vertical button{width:100%;padding:8px 4px;font-size:11px;border-radius:8px;background:none;border:0;color:#94a3b8;cursor:pointer;font-weight:600;transition:all .15s;flex:0 0 auto;line-height:1.2;text-align:center;font-family:inherit}'
    + '#t3-puzzles.t3-vertical button:hover{background:rgba(255,255,255,.04);color:#fff}'
    + '#t3-puzzles.t3-vertical button.active,#t3-puzzles.t3-vertical button[style*="ef4444"]{background:rgba(239,68,68,.15) !important;color:#ef4444 !important}'
    + 'body.t3-sidebar-active #t3den-app{margin-left:70px;padding-left:8px;width:calc(100% - 70px) !important;max-width:calc(100% - 70px) !important;box-sizing:border-box !important}'
    + 'body.t3-sidebar-active #t3-fmc-mode{margin-left:70px}'
    + '@media (max-width:640px){#t3-puzzles.t3-vertical{width:50px;padding:8px 2px}#t3-puzzles.t3-vertical button{padding:6px 2px;font-size:10px}body.t3-sidebar-active #t3den-app{margin-left:50px;padding-left:4px;width:calc(100% - 50px) !important;max-width:calc(100% - 50px) !important;box-sizing:border-box !important}}'
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

  function transformTimerLayout(){
    // Convert puzzle bar to vertical sidebar (only on timer page)
    var pathPart = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    if (pathPart !== '/timer' && pathPart !== '/') return;
    var puzzles = document.getElementById('t3-puzzles');
    if (puzzles && !puzzles.classList.contains('t3-vertical')){
      puzzles.classList.add('t3-vertical');
      document.body.classList.add('t3-sidebar-active');
    }
    // Install chart overlay fix (regression after sidebar layout shift)
    if (!window.__t3DotFixed){
      window.__t3DotFixed = true;
      var canvas = document.getElementById('t3-chart-line');
      if (canvas){
        var card = canvas.parentElement;
        function repositionOverlay(){
          var overlay = null;
          for (var i=0; i<card.children.length; i++){
            var c = card.children[i];
            if (c !== canvas && c.style && c.style.pointerEvents === 'none'){ overlay = c; break; }
          }
          if (!overlay) return;
          overlay.style.left = canvas.offsetLeft + 'px';
          overlay.style.top = canvas.offsetTop + 'px';
          overlay.style.width = canvas.offsetWidth + 'px';
          overlay.style.height = canvas.offsetHeight + 'px';
        }
        if (window.ResizeObserver){
          var ro = new ResizeObserver(repositionOverlay);
          ro.observe(canvas);
        }
        window.addEventListener('resize', repositionOverlay);
        repositionOverlay();
        setInterval(repositionOverlay, 1000);
      }
    }
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
      f.style.right = '114px';
      f.style.color = '#ef4444';
      document.body.appendChild(f);
      
      var bell = document.createElement('div');
      bell.className = 't3-trophy';
      bell.id = 't3-bell-icon';
      bell.title = 'Notifications';
      bell.style.right = '164px';
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
      daily.style.right = '214px';
      daily.style.color = '#fbbf24';
      daily.innerHTML = '⚡';
      document.body.appendChild(daily);
      
      // Weekly competition icon
      var weekly = document.createElement('a');
      weekly.className = 't3-trophy';
      weekly.id = 't3-weekly-icon';
      weekly.title = 'Weekly Competition';
      weekly.href = '/weekly';
      weekly.style.right = '264px';
      weekly.style.color = '#a855f7';
      weekly.innerHTML = '🏆';
      document.body.appendChild(weekly);
      
      // Inbox/messages icon
      var inbox = document.createElement('div');
      inbox.className = 't3-trophy';
      inbox.id = 't3-inbox-icon';
      inbox.title = 'Messages';
      inbox.style.right = '314px';
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
      lib.style.right = '364px';
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
    {id:"Aa", name:"Aa Perm", setup:"x R' U R' D2 R U' R' D2 R2 x'", probability:"1/18", difficulty:"easy", algs:["x (R' U R') D2 (R U' R') D2 R2 x'"]},
    {id:"Ab", name:"Ab Perm", setup:"x R2 D2 R U R' D2 R U' R x'", probability:"1/18", difficulty:"easy", algs:["x' (R U' R') D (R U R') D' (R U R') D (R U' R') D' x"]},
    {id:"E", name:"E Perm", setup:"x' R U' R' D R U R' D' R U R' D R U' R' D' x", probability:"1/18", difficulty:"medium", algs:["x' (R U' R' D R U R' D') (R U R' D R U' R' D') x"]},
    {id:"F", name:"F Perm", setup:"R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", probability:"1/18", difficulty:"hard", algs:["R' U' F' (R U R' U') R' F (R2 U' R') U' (R U R') U R"]},
    {id:"Ga", name:"Ga Perm", setup:"R2 U R' U R' U' R U' R2 U' D R' U R D'", probability:"1/18", difficulty:"medium", algs:["R2 (U R' U R') U' R U' R2 (D U') R' U R D'"]},
    {id:"Gb", name:"Gb Perm", setup:"R' U' R U D' R2 U R' U R U' R U' R2 D", probability:"1/18", difficulty:"medium", algs:["D R' U' R (U D') R2 U R' U (R U' R U') R2"]},
    {id:"Gc", name:"Gc Perm", setup:"R2 U' R U' R U R' U R2 U D' R U' R' D", probability:"1/18", difficulty:"medium", algs:["D R2 (U' R U' R) U R' U R2 (D' U) R U' R'"]},
    {id:"Gd", name:"Gd Perm", setup:"R U R' U' D R2 U' R U' R' U R' U R2 D'", probability:"1/18", difficulty:"medium", algs:["R U R' (U' D) R2 U' R U' (R' U R' U) R2 D'"]},
    {id:"H", name:"H Perm", setup:"M2 U M2 U2 M2 U M2", probability:"1/72", difficulty:"easy", algs:["M2 U' (M2 U2 M2) U' M2"]},
    {id:"Ja", name:"Ja Perm", setup:"x R2 F R F' R U2 r' U r U2 x'", probability:"1/18", difficulty:"easy", algs:["R U R' F' (R U R' U') R' F (R2 U' R')"]},
    {id:"Jb", name:"Jb Perm", setup:"R U R' F' R U R' U' R' F R2 U' R'", probability:"1/18", difficulty:"easy", algs:["R U R' F' (R U R' U') R' F R2 U' R'"]},
    {id:"Na", name:"Na Perm", setup:"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", probability:"1/72", difficulty:"hard", algs:["(R' U R U') R' (F' U' F) R U (R' U' R U') f R f'"]},
    {id:"Nb", name:"Nb Perm", setup:"R' U R U' R' F' U' F R U R' F R' F' R U' R", probability:"1/72", difficulty:"hard", algs:["(R' U R' U') R D' R' D R' (U D' R2 U' R2 D R2"]},
    {id:"Ra", name:"Ra Perm", setup:"R U' R' U' R U R D R' U' R D' R' U2 R'", probability:"1/18", difficulty:"medium", algs:["(R U' R' U') R U R D (R' U' R D') R' U2 R'"]},
    {id:"Rb", name:"Rb Perm", setup:"R2 F R U R U' R' F' R U2 R' U2 R", probability:"1/18", difficulty:"medium", algs:["(R' U2 R U2) R' F (R U R' U') R' F' R2"]},
    {id:"T", name:"T Perm", setup:"R U R' U' R' F R2 U' R' U' R U R' F'", probability:"1/18", difficulty:"easy", algs:["(R U R' U') R' F (R2 U' R') U' (R U R' F')"]},
    {id:"Ua", name:"Ua Perm", setup:"R U' R U R U R U' R' U' R2", probability:"1/18", difficulty:"easy", algs:["(R U R' U) R' U' (R2 U' R') U R' U R"]},
    {id:"Ub", name:"Ub Perm", setup:"R2 U R U R' U' R' U' R' U R'", probability:"1/18", difficulty:"easy", algs:["R' U R' U' (R3 U') R' U (R U R2)"]},
    {id:"V", name:"V Perm", setup:"R' U R' U' y R' F' R2 U' R' U R' F R F", probability:"1/18", difficulty:"hard", algs:["(R U R' U) R U R' F' (R U R' U') R' F (R2 U' R') U2 R U' R'"]},
    {id:"Y", name:"Y Perm", setup:"F R U' R' U' R U R' F' R U R' U' R' F R F'", probability:"1/18", difficulty:"medium", algs:["F (R U' R' U') R U R' F' (R U R' U') R' F R F'"]},
    {id:"Z", name:"Z Perm", setup:"M' U M2 U M2 U M' U2 M2", probability:"1/72", difficulty:"easy", algs:["M' U' (M2 U') (M2 U') M' U2 M2"]}
  ];

  var PLL_IMAGES = {
    'Aa': "data:image/png;base64,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",
    'Ab': "data:image/png;base64,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",
    'E': "data:image/png;base64,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",
    'F': "data:image/png;base64,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",
    'Ga': "data:image/png;base64,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",
    'Gb': "data:image/png;base64,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",
    'Gc': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4AeydC7RcVX3Gf3NvQkgTQAhVEFfY0KIIIg9BBdaCy6MNVgTRUlgVKFqUFlwgi1YKpgK6pFIp5bFEpLaCaNUqIrBssZr0TxEhFKOlIvhYuANCQxckSALmeafff+beOzNhblbuzJx9Mnf2ZH9n73PmnP3t/f2/2WffeewMkR9ZgQIUyMYqQNRcJWRjZRcUokA2ViGy5kqzsbIHClEgG6sQWXOl2ViD4oHE/czGSiz4oNBlYw1KpBP3MxsrseCDQpeNNSiRTtzPbKzEgg8KXTbWoEQ6cT+zsRIL3qCb3qWtwVj/JIktERaJ50ThLiEV57+J6yTBuVNx3iq+UlPZxjpIvX+vcGQiHC0e5zteeSrO48R1huDcqThPE99RQmmpbGMdVuu5j1mPqVQkblP99VTx7HZtVhQMH6JE4ammc2LOurbOXgJqHS6Bd5zy0FrhjbVtsZvnW6vfqXW3kL0mjprOKwthaa30DdqdAVVldW1VKCPVOlwGcY2zwmH8rkpzhaJTw1jDTtUUdN8tBE0c2ziBj5CeF4mZqlzzi4qGZb/taq+cVKaxdtbrKnAAaR4NY7n2NAW9MP7tVLMCrC2zfJNixHKeg7XRkOUv171ULCWVaazDaz3ev7YtftMw1mw5qzr75YyFHJkHo6p4jkCKEct5DvFNHaXdDss0Vr3T6UesuQq2XtB15Yveiss13t55Uo5YzifUNVYhdfJOp+Yc5ztUN4gqvzO+W3D+64n6txsL9sSBIgt+y5XIO+mWuD6VsXZTh8TrL56BM9YQFd7CgVQYIs3Db4UVXlKAd5boaTjF4ly6F84T73MrtJ8qHYa0hf2AbYXkKVVYN+3YgZq4z2L/TQ8XuF8fsVboZbzDjgXSbFr1GFdF5nou1YjlbfAJvHKPrzymUuLkxIkpa3T1ITrV/MopV1LVPx80Kj6K+KEUaOJa9Vx9Ip+CljFjOVdday8lxGAZC1a7tk3B9t1C0cT1ku7GyfTWe1njs4yBMtZRvEbxHLtPqNQ29eyg7n+ylAf19V5nU7B9t1A0cR3gzajfkQulrFXuEyt/F15zO/+MsnYs5cbFTsnnbxReLcJd+ZW2eyeC28mjCjUrLxStBzwFzhPXWHI69tCOF1LgYXGp2/6W3YUqJk1FG8t1PFU9ulZ4UPBb0QXKc0qqwNBVontIuFLwr/C8UnmhqZfG+i211D+fulj5HcIzwuPCl4Xz9OHVIfvuxgyVc0qugP4mZW9NuyofFvU3BMVm+CnlXxHOF3weVvs8U+WepG6MpfcZORO4UVgqrBL8i2xXKD9hxzn89vH6q+/j74ZFF8GvddZDl+uZprR2LaTAyEgTqYrz56fh9b45lygn0shIOu4J0lrh3gq4l+7U3kLh2FdrZnCyCtcI34ch3U0q96vsU5U/Ui6VtO0wdWMsv719XrxnDw9x4JsCQ+ccA1/4APxUA+6KG6jcpZvewhPg6H1gu211Zps0Ux/cFY02tBTNOV5/Wdwv59VsC/9cWs7GB66v6ZRlir+PCTep/D5F4o1vhYqixleBZYLfQpVNPaniqV80dsUrdpjN6D2XwGq1y0ejT58Bp+uj5dfuMnZGzvpAAf/ekk+DfaC6V+1dLvi3qef6/bPjb0dMzViibE5r1lM54nWwrbzefHyyctVfNJM9mY9vJQr4H5EaHVhXUYM69kfHF4o0p6zApApkY00qTX6iGwWysbpRL187qQLZWJNKk5/oRoFsrG7Uy9dOqkA21qTSDPQTXXc+G6trCXMF7RTIxmqnSj7WtQLZWF1LmCtop0A2VjtV8rGuFcjG6lrCXEE7BbKx2qmSj3WtQDZW1xKmqaDfWLKx+i1ifdLebKw+CVS/NTMbq98i1iftzcbqk0D1WzOzsfotYn3S3mysPglUvzUzG6vTiOXrNqtANtZm5clPdqpANlanyuXrNqtAV8Ya8h8Ibbb61icrm5y/YAEcfXTxaG1FfS8Fr3PU2Vq3frxouLatrGn3ujLW2g1UvnQ/XPcduOx2+OCt8MefgQWfgoMvhT3/Anb4M6j8SR2zz6LlYQZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYNZCyxNPgBmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYgRmYUeNqZjcDMzADMzADMzADMzADMzADMzADMzADMzADMzADMzADMzADMzADMzBrZvXygo3we+vgbVXwH6ieo4P+U/u/U+4/aPflNvwHqz/W/tPCeh8GdI2KHaRujLVhVE087UY4/4tw+Tfh09+FLz8A/662LV3GumXPsvyF3/A/atc9wrcEb7GynNIr8MPlsERDwH3/CXc/okg9A9fLaJerKb4uyOnK3y74ypK+vpSCC/5raB2beurGWFeK7mbB7e64RWX/zb+sX1lUrc58dLS6zQYY3lPHfRUab/WrVc6pHAV8MWWPwZFDldHdh4c2rq1Q9Re9/5c/ihm+8ozHcDymnvt+R63txlhu8zPF6v+blkM3vLknw/x3wIHHwBH7w4mvgbPmwF/pNF/d6C+VN5KvxNI7iHn+5GiwTn5OUW0pi7uZ9yMnwKXvhI8K5x7L3FPewvzf3483HbQ7I/Pn8QdzZ6HYoRgyHlPP/RidPLox1lyYo6HS1/PyZbCeF//Tqu/Hgt/gNeniH3VMEy4uUf5yY/385xAjxAgxQowQI8QIMUKMECPECDFCjBAjxAgxQowQI8QIMUKMECPECDFCjBCj5no+ZqoFzSlGiBFihBghRogRYoQYIUaIEWKEGCFGiBFihBghRogRYoQYIUaIEWKEGCFGiLGZsV7eU22JEWKEGCFGiBFihBghRogRYoQYIUaIEWKEGCFGiBFihBghRogRYoQYIUaIEVzbOmN966v+XHaSpizCdafBlzT3vVtz4B98jOFlVzNz1U0Mb9QY9cz18OgnYfZM/F7o/2tLvYIpbmWCKV7RcvqGCrxWR3YWtqQqb6tOzWmrVMD/yn/l9rD3rrCxHqotCWrbvnR8Ydva8sGswJgC2VhjQuSstwpkY/VWz1zbmALZWGNC5Ky3ChRprN62NNfWVwpkY/VVuPqnsdlY/ROrvmppNlZfhat/GpuN1T+x6quWZmP1Vbj6p7HZWP0Tq623pW1alo3VRpR8qHsFsrG61zDX0EaBbKw2ouRD3SuQjdW9hrmGNgpkY7URJR/qXoFsrO41zDW0USAbq40o/X+o/B5kY5Ufg2nZgmysaRnW8juVjVV+DKZlC7KxpmVYy+9UNlb5MZiWLejSWJUpijLV86dYfT691wqMdlphN8ZaDWvklO3FPY5dN8K+6+EI5e/S8T8V/Gf1n1T+WeE2oZH22gtCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgMf9h9oN2lopBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAihRuWbCXhbQoAQIAQIAUKAECAECAFCgBAgBAgBQoAQIAQIAUKAECAECAFCgBAgBAgBQgDXdoJUha88ANd/h9riLed9Ed5zIxx3Fbz5MtjjQka3P5vR8VWBPF+3AcWWVbq0o9SNsa4T482CLwjiuAVe/Do8+a/wI4NFS+EbT8I/yIBX6DQ32J8rbyRfTigVGqzUlhZKxes8ZXE38773c+CG8uWmblikQD3IrxY/yn8/9EsWxWe5a9Ua/kXnK4Z4LB0e22t0rKPUjbEuEuOZgi8I4vAFJU7R/onCMUOV6huGhzZuMzQ0ukz7MhrfUp6XMZIIJaWnxOsxuGfjKI+vG2XG+o28vgrH6LjHzBfN8hh6LB0eW1/NRU9PPXVjrOFZM6j+x8XgWCSbfe2D8Fk16YqT4YLj2Ob0w3nV8fuz7+F7ceRer2LBjnPY1dcHmHoz8xU9UGA31fF24Ujmsh+7sQv7sA2H64gffY9yX4tNMcRRd8YMHe0o1S/v6NL6RSN7g+PofeAPD4EPjMDFx8NV8v/nz4I7PgTfW0jlZ3/LjKeuoeKLtdWv1HU6d2QkTT7O6bkvVzQykobXuZxzHCMjaXhHRsYZlQ8L3xTuEx4RfIGg7yq/TfAFgXxRv79W+TzBTeUYRoNZbZ6lg1NPXRtr6pSNK779bVi8uHg0GBulFLzO0WBslPx40XBtJxj1pxR7aG+e4CZTtoWpY390fOEWNiyfNqAKDKyxBjTeybqdjZVM6sEiysYarHgn6202VjKpB4soG2uw4p2st9lYyaQeLKJsrMGKd7Lebj3GStblTJRCgWysFCoPIEc21gAGPUWXs7FSqDyAHNlYAxj0FF3Oxkqh8gByZGMNYNBTdHkzxkpBnzmmqwLZWNM1siX3Kxur5ABMV/psrOka2ZL7lY1VcgCmK3021nSNbMn9ysYqOQBbA30RbejKWP7Ds/t/AWvWb1nTKr4awJadms8qS4E1Iv6R4MGFUhYF+YUvHHHYx2HO+6kefCmc+wW49T742XI1LKf+UCCqmXcIHxN8HZcDlZ8qbMCHgSdV6ih1M2J9SIy7C6eOVrl26TKW3LiY9WfcBK+7COadw+g7/h4+cScs+gms0iuhWn8V6JJGWq/Rrmg02BqlojnH628wNkrjzxWZN9iaSi+q/H3hM8LZwpupcpxyxYt/Vv4TjVBVfqjSDYKv3fBh5R2lbozlhE9o81XhApnmrTLYXJUPEy5c8SJfv/thnl54Gxx7Jeygjhz0UT3TlGbNghQwayJV0VeAScHrHM4lyolklqbPzj1B6oWTtDlYeJ9wrXCP8AL/p62PV5co9x/lb6f8IOFc4RbhJaGj1K2xNiVdpwP3C1cLp2wYZTfluwrv0mD1qcf+lyV5URCpUUZ6nA1UeUDUvvyUrwrkP7rfRfvvFP5GcKt1bCRd35J6bayWysd2fMZ1u8o+rPqodqHKOaVVwBco87vJoaI9X/C1sHx2pWIxKYWxNm25RrPKb+AA4IVE8Du2qGBFbfsJbR9LhIvEU08rfTb8nMreiM2iR+fMVz1KTwkfEdYKyVIZxlLnqpppPKxc/tK2+LSDKDys+MQUnifdY+UE1aPbw2itFROHiiu4gcdeTtK6OJ7Jai7JWGge5m+R+BsmkzWtl8c9nK9wwjm1WlMaq8G13Txqf8KT4vFgg0RaN3ZSlUo0lnfxv3yTCPO8r/5XT9oRq26sqqy9006kM5avrUb9MVDGWqI+awRJaawdRTmk2FKlHmySPJyrgm938haQ6OHGkpl9XpXqttDSM38VtxxItLNKPI/AkqryRKnmqZ01ZqzAw0yih3NVeVYdne0tSMGqVyy6FeqtxdrbC76bgraFoyxjeSM0RC/Xi8qnmb5bNHy8qM7UeLWCxoS6aFLE5YH1FxLeguIJwf/g1VAlbX0um4Lx5RwlG8sb9D3fJMDEePHCWLCnwNnFqSvxAPuHKaQylt8Gx1qsF+9YvBUzwwAAAa5JREFUKXFWprH8XWB1N9U8a8JYq1lBmn77uyn1D3O9xEQL1OsiU5Oi/slgkVST1p1G4Pb0GrErq6FJhvbn9ejoxHixFk14qI0hPap6smp8flV/Th+1k3TE0jD5S1E/K5SSyjSWOly9F5YqzD4N0W6haWK88M8z07zlsHKiQ74gdpIRyydzPxWtRC1ttBI9JRvLJ5dr9eLyd+G9OUViwlh1FzdGk+JIN+GYGDOLY+QHjbpLm195E8o21tir6gi1RR94UCT8v4sRjT5WqW3fre3eBcO/oiKK8XSUCm7vIuHf1RONpzFtvZgeZRtrkbrsXzHzr2ykwGLx3SzcLaTgc467xOX/sYhz+34KfE6c9c9FVSgjlW0s77P/90D+JbOpoNNz/X+68i+2vU3EndYx1etOENedgnNP9dpOz3+/+EpNW4OxShUgkxejQDZWMboOfK3ZWANvgWIEyMYqRteBrzUba+AtUIwA2VjF6DrwtfbMWAOvZBagRYFsrBY58k6vFMjG6pWSuZ4WBbKxWuTIO71SIBurV0rmeloUyMZqkSPv9EqBbKxeKTkw9WxZR/8fAAD//8vdzOIAAAAGSURBVAMAvkdbln45e2wAAAAASUVORK5CYII=",
    'Gd': "data:image/png;base64,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",
    'H': "data:image/png;base64,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",
    'Ja': "data:image/png;base64,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",
    'Jb': "data:image/png;base64,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",
    'Na': "data:image/png;base64,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",
    'Nb': "data:image/png;base64,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",
    'Ra': "data:image/png;base64,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",
    'Rb': "data:image/png;base64,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",
    'T': "data:image/png;base64,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",
    'Ua': "data:image/png;base64,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",
    'Ub': "data:image/png;base64,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",
    'V': "data:image/png;base64,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",
    'Y': "data:image/png;base64,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",
    'Z': "data:image/png;base64,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"
  };

  var OLL_CASES = [
    {id:"1", name:"OLL 1", group:"Dot", algs:["R U2 (R2 F R F') U2 (R' F R F')"]},
    {id:"2", name:"OLL 2", group:"Dot", algs:["f (U R U' R') S' (U R U' R') F'"]},
    {id:"3", name:"OLL 3", group:"Dot", algs:["(F R' F' R) U S' (R U' R') S"]},
    {id:"4", name:"OLL 4", group:"Dot", algs:["S' (R U R') S U' (R' F R F')"]},
    {id:"5", name:"OLL 5", group:"Block", algs:["(r U2 R') U' R U' r'"]},
    {id:"6", name:"OLL 6", group:"Block", algs:["(r' U2 R) U R' U r"]},
    {id:"7", name:"OLL 7", group:"Lightning", algs:["r U R' U (R U2 r')"]},
    {id:"8", name:"OLL 8", group:"Lightning", algs:["R' F' (r U' r') F2 R"]},
    {id:"9", name:"OLL 9", group:"Fish", algs:["(F R' F' R) (U R U' R')"]},
    {id:"10", name:"OLL 10", group:"Fish", algs:["R U R' U (R' F R F') R U2 R'"]},
    {id:"11", name:"OLL 11", group:"Lightning", algs:["r' (R2 U R' U R U2 R') U M'"]},
    {id:"12", name:"OLL 12", group:"Lightning", algs:["r (R2 U' R U' R' U2 R) U' M"]},
    {id:"13", name:"OLL 13", group:"Awkward", algs:["r2 D' (r U r') D r2 U' (r' U' r)"]},
    {id:"14", name:"OLL 14", group:"Awkward", algs:["F U (R U2 R' U')\u2028(R U2 R' U') F'"]},
    {id:"15", name:"OLL 15", group:"Awkward", algs:["(R U R' U R U2 R')\u2028F (R U R' U') F'"]},
    {id:"16", name:"OLL 16", group:"Awkward", algs:["R' U' F2 u' (R U R') D R2 B"]},
    {id:"17", name:"OLL 17", group:"Dot", algs:["(r U R' U R U2 r\u2019)\u2028(r\u2019 U' R U' R' U2 r)"]},
    {id:"18", name:"OLL 18", group:"Dot", algs:["(R' F2 R2 U2 R') F\u2019\u2028(R U2 R2 F2 R)"]},
    {id:"19", name:"OLL 19", group:"Dot", algs:["S R' U' (R U) (R U) R U' R' S'"]},
    {id:"20", name:"OLL 20", group:"Dot", algs:["(R' F2 R2 U2 R') F (R U2 R2 F2 R)"]},
    {id:"21", name:"OLL 21", group:"OCLL", algs:["R U R' U (R U' R' U)\u2028R U2 R'"]},
    {id:"22", name:"OLL 22", group:"OCLL", algs:["R U2 (R2 U') (R2 U') R2 U2 R"]},
    {id:"23", name:"OLL 23", group:"OCLL", algs:["R2 D' (R U' R') D (R U R)"]},
    {id:"24", name:"OLL 24", group:"OCLL", algs:["(R U R) D (R' U' R) D' R2"]},
    {id:"25", name:"OLL 25", group:"OCLL", algs:["R2 D (R' U2 R) D' (R' U2 R')"]},
    {id:"26", name:"OLL 26", group:"OCLL", algs:["(R U2 R') U' R U' R'"]},
    {id:"27", name:"OLL 27", group:"OCLL", algs:["R U R' U (R U2 R')"]},
    {id:"28", name:"OLL 28", group:"Edges", algs:["(r U R' U') M (U R U' R')"]},
    {id:"29", name:"OLL 29", group:"L", algs:["R' F (R U R') F' R (F U' F')"]},
    {id:"30", name:"OLL 30", group:"L", algs:["(F U R U') R2 F' R (U R U' R')"]},
    {id:"31", name:"OLL 31", group:"P", algs:["R' U' F (U R U' R') F' R"]},
    {id:"32", name:"OLL 32", group:"P", algs:["S (R U R' U') (R' F R f')"]},
    {id:"33", name:"OLL 33", group:"T", algs:["(R U R' U') (R' F R F')"]},
    {id:"34", name:"OLL 34", group:"C", algs:["R' U' (R' F R F') U R"]},
    {id:"35", name:"OLL 35", group:"Fish", algs:["R U2 R2\u2019 (F R F' R) U2 R'"]},
    {id:"36", name:"OLL 36", group:"W", algs:["(L' U' L U') L' U L U (r U\u2019 r\u2019 F)"]},
    {id:"37", name:"OLL 37", group:"Fish", algs:["(R U R' U') R' F (R2 U R' U') F'"]},
    {id:"38", name:"OLL 38", group:"W", algs:["(R U R' U) R U' R' U' (R' F R F')"]},
    {id:"39", name:"OLL 39", group:"Lightning", algs:["(f R' F' R) (U R U' R') S'"]},
    {id:"40", name:"OLL 40", group:"Lightning", algs:["f' (r U r' U') (r' F r S)"]},
    {id:"41", name:"OLL 41", group:"Hook", algs:["r U R' U (R U' R' U) R U2 r'"]},
    {id:"42", name:"OLL 42", group:"Hook", algs:["r' U' R U' (R' U R U') R' U2 r"]},
    {id:"43", name:"OLL 43", group:"P", algs:["R' (U' F' U F) R"]},
    {id:"44", name:"OLL 44", group:"P", algs:["F (U R U' R') F'"]},
    {id:"45", name:"OLL 45", group:"T", algs:["F (R U R' U') F'"]},
    {id:"46", name:"OLL 46", group:"C", algs:["f R f' U' r' U' R U M'"]},
    {id:"47", name:"OLL 47", group:"L", algs:["r U r' (R U R' U') r U' r'"]},
    {id:"48", name:"OLL 48", group:"L", algs:["R' F' R (L' U' L U) R' F R"]},
    {id:"49", name:"OLL 49", group:"Hook", algs:["r U' (r2\u2019 U) (r2 U) r2\u2019 U' r"]},
    {id:"50", name:"OLL 50", group:"Hook", algs:["r' U (r2 U') (r2\u2019 U') r2 U r'"]},
    {id:"51", name:"OLL 51", group:"Hook", algs:["F (R U R' U') (R U R' U') F'"]},
    {id:"52", name:"OLL 52", group:"Hook", algs:["(F R' F' R) U2 (R U' R' U) R U2 R'"]},
    {id:"53", name:"OLL 53", group:"Line", algs:["r U r' (U R U' R') (U R U' R') r U' r'"]},
    {id:"54", name:"OLL 54", group:"Line", algs:["R' F (R U R U') R2 F' R2 U' R' U (R U R')"]},
    {id:"55", name:"OLL 55", group:"Line", algs:["F (U R U' R') (U R U' R') F'"]},
    {id:"56", name:"OLL 56", group:"Line", algs:["R' (F' U' F U') R U R' U R"]},
    {id:"57", name:"OLL 57", group:"Edges", algs:["(R U R' U') M' (U R U' r')"]}
  ];

  var OLL_IMAGES = {
    "1": "data:image/png;base64,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",
    "2": "data:image/png;base64,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",
    "3": "data:image/png;base64,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",
    "4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4Aexda2wc1Rk9s14nzsPxxnkASRMTIqKEEOLgvEvwABIFSqGtoCABpUVClUA0IBB9gCDwg6qiQrzVH7QlKhSoUCtALeUR5AAiD4yTCEIiKMk4aQJpYseJnaft3Z5vsnbGm3Ua7/je8Xo+6569M3d37rn3fGfv3J3ZvU5A/1QBAwqosQyIqlUCaix1gREF1FhGZNVK1VjqASMKqLGMyKqVqrHi4gHL/VRjWRY8LnRqrLhE2nI/1ViWBY8LnRorLpG23E81lmXB40KnxopLpC33U41lWfDjdIN7ayAY64+UuM4SVpDnauINwhbnm+T6ASHctjj/TL5IU9TGOp+9/ylRawkXk0f4rmRui/Mycv2YEG5bnDeS7yIishS1sRZLz2fPng3XdY2ipqZGqASOPLzzDpBOm8XatcLkw9fZBueaNT6fPPjaykYU8DscBXGWc5Hk5eXlkhlFe3t7j/rHjOmxa2QnwOHr3NRkhKZHpdXVQDKJDAt9bZlHkhKRsB4nXTxixAgKkTxeYmiro6Ojq+YS2QgEXXaNIMAxRAhsGKu0FJg/H47jQE67QhsJojTWWPb4zFGjRjEznwIjFqUHAkE3Ri5dY4Cl/qHy0Nwsj+axcCGQyWAkmc4mIklRGuvb0uMIjDWM7+rM8OHC3gNGdsaOBWdyGCGV2zLWggXC5iOy02GUxvI7bctYgVPhSAZb5iC+8qYfxo3zv/7tD8s2ToXSHxmxJCd8jZlbT5EaK5FIcOSwM3QEToXl2WBbEVtOuYkEKnlKbLc1Yk2a5J/q5c0TO2OJoRdUVFQ4/LMS4KyxDjLIYyXYVkhJIly8rDHGcdBka8QiLS68EHJZZRa3ywjrSQJsnZSEc4ihtk6D5EL2VNjMIFdIsKXMBrJcDnmtGis7z5L4RnI9S4ht6JvL4Q/RNo3FEUtODfK5zMkGO7dNRvYDXK179kAm8kZ4ciuNep4VN2O1SQACwZZdo6is7K7+4N69sKb3vHkAT/tC7r+JZcMmrHU0p1MXlZWVoZSf+3PKe+z25w5PhdLXGVJnINiyaxQBE1fz2hJaWozSdVc+bBjAO2Xg3E7uUXaX29oQsW1xCY9cKHyMG2ccPnwYdXV11kBOSaPl4Z57jr2b5R1tGrfeKow+/LFLTG2as6v+dev8C6W0GO72W2DxwbSxprAv1xNPEHJLVk5Fd3Fbk10Ffke6euK3hHyFZzxzo6k/jTWcLZX7U79i/hqxi9hCvET8nEPyvJkzYf6mIMk0nagA78nKV5Tu5TN/I3Y5jrOD+cvEUkLmYf79TG73SwpjLPl+wE/Yit8TDUQrUUc8Qlw1ejTGXXkl8PDDwLvvAi0twMcf85lAqq2thQ2kUqkAKzB06FArvNI34QqSp1Ipa9xB3pqaGmfJkiWcd83GlClTUFlZOSGZTF7L1zxOfETI2WQVc5mq/Ij5ZKLgFMZYcnr7E5l/VlKCOTU1SNx2G7B8ObB5M3g1EM7rrwP33w9czOljb9+M4TuHE0zHKNjGE5INXuE4gZgFUm4apDkhlTBQo/mOr6qqwqxZs3DBBRck5s+fjxkzZmDChAml5eXlvH0Nmaq8woMbCTmFMut7CmOsVEUF0nV1QCvHKhmNnn4auOkmYNq0vjdEj4hGgeG8G3/aaacxZtPAUY1X7C9EdXU1aEK55lbwtyP6ZqycvvODncNbB+CVg5xn8u/Kx+38z2jpQFGA92+R4uk6k8k4bFPB/ij4QJJqUgV6VUCN1as0+kQYBdRYYdTTY3tVQI3VqzT6RBgF1Fhh1NNje1VAjdWrNLF+InTn1VihJdQK8imgxsqnipaFVkCNFVpCrSCfAmqsfKpoWWgF1FihJdQK8imgxsqnipaFVkCNFVpCOxUUG4saq9giViTtVWMVSaCKrZlqrGKLWJG0V41VJIEqtmaqsYotYkXSXjVWkQSq2Jqpxio0YnrcSRVQY51UHn2yUAXUWIUqp8edVIFQxpLFJ05ae86TjvygKFC2YcMGrF+/3jgClN2b6y3wCkc3YWBDyk1DtA1QWt8MZawjR+C8+CLw5JPAQw8Bd9wB3HADcNllgKzPNHUqkErBX6dJTDhcVncIdLGlpQUtlhCgxRE23BavcAW5bfEKT5B33bp1nQ0NDUdp6Mxnn32GzZs346uvvsK2bduwc+dO7N69249FW1ubr086nXZ4fCdRUApjrI50+tgvn++885ixnnkGeOkl4O23gYYGHG1sxDf79+NTtmwl8Q9iJ6EpAgVaW1sZi/3vtLS0vN/U1LRxF/+2b99+dMuWLfjiiy+wceNG/8xRX1+PVatkCQe/kYywn/f5IYyxZEmc58ko6zcIlnNbfvP/Gk95K5JJbCI6SkpwFstrie8SEwhN0SgwkbQSg1rHyVQlEpkjjJO86VewXFYHkpVnJIZdMZVc9vl031MYYy0lnaw2I/9NS3BzeTmurarC9+bOxSUXX4zZ11yDb912G0Y88ADw4IPAfffxiECSlVj6D0P9VWR6qy9Ai8mTYRVB7t7aZ6I8yCvaSwwkFrffjpHXXYfJl16KmvPPh0s9rhg5Etfy9TcTXTGVXMpY1PcUxlgjR4xA+vPPgV27APlXNfv2IbF1KxLyH6jefBN44QXgiSeAZcvyG2vhwoVYtGiRcQyTdRNztPE8wPMAzwM8D/A8wPMAzwM8D/A8wPMAzwM8D/A8wPMAzwM8D/A8wPMAzwM8D/A8wPMAzwM8D/A8wPNySLkrbbHRZ9GWdN2py1jLlh2LicRGYsQzX4nnoZRTlhKJ4TffABJTSiaLARf837PCGEvM5EyfDowbB3+C3t2LXjYy0tRentPi6BWQD1jjxwMS085j0/aC/VHwgdHLoC0YyAqosQZydIq4bWqsIg7eQG66GmsgR6eI22bSWEUsizY9rAJqrLAK6vF5FVBj5ZVFC8MqoMYKq6Aen1cBNVZeWbQwrAJqrLAK6vF5FVBj5ZVFC/ukQJ4Xq7HyiKJF4RVQY4XXUGvIo4AaK48oWhReATVWeA21hjwKqLHyiKJF4RVQY4XXUGvIo4AaK48oxV8UfQ/UWNHHYFC2QI01KMMafafUWNHHYFC2QI01KMMafafUWNHHYFC2IJSx5HdofVHFcfryan3tAFAgkrUb2g4dgiPm6sKoUeg880y0z52LziuuAG68EVi6FHj4YeCpp4CXZXWAgFqrV6/2F6CQRShM4hAbGqD1N9lO2IBPBnRn0haTfe2qW7TtJuWGaC8xkFWBJCYSm8svBxYsAKZMQbqiAumuOEp+9ChkGGjloQWlMCPWk2SUhSNkQRDB8rY2vLptG/7Z0IC6t95CwyuvYPszz6Bt2TL4BrvlFh4RSLLEjy0EaME2WkWQ21Z/hSfIK9qLocRYzz6LA6++iv+89x421NdjRWMj3mhtxV/5elkERGIpkNg+zrKCUhhj/YKMsnCELAgikAUlrmPZ1cQlmQzOTaedIZmM08j9OkKXMaIIEaYd5JYYrOzsxBaOSMn2dszIZHAJyyVm1zOXGEosBRLbX7KsoBTGWCWJRCJTXV2NamL27NmYOXMmpk2bhrPOOguTJk0achr/xowZM7OioqJ22LBh30kmk2c4joywBbVVDwqnwEQe7i9jVFJSMqusrOz08vLyIZWVlRg/fjwmTpyIqqoqnMn5gcBx/DgleUxBKYyxfMJUKoUUMXr0aIwbNw4TJkzA5MmTMXXqVEyfPh3nnnsu5syZ4yxYsCC5ePFiJ8O3iH8gH1I8zhZI151kySBbvMLVTcwN1wVcF3BdwHUB1wVcF3BdwHUB1wVcF3BdwHUB1wVcF3BdwHUB1wVcF3BdwHUB1wVcF3BdwHUB1wVcF3BdkmWT4ziYy4kv9UdtbS2WLFkCWY2mpqYG5513Hs455xycffbZnGtNgZhK4DiOLOHiuytbTZ+y0MbqE1vOi2WUk9HONHJo/V3TnF31+2Q5D5zbwDQ4x+1mlTfz8OHDMWTIENAw3eWnsFGwPwo+8BQapS+JsQKxNVaMY26l62osKzLHj0SNFb+YW+mxGsuKzPEjUWPFL+ZWeqzGsiJz/EjUWPGLuZUeDxxjWemukthSQI1lS+mY8aixYhZwW91VY9lSOmY8aqyYBdxWd9VYtpSOGY8aK2YBt9XdkxjLVhOUZzAqoMYajFEdAH1SYw2AIAzGJqixBmNUB0Cf1FgDIAiDsQlqrMEY1QHQJzXWAAhC1E0wwR/aWPv370c6XfDaESb6pHWGUEBiKTGVn4yxmoIDG8ZY/2YjnIaGBnzwwQeZTz75BF9++SV27dqFgwcPsk2aikEBiZXETGInMXz//fchMaWx5Meq2wvtQxhj3UnSKuJ6NuKJ1tbWNTt27GjftGkT1q5diw8//DD96aeforGxEXv37kVnZydfemLisTCNE1lhnLOrT/m429sB08jHKzGQWEhMJDaMUUZiJTFj7MAYygi1jsc+S8jaDfcyLyiFMZYQbuPDK8RdxEJiJLGYuLujo+PV5ubmnVu3bsWGDRtkVEN9fT2fOp5WrlwJG2hpaTlOyi1ZicUGr3AIFym7U10dMHSoHXSTckO055nFj4XEpKmpCYzRf/nUa8SvCflRfjnz84nbieVEwaeesMYid490lHuriMeI6/iuncj8DOKHxKMcdtcw1xSBAtS+g7SriScJWRVoCvPTie8TvyFWEgUbicf2SP1trB6VZ3e+Yf53QoZVGdXu5rYmuwo8Qjo5myxivpSQtbA85saSDWPlNv4xx8Ghmhrw06QdcNTvakOzbDz3nB1e+bD86KPC6GOvPLquC/f/oZ+eLysrE0pZF+s+bhwhrKUojMWJM+rWcYqYZwVHIx1PpQCaGfwjKxAwGovMpmbfyj7HpmQyKZNjf8f0Qzs/HRw+fFhoOKuTzC4iMRa7uErezbxCwU3zSUyVSkGCOkLYAsGWXaMImLi8tLRUPsIb5euqfN++fV2bMuft2raWR2Ys6eFqmUrKhgWMHQvpq3zqsTpiZY0li5hV2jSWXOTMyhorY8mnw/Qaecz23nQ2ZgyQSKCSPJlssLlpPgkXeeV6hxjLPGGWIWssmVetzxZZzeRdbJUwSybLPG/86CPIOzlbZDYTY2UyGMsgN0uwzbIdr124eNrfw5JhnGMxM594mQc0lmgr5wSZApgnzWGIyljSjFVffw1nj0gue4ZRybGKxiplkK0aa/duf24nbyTwVGi4l8eq5zUrfuJOO9yL5DRIXkRqLGkAL75LZhwyYmVJ9meDnd09lazw13DEkgAfkBpsGYujldAJYmksGaZha54lI5YoTbTRWFbeUAdoJ37qF2MdIi9snQoDxvpIeKOAFYF76dhmXgZos/XJMGCsIzwl8oZrL63qx2KOVl218bYzrJ0Ks8baSnJLEw0y5aREzr7VXQb4A96XznDeY5w3cCqU+5lWLjkEjOV/tcPGqZA3lnFAhkogstFKghmpsdiAVbw47MhVeG4bTQFj+Z+SNMdJRAAAAPlJREFUAkE3xpvLYeNU2Nrqf06QPkU2vxLyqI3lv6vmzYNcYzKKSy+V7vrwjWWZ0yeWL9LV1dWhziDkK0o+WcxHrBUU4S+EfGXDBt4j1/PEvwgbfMLxBrn+QAi37NsAb7PDvy9K3khS1COWdPoGPrh9RKGvl/90JV9su9wSn7TzKnK9Tgi37NvAreSLNA0EY0UqgJKbUUCNZUbX2Neqxoq9BcwIoMYyo2vsa1Vjxd4CZgRQY5nRNfa19puxYq+kCtBDATVWDzl0p78UUGP1l5JaTw8F1Fg95NCd/lJAjdVfSmo9PRRQY/WQQ3f6SwE1Vn8pGZt6Tq2j/wMAAP//XtrvtQAAAAZJREFUAwCOwqLDt5OlKQAAAABJRU5ErkJggg==",
    "5": "data:image/png;base64,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",
    "6": "data:image/png;base64,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",
    "7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4Aexde2xU153+xi9wsGNsE6fBCxyIQDxCMITwcKDcJlLY7KPNrpRNpE232VarVIq02SpS9pGqrz8arbKtmlaNVlV3N3Sr3WSV7qpLd9M2IjpghElqKCQKEOUBpAFhCo5jOzxs7On3XWbM2Bgrnut7rj33oPPNuffOzPnO7/t9c86Zhw9l8P+8AjEo4I0Vg6i+ScAby7sgFgW8sWKR1TfqjeU9EIsC3lixyOob9cZKiwccx+mN5VjwtNB5Y6Ul047j9MZyLHha6Lyx0pJpx3F6YzkWPC103lhpybTjOL2xHAt+ha60j6aCsf6VEltH2EGezxDbCVecL5LrTwhxu+L8d/IlWpI21hpG/5fEFke4kzzi+yPWrjh/n1x/QYjbFeeD5PsUkVhJ2litivyXvwSGhuLFr34lphAZ3a5atQpBEMSK2267TVRCqLNjzlBbkSeBMOAkiHOcG1WvW6fbeHH27Mj2KysrR16I4ayAI9R5YGAgBpaRTdbU1CCTyWR5NdSWdSIlDDgRZpJmMmhdsQK4/nqexFwKjFUuqoKk6zQWVFRU5Nut0sGlS5dUxYpMJkM9r9eorGk3Vq7xGk/SWHOyWZgNG8br3uTd19U13FY4VBUkffiOyT4o4Jihtl2MWOK5/vIrtYbHi4lESpLGukMRr1+v2/hRMGJVZzhVlJeHA1chcSzHHBm5esQsNe7YWKJMbDpM0lhh0AmMWDVMttYgEj52VFVVSeNwsncxFSqg3Iilw1BjHbiGgnbNmefbOHMmssuX50/jrQumwtpcsuMlzLWemw4beMoBK/7FO3kwY8YM5F48qTNWWSaD9a2tyJQ5sramwkwG5yj8nFyyeRh/YYJF0sibs3QWKzelrq5OC/iVZJtJOC+O0npVXKu5cJ/hahoUu0YsGktL+LpcsnU5duS4lOSzrqZCBZWbDpXfVp27hohdc4ovHKJdLdxFeOYMsvwQVsbK5JKty7GjgKuXI5YW8rFziiBnLB2GWuvAJRI11kaHIctYFLaP0PpDlRMUTLvnaCxneqfVWJ9auBCYM2f83E7WvZx20dMDJXWZ2ixItk5jRcGI1SIiV9NhGRev+hSenPqOkpXbIrFdMuqDwm+T8KajRwHG7gT6yErmIm89gXfeeQfWWid48803RSnonSF2797thNcyvr6+cICuJvljhNMSt7E4LuEBRvQ08SqhSL/E2heHCvAF/E+k6yD+kdBPeJpYx1om01jXsaf6furvWf+U6CTeJf6T+Gvi9lmzZg1/ecZzXxwpwDctWL4ca/iu+HFS/jfRya8xT7B+jniU0Gq3ivWklSjG0mczD7En/0zsJ3oJS3yT+DTXMTc0NjZiIRdT+rnI5s2bUfAzEj4E2LJlixPMnj075MvfzJ8PXLzoBuLK86pWX1zFLb489u1DprsbeOkl4BvfALZuxdyGBtzH+79D7OGo1kfjtfNYS5U/Y02VeFtkiWIsTW//Rt6HM5nM6tra2rLm5mYsW7YM69atw6ZNmzIrV67EggULUF9fj2t9N8fn6mcesYJ9vKroVzMucBUxLyQRs9aYtbXAXXcBX/4ysH07wHfKZUeOANu2AQ8/jMrVq7GBBtNS5Xl28zihKZTVxEsUY83mqDTU0tKC/Gi0ePFi3HjjjbjuOs2KE++Mf4Z7BZYsAT77WeD73wc6uArr5bxjLUAT6jO3on8dMTFjjYp7aGgoo6Fdb21H3eVPp6kC1dXAJz8JLRUyDKFofxT9RJL64hW4pgLeWNeUxt8RRQFvrCjq+edeUwFvrGtK4++IooA3VhT1/HOvqYA31jWlSfUdkYP3xoosoW9gLAW8scZSxV+LrIA3VmQJfQNjKeCNNZYq/lpkBbyxIkvoGxhLAW+ssVTx1yIr4I0VWUI3DUw3Fm+s6ZaxadJfb6xpkqjp1k1vrOmWsWnSX2+saZKo6dZNb6zplrFp0l9vrGmSqOnWTW+sYjPmnzeuAt5Y48rj7yxWAW+sYpXzzxtXgUSNdfDgQRw4cCB2jKXAnXcCLjAW9wEHMUvbsbhdXYtkLP1dYWdnJ95//30cO3YMb731Fg4dOoTXXnsN+/btw969e9HW1gbtfCLs2rVrRFzd3d3odoRC4vfeA6wFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAXEVcjtKl7xFPJu3ozBTZvQHwTI3nsv8IUvAI8/Djz5JPCDHwA/+QlgLZg74MQJYGAA+rvCwcI2JnIcxVjhbviHDx/G22+/HRrrBHt0+vRpdHV1obe3t//ChQunBgcHX2eHdhL/R5wkfElAAb7OT+3Zg5f42t71s5/hjR/9CJ3f+hb6n3gC+OIXgfvuuzyCt7QA8+YB+pN8dlN/Dc1q4iWKsbQlzrOk1P4NwjYeP09op5kdmUzmMHGJWMRrW4g/JOYSviSjQDNplQPlYgGPLxJ60e9grZxp5xnlMJ9T1Trn3RMvUYyl7W8eIqX+Ny3hc+Xl5ffNnDnzj2tra++qr69f1dTU9Htz586dZYyBIbRBCB8/XLQTy+QBGK+tYVIejPe4OO4j5XDRVtmuMEzKA41MX/0q8JWvAI88gpr778f8u+/GbWvWIGDMf1BTE+488zk+NJ9T1RzHeKWIEsVYNTTSkHaWueOOO6CteTZv3ly2YcOGMm1XdOutt4Y7z2ijEJlKGG0sLsk4hQJcnsWKRRozR4kTN2e+/VG0qK6uxsaNG2MH8zCCOm+sr30NePpp4Mc/Bl58MdwIpJx9rezpQbn+q59Tp8B1MthP6D9ZqB3RyAROohgL2Ww2o51lKisrwSlvArT+oVNRgTK6oakJWLoUGLy8bOeV4npa9BOLo/PPSosC3lhpybTjOL2xHAueFjpvrLRk2nGccRrLcSiebiop4I01lbJRQn3xxiqhZE6lULyxplI2Sqgv3lgllMypFIo31lTKRgn1xRurhJKZWChjEHtjjSGKvxRdAW+s6Br6FsZQwBtrDFH8pegKeGNF19C3MIYC3lhjiOIvRVfAGyu6hr6FMRTwxhpDlOl/KfkIvLGSz0FJ9sAbqyTTmnxQ3ljJ56Ake+CNVZJpTT4ob6zkc1CSPfDGKsm0TlpQiezd0KfdZqy1sDm0tbUNtre3D3R0dAxqxxltGKIdaLQTTX7DkMKQFy8GjAGMAYwBjAGMAYwBjAGMAYwBjAGMAYwBjAGMAYwBjAGMAYwBjAGMAYwBjAGMAYwBjAHefbeQ9fKxMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxl7kADB+cP38e1Ch2aKefYVIePPcc8L3vAV//OvDoo8CDDwL33AOsXw8sXIihujoM6Q9W8+jvh3ab6eVTiypRRqzvkvFZQhuCCNsGBwdfuHjx4v/39fXZrq6u/adPn/7NyZMn+2QsGezIkSN8+JWiLX5c4Qrr5a2FXPGKp5Cb+sAVCnk//3mEhpKxnnkGH73wAt5/+WUc7OjAjuPHsb23F//Fx2sTEOVSUG6/w2tFlSjG+lsyPkRoQxBBG0rcz/PPEHcRtxBVxHHCEn4bI4qQYDlBbuVg5+Ag3uWIVDEwgGXZLJQr5ewB3q8cKpeCcvt3vFZUiWKs8rKysmxLSwtaiFWrVmHFihVYsmQJFi1ahHnz5lXdyH+NjY0r6urqtlRXV2+tqKi4ye/xUFSeJuNJzWwk3MaovLx85cyZMz9RW1tb1dDQgKamJjQ3N2PBggUwxoTI5amCzymqRDFWSDh79mzMJurr63HDDTdg7ty5mD9/Pm6++WYsXboUt9xyC1avXp1Zv359RWtraybLl0j4RN4EARAEQBAAQQAEARAEQBAAQQAEARAEQBAAQQAEARAEQBAAQQAEARAEQBAAQQAEARAEQBAAQQAEARAEQBCQrKBoG6HZ7LMLiKuAOtTKBa848rwyydq1a0H9kdsVCNqNJr8r0PLly6FdgRZysWWMgSH4HO02o3VWvpkJ1ZGNNSG2UQ/+xS8AzvOxYxRteKpR1gVCslE3Lng1g+Rp9WLWrkBVVVWgYfKXP05dtD+KfuLH6ZV/THoVSK2x0ptyN5F7Y7nROXUs3lipS7mbgL2x3OicOhZvrNSl3E3A3lhudE4dizdW6lLuJuCpYyw38XoWRwp4YzkSOm003lhpy7ijeL2xHAmdNhpvrLRl3FG83liOhE4bjTdW2jLuKN5xjOWoB56mJBXwxirJtCYflDdW8jkoyR54Y5VkWpMPyhsr+RyUZA+8sUoyrckH5Y2VfA4S70EcHYhsrJ6eHgwNFb13RBwx+TYjKKBcKqf6kzE2U3RioxjrbXYis3//frS1tWX37dsH7c/Q2dmJc+fOsU++TAcFlCvlTLlTDnft2gXllMbSH6v+ptgYohjrb0i6gHiAnXi6t7f3lRMnTgxoh5lXX30Vu3fvHnr99ddx/PhxfPDBBxgcHORDry4DA0DcuJoVYJ+dICnusXiVA+VCOVFumKOscqWcMXdgDjVC/ZrPfYbQ3g2Psy6qRDGWCN/jzfPEl4gNRA3RSjx26dKlF7q6uk4ePXoUBw8e1KiGjo4O3nWlzJgBuIC1Vzh1pN1edu7cCRcQlzjz6O7udsKr2PKcqqU9Z5YwF8rJ2bNnwRyd5n0/Jf6B0EYEtazXEI8Q24iip56oxiL3iNLPs3bi28T9HBWaWd9E/CnxFIfdV1j7koAC1P4SafcS3yW0K9BC1p8g7iWeJHYSRRuJzx1RJttYIxrPnZxi/T+EhlWNao/x2Be3CnyTdJpNNrJ+lNBeWMdYx1ZcGGt05zWana+trUUQBE6wadOmfB+6dPDDH4LvZN3gqafEGOKDDJfDWmrqTfS44EpnMu43JuTVvlhP8Ogi4awkYSwFZ7lQZHKpoM5iRkXF8DZPWpiCy4uYGa803xVaOTw/XFeHIZkrPIv55swZ4NixkGTUCjO8FvtNUsbSOkzvQmIPME9Ac8nFs3RekGydxooCE9fOmQOOWbHSDTe+Z8/wYaj18Jmjg0SNpQ/iHMWJyspKxap3PU5HrJyxsmVlaHBprFeuvE1KlbEU9pBjY8nDDbzJ5pLNw/iLuGiq7mwW2pUxfsIcw16+/+O0q3XVgdwlp5VexU4Jc2Ta5vmNDz/8UNsR5i7FW3HEEsEcJrlLydaJC4iLC/EzNFZ1Y6MLxstvStrbw89/aS9oCeCGuIAlKWOpC+39/f2ZAX3srrOYwTWWGCqZZKfG+u1vw8TqhcQhS12IH2+8AVy4EK7nEpkGFWGixlIH9Em06riRG7FE05NLto4/Jop/GEcsLdg/UgsNmoh1EDM0DeYoUmksDdNwtc4qMFYfjeXkBfUR7cQBWcY6r0S7mgoLFu5X3huqAw7hROBrxKP/pqLPlbFyU6G6cpHrHX7UocN4wdEqT8Cv2uFsKtSIxYX7UZLz0yzeJlCSNJbCbeMHhaLGaQAAATlJREFUpfxKMf41fMGIpe8znXzkUGCs8KcdLkasnh7g0CFw5Y7ERislNmljtes3XX19fepLrCgwVvguqSDpsfGO5nBhrIJpMLH1lQRN2ljhq0o/MLPWwsYI/XRHAROhsW6/HeBHD7Hi7rvJVlDWro2fc+vWYcJQ2+EzxwdJG2sH4/0PQj/ZcIGXyfUs8XPCBZ84tpPrXwhx69wF+DU7wu9FyZtISdpYCvrPeRNMEMU+Xv/TlX7Ydo8jPvXz0+T6X0LcOneBvyJfomUqGCtRATx5PAp4Y8Wja+pb9cZKvQXiEcAbKx5dU9+qN1bqLRCPAN5Y8eia+lYnzVipV9ILMEIBb6wRcviTyVLAG2uylPTtjFDAG2uEHP5kshTwxposJX07IxTwxhohhz+ZLAW8sSZLydS08/EC/R0AAAD//xGwuLUAAAAGSURBVAMAAJ9awwIUsncAAAAASUVORK5CYII=",
    "8": "data:image/png;base64,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",
    "9": "data:image/png;base64,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",
    "10": "data:image/png;base64,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",
    "11": "data:image/png;base64,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",
    "12": "data:image/png;base64,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",
    "13": "data:image/png;base64,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",
    "14": "data:image/png;base64,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",
    "15": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4AexdfWxU1509M7axCR6wDSEN3oYflagKuwQnkCxfLi6oZT+yaXbVbCPtZpNVlabSVtuNUmU3m/afSm20yrZqV+oKVW0aGqlton7Tj0gp0YAREAQUEgVoEyWQAopTMA52qD9nen7PM+M3rk3xvLn3Zfx+6J733n3z3j33nt+Z++57b3xJw/6ZAg4UMGM5ENWKBMxY5gInCpixnMhqhZqxzANOFDBjOZHVCjVjJcUDnttpxvIseFLozFhJibTndpqxPAueFDozVlIi7bmdZizPgieFzoyVlEh7bqcZy7PgE3Sze+udYKzHKXHWE3aR58PETsIX5y/I9feEcvvifJJ8saa4jXUzW/+vxGZP2EIe5buNa1+cf0WufyGU2xfnP5PvA0RsKW5jbdCWr169Gl1dXU6xZs0apVKkdPHss0Au5xYHDypTgEBnz+0MtA3YY1gEDY6Bt0i5XjcymYyunGJkZKSs/IULy7JOMiGOQOfJdXBB2tzcjFQqlWfZgbZcx5KCBsfCPE66Yd68eaivrx/POVyOjo4WS6/TjVDQNesEIY45ShCqg2adgKbC/PnztVfWy64TjqspNE5jLWIFhSJw5T6FeosGZQsFXbNOMH8+2HtA/zXqIlQHzTpDQdNmEiwnYklxGmujtrgggm46RSiocxsakL/mmj+ic7Jj0SJwJId5WnioDpp1hpCmsV0O4zRW0OiQCM6E1oJDl6FmBlvHILrbOa69Nvj5N/suIFQHp7whTQONnZJNU3isxkqn0+w5/HQdod4iUwj2NJJUd7dectNptLFUVqH8BoL7nKTGxkY0NDTolydxxlJD/+WCBQs41tRxphN9ywplVDV/mUFepMHWjA8oFx9r6D3ohUIdfNBCtSXRKqKJ8J40wN5JSXgT0Rjqspl1mwqXoV4GeYEG2y3bROkFLv32XCjUYeJDh1sFbTW+sTzPUmKHzZu26KCLLjR+2oOq+QF7C7009LLMVCHY3HSfQlz9rIMO5N2TkiGkbaA1d3lNSTPWgKobCrZmnaJNR1fjDJdpLG96J9VYH2hqatIB5rjk0yyruZuXIQ3qCi0zFGzNOkXIxB1KxHroyjl4YwR9Ck8ifUfJld+kYvtk1AeFXyLh9YODg8hms95ATk2tuvj0pwEO4r3gvvuUMUDQd+3du9dbmwcGgg56LtkfJLwm18ZaxtbcRXyF0Fey2tIHuG3JowL8Ev0v6Q4R/0PoT3gWc+00VdNY17Cm+n7qYa5/TPQQrxLfIf6duIXvBd2/FCSRpXIFeCeMlStxcyqFh/jJD4gevp49y/V3iU8ROsAP3mdyuyopirH02cy9rMV24gjRT2SJLxC319fXX7uQA4xly5ZBfy7S2dmJ0E9XeAgwNOQHXV0BXWmhDxA3b94MH1CuEjE3WlpavPBq20hXSocPI9XXB+jPhT73OWDbNizhWPNOHvBlYh97tQEabz+3dajyj1zfQFScohhLL2/fJPP9qVTqpkwmk25vb8eKFStw6623YtOmTalVq1Zh6dKlaG1tRV1d8KMCHl6e+N6Og3g4RTnjeI515gvilHOMs5UvfXCXMwJ5PmzRXydt3Qp85jPAzp3A+fNInzwJ7NgB3H8/Gm66CetoMB2qPMXzTxN6CeVq5ik981NKZ7SwV8p1dHSg2BstX74c1113Ha7x9Ya3VBXbqFSB974XuPtu4KtfBQ5xFNbP6042C9CE+syt4l9HzMxYk2qfy+VS2rXrre2kjyxbowrMnQu8//3QYUqKTajYHxWfSFJLpsC0CpixppXGPoiigBkrinp27rQKmLGmlcY+iKKAGSuKenbutAqYsaaVJtEfRG68GSuyhFbAVAqYsaZSxfZFVsCMFVlCK2AqBcxYU6li+yIrYMaKLKEVMJUCZqypVLF9kRUwY0WW0E8BtcZixqq1iNVIfc1YNRKoWqumGavWIlYj9TVj1Uigaq2aZqxai1iN1NeMVSOBqrVqmrEqjZidd0UFzFhXlMc+rFQBM1alytl5V1QgVmNt2wZs2eIeUylw9OhRHPWAuLiPHTs2FbW3fZGMpX9X2NPTgzNnzuDUqVN4+eWXcfz4cbzwwgs4fPgwDhw4gO7ubmSz2QB79uwpaxh3cz/gYx0mHhoaQl9fnxcoV5i7zxOv8oR5OzsxtmkThru6kL/jDuBjHwMeegh49FHga18Dvv99QOPA0OHsWWBkBPp3hWPhMmayHcVYwYz8J06cwCuvvBIY6yxr9Oabb6K3txf9/f3Dg4ODb4yNjb3ICu0mfkacIyzFoAC/52/s24dn+d3e89Of4qVvfQs9X/wihh95BPjEJ4A77xy/cnR0AO9+9/if5LOa+tfQXM08RTGWTonzBCl1/gbFDm4/RehMM7tSqdQJYpR4D/dtJv6WWEJYikeBdtJqDDbn86mluVxqKJ+Hfun1fyXTmOnMMxrDYkx1rXmeNvMUxVg6/c29pNT/TUtxT11d3Z1NTU1/l8lktra2tq5evHjxny1ZsmSeiEAInSCEx5fSDTcA1cOVyyqRcsMXZ5GHlKVU3OdjXSLlhmqvMVAwJs2MzQ1tbW1rmpubuxobG/9GY8fD7iGKMdU1+zHuqSBFMVYzK5PTmWU2btwInTans7MzvW7durROV3TjjTcGM8/oRCHaGIU2LlxHDsl4CQU4PHOK92ifGSbmtmvOYvmkKktal+JnLteqbZhYtdcYKDQmOiuQxmjt2rV169evb2Ds6jSGGzZsCGYLSqfTeZ5f8f+eFcVYyOfzKZ1ZpqGhAbzksR6WalkBjeGcOXPCswVV7I+KT6xlAa3u7hUwY7nXOJEMZqxEht19o81Y7jVOJINLYyVSUGv0uAJmrHEdbFllBcxYVRbUihtXwIw1roMtq6yAGavKglpx4wqYscZ1sGWVFTBjVVnQRBY3RaPNWFOIYruiK2DGiq6hlTCFAmasKUSxXdEVMGNF19BKmEIBM9YUotiu6AqYsaJraCVMoYAZawpRan9X/C0wY8Ufg1lZAzPWrAxr/I0yY8Ufg1lZAzPWrAxr/I0yY8Ufg1lZAzPWrAxr1RoVy9wNAzrbTDabRbaA7u7usf37948cOnRoTGec0QlDdAYanYmmOGFIuMnLlwMigAggAogAIoAIIAKIACKACCACiAAigAggAogAIoAIIAKIACKACCACiAAiwKuvhlnHt0UAEUAEEAFEABFABBABRAARQAQQAUQAEUAEEAFEABFABBABRAARQAQQAUQAkXEuAKUNrYsIIAKIACKACCACiAAigAggAogAIoAIIAKIACKACCACiAAigAggAogAIoAIoNqWSLmhk7VoDDQWGhONjcaoMCtQjrHLFeOoa40tT+snKkpReqz/I+MThE4IotgxNjb2vaGhoZ8PDAxke3t7j7Axvz137txAsTEnT57k4RPp9dcBX5hg9cdZbFtc3GFe1V4NpbFgTN5mbM5cvHjxWH9//67BwcGdjN3TPF4nAdFYKjS2X+a+ilIUY/0nGe8ldEIQhU4o8VHmP0xsTafxF+l0fk4qlT/NfJawaYwoQozpLLk1Brvz+fyrRD2xgvu2Ehqzu7jWGGosFRrb/+K+ilIUY9U1NiL/3HOA4pe/BJ6m57dvBz7/eeCBBzDn7rtx3W234c91zhB2zdtaW3E9DVdRRe2kyAq0s4RgGqO6urpVTU1N78pkMnPa2tqwePFitLe3IzxxiM7jwOPriYpSFGMFhF1dQFcXsGUL8JGPAB//OPDww8BjjwGPPw786EdAdzdSv/416s+cQSoXGg62tLSgxROCyhYWjfxG+OJVrgJtsPLFqzwBIRdqkrVr10JnktEZZTo7O7Fu3ToUZwVauXIlx2TLsWzZMuhsNAqeo7PN6Kx+LGHmKbKxZk45ccbq1avR0dHhHBOME1sdHniVY4JxYkv3u4ZqW2TkJS+YQUZnkqFhiruvZl2xPyo+8WpqZcckV4HEGiu5IffTcjOWH50Tx2LGSlzI/TTYjOVH58SxmLESF3I/DTZj+dE5cSxmrMSF3E+D3znG8tNeY/GkgBnLk9BJozFjJS3intprxvIkdNJozFhJi7in9pqxPAmdNBozVtIi7qm9VzCWpxoYzaxUwIw1K8Maf6PMWPHHYFbWwIw1K8Maf6PMWPHHYFbWwIw1K8Maf6PMWPHHIPYauKhAJGPl88D+/cDg4NVVLVXxX6ldXfl2VHQFcrkcLl26BP2TMZYW+itQ5maQohjrleFhpDZuBJqbkb/lFuCTnwSefBL4zW9mUAM7NFYFLl++jJ6eHui8DocPH8aePXtw5MgRNZZ2A7+ttHJRjPUfJF1K3EWTf4V1eX77dozccw/wvvcBixYhd/vtCP7cftcuoL8frCyPnpT0m+EakyiDrGvOYvkB2aRF8TOX60mUQXZsbAwXL17E6dOn8eKLL2Lv3r35gwcPQmee0Zlo+vv7tYf6FQ/+f0LnbniI64pSFGMp4etcPEU8wMviOhqsmdsbiAd7e/G9Z57Buc9+FvjgB4GWFmDNGn4SSrt374YP9PX1hViBoaEhL7zaNuUKk2tddL8PhHkPHTqE7u5uHDt2DK+99houXLiA0dHRN3nMj4n/JrqIDHEz8W/EDuIyUVGKaqzJpMPcwVEXvsT1R0dH0c719cQ/0HiPnTyJ521SEKoRQ+Ilb5S0BwidfkpnBVrG7XcRdxCPEruJio3Ec8tStY1VVngh8wbXPyS0W9Ve7UFuW/KrwBdIp1eT9Vx/iniaOEU4Sz6MNbny2pv9PpPJoKuryws2bdpUrEOvbnz96wAv216gs+4oJ3FR74o5zPnTvBzpVKN+ImQFznL5CDFEeEtxGEsbl+VAkQJTQc05Rn19aZonHZhyfOGYMFQ8x5rF3IkFC5BTcxV3uFyfPw+cOhUw6KR3wYbPRVzG0nEY7xR5q+iptTSXunie0oWCrVmn4Bi5WH6Gd8p6C1/MO13v21cqPtC6lPO0Eaux9EGcp3aioaFB26p3PV57rIKx8rxpafNprOefLymbKGNps3OejaVKt3GRLwSbm+6TctFUfbwr1lkZ3RMWGA7w/o+XXR1XHS3s8rrSb7FXwgKZXgNfeuutt/hSqLDH8Yo9ljIsYpB7Ndia8QHl4kD8PI01d+FCH4zjNyZ81abPX2kv6BDAD3GIJS5jaRX2Dw8Pp0ZGRnTbOTjGUo4GBtmrsX73uyCw+kVCm/aXWgvHeOkl6PtbHc/FchnU5sVqLK2APonWtWsUeiyluVQItm5fJSo/jD2WBvhtLcGXsfQyqHxEIo2l3XTwJp0COE8hYw3QWF6+UG/TTuyQ1Vi/1wb6uhSGBu4T94ZaAY/wIvA07dH/pmLA1wC+cCnUqgxxvMNHHbrpFuytigTB9d5nj8WB+2sk59MsLmNIcRpLm9vNB6UcZLofw4d6LH2f6eWRQ8hYY9pYHz3WpUvA8ePQX5LE1ltpW+M21v5cLpcaGBjQujhFyFjBXVIo6M54H77BbQAAAPxJREFUJ3P4MFboMhjb+EoFjdtYwbdKf2CWzWaRdQj9uYg2mAiMpT9M5KMHuMSHPkS2UFq7Fk75tC3btpUIA21LOc8bcRtrF9v7bUJ/suEDz5HrCeIZwgefcuwk1zcI5da8D/A1O4L3ouSNJcVtLG30P3HRNUNUerz+T1f6w7a/9sSn9bydXD8hlFvzPnAf+WJN7wRjxSqAkbtRwIzlRtfEl2rGSrwF3AhgxnKja+JLNWMl3gJuBDBjudE18aVWzViJV9IEKFPAjFUmh2WqpYAZq1pKWjllCpixyuSwTLUUMGNVS0krp0wBM1aZHJaplgJmrGopmZhyrq6hfwAAAP//0sEogwAAAAZJREFUAwB3lWvDPzaoNgAAAABJRU5ErkJggg==",
    "16": "data:image/png;base64,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",
    "17": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4Aexde2wcxR3+9vyIndix86TETUxAiZJAiBMH8mhST4lECn1AKyhIhUJBCARSKQLRBwgCf4AqCuIhUIVoSyhqSQWtaGgpQqDLQ3nJCQkIghRECBCIgRgnNokTx75+v/X5smfOaXx7M2vf/qz5bnb3bueb+X7fzs7u3o0T0D9VwIICaiwLomqRgBpLXWBFATWWFVm1UDWWesCKAmosK7JqoWqsuHjAcTvVWI4FjwudGisukXbcTjWWY8HjQqfGikukHbdTjeVY8LjQqbHiEmnH7VRjORb8OF1xLw0FY/2JEicd4TXyXESsJlxxvkyuHxHC7YrzL+SLNEVtrHls/c+JJkc4jzzC933mrji/S66fEcLtivMK8n2HiCxFbazF0vI5c+bAGGMVjY2NQiXw5OXVV4GeHrvYskWYfPg6O26nr63PHsGL3+AIePsoF8lCdXW1ZFbR1dWVVf64cVmrVlYCHL7O/etgg7Sqqgqe56VYtq8t80iS3+BImHtJF48aNQqlpaW9axZfjx071ld6iSwEgi6rVhDgKBeCQB1k1QpoKowePVp6ZTntWuE4mUKjNNZ4VvA0isDMfgr0FmXCFgi6rFrB6NFg7wH5GyEvgTrIqjWkNa0iwTQikhSlsb4lLU6LIItWEQhqZVkZUiNHfo3Oyobx48GRHEZJ4YE6yKo1BDSN7HQYpbH8RgdEsCa0FBw4DVUx2DIGkc3WMWGC//Vv9l1AoA5WeQOa+hpbJRug8EiNlUgk2HO46ToCvUV1OtgDSFLYzXLKTSQwlqWyCtkXENxmJY0YMQJlZWVy8MTOWGLoBTU1NRxryjjTir5ZhTKqsn6IQR4vwZYVFxAu3taQa9D96Tq4oIVoS6LZRAXhPEmAnZOScC4xItBlc9VuSp+GWhnkGgm2Xbbjpae55OjZn67D8TctLqW1lfhGcj9LiC02b8Ci/S463fgBP1TIN9hbyKmhlWV66WBz0X4KcLWzDjKQt09KhoC2vtbc5DTFzVgdom4g2LJqFWNldNXLcIjGcqZ3XI31nYqKChlg9ko+wGshN/M0JEGdKWUGgi2rVhEwcYMQsR6SWQcvjCB34UkkzyiZuU0itktGuVH4EAlP7ezsRDKZdAZyShojL7fdBnAQ7wTXXSeMPvy+a/369c7a3NHhd9CVZL+VcJpsG2sqW3M58Qghj2SlpbdwWZNDBXgQ/Z50zcTvCPkKz0TmVlMhjTWSNZXnU79h/iLRQrxP/I34BXEOnwvafyhIIk3ZCvBKGLNmYZ7n4Xa+8w+ihY9n9zJ/jriZkAG+/zyTywVJYYwl92auZi3+QGwj2okkcR/xw9LS0gnjOMCYOnUq5OsiS5cuReCrK/wIcOSIGxjj02Ve5AZiU1MTXEC4MsRcqK2tdcIrbSNdJm3dCq+tDZCvC917L7B8OSZxrHkpP/AwsYG9WgeNt5HLMlT5CfMpRN4pjLHk9PZnMl/ved7c6urqRF1dHWbOnIlzzz0XS5Ys8WbPno36+nqMGTMGJSX+lwr48ezE53YcxMMqshl711hnPiD2rKOXLfvVBXc2I5DizRb5dtKyZcCddwKrVwNffIHEu+8CK1cC11+PsrlzsZAGk6HKKu6/h5BTKLPBp8Tgd8nsUcteqaehoQF9vdG0adNwyimnYKSrJ7yZquhCvgpMnw5ceSXw+ONAM0dh7TzvJJMATSj33PL+dsTgjNWv9j09PZ507XJp2+8tXR2mClRWAt/+NmSY4rEJefsj7x1JqkkVGFABNdaA0ugbYRRQY4VRT/cdUAE11oDS6BthFFBjhVFP9x1QATXWgNLE+o3QjVdjhZZQC8ilgBorlyq6LbQCaqzQEmoBuRRQY+VSRbeFVkCNFVpCLSCXAmqsXKrottAKqLFCS+imgOHGosYabhEbJvVVYw2TQA23aqqxhlvEhkl91VjDJFDDrZpqrOEWsWFSXzXWMAnUcKumGivfiOl+J1RAjXVCefTNfBVQY+WrnO53QgUiNdby5cB559lHLgW2b9+O7Q4QFfeOHTtyUTvbFspY8rvClpYWfPzxx/jggw+wa9cuvPPOO3jzzTexdetWbNq0CevWrUMymfSxdu3arIZxM7cDLvIg8ZEjR9DW1uYEwhXkbnPEKzxB3qVL0b1kCY4ag9TFFwPXXgvcfjtw//3Ak08CL7wASBwYOuzdC3R1QX5X2B0sYzDLYYzlz8i/c+dOvPfee76x9rJGn332GVpbW9He3n60s7NzX3d391us0Bri38QnhKYIFOBxvm/DBrzKY3vtSy/h7WeeQcuDD+LoHXcAN9wAXHpp75mjoQGYPLn3J/mspvwamtngUxhjyZQ4T5NS5m8QrOTyKuJFz8NrZWXYWV6OYyUlOJ3bmojvEZMITdEoUEdaiYHEop7LRwg56OW/ksnsQDLzjMSwL6aSyzo/NvgUxlgy/c3VpJT/piW4qroal9bX4wfz52MZx05zLrkE37zxRoy66y7g7rsBOTr4+UySmVgKhxE4UVkZUi5MmQK4BCkz6UR1LPR7GVIuiPYSA4nFTTeh6rLLMOX889E4bx4Mtbiwqgrss3AVP9oXU8llGzcNPoUxVtWoUejhkAocZkH+Vc2BA0js3o3E5s3Ayy8Dzz4LPPIIsGJFbmMtXLgQixYtso5KmZCgnzYcEvL0DdjO+9FC6uKizaJtkLvPWCtW9MZEYiMxam5GCTUoO3gQJRLDffvAcTJYT6S4f97/PSuMscRM3owZwIQJ8KddZEVOmGQqnRN+QN+MVIEE3TBxIiAx7e4dtnNLflXKe8f86HSvuCigxopLpB23U43lWPC40Kmx4hJpx+20aSzHTVG6oaSAGmsoRaOI6qLGKqJgDqWmqLGGUjSKqC5qrCIK5lBqihprKEWjiOqixiqiYEbWlBzEaqwcouim8AqoscJrqCXkUECNlUMU3RReATVWeA21hBwKqLFyiKKbwiugxgqvoZaQQwE1Vg5Rhv+m6Fugxoo+BkVZAzVWUYY1+kapsaKPQVHWQI1VlGGNvlFqrOhjUJQ1CGUs+R3aYFTxvMF8Wj87BBSIZO6GjsOH4Ym5+jB6NLpPOw1d8+ej+8ILgSuuAG6+Gbj3XuCxx4DnZHaAgFoyG83GjRthG4dZ0QCtv8h6wgV8MiCTSV1st1fKF20zpFwQ7SUG99zTGxOJzQUXAAsWAFOnoqemBj19cZT86FF/tpl27ppXCtNjPUpGmThCJgQRrOzowPMffoj/bNuG5CuvYNuqVfjo8cfRsWIFfINdcw33CCSZ4scVArRgHZ0iyO2qvcIT5BXt5SAXYz3xBL56/nl8/Prr2NHcjNf27MHq9nb8nZ+XSUAklgKJ7cPcllcKY6xfkVEmjpAJQQQyocRl3HYRsSyVwlk9PV55KuXt4XqS0GmMKEKEaS+5JQZrurvxPnuk0q4uzEylsIzbJWaXM5cYSiwFEttfc1teKYyxShKJRKqhoQENxJw5c3DmmWdi+vTpOP300zF58uTyU/g3bty4M2tqapoqKyuXl5aWnup5OtDKK1Lhd6pjEf40RiUlJbMrKiq+UV1dXT527FhMnDgRdXV1qK+vx2kcHwg8z49TKffJK4Uxlk9YW1uLWmLMmDGYMGECJk2ahClTpuCMM87AjBkzcNZZZ2Hu3LneggULShcvXuyleIj4O/Kllvu5AukySaYLcsUrXBliLhgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYQ7J08jwP8znwpf5oamrC0qVLIbPRNDY24uyzz8asWbMwbdo0jrWmQkwl8DxPZpvx3ZUuZlBZaGMNiq3fh6WXk97ONvrR+qu2OfvK98n6vXBsA9vgGDfDKgfzyJEjUV5eDhoms/0kFvL2R947nkSl9CMxViC2xopxzJ00XY3lROb4kaix4hdzJy1WYzmROX4kaqz4xdxJi9VYTmSOH4kaK34xd9LioWMsJ81VElcKqLFcKR0zHjVWzALuqrlqLFdKx4xHjRWzgLtqrhrLldIx41FjxSzgrpp7AmO5qoLyFKMCaqxijOoQaJMaawgEoRiroMYqxqgOgTapsYZAEIqxCmqsYozqEGiTGmsIBCHqKtjgD22sgwcPoqcn77kjbLRJywyhgMRSYio/GWMxeQc2jLHeYyW8bdu2Yd26damtW7di165daGlpwaFDh1gnTcNBAYmVxExiJzFcu3YtJKY0lvxY9aN82xDGWL8kaT1xOSvxSHt7++a9e/d27dy5E1u2bMH69et73nrrLezZswdffvkluru7+dGvJ+4L2/g6K6xz9rUpF3dXF2AbuXglBhILiYnEhjFKSawkZowdGEPpod7gvk8QMnfD7czzSmGMJYQf8mUVcQuxkKgiFhO3Hjt27PnW1tZPdu/ejR07dkivhubmZr51PK1ZswYu0NbWdpyUSzITiwte4RAuUmZSMgmMGOEGGVIuiPY8s/ixkJjs378fjNFnfOtF4reE/Ci/mvk84iZiJZH3qSesscidlY5ybSPxEHEZj9o65qcSPyYeYLe7mbmmCBSg9sdIu4l4lJBZgaYy/wZxMXE/sYbI20jcNysV2lhZhadX9jH/JyHdqvRqt3JZk1sF7iOdnE0WMb+ZkLmwPmBuLbkwVv/KP+R5ONzYCF5NugF7/b46tMrCU0+54ZWL5QceEEYfX8qrMQbm/6FA71dUVAilzIt1BxeOEM5SFMbiwBnJNzhEzDGDo5WG19YCNDP4R1YgYDRusptafSv7HDtLS0tlcOyv2H7p4tVBZ2en0HBUJ5lbRGIsNnGjHM28Q8FF+0lMVVsLCeooYQsEW1atImDi6rKyMrmEt8rXV/iBAwf6FmXM27fsLI/MWNLCTTKUlAUHGD8e0la56nHaY6WNJZOYjXVpLLnJmZY1VsaSq8OezfKabr3tbNw4IJHAWPKk0sHmov0kXOSV+x1iLPuEaYa0sWRctT29yWkmR7FTwjSZTPP89oYNkCM5vcluJsZKpTCeQW6VYNtlO166cPG0/wW3VHKMxcx+4m0e0FiirZwTZAhgn7QfQ1TGkmps/PRTeF+I5LJmGWPZV9FYZQyyU2N9/rk/tpMDCTwVWm5lb/G8Z8Ur7h6Pa5GcBsmLSI0lFeDNd8msQ3qsNMnBdLDTqyeT5f8Z9lgS4K+kBFfGYm8ldIJYGku6abgaZ0mPJUoTHTSWkwPqK9qJV/1irMPkhatTYcBYG4Q3CjgReICGvcvbAB2urgwDxjrCUyIfuA5QqwJuZm/VVxofO8PZqTBtrN0kdzTQIFO/lOi37nSVAV7H59Ipjnus8wZOhfI808kth4Cx/K92uDgV8sEyvpKuEoist5JgRmosVmAjbw57cheey1ZTwFj+VVIg6NZ4+3O4OBW2t/vXCdKmyMZXQh61sfyj6pxzIPeYrOL886W5PnxjOeb0ieWLdMlkEkmLkK8o+WQx77Feowh/6fj2IgAAALdJREFUJeQrGy7wOrmeJv5LuOATjtXk+iMh3LLuAnzMDv+5KHkjSVH3WNLon/LFDBL5fl7+05V8se0CR3xSzx+S61+EcMu6C1xHvkjTUDBWpAIouR0F1Fh2dI19qWqs2FvAjgBqLDu6xr5UNVbsLWBHADWWHV1jX2rBjBV7JVWALAXUWFly6EqhFFBjFUpJLSdLATVWlhy6UigF1FiFUlLLyVJAjZUlh64USgE1VqGUjE05J9fQ/wEAAP//UbFgGwAAAAZJREFUAwDhJYnDDgt5MAAAAABJRU5ErkJggg==",
    "18": "data:image/png;base64,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",
    "19": "data:image/png;base64,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",
    "20": "data:image/png;base64,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",
    "21": "data:image/png;base64,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",
    "22": "data:image/png;base64,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",
    "23": "data:image/png;base64,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",
    "24": "data:image/png;base64,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",
    "25": "data:image/png;base64,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",
    "26": "data:image/png;base64,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",
    "27": "data:image/png;base64,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",
    "28": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4Aexde4xc1X3+ZvbhXbzDPgxL2C32sZEtGzC2efmBwSdEgtJH0lZKQSpqaKSqfyCVRkjpAymPf1JVVFFIJNQ/0hbUqIUKtUpRS6PIaOy1sgStjXkY8zR+YMtrx4vZXex9eHfzfdcz6zv2ZGXP7Dl3Z+6xzjfnnjtzz3d+3++bc+/MnT3OIvwLCjhQIBjLgaihSyAYK7jAiQLBWE5kDZ0GYwUPOFEgGMuJrKHTYKy0eMBznMFYngVPC10wVloy7TnOYCzPgqeFLhgrLZn2HGcwlmfB00IXjJWWTHuOMxjLs+AX6Op7ayEY618ocd4TtpPnK8RLhC/Ol8n1h4S4fXH+G/kSLUkb6zZG/2fENk+4jzzi+z3Wvjh/m1x/SojbF+cj5PsikVhJ2lhbFPm6detgrXWK22+/XVRCRg+eOSOdPXNG2irWJBAFnARxgXOz6lwup8opJicnS/pvamoqabtoxDginS8egwvOtrY2ZDKZGfYdacs6kRIFnAjzedItixcvRmNj4/mWw8dz584Ve2/QRizpajpBLK5mEcTGoKYT0FS4+uqrNSvrtOuE43I6TdJY13CAhiKwcl9is0U0VcWS7ow8xrFIJLExqOkMBU3bSLCSSKQkaay7FXFBBG06RSyprXxXzzQ0RBNXnNPJNmfGaXa8mEBsDGo6Q0zTxE6HSRorCjomgjOh1XHsNNTGZOsaRLudo7m5WRpfLaLYGNR0hpimkcbOiOboWEHP8bTTpzZns9mZq666yilJsfPYbJErJLv4lNO6cDrsIgmHUPoBgvuclEWLFqHw5kmdsWToje3t7Twr6TrTib4lnTKrap/hwzWFZHPTfWGCRbKED6cKY+Cm+yJtybKWaCG8FyXYOykJNxCLYlM2m25L4TQ0RJb2QrK56b4UuPTuOVUYg3tSMhS0VX4T+T5LxByG9xJN0YXgvZBzttB1lYyVKSTbC2+Ma4Rj0IW8F96YtpHWXkhjJGkz1qhijyVbTaeInXbP0Fje9E6rsb7Y0tKiC8w5kzqfT/I0pKSuUZ+xZKvpFDETrxcRx6HKOfjBCPoWnkS6R8nKb5HYPhn1ReH3SXj92NgY8vm8N5BTpVMPH330kTfe9957T5SCPhli165d3rhHR6MJupXkTxBei2tjLWc0DxNPE68RivQbrEPxq8A/km6A+AdCP+HpZu20zKexruJIdX/qb1n/lBgkDhD/QfwlcSfvC7q/KUiiUC5VgNrrJ0rf5DP/RQzye56jrJ8nHid0gR/dz+T2vJRqjKXvZh7lKP6J2EOMEHnie8SXeR1z7ZIlS7B8+XLo5yL33HMPYj9d4UuA8XE/sDaim31YutQPr+IT1ywxN6z1x0262ULtM8qBcqGcdHV19TBHX+ULfkD8gtDZpJ+1LlX+mDVV4mOFpRpj6fT2r+T9C7p/Qy6Xy/b29mLNmjW46667sHXr1szatWuxbNkydHZ24jfdm9OvV1yDY7ykuOYs9n8JMXcUn3NZk+aSohwoF8qJcsMcZZUr5aynp6eJOdzEg3Sp8gLrQ4ROoayuvFRjrA46fnr9+vXQO4HvCKxcuRLXXXcdfN2mufJwwxEXK6BcKWerVq2Kzij33nsvlFOaUN+5VfzriCsz1kWjmp6eznR0dEAfbS96KjRrVAHlUjmdmZnR3YKK/VHxgTWqWxi2JwWCsTwJnTaaYKy0ZdxTvMFYnoROG00wVtoy7ineYCxPQtcYTdXDDcaqWsLQQTkFgrHKqRL2Va1AMFbVEoYOyikQjFVOlbCvagWCsaqWMHRQToFgrHKqhH1VKxCMVbWEfjqoNZZgrFrLWI2MNxirRhJVa8MMxqq1jNXIeIOxaiRRtTbMYKxay1iNjDcYq0YSVWvDDMaqNGPhuDkVCMaaU57wZKUKBGNVqlw4bk4FEjXWAw8A993nHuUU8MErjqS4pW05bl/7qjKW/q5wcHAQn3zyCQ4ePIgPPvgA77zzDt58803s3r0br776Kvr6+pDP5yPs3LmzJC7u5n7ARx0nPnwY8MEpDnHFubXPF+K8r7/++tSePXsm9u7dO/P222/j3XffhVbdOcwBHjt2DCdPnsTp06ehFWrGx8eh3PL4KaKiUo2xohX59+/fjw8//DAy1tGjR3HixAkMDQ1hZGRkYmxs7PjU1NRbHNkO4n+JY0QoCSjAfBwfHh7+Oc2z89SpU/s4IQweOXJk4sCBA3j//fexb98+7N27FwMDA+jv1xIO0SD119DRxpU+VGMsLYnzLAm1foPwHLdfILTSzPZMJrOfOEes4L5txO8SPUQoySjQS1rlYFsmM7Msm50Zz2SgN/127lfOtPKMcljMqWq1+fSVl2qMpeVvHiWl/jct4WsNDQ1fbWlp+f1cLvelzs7Odd3d3b/V09Oz2BgDQ2gxCr5+tmgllvkDMFdfs6TcmOt1Lp4j5WzRUtm+MEvKjSefBL79beBb3wIeewxtDz2Epfffj9tvuw2WMf9OWxu08szX+NJiTlVrH3ddeanGWG000rRWK7n77ruxbds2LQ6S3bRpU1YLhNx6663RyjNaKESmEi42Fi/JeAoFeHnmFCs0Z16kjWvOYv8X0aK1tRWbN292DuahhLporO98B3j6aeAnPwFefhk89aGBY20aHkaD/ruh48fB62RwnNBiwBX/71nVGAtaOEKrlTQ1Nel/nCoJJDRqT4Es3dDdDaxeDUydv2znnsriqPjAyujCUWlRIBgrLZn2HGcwlmfB00IXjJWWTHuO06WxPIcS6BaSAsFYCykbdTSWYKw6SuZCCiUYayFlo47GEoxVR8lcSKEEYy2kbNTRWIKx6iiZiYVShjgYq4woYVf1CgRjVa9h6KGMAsFYZUQJu6pXIBireg1DD2UUCMYqI0rYVb0CwVjVaxh6KKNAMFYZUWp/V/IRBGMln4O6HEEwVl2mNfmggrGSz0FdjiAYqy7TmnxQwVjJ56AuRxCMVZdpnbegElm7YVQrkuTzeeQL6Ovrm+rv758cGBiY0oozWjBEK9AcPHgQxQVD4iGvXAkYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxw4EGc9v20MYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYAxgDGAMYMx5LgCzG2fPno0W3aBOTmut9DNLyo3nnwd+9CPgu98FHn8ceOQR4MEHgY0bgeXLMd3ejmn9wWoRExPI8LARoqJSzYz1QzI+S2hBEOG5qampF8fHx/9vdHQ0PzQ0tOfEiRNHjh07NipjyWBaOoevny2HDwO+MEvKDV+cRR5SzhbqA1+YJeXG17+OyFAy1jPP4PMXX8Qnr7yCNwYGsP3QIbw0MoL/5Mu0CIhyKSi3P+C+iko1xvprMj5KaEEQQQtKPMT2V4gvEbcQzcQhIk+EZYwoQoLlKLmVgx1TUzjAGalxchJrZmagXClnD/N55VC5FJTbv+G+iko1xmrIZrMz69evx3pi3bp1uPnmm7Fq1SqsWLECN9xwQ/N1/LdkyZKb29vbt7W2tj7Q2Nh4fSajGbaisYaDqlOgl4dHyxg1NDSsbWlp+UIul2vu6upCd3c3ent7sWzZMhhjImQyUZ4aeUxFpRpjRYQdHR3oIDo7O3Httdeip6cHS5cuxY033ojVq1fjlltuwYYNGzIbN25s3LJlS2aGb5HoQD5YC1gLWAtYC1gLWAtYC1gLWAtYC1gLWAtYC1gLWAtYC1gLWAtYC1gLWAtYC1gLWAtYC1gLWEuyWNEyQh0csw+IK0YdjcVawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawFrAWsBawNoLrJlMBnfccQeoPwqrAkGr0RRXBbrpppugVYGW82LLGANDZDIZrTYTuetCT5e/VbWxLp/q0lf+7GcAz/POcSkzoFnWB8px+4hZ2ha59WbWqkDNzc2gYYq7L6eu2B8VH3g5owqvSa8CqTVWelPuJ/JgLD86p44lGCt1KfcTcDCWH51TxxKMlbqU+wk4GMuPzqljCcZKXcr9BLxwjOUn3sDiSYFgLE9Cp40mGCttGfcUbzCWJ6HTRhOMlbaMe4o3GMuT0GmjCcZKW8Y9xTuHsTyNINDUpQLBWHWZ1uSDCsZKPgd1OYJgrLpMa/JBBWMln4O6HEEwVl2mNfmggrGSz0HiI3AxgKqNNTw8jOnpiteOcBFT6LMKBZRL5VR/MsZuKk5sNcb6kIPI7NmzB319fTO7d++G1mcYHBzEmTNnOKZQakEB5Uo5U+6Uw507d0I5pbH0x6pHKo2hGmP9FUmXEQ9zEE+PjIz88ujRo5NaYea1117Drl27pt966y0cOnQIn376KaampvjSS8vkJOAal7ICHLMXlON2Ha/6L8erHCgXyolywxzNKFfKGXMH5lAz1Os89hlCazd8k3VFpRpjifAwH14gvkFsItqILcQT586de3FoaOjYxx9/jDfeeEOzGgYGBvjUhbJoEeAD+fwFTm1ptZcdO3bAB8QlziLyeT8xS9cip2ppzzNLlAvl5NSpU2COTvC5nxJ/R+iP8nOsbyMeI54jKj71VGsscpeUCbb6ie8TD3FW6GV9PfFHxFOcdn/JOpQEFKD250j7KvFDQqsCLWf9BeIPiL8ndhAVG4nHlpT5NlZJ54XGcdb/TWha1az2BLdD8avA90ins8lm1o8TWgvrIGtnxYexLh68ZrOzuVwO1lov2Lp1a3EMQ9r48Y/BT7J+8NRTYozwqR7t5cQ8T69paWkRpdbFepIb44S3koSxFFyeF4pMrq4V1XSLxsbZZZ50YQpeXrgljPU+FFk52rGf4/ATMOkmeQU/NjbGLfCqDt7/JWUsXYfpU4i3gAtJXSzCWLLVdIqYiXNNTU36CO+Ur9j5Z599VtyMtC42fNWJGktfxPkKlElVrPrU43XGKhhLi5h1cQzejBXTNlXG0qfD6Vjwzv3FpIqjiw8zhWRz030RVzaL0wBkLFZ+SkFbXVft9cNYyqJ3cekePy0t87yP07XeyV4YC8a6JpvFkJLthZQk4uIdr19xs5WnY1buC7/mAY0lbfX1grfrunhkSRlLY+ifmJjI6CJTDdcoJLWJSfZqrJMnocTqjYSCuV2HGt1S0+02EiVyGiQvEjWWBnD69GlVzhFL6nAh2VfAWflLOWPpuupz9RAbg5rOwNmq2HcqjaVpWlN2UQSndSypozSWlzfU57QTP/XLWGcVXGHW1KZTxIz1C6dEc3TuReDfwP8u94/GRGDTXYkldVwrgo9EJyd3fOqZs5Uqgbfa4e1UWND0YxLr2o6V/5L1T1nC2McvSnmtqevMkv3z3ojNWLqf6eUrh5ixop92xMYw7/EVO+SNZXyuqRJIbLbSWJI2Vr8uMkdHRzUWp4glVRfTvo0VxRabNaO2iwe+UYvdJnZ9pQEkbazoVg1WnQAAAOVJREFUXaUfmOXzeeQdQj/dUcBEZKw77wT41YNT3H8/2WLFc5yRtjF6r5tJG2s7o/13Qj/Z8IFXyPUs8f+EDz5xvESufybErbYP8DY7ovui5E2kJG0sBf0nfLBXiEpfr//pSj9se9ATn8b5ZXL9DyFutX3gz8mXaFkIxkpUgEDuRoFgLDe6pr7XYKzUW8CNAMFYbnRNfa/BWKm3gBsBgrHc6Jr6XufNWKlXMghQokAwVokcoTFfCgRjzZeSoZ8SBYKxSuQIjflSIBhrvpQM/ZQoEIxVIkdozJcCwVjzpWRq+rm8QH8NAAD//3STkK4AAAAGSURBVAMAwpIQw9weoCYAAAAASUVORK5CYII=",
    "29": "data:image/png;base64,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",
    "30": "data:image/png;base64,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",
    "31": "data:image/png;base64,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",
    "32": "data:image/png;base64,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",
    "33": "data:image/png;base64,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",
    "34": "data:image/png;base64,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",
    "35": "data:image/png;base64,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",
    "36": "data:image/png;base64,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",
    "37": "data:image/png;base64,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",
    "38": "data:image/png;base64,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",
    "39": "data:image/png;base64,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",
    "40": "data:image/png;base64,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",
    "41": "data:image/png;base64,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",
    "42": "data:image/png;base64,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",
    "43": "data:image/png;base64,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",
    "44": "data:image/png;base64,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",
    "45": "data:image/png;base64,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",
    "46": "data:image/png;base64,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",
    "47": "data:image/png;base64,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",
    "48": "data:image/png;base64,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",
    "49": "data:image/png;base64,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",
    "50": "data:image/png;base64,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",
    "51": "data:image/png;base64,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",
    "52": "data:image/png;base64,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",
    "53": "data:image/png;base64,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",
    "54": "data:image/png;base64,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",
    "55": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAQAElEQVR4Aexda2xV15ld1zbYBFz8ANLYA3wQgQKEYMrLOHFop1Izz3ZmpE4jzWja+RHNj5GmU6XqvP53NMooavtjND86M4lGmmmqqlUb9aFGVICjGKh5JQGiPMBAoHHAD9kOwQH7dq3DvdfHzsWy77l7H9t3o73u3ue1197rW2effR/eVCH8Cwo4UCAYy4GooUogGCu4wIkCwVhOZA2VBmMFDzhRIBjLiayh0mCsSvGA534GY3kWvFLogrEqJdKe+xmM5VnwSqELxqqUSHvuZzCWZ8ErhS4Yq1Ii7bmfwVieBZ+kW9yl+WCs/6bEhzzhIHm+QLxI+OL8Obn+lBC3L87/JV+qKW1jfYq9/2vigCf8LnnE90fMfXH+Hrn+ihC3L86/JN9niNRS2sbqUM9/+UtgYsItfv1rMUXI6PWll9zyqT/Hj4spQqSzD85jxyI+vUTaqpAGog6nQZzj3K987169ukV//9T6m5unbrvYinFEOk9vgwvOtjagpgZZ1h1pyzyVVJUKa440k0HHtm3AJz6R2+EwiwW1WjSxoGvTCWIcS0UQa4M2nWDJEoA3aiaTgR67TjhmU2maxlqVzcLa22fTzOTnDAwU6qD0QCzohQPlLuiGYYBVba1eYm3QpjNIU2q7ggSbiFRSmsZ6VD3et0+v7hEbLZbxrs7ed9/HOJ3sWLUKnD1iuSr3ZayYpqk9DtM0VtRp3V0S3TViQV3BYGsO4poyqn/16ujn39HDPmbu6Jirl5imkcaueGaqN1Vj1dUhu3XrTM0r37GYsepzwS5f5TPUpEduVRWa+Ei8HWvDDFckP7R2bfSo181TccaqotD7OjqQoejJlZxFDRotMhncJN8qBXsWl5TlFHHxo4dmcverDWWpdBaVPP449LHKdp5aR3hPaY1YOzm5rI0N2c47rtGCwR1gkFcq2M4JcwQ5rgx5vRorN89SfDtyTfGaidgrYY4sGqJznc/tcpvduIEsg6v3hplcsN0S5mqPcY2wDZrI5464zWI3baS1W7aP156qsfZ77DKDqjnHqCSIBVubTtHUVKj+5uAgvOm9Zw/Ax77IPaosurvw1tG7dIXXz2zYAPDdWWFHsUK59vGxi+HhKKhbVGcs2Np0ipiJ29SOoSGndIXKly0DduwA+PjXd5Tw/c+3sfRB4bPs5AMXL969o3RXuUY1P2tXUMnbSODrX/fH/dRTYowQjV0ytev+5us/dQpgv2kxPB21wOOLa2NxXMKT7M+3CX0lq0fR11gOya8C/066HuLfCP2EZw1zp6mcxrqPLdX3U//E/MdEH3GB+H/i74g9y5cvr2EeUgoKUHv9ROkbpP4h0ZfJZK4y/x7xVULzsOj7TJbLkpIYS78P+Apb8Z/ESWKE0A/Zvsn88zU1NaubOcHYwMnUDj7sOzs7sWvXLh6aTAcOHIAPNDQ0TJKyVFtb64VXfRMXKQupoaHBG3eBlAVqn1EMFAvFpKmpqYUx+iIPfYt4hdDTpJu5pip/znwdUXJKYiw93v6HzH9D9++sr6+vam1txZYtW/jt+l489thjme3bt2P9+vVobGxEtSY6PHl64rWcYGacYjqntn3wikNc06H9rjGdU9uKgWKhmCg2jFHV3r17o5i1tLQsYQz1kwBNVV7g+ZcIPUKZzT0lMVYDHT/R1tYG3Qm8I7Bp0ybcf//9uM/XN7xz72+4YpoCipVitnnz5uiJ8jg/sldMaUJ95lbyryPmZqxpjZqYmMhoaK/S25Bpx8LmwlRAsVRMs9lshj0o2R8lX0jSkIIC91QgGOue0oQDSRQIxkqiXrj2ngoEY91TmnAgiQLBWEnUC9feU4FgrHtKU9EHEnc+GCuxhKGCYgoEYxVTJexLrEAwVmIJQwXFFAjGKqZK2JdYgWCsxBKGCoopEIxVTJWwL7ECwViJJfRTwUJjCcZaaBFbIO0NxloggVpozQzGWmgRWyDtDcZaIIFaaM0MxlpoEVsg7Q3GWiCBWmjNDMYqNWLhuhkVCMaaUZ5wsFQFgrFKVS5cN6MCqRrrzJkzOH36tHMUU+C0B15xpMUtbYtx+9qXyFj6u8K+vj68++676O3txVtvvYVz587h1VdfxYkTJ3D06FF0dXXh0KFDEY4cOTKlX0NDQxjyhDjx2NiYN15xxbl99Vc8cd5Tp06Nnzx58iOaPfv666/jjTfewDvvvIPLly/j2rVruH79eqTJ6Ogo1GbFltePEyWlJMa6I8bz58/j7bffjox19epVvP/++xgYGMDIyMhHt27dem98fPw1nneY+ClxjQgpBQUYj/eGh4dfGhoaOtLf33+WA0LflStXPrpw4QLefPNNnD17Nnpy9PT0oLtbSzhEjdRfQ0eFub4kMZaWxHmOhFq/QXie5RcIrTRzMJPJnCfuEBu57wDxh0QLEVI6CrSSVjFQLNazPEbopj/IXDHTyjOKYT6myrXNw3NPSYyl5W++Qkr9b1rCl6urq79YV1f3x/X19Z9tbGzcsWbNmt9paWlZbmYwQotR8PxCWrcOKB9mrqtAyoIvzjwPKQspv89HXiBlQdorBgJjsoKxWdfU1LRrxYoVn66trf0DxY6nfZnIx1S5VqPhrrmnJMZawcZMaLWSRx99FFqyp7Ozs6q9vb1KC4Q88sgj0SomWihEnRHUuXgTOSXjIxTg9MwpNmrMjBOz7JozXz+ppiS1JX/MZS5t48TSXjEQFBOtCqQY7d69u3r//v1LGLtqxbCjoyNaLaiqqkprttbH65hLOYmxoIUjtFrJkiVLomWI5kIczp1/CnDagqVLl8ZXCyrZHyVfOP9kCS2aTwoEY82naCyitgRjLaJgzqeuBGPNp2gsora4NNYikil0Za4KBGPNVbFw/qwUCMaalUzhpLkqEIw1V8XC+bNSIBhrVjKFk+aqQDDWXBUL589KgWCsWckUTppRgSIHg7GKiBJ2JVcgGCu5hqGGIgoEYxURJexKrkAwVnINQw1FFAjGKiJK2JVcgWCs5BqGGoooEIxVRJSFvyv9HgRjpR+DRdmCYKxFGdb0OxWMlX4MFmULgrEWZVjT71QwVvoxWJQtCMZalGEtW6dSWbthVCuSHMqtJKO8q6trvLu7+3ZPT8+4VpzRgiFagaa3txf5BUPiXd60CTADzAAzwAwwA8wAM8AMMAPMADPADDADzAAzwAwwA8wAM8AMMAPMADPADDADLlyIs94tmwFmgBlgBpgBZoAZYAaYAWaAGWAGmAFmgBlgBpgBZoAZYAaYAWaAGWAGmAFmd7kAFApqixlgBpgBZoAZYAaYAWaAGWAGmAFmgBlgBpgBZoAZYAaYAWaAGWAGmAFmgBkgbQukLGixFsVAsVBMFBvFKLcq0ARjN6EY5qHY8rIRoqSUZMT6DhmfI7QgiPD8+Pj4D8bGxn42Ojp6aGBg4CQ7c+XatWuj+c5o6RyeX0iXLwO+UCBlwRdnnoeUhZTf5yMvkLIg7WUoxYIx+YCxeXdwcPDMyMjIwVu3br3I2H2fp2kREMVSUGy/xX0lpSTG+gcyauEILQgiaEGJL3HfF4jPEg8TS4lLxCEiLGNEEVJMV8mtGBzOZrMXiBpiC/cpVorZkywrhoqloNj+I/eVlJIYq1oLR7S1taGN2LFjB7Zt24bNmzdj48aNWLt27dL7+a+5uXnbypUrDyxbtuyJmpqaB7Q+QEktDRclVaCVFUTLGFVXV2+vq6v7ZH19/dKmpiasWbMGra2tWL9+PR+jFiEXpxpeU1JKYqyIsKGhAQ1EY2MjVq9ejZaWFqxbtw4PPvggHnroITz88MPYuXNnZt++fTUdHR0Z3iXRdXpp4HW+IL48amtrozb74BZXnle5D848h/gEmWT37t2g/tCKMp2dnWhvb0d+VaCtW7dyTrYJGzZsgJlF4DVabSaj60tBYmOVQpq/RqOcRjvXyPPFc9ec+frjnPly/pjLXNrm+XQza1UgrSRDw+R3zyYv2R8lXzibVoVzKleBijVW5YbcT8+DsfzoXHEswVgVF3I/HQ7G8qNzxbEEY1VcyP10OBjLj84VxxKMVXEh99Ph+WMsP/0NLJ4UCMbyJHSl0QRjVVrEPfU3GMuT0JVGE4xVaRH31N9gLE9CVxpNMFalRdxTf2cwlqcWBJpFqUAw1qIMa/qdCsZKPwaLsgXBWIsyrOl3Khgr/RgsyhYEYy3KsKbfqWCs9GOQegtcNCCxsYaHhzExUfLaES76FOpMoIBiqZjqT8ZYTcmBTWKst9mIzMmTJ9HV1ZU9ceIEtDZAX18fbt68yTaFtBAUUKwUM8VOMTxy5AgUUxpLf6x6pdQ+JDHW35N0PfEkG/HtkZGRY1evXr2tVUyOHz+Ol19+eeK1117DpUuXMDg4iPHxcZ768cRr4RofZ4Vzznyf0uIuxqsYKBaKiWLDGGUVK8WMsQNjqBHqFK/9D0JrN3yDeUkpibFEeJkvLxBfI9qJFUQH8fSdO3d+MDAwcO3ixYs4c+aMRjX09PTw0GQ6fPgwfGBoaGiSlKWxsTEvvOqbuEhZSGqL9vtAgZQFac8nSxQLxaS/vx+M0fs89GPin4lPE/XEp4i/JZ4nSn70JDUWuaekj7jVTTxLfIl3bSvzB4g/I57hsHuMeUgpKEDt75D2KPEdQqsCbWD+SeJPiH8lDhMlG4nXTknlNtaUynMb7zH/EaFhVaPa0yyH5FeBb5JOT5P9zL9KaC2sXubOkg9jTW/8s5kMPty1C3w36Qcc9fNtGFDhu9/1w6s3y888I8YIg+w355qz4OZMR9cmhVnEq3Wx/oWlMcJbSsNYnDjj0ClOET/80E8/GxoABRUAWYGY0bjLbRqIrBxxnF+5EhO5dkQ7XL7cuAH09kYMWvQuKvh8ScVY7GC37kZ+QsGi+6RgNjSA4wCWiy0WbG06RczE9atWQW/hnfLlK3/llXwJmvMWNnwVUjOWOnhUU0kVPIBBVV/1rsfriJUzVraqCk1sgzdjHZt8m1RRxlK3J2Kdd26t5mZAwSVRNhdsFt0ncZF3KJuFVmV0T5hj0E3LkVrzqtO5XV4z3cVeCXNkWub5LIdrLUeY2+U2k7EY3FUM8oCC7ZZtsnZx8bF/g9zL1IbJI+5K5EN3N6eyWeiZoCmAO7J71JyWsdSc7t/8BhlNMrXhGk1NoNJYQtG9Guv69WhupxuJQ5brXt6t/+xZ4NataD6XymNQrUjVWGoAP3xX5hyx0WI4F+w5cJZ+KkesDK/+gPBmLD0GxUdUpLE0TMPXPEsjFoVWGqWxvNxQH9BOt29HI0f0wUrM3GqHM8Q0nXxv6IyteMVeBC5OjTc4uRyN3V33OK08u2PGGuN8h1+4lqfemWrhaJU/fFuFWBu06QzSlNpeJAE/zeJrCilNY2nO08XvpbOc9zjvemy00PeZXj5yiBkr+mlHrA3O+js8DJw7F80nUxut1LlUjcUGdGuSqU/hWXaaYkGN3iXFgu6MdzpHrA3OOGOPwdTmV+pc2saK7qo91BVZGwAAAORJREFUe6DPmJzic59TdyNExvLMGRHv3u2+n088EVHpJdJWhTSQtrEOstP/R+gnGz7wK3I9R/yC8MEnjhfJ9V+EuLXtA/ya/e73ouRNJaVtLHX6L/iiH5nNBaWeq//pSj9s+32PnJ8n108IcZfa7rle9xT5Uk3zwVipChDI3SgQjOVG14qvNRir4i3gRoBgLDe6VnytwVgVbwE3AgRjudG14mstm7EqXskgwBQFgrGmyBE2yqVAMFa5lAz1TFEgGGuKHGGjXAoEY5VLyVDPFAWCsabIETbKpUAwVrmUrJh6ZtfR3wIAAP//Ul4D5QAAAAZJREFUAwCYYmHD+050hwAAAABJRU5ErkJggg==",
    "56": "data:image/png;base64,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",
    "57": "data:image/png;base64,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"
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
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a>'
      + '  <h1 style="margin:0;font-size:28px;font-weight:800">📚 Algorithm <span style="color:#06b6d4">Library</span></h1>'
      + '  <a href="/trainer" style="background:rgba(168,85,247,.15);border:1px solid #a855f7;color:#a855f7;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;text-decoration:none;font-size:14px">🚀 Train</a>'
      + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:20px;background:rgba(255,255,255,.04);border-radius:12px;padding:4px;width:fit-content;margin-left:auto;margin-right:auto">'
      + '  <a href="/algs?set=pll" style="padding:10px 24px;background:rgba(6,182,212,.2);color:#06b6d4;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;border:1px solid #06b6d4">PLL (21)</a>'
      + '  <a href="/algs?set=oll" style="padding:10px 24px;background:none;color:#94a3b8;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;border:1px solid transparent">OLL (57)</a>'
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
  function makeOLLImage(caseId, opts){
    opts = opts || {};
    var size = opts.size || 100;
    var src = OLL_IMAGES[caseId];
    if (!src){
      var div = document.createElement('div');
      div.style.cssText = 'width:'+size+'px;height:'+size+'px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px;background:#3a3a3a;border-radius:8px';
      div.textContent = 'OLL ' + caseId;
      return div;
    }
    var img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:'+size+'px;height:'+size+'px;display:block;border-radius:8px';
    img.alt = 'OLL ' + caseId;
    return img;
  }

  function renderAlgsOLL(){
    document.title = 'OLL Library — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-algs-oll';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:32px 20px;box-sizing:border-box';
    if (!document.getElementById('t3-alg-shared-styles')){
      var st = document.createElement('style');
      st.id = 't3-alg-shared-styles';
      st.textContent = '.t3-alg-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;color:#fff}'
        + '.t3-alg-card:hover{background:rgba(239,68,68,.08);border-color:#ef4444;transform:translateY(-2px)}'
        + '.t3-alg-card .name{font-weight:700;font-size:13px;text-align:center}'
        + '.t3-alg-card .meta{font-size:11px;color:#64748b;display:flex;gap:6px;align-items:center}'
        + '.t3-alg-card .status-dot{width:8px;height:8px;border-radius:50%}'
        + '.t3-alg-status-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:6px 12px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;font-family:inherit}'
        + '.t3-alg-status-btn:hover{background:rgba(255,255,255,.08);color:#fff}'
        + '.t3-difficulty{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}'
        + '.t3-group-badge{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.3)}'
        + '@media (max-width:640px){.t3-alg-grid{grid-template-columns:repeat(3,1fr) !important}}';
      document.head.appendChild(st);
    }

    var html = '<div style="max-width:1300px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a>'
      + '  <h1 style="margin:0;font-size:28px;font-weight:800">📚 Algorithm <span style="color:#a855f7">Library</span></h1>'
      + '  <a href="/trainer" style="background:rgba(168,85,247,.15);border:1px solid #a855f7;color:#a855f7;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;text-decoration:none;font-size:14px">🚀 Train</a>'
      + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:20px;background:rgba(255,255,255,.04);border-radius:12px;padding:4px;width:fit-content;margin-left:auto;margin-right:auto">'
      + '  <a href="/algs?set=pll" style="padding:10px 24px;background:none;color:#94a3b8;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;border:1px solid transparent">PLL (21)</a>'
      + '  <a href="/algs?set=oll" style="padding:10px 24px;background:rgba(168,85,247,.2);color:#a855f7;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;border:1px solid #a855f7">OLL (57)</a>'
      + '</div>'
      + '<p style="color:#94a3b8;font-size:14px;margin-bottom:24px">57 cases · Click a case to learn the algorithm</p>'
      + '<div id="t3-oll-stats" style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;font-size:13px"></div>'
      + '<div class="t3-alg-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">'
      + OLL_CASES.map(function(c){
          return '<a href="/algs?set=oll&c='+c.id+'" class="t3-alg-card" data-id="'+c.id+'">'
            + '<div class="t3-cube" data-id="'+c.id+'" style="width:90px;height:90px"></div>'
            + '<div class="name">OLL '+c.id+'</div>'
            + '<div class="meta"><span class="status-dot" style="background:#374151"></span><span class="t3-group-badge">'+escapeHTML(c.group)+'</span></div>'
            + '</a>';
        }).join('')
      + '</div></div>';
    page.innerHTML = html;
    document.body.appendChild(page);

    loadAlgStatuses('oll', function(byId){
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
      var total = OLL_CASES.length;
      var done = statusCounts.learned + statusCounts.mastered;
      page.querySelector('#t3-oll-stats').innerHTML = ''
        + '<div style="background:rgba(255,255,255,.04);padding:8px 16px;border-radius:8px"><span style="color:#64748b">Progress</span> <span style="color:#fff;font-weight:700">'+done+'/'+total+'</span></div>'
        + '<div style="background:rgba(251,191,36,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(251,191,36,.2)"><span style="color:#fbbf24">⏳ Learning</span> <b style="color:#fbbf24">'+statusCounts.learning+'</b></div>'
        + '<div style="background:rgba(34,197,94,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(34,197,94,.2)"><span style="color:#22c55e">✓ Learned</span> <b style="color:#22c55e">'+statusCounts.learned+'</b></div>'
        + '<div style="background:rgba(168,85,247,.08);padding:8px 16px;border-radius:8px;border:1px solid rgba(168,85,247,.2)"><span style="color:#a855f7">⭐ Mastered</span> <b style="color:#a855f7">'+statusCounts.mastered+'</b></div>';
    });

    page.querySelectorAll('.t3-cube').forEach(function(div){
      var id = div.getAttribute('data-id');
      var img = makeOLLImage(id, {size:90});
      div.innerHTML = '';
      div.appendChild(img);
    });
  }

  function renderAlgCase(caseSet, caseId){
    var dataSet = (caseSet === 'pll') ? PLL_CASES : (caseSet === 'oll') ? OLL_CASES : null;
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
      + '  <div style="display:flex;gap:8px;align-items:center"><a href="/algs?set='+caseSet+'" style="color:#06b6d4;text-decoration:none;font-size:14px;font-weight:600">‹ '+caseSet.toUpperCase()+'</a><span style="color:#475569">·</span><a href="/algs?set='+(caseSet==='pll'?'oll':'pll')+'" style="color:#94a3b8;text-decoration:none;font-size:13px">switch to '+(caseSet==='pll'?'OLL':'PLL')+'</a></div>'
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
      + (c.setup ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px">'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Setup</h3><div style="font-family:monospace;font-size:13px;color:#cbd5e1;line-height:1.6">'+escapeHTML(c.setup)+'</div></div>'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Probability</h3><div style="font-size:24px;font-weight:800;color:#06b6d4">'+c.probability+'</div></div>'
      + '  <div class="t3p-card" style="margin:0;text-align:center"><h3>Difficulty</h3><div><span class="t3-difficulty '+c.difficulty+'" style="font-size:13px;padding:4px 14px">'+c.difficulty+'</span></div></div>'
      + '</div>' : (c.group ? '<div class="t3p-card" style="text-align:center;margin-bottom:24px"><h3>Group</h3><div style="font-size:18px;font-weight:700;color:#a855f7">'+escapeHTML(c.group)+'</div></div>' : ''))
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
    var imgFn = (caseSet === 'oll') ? makeOLLImage : makePLLSvg;
    var main = page.querySelector('.t3-cube-main');
    if (main){
      var svg = imgFn(main.getAttribute('data-id'), {size:200});
      main.innerHTML = '';
      main.appendChild(svg);
    }
    page.querySelectorAll('.t3-cube-small').forEach(function(div){
      var svg = imgFn(div.getAttribute('data-id'), {size:80});
      div.innerHTML = '';
      div.appendChild(svg);
    });
  }

  /* ===== TRAINER ===== */
  var trainerState = {
    set: 'pll',
    selected: [],  // array of case ids
    currentCase: null,
    currentScramble: '',
    currentAlg: '',
    timer: {phase: 'idle', startTs: 0, lastTime: 0},
    times: [],  // array of {time_ms, penalty, case_id, scramble, ts}
    showAlg: false,
    holdStartTs: 0,
    spaceDown: false
  };

  function loadTrainerTimes(caseSet, cb){
    if (!session){ cb([]); return; }
    sb.from('trainer_times').select('*').eq('user_id', session.user.id).eq('case_set', caseSet).order('created_at',{ascending:false}).limit(500).then(function(r){
      cb(r.data || []);
    });
  }

  function saveTrainerTime(caseSet, caseId, timeMs, penalty, scramble){
    if (!session) return;
    sb.from('trainer_times').insert({
      user_id: session.user.id,
      case_set: caseSet,
      case_id: caseId,
      time_ms: Math.round(timeMs),
      penalty: penalty || 0,
      scramble: scramble || ''
    }).then(function(r){
      if (r.error) console.error('[trainer] save error', r.error);
    });
  }

  function deleteTrainerTime(timeId){
    if (!session) return Promise.resolve();
    return sb.from('trainer_times').delete().eq('id', timeId);
  }

  function updateTrainerPenalty(timeId, penalty){
    if (!session) return Promise.resolve();
    return sb.from('trainer_times').update({penalty: penalty}).eq('id', timeId);
  }

  // Generate inverse algorithm (used to scramble a case)
  function invertAlg(alg){
    var moves = alg.replace(/[()]/g, '').trim().split(/\s+/);
    var result = [];
    for (var i = moves.length - 1; i >= 0; i--){
      var m = moves[i];
      if (!m) continue;
      if (m.endsWith("'")) result.push(m.substring(0, m.length-1));
      else if (m.endsWith('2')) result.push(m);
      else if (m.endsWith('’')) result.push(m.substring(0, m.length-1));
      else result.push(m + "'");
    }
    return result.join(' ');
  }

  function pickRandomCase(){
    var dataSet = (trainerState.set === 'pll') ? PLL_CASES : OLL_CASES;
    var pool = trainerState.selected.length > 0 
      ? dataSet.filter(function(c){ return trainerState.selected.indexOf(c.id) >= 0; })
      : dataSet;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function setupTrainerCase(){
    var c = pickRandomCase();
    if (!c){
      trainerState.currentCase = null;
      trainerState.currentScramble = 'No cases selected — pick from "Change" menu';
      trainerState.currentAlg = '';
      return;
    }
    trainerState.currentCase = c;
    trainerState.currentAlg = c.algs[0];
    // For PLL: use setup if available, otherwise inverse of alg
    // For OLL: use inverse of alg
    var randomAUF = ['', 'U', 'U2', "U'"][Math.floor(Math.random()*4)];
    var setup = c.setup || invertAlg(c.algs[0]);
    trainerState.currentScramble = (randomAUF + ' ' + setup).trim();
    trainerState.showAlg = false;
  }

  function formatTimeShort(ms){
    if (ms == null) return '—';
    var s = ms/1000;
    return s.toFixed(2);
  }

  function computeTrainerStats(){
    var times = trainerState.times.filter(function(t){ return t.penalty !== 2; });
    if (!times.length) return {count:0, best:null, avg:null};
    var validTimes = times.map(function(t){ return t.time_ms + (t.penalty===1 ? 2000 : 0); });
    var best = Math.min.apply(null, validTimes);
    var sum = validTimes.reduce(function(a,b){ return a+b; }, 0);
    var avg = sum / validTimes.length;
    return {count: trainerState.times.length, best: best, avg: avg, validCount: validTimes.length};
  }

  function renderTrainer(){
    if (!session){ buildModal(); return; }
    document.title = 'Trainer — 3DEN';
    var page = document.createElement('div');
    page.id = 't3-trainer';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:24px 20px;box-sizing:border-box';

    // Inject styles once
    if (!document.getElementById('t3-trainer-styles')){
      var st = document.createElement('style');
      st.id = 't3-trainer-styles';
      st.textContent = ''
        + '.t3tr-cube{width:60px;height:60px;border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all .15s;display:block;flex-shrink:0}'
        + '.t3tr-cube.selected{border-color:#fbbf24;box-shadow:0 0 0 1px rgba(251,191,36,.3)}'
        + '.t3tr-cube:hover{border-color:#fff}'
        + '.t3tr-time{padding:6px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;font-family:monospace;font-size:14px;text-align:center;cursor:pointer;transition:all .15s}'
        + '.t3tr-time:hover{background:rgba(255,255,255,.08)}'
        + '.t3tr-time.pb{color:#fbbf24;font-weight:700}'
        + '.t3tr-time.dnf{color:#94a3b8;text-decoration:line-through}'
        + '.t3tr-time.plus2{color:#f97316}'
        + '@media (max-width:900px){.t3tr-layout{grid-template-columns:1fr !important}.t3tr-stats{position:static !important}}';
      document.head.appendChild(st);
    }

    page.innerHTML = ''
      + '<div style="max-width:1200px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">'
      + '  <a href="/algs?set='+trainerState.set+'" style="color:#06b6d4;text-decoration:none;font-size:14px;font-weight:600">‹ Back to '+trainerState.set.toUpperCase()+'</a>'
      + '  <h1 style="margin:0;font-size:24px;font-weight:800">🚀 <span style="color:#a855f7">Trainer</span></h1>'
      + '  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
      + '    <div style="display:flex;background:rgba(255,255,255,.04);border-radius:8px;padding:3px;gap:2px">'
      + '      <button class="t3tr-set-btn" data-set="pll" style="background:'+(trainerState.set==='pll'?'rgba(6,182,212,.15)':'none')+';border:0;color:'+(trainerState.set==='pll'?'#06b6d4':'#94a3b8')+';padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px">PLL</button>'
      + '      <button class="t3tr-set-btn" data-set="oll" style="background:'+(trainerState.set==='oll'?'rgba(168,85,247,.15)':'none')+';border:0;color:'+(trainerState.set==='oll'?'#a855f7':'#94a3b8')+';padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px">OLL</button>'
      + '    </div>'
      + '    <button id="t3tr-change" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">Change cases</button>'
      + '  </div>'
      + '</div>'
      + '<div class="t3tr-layout" style="display:grid;grid-template-columns:1fr 320px;gap:20px">'
      + '  <div>'
      + '    <div id="t3tr-selected-bar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;min-height:84px;align-items:center"></div>'
      + '    <div id="t3tr-scramble" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;font-family:monospace;font-size:18px;text-align:center;color:#fbbf24;margin-bottom:16px;min-height:60px;display:flex;align-items:center;justify-content:center;line-height:1.5"></div>'
      + '    <div id="t3tr-timer" style="font-size:140px;font-weight:800;text-align:center;font-family:monospace;color:#fff;padding:30px 0;letter-spacing:-3px;cursor:pointer;user-select:none">0.00</div>'
      + '    <div id="t3tr-alg" style="text-align:center;color:#94a3b8;font-family:monospace;font-size:18px;min-height:30px;margin-bottom:12px"></div>'
      + '    <div style="text-align:center;color:#64748b;font-size:12px">'
      + '      <span style="margin:0 12px">SPACE — start/stop</span>'
      + '      <span style="margin:0 12px">A — show alg</span>'
      + '      <span style="margin:0 12px">D — case page</span>'
      + '      <span style="margin:0 12px">⌫ — delete last</span>'
      + '    </div>'
      + '  </div>'
      + '  <div class="t3tr-stats" style="position:sticky;top:20px;align-self:start">'
      + '    <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:16px;margin-bottom:12px">'
      + '      <div id="t3tr-current-cube" style="text-align:center;margin-bottom:14px"></div>'
      + '      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">'
      + '        <div><div style="font-size:11px;color:#64748b;text-transform:uppercase">Times</div><div id="t3tr-stat-count" style="font-size:18px;font-weight:700;color:#fff;font-family:monospace">0</div></div>'
      + '        <div><div style="font-size:11px;color:#64748b;text-transform:uppercase">Best</div><div id="t3tr-stat-best" style="font-size:18px;font-weight:700;color:#fbbf24;font-family:monospace">—</div></div>'
      + '        <div><div style="font-size:11px;color:#64748b;text-transform:uppercase">Avg</div><div id="t3tr-stat-avg" style="font-size:18px;font-weight:700;color:#fff;font-family:monospace">—</div></div>'
      + '      </div>'
      + '    </div>'
      + '    <div id="t3tr-times-list" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-height:300px;overflow-y:auto;padding:4px"></div>'
      + '  </div>'
      + '</div></div>';
    document.body.appendChild(page);

    bindTrainerEvents(page);
    refreshTrainerSelectedBar();
    setupTrainerCase();
    refreshTrainerDisplay();
    loadTrainerTimes(trainerState.set, function(times){
      trainerState.times = times;
      refreshTrainerStats();
      refreshTrainerTimesList();
    });
  }

  function refreshTrainerSelectedBar(){
    var bar = document.getElementById('t3tr-selected-bar');
    if (!bar) return;
    if (!trainerState.selected.length){
      bar.innerHTML = '<span style="color:#64748b;font-size:13px;margin:0 auto">No cases selected — All ' + trainerState.set.toUpperCase() + ' cases will appear.</span>';
      return;
    }
    var imgFn = (trainerState.set === 'oll') ? makeOLLImage : makePLLSvg;
    bar.innerHTML = '';
    trainerState.selected.forEach(function(id){
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px';
      var img = imgFn(id, {size:54});
      img.classList.add('t3tr-cube');
      wrap.appendChild(img);
      var lbl = document.createElement('div');
      lbl.textContent = (trainerState.set === 'oll' ? id : id);
      lbl.style.cssText = 'font-size:10px;color:#94a3b8';
      wrap.appendChild(lbl);
      bar.appendChild(wrap);
    });
  }

  function refreshTrainerDisplay(){
    var scrambleEl = document.getElementById('t3tr-scramble');
    var algEl = document.getElementById('t3tr-alg');
    var cubeEl = document.getElementById('t3tr-current-cube');
    if (scrambleEl) scrambleEl.textContent = trainerState.currentScramble;
    if (algEl){
      algEl.innerHTML = trainerState.showAlg && trainerState.currentAlg
        ? '<span style="color:#a855f7;font-weight:700">'+escapeHTML(trainerState.currentAlg)+'</span>'
        : '<span style="color:#475569;font-size:13px">Press A to reveal algorithm</span>';
    }
    if (cubeEl){
      cubeEl.innerHTML = '';
      if (trainerState.currentCase){
        var imgFn = (trainerState.set === 'oll') ? makeOLLImage : makePLLSvg;
        var img = imgFn(trainerState.currentCase.id, {size:120});
        img.style.borderRadius = '10px';
        cubeEl.appendChild(img);
        var lbl = document.createElement('div');
        lbl.textContent = trainerState.currentCase.name || trainerState.currentCase.id;
        lbl.style.cssText = 'color:#94a3b8;font-size:12px;margin-top:6px';
        cubeEl.appendChild(lbl);
      } else {
        cubeEl.innerHTML = '<div style="color:#64748b;font-size:13px;padding:30px 0">No case</div>';
      }
    }
  }

  function refreshTrainerStats(){
    var stats = computeTrainerStats();
    var c = document.getElementById('t3tr-stat-count');
    var b = document.getElementById('t3tr-stat-best');
    var a = document.getElementById('t3tr-stat-avg');
    if (c) c.textContent = stats.count;
    if (b) b.textContent = stats.best != null ? formatTimeShort(stats.best) : '—';
    if (a) a.textContent = stats.avg != null ? formatTimeShort(stats.avg) : '—';
  }

  function refreshTrainerTimesList(){
    var list = document.getElementById('t3tr-times-list');
    if (!list) return;
    if (!trainerState.times.length){
      list.innerHTML = '<div style="grid-column:1/-1;color:#64748b;text-align:center;padding:14px;font-size:12px">No times yet</div>';
      return;
    }
    var stats = computeTrainerStats();
    var displayed = trainerState.times.slice(0, 30);
    list.innerHTML = displayed.map(function(t){
      var effTime = t.time_ms + (t.penalty===1 ? 2000 : 0);
      var classes = ['t3tr-time'];
      if (t.penalty === 1) classes.push('plus2');
      else if (t.penalty === 2) classes.push('dnf');
      else if (effTime === stats.best) classes.push('pb');
      var label;
      if (t.penalty === 2) label = 'DNF';
      else if (t.penalty === 1) label = formatTimeShort(t.time_ms) + '+';
      else label = formatTimeShort(t.time_ms);
      return '<div class="'+classes.join(' ')+'" data-id="'+t.id+'" title="'+t.case_id+(t.created_at?' · '+timeAgo(t.created_at):'')+'">'+label+'</div>';
    }).join('');
    list.querySelectorAll('.t3tr-time').forEach(function(el){
      el.onclick = function(){ openTimeMenu(el.getAttribute('data-id')); };
    });
  }

  function openTimeMenu(timeId){
    var t = trainerState.times.find(function(x){ return String(x.id) === String(timeId); });
    if (!t) return;
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = '<div class="t3-auth-modal" style="max-width:340px"><h3 style="color:#fff;margin:0 0 12px;font-size:16px">'+t.case_id+' · '+formatTimeShort(t.time_ms)+'s</h3>'
      + '<div style="display:flex;flex-direction:column;gap:8px">'
      + '<button class="t3-auth-btn" data-act="ok" style="background:'+(t.penalty===0?'#22c55e':'rgba(34,197,94,.15)')+';color:#fff">'+(t.penalty===0?'✓ OK':'Mark as OK')+'</button>'
      + '<button class="t3-auth-btn" data-act="plus2" style="background:'+(t.penalty===1?'#f97316':'rgba(249,115,22,.15)')+';color:#fff">'+(t.penalty===1?'+2 (active)':'+2 penalty')+'</button>'
      + '<button class="t3-auth-btn" data-act="dnf" style="background:'+(t.penalty===2?'#ef4444':'rgba(239,68,68,.15)')+';color:#fff">'+(t.penalty===2?'DNF (active)':'Mark DNF')+'</button>'
      + '<button class="t3-auth-guest" data-act="del" style="color:#ef4444">🗑 Delete</button>'
      + '<button class="t3-auth-guest" data-act="close">Cancel</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    ov.onclick = function(e){ if (e.target === ov) ov.remove(); };
    ov.querySelectorAll('button').forEach(function(b){
      b.onclick = function(){
        var act = b.getAttribute('data-act');
        if (act === 'close'){ ov.remove(); return; }
        if (act === 'del'){
          deleteTrainerTime(t.id).then(function(){
            trainerState.times = trainerState.times.filter(function(x){ return String(x.id) !== String(timeId); });
            refreshTrainerStats(); refreshTrainerTimesList();
            ov.remove();
          });
        } else {
          var newPen = act === 'ok' ? 0 : (act === 'plus2' ? 1 : 2);
          updateTrainerPenalty(t.id, newPen).then(function(){
            t.penalty = newPen;
            refreshTrainerStats(); refreshTrainerTimesList();
            ov.remove();
          });
        }
      };
    });
  }

  function bindTrainerEvents(page){
    page.querySelectorAll('.t3tr-set-btn').forEach(function(b){
      b.onclick = function(){
        var newSet = b.getAttribute('data-set');
        if (newSet === trainerState.set) return;
        trainerState.set = newSet;
        trainerState.selected = [];
        var p = document.getElementById('t3-trainer'); if (p) p.remove();
        renderTrainer();
      };
    });
    document.getElementById('t3tr-change').onclick = openCaseSelector;
    document.getElementById('t3tr-timer').onclick = function(){ /* mobile tap */ };

    // Keyboard
    if (!window.__trainerKeyBound){
      window.__trainerKeyBound = true;
      document.addEventListener('keydown', trainerKeyDown);
      document.addEventListener('keyup', trainerKeyUp);
    }
  }

  function trainerKeyDown(e){
    var trainerVisible = !!document.getElementById('t3-trainer');
    if (!trainerVisible) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    
    if (e.code === 'Space'){
      e.preventDefault();
      if (trainerState.spaceDown) return;
      trainerState.spaceDown = true;
      
      if (trainerState.timer.phase === 'running'){
        // Stop timer
        var elapsed = Date.now() - trainerState.timer.startTs;
        trainerState.timer.phase = 'idle';
        trainerState.timer.lastTime = elapsed;
        recordTrainerTime(elapsed, 0);
        document.getElementById('t3tr-timer').style.color = '#fff';
      } else {
        // Start hold to begin
        trainerState.holdStartTs = Date.now();
        document.getElementById('t3tr-timer').style.color = '#ef4444';
      }
    } else if (e.code === 'KeyA'){
      e.preventDefault();
      trainerState.showAlg = !trainerState.showAlg;
      refreshTrainerDisplay();
    } else if (e.code === 'KeyD'){
      e.preventDefault();
      if (trainerState.currentCase){
        location.href = '/algs?set='+trainerState.set+'&c='+trainerState.currentCase.id;
      }
    } else if (e.code === 'Backspace' || e.code === 'Delete'){
      e.preventDefault();
      if (trainerState.times.length){
        deleteTrainerTime(trainerState.times[0].id).then(function(){
          trainerState.times.shift();
          refreshTrainerStats(); refreshTrainerTimesList();
        });
      }
    }
  }

  function trainerKeyUp(e){
    var trainerVisible = !!document.getElementById('t3-trainer');
    if (!trainerVisible) return;
    if (e.code !== 'Space') return;
    e.preventDefault();
    trainerState.spaceDown = false;
    
    if (trainerState.timer.phase === 'idle' && trainerState.holdStartTs > 0){
      var holdDuration = Date.now() - trainerState.holdStartTs;
      trainerState.holdStartTs = 0;
      if (holdDuration >= 300){
        // Start timer
        trainerState.timer.phase = 'running';
        trainerState.timer.startTs = Date.now();
        document.getElementById('t3tr-timer').style.color = '#22c55e';
        runTrainerTimer();
      } else {
        document.getElementById('t3tr-timer').style.color = '#fff';
      }
    }
  }

  function runTrainerTimer(){
    if (trainerState.timer.phase !== 'running') return;
    var elapsed = Date.now() - trainerState.timer.startTs;
    var el = document.getElementById('t3tr-timer');
    if (el) el.textContent = formatTimeShort(elapsed);
    requestAnimationFrame(runTrainerTimer);
  }

  function recordTrainerTime(timeMs, penalty){
    var caseId = trainerState.currentCase ? trainerState.currentCase.id : '?';
    saveTrainerTime(trainerState.set, caseId, timeMs, penalty || 0, trainerState.currentScramble);
    // Optimistic update
    var temp = {
      id: 'tmp-'+Date.now(),
      case_set: trainerState.set,
      case_id: caseId,
      time_ms: Math.round(timeMs),
      penalty: penalty || 0,
      scramble: trainerState.currentScramble,
      created_at: new Date().toISOString()
    };
    trainerState.times.unshift(temp);
    refreshTrainerStats();
    refreshTrainerTimesList();
    document.getElementById('t3tr-timer').textContent = formatTimeShort(timeMs);
    
    // Reload from server soon to get real ID
    setTimeout(function(){
      loadTrainerTimes(trainerState.set, function(times){
        trainerState.times = times;
        refreshTrainerStats();
        refreshTrainerTimesList();
      });
    }, 800);
    
    // Move to next case
    setTimeout(function(){
      setupTrainerCase();
      refreshTrainerDisplay();
      document.getElementById('t3tr-timer').textContent = '0.00';
    }, 1200);
  }

  function openCaseSelector(){
    var dataSet = (trainerState.set === 'pll') ? PLL_CASES : OLL_CASES;
    var imgFn = (trainerState.set === 'oll') ? makeOLLImage : makePLLSvg;
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = '<div class="t3-auth-modal" style="max-width:780px;max-height:90vh">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><h2 style="color:#fff;margin:0;font-size:18px">Select '+trainerState.set.toUpperCase()+' cases ('+trainerState.selected.length+'/'+dataSet.length+')</h2><button id="t3tr-cs-close" style="background:none;border:0;color:#94a3b8;font-size:22px;cursor:pointer">×</button></div>'
      + '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'
      + '  <button id="t3tr-sel-all" class="t3-auth-guest" style="margin:0;flex:1;min-width:100px;max-width:160px">Select all</button>'
      + '  <button id="t3tr-sel-none" class="t3-auth-guest" style="margin:0;flex:1;min-width:100px;max-width:160px">Clear</button>'
      + '</div>'
      + '<div id="t3tr-cs-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;max-height:60vh;overflow-y:auto;padding:4px"></div>'
      + '<button class="t3-auth-btn" id="t3tr-cs-done" style="margin-top:14px">Done</button>'
      + '</div>';
    document.body.appendChild(ov);
    ov.onclick = function(e){ if (e.target === ov) ov.remove(); };
    ov.querySelector('#t3tr-cs-close').onclick = function(){ ov.remove(); };
    ov.querySelector('#t3tr-cs-done').onclick = function(){
      ov.remove();
      refreshTrainerSelectedBar();
      setupTrainerCase();
      refreshTrainerDisplay();
    };
    
    var grid = ov.querySelector('#t3tr-cs-grid');
    function refreshGrid(){
      grid.innerHTML = '';
      dataSet.forEach(function(c){
        var div = document.createElement('div');
        var sel = trainerState.selected.indexOf(c.id) >= 0;
        div.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px;border-radius:8px;background:'+(sel?'rgba(251,191,36,.1)':'transparent')+';border:1px solid '+(sel?'#fbbf24':'transparent')+';transition:all .15s';
        var img = imgFn(c.id, {size:60});
        div.appendChild(img);
        var lbl = document.createElement('div');
        lbl.textContent = c.id;
        lbl.style.cssText = 'font-size:11px;color:'+(sel?'#fbbf24':'#94a3b8')+';font-weight:600';
        div.appendChild(lbl);
        div.onclick = function(){
          var idx = trainerState.selected.indexOf(c.id);
          if (idx >= 0) trainerState.selected.splice(idx, 1);
          else trainerState.selected.push(c.id);
          refreshGrid();
          ov.querySelector('h2').textContent = 'Select '+trainerState.set.toUpperCase()+' cases ('+trainerState.selected.length+'/'+dataSet.length+')';
        };
        grid.appendChild(div);
      });
    }
    refreshGrid();
    
    ov.querySelector('#t3tr-sel-all').onclick = function(){
      trainerState.selected = dataSet.map(function(c){ return c.id; });
      refreshGrid();
      ov.querySelector('h2').textContent = 'Select '+trainerState.set.toUpperCase()+' cases ('+trainerState.selected.length+'/'+dataSet.length+')';
    };
    ov.querySelector('#t3tr-sel-none').onclick = function(){
      trainerState.selected = [];
      refreshGrid();
      ov.querySelector('h2').textContent = 'Select '+trainerState.set.toUpperCase()+' cases ('+trainerState.selected.length+'/'+dataSet.length+')';
    };
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
    } else if (path === '/trainer'){
      renderTrainer();
    } else if (path === '/algs'){
      var qs = new URLSearchParams(location.search);
      var set = qs.get('set') || 'pll';
      var c = qs.get('c');
      if (c) renderAlgCase(set, c);
      else if (set === 'pll') renderAlgsPLL();
      else if (set === 'oll') renderAlgsOLL();
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
    transformTimerLayout();
    // Re-run transform after a delay if puzzle bar wasn't ready
    setTimeout(transformTimerLayout, 500);
    setTimeout(transformTimerLayout, 1500);
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
