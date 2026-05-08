/* 3DEN Timer — Auth & Cloud Sync v1
 * Adds login modal, session management, Supabase sync.
 * Works alongside existing localStorage timer (key 't3den_v4').
 */
(function(){
  if (window.__t3denAuthLoaded) return;
  window.__t3denAuthLoaded = true;

  var SUPABASE_URL = 'https://jnszsffkrcdovshhdifo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_rkWS91kcBgMSmOS7dFE2ww_F_UDk2xM';
  var STORAGE_KEY = 't3den_v4';
  var GUEST_KEY = 't3den_guest_mode';

  /* ---------- LOAD SUPABASE SDK ---------- */
  function loadSDK(cb){
    if (window.supabase && window.supabase.createClient) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = cb;
    s.onerror = function(){ console.error('[3DEN] Supabase SDK failed to load'); };
    document.head.appendChild(s);
  }

  /* ---------- STYLES ---------- */
  var css = ''
    + '.t3-auth-overlay{position:fixed;inset:0;background:rgba(10,14,26,.92);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;animation:t3aFade .25s ease}'
    + '.t3-auth-modal{background:linear-gradient(135deg,#161a2e 0%,#0a0e1a 100%);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:36px;width:min(92vw,420px);box-shadow:0 25px 50px -12px rgba(239,68,68,.25);animation:t3aPop .3s cubic-bezier(.34,1.56,.64,1)}'
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
    + '.t3-auth-badge{position:fixed;top:14px;right:14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 14px;display:flex;align-items:center;gap:10px;z-index:9000;font-size:13px;color:#e2e8f0}'
    + '.t3-auth-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e}'
    + '.t3-auth-badge .dot.guest{background:#94a3b8}'
    + '.t3-auth-badge button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:color .15s}'
    + '.t3-auth-badge button:hover{color:#ef4444}'
    + '@keyframes t3aFade{from{opacity:0}to{opacity:1}}'
    + '@keyframes t3aPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}';

  function injectCSS(){
    var st = document.createElement('style');
    st.id = 't3-auth-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- STATE ---------- */
  var sb = null;
  var session = null;
  var mode = 'signin';

  /* ---------- UI ---------- */
  function buildModal(){
    var html = ''
      + '<div class="t3-auth-modal">'
      + '  <div class="t3-auth-logo"><h1>3<span>DEN</span></h1><p>Speedcubing timer</p></div>'
      + '  <div class="t3-auth-tabs">'
      + '    <button class="t3-auth-tab active" data-mode="signin">Sign in</button>'
      + '    <button class="t3-auth-tab" data-mode="signup">Sign up</button>'
      + '  </div>'
      + '  <div class="t3-auth-msg" id="t3am"></div>'
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

    tabs.forEach(function(t){
      t.onclick = function(){
        tabs.forEach(function(x){ x.classList.remove('active'); });
        t.classList.add('active');
        mode = t.getAttribute('data-mode');
        btn.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
        passIn.setAttribute('autocomplete', mode === 'signin' ? 'current-password' : 'new-password');
        msg('');
      };
    });

    btn.onclick = function(){ doAuth(emailIn.value.trim(), passIn.value); };
    guest.onclick = function(){
      localStorage.setItem(GUEST_KEY, '1');
      closeModal();
      buildBadge(null);
    };

    [emailIn, passIn].forEach(function(i){
      i.addEventListener('keydown', function(e){
        if (e.key === 'Enter') btn.click();
      });
    });

    setTimeout(function(){ emailIn.focus(); }, 100);
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

  function buildBadge(user){
    var old = document.getElementById('t3-auth-badge');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 't3-auth-badge';
    div.id = 't3-auth-badge';
    if (user){
      div.innerHTML = '<span class="dot"></span><span>'+escapeHTML(user.email)+'</span><button id="t3blo">logout</button>';
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

  /* ---------- AUTH ---------- */
  function doAuth(email, password){
    if (!email || !password){ msg('Email and password required', 'error'); return; }
    if (password.length < 6){ msg('Password must be at least 6 characters', 'error'); return; }
    var btn = document.getElementById('t3ab');
    btn.disabled = true;
    btn.textContent = mode === 'signin' ? 'Signing in...' : 'Creating account...';

    var promise = mode === 'signin'
      ? sb.auth.signInWithPassword({email: email, password: password})
      : sb.auth.signUp({email: email, password: password});

    promise.then(function(res){
      if (res.error){
        var m = res.error.message || 'Error';
        if (m.indexOf('Invalid login') >= 0) m = 'Wrong email or password';
        if (m.indexOf('User already') >= 0) m = 'This email is already registered. Try Sign in.';
        msg(m, 'error');
        btn.disabled = false;
        btn.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
        return;
      }
      session = res.data.session;
      msg(mode === 'signup' ? 'Account created!' : 'Signed in!', 'success');
      setTimeout(function(){
        closeModal();
        buildBadge(session.user);
        syncOnLogin();
      }, 600);
    });
  }

  function doLogout(){
    if (!sb) return;
    sb.auth.signOut().then(function(){
      session = null;
      var b = document.getElementById('t3-auth-badge'); if (b) b.remove();
      // Show login modal again
      buildModal();
    });
  }

  /* ---------- SYNC ---------- */
  function syncOnLogin(){
    if (!session) return;
    var uid = session.user.id;

    // 1. Pull remote solves
    sb.from('solves').select('*').eq('user_id', uid).order('solve_date', {ascending: true}).then(function(r){
      if (r.error){ console.error('[3DEN] pull error', r.error); return; }
      var remote = r.data || [];

      // 2. Read local
      var local = readLocal();

      // 3. Merge: build a map (puzzle, solve_date, time_ms) -> solve
      var localByPuzzle = {};
      Object.keys(local.puzzle || {}).forEach(function(p){
        var sess = local.puzzle[p].sessions;
        if (!sess) return;
        Object.keys(sess).forEach(function(k){
          localByPuzzle[p] = localByPuzzle[p] || {};
          localByPuzzle[p][k] = sess[k] || [];
        });
      });

      // 4. Find local solves not yet in remote → upload
      var toUpload = [];
      Object.keys(localByPuzzle).forEach(function(puzzle){
        Object.keys(localByPuzzle[puzzle]).forEach(function(sk){
          var arr = localByPuzzle[puzzle][sk];
          arr.forEach(function(s){
            if (!s || !s.d) return;
            var key = puzzle + '|' + s.d + '|' + s.t;
            var found = remote.some(function(r){
              return r.puzzle === puzzle && r.solve_date == s.d && r.time_ms == s.t;
            });
            if (!found){
              toUpload.push({
                user_id: uid,
                puzzle: puzzle,
                time_ms: s.t,
                scramble: s.s || '',
                penalty: s.pen || 0,
                solve_date: s.d
              });
            }
          });
        });
      });

      if (toUpload.length){
        console.log('[3DEN] migrating', toUpload.length, 'solves to cloud');
        sb.from('solves').insert(toUpload).then(function(ri){
          if (ri.error) console.error('[3DEN] upload error', ri.error);
          else console.log('[3DEN] migrated successfully');
        });
      }

      // 5. Merge remote into local
      mergeRemoteIntoLocal(remote);
    });

    // 6. Hook localStorage saves
    hookSave();
  }

  function readLocal(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function writeLocal(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function mergeRemoteIntoLocal(remote){
    var local = readLocal();
    if (!local.puzzle) local.puzzle = {};
    var changed = false;

    remote.forEach(function(r){
      if (!local.puzzle[r.puzzle]) local.puzzle[r.puzzle] = {sessions: {}, pr: {}};
      if (!local.puzzle[r.puzzle].sessions) local.puzzle[r.puzzle].sessions = {};
      var sk = r.puzzle; // single session per puzzle
      if (!local.puzzle[r.puzzle].sessions[sk]) local.puzzle[r.puzzle].sessions[sk] = [];
      var arr = local.puzzle[r.puzzle].sessions[sk];
      var found = arr.some(function(s){ return s.d == r.solve_date && s.t == r.time_ms; });
      if (!found){
        arr.push({t: r.time_ms, s: r.scramble, d: r.solve_date, pen: r.penalty || 0});
        changed = true;
      }
    });

    if (changed){
      // Sort each session by date
      Object.keys(local.puzzle).forEach(function(p){
        var sess = local.puzzle[p].sessions || {};
        Object.keys(sess).forEach(function(sk){
          sess[sk].sort(function(a,b){ return (a.d||0) - (b.d||0); });
        });
      });
      writeLocal(local);
      // Trigger re-render if timer exposes one
      if (window.__t3denRender) try { window.__t3denRender(); } catch(e){}
    }
  }

  /* ---------- HOOK SAVES ---------- */
  function hookSave(){
    if (window.__t3denSaveHooked) return;
    window.__t3denSaveHooked = true;
    var origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(key, val){
      origSet(key, val);
      if (key === STORAGE_KEY && session){
        // Find new solves and push
        try {
          var data = JSON.parse(val || '{}');
          if (window.__t3denLastPushed === val) return;
          var prev = JSON.parse(window.__t3denLastPushed || '{}');
          window.__t3denLastPushed = val;
          var newSolves = diffSolves(prev, data);
          if (newSolves.length){
            var rows = newSolves.map(function(x){
              return {
                user_id: session.user.id,
                puzzle: x.puzzle,
                time_ms: x.solve.t,
                scramble: x.solve.s || '',
                penalty: x.solve.pen || 0,
                solve_date: x.solve.d
              };
            });
            sb.from('solves').insert(rows).then(function(r){
              if (r.error) console.error('[3DEN] push error', r.error);
            });
          }
          // Detect updates (penalty change) and deletions
          syncUpdatesAndDeletes(prev, data);
        } catch(e){ console.error('[3DEN] hook parse', e); }
      }
    };
    // Initial baseline
    window.__t3denLastPushed = localStorage.getItem(STORAGE_KEY) || '{}';
  }

  function diffSolves(prev, curr){
    var out = [];
    var cp = (curr && curr.puzzle) || {};
    Object.keys(cp).forEach(function(p){
      var sess = cp[p].sessions || {};
      Object.keys(sess).forEach(function(sk){
        var arr = sess[sk] || [];
        var prevArr = ((prev.puzzle||{})[p]||{}).sessions || {};
        prevArr = prevArr[sk] || [];
        arr.forEach(function(s){
          if (!s || !s.d) return;
          var found = prevArr.some(function(x){ return x && x.d == s.d && x.t == s.t; });
          if (!found) out.push({puzzle: p, solve: s});
        });
      });
    });
    return out;
  }

  function syncUpdatesAndDeletes(prev, curr){
    if (!session) return;
    var uid = session.user.id;
    var cp = (curr && curr.puzzle) || {};
    var pp = (prev && prev.puzzle) || {};

    // Detect penalty changes
    Object.keys(cp).forEach(function(p){
      var sess = cp[p].sessions || {};
      Object.keys(sess).forEach(function(sk){
        var arr = sess[sk] || [];
        var prevArr = ((pp[p]||{}).sessions||{})[sk] || [];
        arr.forEach(function(s){
          var match = prevArr.find(function(x){ return x && x.d == s.d && x.t == s.t; });
          if (match && (match.pen||0) !== (s.pen||0)){
            sb.from('solves').update({penalty: s.pen||0}).match({user_id: uid, puzzle: p, solve_date: s.d, time_ms: s.t}).then(function(){});
          }
        });
        // Detect deletions
        prevArr.forEach(function(s){
          if (!s || !s.d) return;
          var stillThere = arr.some(function(x){ return x && x.d == s.d && x.t == s.t; });
          if (!stillThere){
            sb.from('solves').delete().match({user_id: uid, puzzle: p, solve_date: s.d, time_ms: s.t}).then(function(){});
          }
        });
      });
    });
  }

  /* ---------- INIT ---------- */
  function init(){
    injectCSS();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {persistSession: true, autoRefreshToken: true}
    });
    sb.auth.getSession().then(function(r){
      session = r.data.session;
      if (session){
        buildBadge(session.user);
        syncOnLogin();
      } else if (localStorage.getItem(GUEST_KEY)){
        buildBadge(null);
      } else {
        buildModal();
      }
    });
    sb.auth.onAuthStateChange(function(event, s){
      session = s;
    });
  }

  function whenReady(cb){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      // Wait for timer DOM (id="t3-time")
      var tries = 0;
      (function check(){
        if (document.getElementById('t3-time') || tries > 50) cb();
        else { tries++; setTimeout(check, 100); }
      })();
    }
  }

  whenReady(function(){
    loadSDK(init);
  });
})();
