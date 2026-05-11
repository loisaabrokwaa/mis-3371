/* ============================================================
   hw4.js  —  Houston Clinic | Patient Registration v4
   Author : Lois Abrokwaa
   Version: 4.0

   New in v4:
     - Fetch API: loads states.html and conditions.html
     - Cookies: remembers first name for 48 hours
     - localStorage: saves/restores all non-secure fields
     - Fixed header/footer (CSS-driven, JS sets spacer height)
     - "Remember Me" checkbox controls save/clear behavior
     - "Not me?" checkbox expires cookie + clears storage
   ============================================================ */

'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */
var COOKIE_NAME    = 'hc_firstname';
var STORAGE_PREFIX = 'hc_';
var COOKIE_HOURS   = 48;

/* Fields saved to localStorage (excludes ssn, pword, pword2) */
var SAVED_FIELDS = [
    'fname','mini','lname','dob','email','phone',
    'addr1','addr2','city','state','zip',
    'uid','painlevel','notes','pgender','vaccinated'
];

/* ============================================================
   PAGE INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    setTodayDate();
    setDOBLimits();
    updateSlider(document.getElementById('painlevel').value);
    adjustHeaderSpacer();

    // Load remote content via Fetch
    fetchStates();
    fetchConditions();

    // Cookie check — welcome message + pre-fill
    initCookieWelcome();
});

window.addEventListener('resize', adjustHeaderSpacer);

/* Keep the body spacer in sync with the actual header height */
function adjustHeaderSpacer() {
    var hdr = document.getElementById('site-header');
    var spc = document.getElementById('header-spacer');
    if (hdr && spc) spc.style.height = hdr.offsetHeight + 'px';
}

/* ============================================================
   DATE UTILITIES
   ============================================================ */
function setTodayDate() {
    var el = document.getElementById('today');
    if (!el) return;
    var d = new Date();
    el.textContent =
        pad(d.getMonth()+1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
}

function setDOBLimits() {
    var dob = document.getElementById('dob');
    if (!dob) return;
    var today  = new Date();
    var min120 = new Date();
    min120.setFullYear(today.getFullYear() - 120);
    dob.setAttribute('max', toISO(today));
    dob.setAttribute('min', toISO(min120));
}

function toISO(d) {
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
}

function pad(n) { return String(n).padStart(2,'0'); }

/* ============================================================
   FETCH API — load states dropdown from external file
   ============================================================ */
function fetchStates() {
    var sel = document.getElementById('state');
    fetch('states.html')
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        })
        .then(function(html) {
            sel.innerHTML = html;
            // Restore saved state value after options are loaded
            var saved = localStorage.getItem(STORAGE_PREFIX + 'state');
            if (saved) sel.value = saved;
        })
        .catch(function(err) {
            console.error('fetchStates failed:', err);
            sel.innerHTML = '<option value="">Could not load states</option>';
        });
}

/* ============================================================
   FETCH API — load medical conditions checkboxes from external file
   ============================================================ */
function fetchConditions() {
    var cell = document.getElementById('conditions-cell');
    fetch('conditions.html')
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        })
        .then(function(html) {
            cell.innerHTML = html;
            cell.className = 'checkbox-cell';
            // Restore saved checkbox selections
            var saved = localStorage.getItem(STORAGE_PREFIX + 'history');
            if (saved) {
                var vals = JSON.parse(saved);
                cell.querySelectorAll('input[name="history"]').forEach(function(chk) {
                    chk.checked = vals.indexOf(chk.value) !== -1;
                    chk.addEventListener('change', function() { saveCheckboxes(); });
                });
            } else {
                cell.querySelectorAll('input[name="history"]').forEach(function(chk) {
                    chk.addEventListener('change', function() { saveCheckboxes(); });
                });
            }
        })
        .catch(function(err) {
            console.error('fetchConditions failed:', err);
            cell.innerHTML = '<span class="errmsg">Could not load conditions list.</span>';
        });
}

/* ============================================================
   COOKIE UTILITIES
   ============================================================ */

/* Set a cookie with expiry in hours */
function setCookie(name, value, hours) {
    var exp = new Date();
    exp.setTime(exp.getTime() + hours * 3600000);
    document.cookie = name + '=' + encodeURIComponent(value) +
                      '; expires=' + exp.toUTCString() + '; path=/; SameSite=Lax';
}

/* Read a cookie value — returns null if not found */
function getCookie(name) {
    var prefix = name + '=';
    var parts  = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
        var c = parts[i].trim();
        if (c.indexOf(prefix) === 0) {
            return decodeURIComponent(c.substring(prefix.length));
        }
    }
    return null;
}

/* Expire / delete a cookie */
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/* ============================================================
   COOKIE WELCOME — runs on page load
   ============================================================ */
function initCookieWelcome() {
    var storedName = getCookie(COOKIE_NAME);
    var welcomeEl  = document.getElementById('welcomeMsg');
    var notMeWrap  = document.getElementById('notMeWrap');
    var notMeLbl   = document.getElementById('notMeLabel');

    if (storedName && storedName.trim() !== '') {
        // Returning user
        welcomeEl.textContent = 'Welcome back, ' + storedName + '!';
        notMeLbl.textContent  = 'Not ' + storedName + '? Click to start as a new user.';
        notMeWrap.style.display = 'block';

        // Pre-fill fname from cookie
        var fnameField = document.getElementById('fname');
        if (fnameField && !fnameField.value) {
            fnameField.value = storedName;
            markGood('fname', 'fname-err');
        }

        // Restore all localStorage fields
        restoreLocalStorage();
        updateFooterStatus('Data restored from last visit.');

    } else {
        // New / first-time visitor
        welcomeEl.textContent   = 'Welcome, New Patient!';
        notMeWrap.style.display = 'none';
    }
}

/* ============================================================
   "Not Me" checkbox handler
   ============================================================ */
function handleNotMe(chk) {
    if (chk.checked) {
        // User confirmed they are NOT the returning person
        deleteCookie(COOKIE_NAME);
        clearLocalStorage();
        document.getElementById('regForm').reset();
        clearAllErrors();
        document.getElementById('submitBtn').style.display = 'none';
        document.getElementById('reviewPanel').style.display = 'none';
        document.getElementById('welcomeMsg').textContent = 'Welcome, New Patient!';
        document.getElementById('notMeWrap').style.display = 'none';
        updateSlider(5);
        updateFooterStatus('Session cleared. Starting fresh.');
    }
}

/* ============================================================
   LOCAL STORAGE — save / restore / clear
   ============================================================ */

/* Save a single text/select/radio field */
function saveField(fieldId) {
    if (!shouldRemember()) { return; }

    if (fieldId === 'pgender') {
        var gval = '';
        var gr   = document.querySelector('input[name="pgender"]:checked');
        if (gr) gval = gr.value;
        localStorage.setItem(STORAGE_PREFIX + 'pgender', gval);
        return;
    }
    if (fieldId === 'vaccinated') {
        var vval = '';
        var vr   = document.querySelector('input[name="vaccinated"]:checked');
        if (vr) vval = vr.value;
        localStorage.setItem(STORAGE_PREFIX + 'vaccinated', vval);
        return;
    }

    var el = document.getElementById(fieldId);
    if (el) {
        localStorage.setItem(STORAGE_PREFIX + fieldId, el.value);
        updateFooterStatus('Progress saved.');
    }
}

/* Save medical history checkboxes */
function saveCheckboxes() {
    if (!shouldRemember()) return;
    var checked = Array.from(
        document.querySelectorAll('input[name="history"]:checked')
    ).map(function(c){ return c.value; });
    localStorage.setItem(STORAGE_PREFIX + 'history', JSON.stringify(checked));
}

/* Restore all saved fields from localStorage */
function restoreLocalStorage() {
    SAVED_FIELDS.forEach(function(id) {
        var val = localStorage.getItem(STORAGE_PREFIX + id);
        if (val === null) return;

        if (id === 'pgender') {
            var gr = document.querySelector('input[name="pgender"][value="'+val+'"]');
            if (gr) gr.checked = true;
            return;
        }
        if (id === 'vaccinated') {
            var vr = document.querySelector('input[name="vaccinated"][value="'+val+'"]');
            if (vr) vr.checked = true;
            return;
        }

        var el = document.getElementById(id);
        if (el) {
            el.value = val;
            // state is handled after fetch resolves; slider needs display update
            if (id === 'painlevel') updateSlider(val);
        }
    });
    // history checkboxes are restored inside fetchConditions after DOM is ready
}

/* Remove all hc_ keys from localStorage */
function clearLocalStorage() {
    Object.keys(localStorage).forEach(function(key) {
        if (key.indexOf(STORAGE_PREFIX) === 0) localStorage.removeItem(key);
    });
}

/* Is the "Remember Me" checkbox checked? */
function shouldRemember() {
    var rm = document.getElementById('rememberMe');
    return rm ? rm.checked : true;
}

/* Update footer storage status message */
function updateFooterStatus(msg) {
    var el = document.getElementById('footer-storage-status');
    if (el) el.textContent = msg;
}

/* ============================================================
   SLIDER
   ============================================================ */
function updateSlider(val) {
    var labels = {
        '1':'1 – No Pain','2':'2 – Minimal','3':'3 – Mild',
        '4':'4 – Moderate-Mild','5':'5 – Moderate',
        '6':'6 – Moderate-Severe','7':'7 – Severe',
        '8':'8 – Very Severe','9':'9 – Critical','10':'10 – Unbearable'
    };
    var badge = document.getElementById('slider-display');
    if (badge) badge.textContent = labels[String(val)] || val;
}

/* ============================================================
   HELPER UTILITIES
   ============================================================ */
function showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = '⚠ ' + msg;
}
function clrErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
}
function markBad(fId, eId, msg) {
    var f = document.getElementById(fId);
    if (f) { f.classList.add('f-error'); f.classList.remove('f-ok'); }
    showErr(eId, msg);
}
function markGood(fId, eId) {
    var f = document.getElementById(fId);
    if (f) { f.classList.remove('f-error'); f.classList.add('f-ok'); }
    clrErr(eId);
}
function markNeutral(fId, eId) {
    var f = document.getElementById(fId);
    if (f) { f.classList.remove('f-error','f-ok'); }
    clrErr(eId);
}

/* ============================================================
   BLOCK 1 — Personal Info
   ============================================================ */
function validateFname() {
    var val = document.getElementById('fname').value.trim();
    if (!val) { markBad('fname','fname-err','First name is required.'); return false; }
    if (!/^[a-zA-Z'\-]{1,30}$/.test(val)) {
        markBad('fname','fname-err','Letters, apostrophes, dashes only (1–30 chars).');
        return false;
    }
    markGood('fname','fname-err');

    // Save cookie on every keystroke if rememberMe is checked
    if (shouldRemember()) setCookie(COOKIE_NAME, val, COOKIE_HOURS);

    return true;
}

function validateMini() {
    var val = document.getElementById('mini').value.trim();
    if (val === '') { markGood('mini','mini-err'); return true; }
    if (!/^[a-zA-Z]$/.test(val)) { markBad('mini','mini-err','One letter only.'); return false; }
    markGood('mini','mini-err');
    return true;
}

function validateLname() {
    var val = document.getElementById('lname').value.trim();
    if (!val) { markBad('lname','lname-err','Last name is required.'); return false; }
    if (!/^[a-zA-Z'\-]{1,30}$/.test(val)) {
        markBad('lname','lname-err','Letters, apostrophes, dashes only (1–30 chars).');
        return false;
    }
    markGood('lname','lname-err');
    return true;
}

function validateDob() {
    var val = document.getElementById('dob').value;
    if (!val) { markBad('dob','dob-err','Date of birth is required.'); return false; }
    var d   = new Date(val + 'T00:00:00');
    var now = new Date(); now.setHours(0,0,0,0);
    var min = new Date(); min.setFullYear(now.getFullYear()-120);
    if (d > now)  { markBad('dob','dob-err','Cannot be a future date.'); return false; }
    if (d < min)  { markBad('dob','dob-err','Cannot be more than 120 years ago.'); return false; }
    markGood('dob','dob-err');
    return true;
}

function formatSSN(field) {
    var digits = field.value.replace(/\D/g,'').substring(0,9);
    if (digits.length > 5)
        field.value = digits.slice(0,3)+'-'+digits.slice(3,5)+'-'+digits.slice(5);
    else if (digits.length > 3)
        field.value = digits.slice(0,3)+'-'+digits.slice(3);
    else
        field.value = digits;
    validateSSN();
}

function validateSSN() {
    var digits = document.getElementById('ssn').value.replace(/\D/g,'');
    if (!digits)          { markBad('ssn','ssn-err','Patient ID is required.'); return false; }
    if (digits.length!==9){ markBad('ssn','ssn-err','Must be exactly 9 digits.'); return false; }
    markGood('ssn','ssn-err');
    return true;
}

/* ============================================================
   BLOCK 2 — Contact
   ============================================================ */
function forceEmailLower() {
    var f = document.getElementById('email');
    if (f) f.value = f.value.toLowerCase();
}

function validateEmail() {
    forceEmailLower();
    var val = document.getElementById('email').value.trim();
    var re  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/;
    if (!val)        { markBad('email','email-err','Email is required.'); return false; }
    if (!re.test(val)){ markBad('email','email-err','Format: name@domain.tld'); return false; }
    markGood('email','email-err');
    return true;
}

function validatePhone() {
    var val = document.getElementById('phone').value.trim();
    if (!val)                          { markBad('phone','phone-err','Phone is required.'); return false; }
    if (!/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(val))
        { markBad('phone','phone-err','Format: 000-000-0000'); return false; }
    markGood('phone','phone-err');
    return true;
}

/* ============================================================
   BLOCK 3 — Address
   ============================================================ */
function validateAddr1() {
    var val = document.getElementById('addr1').value.trim();
    if (!val||val.length<2){ markBad('addr1','addr1-err','Required. At least 2 characters.'); return false; }
    markGood('addr1','addr1-err'); return true;
}
function validateAddr2() {
    var val = document.getElementById('addr2').value.trim();
    if (val===''){ markGood('addr2','addr2-err'); return true; }
    if (val.length<2){ markBad('addr2','addr2-err','If entered, at least 2 characters.'); return false; }
    markGood('addr2','addr2-err'); return true;
}
function validateCity() {
    var val = document.getElementById('city').value.trim();
    if (!val||val.length<2){ markBad('city','city-err','City required (2–30 chars).'); return false; }
    markGood('city','city-err'); return true;
}
function validateState() {
    var val = document.getElementById('state').value;
    if (!val){ markBad('state','state-err','Please select a state.'); return false; }
    markGood('state','state-err'); return true;
}
function validateZip() {
    var val = document.getElementById('zip').value.trim();
    if (!val)             { markBad('zip','zip-err','Zip code required.'); return false; }
    if (!/^\d{5}$/.test(val)){ markBad('zip','zip-err','5 digits only (e.g. 77002).'); return false; }
    markGood('zip','zip-err'); return true;
}

/* ============================================================
   BLOCK 5 — Account Setup
   ============================================================ */
function forceUIDLower() {
    var f = document.getElementById('uid');
    if (f) f.value = f.value.toLowerCase();
}

function validateUID() {
    forceUIDLower();
    var val = document.getElementById('uid').value.trim();
    if (!val||val.length<5)       { markBad('uid','uid-err','5–20 characters required.'); return false; }
    if (val.length>20)            { markBad('uid','uid-err','No more than 20 characters.'); return false; }
    if (/^\d/.test(val))          { markBad('uid','uid-err','Cannot start with a number.'); return false; }
    if (/[^a-zA-Z0-9_\-]/.test(val)){ markBad('uid','uid-err','Letters, numbers, _ or - only. No spaces.'); return false; }
    markGood('uid','uid-err'); return true;
}

function setHint(id, pass, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = (pass?'✔ ':'✘ ') + text;
    el.className   = pass ? 'h-ok' : 'h-fail';
}

function validatePword() {
    var val   = document.getElementById('pword').value;
    var uid   = document.getElementById('uid').value.trim().toLowerCase();
    var lenOk  = val.length>=8 && val.length<=30;
    var upOk   = /[A-Z]/.test(val);
    var loOk   = /[a-z]/.test(val);
    var digOk  = /[0-9]/.test(val);
    var uidOk  = !(uid && val.toLowerCase()===uid);

    setHint('hint-len',  lenOk, '8–30 characters');
    setHint('hint-upper',upOk,  'At least 1 uppercase letter');
    setHint('hint-lower',loOk,  'At least 1 lowercase letter');
    setHint('hint-digit',digOk, 'At least 1 digit');
    setHint('hint-uid',  uidOk, 'Cannot equal your User ID');

    if (!val){ markBad('pword','pword-err','Password is required.'); return false; }
    if (!lenOk||!upOk||!loOk||!digOk||!uidOk){
        markBad('pword','pword-err','Password does not meet all requirements.');
        return false;
    }
    markGood('pword','pword-err');
    if (document.getElementById('pword2').value) confirmPword();
    return true;
}

function confirmPword() {
    var p1 = document.getElementById('pword').value;
    var p2 = document.getElementById('pword2').value;
    if (!p2){ markNeutral('pword2','pword2-err'); return false; }
    if (p1!==p2){ markBad('pword2','pword2-err','Passwords do not match.'); return false; }
    markGood('pword2','pword2-err'); return true;
}

/* ============================================================
   VALIDATE ALL — gate the Submit button
   ============================================================ */
function validateAll() {
    var ok = [
        validateFname(), validateMini(), validateLname(),
        validateDob(),   validateSSN(),
        validateEmail(), validatePhone(),
        validateAddr1(), validateAddr2(), validateCity(),
        validateState(), validateZip(),
        validateUID(),   validatePword(), confirmPword()
    ].every(function(r){ return r===true; });

    var submitBtn = document.getElementById('submitBtn');
    if (ok) {
        submitBtn.style.display = 'inline-block';
        reviewInput();
        document.getElementById('review-title').textContent = '✔ All Fields Valid — Ready to Submit!';
        document.getElementById('review-note').textContent  =
            'All fields passed. Click Submit to complete registration.';
        document.getElementById('reviewPanel').style.display = 'block';

        // Save cookie with the first name now
        if (shouldRemember()) {
            var fn = document.getElementById('fname').value.trim();
            if (fn) setCookie(COOKIE_NAME, fn, COOKIE_HOURS);
        }
    } else {
        submitBtn.style.display = 'none';
        reviewInput();
        document.getElementById('review-title').textContent = '⚠ Please Fix the Errors Below';
        var firstBad = document.querySelector('.f-error');
        if (firstBad) firstBad.scrollIntoView({ behavior:'smooth', block:'center' });
    }
}

/* ============================================================
   HANDLE SUBMIT — check Remember Me before navigating
   ============================================================ */
function handleSubmit() {
    if (!shouldRemember()) {
        // User unchecked Remember Me — expire cookie + clear storage
        deleteCookie(COOKIE_NAME);
        clearLocalStorage();
    }
    // form will naturally submit to thankyou.html
}

/* ============================================================
   REVIEW PANEL
   ============================================================ */
function reviewInput() {
    var panel = document.getElementById('reviewPanel');
    panel.style.display = 'block';

    var tbl = document.getElementById('reviewTable');
    tbl.innerHTML = '';

    function row(label, value, pass, note) {
        var tr = document.createElement('tr');
        ['','',''].forEach(function(_,i){
            var td = document.createElement('td');
            if(i===0) td.textContent = label;
            else if(i===1) td.textContent = value||'(blank)';
            else td.innerHTML = pass
                ? '<span class="s-pass">PASS</span>'
                : '<span class="s-error">ERR: '+(note||'invalid')+'</span>';
            tr.appendChild(td);
        });
        tbl.appendChild(tr);
    }

    var fname  = document.getElementById('fname').value.trim();
    var mini   = document.getElementById('mini').value.trim();
    var lname  = document.getElementById('lname').value.trim();
    var dob    = document.getElementById('dob').value;
    var ssnD   = document.getElementById('ssn').value.replace(/\D/g,'');
    var email  = document.getElementById('email').value.trim();
    var phone  = document.getElementById('phone').value.trim();
    var addr1  = document.getElementById('addr1').value.trim();
    var addr2  = document.getElementById('addr2').value.trim();
    var city   = document.getElementById('city').value.trim();
    var state  = document.getElementById('state').value;
    var zip    = document.getElementById('zip').value.trim();
    var uid    = document.getElementById('uid').value.trim();
    var pword  = document.getElementById('pword').value;
    var pword2 = document.getElementById('pword2').value;
    var pain   = document.getElementById('painlevel').value;
    var notes  = document.getElementById('notes').value.trim();
    var gender = document.querySelector('input[name="pgender"]:checked');
    var vax    = document.querySelector('input[name="vaccinated"]:checked');
    var checks = Array.from(document.querySelectorAll('input[name="history"]:checked')).map(function(c){return c.value;});

    row('Full Name', fname+(mini?' '+mini+'.':'')+' '+lname,
        /^[a-zA-Z'\-]{1,30}$/.test(fname)&&/^[a-zA-Z'\-]{1,30}$/.test(lname),
        'Check first/last name');

    var dobOk=false, dobNote='Required';
    if(dob){
        var dd=new Date(dob+'T00:00:00'), now=new Date(); now.setHours(0,0,0,0);
        var min=new Date(); min.setFullYear(now.getFullYear()-120);
        if(dd>now) dobNote='Future date';
        else if(dd<min) dobNote='>120 years ago';
        else dobOk=true;
    }
    row('Date of Birth', dob, dobOk, dobNote);
    row('Patient ID', ssnD.length===9?'***-**-'+ssnD.slice(-4):'(invalid)', ssnD.length===9, '9 digits required');
    row('Gender', gender?gender.value:'(not selected)', true, '');
    row('Email', email, /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/.test(email), 'name@domain.tld');
    row('Phone', phone, /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(phone), '000-000-0000');

    var addrOk = addr1.length>=2&&city.length>=2&&!!state&&/^\d{5}$/.test(zip);
    row('Address', addr1+(addr2?', '+addr2:'')+', '+city+', '+state+' '+zip, addrOk,
        !addr1||addr1.length<2?'Addr Line 1 missing':!city?'City missing':!state?'State missing':'Zip invalid');

    row('Medical History', checks.length?checks.join(', '):'None', true,'');
    row('Vaccinated?', vax?vax.value:'(not answered)', true,'');

    var painLbls=['','No Pain','Minimal','Mild','Moderate-Mild','Moderate','Moderate-Severe','Severe','Very Severe','Critical','Unbearable'];
    row('Pain Level', pain+' – '+(painLbls[parseInt(pain)]||''), true,'');
    row('Notes', notes||'(none)', true,'');

    var uidOk = uid.length>=5&&uid.length<=20&&!/^\d/.test(uid)&&!/[^a-zA-Z0-9_\-]/.test(uid);
    row('User ID', uid, uidOk, '5–20 chars, start with letter');

    var pOk = pword.length>=8&&pword.length<=30&&/[A-Z]/.test(pword)&&/[a-z]/.test(pword)&&/[0-9]/.test(pword)&&pword.toLowerCase()!==uid.toLowerCase();
    row('Password', pOk?'(meets requirements)':'(see hints)', pOk, 'Does not meet requirements');
    row('Passwords Match', pword===pword2&&pword!==''?'Yes':'No', pword===pword2&&pword!=='', 'Passwords do not match');

    document.getElementById('review-note').textContent =
        'Fields marked ERR must be corrected before you can submit.';
}

/* ============================================================
   CLEAR ALL — Start Over button
   ============================================================ */
function clearAll() {
    clearAllErrors();
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('reviewPanel').style.display = 'none';
    updateSlider(5);

    if (!shouldRemember()) {
        deleteCookie(COOKIE_NAME);
        clearLocalStorage();
        document.getElementById('welcomeMsg').textContent = 'Welcome, New Patient!';
        document.getElementById('notMeWrap').style.display = 'none';
        updateFooterStatus('Data cleared.');
    } else {
        updateFooterStatus('Form reset. Saved data retained.');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.errmsg').forEach(function(e){ e.textContent=''; });
    document.querySelectorAll('.f-error,.f-ok').forEach(function(f){
        f.classList.remove('f-error','f-ok');
    });
    ['hint-len','hint-upper','hint-lower','hint-digit','hint-uid'].forEach(function(id){
        var el=document.getElementById(id);
        if(el){el.textContent='';el.className='h-idle';}
    });
}
