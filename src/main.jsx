import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import DocumentChecklist from './DocumentChecklist'

function Root() {
  const [page, setPage] = useState("calc");

  return (
    <>
      {/* Page-level tab bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "linear-gradient(135deg,#312e81,#4338ca)",
        fontFamily: "'Noto Sans JP',sans-serif",
      }}>
        <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center" }}>
          {[["calc", "報酬計算"], ["docs", "必要書類一覧"]].map(([k, label]) => (
            <button key={k} onClick={() => setPage(k)}
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: page === k ? 700 : 500,
                color: page === k ? "#fff" : "rgba(255,255,255,0.55)",
                background: "none",
                border: "none",
                borderBottom: page === k ? "3px solid #fff" : "3px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f5f7fb,#e8ecf4)",
        fontFamily: "'Noto Sans JP',sans-serif",
      }}>
        {page === "calc" ? (
          <App />
        ) : (
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 40px" }}>
            <DocumentChecklist />
          </div>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
