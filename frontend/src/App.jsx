import { useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const MAX_CHARS = 4000;
const VALID_USER = "jimin";
const VALID_PASS = "jimin";

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (username === VALID_USER && password === VALID_PASS) {
      localStorage.setItem("authed", "1");
      onLogin();
    } else {
      setLoginError("Invalid username or password.");
    }
  }

  return (
    <main className="container">
      <div className="card">
        <header className="card-header">
          <h1>LinkedIn Rewriter</h1>
          <p>Sign in to continue.</p>
        </header>
        <form className="card-body" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="field-input"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
              autoComplete="current-password"
            />
          </div>
          {loginError && <div className="message error">{loginError}</div>}
          <button className="rewrite-btn" type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("authed") === "1");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  function handleSignOut() {
    localStorage.removeItem("authed");
    setAuthed(false);
  }

  function handleGeminiKeyChange(val) {
    setGeminiKey(val);
    if (val.trim()) {
      localStorage.setItem("gemini_api_key", val.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }

  const usingGemini = geminiKey.trim().length > 0;

  async function handleRewrite() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text first.");
      setResult("");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const body = { text: trimmed };
      if (usingGemini) body.gemini_api_key = geminiKey.trim();

      const response = await fetch(`${API_BASE_URL}/api/v1/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.detail || "Rewrite failed.");
      }

      setResult(payload.linkedin_text || "");
    } catch (err) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRewrite();
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const remaining = MAX_CHARS - text.length;
  const overLimit = remaining < 0;

  return (
    <main className="container">
      <div className="card">
        <header className="card-header">
          <div className="header-row">
            <div className="header-text">
              <h1>LinkedIn Rewriter</h1>
              <p>Paste something casual. Get something worth posting.</p>
            </div>
            <button
              className={`settings-btn ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
              title="Settings"
              aria-expanded={showSettings}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6.5 1.5a1.5 1.5 0 0 0-1.415 1H1.5a.5.5 0 0 0 0 1h3.585A1.5 1.5 0 1 0 6.5 1.5ZM1.5 7.5a.5.5 0 0 0 0 1h8.085a1.5 1.5 0 1 0 0-1H1.5Zm0 5a.5.5 0 0 0 0 1h3.585a1.5 1.5 0 1 0 0-1H1.5Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {showSettings && (
            <div className="settings-panel">
              <div className="field">
                <label className="field-label" htmlFor="gemini-key">
                  Gemini API Key
                  <span className="field-hint">When set, Gemini processes rewrites instead of Cursor Agent.</span>
                </label>
                <div className="settings-input-row">
                  <input
                    id="gemini-key"
                    className="field-input"
                    type="password"
                    placeholder="AIza…"
                    value={geminiKey}
                    onChange={(e) => handleGeminiKeyChange(e.target.value)}
                    autoComplete="off"
                  />
                  {geminiKey && (
                    <button
                      className="clear-btn"
                      onClick={() => handleGeminiKeyChange("")}
                      type="button"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="card-body">
          <div className={`textarea-wrapper ${overLimit ? "over-limit" : ""}`}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write casually… press Enter to rewrite, Shift+Enter for a new line."
              rows={6}
              disabled={loading}
            />
            <span className={`char-count ${remaining < 200 ? "warn" : ""} ${overLimit ? "over" : ""}`}>
              {overLimit ? `${Math.abs(remaining)} over limit` : `${remaining} remaining`}
            </span>
          </div>

          <div className="actions-row">
            <button
              className="rewrite-btn"
              onClick={handleRewrite}
              disabled={loading || overLimit || !text.trim()}
            >
              {loading ? (
                <span className="spinner-row">
                  <span className="spinner" />
                  Rewriting…
                </span>
              ) : (
                "Rewrite"
              )}
            </button>
            <span className={`provider-badge ${usingGemini ? "provider-gemini" : "provider-cursor"}`}>
              {usingGemini ? "Gemini" : "Cursor Agent"}
            </span>
          </div>

          {error && <div className="message error">{error}</div>}

          {result && (
            <div className="message result">
              <div className="result-body">
                <span className="result-label">Rewritten</span>
                <div className="result-text">{result}</div>
              </div>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        <footer className="card-footer">
          <span>Press <kbd>Enter</kbd> to rewrite &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line</span>
          <button className="signout-btn" onClick={handleSignOut} type="button">Sign out</button>
        </footer>
      </div>
    </main>
  );
}
