import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";


const CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health","Utilities","Other"];
const CAT_COLORS = { Food:"#22c55e", Transport:"#4ade80", Shopping:"#86efac", Entertainment:"#bbf7d0", Health:"#16a34a", Utilities:"#15803d", Other:"#166534" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = n => "₹" + Number(n).toLocaleString("en-IN");

const GUIDE_DATA = [
  { id:1, title:"Zomato Order", amount:450, category:"Food", date:"2026-03-01" },
  { id:2, title:"Metro Weekly Pass", amount:200, category:"Transport", date:"2026-03-03" },
  { id:3, title:"Netflix Subscription", amount:199, category:"Entertainment", date:"2026-03-05" },
  { id:4, title:"Gym Membership", amount:999, category:"Health", date:"2026-03-07" },
  { id:5, title:"Electricity Bill", amount:1200, category:"Utilities", date:"2026-03-10" },
  { id:6, title:"Amazon Gadget", amount:2499, category:"Shopping", date:"2026-03-12" },
  { id:7, title:"Restaurant Dinner", amount:750, category:"Food", date:"2026-03-15" },
  { id:8, title:"Uber Ride", amount:320, category:"Transport", date:"2026-03-18" },
  { id:9, title:"Chemist Store", amount:430, category:"Health", date:"2026-02-10" },
  { id:10, title:"Grocery Run", amount:890, category:"Food", date:"2026-02-14" },
  { id:11, title:"DMRC Bus", amount:50, category:"Transport", date:"2026-02-20" },
  { id:12, title:"PVR Movie Night", amount:600, category:"Entertainment", date:"2026-02-22" },
];

/* ─── LOCALSTORAGE HELPERS ──────────────────────────────── */
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};


function Icon({ name, size=18, color="currentColor", strokeWidth=1.5 }) {
  const s = { width:size, height:size, display:"block", flexShrink:0 };
  const p = { stroke:color, strokeWidth, fill:"none", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    logo:          <svg style={s} viewBox="0 0 32 32" fill="none"><rect x="2" y="2" width="28" height="28" rx="7" stroke={color} strokeWidth={strokeWidth} fill="none"/><path d="M21 11.5C19.5 9.5 13 9 11 14C9 19 13 23 18 22.5C20 22.3 21.5 21 22 20" {...p}/><line x1="16" y1="7" x2="16" y2="10" {...p}/><line x1="16" y1="22" x2="16" y2="25" {...p}/></svg>,
    dashboard:     <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" {...p}/><rect x="14" y="3" width="7" height="7" rx="1.5" {...p}/><rect x="3" y="14" width="7" height="7" rx="1.5" {...p}/><rect x="14" y="14" width="7" height="7" rx="1.5" {...p}/></svg>,
    expenses:      <svg style={s} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" {...p}/><rect x="9" y="3" width="6" height="4" rx="1" {...p}/><line x1="9" y1="12" x2="15" y2="12" {...p}/><line x1="9" y1="16" x2="13" y2="16" {...p}/></svg>,
    guide:         <svg style={s} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" {...p}/><line x1="9" y1="8" x2="15" y2="8" {...p}/><line x1="9" y1="12" x2="15" y2="12" {...p}/></svg>,
    plus:          <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" {...p}/><line x1="5" y1="12" x2="19" y2="12" {...p}/></svg>,
    close:         <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" {...p}/><line x1="6" y1="6" x2="18" y2="18" {...p}/></svg>,
    logout:        <svg style={s} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" {...p}/><polyline points="16 17 21 12 16 7" {...p}/><line x1="21" y1="12" x2="9" y2="12" {...p}/></svg>,
    edit:          <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...p}/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p}/></svg>,
    trash:         <svg style={s} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" {...p}/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" {...p}/><line x1="10" y1="11" x2="10" y2="17" {...p}/><line x1="14" y1="11" x2="14" y2="17" {...p}/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" {...p}/></svg>,
    pie:           <svg style={s} viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 118 2.83" {...p}/><path d="M22 12A10 10 0 0012 2v10z" {...p}/></svg>,
    bar:           <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" {...p}/><line x1="12" y1="20" x2="12" y2="4" {...p}/><line x1="6" y1="20" x2="6" y2="14" {...p}/><line x1="2" y1="20" x2="22" y2="20" {...p}/></svg>,
    food:          <svg style={s} viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1" {...p}/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" {...p}/><line x1="6" y1="1" x2="6" y2="4" {...p}/><line x1="10" y1="1" x2="10" y2="4" {...p}/><line x1="14" y1="1" x2="14" y2="4" {...p}/></svg>,
    transport:     <svg style={s} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2" {...p}/><path d="M16 8h4l3 3v5h-7V8z" {...p}/><circle cx="5.5" cy="18.5" r="2.5" {...p}/><circle cx="18.5" cy="18.5" r="2.5" {...p}/></svg>,
    shopping:      <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" {...p}/><line x1="3" y1="6" x2="21" y2="6" {...p}/><path d="M16 10a4 4 0 01-8 0" {...p}/></svg>,
    entertainment: <svg style={s} viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7" {...p}/><rect x="1" y="5" width="15" height="14" rx="2" {...p}/></svg>,
    health:        <svg style={s} viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" {...p}/></svg>,
    utilities:     <svg style={s} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...p}/></svg>,
    other:         <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><line x1="12" y1="8" x2="12" y2="12" {...p}/><circle cx="12" cy="16" r="0.5" fill={color}/></svg>,
    wallet:        <svg style={s} viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4" {...p}/><path d="M3 5v14a2 2 0 002 2h16v-5" {...p}/><path d="M18 12a2 2 0 000 4h4v-4z" {...p}/></svg>,
    receipt:       <svg style={s} viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" {...p}/><line x1="8" y1="9" x2="16" y2="9" {...p}/><line x1="8" y1="13" x2="14" y2="13" {...p}/></svg>,
    tag:           <svg style={s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" {...p}/><circle cx="7" cy="7" r="1" fill={color}/></svg>,
    trend:         <svg style={s} viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" {...p}/><polyline points="16 7 22 7 22 13" {...p}/></svg>,
    user:          <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...p}/><circle cx="12" cy="7" r="4" {...p}/></svg>,
    lock:          <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" {...p}/><path d="M7 11V7a5 5 0 0110 0v4" {...p}/></svg>,
    eye:           <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></svg>,
    eyeoff:        <svg style={s} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" {...p}/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" {...p}/><line x1="1" y1="1" x2="23" y2="23" {...p}/></svg>,
    info:          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><line x1="12" y1="16" x2="12" y2="12" {...p}/><circle cx="12" cy="8" r="0.5" fill={color}/></svg>,
    check:         <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" {...p}/></svg>,
    empty:         <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><line x1="8" y1="12" x2="16" y2="12" {...p}/></svg>,
    sparkle:       <svg style={s} viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" {...p}/></svg>,
    shield:        <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/></svg>,
    chart:         <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" {...p}/><line x1="12" y1="20" x2="12" y2="4" {...p}/><line x1="6" y1="20" x2="6" y2="14" {...p}/><line x1="2" y1="20" x2="22" y2="20" {...p}/></svg>,
  };
  return icons[name] || icons.other;
}

const CAT_ICON = { Food:"food", Transport:"transport", Shopping:"shopping", Entertainment:"entertainment", Health:"health", Utilities:"utilities", Other:"other" };

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a0a0a", border:"1px solid #22c55e55", borderRadius:8, padding:"8px 14px" }}>
      <p style={{ color:"#4ade80", fontWeight:700, fontSize:12, fontFamily:"'Space Mono',monospace" }}>{payload[0].name || payload[0].payload?.month}</p>
      <p style={{ color:"#fff", fontSize:13 }}>{fmt(payload[0].value)}</p>
    </div>
  );
}

const G = { bg:"#080808", card:"#0f0f0f", border:"#1a2e1a", green:"#22c55e", greenL:"#4ade80", text:"#f0fff4", muted:"#4b6b4b" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#1a3a1a;border-radius:4px;}
  input,select{outline:none;font-family:'Outfit',sans-serif;}
  input::placeholder{color:#2d4d2d;}
  .btn{cursor:pointer;border:none;font-family:'Outfit',sans-serif;transition:all 0.16s ease;}
  .btn:hover{filter:brightness(1.12);}
  .btn:active{transform:scale(0.96);}
  .fade{animation:fu 0.3s ease both;}
  @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .slide-r{animation:sr 0.4s ease both;}
  @keyframes sr{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
  .row:hover{background:#0c1f0c;}
  .pill{border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;letter-spacing:0.4px;white-space:nowrap;}
  .grid-bg{background-image:linear-gradient(#1a2e1a 1px,transparent 1px),linear-gradient(90deg,#1a2e1a 1px,transparent 1px);background-size:44px 44px;}
  @media(max-width:640px){
    .desktop-nav{display:none!important;}
    .desktop-right{display:none!important;}
    .mobile-bottom{display:flex!important;}
    .hide-sm{display:none!important;}
    .stat-grid{grid-template-columns:1fr 1fr!important;}
    .form-grid{grid-template-columns:1fr!important;}
    .main-pad{padding:16px 12px 80px!important;}
    .auth-left{display:none!important;}
    .auth-wrap{min-height:100vh!important;}
    .auth-right{border-radius:0!important;min-height:100vh!important;justify-content:center!important;}
  }
  @media(min-width:641px){
    .mobile-bottom{display:none!important;}
    .form-grid{grid-template-columns:1fr 1fr!important;}
  }
  @media(min-width:900px){
    .form-grid{grid-template-columns:repeat(4,1fr)!important;}
  }
`;


export default function Cashmera() {

  const [users,   setUsersState]   = useState(() => LS.get("cashmera_users", []));
  const [allExp,  setAllExpState]  = useState(() => LS.get("cashmera_expenses", {}));
  const [session, setSession]      = useState(() => LS.get("cashmera_session", null));
  const [screen,  setScreen]       = useState(() => LS.get("cashmera_session", null) ? "app" : "login");
  const [authErr, setAuthErr]      = useState("");
  const [af, setAf]  = useState({ name:"", username:"", password:"", confirm:"" });
  const [showPw, setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);


  const setUsers = v => { setUsersState(v); LS.set("cashmera_users", v); };
 
  const setAllExp = fn => setAllExpState(prev => {
    const next = typeof fn === "function" ? fn(prev) : fn;
    LS.set("cashmera_expenses", next);
    return next;
  });

  const current  = session ? users.find(u => u.username === session) || null : null;
  const expenses = current ? (allExp[current.username] || []) : [];

  const setExpenses = fn => setAllExp(prev => {
    const cur  = prev[current.username] || [];
    const next = typeof fn === "function" ? fn(cur) : fn;
    return { ...prev, [current.username]: next };
  });

  function login() {
    const u = users.find(u => u.username === af.username && u.password === af.password);
    if (!u) { setAuthErr("Invalid username or password."); return; }
    LS.set("cashmera_session", u.username);
    setSession(u.username); setScreen("app"); setAuthErr("");
  }
  function signup() {
    if (!af.name || !af.username || !af.password) { setAuthErr("All fields are required."); return; }
    if (af.password !== af.confirm) { setAuthErr("Passwords do not match."); return; }
    if (users.find(u => u.username === af.username)) { setAuthErr("Username already taken."); return; }
    const u = { name:af.name, username:af.username, password:af.password };
    setUsers([...users, u]);
    LS.set("cashmera_session", u.username);
    setSession(u.username); setScreen("app"); setAuthErr("");
  }
  function logout() {
    LS.set("cashmera_session", null);
    setSession(null); setScreen("login");
    setAf({ name:"", username:"", password:"", confirm:"" });
  }

 
  if (screen === "login" || screen === "signup") {
    const isLogin = screen === "login";
    return (
      <div style={{ minHeight:"100vh", background:G.bg, display:"flex", fontFamily:"'Outfit',sans-serif" }}>
        <style>{CSS}</style>

        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ flex:1, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48 }}>
          <div className="grid-bg" style={{ position:"absolute", inset:0, opacity:0.18 }} />
          {/* Glow orbs */}
          <div style={{ position:"absolute", top:"15%", left:"20%", width:280, height:280, background:"radial-gradient(circle,#22c55e28,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"10%", right:"10%", width:200, height:200, background:"radial-gradient(circle,#16a34a18,transparent 70%)", pointerEvents:"none" }} />

          {/* Decorative illustration */}
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            {/* Big logo mark */}
            <div style={{ marginBottom:40, display:"flex", justifyContent:"center" }}>
              <div style={{ width:110, height:110, border:"2px solid #22c55e", borderRadius:28, display:"flex", alignItems:"center", justifyContent:"center", background:"#0f0f0f", boxShadow:"0 0 60px #22c55e33" }}>
                <Icon name="logo" size={60} color="#22c55e" strokeWidth={1.2} />
              </div>
            </div>

            {/* Feature pills */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, alignItems:"flex-start", maxWidth:320 }}>
              {[
                { icon:"wallet",  text:"Track every rupee, effortlessly" },
                { icon:"chart",   text:"Visualise spending with live charts" },
                { icon:"shield",  text:"Your data stays private & local" },
                { icon:"sparkle", text:"Beautiful dark interface, always" },
              ].map(f => (
                <div key={f.text} style={{ display:"flex", alignItems:"center", gap:14, background:"#0f0f0f", border:"1px solid #1a2e1a", borderRadius:12, padding:"13px 18px", width:"100%" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#0d2e0d", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon name={f.icon} size={18} color="#22c55e" />
                  </div>
                  <span style={{ fontSize:14, color:"#c8e6c8", fontWeight:500, lineHeight:1.4 }}>{f.text}</span>
                </div>
              ))}
            </div>

            <p style={{ marginTop:36, color:G.muted, fontSize:12, letterSpacing:1.5, textTransform:"uppercase" }}>
              CASHMERA · Your money, magnified
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ── */}
        <div className="auth-right" style={{ width:"min(520px,100%)", background:"#0a0a0a", borderLeft:"1px solid #1a2e1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"48px 40px", overflowY:"auto", minHeight:"100vh" }}>
          <div className="slide-r" style={{ width:"100%", maxWidth:420 }}>

            {/* Logo wordmark */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
              <div style={{ width:40, height:40, border:"1px solid #22c55e", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", background:"#0f0f0f", boxShadow:"0 0 20px #22c55e22" }}>
                <Icon name="logo" size={24} color="#22c55e" strokeWidth={1.5} />
              </div>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700, color:"#22c55e", letterSpacing:2 }}>CASHMERA</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily:"'Space Mono',monospace", fontSize:26, fontWeight:700, color:"#f0fff4", lineHeight:1.25, marginBottom:6 }}>
              {isLogin ? "Welcome back_" : "Get started_"}
            </h1>
            <p style={{ color:G.muted, fontSize:14, marginBottom:32 }}>
              {isLogin ? "Sign in to your Cashmera account" : "Create your free account in seconds"}
            </p>

            {/* Form fields */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {!isLogin && (
                <AuthField label="Full Name" icon="user" value={af.name} onChange={v=>setAf({...af,name:v})} placeholder="e.g. Arjun Sharma" />
              )}
              <AuthField label="Username" icon="user" value={af.username} onChange={v=>setAf({...af,username:v})} placeholder="e.g. arjun99" />
              <AuthField label="Password" icon="lock" type={showPw?"text":"password"} value={af.password} onChange={v=>setAf({...af,password:v})} placeholder="••••••••"
                right={
                  <button className="btn" onClick={()=>setShowPw(!showPw)} style={{background:"none",padding:0,display:"flex",alignItems:"center"}}>
                    <Icon name={showPw?"eyeoff":"eye"} size={15} color={G.muted}/>
                  </button>
                }
              />
              {!isLogin && (
                <AuthField label="Confirm Password" icon="lock" type={showCPw?"text":"password"} value={af.confirm} onChange={v=>setAf({...af,confirm:v})} placeholder="••••••••"
                  right={
                    <button className="btn" onClick={()=>setShowCPw(!showCPw)} style={{background:"none",padding:0,display:"flex",alignItems:"center"}}>
                      <Icon name={showCPw?"eyeoff":"eye"} size={15} color={G.muted}/>
                    </button>
                  }
                />
              )}

              {authErr && (
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"#f87171", fontSize:13, background:"#1a0808", border:"1px solid #3a1414", borderRadius:10, padding:"10px 14px" }}>
                  <Icon name="info" size={14} color="#f87171" /> {authErr}
                </div>
              )}

              <button className="btn" onClick={isLogin ? login : signup}
                style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#000", padding:"15px", borderRadius:12, fontWeight:700, fontSize:15, marginTop:4, boxShadow:"0 4px 24px #22c55e33", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:0.3 }}>
                <Icon name={isLogin?"logout":"check"} size={16} color="#000" />
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>

            {/* Toggle */}
            <div style={{ marginTop:28, padding:"18px", background:"#0f0f0f", border:"1px solid #1a2e1a", borderRadius:12, textAlign:"center" }}>
              <p style={{ fontSize:14, color:G.muted }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span style={{ color:G.green, cursor:"pointer", fontWeight:700 }} onClick={()=>{setScreen(isLogin?"signup":"login");setAuthErr("");}}>
                  {isLogin ? "Sign up free" : "Sign in"}
                </span>
              </p>
            </div>

            {isLogin && users.length > 0 && (
              <p style={{ marginTop:16, fontSize:11, color:"#2a4a2a", textAlign:"center", fontFamily:"'Space Mono',monospace", letterSpacing:0.5 }}>
                {users.length} account{users.length>1?"s":""} saved locally
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <App current={current} expenses={expenses} setExpenses={setExpenses} logout={logout} />;
}

//AUTH FIELD 
function AuthField({ label, icon, type="text", value, onChange, placeholder, right }) {
  return (
    <div>
      <label style={{ fontSize:11, color:G.muted, fontWeight:600, display:"block", marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", background:"#080808", border:"1px solid #1e3e1e", borderRadius:10, padding:"12px 14px", gap:10, transition:"border-color 0.15s" }}>
        <Icon name={icon} size={15} color={G.muted} />
        <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
          style={{ flex:1, background:"transparent", color:"#f0fff4", fontSize:14, border:"none", minWidth:0 }} />
        {right}
      </div>
    </div>
  );
}

//app
function App({ current, expenses, setExpenses, logout }) {
  const [tab, setTab]         = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ title:"", amount:"", category:"Food", date:new Date().toISOString().split("T")[0] });
  const [editId, setEditId]   = useState(null);
  const [filterCat, setFilterCat]     = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [chartType, setChartType]     = useState("pie");

  const filtered = useMemo(()=>expenses.filter(e=>{
    const c = filterCat==="All"||e.category===filterCat;
    const m = filterMonth==="All"||new Date(e.date).getMonth()===parseInt(filterMonth);
    return c&&m;
  }),[expenses,filterCat,filterMonth]);

  const total = filtered.reduce((s,e)=>s+Number(e.amount),0);

  const pieData = useMemo(()=>{
    const m={};filtered.forEach(e=>{m[e.category]=(m[e.category]||0)+Number(e.amount);});
    return Object.entries(m).map(([name,value])=>({name,value}));
  },[filtered]);

  const barData = useMemo(()=>{
    const m={};expenses.forEach(e=>{const mo=MONTHS[new Date(e.date).getMonth()];m[mo]=(m[mo]||0)+Number(e.amount);});
    return MONTHS.filter(mo=>m[mo]).map(mo=>({month:mo,amount:m[mo]}));
  },[expenses]);

  const topCat = [...pieData].sort((a,b)=>b.value-a.value)[0]?.name||"—";

  const guidePie   = useMemo(()=>{const m={};GUIDE_DATA.forEach(e=>{m[e.category]=(m[e.category]||0)+e.amount;});return Object.entries(m).map(([name,value])=>({name,value}));},[]);
  const guideBar   = useMemo(()=>{const m={};GUIDE_DATA.forEach(e=>{const mo=MONTHS[new Date(e.date).getMonth()];m[mo]=(m[mo]||0)+e.amount;});return MONTHS.filter(mo=>m[mo]).map(mo=>({month:mo,amount:m[mo]}));},[]);
  const guideTotal = GUIDE_DATA.reduce((s,e)=>s+e.amount,0);
  const guideTop   = [...guidePie].sort((a,b)=>b.value-a.value)[0]?.name||"—";

  const isGuide = tab==="guide";
  const D = {
    pie:isGuide?guidePie:pieData, bar:isGuide?guideBar:barData,
    total:isGuide?guideTotal:total, topCat:isGuide?guideTop:topCat,
    list:isGuide?GUIDE_DATA:filtered, count:isGuide?GUIDE_DATA.length:filtered.length,
  };

  function submit() {
    if (!form.title||!form.amount||!form.date) return;
    if (editId!==null) { setExpenses(prev=>prev.map(e=>e.id===editId?{...form,id:editId,amount:Number(form.amount)}:e)); setEditId(null); }
    else { setExpenses(prev=>[...prev,{...form,id:Date.now(),amount:Number(form.amount)}]); }
    setForm({title:"",amount:"",category:"Food",date:new Date().toISOString().split("T")[0]});
    setShowForm(false);
  }
  function startEdit(e){ setForm({title:e.title,amount:e.amount,category:e.category,date:e.date}); setEditId(e.id); setShowForm(true); setTab("dashboard"); }
  function del(id){ setExpenses(prev=>prev.filter(e=>e.id!==id)); }

  const navItems = [{key:"dashboard",label:"Dashboard",icon:"dashboard"},{key:"expenses",label:"Expenses",icon:"expenses"},{key:"guide",label:"Guide",icon:"guide"}];

  const statCards = [
    {label:"Total Spent",  value:fmt(D.total),   icon:"wallet",  c:"#22c55e"},
    {label:"Transactions", value:D.count,          icon:"receipt", c:"#4ade80"},
    {label:"Top Category", value:D.topCat,         icon:CAT_ICON[D.topCat]||"other", c:"#86efac"},
    {label:"Avg / Txn",    value:D.count?fmt(Math.round(D.total/D.count)):"₹0", icon:"trend", c:"#bbf7d0"},
  ];

  return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Outfit',sans-serif",color:G.text}}>
      <style>{CSS}</style>

      {/* ══ HEADER ══ */}
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #1a2e1a",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:60,boxShadow:"0 1px 0 #1a2e1a"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Icon name="logo" size={26} color="#22c55e" strokeWidth={1.5}/>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700,color:"#22c55e",letterSpacing:2}}>CASHMERA</span>
        </div>

        <div className="desktop-nav" style={{display:"flex",gap:2}}>
          {navItems.map(n=>(
            <button key={n.key} className="btn" onClick={()=>setTab(n.key)}
              style={{display:"flex",alignItems:"center",gap:6,background:tab===n.key?"#0d2e0d":"transparent",border:`1px solid ${tab===n.key?"#22c55e44":"transparent"}`,color:tab===n.key?"#22c55e":G.muted,padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600}}>
              <Icon name={n.icon} size={14} color={tab===n.key?"#22c55e":G.muted}/>{n.label}
            </button>
          ))}
        </div>

        <div className="desktop-right" style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:G.muted}}>
            <Icon name="user" size={13} color={G.muted}/>{current.name.split(" ")[0]}
          </div>
          {!isGuide&&(
            <button className="btn" onClick={()=>{setShowForm(!showForm);setEditId(null);setForm({title:"",amount:"",category:"Food",date:new Date().toISOString().split("T")[0]});}}
              style={{display:"flex",alignItems:"center",gap:6,background:showForm?"#111":"linear-gradient(135deg,#16a34a,#22c55e)",color:showForm?G.muted:"#000",padding:"7px 14px",borderRadius:9,fontWeight:700,fontSize:13,boxShadow:showForm?"none":"0 0 14px #22c55e2a"}}>
              <Icon name={showForm?"close":"plus"} size={13} color={showForm?G.muted:"#000"}/>{showForm?"Cancel":"Add Expense"}
            </button>
          )}
          <button className="btn" onClick={logout} style={{background:"transparent",border:"1px solid #1a2e1a",color:G.muted,padding:"7px 10px",borderRadius:9,display:"flex",alignItems:"center",gap:5,fontSize:13}}>
            <Icon name="logout" size={13} color={G.muted}/>
          </button>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div className="main-pad" style={{maxWidth:980,margin:"0 auto",padding:"22px 20px 40px"}}>

        {/* GUIDE BANNER */}
        {isGuide&&(
          <div className="fade" style={{background:"#091409",border:"1px solid #22c55e22",borderRadius:12,padding:"18px 20px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Icon name="guide" size={16} color="#22c55e"/>
              <h2 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:13}}>Reference Example</h2>
              <span style={{fontSize:10,color:"#22c55e",background:"#0d2e0d",border:"1px solid #22c55e2a",borderRadius:5,padding:"2px 8px",fontWeight:700,letterSpacing:0.5,marginLeft:4}}>DEMO</span>
            </div>
            <p style={{color:"#4b7a4b",fontSize:13,lineHeight:1.8}}>
              This is a sample dataset showing how Cashmera looks when in use. Switch to <b style={{color:"#4ade80"}}>Dashboard</b> and click <b style={{color:"#4ade80"}}>Add Expense</b> to track your own — your data saves automatically.
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {["Enter title & amount","Pick a category","Set the date","Charts update live","Data auto-saved"].map((s,i)=>(
                <div key={i} style={{background:"#0d2e0d",border:"1px solid #22c55e1a",borderRadius:7,padding:"5px 12px",fontSize:11,color:"#4ade80",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"#22c55e",fontFamily:"'Space Mono',monospace",fontWeight:700}}>0{i+1}</span>{s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD/EDIT FORM */}
        {showForm&&!isGuide&&(
          <div className="fade" style={{background:G.card,border:"1px solid #22c55e33",borderRadius:12,padding:"20px",marginBottom:20,boxShadow:"0 0 30px #22c55e0a"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <Icon name={editId!==null?"edit":"plus"} size={15} color="#22c55e"/>
              <h3 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:13}}>{editId!==null?"Edit Expense_":"New Expense_"}</h3>
            </div>
            <div className="form-grid" style={{display:"grid",gap:12}}>
              {[{l:"Title",k:"title",t:"text",p:"e.g. Swiggy order"},{l:"Amount (₹)",k:"amount",t:"number",p:"e.g. 350"},{l:"Date",k:"date",t:"date"}].map(f=>(
                <div key={f.k}>
                  <label style={{fontSize:10,color:G.muted,fontWeight:600,display:"block",marginBottom:5,letterSpacing:1,textTransform:"uppercase"}}>{f.l}</label>
                  <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                    style={{width:"100%",background:"#080808",border:"1px solid #1e3e1e",borderRadius:9,padding:"10px 12px",color:"#f0fff4",fontSize:13}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:10,color:G.muted,fontWeight:600,display:"block",marginBottom:5,letterSpacing:1,textTransform:"uppercase"}}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                  style={{width:"100%",background:"#080808",border:"1px solid #1e3e1e",borderRadius:9,padding:"10px 12px",color:"#f0fff4",fontSize:13,cursor:"pointer"}}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button className="btn" onClick={submit}
              style={{marginTop:14,background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#000",padding:"11px 22px",borderRadius:9,fontWeight:700,fontSize:13,boxShadow:"0 4px 14px #22c55e2a",display:"flex",alignItems:"center",gap:7}}>
              <Icon name="check" size={14} color="#000"/>{editId!==null?"Save Changes":"Add Expense"}
            </button>
          </div>
        )}

        {/* FILTERS */}
        {!isGuide&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
              style={{background:G.card,border:"1px solid #1a2e1a",color:"#4ade80",padding:"7px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
              style={{background:G.card,border:"1px solid #1a2e1a",color:"#4ade80",padding:"7px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              <option value="All">All Months</option>
              {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        {/* EMPTY STATE */}
        {tab==="dashboard"&&expenses.length===0&&(
          <div className="fade" style={{background:G.card,border:"1px dashed #1a3a1a",borderRadius:12,padding:"60px 20px",textAlign:"center"}}>
            <Icon name="empty" size={40} color="#1a3a1a"/>
            <h3 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:14,marginTop:14,marginBottom:8}}>Nothing tracked yet_</h3>
            <p style={{color:G.muted,fontSize:13,marginBottom:16}}>Click <b style={{color:"#4ade80"}}>Add Expense</b> to record your first entry. Everything saves automatically.</p>
            <button className="btn" onClick={()=>setTab("guide")} style={{background:"#0d2e0d",border:"1px solid #22c55e22",color:"#4ade80",padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6}}>
              <Icon name="guide" size={13} color="#4ade80"/>View Guide
            </button>
          </div>
        )}

        {/* STATS + CHARTS */}
        {((tab==="dashboard"&&expenses.length>0)||isGuide)&&(
          <div className="fade">
            <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {statCards.map(s=>(
                <div key={s.label} style={{background:G.card,border:"1px solid #1a2e1a",borderRadius:12,padding:"16px"}}>
                  <Icon name={s.icon} size={16} color={s.c}/>
                  <div style={{fontSize:19,fontWeight:800,color:s.c,marginTop:8,fontFamily:"'Space Mono',monospace",wordBreak:"break-word"}}>{s.value}</div>
                  <div style={{fontSize:11,color:G.muted,marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{background:G.card,border:"1px solid #1a2e1a",borderRadius:12,padding:"18px 16px",marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Icon name={chartType==="pie"?"pie":"bar"} size={14} color="#22c55e"/>
                  <h3 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:12}}>Spending Breakdown</h3>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[["pie","Pie"],["bar","Bar"]].map(([t,l])=>(
                    <button key={t} className="btn" onClick={()=>setChartType(t)}
                      style={{display:"flex",alignItems:"center",gap:5,background:chartType===t?"#0d2e0d":"transparent",border:`1px solid ${chartType===t?"#22c55e44":"#1a2e1a"}`,color:chartType===t?"#22c55e":G.muted,padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:600}}>
                      <Icon name={t} size={12} color={chartType===t?"#22c55e":G.muted}/>{l}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                {chartType==="pie"?(
                  <PieChart>
                    <Pie data={D.pie} cx="50%" cy="50%" innerRadius={56} outerRadius={95} paddingAngle={3} dataKey="value">
                      {D.pie.map(e=><Cell key={e.name} fill={CAT_COLORS[e.name]||"#166534"}/>)}
                    </Pie>
                    <Tooltip content={<ChartTip/>}/>
                    <Legend iconType="circle" iconSize={7} formatter={v=><span style={{color:"#4ade80",fontSize:11}}>{v}</span>}/>
                  </PieChart>
                ):(
                  <BarChart data={D.bar} margin={{left:-16}}>
                    <XAxis dataKey="month" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>"₹"+(v>=1000?(v/1000).toFixed(0)+"k":v)}/>
                    <Tooltip content={<ChartTip/>}/>
                    <defs><linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#16a34a"/></linearGradient></defs>
                    <Bar dataKey="amount" radius={[5,5,0,0]} fill="url(#gbg)"/>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Monthly Summary */}
            <div style={{background:G.card,border:"1px solid #1a2e1a",borderRadius:12,padding:"18px 16px",marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
                <Icon name="trend" size={14} color="#22c55e"/>
                <h3 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:12}}>Monthly Summary</h3>
              </div>
              {(()=>{
                const src=isGuide?GUIDE_DATA:expenses;
                const grand=src.reduce((s,e)=>s+Number(e.amount),0);
                return MONTHS.map((m,i)=>{
                  const t=src.filter(e=>new Date(e.date).getMonth()===i).reduce((s,e)=>s+Number(e.amount),0);
                  if(!t)return null;
                  const pct=Math.round((t/grand)*100);
                  return(
                    <div key={m} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                      <span style={{width:26,fontSize:11,color:G.muted,fontFamily:"'Space Mono',monospace",fontWeight:700,flexShrink:0}}>{m}</span>
                      <div style={{flex:1,background:"#0a0a0a",borderRadius:999,height:5,overflow:"hidden"}}>
                        <div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,#16a34a,#22c55e)",borderRadius:999}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:"#f0fff4",width:76,textAlign:"right",fontFamily:"'Space Mono',monospace",flexShrink:0}}>{fmt(t)}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* EXPENSES / GUIDE LIST */}
        {(tab==="expenses"||isGuide)&&(
          <div className="fade" style={{background:G.card,border:"1px solid #1a2e1a",borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:"1px solid #1a2e1a",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <Icon name="expenses" size={14} color="#22c55e"/>
                <h3 style={{fontFamily:"'Space Mono',monospace",color:"#22c55e",fontSize:12}}>{isGuide?"Sample Expenses_":"All Expenses_"}</h3>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                {isGuide&&<span style={{fontSize:10,color:"#22c55e",background:"#0d2e0d",border:"1px solid #22c55e2a",borderRadius:5,padding:"2px 8px",fontWeight:700}}>DEMO</span>}
                <span style={{fontSize:11,color:G.muted}}>{D.count} records</span>
              </div>
            </div>
            {D.list.length===0?(
              <div style={{padding:44,textAlign:"center"}}><Icon name="empty" size={32} color="#1a3a1a"/><p style={{color:G.muted,fontSize:13,marginTop:10}}>No expenses found.</p></div>
            ):(
              [...D.list].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i,arr)=>(
                <div key={e.id} className="row" style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:i<arr.length-1?"1px solid #0f1f0f":"none",gap:10,transition:"background 0.14s"}}>
                  <div style={{width:34,height:34,borderRadius:9,background:"#0d2e0d",border:"1px solid #1a3a1a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={CAT_ICON[e.category]||"other"} size={15} color={CAT_COLORS[e.category]||"#22c55e"} strokeWidth={1.5}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#f0fff4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                    <div style={{fontSize:11,color:G.muted,marginTop:1}}>{new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                  <span className="pill hide-sm" style={{background:CAT_COLORS[e.category]+"20",color:CAT_COLORS[e.category],flexShrink:0}}>{e.category}</span>
                  <span style={{fontWeight:800,fontSize:13,color:"#22c55e",flexShrink:0,fontFamily:"'Space Mono',monospace",minWidth:72,textAlign:"right"}}>{fmt(e.amount)}</span>
                  {!isGuide&&(
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      <button className="btn" onClick={()=>startEdit(e)} style={{background:"#0d2e0d",border:"1px solid #1a3a1a",color:"#4ade80",padding:"6px 8px",borderRadius:7,display:"flex",alignItems:"center"}}>
                        <Icon name="edit" size={13} color="#4ade80"/>
                      </button>
                      <button className="btn" onClick={()=>del(e.id)} style={{background:"#1a0808",border:"1px solid #3a1414",color:"#f87171",padding:"6px 8px",borderRadius:7,display:"flex",alignItems:"center"}}>
                        <Icon name="trash" size={13} color="#f87171"/>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:36,color:"#1a3a1a",fontSize:10,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>
          CASHMERA · YOUR MONEY, MAGNIFIED
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-bottom" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #1a2e1a",zIndex:70,padding:"6px 0 12px",justifyContent:"space-around",alignItems:"center"}}>
        {navItems.map(n=>(
          <button key={n.key} className="btn" onClick={()=>setTab(n.key)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",color:tab===n.key?"#22c55e":G.muted,padding:"4px 16px"}}>
            <Icon name={n.icon} size={20} color={tab===n.key?"#22c55e":G.muted}/>
            <span style={{fontSize:9,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>{n.label}</span>
          </button>
        ))}
        {!isGuide&&(
          <button className="btn" onClick={()=>{setShowForm(!showForm);setEditId(null);setForm({title:"",amount:"",category:"Food",date:new Date().toISOString().split("T")[0]});}}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",color:"#22c55e",padding:"4px 16px"}}>
            <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#16a34a,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px #22c55e44"}}>
              <Icon name={showForm?"close":"plus"} size={18} color="#000"/>
            </div>
          </button>
        )}
        <button className="btn" onClick={logout}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",color:G.muted,padding:"4px 16px"}}>
          <Icon name="logout" size={20} color={G.muted}/>
          <span style={{fontSize:9,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>Logout</span>
        </button>
      </div>
    </div>
  );
}