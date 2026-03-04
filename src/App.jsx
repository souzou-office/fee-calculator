import { useState, useMemo, useEffect, useRef } from "react";

const DEF_FT=[
[1000,62000,77000,30000,45000,47000,53000,55000],[2000,77000,82000,30000,50300,52300,58300,60300],
[3000,82000,97000,30000,55600,57600,63600,65600],[4000,97000,102000,33000,60900,62900,68900,70900],
[5000,102000,127000,36000,66200,68200,74200,76200],[6000,127000,132000,39000,71500,73500,79500,81500],
[7000,132000,137000,42000,76800,78800,84800,86800],[8000,137000,142000,45000,82100,84100,90100,92100],
[9000,142000,147000,48000,87400,89400,95400,97400],[10000,147000,170000,51000,92700,94700,100700,102700],
[11000,170000,173000,53000,95200,97200,103200,105200],[12000,173000,176000,55000,97700,99700,105700,107700],
[13000,176000,179000,57000,100200,102200,108200,110200],[14000,179000,182000,59000,102700,104700,110700,112700],
[15000,182000,185000,61000,105200,107200,113200,115200],[16000,185000,188000,63000,107700,109700,115700,117700],
[17000,188000,191000,65000,110200,112200,118200,120200],[18000,191000,194000,67000,112700,114700,120700,122700],
[19000,194000,197000,69000,115200,117200,123200,125200],[20000,197000,200000,71000,117700,119700,125700,127700],
[21000,200000,203000,73000,120200,122200,128200,130200],[22000,203000,206000,75000,122700,124700,130700,132700],
[23000,206000,209000,77000,125200,127200,133200,135200],[24000,209000,212000,79000,127700,129700,135700,137700],
[25000,212000,215000,81000,130200,132200,138200,140200],[26000,215000,218000,83000,132700,134700,140700,142700],
[27000,218000,221000,85000,135200,137200,143200,145200],[28000,221000,224000,87000,137700,139700,145700,147700],
[29000,224000,227000,89000,140200,142200,148200,150200],[30000,227000,232000,91000,142700,144700,150700,152700],
[31000,230000,233000,93000,145200,147200,153200,155200],[32000,233000,236000,95000,147700,149700,155700,157700],
[33000,236000,239000,97000,150200,152200,158200,160200],[34000,239000,242000,99000,152700,154700,160700,162700],
[35000,242000,245000,101000,155200,157200,163200,165200],[36000,245000,248000,103000,157700,159700,165700,167700],
[37000,248000,251000,105000,160200,162200,168200,170200],[38000,251000,254000,107000,162700,164700,170700,172700],
[39000,254000,257000,109000,165200,167200,173200,175200],[40000,257000,260000,111000,167700,169700,175700,177700],
[41000,260000,263000,113000,170200,172200,178200,180200],[42000,263000,266000,115000,172700,174700,180700,182700],
[43000,266000,269000,117000,175200,177200,183200,185200],[44000,269000,272000,119000,177700,179700,185700,187700],
[45000,272000,275000,121000,180200,182200,188200,190200],[46000,275000,278000,123000,182700,184700,190700,192700],
[47000,278000,281000,125000,185200,187200,193200,195200],[48000,281000,284000,127000,187700,189700,195700,197700],
[49000,284000,287000,129000,190200,192200,198200,200200],[50000,287000,290000,131000,192700,194700,200700,202700],
[51000,290000,293000,133000,195200,197200,203200,205200],[52000,293000,296000,135000,197700,199700,205700,207700],
[53000,296000,299000,137000,200200,202200,208200,210200],[54000,299000,302000,139000,202700,204700,210700,212700],
[55000,302000,305000,141000,205200,207200,213200,215200],[56000,305000,308000,143000,207700,209700,215700,217700],
[57000,308000,311000,145000,210200,212200,218200,220200],[58000,311000,314000,147000,212700,214700,220700,222700],
[59000,314000,317000,149000,215200,217200,223200,225200],[60000,317000,320000,151000,217700,219700,225700,227700],
[61000,320000,323000,153000,220200,222200,228200,230200],[62000,323000,326000,155000,222700,224700,230700,232700],
[63000,326000,329000,157000,225200,227200,233200,235200],[64000,329000,332000,159000,227700,229700,235700,237700],
[65000,332000,335000,161000,230200,232200,238200,240200],[66000,335000,338000,163000,232700,234700,240700,242700],
[67000,338000,341000,165000,235200,237200,243200,245200],[68000,341000,344000,167000,237700,239700,245700,247700],
[69000,344000,347000,169000,240200,242200,248200,250200],[70000,347000,350000,171000,242700,244700,250700,252700],
[71000,350000,353000,173000,245200,247200,253200,255200],[72000,353000,356000,175000,247700,249700,255700,257700],
[73000,356000,359000,177000,250200,252200,258200,260200],[74000,359000,362000,179000,252700,254700,260700,262700],
[75000,362000,365000,181000,255200,257200,263200,265200],[76000,365000,368000,183000,257700,259700,265700,267700],
[77000,368000,371000,185000,260200,262200,268200,270200],[78000,371000,374000,187000,262700,264700,270700,272700],
[79000,374000,377000,189000,265200,267200,273200,275200],[80000,377000,380000,191000,267700,269700,275700,277700],
];
const DEF_SURCHARGES=[
  {id:"kubun",name:"区分建物",amount:5000},
  {id:"kachitas",name:"カチタス再販",amount:10000},
  {id:"sbi",name:"SBI設定",amount:10000},
];
const DEF_UNIT={propAdd:2000,deletionBase:12000,deletionPropAdd:2000,addressBase:12000,addressPropAdd:2000};
const DEF_STD_ITEMS=[
  {id:"cert",name:"登記事項証明書",fee:1000,jippi:600,unitLabel:"通"},
  {id:"info",name:"登記情報",fee:500,jippi:331,unitLabel:"件"},
];
const COL_NAMES=["上限(万)","移転(設定有)","移転(設定無)","保存","抵当権設定","抵当権のみ","根抵当権設定","根抵当権のみ"];

const IX={MX:0,IS:1,IN:2,HZ:3,TS:4,TO:5,NS:6,NO:7};
function lk(ft,m,c){if(m<=0)return 0;const r=ft.find(r=>m<=r[IX.MX]);return r?r[c]:ft[ft.length-1][c];}
const LB={transfer:"所有権移転",preservation:"所有権保存",mortgage:"抵当権設定",rootMortgage:"根抵当権設定",deletion:"抹消",addressChange:"住所変更"};
const f1=v=>Math.max(1000,Math.floor(v/1000)*1000);
const f2=v=>v<=0?0:Math.max(1000,Math.floor(v/100)*100);

function calcTaxDetail(type,it,hc){
  const pc=it.propCount||1;
  if(type==="transfer"){
    if(it.causeType==="sale"){
      const lraw=it.landValue||0,braw=it.buildingValue||0;
      const lb=f1(lraw),bb=f1(braw);
      let lr=15/1000,br=20/1000;
      if(hc==="general")br=3/1000;if(hc==="premium")br=1/1000;
      const ltRaw=lb*lr,btRaw=bb*br,sumRaw=ltRaw+btRaw;
      const total=f2(sumRaw);
      return{total,steps:[
        ...(lraw>0?[{l:"土地 課税標準",v:`${lraw.toLocaleString()} → ${lb.toLocaleString()}（千円未満切捨）`},
          {l:"土地 税額",v:`${lb.toLocaleString()} × ${lr*1000}/1000 = ${ltRaw.toLocaleString()}`}]:[]),
        ...(braw>0?[{l:"建物 課税標準",v:`${braw.toLocaleString()} → ${bb.toLocaleString()}（千円未満切捨）`},
          {l:"建物 税額",v:`${bb.toLocaleString()} × ${br*1000}/1000 = ${btRaw.toLocaleString()}`}]:[]),
        ...(lraw>0&&braw>0?[{l:"合算",v:`${ltRaw.toLocaleString()} + ${btRaw.toLocaleString()} = ${sumRaw.toLocaleString()}`}]:[]),
        {l:"税額（百円未満切捨）",v:`${sumRaw.toLocaleString()} → ${total.toLocaleString()}`},
      ],lt:ltRaw,bt:btRaw,lr,br};
    }
    const raw=(it.landValue||0)+(it.buildingValue||0);
    const r=it.causeType==="inheritance"?4/1000:20/1000;
    const base=f1(raw),taxRaw=base*r,tax=f2(taxRaw);
    return{total:tax,steps:[
      {l:"課税標準",v:`${raw.toLocaleString()} → ${base.toLocaleString()}（千円未満切捨）`},
      {l:"税額",v:`${base.toLocaleString()} × ${r*1000}/1000 = ${taxRaw.toLocaleString()} → ${tax.toLocaleString()}（百円未満切捨）`},
    ],lt:0,bt:0,lr:r,br:r};
  }
  if(type==="preservation"){
    let r=4/1000;if(hc==="general")r=1.5/1000;if(hc==="premium")r=1/1000;
    const raw=it.taxableValue||0,base=f1(raw),taxRaw=base*r,tax=f2(taxRaw);
    return{total:tax,steps:[
      {l:"課税標準",v:`${raw.toLocaleString()} → ${base.toLocaleString()}（千円未満切捨）`},
      {l:"税額",v:`${base.toLocaleString()} × ${r*1000}/1000 = ${taxRaw.toLocaleString()} → ${tax.toLocaleString()}（百円未満切捨）`},
    ]};
  }
  if(type==="mortgage"||type==="rootMortgage"){
    let r=4/1000;if(hc==="general"||hc==="premium")r=1/1000;
    const raw=it.debtAmount||0,base=f1(raw),taxRaw=base*r,tax=f2(taxRaw);
    return{total:tax,steps:[
      {l:"課税標準",v:`${raw.toLocaleString()} → ${base.toLocaleString()}（千円未満切捨）`},
      {l:"税額",v:`${base.toLocaleString()} × ${r*1000}/1000 = ${taxRaw.toLocaleString()} → ${tax.toLocaleString()}（百円未満切捨）`},
    ]};
  }
  if(type==="deletion"){
    const raw=pc*1000,tax=Math.min(raw,20000);
    return{total:tax,steps:[{l:"計算",v:`${pc}個 × 1,000 = ${raw.toLocaleString()}`},...(raw>20000?[{l:"上限適用",v:"20,000（上限）"}]:[]),]};
  }
  if(type==="addressChange"){
    const tax=pc*1000;
    return{total:tax,steps:[{l:"計算",v:`${pc}個 × 1,000 = ${tax.toLocaleString()}`}]};
  }
  return{total:0,steps:[]};
}

function calcItem(it,g){
  let lv=0,fb=0,col="";
  const{ft,unit}=g;
  const isSimpleType=it.type==="deletion"||it.type==="addressChange";
  if(it.type==="transfer"){
    const tv=(it.landValue||0)+(it.buildingValue||0);lv=Math.ceil(tv/10000);
    const ci=g.hasMtg?IX.IS:IX.IN;col=g.hasMtg?"移転(設定有)":"移転(設定無)";fb=lk(ft,lv,ci);
  }else if(it.type==="preservation"){lv=Math.ceil((it.taxableValue||0)/10000);col="保存";fb=lk(ft,lv,IX.HZ);
  }else if(it.type==="mortgage"){lv=Math.ceil((it.debtAmount||0)/10000);col=g.hasTr?"抵当権設定":"抵当権(設定のみ)";fb=lk(ft,lv,g.hasTr?IX.TS:IX.TO);
  }else if(it.type==="rootMortgage"){lv=Math.ceil((it.debtAmount||0)/10000);col=g.hasTr?"根抵当権設定":"根抵当権(設定のみ)";fb=lk(ft,lv,g.hasTr?IX.NS:IX.NO);
  }else if(it.type==="deletion"){fb=unit.deletionBase;col="抹消";
  }else if(it.type==="addressChange"){fb=unit.addressBase;col="住変";}
  const propAddUnit=it.type==="deletion"?unit.deletionPropAdd:it.type==="addressChange"?unit.addressPropAdd:unit.propAdd;
  const ep=Math.max(0,((it.propCount||1)-1))*propAddUnit;
  let sc=0;const scItems=[];
  if(!isSimpleType){g.surcharges.forEach(s=>{if(g.enabledSc[s.id]){sc+=s.amount;scItems.push(s);}});}
  const fee=fb+ep;
  const txd=calcTaxDetail(it.type,it,g.housingCert);
  return{fee,fb,ep,sc,scItems,tax:txd.total,txd,lv,col,isSimpleType,propAddUnit};
}

function fmt(n){return n==null||isNaN(n)||n===0?"¥0":"¥"+n.toLocaleString();}
function fmtM(n){if(!n||n<=0)return"";if(n>=10000){const o=Math.floor(n/10000),r=n%10000;return r>0?`${o}億${r.toLocaleString()}万円`:`${o}億円`;}return`${n.toLocaleString()}万円`;}

function getExpList(counts,stdItems,postage,extras){
  const l=[];
  stdItems.forEach(si=>{const c=counts[si.id]||0;if(c>0&&si.jippi>0)l.push({name:`${si.name} ${c}${si.unitLabel}`,amount:c*si.jippi,src:"std"});});
  if(postage>0)l.push({name:"郵送費",amount:postage});
  extras.forEach(e=>{const a=Number(e.expense)||0;if(a>0)l.push({name:e.name||"その他",amount:a,src:"extra"});});
  return l;
}
function getXFee(counts,stdItems,extras){
  let f=0;stdItems.forEach(si=>{f+=(counts[si.id]||0)*si.fee;});
  extras.forEach(e=>f+=(Number(e.fee)||0));return f;
}

function genTSV(ci,items,expList,extras,rate,g){
  const{unit,stdItems,counts}=g;const L=[];const p=(...v)=>L.push(v.join("\t"));
  const bd=(ci.billingDate||"").replace(/-/g,"/").replace(/\/0/g,"/");
  p("事務所",ci.office);p("請求日",bd);p("事件番号",ci.caseNumber);p("得意先",ci.client);
  ["①","②","③"].forEach((s,i)=>{const c=ci.customers[i]||{};p(`顧客名${s}`,c.name||"",c.title||"");});
  {const b=ci.banks[0]||{};p("振込先①",b.bankName||"",b.branchName||"",b.accountType||"",b.accountNumber||"");}
  p("源泉対象",ci.withholding?"1":"0");p("消費税課税","1",`${rate.toFixed(2)}%`);
  const scTotal=g.surcharges.reduce((s,sc)=>s+(g.enabledSc[sc.id]?sc.amount:0),0);
  const extraFee=extras.reduce((s,e)=>s+(Number(e.fee)||0),0);
  if(scTotal>0){const names=g.surcharges.filter(sc=>g.enabledSc[sc.id]).map(sc=>sc.name).join("・");p("作業項目",names,String(scTotal),"0");}
  items.forEach((it,idx)=>{const c=calcItem(it,g);const f=idx===0?c.fee+extraFee:c.fee;p("作業項目",LB[it.type]||it.type,String(f),String(c.tax));});
  stdItems.forEach(si=>{const c=counts[si.id]||0;if(c>0){const fee=c*si.fee;const jippi=c*si.jippi;if(fee>0||jippi>0)p("作業項目",`${si.name} ${c}${si.unitLabel}`,String(fee),String(jippi));}});
  expList.forEach(e=>{if(e.src!=="std"&&e.src!=="extra")p("作業項目",e.name,String(e.amount),"0");});
  p("備考",ci.note||"");p("メモ",ci.memo||"");
  return L.join("\n");
}

// ── UI atoms ──
const Inp=({label,value,onChange,type="number",suffix,note,min,step,placeholder,className=""})=>(
  <div className={`mb-3 ${className}`}>{label&&<label className="block text-xs font-medium mb-1" style={{color:"#566275"}}>{label}</label>}
    <div className="flex items-center gap-2">
      <input type={type} value={value} placeholder={placeholder} min={min} step={step}
        onChange={e=>onChange(type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
        style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",color:"#1a2233",fontVariantNumeric:"tabular-nums"}}
        onFocus={e=>{e.target.style.borderColor="#3d7ce0";e.target.style.background="#fff"}}
        onBlur={e=>{e.target.style.borderColor="#dce1ea";e.target.style.background="#f0f3f8"}} />
      {suffix&&<span className="text-xs whitespace-nowrap flex-shrink-0" style={{color:"#8393a7"}}>{suffix}</span>}
    </div>{note&&<p className="text-xs mt-1" style={{color:"#3d7ce0"}}>{note}</p>}</div>
);
const Sel=({label,value,onChange,options})=>(
  <div className="mb-3">{label&&<label className="block text-xs font-medium mb-1" style={{color:"#566275"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
      style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",color:"#1a2233",appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238393a7'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
);
const Chk=({label,checked,onChange,accent})=>(
  <div className="flex items-center gap-2 mb-2 cursor-pointer select-none text-sm" style={{color:"#3a4557"}} onClick={e=>{e.preventDefault();onChange();}}>
    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
      style={{background:checked?(accent||"#3d7ce0"):"#e2e8f0",border:checked?"none":"1.5px solid #c5cdd8"}}>
      {checked&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div><span>{label}</span></div>
);
const Rw=({label,value,sub,hl,bold})=>(
  <div className="flex justify-between items-baseline py-1.5" style={{borderBottom:"1px solid #edf0f5"}}>
    <span className={`text-sm ${bold?"font-bold":""}`} style={{color:sub?"#8393a7":"#3a4557"}}>{label}</span>
    <span className={`text-sm ${bold?"font-bold":"font-medium"}`} style={{color:hl?"#2563eb":"#1a2233",fontVariantNumeric:"tabular-nums"}}>{value}</span></div>
);
function StepRow({label,note,count,setCount,unitL}){
  return(<div className="py-2.5" style={{borderBottom:"1px solid #f0f3f8"}}>
    <div className="flex items-center justify-between gap-3" style={{flexWrap:"nowrap"}}>
      <span className="text-sm flex-1 min-w-0 truncate" style={{color:"#3a4557"}}>{label||"（名称なし）"}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={()=>setCount(Math.max(0,count-1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{background:"#f0f3f8",color:count>0?"#3a4557":"#c5cdd8",border:"1px solid #dce1ea"}}>−</button>
        <span className="text-sm font-medium w-6 text-center" style={{fontVariantNumeric:"tabular-nums"}}>{count}</span>
        <button onClick={()=>setCount(count+1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{background:"#f0f3f8",color:"#3a4557",border:"1px solid #dce1ea"}}>+</button>
        <span className="text-xs w-4 flex-shrink-0" style={{color:"#8393a7"}}>{unitL}</span>
      </div>
    </div>
    {count>0&&note&&<div className="text-xs mt-1 pl-1" style={{color:"#8393a7"}}>{note}</div>}
  </div>);
}
function ExtraItem({item,index,total,onChange,onRemove,onMove}){
  const[open,setOpen]=useState(true);
  const f=Number(item.fee)||0,x=Number(item.expense)||0;
  const sm=[];if(f>0)sm.push(`報酬 ${fmt(f)}`);if(x>0)sm.push(`立替 ${fmt(x)}`);
  return(<div className="rounded-lg mb-2 overflow-hidden" style={{border:"1px solid #e5e9f0"}}>
    <div className="flex items-center gap-1 px-3 py-2 cursor-pointer" style={{background:"#f9fafb"}} onClick={()=>setOpen(!open)}>
      <div className="flex flex-col mr-1 flex-shrink-0" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>onMove(-1)} disabled={index===0}
          className="text-xs leading-none px-0.5" style={{color:index===0?"#d1d5db":"#4338ca"}}>▲</button>
        <button onClick={()=>onMove(1)} disabled={index>=total-1}
          className="text-xs leading-none px-0.5" style={{color:index>=total-1?"#d1d5db":"#4338ca"}}>▼</button>
      </div>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transform:open?"rotate(90deg)":"",transition:"transform 0.15s",flexShrink:0}}>
        <path d="M3 1l4 4-4 4" stroke="#8393a7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span className="text-sm flex-1 min-w-0 truncate" style={{color:"#3a4557"}}>{item.name||"（未入力）"}</span>
      {!open&&sm.length>0&&<span className="text-xs flex-shrink-0" style={{color:"#8393a7"}}>{sm.join("／")}</span>}
      <button onClick={e=>{e.stopPropagation();onRemove();}} className="text-xs px-1.5 flex-shrink-0" style={{color:"#e53e3e"}}>✕</button>
    </div>
    {open&&<div className="px-3 pt-2 pb-3" style={{background:"#fff"}}>
      <Inp label="項目名" value={item.name} onChange={v=>onChange({...item,name:v})} type="text" placeholder="例: 日当・交通費" />
      <div className="grid grid-cols-2 gap-x-3">
        <Inp label="報酬（税対象）" value={item.fee} onChange={v=>onChange({...item,fee:v})} suffix="円" placeholder="0" />
        <Inp label="立替金（実費）" value={item.expense} onChange={v=>onChange({...item,expense:v})} suffix="円" placeholder="0" />
      </div>
    </div>}
  </div>);
}

// ── Reorder helper ──
function swap(arr,i,j){const n=[...arr];[n[i],n[j]]=[n[j],n[i]];return n;}

// ── Settings ──
function Settings({ft,setFt,unit,setUnit,surcharges,setSurcharges,stdItems,setStdItems,onClose}){
  const[tab,setTab]=useState("surcharge");
  const[editCell,setEditCell]=useState(null);
  const[editVal,setEditVal]=useState("");
  const inputRef=useRef(null);
  const[modalSize,setModalSize]=useState({w:720,h:620});
  const fileRef=useRef(null);
  const doExport=()=>{
    const d=JSON.stringify({ft,unit,surcharges,stdItems},null,2);
    const b=new Blob([d],{type:"application/json"});const a=document.createElement("a");
    a.href=URL.createObjectURL(b);a.download="fee-settings.json";a.click();
  };
  const doImport=(e)=>{
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();r.onload=(ev)=>{
      try{const d=JSON.parse(ev.target.result);
        if(d.ft)setFt(d.ft);if(d.unit)setUnit(u=>({...u,...d.unit}));
        if(d.surcharges)setSurcharges(d.surcharges);
        if(Array.isArray(d.stdItems))setStdItems(d.stdItems.filter(si=>si&&si.id&&si.name));
        alert("設定を読み込みました");
      }catch{alert("ファイルの読み込みに失敗しました");}
    };r.readAsText(f);e.target.value="";
  };

  const onResizeStart=(e)=>{
    e.preventDefault();const sx=e.clientX||e.touches?.[0]?.clientX;const sy=e.clientY||e.touches?.[0]?.clientY;
    const sw=modalSize.w;const sh=modalSize.h;
    const onMove=(ev)=>{const cx=ev.clientX||ev.touches?.[0]?.clientX;const cy=ev.clientY||ev.touches?.[0]?.clientY;
      setModalSize({w:Math.max(400,sw+(cx-sx)),h:Math.max(350,sh+(cy-sy))});};
    const onUp=()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);
      document.removeEventListener("touchmove",onMove);document.removeEventListener("touchend",onUp);};
    document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);
    document.addEventListener("touchmove",onMove);document.addEventListener("touchend",onUp);
  };
  const updCell=(ri,ci,val)=>{const n=ft.map(r=>[...r]);n[ri][ci]=Number(val)||0;setFt(n);};
  const startEdit=(ri,ci)=>{setEditCell({ri,ci});setEditVal(String(ft[ri][ci]));setTimeout(()=>inputRef.current?.focus(),50);};
  const commitEdit=()=>{if(editCell)updCell(editCell.ri,editCell.ci,editVal);setEditCell(null);};
  const addSc=()=>setSurcharges(p=>[...p,{id:"sc_"+Date.now(),name:"",amount:0}]);
  const updSc=(i,patch)=>setSurcharges(p=>p.map((s,j)=>j===i?{...s,...patch}:s));
  const rmSc=(i)=>setSurcharges(p=>p.filter((_,j)=>j!==i));
  const addSI=()=>setStdItems(p=>[...p,{id:"si_"+Date.now(),name:"",fee:0,jippi:0,unitLabel:"件"}]);
  const updSI=(i,patch)=>setStdItems(p=>p.map((s,j)=>j===i?{...s,...patch}:s));
  const rmSI=(i)=>setStdItems(p=>p.filter((_,j)=>j!==i));

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.5)"}}>
      <div className="rounded-2xl relative" style={{background:"#fff",width:modalSize.w,height:modalSize.h,maxWidth:"98vw",maxHeight:"98vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 50px rgba(0,0,0,0.15)"}}>
        <div className="flex justify-between items-center px-5 pt-4 pb-2 flex-shrink-0">
          <h3 className="text-base font-bold" style={{color:"#1a2233"}}>報酬設定</h3>
          <div className="flex items-center gap-2"><span className="text-xs select-none" style={{color:"#b0b8c4"}}>↘ 角ドラッグでリサイズ</span>
            <button onClick={onClose} className="text-xl px-2" style={{color:"#8393a7"}}>×</button></div>
        </div>
        <div className="flex gap-1 px-5 pb-2 flex-shrink-0">
          {[["surcharge","加算"],["stdItems","謄本・情報・項目"],["table","報酬テーブル"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{background:tab===k?"#4338ca":"#f0f3f8",color:tab===k?"#fff":"#566275"}}>{l}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto px-5 pb-5" style={{minHeight:0}}>

          {tab==="surcharge"&&<div>
            <h4 className="text-xs font-bold mt-2 mb-3" style={{color:"#4338ca"}}>特別加算（共通設定のチェックに連動）</h4>
            {surcharges.map((s,i)=>(
              <div key={s.id} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">{i===0&&<label className="block text-xs mb-1" style={{color:"#8393a7"}}>項目名</label>}
                  <input type="text" value={s.name} placeholder="項目名" onChange={e=>updSc(i,{name:e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",color:"#1a2233"}}
                    onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} /></div>
                <div style={{width:120}}>{i===0&&<label className="block text-xs mb-1" style={{color:"#8393a7"}}>金額</label>}
                  <div className="flex items-center gap-1"><input type="number" value={s.amount} min={0} step={1000}
                    onChange={e=>updSc(i,{amount:e.target.value===""?0:Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none text-right" style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",color:"#1a2233",fontVariantNumeric:"tabular-nums"}}
                    onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} />
                    <span className="text-xs flex-shrink-0" style={{color:"#8393a7"}}>円</span></div></div>
                <button onClick={()=>rmSc(i)} className="text-xs px-2 py-2 rounded-lg hover:bg-red-50 flex-shrink-0" style={{color:"#e53e3e"}}>✕</button>
              </div>
            ))}
            <button onClick={addSc} className="text-xs py-2 px-4 rounded-lg font-medium w-full mt-1"
              style={{color:"#4338ca",background:"#eef2ff",border:"1.5px dashed #c7d2fe"}}>＋ 加算項目を追加</button>
            <button onClick={()=>{if(confirm("デフォルトに戻しますか？"))setSurcharges(DEF_SURCHARGES.map(s=>({...s})));}}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{color:"#e53e3e",background:"#fef2f2"}}>デフォルトに戻す</button>

            <h4 className="text-xs font-bold mt-5 mb-3" style={{color:"#4338ca"}}>基本報酬（抹消・住変）</h4>
            <div className="grid grid-cols-2 gap-x-3">
              <Inp label="抹消 基本報酬" value={unit.deletionBase} onChange={v=>setUnit({...unit,deletionBase:v})} suffix="円" />
              <Inp label="抹消 不動産加算" value={unit.deletionPropAdd} onChange={v=>setUnit({...unit,deletionPropAdd:v})} suffix="円/個" />
              <Inp label="住変 基本報酬" value={unit.addressBase} onChange={v=>setUnit({...unit,addressBase:v})} suffix="円" />
              <Inp label="住変 不動産加算" value={unit.addressPropAdd} onChange={v=>setUnit({...unit,addressPropAdd:v})} suffix="円/個" />
            </div>

            <h4 className="text-xs font-bold mt-5 mb-3" style={{color:"#4338ca"}}>その他単価</h4>
            <Inp label="不動産加算（移転・保存・設定 1個あたり）" value={unit.propAdd} onChange={v=>setUnit({...unit,propAdd:v})} suffix="円" />
            <button onClick={()=>{if(confirm("デフォルトに戻しますか？"))setUnit({...DEF_UNIT});}}
              className="mt-1 text-xs px-3 py-1.5 rounded-lg" style={{color:"#e53e3e",background:"#fef2f2"}}>デフォルトに戻す</button>
          </div>}

          {tab==="stdItems"&&<div>
            <p className="text-xs mb-3" style={{color:"#8393a7"}}>登記事項証明書・登記情報などの項目。追加した項目は本画面の「追加項目」でプルダウン選択できます。▲▼で並び替え。</p>
            {stdItems.map((si,i)=>(
              <div key={si.id} className="rounded-lg mb-2 p-3" style={{background:"#f9fafb",border:"1px solid #e5e9f0"}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={()=>{if(i>0)setStdItems(swap(stdItems,i,i-1));}} disabled={i===0}
                      className="text-xs leading-none px-1" style={{color:i===0?"#d1d5db":"#4338ca"}}>▲</button>
                    <button onClick={()=>{if(i<stdItems.length-1)setStdItems(swap(stdItems,i,i+1));}} disabled={i===stdItems.length-1}
                      className="text-xs leading-none px-1" style={{color:i===stdItems.length-1?"#d1d5db":"#4338ca"}}>▼</button>
                  </div>
                  <input type="text" value={si.name} placeholder="項目名" onChange={e=>updSI(i,{name:e.target.value})}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none font-medium"
                    style={{background:"#fff",border:"1.5px solid #dce1ea",color:"#1a2233"}}
                    onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} />
                  <button onClick={()=>rmSI(i)} className="text-xs px-2 py-1 rounded-lg hover:bg-red-50 flex-shrink-0" style={{color:"#e53e3e"}}>✕</button>
                </div>
                <div className="grid grid-cols-3 gap-x-2">
                  <div><label className="block text-xs mb-1" style={{color:"#8393a7"}}>報酬</label>
                    <div className="flex items-center gap-1"><input type="number" value={si.fee} min={0}
                      onChange={e=>updSI(i,{fee:e.target.value===""?0:Number(e.target.value)})}
                      className="w-full px-2 py-1.5 rounded-lg text-sm outline-none text-right"
                      style={{background:"#fff",border:"1.5px solid #dce1ea",fontVariantNumeric:"tabular-nums"}}
                      onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} />
                      <span className="text-xs flex-shrink-0" style={{color:"#8393a7"}}>円</span></div></div>
                  <div><label className="block text-xs mb-1" style={{color:"#8393a7"}}>実費</label>
                    <div className="flex items-center gap-1"><input type="number" value={si.jippi} min={0}
                      onChange={e=>updSI(i,{jippi:e.target.value===""?0:Number(e.target.value)})}
                      className="w-full px-2 py-1.5 rounded-lg text-sm outline-none text-right"
                      style={{background:"#fff",border:"1.5px solid #dce1ea",fontVariantNumeric:"tabular-nums"}}
                      onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} />
                      <span className="text-xs flex-shrink-0" style={{color:"#8393a7"}}>円</span></div></div>
                  <div><label className="block text-xs mb-1" style={{color:"#8393a7"}}>単位</label>
                    <input type="text" value={si.unitLabel} onChange={e=>updSI(i,{unitLabel:e.target.value})}
                      className="w-full px-2 py-1.5 rounded-lg text-sm outline-none"
                      style={{background:"#fff",border:"1.5px solid #dce1ea"}}
                      onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} /></div>
                </div>
              </div>
            ))}
            <button onClick={addSI} className="text-xs py-2 px-4 rounded-lg font-medium w-full mt-1"
              style={{color:"#4338ca",background:"#eef2ff",border:"1.5px dashed #c7d2fe"}}>＋ 項目を追加</button>
            <button onClick={()=>{if(confirm("デフォルトに戻しますか？"))setStdItems(DEF_STD_ITEMS.map(s=>({...s})));}}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{color:"#e53e3e",background:"#fef2f2"}}>デフォルトに戻す</button>
          </div>}

          {tab==="table"&&<div>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <p className="text-xs" style={{color:"#8393a7"}}>セルをタップして編集（全{ft.length}行）</p>
              <button onClick={()=>{if(confirm("デフォルトに戻しますか？"))setFt(DEF_FT.map(r=>[...r]));}}
                className="text-xs px-3 py-1.5 rounded-lg" style={{color:"#e53e3e",background:"#fef2f2"}}>デフォルトに戻す</button>
            </div>
            <div className="overflow-auto rounded-lg" style={{border:"1px solid #e5e9f0",flex:"1 1 auto"}}>
              <table className="w-full text-xs" style={{minWidth:700,borderCollapse:"collapse"}}>
                <thead style={{position:"sticky",top:0,zIndex:2}}><tr style={{background:"#eef2ff"}}>
                  {COL_NAMES.map((n,i)=><th key={i} className="px-2 py-2 text-left font-medium whitespace-nowrap"
                    style={{color:"#4338ca",borderBottom:"2px solid #c7d2fe",position:i===0?"sticky":"static",left:i===0?0:"auto",background:"#eef2ff",zIndex:i===0?3:2}}>{n}</th>)}
                </tr></thead>
                <tbody>{ft.map((row,ri)=>(
                  <tr key={ri} style={{background:ri%2===0?"#fff":"#fafbfd"}}>
                    {row.map((v,ci)=>{
                      const editing=editCell?.ri===ri&&editCell?.ci===ci;
                      return <td key={ci} className="px-2 py-1.5 cursor-pointer whitespace-nowrap"
                        style={{borderBottom:"1px solid #f0f3f8",color:ci===0?"#4338ca":"#1a2233",fontVariantNumeric:"tabular-nums",fontWeight:ci===0?"600":"400",
                          position:ci===0?"sticky":"static",left:ci===0?0:"auto",background:ci===0?(ri%2===0?"#fff":"#fafbfd"):"transparent",zIndex:ci===0?1:0}}
                        onClick={()=>!editing&&startEdit(ri,ci)}>
                        {editing?<input ref={inputRef} type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                          onBlur={commitEdit} onKeyDown={e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditCell(null);}}
                          className="w-full px-1 py-0.5 rounded text-xs outline-none" style={{background:"#eff6ff",border:"1.5px solid #3d7ce0",fontVariantNumeric:"tabular-nums"}} />
                          :ci===0?v.toLocaleString()+"万":v.toLocaleString()}
                      </td>;
                    })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>}
        </div>
        <div className="px-5 py-3 flex-shrink-0 flex gap-2 items-center" style={{borderTop:"1px solid #e5e9f0"}}>
          <button onClick={doExport} className="px-4 py-2.5 rounded-xl text-xs font-medium" style={{background:"#eef2ff",color:"#4338ca",border:"1px solid #c7d2fe"}}>設定エクスポート</button>
          <button onClick={()=>fileRef.current?.click()} className="px-4 py-2.5 rounded-xl text-xs font-medium" style={{background:"#f0fdf4",color:"#059669",border:"1px solid #bbf7d0"}}>設定インポート</button>
          <input ref={fileRef} type="file" accept=".json" onChange={doImport} style={{display:"none"}} />
          <div className="flex-1" />
          <button onClick={onClose} className="px-8 py-2.5 rounded-xl text-sm font-medium text-white" style={{background:"linear-gradient(135deg,#4338ca,#3730a3)"}}>閉じる</button>
        </div>
        <div onMouseDown={onResizeStart} onTouchStart={onResizeStart}
          style={{position:"absolute",right:0,bottom:0,width:28,height:28,cursor:"nwse-resize",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"0 0 16px 0",userSelect:"none",touchAction:"none"}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="#b0b8c4" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </div>
    </div>);
}

// ── Card ──
function Card({item,index,onUpdate,onRemove,g,addFee=0}){
  const u=p=>onUpdate({...item,...p});const r=calcItem(item,g);const dispFee=index===0?r.fee+addFee:r.fee;
  const needDA=["mortgage","rootMortgage"].includes(item.type);
  const dM=Math.ceil((item.debtAmount||0)/10000);
  const cl={transfer:"#2563eb",preservation:"#059669",mortgage:"#d97706",rootMortgage:"#dc2626",deletion:"#6b7280",addressChange:"#6b7280"};
  const[showTaxProc,setShowTaxProc]=useState(false);
  return(
    <div className="rounded-xl p-4 mb-3" style={{background:"#fff",border:"1px solid #e5e9f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2"><div className="w-1.5 h-6 rounded-full" style={{background:cl[item.type]}} />
          <span className="text-xs font-bold" style={{color:cl[item.type]}}>{LB[item.type]} #{index+1}</span></div>
        <button onClick={onRemove} className="text-xs px-2 py-1 rounded hover:bg-red-50" style={{color:"#e53e3e"}}>削除</button></div>
      <div className="grid grid-cols-2 gap-x-3">
        <Sel label="登記種別" value={item.type} onChange={v=>u({type:v})} options={[
          {value:"transfer",label:"所有権移転"},{value:"preservation",label:"所有権保存"},
          {value:"mortgage",label:"抵当権設定"},{value:"rootMortgage",label:"根抵当権設定"},
          {value:"deletion",label:"抹消"},{value:"addressChange",label:"住所・氏名変更"},
        ]} />
        <Inp label="不動産の個数" value={item.propCount} onChange={v=>u({propCount:v})} min={1} step={1} suffix="個" />
      </div>
      {item.type==="transfer"&&<>
        <Sel label="原因" value={item.causeType} onChange={v=>u({causeType:v})} options={[
          {value:"sale",label:"売買"},{value:"inheritance",label:"相続（4/1000）"},{value:"gift",label:"贈与・財産分与等（20/1000）"},
        ]} />
        {item.causeType==="sale"?(
          <div className="p-3 rounded-lg mb-3" style={{background:"#eff6ff",border:"1px solid #bfdbfe"}}>
            <p className="text-xs font-bold mb-2" style={{color:"#1d4ed8"}}>土地・建物の評価額を分けて入力</p>
            <Inp label="土地の評価額合計" value={item.landValue} onChange={v=>u({landValue:v})} suffix="円" placeholder="例: 10000000" />
            <Inp label="建物の評価額合計" value={item.buildingValue} onChange={v=>u({buildingValue:v})} suffix="円" placeholder="例: 5000000" />
            {(item.landValue||item.buildingValue)&&<div className="text-xs mt-1 p-2 rounded" style={{background:"#dbeafe",color:"#1e40af"}}>報酬テーブル: 合計 {fmtM(Math.ceil(((item.landValue||0)+(item.buildingValue||0))/10000))}区分</div>}
          </div>
        ):(<div className="p-3 rounded-lg mb-3" style={{background:"#f0fdf4",border:"1px solid #bbf7d0"}}>
            <Inp label="課税標準額（評価額合計）" value={item.landValue} onChange={v=>u({landValue:v,buildingValue:0})} suffix="円" />
          </div>)}
      </>}
      {item.type==="preservation"&&<Inp label="課税標準額（固定資産評価額）" value={item.taxableValue} onChange={v=>u({taxableValue:v})} suffix="円"
        note={item.taxableValue?`→ ${fmtM(Math.ceil(item.taxableValue/10000))}区分`:""} />}
      {needDA&&<div className="p-3 rounded-lg mb-3" style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
        <Inp label={item.type==="rootMortgage"?"★ 極度額":"★ 債権金額"} value={item.debtAmount} onChange={v=>u({debtAmount:v})} suffix="円" placeholder="例: 30000000"
          note={item.debtAmount?`→ ${fmtM(dM)}区分`:"報酬・登免税ともにこの金額ベース"} />
      </div>}
      <div className="mt-2 pt-3" style={{borderTop:"1px dashed #dce1ea"}}>
        <Rw label="報酬（税抜）" value={fmt(dispFee)} bold />
        <Rw label={r.isSimpleType?`　基本（${r.col}）`:`　基本（${r.col} / ${fmtM(r.lv)}）`} value={fmt(r.fb)} sub />
        {r.ep>0&&<Rw label={`　不動産加算 (${(item.propCount||1)-1}個×${r.propAddUnit.toLocaleString()})`} value={fmt(r.ep)} sub />}
        {addFee>0&&index===0&&<Rw label="　加算・追加報酬" value={fmt(addFee)} sub />}
        <div className="flex justify-between items-center py-1.5" style={{borderBottom:"1px solid #edf0f5"}}>
          <span className="text-sm font-medium" style={{color:"#3a4557"}}>登録免許税</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{color:"#1a2233",fontVariantNumeric:"tabular-nums"}}>{fmt(r.tax)}</span>
            {r.txd.steps.length>0&&<button onClick={()=>setShowTaxProc(!showTaxProc)} className="text-xs px-1.5 py-0.5 rounded"
              style={{background:showTaxProc?"#fef3c7":"#f0f3f8",color:showTaxProc?"#92400e":"#8393a7",border:"1px solid "+(showTaxProc?"#fde68a":"#dce1ea")}}>
              {showTaxProc?"▲ 閉じる":"▼ 計算過程"}</button>}
          </div>
        </div>
        {showTaxProc&&r.txd.steps.length>0&&(
          <div className="p-2.5 rounded-lg mt-1 mb-1" style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
            {r.txd.steps.map((s,i)=>(
              <div key={i} className="mb-1.5 last:mb-0">
                <span className="text-xs font-medium" style={{color:"#92400e"}}>{s.l}：</span>
                <span className="text-xs" style={{color:"#78350f",fontVariantNumeric:"tabular-nums"}}>{s.v}</span>
              </div>
            ))}
          </div>
        )}
        <Rw label="小計" value={fmt(dispFee+r.tax)} hl bold />
      </div>
    </div>);
}

// ── Bank ──
function BankMgr({saved,setSaved,onSelect,onClose}){
  const[nb,setNb]=useState({label:"",bankName:"",branchName:"",accountType:"普通",accountNumber:""});
  const add=()=>{if(!nb.bankName||!nb.branchName)return;setSaved(p=>[...p,{...nb,label:nb.label||`${nb.bankName} ${nb.branchName}`,id:Date.now()}]);setNb({label:"",bankName:"",branchName:"",accountType:"普通",accountNumber:""});};
  return(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}>
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl" style={{background:"#fff",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div className="flex justify-between items-center p-5 pb-3"><h3 className="text-base font-bold">振込先マスタ</h3><button onClick={onClose} className="text-xl px-2" style={{color:"#8393a7"}}>×</button></div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {saved.length>0&&<div className="mb-4">{saved.map(b=>(
            <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg mb-1.5" style={{background:"#f5f7fb",border:"1px solid #e5e9f0"}}>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{b.label}</p><p className="text-xs" style={{color:"#8393a7"}}>{b.bankName} {b.branchName} {b.accountType} {b.accountNumber}</p></div>
              <div className="flex gap-1 ml-2"><button onClick={()=>{onSelect(b);onClose();}} className="text-xs px-2.5 py-1 rounded-lg text-white" style={{background:"#3d7ce0"}}>選択</button><button onClick={()=>setSaved(p=>p.filter(x=>x.id!==b.id))} className="text-xs px-2 py-1" style={{color:"#e53e3e"}}>削除</button></div>
            </div>))}</div>}
          <div className="p-3 rounded-lg" style={{background:"#f0f9ff",border:"1px solid #bae6fd"}}>
            <p className="text-xs font-bold mb-2" style={{color:"#0369a1"}}>新規登録</p>
            <Inp label="表示名" value={nb.label} onChange={v=>setNb(p=>({...p,label:v}))} type="text" placeholder="メイン口座" />
            <div className="grid grid-cols-2 gap-x-2"><Inp label="銀行名" value={nb.bankName} onChange={v=>setNb(p=>({...p,bankName:v}))} type="text" /><Inp label="支店名" value={nb.branchName} onChange={v=>setNb(p=>({...p,branchName:v}))} type="text" /></div>
            <div className="grid grid-cols-2 gap-x-2"><Sel label="種別" value={nb.accountType} onChange={v=>setNb(p=>({...p,accountType:v}))} options={[{value:"普通",label:"普通"},{value:"当座",label:"当座"}]} /><Inp label="口座番号" value={nb.accountNumber} onChange={v=>setNb(p=>({...p,accountNumber:v}))} type="text" /></div>
            <button onClick={add} className="w-full py-2 rounded-lg text-sm font-medium text-white mt-1" style={{background:nb.bankName&&nb.branchName?"#3d7ce0":"#c5cdd8"}} disabled={!nb.bankName||!nb.branchName}>登録</button>
          </div>
        </div>
      </div>
    </div>);
}

// ── Export ──
const CLIENTS=[
  "フラックスコーポレーション株式会社","Ｎｉｋｋｏｒｉ　Ｈｏｕｓｅ株式会社","株式会社令和不動産",
  "株式会社ＡＲＣＨＩ　ＰＲＯＤＵＣＴＳ","株式会社エバーレンディング","まごころ不動産株式会社",
  "建築プランナー株式会社","株式会社プロムレット","西日本シティ銀行大橋駅前支店",
  "西日本シティ銀行　白木原支店","佐賀銀行　春日南支店","福岡銀行　二日市支店",
  "福岡銀行　春日原支店","ハナ銀行","株式会社ファミリーライフサービス",
  "ランドスペース有限会社","株式会社エム不動産","株式会社大興不動産",
  "三真不動産株式会社","株式会社ＳＥＣ","株式会社東武住販",
  "株式会社エンイノベーションズ","株式会社ＵＭＩプランニング","株式会社サンハウス",
  "株式会社サムライフ","ｔｒｙ株式会社","株式会社ファレノホールディングス",
  "ブルーエステート株式会社","株式会社ルームコンサルティング","株式会社ノヴァイフ",
  "ＬＵＣＫＹ　ＦＩＥＬＤ株式会社","株式会社ＰＬＥＡＳＴ","積水ハウス不動産九州株式会社",
  "株式会社ベストブライト","積水ハウス株式会社","悠悠ホーム株式会社",
  "株式会社テンマインド","株式会社エステート三丁目","六家株式会社",
  "株式会社カチタス飯塚店","福徳ハウジング","三幸不動産",
  "三井住友トラスト不動産株式会社","西鉄不動産株式会社大野城駅前店","西鉄不動産株式会社二日市店",
  "株式会社ＮＩパートーナーズ","株式会社カチタス北九州店","有限会社セゾンホーム",
  "株式会社コスモサービス","不動産マーケティング福岡株式会社","株式会社ほがらかハウジング",
  "株式会社Ｗａｋｗｏｒｋｓ","有限会社シーズコーポレーション","株式会社フェリスマネジメント",
  "株式会社レジアスコーポレーション","株式会社ベーシック","株式会社フォレストヴィラホーム",
  "西鉄不動産小郡三国が丘店","株式会社愛和不動産","株式会社サンコービルド",
  "行政書士松田知樹","弁護士柴山真人","税理士平田和寛",
  "土地家屋調査士三宅裕司","税理士飯塚貴司","税理士法人たかはし事務所",
  "弁護士川﨑尊義","税理士大場雅昭","髙田宏一郎",
  "税理士・行政書士三好美貴","行政書士保利国際法務事務所","弁護士鍋嶋隆志",
  "行政書士木村和生","税理士法人吉田会計事務所","税理士上村寿映明",
  "税理士法人Gardens","陳海燕国際法務事務所","株式会社DOORS",
  "株式会社Deep30","不動産登記（一般）","不動産登記（相続）",
  "商業登記","その他の業務","マザーホーム㈱",
  "佐賀共栄銀行","福岡信用金庫",
];
function Export({ci,setCi,items,expList,extras,rate,g,onClose,saved,setSaved}){
  const u=p=>setCi({...ci,...p});const uc=(i,p)=>{const c=[...ci.customers];c[i]={...(c[i]||{}),...p};u({customers:c});};
  const ub=(i,p)=>{const b=[...ci.banks];b[i]={...(b[i]||{}),...p};u({banks:b});};
  const[showBM,setShowBM]=useState(false);
  const bankInit=useRef(false);
  if(!bankInit.current&&saved.length>0&&!(ci.banks[0]||{}).bankName){
    bankInit.current=true;const bk=saved[0];const nb=[...ci.banks];nb[0]={bankName:bk.bankName,branchName:bk.branchName,accountType:bk.accountType,accountNumber:bk.accountNumber};setCi({...ci,banks:nb});
  }
  const tsv=genTSV(ci,items,expList,extras,rate,g);
  const doCopy=()=>navigator.clipboard.writeText(tsv).then(()=>alert("コピーしました！"));
  const doDL=()=>{const b=new Blob(["\uFEFF"+tsv],{type:"text/tab-separated-values;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`帳票_${ci.caseNumber||"案件"}.tsv`;a.click();};
  const sb=(bk,sl)=>ub(sl,{bankName:bk.bankName,branchName:bk.branchName,accountType:bk.accountType,accountNumber:bk.accountNumber});
  return(
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}>
      <div className="w-full max-w-xl rounded-t-2xl sm:rounded-2xl" style={{background:"#fff",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div className="flex justify-between items-center px-5 pt-5 pb-2 flex-shrink-0"><h3 className="text-base font-bold">帳票エクスポート</h3><button onClick={onClose} className="text-xl px-2" style={{color:"#8393a7"}}>×</button></div>
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="grid grid-cols-2 gap-x-3"><Inp label="事務所" value={ci.office} onChange={v=>u({office:v})} type="text" /><Inp label="請求日" value={ci.billingDate} onChange={v=>u({billingDate:v})} type="date" /></div>
          <div className="grid grid-cols-2 gap-x-3"><Inp label="事件番号" value={ci.caseNumber} onChange={v=>u({caseNumber:v})} type="text" />
            <div className="mb-3"><label className="block text-xs font-medium mb-1" style={{color:"#566275"}}>得意先</label>
              <input list="dl-clients" type="text" value={ci.client} onChange={e=>u({client:e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",color:"#1a2233"}}
                onFocus={e=>{e.target.style.borderColor="#3d7ce0";e.target.style.background="#fff"}}
                onBlur={e=>{e.target.style.borderColor="#dce1ea";e.target.style.background="#f0f3f8"}} />
              <datalist id="dl-clients">{CLIENTS.map(c=><option key={c} value={c}/>)}</datalist></div></div>
          <h4 className="text-xs font-bold mt-2 mb-2" style={{color:"#566275"}}>顧客名</h4>
          {[0,1,2].map(i=><div key={i} className="grid gap-x-2 mb-1" style={{gridTemplateColumns:"1fr auto"}}><Inp placeholder={`顧客名${["①","②","③"][i]}`} value={(ci.customers[i]||{}).name||""} onChange={v=>uc(i,{name:v})} type="text" /><div style={{width:90}}><Sel value={(ci.customers[i]||{}).title||""} onChange={v=>uc(i,{title:v})} options={[{value:"",label:"なし"},{value:"様",label:"様"},{value:"御中",label:"御中"}]} /></div></div>)}
          <h4 className="text-xs font-bold mt-2 mb-2 flex items-center justify-between" style={{color:"#566275"}}><span>振込先</span><button onClick={()=>setShowBM(true)} className="text-xs px-2 py-1 rounded-lg" style={{background:"#eef2ff",color:"#3d7ce0"}}>マスタ</button></h4>
          <div className="mb-2"><div className="flex items-center gap-1 mb-1"><span className="text-xs" style={{color:"#8393a7"}}>①</span>{saved.length>0&&<select className="text-xs px-2 py-0.5 rounded border ml-auto" style={{color:"#3d7ce0",borderColor:"#d4deff",background:"#eef2ff"}} value="" onChange={e=>{const b=saved.find(x=>String(x.id)===e.target.value);if(b)sb(b,0);}}><option value="">選択...</option>{saved.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}</select>}</div><div className="grid grid-cols-4 gap-x-2"><Inp placeholder="銀行名" value={(ci.banks[0]||{}).bankName||""} onChange={v=>ub(0,{bankName:v})} type="text" /><Inp placeholder="支店名" value={(ci.banks[0]||{}).branchName||""} onChange={v=>ub(0,{branchName:v})} type="text" /><Inp placeholder="種別" value={(ci.banks[0]||{}).accountType||""} onChange={v=>ub(0,{accountType:v})} type="text" /><Inp placeholder="口座番号" value={(ci.banks[0]||{}).accountNumber||""} onChange={v=>ub(0,{accountNumber:v})} type="text" /></div></div>
          <div className="mt-2"><Chk label="源泉対象" checked={!!ci.withholding} onChange={()=>u({withholding:!ci.withholding})} /></div>
          <div className="grid grid-cols-2 gap-x-3"><Inp label="備考" value={ci.note} onChange={v=>u({note:v})} type="text" /><Inp label="メモ" value={ci.memo} onChange={v=>u({memo:v})} type="text" /></div>
          <h4 className="text-xs font-bold mt-3 mb-2" style={{color:"#566275"}}>プレビュー</h4>
          <div className="p-3 rounded-lg text-xs overflow-x-auto" style={{background:"#f5f7fb",fontFamily:"'Courier New',monospace",whiteSpace:"pre",lineHeight:1.7,color:"#3a4557",maxHeight:180,overflowY:"auto"}}>{tsv}</div>
        </div>
        <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{borderTop:"1px solid #e5e9f0",borderRadius:"0 0 1rem 1rem"}}>
          <button onClick={doCopy} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{background:"#eef2ff",color:"#3d7ce0",border:"1px solid #d4deff"}}>クリップボードにコピー</button>
          <button onClick={doDL} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{background:"linear-gradient(135deg,#3d7ce0,#2558b3)"}}>TSVダウンロード</button>
        </div>
      </div>
      {showBM&&<BankMgr saved={saved} setSaved={setSaved} onSelect={b=>sb(b,0)} onClose={()=>setShowBM(false)} />}
    </div>);
}

// ══════════════════════════════════════════════════════
export default function App(){
  const mk=t=>({type:t,causeType:"sale",landValue:"",buildingValue:"",taxableValue:"",debtAmount:"",propCount:2});
  const[items,setItems]=useState([mk("transfer"),mk("mortgage")]);
  const[rate,setRate]=useState(10);
  const[rows,setRows]=useState([
    {kind:"std",stdId:"cert",count:0},
    {kind:"std",stdId:"info",count:0},
    {kind:"postage",amount:2400},
  ]);
  const updateRow=(idx,patch)=>setRows(p=>p.map((r,i)=>i===idx?{...r,...patch}:r));
  const removeRow=(idx)=>setRows(p=>p.filter((_,i)=>i!==idx));
  const moveRow=(idx,dir)=>{const j=idx+dir;setRows(p=>{if(j<0||j>=p.length)return p;const n=[...p];[n[idx],n[j]]=[n[j],n[idx]];return n;});};
  const counts=useMemo(()=>{const c={};rows.forEach(r=>{if(r.kind==="std")c[r.stdId]=r.count||0;});return c;},[rows]);
  const postage=useMemo(()=>(rows.find(r=>r.kind==="postage")||{}).amount||0,[rows]);
  const extras=useMemo(()=>rows.filter(r=>r.kind==="extra"),[rows]);
  const[showEx,setShowEx]=useState(false);
  const[showCfg,setShowCfg]=useState(false);
  const[saved,setSaved]=useState([]);
  const[housingCert,setHC]=useState("none");
  const[ft,setFt]=useState(()=>DEF_FT.map(r=>[...r]));
  const[unit,setUnit]=useState({...DEF_UNIT});
  const[surcharges,setSurcharges]=useState(()=>DEF_SURCHARGES.map(s=>({...s})));
  const[stdItems,setStdItems]=useState(()=>DEF_STD_ITEMS.map(s=>({...s})));
  const[enabledSc,setEnabledSc]=useState({});
  const[commonOpen,setCommonOpen]=useState(true);
  const[ci,setCi]=useState({office:"司法書士法人そうぞう",billingDate:new Date().toISOString().slice(0,10),caseNumber:"",client:"",customers:[{title:"様"},{},{}],banks:[{}],withholding:false,note:"",memo:""});

  useEffect(()=>{try{const r=localStorage.getItem("saved-banks");if(r){const p=JSON.parse(r);if(Array.isArray(p))setSaved(p);}}catch{};},[]);
  useEffect(()=>{try{localStorage.setItem("saved-banks",JSON.stringify(saved));}catch{};},[saved]);
  useEffect(()=>{try{const r=localStorage.getItem("fee-config-v4");if(r){const d=JSON.parse(r);if(d.ft)setFt(d.ft);if(d.unit)setUnit(u=>({...u,...d.unit}));if(d.surcharges)setSurcharges(d.surcharges);if(Array.isArray(d.stdItems))setStdItems(d.stdItems.filter(si=>si&&si.id&&si.name));}}catch{};},[]);
  useEffect(()=>{try{localStorage.setItem("fee-config-v4",JSON.stringify({ft,unit,surcharges,stdItems}));}catch{};},[ft,unit,surcharges,stdItems]);

  const hasTr=items.some(i=>i.type==="transfer");
  const hasMtg=items.some(i=>["mortgage","rootMortgage"].includes(i.type));
  const se={counts,postage};
  const g={hasTr,hasMtg,enabledSc,surcharges,housingCert,se,ft,unit,stdItems,counts};

  const expList=useMemo(()=>getExpList(counts,stdItems,postage,extras),[counts,stdItems,postage,extras]);
  const xfee=useMemo(()=>getXFee(counts,stdItems,extras),[counts,stdItems,extras]);
  const cardAddFee=useMemo(()=>extras.reduce((s,e)=>s+(Number(e.fee)||0),0),[extras]);
  const tot=useMemo(()=>{
    let tf=0,tt=0;items.forEach(it=>{const c=calcItem(it,g);tf+=c.fee;tt+=c.tax;});
    const scTotal=g.surcharges.reduce((s,sc)=>s+(g.enabledSc[sc.id]?sc.amount:0),0);
    tf+=scTotal+xfee;const et=expList.reduce((s,e)=>s+e.amount,0);const ct=Math.floor(tf*rate/100);
    return{tf,tt,ct,et,g:tf+ct+tt+et};
  },[items,rate,expList,xfee,g]);

  const autoLabel=hasTr&&hasMtg?"移転＋設定 → 移転(設定有) / 抵当権設定テーブル"
    :hasTr?"移転のみ → 移転(設定無)テーブル"
    :hasMtg?"設定のみ → 抵当権(設定のみ)テーブル":"—";

  const toggleSc=id=>setEnabledSc(p=>({...p,[id]:!p[id]}));

  const addFromTemplate=(siId)=>{
    const si=stdItems.find(s=>s.id===siId);
    if(si)setRows(p=>[...p,{kind:"extra",name:si.name,fee:String(si.fee),expense:String(si.jippi)}]);
  };

  return(
    <div className="min-h-screen" style={{background:"linear-gradient(160deg,#f5f7fb,#e8ecf4)",fontFamily:"'Noto Sans JP',sans-serif"}}>
      <header className="sticky top-0 z-10 backdrop-blur-md" style={{background:"rgba(255,255,255,0.88)",borderBottom:"1px solid #e5e9f0"}}>
        <div style={{maxWidth:1360}} className="mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#1e3a5f,#3d7ce0)"}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="#fff" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="#fff" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="#fff" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="#fff" strokeWidth="1.3"/></svg>
            </div>
            <div><h1 className="text-sm font-bold" style={{color:"#1a2233"}}>報酬・登録免許税 自動計算</h1><p className="text-xs" style={{color:"#8393a7"}}>報酬基準表準拠</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowCfg(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{background:"#4338ca",color:"#fff"}}>設定</button>
            <button onClick={()=>setShowEx(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{background:"#059669",color:"#fff"}}>帳票出力</button>
          </div>
        </div>
      </header>

      {/* ── メイン2カラム ── */}
      <main style={{maxWidth:1360,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"start"}} className="mx-auto px-8 py-5">
        {/* ── 左カラム: 共通設定 + 取引項目 ── */}
        <div style={{minWidth:0}}>
          <div className="rounded-xl p-4 mb-4" style={{background:"#fff",border:"1.5px solid #c7d2fe",boxShadow:"0 2px 8px rgba(99,102,241,0.08)"}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold" style={{color:"#4338ca"}}>共通設定</h3>
              <button onClick={()=>setCommonOpen(!commonOpen)} className="text-xs px-2 py-0.5 rounded" style={{color:"#6366f1",background:"#eef2ff"}}>
                {commonOpen?"折りたたむ":"展開"}</button>
            </div>
            {commonOpen?<>
              <div className="text-xs mb-3 px-2 py-1.5 rounded-lg" style={{background:"#eef2ff",color:"#4338ca"}}>{autoLabel}</div>
              <div className="flex flex-wrap gap-x-6">
                {surcharges.map(s=>s.name&&(
                  <Chk key={s.id} label={`${s.name}（+${s.amount.toLocaleString()}円）`}
                    checked={!!enabledSc[s.id]} onChange={()=>toggleSc(s.id)} accent="#f59e0b" />
                ))}
              </div>
              <Sel label="住宅用家屋証明書" value={housingCert} onChange={setHC} options={[
                {value:"none",label:"なし（原則税率）"},
                {value:"general",label:"一般住宅（移転3/1000・保存1.5/1000・設定1/1000）"},
                {value:"premium",label:"長期優良・低炭素（移転1/1000・保存1/1000・設定1/1000）"},
              ]} />
            </>:<div className="text-xs" style={{color:"#6366f1"}}>{surcharges.filter(s=>s.name&&enabledSc[s.id]).map(s=>s.name).join("・")||"加算なし"} / {housingCert==="none"?"家屋証明なし":housingCert==="general"?"一般住宅":"長期優良"}</div>}
          </div>

          {items.map((it,i)=><Card key={i} item={it} index={i} g={g} addFee={cardAddFee} onUpdate={ni=>setItems(p=>p.map((x,j)=>j===i?ni:x))} onRemove={()=>setItems(p=>p.filter((_,j)=>j!==i))} />)}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[["transfer","＋移転"],["preservation","＋保存"],["mortgage","＋抵当権"],["rootMortgage","＋根抵当"],["deletion","＋抹消"],["addressChange","＋住変"]].map(([t,l])=>(
              <button key={t} onClick={()=>setItems(p=>[...p,mk(t)])} className="py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md"
                style={{background:"#fff",border:"1.5px dashed #c5cdd8",color:"#5a6577"}}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── 右カラム: 実費 + 消費税 + 合計（sticky） ── */}
        <div style={{position:"sticky",top:68,minWidth:0}}>
          <div className="rounded-xl p-4 mb-3" style={{background:"#fff",border:"1px solid #e5e9f0"}}>
            <h3 className="text-xs font-bold mb-2" style={{color:"#566275"}}>謄本・情報 / 実費</h3>
            {rows.map((row,idx)=>{
              const arrows=(<div className="flex flex-col flex-shrink-0" style={{gap:0,marginRight:6}}>
                <button onClick={()=>moveRow(idx,-1)} disabled={idx===0} className="text-xs leading-none px-0.5" style={{color:idx===0?"#d1d5db":"#4338ca",background:"none",border:"none",cursor:idx===0?"default":"pointer"}}>▲</button>
                <button onClick={()=>moveRow(idx,1)} disabled={idx>=rows.length-1} className="text-xs leading-none px-0.5" style={{color:idx>=rows.length-1?"#d1d5db":"#4338ca",background:"none",border:"none",cursor:idx>=rows.length-1?"default":"pointer"}}>▼</button>
              </div>);
              if(row.kind==="std"){
                const si=stdItems.find(s=>s.id===row.stdId);if(!si)return null;const c=row.count||0;
                return(<div key={idx} className="py-2.5 flex items-center" style={{borderBottom:"1px solid #f0f3f8"}}>
                  {arrows}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3" style={{flexWrap:"nowrap"}}>
                      <span className="text-sm flex-1 min-w-0 truncate" style={{color:"#3a4557"}}>{si.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={()=>updateRow(idx,{count:Math.max(0,c-1)})} className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{background:"#f0f3f8",color:c>0?"#3a4557":"#c5cdd8",border:"1px solid #dce1ea"}}>−</button>
                        <span className="text-sm font-medium w-6 text-center" style={{fontVariantNumeric:"tabular-nums"}}>{c}</span>
                        <button onClick={()=>updateRow(idx,{count:c+1})} className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{background:"#f0f3f8",color:"#3a4557",border:"1px solid #dce1ea"}}>+</button>
                        <span className="text-xs w-4 flex-shrink-0" style={{color:"#8393a7"}}>{si.unitLabel}</span>
                      </div>
                    </div>
                    {c>0&&<div className="text-xs mt-1" style={{color:"#8393a7"}}>報酬 @{si.fee.toLocaleString()}円 = {fmt(c*si.fee)}　／　実費 @{si.jippi.toLocaleString()}円 = {fmt(c*si.jippi)}</div>}
                  </div>
                </div>);
              }
              if(row.kind==="postage"){
                return(<div key={idx} className="py-2.5 flex items-center" style={{borderBottom:"1px solid #f0f3f8"}}>
                  {arrows}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm" style={{color:"#3a4557"}}>郵送費</span>
                    <div className="flex items-center gap-1">
                      <input type="number" value={row.amount} min={0} step={100}
                        onChange={e=>updateRow(idx,{amount:e.target.value===""?0:Number(e.target.value)})}
                        className="w-24 px-2 py-1.5 rounded-lg text-sm text-right outline-none"
                        style={{background:"#f0f3f8",border:"1.5px solid #dce1ea",fontVariantNumeric:"tabular-nums"}}
                        onFocus={e=>{e.target.style.borderColor="#3d7ce0"}} onBlur={e=>{e.target.style.borderColor="#dce1ea"}} />
                      <span className="text-xs" style={{color:"#8393a7"}}>円</span>
                    </div>
                  </div>
                </div>);
              }
              if(row.kind==="extra"){
                const f=Number(row.fee)||0,x=Number(row.expense)||0;
                const sm=[];if(f>0)sm.push(`報酬 ${fmt(f)}`);if(x>0)sm.push(`立替 ${fmt(x)}`);
                return(<ExtraItem key={idx} item={row} index={idx} total={rows.length}
                  onChange={v=>updateRow(idx,v)}
                  onRemove={()=>removeRow(idx)}
                  onMove={d=>moveRow(idx,d)} />);
              }
              return null;
            })}
            <div className="flex gap-2 mt-2">
              <button onClick={()=>setRows(p=>[...p,{kind:"extra",name:"",fee:"",expense:""}])}
                className="text-xs py-2 px-4 rounded-lg font-medium flex-1"
                style={{color:"#3d7ce0",background:"#eef2ff",border:"1.5px dashed #c7d2fe"}}>＋ 自由入力</button>
              {stdItems.length>0&&<select value="" onChange={e=>{if(e.target.value)addFromTemplate(e.target.value);}}
                className="text-xs py-2 px-3 rounded-lg font-medium flex-1 cursor-pointer"
                style={{color:"#4338ca",background:"#eef2ff",border:"1.5px dashed #c7d2fe",appearance:"none",
                  backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234338ca'/%3E%3C/svg%3E")`,
                  backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}}>
                <option value="">＋ テンプレートから追加</option>
                {stdItems.map(si=><option key={si.id} value={si.id}>{si.name}（報酬{si.fee.toLocaleString()} / 実費{si.jippi.toLocaleString()}）</option>)}
              </select>}
            </div>
            {(xfee>0||expList.length>0)&&<div className="mt-3 pt-2 space-y-1" style={{borderTop:"1px dashed #dce1ea"}}>
              {xfee>0&&<div className="flex justify-between text-xs"><span style={{color:"#4338ca"}}>報酬小計（税対象）</span><span className="font-bold" style={{color:"#4338ca"}}>{fmt(xfee)}</span></div>}
              {expList.length>0&&<div className="flex justify-between text-xs"><span style={{color:"#92400e"}}>立替金合計</span><span className="font-bold" style={{color:"#92400e"}}>{fmt(expList.reduce((s,e)=>s+e.amount,0))}</span></div>}
            </div>}
          </div>

          <div className="rounded-xl p-4 mb-3" style={{background:"#fff",border:"1px solid #e5e9f0"}}><Inp label="消費税率" value={rate} onChange={setRate} suffix="%" min={0} step={1} /></div>

          <div className="rounded-xl p-5 mb-3" style={{background:"linear-gradient(135deg,#1e3a5f,#2558b3)",color:"#fff"}}>
            <h3 className="text-xs mb-3" style={{color:"rgba(255,255,255,0.55)"}}>合計</h3>
            {[["報酬（税抜）",fmt(tot.tf)],[`消費税（${rate}%）`,fmt(tot.ct)],["報酬（税込）",fmt(tot.tf+tot.ct)],["登録免許税",fmt(tot.tt)],...(tot.et>0?[["実費・立替金",fmt(tot.et)]]:[])]
              .map(([l,v],i)=><div key={i} className="flex justify-between mb-1"><span className="text-sm" style={{color:"rgba(255,255,255,0.75)"}}>{l}</span><span className="text-sm font-medium" style={{fontVariantNumeric:"tabular-nums"}}>{v}</span></div>)}
            <div className="pt-3 mt-2" style={{borderTop:"1px solid rgba(255,255,255,0.2)"}}>
              <div className="flex justify-between items-baseline"><span className="font-bold">合計請求額</span><span className="text-2xl font-bold" style={{fontVariantNumeric:"tabular-nums"}}>{fmt(tot.g)}</span></div>
            </div>
          </div>
          <button onClick={()=>setShowEx(true)} className="w-full py-3 rounded-xl text-sm font-bold text-white mb-4 hover:shadow-lg" style={{background:"linear-gradient(135deg,#059669,#047857)"}}>帳票システム用データを出力</button>
        </div>

        <p className="text-xs text-center px-4" style={{color:"#a0aec0",gridColumn:"1 / -1"}}>※ 参考値。土地売買15/1000は令和8年3月31日まで。住宅用家屋証明は令和9年3月31日まで。</p>
      </main>
      {showCfg&&<Settings ft={ft} setFt={setFt} unit={unit} setUnit={setUnit} surcharges={surcharges} setSurcharges={setSurcharges} stdItems={stdItems} setStdItems={setStdItems} onClose={()=>setShowCfg(false)} />}
      {showEx&&<Export ci={ci} setCi={setCi} items={items} expList={expList} extras={extras} rate={rate} g={g} onClose={()=>setShowEx(false)} saved={saved} setSaved={setSaved} />}
    </div>);
}
