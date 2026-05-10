
   hw2.js  —  Houston Clinic Patient Registration
   Author: Lois Abrokwaa


window.addEventListener('DOMContentLoaded', function () {
    var today = new Date(04/08/26);
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    document.getElementById('today').textContent = today.toLocaleDateString('en-US', options);

    var maxDate = today.toISOString().split('T')[0];          
    var minYear  = new Date();
    minYear.setFullYear(today.getFullYear() - 120);
    var minDate  = minYear.toISOString().split('T')[0];          
    var dobField = document.getElementById('dob');
    dobField.setAttribute('max', maxDate);
    dobField.setAttribute('min', minDate);

    updateSlider(document.getElementById('painlevel').value);
});


function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

function clearError(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = ''; }
}

function markError(fieldId, errorId, msg) {
    var field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('field-error');
        field.classList.remove('field-ok');
    }
    showError(errorId, 'error' + msg);
}

function markOk(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('field-error');
        field.classList.add('field-ok');
    }
    clearError(errorId);
}

function validateFname() {
    var val = document.getElementById('fname').value.trim();
    if (val === '') {
        markError('fname', 'fname-error', 'First name is required.');
        return false;
    }
    if (!/^[a-zA-Z'\-]{1,30}$/.test(val)) {
        markError('fname', 'fname-error', 'Letters, apostrophes, and dashes only (1–30 chars).');
        return false;
    }
    markOk('fname', 'fname-error');
    return true;
}

function validateMini() {
    var val = document.getElementById('mini').value.trim();
    if (val === '') { markOk('mini', 'mini-error'); return true; }  
    if (!/^[a-zA-Z]$/.test(val)) {
        markError('mini', 'mini-error', 'One letter only.');
        return false;
    }
    markOk('mini', 'mini-error');
    return true;
}

function validateLname() {
    var val = document.getElementById('lname').value.trim();
    if (val === '') {
        markError('lname', 'lname-error', 'Last name is required.');
        return false;
    }
    if (!/^[a-zA-Z'\-2-5]{1,30}$/.test(val)) {
        markError('lname', 'lname-error', 'Letters, apostrophes, numbers 2–5, and dashes only.');
        return false;
    }
    markOk('lname', 'lname-error');
    return true;
}

function validateDob() {
    var val  = document.getElementById('dob').value;
    var eId  = 'dob-error';
    if (!val) { markError('dob', eId, 'Date of birth is required.'); return false; }

    var dob    = new Date(val);
    var today  = new Date();
    today.setHours(0,0,0,0);
    var min120 = new Date();
    min120.setFullYear(today.getFullYear() - 120);

    if (dob > today)    { markError('dob', eId, 'Date of birth cannot be in the future.'); return false; }
    if (dob < min120)   { markError('dob', eId, 'Date of birth cannot be more than 120 years ago.'); return false; }

    markOk('dob', eId);
    return true;
}

function validateEmail() {
    var val = document.getElementById('email').value.trim();
    var re  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/;
    if (!val)       { markError('email', 'email-error', 'Email address is required.'); return false; }
    if (!re.test(val)) { markError('email', 'email-error', 'Enter a valid email: name@domain.tld'); return false; }
    markOk('email', 'email-error');
    return true;
}

function validatePhone() {
    var val = document.getElementById('phone').value.trim();
    var re  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    if (!val)        { markError('phone', 'phone-error', 'Phone number is required.'); return false; }
    if (!re.test(val)) { markError('phone', 'phone-error', 'Format must be 000-000-0000'); return false; }
    markOk('phone', 'phone-error');
    return true;
}


function validateAddress1() {
    var val = document.getElementById('address1').value.trim();
    if (!val || val.length < 2) {
        markError('address1', 'address1-error', 'Address Line 1 is required (2–60 chars).');
        return false;
    }
    markOk('address1', 'address1-error');
    return true;
}

function validateAddress2() {
    var val = document.getElementById('address2').value.trim();
    if (val !== '' && val.length < 2) {
        markError('address2', 'address2-error', 'If entered, must be at least 2 characters.');
        return false;
    }
    markOk('address2', 'address2-error');
    return true;
}

function validateCity() {
    var val = document.getElementById('city').value.trim();
    if (!val || val.length < 2) {
        markError('city', 'city-error', 'City is required (2–30 characters).');
        return false;
    }
    markOk('city', 'city-error');
    return true;
}

function validateState() {
    var val = document.getElementById('state').value;
    if (!val) { markError('state', 'state-error', 'Please select a state.'); return false; }
    markOk('state', 'state-error');
    return true;
}

function validateZip() {
    var field = document.getElementById('zipcode');
    var val   = field.value.trim();
    var re    = /^\d{5}(-\d{4})?$/;
    if (!val)        { markError('zipcode', 'zip-error', 'Zip code is required.'); return false; }
    if (!re.test(val)) { markError('zipcode', 'zip-error', 'Enter 5-digit zip or zip+4: 77002-1234'); return false; }

    // Truncate to 5 digits if user typed zip+4 (re-display)
    var display = val.substring(0, 5);
    // We still accept full zip+4 but just note 5-digit portion for display
    markOk('zipcode', 'zip-error');
    return true;
}


function validateUID() {
    var val   = document.getElementById('uid').value.trim();
    var lower = val.toLowerCase();
    document.getElementById('uid').value = lower;   // convert to lowercase

    if (!val || val.length < 5) {
        markError('uid', 'uid-error', 'User ID must be 5–30 characters.');
        return false;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_\-]{4,29}$/.test(val)) {
        markError('uid', 'uid-error', 'Must start with a letter. Letters, numbers, _ or - only. No spaces.');
        return false;
    }
    markOk('uid', 'uid-error');
    return true;
}

function validatePword() {
    var val  = document.getElementById('pword').value;
    var uid  = document.getElementById('uid').value.toLowerCase();
    var fn   = document.getElementById('fname').value.toLowerCase();
    var ln   = document.getElementById('lname').value.toLowerCase();

    var hasUpper   = /[A-Z]/.test(val);
    var hasLower   = /[a-z]/.test(val);
    var hasDigit   = /[0-9]/.test(val);
    var hasSpecial = /[!@#%^&*()\-_+=\\\/><.,`~]/.test(val);
    var noQuotes   = !/"/.test(val);
    var goodLen    = val.length >= 8 && val.length <= 30;

    var m1 = document.getElementById('msg1');
    var m2 = document.getElementById('msg2');
    var m3 = document.getElementById('msg3');
    var m4 = document.getElementById('msg4');

    m1.textContent = goodLen    ? '✔ 8–30 characters'         : '✘ Must be 8–30 characters';
    m1.className   = goodLen    ? 'hint-ok'                    : 'hint-fail';

    m2.textContent = (hasUpper && hasLower) ? '✔ Upper & lowercase letters' : '✘ Need uppercase AND lowercase';
    m2.className   = (hasUpper && hasLower) ? 'hint-ok'                     : 'hint-fail';

    m3.textContent = (hasDigit && hasSpecial) ? '✔ Number & special character' : '✘ Need a number and a special character (!@#%...)';
    m3.className   = (hasDigit && hasSpecial) ? 'hint-ok'                      : 'hint-fail';

    m4.textContent = noQuotes ? '✔ No double quotes'  : '✘ Double quotes not allowed';
    m4.className   = noQuotes ? 'hint-ok'             : 'hint-fail';

    // Check against UID and name
    var pwordErr = '';
    if (val && uid && val.toLowerCase().includes(uid)) {
        pwordErr = 'Password cannot contain your User ID.';
    } else if (val && fn && fn.length > 2 && val.toLowerCase().includes(fn)) {
        pwordErr = 'Password cannot contain your first name.';
    } else if (val && ln && ln.length > 2 && val.toLowerCase().includes(ln)) {
        pwordErr = 'Password cannot contain your last name.';
    }

    if (pwordErr) {
        markError('pword', 'pword1-error', pwordErr);
        return false;
    }

    if (!goodLen || !hasUpper || !hasLower || !hasDigit || !hasSpecial || !noQuotes) {
        markError('pword', 'pword1-error', 'Password does not meet requirements.');
        return false;
    }

    markOk('pword', 'pword1-error');
    return true;
}

function confirmPword() {
    var p1 = document.getElementById('pword').value;
    var p2 = document.getElementById('pword2').value;
    if (!p2) { clearError('pword2-error'); return; }
    if (p1 !== p2) {
        markError('pword2', 'pword2-error', 'Passwords do not match.');
        return false;
    }
    markOk('pword2', 'pword2-error');
    return true;
}

function updateSlider(val) {
    var labels = {
        1: '1 – Excellent',
        2: '2 – Very Good',
        3: '3 – Good',
        4: '4 – Fair',
        5: '5 – Moderate',
        6: '6 – Poor',
        7: '7 – Bad',
        8: '8 – Serious',
        9: '9 – Critical',
        10: '10 – Severe'
    };
    var display = document.getElementById('slider-display');
    if (display) display.textContent = labels[val] || val;
}

function reviewInput() {
    var valid = runAllValidations();

    var panel = document.getElementById('reviewPanel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var tbl = document.getElementById('reviewTable');
    tbl.innerHTML = '';

    function row(label, value, pass, errMsg) {
        var tr   = document.createElement('tr');
        var tdL  = document.createElement('td');
        var tdV  = document.createElement('td');
        var tdS  = document.createElement('td');
        tdL.textContent = label;
        tdV.textContent = value || '(blank)';
        if (pass) {
            tdS.innerHTML = '<span class="status-pass">PASS</span>';
        } else {
            tdS.innerHTML = '<span class="status-error">ERROR: ' + (errMsg || 'invalid') + '</span>';
        }
        tr.appendChild(tdL); tr.appendChild(tdV); tr.appendChild(tdS);
        tbl.appendChild(tr);
    }

    var fname    = document.getElementById('fname').value.trim();
    var mini     = document.getElementById('mini').value.trim();
    var lname    = document.getElementById('lname').value.trim();
    var dob      = document.getElementById('dob').value;
    var gender   = document.querySelector('input[name="pgender"]:checked');
    var email    = document.getElementById('email').value.trim();
    var phone    = document.getElementById('phone').value.trim();
    var addr1    = document.getElementById('address1').value.trim();
    var addr2    = document.getElementById('address2').value.trim();
    var city     = document.getElementById('city').value.trim();
    var state    = document.getElementById('state').value;
    var zip      = document.getElementById('zipcode').value.trim();
    var uid      = document.getElementById('uid').value.trim();
    var pword    = document.getElementById('pword').value;
    var pword2   = document.getElementById('pword2').value;
    var notes    = document.getElementById('notes').value.trim();
    var pain     = document.getElementById('painlevel').value;
    var vax      = document.querySelector('input[name="vaccinated"]:checked');

    var checks   = document.querySelectorAll('input[name="history"]:checked');
    var checkVals = Array.from(checks).map(function(c){ return c.value; });

    var nameStr = fname + (mini ? ' ' + mini + '.' : '') + ' ' + lname;
    var nameOk  = fname && lname && /^[a-zA-Z'\-]{1,30}$/.test(fname) && /^[a-zA-Z'\-2-5]{1,30}$/.test(lname);
    row('Full Name', nameStr, nameOk, 'Check first/last name fields');

    var dobOk = false, dobErr = 'Required';
    if (dob) {
        var dobD  = new Date(dob);
        var now   = new Date(); now.setHours(0,0,0,0);
        var min120 = new Date(); min120.setFullYear(now.getFullYear()-120);
        if (dobD > now)    { dobErr = 'Cannot be in the future'; }
        else if (dobD < min120) { dobErr = 'Cannot be > 120 years ago'; }
        else { dobOk = true; }
    }
    row('Date of Birth', dob, dobOk, dobErr);

    row('Gender', gender ? gender.value : '(not selected)', true, '');

    var emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,20}$/;
    row('Email Address', email, email && emailRe.test(email), 'Invalid email format');

    var phoneRe = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    row('Phone Number', phone, phone && phoneRe.test(phone), 'Format: 000-000-0000');

    var addrFull = addr1 + (addr2 ? ', ' + addr2 : '') + ', ' + city + ', ' + state + ' ' + zip;
    var zipRe    = /^\d{5}(-\d{4})?$/;
    var addrOk   = addr1.length >= 2 && city.length >= 2 && state && zipRe.test(zip);
    var addrErr  = '';
    if (!addr1 || addr1.length < 2)  addrErr = 'Missing Address Line 1';
    else if (!city || city.length < 2) addrErr = 'Missing City';
    else if (!state)                  addrErr = 'Missing State';
    else if (!zipRe.test(zip))        addrErr = 'Missing or invalid Zip Code';

    row('Medical History', checkVals.length ? checkVals.join(', ') : 'None checked', true, '');

    row('Vaccinated?', vax ? vax.value : '(not answered)', true, '');

    var painLabels = ['','Excellent','Very Good','Good','Fair','Moderate','Poor','Bad','Serious','Critical','Severe'];
    row('Health / Pain Level', pain + ' – ' + (painLabels[pain] || ''), true, '');

    row('Additional Notes', notes || '(none)', true, '');

    var uidOk = /^[a-zA-Z][a-zA-Z0-9_\-]{4,29}$/.test(uid);
    row('User ID', uid, uidOk, '5–30 chars, start with letter, no spaces');

    var pOk = /[A-Z]/.test(pword) && /[a-z]/.test(pword) && /[0-9]/.test(pword) &&
              /[!@#%^&*()\-_+=\\\/><.,`~]/.test(pword) && pword.length >= 8 && !/"/.test(pword);
    var p2Ok = pword === pword2 && pword !== '';
    row('Password', pOk ? '(meets requirements)' : '(see requirements)', pOk, 'Does not meet requirements');
    row('Passwords Match', p2Ok ? 'Yes' : 'No', p2Ok, 'Passwords do not match');
}

function runAllValidations() {
    var ok = true;
    if (!validateFname())    ok = false;
    if (!validateMini())     ok = false;
    if (!validateLname())    ok = false;
    if (!validateDob())      ok = false;
    if (!validateEmail())    ok = false;
    if (!validatePhone())    ok = false;
    if (!validateAddress1()) ok = false;
    if (!validateAddress2()) ok = false;
    if (!validateCity())     ok = false;
    if (!validateState())    ok = false;
    if (!validateZip())      ok = false;
    if (!validateUID())      ok = false;
    if (!validatePword())    ok = false;
    if (!confirmPword())     ok = false;
    return ok;
}

function submitForm(event) {
    if (!runAllValidations()) {
        event.preventDefault();
        reviewInput();
        alert('Please fix the errors shown in the review panel before submitting.');
        return false;
    }
    return true;
}

function clearReview() {
    var panel = document.getElementById('reviewPanel');
    if (panel) panel.style.display = 'none';

    document.querySelectorAll('.error').forEach(function(e){ e.textContent = ''; });
    document.querySelectorAll('.field-error, .field-ok').forEach(function(f){
        f.classList.remove('field-error', 'field-ok');
    });
    document.querySelectorAll('#msg1, #msg2, #msg3, #msg4').forEach(function(m){
        m.textContent = '';
    });
    updateSlider(5);
}
