import streamlit as st
import requests

API_BASE = "http://localhost:3000"

st.set_page_config(page_title="Rx Companion", page_icon="⚕️", layout="wide", initial_sidebar_state="collapsed")

STYLE = """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
  .stApp { background: #b0c4de; }
  .stApp > header, #MainMenu, footer, .stDeployButton, .stAppToolbar, section[data-testid="stSidebar"] { display: none !important; }
  .block-container { padding: 0 !important; max-width: 100% !important; }
  .element-container { margin: 0 !important; }

  nav.nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    height: 64px; background: #0f1b2e;
    border-bottom: 1px solid #1e3a5f;
    display: flex; align-items: center;
    padding: 0 40px;
  }
  nav.nav .logo { display: flex; align-items: center; gap: 10px; }
  nav.nav .logo-mark {
    width: 30px; height: 30px; background: #3b82f6; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px; font-weight: 800;
  }
  nav.nav .logo-text { font-size: 17px; font-weight: 700; color: #f0f4ff; letter-spacing: -0.3px; }
  nav.nav .links { display: flex; align-items: center; gap: 2px; margin-left: 44px; }
  nav.nav .links a {
    padding: 8px 16px; font-size: 14px; font-weight: 500; color: #7da5e0;
    text-decoration: none; border-radius: 6px; transition: all 0.12s;
  }
  nav.nav .links a:hover { background: #1e3a5f; color: #fff; }
  nav.nav .links a.active { color: #fff; background: #2563eb; font-weight: 600; }
  nav.nav .status { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #60a5fa; }
  nav.nav .status .dot { width: 6px; height: 6px; border-radius: 50%; }
  nav.nav .status .dot.on { background: #22c55e; }
  nav.nav .status .dot.off { background: #ef4444; }

  .hero {
    margin-top: 64px; min-height: 520px;
    display: flex; align-items: center;
    background: linear-gradient(135deg, #0f1b2e 0%, #1a2d4a 40%, #1e40af 100%);
    border-bottom: 1px solid #1e3a5f;
  }
  .hero-inner {
    max-width: 1280px; margin: 0 auto; padding: 60px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-badge {
    display: inline-block; background: rgba(59,130,246,0.2); color: #93c5fd;
    padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px;
  }
  .hero h1 {
    font-size: 44px; font-weight: 800; color: #ffffff;
    line-height: 1.1; letter-spacing: -1.2px; margin-bottom: 16px;
  }
  .hero h1 em { font-style: normal; color: #60a5fa; }
  .hero p {
    font-size: 16.5px; line-height: 1.7; color: #bfdbfe;
    margin-bottom: 28px; max-width: 480px;
  }
  .hero-img {
    border-radius: 16px; width: 100%; height: 400px;
    object-fit: cover; box-shadow: 0 8px 30px rgba(0,0,0,0.3); border: 1px solid rgba(59,130,246,0.3);
  }
  .btn { display: inline-block; padding: 12px 28px; border-radius: 8px; font-size: 14.5px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-primary:hover { background: #1d4ed8; }

  .sec { padding: 48px 40px; }
  .sec.alt { background: #b0c4de; }
  .sec-inner { max-width: 1280px; margin: 0 auto; }
  .sec-tag { font-size: 12px; font-weight: 600; color: #1e40af; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .sec-title { font-size: 30px; font-weight: 800; color: #0f1b2e; letter-spacing: -0.5px; margin-bottom: 10px; }
  .sec-desc { font-size: 15.5px; color: #1e3a5f; line-height: 1.6; max-width: 560px; margin-bottom: 44px; }

  .grid3 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }

  .card {
    background: #c8d8ed; border: 1px solid #7da5e0; border-radius: 10px;
    padding: 14px; transition: all 0.2s;
  }
  .card:hover { border-color: #2563eb; box-shadow: 0 4px 20px rgba(37,99,235,0.25); }
  .card .ic {
    width: 28px; height: 28px; background: #1a2d4a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; font-size: 13px; margin-bottom: 8px;
  }
  .card h3 { font-size: 12.5px; font-weight: 700; color: #0f1b2e; margin-bottom: 3px; }
  .card p { font-size: 11.5px; color: #1e3a5f; line-height: 1.45; }



  .cta-box {
    background: #0f1b2e; border: 1px solid #1e3a5f;
    border-radius: 16px; padding: 56px; text-align: center; position: relative; overflow: hidden;
  }
  .cta-box::before {
    content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: rgba(37,99,235,0.06); top: -200px; right: -150px;
  }
  .cta-box h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; position: relative; }
  .cta-box p { font-size: 15px; color: #93c5fd; margin-bottom: 24px; position: relative; }

  footer.ft { background: #0a1424; padding: 36px 40px; margin-top: 60px; }
  footer.ft .inner { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
  footer.ft .brand { display: flex; align-items: center; gap: 10px; }
  footer.ft .brand .m { width: 26px; height: 26px; background: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; }
  footer.ft .brand span { color: #fff; font-size: 14px; font-weight: 600; }
  footer.ft .links { display: flex; gap: 24px; }
  footer.ft .links a { color: #60a5fa; font-size: 13px; text-decoration: none; }
  footer.ft .links a:hover { color: #bfdbfe; }
  footer.ft .copy { color: #3b5b7d; font-size: 12px; }

  .page { max-width: 1280px; margin: 88px auto 0; padding: 32px 40px; }
  .page h1 { font-size: 24px; font-weight: 700; color: #0f1b2e; margin-bottom: 4px; }
  .page .sub { font-size: 14px; color: #1e3a5f; margin-bottom: 32px; }

  .chat-wrap { max-width: 800px; margin: 0 auto; }
  .chat-cards { display: flex; flex-direction: column; gap: 12px; padding-bottom: 16px; }
  .chat-user {
    background: #0f1b2e; color: #f0f4ff;
    padding: 14px 18px; border-radius: 16px 16px 4px 16px;
    max-width: 75%; align-self: flex-end;
    font-size: 14px; line-height: 1.5;
  }
  .chat-agent {
    background: #ffffff; color: #0f1b2e;
    padding: 14px 18px; border-radius: 16px 16px 16px 4px;
    max-width: 82%; align-self: flex-start;
    font-size: 14px; line-height: 1.5;
    border: 1px solid #b0c4de;
  }
  .chat-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 6px; }
  .chat-lbl.u { color: #93c5fd; }
  .chat-lbl.b { color: #1d4ed8; }



  input, textarea { padding: 10px 14px !important; border: 1px solid #7da5e0 !important; border-radius: 8px !important; font-size: 14px !important; background: #ffffff !important; color: #0f1b2e !important; }
  input:focus, textarea:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.25) !important; }
  label { font-size: 12px !important; font-weight: 600 !important; color: #0f1b2e !important; }

  table.med { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  table.med th { text-align: left; padding: 10px 12px; color: #0f1b2e; font-weight: 600; border-bottom: 2px solid #7da5e0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  table.med td { padding: 10px 12px; border-bottom: 1px solid #7da5e0; color: #0f1b2e; }
  .stButton {
    display: flex; justify-content: center;
  }
  .stButton button { width: auto !important; min-width: 160px; }

  .stButton > button {
    background: #1a2d4a !important; color: #fff !important;
    border: none !important; border-radius: 8px !important;
    padding: 10px 20px !important; font-weight: 600 !important; font-size: 14px !important;
  }
  .stButton > button:hover { background: #2563eb !important; }

  .chat-fab {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    width: 60px; height: 60px; border-radius: 50%;
    background: #2563eb; color: #fff; border: none;
    font-size: 26px; cursor: pointer; box-shadow: 0 4px 20px rgba(37,99,235,0.4);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s;
  }
  .chat-fab:hover { transform: scale(1.08); }

  .chat-overlay {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
  }
  .chat-popup {
    background: #b0c4de; border-radius: 16px;
    width: 480px; max-height: 640px;
    display: flex; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.25);
    overflow: hidden;
  }
  .chat-popup-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; background: #0f1b2e; color: #fff;
  }
  .chat-popup-head h3 { font-size: 15px; font-weight: 600; margin: 0; }
  .chat-popup-close {
    background: none; border: none; color: #7da5e0; font-size: 20px;
    cursor: pointer; padding: 0; line-height: 1;
  }
  .chat-popup-close:hover { color: #fff; }
  .chat-popup-body {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .chat-popup-sugs { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
  .chat-popup-sugs button {
    background: #fff; border: 1px solid #7da5e0; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #0f1b2e; cursor: pointer;
    text-align: left; transition: all 0.12s;
  }
  .chat-popup-sugs button:hover { border-color: #2563eb; background: #e8f0fe; }
  .chat-popup .chat-popup-sugs .stButton button {
    background: #fff !important; border: 1px solid #7da5e0 !important; border-radius: 8px !important;
    padding: 10px 14px !important; font-size: 13px !important; color: #0f1b2e !important;
    text-align: left !important; min-width: 0 !important; font-weight: 400 !important;
    width: 100% !important; display: block !important;
  }
  .chat-popup .chat-popup-sugs .stButton button:hover { border-color: #2563eb !important; background: #e8f0fe !important; color: #0f1b2e !important; }
  .chat-popup-foot { padding: 12px 20px; border-top: 1px solid #7da5e0; background: #c8d8ed; }
</style>
"""

st.markdown(STYLE, unsafe_allow_html=True)

if "chat_popup" not in st.session_state:
    st.session_state.chat_popup = False

if "page" not in st.session_state:
    st.session_state.page = "home"

try:
    h = requests.get(f"{API_BASE}/health", timeout=3)
    api_ok = h.ok
except:
    api_ok = False

pages = {"home": "Home", "chat": "Chat", "medications": "Medications", "facts": "Patients"}
current = st.session_state.page

qp = st.query_params
if qp:
    if "page" in qp and qp["page"] in pages and qp["page"] != current:
        st.session_state.page = qp["page"]
        st.rerun()
    if "chat" in qp:
        st.session_state.chat_popup = qp["chat"] == "open"

page = st.session_state.page

# Render Navbar
status_dot = "on" if api_ok else "off"
status_text = "Online" if api_ok else "Offline"
active_class = lambda p: "active" if page == p else ""

st.markdown(f"""
<nav class="nav">
  <div class="logo">
    <div class="logo-mark">R</div>
    <div class="logo-text">Rx Companion</div>
  </div>
  <div class="links">
    <a href="?page=home" class="{active_class('home')}">Home</a>
    <a href="?page=chat" class="{active_class('chat')}">Chat</a>
    <a href="?page=medications" class="{active_class('medications')}">Medications</a>
    <a href="?page=facts" class="{active_class('facts')}">Patients</a>
  </div>
  <div class="status">
    <div class="dot {status_dot}"></div>
    <span>{status_text}</span>
  </div>
</nav>
""", unsafe_allow_html=True)

if page == "home":
    if st.session_state.chat_popup:
        st.markdown('<div class="chat-overlay"><div class="chat-popup">', unsafe_allow_html=True)
        st.markdown("<div class='chat-popup-head'><h3>Rx Companion</h3><a href='?chat=close' class='chat-popup-close'>&times;</a></div>", unsafe_allow_html=True)

        pmsgs = st.session_state.setdefault("pmsgs", [])
        if pmsgs:
            st.markdown('<div class="chat-popup-body">', unsafe_allow_html=True)
            for m in pmsgs:
                cls = "chat-user" if m["role"] == "user" else "chat-agent"
                lbl = "u" if m["role"] == "user" else "b"
                label = "You" if m["role"] == "user" else "Rx Companion"
                st.markdown(f'<div class="{cls}"><span class="chat-lbl {lbl}">{label}</span>{m["content"]}</div>', unsafe_allow_html=True)
            st.markdown("</div>", unsafe_allow_html=True)
        else:
            st.markdown('<div class="chat-popup-body">', unsafe_allow_html=True)
            st.markdown('<div class="chat-agent"><span class="chat-lbl b">Rx Companion</span>Welcome to RxSense! I\'m here to help you learn about our healthcare technology solutions, from enterprise pharmacy benefit management to prescription savings for consumers.</div>', unsafe_allow_html=True)
            for sq in ["What is RxSense and what does it do?", "How does SingleCare help me save on prescriptions?", "Can you tell me about the RxIQ enterprise platform?"]:
                if st.button(sq, key=f"ps_{sq[:10]}", use_container_width=True):
                    st.session_state.pmsgs.append({"role": "user", "content": sq})
                    try:
                        r = requests.post(f"{API_BASE}/api/chat", json={"message": sq}, timeout=120)
                        reply = r.json()["reply"] if r.ok else "Error"
                    except:
                        reply = "Cannot connect to the API."
                    st.session_state.pmsgs.append({"role": "assistant", "content": reply})
                    st.rerun()
            st.markdown("</div>", unsafe_allow_html=True)

        st.markdown('<div class="chat-popup-foot">', unsafe_allow_html=True)
        ci, cb = st.columns([4, 1])
        with ci:
            pinp = st.text_input("Question", key="pinp", placeholder="Ask your question here...", label_visibility="collapsed")
        with cb:
            psend = st.button("Send", key="psend", use_container_width=True)
        if psend and pinp:
            st.session_state.pmsgs.append({"role": "user", "content": pinp})
            try:
                r = requests.post(f"{API_BASE}/api/chat", json={"message": pinp}, timeout=120)
                reply = r.json()["reply"] if r.ok else "Error"
            except:
                reply = "Cannot connect to the API."
            st.session_state.pmsgs.append({"role": "assistant", "content": reply})
            st.rerun()
        st.markdown("</div></div></div>", unsafe_allow_html=True)
    else:
        st.markdown(f"""
    <div class="hero">
      <div class="hero-inner">
        <div>
          <div class="hero-badge">AI-Powered Medication Support</div>
          <h1>Medication care,<br><em>simplified</em></h1>
          <p>Get instant drug information, check interactions, identify pills, and manage medication schedules — all in one place.</p>
          <a class="btn btn-primary" href="?page=chat">Start a consultation &rarr;</a>
        </div>
        <div>
          <img class="hero-img" src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Medical consultation">
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="sec"><div class="sec-inner">', unsafe_allow_html=True)
    st.markdown("""
    <div class="sec-tag">Capabilities</div>
    <h2 class="sec-title">Comprehensive medication tools</h2>
    <p class="sec-desc">Everything you need to manage medications safely and effectively, powered by AI.</p>
    <div class="grid3">
      <div class="card"><div class="ic">💊</div><h3>Drug Information</h3><p>Side effects, uses, interactions, and storage from trusted sources.</p></div>
      <div class="card"><div class="ic">🔗</div><h3>Interaction Checker</h3><p>Check interactions between drugs, supplements, and foods.</p></div>
      <div class="card"><div class="ic">🔍</div><h3>Pill Identification</h3><p>Identify pills by imprint, shape, color, and size.</p></div>
      <div class="card"><div class="ic">⏰</div><h3>Medication Reminders</h3><p>Gentle, non-judgmental adherence support.</p></div>
      <div class="card"><div class="ic">🛡️</div><h3>Safety Escalation</h3><p>Emergency guidance and urgent care contacts.</p></div>
      <div class="card"><div class="ic">📋</div><h3>Patient Records</h3><p>Secure medication history and preferences.</p></div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown('</div></div>', unsafe_allow_html=True)

    st.markdown('<a class="chat-fab" href="?chat=open">💬</a>', unsafe_allow_html=True)

elif page == "chat":
    st.markdown('<div class="page"><div class="chat-wrap">', unsafe_allow_html=True)
    st.markdown("<h1>Chat</h1><p class='sub'>Ask about medications, side effects, interactions, or anything else.</p>", unsafe_allow_html=True)

    st.markdown('<div class="chat-cards">', unsafe_allow_html=True)
    for msg in st.session_state.setdefault("msgs", []):
        cls = "chat-user" if msg["role"] == "user" else "chat-agent"
        label = "You" if msg["role"] == "user" else "Rx Companion"
        lbl = "u" if msg["role"] == "user" else "b"
        st.markdown(f'<div class="{cls}"><span class="chat-lbl {lbl}">{label}</span>{msg["content"]}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    with st.container():
        ca, cb = st.columns([5, 1])
        with ca:
            prompt = st.text_input("Your question", key="ci", placeholder="Type your question here...", label_visibility="collapsed")
        with cb:
            send = st.button("Send", use_container_width=True)

    if send and prompt:
        st.session_state.msgs.append({"role": "user", "content": prompt})
        try:
            resp = requests.post(f"{API_BASE}/api/chat", json={"message": prompt}, timeout=120)
            reply = resp.json()["reply"] if resp.ok else f"Error: {resp.json().get('error', resp.text)}"
        except:
            reply = "Cannot connect to the API. Ensure the server is running."
        st.session_state.msgs.append({"role": "assistant", "content": reply})
        st.rerun()

    if st.session_state.msgs:
        if st.button("Clear conversation"):
            st.session_state.msgs = []; st.rerun()
    st.markdown('</div></div>', unsafe_allow_html=True)

elif page == "medications":
    st.markdown('<div class="page">', unsafe_allow_html=True)
    st.markdown("<h1>Medication Records</h1><p class='sub'>View and manage tracked medications.</p>", unsafe_allow_html=True)

    try:
        r = requests.get(f"{API_BASE}/api/medications", timeout=5)
        meds = r.json() if r.ok else {"patients": []}
    except:
        meds = {"patients": []}

    if meds.get("patients"):
        for p in meds["patients"]:
            nm = p.get("display_name") or p.get("patient_id", "Unknown")
            rel = p.get("relationship_to_primary_user", "")
            st.markdown(f"**{nm}**" + (f" — {rel}" if rel else ""))
            ml = p.get("medications", [])
            if ml:
                rows = "".join(
                    f"<tr><td>{m.get('name','')}</td><td>{m.get('strength','')}</td>"
                    f"<td>{m.get('schedule',{}).get('frequency','')}</td>"
                    f"<td>{m.get('purpose','')}</td><td>{m.get('prescriber','')}</td></tr>"
                    for m in ml
                )
                st.markdown(f'<table class="med"><tr><th>Name</th><th>Strength</th><th>Schedule</th><th>Purpose</th><th>Prescriber</th></tr>{rows}</table>', unsafe_allow_html=True)
            else:
                st.caption("No medications.")
            st.divider()
    else:
        st.info("No records yet.")

    with st.expander("Edit via JSON"):
        import json
        cur = json.dumps(meds, indent=2)
        upd = st.text_area("", value=cur, height=200, label_visibility="collapsed")
        if st.button("Save"):
            try:
                parsed = json.loads(upd)
                r = requests.put(f"{API_BASE}/api/medications", json=parsed, timeout=5)
                st.success("Saved!") if r.ok else st.error("Failed")
            except json.JSONDecodeError:
                st.error("Invalid JSON")
    st.markdown('</div>', unsafe_allow_html=True)

elif page == "facts":
    st.markdown('<div class="page">', unsafe_allow_html=True)
    st.markdown("<h1>Patients</h1><p class='sub'>Patient facts, preferences, and household information.</p>", unsafe_allow_html=True)

    try:
        r = requests.get(f"{API_BASE}/api/facts", timeout=5)
        facts = r.json() if r.ok else {}
    except:
        facts = {}

    pu = facts.get("primary_user", {})
    hh = facts.get("household", {})
    pref = facts.get("preferences", {})

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Patient Info**")
        role = st.text_input("Role", value=pu.get("role", ""), key="fr", placeholder="patient / caregiver")
        notes = st.text_area("Notes", value=pu.get("notes", ""), key="fn", placeholder="Context...", height=100)
        others = st.text_area("Household members", value="\n".join(hh.get("other_people_supported", [])), key="fo", placeholder="One per line", height=80)
    with c2:
        st.markdown("**Preferences**")
        style = st.text_input("Reminder style", value=pref.get("reminder_style", ""), key="fs", placeholder="gentle / firm")
        units = st.text_input("Units", value=pref.get("units", ""), key="fu", placeholder="mg / ml / mcg")
        region = st.text_input("Region", value=pref.get("region_for_emergency_numbers", ""), key="fr2", placeholder="US / UK / EU")

    if st.button("Save", use_container_width=True):
        updated = {
            "schema_version": "0.1", "note": "Updated via UI",
            "primary_user": {"role": role, "notes": notes},
            "household": {"other_people_supported": [l.strip() for l in others.split("\n") if l.strip()]},
            "preferences": {"reminder_style": style, "units": units, "region_for_emergency_numbers": region},
        }
        try:
            r = requests.put(f"{API_BASE}/api/facts", json=updated, timeout=5)
            st.success("Saved!") if r.ok else st.error("Failed")
        except:
            st.error("API not reachable")
    st.markdown('</div>', unsafe_allow_html=True)

st.markdown("""
<footer class="ft">
  <div class="inner">
    <div class="brand">
      <div class="m">R</div>
      <span>Rx Companion</span>
    </div>
    <div class="links">
      <a href="?page=home">Home</a>
      <a href="?page=chat">Chat</a>
      <a href="?page=medications">Medications</a>
      <a href="?page=facts">Patients</a>
    </div>
    <div class="copy">&copy; 2026 Rx Companion</div>
  </div>
</footer>
""", unsafe_allow_html=True)
