/* =========================================================
   DAILY DASH SHOP — app logic
   Shared header/footer, catalog rendering, capture, UX.
========================================================= */
(function(){
  "use strict";
  const DDS = window.DDS || {};
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const money = p => "$"+p;
  /* credit wallet: a template costs list-price x3 credits; members pay 25% less */
  const credits = p => Math.round(p*3);
  const memberPrice = p => "$"+(p*0.75).toFixed(2).replace(/\.00$/,"");

  /* ---- Brevo capture endpoint (server API set at deploy).
     Until wired, leads are stored locally so none are lost. ---- */
  const CAPTURE_ENDPOINT = window.DDS_CAPTURE || "https://dds.tryrealo.com/subscribe";

  /* ---------- shared header ---------- */
  function header(active){
    const link=(h,l)=>`<a href="${h}"${active===l?' aria-current="page"':''}>${l}</a>`;
    return `
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="hdr" id="hdr">
      <div class="wrap nav">
        <a class="brand" href="/"><span class="mark"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 17h13.5C47.2 17 54 24 54 33.5S47.2 50 37.5 50H24V17zm9.2 24.6c5.4 0 8.9-3.3 8.9-8.1s-3.5-8.1-8.9-8.1H32v16.2h1.2z" fill="#fff"/><rect x="6" y="24" width="12" height="4" rx="2" fill="#fff" opacity=".85"/><rect x="2" y="34" width="14" height="4" rx="2" fill="#fff" opacity=".5"/></svg></span>Daily&nbsp;Dash&nbsp;Shop</a>
        <nav class="nav-links">
          ${link('/shop.html','Shop')}
          ${link('/credits.html','Credits')}
          ${link('/#how','How it works')}
          ${link('/about.html','About')}
        </nav>
        <div class="nav-actions">
          <a href="/shop.html" class="btn btn-ghost" style="--py:11px;--px:20px">Browse</a>
          <a href="/#join" class="btn btn-accent" style="--py:11px;--px:20px">Get 20% off</a>
          <button class="burger" aria-label="Menu" id="burger"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>
    <div class="drawer" id="drawer">
      <button class="close" id="drawerClose" aria-label="Close">×</button>
      <a href="/shop.html">Shop</a>
      <a href="/credits.html">Credits</a>
      <a href="/#how">How it works</a>
      <a href="/about.html">About</a>
      <a href="/#join" class="btn btn-accent" style="margin-top:14px">Get 20% off</a>
    </div>`;
  }

  /* ---------- shared footer ---------- */
  function footer(){
    const y=new Date().getFullYear();
    return `
    <footer class="ft">
      <div class="wrap">
        <div class="ft-top">
          <div>
            <a class="brand" href="/"><span class="mark"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 17h13.5C47.2 17 54 24 54 33.5S47.2 50 37.5 50H24V17zm9.2 24.6c5.4 0 8.9-3.3 8.9-8.1s-3.5-8.1-8.9-8.1H32v16.2h1.2z" fill="#fff"/><rect x="6" y="24" width="12" height="4" rx="2" fill="#fff" opacity=".85"/><rect x="2" y="34" width="14" height="4" rx="2" fill="#fff" opacity=".5"/></svg></span>Daily&nbsp;Dash&nbsp;Shop</a>
            <p class="blurb">Premium, ready-to-edit digital templates that make you look professional in minutes. Instant download, made for creators worldwide.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/shop.html">All templates</a>
            <a href="/credits.html">Credit Wallet</a>
            <a href="/shop.html#resumes">Resumes & CV</a>
            <a href="/shop.html#planners">Planners</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about.html">About us</a>
            <a href="/contact.html">Contact</a>
            <a href="/affiliate.html">Affiliates — earn 25%</a>
            <a href="/#join">Get 20% off</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="/privacy.html">Privacy</a>
            <a href="/terms.html">Terms</a>
            <a href="/license.html">Licence</a>
            <a href="/refund.html">Refund Policy</a>
          </div>
        </div>
        <div class="ft-bottom">
          <span>© ${y} Daily Dash Shop — Premium digital templates.</span>
          <span>hellodailydashshop@gmail.com · Instant delivery · Secure checkout</span>
        </div>
      </div>
    </footer>`;
  }

  /* ---------- product card ---------- */
  function card(p){
    const tag = p.badge ? `<span class="p-tag${p.hot?' hot':''}">${p.badge}</span>` : "";
    const cmp = p.compareAt ? `<s>${money(p.compareAt)}</s>` : "";
    return `
    <article class="p-card reveal" data-cat="${p.category}">
      <a class="p-thumb" href="/product.html?id=${p.id}">
        ${tag}
        <img loading="lazy" src="${p.image}" alt="${p.name}">
      </a>
      <div class="p-body">
        <span class="p-cat">${(DDS.categories.find(c=>c.id===p.category)||{}).label||''}</span>
        <a class="p-name" href="/product.html?id=${p.id}">${p.name}</a>
        <span class="p-rate">${p.reviews>0?`★ ${p.rating.toFixed(1)} <span class="muted">· `:`<span class="muted">`}${p.formats[0]}${p.formats.length>1?' +'+(p.formats.length-1):''}</span></span>
        <div class="p-foot">
          <span class="p-price">${cmp}${money(p.price)}</span>
          <a class="p-buy" href="/product.html?id=${p.id}">View →</a>
        </div>
        <div class="p-wallet">🏷️ <b>${memberPrice(p.price)}</b> with a <a href="/credits.html">wallet</a> · ${credits(p.price)} cr</div>
      </div>
    </article>`;
  }

  /* ---------- render grids where requested ---------- */
  function renderFeatured(){
    const host=$("#featured"); if(!host) return;
    host.innerHTML = DDS.products.slice(0,4).map(card).join("");
  }
  function renderShop(){
    const host=$("#shopGrid"); if(!host) return;
    const draw=(cat)=>{
      const list = cat==="all"?DDS.products:DDS.products.filter(p=>p.category===cat);
      host.innerHTML = list.map(card).join("") || `<p class="muted">More drops landing soon.</p>`;
      observe();
    };
    const bar=$("#catBar");
    if(bar){
      bar.innerHTML = DDS.categories.map(c=>`<button class="chip${c.id==='all'?' active':''}" data-cat="${c.id}">${c.label}</button>`).join("");
      bar.addEventListener("click",e=>{
        const b=e.target.closest(".chip"); if(!b) return;
        $$(".chip",bar).forEach(x=>x.classList.remove("active")); b.classList.add("active");
        draw(b.dataset.cat);
      });
    }
    const hash=location.hash.replace("#","");
    const start=DDS.categories.some(c=>c.id===hash)?hash:"all";
    if(bar && start!=="all"){ $$(".chip",bar).forEach(x=>x.classList.toggle("active",x.dataset.cat===start)); }
    draw(start);
  }

  /* ---------- product detail ---------- */
  function renderProduct(){
    const host=$("#productView"); if(!host) return;
    const q=new URLSearchParams(location.search); const key=q.get("id")||q.get("slug")||document.body.getAttribute("data-pid");
    const p=DDS.products.find(x=>x.id===key||x.slug===key)||DDS.products[0];
    document.title=`${p.name} — Daily Dash Shop`;
    (function(){var c=document.querySelector('link[rel="canonical"]');if(c)c.href=`https://dailydashshop.com/products/${p.slug}.html`;})();
    const cmp=p.compareAt?`<s>${money(p.compareAt)}</s> `:"";
    const off=p.compareAt?Math.round((1-p.price/p.compareAt)*100):0;
    const link = (DDS.buyLinks && DDS.buyLinks[p.id]) || "";
    const buy = link || "/#join";
    const buyLabel = link ? "Buy &amp; download now →" : "Get 20% off — join the list";
    const buyAttr = link ? ' target="_blank" rel="noopener"' : '';
    const gal = (p.gallery && p.gallery.length ? p.gallery : [p.image]);
    const thumbs = gal.length>1
      ? `<div class="pd-thumbs">${gal.map((g,i)=>`<button class="pd-thumb${i===0?" on":""}" data-src="${g}" aria-label="Preview ${i+1}"><img loading="lazy" src="${g}" alt="${p.name} preview ${i+1}"></button>`).join("")}</div>`
      : "";
    host.innerHTML=`
      <div class="pd-grid">
        <div class="pd-media"><img id="pdMainImg" src="${gal[0]}" alt="${p.name}">${thumbs}</div>
        <div class="pd-info">
          <a href="/shop.html" class="muted" style="font-family:Sora;font-weight:600;font-size:.9rem">← All templates</a>
          <span class="p-cat" style="margin-top:14px;display:block">${(DDS.categories.find(c=>c.id===p.category)||{}).label}</span>
          <h1 style="font-size:clamp(1.9rem,4vw,2.7rem);margin:6px 0 10px">${p.name}</h1>
          <div class="p-rate" style="font-size:1rem">${p.reviews>0?`★ ${p.rating.toFixed(1)} <span class="muted">· `:`<span class="muted">`}${p.delivery}</span></div>
          <p style="color:var(--ink-2);font-size:1.08rem;margin:16px 0">${p.short}</p>
          <div style="display:flex;align-items:baseline;gap:12px;margin:6px 0 12px">
            <span class="p-price" style="font-size:2rem">${cmp}${money(p.price)}</span>
            ${off?`<span class="p-tag hot" style="position:static">${off}% off</span>`:""}
          </div>
          <div class="pd-wallet">
            <span>🏷️ <b>${memberPrice(p.price)}</b> with a Credit Wallet <span class="muted">· ${credits(p.price)} credits · save 25%+</span></span>
            <a href="/credits.html">Get a wallet →</a>
          </div>
          <ul class="pd-list">${p.highlights.map(h=>`<li>✓ ${h}</li>`).join("")}</ul>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px">
            <a href="${buy}"${buyAttr} class="btn btn-accent btn-lg${link?' js-buy':''}"${link?` data-buy="${link}"`:''}>${buyLabel}</a>
            <a href="/shop.html" class="btn btn-ghost btn-lg">Keep browsing</a>
          </div>
          <div class="pd-meta">
            <div><b>Formats</b><span>${p.formats.join(" · ")}</span></div>
            <div><b>Delivery</b><span>${p.delivery}</span></div>
            <div><b>Licence</b><span>Personal & commercial use</span></div>
          </div>
        </div>
      </div>`;
    // gallery: click a thumbnail to swap the main image
    const main=$("#pdMainImg");
    host.querySelectorAll(".pd-thumb").forEach(btn=>btn.addEventListener("click",()=>{
      main.src=btn.dataset.src;
      host.querySelectorAll(".pd-thumb").forEach(b=>b.classList.remove("on"));
      btn.classList.add("on");
    }));
    // Buy: offer both card (Razorpay) and crypto (NOWPayments) via the chooser.
    host.querySelectorAll(".js-buy").forEach(a=>a.addEventListener("click",e=>{
      e.preventDefault();
      let pid="";
      try{ pid=new URL(a.dataset.buy, location.origin).searchParams.get("pid")||""; }catch(_){}
      openPay("product", pid, a.dataset.buy);
    }));
  }

  /* ---------- affiliate referral tracking ---------- */
  const REF_TTL = 30*24*3600*1000;   // 30-day attribution window
  function refTrack(){
    try{
      const code=(new URLSearchParams(location.search).get("ref")||"").trim().toUpperCase();
      if(!code) return;
      localStorage.setItem("dds_ref", JSON.stringify({code, t:Date.now()}));
      const base=window.DDS_PAY||"";
      if(base) fetch(`${base}/aff-click?code=${encodeURIComponent(code)}`,{cache:"no-store"}).catch(()=>{});
    }catch(_){}
  }
  function getRef(){
    try{
      const r=JSON.parse(localStorage.getItem("dds_ref")||"null");
      if(r && r.code && (Date.now()-r.t)<REF_TTL) return r.code;
    }catch(_){}
    return "";
  }

  /* ---------- payment method chooser (card / crypto) ---------- */
  function openPay(kind, ref, cardEndpoint){
    const base = window.DDS_PAY || "";
    const isProduct = kind === "product";       // product = one-off; pack/access = server checkout
    if(!base && !isProduct){ location.href="/#join"; return; }   // pre-launch fallback
    if(!document.getElementById("payCss")){
      const st=document.createElement("style"); st.id="payCss";
      st.textContent=`.pay-ov{position:fixed;inset:0;background:rgba(10,8,20,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px}
.pay-box{background:var(--bg-2,#17142a);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:26px 24px;max-width:380px;width:100%;text-align:center;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.pay-box h3{font-family:Sora,sans-serif;font-size:1.35rem;margin:0 0 6px}
.pay-sub{color:var(--ink-2,#a9a6c4);font-size:.9rem;margin:0 0 16px}
.pay-email{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit;font-size:1rem;margin-bottom:10px}
.pay-msg{min-height:18px;font-size:.85rem;margin-bottom:8px}
.pay-btn{width:100%;padding:13px;border-radius:11px;border:0;font-family:Sora,sans-serif;font-weight:700;font-size:1rem;cursor:pointer;margin-top:8px}
.pay-card{background:var(--brand,#7c5cff);color:#fff}
.pay-crypto{background:transparent;color:inherit;border:1.5px solid var(--brand,#7c5cff)}
.pay-fine{color:var(--ink-2,#a9a6c4);font-size:.72rem;margin:14px 0 0}
.pay-x{position:absolute;top:10px;right:14px;background:0;border:0;color:inherit;font-size:1.6rem;line-height:1;cursor:pointer;opacity:.6}`;
      document.head.appendChild(st);
    }
    const ov=document.createElement("div"); ov.className="pay-ov";
    ov.innerHTML=`<div class="pay-box" role="dialog" aria-modal="true" aria-label="Choose payment method">
      <button class="pay-x" aria-label="Close">&times;</button>
      <h3>Choose how to pay</h3>
      <p class="pay-sub">${kind==="pack"?"Your credits & receipt go to this email.":kind==="access"?"Your 1-year pass & library access go to this email.":"Your download & receipt go to this email."}</p>
      <input class="pay-email" type="email" inputmode="email" placeholder="you@email.com" autocomplete="email">
      <div class="pay-msg" aria-live="polite"></div>
      <button class="pay-btn pay-card">💳 Pay with card / UPI</button>
      <button class="pay-btn pay-crypto">🪙 Pay with crypto (USDC / USDT)</button>
      <p class="pay-fine">Secure checkout · card via Razorpay · crypto via NOWPayments</p>
    </div>`;
    document.body.appendChild(ov);
    const em=ov.querySelector(".pay-email"), msg=ov.querySelector(".pay-msg");
    const close=()=>ov.remove();
    ov.addEventListener("click",e=>{ if(e.target===ov) close(); });
    ov.querySelector(".pay-x").addEventListener("click",close);
    const valid=v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
    const go=async(url,needEmail)=>{
      const email=(em.value||"").trim();
      if(needEmail&&!valid(email)){ msg.style.color="#ff9a8a"; msg.textContent="Please enter a valid email."; em.focus(); return; }
      let full=url.replace("{email}",encodeURIComponent(email));
      const rc=getRef(); if(rc) full+=`&ref=${encodeURIComponent(rc)}`;
      msg.style.color="var(--ink-2,#a9a6c4)"; msg.textContent="Opening secure checkout…";
      try{
        const r=await fetch(full,{cache:"no-store"});
        const d=await r.json();
        if(d&&d.url){ location.href=d.url; return; }
        msg.style.color="#ff9a8a"; msg.textContent=(d&&d.error)||"Checkout unavailable, try again.";
      }catch(_){ msg.style.color="#ff9a8a"; msg.textContent="Checkout unavailable, try again."; }
    };
    ov.querySelector(".pay-card").addEventListener("click",()=>{
      if(!isProduct) go(`${base}/checkout?item=${encodeURIComponent(ref)}&email={email}&fmt=json`,true);
      else go(cardEndpoint+"&fmt=json",false);
    });
    ov.querySelector(".pay-crypto").addEventListener("click",()=>{
      go(`${base}/crypto-checkout?item=${encodeURIComponent(ref)}&email={email}`,true);
    });
    setTimeout(()=>em.focus(),50);
  }

  /* ---------- email capture ---------- */
  function capture(){
    $$("form[data-capture]").forEach(form=>{
      const msg = form.querySelector("[data-msg]") || form.parentElement.querySelector("[data-msg]");
      const show=(t,ok)=>{ if(!msg)return; msg.style.display="block"; msg.style.color=ok?"#7CF0A6":"#ff9a8a"; msg.textContent=t; };
      // GDPR-visible cross-subscribe opt-in (pre-ticked, user can untick)
      let dec=form.querySelector("input[data-decoded]");
      if(!dec){
        const wrap=document.createElement("label");
        wrap.style.cssText="display:flex;gap:8px;align-items:flex-start;margin:10px 2px 0;font-size:.8rem;color:var(--ink-2,#a9a6c4);text-align:left;cursor:pointer";
        wrap.innerHTML=`<input type="checkbox" data-decoded checked style="margin-top:3px;flex:none">
          <span>Also send me <b>The Decoded</b> — a free AI &amp; tech briefing from our sister publication. Unsubscribe anytime.</span>`;
        form.appendChild(wrap);
        dec=wrap.querySelector("input[data-decoded]");
      }
      form.addEventListener("submit", async e=>{
        e.preventDefault();
        const input=form.querySelector('input[type=email]');
        const email=(input.value||"").trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ show("Please enter a valid email.",false); return; }
        const btn=form.querySelector("button[type=submit]"); const old=btn&&btn.textContent;
        if(btn){btn.disabled=true;btn.textContent="Sending…";}
        try{
          try{
            await fetch(CAPTURE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},
              body:JSON.stringify({email,source:location.pathname,decoded:!!(dec&&dec.checked)})});
          }catch(_){}
          const leads=JSON.parse(localStorage.getItem("dds_leads")||"[]");
          leads.push({email,t:Date.now()}); localStorage.setItem("dds_leads",JSON.stringify(leads));
          show("You're in! Check your inbox for the 20% code + free starter pack. 🎉",true);
          form.reset();
        }catch(_){ show("Something went wrong — please try again.",false); }
        finally{ if(btn){btn.disabled=false;btn.textContent=old;} }
      });
    });
  }

  /* ---------- reveal-on-scroll ---------- */
  let io;
  const revealAll=()=>$$(".reveal:not(.in)").forEach(el=>el.classList.add("in"));
  function observe(){
    // accessibility + no-JS-observer + safety: never let content stay invisible
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce || !("IntersectionObserver" in window)){ revealAll(); return; }
    io=io||new IntersectionObserver((es)=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target);}}),{threshold:.12,rootMargin:"0px 0px -8% 0px"});
    $$(".reveal:not(.in)").forEach(el=>io.observe(el));
    // failsafe: if anything is still hidden after 2.5s (edge cases / short pages), show it
    clearTimeout(observe._t); observe._t=setTimeout(revealAll, 2500);
  }

  /* ---------- header behaviour + drawer ---------- */
  function chrome(){
    const hdr=$("#hdr");
    if(hdr){ const on=()=>hdr.classList.toggle("scrolled",scrollY>8); on(); addEventListener("scroll",on,{passive:true}); }
    const d=$("#drawer");
    $("#burger")&&$("#burger").addEventListener("click",()=>d.classList.add("open"));
    $("#drawerClose")&&$("#drawerClose").addEventListener("click",()=>d.classList.remove("open"));
    $$("#drawer a").forEach(a=>a.addEventListener("click",()=>d.classList.remove("open")));
  }

  /* ---------- sticky conversion bar ---------- */
  function stickyCTA(){
    if(sessionStorage.getItem("dds_cta_x")) return;
    const bar=document.createElement("div");
    bar.className="sticky-cta";
    bar.innerHTML=`<div class="wrap in">
      <div class="txt"><span class="gift">🎁</span><p>Get 20% off your first order<small>Free starter template pack — instantly, when you join.</small></p></div>
      <div class="act"><a href="/#join" class="btn btn-accent" style="--py:11px;--px:20px">Claim 20% off</a>
      <button class="x" aria-label="Dismiss">×</button></div></div>`;
    document.body.appendChild(bar);
    bar.querySelector(".x").addEventListener("click",()=>{bar.classList.remove("show");sessionStorage.setItem("dds_cta_x","1");});
    const join=$("#join");
    const onScroll=()=>{
      const past=scrollY>760;
      let inJoin=false;
      if(join){const r=join.getBoundingClientRect();inJoin=r.top<innerHeight&&r.bottom>0;}
      bar.classList.toggle("show", past && !inJoin);
    };
    addEventListener("scroll",onScroll,{passive:true}); onScroll();
  }

  /* ---------- cookie / storage consent notice ----------
     Site uses only essential local storage (leads cache, UI prefs)
     and loads Google Fonts. Honest one-time notice, dismiss = stored. */
  function consent(){
    if(localStorage.getItem("dds_consent")) return;
    const bar=document.createElement("div");
    bar.className="consent"; bar.setAttribute("role","dialog");
    bar.setAttribute("aria-live","polite"); bar.setAttribute("aria-label","Cookie and storage notice");
    bar.innerHTML=`<div class="wrap consent-in">
      <p>We use essential local storage to run the site, remember your preferences and load fonts. We don't sell your data. See our <a href="/privacy.html">Privacy Policy</a>.</p>
      <button class="btn btn-accent" type="button" data-consent-ok>Got it</button>
    </div>`;
    document.body.appendChild(bar);
    requestAnimationFrame(()=>bar.classList.add("show"));
    bar.querySelector("[data-consent-ok]").addEventListener("click",()=>{
      localStorage.setItem("dds_consent","1"); bar.classList.remove("show");
      setTimeout(()=>bar.remove(),300);
    });
  }

  /* ---------- accessibility: skip-link target ---------- */
  function skipTarget(){
    if($("#content")) return;
    const first=$("section, main"); // first real content block after header
    if(first){ first.id="content"; first.setAttribute("tabindex","-1"); }
  }

  /* ---------- credit-wallet pack buttons ----------
     Live checkout activates once the webhook is public: set window.DDS_PAY to
     its base URL. Until then buttons fall back to their href (email capture). */
  function walletButtons(){
    const base = window.DDS_PAY || "";
    if(!base) return;                         // pre-launch: href="/#join" handles it
    const PACKS=["starter","popular","pro"];   // backend CREDIT_PACKS; "unlimited" is not a pack
    $$("[data-pack]").forEach(b=>b.addEventListener("click",e=>{
      const pack=b.dataset.pack; if(!PACKS.includes(pack)) return;  // unlimited -> access handler
      e.preventDefault();
      openPay("pack", pack, null);
    }));
    // 1-year unlimited pass ($369 one-time)
    $$('[data-pack="unlimited"], [data-access]').forEach(b=>b.addEventListener("click",e=>{
      e.preventDefault();
      openPay("access", b.dataset.access || "unlimited-1yr", null);
    }));
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded",()=>{
    const h=$("#site-header"); if(h) h.innerHTML=header(h.dataset.active||"");
    const f=$("#site-footer"); if(f) f.innerHTML=footer();
    refTrack(); chrome(); skipTarget(); renderFeatured(); renderShop(); renderProduct(); capture(); observe(); stickyCTA(); walletButtons(); consent();
  });
})();
