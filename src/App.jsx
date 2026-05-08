import { useState, useMemo, useEffect, useCallback } from "react";

// ─── BRAND PALETTE — matched to thepowercoffee.com ───
const C = {
  bg: "#121212",          // site primary dark
  bgWarm: "#1F1B15",      // warm dark (used in site sections)
  bgCard: "#1a1a1a",      // card surfaces
  bgSection: "#242833",   // site dark-blue section
  white: "#ffffff",
  offWhite: "#f3f3f3",    // site light bg
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  accent: "#334fb4",      // site blue accent
  accentLight: "#4d6dd4", // hover/lighter blue
  accentGlow: "rgba(51,79,180,0.3)",
  border: "rgba(255,255,255,0.1)",
  borderAccent: "rgba(51,79,180,0.4)",
  red: "#ea3335",         // site red
  green: "#428445",       // site green
  warmBrown: "#1F1B15",
};

const SHEET_ID = "1cECO9T_Pet00U3O1jERMCAjXRobWWu-FQV_rfGMbeoA";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const fmt = (v) => {
  if (v == null || isNaN(v)) return "\u2014";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 1e6) return `${s}$${(a/1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a/1e3).toFixed(1)}K`;
  return `${s}$${a.toFixed(0)}`;
};
const pct = (v) => (v == null || isNaN(v) ? "\u2014" : `${v.toFixed(2)}%`);

function parseBR(raw) {
  if (!raw) return 0;
  let s = String(raw).replace(/[$\s]/g,"").replace(/\\-/g,"-");
  if (/,\d{2}$/.test(s)) s = s.replace(/\./g,"").replace(",",".");
  else s = s.replace(/\./g,"");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// ─── FALLBACK ───
const FB = {
  monthlyUnits:[150,245,360,450,540,648,778,933,1120,1344,1612,1935,2322,2786,3344,4012,4815,5778],
  price:21.90,
  yearlyRevenue:[221507.68,443015.35,1329046.06,1993569.09,2990353.64,3588424.36,4306109.24],
  yearlyCosts:[306524.42,543435.38,1015501.82,1442739.76,2075350.98,2466654.06,2933841.05],
  yearlyEbitda:[-85016.74,-100420.03,313544.24,550829.33,915002.66,1121770.30,1372268.19],
  yearlyEbitdaPct:[-38.38,-22.67,23.59,27.63,30.60,31.26,31.87],
  yearlyValuation:[-510100.46,-602520.16,1881265.42,3304975.96,5490015.95,6730621.83,8233609.15],
  yearCB:{
    ceo:[60000,66000,72600,79860,87846,96630.6,106293.66],
    coo:[36000,43200,47520,52272,57499.2,63249.12,69574.03],
    mktGtm:[22150.77,24365.84,26802.43,29482.67,32430.94,35674.03,39241.44],
    mktAds:[64491.95,132904.61,132904.61,199356.91,299035.36,358842.44,430610.92],
    warehouse:[15000,45000,49500,54450,59895,65884.5,72472.95],
    cogs:[61900.78,141603.08,424809.24,637213.86,955820.8,1146984.96,1376381.95],
    logistics:[42480.92,84961.85,254885.55,382328.32,573492.48,688190.97,825829.17],
    travel:[4500,5400,6480,7776,9331.2,11197.44,13436.93],
  },
  preMoney:2700000, raise:300000,
  cap:{ postFounder:57, postCofounder:23, investor:10 },
};

function parseCSV(csv) {
  try {
    const lines = csv.split("\n").map(l => {
      const cells = []; let cur = "", q = false;
      for (const ch of l) { if (ch==='"'){q=!q;continue;} if (ch===','&&!q){cells.push(cur.trim());cur="";continue;} cur+=ch; }
      cells.push(cur.trim()); return cells;
    });
    const fr = (lbl) => lines.find(r=>r[0]&&r[0].toLowerCase().includes(lbl.toLowerCase()));
    const trr = fr("Total Revenue (Unit)");
    const pr = fr("Price pack");
    const mu = trr ? trr.slice(1,19).map(parseBR) : FB.monthlyUnits;
    const price = pr ? (parseBR(pr[1])||FB.price) : FB.price;
    const ri = lines.findIndex(r=>r[0]&&r[0].toLowerCase()==="receita");
    let yr = FB.yearlyRevenue;
    if(ri>=0){ const u=lines.slice(ri).find(r=>r[0]&&r[0].includes("U$")); if(u) yr=u.slice(1,8).map(parseBR); }
    const ci = lines.findIndex(r=>r[0]&&r[0]==="COSTS");
    let yc=FB.yearlyCosts, ycb=FB.yearCB;
    if(ci>=0){
      const cl=lines.slice(ci);
      const tc=cl.find(r=>r[0]&&r[0]==="Total Costs"); if(tc) yc=tc.slice(1,8).map(parseBR);
      const fc=(l)=>cl.find(r=>r[0]&&r[0].toLowerCase().includes(l.toLowerCase()));
      ycb={
        ceo:fc("CEO")?fc("CEO").slice(1,8).map(parseBR):FB.yearCB.ceo,
        coo:fc("COO")?fc("COO").slice(1,8).map(parseBR):FB.yearCB.coo,
        mktGtm:fc("Marketing (GTM)")?fc("Marketing (GTM)").slice(1,8).map(parseBR):FB.yearCB.mktGtm,
        mktAds:fc("Marketing (ads)")?fc("Marketing (ads)").slice(1,8).map(parseBR):FB.yearCB.mktAds,
        warehouse:fc("WareHouse")?fc("WareHouse").slice(1,8).map(parseBR):FB.yearCB.warehouse,
        cogs:fc("CGS")?fc("CGS").slice(1,8).map(parseBR):FB.yearCB.cogs,
        logistics:fc("Logistics")?fc("Logistics").slice(1,8).map(parseBR):FB.yearCB.logistics,
        travel:fc("Travel")?fc("Travel").slice(1,8).map(parseBR):FB.yearCB.travel,
      };
    }
    const ep=lines.find(r=>r[0]&&r[0]==="EBITDA %");
    const eu=lines.find(r=>r[0]&&r[0].includes("EBITDA U$"));
    const vr=lines.find(r=>r[0]&&r[0].includes("EBITDA 6X"));
    return {
      monthlyUnits:mu, price,
      yearlyRevenue:yr, yearlyCosts:yc,
      yearlyEbitda:eu?eu.slice(1,8).map(parseBR):FB.yearlyEbitda,
      yearlyEbitdaPct:ep?ep.slice(1,8).map(v=>parseBR(v.replace("%",""))):FB.yearlyEbitdaPct,
      yearlyValuation:vr?vr.slice(1,8).map(parseBR):FB.yearlyValuation,
      yearCB:ycb, preMoney:FB.preMoney, raise:FB.raise, cap:FB.cap,
    };
  } catch(e) { return FB; }
}

function project(bp, inv) {
  const eq = (inv/(bp.preMoney+inv))*100;
  const pm = bp.preMoney+inv;
  const sc = Math.pow(inv/bp.raise,0.4);
  const yr=bp.yearlyRevenue.map(r=>r*sc);
  const yc=bp.yearlyCosts.map(c=>c*(0.35+0.65*sc));
  const ye=yr.map((r,i)=>r-yc[i]);
  const yep=yr.map((r,i)=>((r-yc[i])/r)*100);
  const yv=ye.map(e=>e*6);
  const tr=yr.reduce((a,b)=>a+b,0);
  const sv=yv[6]*(eq/100);
  const mu=inv/(bp.yearlyCosts[0]||1);
  const pa=[
    {label:"Marketing & Ads",color:C.accent,values:bp.yearCB.mktGtm.map((v,i)=>v+bp.yearCB.mktAds[i])},
    {label:"COGS (Production)",color:"#6b7280",values:bp.yearCB.cogs},
    {label:"Logistics",color:"#4b5563",values:bp.yearCB.logistics},
    {label:"CEO Salary",color:"#9ca3af",values:bp.yearCB.ceo},
    {label:"COO Salary",color:"#6b7280",values:bp.yearCB.coo},
    {label:"Warehouse",color:"#374151",values:bp.yearCB.warehouse},
    {label:"Travel",color:"#1f2937",values:bp.yearCB.travel},
  ].map(c=>({...c,y1:c.values[0],pct:(c.values[0]/(bp.yearlyCosts[0]||1))*100,share:(c.values[0]/(bp.yearlyCosts[0]||1))*inv}));
  return {eq,pm,sc,yr,yc,ye,yep,yv,tr,sv,mult:sv/inv,pa,mRev:bp.monthlyUnits.map(u=>u*sc*bp.price),mU:bp.monthlyUnits.map(u=>Math.round(u*sc))};
}

// ─── COMPONENTS ───
function KPI({label,value,sub,hl}) {
  return (
    <div style={{
      background:hl?C.accent:C.bgCard, border:hl?`1px solid ${C.accentLight}`:`1px solid ${C.border}`,
      borderRadius:12, padding:"20px 14px", textAlign:"center", flex:"1 1 150px", minWidth:150,
      boxShadow:hl?`0 4px 20px ${C.accentGlow}`:"none",
    }}>
      <div style={{fontSize:10,color:hl?"rgba(255,255,255,0.7)":C.muted,textTransform:"uppercase",letterSpacing:2.5,marginBottom:8,fontFamily:"Inter,sans-serif",fontWeight:600}}>{label}</div>
      <div style={{fontSize:26,fontWeight:700,color:C.white,fontFamily:"Nobile,sans-serif",lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:hl?"rgba(255,255,255,0.65)":C.muted,marginTop:6}}>{sub}</div>}
    </div>
  );
}

function Bar({data,labels,height=200,title}) {
  const max=Math.max(...data.map(Math.abs),1);
  return (
    <div style={{marginBottom:20}}>
      {title&&<div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:12,fontFamily:"Nobile,sans-serif"}}>{title}</div>}
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height}}>
        {data.map((v,i)=>{
          const neg=v<0;
          const h=(Math.abs(v)/max)*(height-36);
          return (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
              <div style={{fontSize:8,color:neg?C.red:C.white,marginBottom:3,fontFamily:"Inter,sans-serif",opacity:0.7,whiteSpace:"nowrap"}}>{fmt(v)}</div>
              <div style={{
                width:"100%",maxWidth:52,height:h,borderRadius:"3px 3px 0 0",
                background:neg?`linear-gradient(180deg,${C.red} 0%,#9e0000 100%)`:`linear-gradient(180deg,${C.accent} 0%,#1a2f6e 100%)`,
                transition:"height 0.5s cubic-bezier(.4,0,.2,1)",
              }}/>
              <div style={{fontSize:9,color:C.muted,marginTop:5,fontFamily:"Inter,sans-serif"}}>{labels[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Donut({segments}){
  const total=segments.reduce((a,s)=>a+s.pct,0);
  let cum=0;
  const colors=[C.accent,"#4d6dd4","#7b93e0","#374151","#6b7280","#9ca3af","#1f2937"];
  const arcs=segments.map((seg,i)=>{
    const st=(cum/total)*360; cum+=seg.pct;
    const en=(cum/total)*360;
    const sr=((st-90)*Math.PI)/180,er=((en-90)*Math.PI)/180;
    const r=82,ir=52,cx=100,cy=100,la=en-st>180?1:0;
    const path=`M ${cx+r*Math.cos(sr)} ${cy+r*Math.sin(sr)} A ${r} ${r} 0 ${la} 1 ${cx+r*Math.cos(er)} ${cy+r*Math.sin(er)} L ${cx+ir*Math.cos(er)} ${cy+ir*Math.sin(er)} A ${ir} ${ir} 0 ${la} 0 ${cx+ir*Math.cos(sr)} ${cy+ir*Math.sin(sr)} Z`;
    return {...seg,path,color:colors[i%colors.length]};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap",justifyContent:"center"}}>
      <svg viewBox="0 0 200 200" width={175} height={175}>
        {arcs.map((a,i)=><path key={i} d={a.path} fill={a.color} stroke={C.bg} strokeWidth={1.5}/>)}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {arcs.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.white,fontFamily:"Inter,sans-serif"}}>
            <div style={{width:12,height:12,borderRadius:3,background:a.color,flexShrink:0}}/>
            <span style={{opacity:0.7}}>{a.name}</span>
            <span style={{fontWeight:700,marginLeft:"auto"}}>{a.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBar({items}){
  return (<div>{items.map((it,i)=>(
    <div key={i} style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:C.white,fontFamily:"Inter,sans-serif"}}>{it.label}</span>
        <span style={{fontSize:12,color:C.accentLight,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{fmt(it.value)} ({it.pct.toFixed(1)}%)</span>
      </div>
      <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
        <div style={{width:`${it.pct}%`,height:"100%",borderRadius:4,background:it.color||C.accent,transition:"width 0.6s"}}/>
      </div>
    </div>
  ))}</div>);
}

function Sec({title,children}){
  return (<div style={{marginBottom:40}}>
    <div style={{fontFamily:"Nobile,sans-serif",fontSize:18,fontWeight:700,color:C.white,borderBottom:`2px solid ${C.accent}`,paddingBottom:8,marginBottom:20}}>{title}</div>
    {children}
  </div>);
}

// ─── MAIN ───
export default function App() {
  const [inv,setInv]=useState(300000);
  const [tab,setTab]=useState("overview");
  const [bp,setBp]=useState(FB);
  const [live,setLive]=useState(false);
  const [loading,setLoading]=useState(true);
  const [lastSync,setLastSync]=useState(null);

  const fetch_=useCallback(async()=>{
    setLoading(true);
    try {
      const r=await fetch(CSV_URL); if(!r.ok) throw 0;
      setBp(parseCSV(await r.text())); setLive(true); setLastSync(new Date());
    } catch(e){ setLive(false); }
    setLoading(false);
  },[]);
  useEffect(()=>{fetch_();},[fetch_]);

  const d=useMemo(()=>project(bp,inv),[bp,inv]);
  const ct=[
    {name:"Leonardo Lacerda (Founder)",pct:bp.cap.postFounder*(100-d.eq-10)/(100-bp.cap.investor-10)},
    {name:"Bruno Matozo (Co-Founder)",pct:bp.cap.postCofounder*(100-d.eq-10)/(100-bp.cap.investor-10)},
    {name:"Investor (You)",pct:d.eq},
    {name:"Chantel Colley (Advisor)",pct:2},{name:"Nicholas Santos (Advisor)",pct:2},
    {name:"Andre Lopes (Advisor)",pct:1},{name:"Stock Pool",pct:5},
  ];

  const tabs=[{id:"overview",l:"Overview"},{id:"proceeds",l:"Use of Proceeds"},{id:"projections",l:"7-Year Projections"},{id:"captable",l:"Cap Table"},{id:"monthly",l:"18-Month Detail"}];

  const btnStyle=(active)=>({
    padding:"10px 16px",background:"transparent",border:"none",cursor:"pointer",
    borderBottom:active?`3px solid ${C.accent}`:"3px solid transparent",
    color:active?C.white:C.muted,fontSize:12,fontWeight:active?700:400,
    whiteSpace:"nowrap",fontFamily:"Inter,sans-serif",transition:"all 0.2s",
  });

  return (
    <div style={{minHeight:"100vh",color:C.white,fontFamily:"Inter,sans-serif",background:C.bg,padding:"0 0 60px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nobile:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        input[type=range]{-webkit-appearance:none;appearance:none;}
        input[type=range]::-webkit-slider-thumb{
          -webkit-appearance:none;width:22px;height:22px;border-radius:50%;
          background:${C.accent};border:3px solid ${C.white};cursor:pointer;
          box-shadow:0 0 14px ${C.accentGlow};margin-top:-8px;
        }
        input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;}
      `}</style>

      {/* HEADER */}
      <div style={{background:`linear-gradient(180deg,${C.bgSection} 0%,${C.bg} 100%)`,padding:"40px 24px 28px",textAlign:"center",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,letterSpacing:6,textTransform:"uppercase",color:C.muted,marginBottom:8,fontFamily:"Inter,sans-serif",fontWeight:600}}>THE POWER COFFEE</div>
        <h1 style={{fontFamily:"Nobile,sans-serif",fontSize:"clamp(26px,5vw,42px)",fontWeight:700,margin:"0 0 10px",color:C.white,lineHeight:1.1}}>Investor Simulator</h1>
        <p style={{fontSize:13,color:C.muted,margin:"0 0 16px",maxWidth:480,marginInline:"auto"}}>Model your investment. Explore projected returns. Data syncs live from the business plan.</p>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:live?"rgba(66,132,69,0.15)":"rgba(234,51,53,0.1)",
            border:`1px solid ${live?"rgba(66,132,69,0.5)":"rgba(234,51,53,0.4)"}`,
            borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:600,
            color:live?"#6fcf73":"#f87171",fontFamily:"Inter,sans-serif",
          }}>
            <div style={{width:7,height:7,borderRadius:"50%",background:live?C.green:C.red,animation:live?"pulse 2s infinite":"none"}}/>
            {live?"LIVE \u00B7 GOOGLE SHEETS":"OFFLINE \u00B7 CACHED"}
          </div>
          <button onClick={fetch_} style={{
            background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 14px",
            color:C.white,fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:600,opacity:loading?0.5:1,
          }}>{loading?"Syncing...":"\u21BB Refresh"}</button>
        </div>
        {lastSync&&<div style={{fontSize:10,color:C.muted,marginTop:8,fontFamily:"Inter,sans-serif"}}>Last sync: {lastSync.toLocaleTimeString()}</div>}
      </div>

      <div style={{maxWidth:740,margin:"0 auto",padding:"28px 20px"}}>

        {/* SLIDER */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 24px",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:10,letterSpacing:2.5,textTransform:"uppercase",color:C.muted,fontWeight:600}}>Your Investment</span>
            <span style={{fontFamily:"Nobile,sans-serif",fontSize:38,fontWeight:700,color:C.white}}>{fmt(inv)}</span>
          </div>
          <input type="range" min={50000} max={500000} step={10000} value={inv}
            onChange={e=>setInv(Number(e.target.value))}
            style={{width:"100%",height:6,outline:"none",cursor:"pointer",borderRadius:3,
              background:`linear-gradient(to right,${C.accent} 0%,${C.accent} ${((inv-50000)/450000)*100}%,rgba(255,255,255,0.08) ${((inv-50000)/450000)*100}%,rgba(255,255,255,0.08) 100%)`,
            }}
          />
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10,color:C.muted}}>
            <span>$50K</span><span>$500K</span>
          </div>
          <div style={{display:"flex",gap:7,marginTop:16,flexWrap:"wrap",justifyContent:"center"}}>
            {[100000,150000,200000,300000,500000].map(a=>(
              <button key={a} onClick={()=>setInv(a)} style={{
                padding:"6px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"Inter,sans-serif",
                border:inv===a?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                background:inv===a?C.accent:"transparent",
                color:C.white,transition:"all 0.2s",
              }}>{fmt(a)}</button>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:2,marginBottom:28,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={btnStyle(tab===t.id)}>{t.l}</button>)}
        </div>

        {/* OVERVIEW */}
        {tab==="overview"&&<>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:32}}>
            <KPI label="Your Equity" value={pct(d.eq)} sub={`Post-money: ${fmt(d.pm)}`} hl/>
            <KPI label="7-Yr Share Value" value={fmt(d.sv)} sub="Based on 6x EBITDA" hl/>
            <KPI label="Return Multiple" value={`${d.mult.toFixed(1)}x`} sub={`ROI: ${((d.mult-1)*100).toFixed(0)}%`}/>
            <KPI label="7-Yr Revenue" value={fmt(d.tr)} sub="Cumulative"/>
          </div>
          <Sec title="EBITDA by Year"><Bar data={d.ye} labels={["Y1","Y2","Y3","Y4","Y5","Y6","Y7"]} height={180}/></Sec>
          <Sec title="Valuation Growth (6x EBITDA)"><Bar data={d.yv} labels={["Y1","Y2","Y3","Y4","Y5","Y6","Y7"]} height={180}/></Sec>
          <div style={{background:C.bgSection,border:`1px solid ${C.borderAccent}`,borderRadius:12,padding:20,fontSize:13,lineHeight:1.8,color:C.muted}}>
            <strong style={{color:C.white}}>How it works:</strong> Your {fmt(inv)} buys {pct(d.eq)} equity at a $2.7M pre-money valuation. Revenue scales with capital deployed. By Year 7, the projected 6x EBITDA valuation of {fmt(d.yv[6])} puts your share at <strong style={{color:C.white}}>{fmt(d.sv)}</strong> — a <strong style={{color:C.white}}>{d.mult.toFixed(1)}x</strong> return.
          </div>
        </>}

        {/* PROCEEDS */}
        {tab==="proceeds"&&<>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:24,marginBottom:28}}>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:20}}>
              Here's how your <strong style={{color:C.white}}>{fmt(inv)}</strong> fuels growth. Capital allocation follows the operational cost structure, with the majority driving customer acquisition and production scale-up.
            </div>
            <HBar items={d.pa.map(p=>({label:p.label,value:p.share,pct:p.pct,color:p.color}))}/>
          </div>
          <Sec title="Where Every Dollar Goes">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
              {d.pa.map((p,i)=>(
                <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                  <div style={{width:8,height:8,borderRadius:2,background:p.color,marginBottom:10}}/>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{p.label}</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:"Nobile,sans-serif"}}>{fmt(p.share)}</div>
                  <div style={{fontSize:11,color:C.accentLight,marginTop:4}}>{p.pct.toFixed(1)}% of capital</div>
                </div>
              ))}
            </div>
          </Sec>
          <Sec title="7-Year Cost Evolution">
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"Inter,sans-serif"}}>
                <thead><tr style={{borderBottom:`2px solid ${C.accent}`}}>
                  <th style={{padding:"8px 6px",textAlign:"left",color:C.accentLight}}>Category</th>
                  {[1,2,3,4,5,6,7].map(y=><th key={y} style={{padding:"8px 6px",textAlign:"right",color:C.accentLight}}>Y{y}</th>)}
                </tr></thead>
                <tbody>
                  {Object.entries(bp.yearCB).map(([k,v],ri)=>{
                    const lb={ceo:"CEO",coo:"COO",mktGtm:"Mkt (GTM)",mktAds:"Mkt (Ads)",warehouse:"Warehouse",cogs:"COGS",logistics:"Logistics",travel:"Travel"};
                    return (<tr key={ri} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:"8px 6px",color:C.white}}>{lb[k]||k}</td>
                      {v.map((val,ci)=><td key={ci} style={{padding:"8px 6px",textAlign:"right",color:C.muted}}>{fmt(val)}</td>)}
                    </tr>);
                  })}
                  <tr style={{borderTop:`2px solid ${C.accent}`}}>
                    <td style={{padding:"8px 6px",color:C.accentLight,fontWeight:700}}>Total</td>
                    {bp.yearlyCosts.map((v,i)=><td key={i} style={{padding:"8px 6px",textAlign:"right",color:C.accentLight,fontWeight:700}}>{fmt(v)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Sec>
        </>}

        {/* PROJECTIONS */}
        {tab==="projections"&&<>
          <div style={{overflowX:"auto",marginBottom:28}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"Inter,sans-serif"}}>
              <thead><tr style={{borderBottom:`2px solid ${C.accent}`}}>
                <th style={{padding:"10px 6px",textAlign:"left",color:C.accentLight}}>Metric</th>
                {[1,2,3,4,5,6,7].map(y=><th key={y} style={{padding:"10px 6px",textAlign:"right",color:C.accentLight}}>Year {y}</th>)}
              </tr></thead>
              <tbody>
                {[{l:"Revenue",d:d.yr,f:fmt},{l:"Total Costs",d:d.yc,f:fmt},{l:"EBITDA",d:d.ye,f:fmt},{l:"EBITDA %",d:d.yep,f:v=>`${v.toFixed(1)}%`},{l:"Valuation (6x)",d:d.yv,f:fmt}].map((r,ri)=>(
                  <tr key={ri} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"10px 6px",color:C.white,fontWeight:600}}>{r.l}</td>
                    {r.d.map((v,ci)=><td key={ci} style={{padding:"10px 6px",textAlign:"right",color:v<0?C.red:C.muted}}>{r.f(v)}</td>)}
                  </tr>
                ))}
                <tr style={{borderTop:`2px solid ${C.accent}`}}>
                  <td style={{padding:"10px 6px",color:C.accentLight,fontWeight:700}}>Your Share</td>
                  {d.yv.map((v,i)=><td key={i} style={{padding:"10px 6px",textAlign:"right",color:C.accentLight,fontWeight:700}}>{fmt(v*(d.eq/100))}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:280}}><Bar data={d.yr} labels={["Y1","Y2","Y3","Y4","Y5","Y6","Y7"]} title="Revenue" height={160}/></div>
            <div style={{flex:1,minWidth:280}}><Bar data={d.yc} labels={["Y1","Y2","Y3","Y4","Y5","Y6","Y7"]} title="Costs" height={160}/></div>
          </div>
        </>}

        {/* CAP TABLE */}
        {tab==="captable"&&<>
          <Sec title="Post-Investment Cap Table"><Donut segments={ct}/></Sec>
          <div style={{marginTop:24,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"Inter,sans-serif"}}>
              <thead><tr style={{borderBottom:`2px solid ${C.accent}`}}>
                <th style={{padding:"10px 6px",textAlign:"left",color:C.accentLight}}>Stakeholder</th>
                <th style={{padding:"10px 6px",textAlign:"right",color:C.accentLight}}>Equity</th>
                <th style={{padding:"10px 6px",textAlign:"right",color:C.accentLight}}>Y7 Value</th>
              </tr></thead>
              <tbody>
                {ct.map((r,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:r.name.includes("Investor")?`rgba(51,79,180,0.08)`:"transparent"}}>
                    <td style={{padding:"10px 6px",color:r.name.includes("Investor")?C.accentLight:C.white}}>{r.name}</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:C.muted}}>{r.pct.toFixed(2)}%</td>
                    <td style={{padding:"10px 6px",textAlign:"right",color:C.muted}}>{fmt(d.yv[6]*(r.pct/100))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}>
            <KPI label="Pre-Money" value="$2.7M"/><KPI label="Investment" value={fmt(inv)}/><KPI label="Post-Money" value={fmt(d.pm)}/>
          </div>
        </>}

        {/* MONTHLY */}
        {tab==="monthly"&&<>
          <Sec title="18-Month Revenue Trajectory"><Bar data={d.mRev} labels={Array.from({length:18},(_,i)=>`M${i+1}`)} height={200}/></Sec>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"Inter,sans-serif"}}>
              <thead><tr style={{borderBottom:`2px solid ${C.accent}`}}>
                <th style={{padding:"8px 6px",textAlign:"left",color:C.accentLight}}>Month</th>
                <th style={{padding:"8px 6px",textAlign:"right",color:C.accentLight}}>Units</th>
                <th style={{padding:"8px 6px",textAlign:"right",color:C.accentLight}}>Revenue</th>
              </tr></thead>
              <tbody>
                {d.mU.map((u,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}}>
                    <td style={{padding:"7px 6px",color:C.white}}>Month {i+1}</td>
                    <td style={{padding:"7px 6px",textAlign:"right",color:C.muted}}>{u.toLocaleString()}</td>
                    <td style={{padding:"7px 6px",textAlign:"right",color:C.muted}}>{fmt(d.mRev[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* FOOTER */}
        <div style={{marginTop:48,textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.2)",fontFamily:"Inter,sans-serif",lineHeight:1.7,borderTop:`1px solid ${C.border}`,paddingTop:20}}>
          <div style={{fontFamily:"Nobile,sans-serif",fontWeight:700,letterSpacing:2,marginBottom:4}}>THE POWER COFFEE</div>
          <div>Projections are estimates. Actual results may vary.</div>
          <div style={{marginTop:4}}>Data: <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noopener" style={{color:C.accentLight,textDecoration:"none"}}>BP Spreadsheet (Live)</a></div>
          <div style={{marginTop:8}}>
            <a href="https://www.thepowercoffee.com" style={{color:C.accentLight,textDecoration:"none"}}>thepowercoffee.com</a>
            {" \u00B7 "}
            <a href="https://a.co/d/09Gmr1Sq" style={{color:C.accentLight,textDecoration:"none"}}>Amazon</a>
            {" \u00B7 "}
            <a href="https://instagram.com/powercoffee.ofc" style={{color:C.accentLight,textDecoration:"none"}}>@powercoffee.ofc</a>
          </div>
        </div>
      </div>
    </div>
  );
}
