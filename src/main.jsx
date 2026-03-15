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
        background: "linear-gradient(135deg,#1e3a5f,#3d7ce0)",
        display: "flex", alignItems: "center",
        fontFamily: "'Noto Sans JP',sans-serif",
      }}>
        <div style={{ maxWidth: 1360, width: "100%", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center" }}>
          {[["calc", "💰 報酬計算"], ["docs", "📋 必要書類"]].map(([k, label]) => (
            <button key={k} onClick={() => setPage(k)}
              style={{
                padding: "12px 24px",
                fontSize: 13,
                fontWeight: page === k ? 700 : 500,
                color: page === k ? "#fff" : "rgba(255,255,255,0.6)",
                background: "none",
                border: "none",
                borderBottom: page === k ? "3px solid #fff" : "3px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {page === "calc" ? (
        <App />
      ) : (
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#f5f7fb,#e8ecf4)",
          fontFamily: "'Noto Sans JP',sans-serif",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 40px" }}>
            <DocumentChecklist />
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
