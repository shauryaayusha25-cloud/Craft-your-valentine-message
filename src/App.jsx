import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";

// ─── Config ───
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', 'Segoe UI', sans-serif";
const C = {
  bg: "#fff5f7", bgDeep: "#ffe0e6", rose: "#e8456b", roseLight: "#ff85a1",
  roseSoft: "#ffc2d1", gold: "#d4a053", cream: "#fff9f0", white: "#ffffff",
  text: "#3d1a24", textSoft: "#6b3a4a", accent: "#ff4571", green: "#48bb78",
};

// ─── Question Suggestions (escalating fun) ───
const QUESTION_SUGGESTIONS = [
  // Slot 1: Relationship milestones (sweet)
  [
    "Where did we go on our first date?",
    "What was the first movie we watched together?",
    "What song reminds you of us?",
  ],
  // Slot 2: Personality & quirks (playful)
  [
    "What's my go-to comfort food at 2am?",
    "What do I hoard but swear I'll use someday?",
    "What's my most-used emoji?",
  ],
  // Slot 3: Funny & absurd (hilarious)
  [
    "What's the weirdest thing I've ever said half-asleep?",
    "If I were a pizza topping, what would I be?",
    "What would I do if I found a penguin in the freezer?",
  ],
];

// ─── Demo Data for Preview ───
const makeDemoPhoto = (c1, c2, emoji) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="360" height="360" rx="24" fill="url(#g)"/><text x="180" y="210" font-size="90" text-anchor="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const DEMO_DATA = {
  name: "Sarah",
  creatorName: "Alex",
  questions: [
    { q: "Where was our first date?", correct: "That cozy cafe downtown ☕", wrong1: "The movie theater", wrong2: "Grocery shopping (romantic, right?)" },
    { q: "What's my comfort food at 2am?", correct: "Maggi noodles, obviously 🍜", wrong1: "Cold pizza from yesterday", wrong2: "Fancy avocado toast" },
    { q: "If I were a pizza topping, what would I be?", correct: "Extra cheese (cheesy like me)", wrong1: "Pineapple (controversial king)", wrong2: "Olives (an acquired taste)" },
  ],
  photos: [
    makeDemoPhoto("#ff9a9e", "#fad0c4", "💑"),
    makeDemoPhoto("#a18cd1", "#fbc2eb", "🌅"),
    makeDemoPhoto("#ffecd2", "#fcb69f", "✨"),
    makeDemoPhoto("#89f7fe", "#66a6ff", "🌸"),
  ],
  message: "Every moment with you feels like a fairytale. You make my ordinary days extraordinary. Here's to us and to many more adventures together! 💕",
};

// ─── URL Encoding with LZ-string compression ───
const encode = (obj) => {
  try {
    return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
  } catch {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
    catch { return ""; }
  }
};

const decode = (str) => {
  try {
    const d = LZString.decompressFromEncodedURIComponent(str);
    if (d) return JSON.parse(d);
  } catch {}
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch { return null; }
};

// ─── URL Shortener ───
const shortenUrl = async (url) => {
  try {
    const r = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const d = await r.json();
    if (d.shorturl) return d.shorturl;
  } catch {}
  try {
    const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const t = await r.text();
    if (t.startsWith("http")) return t;
  } catch {}
  return null;
};

// ─── Sticker rotations ───
const STICKER_ROTATIONS = [-3, 4.5, -2, 5, -4, 2.5];

// ─── Floating Hearts ───
function FloatingHearts() {
  const hearts = Array.from({ length: 16 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 10,
    dur: 7 + Math.random() * 9, size: 10 + Math.random() * 22,
    opacity: 0.1 + Math.random() * 0.2,
    emoji: ["♥", "❤", "💕", "💗", "✿", "♡"][i % 6],
  }));
  return (
    <div className="floating-wrap">
      {hearts.map(h => (
        <span key={h.id} className="floating-heart" style={{
          left: `${h.left}%`, animationDelay: `${h.delay}s`,
          animationDuration: `${h.dur}s`, fontSize: `${h.size}px`, opacity: h.opacity,
        }}>{h.emoji}</span>
      ))}
    </div>
  );
}

// ─── Confetti ───
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6,
    color: ["#ff6b8a", "#ff9ecd", "#ffd700", "#ff4571", "#ff85a1", "#ffc2d1", "#e8456b", "#fff"][i % 8],
    size: 4 + Math.random() * 8, dur: 1.5 + Math.random() * 2,
    drift: Math.random() * 200 - 100, rot: Math.random() * 720 - 360,
  }));
  return (
    <div className="confetti-wrap">
      {pieces.map(p => (
        <span key={p.id} className="confetti-piece" style={{
          left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          width: `${p.size}px`, height: `${p.size * 1.4}px`, background: p.color,
          borderRadius: p.size > 6 ? "50%" : "1px",
          "--drift": `${p.drift}px`, "--rot": `${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}

// ─── Shared Components ───
function ProgressDots({ current, total = 3 }) {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px", zIndex: 2, position: "relative" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? "32px" : "10px", height: "10px", borderRadius: "5px",
          background: i <= current ? C.rose : C.roseSoft + "66",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      ))}
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div className="card fade-in" style={style}>{children}</div>;
}

function Btn({ children, variant = "primary", disabled, style = {}, ...props }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled}
      style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto", ...style }}
      {...props}>{children}</button>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── STEP 1: LANDING PAGE ───
// ════════════════════════════════════════════════════════════════
function LandingPage({ onPreview, onPay }) {
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const namesFilled = name.trim() && creatorName.trim();

  return (
    <div className="page-wrap">
      <FloatingHearts />

      <div className="landing-content fade-in">
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "56px", display: "block", marginBottom: "12px" }} className="pulse-anim">💝</span>
          <h1 style={{
            fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 6vw, 38px)", fontWeight: 800,
            color: C.text, lineHeight: 1.2, margin: "0 0 12px",
          }}>
            Does Your Valentine<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.rose}, ${C.accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Really Know You?</span> 😏
          </h1>
          <p style={{
            fontFamily: FONT_BODY, fontSize: "15px", color: C.textSoft,
            lineHeight: 1.7, maxWidth: "380px", margin: "0 auto",
          }}>
            Get your Valentine Onboard by personalizing your valentine message and make memories an experience
          </p>
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex", gap: "10px", justifyContent: "center",
          flexWrap: "wrap", marginBottom: "28px",
        }}>
          {[
            { icon: "🧠", label: "Fun Quiz" },
            { icon: "📸", label: "Photo Stickers" },
            { icon: "💌", label: "Love Letter" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
              borderRadius: "40px", padding: "8px 18px",
              border: `1px solid ${C.roseSoft}55`,
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: 600, color: C.text,
              fontFamily: FONT_BODY,
              boxShadow: "0 2px 12px rgba(232,69,107,0.06)",
            }}>
              <span style={{ fontSize: "16px" }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Name Collection Card */}
        <Card>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={{
              fontFamily: FONT_BODY, fontSize: "14px", fontWeight: 600,
              color: C.rose, margin: 0,
            }}>
              First, tell us who this is for ✨
            </p>
          </div>
          <Input label="Your Name" value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g., Ayush" />
          <Input label="Your Valentine's Name" value={name} onChange={e => setName(e.target.value)} placeholder="Their name" />

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <Btn variant="secondary" onClick={onPreview}
              style={{ flex: 1, fontSize: "14px", padding: "14px 12px" }}>
              ✨ See Demo
            </Btn>
            <Btn disabled={!namesFilled}
              onClick={() => onPay(name.trim(), creatorName.trim())}
              style={{ flex: 1.5, fontSize: "14px", padding: "14px 12px" }}>
              💝 Try for ₹99
            </Btn>
          </div>

          {namesFilled && (
            <p className="fade-in" style={{
              textAlign: "center", fontSize: "12px", color: C.green,
              fontFamily: FONT_BODY, marginTop: "12px", fontWeight: 500,
            }}>
              Making this for <strong>{name}</strong> — they'll love it! 💕
            </p>
          )}
        </Card>

        {/* Footer */}
        <p style={{
          textAlign: "center", fontSize: "12px", color: C.textSoft + "88",
          fontFamily: FONT_BODY, marginTop: "24px",
        }}>
          Make them smile this Valentine's Day 💌
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── STEP 2: MOCK PAYMENT PAGE ───
// ════════════════════════════════════════════════════════════════
function PaymentPage({ name, creatorName, onSuccess }) {
  const [status, setStatus] = useState("idle"); // idle | processing | success

  const handlePay = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => onSuccess(), 1500);
    }, 2200);
  };

  return (
    <div className="page-wrap">
      <FloatingHearts />
      <Card>
        {status === "idle" && (
          <div className="fade-in">
            <div className="card-header">
              <span className="card-icon">💝</span>
              <h1 className="card-title">Unlock Your Valentine</h1>
              <p className="card-sub">
                Create a personalized valentine for <strong style={{ color: C.rose }}>{name}</strong>
              </p>
            </div>

            {/* What you get */}
            <div style={{
              background: C.cream, borderRadius: "16px", padding: "18px 20px",
              marginBottom: "20px", border: `1px solid ${C.roseSoft}33`,
            }}>
              <p style={{
                fontSize: "12px", fontWeight: 700, color: C.textSoft,
                fontFamily: FONT_BODY, margin: "0 0 12px", letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}>What you get</p>
              {[
                { icon: "🧠", text: "3 Fun Quiz Questions with suggestions" },
                { icon: "📸", text: "Photo Stickers Carousel" },
                { icon: "💌", text: "Personal Love Letter (250 words)" },
                { icon: "🔗", text: "Shareable Short Link" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: i < 3 ? "10px" : 0,
                }}>
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span style={{
                    fontSize: "13.5px", color: C.text, fontFamily: FONT_BODY, fontWeight: 500,
                  }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: "36px", fontWeight: 800, color: C.rose,
              }}>₹99</span>
              <span style={{
                fontSize: "13px", color: C.textSoft, fontFamily: FONT_BODY,
                marginLeft: "8px", textDecoration: "line-through",
              }}>₹299</span>
              <p style={{
                fontSize: "11px", color: C.green, fontWeight: 600,
                fontFamily: FONT_BODY, marginTop: "4px",
              }}>Valentine's Special — 67% off! 🎉</p>
            </div>

            <Btn onClick={handlePay} style={{ width: "100%", padding: "16px", fontSize: "16px" }}>
              Pay ₹99 →
            </Btn>

            <p style={{
              textAlign: "center", fontSize: "11px", color: C.textSoft + "99",
              fontFamily: FONT_BODY, marginTop: "14px", fontStyle: "italic",
            }}>
              Payment is simulated for demo purposes
            </p>
          </div>
        )}

        {status === "processing" && (
          <div className="fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="payment-spinner" />
            <p style={{
              fontFamily: FONT_BODY, fontSize: "16px", color: C.text,
              marginTop: "20px", fontWeight: 600,
            }}>Processing payment...</p>
            <p style={{
              fontFamily: FONT_BODY, fontSize: "13px", color: C.textSoft,
              marginTop: "8px",
            }}>Please wait, don't close this page</p>
          </div>
        )}

        {status === "success" && (
          <div className="fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.green}, #38a169)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "28px", color: "#fff",
              boxShadow: "0 4px 20px rgba(72,187,120,0.3)",
            }}>✓</div>
            <p style={{
              fontFamily: FONT_DISPLAY, fontSize: "22px", fontWeight: 700,
              color: C.text, margin: "0 0 8px",
            }}>Payment Successful!</p>
            <p style={{
              fontFamily: FONT_BODY, fontSize: "14px", color: C.textSoft,
            }}>
              Let's create something special for {name} 💕
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── PREVIEW WRAPPER (Demo Mode) ───
// ════════════════════════════════════════════════════════════════
function PreviewMode({ onExit }) {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowBanner(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Exit button */}
      <button onClick={onExit} style={{
        position: "fixed", top: 16, right: 16, zIndex: 1000,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
        border: `1.5px solid ${C.roseSoft}`, borderRadius: "12px",
        padding: "8px 16px", fontFamily: FONT_BODY, fontSize: "13px",
        fontWeight: 600, color: C.rose, cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}>
        ✕ Exit Demo
      </button>

      {/* Demo banner */}
      {showBanner && (
        <div className="fade-in" style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 999, background: C.rose, color: "#fff",
          borderRadius: "20px", padding: "6px 18px",
          fontFamily: FONT_BODY, fontSize: "12px", fontWeight: 600,
          boxShadow: "0 4px 16px rgba(232,69,107,0.3)",
        }}>
          👀 Demo Mode — This is how your valentine will see it
        </div>
      )}

      <RecipientPage data={DEMO_DATA} isDemo onDemoExit={onExit} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── STEP 3: CREATOR PAGE (Enhanced) ───
// ════════════════════════════════════════════════════════════════
function CreatorPage({ name, creatorName, onGenerate }) {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([
    { q: "", correct: "", wrong1: "", wrong2: "" },
    { q: "", correct: "", wrong1: "", wrong2: "" },
    { q: "", correct: "", wrong1: "", wrong2: "" },
  ]);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("");
  const fileRef = useRef();

  const updateQ = (i, field, val) => {
    const nq = [...questions];
    nq[i] = { ...nq[i], [field]: val };
    setQuestions(nq);
  };

  const applySuggestion = (qIndex, suggestion) => {
    updateQ(qIndex, "q", suggestion);
  };

  const addPhotos = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (photos.length >= 6) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 360;
          let w = img.width, h = img.height;
          if (w > h) { h = (h / w) * MAX; w = MAX; }
          else { w = (w / h) * MAX; h = MAX; }
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.45);
          setPhotos(prev => prev.length < 6 ? [...prev, compressed] : prev);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const canNext = () => {
    if (step === 0) return questions.every(q => q.q.trim() && q.correct.trim() && q.wrong1.trim() && q.wrong2.trim());
    if (step === 1) return photos.length >= 1;
    return true;
  };

  const generate = () => {
    onGenerate({ name, creatorName, questions, photos, message });
  };

  return (
    <div className="page-wrap">
      <FloatingHearts />
      <ProgressDots current={step} total={3} />

      {/* Step 0: Quiz Questions with Suggestions */}
      {step === 0 && (
        <Card key="s0">
          <div className="card-header">
            <span className="card-icon">🧠</span>
            <h1 className="card-title">3 Quiz Questions</h1>
            <p className="card-sub">
              Test if <strong style={{ color: C.rose }}>{name}</strong> really remembers!
              Pick a suggestion or write your own.
            </p>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="question-block">
              <div className="question-num">
                Question {i + 1}
                <span style={{ float: "right", fontSize: "10px", fontWeight: 500, color: C.textSoft, textTransform: "none", letterSpacing: 0 }}>
                  {i === 0 ? "💕 Sweet" : i === 1 ? "🤪 Quirky" : "😂 Funny"}
                </span>
              </div>

              {/* Suggestion chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {QUESTION_SUGGESTIONS[i].map((s, si) => (
                  <button key={si} onClick={() => applySuggestion(i, s)} style={{
                    background: q.q === s ? C.rose : "rgba(255,255,255,0.8)",
                    color: q.q === s ? "#fff" : C.textSoft,
                    border: `1px solid ${q.q === s ? C.rose : C.roseSoft}`,
                    borderRadius: "20px", padding: "6px 12px",
                    fontSize: "11.5px", fontFamily: FONT_BODY, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.2s",
                    lineHeight: 1.3,
                  }}>
                    {s}
                  </button>
                ))}
              </div>

              <input className="input-field" style={{ marginBottom: "8px" }} value={q.q}
                onChange={e => updateQ(i, "q", e.target.value)}
                placeholder="Or type your own question..." />
              <input className="input-field input-correct" style={{ marginBottom: "6px" }} value={q.correct}
                onChange={e => updateQ(i, "correct", e.target.value)} placeholder="✓ Correct answer" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <input className="input-field input-wrong" value={q.wrong1}
                  onChange={e => updateQ(i, "wrong1", e.target.value)} placeholder="✗ Wrong 1" />
                <input className="input-field input-wrong" value={q.wrong2}
                  onChange={e => updateQ(i, "wrong2", e.target.value)} placeholder="✗ Wrong 2" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Step 1: Photo Stickers */}
      {step === 1 && (
        <Card key="s1">
          <div className="card-header">
            <span className="card-icon">📸</span>
            <h1 className="card-title">Create Your Stickers</h1>
            <p className="card-sub">Add 1–6 photos. They'll look like cute stickers in a carousel!</p>
          </div>

          {/* Sticker Carousel */}
          <div className="sticker-carousel">
            {photos.map((p, i) => (
              <div key={i} className="sticker fade-in" style={{
                transform: `rotate(${STICKER_ROTATIONS[i % 6]}deg)`,
                animationDelay: `${i * 0.08}s`,
              }}>
                <img src={p} alt="" />
                <button className="sticker-remove"
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
            {photos.length < 6 && (
              <div className="sticker sticker-add" onClick={() => fileRef.current?.click()}>
                <span style={{ fontSize: "28px", color: C.rose }}>+</span>
                <span style={{ fontSize: "11px", color: C.textSoft, fontWeight: 500 }}>Add Photo</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />

          {photos.length > 0 && (
            <p className="fade-in" style={{
              textAlign: "center", fontSize: "12px", color: C.textSoft,
              fontFamily: FONT_BODY, marginTop: "12px",
            }}>
              {photos.length}/6 stickers added — swipe to see them all →
            </p>
          )}
        </Card>
      )}

      {/* Step 2: Envelope Message */}
      {step === 2 && (
        <Card key="s2">
          <div className="card-header">
            <span className="card-icon">💌</span>
            <h1 className="card-title">Write Your Letter</h1>
            <p className="card-sub">
              This will be revealed in a special envelope after the big moment ✨
            </p>
          </div>

          {/* Envelope compose area */}
          <div className="envelope-compose">
            <div className="envelope-flap-deco">
              <div className="envelope-v" />
            </div>
            <div className="letter-paper">
              <div className="letter-lines" />
              <textarea
                className="letter-textarea"
                value={message}
                onChange={e => {
                  const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : [];
                  if (words.length <= 250 || e.target.value.length < message.length) {
                    setMessage(e.target.value);
                  }
                }}
                placeholder={`Dear ${name},\n\nWrite something from the heart...\n\nWith love,\n${creatorName}`}
              />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: "8px", padding: "0 4px",
            }}>
              <span style={{
                fontSize: "11px", color: C.textSoft + "88", fontFamily: FONT_BODY,
              }}>
                Tip: Be genuine — they'll love it! 💕
              </span>
              <span style={{
                fontSize: "12px", fontWeight: 600, fontFamily: FONT_BODY,
                color: wordCount > 250 ? "#e53e3e" : wordCount > 200 ? C.gold : C.textSoft,
              }}>
                {wordCount}/250 words
              </span>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <Btn onClick={generate} disabled={wordCount > 250}
              style={{ width: "100%", padding: "16px", fontSize: "17px" }}>
              ✨ Generate Valentine Link
            </Btn>
          </div>
        </Card>
      )}

      {/* Nav Buttons */}
      {step < 2 && (
        <div className="nav-row">
          {step > 0 ? <Btn variant="secondary" onClick={() => setStep(step - 1)}>← Back</Btn> : <div />}
          <Btn disabled={!canNext()} onClick={() => setStep(step + 1)}>Next →</Btn>
        </div>
      )}
      {step === 2 && (
        <div className="nav-row">
          <Btn variant="secondary" onClick={() => setStep(step - 1)}>← Back</Btn>
          <div />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── STEP 6: SHARE PAGE (Enhanced with URL shortening) ───
// ════════════════════════════════════════════════════════════════
function SharePage({ link, data }) {
  const [copied, setCopied] = useState(false);
  const [shortLink, setShortLink] = useState(null);
  const [shortening, setShortening] = useState(false);
  const [shortenError, setShortenError] = useState(false);
  const displayLink = shortLink || link;

  const copy = () => {
    navigator.clipboard.writeText(displayLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShorten = async () => {
    setShortening(true);
    setShortenError(false);
    const result = await shortenUrl(link);
    if (result) {
      setShortLink(result);
    } else {
      setShortenError(true);
    }
    setShortening(false);
  };

  return (
    <div className="page-wrap">
      <FloatingHearts />
      <Card>
        <div className="card-header">
          <span className="card-icon pulse-anim">💌</span>
          <h1 className="card-title">Your Valentine is Ready!</h1>
          <p className="card-sub">
            Share this link with <strong style={{ color: C.rose }}>{data.name}</strong> and watch them smile 💕
          </p>
        </div>

        <div className="link-box">
          {displayLink}
        </div>

        {/* Shorten button */}
        {!shortLink && (
          <Btn variant="secondary"
            onClick={handleShorten}
            disabled={shortening}
            style={{ width: "100%", marginBottom: "10px", fontSize: "13px", padding: "10px" }}>
            {shortening ? "Shortening..." : shortenError ? "Shortening unavailable — copy the link above" : "🔗 Shorten Link"}
          </Btn>
        )}
        {shortLink && (
          <p className="fade-in" style={{
            textAlign: "center", fontSize: "12px", color: C.green,
            fontFamily: FONT_BODY, marginBottom: "10px", fontWeight: 600,
          }}>
            ✓ Link shortened!
          </p>
        )}

        <Btn style={{ width: "100%" }} onClick={copy}>
          {copied ? "✓ Copied!" : "📋 Copy Link"}
        </Btn>
        <Btn variant="secondary" style={{ width: "100%", marginTop: "10px" }}
          onClick={() => window.open(link, "_blank")}>
          👁 Preview It
        </Btn>

        {/* WhatsApp / Share API */}
        <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          <Btn variant="secondary" style={{ flex: 1, fontSize: "13px", padding: "10px" }}
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("I made something for you 💝 " + displayLink)}`, "_blank")}>
            WhatsApp 💬
          </Btn>
          {navigator.share && (
            <Btn variant="secondary" style={{ flex: 1, fontSize: "13px", padding: "10px" }}
              onClick={() => navigator.share({ title: "Valentine for you 💝", text: "Someone made a Valentine for you!", url: displayLink }).catch(() => {})}>
              Share 📤
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── RECIPIENT PAGE (Enhanced with envelope reveal) ───
// ════════════════════════════════════════════════════════════════
function RecipientPage({ data, isDemo = false, onDemoExit }) {
  const [phase, setPhase] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noMoves, setNoMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [key, setKey] = useState(0);

  const shuffleOpts = (q) => {
    const opts = [
      { text: q.correct, isCorrect: true },
      { text: q.wrong1, isCorrect: false },
      { text: q.wrong2, isCorrect: false },
    ];
    const seed = q.q.length + q.correct.length;
    return opts.sort((a, b) => ((a.text.charCodeAt(0) * 31 + seed) % 97) - ((b.text.charCodeAt(0) * 31 + seed) % 97));
  };

  const handleAnswer = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
    if (opt.isCorrect) setScore(s => s + 1);
    setTimeout(() => {
      setShowResult(false);
      setSelected(null);
      if (qIndex < 2) {
        setQIndex(qIndex + 1);
        setKey(k => k + 1);
      } else {
        setPhase("slideshow");
      }
    }, 1300);
  };

  // Slideshow auto-advance
  useEffect(() => {
    if (phase !== "slideshow") return;
    if (slideIndex >= data.photos.length) {
      const t = setTimeout(() => setPhase("proposal"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSlideIndex(i => i + 1), 2800);
    return () => clearTimeout(t);
  }, [phase, slideIndex, data.photos.length]);

  const moveNo = () => {
    setNoMoves(m => m + 1);
    setNoPos({ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 180 });
  };

  const handleYes = () => {
    setShowConfetti(true);
    setTimeout(() => setPhase("celebration"), 200);
  };

  const noTexts = ["No", "Are you sure?", "Really?? 🥺", "Think again!", "Pls? 💔", "Don't do this 😢", "I'll cry...", "NOOO 😭", "Last chance!", "Pretty please? 🥹"];

  return (
    <div className="page-wrap" style={{ overflow: "hidden" }}>
      <FloatingHearts />
      {showConfetti && <Confetti />}

      {/* INTRO */}
      {phase === "intro" && (
        <Card>
          <div className="card-header">
            <span className="card-icon pulse-anim" style={{ fontSize: "52px" }}>💌</span>
            <h1 className="card-title" style={{ fontSize: "28px" }}>
              Hey {data.name}!
            </h1>
            <p className="card-sub" style={{ fontSize: "15px", lineHeight: 1.7, marginTop: "16px" }}>
              <strong style={{ color: C.rose }}>{data.creatorName}</strong> made something special for you ✨
              <br /><br />
              Answer 3 little questions to unlock a surprise...
            </p>
          </div>
          <Btn onClick={() => setPhase("quiz")} style={{ width: "100%", padding: "16px", fontSize: "17px" }}>
            Let's Go! 💕
          </Btn>
        </Card>
      )}

      {/* QUIZ */}
      {phase === "quiz" && (
        <Card key={`quiz-${key}`}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span className="input-label" style={{ margin: 0 }}>Question {qIndex + 1} / 3</span>
            <span className="input-label" style={{ margin: 0, color: C.rose }}>Score: {score} ♥</span>
          </div>
          <div style={{ height: "4px", borderRadius: "2px", background: C.roseSoft + "44", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "2px",
              background: `linear-gradient(90deg, ${C.rose}, ${C.accent})`,
              width: `${((qIndex + 1) / 3) * 100}%`, transition: "width 0.5s ease",
            }} />
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "20px", color: C.text, margin: "0 0 20px", lineHeight: 1.4 }}>
            {data.questions[qIndex].q}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {shuffleOpts(data.questions[qIndex]).map((opt, i) => {
              let cls = "quiz-option";
              if (showResult && selected === opt) cls += opt.isCorrect ? " correct" : " wrong";
              if (showResult && opt.isCorrect && selected !== opt) cls += " reveal-correct";
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(opt)}>
                  <span>{opt.text}</span>
                  {showResult && selected === opt && (
                    <span style={{ marginLeft: "auto", fontSize: "18px" }}>{opt.isCorrect ? "✓" : "✗"}</span>
                  )}
                </button>
              );
            })}
          </div>
          {showResult && (
            <div className="fade-in" style={{
              textAlign: "center", marginTop: "16px", fontFamily: FONT_BODY,
              fontSize: "17px", fontWeight: 600,
              color: selected?.isCorrect ? C.green : C.rose,
            }}>
              {selected?.isCorrect ? "Yay! You remembered! 🎉" : "Oops! Not quite 😅"}
            </div>
          )}
        </Card>
      )}

      {/* SLIDESHOW with sticker effect */}
      {phase === "slideshow" && (
        <Card>
          <div className="card-header">
            <span className="input-label" style={{ letterSpacing: "1.5px" }}>You scored {score}/3 ♥</span>
            <h2 className="card-title" style={{ fontSize: "22px", marginTop: "8px" }}>
              {score === 3 ? "Perfect! Here's your surprise..." : score >= 1 ? "Not bad! Something special..." : "Well... enjoy this anyway! 😄"}
            </h2>
          </div>
          {slideIndex < data.photos.length ? (
            <div className="fade-in" key={slideIndex} style={{ display: "flex", justifyContent: "center" }}>
              <div className="sticker-display" style={{
                transform: `rotate(${STICKER_ROTATIONS[slideIndex % 6]}deg)`,
              }}>
                <img src={data.photos[slideIndex]} alt="" style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "4px",
                }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "52px", textAlign: "center", padding: "24px 0" }} className="pulse-anim">💝</div>
          )}
          {slideIndex < data.photos.length && (
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
              {data.photos.map((_, i) => (
                <span key={i} style={{
                  width: "8px", height: "8px", borderRadius: "50%", display: "block",
                  background: i === slideIndex ? C.rose : C.roseSoft + "66",
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* PROPOSAL */}
      {phase === "proposal" && (
        <Card style={{ overflow: "visible" }}>
          <div className="card-header">
            <span className="card-icon pulse-anim" style={{ fontSize: "56px" }}>💝</span>
            <h1 className="card-title" style={{ fontSize: "28px", lineHeight: 1.3 }}>
              Will you be<br />{data.creatorName}'s Valentine?
            </h1>
          </div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", position: "relative", minHeight: "60px" }}>
            <Btn onClick={handleYes} style={{ fontSize: "18px", padding: "16px 44px", zIndex: 2 }}>
              Yes! 💕
            </Btn>
            <Btn variant="secondary"
              onMouseEnter={moveNo} onTouchStart={moveNo}
              style={{
                transform: `translate(${noPos.x}px, ${noPos.y}px)`,
                transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                fontSize: "14px", padding: "12px 22px", zIndex: 1,
              }}>
              {noTexts[Math.min(noMoves, noTexts.length - 1)]}
            </Btn>
          </div>
        </Card>
      )}

      {/* CELEBRATION + ENVELOPE REVEAL */}
      {phase === "celebration" && (
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <Card>
            <div className="card-header">
              <div style={{ fontSize: "60px", marginBottom: "8px" }}>🥳💕</div>
              <h1 style={{
                fontFamily: FONT_DISPLAY, fontSize: "32px", fontWeight: 800,
                background: `linear-gradient(135deg, ${C.rose}, ${C.gold})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "0 0 8px",
              }}>Yaaay!</h1>
              <p className="card-sub" style={{ fontSize: "16px" }}>
                {data.creatorName} is the luckiest person in the world! 💖
              </p>
            </div>

            {/* Photo gallery as stickers */}
            {data.photos.length > 0 && (
              <div style={{
                display: "flex", gap: "8px", justifyContent: "center",
                flexWrap: "wrap", marginBottom: "16px",
              }}>
                {data.photos.map((p, i) => (
                  <div key={i} className="sticker-mini fade-in" style={{
                    animationDelay: `${i * 0.12}s`,
                    transform: `rotate(${STICKER_ROTATIONS[i % 6]}deg)`,
                  }}>
                    <img src={p} alt="" style={{
                      width: "100%", height: "100%", objectFit: "cover", borderRadius: "2px",
                    }} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Envelope Reveal */}
          {data.message && (
            <div className="fade-in" style={{ marginTop: "20px", animationDelay: "0.6s" }}>
              {!envelopeOpen ? (
                <div className="envelope-reveal" onClick={() => setEnvelopeOpen(true)}>
                  <div className="envelope-body-reveal">
                    <div className="envelope-flap-reveal" />
                    <div className="envelope-seal">💌</div>
                  </div>
                  <p style={{
                    textAlign: "center", fontSize: "13px", color: C.textSoft,
                    fontFamily: FONT_BODY, marginTop: "12px", fontWeight: 500,
                  }}>
                    Tap the envelope to read a special letter ✨
                  </p>
                </div>
              ) : (
                <Card style={{ background: "rgba(255,253,245,0.95)" }}>
                  <div className="letter-reveal fade-in">
                    <div style={{
                      textAlign: "center", marginBottom: "16px",
                      fontSize: "24px",
                    }}>💌</div>
                    <p style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "15px", color: C.text, lineHeight: 1.8,
                      whiteSpace: "pre-wrap", textAlign: "center",
                      fontStyle: "italic",
                    }}>
                      "{data.message}"
                    </p>
                    <p style={{
                      textAlign: "right", fontFamily: FONT_BODY,
                      fontSize: "13px", color: C.rose, fontWeight: 600,
                      marginTop: "16px",
                    }}>
                      — with love, {data.creatorName} 💕
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Happy Valentine footer */}
          <div className="fade-in" style={{ marginTop: "16px", animationDelay: "0.8s" }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.cream}, ${C.bgDeep}66)`,
              borderRadius: "16px", padding: "20px",
              border: `1px solid ${C.roseSoft}44`,
            }}>
              <p style={{
                fontFamily: FONT_BODY, fontSize: "15px", color: C.textSoft,
                margin: 0, textAlign: "center",
              }}>
                Happy Valentine's Day, <strong style={{ color: C.rose }}>{data.name}</strong>! 💝
              </p>
            </div>
          </div>

          {/* Demo CTA */}
          {isDemo && (
            <div className="fade-in" style={{ marginTop: "20px", animationDelay: "1.2s" }}>
              <Card style={{
                background: `linear-gradient(135deg, ${C.rose}, ${C.accent})`,
                border: "none",
              }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{
                    fontFamily: FONT_DISPLAY, fontSize: "20px", fontWeight: 700,
                    color: "#fff", margin: "0 0 8px",
                  }}>Love it? Create yours!</h3>
                  <p style={{
                    fontFamily: FONT_BODY, fontSize: "13px", color: "rgba(255,255,255,0.85)",
                    margin: "0 0 16px",
                  }}>Make your valentine feel special for just ₹99</p>
                  <button onClick={onDemoExit} style={{
                    background: "#fff", color: C.rose, border: "none",
                    borderRadius: "14px", padding: "14px 32px",
                    fontFamily: FONT_BODY, fontWeight: 700, fontSize: "15px",
                    cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}>
                    Create Mine 💝
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ─── MAIN APP ───
// ════════════════════════════════════════════════════════════════
export default function ValentineApp() {
  const [mode, setMode] = useState("loading");
  const [data, setData] = useState(null);
  const [link, setLink] = useState("");
  const [valentineName, setValentineName] = useState("");
  const [creatorName, setCreatorName] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#v=")) {
      const decoded = decode(hash.slice(3));
      if (decoded) { setData(decoded); setMode("view"); return; }
    }
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      const decoded = decode(v);
      if (decoded) { setData(decoded); setMode("view"); return; }
    }
    setMode("landing");
  }, []);

  const handleGenerate = (valData) => {
    const encoded = encode(valData);
    const base = window.location.origin + window.location.pathname;
    const shareLink = `${base}#v=${encoded}`;
    setData(valData);
    setLink(shareLink);
    setMode("share");
  };

  return (
    <div className="app-root">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {mode === "loading" && (
        <div className="page-wrap">
          <span className="card-icon pulse-anim" style={{ fontSize: "52px" }}>💝</span>
        </div>
      )}

      {mode === "landing" && (
        <LandingPage
          onPreview={() => setMode("preview")}
          onPay={(name, creator) => {
            setValentineName(name);
            setCreatorName(creator);
            setMode("payment");
          }}
        />
      )}

      {mode === "preview" && (
        <PreviewMode onExit={() => setMode("landing")} />
      )}

      {mode === "payment" && (
        <PaymentPage
          name={valentineName}
          creatorName={creatorName}
          onSuccess={() => setMode("create")}
        />
      )}

      {mode === "create" && (
        <CreatorPage
          name={valentineName}
          creatorName={creatorName}
          onGenerate={handleGenerate}
        />
      )}

      {mode === "share" && <SharePage link={link} data={data} />}
      {mode === "view" && data && <RecipientPage data={data} />}

      <style>{`
        /* ─── Base ─── */
        .app-root {
          min-height: 100vh; min-height: 100dvh;
          background: linear-gradient(160deg, ${C.bg} 0%, ${C.bgDeep} 40%, ${C.roseSoft}33 100%);
          font-family: ${FONT_BODY};
        }

        /* ─── Layout ─── */
        .page-wrap {
          min-height: 100vh; min-height: 100dvh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px 16px; position: relative;
        }

        /* ─── Card ─── */
        .card {
          background: rgba(255,255,255,0.88); backdrop-filter: blur(18px);
          border-radius: 24px; border: 1px solid rgba(232,69,107,0.1);
          box-shadow: 0 8px 40px rgba(232,69,107,0.06), 0 1px 3px rgba(0,0,0,0.03);
          padding: 32px 28px; max-width: 480px; width: 100%;
          position: relative; z-index: 2;
        }
        .card-header { text-align: center; margin-bottom: 24px; }
        .card-icon { display: block; font-size: 40px; margin-bottom: 10px; }
        .card-title { font-family: ${FONT_DISPLAY}; font-size: 24px; color: ${C.text}; margin: 0; font-weight: 700; }
        .card-sub { font-family: ${FONT_BODY}; color: ${C.textSoft}; font-size: 13.5px; margin-top: 8px; line-height: 1.5; }

        /* ─── Inputs ─── */
        .input-label {
          display: block; font-size: 12px; font-weight: 600; color: ${C.textSoft};
          font-family: ${FONT_BODY}; margin-bottom: 6px; letter-spacing: 0.6px; text-transform: uppercase;
        }
        .input-field {
          width: 100%; padding: 13px 16px; border-radius: 12px;
          border: 1.5px solid ${C.roseSoft}; font-size: 15px; font-family: ${FONT_BODY};
          background: rgba(255,255,255,0.8); outline: none; transition: all 0.3s;
          color: ${C.text}; box-sizing: border-box;
        }
        .input-correct { border-color: #b8e6b0; }
        .input-wrong { border-color: #ffcaca; }

        /* ─── Buttons ─── */
        .btn {
          border: none; border-radius: 14px; font-family: ${FONT_BODY};
          font-weight: 600; cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.3px;
        }
        .btn-primary {
          background: linear-gradient(135deg, ${C.rose}, ${C.accent});
          color: #fff; padding: 14px 34px; font-size: 15px;
          box-shadow: 0 4px 20px rgba(232,69,107,0.25);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.75); color: ${C.rose};
          border: 2px solid ${C.roseSoft}; padding: 12px 26px; font-size: 14px;
        }

        /* ─── Navigation ─── */
        .nav-row {
          display: flex; justify-content: space-between; max-width: 480px;
          width: 100%; margin-top: 16px; position: relative; z-index: 2;
        }

        /* ─── Question Block ─── */
        .question-block {
          margin-bottom: 18px; padding: 16px 14px; border-radius: 16px;
          background: linear-gradient(135deg, ${C.cream}, ${C.bgDeep}22);
          border: 1px solid ${C.roseSoft}33;
        }
        .question-num {
          font-size: 11px; font-weight: 700; color: ${C.rose};
          font-family: ${FONT_BODY}; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;
        }

        /* ─── Sticker Carousel (Creator) ─── */
        .sticker-carousel {
          display: flex; gap: 16px; overflow-x: auto; padding: 16px 8px 24px;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .sticker-carousel::-webkit-scrollbar { display: none; }
        .sticker {
          flex-shrink: 0; width: 130px; height: 130px;
          background: #fff; padding: 8px; border-radius: 6px;
          box-shadow: 2px 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06);
          position: relative; scroll-snap-align: center;
          transition: transform 0.3s ease;
        }
        .sticker img {
          width: 100%; height: 100%; object-fit: cover; border-radius: 3px; display: block;
        }
        .sticker-add {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border: 2.5px dashed ${C.roseSoft}; background: rgba(255,255,255,0.5);
          cursor: pointer; gap: 4px;
        }
        .sticker-add:hover { background: rgba(255,255,255,0.9); border-color: ${C.rose}; }
        .sticker-remove {
          position: absolute; top: -6px; right: -6px; width: 24px; height: 24px;
          border-radius: 50%; background: ${C.rose}; color: #fff;
          border: 2px solid #fff; font-size: 11px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; padding: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* ─── Sticker Display (Recipient slideshow) ─── */
        .sticker-display {
          width: 240px; height: 240px; background: #fff;
          padding: 10px; border-radius: 6px;
          box-shadow: 3px 6px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06);
          transition: transform 0.5s ease;
        }

        /* ─── Sticker Mini (Celebration gallery) ─── */
        .sticker-mini {
          width: 60px; height: 60px; background: #fff;
          padding: 4px; border-radius: 4px;
          box-shadow: 1px 3px 10px rgba(0,0,0,0.1);
        }

        /* ─── Envelope Compose (Creator) ─── */
        .envelope-compose {
          position: relative; max-width: 100%;
        }
        .envelope-flap-deco {
          height: 40px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, ${C.bgDeep}, ${C.roseSoft}66);
          border-radius: 16px 16px 0 0;
          border: 1.5px solid ${C.roseSoft}88;
          border-bottom: none;
        }
        .envelope-v {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 200px solid transparent;
          border-right: 200px solid transparent;
          border-top: 40px solid ${C.roseSoft}44;
        }
        .letter-paper {
          position: relative;
          background: linear-gradient(180deg, #fffdf5 0%, #fff9f0 100%);
          border: 1.5px solid ${C.roseSoft}88;
          border-top: none;
          border-radius: 0 0 16px 16px;
          padding: 20px;
          min-height: 200px;
        }
        .letter-lines {
          position: absolute; inset: 20px;
          background: repeating-linear-gradient(
            transparent, transparent 29px, ${C.roseSoft}22 29px, ${C.roseSoft}22 30px
          );
          pointer-events: none;
        }
        .letter-textarea {
          width: 100%; min-height: 180px; border: none; background: transparent;
          font-family: ${FONT_DISPLAY}; font-size: 15px; color: ${C.text};
          line-height: 30px; resize: vertical; outline: none;
          position: relative; z-index: 1;
        }

        /* ─── Envelope Reveal (Recipient) ─── */
        .envelope-reveal {
          cursor: pointer; display: flex; flex-direction: column;
          align-items: center; padding: 20px;
        }
        .envelope-body-reveal {
          width: 200px; height: 140px; position: relative;
          background: linear-gradient(135deg, #fce4d6, #f5d5c4);
          border-radius: 8px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .envelope-body-reveal:hover {
          transform: scale(1.05);
        }
        .envelope-flap-reveal {
          position: absolute; top: 0; left: 0; width: 100%; height: 70px;
          background: linear-gradient(135deg, #f0d0b8, #e8c4ac);
          clip-path: polygon(0 0, 50% 100%, 100% 0);
          border-radius: 8px 8px 0 0;
        }
        .envelope-seal {
          position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
          font-size: 28px; z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        /* ─── Letter Reveal ─── */
        .letter-reveal {
          background: linear-gradient(180deg, #fffdf5 0%, #fff9f0 100%);
          border-radius: 12px; padding: 24px; position: relative;
          border: 1px solid ${C.roseSoft}33;
        }
        .letter-reveal::before {
          content: '';
          position: absolute; inset: 24px; top: 48px;
          background: repeating-linear-gradient(
            transparent, transparent 27px, ${C.roseSoft}15 27px, ${C.roseSoft}15 28px
          );
          pointer-events: none;
        }

        /* ─── Quiz Options ─── */
        .quiz-option {
          display: flex; align-items: center; background: rgba(255,255,255,0.7);
          border: 1.5px solid ${C.roseSoft}; border-radius: 14px; padding: 14px 18px;
          font-family: ${FONT_BODY}; font-size: 15px; font-weight: 500; color: ${C.text};
          cursor: pointer; transition: all 0.25s; text-align: left; width: 100%;
        }
        .quiz-option:hover { background: rgba(255,255,255,0.95); border-color: ${C.rose}; }
        .quiz-option.correct { background: #d4f5d0; border-color: ${C.green}; }
        .quiz-option.wrong { background: #ffd4d4; border-color: #ff6b6b; }
        .quiz-option.reveal-correct { background: #d4f5d044; border-color: ${C.green}44; }

        /* ─── Link Box ─── */
        .link-box {
          background: ${C.cream}; border-radius: 12px; padding: 14px 16px;
          font-size: 11px; font-family: monospace; color: ${C.text};
          word-break: break-all; border: 1px solid ${C.roseSoft}44;
          margin-bottom: 14px; max-height: 72px; overflow-y: auto; line-height: 1.5;
        }

        /* ─── Landing Content ─── */
        .landing-content {
          max-width: 480px; width: 100%; position: relative; z-index: 2;
        }

        /* ─── Payment Spinner ─── */
        .payment-spinner {
          width: 48px; height: 48px; border-radius: 50%;
          border: 4px solid ${C.roseSoft};
          border-top-color: ${C.rose};
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Floating Hearts ─── */
        .floating-wrap {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .floating-heart {
          position: absolute; bottom: -40px; color: ${C.rose};
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          8% { opacity: 0.8; }
          92% { opacity: 0.8; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        /* ─── Confetti ─── */
        .confetti-wrap {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; overflow: hidden;
        }
        .confetti-piece {
          position: absolute; top: -12px;
          animation: confettiFall ease-in forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }

        /* ─── Utility ─── */
        .fade-in { animation: fadeSlideIn 0.5s ease forwards; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pulse-anim { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* ─── Mobile Tweaks ─── */
        @media (max-width: 520px) {
          .card { padding: 24px 20px; border-radius: 20px; }
          .card-title { font-size: 22px; }
          .question-block { padding: 14px 12px; }
          .sticker { width: 110px; height: 110px; }
          .sticker-display { width: 200px; height: 200px; }
        }
      `}</style>
    </div>
  );
}
