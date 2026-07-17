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
  /* root-absolute asset paths so images work from /products/ subdir pages too.
     Local product images get a version tag so returning visitors never see a
     stale cached thumbnail after an art refresh — bump IMGV on every image redesign. */
  const IMGV = "260712n";
  const A = s => {
    if (!s) return s;
    let u = (/^(https?:)?\/\//.test(s)||s[0]==="/") ? s : "/"+s;
    if (u[0]==="/" && /\.(jpe?g|png|webp)(\?|$)/i.test(u))
      u += (u.includes("?")?"&":"?") + "v=" + IMGV;
    return u;
  };
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
          ${link('/tools.html','Free tools')}
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
      <a href="/tools.html">Free tools</a>
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
          <span>© ${y} Daily Dash — Premium Templates for Ambitious Professionals.</span>
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
      <a class="p-thumb" href="/products/${p.slug}.html">
        ${tag}
        <img loading="lazy" src="${A(p.image)}" alt="${p.name}">
      </a>
      <div class="p-body">
        <span class="p-cat">${(DDS.categories.find(c=>c.id===p.category)||{}).label||''}</span>
        <a class="p-name" href="/products/${p.slug}.html">${p.name}</a>
        <span class="p-rate">${p.reviews>0?`★ ${p.rating.toFixed(1)} <span class="muted">· `:`<span class="muted">`}${p.formats[0]}${p.formats.length>1?' +'+(p.formats.length-1):''}</span></span>
        <div class="p-foot">
          <span class="p-price">${cmp}${money(p.price)}</span>
          <a class="p-buy" href="/products/${p.slug}.html">View →</a>
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
    const gal = (p.gallery && p.gallery.length ? p.gallery : [p.image]).map(A);
    const ba = p.ba && p.ba.before && p.ba.after ? `<div class="ba" id="baSlide" style="--x:50%">
        <img class="ba-after" src="${A(p.ba.after)}" alt="${p.name} — designed template">
        <img class="ba-before" src="${A(p.ba.before)}" alt="${p.name} — plain version">
        <span class="ba-tag l">Before</span><span class="ba-tag r">After</span>
        <div class="ba-line"></div><div class="ba-grip">⇄</div>
      </div>${p.ba.caption?`<div class="ba-cap">${p.ba.caption}</div>`:""}` : "";
    const thumbs = gal.length>1
      ? `<div class="pd-thumbs">${gal.map((g,i)=>`<button class="pd-thumb${i===0?" on":""}" data-src="${g}" aria-label="Preview ${i+1}"><img loading="lazy" src="${g}" alt="${p.name} preview ${i+1}"></button>`).join("")}</div>`
      : "";
    host.innerHTML=`
      <div class="pd-grid">
        <div class="pd-media">${ba}<img id="pdMainImg" src="${gal[0]}" alt="${p.name}">${thumbs}</div>
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
            <button type="button" class="btn btn-ghost btn-lg js-preview">👁 Preview template</button>
          </div>
          <div class="pd-meta">
            <div><b>Formats</b><span>${p.formats.join(" · ")}</span></div>
            <div><b>Delivery</b><span>${p.delivery}</span></div>
            <div><b>Licence</b><span>Personal & commercial use</span></div>
          </div>
        </div>
      </div>`;
    // "Preview template": open a lightbox of the real template design images
    const pv=host.querySelector(".js-preview");
    if(pv) pv.addEventListener("click",()=>openPreview(gal, p.name));
    // gallery: click a thumbnail to swap the main image
    const main=$("#pdMainImg");
    host.querySelectorAll(".pd-thumb").forEach(btn=>btn.addEventListener("click",()=>{
      main.src=btn.dataset.src;
      host.querySelectorAll(".pd-thumb").forEach(b=>b.classList.remove("on"));
      btn.classList.add("on");
    }));
    // before/after slider: drag anywhere on the image to wipe between the two
    const baEl=host.querySelector("#baSlide");
    if(baEl){
      const set=e=>{
        const r=baEl.getBoundingClientRect();
        const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
        const pct=Math.max(0,Math.min(100,(cx/r.width)*100));
        baEl.style.setProperty("--x",pct+"%");
      };
      let on=false;
      const start=e=>{on=true;set(e);e.preventDefault();};
      const move=e=>{if(on)set(e);};
      const end=()=>{on=false;};
      baEl.addEventListener("mousedown",start); baEl.addEventListener("touchstart",start,{passive:false});
      window.addEventListener("mousemove",move); baEl.addEventListener("touchmove",move,{passive:false});
      window.addEventListener("mouseup",end); baEl.addEventListener("touchend",end);
    }
    // Buy: offer both card (Razorpay) and crypto (NOWPayments) via the chooser.
    host.querySelectorAll(".js-buy").forEach(a=>a.addEventListener("click",e=>{
      e.preventDefault();
      let pid="";
      try{ pid=new URL(a.dataset.buy, location.origin).searchParams.get("pid")||""; }catch(_){}
      openPay("product", pid, a.dataset.buy, (p.price||0) >= CRYPTO_MIN);
    }));
    // reviews / social proof
    let rpid=document.body.getAttribute("data-pid")||"";
    if(!rpid){ try{ rpid=new URL((DDS.buyLinks||{})[p.id]||"",location.origin).searchParams.get("pid")||""; }catch(_){} }
    if(rpid) reviews(rpid);
  }

  /* ---------- customer reviews (self-hosted social proof) ---------- */
  function stars(n){ n=Math.round(n); return "★★★★★".slice(0,n)+"☆☆☆☆☆".slice(0,5-n); }
  function reviews(pid){
    const base=window.DDS_PAY||""; if(!base) return;
    const host=document.querySelector("#productView"); if(!host) return;
    const sec=document.createElement("section"); sec.className="rev-sec"; sec.style.marginTop="46px";
    sec.innerHTML=`<div class="sec-head"><h2 style="font-size:1.6rem">What buyers say</h2><div id="revAgg" class="muted"></div></div>
      <div id="revList" style="display:grid;gap:14px;margin:18px 0"></div>
      <details class="rev-form" style="background:var(--bg-2,#17142a);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px 20px;max-width:560px">
        <summary style="cursor:pointer;font-family:Sora;font-weight:700">Write a review</summary>
        <div style="margin-top:14px;display:grid;gap:10px">
          <select id="rvRating" class="aff-in" style="padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit">
            <option value="5">★★★★★ — Love it</option><option value="4">★★★★☆ — Great</option>
            <option value="3">★★★☆☆ — Good</option><option value="2">★★☆☆☆ — Okay</option><option value="1">★☆☆☆☆ — Poor</option></select>
          <input id="rvName" placeholder="Your name" class="aff-in" style="padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit">
          <input id="rvEmail" type="email" placeholder="Your email (kept private)" class="aff-in" style="padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit">
          <textarea id="rvText" rows="3" placeholder="What did you think?" class="aff-in" style="padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit;resize:vertical"></textarea>
          <div id="rvMsg" style="min-height:18px;font-size:.85rem"></div>
          <button id="rvGo" class="btn btn-accent" type="button">Submit review</button>
        </div>
      </details>`;
    host.appendChild(sec);
    const list=sec.querySelector("#revList"), agg=sec.querySelector("#revAgg");
    fetch(`${base}/reviews?pid=${encodeURIComponent(pid)}`,{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const a=d.aggregate||{count:0};
      if(a.count>0){
        agg.innerHTML=`<span style="color:#ffb020;letter-spacing:2px">${stars(a.avg)}</span> ${a.avg} · ${a.count} review${a.count>1?"s":""}`;
        // inject aggregateRating for rich snippets
        const ld={"@context":"https://schema.org","@type":"AggregateRating","ratingValue":a.avg,"reviewCount":a.count,"bestRating":5,"worstRating":1};
        const s=document.createElement("script"); s.type="application/ld+json"; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
      } else { agg.textContent="Be the first to review this template."; }
      list.innerHTML=(d.reviews||[]).map(r=>`<div class="f-card" style="text-align:left">
        <div style="color:#ffb020;letter-spacing:2px">${stars(r.rating)}</div>
        <p style="margin:8px 0 6px">${r.text}</p>
        <div class="muted" style="font-size:.82rem">— ${r.name}${r.verified?' · <span style="color:#7CF0A6">✓ Verified purchase</span>':''}</div></div>`).join("");
    }).catch(()=>{});
    sec.querySelector("#rvGo").addEventListener("click",async()=>{
      const msg=sec.querySelector("#rvMsg");
      const payload={pid,rating:sec.querySelector("#rvRating").value,name:sec.querySelector("#rvName").value,
                     email:sec.querySelector("#rvEmail").value,text:sec.querySelector("#rvText").value};
      const emailOk=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((payload.email||"").trim());
      if(!emailOk || !payload.text.trim()){ msg.style.color="#ff9a8a"; msg.textContent="Add your email and a short review."; return; }
      try{
        const r=await fetch(`${base}/review-submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
        const d=await r.json();
        if(d&&d.ok){ msg.style.color="#7CF0A6"; msg.textContent="Thank you! Your review will appear once approved."; }
        else { msg.style.color="#ff9a8a"; msg.textContent=(d&&d.error)||"Could not submit — try again."; }
      }catch(_){ msg.style.color="#ff9a8a"; msg.textContent="Something went wrong — try again."; }
    });
  }

  /* ---------- template preview lightbox ---------- */
  function openPreview(images, title){
    images=(images||[]).filter(Boolean);
    if(!images.length) return;
    if(!document.getElementById("pvCss")){
      const st=document.createElement("style"); st.id="pvCss";
      st.textContent=`.pv-ov{position:fixed;inset:0;background:rgba(8,6,16,.84);backdrop-filter:blur(5px);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;gap:14px}
.pv-cap{color:#fff;font-family:Sora,sans-serif;font-weight:700;font-size:1.05rem;text-align:center}
.pv-cap small{display:block;color:#c9c6de;font-weight:400;font-size:.78rem;margin-top:3px}
.pv-stage{max-width:min(880px,94vw);display:flex;align-items:center;justify-content:center}
.pv-stage img{max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,.6)}
.pv-nav{display:flex;gap:14px;align-items:center}
.pv-nav button{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);color:#fff;border-radius:10px;padding:9px 16px;font-family:Sora,sans-serif;font-weight:700;cursor:pointer}
.pv-dots{color:#c9c6de;font-size:.85rem;min-width:56px;text-align:center}
.pv-x{position:absolute;top:14px;right:20px;background:0;border:0;color:#fff;font-size:2rem;line-height:1;cursor:pointer;opacity:.8}`;
      document.head.appendChild(st);
    }
    let i=0;
    const ov=document.createElement("div"); ov.className="pv-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true");
    ov.innerHTML=`<button class="pv-x" aria-label="Close">&times;</button>
      <div class="pv-cap">${title} — a look inside<small>Actual template design · edit it to make it yours</small></div>
      <div class="pv-stage"><img alt="${title} preview"></div>
      <div class="pv-nav"><button class="pv-prev" aria-label="Previous">← Prev</button><span class="pv-dots"></span><button class="pv-next" aria-label="Next">Next →</button></div>`;
    document.body.appendChild(ov);
    const img=ov.querySelector("img"), dots=ov.querySelector(".pv-dots"), nav=ov.querySelector(".pv-nav");
    if(images.length<2) nav.style.display="none";
    const show=()=>{ img.src=images[i]; dots.textContent=`${i+1} / ${images.length}`; };
    const step=d=>{ i=(i+d+images.length)%images.length; show(); };
    const key=e=>{ if(e.key==="Escape")close(); else if(e.key==="ArrowRight")step(1); else if(e.key==="ArrowLeft")step(-1); };
    const close=()=>{ ov.remove(); document.removeEventListener("keydown",key); };
    ov.querySelector(".pv-x").addEventListener("click",close);
    ov.querySelector(".pv-prev").addEventListener("click",()=>step(-1));
    ov.querySelector(".pv-next").addEventListener("click",()=>step(1));
    ov.addEventListener("click",e=>{ if(e.target===ov)close(); });
    document.addEventListener("keydown",key);
    show();
  }

  /* ---------- homepage: honest live stats strip ---------- */
  function renderStats(){
    const host=$("#homeStats"); if(!host) return;
    const cell=(t,l)=>`<div class="stat"><b>${t}</b><span>${l}</span></div>`;
    const draw=(s)=>{
      const cells=[
        cell(s.templates||DDS.products.length, "premium templates"),
        cell((DDS.categories.length-1)||6, "categories"),
        cell("2 min", "to a pro result"),
        cell("Instant", "download delivery"),
      ];
      if(s.reviews && s.reviews.count>0)
        cells.splice(2,0,cell("★ "+s.reviews.avg, s.reviews.count+" verified review"+(s.reviews.count>1?"s":"")));
      host.innerHTML=cells.join("");
    };
    draw({templates:DDS.products.length});            // instant honest fallback from catalog
    const base=window.DDS_PAY||"";
    if(base) fetch(`${base}/stats`,{cache:"no-store"}).then(r=>r.json()).then(draw).catch(()=>{});
  }

  /* ---------- homepage: real reviews only (no fabricated social proof) ---------- */
  function homeReviews(){
    const host=$("#homeReviews"); if(!host) return;
    const head=host.querySelector("#hrHead"), list=host.querySelector("#hrList");
    const base=window.DDS_PAY||"";
    if(!base){ host.style.display="none"; return; }
    fetch(`${base}/reviews-all`,{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const revs=d.reviews||[], a=d.aggregate||{count:0};
      if(!revs.length){
        if(head) head.innerHTML=`<span class="eyebrow">Real reviews only</span><h2>Be one of our first reviews.</h2><p style="margin-inline:auto">We're a new shop and we show only genuine, verified buyer reviews — never fakes. Bought a template? Your honest review helps the next person decide.</p>`;
        if(list) list.innerHTML="";
        return;
      }
      if(head) head.innerHTML=`<span class="eyebrow">What buyers say</span><h2>Loved by real customers.</h2><p style="margin-inline:auto"><span style="color:#ffb020;letter-spacing:2px">${stars(a.avg)}</span> ${a.avg} average · ${a.count} verified review${a.count>1?"s":""}</p>`;
      if(list) list.innerHTML=revs.map(r=>`<div class="f-card" style="text-align:left"><div style="color:#ffb020;letter-spacing:2px">${stars(r.rating)}</div><p style="margin:8px 0 6px">${r.text}</p><div class="muted" style="font-size:.82rem">— ${r.name}${r.verified?' · <span style="color:#7CF0A6">✓ Verified purchase</span>':''}</div></div>`).join("");
    }).catch(()=>{ host.style.display="none"; });
  }

  /* ---------- AI support chatbot (grounded on real catalog) ---------- */
  function chatbot(){
    const base=window.DDS_PAY||""; if(!base || document.getElementById("ddChatBtn")) return;
    const css=document.createElement("style");
    css.textContent=`#ddChatBtn{position:fixed;bottom:22px;right:22px;z-index:9997;width:56px;height:56px;border-radius:50%;border:0;background:var(--brand,#7c5cff);color:#fff;font-size:1.5rem;cursor:pointer;box-shadow:0 10px 30px rgba(124,92,255,.5);transition:transform .15s}
#ddChatBtn:hover{transform:scale(1.07)}
.ddc-panel{position:fixed;bottom:88px;right:22px;z-index:9997;width:min(370px,calc(100vw - 32px));height:min(520px,72vh);background:var(--bg-2,#17142a);border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden}
.ddc-panel.open{display:flex}
.ddc-head{padding:15px 18px;background:linear-gradient(135deg,#7c5cff,#9d7bff);color:#fff}
.ddc-head b{font-family:Sora,sans-serif;font-size:1.05rem;display:block}
.ddc-head span{font-size:.78rem;opacity:.9}
.ddc-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.ddc-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:.9rem;line-height:1.45;white-space:pre-wrap}
.ddc-bot{background:rgba(255,255,255,.06);align-self:flex-start;border-bottom-left-radius:4px}
.ddc-user{background:var(--brand,#7c5cff);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.ddc-typing{font-size:.8rem;color:var(--ink-2,#a9a6c4);align-self:flex-start;padding:2px 4px}
.ddc-foot{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.1)}
.ddc-foot input{flex:1;padding:10px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit;font-size:.9rem}
.ddc-foot button{background:var(--brand,#7c5cff);color:#fff;border:0;border-radius:10px;padding:0 15px;cursor:pointer;font-size:1.1rem}`;
    document.head.appendChild(css);
    const btn=document.createElement("button");
    btn.id="ddChatBtn"; btn.setAttribute("aria-label","Chat with Daily Dash"); btn.innerHTML="💬";
    document.body.appendChild(btn);
    const panel=document.createElement("div");
    panel.className="ddc-panel"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Support chat");
    panel.innerHTML=`<div class="ddc-head"><b>Daily Dash Assistant</b><span>Instant answers · templates, orders &amp; help</span></div>
      <div class="ddc-body" id="ddcBody"></div>
      <div class="ddc-foot"><input id="ddcIn" placeholder="Ask about a template, pricing…" autocomplete="off"><button id="ddcSend" aria-label="Send">➤</button></div>`;
    document.body.appendChild(panel);
    const body=panel.querySelector("#ddcBody"), input=panel.querySelector("#ddcIn"), send=panel.querySelector("#ddcSend");
    const hist=[]; let greeted=false;
    const add=(text,who)=>{ const m=document.createElement("div"); m.className="ddc-msg ddc-"+who; m.textContent=text; body.appendChild(m); body.scrollTop=body.scrollHeight; };
    const toggle=()=>{ panel.classList.toggle("open");
      if(panel.classList.contains("open")){
        if(!greeted){ add("Hi! 👋 I can help you pick the right template, or answer anything about pricing, delivery and licensing. What are you looking for?","bot"); greeted=true; }
        input.focus();
      }};
    btn.addEventListener("click",toggle);
    const ask=async()=>{
      const q=(input.value||"").trim(); if(!q) return;
      input.value=""; add(q,"user"); hist.push({role:"user",text:q});
      const typing=document.createElement("div"); typing.className="ddc-typing"; typing.textContent="typing…";
      body.appendChild(typing); body.scrollTop=body.scrollHeight;
      try{
        const r=await fetch(`${base}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:hist})});
        const d=await r.json(); typing.remove();
        const reply=(d&&d.reply)||"Sorry, please email hellodailydashshop@gmail.com and a human will help.";
        add(reply,"bot"); hist.push({role:"assistant",text:reply});
      }catch(_){ typing.remove(); add("Connection issue — please try again, or email hellodailydashshop@gmail.com.","bot"); }
    };
    send.addEventListener("click",ask);
    input.addEventListener("keydown",e=>{ if(e.key==="Enter")ask(); });
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
  const CRYPTO_MIN = 19;   // NOWPayments account minimum (~$18.85) — crypto hidden below this
  function openPay(kind, ref, cardEndpoint, cryptoOk){
    const base = window.DDS_PAY || "";
    const isProduct = kind === "product";       // product = one-off; pack/access = server checkout
    if(cryptoOk===undefined) cryptoOk = true;   // packs/pass always clear the minimum
    if(!base && !isProduct){ location.href="/#join"; return; }   // pre-launch fallback
    if(!document.getElementById("payCss")){
      const st=document.createElement("style"); st.id="payCss";
      st.textContent=`.pay-ov{position:fixed;inset:0;background:rgba(10,8,20,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px}
.pay-box{background:var(--bg-2,#17142a);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:26px 24px;max-width:380px;width:100%;text-align:center;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.pay-box h3{font-family:Sora,sans-serif;font-size:1.35rem;margin:0 0 6px}
.pay-sub{color:var(--ink-2,#a9a6c4);font-size:.9rem;margin:0 0 16px}
.pay-email{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:inherit;font-size:1rem;margin-bottom:10px}
.pay-optin{display:flex;gap:8px;align-items:flex-start;text-align:left;font-size:.78rem;color:var(--ink-2,#a9a6c4);margin:0 2px 10px;cursor:pointer}
.pay-optin input{margin-top:3px;flex:none}
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
      <label class="pay-optin"><input type="checkbox" class="pay-decoded" checked style="flex:none;width:17px;height:17px;accent-color:var(--brand,#7c5cff);cursor:pointer;margin-top:1px"><span><b>Included:</b> <b>The Decoded</b> — a free daily AI &amp; tech briefing from our sister publication. Untick if you'd rather not.</span></label>
      <div class="pay-msg" aria-live="polite"></div>
      <button class="pay-btn pay-card">💳 Pay with card / UPI</button>
      ${cryptoOk?'<button class="pay-btn pay-crypto">🪙 Pay with crypto (USDC / USDT)</button>':'<p class="pay-fine" style="margin:10px 0 0">Crypto is available on orders over $'+CRYPTO_MIN+'.</p>'}
      <p class="pay-fine">Secure checkout · card via Razorpay${cryptoOk?' · crypto via NOWPayments':''}</p>
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
      if(valid(email)){                     // compulsory signup on purchase — grows the list (+ Decoded unless unticked)
        const dec=ov.querySelector(".pay-decoded");
        try{ fetch(window.DDS_CAPTURE||"https://dds.tryrealo.com/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({email,source:"purchase",decoded:!!(dec&&dec.checked)})}).catch(()=>{}); }catch(_){}
      }
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
    const cryptoBtn=ov.querySelector(".pay-crypto");
    if(cryptoBtn) cryptoBtn.addEventListener("click",()=>{
      go(`${base}/crypto-checkout?item=${encodeURIComponent(ref)}&email={email}`,true);
    });
    setTimeout(()=>em.focus(),50);
  }

  /* ---------- email capture ---------- */
  function capture(){
    $$("form[data-capture]").forEach(form=>{
      const msg = form.querySelector("[data-msg]") || form.parentElement.querySelector("[data-msg]");
      const show=(t,ok)=>{ if(!msg)return; msg.style.display="block"; msg.style.color=ok?"#7CF0A6":"#ff9a8a"; msg.textContent=t; };
      // Decoded brief is included with membership — ticked & locked; unsubscribe lives in every issue
      let dec=form.querySelector("[data-decoded]");
      if(!dec){
        const wrap=document.createElement("label");
        wrap.style.cssText="display:flex;gap:8px;align-items:flex-start;margin:10px 2px 0;font-size:.8rem;color:var(--ink-2,#a9a6c4);text-align:left";
        wrap.innerHTML=`<input type="checkbox" data-decoded checked style="margin-top:2px;flex:none;width:17px;height:17px;accent-color:#7c5cff;cursor:pointer">
          <span><b>Included:</b> <b>The Decoded</b> — a free daily AI &amp; tech briefing from our sister publication. Untick if you'd rather not.</span>`;
        form.appendChild(wrap);
        dec=wrap.querySelector("[data-decoded]");
      }
      form.addEventListener("submit", async e=>{
        e.preventDefault();
        const input=form.querySelector('input[type=email]');
        const email=(input.value||"").trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ show("Please enter a valid email.",false); return; }
        const btn=form.querySelector("button[type=submit]"); const old=btn&&btn.textContent;
        if(btn){btn.disabled=true;btn.textContent="Sending…";}
        try{
          const r=await fetch(CAPTURE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,source:location.pathname,decoded:!!(dec&&dec.checked)})});
          const d=await r.json().catch(()=>({}));
          if(!r.ok || !(d&&d.ok)) throw new Error("subscribe failed");
          const leads=JSON.parse(localStorage.getItem("dds_leads")||"[]");
          leads.push({email,t:Date.now()}); localStorage.setItem("dds_leads",JSON.stringify(leads));
          show("You're in! Check your inbox for the 20% code + free starter pack. 🎉",true);
          form.reset();
        }catch(_){ show("Hmm, that didn't go through — please try again in a moment.",false); }
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
    refTrack(); chrome(); skipTarget(); renderFeatured(); renderShop(); renderProduct(); renderStats(); homeReviews(); capture(); observe(); stickyCTA(); walletButtons(); chatbot(); consent();
  });
})();
