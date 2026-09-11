const CACHE='omar-secure-v11';
const ASSETS=['./','./index.html','./manifest.json','./icon_192.png','./icon_512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))
});
self.addEventListener('fetch',e=>{
  const url = e.request.url;
  // لا تعمل كاش لـ Firebase و Google APIs عشان المزامنة اللحظية تفضل شغالة
  if(url.includes('firebase') || url.includes('gstatic') || url.includes('googleapis') || url.includes('firestore') || url.includes('firebasedatabase')){
    return;
  }
  if(url.includes('script.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      if(e.request.method==='GET' && res.ok){
        const cl=res.clone(); 
        caches.open(CACHE).then(c=>c.put(e.request, cl));
      } 
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
