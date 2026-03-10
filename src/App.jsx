import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ─────────────────────────────────────────────────────────
// Replace these two values with your own from:
// Supabase Dashboard → Settings → API
const SUPABASE_URL  = "https://ugxozcwzgsxmvztdcaph.supabase.co";
const SUPABASE_ANON = "sb_publishable_O3aIpRAKd5GYc68fKb7YRw_T9LYiflW";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "procuredesk-auth",
  }
});

/* ── Fonts & Reset ──────────────────────────────────────────────────────── */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; width: 100%; overflow: hidden; }
    body { font-family: 'Sora', sans-serif; background: #0a1628; color: #c8ddf0; }
    input, select, textarea, button { font-family: inherit; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #0a1628; }
    ::-webkit-scrollbar-thumb { background: #1e3350; border-radius: 99px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .fade-up { animation: fadeUp 0.3s ease both; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes slideOut { from { transform:translateX(0); } to { transform:translateX(-100%); } }

    /* ── Mobile bottom nav ── */
    .mobile-bottom-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: #07111f; border-top: 1px solid #162840;
      padding: 6px 0 env(safe-area-inset-bottom, 6px);
    }
    .mob-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 6px 4px; border-radius: 10px; cursor: pointer;
      flex: 1; min-width: 0; border: none; background: transparent;
      color: #3a5a78; font-family: inherit; transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .mob-nav-item.active { color: #0fb8a4; }
    .mob-nav-icon { font-size: 18px; line-height: 1; }
    .mob-nav-label { font-size: 9px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50px; }

    /* ── Sidebar overlay on mobile ── */
    .sidebar-overlay {
      display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      z-index: 150; backdrop-filter: blur(2px);
    }

    @media (max-width: 768px) {
      .desktop-sidebar { display: none !important; }
      .mobile-bottom-nav { display: flex !important; }
      .sidebar-overlay { display: block; }
      .main-content-area { padding: 14px 14px 80px !important; }
      .mobile-header {
        display: flex !important; position: sticky; top: 0; z-index: 100;
        background: #07111fee; backdrop-filter: blur(12px);
        border-bottom: 1px solid #162840; padding: 10px 14px;
        align-items: center; justify-content: space-between; gap: 10px;
        margin: -14px -14px 16px;
      }
    }
    @media (min-width: 769px) {
      .mobile-header { display: none !important; }
      .sidebar-overlay { display: none !important; }
    }

    /* ── Catalog card grid (landing) ── */
    .catalog-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
    }
    @media (max-width: 600px) {
      .catalog-card-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }

    /* ── Touch-friendly inputs on mobile ── */
    @media (max-width: 768px) {
      input, select, textarea { font-size: 16px !important; }
    }
  `}</style>
);

/* ── Design Tokens ──────────────────────────────────────────────────────── */
const T = {
  teal: "#0fb8a4",
  tealDim: "#0d9489",
  tealGlow: "rgba(15,184,164,0.18)",
  tealMuted: "rgba(15,184,164,0.08)",
  purple: "#7b5ea7",
  purpleGlow: "rgba(123,94,167,0.2)",
  amber: "#f5a623",
  red: "#e05c5c",
  green: "#3ecf8e",
  sidebar: "#07111f",
  sideHov: "#0d1e30",
  mainBg: "#0a1628",
  cardBg: "#0d1e30",
  cardBg2: "#0f2236",
  border: "#162840",
  border2: "#1c3250",
  t1: "#e2eff8",
  t2: "#7a9dba",
  t3: "#3a5a78",
  mono: "'JetBrains Mono', monospace",
};

/* ── Sample Data ────────────────────────────────────────────────────────── */
const INITIAL_PURCHASES = [
  { id:1, vendor:"FreshMart", item:"Rice (5kg)", qty:10, price:8.50, category:"Foods", date:"2025-02-10" },
  { id:2, vendor:"FreshMart", item:"Cooking Oil (2L)", qty:5, price:4.20, category:"Foods", date:"2025-02-11" },
  { id:3, vendor:"CleanCo", item:"Floor Cleaner", qty:8, price:3.75, category:"Cleaning", date:"2025-02-12" },
  { id:4, vendor:"DrinkHub", item:"Orange Juice (1L)", qty:12, price:2.90, category:"Beverages", date:"2025-02-13" },
  { id:5, vendor:"CleanCo", item:"Dish Soap", qty:6, price:2.10, category:"Cleaning", date:"2025-02-14" },
  { id:6, vendor:"DrinkHub", item:"Mineral Water (500ml)", qty:24, price:0.85, category:"Beverages", date:"2025-02-15" },
  { id:7, vendor:"OfficeWorld", item:"A4 Paper (Ream)", qty:10, price:5.60, category:"Stationery", date:"2025-02-16" },
  { id:8, vendor:"OfficeWorld", item:"Ballpoint Pens (Box)", qty:4, price:3.20, category:"Stationery", date:"2025-02-17" },
  { id:9, vendor:"FreshMart", item:"Sugar (2kg)", qty:8, price:2.40, category:"Foods", date:"2025-02-18" },
  { id:10, vendor:"DrinkHub", item:"Green Tea (Box)", qty:6, price:4.50, category:"Beverages", date:"2025-02-19" },
];

const INITIAL_VENDORS = [
  { id:1, name:"FreshMart", category:"Foods & Grocery", contact:"freshmart@example.com", phone:"+265 999 001", address:"Market Square, Lilongwe" },
  { id:2, name:"CleanCo", category:"Cleaning Supplies", contact:"cleanc@example.com", phone:"+265 999 002", address:"Industrial Area, Blantyre" },
  { id:3, name:"DrinkHub", category:"Beverages", contact:"hub@drinkh.com", phone:"+265 999 003", address:"City Mall, Lilongwe" },
  { id:4, name:"OfficeWorld", category:"Stationery", contact:"info@officeworld.mw", phone:"+265 999 004", address:"Area 3, Lilongwe" },
];

const CATEGORIES = ["Foods","Beverages","Cleaning","Stationery","Electronics","Other"];
const CAT_ICON = { Foods:"🍽️", Beverages:"🧃", Cleaning:"🧹", Stationery:"📎", Electronics:"⚡", Other:"📦" };
const COLORS = [T.teal, T.purple, T.amber, T.green, "#6366f1", "#f43f5e", "#fb923c"];

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmt = n => `Mwk ${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtK = n => n>=1000 ? `Mwk ${(n/1000).toFixed(1)}k` : `Mwk ${Number(n).toFixed(2)}`;
const today = () => new Date().toISOString().slice(0,10);
const uid = () => Date.now() + Math.random();
const capFirst = s => s.replace(/(^|\s)\S/g, c => c.toUpperCase());

/* ── Primitive UI ───────────────────────────────────────────────────────── */
function Card({ children, s={}, className="" }) {
  return <div className={className} style={{ background:T.cardBg, border:`1px solid ${T.border}`, borderRadius:16, padding:22, ...s }}>{children}</div>;
}

function Badge({ children, color=T.teal, s={} }) {
  return <span style={{ background:`${color}1a`, color, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600, border:`1px solid ${color}30`, whiteSpace:"nowrap", ...s }}>{children}</span>;
}

function Btn({ children, onClick, v="primary", s={}, disabled=false }) {
  const [h,setH]=useState(false);
  const base = { border:"none", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", transition:"all 0.15s", display:"inline-flex", alignItems:"center", gap:7, opacity:disabled?0.5:1, ...s };
  const vs = {
    primary:{ background:h&&!disabled?T.tealDim:T.teal, color:"#fff", boxShadow:h&&!disabled?`0 4px 20px ${T.tealGlow}`:"none" },
    ghost:{ background:h&&!disabled?"#0d1e30":"transparent", color:T.t2, border:`1px solid ${h?"#1c3250":"transparent"}` },
    outline:{ background:h&&!disabled?"#0d1e30":"transparent", color:T.t1, border:`1px solid ${T.border2}` },
    purple:{ background:h&&!disabled?"#6b4e97":T.purple, color:"#fff" },
    danger:{ background:h&&!disabled?"#c04040":T.red, color:"#fff" },
    amber:{ background:h&&!disabled?"#d4901e":T.amber, color:"#fff" },
  };
  return <button style={{...base,...(vs[v]||vs.primary)}} onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}

function Input({ label, value, onChange, type="text", placeholder="", s={}, onBlur, onFocus, readOnly }) {
  const [f,setF]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,...s}}>
      {label&&<label style={{fontSize:10,fontWeight:700,color:T.t2,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</label>}
      <input type={type} value={value} placeholder={placeholder} readOnly={readOnly}
        onChange={e=>onChange&&onChange(e.target.value)}
        onFocus={()=>{setF(true);onFocus&&onFocus();}}
        onBlur={()=>{setF(false);onBlur&&onBlur();}}
        style={{ background:"#070f1c", border:`1.5px solid ${f?T.teal:T.border}`, borderRadius:9, padding:"10px 13px", color:T.t1, fontSize:13, outline:"none", transition:"all 0.2s", boxShadow:f?`0 0 0 3px ${T.tealGlow}`:"none", width:"100%", cursor:readOnly?"default":"text" }}/>
    </div>
  );
}

function Select({ label, value, onChange, opts }) {
  const [f,setF]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:10,fontWeight:700,color:T.t2,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ background:"#070f1c", border:`1.5px solid ${f?T.teal:T.border}`, borderRadius:9, padding:"10px 13px", color:T.t1, fontSize:13, outline:"none", width:"100%", cursor:"pointer", boxShadow:f?`0 0 0 3px ${T.tealGlow}`:"none" }}>
        {opts.map(o=><option key={o} value={o} style={{background:"#070f1c"}}>{o}</option>)}
      </select>
    </div>
  );
}

function Th({ children, right }) {
  return <th style={{ padding:"10px 14px", textAlign:right?"right":"left", background:"#070f1c", color:T.t3, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{children}</th>;
}
function Td({ children, right, mono, bold, color }) {
  return <td style={{ padding:"10px 14px", textAlign:right?"right":"left", color:color||(bold?T.t1:T.t2), fontWeight:bold?600:400, fontFamily:mono?T.mono:undefined, fontSize:mono?12:13, borderBottom:`1px solid ${T.border}` }}>{children}</td>;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, width=500 }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="fade-up" style={{ background:T.cardBg, border:`1px solid ${T.border2}`, borderRadius:18, padding:28, width, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div style={{ fontSize:16, fontWeight:700, color:T.t1 }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.t3, cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Charts ─────────────────────────────────────────────────────────────── */
function Donut({ data, total, size=130 }) {
  const cx=size/2, cy=size/2, r=size*0.37, sw=size*0.13;
  const circ = 2*Math.PI*r;
  let off=0;
  const slices = data.map((d,i)=>{
    const pct = total>0 ? d.value/total : 0;
    const dash = pct*circ;
    const s = { off, dash, gap:circ-dash, color:COLORS[i%COLORS.length], label:d.label, pct };
    off+=dash; return s;
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:18}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0d1e30" strokeWidth={sw}/>
        {slices.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off}/>
        ))}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{fontSize:11,color:T.t2,flex:1}}>{s.label}</span>
            <span style={{fontSize:11,fontWeight:700,color:T.t1,fontFamily:T.mono}}>{(s.pct*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgBar({ label, value, max, color, sub }) {
  const pct = max>0?(value/max)*100:0;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:13,color:T.t1,fontWeight:500}}>{label}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {sub&&<span style={{fontSize:11,color:T.t3}}>{sub}</span>}
          <span style={{fontSize:12,fontWeight:700,color:T.t1,fontFamily:T.mono}}>{fmtK(value)}</span>
        </div>
      </div>
      <div style={{height:7,borderRadius:99,background:"#0a1628"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:99,transition:"width 0.8s ease"}}/>
      </div>
    </div>
  );
}

/* ── Nav Item ───────────────────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick, badge }) {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:9, cursor:"pointer",
        background: active?"#0d1e30":h?"#0a1828":"transparent",
        borderLeft:`2.5px solid ${active?T.teal:"transparent"}`,
        color: active?T.t1:T.t2, fontSize:13, fontWeight:active?600:400,
        transition:"all 0.15s", userSelect:"none", position:"relative" }}>
      <span style={{fontSize:15,flexShrink:0}}>{icon}</span>
      <span style={{flex:1}}>{label}</span>
      {badge&&<span style={{background:T.teal,color:"#fff",borderRadius:99,fontSize:10,fontWeight:700,padding:"1px 7px"}}>{badge}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: HOME / DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
function Home({ purchases, vendors, go, openNewPurchase, openAddVendor, profile }) {
  const total = purchases.reduce((s,p)=>s+p.qty*p.price, 0);
  const totalQty = purchases.reduce((s,p)=>s+p.qty, 0);
  const uniqueItems = new Set(purchases.map(p=>p.item)).size;

  const byVendor = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{ m[p.vendor]=(m[p.vendor]||0)+p.qty*p.price; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[purchases]);

  const byCategory = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{ m[p.category]=(m[p.category]||0)+p.qty*p.price; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value}));
  },[purchases]);

  const recentMonth = useMemo(()=>{
    const grouped={};
    purchases.forEach(p=>{
      const key=p.date.slice(0,7);
      grouped[key]=(grouped[key]||0)+p.qty*p.price;
    });
    return Object.entries(grouped).sort().slice(-6);
  },[purchases]);

  const maxMonth = Math.max(...recentMonth.map(r=>r[1]),1);

  return (
    <div className="fade-up">
      <div style={{marginBottom:26}}>
        <h1 style={{fontSize:20,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Home</h1>
        <p style={{fontSize:13,color:T.t2,marginTop:3}}>Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! Here's your dashboard.</p>
      </div>

      {/* Big metric cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
        {[
          { label:"Total Spend", value:fmt(total), sub:`${purchases.length} transactions`, color:T.teal, icon:"💰" },
          { label:"Vendors", value:vendors.length, sub:`${new Set(purchases.map(p=>p.vendor)).size} active`, color:T.purple, icon:"🏭" },
          { label:"Unique Items", value:uniqueItems, sub:`${totalQty} total units`, color:T.amber, icon:"📦" },
          { label:"Categories", value:byCategory.length, sub:"product groups", color:T.green, icon:"🗂️" },
        ].map(c=>(
          <Card key={c.label} s={{borderTop:`2.5px solid ${c.color}`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:14,right:16,fontSize:22,opacity:0.15}}>{c.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:c.color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{c.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:T.t1,fontFamily:T.mono,letterSpacing:"-0.03em",wordBreak:"break-all"}}>{c.value}</div>
            <div style={{fontSize:11,color:T.t3,marginTop:5}}>{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card s={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Quick Actions</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn onClick={openNewPurchase}>＋ New Purchase</Btn>
          <Btn v="outline" onClick={openAddVendor}>🏭 Add Vendor</Btn>
          <Btn v="outline" onClick={()=>go("catalog")}>📖 View Catalog</Btn>
          <Btn v="outline" onClick={()=>go("insights")}>📊 Insights</Btn>
          <Btn v="purple" onClick={()=>go("reports")}>📋 Generate Report</Btn>
        </div>
      </Card>

      {/* Bottom two-col */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Recent Purchases */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:T.t1}}>Recent Purchases</div>
            <Btn v="ghost" s={{fontSize:11,padding:"4px 10px"}} onClick={()=>go("purchases")}>View all →</Btn>
          </div>
          {purchases.length===0
            ? <div style={{textAlign:"center",padding:"32px 0",color:T.t3,fontSize:13}}>No purchases yet.</div>
            : <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><Th>Item</Th><Th>Vendor</Th><Th right>Amount</Th></tr></thead>
                <tbody>{purchases.slice(0,7).map(p=>(
                  <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <Td bold>{p.item}</Td>
                    <Td><Badge color={T.teal}>{p.vendor}</Badge></Td>
                    <Td right mono bold color={T.teal}>{fmtK(p.qty*p.price)}</Td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </Card>

        {/* Monthly Spending Overview */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:4}}>Monthly Spending Overview</div>
          <div style={{fontSize:11,color:T.t2,marginBottom:18}}>Spend trend by month</div>
          {recentMonth.length===0
            ? <div style={{textAlign:"center",padding:"32px 0",color:T.t3,fontSize:13}}>No data yet.</div>
            : <>
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,marginBottom:12}}>
                  {recentMonth.map(([month,val])=>(
                    <div key={month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{width:"100%",background:`linear-gradient(180deg,${T.teal},${T.tealDim})`,borderRadius:"5px 5px 0 0",height:`${(val/maxMonth)*90}px`,minHeight:4,transition:"height 0.7s ease"}}/>
                      <div style={{fontSize:9,color:T.t3,textAlign:"center"}}>{month.slice(5)}</div>
                    </div>
                  ))}
                </div>
                <div style={{paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                  <Donut data={byCategory} total={total} size={120}/>
                </div>
              </>
          }
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: PURCHASES
══════════════════════════════════════════════════════════════════════════ */
function Purchases({ purchases, setPurchases, vendors, modalOpen, setModalOpen, addPurchaseDB, deletePurchaseDB, addVendorDB, catalogItems=[] }) {
  const [search,    setSearch]   = useState("");
  const [groupBy,   setGroupBy]  = useState("none"); // "none" | vendor name
  const [collapsed, setCollapsed]= useState({});     // { vendorName: bool }
  const [form,         setForm]        = useState({ vendor:"", item:"", qty:"", price:"", category:"Foods", date:today() });
  const [sugs,         setSugs]        = useState([]);
  const [showSugs,     setShowSugs]    = useState(false);
  const [flash,        setFlash]       = useState("");
  const [vendorInput,  setVendorInput] = useState("");
  const [vendorSugs,   setVendorSugs]  = useState([]);
  const [showVSugs,    setShowVSugs]   = useState(false);
  const [vendorAdding, setVendorAdding]= useState(false);
  const [delId,     setDelId]    = useState(null);
  const [dupModal,  setDupModal] = useState(null); // { existing, newEntry }
  const [adding,    setAdding]   = useState(false);
  const [marketData, setMarketData] = useState([]); // global market prices for suggestions

  // Fetch market data once for global item suggestions
  useEffect(()=>{
    supabase.from("purchases").select("item,vendor,category,price,date").order("date",{ascending:false}).limit(2000)
      .then(({data})=>{ if(data) setMarketData(data.map(r=>({...r,price:Number(r.price)}))); });
  },[]);

  /* ── Build combined item→vendor price map from: user's purchases + catalog + market ── */
  const itemVendorMap = useMemo(()=>{
    const m={};
    const add = (item, vendor, price, category, date="") => {
      const k = item.toLowerCase().trim();
      if (!m[k]) m[k] = { item, category, vendors:{} };
      // keep latest price per vendor
      if (!m[k].vendors[vendor] || date > (m[k].vendors[vendor].date||"")) {
        m[k].vendors[vendor] = { price: Number(price), date, category };
      }
    };
    // Market data first (lowest priority — overridden by own data)
    marketData.forEach(p=>add(p.item, p.vendor, p.price, p.category, p.date));
    // User's catalog items
    catalogItems.forEach(c=>add(c.item, c.vendor, c.price, c.category, c.date||""));
    // User's own purchases (highest priority)
    purchases.forEach(p=>add(p.item, p.vendor, p.price, p.category, p.date));
    return m;
  },[purchases, catalogItems, marketData]);

  /* ── vendor list for group-by dropdown ── */
  const vendorNames = useMemo(()=>["none",...new Set(purchases.map(p=>p.vendor)).values()],[purchases]);

  /* ── vendors filtered by selected item ── */
  const filteredVendorsForItem = useMemo(()=>{
    if (!form.item.trim()) return vendors; // no item typed — show all vendors
    const itemKey = form.item.toLowerCase().trim();
    const entry = itemVendorMap[itemKey];
    if (!entry || Object.keys(entry.vendors).length === 0) return vendors; // unknown item — show all
    const knownVendorNames = Object.keys(entry.vendors);
    // Registered vendors who sell this item
    const matched = vendors.filter(v => knownVendorNames.includes(v.name));
    // Also include unregistered vendors from market data
    const registeredNames = new Set(vendors.map(v=>v.name));
    const extra = knownVendorNames
      .filter(n => !registeredNames.has(n))
      .map(n => ({ id:n, name:n, category:"", contact:"", phone:"", address:"", fromMarket:true }));
    return [...matched, ...extra];
  }, [form.item, vendors, itemVendorMap]);

  /* ── filtered rows ── */
  const filtered = useMemo(()=>{
    let rows = purchases;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(p=>
        p.item.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    // if groupBy is a specific vendor name, filter to that vendor only
    if (groupBy !== "none") rows = rows.filter(p=>p.vendor === groupBy);
    return rows;
  },[purchases, search, groupBy]);

  /* ── grouped structure ── */
  const groups = useMemo(()=>{
    if (groupBy === "none") return null;
    const map = {};
    filtered.forEach(p=>{
      if (!map[p.vendor]) map[p.vendor] = [];
      map[p.vendor].push(p);
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));
  },[filtered, groupBy]);

  const toggleCollapse = v => setCollapsed(c=>({...c,[v]:!c[v]}));

  /* ── vendor input handler — filters by selected item ── */
  const onVendorInput = v => {
    setVendorInput(v);
    setForm(f=>({...f, vendor:v, price:"" })); // clear price when vendor changes
    if (v.trim().length>0) {
      const q = v.toLowerCase();
      const matches = filteredVendorsForItem.filter(vn=>vn.name.toLowerCase().includes(q));
      setVendorSugs(matches);
      setShowVSugs(true);
    } else {
      // Show all filtered vendors when input is blank but focused
      setVendorSugs(filteredVendorsForItem);
      setShowVSugs(true);
    }
  };

  /* ── open vendor dropdown on focus ── */
  const onVendorFocus = () => {
    const q = vendorInput.toLowerCase();
    const matches = filteredVendorsForItem.filter(vn => !q || vn.name.toLowerCase().includes(q));
    setVendorSugs(matches);
    setShowVSugs(true);
  };

  const selectVendor = (name) => {
    setVendorInput(name);
    // Auto-fill price based on item+vendor from the combined map
    const itemKey = form.item.toLowerCase().trim();
    const entry = itemVendorMap[itemKey];
    const knownPrice = entry?.vendors?.[name]?.price;
    const knownCat = entry?.vendors?.[name]?.category;
    setForm(f=>({
      ...f,
      vendor: name,
      price: knownPrice !== undefined ? String(knownPrice) : f.price,
      category: knownCat || f.category,
    }));
    setShowVSugs(false);
  };

  const quickAddVendor = async () => {
    if (!vendorInput.trim()) return;
    setVendorAdding(true);
    const newVendor = { name: capFirst(vendorInput.trim()), category:"General", contact:"", phone:"", address:"" };
    if (addVendorDB) {
      await addVendorDB(newVendor);
    }
    setForm(f=>({...f, vendor:newVendor.name}));
    setVendorInput(newVendor.name);
    setShowVSugs(false);
    setVendorAdding(false);
  };

  /* ── item input handler ── */
  const onItem = v => {
    setForm(f=>({...f, item:capFirst(v), price:"" })); // clear price when item changes
    if (v.length>0) {
      const q = v.toLowerCase();
      // Suggestions from itemVendorMap (user purchases + catalog + market)
      const matches = Object.values(itemVendorMap).filter(h=>h.item.toLowerCase().includes(q));
      // Build suggestion list: each unique item with best known price
      const s = matches.map(h=>{
        const vendorEntries = Object.entries(h.vendors);
        // Prefer user's own vendor if selected
        const currentVendorEntry = form.vendor && h.vendors[form.vendor];
        const bestEntry = currentVendorEntry
          ? { vendor:form.vendor, ...currentVendorEntry }
          : vendorEntries.sort((a,b)=>b[1].date.localeCompare(a[1].date))[0]
            ? { vendor:vendorEntries[0][0], ...vendorEntries[0][1] }
            : null;
        return {
          item: h.item,
          category: h.category,
          price: bestEntry?.price || 0,
          vendor: bestEntry?.vendor || "",
          vendorCount: vendorEntries.length,
          fromMarket: !purchases.some(p=>p.item.toLowerCase()===h.item.toLowerCase()),
        };
      });
      setSugs(s); setShowSugs(s.length>0);
    } else {
      setShowSugs(false);
    }
    // Re-calculate price if vendor already selected
    if (form.vendor) {
      const itemKey = v.toLowerCase().trim();
      const entry = itemVendorMap[itemKey];
      const knownPrice = entry?.vendors[form.vendor]?.price;
      if (knownPrice !== undefined) {
        setForm(f=>({...f, item:capFirst(v), price:String(knownPrice)}));
      }
    }
  };

  // When suggestion selected
  const onSugSelect = (s) => {
    const currentVendor = form.vendor || s.vendor;
    const itemKey = s.item.toLowerCase().trim();
    const entry = itemVendorMap[itemKey];
    const knownPrice = entry?.vendors?.[currentVendor]?.price ?? s.price;
    const knownCat = entry?.vendors?.[currentVendor]?.category || s.category;
    setForm(f=>({...f, item:s.item, price:String(knownPrice), category:knownCat, vendor:currentVendor}));
    if (!form.vendor) setVendorInput(currentVendor);
    setShowSugs(false);
  };

  /* ── add purchase (optimistic + duplicate check) ── */
  const addPurchase = async () => {
    if (!form.vendor||!form.item||!form.qty||!form.price) { setFlash("error"); setTimeout(()=>setFlash(""),2000); return; }
    const p = { ...form, qty:+form.qty, price:+form.price };

    // Duplicate check: same item + same vendor + same date
    const dup = purchases.find(x =>
      x.item.toLowerCase() === p.item.toLowerCase() &&
      x.vendor.toLowerCase() === p.vendor.toLowerCase() &&
      x.date === p.date
    );
    if (dup) {
      setDupModal({ existing: dup, newEntry: p });
      return;
    }
    await doAddPurchase(p);
  };

  const doAddPurchase = async (p) => {
    setAdding(true);
    // Optimistic update — add immediately to UI
    const tempId = "temp-" + uid();
    const optimistic = { id: tempId, ...p };
    setPurchases(prev => [optimistic, ...prev]);
    setForm(f=>({ vendor:f.vendor, item:"", qty:"", price:"", category:f.category, date:today() }));
    setVendorInput(form.vendor);
    setFlash("success"); setTimeout(()=>setFlash(""),2000);
    setAdding(false);

    if (addPurchaseDB) {
      const err = await addPurchaseDB(p, tempId); // pass tempId so DB can replace optimistic
      if (err) {
        // Rollback optimistic on error
        setPurchases(prev => prev.filter(x => x.id !== tempId));
        setFlash("error"); setTimeout(()=>setFlash(""),3000);
      }
    }
  };

  const confirmDupAdd = async () => {
    const { newEntry } = dupModal;
    setDupModal(null);
    await doAddPurchase(newEntry);
  };

  const confirmDupMerge = async () => {
    const { existing, newEntry } = dupModal;
    setDupModal(null);
    const newQty = existing.qty + newEntry.qty;
    const merged = { ...existing, qty: newQty };
    // Optimistic update
    setPurchases(prev => prev.map(x => x.id === existing.id ? merged : x));
    setForm(f=>({ vendor:f.vendor, item:"", qty:"", price:"", category:f.category, date:today() }));
    setFlash("success"); setTimeout(()=>setFlash(""),2000);
    // Persist to DB
    await supabase.from("purchases").update({ qty: newQty }).eq("id", existing.id);
  };

  const deletePurchase = async (id) => {
    if (deletePurchaseDB) await deletePurchaseDB(id); // handles state update
    else setPurchases(p=>p.filter(x=>x.id!==id));
    setDelId(null);
  };

  /* ── vendor stats for group header ── */
  const vendorStats = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{
      if(!m[p.vendor]) m[p.vendor]={spend:0,items:new Set(),count:0};
      m[p.vendor].spend += p.qty*p.price;
      m[p.vendor].items.add(p.item);
      m[p.vendor].count++;
    });
    return m;
  },[purchases]);

  /* ── shared table body rows renderer ── */
  const PurchaseRow = ({ p }) => (
    <tr onMouseEnter={e=>e.currentTarget.style.background="#0f2236"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <Td><span style={{fontFamily:T.mono,fontSize:11}}>{p.date}</span></Td>
      <Td bold>{p.item}</Td>
      {groupBy==="none" && <Td><Badge color={T.teal}>{p.vendor}</Badge></Td>}
      <Td><Badge color={T.purple}>{p.category}</Badge></Td>
      <Td right mono>{p.qty}</Td>
      <Td right mono>{fmt(p.price)}</Td>
      <Td right mono bold color={T.teal}>{fmt(p.qty*p.price)}</Td>
      <td style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
        <Btn v="ghost" s={{padding:"4px 8px",fontSize:11}} onClick={()=>setDelId(p.id)}>🗑</Btn>
      </td>
    </tr>
  );

  const colCount = groupBy==="none" ? 8 : 7;

  return (
    <div className="fade-up">
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Purchases</h1>
        <p style={{fontSize:13,color:T.t2,marginTop:3}}>Full ledger of all procurement transactions</p>
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        {/* Search */}
        <div style={{flex:"1 1 220px",position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.t3,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search item, vendor, or category…"
            style={{ background:"#070f1c", border:`1.5px solid ${search?T.teal:T.border}`, borderRadius:10,
              padding:"10px 13px 10px 34px", color:T.t1, fontSize:13, outline:"none", width:"100%",
              transition:"border-color 0.2s",
              boxShadow: search ? `0 0 0 3px ${T.tealGlow}` : "none" }}
            onFocus={e=>{ e.target.style.borderColor=T.teal; e.target.style.boxShadow=`0 0 0 3px ${T.tealGlow}`; }}
            onBlur={e=>{ e.target.style.borderColor=search?T.teal:T.border; e.target.style.boxShadow=search?`0 0 0 3px ${T.tealGlow}`:"none"; }}/>
        </div>

        {/* Group-by dropdown */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <label style={{fontSize:11,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.09em",whiteSpace:"nowrap"}}>
            Group by
          </label>
          <select value={groupBy} onChange={e=>{ setGroupBy(e.target.value); setCollapsed({}); }}
            style={{ background:"#070f1c",
              border:`1.5px solid ${groupBy!=="none" ? T.teal : T.border}`,
              borderRadius:9, padding:"9px 13px", color: groupBy!=="none" ? T.teal : T.t1,
              fontSize:13, fontFamily:"inherit", fontWeight: groupBy!=="none"?600:400,
              outline:"none", cursor:"pointer", minWidth:160,
              boxShadow: groupBy!=="none" ? `0 0 0 3px ${T.tealGlow}` : "none",
              transition:"all 0.2s" }}>
            <option value="none" style={{background:"#070f1c",color:T.t1}}>No grouping</option>
            <optgroup label="── By Vendor ──" style={{color:T.t3}}>
              {vendorNames.filter(v=>v!=="none").map(v=>(
                <option key={v} value={v} style={{background:"#070f1c",color:T.t1}}>{v}</option>
              ))}
            </optgroup>
          </select>
          {groupBy!=="none" && (
            <Btn v="ghost" s={{padding:"7px 10px",fontSize:11}} onClick={()=>{ setGroupBy("none"); setCollapsed({}); }}>✕</Btn>
          )}
        </div>

        <Btn onClick={()=>setModalOpen(true)} s={{flexShrink:0}}>＋ New Purchase</Btn>
      </div>

      {/* Summary strip when a vendor is selected */}
      {groupBy !== "none" && vendorStats[groupBy] && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          {[
            { l:"Total Spend",   v:fmt(vendorStats[groupBy].spend),        c:T.teal   },
            { l:"Transactions",  v:vendorStats[groupBy].count,              c:T.purple },
            { l:"Unique Items",  v:vendorStats[groupBy].items.size,         c:T.amber  },
          ].map(x=>(
            <Card key={x.l} s={{padding:"12px 16px",borderTop:`2px solid ${x.c}`}}>
              <div style={{fontSize:10,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{x.l}</div>
              <div style={{fontSize:18,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ── FLAT TABLE (no grouping) ── */}
      {groupBy === "none" && (
        <Card s={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:T.t1}}>All Purchases</span>
            <Badge color={T.teal}>{filtered.length} records</Badge>
          </div>
          <div style={{overflowX:"auto",maxHeight:540,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead style={{position:"sticky",top:0,zIndex:2}}>
                <tr><Th>Date</Th><Th>Item</Th><Th>Vendor</Th><Th>Category</Th><Th right>Qty</Th><Th right>Unit Price</Th><Th right>Total</Th><Th></Th></tr>
              </thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={8} style={{padding:"40px",textAlign:"center",color:T.t3}}>No results found.</td></tr>
                  : filtered.map(p=><PurchaseRow key={p.id} p={p}/>)
                }
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── GROUPED VIEW ── */}
      {groupBy !== "none" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.length === 0 ? (
            <Card s={{textAlign:"center",padding:"48px",color:T.t3}}>No purchases found for <strong style={{color:T.t2}}>{groupBy}</strong>.</Card>
          ) : (
            <Card s={{padding:0,overflow:"hidden"}}>
              {/* Vendor header bar */}
              <div style={{
                padding:"14px 18px",
                background:`linear-gradient(90deg,${T.teal}12,transparent)`,
                borderBottom:`1px solid ${T.border}`,
                display:"flex", alignItems:"center", gap:14,
              }}>
                <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${T.teal},${T.purple})`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {groupBy[0]}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.t1}}>{groupBy}</div>
                  <div style={{fontSize:11,color:T.t2,marginTop:1}}>
                    {filtered.length} transaction{filtered.length!==1?"s":""}
                    &nbsp;·&nbsp;
                    {new Set(filtered.map(p=>p.item)).size} unique items
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:T.t3,marginBottom:2}}>Total Spend</div>
                  <div style={{fontSize:16,fontWeight:800,color:T.teal,fontFamily:T.mono}}>
                    {fmt(filtered.reduce((s,p)=>s+p.qty*p.price,0))}
                  </div>
                </div>
              </div>

              <div style={{overflowX:"auto",maxHeight:560,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead style={{position:"sticky",top:0,zIndex:2}}>
                    <tr><Th>Date</Th><Th>Item</Th><Th>Category</Th><Th right>Qty</Th><Th right>Unit Price</Th><Th right>Total</Th><Th></Th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(p=><PurchaseRow key={p.id} p={p}/>)}
                    {/* Subtotal row */}
                    <tr style={{background:"#070f1c"}}>
                      <td colSpan={5} style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:T.t2,fontSize:12}}>Subtotal</td>
                      <td style={{padding:"11px 14px",textAlign:"right",fontWeight:800,color:T.teal,fontFamily:T.mono,fontSize:14}}>
                        {fmt(filtered.reduce((s,p)=>s+p.qty*p.price,0))}
                      </td>
                      <td style={{padding:"11px 14px"}}/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* New Purchase Modal */}
      <Modal open={modalOpen} onClose={()=>{setModalOpen(false);setFlash("");setVendorInput("");setShowVSugs(false);}} title="New Purchase Entry" width={520}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* ── Item first so supplier can filter ── */}
          <div style={{position:"relative"}}>
            <Input label="Item" value={form.item} onChange={onItem} placeholder="e.g. Rice (5kg)"
              onBlur={()=>setTimeout(()=>setShowSugs(false),160)}/>
            {showSugs&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,background:T.cardBg,borderRadius:10,
                boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.border2}`,overflow:"hidden",marginTop:4}}>
                {sugs.map((s,i)=>(
                  <div key={i} onClick={()=>onSugSelect(s)}
                    style={{padding:"10px 14px",cursor:"pointer",fontSize:12,borderBottom:`1px solid ${T.border}`,
                      display:"flex",justifyContent:"space-between",alignItems:"center",color:T.t1}}
                    onMouseEnter={e=>e.currentTarget.style.background="#0f2236"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,marginBottom:2}}>{s.item}</div>
                      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                        <Badge color={T.purple} s={{fontSize:9}}>{s.category}</Badge>
                        {s.vendorCount > 1 && <span style={{fontSize:9,color:T.t3}}>{s.vendorCount} suppliers</span>}
                        {s.fromMarket && <Badge color={T.amber} s={{fontSize:9}}>🌍 market</Badge>}
                      </div>
                    </div>
                    <span style={{color:T.teal,fontWeight:700,fontFamily:T.mono,fontSize:11,flexShrink:0,marginLeft:8}}>{s.price>0?fmt(s.price):"–"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* ── Smart vendor combobox ── */}
            <div>
              <label style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>
                Supplier {form.item && filteredVendorsForItem.length < vendors.length && filteredVendorsForItem.length > 0
                  && <span style={{color:T.teal,fontWeight:400,textTransform:"none",letterSpacing:0}}>({filteredVendorsForItem.length} sell this item)</span>}
              </label>
              <div style={{position:"relative"}}>
                <input
                  value={vendorInput}
                  onChange={e=>onVendorInput(e.target.value)}
                  onFocus={onVendorFocus}
                  onBlur={()=>setTimeout(()=>setShowVSugs(false),180)}
                  placeholder={form.item ? `Suppliers for "${form.item}"…` : "Select or type supplier…"}
                  style={{background:"#070f1c",border:`1.5px solid ${form.vendor?T.teal:T.border}`,borderRadius:9,
                    padding:"10px 13px",color:T.t1,fontSize:13,outline:"none",width:"100%",transition:"all 0.2s"}}
                />
                {showVSugs && (
                  <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:60,
                    background:T.cardBg,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
                    border:`1px solid ${T.border2}`,overflow:"hidden",maxHeight:200,overflowY:"auto"}}>
                    {vendorSugs.length>0 ? vendorSugs.map(v=>(
                      <div key={v.id||v.name} onClick={()=>selectVendor(v.name)}
                        style={{padding:"10px 14px",cursor:"pointer",fontSize:13,borderBottom:`1px solid ${T.border}`,
                          display:"flex",alignItems:"center",gap:8,color:T.t1}}
                        onMouseEnter={e=>e.currentTarget.style.background="#0f2236"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{fontSize:16}}>{v.fromMarket?"🌍":"🏭"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600}}>{v.name}</div>
                          <div style={{fontSize:10,color:T.t3}}>{v.fromMarket?"Market supplier":v.category||""}</div>
                        </div>
                        {/* Show known price for this item+vendor */}
                        {form.item && itemVendorMap[form.item.toLowerCase().trim()]?.vendors?.[v.name] && (
                          <span style={{fontSize:11,color:T.teal,fontFamily:T.mono,fontWeight:700,flexShrink:0}}>
                            {fmt(itemVendorMap[form.item.toLowerCase().trim()].vendors[v.name].price)}
                          </span>
                        )}
                      </div>
                    )) : vendorInput.trim() ? (
                      <div style={{padding:"12px 14px"}}>
                        <div style={{fontSize:12,color:T.t3,marginBottom:10}}>
                          No vendor named <strong style={{color:T.t1}}>"{vendorInput}"</strong> found.
                        </div>
                        <button onClick={quickAddVendor} disabled={vendorAdding}
                          style={{border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,
                            background:`linear-gradient(135deg,${T.teal},${T.tealDim})`,color:"#fff",
                            cursor:vendorAdding?"not-allowed":"pointer",width:"100%",opacity:vendorAdding?0.7:1}}>
                          {vendorAdding?"Adding…":`＋ Add "${capFirst(vendorInput.trim())}" as new vendor`}
                        </button>
                        <div style={{fontSize:10,color:T.t3,marginTop:6,textAlign:"center"}}>
                          You can fill in contact details later from the Vendors tab
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <Input label="Date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Input label="Quantity" value={form.qty} onChange={v=>setForm(f=>({...f,qty:v}))} type="number" placeholder="0"/>
            <Input label="Unit Price (Mwk)" value={form.price} onChange={v=>setForm(f=>({...f,price:v}))} type="number" placeholder="0.00"/>
            <Select label="Category" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} opts={CATEGORIES}/>
          </div>
          {form.qty&&form.price&&(
            <div style={{padding:"10px 14px",background:"#070f1c",borderRadius:9,display:"flex",justifyContent:"space-between",fontSize:13}}>
              <span style={{color:T.t2}}>Line Total</span>
              <span style={{color:T.teal,fontWeight:700,fontFamily:T.mono}}>{fmt(+form.qty * +form.price)}</span>
            </div>
          )}
          {flash==="success"&&<div style={{padding:"10px 14px",background:`${T.teal}15`,borderRadius:9,fontSize:12,color:T.teal,border:`1px solid ${T.teal}30`}}>✓ Purchase logged successfully!</div>}
          {flash==="error"&&<div style={{padding:"10px 14px",background:`${T.red}15`,borderRadius:9,fontSize:12,color:T.red,border:`1px solid ${T.red}30`}}>⚠ Please fill all required fields.</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn v="outline" onClick={()=>setModalOpen(false)}>Cancel</Btn>
            <Btn onClick={addPurchase}>＋ Add Purchase</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Confirm Delete" width={400}>
        <p style={{color:T.t2,fontSize:14,marginBottom:20}}>Are you sure you want to delete this purchase? This action cannot be undone.</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="outline" onClick={()=>setDelId(null)}>Cancel</Btn>
          <Btn v="danger" onClick={()=>deletePurchase(delId)}>Delete</Btn>
        </div>
      </Modal>

      {/* Duplicate entry modal */}
      <Modal open={!!dupModal} onClose={()=>setDupModal(null)} title="⚠ Duplicate Entry Detected" width={480}>
        {dupModal && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{padding:"14px 16px",background:`${T.amber}12`,borderRadius:10,border:`1px solid ${T.amber}30`}}>
              <div style={{fontSize:13,fontWeight:600,color:T.amber,marginBottom:8}}>An entry already exists for this item on this date</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12,color:T.t2}}>
                <div><span style={{color:T.t3}}>Item:</span> <strong style={{color:T.t1}}>{dupModal.existing.item}</strong></div>
                <div><span style={{color:T.t3}}>Vendor:</span> <strong style={{color:T.t1}}>{dupModal.existing.vendor}</strong></div>
                <div><span style={{color:T.t3}}>Date:</span> <strong style={{color:T.t1}}>{dupModal.existing.date}</strong></div>
                <div><span style={{color:T.t3}}>Existing qty:</span> <strong style={{color:T.teal}}>{dupModal.existing.qty}</strong></div>
              </div>
            </div>
            <div style={{padding:"12px 14px",background:"#070f1c",borderRadius:10,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:12,color:T.t3,marginBottom:6}}>New entry you're adding:</div>
              <div style={{display:"flex",gap:16,fontSize:12,color:T.t2}}>
                <div><span style={{color:T.t3}}>Qty:</span> <strong style={{color:T.teal}}>{dupModal.newEntry.qty}</strong></div>
                <div><span style={{color:T.t3}}>Price:</span> <strong style={{color:T.teal}}>{fmt(dupModal.newEntry.price)}</strong></div>
                <div><span style={{color:T.t3}}>Merged qty would be:</span> <strong style={{color:T.green}}>{dupModal.existing.qty + dupModal.newEntry.qty}</strong></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
              <Btn v="outline" onClick={()=>setDupModal(null)}>Cancel</Btn>
              <Btn v="amber" onClick={confirmDupMerge}>🔀 Merge — Update Qty to {dupModal.existing.qty + dupModal.newEntry.qty}</Btn>
              <Btn onClick={confirmDupAdd}>＋ Add as Separate Entry</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: VENDORS  (enhanced — card grid + list toggle, rich filters)
══════════════════════════════════════════════════════════════════════════ */
function Vendors({ vendors, setVendors, purchases, setPurchases, triggerAdd, clearTriggerAdd, addVendorDB, deleteVendorDB, updateVendorDB, savedFilters={}, onFiltersChange }) {
  const [selected,   setSelected]  = useState(null);
  const [editOpen,   setEditOpen]  = useState(false);
  const [editForm,   setEditForm]  = useState({});
  const [editSaving, setEditSaving]= useState(false);
  const [editRowId,  setEditRowId] = useState(null);   // inline row edit
  const [editRow,    setEditRow]   = useState({});
  const [showAdd,    setShowAdd]   = useState(false);
  const [delVId,     setDelVId]    = useState(null);
  const [delPId,     setDelPId]    = useState(null);
  const [searchDir,  setSearchDir] = useState(savedFilters.search||"");
  const [filterCat,  setFilterCat] = useState(savedFilters.cat||"All");
  const [sortBy,     setSortBy]    = useState(savedFilters.sort||"name");
  const [viewMode,   setViewMode]  = useState(savedFilters.view||"grid");

  // Sync from parent when savedFilters loads async (only once)
  const filtersLoaded = useRef(false);
  useEffect(()=>{
    if (!filtersLoaded.current && savedFilters && (savedFilters.search||savedFilters.cat!=="All"||savedFilters.sort!=="name"||savedFilters.view!=="grid")) {
      filtersLoaded.current = true;
      setSearchDir(savedFilters.search||"");
      setFilterCat(savedFilters.cat||"All");
      setSortBy(savedFilters.sort||"name");
      setViewMode(savedFilters.view||"grid");
    }
  },[savedFilters]);

  // Persist filter changes with a ref to always have latest values
  const filtersRef = useRef({search:searchDir, cat:filterCat, sort:sortBy, view:viewMode});
  const persistFilters = useCallback((updates) => {
    const next = { ...filtersRef.current, ...updates };
    filtersRef.current = next;
    onFiltersChange && onFiltersChange(next);
  }, [onFiltersChange]);

  const changeSearch  = v => { setSearchDir(v);  persistFilters({search:v}); };
  const changeCat     = v => { setFilterCat(v);  persistFilters({cat:v}); };
  const changeSort    = v => { setSortBy(v);      persistFilters({sort:v}); };
  const changeView    = v => { setViewMode(v);    persistFilters({view:v}); };
  const [histSearch, setHistSearch]= useState("");
  const [form, setForm] = useState({ name:"", category:"Foods & Grocery", contact:"", phone:"", address:"" });
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    if (triggerAdd) { setShowAdd(true); setFormErr(""); clearTriggerAdd && clearTriggerAdd(); }
  }, [triggerAdd]);

  const stats = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{
      if(!m[p.vendor]) m[p.vendor]={ spend:0, items:new Set(), orders:0, lastDate:"" };
      m[p.vendor].spend  += p.qty*p.price;
      m[p.vendor].items.add(p.item);
      m[p.vendor].orders += 1;
      if (p.date > m[p.vendor].lastDate) m[p.vendor].lastDate = p.date;
    });
    return m;
  },[purchases]);

  const grandTotal = Object.values(stats).reduce((s,v)=>s+v.spend, 0);
  const catOpts = useMemo(()=>["All", ...new Set(vendors.map(v=>v.category))],[vendors]);

  const CAT_COLORS = {
    "Foods & Grocery":T.teal, "Beverages":"#6366f1", "Cleaning Supplies":T.purple,
    "Stationery":T.amber, "Electronics":T.green, "Other":T.t2,
  };

  const visibleVendors = useMemo(()=>{
    let list = [...vendors];
    if (searchDir.trim()) {
      const q = searchDir.toLowerCase();
      list = list.filter(v=> v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || (v.contact||"").toLowerCase().includes(q));
    }
    if (filterCat !== "All") list = list.filter(v=>v.category===filterCat);
    list.sort((a,b)=>{
      const sa = stats[a.name]||{spend:0,orders:0};
      const sb = stats[b.name]||{spend:0,orders:0};
      if (sortBy==="spend")  return sb.spend  - sa.spend;
      if (sortBy==="orders") return sb.orders - sa.orders;
      return a.name.localeCompare(b.name);
    });
    return list;
  },[vendors, searchDir, filterCat, sortBy, stats]);

  const addVendor = async () => {
    if (!form.name.trim()) { setFormErr("Vendor name is required."); return; }
    if (vendors.find(v=>v.name.toLowerCase()===form.name.toLowerCase())) { setFormErr("A vendor with this name already exists."); return; }
    if (addVendorDB) {
      const err = await addVendorDB(form);
      if (err) { setFormErr(err.message||"Error saving vendor."); return; }
    } else {
      setVendors(v=>[...v,{ id:uid(), ...form }]);
    }
    setForm({ name:"", category:"Foods & Grocery", contact:"", phone:"", address:"" });
    setFormErr(""); setShowAdd(false);
  };

  const deleteVendor = async (id) => {
    if (deleteVendorDB) await deleteVendorDB(id);
    else setVendors(v=>v.filter(x=>x.id!==id));
    if (selected?.id===id) setSelected(null);
    setDelVId(null);
  };

  const openEdit = (v) => {
    setEditForm({ name:v.name, category:v.category||"General", contact:v.contact||"", phone:v.phone||"", address:v.address||"" });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm.name?.trim()) return;
    setEditSaving(true);
    const updated = { ...selected, ...editForm, name: capFirst(editForm.name.trim()) };
    if (updateVendorDB) await updateVendorDB(selected.id, editForm);
    else setVendors(prev=>prev.map(v=>v.id===selected.id?updated:v));
    setSelected(updated);
    setEditOpen(false);
    setEditSaving(false);
  };

  const startRowEdit = (v) => {
    setEditRowId(v.id);
    setEditRow({ name:v.name, category:v.category||"General", contact:v.contact||"", phone:v.phone||"", address:v.address||"" });
  };

  const cancelRowEdit = () => { setEditRowId(null); setEditRow({}); };

  const saveRowEdit = async (id) => {
    if (!editRow.name?.trim()) return;
    setEditSaving(true);
    const updates = { ...editRow, name: capFirst(editRow.name.trim()) };
    if (updateVendorDB) await updateVendorDB(id, updates);
    else setVendors(prev=>prev.map(v=>v.id===id?{...v,...updates}:v));
    if (selected?.id===id) setSelected(prev=>({...prev,...updates}));
    setEditRowId(null);
    setEditRow({});
    setEditSaving(false);
  };

  /* ── DETAIL VIEW ── */
  if (selected) {
    const vs = stats[selected.name] || { spend:0, items:new Set(), orders:0, lastDate:"—" };
    const rawHistory = purchases.filter(p=>p.vendor===selected.name);
    const vendorPurchases = histSearch.trim()
      ? rawHistory.filter(p=> p.item.toLowerCase().includes(histSearch.toLowerCase()) || p.category.toLowerCase().includes(histSearch.toLowerCase()))
      : rawHistory;
    const histTotal = rawHistory.reduce((s,p)=>s+p.qty*p.price, 0);
    const share = grandTotal>0 ? (vs.spend/grandTotal)*100 : 0;
    const initials = selected.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const catColor = CAT_COLORS[selected.category] || T.teal;

    return (
      <div className="fade-up">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
          <Btn v="ghost" s={{padding:"7px 12px",fontSize:12}} onClick={()=>{ setSelected(null); setHistSearch(""); }}>← Vendors</Btn>
          <span style={{color:T.t3,fontSize:14}}>/</span>
          <span style={{fontSize:14,fontWeight:700,color:T.t1}}>{selected.name}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <Btn v="ghost" s={{fontSize:12,padding:"7px 14px"}} onClick={()=>openEdit(selected)}>✏️ Edit Details</Btn>
            <Btn v="danger" s={{fontSize:12,padding:"7px 14px"}} onClick={()=>setDelVId(selected.id)}>🗑 Delete</Btn>
          </div>
        </div>
        <Card s={{marginBottom:16,padding:"20px 24px",background:`linear-gradient(135deg,#0d1e30,#0f2840)`,borderTop:`3px solid ${catColor}`}}>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div style={{width:58,height:58,borderRadius:16,background:`linear-gradient(135deg,${catColor},${T.purple})`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",flexShrink:0}}>{initials}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:20,fontWeight:800,color:T.t1,letterSpacing:"-0.01em"}}>{selected.name}</div>
              <div style={{display:"flex",gap:10,marginTop:5,flexWrap:"wrap"}}>
                <Badge color={catColor}>{selected.category}</Badge>
                {selected.address && <Badge color={T.t3}>📍 {selected.address}</Badge>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,auto)",gap:"0 28px",textAlign:"right"}}>
              {[{l:"Budget Share",v:`${share.toFixed(1)}%`,c:T.teal},{l:"Orders",v:vs.orders,c:T.purple},{l:"Last Order",v:vs.lastDate||"—",c:T.t2}].map(x=>(
                <div key={x.l}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{x.l}</div>
                  <div style={{fontSize:15,fontWeight:800,color:x.c,fontFamily:T.mono}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:16}}>
          {[{l:"Total Spend",v:fmt(vs.spend),c:T.teal},{l:"Unique Items",v:vs.items?.size||0,c:T.purple},{l:"Transactions",v:vs.orders||0,c:T.amber},{l:"Avg. Order",v:fmt(vs.orders?vs.spend/vs.orders:0),c:T.green}].map(x=>(
            <Card key={x.l} s={{borderTop:`2px solid ${x.c}`,padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{x.l}</div>
              <div style={{fontSize:19,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Contact Details</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[
                {icon:"📧",label:"Email",val:selected.contact,href:selected.contact?`mailto:${selected.contact}`:null},
                {icon:"📞",label:"Phone",val:selected.phone,href:selected.phone?`tel:${selected.phone}`:null},
                {icon:"📍",label:"Address",val:selected.address,href:null},
                {icon:"🗂️",label:"Category",val:selected.category,href:null},
              ].map(({icon,label,val,href})=>(
                <div key={label} style={{paddingBottom:12,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>{icon} {label}</div>
                  {href ? (
                    <a href={href} style={{fontSize:13,color:T.teal,wordBreak:"break-all",textDecoration:"none",borderBottom:`1px dashed ${T.teal}55`,paddingBottom:1}}
                      onMouseEnter={e=>e.currentTarget.style.color=T.tealDim} onMouseLeave={e=>e.currentTarget.style.color=T.teal}>{val} ↗</a>
                  ) : (
                    <div style={{fontSize:13,color:val?T.t2:T.t3,wordBreak:"break-all"}}>{val||"—"}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{marginTop:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:T.t3}}>Budget share</span>
                <span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:T.mono}}>{share.toFixed(1)}%</span>
              </div>
              <div style={{height:6,borderRadius:99,background:"#0a1628"}}>
                <div style={{height:"100%",width:`${share}%`,background:`linear-gradient(90deg,${T.teal},${T.purple})`,borderRadius:99,transition:"width 0.8s ease"}}/>
              </div>
            </div>
          </Card>
          <Card s={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.t1}}>Purchase History</div>
                <div style={{fontSize:11,color:T.t2,marginTop:1}}>{rawHistory.length} transaction{rawHistory.length!==1?"s":""} · <span style={{color:T.teal,fontFamily:T.mono}}>{fmt(histTotal)}</span> total</div>
              </div>
              <div style={{position:"relative",flex:"0 0 200px"}}>
                <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.t3,pointerEvents:"none"}}>🔍</span>
                <input value={histSearch} onChange={e=>setHistSearch(e.target.value)} placeholder="Filter items…"
                  style={{background:"#070f1c",border:`1.5px solid ${histSearch?T.teal:T.border}`,borderRadius:8,padding:"7px 10px 7px 28px",color:T.t1,fontSize:12,outline:"none",width:"100%"}}
                  onFocus={e=>e.target.style.borderColor=T.teal} onBlur={e=>e.target.style.borderColor=histSearch?T.teal:T.border}/>
              </div>
            </div>
            <div style={{overflowY:"auto",maxHeight:400}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead style={{position:"sticky",top:0,zIndex:2}}>
                  <tr><Th>Date</Th><Th>Item</Th><Th>Category</Th><Th right>Qty</Th><Th right>Unit Price</Th><Th right>Total</Th><Th></Th></tr>
                </thead>
                <tbody>
                  {vendorPurchases.length===0 ? (
                    <tr><td colSpan={7} style={{padding:"36px",textAlign:"center",color:T.t3}}>{histSearch?"No items match.":"No purchases yet."}</td></tr>
                  ) : vendorPurchases.map(p=>(
                    <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <Td><span style={{fontFamily:T.mono,fontSize:11}}>{p.date}</span></Td>
                      <Td bold>{p.item}</Td>
                      <Td><Badge color={T.purple}>{p.category}</Badge></Td>
                      <Td right mono>{p.qty}</Td>
                      <Td right mono>{fmt(p.price)}</Td>
                      <Td right mono bold color={T.teal}>{fmt(p.qty*p.price)}</Td>
                      <td style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
                        <Btn v="ghost" s={{padding:"4px 8px",fontSize:11}} onClick={()=>setDelPId(p.id)}>🗑</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {vendorPurchases.length>1&&(
                  <tfoot><tr style={{background:"#070f1c"}}>
                    <td colSpan={5} style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:T.t2,fontSize:12}}>{histSearch?"Filtered subtotal":"Total"}</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:T.teal,fontFamily:T.mono,fontSize:14}}>{fmt(vendorPurchases.reduce((s,p)=>s+p.qty*p.price,0))}</td>
                    <td style={{padding:"10px 14px"}}/>
                  </tr></tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>
        <Modal open={!!delVId} onClose={()=>setDelVId(null)} title="Delete Vendor" width={420}>
          <div style={{padding:"14px 16px",background:`${T.red}12`,borderRadius:10,border:`1px solid ${T.red}25`,marginBottom:18}}>
            <div style={{fontSize:13,fontWeight:600,color:T.red,marginBottom:4}}>⚠ This cannot be undone</div>
            <div style={{fontSize:12,color:T.t2}}>Deleting <strong style={{color:T.t1}}>{vendors.find(v=>v.id===delVId)?.name||"this vendor"}</strong> removes them from your directory. Purchase records will remain.</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn v="outline" onClick={()=>setDelVId(null)}>Cancel</Btn>
            <Btn v="danger" onClick={()=>deleteVendor(delVId)}>Delete Vendor</Btn>
          </div>
        </Modal>
        <Modal open={!!delPId} onClose={()=>setDelPId(null)} title="Delete Purchase Record" width={400}>
          <p style={{color:T.t2,fontSize:13,marginBottom:20}}>This will permanently remove this transaction from the ledger.</p>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn v="outline" onClick={()=>setDelPId(null)}>Cancel</Btn>
            <Btn v="danger" onClick={()=>{ setPurchases(p=>p.filter(x=>x.id!==delPId)); setDelPId(null); }}>Delete Record</Btn>
          </div>
        </Modal>
      </div>
    );
  }

  /* ── DIRECTORY VIEW ── */
  const hasFilters = searchDir || filterCat!=="All";

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Vendors</h1>
          <p style={{fontSize:13,color:T.t2,marginTop:3}}>Supplier directory — {vendors.length} registered partner{vendors.length!==1?"s":""}</p>
        </div>
        <Btn onClick={()=>{ setShowAdd(true); setFormErr(""); }}>＋ Add Vendor</Btn>
      </div>

      {/* ── Toolbar ── */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {/* Search */}
        <div style={{flex:"1 1 200px",position:"relative"}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.t3,pointerEvents:"none"}}>🔍</span>
          <input value={searchDir} onChange={e=>changeSearch(e.target.value)} placeholder="Search name, category, email…"
            style={{background:"#070f1c",border:`1.5px solid ${searchDir?T.teal:T.border}`,borderRadius:9,
              padding:"10px 12px 10px 32px",color:T.t1,fontSize:13,outline:"none",width:"100%",transition:"all 0.2s",
              boxShadow:searchDir?`0 0 0 3px ${T.tealGlow}`:"none"}}
            onFocus={e=>{e.target.style.borderColor=T.teal;e.target.style.boxShadow=`0 0 0 3px ${T.tealGlow}`;}}
            onBlur={e=>{e.target.style.borderColor=searchDir?T.teal:T.border;e.target.style.boxShadow=searchDir?`0 0 0 3px ${T.tealGlow}`:"none";}}/>
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e=>changeSort(e.target.value)}
          style={{background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:9,padding:"10px 12px",
            color:T.t1,fontSize:13,outline:"none",cursor:"pointer",flexShrink:0}}>
          <option value="name"   style={{background:"#070f1c"}}>Sort: A–Z</option>
          <option value="spend"  style={{background:"#070f1c"}}>Sort: Top Spend</option>
          <option value="orders" style={{background:"#070f1c"}}>Sort: Most Orders</option>
        </select>

        {/* View toggle */}
        <div style={{display:"flex",background:"#070f1c",border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden",flexShrink:0}}>
          {[["grid","⊞"],["list","☰"]].map(([m,icon])=>(
            <button key={m} onClick={()=>changeView(m)}
              style={{border:"none",padding:"9px 14px",fontSize:15,cursor:"pointer",transition:"all 0.15s",
                background:viewMode===m?T.teal:"transparent",color:viewMode===m?"#fff":T.t3}}>
              {icon}
            </button>
          ))}
        </div>

        {hasFilters && <Btn v="ghost" onClick={()=>{changeSearch("");changeCat("All");}}>✕ Clear</Btn>}
        <Badge color={T.teal} s={{fontSize:12,padding:"6px 12px",flexShrink:0}}>{visibleVendors.length} result{visibleVendors.length!==1?"s":""}</Badge>
      </div>

      {/* Category pill filters */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {catOpts.map(cat=>{
          const active = filterCat===cat;
          const color  = CAT_COLORS[cat]||T.teal;
          const count  = cat==="All" ? vendors.length : vendors.filter(v=>v.category===cat).length;
          return (
            <button key={cat} onClick={()=>changeCat(cat)}
              style={{border:`1.5px solid ${active?color:T.border}`,borderRadius:99,padding:"5px 14px",fontSize:12,
                fontWeight:600,background:active?`${color}18`:"transparent",color:active?color:T.t3,
                cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
              {cat}
              <span style={{background:active?`${color}30`:"#0d1e30",borderRadius:99,padding:"1px 6px",fontSize:10,fontFamily:T.mono}}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode==="grid" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {visibleVendors.map(v=>{
            const vs = stats[v.name]||{spend:0,items:new Set(),orders:0};
            const share = grandTotal>0?(vs.spend/grandTotal)*100:0;
            const catColor = CAT_COLORS[v.category]||T.teal;
            return (
              <div key={v.id} onClick={()=>setSelected(v)}
                style={{background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:16,padding:20,
                  cursor:"pointer",transition:"all 0.18s",borderTop:`3px solid ${catColor}44`,position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.cardBg2;e.currentTarget.style.borderColor=catColor+"66";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${catColor}18`;const btn=e.currentTarget.querySelector(".vedit-btn");if(btn)btn.style.opacity="1";}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.cardBg;e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";const btn=e.currentTarget.querySelector(".vedit-btn");if(btn)btn.style.opacity="0";}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${catColor},${T.purple})`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {v.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:T.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.name}</div>
                    <Badge color={catColor} s={{fontSize:10,marginTop:3,display:"inline-block"}}>{v.category}</Badge>
                {/* Hover edit button */}
                <button className="vedit-btn" onClick={e=>{ e.stopPropagation(); setSelected(v); openEdit(v); }}
                  style={{position:"absolute",top:10,right:10,border:`1px solid ${T.border}`,borderRadius:7,
                    padding:"4px 8px",fontSize:11,background:T.cardBg,color:T.t2,cursor:"pointer",
                    opacity:0,transition:"opacity 0.15s"}}>✏️</button>
                  </div>
                  <span style={{fontSize:11,color:T.t3,flexShrink:0}}>→</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                  {[{l:"Spend",v:fmtK(vs.spend)},{l:"Orders",v:vs.orders||0},{l:"Items",v:vs.items?.size||0}].map(x=>(
                    <div key={x.l} style={{background:"#070f1c",borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:9,color:T.t3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{x.l}</div>
                      <div style={{fontSize:13,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:10,color:T.t3}}>Budget share</span>
                    <span style={{fontSize:10,fontWeight:700,color:catColor,fontFamily:T.mono}}>{share.toFixed(1)}%</span>
                  </div>
                  <div style={{height:4,borderRadius:99,background:"#0a1628"}}>
                    <div style={{height:"100%",width:`${share}%`,background:`linear-gradient(90deg,${catColor},${T.purple})`,borderRadius:99,transition:"width 0.7s ease"}}/>
                  </div>
                </div>
                {(v.contact||v.phone) && (
                  <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:"flex",gap:14,fontSize:11,flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                    {v.contact && <a href={`mailto:${v.contact}`} style={{color:T.teal,textDecoration:"none"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>📧 {v.contact}</a>}
                    {v.phone   && <a href={`tel:${v.phone}`}    style={{color:T.purple,textDecoration:"none"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>📞 {v.phone}</a>}
                  </div>
                )}
              </div>
            );
          })}
          {visibleVendors.length===0 && (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:32,marginBottom:12}}>🏭</div>
              <div style={{fontSize:14,fontWeight:600,color:T.t2,marginBottom:6}}>{vendors.length===0?"No vendors registered yet":"No vendors match your search"}</div>
              <div style={{fontSize:12,color:T.t3}}>{vendors.length===0?"Click \"Add Vendor\" to register your first supplier.":"Try clearing your filters."}</div>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode==="list" && (
        <Card s={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr>
                <Th>Vendor</Th><Th>Category</Th><Th>Contact</Th>
                <Th right>Spend</Th><Th right>Orders</Th><Th right>Items</Th><Th right>Share</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {visibleVendors.length===0 ? (
                <tr><td colSpan={8} style={{padding:"40px",textAlign:"center",color:T.t3}}>No vendors found.</td></tr>
              ) : visibleVendors.map(v=>{
                const vs = stats[v.name]||{spend:0,items:new Set(),orders:0};
                const share = grandTotal>0?(vs.spend/grandTotal)*100:0;
                const catColor = CAT_COLORS[v.category]||T.teal;
                return (
                  <React.Fragment key={v.id}>
                  {editRowId===v.id ? (
                  
                    /* ── INLINE EDIT ROW ── */
                    <tr key={v.id} style={{background:"#0d2040"}}>
                      <td style={{padding:"8px 10px",borderBottom:`1px solid ${T.teal}40`}}>
                        <input value={editRow.name||""} onChange={e=>setEditRow(r=>({...r,name:e.target.value}))}
                          placeholder="Vendor name"
                          style={{background:"#070f1c",border:`1.5px solid ${T.teal}`,borderRadius:7,padding:"7px 10px",
                            color:T.t1,fontSize:13,outline:"none",width:"100%"}}/>
                      </td>
                      <td style={{padding:"8px 10px",borderBottom:`1px solid ${T.teal}40`}}>
                        <select value={editRow.category||"General"} onChange={e=>setEditRow(r=>({...r,category:e.target.value}))}
                          style={{background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:7,padding:"7px 10px",
                            color:T.t1,fontSize:12,outline:"none",width:"100%",cursor:"pointer"}}>
                          {CATEGORIES.map(c=><option key={c} value={c} style={{background:"#070f1c"}}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{padding:"8px 10px",borderBottom:`1px solid ${T.teal}40`}}>
                        <div style={{display:"flex",flexDirection:"column",gap:5}}>
                          <input value={editRow.contact||""} onChange={e=>setEditRow(r=>({...r,contact:e.target.value}))}
                            placeholder="📧 Email"
                            style={{background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:7,padding:"6px 10px",
                              color:T.t1,fontSize:12,outline:"none",width:"100%"}}/>
                          <input value={editRow.phone||""} onChange={e=>setEditRow(r=>({...r,phone:e.target.value}))}
                            placeholder="📞 Phone"
                            style={{background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:7,padding:"6px 10px",
                              color:T.t1,fontSize:12,outline:"none",width:"100%"}}/>
                        </div>
                      </td>
                      <td colSpan={3} style={{padding:"8px 10px",borderBottom:`1px solid ${T.teal}40`}}>
                        <input value={editRow.address||""} onChange={e=>setEditRow(r=>({...r,address:e.target.value}))}
                          placeholder="📍 Address / Region"
                          style={{background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:7,padding:"7px 10px",
                            color:T.t1,fontSize:12,outline:"none",width:"100%"}}/>
                      </td>
                      <td style={{padding:"8px 10px",borderBottom:`1px solid ${T.teal}40`,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",gap:6}}>
                          <Btn v="primary" s={{padding:"5px 12px",fontSize:11}} onClick={()=>saveRowEdit(v.id)} disabled={editSaving}>
                            {editSaving?"…":"✓ Save"}
                          </Btn>
                          <Btn v="ghost" s={{padding:"5px 10px",fontSize:11}} onClick={cancelRowEdit}>✕</Btn>
                        </div>
                      </td>
                    </tr>
                  ) : (
                  /* ── NORMAL ROW ── */
                  <tr key={v.id+"-r"} style={{cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#0f2236"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`}} onClick={()=>setSelected(v)}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${catColor},${T.purple})`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
                          {v.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:600,color:T.t1}}>{v.name}</div>
                          {v.address&&<div style={{fontSize:11,color:T.t3}}>📍 {v.address}</div>}
                        </div>
                      </div>
                    </td>
                    <Td onClick={()=>setSelected(v)}><Badge color={catColor}>{v.category}</Badge></Td>
                    <td style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {v.contact&&<a href={`mailto:${v.contact}`} style={{color:T.teal,fontSize:12,textDecoration:"none"}}>📧 {v.contact}</a>}
                        {v.phone&&<a href={`tel:${v.phone}`} style={{color:T.purple,fontSize:12,textDecoration:"none"}}>📞 {v.phone}</a>}
                        {!v.contact&&!v.phone&&<span style={{color:T.t3,fontSize:12}}>—</span>}
                      </div>
                    </td>
                    <Td right mono bold color={T.teal} onClick={()=>setSelected(v)}>{fmtK(vs.spend)}</Td>
                    <Td right mono onClick={()=>setSelected(v)}>{vs.orders||0}</Td>
                    <Td right mono onClick={()=>setSelected(v)}>{vs.items?.size||0}</Td>
                    <td style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,minWidth:100}} onClick={()=>setSelected(v)}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:4,borderRadius:99,background:"#0a1628"}}>
                          <div style={{height:"100%",width:`${share}%`,background:`linear-gradient(90deg,${catColor},${T.purple})`,borderRadius:99}}/>
                        </div>
                        <span style={{fontSize:11,color:catColor,fontFamily:T.mono,flexShrink:0}}>{share.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",gap:6}}>
                        <Btn v="ghost" s={{padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();startRowEdit(v);}}>✏️</Btn>
                        <Btn v="ghost" s={{padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();setSelected(v);}}>View →</Btn>
                      </div>
                    </td>
                  </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Vendor modal */}
      {/* Edit vendor modal */}
      <Modal open={editOpen} onClose={()=>setEditOpen(false)} title={`Edit — ${selected?.name||"Vendor"}`} width={480}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Vendor Name" value={editForm.name||""} onChange={v=>setEditForm(f=>({...f,name:v}))} placeholder="e.g. ABC Suppliers"/>
            <Select label="Category" value={editForm.category||"General"} onChange={v=>setEditForm(f=>({...f,category:v}))} opts={CATEGORIES}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Email / Contact" value={editForm.contact||""} onChange={v=>setEditForm(f=>({...f,contact:v}))} placeholder="supplier@email.com"/>
            <Input label="Phone" value={editForm.phone||""} onChange={v=>setEditForm(f=>({...f,phone:v}))} placeholder="+265 999 000"/>
          </div>
          <Input label="Address / Region" value={editForm.address||""} onChange={v=>setEditForm(f=>({...f,address:v}))} placeholder="City, Region"/>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
            <Btn v="outline" onClick={()=>setEditOpen(false)}>Cancel</Btn>
            <Btn onClick={saveEdit} disabled={editSaving}>{editSaving?"Saving…":"Save Changes"}</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showAdd} onClose={()=>{ setShowAdd(false); setFormErr(""); }} title="Add New Vendor" width={520}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {form.name && (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#070f1c",borderRadius:10,border:`1px solid ${T.border}`}}>
              <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.teal},${T.purple})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>
                {form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.t1}}>{form.name}</div>
                <div style={{fontSize:11,color:T.t2}}>{form.category}</div>
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Vendor Name *" value={form.name} onChange={v=>{ setForm(f=>({...f,name:capFirst(v)})); setFormErr(""); }} placeholder="e.g. Fresh Mart"/>
            <Select label="Category *" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} opts={["Foods & Grocery","Beverages","Cleaning Supplies","Stationery","Electronics","Other"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Email" value={form.contact} onChange={v=>setForm(f=>({...f,contact:v}))} placeholder="vendor@example.com"/>
            <Input label="Phone" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="+265 999 000"/>
          </div>
          <Input label="Address" value={form.address} onChange={v=>setForm(f=>({...f,address:capFirst(v)}))} placeholder="e.g. Market Square, Lilongwe"/>
          {formErr && <div style={{padding:"9px 13px",background:`${T.red}15`,borderRadius:9,fontSize:12,color:T.red,border:`1px solid ${T.red}30`}}>⚠ {formErr}</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
            <Btn v="outline" onClick={()=>{ setShowAdd(false); setFormErr(""); }}>Cancel</Btn>
            <Btn onClick={addVendor}>Add Vendor</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════
   PAGE: INSIGHTS
══════════════════════════════════════════════════════════════════════════ */
function Insights({ purchases }) {
  const total = purchases.reduce((s,p)=>s+p.qty*p.price,0);

  const supplierData = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{
      if(!m[p.vendor]) m[p.vendor]={ vendor:p.vendor, items:new Set(), qty:0, spend:0 };
      m[p.vendor].items.add(p.item);
      m[p.vendor].qty+=p.qty;
      m[p.vendor].spend+=p.qty*p.price;
    });
    return Object.values(m).map(v=>({...v,items:v.items.size,pct:total>0?(v.spend/total)*100:0})).sort((a,b)=>b.spend-a.spend);
  },[purchases,total]);

  const catData = useMemo(()=>{
    const m={};
    purchases.forEach(p=>{ m[p.category]=(m[p.category]||0)+p.qty*p.price; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value,pct:total>0?(value/total)*100:0}));
  },[purchases,total]);

  return (
    <div className="fade-up">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Insights</h1>
        <p style={{fontSize:13,color:T.t2,marginTop:3}}>Data-driven analytics — manually computed from your records</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        {[
          {l:"Total Spend",v:fmt(total),c:T.teal},
          {l:"Suppliers",v:supplierData.length,c:T.purple},
          {l:"Categories",v:catData.length,c:T.amber},
        ].map(x=>(
          <Card key={x.l} s={{padding:"16px 20px"}}>
            <div style={{fontSize:10,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{x.l}</div>
            <div style={{fontSize:24,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
          </Card>
        ))}
      </div>

      {/* Supplier Table */}
      <Card s={{marginBottom:16,padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:14,fontWeight:700,color:T.t1}}>Supplier Spending Analysis</div>
          <div style={{fontSize:11,color:T.t2,marginTop:2}}>Unique items, quantities, and budget share per vendor</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><Th>Vendor</Th><Th right>Unique Items</Th><Th right>Total Qty</Th><Th right>Total Spend</Th><Th right>Budget %</Th><Th>Share Bar</Th></tr></thead>
            <tbody>{supplierData.length===0
              ? <tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:T.t3}}>No data yet.</td></tr>
              : supplierData.map((r,i)=>(
                <tr key={r.vendor} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${COLORS[i%COLORS.length]},${COLORS[(i+1)%COLORS.length]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{r.vendor[0]}</div>
                      <span style={{fontWeight:600,color:T.t1}}>{r.vendor}</span>
                    </div>
                  </td>
                  <Td right mono bold>{r.items}</Td>
                  <Td right mono>{r.qty}</Td>
                  <Td right mono bold color={T.teal}>{fmt(r.spend)}</Td>
                  <Td right mono bold color={T.amber}>{r.pct.toFixed(1)}%</Td>
                  <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,minWidth:120}}>
                    <div style={{height:6,borderRadius:99,background:"#0a1628"}}>
                      <div style={{height:"100%",width:`${r.pct}%`,background:COLORS[i%COLORS.length],borderRadius:99}}/>
                    </div>
                  </td>
                </tr>
              ))
            }</tbody>
          </table>
        </div>
      </Card>

      {/* Category Progress */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:18}}>Category Metrics</div>
          {catData.map((c,i)=>(
            <ProgBar key={c.label} label={`${CAT_ICON[c.label]||"📦"} ${c.label}`} value={c.value} max={catData[0]?.value||1} color={COLORS[i%COLORS.length]} sub={`${c.pct.toFixed(1)}%`}/>
          ))}
          {catData.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:T.t3}}>No data.</div>}
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:18}}>Distribution</div>
          <Donut data={catData} total={total} size={160}/>
          <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
            {catData.map((c,i)=>(
              <div key={c.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<catData.length-1?`1px solid ${T.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:COLORS[i%COLORS.length]}}/>
                  <span style={{fontSize:12,color:T.t2}}>{CAT_ICON[c.label]||"📦"} {c.label}</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:T.t1,fontFamily:T.mono}}>{fmtK(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: REPORTS
══════════════════════════════════════════════════════════════════════════ */
/* helper — build report data from a purchases array */
function buildReportData(rows, totalFn) {
  const total    = rows.reduce((s,p)=>s+Number(p.qty)*Number(p.price),0);
  const totalQty = rows.reduce((s,p)=>s+Number(p.qty),0);
  const vendors  = new Set(rows.map(p=>p.vendor)).size;
  const catTotals = {};
  rows.forEach(p=>{ catTotals[p.category]=(catTotals[p.category]||0)+Number(p.qty)*Number(p.price); });
  return { total, totalQty, vendors, catTotals };
}

/* ── Shared in-app report viewer ── */
function ReportView({ rows, title, subtitle, catTotals, total, totalQty, vendors, onClose, onPrint }) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Modal header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"18px 24px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T.t1}}>{title}</div>
          {subtitle&&<div style={{fontSize:11,color:T.t3,marginTop:2}}>{subtitle}</div>}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {onPrint&&<Btn v="purple" s={{fontSize:12,padding:"7px 16px"}} onClick={onPrint}>⬇ Download PDF</Btn>}
          <button onClick={onClose} style={{border:"none",background:"transparent",color:T.t3,
            fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>&times;</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Total Spend",    v:fmt(total),    c:T.teal},
            {l:"Transactions",   v:rows.length,   c:T.purple},
            {l:"Total Units",    v:totalQty,      c:T.amber},
            {l:"Vendors",        v:vendors,       c:T.green},
          ].map(x=>(
            <div key={x.l} style={{background:"#070f1c",border:`1px solid ${T.border}`,borderTop:`2px solid ${x.c}`,
              borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{x.l}</div>
              <div style={{fontSize:18,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {Object.keys(catTotals).length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>
              Spend by Category
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([cat,val],i)=>(
                <div key={cat} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:100,fontSize:12,color:T.t2,flexShrink:0}}>{CAT_ICON[cat]||"📦"} {cat}</div>
                  <div style={{flex:1,background:"#070f1c",borderRadius:99,height:8,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:99,width:`${total>0?(val/total*100):0}%`,
                      background:COLORS[i%COLORS.length],transition:"width 0.4s"}}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:T.t1,fontFamily:T.mono,width:90,textAlign:"right",flexShrink:0}}>{fmt(val)}</div>
                  <div style={{fontSize:11,color:T.t3,width:38,textAlign:"right",flexShrink:0}}>{total>0?(val/total*100).toFixed(1):0}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ledger */}
        <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>
          Transaction Ledger <span style={{fontWeight:400,color:T.t3,marginLeft:8}}>{rows.length} records</span>
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr><Th>Date</Th><Th>Vendor</Th><Th>Item</Th><Th>Category</Th><Th right>Qty</Th><Th right>Unit Price</Th><Th right>Total</Th></tr>
            </thead>
            <tbody>
              {rows.length===0
                ? <tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:T.t3}}>No records.</td></tr>
                : rows.map((p,i)=>(
                  <tr key={p.id||i} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <Td><span style={{fontFamily:T.mono,fontSize:11}}>{p.date}</span></Td>
                    <Td bold>{p.vendor}</Td>
                    <Td>{p.item}</Td>
                    <Td><Badge color={T.purple} s={{fontSize:10}}>{p.category}</Badge></Td>
                    <Td right mono>{p.qty}</Td>
                    <Td right mono>{fmt(Number(p.price))}</Td>
                    <Td right mono bold color={T.teal}>{fmt(Number(p.qty)*Number(p.price))}</Td>
                  </tr>
                ))
              }
              {rows.length>0&&(
                <tr style={{background:"#070f1c"}}>
                  <td colSpan={6} style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:T.t2,fontSize:12}}>Grand Total</td>
                  <td style={{padding:"11px 14px",textAlign:"right",fontWeight:800,color:T.purple,fontFamily:T.mono,fontSize:14}}>{fmt(total)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Reports({ purchases, vendors, session, isAdmin }) {
  const [savedReports,   setSavedReports]   = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [activeTab,      setActiveTab]      = useState("generate");
  const [delReportId,    setDelReportId]    = useState(null);
  const [reportSaving,   setReportSaving]   = useState(false);
  const [previewOpen,    setPreviewOpen]    = useState(false);
  const [historyView,    setHistoryView]    = useState(null);
  const [groupByUser,    setGroupByUser]    = useState(false);   // admin: group history by user
  const [allProfiles,    setAllProfiles]    = useState({});      // uid→name map

  // Load saved reports + profiles (for admin grouping)
  useEffect(()=>{
    if (!session) return;
    (async()=>{
      setReportsLoading(true);
      const query = isAdmin
        ? supabase.from("reports").select("*").order("created_at",{ascending:false})
        : supabase.from("reports").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false});
      const { data } = await query;
      if (data) setSavedReports(data);
      if (isAdmin) {
        const { data:profiles } = await supabase.from("profiles").select("id,full_name");
        if (profiles) {
          const map = {};
          profiles.forEach(p=>{ map[p.id]=p.full_name||"Unnamed"; });
          setAllProfiles(map);
        }
      }
      setReportsLoading(false);
    })();
  },[session, isAdmin]);

  const deleteReport = async (id) => {
    await supabase.from("reports").delete().eq("id",id);
    setSavedReports(prev=>prev.filter(r=>r.id!==id));
    setDelReportId(null);
    if (historyView?.id===id) setHistoryView(null);
  };

  const allVendors = useMemo(()=>purchases.length>0?["All",...new Set(purchases.map(p=>p.vendor))]:["All"],[purchases]);
  const [filter, setFilter] = useState({ vendor:"All", category:"All", from:"", to:"" });

  const data = useMemo(()=>purchases.filter(p=>{
    if(filter.vendor!=="All"&&p.vendor!==filter.vendor) return false;
    if(filter.category!=="All"&&p.category!==filter.category) return false;
    if(filter.from&&p.date<filter.from) return false;
    if(filter.to&&p.date>filter.to) return false;
    return true;
  }),[purchases,filter]);

  const { total, totalQty, vendors:uniqueVendors, catTotals } = useMemo(()=>buildReportData(data),[data]);

  /* print helper — works from any rows+title */
  const printReport = (rows, title, catT, tot) => {
    const win = window.open("","_blank");
    const catRows = Object.entries(catT).sort((a,b)=>b[1]-a[1])
      .map(([c,v])=>`<tr><td>${CAT_ICON[c]||""} ${c}</td><td style="text-align:right">${fmt(v)}</td><td style="text-align:right">${tot>0?((v/tot)*100).toFixed(1):0}%</td></tr>`).join("");
    const pRows = rows.map(p=>`<tr><td>${p.date}</td><td>${p.vendor}</td><td>${p.item}</td><td>${p.category}</td><td style="text-align:center">${p.qty}</td><td style="text-align:right">${fmt(Number(p.price))}</td><td style="text-align:right;font-weight:700">${fmt(Number(p.qty)*Number(p.price))}</td></tr>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Sora',sans-serif;background:#0a1628;color:#c8ddf0;padding:48px;}
    h1{color:#0fb8a4;font-size:24px;font-weight:800;margin-bottom:4px;}
    .meta{color:#3a5a78;font-size:12px;margin-bottom:28px;}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
    .stat{background:#0d1e30;border:1px solid #162840;border-radius:10px;padding:14px 16px;}
    .stat-label{font-size:10px;font-weight:700;color:#3a5a78;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;}
    .stat-value{font-size:18px;font-weight:800;color:#e2eff8;}
    .sec-title{font-size:12px;font-weight:700;color:#e2eff8;margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid #162840;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th{padding:8px 12px;text-align:left;background:#070f1c;color:#3a5a78;font-weight:700;font-size:10px;text-transform:uppercase;border-bottom:1px solid #162840;}
    td{padding:8px 12px;border-bottom:1px solid #162840;color:#7a9dba;}
    .grand{text-align:right;font-size:13px;font-weight:700;color:#7b5ea7;margin-top:12px;}
    </style></head><body>
    <h1>${title}</h1><div class="meta">Generated: ${new Date().toLocaleDateString("en-GB",{dateStyle:"long"})}</div>
    <div class="stats">
      <div class="stat"><div class="stat-label">Total Spend</div><div class="stat-value">${fmt(tot)}</div></div>
      <div class="stat"><div class="stat-label">Transactions</div><div class="stat-value">${rows.length}</div></div>
      <div class="stat"><div class="stat-label">Total Units</div><div class="stat-value">${rows.reduce((s,p)=>s+Number(p.qty),0)}</div></div>
      <div class="stat"><div class="stat-label">Vendors</div><div class="stat-value">${new Set(rows.map(p=>p.vendor)).size}</div></div>
    </div>
    <div class="sec-title">Spend by Category</div>
    <table><thead><tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">% of Total</th></tr></thead><tbody>${catRows}</tbody></table>
    <div class="sec-title">Transaction Ledger</div>
    <table><thead><tr><th>Date</th><th>Vendor</th><th>Item</th><th>Category</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${pRows}</tbody></table>
    <div class="grand">Grand Total: ${fmt(tot)}</div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.print(),400);
  };

  const saveAndPreview = async () => {
    if (data.length===0) return;
    setReportSaving(true);
    if (session) {
      const reportRecord = {
        user_id: session.user.id,
        title: `Report — ${filter.vendor==="All"?"All Vendors":filter.vendor} / ${filter.category==="All"?"All Categories":filter.category}`,
        filter_vendor: filter.vendor, filter_category: filter.category,
        filter_from: filter.from||null, filter_to: filter.to||null,
        total_spend: total, transaction_count: data.length,
        vendor_count: uniqueVendors, total_qty: totalQty,
        category_breakdown: JSON.stringify(catTotals),
        purchases_snapshot: JSON.stringify(data.map(p=>({id:p.id,date:p.date,vendor:p.vendor,item:p.item,category:p.category,qty:p.qty,price:p.price}))),
      };
      const { data:saved } = await supabase.from("reports").insert(reportRecord).select().single();
      if (saved) setSavedReports(prev=>[saved,...prev]);
    }
    setReportSaving(false);
    setPreviewOpen(true);
  };

  /* ── history view record helpers ── */
  const getHistoryRows  = r => { try { return JSON.parse(r.purchases_snapshot||"[]"); } catch(e) { return []; } };
  const getHistoryCats  = r => { try { return JSON.parse(r.category_breakdown||"{}"); } catch(e) { return {}; } };

  return (
    <div className="fade-up">
      {/* ── Page header + tabs ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Reports</h1>
          <p style={{fontSize:13,color:T.t2,marginTop:3}}>Generate, preview, and save procurement reports</p>
        </div>
        <div style={{display:"flex",background:"#070f1c",border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
          {[["generate","⚡ Generate"],["history","📁 History"]].map(([tab,lbl])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)}
              style={{border:"none",padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
                background:activeTab===tab?T.teal:"transparent",color:activeTab===tab?"#fff":T.t3}}>
              {lbl}{tab==="history"&&savedReports.length>0&&<span style={{marginLeft:6,background:activeTab==="history"?"#fff3":"#0d1e30",borderRadius:99,padding:"1px 6px",fontSize:10}}>{savedReports.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ══ GENERATE TAB ══ */}
      {activeTab==="generate" && (
        <>
          <Card s={{marginBottom:18}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end"}}>
              <Select label="Vendor"   value={filter.vendor}   onChange={v=>setFilter(f=>({...f,vendor:v}))}   opts={allVendors}/>
              <Select label="Category" value={filter.category} onChange={v=>setFilter(f=>({...f,category:v}))} opts={["All",...CATEGORIES]}/>
              <Input  label="From Date" value={filter.from} onChange={v=>setFilter(f=>({...f,from:v}))} type="date"/>
              <Input  label="To Date"   value={filter.to}   onChange={v=>setFilter(f=>({...f,to:v}))}   type="date"/>
              <Btn v="amber" onClick={()=>setFilter({vendor:"All",category:"All",from:"",to:""})} s={{marginBottom:0}}>Clear</Btn>
              <Btn v="primary"  onClick={saveAndPreview} disabled={reportSaving||data.length===0} s={{marginLeft:"auto"}}>
                {reportSaving?"Saving…":"👁 Preview Report"}
              </Btn>
            </div>
          </Card>

          {/* Live summary KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
            {[{l:"Transactions",v:data.length,c:T.teal},{l:"Total Spend",v:fmt(total),c:T.purple},{l:"Total Units",v:totalQty,c:T.amber},{l:"Vendors",v:uniqueVendors,c:T.green}].map(x=>(
              <Card key={x.l} s={{padding:"16px 18px"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{x.l}</div>
                <div style={{fontSize:22,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
              </Card>
            ))}
          </div>

          {/* Live ledger preview */}
          <Card s={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:T.t1}}>Transaction Ledger Preview</div>
              <Badge>{data.length} records</Badge>
            </div>
            <div style={{overflowX:"auto",maxHeight:400,overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead style={{position:"sticky",top:0,zIndex:2}}><tr><Th>Date</Th><Th>Vendor</Th><Th>Item</Th><Th>Category</Th><Th right>Qty</Th><Th right>Unit Price</Th><Th right>Total</Th></tr></thead>
                <tbody>
                  {data.length===0
                    ? <tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:T.t3}}>No records match your filters.</td></tr>
                    : data.map(p=>(
                      <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <Td><span style={{fontFamily:T.mono,fontSize:11}}>{p.date}</span></Td>
                        <Td bold>{p.vendor}</Td><Td>{p.item}</Td>
                        <Td><Badge color={T.purple} s={{fontSize:10}}>{p.category}</Badge></Td>
                        <Td right mono>{p.qty}</Td>
                        <Td right mono>{fmt(p.price)}</Td>
                        <Td right mono bold color={T.teal}>{fmt(p.qty*p.price)}</Td>
                      </tr>
                    ))
                  }
                  {data.length>0&&(
                    <tr style={{background:"#070f1c"}}>
                      <td colSpan={6} style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:T.t2,fontSize:12}}>Grand Total</td>
                      <td style={{padding:"11px 14px",textAlign:"right",fontWeight:800,color:T.purple,fontFamily:T.mono,fontSize:14}}>{fmt(total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Full-screen preview modal ── */}
          {previewOpen && (
            <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
              onClick={e=>{ if(e.target===e.currentTarget) setPreviewOpen(false); }}>
              <div style={{background:T.cardBg,border:`1px solid ${T.border2}`,borderRadius:16,
                width:"100%",maxWidth:900,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <ReportView
                  rows={data}
                  title={`Report — ${filter.vendor==="All"?"All Vendors":filter.vendor} / ${filter.category==="All"?"All Categories":filter.category}`}
                  subtitle={`Generated ${new Date().toLocaleDateString("en-GB",{dateStyle:"long"})}`}
                  catTotals={catTotals}
                  total={total} totalQty={totalQty} vendors={uniqueVendors}
                  onClose={()=>setPreviewOpen(false)}
                  onPrint={()=>printReport(data, "Procurement Report", catTotals, total)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ HISTORY TAB ══ */}
      {activeTab==="history" && (
        <div>
          {/* Admin group-by-user toggle */}
          {isAdmin && !historyView && savedReports.length>0 && (
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <button onClick={()=>setGroupByUser(g=>!g)}
                style={{border:`1.5px solid ${groupByUser?T.teal:T.border}`,borderRadius:9,padding:"7px 16px",
                  fontSize:12,fontWeight:600,background:groupByUser?`${T.teal}15`:"transparent",
                  color:groupByUser?T.teal:T.t2,cursor:"pointer",transition:"all 0.2s"}}>
                {groupByUser?"✓ Grouped by User":"👥 Group by User"}
              </button>
            </div>
          )}
          {/* If a report is being viewed full-screen in history */}
          {historyView ? (
            <div>
              <div style={{marginBottom:14}}>
                <Btn v="ghost" s={{fontSize:12,padding:"7px 12px"}} onClick={()=>setHistoryView(null)}>← Back to History</Btn>
              </div>
              <Card s={{padding:0,overflow:"hidden",maxHeight:"calc(100vh - 200px)"}}>
                <ReportView
                  rows={getHistoryRows(historyView)}
                  title={historyView.title}
                  subtitle={`Saved ${new Date(historyView.created_at).toLocaleString()}`}
                  catTotals={getHistoryCats(historyView)}
                  total={Number(historyView.total_spend)}
                  totalQty={Number(historyView.total_qty)}
                  vendors={historyView.vendor_count}
                  onClose={()=>setHistoryView(null)}
                  onPrint={()=>{
                    const rows=getHistoryRows(historyView);
                    const cats=getHistoryCats(historyView);
                    printReport(rows, historyView.title, cats, Number(historyView.total_spend));
                  }}
                />
              </Card>
            </div>
          ) : reportsLoading ? (
            <div style={{textAlign:"center",padding:"60px",color:T.t3}}>
              <div className="spin" style={{width:28,height:28,border:`2px solid ${T.border}`,borderTopColor:T.teal,borderRadius:"50%",margin:"0 auto 10px"}}/>Loading reports…
            </div>
          ) : savedReports.length===0 ? (
            <div style={{textAlign:"center",padding:"80px 20px"}}>
              <div style={{fontSize:32,marginBottom:12}}>📋</div>
              <div style={{fontSize:14,fontWeight:600,color:T.t2,marginBottom:6}}>No saved reports yet</div>
              <div style={{fontSize:12,color:T.t3}}>Generate a report to save it here automatically.</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {savedReports.map(r=>{
                const cats = getHistoryCats(r);
                return (
                  <Card key={r.id} s={{padding:"16px 20px",cursor:"pointer",transition:"border-color 0.15s",borderColor:T.border}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=T.teal}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
                    onClick={()=>setHistoryView(r)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:3}}>{r.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                          <div style={{fontSize:11,color:T.t3}}>{new Date(r.created_at).toLocaleString()}</div>
                          {isAdmin && allProfiles[r.user_id] && <Badge color={T.amber} s={{fontSize:10}}>👤 {allProfiles[r.user_id]}</Badge>}
                        </div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <Badge color={T.teal}  s={{fontSize:11}}>{fmt(r.total_spend)}</Badge>
                          <Badge color={T.purple} s={{fontSize:11}}>{r.transaction_count} transactions</Badge>
                          <Badge color={T.amber}  s={{fontSize:11}}>{r.vendor_count} vendors</Badge>
                          {r.filter_from&&<Badge color={T.t3} s={{fontSize:10}}>From: {r.filter_from}</Badge>}
                          {r.filter_to&&  <Badge color={T.t3} s={{fontSize:10}}>To: {r.filter_to}</Badge>}
                        </div>
                        {Object.keys(cats).length>0&&(
                          <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                            {Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
                              <div key={cat} style={{fontSize:11,color:T.t2,background:"#070f1c",borderRadius:6,padding:"3px 9px"}}>
                                {CAT_ICON[cat]||"📦"} {cat}: <span style={{color:T.t1,fontWeight:700}}>{fmtK(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                        <Btn v="ghost" s={{fontSize:12,padding:"6px 14px"}} onClick={()=>setHistoryView(r)}>👁 View</Btn>
                        <Btn v="ghost" s={{fontSize:12,padding:"6px 14px"}} onClick={()=>{
                          const rows=getHistoryRows(r); const cats2=getHistoryCats(r);
                          printReport(rows, r.title, cats2, Number(r.total_spend));
                        }}>⬇ PDF</Btn>
                        {isAdmin&&<Btn v="danger" s={{fontSize:12,padding:"6px 10px"}} onClick={()=>setDelReportId(r.id)}>🗑</Btn>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <Modal open={!!delReportId} onClose={()=>setDelReportId(null)} title="Delete Report" width={400}>
            <p style={{color:T.t2,fontSize:13,marginBottom:20}}>This will permanently delete this report. Cannot be undone.</p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn v="outline" onClick={()=>setDelReportId(null)}>Cancel</Btn>
              <Btn v="danger"  onClick={()=>deleteReport(delReportId)}>Delete</Btn>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: CATALOG
══════════════════════════════════════════════════════════════════════════ */
function Catalog({ purchases, vendors=[], catalogItems=[], addCatalogItem, deleteCatalogItem }) {
  const [search, setSearch]       = useState("");
  const [filterVendor, setFV]     = useState("All");
  const [filterCategory, setFC]   = useState("All");
  const [sortBy, setSortBy]       = useState("item"); // item | price | spend | date
  const [sortDir, setSortDir]     = useState("asc");
  const [expanded, setExpanded]   = useState(null); // item key for price-history expand
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]     = useState({ item:"", category:"Foods", vendor:"", price:"", date:today() });
  const [addFlash, setAddFlash]   = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [delCatId, setDelCatId]   = useState(null);
  const [viewMode, setViewMode]   = useState("combined"); // "combined" | "manual"

  /* ── Build deduplicated catalog from PURCHASES (read-only, purchase history) ── */
  const purchaseCatalog = useMemo(() => {
    const m = {};
    purchases.forEach(p => {
      const key = p.item.toLowerCase().trim();
      if (!m[key]) {
        m[key] = {
          key,
          item: p.item,
          category: p.category,
          lastPrice: p.price,
          lastVendor: p.vendor,
          lastDate: p.date,
          firstDate: p.date,
          totalQty: 0,
          totalSpend: 0,
          orderCount: 0,
          allVendors: new Set(),
          priceHistory: [],
          source: "purchase",
        };
      }
      const e = m[key];
      if (p.date >= e.lastDate) { e.lastPrice = p.price; e.lastVendor = p.vendor; e.lastDate = p.date; }
      if (p.date < e.firstDate) e.firstDate = p.date;
      e.totalQty    += p.qty;
      e.totalSpend  += p.qty * p.price;
      e.orderCount  += 1;
      e.allVendors.add(p.vendor);
      e.priceHistory.push({ date: p.date, vendor: p.vendor, price: p.price, qty: p.qty });
    });
    return Object.values(m).map(x => ({
      ...x,
      vendorCount: x.allVendors.size,
      vendors: Array.from(x.allVendors),
      priceHistory: x.priceHistory.sort((a, b) => b.date.localeCompare(a.date)),
      priceTrend: (() => {
        const h = x.priceHistory.slice().sort((a,b)=>b.date.localeCompare(a.date));
        if (h.length < 2) return "stable";
        return h[0].price > h[1].price ? "up" : h[0].price < h[1].price ? "down" : "stable";
      })(),
    }));
  }, [purchases]);

  /* ── Merge purchaseCatalog + catalogItems (manual entries are independent) ── */
  const catalog = useMemo(() => {
    if (viewMode === "manual") return catalogItems.map(ci => ({
      key: ci.item.toLowerCase().trim() + "|" + ci.id,
      item: ci.item, category: ci.category,
      lastPrice: ci.price, lastVendor: ci.vendor,
      lastDate: ci.date, firstDate: ci.date,
      totalQty: 0, totalSpend: 0, orderCount: 0,
      vendors: [ci.vendor], vendorCount: 1,
      priceHistory: [{ date: ci.date, vendor: ci.vendor, price: ci.price, qty: 1 }],
      priceTrend: "stable", source: "manual", catalogId: ci.id,
    }));

    // Combined: merge purchase catalog + manual items
    const merged = { ...Object.fromEntries(purchaseCatalog.map(c => [c.key, c])) };
    catalogItems.forEach(ci => {
      const k = ci.item.toLowerCase().trim();
      if (merged[k]) {
        // Merge manual entry into purchase entry
        if (!merged[k].allVendors) merged[k].allVendors = new Set(merged[k].vendors);
        merged[k].allVendors.add(ci.vendor);
        merged[k].vendors = Array.from(merged[k].allVendors);
        merged[k].vendorCount = merged[k].vendors.length;
        merged[k].hasCatalogEntry = true;
        merged[k].catalogId = ci.id;
        // Update price if manual entry is newer
        if (ci.date >= merged[k].lastDate) {
          merged[k].lastPrice = ci.price;
          merged[k].lastVendor = ci.vendor;
        }
      } else {
        merged[k] = {
          key: k, item: ci.item, category: ci.category,
          lastPrice: ci.price, lastVendor: ci.vendor,
          lastDate: ci.date, firstDate: ci.date,
          totalQty: 0, totalSpend: 0, orderCount: 0,
          vendors: [ci.vendor], vendorCount: 1,
          priceHistory: [{ date: ci.date, vendor: ci.vendor, price: ci.price, qty: 1 }],
          priceTrend: "stable", source: "manual", catalogId: ci.id,
        };
      }
    });
    return Object.values(merged);
  }, [purchaseCatalog, catalogItems, viewMode]);

  /* ── Unique filter options — merge from catalog AND registered vendors ── */
  const vendorOpts   = useMemo(() => {
    const fromCatalog  = catalog.flatMap(c => c.vendors);
    const fromVendors  = vendors.map(v => v.name);
    return ["All", ...new Set([...fromCatalog, ...fromVendors]).values()].sort((a,b)=>a==="All"?-1:a.localeCompare(b));
  }, [catalog, vendors]);
  const categoryOpts = useMemo(() => ["All", ...new Set(catalog.map(c => c.category))], [catalog]);

  /* ── Add to catalog handler ── */
  const handleAddCatalogItem = async () => {
    if (!addForm.item.trim()||!addForm.vendor.trim()||!addForm.price) {
      setAddFlash("error"); setTimeout(()=>setAddFlash(""),2000); return;
    }
    setAddSaving(true);
    const entry = { item:capFirst(addForm.item.trim()), category:addForm.category, vendor:capFirst(addForm.vendor.trim()), price:+addForm.price, date:addForm.date||today() };
    if (addCatalogItem) {
      const err = await addCatalogItem(entry);
      if (err) { setAddFlash("error"); setAddSaving(false); setTimeout(()=>setAddFlash(""),2000); return; }
    }
    setAddForm({ item:"", category:"Foods", vendor:"", price:"", date:today() });
    setAddFlash("success"); setAddSaving(false); setShowAddForm(false);
    setTimeout(()=>setAddFlash(""),2000);
  };

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let rows = catalog;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(c =>
        c.item.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.vendors.some(v => v.toLowerCase().includes(q))
      );
    }
    if (filterVendor   !== "All") rows = rows.filter(c => c.vendors.includes(filterVendor));
    if (filterCategory !== "All") rows = rows.filter(c => c.category === filterCategory);

    rows = [...rows].sort((a, b) => {
      let va, vb;
      if (sortBy === "item")  { va = a.item;        vb = b.item; }
      if (sortBy === "price") { va = a.lastPrice;   vb = b.lastPrice; }
      if (sortBy === "spend") { va = a.totalSpend;  vb = b.totalSpend; }
      if (sortBy === "date")  { va = a.lastDate;    vb = b.lastDate; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return rows;
  }, [catalog, search, filterVendor, filterCategory, sortBy, sortDir]);

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortTh = ({ col, children, right }) => {
    const active = sortBy === col;
    return (
      <th onClick={() => toggleSort(col)} style={{
        padding: "10px 14px", textAlign: right ? "right" : "left",
        background: "#070f1c", color: active ? T.teal : T.t3,
        fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
        borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap",
        cursor: "pointer", userSelect: "none",
        transition: "color 0.15s",
      }}>
        {children} {active ? (sortDir === "asc" ? "↑" : "↓") : <span style={{opacity:0.3}}>↕</span>}
      </th>
    );
  };

  const TrendIcon = ({ trend }) => {
    if (trend === "up")   return <span style={{color:"#e05c5c",fontSize:13,fontWeight:700}}>↑</span>;
    if (trend === "down") return <span style={{color:T.green,fontSize:13,fontWeight:700}}>↓</span>;
    return <span style={{color:T.t3,fontSize:12}}>—</span>;
  };

  /* ── Category colour map ── */
  const CAT_COLOR = {
    Foods: T.teal, Beverages: "#6366f1", Cleaning: T.purple,
    Stationery: T.amber, Electronics: T.green, Other: T.t2,
  };

  /* ── Summary stats ── */
  const totalItems   = catalog.length;
  const totalFiltered = filtered.length;
  const avgPrice     = filtered.length ? filtered.reduce((s,c)=>s+c.lastPrice,0)/filtered.length : 0;
  const topSpend     = filtered.reduce((top,c)=>c.totalSpend>top.totalSpend?c:top, filtered[0]||{});

  const hasFilters = search.trim() || filterVendor !== "All" || filterCategory !== "All";

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Catalog</h1>
          <p style={{fontSize:13,color:T.t2,marginTop:3}}>
            Item reference library — {totalItems} unique item{totalItems!==1?"s":""}
            {catalogItems.length>0 && <span style={{color:T.purple}}> · {catalogItems.length} manual entr{catalogItems.length===1?"y":"ies"}</span>}
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* View mode toggle */}
          <div style={{display:"flex",background:"#070f1c",border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden"}}>
            {[["combined","All Items"],["manual","Manual Only"]].map(([m,label])=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{border:"none",padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
                  background:viewMode===m?T.teal:"transparent",color:viewMode===m?"#fff":T.t3}}>
                {label}
              </button>
            ))}
          </div>
          <Btn onClick={()=>{setShowAddForm(true);setAddFlash("");}}>＋ Add Item</Btn>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal open={showAddForm} onClose={()=>{setShowAddForm(false);setAddFlash("");}} title="Add Item to Catalog" width={480}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{fontSize:12,color:T.t3}}>Manually add an item with price and supplier. This entry persists independently from purchase history and can be used during purchase entry.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Item Name *" value={addForm.item} onChange={v=>setAddForm(f=>({...f,item:capFirst(v)}))} placeholder="e.g. Rice (5kg)"/>
            <Select label="Category *" value={addForm.category} onChange={v=>setAddForm(f=>({...f,category:v}))} opts={CATEGORIES}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:T.t2,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>Supplier *</label>
              <div style={{display:"flex",gap:6}}>
                <select value={addForm.vendor} onChange={e=>setAddForm(f=>({...f,vendor:e.target.value}))}
                  style={{background:"#070f1c",border:`1.5px solid ${addForm.vendor?T.teal:T.border}`,borderRadius:9,
                    padding:"10px 13px",color:addForm.vendor?T.t1:T.t3,fontSize:13,outline:"none",flex:1,cursor:"pointer"}}>
                  <option value="" style={{background:"#070f1c",color:T.t3}}>Select supplier…</option>
                  {vendors.map(v=><option key={v.id} value={v.name} style={{background:"#070f1c",color:T.t1}}>{v.name}</option>)}
                </select>
              </div>
              {/* Or type a new supplier name */}
              <input value={addForm.vendor} onChange={e=>setAddForm(f=>({...f,vendor:e.target.value}))}
                placeholder="Or type supplier name…"
                style={{marginTop:6,background:"#070f1c",border:`1.5px solid ${T.border}`,borderRadius:9,
                  padding:"9px 13px",color:T.t1,fontSize:12,outline:"none",width:"100%"}}
                onFocus={e=>e.target.style.borderColor=T.teal}
                onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            <div>
              <Input label="Price (Mwk) *" value={addForm.price} onChange={v=>setAddForm(f=>({...f,price:v}))} type="number" placeholder="0.00"/>
              <div style={{marginTop:6}}>
                <Input label="Date" value={addForm.date} onChange={v=>setAddForm(f=>({...f,date:v}))} type="date"/>
              </div>
            </div>
          </div>
          {addFlash==="error" && <div style={{padding:"9px 13px",background:`${T.red}15`,borderRadius:9,fontSize:12,color:T.red,border:`1px solid ${T.red}30`}}>⚠ Please fill all required fields (name, supplier, price).</div>}
          {addFlash==="success" && <div style={{padding:"9px 13px",background:`${T.teal}15`,borderRadius:9,fontSize:12,color:T.teal,border:`1px solid ${T.teal}30`}}>✓ Item added to catalog!</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn v="outline" onClick={()=>{setShowAddForm(false);setAddFlash("");}}>Cancel</Btn>
            <Btn onClick={handleAddCatalogItem} disabled={addSaving}>{addSaving?"Saving…":"Save to Catalog"}</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete catalog item confirm */}
      <Modal open={!!delCatId} onClose={()=>setDelCatId(null)} title="Remove from Catalog" width={400}>
        <p style={{color:T.t2,fontSize:13,marginBottom:20}}>This will remove this manual catalog entry. <strong style={{color:T.t1}}>Purchase records are not affected.</strong></p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="outline" onClick={()=>setDelCatId(null)}>Cancel</Btn>
          <Btn v="danger" onClick={()=>{ deleteCatalogItem&&deleteCatalogItem(delCatId); setDelCatId(null); }}>Remove</Btn>
        </div>
      </Modal>      {/* Search + Filters bar */}
      <Card s={{padding:"14px 16px",marginBottom:16}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          {/* Search */}
          <div style={{flex:"2 1 200px",position:"relative"}}>
            <label style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>Search Items</label>
            <span style={{position:"absolute",left:12,bottom:11,fontSize:13,color:T.t3,pointerEvents:"none"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Item name, category, or vendor…"
              style={{ background:"#070f1c", border:`1.5px solid ${search?T.teal:T.border}`, borderRadius:9,
                padding:"10px 13px 10px 34px", color:T.t1, fontSize:13, outline:"none", width:"100%",
                transition:"border-color 0.2s", boxShadow: search?`0 0 0 3px ${T.tealGlow}`:"none" }}
              onFocus={e=>{e.target.style.borderColor=T.teal;e.target.style.boxShadow=`0 0 0 3px ${T.tealGlow}`;}}
              onBlur={e=>{e.target.style.borderColor=search?T.teal:T.border;e.target.style.boxShadow=search?`0 0 0 3px ${T.tealGlow}`:"none";}}/>
          </div>

          {/* Vendor filter */}
          <div style={{flex:"1 1 140px"}}>
            <label style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>Vendor</label>
            <select value={filterVendor} onChange={e=>setFV(e.target.value)}
              style={{ background:"#070f1c", border:`1.5px solid ${filterVendor!=="All"?T.teal:T.border}`,
                borderRadius:9, padding:"10px 12px", color:T.t1, fontSize:13, outline:"none", width:"100%",
                cursor:"pointer", boxShadow:filterVendor!=="All"?`0 0 0 3px ${T.tealGlow}`:"none" }}>
              {vendorOpts.map(o=><option key={o} value={o} style={{background:"#070f1c"}}>{o}</option>)}
            </select>
          </div>

          {/* Category filter */}
          <div style={{flex:"1 1 140px"}}>
            <label style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>Category</label>
            <select value={filterCategory} onChange={e=>setFC(e.target.value)}
              style={{ background:"#070f1c", border:`1.5px solid ${filterCategory!=="All"?T.purple:T.border}`,
                borderRadius:9, padding:"10px 12px", color:T.t1, fontSize:13, outline:"none", width:"100%",
                cursor:"pointer", boxShadow:filterCategory!=="All"?`0 0 0 3px ${T.purpleGlow}`:"none" }}>
              {categoryOpts.map(o=><option key={o} value={o} style={{background:"#070f1c"}}>{CAT_ICON[o]||""} {o}</option>)}
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <Btn v="ghost" s={{marginTop:"auto",whiteSpace:"nowrap"}}
              onClick={()=>{setSearch("");setFV("All");setFC("All");}}>
              ✕ Clear
            </Btn>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,color:T.t3}}>Active filters:</span>
            {search.trim() && <Badge color={T.teal} s={{cursor:"pointer"}} onClick={()=>setSearch("")}>"{search}" ✕</Badge>}
            {filterVendor!=="All" && <Badge color={T.teal} s={{cursor:"pointer"}} onClick={()=>setFV("All")}>{filterVendor} ✕</Badge>}
            {filterCategory!=="All" && <Badge color={T.purple} s={{cursor:"pointer"}} onClick={()=>setFC("All")}>{CAT_ICON[filterCategory]||""} {filterCategory} ✕</Badge>}
            <span style={{fontSize:11,color:T.t2,marginLeft:4}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
          </div>
        )}
      </Card>

      {/* Category quick-filter pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {["All",...CATEGORIES].map(cat=>{
          const isActive = filterCategory===cat||(cat==="All"&&filterCategory==="All");
          const color = CAT_COLOR[cat]||T.teal;
          const count = cat==="All" ? catalog.length : catalog.filter(c=>c.category===cat).length;
          if (cat!=="All" && count===0) return null;
          return (
            <button key={cat} onClick={()=>setFC(cat==="All"?"All":cat)}
              style={{ border:`1.5px solid ${isActive?(CAT_COLOR[cat]||T.teal):T.border}`,
                borderRadius:99, padding:"5px 14px", fontSize:12, fontWeight:600,
                background: isActive?`${CAT_COLOR[cat]||T.teal}18`:"transparent",
                color: isActive?(CAT_COLOR[cat]||T.teal):T.t3,
                cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
              {cat!=="All"&&<span>{CAT_ICON[cat]||"📦"}</span>}
              {cat}
              <span style={{background:isActive?`${CAT_COLOR[cat]||T.teal}30`:"#0d1e30",borderRadius:99,padding:"1px 7px",fontSize:10,fontFamily:T.mono}}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main table */}
      <Card s={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1}}>Item Directory</div>
          <div style={{fontSize:11,color:T.t3}}>Click column headers to sort · Click row to view price history</div>
        </div>

        <div style={{overflowX:"auto",maxHeight:580,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead style={{position:"sticky",top:0,zIndex:2}}>
              <tr>
                <SortTh col="item">Item</SortTh>
                <Th>Category</Th>
                <Th>Vendors</Th>
                <SortTh col="price" right>Last Price</SortTh>
                <Th right>Trend</Th>
                <Th right>Orders</Th>
                <SortTh col="spend" right>Total Spend</SortTh>
                <SortTh col="date" right>Last Purchased</SortTh>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{padding:"60px 20px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.t2,marginBottom:6}}>No items match your filters</div>
                    <div style={{fontSize:12,color:T.t3}}>Try adjusting your search or clearing the active filters above</div>
                  </td>
                </tr>
              ) : filtered.map(c => {
                const isExp = expanded === c.key;
                const catColor = CAT_COLOR[c.category] || T.teal;
                return (
                  <>
                    <tr key={c.key}
                      onClick={() => setExpanded(isExp ? null : c.key)}
                      style={{cursor:"pointer",transition:"background 0.1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#0f2236"}
                      onMouseLeave={e=>e.currentTarget.style.background=isExp?"#0f2236":"transparent"}>

                      {/* Item name */}
                      <td style={{padding:"12px 14px",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:8,
                            background:`${catColor}18`,border:`1px solid ${catColor}30`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:15,flexShrink:0}}>
                            {CAT_ICON[c.category]||"📦"}
                          </div>
                          <div>
                            <div style={{fontWeight:600,color:T.t1,fontSize:13}}>{c.item}</div>
                            <div style={{fontSize:10,color:T.t3,marginTop:1,display:"flex",gap:6,alignItems:"center"}}>
                              {c.isManual
                                ? <Badge color={T.purple} s={{fontSize:9,padding:"1px 6px"}}>manual</Badge>
                                : <span>{c.orderCount} purchase{c.orderCount!==1?"s":""} · first: {c.firstDate}</span>
                              }
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category badge */}
                      <td style={{padding:"12px 14px",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <Badge color={catColor}>{CAT_ICON[c.category]||"📦"} {c.category}</Badge>
                      </td>

                      {/* Vendor badges */}
                      <td style={{padding:"12px 14px",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {c.vendors.slice(0,2).map(v=>(
                            <Badge key={v} color={T.teal} s={{fontSize:10}}>{v}</Badge>
                          ))}
                          {c.vendors.length>2 && <Badge color={T.t3} s={{fontSize:10}}>+{c.vendors.length-2}</Badge>}
                        </div>
                      </td>

                      {/* Last price */}
                      <td style={{padding:"12px 14px",textAlign:"right",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <div style={{fontWeight:700,color:T.teal,fontFamily:T.mono,fontSize:13}}>{fmt(c.lastPrice)}</div>
                        <div style={{fontSize:10,color:T.t3,marginTop:1}}>from {c.lastVendor}</div>
                      </td>

                      {/* Price trend */}
                      <td style={{padding:"12px 14px",textAlign:"right",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <TrendIcon trend={c.priceTrend}/>
                      </td>

                      {/* Order count */}
                      <td style={{padding:"12px 14px",textAlign:"right",fontFamily:T.mono,fontSize:12,color:T.t2,borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        {c.orderCount}
                      </td>

                      {/* Total spend */}
                      <td style={{padding:"12px 14px",textAlign:"right",fontFamily:T.mono,fontSize:13,fontWeight:700,color:T.amber,borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        {fmtK(c.totalSpend)}
                      </td>

                      {/* Last date */}
                      <td style={{padding:"12px 14px",textAlign:"right",borderBottom:isExp?"none":`1px solid ${T.border}`}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8}}>
                          <span style={{fontFamily:T.mono,fontSize:11,color:T.t2}}>{c.lastDate}</span>
                          <span style={{color:T.t3,fontSize:12,transition:"transform 0.2s",
                            transform:isExp?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                        </div>
                      </td>

                      {/* Actions — only for manual entries */}
                      <td style={{padding:"8px 14px",borderBottom:isExp?"none":`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                        {c.catalogId && (
                          <Btn v="ghost" s={{padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();setDelCatId(c.catalogId);}}>🗑</Btn>
                        )}
                        {c.source==="manual" && <Badge color={T.purple} s={{fontSize:9,padding:"2px 6px",marginLeft:4}}>manual</Badge>}
                      </td>
                    </tr>

                    {/* ── Expanded Price History ── */}
                    {isExp && (
                      <tr key={`${c.key}-exp`}>
                        <td colSpan={9} style={{padding:"0 14px 14px",background:"#0a1a28",borderBottom:`1px solid ${T.border}`}}>
                          <div style={{background:"#070f1c",borderRadius:10,border:`1px solid ${T.border2}`,overflow:"hidden"}}>
                            <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div style={{fontSize:12,fontWeight:700,color:T.t1}}>📈 Price History — {c.item}</div>
                              <div style={{fontSize:11,color:T.t3}}>{c.priceHistory.length} record{c.priceHistory.length!==1?"s":""}</div>
                            </div>
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                              <thead>
                                <tr>
                                  {["Date","Vendor","Unit Price","Qty","Line Total"].map((h,i)=>(
                                    <th key={h} style={{padding:"8px 14px",textAlign:i>1?"right":"left",color:T.t3,fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:`1px solid ${T.border}`}}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {c.priceHistory.map((h,i)=>{
                                  const isLatest = i===0;
                                  const prevPrice = i<c.priceHistory.length-1?c.priceHistory[i+1].price:null;
                                  const change = prevPrice!==null ? h.price - prevPrice : null;
                                  return (
                                    <tr key={i} style={{background:isLatest?"#0d1e30":"transparent"}}>
                                      <td style={{padding:"8px 14px",color:T.t2,fontFamily:T.mono,fontSize:11}}>
                                        {h.date} {isLatest&&<Badge color={T.teal} s={{fontSize:9,padding:"1px 6px",marginLeft:4}}>latest</Badge>}
                                      </td>
                                      <td style={{padding:"8px 14px"}}><Badge color={T.teal} s={{fontSize:10}}>{h.vendor}</Badge></td>
                                      <td style={{padding:"8px 14px",textAlign:"right",fontFamily:T.mono,fontWeight:700,color:T.teal}}>
                                        {fmt(h.price)}
                                        {change!==null&&change!==0&&(
                                          <span style={{marginLeft:6,fontSize:10,color:change>0?T.red:T.green}}>
                                            {change>0?"↑":""}{change<0?"↓":""}{Math.abs(change).toFixed(2)}
                                          </span>
                                        )}
                                      </td>
                                      <td style={{padding:"8px 14px",textAlign:"right",color:T.t2,fontFamily:T.mono}}>{h.qty}</td>
                                      <td style={{padding:"8px 14px",textAlign:"right",color:T.amber,fontFamily:T.mono,fontWeight:600}}>{fmt(h.price*h.qty)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{padding:"12px 18px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:T.t3}}>
              Showing {filtered.length} of {catalog.length} items
              {hasFilters?" (filtered)":""}
            </span>
            <div style={{display:"flex",gap:16,fontSize:11,color:T.t3}}>
              <span>↑ price increase &nbsp; <span style={{color:T.red}}>↑</span></span>
              <span>↓ price decrease &nbsp; <span style={{color:T.green}}>↓</span></span>
              <span>— no change &nbsp; <span style={{color:T.t3}}>—</span></span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: SETTINGS
══════════════════════════════════════════════════════════════════════════ */
function Settings({ profile, setProfile }) {
  const [saved,    setSaved]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState("");
  const [form, setForm] = useState({ ...profile });

  // Keep form in sync if profile loads async after mount
  useEffect(()=>{ setForm({...profile}); },[profile?.email]);

  const save = async ()=>{
    setSaving(true); setSaveErr("");
    const result = await Promise.resolve(setProfile(form)); // works for both sync and async setProfile
    setSaving(false);
    if (result && result.message) { setSaveErr(result.message); return; }
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div className="fade-up">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Settings</h1>
        <p style={{fontSize:13,color:T.t2,marginTop:3}}>Manage your profile and application preferences</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        {/* Profile */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:18}}>Profile</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",background:"#070f1c",borderRadius:12,marginBottom:6}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,#f97316,#f59e0b)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff",flexShrink:0}}>
                {form.name?form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"JD"}
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:T.t1}}>{form.name||"Your Name"}</div>
                {form.role && <div style={{fontSize:11,color:T.t2}}>{form.role}</div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Input label="Full Name" value={form.name} onChange={v=>setForm(f=>({...f,name:capFirst(v)}))} placeholder="Jane Doe"/>
              <Input label="Role / Title (optional)" value={form.role} onChange={v=>setForm(f=>({...f,role:capFirst(v)}))} placeholder="e.g. Manager, Director…"/>
            </div>
            <Input label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="jane@company.com" type="email"/>
            <Input label="Organization" value={form.org} onChange={v=>setForm(f=>({...f,org:capFirst(v)}))} placeholder="Acme Corp"/>
            <Input label="Phone" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="+265 999 000"/>
          </div>
        </Card>

        {/* App Preferences */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card>
            <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:16}}>App Preferences</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Select label="Default Currency" value={form.currency||"MWK"} onChange={v=>setForm(f=>({...f,currency:v}))} opts={["MWK","USD","ZAR","KES","GHS","NGN"]}/>
              <Select label="Date Format" value={form.dateFormat||"YYYY-MM-DD"} onChange={v=>setForm(f=>({...f,dateFormat:v}))} opts={["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"]}/>
              <Select label="Default Category" value={form.defaultCat||"Foods"} onChange={v=>setForm(f=>({...f,defaultCat:v}))} opts={CATEGORIES}/>
            </div>
          </Card>

          <Card>
            <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:16}}>Report Preferences</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Input label="Company Name (for PDFs)" value={form.companyName||""} onChange={v=>setForm(f=>({...f,companyName:v}))} placeholder="Your Company Name"/>
              <Input label="Report Footer Note" value={form.footerNote||""} onChange={v=>setForm(f=>({...f,footerNote:v}))} placeholder="Confidential – Internal Use Only"/>
            </div>
          </Card>

          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            {saveErr&&<div style={{padding:"10px 14px",background:`${T.red}15`,borderRadius:9,fontSize:12,color:T.red,border:`1px solid ${T.red}30`}}>⚠ {saveErr}</div>}
            {saved&&<div style={{padding:"10px 16px",background:`${T.teal}15`,borderRadius:9,fontSize:12,color:T.teal,border:`1px solid ${T.teal}30`,display:"flex",alignItems:"center",gap:6}}>✓ Settings saved!</div>}
            <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Save Changes"}</Btn>
          </div>
        </div>
      </div>

      {/* About */}
      <Card s={{marginTop:16,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.t1}}>ProcureDesk v2.0</div>
            <div style={{fontSize:11,color:T.t3,marginTop:2}}>Procurement management system — all data stored locally in this session</div>
          </div>
          <Badge color={T.green}>Active</Badge>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════════════ */
function AppLegacy() {
  const [page, setPage] = useState("home");
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [profile, setProfile] = useState({ name:"Jane Doe", role:"", email:"jane@company.mw", org:"Acme Corp", phone:"+265 999 000", currency:"MWK", dateFormat:"YYYY-MM-DD", defaultCat:"Foods" });
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [addVendorOpen,   setAddVendorOpen]   = useState(false);
  const [vendorFilters,   setVendorFilters]   = useState({ search:"", cat:"All", sort:"name", view:"grid" });

  const NAV = [
    { id:"home",      icon:"🏠", label:"Home" },
    { id:"purchases", icon:"🛒", label:"Purchases" },
    { id:"vendors",   icon:"🏭", label:"Vendors" },
    { id:"insights",  icon:"📊", label:"Insights" },
    { id:"reports",   icon:"📋", label:"Reports" },
    { id:"catalog",   icon:"📖", label:"Catalog" },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", background:T.mainBg, fontFamily:"'Sora', sans-serif", overflow:"hidden", position:"fixed", top:0, left:0 }}>
      <GS />

      {/* ── Sidebar ── */}
      <div style={{ width:200, background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid ${T.border}` }}>
        {/* User */}
        <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>
              {profile.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.t1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{profile.name}</div>
              <div style={{ fontSize:10, color:T.t3 }}>{profile.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>navigateTo(n.id)} badge={n.badge}/>)}
        </div>

        {/* Bottom: Settings */}
        <div style={{ padding:"10px 8px 14px", borderTop:`1px solid ${T.border}` }}>
          <NavItem icon="⚙️" label="Settings" active={page==="settings"} onClick={()=>navigateTo("settings")}/>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"20px 22px", minWidth:0 }}>
        {page==="home"      && <Home purchases={purchases} vendors={vendors} go={navigateTo} profile={prof} openNewPurchase={()=>{setPage("purchases");setNewPurchaseOpen(true);}} openAddVendor={()=>{setPage("vendors");setAddVendorOpen(true);}}/>}
        {page==="purchases" && <Purchases purchases={purchases} setPurchases={setPurchases} vendors={vendors} modalOpen={newPurchaseOpen} setModalOpen={setNewPurchaseOpen}/>}
        {page==="vendors"   && <Vendors vendors={vendors} setVendors={setVendors} purchases={purchases} setPurchases={setPurchases} triggerAdd={addVendorOpen} clearTriggerAdd={()=>setAddVendorOpen(false)}/>}
        {page==="insights"  && <Insights purchases={purchases}/>}
        {page==="reports"   && <Reports purchases={purchases} vendors={vendors} session={session} isAdmin={prof.isAdmin}/>}
        {page==="catalog"   && <Catalog purchases={purchases} vendors={vendors}/>}
        {page==="market"    && <MarketPage session={session}/>}
        {page==="settings"  && <Settings profile={profile} setProfile={setProfile}/>}
      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════════════════
   PAGE: MARKET  (logged-in view — consolidated price directory)
══════════════════════════════════════════════════════════════════════════ */
function MarketPage({ session }) {
  const [marketData, setMarketData] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("purchases")
      .select("item,vendor,category,price,date")
      .order("date", { ascending:false });
    if (data) setMarketData(data.map(r=>({...r, price:Number(r.price)})));
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(()=>{ load(); },[]);

  const stats = useMemo(()=>({
    items:   new Set(marketData.map(p=>p.item.toLowerCase())).size,
    vendors: new Set(marketData.map(p=>p.vendor.toLowerCase())).size,
    cats:    new Set(marketData.map(p=>p.category)).size,
    entries: marketData.length,
  }),[marketData]);

  return (
    <div className="fade-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Market Prices</h1>
          <p style={{fontSize:13,color:T.t2,marginTop:3}}>
            Latest prices from all suppliers — anonymous, community-sourced
            {lastRefresh && <span style={{color:T.t3,marginLeft:6}}>· Updated {lastRefresh.toLocaleTimeString()}</span>}
          </p>
        </div>
        <Btn v="ghost" onClick={load} disabled={loading} s={{fontSize:12}}>
          {loading ? "Loading…" : "↻ Refresh"}
        </Btn>
      </div>

      {loading
        ? <div style={{textAlign:"center",padding:"80px",color:T.t3}}>
            <div className="spin" style={{width:28,height:28,border:`2px solid ${T.border}`,borderTopColor:T.teal,borderRadius:"50%",margin:"0 auto 10px"}}/>
            Loading market data…
          </div>
        : <MarketCatalog purchases={marketData}/>
      }
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════
   PAGE: ADMIN PANEL
══════════════════════════════════════════════════════════════════════════ */
function AdminPanel({ session }) {
  const [users,      setUsers]     = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [selected,   setSelected]  = useState(null);
  const [editForm,   setEditForm]  = useState({});
  const [newPass,    setNewPass]   = useState("");
  const [delUID,     setDelUID]    = useState(null);
  const [flash,      setFlash]     = useState({type:"",text:""});
  const [search,     setSearch]    = useState("");
  const [viewUser,   setViewUser]  = useState(null);  // drill-down user data
  const [userPurchases, setUserPurchases] = useState([]);
  const [userVendors,   setUserVendors]   = useState([]);

  const showFlash = (type, text) => { setFlash({type,text}); setTimeout(()=>setFlash({type:"",text:""}),4000); };

  const loadUsers = async () => {
    setLoading(true);
    // Fetch all profiles (admin can see all via service role, but we use anon key here
    // so you need to add a policy: FOR SELECT USING (true) on profiles for admins)
    const { data, error } = await supabase.from("profiles").select("*").order("full_name");
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(()=>{ loadUsers(); },[]);

  const openEdit = (u) => {
    setSelected(u);
    setEditForm({ full_name: u.full_name||"", role: u.role||"", organization: u.organization||"", phone: u.phone||"" });
    setNewPass("");
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("profiles").update(editForm).eq("id", selected.id);
    if (error) { showFlash("error", error.message); return; }
    setUsers(prev=>prev.map(u=>u.id===selected.id?{...u,...editForm}:u));
    showFlash("success","Profile updated successfully.");
    setSelected(null);
  };

  const toggleLock = async (u) => {
    const newVal = !u.is_locked;
    const { error } = await supabase.from("profiles").update({ is_locked: newVal }).eq("id", u.id);
    if (error) { showFlash("error", error.message); return; }
    setUsers(prev=>prev.map(x=>x.id===u.id?{...x,is_locked:newVal}:x));
    showFlash("success", newVal ? `${u.full_name||u.id} has been locked.` : `${u.full_name||u.id} has been unlocked.`);
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) { showFlash("error", error.message); return; }
    showFlash("success", `Password reset email sent to ${email}.`);
  };

  const sendMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) { showFlash("error", error.message); return; }
    showFlash("success", `Magic link sent to ${email}.`);
  };

  const deleteUser = async (uid) => {
    // Delete profile — cascade will clean purchases/vendors if FK is set
    await supabase.from("purchases").delete().eq("user_id", uid);
    await supabase.from("vendors").delete().eq("user_id", uid);
    const { error } = await supabase.from("profiles").delete().eq("id", uid);
    if (error) { showFlash("error","Could not delete user: "+error.message); setDelUID(null); return; }
    setUsers(prev=>prev.filter(u=>u.id!==uid));
    showFlash("success","User deleted.");
    setDelUID(null);
  };

  const openViewUser = async (u) => {
    setViewUser(u);
    const [{ data:p },{ data:v }] = await Promise.all([
      supabase.from("purchases").select("*").eq("user_id",u.id).order("date",{ascending:false}),
      supabase.from("vendors").select("*").eq("user_id",u.id),
    ]);
    setUserPurchases(p||[]);
    setUserVendors(v||[]);
  };

  const filtered = useMemo(()=>{
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u=>
      (u.full_name||"").toLowerCase().includes(q) ||
      (u.organization||"").toLowerCase().includes(q) ||
      (u.role||"").toLowerCase().includes(q)
    );
  },[users, search]);

  /* ── User drill-down view ── */
  if (viewUser) {
    const totalSpend = userPurchases.reduce((s,p)=>s+Number(p.price)*Number(p.qty),0);
    return (
      <div className="fade-up">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
          <Btn v="ghost" s={{padding:"7px 12px",fontSize:12}} onClick={()=>{ setViewUser(null); setUserPurchases([]); setUserVendors([]); }}>← Admin</Btn>
          <span style={{color:T.t3}}>/</span>
          <span style={{fontSize:14,fontWeight:700,color:T.t1}}>{viewUser.full_name||viewUser.id}</span>
          {viewUser.is_admin && <Badge color={T.amber}>ADMIN</Badge>}
          {viewUser.is_locked && <Badge color={T.red}>LOCKED</Badge>}
                {viewUser.email && <div style={{fontSize:12,color:T.t3,marginTop:4}}>{viewUser.email}</div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:16}}>
          {[
            {l:"Total Spend",v:fmt(totalSpend),c:T.teal},
            {l:"Purchases",v:userPurchases.length,c:T.purple},
            {l:"Vendors",v:userVendors.length,c:T.amber},
            {l:"Categories",v:new Set(userPurchases.map(p=>p.category)).size,c:T.green},
          ].map(x=>(
            <Card key={x.l} s={{borderTop:`2px solid ${x.c}`,padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,color:x.c,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{x.l}</div>
              <div style={{fontSize:19,fontWeight:800,color:T.t1,fontFamily:T.mono}}>{x.v}</div>
            </Card>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card s={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.t1}}>Recent Purchases</div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr><Th>Date</Th><Th>Item</Th><Th>Vendor</Th><Th right>Total</Th></tr></thead>
                <tbody>
                  {userPurchases.length===0
                    ? <tr><td colSpan={4} style={{padding:"24px",textAlign:"center",color:T.t3}}>No purchases.</td></tr>
                    : userPurchases.slice(0,20).map(p=>(
                      <tr key={p.id}>
                        <Td><span style={{fontFamily:T.mono,fontSize:10}}>{p.date}</span></Td>
                        <Td bold>{p.item}</Td>
                        <Td><Badge color={T.teal} s={{fontSize:10}}>{p.vendor}</Badge></Td>
                        <Td right mono bold color={T.teal}>{fmt(Number(p.price)*Number(p.qty))}</Td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </Card>
          <Card s={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.t1}}>Vendors</div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr><Th>Name</Th><Th>Category</Th><Th>Contact</Th></tr></thead>
                <tbody>
                  {userVendors.length===0
                    ? <tr><td colSpan={3} style={{padding:"24px",textAlign:"center",color:T.t3}}>No vendors.</td></tr>
                    : userVendors.map(v=>(
                      <tr key={v.id}>
                        <Td bold>{v.name}</Td>
                        <Td><Badge color={T.purple} s={{fontSize:10}}>{v.category}</Badge></Td>
                        <Td><span style={{fontSize:11,color:T.t2}}>{v.contact||"—"}</span></Td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <h1 style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>Admin Panel</h1>
          <Badge color={T.amber} s={{fontSize:11}}>🛡️ Admin Only</Badge>
        </div>
        <p style={{fontSize:13,color:T.t2}}>Manage all registered users — {users.length} total</p>
      </div>

      {/* Flash */}
      {flash.text && (
        <div style={{padding:"12px 16px",borderRadius:10,marginBottom:16,fontSize:13,
          background: flash.type==="error"?`${T.red}18`:`${T.teal}18`,
          color: flash.type==="error"?T.red:T.teal,
          border:`1px solid ${flash.type==="error"?T.red:T.teal}30`}}>
          {flash.type==="error"?"⚠ ":"✓ "}{flash.text}
        </div>
      )}

      {/* Search bar */}
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.t3,pointerEvents:"none"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, org, or role…"
          style={{background:"#070f1c",border:`1.5px solid ${search?T.teal:T.border}`,borderRadius:10,padding:"10px 13px 10px 34px",
            color:T.t1,fontSize:13,outline:"none",width:"100%",transition:"border-color 0.2s"}}
          onFocus={e=>e.target.style.borderColor=T.teal} onBlur={e=>e.target.style.borderColor=search?T.teal:T.border}/>
      </div>

      {/* Users table */}
      <Card s={{padding:0,overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:"48px",textAlign:"center",color:T.t3}}>
            <div className="spin" style={{width:28,height:28,border:`2px solid ${T.border}`,borderTopColor:T.teal,borderRadius:"50%",margin:"0 auto 10px"}}/>
            Loading users…
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr>
                  <Th>User</Th><Th>Role</Th><Th>Organization</Th>
                  <Th>Status</Th><Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:T.t3}}>No users found.</td></tr>
                ) : filtered.map(u=>{
                  const isCurrentUser = u.id===session.user.id;
                  const initials = (u.full_name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                  return (
                    <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {/* Name */}
                      <td style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
                            background: u.is_locked?"#333":"linear-gradient(135deg,#f97316,#f59e0b)",
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>
                            {u.is_locked?"🔒":initials}
                          </div>
                          <div>
                            <div style={{fontWeight:600,color:T.t1}}>{u.full_name||<span style={{color:T.t3}}>No name</span>}</div>
                            <div style={{fontSize:11,color:T.t3}}>{u.email||u.id.slice(0,8)+"…"}</div>
                          </div>
                        </div>
                      </td>
                      <Td>{u.role||<span style={{color:T.t3}}>—</span>}</Td>
                      <Td>{u.organization||<span style={{color:T.t3}}>—</span>}</Td>
                      {/* Status badges */}
                      <td style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {isCurrentUser && <Badge color={T.teal} s={{fontSize:10}}>You</Badge>}
                          {u.is_admin    && <Badge color={T.amber} s={{fontSize:10}}>Admin</Badge>}
                          {u.is_locked   && <Badge color={T.red}   s={{fontSize:10}}>Locked</Badge>}
                          {!u.is_locked && !u.is_admin && !isCurrentUser && <Badge color={T.green} s={{fontSize:10}}>Active</Badge>}
                        </div>
                      </td>
                      {/* Actions */}
                      <td style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,textAlign:"right"}}>
                        <div style={{display:"flex",gap:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
                          <Btn v="ghost" s={{padding:"4px 10px",fontSize:11}} onClick={()=>openViewUser(u)}>👁 View</Btn>
                          <Btn v="ghost" s={{padding:"4px 10px",fontSize:11}} onClick={()=>openEdit(u)}>✏️ Edit</Btn>
                          {!isCurrentUser && (
                            <>
                              <Btn v={u.is_locked?"outline":"ghost"} s={{padding:"4px 10px",fontSize:11,color:u.is_locked?T.green:T.amber}} onClick={()=>toggleLock(u)}>
                                {u.is_locked?"🔓 Unlock":"🔒 Lock"}
                              </Btn>
                              <Btn v="ghost" s={{padding:"4px 10px",fontSize:11,color:T.purple}} onClick={()=>sendPasswordReset(u.email||u.id)}>🔑 Reset PW</Btn>
                              <Btn v="ghost" s={{padding:"4px 10px",fontSize:11,color:T.teal}} onClick={()=>sendMagicLink(u.email||u.id)}>✨ Magic Link</Btn>
                              <Btn v="danger" s={{padding:"4px 10px",fontSize:11}} onClick={()=>setDelUID(u.id)}>🗑</Btn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit user modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={`Edit — ${selected?.full_name||"User"}`} width={480}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Full Name"    value={editForm.full_name||""} onChange={v=>setEditForm(f=>({...f,full_name:capFirst(v)}))} placeholder="Jane Doe"/>
            <Input label="Role / Title" value={editForm.role||""}      onChange={v=>setEditForm(f=>({...f,role:capFirst(v)}))}      placeholder="Manager"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Input label="Organization" value={editForm.organization||""} onChange={v=>setEditForm(f=>({...f,organization:capFirst(v)}))} placeholder="Acme Corp"/>
            <Input label="Phone"        value={editForm.phone||""}         onChange={v=>setEditForm(f=>({...f,phone:v}))}                 placeholder="+265 999 000"/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
            <Btn v="outline" onClick={()=>setSelected(null)}>Cancel</Btn>
            <Btn onClick={saveEdit}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!delUID} onClose={()=>setDelUID(null)} title="Delete User Account" width={420}>
        <div style={{padding:"14px 16px",background:`${T.red}12`,borderRadius:10,border:`1px solid ${T.red}25`,marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:600,color:T.red,marginBottom:4}}>⚠ This is permanent and cannot be undone</div>
          <div style={{fontSize:12,color:T.t2}}>All purchases and vendors belonging to this user will be permanently deleted.</div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="outline" onClick={()=>setDelUID(null)}>Cancel</Btn>
          <Btn v="danger" onClick={()=>deleteUser(delUID)}>Delete Account</Btn>
        </div>
      </Modal>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════
   AUTH SCREEN  (shown when no session)
══════════════════════════════════════════════════════════════════════════ */
function AuthScreen({ onBack, embedded=false }) {
  const [mode,    setMode]    = useState("login");   // "login" | "signup" | "magic"
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState({ type:"", text:"" });

  const flash = (type, text) => { setMsg({type, text}); setTimeout(()=>setMsg({type:"",text:""}), 5000); };

  const handleLogin = async () => {
    if (!email || !pass) { flash("error","Please enter your email and password."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) flash("error", error.message);
  };

  const handleSignup = async () => {
    if (!name.trim()) { flash("error","Please enter your full name."); return; }
    if (!email)       { flash("error","Please enter your email."); return; }
    if (pass.length < 6) { flash("error","Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name.trim() } }
    });
    setLoading(false);
    if (error) flash("error", error.message);
    else flash("success","Account created! Check your email to confirm, then log in.");
  };

  const handleMagicLink = async () => {
    if (!email) { flash("error","Please enter your email address."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) flash("error", error.message);
    else flash("success","Magic link sent! Check your inbox.");
  };

  const inputStyle = {
    background:"#070f1c", border:`1.5px solid ${T.border}`, borderRadius:10,
    padding:"12px 14px", color:T.t1, fontSize:14, outline:"none", width:"100%",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };
  const focusStyle = e => { e.target.style.borderColor=T.teal; e.target.style.boxShadow=`0 0 0 3px ${T.tealGlow}`; };
  const blurStyle  = e => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; };

  return (
    <div style={{ minHeight: embedded?"auto":"100vh", background: embedded?"transparent":T.mainBg, display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Sora',sans-serif", padding: embedded?0:20 }}>
      <GS/>

      {/* Background glow */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:600, height:600,
          background:`radial-gradient(circle, ${T.tealGlow} 0%, transparent 70%)`, borderRadius:"50%" }}/>
        <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:500, height:500,
          background:`radial-gradient(circle, ${T.purpleGlow} 0%, transparent 70%)`, borderRadius:"50%" }}/>
      </div>

      <div className="fade-up" style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${T.teal},${T.purple})`,
            display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:14 }}>🛒</div>
          <div style={{ fontSize:24, fontWeight:800, color:T.t1, letterSpacing:"-0.02em", marginBottom:4 }}>ProcureDesk</div>
          <div style={{ fontSize:13, color:T.t3 }}>Procurement management system</div>
        </div>

        {/* Card */}
        <div style={{ background:T.cardBg, border:`1px solid ${T.border2}`, borderRadius:20, padding:32 }}>
          {/* Tab switcher */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4,
            background:"#070f1c", borderRadius:10, padding:4, marginBottom:24 }}>
            {[["login","Sign In"],["signup","Sign Up"],["magic","Magic Link"]].map(([m,lbl])=>(
              <button key={m} onClick={()=>{setMode(m);setMsg({type:"",text:""}); }}
                style={{ border:"none", borderRadius:8, padding:"8px 4px", fontSize:12, fontWeight:600,
                  cursor:"pointer", transition:"all 0.15s",
                  background: mode===m ? T.teal : "transparent",
                  color: mode===m ? "#fff" : T.t3 }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Name (signup only) */}
            {mode==="signup" && (
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:T.t2, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:5 }}>Full Name</label>
                <input value={name} onChange={e=>setName(capFirst(e.target.value))} placeholder="Jane Doe"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:T.t2, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:5 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
            </div>

            {/* Password (login + signup only) */}
            {(mode==="login"||mode==="signup") && (
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:T.t2, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:5 }}>Password</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder={mode==="signup"?"Min. 6 characters":"••••••••"}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
                  onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleSignup())}/>
              </div>
            )}

            {/* Flash message */}
            {msg.text && (
              <div style={{ padding:"10px 14px", borderRadius:9, fontSize:12,
                background: msg.type==="error" ? `${T.red}18` : `${T.teal}18`,
                color: msg.type==="error" ? T.red : T.teal,
                border: `1px solid ${msg.type==="error" ? T.red : T.teal}30` }}>
                {msg.type==="error" ? "⚠ " : "✓ "}{msg.text}
              </div>
            )}

            {/* CTA button */}
            <button onClick={mode==="login"?handleLogin:mode==="signup"?handleSignup:handleMagicLink}
              disabled={loading}
              style={{ border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700,
                cursor:loading?"not-allowed":"pointer", background:`linear-gradient(135deg,${T.teal},${T.tealDim})`,
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                opacity:loading?0.7:1, transition:"opacity 0.2s", marginTop:2 }}>
              {loading
                ? <><span className="spin" style={{width:16,height:16,border:`2px solid #fff4`,borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>Processing…</>
                : mode==="login" ? "Sign In →" : mode==="signup" ? "Create Account →" : "Send Magic Link →"
              }
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MARKET CATALOG  (shared read-only price directory — all users)
══════════════════════════════════════════════════════════════════════════ */
function MarketCatalog({ purchases, vendors=[], guestMode=false }) {
  const [search,         setSearch]   = useState("");
  const [filterCat,      setFC]       = useState("All");
  const [filterSupplier, setFS]       = useState("All");
  const [sortBy,         setSortBy]   = useState("item");
  const [sortDir,        setSortDir]  = useState("asc");
  const [viewMode,       setViewMode] = useState("cards"); // cards | table
  const [expanded,       setExpanded] = useState(null);

  // Build vendor→address map for region lookup
  const vendorRegion = useMemo(()=>{
    const m = {};
    vendors.forEach(v=>{ if(v.address) m[v.name.toLowerCase()] = v.address; });
    return m;
  },[vendors]);

  // Group by item, collecting all vendor prices
  const catalog = useMemo(()=>{
    const m = {};
    purchases.forEach(p=>{
      const key = p.item.toLowerCase().trim();
      if (!m[key]) {
        m[key] = {
          item: p.item, category: p.category,
          vendors: {}, lowestPrice: Infinity, highestPrice: 0,
          lastDate: "", region: vendorRegion[p.vendor.toLowerCase()] || "",
        };
      }
      const e = m[key];
      const price = Number(p.price);
      // keep latest price per vendor
      if (!e.vendors[p.vendor] || p.date > e.vendors[p.vendor].date) {
        e.vendors[p.vendor] = { price, date: p.date, region: vendorRegion[p.vendor.toLowerCase()]||"" };
      }
      if (price < e.lowestPrice) e.lowestPrice = price;
      if (price > e.highestPrice) e.highestPrice = price;
      if (p.date > e.lastDate) { e.lastDate = p.date; }
    });
    return Object.values(m).map(e=>({
      ...e,
      vendorList: Object.entries(e.vendors)
        .map(([name, v])=>({name, price:v.price, date:v.date, region:v.region}))
        .sort((a,b)=>a.price-b.price),
      vendorCount: Object.keys(e.vendors).length,
    }));
  },[purchases, vendorRegion]);

  const catOpts      = useMemo(()=>["All",...new Set(catalog.map(c=>c.category)).values()],[catalog]);
  const supplierOpts = useMemo(()=>{
    const names = new Set();
    catalog.forEach(c=>Object.keys(c.vendors).forEach(v=>names.add(v)));
    return ["All",...names];
  },[catalog]);

  const filtered = useMemo(()=>{
    let rows = catalog;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r=>
        r.item.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        Object.keys(r.vendors).some(v=>v.toLowerCase().includes(q))
      );
    }
    if (filterCat!=="All")      rows = rows.filter(r=>r.category===filterCat);
    if (filterSupplier!=="All") rows = rows.filter(r=>r.vendors[filterSupplier]);
    rows = [...rows].sort((a,b)=>{
      let va, vb;
      if (sortBy==="item")  { va=a.item;        vb=b.item; }
      if (sortBy==="price") { va=a.lowestPrice; vb=b.lowestPrice; }
      if (sortBy==="date")  { va=a.lastDate;    vb=b.lastDate; }
      if (typeof va==="string") return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);
      return sortDir==="asc"?va-vb:vb-va;
    });
    return rows;
  },[catalog, search, filterCat, filterSupplier, sortBy, sortDir]);

  const CAT_COLOR = {
    Foods:T.teal, Beverages:"#6366f1", Cleaning:T.purple,
    Stationery:T.amber, Electronics:T.green, Other:T.t2,
  };

  const toggleSort = col => {
    if (sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const hasFilters = search||filterCat!=="All"||filterSupplier!=="All";

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:"1 1 200px",position:"relative"}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.t3,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items, suppliers…"
            style={{background:"#070f1c",border:`1.5px solid ${search?T.teal:T.border}`,borderRadius:10,
              padding:"11px 13px 11px 34px",color:T.t1,fontSize:14,outline:"none",width:"100%",transition:"all 0.2s",
              boxShadow:search?`0 0 0 3px ${T.tealGlow}`:"none"}}
            onFocus={e=>{e.target.style.borderColor=T.teal;e.target.style.boxShadow=`0 0 0 3px ${T.tealGlow}`;}}
            onBlur={e=>{e.target.style.borderColor=search?T.teal:T.border;e.target.style.boxShadow=search?`0 0 0 3px ${T.tealGlow}`:"none";}}/>
        </div>
        <select value={filterSupplier} onChange={e=>setFS(e.target.value)}
          style={{background:"#070f1c",border:`1.5px solid ${filterSupplier!=="All"?T.teal:T.border}`,borderRadius:9,
            padding:"10px 12px",color:filterSupplier!=="All"?T.teal:T.t1,fontSize:13,outline:"none",cursor:"pointer",flexShrink:0}}>
          <option value="All" style={{background:"#070f1c"}}>All Suppliers</option>
          {supplierOpts.filter(o=>o!=="All").map(o=><option key={o} value={o} style={{background:"#070f1c"}}>{o}</option>)}
        </select>
        {/* View toggle */}
        <div style={{display:"flex",background:"#070f1c",border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden",flexShrink:0}}>
          {[["cards","⊞"],["table","☰"]].map(([m,ic])=>(
            <button key={m} onClick={()=>setViewMode(m)}
              style={{border:"none",padding:"9px 13px",fontSize:14,cursor:"pointer",transition:"all 0.15s",
                background:viewMode===m?T.teal:"transparent",color:viewMode===m?"#fff":T.t3}}>{ic}</button>
          ))}
        </div>
        {hasFilters && <button onClick={()=>{setSearch("");setFC("All");setFS("All");}}
          style={{border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 14px",fontSize:12,background:"transparent",color:T.t2,cursor:"pointer"}}>✕ Clear</button>}
      </div>

      {/* Category pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {catOpts.map(cat=>{
          const active=filterCat===cat;
          const color = CAT_COLOR[cat]||T.teal;
          const count = cat==="All" ? catalog.length : catalog.filter(r=>r.category===cat).length;
          return (
            <button key={cat} onClick={()=>setFC(cat)}
              style={{border:`1.5px solid ${active?color:T.border}`,borderRadius:99,padding:"6px 14px",
                fontSize:12,fontWeight:600,background:active?`${color}18`:"transparent",
                color:active?color:T.t3,cursor:"pointer",transition:"all 0.15s",flexShrink:0,
                display:"flex",alignItems:"center",gap:5}}>
              {cat!=="All" && (CAT_ICON[cat]||"📦")} {cat}
              <span style={{background:active?`${color}30`:"#0d1e30",borderRadius:99,padding:"1px 7px",fontSize:10,fontFamily:T.mono}}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── CARD GRID VIEW ── */}
      {viewMode==="cards" && (
        <div className="catalog-card-grid">
          {filtered.length===0 ? (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px",color:T.t3}}>
              <div style={{fontSize:36,marginBottom:12}}>🔍</div>
              <div style={{fontSize:14,fontWeight:600,color:T.t2,marginBottom:6}}>No items found</div>
              <div style={{fontSize:12}}>Try different search terms or clear filters</div>
            </div>
          ) : filtered.map(c=>{
            const catColor = CAT_COLOR[c.category]||T.teal;
            const isOpen = expanded===c.item;
            const bestPrice = c.vendorList[0];
            const worstPrice = c.vendorList[c.vendorList.length-1];
            return (
              <div key={c.item} onClick={()=>setExpanded(isOpen?null:c.item)}
                style={{background:T.cardBg,border:`1px solid ${isOpen?catColor:T.border}`,borderRadius:14,
                  overflow:"hidden",cursor:"pointer",transition:"all 0.18s",
                  boxShadow:isOpen?`0 4px 20px ${catColor}20`:"none"}}>
                {/* Card top */}
                <div style={{padding:"14px 14px 10px",borderTop:`3px solid ${catColor}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:`${catColor}18`,border:`1px solid ${catColor}30`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                      {CAT_ICON[c.category]||"📦"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.t1,lineHeight:1.3,wordBreak:"break-word"}}>{c.item}</div>
                      <Badge color={catColor} s={{fontSize:9,marginTop:4,display:"inline-block"}}>{c.category}</Badge>
                    </div>
                  </div>
                  {/* Price range */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    background:"#070f1c",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:9,color:T.t3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>Best Price</div>
                      <div style={{fontSize:15,fontWeight:800,color:T.teal,fontFamily:T.mono}}>{fmt(bestPrice?.price||0)}</div>
                      {bestPrice && <div style={{fontSize:9,color:T.t3,marginTop:1}}>{bestPrice.name}</div>}
                    </div>
                    {c.vendorCount > 1 && (
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:9,color:T.t3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>Highest</div>
                        <div style={{fontSize:13,fontWeight:600,color:T.amber,fontFamily:T.mono}}>{fmt(worstPrice?.price||0)}</div>
                        <div style={{fontSize:9,color:T.t3,marginTop:1}}>{worstPrice.name}</div>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:T.t3}}>{c.vendorCount} supplier{c.vendorCount!==1?"s":""}</span>
                    <span style={{fontSize:11,color:T.t3,fontFamily:T.mono}}>{c.lastDate}</span>
                  </div>
                </div>
                {/* Expanded: all vendor prices */}
                {isOpen && (
                  <div style={{borderTop:`1px solid ${T.border}`,background:"#070f1c"}}>
                    <div style={{padding:"8px 14px 4px",fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                      All Suppliers
                    </div>
                    {c.vendorList.map((v,i)=>(
                      <div key={v.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                        padding:"8px 14px",borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:22,height:22,borderRadius:6,background:`linear-gradient(135deg,${catColor},${T.purple})`,
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>
                            {v.name[0]}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:T.t1}}>{v.name}</div>
                            <div style={{fontSize:10,color:T.t3}}>{v.date}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {i===0 && <span style={{fontSize:9,background:`${T.teal}20`,color:T.teal,borderRadius:99,padding:"2px 6px",fontWeight:700}}>BEST</span>}
                          <span style={{fontSize:13,fontWeight:800,color:i===0?T.teal:T.t1,fontFamily:T.mono}}>{fmt(v.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{padding:"8px 14px 10px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:T.t3}}>{isOpen?"▲ Less":"▼ See all suppliers"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode==="table" && (
        <Card s={{padding:0,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr>
                  {[["item","Item"],["","Category"],["","Suppliers"],["price","Best Price"],["date","Updated"]].map(([col,lbl])=>(
                    col ? (
                      <th key={lbl} onClick={()=>toggleSort(col)} style={{padding:"10px 14px",textAlign:col==="price"?"right":"left",
                        background:"#070f1c",color:sortBy===col?T.teal:T.t3,fontWeight:700,fontSize:10,
                        textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`1px solid ${T.border}`,
                        cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
                        {lbl}{sortBy===col?(sortDir==="asc"?" ↑":" ↓"):""}
                      </th>
                    ) : (
                      <th key={lbl} style={{padding:"10px 14px",background:"#070f1c",color:T.t3,fontWeight:700,fontSize:10,
                        textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`1px solid ${T.border}`}}>{lbl}</th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={5} style={{padding:"48px",textAlign:"center",color:T.t3}}>No items found.</td></tr>
                ) : filtered.map(c=>{
                  const catColor = CAT_COLOR[c.category]||T.teal;
                  return (
                    <tr key={c.item} onMouseEnter={e=>e.currentTarget.style.background="#0f2236"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,fontWeight:600,color:T.t1}}>{c.item}</td>
                      <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`}}><Badge color={catColor} s={{fontSize:10}}>{CAT_ICON[c.category]||""} {c.category}</Badge></td>
                      <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {c.vendorList.slice(0,3).map(v=><Badge key={v.name} color={T.t3} s={{fontSize:9}}>{v.name}</Badge>)}
                          {c.vendorCount>3 && <Badge color={T.t3} s={{fontSize:9}}>+{c.vendorCount-3}</Badge>}
                        </div>
                      </td>
                      <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,textAlign:"right"}}>
                        <div style={{fontWeight:800,color:T.teal,fontFamily:T.mono,fontSize:13}}>{fmt(c.lowestPrice)}</div>
                        {c.vendorCount>1 && <div style={{fontSize:10,color:T.t3,marginTop:1}}>up to {fmt(c.highestPrice)}</div>}
                      </td>
                      <td style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,textAlign:"right",fontSize:11,color:T.t3,fontFamily:"monospace"}}>{c.lastDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Count */}
      <div style={{marginTop:14,textAlign:"center",fontSize:12,color:T.t3}}>
        {filtered.length} item{filtered.length!==1?"s":""} · {catalog.reduce((s,c)=>s+c.vendorCount,0)} price entries
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LANDING PAGE  (shown to unauthenticated visitors)
══════════════════════════════════════════════════════════════════════════ */
function LandingPage({ onLogin }) {
  const [marketData, setMarketData] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("catalog"); // "catalog" | "auth"
  const [animating,  setAnimating]  = useState(false);
  const [statsCount, setStatsCount] = useState({ items:0, suppliers:0, entries:0 });

  useEffect(()=>{
    supabase.from("purchases").select("item,vendor,category,price,date").order("date",{ascending:false})
      .then(({ data })=>{
        if(data) {
          const d = data.map(r=>({...r,price:Number(r.price)}));
          setMarketData(d);
          const items = new Set(d.map(x=>x.item.toLowerCase())).size;
          const suppliers = new Set(d.map(x=>x.vendor.toLowerCase())).size;
          setStatsCount({ items, suppliers, entries: d.length });
        }
        setLoading(false);
      });
  },[]);

  const switchView = (to) => {
    if (to===view||animating) return;
    setAnimating(true);
    setTimeout(()=>{ setView(to); setAnimating(false); }, 220);
  };

  const fadeStyle = {
    opacity: animating ? 0 : 1,
    transform: animating ? "translateY(8px)" : "translateY(0)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  };

  return (
    <div style={{minHeight:"100vh",background:T.mainBg,fontFamily:"'Sora',sans-serif",overflowY:"auto",overflowX:"hidden"}}>
      <GS/>

      {/* bg glows */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        <div style={{position:"absolute",top:"-10%",left:"-10%",width:"min(700px,90vw)",height:"min(700px,90vw)",background:`radial-gradient(circle,${T.tealGlow} 0%,transparent 65%)`,borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-10%",width:"min(600px,80vw)",height:"min(600px,80vw)",background:`radial-gradient(circle,${T.purpleGlow} 0%,transparent 65%)`,borderRadius:"50%"}}/>
      </div>

      {/* ── Sticky Navbar ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:`${T.mainBg}f0`,backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${T.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${T.teal},${T.purple})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🛒</div>
          <div style={{fontSize:15,fontWeight:800,color:T.t1,letterSpacing:"-0.02em"}}>ProcureDesk</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>switchView("catalog")}
            style={{border:`1.5px solid ${view==="catalog"?T.teal:T.border}`,borderRadius:9,padding:"7px 14px",
              fontSize:13,fontWeight:600,background:view==="catalog"?`${T.teal}15`:"transparent",
              color:view==="catalog"?T.teal:T.t2,cursor:"pointer",transition:"all 0.2s"}}>
            📖 Market
          </button>
          <button onClick={()=>switchView("auth")}
            style={{border:"none",borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:700,
              background:`linear-gradient(135deg,${T.teal},${T.tealDim})`,
              color:"#fff",cursor:"pointer",boxShadow:view==="catalog"?`0 4px 14px ${T.tealGlow}`:"none"}}>
            Sign In →
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{position:"relative",zIndex:1,...fadeStyle}}>

        {/* ══ CATALOG VIEW ══ */}
        {view==="catalog" && (
          <div>
            {/* Hero */}
            <div style={{textAlign:"center",padding:"40px 20px 32px",maxWidth:560,margin:"0 auto"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${T.teal}15`,
                border:`1px solid ${T.teal}30`,borderRadius:99,padding:"5px 14px",marginBottom:18}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:T.teal,display:"inline-block",animation:"pulse 1.5s infinite"}}/>
                <span style={{fontSize:11,fontWeight:700,color:T.teal,letterSpacing:"0.08em"}}>LIVE MARKET PRICES</span>
              </div>
              <h1 style={{fontSize:"clamp(26px,6vw,42px)",fontWeight:800,color:T.t1,letterSpacing:"-0.03em",lineHeight:1.15,marginBottom:14}}>
                Real Prices.<br/><span style={{color:T.teal}}>Smarter Buying.</span>
              </h1>
              <p style={{fontSize:"clamp(13px,3.5vw,15px)",color:T.t2,lineHeight:1.7,marginBottom:24}}>
                Browse live procurement prices from businesses across the region. Compare suppliers, spot the best deals, and make smarter purchasing decisions — before you spend a kwacha.
              </p>
              {/* Live stats */}
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
                {[
                  {n:loading?"…":statsCount.items,   l:"Unique Items"},
                  {n:loading?"…":statsCount.suppliers, l:"Suppliers"},
                  {n:loading?"…":statsCount.entries,  l:"Price Entries"},
                ].map(s=>(
                  <div key={s.l} style={{background:`${T.teal}10`,border:`1px solid ${T.teal}25`,borderRadius:12,padding:"10px 20px",minWidth:90}}>
                    <div style={{fontSize:22,fontWeight:800,color:T.teal,fontFamily:T.mono}}>{s.n}</div>
                    <div style={{fontSize:10,color:T.t3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>switchView("auth")}
                style={{border:"none",borderRadius:11,padding:"12px 28px",fontSize:14,fontWeight:700,
                  background:`linear-gradient(135deg,${T.teal},${T.purple})`,color:"#fff",cursor:"pointer",
                  boxShadow:`0 6px 20px ${T.tealGlow}`}}>
                Track Your Own Prices →
              </button>
            </div>

            {/* Catalog */}
            <div style={{padding:"0 16px 60px",maxWidth:1100,margin:"0 auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div>
                  <h2 style={{fontSize:18,fontWeight:800,color:T.t1}}>Market Catalog</h2>
                  <p style={{fontSize:12,color:T.t3,marginTop:2}}>Community-sourced · Anonymous · Updated live</p>
                </div>
              </div>
              {loading
                ? <div style={{textAlign:"center",padding:"60px",color:T.t3}}>
                    <div className="spin" style={{width:32,height:32,border:`2px solid ${T.border}`,borderTopColor:T.teal,borderRadius:"50%",margin:"0 auto 12px"}}/>
                    Loading market data…
                  </div>
                : <MarketCatalog purchases={marketData} guestMode/>
              }
            </div>

            {/* CTA strip */}
            <div style={{background:T.cardBg,borderTop:`1px solid ${T.border}`,padding:"40px 20px",textAlign:"center"}}>
              <div style={{maxWidth:480,margin:"0 auto"}}>
                <div style={{fontSize:28,marginBottom:12}}>📊</div>
                <h3 style={{fontSize:20,fontWeight:800,color:T.t1,marginBottom:10}}>Want to track your own procurement?</h3>
                <p style={{fontSize:13,color:T.t2,marginBottom:24,lineHeight:1.6}}>
                  Sign up free to log purchases, manage suppliers, generate reports, and contribute prices to this catalog.
                </p>
                <button onClick={()=>switchView("auth")}
                  style={{border:"none",borderRadius:12,padding:"13px 32px",fontSize:15,fontWeight:700,
                    background:`linear-gradient(135deg,${T.teal},${T.purple})`,color:"#fff",cursor:"pointer",
                    boxShadow:`0 6px 20px ${T.tealGlow}`}}>
                  Create Free Account →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ AUTH VIEW ══ */}
        {view==="auth" && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 60px)",padding:20}}>
            <div style={{width:"100%",maxWidth:420}}>
              <button onClick={()=>switchView("catalog")}
                style={{background:"none",border:"none",color:T.t2,fontSize:13,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:6,padding:0}}>
                ← Back to Market
              </button>
              <AuthScreen onBack={()=>switchView("catalog")} embedded/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP  (Supabase-powered)
══════════════════════════════════════════════════════════════════════════ */
function LockedScreen({ onSignOut }) {
  return (
    <div style={{ height:"100vh", width:"100vw", display:"flex", alignItems:"center", justifyContent:"center",
      background:T.mainBg, fontFamily:"'Sora', sans-serif", position:"fixed", top:0, left:0, zIndex:9999 }}>
      <GS/>
      <div style={{ textAlign:"center", maxWidth:380, padding:"0 24px" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <h1 style={{ fontSize:22, fontWeight:800, color:T.t1, marginBottom:8, letterSpacing:"-0.02em" }}>
          Account Unavailable
        </h1>
        <p style={{ fontSize:13, color:T.t2, marginBottom:4, lineHeight:1.6 }}>
          This account has been temporarily restricted.
        </p>
        <p style={{ fontSize:12, color:T.t3, marginBottom:28 }}>
          Please contact support to resolve this.
        </p>
        <div style={{ background:"#0d1e30", border:`1px solid ${T.border}`, borderRadius:14,
          padding:"18px 24px", marginBottom:24, display:"flex", flexDirection:"column", gap:12 }}>
          <a href="mailto:chipiemie@gmail.com"
            style={{ display:"flex", alignItems:"center", gap:12, color:T.teal, textDecoration:"none",
              fontSize:13, fontWeight:500, padding:"10px 14px", borderRadius:9,
              border:`1px solid ${T.teal}30`, background:`${T.teal}08` }}>
            <span style={{ fontSize:20 }}>📧</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Email</div>
              <div>chipiemie@gmail.com</div>
            </div>
          </a>
          <a href="tel:+265981182969"
            style={{ display:"flex", alignItems:"center", gap:12, color:T.purple, textDecoration:"none",
              fontSize:13, fontWeight:500, padding:"10px 14px", borderRadius:9,
              border:`1px solid ${T.purple}30`, background:`${T.purple}08` }}>
            <span style={{ fontSize:20 }}>📞</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Call</div>
              <div>+265 981 182 969</div>
            </div>
          </a>
        </div>
        <button onClick={onSignOut}
          style={{ border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 22px",
            fontSize:12, color:T.t3, background:"transparent", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session,  setSession]  = useState(undefined); // undefined = loading, null = no session
  const [showLanding, setShowLanding] = useState(false);
  const [page,     setPage]     = useState("home");

  // ── Data state (replaces INITIAL_PURCHASES / INITIAL_VENDORS) ──
  const [purchases,    setPurchases]    = useState([]);
  const [vendors,      setVendors]      = useState([]);
  const [catalogItems, setCatalogItems] = useState([]); // manually curated catalog entries
  const [profile,      setProfileState] = useState(null);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [addVendorOpen,   setAddVendorOpen]   = useState(false);
  const [vendorFilters,   setVendorFilters]   = useState({ search:"", cat:"All", sort:"name", view:"grid" });

  // ── Auth listener ──
  useEffect(()=>{
    supabase.auth.getSession().then(({ data:{ session } })=> setSession(session));
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_event, session)=>{
      setSession(session);
      if (!session) { setPurchases([]); setVendors([]); setProfileState(null); }
    });
    return ()=> subscription.unsubscribe();
  },[]);

  // ── Poll profile every 4s to detect lock/delete by admin in real time ──
  useEffect(()=>{
    if (!session) return;
    const check = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_locked, id")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) { console.warn("Poll error:", error.message); return; }
      if (!data) {
        // Profile gone — account deleted, force sign out
        await supabase.auth.signOut();
        return;
      }
      const locked = data.is_locked === true;
      setProfileState(prev => {
        if (!prev) return prev; // profile not loaded yet, skip
        if (prev.isLocked === locked) return prev; // no change, skip re-render
        return { ...prev, isLocked: locked };
      });
    };
    const interval = setInterval(check, 4000);
    return () => clearInterval(interval);
  }, [session]);

  // ── Load data when session exists ──
  const loadAll = useCallback(async ()=>{
    if (!session) return;
    setDataLoading(true);
    const uid = session.user.id;

    const [{ data:pData }, { data:vData }, { data:prData }, { data:ciData }] = await Promise.all([
      supabase.from("purchases").select("*").eq("user_id", uid).order("date", { ascending:false }),
      supabase.from("vendors").select("*").eq("user_id", uid).order("name"),
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("catalog_items").select("*").eq("user_id", uid).order("item"),
    ]);

    if (pData) setPurchases(pData.map(r=>({ ...r, price:Number(r.price), qty:Number(r.qty) })));
    if (vData) setVendors(vData);
    if (ciData) setCatalogItems(ciData.map(r=>({...r, price:Number(r.price)})));
    const isAdminUser = prData?.is_admin === true;
    if (prData) setProfileState({
      name:      prData.full_name    || session.user.email,
      isAdmin:   isAdminUser,
      role:      prData.role         || "",
      email:     session.user.email,
      org:       prData.organization || "",
      phone:     prData.phone        || "",
      currency:  prData.currency     || "MWK",
      dateFormat:prData.date_format  || "YYYY-MM-DD",
      defaultCat:prData.default_cat  || "Foods",
      companyName:prData.company_name|| "",
      footerNote: prData.footer_note || "",
      isAdmin:    prData.is_admin      === true,
      isLocked:   prData.is_locked     === true,
    });
    // Restore persisted vendor filters
    if (prData?.vendor_filters) {
      try { setVendorFilters(JSON.parse(prData.vendor_filters)); } catch(e) {}
    }
    // Restore last visited page
    const validPages = ["home","purchases","vendors","insights","reports","catalog","market","settings","admin"];
    if (prData?.last_page && validPages.includes(prData.last_page)) {
      setPage(prData.last_page);
    }
    setDataLoading(false);
  },[session]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  // ── Supabase CRUD wrappers ──
  const addPurchase = useCallback(async (p, tempId)=>{
    const row = { user_id:session.user.id, vendor:p.vendor, item:p.item,
      qty:p.qty, price:p.price, category:p.category, date:p.date };
    const { data, error } = await supabase.from("purchases").insert(row).select().single();
    if (!error && data) {
      const real = {...data, price:Number(data.price), qty:Number(data.qty)};
      // Replace optimistic entry with real DB entry (or prepend if no tempId)
      setPurchases(prev => tempId
        ? prev.map(x => x.id === tempId ? real : x)
        : [real, ...prev]
      );
    }
    return error;
  },[session]);

  const deletePurchase = useCallback(async (id)=>{
    await supabase.from("purchases").delete().eq("id",id);
    setPurchases(prev=>prev.filter(x=>x.id!==id));
  },[]);

  const addVendorDB = useCallback(async (v)=>{
    const row = { user_id:session.user.id, ...v };
    const { data, error } = await supabase.from("vendors").insert(row).select().single();
    if (!error && data) setVendors(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));
    return error;
  },[session]);

  const deleteVendorDB = useCallback(async (id)=>{
    await supabase.from("vendors").delete().eq("id",id);
    setVendors(prev=>prev.filter(x=>x.id!==id));
  },[]);

  const updateVendorDB = useCallback(async (id, updates)=>{
    const row = { name:capFirst((updates.name||"").trim()), category:updates.category||"General",
      contact:updates.contact||"", phone:updates.phone||"", address:updates.address||"" };
    const { error } = await supabase.from("vendors").update(row).eq("id",id);
    if (!error) setVendors(prev=>prev.map(v=>v.id===id?{...v,...row}:v));
    return error;
  },[]);

  const addCatalogItemDB = useCallback(async (ci)=>{
    const row = { user_id:session.user.id, item:ci.item, category:ci.category, vendor:ci.vendor, price:ci.price, date:ci.date };
    const { data, error } = await supabase.from("catalog_items").insert(row).select().single();
    if (!error && data) setCatalogItems(prev=>[...prev,{...data,price:Number(data.price)}].sort((a,b)=>a.item.localeCompare(b.item)));
    return error;
  },[session]);

  const deleteCatalogItemDB = useCallback(async (id)=>{
    await supabase.from("catalog_items").delete().eq("id",id);
    setCatalogItems(prev=>prev.filter(x=>x.id!==id));
  },[]);

  const saveVendorFilters = useCallback(async (filters) => {
    if (!session) return;
    setVendorFilters(filters);
    await supabase.from("profiles").update({ vendor_filters: JSON.stringify(filters) }).eq("id", session.user.id);
  }, [session]);

  const navigateTo = useCallback(async (p) => {
    setPage(p);
    if (session) {
      await supabase.from("profiles").update({ last_page: p }).eq("id", session.user.id);
    }
  }, [session]);

  const saveProfile = useCallback(async (updates)=>{
    const row = {
      full_name:    updates.name,
      role:         updates.role,
      organization: updates.org,
      phone:        updates.phone,
      currency:     updates.currency,
      date_format:  updates.dateFormat,
      default_cat:  updates.defaultCat,
      company_name: updates.companyName || "",
      footer_note:  updates.footerNote  || "",
    };
    const { error } = await supabase.from("profiles").update(row).eq("id", session.user.id);
    if (!error) setProfileState(prev => ({ ...prev, ...updates }));
    return error;
  },[session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setShowLanding(false);
    setPage("home");
  };

  // ── Render states ──

  // Still checking auth
  if (session === undefined) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.mainBg }}>
      <GS/>
      <div style={{ textAlign:"center", color:T.t3 }}>
        <div className="spin" style={{ width:36, height:36, border:`3px solid ${T.border}`, borderTopColor:T.teal,
          borderRadius:"50%", margin:"0 auto 14px" }}/>
        <div style={{ fontSize:13 }}>Loading…</div>
      </div>
    </div>
  );

  // No session — show auth or guest catalog
  if (!session) {
    return <LandingPage onLogin={()=>{}} />;
  }

  // Locked account screen
  if (profile?.isLocked) {
    return <LockedScreen onSignOut={signOut} />;
  }

  // Waiting for data
  const prof = profile || { name: session.user.email, role:"", email:session.user.email, org:"", phone:"", currency:"MWK", dateFormat:"YYYY-MM-DD", defaultCat:"Foods", companyName:"", footerNote:"", isAdmin:false };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV = [
    { id:"home",      icon:"🏠", label:"Home" },
    { id:"purchases", icon:"🛒", label:"Purchases" },
    { id:"vendors",   icon:"🏭", label:"Vendors" },
    { id:"insights",  icon:"📊", label:"Insights" },
    { id:"reports",   icon:"📋", label:"Reports" },
    { id:"catalog",   icon:"📖", label:"Catalog" },
    { id:"market",    icon:"🌍", label:"Market" },
    ...(prof.isAdmin ? [{ id:"admin", icon:"🛡️", label:"Admin", badge:"ADMIN" }] : []),
  ];

  // Bottom nav shows the 5 most important pages on mobile
  const BOTTOM_NAV = [
    { id:"home",      icon:"🏠", label:"Home" },
    { id:"purchases", icon:"🛒", label:"Purchases" },
    { id:"catalog",   icon:"📖", label:"Catalog" },
    { id:"vendors",   icon:"🏭", label:"Vendors" },
    { id:"more",      icon:"☰",  label:"More" },
  ];

  const goTo = (id) => {
    if (id === "more") { setSidebarOpen(true); return; }
    navigateTo(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", background:T.mainBg, fontFamily:"'Sora', sans-serif", overflow:"hidden", position:"fixed", top:0, left:0 }}>
      <GS />

      {/* ── Desktop Sidebar ── */}
      <div className="desktop-sidebar" style={{ width:200, background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0, borderRight:`1px solid ${T.border}` }}>
        {/* User */}
        <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#f59e0b)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>
              {prof.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.t1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{prof.name}</div>
              {prof.role && <div style={{ fontSize:10, color:T.t3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{prof.role}</div>}
            </div>
          </div>
        </div>
        {/* Nav */}
        <div style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>navigateTo(n.id)} badge={n.badge}/>)}
        </div>
        {/* Bottom */}
        <div style={{ padding:"10px 8px 14px", borderTop:`1px solid ${T.border}`, display:"flex", flexDirection:"column", gap:2 }}>
          <NavItem icon="⚙️" label="Settings" active={page==="settings"} onClick={()=>navigateTo("settings")}/>
          <NavItem icon="🚪" label="Sign Out" active={false} onClick={signOut}/>
        </div>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} style={{zIndex:300}}>
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute", left:0, top:0, bottom:0, width:240,
            background:T.sidebar, display:"flex", flexDirection:"column",
            borderRight:`1px solid ${T.border}`, animation:"slideIn 0.22s ease",
          }}>
            {/* User */}
            <div style={{ padding:"18px 14px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#f59e0b)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {prof.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>{prof.name}</div>
                  {prof.role && <div style={{ fontSize:10, color:T.t3 }}>{prof.role}</div>}
                </div>
              </div>
              <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", color:T.t3, fontSize:20, cursor:"pointer", padding:"4px 6px" }}>×</button>
            </div>
            {/* Full nav */}
            <div style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
              {NAV.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>goTo(n.id)} badge={n.badge}/>)}
            </div>
            <div style={{ padding:"10px 8px 20px", borderTop:`1px solid ${T.border}`, display:"flex", flexDirection:"column", gap:2 }}>
              <NavItem icon="⚙️" label="Settings" active={page==="settings"} onClick={()=>goTo("settings")}/>
              <NavItem icon="🚪" label="Sign Out" active={false} onClick={signOut}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="main-content-area" style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"20px 22px", position:"relative", minWidth:0, maxWidth:"100%" }}>

        {/* Mobile Header */}
        <div className="mobile-header">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${T.teal},${T.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🛒</div>
            <span style={{ fontSize:14, fontWeight:800, color:T.t1 }}>ProcureDesk</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {dataLoading && <div className="spin" style={{ width:14, height:14, border:`2px solid ${T.border}`, borderTopColor:T.teal, borderRadius:"50%" }}/>}
            <button onClick={()=>setSidebarOpen(true)}
              style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, color:T.t2, fontSize:18, cursor:"pointer", padding:"5px 9px", lineHeight:1 }}>☰</button>
          </div>
        </div>

        {/* Block render until profile loaded */}
        {!profile && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:T.mainBg, zIndex:20 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
              <div className="spin" style={{ width:32, height:32, border:`3px solid ${T.border}`, borderTopColor:T.teal, borderRadius:"50%" }}/>
              <span style={{ fontSize:12, color:T.t3 }}>Loading your workspace…</span>
            </div>
          </div>
        )}
        {/* Data syncing indicator — desktop only */}
        {dataLoading && profile && (
          <div className="desktop-sidebar" style={{ position:"absolute", top:16, right:24, display:"flex", alignItems:"center", gap:8,
            background:T.cardBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 12px", zIndex:10 }}>
            <div className="spin" style={{ width:12, height:12, border:`2px solid ${T.border}`, borderTopColor:T.teal, borderRadius:"50%" }}/>
            <span style={{ fontSize:11, color:T.t2 }}>Syncing…</span>
          </div>
        )}

        {page==="home"      && <Home purchases={purchases} vendors={vendors} go={navigateTo} profile={prof}
            openNewPurchase={()=>{ navigateTo("purchases"); setNewPurchaseOpen(true); }}
            openAddVendor={()=>{ navigateTo("vendors"); setAddVendorOpen(true); }}/>}
        {page==="purchases" && <Purchases purchases={purchases} setPurchases={setPurchases}
            vendors={vendors} catalogItems={catalogItems}
            modalOpen={newPurchaseOpen} setModalOpen={setNewPurchaseOpen}
            addPurchaseDB={addPurchase} deletePurchaseDB={deletePurchase} addVendorDB={addVendorDB}/>}
        {page==="vendors"   && <Vendors vendors={vendors} setVendors={setVendors}
            purchases={purchases} setPurchases={setPurchases}
            addVendorDB={addVendorDB} deleteVendorDB={deleteVendorDB} updateVendorDB={updateVendorDB}
            triggerAdd={addVendorOpen} clearTriggerAdd={()=>setAddVendorOpen(false)}
            savedFilters={vendorFilters} onFiltersChange={saveVendorFilters}/>}
        {page==="insights"  && <Insights purchases={purchases}/>}
        {page==="reports"   && <Reports purchases={purchases} vendors={vendors} session={session} isAdmin={prof.isAdmin}/>}
        {page==="catalog"   && <Catalog purchases={purchases} vendors={vendors}
            catalogItems={catalogItems} addCatalogItem={addCatalogItemDB} deleteCatalogItem={deleteCatalogItemDB}/>}
        {page==="market"    && <MarketPage session={session}/>}
        {page==="settings"  && <Settings profile={prof} setProfile={saveProfile}/>}
        {page==="admin"     && prof.isAdmin && <AdminPanel session={session}/>}
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        {BOTTOM_NAV.map(n => (
          <button key={n.id} className={`mob-nav-item${(page===n.id)||(n.id==="more"&&!BOTTOM_NAV.find(x=>x.id===page&&x.id!=="more"))?"":""} ${page===n.id?"active":""}`}
            onClick={()=>goTo(n.id)}>
            <span className="mob-nav-icon">{n.icon}</span>
            <span className="mob-nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
