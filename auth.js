/* 3DEN Timer — Auth v2 (login + username + leaderboard + profiles) */
(function(){
  if (window.__t3denAuthLoaded) return;
  window.__t3denAuthLoaded = true;

  var SUPABASE_URL = 'https://jnszsffkrcdovshhdifo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_rkWS91kcBgMSmOS7dFE2ww_F_UDk2xM';
  var STORAGE_KEY = 't3den_v4';
  var GUEST_KEY = 't3den_guest_mode';

  function loadSDK(cb){
    if (window.supabase && window.supabase.createClient) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = cb;
    s.onerror = function(){ console.error('[3DEN] Supabase SDK failed'); };
    document.head.appendChild(s);
  }

  /* ===== STYLES ===== */
  var css = ''
    + '.t3-auth-overlay{position:fixed;inset:0;background:rgba(10,14,26,.92);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;animation:t3aFade .25s ease}'
    + '.t3-auth-modal{background:linear-gradient(135deg,#161a2e 0%,#0a0e1a 100%);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:36px;width:min(92vw,420px);box-shadow:0 25px 50px -12px rgba(239,68,68,.25);animation:t3aPop .3s cubic-bezier(.34,1.56,.64,1);max-height:92vh;overflow-y:auto}'
    + '.t3-auth-logo{text-align:center;margin-bottom:24px}'
    + '.t3-auth-logo h1{font-size:32px;font-weight:800;letter-spacing:-1px;color:#fff;margin:0}'
    + '.t3-auth-logo h1 span{color:#ef4444}'
    + '.t3-auth-logo p{color:#94a3b8;font-size:13px;margin:6px 0 0}'
    + '.t3-auth-tabs{display:flex;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:20px}'
    + '.t3-auth-tab{flex:1;padding:10px;background:none;border:0;color:#94a3b8;font-weight:600;border-radius:8px;cursor:pointer;transition:all .2s;font-size:14px}'
    + '.t3-auth-tab.active{background:rgba(239,68,68,.15);color:#ef4444}'
    + '.t3-auth-input{width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;color:#fff;font-size:14px;margin-bottom:12px;box-sizing:border-box;transition:border .2s;font-family:inherit}'
    + '.t3-auth-input:focus{outline:0;border-color:#ef4444}'
    + '.t3-auth-btn{width:100%;background:#ef4444;color:#fff;border:0;border-radius:10px;padding:14px;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;margin-top:8px}'
    + '.t3-auth-btn:hover{background:#dc2626;transform:translateY(-1px)}'
    + '.t3-auth-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}'
    + '.t3-auth-guest{width:100%;background:none;color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px;font-size:13px;cursor:pointer;margin-top:14px;transition:all .2s}'
    + '.t3-auth-guest:hover{color:#fff;border-color:rgba(255,255,255,.3)}'
    + '.t3-auth-msg{font-size:13px;padding:10px 12px;border-radius:8px;margin-bottom:12px;display:none}'
    + '.t3-auth-msg.error{background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3);display:block}'
    + '.t3-auth-msg.success{background:rgba(34,197,94,.15);color:#86efac;border:1px solid rgba(34,197,94,.3);display:block}'
    + '.t3-auth-msg.info{background:rgba(99,102,241,.15);color:#a5b4fc;border:1px solid rgba(99,102,241,.3);display:block}'
    + '.t3-auth-hint{font-size:11px;color:#64748b;margin-top:-8px;margin-bottom:12px;padding-left:4px}'
    + '.t3-auth-badge{position:fixed;top:14px;right:54px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 14px;display:flex;align-items:center;gap:10px;z-index:9000;font-size:13px;color:#e2e8f0}'
    + '.t3-auth-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e}'
    + '.t3-auth-badge .dot.guest{background:#94a3b8}'
    + '.t3-auth-badge a{color:#e2e8f0;text-decoration:none}'
    + '.t3-auth-badge a:hover{color:#ef4444}'
    + '.t3-auth-badge button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:color .15s}'
    + '.t3-auth-badge button:hover{color:#ef4444}'
    + '.t3-trophy{position:fixed;top:14px;right:14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;z-index:9000;cursor:pointer;transition:all .2s;color:#fbbf24;font-size:16px;text-decoration:none}'
    + '.t3-trophy:hover{background:rgba(251,191,36,.15);border-color:#fbbf24;transform:scale(1.05)}'
    + '@keyframes t3aFade{from{opacity:0}to{opacity:1}}'
    + '@keyframes t3aPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}';

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
  var pendingSignup = null;

  /* ===== UI ===== */
  function buildModal(){
    closeModal();
    var html = '<div style="max-width:900px;margin:0 auto">'
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>3<span>DEN</span></h1><p>Speedcubing timer</p></div>'
      + '  <div class="t3-auth-tabs">'
      + '    <button class="t3-auth-tab active" data-mode="signin">Sign in</button>'
      + '    <button class="t3-auth-tab" data-mode="signup">Sign up</button>'
      + '  </div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <div id="t3a-username-row" style="display:none">'
      + '    <input type="text" class="t3-auth-input" id="t3au" placeholder="Username (3-20 chars, a-z 0-9 _ -)" autocomplete="username" maxlength="20"/>'
      + '    <p class="t3-auth-hint">This is your public name. Cannot be changed later.</p>'
      + '  </div>'
      + '  <input type="email" class="t3-auth-input" id="t3ae" placeholder="Email" autocomplete="email"/>'
      + '  <input type="password" class="t3-auth-input" id="t3ap" placeholder="Password (min 6 chars)" autocomplete="current-password"/>'
      + '  <button class="t3-auth-btn" id="t3ab">Sign in</button>'
      + '  <button class="t3-auth-guest" id="t3ag">Continue as guest →</button>'
      + '</div>';
    var ov = document.createElement('div');
    ov.className = 't3-auth-overlay';
    ov.id = 't3-auth-overlay';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var tabs = ov.querySelectorAll('.t3-auth-tab');
    var btn = ov.querySelector('#t3ab');
    var guest = ov.querySelector('#t3ag');
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
      if (mode === 'signup'){
        doSignup(userIn.value.trim().toLowerCase(), emailIn.value.trim(), passIn.value);
      } else {
        doSignin(emailIn.value.trim(), passIn.value);
      }
    };
    guest.onclick = function(){
      localStorage.setItem(GUEST_KEY, '1');
      closeModal();
      buildBadge(null);
    };

    [emailIn, passIn, userIn].forEach(function(i){
      i.addEventListener('keydown', function(e){
        if (e.key === 'Enter') btn.click();
      });
    });

    setTimeout(function(){ emailIn.focus(); }, 100);
  }

  function buildUsernamePrompt(user){
    closeModal();
    var html = '<div style="max-width:900px;margin:0 auto">'
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>Choose a <span>username</span></h1><p>This will be your public name on 3DEN</p></div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
      + '  <input type="text" class="t3-auth-input" id="t3au" placeholder="Username (3-20 chars, a-z 0-9 _ -)" autocomplete="username" maxlength="20"/>'
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
      if (!validUsername(u)){ msg('Username must be 3-20 characters: a-z, 0-9, _, -', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Saving...';
      sb.from('profiles').insert({id: user.id, username: u}).then(function(r){
        if (r.error){
          var m = r.error.message;
          if (m.indexOf('duplicate') >= 0 || m.indexOf('unique') >= 0) m = 'Username already taken';
          msg(m, 'error');
          btn.disabled = false; btn.textContent = 'Save';
          return;
        }
        profile = {id: user.id, username: u};
        closeModal();
        buildBadge(user);
        syncOnLogin();
      });
    };
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') btn.click(); });
    setTimeout(function(){ input.focus(); }, 100);
  }

  function validUsername(u){ return /^[a-z0-9_-]{3,20}$/.test(u); }

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

  function buildBadge(user){
    var oldB = document.getElementById('t3-auth-badge');
    if (oldB) oldB.remove();
    var oldT = document.getElementById('t3-trophy');
    if (oldT) oldT.remove();

    // Trophy icon (always visible)
    var t = document.createElement('a');
    t.className = 't3-trophy';
    t.id = 't3-trophy';
    t.href = '/leaderboard';
    t.title = 'Leaderboard';
    t.innerHTML = '🏆';
    document.body.appendChild(t);

    var div = document.createElement('div');
    div.className = 't3-auth-badge';
    div.id = 't3-auth-badge';
    if (user && profile){
      div.innerHTML = '<span class="dot"></span><a href="/u?u='+encodeURIComponent(profile.username)+'">'+escapeHTML(profile.username)+'</a><button id="t3blo">logout</button>';
      document.body.appendChild(div);
      document.getElementById('t3blo').onclick = doLogout;
    } else {
      div.innerHTML = '<span class="dot guest"></span><span>Guest</span><button id="t3bli">login</button>';
      document.body.appendChild(div);
      document.getElementById('t3bli').onclick = function(){
        localStorage.removeItem(GUEST_KEY);
        var b = document.getElementById('t3-auth-badge'); if (b) b.remove();
        buildModal();
      };
    }
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ===== AUTH ===== */
  function doSignup(username, email, password){
    if (!validUsername(username)){ msg('Username: 3-20 chars, only a-z 0-9 _ -', 'error'); return; }
    if (!email || !password){ msg('Email and password required', 'error'); return; }
    if (password.length < 6){ msg('Password min 6 chars', 'error'); return; }
    var btn = document.getElementById('t3ab');
    btn.disabled = true; btn.textContent = 'Checking username...';

    // Check username available first
    sb.from('profiles').select('username').eq('username', username).maybeSingle().then(function(r){
      if (r.data){ msg('Username already taken', 'error'); btn.disabled=false; btn.textContent='Create account'; return; }
      btn.textContent = 'Creating account...';
      sb.auth.signUp({email: email, password: password}).then(function(res){
        if (res.error){
          var m = res.error.message;
          if (m.indexOf('User already') >= 0) m = 'Email already registered. Try Sign in.';
          msg(m, 'error');
          btn.disabled = false; btn.textContent = 'Create account';
          return;
        }
        session = res.data.session;
        // Insert profile
        sb.from('profiles').insert({id: res.data.user.id, username: username}).then(function(p){
          if (p.error){ msg('Account OK but profile error: '+p.error.message, 'error'); return; }
          profile = {id: res.data.user.id, username: username};
          msg('Welcome '+username+'!', 'success');
          setTimeout(function(){
            closeModal();
            buildBadge(res.data.user);
            syncOnLogin();
          }, 600);
        });
      });
    });
  }

  function doSignin(email, password){
    if (!email || !password){ msg('Email and password required', 'error'); return; }
    var btn = document.getElementById('t3ab');
    btn.disabled = true; btn.textContent = 'Signing in...';
    sb.auth.signInWithPassword({email: email, password: password}).then(function(res){
      if (res.error){
        var m = res.error.message;
        if (m.indexOf('Invalid login') >= 0) m = 'Wrong email or password';
        msg(m, 'error');
        btn.disabled = false; btn.textContent = 'Sign in';
        return;
      }
      session = res.data.session;
      loadProfile(session.user.id, function(p){
        profile = p;
        if (!p){
          // Old user without profile, prompt for username
          buildUsernamePrompt(session.user);
        } else {
          closeModal();
          buildBadge(session.user);
          syncOnLogin();
        }
      });
    });
  }

  function loadProfile(uid, cb){
    sb.from('profiles').select('*').eq('id', uid).maybeSingle().then(function(r){
      cb(r.data || null);
    });
  }

  function doLogout(){
    if (!sb) return;
    sb.auth.signOut().then(function(){
      session = null; profile = null;
      var b = document.getElementById('t3-auth-badge'); if (b) b.remove();
      var t = document.getElementById('t3-trophy'); if (t) t.remove();
      buildModal();
    });
  }

  /* ===== SYNC ===== */
  function syncOnLogin(){
    if (!session) return;
    var uid = session.user.id;
    sb.from('solves').select('*').eq('user_id', uid).order('solve_date', {ascending:true}).then(function(r){
      if (r.error){ console.error('[3DEN] pull', r.error); return; }
      var remote = r.data || [];
      var local = readLocal();
      var toUpload = [];
      // Real structure: { puzzle:'333', sessions: {'333':[...], '222':[...]}, pr:{...} }
      var sessions = local.sessions || {};
      Object.keys(sessions).forEach(function(p){
        (sessions[p] || []).forEach(function(s){
          if (!s || !s.d) return;
          var found = remote.some(function(rr){ return rr.puzzle === p && rr.solve_date == s.d && rr.time_ms == s.t; });
          if (!found){
            toUpload.push({user_id: uid, puzzle: p, time_ms: s.t, scramble: s.s||'', penalty: s.pen||0, solve_date: s.d});
          }
        });
      });
      if (toUpload.length){
        console.log('[3DEN] uploading '+toUpload.length+' solves');
        sb.from('solves').insert(toUpload).then(function(rr){
          if (rr.error) console.error('[3DEN] upload err', rr.error);
          else console.log('[3DEN] migrated '+toUpload.length+' solves');
        });
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
            var rows = newSolves.map(function(x){
              return {user_id: session.user.id, puzzle: x.puzzle, time_ms: x.solve.t, scramble: x.solve.s||'', penalty: x.solve.pen||0, solve_date: x.solve.d};
            });
            sb.from('solves').insert(rows).then(function(rr){ if (rr.error) console.error('[3DEN] push', rr.error); });
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
          sb.from('solves').update({penalty:s.pen||0}).match({user_id:uid,puzzle:p,solve_date:s.d,time_ms:s.t}).then(function(){});
        }
      });
      prevArr.forEach(function(s){
        if (!s||!s.d) return;
        var st = arr.some(function(x){ return x&&x.d==s.d&&x.t==s.t; });
        if (!st){
          sb.from('solves').delete().match({user_id:uid,puzzle:p,solve_date:s.d,time_ms:s.t}).then(function(){});
        }
      });
    });
  }

  /* ===== ROUTING (leaderboard / profile) ===== */
  function handleRoute(){
    var path = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    if (path === '/leaderboard' || path.indexOf('/leaderboard') === 0){
      renderLeaderboard();
    } else if (path === '/u'){
      var uname = new URLSearchParams(location.search).get('u') || '';
      renderProfile(uname);
    } else {
      // Timer page — already handled
    }
  }

  /* ===== LEADERBOARD PAGE ===== */
  function renderLeaderboard(){
    document.title = 'Leaderboard — 3DEN';
    var root = document.getElementById('t3den-mount') || document.body;
    // Clear any timer content
    var timerApp = document.getElementById('t3den-app');
    if (timerApp) timerApp.style.display = 'none';

    var page = document.createElement('div');
    page.id = 't3-leaderboard';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:1200px;margin:0 auto">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px">'
      + '  <a href="/" style="color:#94a3b8;text-decoration:none;font-size:14px">← Back to timer</a>'
      + '  <h1 style="margin:0;font-size:32px;font-weight:800">🏆 <span style="color:#fbbf24">Leaderboard</span></h1>'
      + '  <div style="width:100px"></div>'
      + '</div>'
      + '<div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap">'
      + '  <select id="t3lb-puzzle" style="background:#161a2e;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 16px;font-size:14px">'
      + '    <option value="333">3x3</option><option value="222">2x2</option><option value="444">4x4</option><option value="555">5x5</option>'
      + '    <option value="666">6x6</option><option value="777">7x7</option><option value="333oh">3x3 OH</option>'
      + '    <option value="333bld">3BLD</option><option value="333fm">FMC</option><option value="pyram">Pyraminx</option>'
      + '    <option value="skewb">Skewb</option><option value="clock">Clock</option><option value="minx">Megaminx</option><option value="sq1">Square-1</option>'
      + '  </select>'
      + '  <div style="display:flex;background:rgba(255,255,255,.04);border-radius:8px;padding:4px;gap:2px">'
      + '    <button class="t3lb-tab active" data-tab="single">Single</button>'
      + '    <button class="t3lb-tab" data-tab="ao5">AO5</button>'
      + '    <button class="t3lb-tab" data-tab="ao12">AO12</button>'
      + '  </div>'
      + '</div>'
      + '<div id="t3lb-list" style="background:#0a0e1a;border:1px solid rgba(255,255,255,.05);border-radius:12px;overflow:hidden"></div></div>';

    // Inject leaderboard styles
    var st2 = document.createElement('style');
    st2.textContent = ''
      + '.t3lb-tab{background:none;border:0;color:#94a3b8;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;transition:all .2s}'
      + '.t3lb-tab.active{background:rgba(251,191,36,.15);color:#fbbf24}'
      + '.t3lb-row{display:grid;grid-template-columns:60px 1fr auto auto;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}'
      + '.t3lb-row:hover{background:rgba(255,255,255,.02)}'
      + '.t3lb-row:last-child{border-bottom:0}'
      + '.t3lb-rank{font-weight:700;font-size:16px;color:#64748b}'
      + '.t3lb-rank.gold{color:#fbbf24;font-size:20px}'
      + '.t3lb-rank.silver{color:#cbd5e1;font-size:18px}'
      + '.t3lb-rank.bronze{color:#fb923c;font-size:18px}'
      + '.t3lb-user{display:flex;align-items:center;gap:12px}'
      + '.t3lb-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px}'
      + '.t3lb-username{color:#fff;font-weight:600;text-decoration:none}'
      + '.t3lb-username:hover{color:#ef4444}'
      + '.t3lb-time{font-family:monospace;font-size:18px;font-weight:700;color:#fff}'
      + '.t3lb-count{color:#64748b;font-size:12px;margin-left:16px}';
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
          var initial = (row.username||'?').charAt(0).toUpperCase();
          return '<div class="t3lb-row">'
            + '<div class="t3lb-rank '+rankClass+'">'+medal+'</div>'
            + '<div class="t3lb-user">'
            + '  <div class="t3lb-avatar" style="background:'+color+'">'+initial+'</div>'
            + '  <a href="/u?u='+encodeURIComponent(row.username)+'" class="t3lb-username">'+escapeHTML(row.username)+'</a>'
            + '</div>'
            + '<div class="t3lb-time">'+formatTime(row[col])+'</div>'
            + '<div class="t3lb-count">'+(row.solve_count?row.solve_count+' solves':'')+'</div>'
            + '</div>';
        }).join('');
      });
    }

    tabs.forEach(function(t){
      t.onclick = function(){
        tabs.forEach(function(x){ x.classList.remove('active'); });
        t.classList.add('active');
        currentTab = t.getAttribute('data-tab');
        loadAndRender();
      };
    });
    puzzleSel.onchange = loadAndRender;
    loadAndRender();
  }

  /* ===== PROFILE PAGE ===== */
  function renderProfile(username){
    var timerApp = document.getElementById('t3den-app');
    if (timerApp) timerApp.style.display = 'none';

    var page = document.createElement('div');
    page.id = 't3-profile';
    page.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;overflow-y:auto;z-index:9999;padding:40px 20px;box-sizing:border-box';
    page.innerHTML = '<div style="max-width:900px;margin:0 auto;text-align:center;color:#64748b;padding:80px">Loading profile...</div>';
    document.body.appendChild(page);
    document.title = '@'+username+' — 3DEN';

    sb.from('user_stats').select('*').eq('username', username).then(function(r){
      if (r.error || !r.data || !r.data.length){
        page.innerHTML = '<div style="text-align:center;padding:80px"><h1>404</h1><p style="color:#64748b">User @'+escapeHTML(username)+' not found</p><a href="/" style="color:#ef4444">← Back</a></div>';
        return;
      }
      var stats = r.data;
      var p0 = stats[0];
      var color = p0.avatar_color || '#ef4444';
      var initial = (p0.username||'?').charAt(0).toUpperCase();
      var joined = new Date(p0.created_at).toLocaleDateString();
      var hasData = stats.some(function(s){ return s.puzzle; });
      var html = '<div style="max-width:900px;margin:0 auto">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px">'
        + '  <a href="/leaderboard" style="color:#94a3b8;text-decoration:none;font-size:14px">← Leaderboard</a>'
        + '  <div style="width:100px"></div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:24px;margin-bottom:40px">'
        + '  <div style="width:96px;height:96px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:42px;font-weight:800">'+initial+'</div>'
        + '  <div>'
        + '    <h1 style="margin:0;font-size:32px;font-weight:800">@'+escapeHTML(p0.username)+'</h1>'
        + (p0.display_name ? '<p style="color:#94a3b8;margin:4px 0 0">'+escapeHTML(p0.display_name)+'</p>' : '')
        + (p0.country ? '<p style="color:#64748b;margin:4px 0 0;font-size:13px">📍 '+escapeHTML(p0.country)+'</p>' : '')
        + '    <p style="color:#64748b;margin:4px 0 0;font-size:13px">Joined '+joined+'</p>'
        + '  </div>'
        + '</div>'
        + (p0.bio ? '<p style="color:#cbd5e1;background:rgba(255,255,255,.03);padding:16px;border-radius:10px;margin-bottom:32px;border-left:3px solid #ef4444">'+escapeHTML(p0.bio)+'</p>' : '');

      if (!hasData){
        html += '<p style="text-align:center;color:#64748b;padding:40px">No solves yet</p>';
      } else {
        html += '<h2 style="font-size:18px;margin-bottom:16px">Personal records</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
        stats.forEach(function(s){
          if (!s.puzzle) return;
          html += '<div style="background:#0a0e1a;border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:16px">'
            + '<div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.5px">'+puzzleLabel(s.puzzle)+'</div>'
            + '<div style="font-family:monospace;font-size:24px;font-weight:700;color:#fbbf24;margin-top:4px">'+formatTime(s.best_single)+'</div>'
            + '<div style="color:#64748b;font-size:11px;margin-top:4px">'+s.total_solves+' solves</div>'
            + '</div>';
        });
        html += '</div>';
      }
      html += '</div>'; page.innerHTML = html;
    });
  }

  function puzzleLabel(p){
    var m = {'333':'3x3','222':'2x2','444':'4x4','555':'5x5','666':'6x6','777':'7x7','333oh':'3x3 OH','333bld':'3BLD','333fm':'FMC','444bld':'4BLD','555bld':'5BLD','333mbf':'MBLD','pyram':'Pyraminx','skewb':'Skewb','clock':'Clock','minx':'Megaminx','sq1':'Square-1'};
    return m[p] || p;
  }

  function formatTime(ms){
    if (ms == null) return '—';
    var s = Number(ms)/1000;
    if (s < 60) return s.toFixed(2);
    var m = Math.floor(s/60); var rs = s - m*60;
    return m+':'+(rs<10?'0':'')+rs.toFixed(2);
  }

  /* ===== INIT ===== */
  function init(){
    injectCSS();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:true,autoRefreshToken:true}});
    window.__t3denSb = sb;

    // Detect route
    var path = location.pathname.replace(/^\/[a-z]{2}\//, '/');
    var isSubPage = path === '/leaderboard' || path === '/u';

    sb.auth.getSession().then(function(r){
      session = r.data.session;
      if (session){
        loadProfile(session.user.id, function(p){
          profile = p;
          if (isSubPage){
            handleRoute();
            buildBadge(session.user);
          } else if (!p){
            buildUsernamePrompt(session.user);
          } else {
            buildBadge(session.user);
            syncOnLogin();
          }
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
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      var tries = 0;
      (function check(){
        if (document.body || tries > 50) cb();
        else { tries++; setTimeout(check, 100); }
      })();
    }
  }

  whenReady(function(){ loadSDK(init); });
})();
