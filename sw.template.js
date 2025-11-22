const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6oYQ5UdeQHnaPdQfJfcGh8DG137SPzNOopUcLYqhZWapnFP1WJ0EqSZw8HkqotqKI/exec"; // رابط proxy.gs Web App
const SIGN_KEY = "f3a9d7c2b1e4f89012a3c5d6e7f890ab12c3d4e5f6a7b89012c3d4e5f6a7b890";

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
