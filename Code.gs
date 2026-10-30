// Google Apps Script (مجاني) — وسيط بين الموقع و FCM HTTP v1
// Script Properties المطلوبة (Project Settings ← Script properties):
//   SERVICE_ACCOUNT_JSON : محتوى ملف الـ Service Account كامل
//   FIREBASE_API_KEY     : قيمة apiKey من firebaseConfig في app.js
var PROJECT_ID = 'restaevents-eeffb';

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    verifyUser_(req.idToken);

    var n = req.notification || {};
    var data = {};
    Object.keys(req.data || {}).forEach(function (k) { data[k] = String(req.data[k]); });

    var res = UrlFetchApp.fetch(
      'https://fcm.googleapis.com/v1/projects/' + PROJECT_ID + '/messages:send', {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + accessToken_() },
        muteHttpExceptions: true,
        payload: JSON.stringify({
          message: {
            topic: 'bookings',
            notification: { title: String(n.title || ''), body: String(n.body || '') },
            data: data,
            android: { priority: 'HIGH', notification: { sound: n.sound || 'default' } }
          }
        })
      });
    if (res.getResponseCode() !== 200) return json_({ ok: false, error: res.getContentText() });
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// يتأكد إن التوكن لمستخدم مسجّل بإيميل (مش زائر مجهول)
function verifyUser_(idToken) {
  if (!idToken) throw new Error('no token');
  var key = PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
  var r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + key, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ idToken: idToken })
  });
  var u = r.getResponseCode() === 200 && (JSON.parse(r.getContentText()).users || [])[0];
  if (!u || !u.email) throw new Error('unauthorized');
}

function accessToken_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('fcm_token');
  if (cached) return cached;

  var sa = JSON.parse(PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_JSON'));
  var now = Math.floor(Date.now() / 1000);
  var b64 = function (x) { return Utilities.base64EncodeWebSafe(x).replace(/=+$/, ''); };
  var unsigned = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  }));
  var sig = b64(Utilities.computeRsaSha256Signature(unsigned, sa.private_key));
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }
  });
  var token = JSON.parse(r.getContentText()).access_token;
  cache.put('fcm_token', token, 3000);
  return token;
}
