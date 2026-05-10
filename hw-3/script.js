/* ============================================================
   hw3.js  —  Houston Clinic | Patient Registration
   Author : Lois Abrokwaa
   Version: 3.0
   ============================================================ */
 
'use strict';
 
document.addEventListener('DOMContentLoaded', function () {
    setTodayDate();
    setDOBLimits();
    updateSlider(document.getElementById('painlevel').value);
});
 
function setTodayDate() {
    var el = document.getElementById('today');
    if (el) {
        var d = new Date();
        el.textContent = (d.getMonth()+1).toString().padStart(2,'0') + '/' +
                          d.getDate().toString().padStart(2,'0') + '/' +
                          d.getFullYear();
    }
}
 
function setDOBLimits() {
    var dob = document.getElementById('dob');
    if (!dob) return;
    var today  = new Date();
    var max    = toISODate(today);
    var minD   = new Date();
    minD.setFullYear(today.getFullYear() - 120);
    dob.setAttribute('max', max);
    dob.setAttribute('min', toISODate(minD));
}
 
function toISODate(d) {
    return d.getFullYear() + '-' +
           (d.getMonth()+1).toString().padStart(2,'0') + '-' +
           d.getDate().toString().padStart(2,'0');
}

function showErr(errId, msg) {
    var el = document.getElementById(errId);
    if (el) el.textContent = '⚠ ' + msg;
}
 
function clrErr(errId) {
    var el = document.getElementById(errId);
    if (el) el.textContent = '';
}
 
function markBad(fieldId, errId, msg) {
    var f = document.getElementById(fieldId);
    if (f) { f.classList.add('f-error'); f.classList.remove('f-ok'); }
    showErr(errId, msg);
}

function markGood(fieldId, errId) {
    var f = document.getElementById(fieldId);
    if (f) { f.classList.remove('f-error'); f.classList.add('f-ok'); }
    clrErr(errId);
}

function markNeutral(fieldId, errId) {
    var f = document.getElementById(fieldId);
    if (f) { f.classList.remove('f-error', 'f-ok'); }
    clrErr(errId);
}

function validateFname() {
    var val = document.getElementById('fname').value.trim();
    if (val === '') {
        markBad('fname', 'fname-err', 'First name is required.');
        return false;
    }
    if (!/^[a-zA-Z'\-]{1,30}$/.test(val)) {
        markBad('fname', 'fname-err', 'Letters, apostrophes, dashes only (1–30 chars).');
        return false;
    }
    markGood('fname', 'fname-err');
    return true;
}
 
function validateMini() {
    var val = document.getElementById('mini').value.trim();
    if (val === '') { markGood('mini', 'mini-err'); return true; }  // optional
    if (!/^[a-zA-Z]$/.test(val)) {
        markBad('mini', 'mini-err', 'One letter only, no numbers.');
        return false;
    }
    markGood('mini', 'mini-err');
    return true;
}
 
function validateLname() {
    var val = document.getElementById('lname').value.trim();
    if (val === '') {
        markBad('lname', 'lname-err', 'Last name is required.');
        return false;
    }
    if (!/^[a-zA-Z'\-]{1,30}$/.test(val)) {
        markBad('lname', 'lname-err', 'Letters, apostrophes, dashes only (1–30 chars).');
        return false;
    }
    markGood('lname', 'lname-err');
    return true;
}
 
function validateDob() {
    var val = document.getElementById('dob').value;
    if (!val) { markBad('dob', 'dob-err', 'Date of birth is required.'); return false; }
 
    var dob   = new Date(val + 'T00:00:00');
    var today = new Date(); today.setHours(0,0,0,0);
    var ago120 = new Date(); ago120.setFullYear(today.getFullYear() - 120);
 
    if (dob > today)   { markBad('dob', 'dob-err', 'Cannot be a future date.');        return false; }
    if (dob < ago120)  { markBad('dob', 'dob-err', 'Cannot be more than 120 years ago.'); return false; }
 
    markGood('dob', 'dob-err');
    return true;
}
function formatSSN(field) {
    // Strip all non-digits
    var digits = field.value.replace(/\D/g, '').substring(0, 9);
    var formatted = digits;
 
    if (digits.length > 5) {
        formatted = digits.substring(0,3) + '-' + digits.substring(3,5) + '-' + digits.substring(5,9);
    } else if (digits.length > 3) {
        formatted = digits.substring(0,3) + '-' + digits.substring(3,5);
    }
 
    field.value = formatted;
    validateSSN();
}
 
function validateSSN() {
    var val    = document.getElementById('ssn').value;
    var digits = val.replace(/\D/g, '');
    if (digits.length === 0) {
        markBad('ssn', 'ssn-err', 'Patient ID is required.');
        return false;
    }
    if (digits.length !== 9) {
        markBad('ssn', 'ssn-err', 'Must be exactly 9 digits.');
        return false;
    }
    markGood('ssn', 'ssn-err');
    return true;
}
 
function forceEmailLower() {
    var f = document.getElementById('email');
    if (f) f.value = f.value.toLowerCase();
}
 
function validateEmail() {
    forceEmailLower();
    var val = document.getElementById('email').value.trim();
    var re  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/;
    if (!val)        { markBad('email', 'email-err', 'Email is required.'); return false; }
    if (!re.test(val)) { markBad('email', 'email-err', 'Format: name@domain.tld'); return false; }
    markGood('email', 'email-err');
    return true;
}
 
function validatePhone() {
    var val = document.getElementById('phone').value.trim();
    var re  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    if (!val)          { markBad('phone', 'phone-err', 'Phone number is required.'); return false; }
    if (!re.test(val)) { markBad('phone', 'phone-err', 'Format required: 000-000-0000'); return false; }
    markGood('phone', 'phone-err');
    return true;
}
 
function validateAddr1() {
    var val = document.getElementById('addr1').value.trim();
    if (!val || val.length < 2) {
        markBad('addr1', 'addr1-err', 'Required. At least 2 characters.');
        return false;
    }
    markGood('addr1', 'addr1-err');
    return true;
}
 
function validateAddr2() {
    var val = document.getElementById('addr2').value.trim();
    if (val === '')              { markGood('addr2', 'addr2-err'); return true; }  // optional
    if (val.length < 2)         { markBad('addr2', 'addr2-err', 'If entered, must be at least 2 characters.'); return false; }
    markGood('addr2', 'addr2-err');
    return true;
}
 
function validateCity() {
    var val = document.getElementById('city').value.trim();
    if (!val || val.length < 2) {
        markBad('city', 'city-err', 'City is required (2–30 chars).');
        return false;
    }
    markGood('city', 'city-err');
    return true;
}
 
function validateState() {
    var val = document.getElementById('state').value;
    if (!val) { markBad('state', 'state-err', 'Please select a state.'); return false; }
    markGood('state', 'state-err');
    return true;
}
 
function validateZip() {
    var val = document.getElementById('zip').value.trim();
    if (!val)               { markBad('zip', 'zip-err', 'Zip code is required.'); return false; }
    if (!/^\d{5}$/.test(val)) { markBad('zip', 'zip-err', '5 digits only (e.g. 77002).'); return false; }
    markGood('zip', 'zip-err');
    return true;
}

 
function forceUIDLower() {
    var f = document.getElementById('uid');
    if (f) f.value = f.value.toLowerCase();
}
 
function validateUID() {
    forceUIDLower();
    var val = document.getElementById('uid').value.trim();
    if (!val || val.length < 5) {
        markBad('uid', 'uid-err', 'User ID must be 5–20 characters.');
        return false;
    }
    if (val.length > 20) {
        markBad('uid', 'uid-err', 'User ID must be no more than 20 characters.');
        return false;
    }
    if (/^\d/.test(val)) {
        markBad('uid', 'uid-err', 'Cannot start with a number.');
        return false;
    }
    if (/[^a-zA-Z0-9_\-]/.test(val)) {
        markBad('uid', 'uid-err', 'Letters, numbers, dash, underscore only. No spaces.');
        return false;
    }
    markGood('uid', 'uid-err');
    return true;
}

function setHint(id, pass, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = (pass ? '✔ ' : '✘ ') + text;
    el.className   = pass ? 'h-ok' : 'h-fail';
}
 
function validatePword() {
    var val = document.getElementById('pword').value;
    var uid = document.getElementById('uid').value.trim().toLowerCase();
 
    var lenOk    = val.length >= 8 && val.length <= 30;
    var upperOk  = /[A-Z]/.test(val);
    var lowerOk  = /[a-z]/.test(val);
    var digitOk  = /[0-9]/.test(val);
    var notUID   = !(uid && val.toLowerCase() === uid);
 
    setHint('hint-len',   lenOk,   '8–30 characters');
    setHint('hint-upper', upperOk, 'At least 1 uppercase letter');
    setHint('hint-lower', lowerOk, 'At least 1 lowercase letter');
    setHint('hint-digit', digitOk, 'At least 1 digit');
    setHint('hint-uid',   notUID,  'Cannot equal your User ID');
 
    var allOk = lenOk && upperOk && lowerOk && digitOk && notUID;
    if (!val) {
        markBad('pword', 'pword-err', 'Password is required.');
        return false;
    }
    if (!allOk) {
        markBad('pword', 'pword-err', 'Password does not meet all requirements.');
        return false;
    }
    markGood('pword', 'pword-err');
 
    // Re-check confirm in case it was already entered
    if (document.getElementById('pword2').value) confirmPword();
 
    return true;
}
 
function confirmPword() {
    var p1 = document.getElementById('pword').value;
    var p2 = document.getElementById('pword2').value;
    if (!p2) { markNeutral('pword2', 'pword2-err'); return false; }
    if (p1 !== p2) {
        markBad('pword2', 'pword2-err', 'Passwords do not match.');
        return false;
    }
    markGood('pword2', 'pword2-err');
    return true;
}
function updateSlider(val) {
    var labels = {
        '1':  '1 – No Pain',
        '2':  '2 – Minimal',
        '3':  '3 – Mild',
        '4':  '4 – Moderate-Mild',
        '5':  '5 – Moderate',
        '6':  '6 – Moderate-Severe',
        '7':  '7 – Severe',
        '8':  '8 – Very Severe',
        '9':  '9 – Critical',
        '10': '10 – Unbearable'
    };
    var badge = document.getElementById('slider-display');
    if (badge) badge.textContent = labels[String(val)] || val;
}
function reviewInput() {
    var panel = document.getElementById('reviewPanel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
 
    var tbl = document.getElementById('reviewTable');
    tbl.innerHTML = '';

    function addRow(label, value, pass, note) {
        var tr  = document.createElement('tr');
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        td1.textContent = label;
        td2.textContent = value || '(blank)';
        td3.innerHTML = pass
            ? '<span class="s-pass">PASS</span>'
            : '<span class="s-error">ERR: ' + (note || '?') + '</span>';
        tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
        tbl.appendChild(tr);
    }
 
    var fname  = document.getElementById('fname').value.trim();
    var mini   = document.getElementById('mini').value.trim();
    var lname  = document.getElementById('lname').value.trim();
    var dob    = document.getElementById('dob').value;
    var ssnRaw = document.getElementById('ssn').value.replace(/\D/g,'');
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
    var vax    = document.querySelector('input[name="vaccinated"]:checked');
    var gender = document.querySelector('input[name="pgender"]:checked');
    var checks = Array.from(document.querySelectorAll('input[name="history"]:checked')).map(function(c){return c.value;});
 
   
    var nameOk = /^[a-zA-Z'\-]{1,30}$/.test(fname) && /^[a-zA-Z'\-]{1,30}$/.test(lname);
    addRow('Full Name',
        fname + (mini ? ' '+mini+'.' : '') + ' ' + lname,
        nameOk, 'Check first / last name');
 
    var dobOk = false, dobNote = 'Required';
    if (dob) {
        var dobD = new Date(dob+'T00:00:00');
        var now  = new Date(); now.setHours(0,0,0,0);
        var ago120 = new Date(); ago120.setFullYear(now.getFullYear()-120);
        if (dobD > now)    dobNote = 'Future date';
        else if (dobD < ago120) dobNote = '>120 years ago';
        else { dobOk = true; }
    }
    addRow('Date of Birth', dob, dobOk, dobNote);
 
    var ssnOk = ssnRaw.length === 9;
    addRow('Patient ID', ssnOk ? '***-**-' + ssnRaw.slice(-4) : '(invalid)', ssnOk, '9 digits required');
 
    addRow('Gender', gender ? gender.value : '(not selected)', true, '');
 
    var emailOk = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/.test(email);
    addRow('Email', email, emailOk, 'Format: name@domain.tld');

    var phoneOk = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(phone);
    addRow('Phone', phone, phoneOk, 'Format: 000-000-0000');

    var addrOk = addr1.length >= 2 && city.length >= 2 && !!state && /^\d{5}$/.test(zip);
    var addrStr = addr1 + (addr2 ? ', '+addr2 : '') + ', ' + city + ', ' + state + ' ' + zip;
    var addrNote = !addr1 || addr1.length<2 ? 'Missing Addr Line 1'
                 : !city || city.length<2   ? 'Missing City'
                 : !state                    ? 'Missing State'
                 : !/^\d{5}$/.test(zip)      ? 'Invalid Zip'
                 : '';
    addRow('Address', addrStr, addrOk, addrNote);
 
    addRow('Medical History', checks.length ? checks.join(', ') : 'None', true, '');
 
    addRow('Vaccinated?', vax ? vax.value : '(not answered)', true, '');

    var painLabels = ['','No Pain','Minimal','Mild','Moderate-Mild','Moderate','Moderate-Severe','Severe','Very Severe','Critical','Unbearable'];
    addRow('Pain Level', pain + ' – ' + (painLabels[parseInt(pain)] || ''), true, '');

    addRow('Notes', notes || '(none)', true, '');
 
    var uidOk = uid.length >= 5 && uid.length <= 20 && !(/^\d/.test(uid)) && !/[^a-zA-Z0-9_\-]/.test(uid);
    addRow('User ID', uid, uidOk, '5–20 chars, start with letter, no spaces/specials');
 
    var pOk = pword.length >= 8 && pword.length <= 30 && /[A-Z]/.test(pword) && /[a-z]/.test(pword) && /[0-9]/.test(pword) && pword.toLowerCase() !== uid.toLowerCase();
    addRow('Password', pOk ? '(meets requirements)' : '(see hints)', pOk, 'Does not meet requirements');

    var p2Ok = pword === pword2 && pword !== '';
    addRow('Passwords Match', p2Ok ? 'Yes' : 'No', p2Ok, 'Passwords do not match');

    document.getElementById('review-note').textContent =
        'Fields marked ERR must be corrected before you can submit.';
}

function validateAll() {
    var results = [
        validateFname(),
        validateMini(),
        validateLname(),
        validateDob(),
        validateSSN(),
        validateEmail(),
        validatePhone(),
        validateAddr1(),
        validateAddr2(),
        validateCity(),
        validateState(),
        validateZip(),
        validateUID(),
        validatePword(),
        confirmPword()
    ];
 
    var allGood = results.every(function(r){ return r === true; });
    var submitBtn = document.getElementById('submitBtn');
 
    if (allGood) {
        submitBtn.style.display = 'inline-block';
        // Show success state in review panel
        reviewInput();
        document.getElementById('review-title').textContent = '✔ All Fields Valid — Ready to Submit!';
        document.getElementById('review-note').textContent  =
            'All fields passed. Click Submit to complete your registration.';
        document.getElementById('reviewPanel').style.display = 'block';
    } else {
        submitBtn.style.display = 'none';
        reviewInput();
        document.getElementById('review-title').textContent = '⚠ Please Fix the Errors Below';
        // Scroll to first error field
        var firstBad = document.querySelector('.f-error');
        if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function clearAll() {
    document.querySelectorAll('.errmsg').forEach(function(e){ e.textContent = ''; });
    document.querySelectorAll('.f-error, .f-ok').forEach(function(f){
        f.classList.remove('f-error', 'f-ok');
    });
    ['hint-len','hint-upper','hint-lower','hint-digit','hint-uid'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.textContent = ''; el.className = 'h-idle'; }
    });
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('reviewPanel').style.display = 'none';
    updateSlider(5);
}
