/* =========================================================
   DAILY DASH SHOP — product catalog (single source of truth)
   Marketplace-ready schema. Phase-2 flip = add `seller` accounts
   + checkout; every consumer already reads these fields.
========================================================= */
window.DDS = window.DDS || {};

DDS.categories = [
  { id:"all",       label:"All" },
  { id:"resumes",   label:"Resumes & CV" },
  { id:"planners",  label:"Planners" },
  { id:"business",  label:"Business Kits" },
  { id:"social",    label:"Social Media" },
];

DDS.products = [
  {
    id:"resume-executive",
    slug:"executive-resume-cv-pack",
    name:"Executive Resume & CV Pack",
    category:"resumes",
    seller:"dailydash",                 // marketplace-ready
    price:12, compareAt:29, currency:"USD",
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
    formats:["Canva","Word (.docx)","Google Docs","PDF guide"],
    delivery:"Instant download",
  },
  {
    id:"life-planner",
    slug:"ultimate-life-planner",
    name:"Ultimate Life & Goals Planner",
    category:"planners",
    seller:"dailydash",
    price:9, compareAt:24, currency:"USD",
    rating:4.8, reviews:0,
    badge:"New",
    image:"assets/img/life-planner.jpg",
    gallery:["assets/img/life-planner.jpg"],
    short:"A calm, all-in-one digital planner for goals, habits, budget and weekly focus — hyperlinked and print-ready.",
    highlights:[
      "Hyperlinked digital planner (GoodNotes / Notability)",
      "Goals, habits, budget, meal & weekly spreads",
      "Print-ready A4, A5 & US Letter",
      "Undated — reuse it every single year",
    ],
    formats:["PDF (hyperlinked)","Notion","Print-ready"],
    delivery:"Instant download",
  },
  {
    id:"freelancer-kit",
    slug:"freelancer-starter-kit",
    name:"Freelancer Starter Kit",
    category:"business",
    seller:"dailydash",
    price:15, compareAt:39, currency:"USD",
    rating:5.0, reviews:0,
    badge:"Pro pick",
    image:"assets/img/freelancer-kit.jpg",
    gallery:["assets/img/freelancer-kit.jpg"],
    short:"Everything to run a freelance business — invoice, proposal, contract, pricing sheet and client onboarding.",
    highlights:[
      "Invoice, proposal & contract templates",
      "Pricing calculator + client onboarding pack",
      "Editable branding in Canva & Google Sheets",
      "Lawyer-style plain-English contract wording",
    ],
    formats:["Canva","Google Sheets","Word","PDF"],
    delivery:"Instant download",
  },
  {
    id:"social-kit",
    slug:"instagram-content-kit",
    name:"Instagram Content Kit — 120 Templates",
    category:"social",
    seller:"dailydash",
    price:14, compareAt:34, currency:"USD",
    rating:4.9, reviews:0,
    badge:"Bundle", hot:true,
    image:"assets/img/social-kit.jpg",
    gallery:["assets/img/social-kit.jpg"],
    short:"120 scroll-stopping, editable Instagram post & story templates for creators and small brands.",
    highlights:[
      "120 editable post + story templates",
      "Carousels, quotes, promos, reels covers",
      "Drag-and-drop in Canva — no design skills",
      "Fully re-colourable to your brand",
    ],
    formats:["Canva"],
    delivery:"Instant download",
  },
];

DDS.storeLinks = {          // set real links when Etsy/Gumroad live; falls back to signup
  etsy:  "",
  gumroad:"",
};
