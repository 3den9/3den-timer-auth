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
    + '.t3-auth-badge{position:fixed;top:14px;right:96px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 14px;display:flex;align-items:center;gap:10px;z-index:9000;font-size:13px;color:#e2e8f0}'
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
    + '@keyframes t3pulse{0%,100%{opacity:1}50%{opacity:.4}}';

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
    ['t3-auth-badge','t3-trophy','t3-sync'].forEach(function(id){ var x=document.getElementById(id); if(x)x.remove(); });
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
      ['t3-auth-badge','t3-trophy','t3-sync'].forEach(function(id){var x=document.getElementById(id); if(x)x.remove();});
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
      // Get stats
      sb.from('user_stats').select('*').eq('username', username).then(function(sr){
        // Get all solves for heatmap
        sb.from('solves').select('solve_date,puzzle').eq('user_id', p.id).then(function(allr){
          var stats = sr.data || [];
          var allSolves = allr.data || [];
          renderProfileContent(page, p, stats, allSolves);
        });
      });
    });
  }

  function renderProfileContent(page, p, stats, allSolves){
    var color = p.avatar_color || '#ef4444';
    var initial = (p.username||'?').charAt(0).toUpperCase();
    var joined = new Date(p.created_at).toLocaleDateString();
    var avatarStyle = p.avatar_type === 'image' && p.avatar_url
      ? 'background:url('+p.avatar_url+') center/cover;'
      : 'background:'+color+';';
    var flag = p.country ? countryFlag(p.country) : '';
    var isOwn = profile && profile.id === p.id;
    var hasStats = stats.some(function(s){ return s.puzzle && s.total_solves > 0; });

    // Build heatmap data: count solves per day for last 365 days
    var heatmap = buildHeatmap(allSolves);

    // Main events badges
    var eventBadges = (p.main_events||[]).map(function(e){
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(6,182,212,.15);color:#06b6d4;border-radius:999px;font-size:12px;font-weight:600;border:1px solid rgba(6,182,212,.3)">'+puzzleLabel(e)+'</span>';
    }).join(' ');

    var html = '<div style="max-width:900px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px">'
      + '  <a href="/leaderboard" style="color:#94a3b8;text-decoration:none;font-size:14px">← Leaderboard</a>'
      + (isOwn ? '<button id="t3p-edit" style="background:rgba(239,68,68,.15);border:1px solid #ef4444;color:#ef4444;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600">⚙ Edit profile</button>' : '<div></div>')
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:24px;margin-bottom:32px;flex-wrap:wrap">'
      + '  <div style="width:96px;height:96px;border-radius:50%;'+avatarStyle+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;font-weight:800;border:3px solid #ef4444;box-sizing:border-box;flex-shrink:0">'
      + (p.avatar_type === 'image' ? '' : initial)
      + '  </div>'
      + '  <div style="flex:1;min-width:200px">'
      + '    <h1 style="margin:0;font-size:32px;font-weight:800">'+(flag?flag+' ':'')+'@'+escapeHTML(p.username)+'</h1>'
      + (p.country ? '<p style="color:#64748b;margin:4px 0 0;font-size:13px">📍 '+escapeHTML(countryName(p.country))+'</p>' : '')
      + '    <p style="color:#64748b;margin:4px 0 0;font-size:13px">Joined '+joined+'</p>'
      + (eventBadges ? '<div style="margin-top:10px">'+eventBadges+'</div>' : '')
      + '  </div>'
      + '</div>'
      + (p.bio ? '<p style="color:#cbd5e1;background:rgba(255,255,255,.03);padding:16px;border-radius:10px;margin-bottom:32px;border-left:3px solid #ef4444;line-height:1.5">'+escapeHTML(p.bio)+'</p>' : '');

    // Heatmap
    html += '<div style="background:#0a0e1a;border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:20px;margin-bottom:24px">'
      + '<h2 style="font-size:16px;margin:0 0 16px;font-weight:700">🔥 Activity '+heatmap.totalSolves+' solves in '+heatmap.activeDays+' days</h2>'
      + '<div style="overflow-x:auto"><div style="display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;gap:3px;width:max-content">'
      + heatmap.cells.map(function(c){
          var alpha = c.count === 0 ? 0.05 : Math.min(0.2 + c.count*0.15, 1);
          return '<div title="'+c.date+': '+c.count+' solves" style="width:12px;height:12px;background:rgba(239,68,68,'+alpha+');border-radius:2px"></div>';
        }).join('')
      + '</div></div></div>';

    // PBs grid
    if (hasStats){
      html += '<h2 style="font-size:18px;margin:24px 0 16px;font-weight:700">🏆 Personal records</h2>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
      stats.filter(function(s){return s.puzzle && s.total_solves > 0;}).forEach(function(s){
        html += '<div style="background:#0a0e1a;border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:16px">'
          + '<div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.5px">'+puzzleLabel(s.puzzle)+'</div>'
          + '<div style="font-family:monospace;font-size:24px;font-weight:700;color:#fbbf24;margin-top:4px">'+formatTime(s.best_single)+'</div>'
          + '<div style="color:#64748b;font-size:11px;margin-top:4px">'+s.total_solves+' solves</div>'
          + '</div>';
      });
      html += '</div>';
    } else {
      html += '<p style="text-align:center;color:#64748b;padding:40px">No solves yet</p>';
    }

    html += '</div>';
    page.innerHTML = html;
    if (isOwn){
      var eb = document.getElementById('t3p-edit');
      if (eb) eb.onclick = buildEditProfile;
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
    }
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
