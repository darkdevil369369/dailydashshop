/* =========================================================
   DAILY DASH SHOP — product catalog (single source of truth)
   Marketplace-ready schema. Phase-2 flip = add `seller` accounts
   + checkout; every consumer already reads these fields.
========================================================= */
window.DDS = window.DDS || {};

DDS.categories = [
  { id:"all",       label:"All" },
  { id:"bundles",   label:"Bundles" },
  { id:"resumes",   label:"Resumes & CV" },
  { id:"planners",  label:"Planners" },
  { id:"business",  label:"Business Kits" },
  { id:"social",    label:"Social Media" },
];

DDS.products = [
  {
    id:"everything-bundle",
    slug:"everything-bundle",
    name:"The Everything Bundle — All 4 Packs",
    category:"bundles",
    seller:"dailydash",
    price:39, compareAt:61, currency:"USD",    // compareAt = honest sum of the 4 individual prices
    rating:5.0, reviews:0,
    badge:"Best value", hot:true,
    image:"assets/img/bundle.jpg",
    gallery:["assets/img/bundle.jpg"],
    short:"Every Daily Dash template in one pack — resume, planner, freelancer kit and Instagram templates. Worth $61, yours for $39.",
    highlights:[
      "All 4 premium packs in one download — worth $61 individually",
      "Executive Resume & CV Pack ($12)",
      "Ultimate Life & Goals Planner ($16)",
      "Freelancer Starter Kit ($19) + Instagram Kit ($14)",
      "Save $22 — our biggest deal, yours forever",
    ],
    formats:["Canva","Word","Google Docs","PDF","Notion"],
    delivery:"Instant download",
  },
  {
    id:"resume-executive",
    slug:"executive-resume-cv-pack",
    name:"Executive Resume & CV Pack",
    category:"resumes",
    seller:"dailydash",                 // marketplace-ready
    price:12, currency:"USD",
    rating:4.9, reviews:0,
    badge:"Bestseller", hot:true,
    image:"assets/img/resume-executive.jpg",
    gallery:["assets/img/resume-executive.jpg"],
    short:"Recruiter-approved, ATS-friendly resume + matching cover letter and references — fully editable in minutes.",
    highlights:[
      "3 modern layouts + matching cover letter",
      "ATS-friendly — passes applicant tracking systems",
      "Editable in Canva, Word & Google Docs",
      "Icon pack, colour presets & 1-page + 2-page versions",
    ],
    formats:["Word (.docx)","Google Docs","PDF"],
    delivery:"Instant download",
  },
  {
    id:"life-planner",
    slug:"ultimate-life-planner",
    name:"Ultimate Life & Goals Planner",
    category:"planners",
    seller:"dailydash",
    price:16, currency:"USD",
    rating:4.8, reviews:0,
    badge:"New",
    image:"assets/img/life-planner.jpg",
    gallery:["assets/img/life-planner.jpg"],
    short:"A calm, all-in-one digital planner for goals, habits, budget and weekly focus — hyperlinked and print-ready.",
    highlights:[
      "6 designed pages: goals, monthly, weekly, habit tracker & budget",
      "Undated — reuse it every single year",
      "Print-ready A4 PDF — print as many copies as you like",
      "Also works digitally in GoodNotes / Notability (stylus)",
    ],
    formats:["PDF (print-ready A4)"],
    delivery:"Instant download",
  },
  {
    id:"freelancer-kit",
    slug:"freelancer-starter-kit",
    name:"Freelancer Starter Kit",
    category:"business",
    seller:"dailydash",
    price:19, currency:"USD",
    rating:5.0, reviews:0,
    badge:"Pro pick",
    image:"assets/img/freelancer-kit.jpg",
    gallery:["assets/img/freelancer-kit.jpg"],
    short:"Everything to run a freelance business — invoice, proposal, contract, pricing sheet and client onboarding.",
    highlights:[
      "6 pro documents: proposal, agreement, NDA, invoice, pricing sheet & onboarding checklist",
      "Plain-English contract & NDA wording",
      "Fully editable in Word & Google Docs",
      "Print-ready invoice PDF included",
    ],
    formats:["Word (.docx)","Google Docs","PDF"],
    delivery:"Instant download",
  },
  {
    id:"social-kit",
    slug:"instagram-content-kit",
    name:"Instagram Content Kit — 14 Editable Templates",
    category:"social",
    seller:"dailydash",
    price:14, currency:"USD",
    rating:5.0, reviews:0,
    badge:"New", hot:true,
    image:"assets/img/social-kit.jpg",
    gallery:["assets/img/social-kit.jpg"],
    short:"14 editable Instagram templates — 8 feed posts + 6 stories — you make your own in minutes.",
    highlights:[
      "8 feed posts (1080×1080) + 6 stories (1080×1920)",
      "Editable in PowerPoint, Google Slides & Canva",
      "10 bonus ready-to-use backgrounds included",
      "Swap text & colours to match your brand",
    ],
    formats:["PowerPoint","Google Slides","Canva"],
    delivery:"Instant download",
  },
];

DDS.storeLinks = {          // set real links when Etsy/Gumroad live; falls back to signup
  etsy:  "",
  gumroad:"https://dailydash.gumroad.com",
};

// Per-product buy links — set to our Razorpay checkout at go-live (after KYC).
// Empty for now → buttons safely fall back to the "Get 20% off" signup until payment is live.
DDS.buyLinks = {
  "everything-bundle": "",
  "resume-executive":  "",
  "life-planner":      "",
  "freelancer-kit":    "",
  "social-kit":        "",
};
