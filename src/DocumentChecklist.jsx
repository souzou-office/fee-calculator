// src/DocumentChecklist.jsx
// 必要書類一覧作成ツール — fee-calculator統合版
import { useState, useRef, useMemo } from "react";

// ========== IMPORT / EXPORT HELPERS ==========
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}
function uploadJSON() {
  return new Promise(res => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = e => { const f = e.target.files?.[0]; if (!f) return res(null); const r = new FileReader(); r.onload = () => { try { res(JSON.parse(r.result)); } catch { res(null); } }; r.readAsText(f); };
    input.click();
  });
}
function uploadPDF() {
  return new Promise(res => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf";
    input.onchange = e => { const f = e.target.files?.[0]; if (!f) return res(null); const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.readAsDataURL(f); };
    input.click();
  });
}
async function parsePDFWithClaude(base64) {
  const prompt = `この司法書士事務所の「必要書類等一覧」PDFから以下の情報を抽出してJSON形式のみで返してください。JSON以外のテキストは一切含めないでください。 {"date":{"r":令和年数,"m":月,"d":日},"clientName":"宛名","honorific":"様or御中","propertyDesc":"不動産の表示","registryAddress":"登記簿上の住所","role":"seller or buyer","entity":"individual or corporate","isMail":true/false,"items":[{"text":"書類名","count":"１通","receiptInfo":"受付番号","rightsType":"識別情報or権利証"}]}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }, { type: "text", text: prompt }] }] }) });
    const d = await r.json(); const t = (d.content || []).map(c => c.text || "").join(""); return JSON.parse(t.replace(/`json|`/g, "").trim());
  } catch { return null; }
}

// ========== DATA ==========
const DEFAULT_OFFICE = { zip: "〒815-0033", address: "福岡市南区大橋一丁目４番１９号", name: "司法書士法人そうぞう", rep: "代表社員 浦 志寿馬　代表社員 池田 龍太", tel: "092-707-8550", fax: "092-510-0862", email: "info@souzou-office.jp" };
const INTRO = { default: "後記不動産に関する不動産取引に際して、下記書類等を御準備頂きますようお願い申し上げます。", mail: "後記不動産に関するお取引に際し、送付させて頂いた各書類への署名捺印 ならびに下記の必要書類をご準備頂きまして、同封のレターパックにてご返送くださいますようお願い申し上げます。" };
const COUNT_OPTIONS = ["", "１通", "２通", "３通", "４通", "５通"];
const SELLER_INDIVIDUAL = [
  { id: "si1", text: "登記識別情報通知", isRightsDoc: true, hasCount: true, defaultCount: "１通", noteRef: "rights" },
  { id: "si2", text: "印鑑証明書（３カ月以内のもの）", hasCount: true, defaultCount: "１通", isInkan: true, noteRef: "inkan" },
  { id: "si3", text: "住所変更関連書類", isAddressChange: true, noteRef: "address" },
  { id: "si11", text: "写真付き身分証明書（マイナンバーカード、運転免許証など）", condition: "face", fixed: true },
  { id: "si12", text: "写真付身分証明書のコピー（運転免許証、マイナンバーカード 等）", hasCount: true, defaultCount: "１通", condition: "mail", fixed: true },
];
const SELLER_CORPORATE = [
  { id: "sc1", text: "登記識別情報通知", isRightsDoc: true, hasCount: true, defaultCount: "１通" },
  { id: "sc2", text: "印鑑証明書（３カ月以内のもの）", hasCount: true, defaultCount: "１通", isInkan: true },
  { id: "sc5", text: "代表者の写真付き身分証明書（マイナンバーカード、運転免許証など）", fixed: true },
];
const BUYER_INDIVIDUAL = [
  { id: "bi1", text: "住民票（新住所移転後のもの）", hasCount: true, defaultCount: "１通" },
  { id: "bi2", text: "印鑑証明書（新住所移転後のもの）", hasCount: true, defaultCount: "１通", isInkan: true },
  { id: "bi4", text: "写真付き身分証明書（マイナンバーカード、運転免許証など）", hasCount: true, defaultCount: "１通", fixed: true },
];
const BUYER_CORPORATE = [
  { id: "bc2", text: "印鑑証明書（３カ月以内のもの）", hasCount: true, defaultCount: "１通", isInkan: true },
  { id: "bc4", text: "代表者の写真付き身分証明書（マイナンバーカード、運転免許証など）", fixed: true },
];
const DEFAULT_MAIL_ITEMS = [
  '署名捺印済みの「住所変更登記の委任状」', '署名捺印済みの「抵当権抹消登記の委任状」',
  '署名捺印済みの「抵当権抹消登記の書類受領の委任状」', '署名捺印済みの「所有権移転登記の委任状」',
  "記入済みの犯収法第４条に基づくチェックシート", '署名捺印済みの「登記原因証明情報」',
];
const NOTES_T = {
  seller_individual_face: [{ id: "n_pre", template: "pre_check" }, { id: "n_mail", static: true, text: "決済当日ご欠席になり、登記関係書類を事前に郵送でやりとりする場合は別途、郵送手続手数料（約５，１００円前後）が発生いたします。" }],
  seller_corporate_face: [{ id: "n_a3", static: true, text: "登記原因証明情報の印刷はA3サイズでお願い致します。他はA４サイズです。" }],
  buyer_individual_face: [{ id: "n_bank", static: true, text: "上記１、２の書類に関しましては、登記用として当事務所が金融機関から受領可能な場合は別途準備不要です。" }],
};
const DEFAULT_EXTRA = [
  '署名捺印済みの「住所変更登記の委任状」', '署名捺印済みの「抵当権抹消登記の委任状」',
  '署名捺印済みの「抵当権抹消登記の書類受領の委任状」', '署名捺印済みの「所有権移転登記の委任状」',
  '署名捺印済みの「登記原因証明情報」', "記入済みの犯収法第４条に基づくチェックシート",
  "印鑑証明書（３カ月以内のもの）", "住民票", "戸籍の附票", "写真付身分証明書のコピー",
  "委任状", "上申書", "不在籍不在住証明書", "固定資産評価証明書",
];
const FW = ["１","２","３","４","５","６","７","８","９","１０","１１","１２","１３","１４","１５"];

function getBase(role, entity) {
  if (role === "seller" && entity === "individual") return SELLER_INDIVIDUAL;
  if (role === "seller" && entity === "corporate") return SELLER_CORPORATE;
  if (role === "buyer" && entity === "individual") return BUYER_INDIVIDUAL;
  if (role === "buyer" && entity === "corporate") return BUYER_CORPORATE;
  return [];
}
function getNotes(role, entity, mail) { return NOTES_T[`${role}_${entity}_${mail ? "mail" : "face"}`] || []; }
function filterItems(base, mail, mailTexts) {
  const f = base.filter(it => !it.condition || it.condition === (mail ? "mail" : "face"));
  if (!mail || !mailTexts) return f;
  const mi = mailTexts.map((t, i) => ({ id: `mail_${i}`, text: t, hasCount: true, defaultCount: "１通", condition: "mail", isMailItem: true }));
  const fi = f.findIndex(it => it.fixed);
  fi >= 0 ? f.splice(fi, 0, ...mi) : f.push(...mi);
  return f;
}

function currentReiwa() { return new Date().getFullYear() - 2018; }
function toWareki(y, m, d) { try { const dt = new Date(y, m - 1, d); return isNaN(dt) ? "" : dt.toLocaleDateString("ja-JP-u-ca-japanese", { era: "long", year: "numeric", month: "long", day: "numeric" }); } catch { return ""; } }

function Combo({ value, options, onChange, w, suffix }) {
  return <div className="flex items-center gap-0.5">
    <div className="relative" style={{ width: w }}>
      <input type="number" className="w-full text-center text-sm rounded-lg outline-none" style={{ padding: "6px 4px", border: "1.5px solid #dce1ea", background: "#f0f3f8" }} value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)} />
      <select className="absolute inset-0 opacity-0 cursor-pointer" value={value || ""} onChange={e => onChange(parseInt(e.target.value))}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
    </div>
    {suffix && <span className="text-xs font-medium" style={{ color: "#566275" }}>{suffix}</span>}
  </div>;
}

// ========== MAIN COMPONENT ==========
export default function DocumentChecklist() {
  const [tab, setTab] = useState("seller");
  const [entity, setEntity] = useState({ seller: "individual", buyer: "individual" });
  const [isMail, setIsMail] = useState({ seller: false, buyer: false });
  const [screen, setScreen] = useState("edit");
  const [configStates, setConfigStates] = useState({});
  const cr = currentReiwa();
  const now = new Date();
  const [dp, setDp] = useState({ r: cr, m: now.getMonth() + 1, d: now.getDate() });
  const dw = toWareki(dp.r + 2018, dp.m, dp.d);
  const [meta, setMeta] = useState({ clientName: "", honorific: "様", propertyDescs: [""], registryAddress: "" });
  const [office, setOffice] = useState({ ...DEFAULT_OFFICE });
  const [extraItems, setExtraItems] = useState([...DEFAULT_EXTRA]);
  const [mailItemsRaw, setMailItemsRaw] = useState([...DEFAULT_MAIL_ITEMS]);
  const setMailItems = fn => { setMailItemsRaw(fn); setConfigStates(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (k.endsWith("_true")) delete n[k]; }); return n; }); };
  const mailItems = mailItemsRaw;
  const [newInput, setNewInput] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const dragRef = useRef({ from: null, to: null });

  const ce = entity[tab], cm = isMail[tab], ck = `${tab}_${ce}_${cm}`;

  const getState = () => {
    if (configStates[ck]) return configStates[ck];
    const items = filterItems(getBase(tab, ce), cm, mailItems).map(it => ({ ...it }));
    const enabled = {}, details = {};
    items.forEach(it => { enabled[it.id] = true; details[it.id] = { count: it.defaultCount || "", receiptInfo: "", rightsType: "識別情報", receipts: it.isRightsDoc ? [{ type: "識別情報", era: "令和", r: 0, m: 0, d: 0, num: "", count: "１通" }] : undefined }; });
    const nts = getNotes(tab, ce, cm), ne = {}; nts.forEach((_, i) => { ne[i] = true; });
    const st = { items, enabled, details, noteEnabled: ne, customItems: [], customNotes: [] };
    setConfigStates(p => ({ ...p, [ck]: st })); return st;
  };
  const state = getState();
  const allItems = [...state.items, ...(state.customItems || [])];
  const notesTmpl = getNotes(tab, ce, cm);
  const upd = fn => setConfigStates(p => ({ ...p, [ck]: fn(p[ck] || getState()) }));
  const toggleItem = id => { const it = allItems.find(i => i.id === id); if (it?.fixed) return; upd(s => ({ ...s, enabled: { ...s.enabled, [id]: !s.enabled[id] } })); };
  const updDetail = (id, f, v) => upd(s => ({ ...s, details: { ...s.details, [id]: { ...(s.details[id] || {}), [f]: v } } }));
  const updReceipt = (id, idx, f, v) => upd(s => {
    const d = { ...(s.details[id] || {}) }, rcs = [...(d.receipts || [])];
    rcs[idx] = { ...rcs[idx], [f]: v }; d.receipts = rcs;
    return { ...s, details: { ...s.details, [id]: d } };
  });
  const addReceipt = (id) => upd(s => {
    const d = { ...(s.details[id] || {}) };
    d.receipts = [...(d.receipts || []), { type: "識別情報", era: "令和", r: 0, m: 0, d: 0, num: "", count: "１通" }];
    return { ...s, details: { ...s.details, [id]: d } };
  });
  const removeReceipt = (id, idx) => upd(s => {
    const d = { ...(s.details[id] || {}) };
    d.receipts = (d.receipts || []).filter((_, i) => i !== idx);
    if (d.receipts.length === 0) d.receipts = [{ type: "識別情報", era: "令和", r: 0, m: 0, d: 0, num: "", count: "１通" }];
    return { ...s, details: { ...s.details, [id]: d } };
  });
  const toggleNote = i => upd(s => ({ ...s, noteEnabled: { ...s.noteEnabled, [i]: !s.noteEnabled[i] } }));
  const addItem = text => { if (!text.trim()) return; const id = `c_${Date.now()}`; upd(s => ({ ...s, customItems: [...(s.customItems || []), { id, text: text.trim(), hasCount: true, defaultCount: "１通", isCustom: true }], enabled: { ...s.enabled, [id]: true }, details: { ...s.details, [id]: { count: "１通", receiptInfo: "" } } })); setCustomInput(""); };
  const removeItem = id => upd(s => ({ ...s, customItems: (s.customItems || []).filter(i => i.id !== id), enabled: (() => { const e = { ...s.enabled }; delete e[id]; return e; })(), details: (() => { const d = { ...s.details }; delete d[id]; return d; })() }));
  const [noteInput, setNoteInput] = useState("");
  const addNote = text => { if (!text.trim()) return; upd(s => ({ ...s, customNotes: [...(s.customNotes || []), { id: `cn_${Date.now()}`, text: text.trim() }] })); setNoteInput(""); };
  const removeNote = id => upd(s => ({ ...s, customNotes: (s.customNotes || []).filter(n => n.id !== id) }));

  const hasInkan = allItems.some(it => it.isInkan && state.enabled[it.id]);
  const sealText = useMemo(() => ce === "corporate" ? (hasInkan ? "会社実印" : "会社印（認印可）") : (hasInkan ? "ご実印" : "個人印（認印可）"), [ce, hasInkan]);
  const corpSealPrefix = useMemo(() => hasInkan ? "会社実印で捺印済みの" : "会社印（認印可）で捺印済みの", [hasInkan]);

  const buildActive = () => {
    const list = allItems.filter(it => state.enabled[it.id]);
    if (!cm) { const si = { id: "*seal", text: sealText, isSeal: true }; const li = list.findLastIndex(it => it.isInkan); if (li >= 0) list.splice(li + 1, 0, si); else { const fi = list.findIndex(it => it.fixed); fi >= 0 ? list.splice(fi, 0, si) : list.push(si); } }
    return list;
  };
  const activeItems = buildActive();

  // Preview用: rights docを受付エントリーごとに個別の項目に展開
  const previewItems = useMemo(() => {
    const result = [];
    for (const item of activeItems) {
      if (item.isRightsDoc) {
        const d = state.details[item.id] || {};
        const receipts = d.receipts || [{ type: d.rightsType || "識別情報", era: d.receiptEra || "令和", r: d.receiptR || 0, m: d.receiptM || 0, d: d.receiptD || 0, num: d.receiptNum || "", count: d.count || "１通" }];
        receipts.forEach((rc, ri) => {
          const name = (rc.type || "識別情報") === "権利証" ? "登記済権利証" : "登記識別情報通知";
          const info = buildOneReceiptDate(rc);
          result.push({ ...item, id: `${item.id}_rc${ri}`, _rightsExpanded: true, _rightsName: name, _rightsInfo: info, _rightsCount: rc.count || "１通", noteRef: ri === 0 ? item.noteRef : undefined });
        });
      } else {
        result.push(item);
      }
    }
    return result;
  }, [activeItems, state.details]);
  const activeNotes = notesTmpl.filter((_, i) => state.noteEnabled[i]);
  const customNotes = state.customNotes || [];
  const introText = cm ? INTRO.mail : INTRO.default;
  const preNote = cm ? "書類への押印は１通につき２ヶ所（ご実印にて鮮明にお願いします。）" : null;
  const buildOneReceiptDate = (rc) => {
    if (!rc) return "";
    const { era, r, m, d: dd, num } = rc;
    if (!era && !r && !m && !dd && !num) return "";
    let s = "";
    if (era || r || m || dd) s = `${era || ""}${r || ""}年${m || ""}月${dd || ""}日`;
    if (num) s += num.endsWith("号") ? num : num + "号";
    return s;
  };
  const rightsTypeName = (type) => type === "権利証" ? "登記済権利証" : "登記識別情報通知";
  const buildRightsDisplay = (d) => {
    const receipts = d?.receipts;
    if (!receipts || receipts.length === 0) {
      // legacy fallback
      const name = rightsTypeName(d?.rightsType);
      const era = d?.receiptEra, r = d?.receiptR, m = d?.receiptM, dd = d?.receiptD, num = d?.receiptNum;
      const ri = buildOneReceiptDate({ era, r, m, d: dd, num }) || d?.receiptInfo || "";
      return [{ name, info: ri }];
    }
    // group by type
    const groups = {};
    for (const rc of receipts) {
      const t = rc.type || "識別情報", name = rightsTypeName(t);
      if (!groups[name]) groups[name] = [];
      const info = buildOneReceiptDate(rc);
      if (info) groups[name].push(info);
    }
    return Object.entries(groups).map(([name, infos]) => ({ name, info: infos.join("、") }));
  };
  const itemDisplayText = (it, d) => {
    if (it.isCorpDoc) return `${corpSealPrefix}「${it.text}」`;
    return it.text;
  };

  const buildNote = n => {
    if (n.template === "pre_check") {
      const ri = previewItems.findIndex(it => it.noteRef === "rights"), ii = previewItems.findIndex(it => it.noteRef === "inkan"), ai = previewItems.findIndex(it => it.noteRef === "address");
      const ae = allItems.some(it => it.isAddressChange && state.enabled[it.id]);
      const nums = []; if (ri >= 0) nums.push(FW[ri]); if (ii >= 0) nums.push(FW[ii]); if (ae && ai >= 0) nums.push(`（${FW[ai]}）`);
      return `大変恐縮ですが、上記${nums.join("、")}の書類に関しましては事前確認のため、当事務所宛にメールまたはFAXをお送り頂きますようお願い申し上げます。`;
    }
    return n.text;
  };

  const exportSettings = () => downloadJSON({ office, extraItems, mailItems, version: 2 }, "必要書類一覧_設定.json");
  const importSettings = async () => { const d = await uploadJSON(); if (!d) return; if (d.office) setOffice(d.office); if (d.extraItems) setExtraItems(d.extraItems); if (d.mailItems) setMailItems(() => d.mailItems); };

  const handlePDF = async () => {
    const b64 = await uploadPDF(); if (!b64) return;
    setPdfLoading(true);
    try {
      const p = await parsePDFWithClaude(b64); if (!p) { setPdfLoading(false); return; }
      if (p.date) setDp({ r: p.date.r || 0, m: p.date.m || 0, d: p.date.d || 0 });
      const pDescs = p.propertyDesc ? (Array.isArray(p.propertyDesc) ? p.propertyDesc : [p.propertyDesc]) : [""];
      setMeta(m => ({ ...m, clientName: p.clientName || "", honorific: p.honorific || "様", propertyDescs: pDescs.length ? pDescs : [""], registryAddress: p.registryAddress || "" }));
      const role = p.role || "seller", ent = p.entity || "individual", mail = !!p.isMail;
      setTab(role); setEntity(e => ({ ...e, [role]: ent })); setIsMail(m => ({ ...m, [role]: mail }));
      const key = `${role}_${ent}_${mail}`, base = filterItems(getBase(role, ent), mail, mailItems).map(it => ({ ...it }));
      const en = {}, dt = {};
      base.forEach(it => { en[it.id] = false; dt[it.id] = { count: "", receiptInfo: "", rightsType: "識別情報" }; });
      const unmatched = [];
      (p.items || []).forEach(pi => {
        const txt = pi.text || ""; let matched = false;
        for (const bi of base) {
          if (bi.isRightsDoc && (txt.includes("識別情報") || txt.includes("権利証") || txt.includes("登記済"))) { en[bi.id] = true; dt[bi.id] = { count: pi.count || bi.defaultCount || "", receiptInfo: pi.receiptInfo || "", rightsType: txt.includes("権利証") ? "権利証" : "識別情報" }; matched = true; break; }
          if (bi.isAddressChange && (txt.includes("附票") || txt.includes("住所変更"))) { en[bi.id] = true; matched = true; break; }
          if (bi.isInkan && txt.includes("印鑑証明")) { en[bi.id] = true; dt[bi.id] = { ...dt[bi.id], count: pi.count || bi.defaultCount || "" }; matched = true; break; }
          if (!bi.isRightsDoc && !bi.isAddressChange && !bi.isInkan && bi.text && txt.includes(bi.text.substring(0, 6))) { en[bi.id] = true; dt[bi.id] = { ...dt[bi.id], count: pi.count || bi.defaultCount || "" }; matched = true; break; }
        }
        base.forEach(bi => { if (bi.fixed) en[bi.id] = true; });
        if (!matched && txt && !txt.includes("実印") && !txt.includes("認印")) unmatched.push(pi);
      });
      const ci = unmatched.map((pi, i) => ({ id: `imp_${Date.now()}_${i}`, text: pi.text, hasCount: true, defaultCount: pi.count || "１通", isCustom: true }));
      ci.forEach(c => { en[c.id] = true; dt[c.id] = { count: c.defaultCount, receiptInfo: "" }; });
      const ne = {}; getNotes(role, ent, mail).forEach((_, i) => { ne[i] = true; });
      setConfigStates(prev => ({ ...prev, [key]: { items: base, enabled: en, details: dt, noteEnabled: ne, customItems: ci } }));
    } catch (e) { console.error(e); }
    setPdfLoading(false);
  };

  const ro = Array.from({ length: cr + 2 }, (_, i) => i + 1), mo = Array.from({ length: 12 }, (_, i) => i + 1), dayo = Array.from({ length: 31 }, (_, i) => i + 1);

  // ========== SETTINGS (統合) ==========
  if (screen === "settings") return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setScreen("edit")} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#f0f3f8", color: "#566275" }}>← 戻る</button>
        <h2 className="text-sm font-bold" style={{ color: "#1a2233" }}>設定</h2>
      </div>

      {/* 事務所情報 */}
      <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: "#4338ca" }}>事務所情報</h3>
        {[["zip","郵便番号"],["address","住所"],["name","事務所名"],["rep","代表者"],["tel","TEL"],["fax","FAX"],["email","メール"]].map(([k,l]) => (
          <div key={k} className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium w-16 shrink-0" style={{ color: "#566275" }}>{l}</label>
            <input className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={office[k]} onChange={e => setOffice(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
        <button onClick={() => setOffice({ ...DEFAULT_OFFICE })} className="text-xs px-3 py-1 rounded-lg mt-1" style={{ color: "#6366f1", background: "#eef2ff" }}>デフォルトに戻す</button>
      </div>

      {/* 郵送時の追加書類 */}
      <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: "#4338ca" }}>郵送時の追加書類</h3>
        {mailItems.map((n, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #f0f3f8" }}>
            <span className="flex-1 text-xs">{n}</span>
            <button className="text-base leading-none" style={{ color: "#ccc" }} onClick={() => setMailItems(p => p.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={newInput} onChange={e => setNewInput(e.target.value)} placeholder="追加…"
            onKeyDown={e => { if (e.key === "Enter" && newInput.trim()) { setMailItems(p => [...p, newInput.trim()]); setNewInput(""); } }} />
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#4338ca", color: "#fff" }}
            onClick={() => { if (newInput.trim()) { setMailItems(p => [...p, newInput.trim()]); setNewInput(""); } }}>追加</button>
        </div>
        <button onClick={() => setMailItems(() => [...DEFAULT_MAIL_ITEMS])} className="text-xs px-3 py-1 rounded-lg mt-2" style={{ color: "#6366f1", background: "#eef2ff" }}>デフォルトに戻す</button>
      </div>

      {/* よく使う項目 */}
      <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: "#4338ca" }}>よく使う項目</h3>
        {extraItems.map((n, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #f0f3f8" }}>
            <span className="flex-1 text-xs">{n}</span>
            <button className="text-base leading-none" style={{ color: "#ccc" }} onClick={() => setExtraItems(p => p.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={newInput} onChange={e => setNewInput(e.target.value)} placeholder="追加…"
            onKeyDown={e => { if (e.key === "Enter" && newInput.trim()) { setExtraItems(p => [...p, newInput.trim()]); setNewInput(""); } }} />
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#4338ca", color: "#fff" }}
            onClick={() => { if (newInput.trim()) { setExtraItems(p => [...p, newInput.trim()]); setNewInput(""); } }}>追加</button>
        </div>
        <button onClick={() => setExtraItems([...DEFAULT_EXTRA])} className="text-xs px-3 py-1 rounded-lg mt-2" style={{ color: "#6366f1", background: "#eef2ff" }}>デフォルトに戻す</button>
      </div>

      {/* インポート・エクスポート */}
      <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: "#4338ca" }}>データ管理</h3>
        <div className="flex gap-2">
          <button onClick={exportSettings} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium" style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>設定エクスポート</button>
          <button onClick={importSettings} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium" style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}>設定インポート</button>
        </div>
      </div>
    </div>
  );

  // ========== Preview panel (shared between side-by-side and mobile) ==========
  const printPDF = () => {
    const el = document.getElementById("doc-checklist-preview");
    if (!el) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>必要書類等一覧</title><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap');@page{margin:15mm 15mm;size:A4}body{font-family:'Noto Serif JP','Yu Mincho',serif;padding:40px 36px;color:#222;font-size:15px;line-height:1.8}@media print{body{padding:0}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const previewPanel = (
    <div>
      <div style={{ width: "100%", aspectRatio: "210 / 297", position: "relative", background: "#e8ecf4", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
        <div id="doc-checklist-preview" style={{ position: "absolute", inset: 0, overflow: "auto", padding: "32px 28px", background: "#fff", fontFamily: "'Noto Serif JP','Yu Mincho',serif", fontSize: 14, lineHeight: 1.8, color: "#222" }}>
          <div style={{ textAlign: "right", marginBottom: 14, fontSize: 12 }}>{dw}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{meta.clientName || "＿＿＿＿"} {meta.honorific}</div>
          <div style={{ textAlign: "right", marginBottom: 20, fontSize: 12, lineHeight: 1.7, color: "#444" }}>
            <div>{office.zip} {office.address}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{office.name}</div>
            <div>{office.rep}</div>
            <div style={{ fontSize: 11 }}>TEL : {office.tel} / FAX : {office.fax}</div>
            <div style={{ fontSize: 11 }}>{office.email}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 17, fontWeight: 700, letterSpacing: "0.3em", margin: "12px 0 16px" }}>必 要 書 類 等 一 覧</div>
          <div style={{ marginBottom: 14, textIndent: "1em", fontSize: 13 }}>{introText}</div>
          {preNote && <div style={{ marginBottom: 10, fontSize: 11, color: "#666" }}>＊ {preNote}</div>}
          <div style={{ marginBottom: 14 }}>
            {previewItems.map((item, idx) => {
              const num = FW[idx] || String(idx + 1), d = state.details[item.id] || {};
              if (item.isAddressChange) return <div key={item.id} style={{ display: "flex", marginBottom: 4, fontSize: 13 }}><span style={{ fontWeight: 500, flexShrink: 0, minWidth: 26 }}>{num}．</span><div style={{ flex: 1 }}><div>住民票 または 戸籍の附票</div><div style={{ fontSize: 11, color: "#555", marginTop: 1, lineHeight: 1.5 }}>{meta.registryAddress ? `登記簿上の住所「${meta.registryAddress}」から現住所まで移転の経緯全てが記載されているもの` : "現住所が登記簿上の住所と異なる場合のみ、登記簿上の住所から現住所まで移転の経緯全てが記載されているもの"}</div><div style={{ fontSize: 11, color: "#555" }}>（別途、住所変更登記の費用が発生いたします。）</div></div></div>;
              if (item.isSeal) return <div key={item.id} style={{ display: "flex", marginBottom: 4, fontSize: 13 }}><span style={{ fontWeight: 500, flexShrink: 0, minWidth: 26 }}>{num}．</span><span>{item.text}</span></div>;
              if (item._rightsExpanded) {
                return <div key={item.id} style={{ display: "flex", marginBottom: 4, fontSize: 13 }}><span style={{ fontWeight: 500, flexShrink: 0, minWidth: 26 }}>{num}．</span><span style={{ flex: 1 }}>{item._rightsName}{item._rightsInfo && <span style={{ fontSize: 11, color: "#666" }}>（{item._rightsInfo}）</span>}</span>{item._rightsCount && <span style={{ fontSize: 12, color: "#555", marginLeft: 6 }}>{item._rightsCount}</span>}</div>;
              }
              return <div key={item.id} style={{ display: "flex", marginBottom: 4, fontSize: 13 }}><span style={{ fontWeight: 500, flexShrink: 0, minWidth: 26 }}>{num}．</span><span style={{ flex: 1 }}>{itemDisplayText(item, d)}</span>{d.count && <span style={{ fontSize: 12, color: "#555", marginLeft: 6 }}>{d.count}</span>}</div>;
            })}
          </div>
          {(activeNotes.length > 0 || customNotes.length > 0) && <div style={{ marginTop: 14, paddingTop: 8, borderTop: "1px dashed #ddd" }}>
            {activeNotes.map((n, i) => <div key={i} style={{ fontSize: 12, color: "#555", marginBottom: 4, lineHeight: 1.5 }}>＊ {buildNote(n)}</div>)}
            {customNotes.map((n) => <div key={n.id} style={{ fontSize: 12, color: "#555", marginBottom: 4, lineHeight: 1.5 }}>＊ {n.text}</div>)}
          </div>}
          <div style={{ marginTop: 20, paddingTop: 10, textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>不動産の表示</div>{meta.propertyDescs.filter(s => s).length > 0 ? meta.propertyDescs.filter(s => s).map((pd, i) => <div key={i} style={{ fontSize: 14 }}>{pd}</div>) : <div style={{ fontSize: 14 }}>＿＿＿＿＿＿＿＿</div>}</div>
        </div>
      </div>
      <button onClick={printPDF} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-3" style={{ background: "#1e3a5f", color: "#fff" }}>PDF出力</button>
    </div>
  );

  // ========== EDIT (side-by-side with preview) ==========
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left: Edit panel */}
      <div className="flex-1 min-w-0">
        {/* Header with settings */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={handlePDF} disabled={pdfLoading} className="px-4 py-2 rounded-xl text-xs font-medium" style={{ border: "1.5px dashed #c7d2fe", background: "#fff", color: "#4338ca" }}>
            {pdfLoading ? "⏳ 読み取り中…" : "📄 PDFから取込"}
          </button>
          <button onClick={() => setScreen("settings")} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "#f0f3f8", color: "#566275", border: "1.5px solid #e5e9f0" }}>⚙ 設定</button>
        </div>

        {/* Tabs: 売主/買主 */}
        <div className="flex mb-3 rounded-xl overflow-hidden" style={{ border: "1.5px solid #e5e9f0" }}>
          {[["seller", "売主"], ["buyer", "買主"]].map(([k, l]) => (
            <button key={k} className="flex-1 py-2.5 text-sm font-bold transition-all" style={{ background: tab === k ? "#4338ca" : "#fff", color: tab === k ? "#fff" : "#8393a7" }} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid #dce1ea" }}>
            {[["individual", "個人"], ["corporate", "法人"]].map(([k, l]) => (
              <button key={k} className="px-4 py-1.5 text-xs font-medium transition-all" style={{ background: ce === k ? "#4338ca" : "#f0f3f8", color: ce === k ? "#fff" : "#566275" }} onClick={() => setEntity(p => ({ ...p, [tab]: k }))}>{l}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMail(p => ({ ...p, [tab]: !p[tab] }))}>
            <div className="relative rounded-full transition-all" style={{ width: 36, height: 20, background: cm ? "#4338ca" : "#dce1ea" }}>
              <div className="absolute top-1 rounded-full bg-white shadow transition-all" style={{ width: 16, height: 16, left: cm ? 18 : 2 }} />
            </div>
            <span className="text-xs font-medium" style={{ color: cm ? "#4338ca" : "#8393a7" }}>郵送</span>
          </label>
        </div>

        {/* Meta */}
        <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <label className="text-xs font-medium w-16 shrink-0" style={{ color: "#566275" }}>日付</label>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-medium" style={{ color: "#566275" }}>令和</span>
              <Combo value={dp.r} options={ro} onChange={v => setDp(p => ({ ...p, r: v }))} w={48} suffix="年" />
              <Combo value={dp.m} options={mo} onChange={v => setDp(p => ({ ...p, m: v }))} w={42} suffix="月" />
              <Combo value={dp.d} options={dayo} onChange={v => setDp(p => ({ ...p, d: v }))} w={42} suffix="日" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium w-16 shrink-0" style={{ color: "#566275" }}>宛名</label>
            <input className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={meta.clientName} onChange={e => setMeta(p => ({ ...p, clientName: e.target.value }))} placeholder="氏名・会社名" />
            <select className="px-2 py-2 rounded-lg text-sm outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={meta.honorific} onChange={e => setMeta(p => ({ ...p, honorific: e.target.value }))}><option value="様">様</option><option value="御中">御中</option></select>
          </div>
          {meta.propertyDescs.map((pd, i) => <div key={i} className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium w-16 shrink-0" style={{ color: "#566275" }}>{i === 0 ? "物件" : ""}</label>
            <input className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={pd} onChange={e => { const a = [...meta.propertyDescs]; a[i] = e.target.value; setMeta(p => ({ ...p, propertyDescs: a })); }} placeholder="不動産の表示" />
            {i > 0 && <button className="text-sm shrink-0" style={{ color: "#aaa" }} onClick={() => setMeta(p => ({ ...p, propertyDescs: p.propertyDescs.filter((_, j) => j !== i) }))}>✕</button>}
            {i === meta.propertyDescs.length - 1 && <button className="text-sm font-bold shrink-0 px-1.5 py-0.5 rounded" style={{ color: "#4338ca", background: "#eef2ff" }} onClick={() => setMeta(p => ({ ...p, propertyDescs: [...p.propertyDescs, ""] }))}>＋</button>}
          </div>)}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium w-16 shrink-0" style={{ color: "#566275" }}>登記住所</label>
            <input className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={meta.registryAddress} onChange={e => setMeta(p => ({ ...p, registryAddress: e.target.value }))} placeholder="住所変更がある場合" />
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "#4338ca" }}>書類項目 <span style={{ fontWeight: 400, color: "#8393a7" }}>{previewItems.length}件</span></h3>
          {allItems.map((item, idx) => {
            const d = state.details[item.id] || {}, en = state.enabled[item.id], fx = item.fixed;
            return <div key={item.id} className="flex items-start gap-2 py-2 rounded-lg mb-1 px-2" style={{ background: "#f8f9fc", borderLeft: `3px solid ${en ? (fx ? "#8393a7" : "#4338ca") : "#dce1ea"}` }}>
              {fx ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#e5e9f0", color: "#8393a7" }}>固定</span>
                : <div onClick={() => toggleItem(item.id)} className="w-5 h-5 rounded flex items-center justify-center cursor-pointer shrink-0 text-[11px] font-bold" style={{ background: en ? "#4338ca" : "#fff", border: `2px solid ${en ? "#4338ca" : "#ccc"}`, color: "#fff" }}>{en && "✓"}</div>}
              <div className="flex-1" style={{ opacity: en ? 1 : 0.4 }}>
                {item.isRightsDoc ? <span className="text-xs font-medium">{item.text}</span>
                  : <span className="text-xs font-medium">{item.text}{item.isMailItem && <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ color: "#4338ca", background: "#eef2ff" }}>郵送</span>}</span>}
                {item.isRightsDoc && en && <div className="mt-1">
                  {(d.receipts || [{ type: d.rightsType || "識別情報", era: d.receiptEra || "令和", r: d.receiptR || 0, m: d.receiptM || 0, d: d.receiptD || 0, num: d.receiptNum || "" }]).map((rc, ri) => (
                    <div key={ri} className="mb-1.5 rounded-lg px-2 py-1.5" style={{ background: "#fff", border: "1px solid #e5e9f0" }}>
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        <select className="text-[11px] px-1 py-0.5 rounded outline-none font-medium" style={{ border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca" }} value={rc.type || "識別情報"} onChange={e => updReceipt(item.id, ri, "type", e.target.value)}>
                          <option value="識別情報">識別情報</option><option value="権利証">登記済証</option>
                        </select>
                        <select className="text-[11px] px-1 py-0.5 rounded outline-none" style={{ border: "1px solid #dce1ea", background: "#f0f3f8", color: "#566275" }} value={rc.era || "令和"} onChange={e => updReceipt(item.id, ri, "era", e.target.value)}>
                          <option value="令和">令和</option><option value="平成">平成</option><option value="昭和">昭和</option>
                        </select>
                        <Combo value={rc.r || 0} options={ro} onChange={v => updReceipt(item.id, ri, "r", v)} w={44} suffix="年" />
                        <Combo value={rc.m || 0} options={mo} onChange={v => updReceipt(item.id, ri, "m", v)} w={38} suffix="月" />
                        <Combo value={rc.d || 0} options={dayo} onChange={v => updReceipt(item.id, ri, "d", v)} w={38} suffix="日" />
                        {(d.receipts || []).length > 1 && <button className="text-sm leading-none ml-1" style={{ color: "#ccc" }} onClick={() => removeReceipt(item.id, ri)}>×</button>}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <input className="flex-1 px-2 py-1 rounded text-xs outline-none" style={{ border: "1px solid #dce1ea", background: "#f0f3f8" }} value={rc.num || ""} onChange={e => updReceipt(item.id, ri, "num", e.target.value)} placeholder="例：第６９９７０" />
                        <select className="text-xs px-1 py-1 rounded outline-none shrink-0" style={{ border: "1px solid #dce1ea", background: "#f0f3f8" }} value={rc.count || "１通"} onChange={e => updReceipt(item.id, ri, "count", e.target.value)}>{COUNT_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}</select>
                      </div>
                    </div>
                  ))}
                  <button className="text-[11px] font-medium mt-1 px-2 py-0.5 rounded" style={{ color: "#4338ca", background: "#eef2ff" }} onClick={() => addReceipt(item.id)}>＋ 追加</button>
                </div>}
                {item.isAddressChange && en && <div className="text-[10px] mt-1" style={{ color: "#8393a7" }}>※「登記住所」の内容が反映されます</div>}
                {item.isInkan && <div className="text-[10px] mt-0.5 font-medium" style={{ color: "#4338ca" }}>→ {en ? (ce === "corporate" ? "会社実印" : "ご実印") : (ce === "corporate" ? "会社印（認印可）" : "個人印（認印可）")} が自動挿入</div>}
                {item.isCorpDoc && <div className="text-[10px] mt-0.5 font-medium" style={{ color: "#8393a7" }}>※ 印鑑証明書の有無で「会社実印」/「会社印（認印可）」が自動切替</div>}
              </div>
              {item.hasCount && !item.isRightsDoc && en && <select className="text-xs px-1 py-1 rounded outline-none shrink-0" style={{ border: "1px solid #dce1ea", background: "#f0f3f8" }} value={d.count || ""} onChange={e => updDetail(item.id, "count", e.target.value)}>{COUNT_OPTIONS.map(o => <option key={o} value={o}>{o || "−"}</option>)}</select>}
              {item.isCustom && <button className="text-base leading-none" style={{ color: "#ccc" }} onClick={() => removeItem(item.id)}>×</button>}
            </div>;
          })}
          {!cm && <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg text-xs" style={{ background: "#eef2ff", color: "#566275" }}><span>{hasInkan ? "🔴" : "🔵"}</span> 自動挿入：<b>{sealText}</b></div>}

          <div className="flex gap-2 mt-3">
            <input className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="項目を追加..."
              onKeyDown={e => { if (e.key === "Enter") addItem(customInput); }} />
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#4338ca", color: "#fff" }} onClick={() => addItem(customInput)}>追加</button>
          </div>
          <div className="mt-2">
            <button className="text-xs" style={{ color: "#8393a7" }} onClick={() => setShowExtra(!showExtra)}>{showExtra ? "▲ 閉じる" : "▼ よく使う項目"}</button>
          </div>
          {showExtra && <div className="flex flex-wrap gap-1.5 mt-2">{extraItems.map((n, i) => <button key={`${n}_${i}`} className="px-2 py-1 rounded text-[11px]" style={{ border: "1px solid #dce1ea", background: "#f8f9fc", color: "#566275" }} onClick={() => addItem(n)}>+ {n}</button>)}</div>}
        </div>

        {/* Notes */}
        <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid #e5e9f0" }}>
          <h3 className="text-xs font-bold mb-2" style={{ color: "#4338ca" }}>注記</h3>
          {notesTmpl.map((n, i) => <div key={i} className="flex items-start gap-2 mb-1.5" style={{ opacity: state.noteEnabled[i] ? 1 : 0.35 }}>
            <div onClick={() => toggleNote(i)} className="w-4 h-4 rounded flex items-center justify-center cursor-pointer shrink-0 text-[9px] font-bold mt-0.5" style={{ background: state.noteEnabled[i] ? "#4338ca" : "#fff", border: `2px solid ${state.noteEnabled[i] ? "#4338ca" : "#ccc"}`, color: "#fff" }}>{state.noteEnabled[i] && "✓"}</div>
            <span className="text-[11px]" style={{ color: "#566275", lineHeight: 1.5 }}>{buildNote(n)}</span>
          </div>)}
          {customNotes.map((n) => <div key={n.id} className="flex items-start gap-2 mb-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5" style={{ background: "#4338ca", border: "2px solid #4338ca", color: "#fff" }}>✓</div>
            <span className="flex-1 text-[11px]" style={{ color: "#566275", lineHeight: 1.5 }}>{n.text}</span>
            <button className="text-base leading-none shrink-0" style={{ color: "#ccc" }} onClick={() => removeNote(n.id)}>×</button>
          </div>)}
          <div className="flex gap-2 mt-2">
            <input className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: "#f0f3f8", border: "1.5px solid #dce1ea" }} value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="注記を追加..."
              onKeyDown={e => { if (e.key === "Enter") addNote(noteInput); }} />
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#4338ca", color: "#fff" }} onClick={() => addNote(noteInput)}>追加</button>
          </div>
        </div>

      </div>

      {/* Right: Preview panel (sticky on desktop, flows below on mobile) */}
      <div className="w-full lg:w-[560px] lg:shrink-0">
        <div className="lg:sticky lg:top-4">
          <h2 className="text-xs font-bold mb-2" style={{ color: "#8393a7" }}>プレビュー</h2>
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
