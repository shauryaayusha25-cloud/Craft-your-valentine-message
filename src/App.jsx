import { useState, useEffect, useRef } from "react";

// ─── Config ───
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', 'Segoe UI', sans-serif";
const C = {
  bg: "#fff5f7", bgDeep: "#ffe0e6", rose: "#e8456b", roseLight: "#ff85a1",
  roseSoft: "#ffc2d1", gold: "#d4a053", cream: "#fff9f0", white: "#ffffff",
  text: "#3d1a24", textSoft: "#6b3a4a", accent: "#ff4571", green: "#48bb78",
};

// ─── URL Encoding (no backend!) ───
const encode = (obj) => {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  catch { return ""; }
};
const decode = (str) => {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
};

// ─── Floating Hearts ───
function FloatingHearts() {
  const hearts = Array.from({ length: 16 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 10,
    dur: 7 + Math.random() * 9, size: 10 + Math.random() * 22,
    opacity: 0.1 + Math.random() * 0.2,
    emoji: ["♥","❤","💕","💗","✿","♡"][i % 6],
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
    color: ["#ff6b8a","#ff9ecd","#ffd700","#ff4571","#ff85a1","#ffc2d1","#e8456b","#fff"][i % 8],
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
function ProgressDots({ current, total = 4 }) {
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
  return (
    <div className="card fade-in" style={style}>{children}</div>
  );
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

// ─── Creator Page ───
function CreatorPage({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
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

  const canNext = () => {
    if (step === 0) return name.trim() && creatorName.trim();
    if (step === 1) return questions.every(q => q.q.trim() && q.correct.trim() && q.wrong1.trim() && q.wrong2.trim());
    if (step === 2) return photos.length >= 1;
    return true;
  };

  const generate = () => {
    onGenerate({ name, creatorName, questions, photos, message });
  };

  return (
    <div className="page-wrap">
      <FloatingHearts />
      <ProgressDots current={step} />

      {/* Step 0: Names */}
      {step === 0 && (
        <Card key="s0">
          <div className="card-header">
            <span className="card-icon">💌</span>
            <h1 className="card-title">Create Your Valentine</h1>
            <p className="card-sub">Build a cute quiz for your special someone</p>
          </div>
          <Input label="Your Name" value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g., Ayush" />
          <Input label="Your Valentine's Name" value={name} onChange={e => setName(e.target.value)} placeholder="Their name" />
        </Card>
      )}

      {/* Step 1: Questions */}
      {step === 1 && (
        <Card key="s1">
          <div className="card-header">
            <span className="card-icon">🧠</span>
            <h1 className="card-title">3 Quiz Questions</h1>
            <p className="card-sub">Test if they really remember! Set correct + 2 wrong answers.</p>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="question-block">
              <div className="question-num">Question {i + 1}</div>
              <input className="input-field" style={{ marginBottom: "8px" }} value={q.q}
                onChange={e => updateQ(i, "q", e.target.value)} placeholder="e.g., Where was our first date?" />
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

      {/* Step 2: Photos */}
      {step === 2 && (
        <Card key="s2">
          <div className="card-header">
            <span className="card-icon">📸</span>
            <h1 className="card-title">Add Your Photos</h1>
            <p className="card-sub">Upload 1–6 cute photos for the slideshow reveal</p>
          </div>
          <div className="photo-grid">
            {photos.map((p, i) => (
              <div key={i} className="photo-thumb">
                <img src={p} alt="" />
                <button className="photo-remove" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
            {photos.length < 6 && (
              <div className="photo-add" onClick={() => fileRef.current?.click()}>
                <span style={{ fontSize: "24px", color: C.rose }}>+</span>
                <span style={{ fontSize: "11px", color: C.textSoft }}>Add</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
        </Card>
      )}

      {/* Step 3: Message */}
      {step === 3 && (
        <Card key="s3">
          <div className="card-header">
            <span className="card-icon">💝</span>
            <h1 className="card-title">Final Touch</h1>
            <p className="card-sub">Add a personal message shown after the big reveal</p>
          </div>
          <textarea className="input-field" style={{ minHeight: "110px", resize: "vertical" }}
            value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Write something sweet... 💕" />
          <div style={{ marginTop: "20px" }}>
            <Btn onClick={generate} style={{ width: "100%", padding: "16px", fontSize: "17px" }}>
              ✨ Generate Valentine Link
            </Btn>
          </div>
        </Card>
      )}

      {/* Nav Buttons */}
      {step < 3 && (
        <div className="nav-row">
          {step > 0 ? <Btn variant="secondary" onClick={() => setStep(step - 1)}>← Back</Btn> : <div />}
          <Btn disabled={!canNext()} onClick={() => setStep(step + 1)}>Next →</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Share Page ───
function SharePage({ link, data }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
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
        <div className="link-box">{link}</div>
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
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("I made something for you 💝 " + link)}`, "_blank")}>
            WhatsApp 💬
          </Btn>
          {navigator.share && (
            <Btn variant="secondary" style={{ flex: 1, fontSize: "13px", padding: "10px" }}
              onClick={() => navigator.share({ title: "Valentine for you 💝", text: "Someone made a Valentine for you!", url: link }).catch(() => {})}>
              Share 📤
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Recipient Page ───
function RecipientPage({ data }) {
  const [phase, setPhase] = useState("intro"); // intro → quiz → slideshow → proposal → celebration
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noMoves, setNoMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [key, setKey] = useState(0); // for re-triggering fade-in

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
          {/* Progress bar */}
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

      {/* SLIDESHOW */}
      {phase === "slideshow" && (
        <Card>
          <div className="card-header">
            <span className="input-label" style={{ letterSpacing: "1.5px" }}>You scored {score}/3 ♥</span>
            <h2 className="card-title" style={{ fontSize: "22px", marginTop: "8px" }}>
              {score === 3 ? "Perfect! Here's your surprise..." : score >= 1 ? "Not bad! Something special..." : "Well... enjoy this anyway! 😄"}
            </h2>
          </div>
          {slideIndex < data.photos.length ? (
            <div className="slideshow-frame fade-in" key={slideIndex}>
              <img src={data.photos[slideIndex]} alt="" className="slideshow-img" />
              <div className="slideshow-dots">
                {data.photos.map((_, i) => (
                  <span key={i} className="slideshow-dot" style={{
                    background: i === slideIndex ? "#fff" : "rgba(255,255,255,0.4)",
                  }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "52px", textAlign: "center", padding: "24px 0" }} className="pulse-anim">💝</div>
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
            {data.message && (
              <p style={{
                fontFamily: FONT_BODY, color: C.textSoft, fontSize: "14px",
                lineHeight: 1.7, marginTop: "16px", fontStyle: "italic",
              }}>"{data.message}"</p>
            )}
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

      {/* CELEBRATION */}
      {phase === "celebration" && (
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
          {data.photos.length > 0 && (
            <div className="celebration-gallery">
              {data.photos.map((p, i) => (
                <div key={i} className="celebration-thumb fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
                  <img src={p} alt="" />
                </div>
              ))}
            </div>
          )}
          <div style={{
            background: `linear-gradient(135deg, ${C.cream}, ${C.bgDeep}66)`,
            borderRadius: "16px", padding: "20px", border: `1px solid ${C.roseSoft}44`, marginTop: "16px",
          }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: "15px", color: C.textSoft, margin: 0, textAlign: "center" }}>
              Happy Valentine's Day, <strong style={{ color: C.rose }}>{data.name}</strong>! 💝
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main App ───
export default function ValentineApp() {
  const [mode, setMode] = useState("loading");
  const [data, setData] = useState(null);
  const [link, setLink] = useState("");

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
    setMode("create");
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
        <div className="page-wrap"><span className="card-icon pulse-anim" style={{ fontSize: "52px" }}>💝</span></div>
      )}
      {mode === "create" && <CreatorPage onGenerate={handleGenerate} />}
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

        /* ─── Photo Grid ─── */
        .photo-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px;
        }
        .photo-thumb {
          position: relative; border-radius: 12px; overflow: hidden;
          aspect-ratio: 1; border: 2px solid ${C.roseSoft};
        }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .photo-remove {
          position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
          border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff;
          border: none; font-size: 11px; cursor: pointer; display: flex;
          align-items: center; justify-content: center; padding: 0;
        }
        .photo-add {
          border-radius: 12px; border: 2px dashed ${C.roseSoft}; aspect-ratio: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; background: rgba(255,255,255,0.5); transition: all 0.3s;
        }
        .photo-add:hover { background: rgba(255,255,255,0.8); border-color: ${C.rose}; }

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

        /* ─── Slideshow ─── */
        .slideshow-frame {
          border-radius: 16px; overflow: hidden; aspect-ratio: 1;
          max-width: 300px; margin: 0 auto; position: relative;
          box-shadow: 0 8px 32px rgba(232,69,107,0.18);
        }
        .slideshow-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .slideshow-dots {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 6px;
        }
        .slideshow-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.3s; display: block; }

        /* ─── Celebration ─── */
        .celebration-gallery {
          display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
        }
        .celebration-thumb {
          width: 68px; height: 68px; border-radius: 12px; overflow: hidden;
          border: 2px solid ${C.roseSoft};
        }
        .celebration-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* ─── Link Box ─── */
        .link-box {
          background: ${C.cream}; border-radius: 12px; padding: 14px 16px;
          font-size: 11px; font-family: monospace; color: ${C.text};
          word-break: break-all; border: 1px solid ${C.roseSoft}44;
          margin-bottom: 14px; max-height: 72px; overflow-y: auto; line-height: 1.5;
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
        .fade-in {
          animation: fadeSlideIn 0.5s ease forwards;
        }
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
        }
      `}</style>
    </div>
  );
}
