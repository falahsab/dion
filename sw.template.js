// sw.template.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbXXXX/exec"; // ضع رابط مشروع Apps Script هنا
const SIGN_KEY = "__SIGN_KEY__"; // سيتم استبداله تلقائياً عبر GitHub Actions

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/dion/api/proxy") || url.pathname.endsWith("/api/proxy")) {
    event.respondWith(proxyRequest(event.request));
  }
});

async function proxyRequest(req){
  const method = req.method;
  const timestamp = Math.floor(Date.now()/1000).toString();
  const nonce = crypto.randomUUID();
  const path = "/";
  const body = method==="POST" ? await req.clone().text() : "";
  const bodyHash = await sha(body);
  const message = `${timestamp}\n${nonce}\n${method}\n${path}\n${bodyHash}`;
  const signature = await hmac(SIGN_KEY,message);
  const domain = location.origin + location.pathname;
  const url = `${SCRIPT_URL}?timestamp=${timestamp}&nonce=${nonce}&signature=${signature}&domain=${encodeURIComponent(domain)}&path=${encodeURIComponent(path)}&bodyHash=${encodeURIComponent(bodyHash)}`;
  
  const fetchOpts = { method };
  if(method==="POST"){
    fetchOpts.body = body;
    fetchOpts.headers = { 'Content-Type':'application/json' };
  }
  return fetch(url, fetchOpts);
}

async function hmac(key,msg){
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw",enc.encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig = await crypto.subtle.sign("HMAC",k,enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function sha(text){
  const enc = new TextEncoder();
  const d = await crypto.subtle.digest("SHA-256",enc.encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(d)));
}
