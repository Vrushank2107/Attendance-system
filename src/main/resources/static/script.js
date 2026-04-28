/* ═══════════════════════════════════════════════════════
   ATTENX — script.js
   FULLY CONNECTED TO SPRING BOOT BACKEND (localhost:8081)
   No local db object — all data comes from API calls
   ══════════════════════════════════════════════════════ */

// ── BACKEND URL ────────────────────────────────────────
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API = isProduction 
  ? "https://attendance-system-qwmo.onrender.com/api"
  : "http://localhost:8082/api";

// ── API HELPER ─────────────────────────────────────────
// Single function for all backend calls
async function api(url, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(API + url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Server error");
  return data;
}

// ── SESSION ───────────────────────────────────────────
let currentUser   = null;  // object from login API
let currentPortal = null;  // 'teacher' | 'student'
let confCb        = null;

// ── HELPERS ───────────────────────────────────────────
const AVATAR_COLORS = ["#4D9EFF","#9B72FF","#00D98B","#E84C6B","#F5A623","#00C4D4","#C96EFF","#FF7C48"];
const avaColor = n => { let h=0; for(let c of n) h=c.charCodeAt(0)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; };
const initials = n => n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
const today    = () => new Date().toISOString().split("T")[0];
const pClr     = p => p>=75 ? "#00D98B" : p>=50 ? "#F5A623" : "#E84C6B";
const pCls     = p => p>=75 ? "prog-green" : p>=50 ? "prog-amber" : "prog-red";

// ════════════════════════════════════════════════════════
//  PORTAL SELECTOR
// ════════════════════════════════════════════════════════
function showAuthScreen(portal) {
  currentPortal = portal;
  document.getElementById("portalScreen").style.display = "none";
  document.getElementById("authScreen").classList.add("visible");
  buildAuthScreen(portal, "login");
}

function buildAuthScreen(portal, mode) {
  const isTeacher = portal === "teacher";
  const left = document.getElementById("authLeft");
  const card = document.getElementById("authCard");

  left.className = `auth-left ${isTeacher ? "auth-left-teacher" : "auth-left-student"}`;
  left.innerHTML = `
    <button class="al-back-btn" onclick="goToPortalSelect()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back to Portal Select
    </button>
    <div class="auth-left-orb" style="width:300px;height:300px;background:${isTeacher?"#6C63FF":"#00D98B"};top:-80px;left:-80px"></div>
    <div class="auth-left-orb" style="width:200px;height:200px;background:${isTeacher?"#3ECFCF":"#4D9EFF"};bottom:-60px;right:-60px"></div>
    <div class="auth-left-content">
      <div class="al-logo-wrap">
        <div class="al-logo-icon" style="background:linear-gradient(135deg,${isTeacher?"#6C63FF,#3ECFCF":"#00D98B,#4D9EFF"})">${isTeacher?"🏫":"🎓"}</div>
        <div class="al-portal-name">${isTeacher?"Teacher Portal":"Student Portal"}</div>
        <div class="al-portal-sub">${isTeacher?"Full access to mark attendance, manage students, generate reports and view analytics":"View your personal attendance record, check percentages and track your progress"}</div>
      </div>
      <div class="al-features">
        ${isTeacher ? `
          <div class="al-feat-item"><div class="al-feat-icon">✅</div><div class="al-feat-text"><strong>Mark Attendance</strong>Record &amp; save daily attendance per course</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">👥</div><div class="al-feat-text"><strong>Manage Students &amp; Courses</strong>Add, edit and remove students &amp; courses</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">📋</div><div class="al-feat-text"><strong>Reports &amp; Defaulters</strong>Generate reports, export CSV, view defaulters</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">📈</div><div class="al-feat-text"><strong>Analytics Dashboard</strong>Charts and attendance insights</div></div>
        ` : `
          <div class="al-feat-item"><div class="al-feat-icon">📅</div><div class="al-feat-text"><strong>My Attendance</strong>View your attendance record &amp; percentage</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">👤</div><div class="al-feat-text"><strong>My Profile</strong>See your enrollment &amp; course details</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">🔔</div><div class="al-feat-text"><strong>Notifications</strong>Get alerted if your attendance drops below 75%</div></div>
          <div class="al-feat-item"><div class="al-feat-icon">🔒</div><div class="al-feat-text"><strong>Private &amp; Secure</strong>Only your own data — no other student visible</div></div>
        `}
      </div>
    </div>`;

  const accent = isTeacher ? "#6C63FF" : "#00D98B";
  document.documentElement.style.setProperty("--pa",      accent);
  document.documentElement.style.setProperty("--pa2",     isTeacher ? "#3ECFCF" : "#4D9EFF");
  document.documentElement.style.setProperty("--pa-glow", isTeacher ? "rgba(108,99,255,.22)" : "rgba(0,217,139,.20)");
  document.documentElement.style.setProperty("--pa-rgb",  isTeacher ? "108,99,255" : "0,217,139");

  if (mode === "login") buildLoginForm(portal, card, isTeacher);
  else buildRegisterForm(portal, card, isTeacher);
}

function buildLoginForm(portal, card, isTeacher) {
  card.innerHTML = `
    <div class="auth-tabs">
      <button class="auth-tab active">Sign In</button>
      <button class="auth-tab" onclick="buildAuthScreen('${portal}','register')">Register</button>
    </div>
    <div class="auth-form-title">Welcome back${isTeacher?", Teacher":""} 👋</div>
    <div class="auth-form-sub">Sign in to your ${isTeacher?"Teacher":"Student"} account</div>
    <div class="fg">
      <label class="flbl">Email Address</label>
      <div class="fi-icon-wrap">
        <span class="fi-icon">✉️</span>
        <input class="fi" type="email" id="authEmail" placeholder="${isTeacher?"teacher@attenx.edu":"student@student.edu"}"
               value="${isTeacher?"priya.sharma@attenx.edu":"aryan@student.edu"}">
      </div>
    </div>
    <div class="fg">
      <label class="flbl">Password</label>
      <div class="fi-icon-wrap">
        <span class="fi-icon">🔒</span>
        <input class="fi" type="password" id="authPass" placeholder="Enter your password"
               value="${isTeacher?"teach123":"stu123"}">
        <span class="fi-eye" onclick="togglePwd('authPass',this)">👁️</span>
      </div>
    </div>
    <button class="btn btn-primary btn-full" onclick="doLogin()">Sign In →</button>
    <div class="auth-hint">Don't have an account? <a onclick="buildAuthScreen('${portal}','register')">Register here</a></div>
    <div class="auth-hint" style="margin-top:10px;padding:10px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);font-size:.78rem">
      ${isTeacher
        ? "🔑 Demo: <b>priya.sharma@attenx.edu</b> / <b>teach123</b>"
        : "🎓 Demo: <b>aryan@student.edu</b> / <b>stu123</b>"}
    </div>`;
}

function buildRegisterForm(portal, card, isTeacher) {
  // We need courses for student register — fetch them async
  card.innerHTML = `
    <div class="auth-tabs">
      <button class="auth-tab" onclick="buildAuthScreen('${portal}','login')">Sign In</button>
      <button class="auth-tab active">Register</button>
    </div>
    <div class="auth-form-title">Create Account</div>
    <div class="auth-form-sub">Register as a ${isTeacher?"Teacher":"Student"}</div>
    <div class="fg"><label class="flbl">Full Name *</label><input class="fi" id="regName" placeholder="e.g. Dr. Arjun Patel"></div>
    <div class="fg"><label class="flbl">Email Address *</label><input class="fi" type="email" id="regEmail" placeholder="${isTeacher?"teacher@attenx.edu":"student@college.edu"}"></div>
    ${isTeacher ? `
    <div class="fg-row">
      <div class="fg"><label class="flbl">Employee ID *</label><input class="fi" id="regEmpId" placeholder="EMP003"></div>
      <div class="fg"><label class="flbl">Subject</label><input class="fi" id="regSubject" placeholder="Computer Science"></div>
    </div>` : `
    <div class="fg-row">
      <div class="fg"><label class="flbl">Roll Number *</label><input class="fi" id="regRoll" placeholder="CS2024011"></div>
      <div class="fg"><label class="flbl">Course *</label><select class="fi" id="regCourse"><option>Loading…</option></select></div>
    </div>`}
    <div class="fg-row">
      <div class="fg"><label class="flbl">Password *</label><input class="fi" type="password" id="regPass" placeholder="Min 6 chars"></div>
      <div class="fg"><label class="flbl">Confirm Password *</label><input class="fi" type="password" id="regPass2" placeholder="Repeat"></div>
    </div>
    <button class="btn btn-primary btn-full" onclick="doRegister()">Create Account →</button>
    <div class="auth-hint">Already have an account? <a onclick="buildAuthScreen('${portal}','login')">Sign in</a></div>`;

  // Populate course dropdown for student register
  if (!isTeacher) {
    api("/courses").then(courses => {
      const sel = document.getElementById("regCourse");
      if (sel) sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }).catch(() => {});
  }
}

function togglePwd(id, el) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
  el.textContent = inp.type === "password" ? "👁️" : "🙈";
}

function goToPortalSelect() {
  document.getElementById("authScreen").classList.remove("visible");
  document.getElementById("portalScreen").style.display = "flex";
  document.getElementById("appShell").classList.remove("visible");
  currentUser = null;
  currentPortal = null;
}

// ════════════════════════════════════════════════════════
//  LOGIN — calls POST /api/auth/login
// ════════════════════════════════════════════════════════
async function doLogin() {
  const email = document.getElementById("authEmail").value.trim();
  const pass  = document.getElementById("authPass").value.trim();
  if (!email) { toast("Email is required", "e"); return; }
  if (!pass)  { toast("Password is required", "e"); return; }

  try {
    const user = await api("/auth/login", "POST", {
      portal:   currentPortal.toUpperCase(),   // "TEACHER" or "STUDENT"
      email:    email,
      password: pass,
    });
    // user = { role, id, name, email, courseId (student only), roll (student only), ... }
    currentUser = user;
    launchApp(currentPortal);
  } catch (err) {
    toast(err.message, "e");
  }
}

// ════════════════════════════════════════════════════════
//  REGISTER — calls POST /api/auth/register
// ════════════════════════════════════════════════════════
async function doRegister() {
  const name  = document.getElementById("regName")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const pass  = document.getElementById("regPass")?.value;
  const pass2 = document.getElementById("regPass2")?.value;

  if (!name)  { toast("Full name is required", "e");  return; }
  if (!email) { toast("Email is required", "e");      return; }
  if (!pass)  { toast("Password is required", "e");   return; }
  if (pass.length < 6) { toast("Password must be at least 6 characters", "e"); return; }
  if (pass !== pass2)  { toast("Passwords do not match", "e"); return; }

  const body = {
    portal:   currentPortal.toUpperCase(),
    name, email, password: pass,
  };

  if (currentPortal === "teacher") {
    body.empId   = document.getElementById("regEmpId")?.value.trim();
    body.subject = document.getElementById("regSubject")?.value.trim();
    if (!body.empId) { toast("Employee ID is required", "e"); return; }
  } else {
    body.roll     = document.getElementById("regRoll")?.value.trim();
    body.courseId = parseInt(document.getElementById("regCourse")?.value);
    if (!body.roll) { toast("Roll number is required", "e"); return; }
  }

  try {
    await api("/auth/register", "POST", body);
    toast("Account created! Please sign in.", "s");
    buildAuthScreen(currentPortal, "login");
  } catch (err) {
    toast(err.message, "e");
  }
}

// ════════════════════════════════════════════════════════
//  LAUNCH APP
// ════════════════════════════════════════════════════════
function launchApp(portal) {
  document.getElementById("authScreen").classList.remove("visible");
  document.getElementById("appShell").classList.add("visible");

  document.getElementById("sbAva").textContent  = initials(currentUser.name);
  document.getElementById("sbName").textContent = currentUser.name;
  document.getElementById("sbRole").textContent = portal === "teacher"
    ? "Teacher"
    : `Student · ${currentUser.roll}`;

  buildNav(portal);

  if (portal === "teacher") {
    document.body.className = "t-dash";
    initTeacherApp();
    navTo("dashboard", document.getElementById("nv-dashboard"), "t-dash");
  } else {
    document.body.className = "t-stu-my";
    navTo("my-attendance", document.getElementById("nv-my-attendance"), "t-stu-my");
  }

  toast(`Welcome, ${currentUser.name.split(" ")[0]}! 👋`, "s");
}

function doLogout() {
  document.getElementById("appShell").classList.remove("visible");
  currentUser = null;
  currentPortal = null;
  document.getElementById("portalScreen").style.display = "flex";
  if (bC) { bC.destroy(); bC = null; }
  if (pC) { pC.destroy(); pC = null; }
  if (dC) { dC.destroy(); dC = null; }
  toast("Signed out successfully", "i");
}

// ════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════
function buildNav(portal) {
  const nav = document.getElementById("sbNav");
  if (portal === "teacher") {
    nav.innerHTML = `
      <div class="sb-nav-section">
        <div class="sb-nav-label">Main</div>
        <div class="nav-item" id="nv-dashboard"  onclick="navTo('dashboard',this,'t-dash')"><span class="nav-icon">📊</span> Dashboard</div>
        <div class="nav-item" id="nv-attendance" onclick="navTo('attendance',this,'t-att')"><span class="nav-icon">✅</span> Mark Attendance</div>
        <div class="nav-item" id="nv-students"   onclick="navTo('students',this,'t-stu')"><span class="nav-icon">👥</span> Students</div>
        <div class="nav-item" id="nv-courses"    onclick="navTo('courses',this,'t-crs')"><span class="nav-icon">📚</span> Courses</div>
      </div>
      <div class="sb-nav-section">
        <div class="sb-nav-label">Reports</div>
        <div class="nav-item" id="nv-reports"    onclick="navTo('reports',this,'t-rep')"><span class="nav-icon">📋</span> Reports</div>
        <div class="nav-item" id="nv-defaulters" onclick="navTo('defaulters',this,'t-def')"><span class="nav-icon">⚠️</span> Defaulters <span class="nav-badge" id="defBadge">0</span></div>
        <div class="nav-item" id="nv-analytics"  onclick="navTo('analytics',this,'t-ana')"><span class="nav-icon">📈</span> Analytics</div>
      </div>
      <div class="sb-nav-section">
        <div class="sb-nav-label">System</div>
        <div class="nav-item" onclick="openNP()"><span class="nav-icon">🔔</span> Notifications <span class="nav-badge" id="notifBadge">0</span></div>
      </div>`;
  } else {
    nav.innerHTML = `
      <div class="sb-nav-section">
        <div class="sb-nav-label">My Space</div>
        <div class="nav-item" id="nv-my-attendance" onclick="navTo('my-attendance',this,'t-stu-my')"><span class="nav-icon">📅</span> My Attendance</div>
        <div class="nav-item" id="nv-my-profile"    onclick="navTo('my-profile',this,'t-stu-pro')"><span class="nav-icon">👤</span> My Profile</div>
      </div>
      <div class="sb-nav-section">
        <div class="sb-nav-label">System</div>
        <div class="nav-item" onclick="openNP()"><span class="nav-icon">🔔</span> Notifications <span class="nav-badge" id="notifBadge">0</span></div>
      </div>`;
  }
}

const PAGE_TITLES = {
  dashboard:"Dashboard", attendance:"Mark Attendance", students:"Students",
  courses:"Courses", reports:"Reports", defaulters:"Defaulters", analytics:"Analytics",
  "my-attendance":"My Attendance", "my-profile":"My Profile",
};

function navTo(page, el, theme) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + page)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  if (el) el.classList.add("active");
  document.getElementById("pgTitle").textContent = PAGE_TITLES[page] || page;
  document.body.className = theme || "t-dash";

  if (page === "dashboard")     renderDash();
  if (page === "students")      renderStu();
  if (page === "courses")       renderCrs();
  if (page === "defaulters")    renderDef();
  if (page === "analytics")     renderAna();
  if (page === "reports")       renderReports();
  if (page === "my-attendance") renderMyAtt();
  if (page === "my-profile")    renderMyProfile();
  if (page === "attendance")    initAttPage();
}

// ════════════════════════════════════════════════════════
//  TEACHER INIT
// ════════════════════════════════════════════════════════
function initTeacherApp() {
  document.getElementById("attD").value = today();
}

// ════════════════════════════════════════════════════════
//  DASHBOARD — GET /api/dashboard/teacher
// ════════════════════════════════════════════════════════
async function renderDash() {
  try {
    const d = await api("/dashboard/teacher");
    document.getElementById("kpi-s").textContent   = d.totalStudents;
    document.getElementById("kpi-c").textContent   = d.activeCourses;
    document.getElementById("kpi-d").textContent   = d.defaulters;
    document.getElementById("kpi-a").textContent   = d.overallAttendancePercent + "%";
    document.getElementById("kpi-a-sub").textContent = `${d.presentCount} present of ${d.totalAttendanceEntries} total`;
    document.getElementById("overallR").textContent = d.overallAttendancePercent + "%";
    document.getElementById("overallB").style.width = d.overallAttendancePercent + "%";
    document.getElementById("brkP").textContent = d.presentCount;
    document.getElementById("brkA").textContent = d.absentCount;

    // Update defaulter badge
    const db = document.getElementById("defBadge");
    if (db) db.textContent = d.defaulters;

    // Recent attendance table
    document.getElementById("recentBody").innerHTML = (d.recentAttendance || []).map(a => `
      <tr>
        <td><span class="cell-name">
          <div class="ava" style="background:${avaColor(a.studentName)}">${initials(a.studentName)}</div>
          ${a.studentName}
        </span></td>
        <td><span class="course-pill">${a.courseCode}</span></td>
        <td style="color:var(--text3);font-size:.78rem">${a.date}</td>
        <td><span class="bdg ${a.status==="PRESENT"?"bdg-green":"bdg-red"}">${a.status}</span></td>
      </tr>`).join("");
  } catch (err) {
    toast("Dashboard load failed: " + err.message, "e");
  }
}

// ════════════════════════════════════════════════════════
//  ATTENDANCE PAGE
// ════════════════════════════════════════════════════════
const aState = {};  // studentId -> 'PRESENT' | 'ABSENT' | null

async function initAttPage() {
  // Populate course dropdown from backend
  try {
    const courses = await api("/courses");
    const sel = document.getElementById("attC");
    if (sel) {
      sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
    loadAtt();
  } catch (err) {
    toast("Could not load courses: " + err.message, "e");
  }
}

// Load students for selected course + check existing attendance for date
async function loadAtt() {
  const cidEl  = document.getElementById("attC");
  const dateEl = document.getElementById("attD");
  if (!cidEl || !dateEl) return;

  const cid  = parseInt(cidEl.value);
  const date = dateEl.value;
  const grid = document.getElementById("attGrid");
  if (!grid) return;

  grid.innerHTML = '<div class="empty-state"><div class="es-icon">⏳</div><p>Loading students…</p></div>';

  try {
    // Get all students for this course
    const allStudents = await api("/students");
    const stus = allStudents.filter(s => s.courseId === cid);

    if (!stus.length) {
      grid.innerHTML = '<div class="empty-state"><div class="es-icon">👥</div><p>No students in this course</p></div>';
      return;
    }

    // Get existing attendance for this course+date
    const existing = await api(`/attendance?courseId=${cid}&date=${date}`);
    const existingMap = {};
    existing.forEach(r => { existingMap[r.studentId] = r.status; });

    // Check if ANY student already has attendance saved → warn teacher
    const dupCount = Object.keys(existingMap).length;
    if (dupCount > 0) {
      toast(`⚠️ ${dupCount} student(s) already have attendance for ${date}. Saving will be BLOCKED.`, "w");
    }

    // Sync aState
    stus.forEach(s => { aState[s.id] = existingMap[s.id] || null; });

    renderAttGrid(stus, cid, date, existingMap);
  } catch (err) {
    toast("Failed to load attendance: " + err.message, "e");
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">❌</div><p>Error loading data</p></div>';
  }
}

function renderAttGrid(stus, cid, date, existingMap) {
  const grid = document.getElementById("attGrid");
  grid.innerHTML = stus.map(s => {
    const cur = aState[s.id];
    const alreadySaved = !!existingMap[s.id];
    return `<div class="att-card">
      <div class="att-card-top">
        <div class="ava" style="width:38px;height:38px;background:${avaColor(s.name)}">${initials(s.name)}</div>
        <div style="flex:1">
          <div class="att-name">${s.name}</div>
          <div class="att-info">${s.roll}${alreadySaved ? ` · <span style="color:#F5A623;font-weight:700">Already saved</span>` : ""}</div>
        </div>
        ${alreadySaved ? `<span class="att-saved" title="Attendance already saved for this date — duplicate blocked">🔒 saved</span>` : ""}
      </div>
      <div class="att-btns">
        <button class="att-btn ${cur==="PRESENT"?"present":""}" id="bp-${s.id}"
          onclick="setAtt(${s.id},'PRESENT')" ${alreadySaved?"disabled":""}>✅ Present</button>
        <button class="att-btn ${cur==="ABSENT"?"absent":""}" id="ba-${s.id}"
          onclick="setAtt(${s.id},'ABSENT')" ${alreadySaved?"disabled":""}>❌ Absent</button>
      </div>
    </div>`;
  }).join("");
}

function setAtt(sid, status) {
  aState[sid] = status;
  const bp = document.getElementById(`bp-${sid}`);
  const ba = document.getElementById(`ba-${sid}`);
  if (bp) bp.className = "att-btn" + (status === "PRESENT" ? " present" : "");
  if (ba) ba.className = "att-btn" + (status === "ABSENT"  ? " absent"  : "");
}

async function markAll(status) {
  const cid  = parseInt(document.getElementById("attC").value);
  const date = document.getElementById("attD").value;
  try {
    const allStudents = await api("/students");
    const existing    = await api(`/attendance?courseId=${cid}&date=${date}`);
    const existingMap = {};
    existing.forEach(r => { existingMap[r.studentId] = r.status; });

    allStudents.filter(s => s.courseId === cid && !existingMap[s.id]).forEach(s => {
      setAtt(s.id, status);
    });
  } catch(err) {
    toast("Could not mark all: " + err.message, "e");
  }
}

// ── SAVE ATTENDANCE — POST /api/attendance/bulk ───────
// DUPLICATE PREVENTION: checks existing records first;
// if ANY student already has attendance for this date → BLOCK entire save
async function saveAtt() {
  const cid  = parseInt(document.getElementById("attC").value);
  const date = document.getElementById("attD").value;
  if (!date) { toast("Please select a date", "e"); return; }

  try {
    // Step 1: Check for existing attendance (DUPLICATE CHECK)
    const existing = await api(`/attendance?courseId=${cid}&date=${date}`);

    if (existing.length > 0) {
      // ── HARD BLOCK: show clear blocked modal ──────────
      const names = [];
      for (const r of existing) {
        try {
          const stu = await api(`/students/${r.studentId}`);
          names.push(stu.name);
        } catch { names.push("Student #" + r.studentId); }
      }
      showDuplicateBlockedModal(names, date, cid);
      return;   // STOP — do not save anything
    }

    // Step 2: Build records from aState (only marked students)
    const records = [];
    for (const [sidStr, status] of Object.entries(aState)) {
      if (status) records.push({ studentId: parseInt(sidStr), status });
    }
    if (!records.length) { toast("Please mark at least one student", "w"); return; }

    // Step 3: Save to backend
    await api("/attendance/bulk", "POST", { courseId: cid, date, records });

    toast(`✅ Attendance saved for ${records.length} students`, "s");

    // Step 4: Check for new defaulters after save
    await checkAndShowNewDefaulters(records.map(r => r.studentId));

    loadAtt();       // Refresh grid
    renderDash();    // Refresh dashboard counts

  } catch (err) {
    toast("Save failed: " + err.message, "e");
  }
}

// Show a clear "DUPLICATE BLOCKED" modal
function showDuplicateBlockedModal(names, date, cid) {
  document.getElementById("confMsg").innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:2.8rem">🚫</div>
      <div style="font-family:'Sora',sans-serif;font-weight:800;font-size:1.1rem;color:#E84C6B;margin:8px 0">
        Duplicate Entry — BLOCKED
      </div>
      <div style="font-size:.85rem;color:var(--text2)">
        Attendance for <strong style="color:var(--text)">${date}</strong> is already saved
      </div>
    </div>
    <div style="background:rgba(232,76,107,.07);border:1px solid rgba(232,76,107,.25);border-radius:10px;padding:12px 14px;margin-bottom:12px">
      <div style="font-size:.78rem;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px;font-weight:700">Already saved for:</div>
      ${names.map(n => `<div style="padding:4px 0;font-weight:600;color:#E84C6B;font-size:.88rem">• ${n}</div>`).join("")}
    </div>
    <p style="font-size:.82rem;color:var(--text3);line-height:1.6">
      The system prevents duplicate attendance entries.<br>
      To change today's attendance, please contact the administrator.
    </p>`;
  confCb = null;
  // Change confirm button to just close
  const btn = document.querySelector("#mConf .modal-footer .btn-red, #mConf .modal-footer button:last-child");
  if (btn) { btn.textContent = "Understood"; btn.onclick = () => closeM("mConf"); }
  openM("mConf");
}

// Check if any student just became a defaulter after this save
async function checkAndShowNewDefaulters(savedStudentIds) {
  try {
    const defaulters = await api("/defaulters");
    const newDefs = defaulters.filter(d => savedStudentIds.includes(d.studentId));
    if (!newDefs.length) return;

    document.getElementById("confMsg").innerHTML = `
      <div style="text-align:center;margin-bottom:14px">
        <div style="font-size:2.5rem">⚠️</div>
        <div style="font-family:'Sora',sans-serif;font-weight:800;font-size:1.05rem;color:#F5A623;margin:8px 0">
          Defaulter Alert!
        </div>
        <div style="font-size:.85rem;color:var(--text2)">
          ${newDefs.length} student${newDefs.length>1?"s have":" has"} attendance below 75%
        </div>
      </div>
      ${newDefs.map(d => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(232,76,107,.12)">
          <span style="font-weight:700;color:var(--text)">${d.studentName}</span>
          <span style="color:#E84C6B;font-weight:800;font-family:'Sora',sans-serif">${d.percentage}%</span>
        </div>`).join("")}
      <p style="font-size:.82rem;color:var(--text3);margin-top:12px">These students need academic follow-up.</p>`;
    confCb = null;
    const btn = document.querySelector("#mConf .modal-footer .btn-red, #mConf .modal-footer button:last-child");
    if (btn) {
      btn.textContent = "View Defaulters";
      btn.onclick = () => { closeM("mConf"); navTo("defaulters", document.getElementById("nv-defaulters"), "t-def"); };
    }
    openM("mConf");
  } catch (_) {}
}

// ════════════════════════════════════════════════════════
//  STUDENTS — GET/POST/PUT/DELETE /api/students
// ════════════════════════════════════════════════════════
async function renderStu(f = "", cf = "") {
  try {
    let list = await api("/students");
    if (f)  list = list.filter(s => (s.name + s.email + s.roll).toLowerCase().includes(f.toLowerCase()));
    if (cf) list = list.filter(s => s.courseId == cf);

    // Also get stats for each student
    const allStats = await api("/reports");
    const statsMap = {};
    allStats.forEach(st => { statsMap[st.studentId] = st; });

    document.getElementById("stuBody").innerHTML = list.map(s => {
      const st  = statsMap[s.id] || { percentage: 0, total: 0 };
      const def = st.total > 0 && st.percentage < 75;
      return `<tr style="${def?"background:rgba(232,76,107,.025)":""}">
        <td style="color:var(--text3);font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem">${s.roll}</td>
        <td><span class="cell-name"><div class="ava" style="background:${avaColor(s.name)}">${initials(s.name)}</div>${s.name}</span></td>
        <td style="font-size:.8rem;color:var(--text3)">${s.email}</td>
        <td><span class="course-pill">${st.courseCode || ""}</span></td>
        <td>
          <div class="pct-cell">
            <span class="pct-num" style="color:${pClr(st.percentage)}">${st.percentage}%</span>
            <div class="pct-bar"><div class="prog-bar-wrap"><div class="prog-bar ${pCls(st.percentage)}" style="width:${st.percentage}%"></div></div></div>
          </div>
        </td>
        <td>${def ? '<span class="bdg bdg-red">⚠ Defaulter</span>' : st.total===0 ? '<span class="bdg bdg-amber">🆕 New</span>' : '<span class="bdg bdg-green">✓ Regular</span>'}</td>
        <td>
          <button class="act-btn act-edit" onclick="openEditStu(${s.id})">✏️ Edit</button>
          <button class="act-btn act-del"  onclick="openConf('Delete student \\'${s.name}\\'?',()=>delStu(${s.id}))">🗑️ Del</button>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text3)">No students found</td></tr>`;

    // Also populate course filter dropdown
    const courses = await api("/courses");
    const cf_el = document.getElementById("stuCF");
    if (cf_el) {
      cf_el.innerHTML = '<option value="">All Courses</option>' +
        courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) { toast("Failed to load students: " + err.message, "e"); }
}

function filterStu(v)  { renderStu(v, document.getElementById("stuCF").value); }
function filterStuC(v) { renderStu(document.getElementById("stuS").value, v); }
function gsFn() {
  const v = document.getElementById("gs").value;
  navTo("students", document.getElementById("nv-students"), "t-stu");
  const el = document.getElementById("stuS");
  if (el) { el.value = v; renderStu(v); }
}

async function openAddStu() {
  document.getElementById("mSTtl").textContent = "Add Student";
  document.getElementById("eSId").value = "";
  ["sN","sE","sR"].forEach(i => { const el=document.getElementById(i); if(el){el.value=""; el.classList.remove("fi-error");} });
  // Populate course select
  try {
    const courses = await api("/courses");
    const sel = document.getElementById("sCrs");
    if (sel) sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } catch(_) {}
  openM("mStu");
}

async function openEditStu(id) {
  try {
    const s = await api(`/students/${id}`);
    document.getElementById("mSTtl").textContent = "Edit Student";
    document.getElementById("eSId").value = id;
    document.getElementById("sN").value   = s.name;
    document.getElementById("sE").value   = s.email;
    document.getElementById("sR").value   = s.roll;
    // Populate course select then set value
    const courses = await api("/courses");
    const sel = document.getElementById("sCrs");
    if (sel) {
      sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      sel.value = s.courseId;
    }
    openM("mStu");
  } catch (err) { toast(err.message, "e"); }
}

async function saveStu() {
  const name  = document.getElementById("sN").value.trim();
  const email = document.getElementById("sE").value.trim();
  const roll  = document.getElementById("sR").value.trim();
  const cid   = parseInt(document.getElementById("sCrs").value);
  const eid   = document.getElementById("eSId").value;

  if (!name)  { toast("Name is required", "e");  return; }
  if (!email) { toast("Email is required", "e"); return; }
  if (!roll)  { toast("Roll number is required", "e"); return; }

  const body = { name, email, roll, courseId: cid };

  try {
    if (eid) {
      await api(`/students/${eid}`, "PUT", body);
      toast("Student updated", "s");
    } else {
      await api("/students", "POST", body);
      toast("Student added", "s");
    }
    closeM("mStu");
    renderStu();
    renderDash();
  } catch (err) { toast(err.message, "e"); }
}

async function delStu(id) {
  try {
    await api(`/students/${id}`, "DELETE");
    toast("Student deleted", "s");
    renderStu(); renderDash();
  } catch (err) { toast(err.message, "e"); }
}

// ════════════════════════════════════════════════════════
//  COURSES — GET/POST/PUT/DELETE /api/courses
// ════════════════════════════════════════════════════════
async function renderCrs() {
  try {
    const courses = await api("/courses");
    const allStats = await api("/reports");

    document.getElementById("crsBody").innerHTML = courses.map(c => {
      const stuStats = allStats.filter(st => st.courseId === c.id);
      const avg = stuStats.length
        ? Math.round(stuStats.reduce((a, st) => a + st.percentage, 0) / stuStats.length)
        : 0;
      return `<tr>
        <td><span class="course-pill">${c.code}</span></td>
        <td><span class="cell-name">${c.name}</span></td>
        <td style="color:var(--text2);font-size:.83rem">${c.instructor || "—"}</td>
        <td style="font-family:'Sora',sans-serif;font-weight:700;color:var(--text)">${stuStats.length}</td>
        <td>
          <div class="pct-cell">
            <span class="pct-num" style="color:${pClr(avg)}">${avg}%</span>
            <div class="pct-bar"><div class="prog-bar-wrap"><div class="prog-bar ${pCls(avg)}" style="width:${avg}%"></div></div></div>
          </div>
        </td>
        <td>
          <button class="act-btn act-edit" onclick="openEditCrs(${c.id})">✏️ Edit</button>
          <button class="act-btn act-del"  onclick="openConf('Delete course \\'${c.name}\\'?',()=>delCrs(${c.id}))">🗑️ Del</button>
        </td>
      </tr>`;
    }).join("");
  } catch (err) { toast("Failed to load courses: " + err.message, "e"); }
}

function openAddCrs() {
  document.getElementById("mCTtl").textContent = "Add Course";
  document.getElementById("eCId").value = "";
  ["cN","cC","cI"].forEach(i => { const el=document.getElementById(i); if(el){el.value=""; el.classList.remove("fi-error");} });
  openM("mCrs");
}

async function openEditCrs(id) {
  try {
    const courses = await api("/courses");
    const c = courses.find(x => x.id === id);
    document.getElementById("mCTtl").textContent = "Edit Course";
    document.getElementById("eCId").value = id;
    document.getElementById("cN").value   = c.name;
    document.getElementById("cC").value   = c.code;
    document.getElementById("cI").value   = c.instructor || "";
    openM("mCrs");
  } catch (err) { toast(err.message, "e"); }
}

async function saveCrs() {
  const name = document.getElementById("cN").value.trim();
  const code = document.getElementById("cC").value.trim();
  const inst = document.getElementById("cI").value.trim();
  const eid  = document.getElementById("eCId").value;

  if (!name) { toast("Course name is required", "e"); return; }
  if (!code) { toast("Course code is required", "e"); return; }

  try {
    if (eid) {
      await api(`/courses/${eid}`, "PUT", { name, code, instructor: inst });
      toast("Course updated", "s");
    } else {
      await api("/courses", "POST", { name, code, instructor: inst });
      toast("Course added", "s");
    }
    closeM("mCrs");
    renderCrs(); renderDash();
  } catch (err) { toast(err.message, "e"); }
}

async function delCrs(id) {
  try {
    await api(`/courses/${id}`, "DELETE");
    toast("Course deleted", "s");
    renderCrs(); renderDash();
  } catch (err) { toast(err.message, "e"); }
}

// ════════════════════════════════════════════════════════
//  REPORTS — GET /api/reports
// ════════════════════════════════════════════════════════
async function renderReports() {
  // Populate course filter
  try {
    const courses = await api("/courses");
    const sel = document.getElementById("repC");
    if (sel) sel.innerHTML = '<option value="">All Courses</option>' +
      courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } catch(_) {}
}

async function genRep() {
  const cf = document.getElementById("repC").value;
  const mf = document.getElementById("repM").value;  // e.g. "2024-06"

  try {
    let url = "/reports";
    if (cf) url += `?courseId=${cf}`;
    let rows = await api(url);

    // Client-side month filter (backend doesn't have month filter — we filter here)
    // We re-fetch attendance per student to get monthly data only if month selected
    if (mf) {
      const attAll = await api(`/attendance${cf?"?courseId="+cf:""}`);
      const filtered = attAll.filter(a => a.date && a.date.startsWith(mf));
      // Rebuild stats per student from filtered attendance
      const studentAtt = {};
      filtered.forEach(a => {
        if (!studentAtt[a.studentId]) studentAtt[a.studentId] = { present:0, total:0 };
        studentAtt[a.studentId].total++;
        if (a.status === "PRESENT") studentAtt[a.studentId].present++;
      });
      rows = rows.map(r => {
        const ma = studentAtt[r.studentId] || { present:0, total:0 };
        const pct = ma.total ? Math.round(ma.present*100/ma.total) : 0;
        return { ...r, total: ma.total, present: ma.present, absent: ma.total-ma.present, percentage: pct, defaulter: ma.total>0 && pct<75 };
      }).filter(r => r.total > 0);
    }

    document.getElementById("repOut").innerHTML = `
      <div class="table-wrap">
        <div style="padding:14px 18px;background:var(--surface2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <span style="font-family:'Sora',sans-serif;font-weight:700;font-size:.9rem">Attendance Report</span>
          <span class="bdg bdg-cyan">${rows.length} students</span>
          ${mf ? `<span class="bdg bdg-blue">${mf}</span>` : ""}
          <div style="margin-left:auto;font-size:.7rem;color:var(--text3)">Generated ${new Date().toLocaleDateString("en-IN")}</div>
        </div>
        <table class="data-table">
          <thead><tr><th>Student</th><th>Course</th><th>Total</th><th>Present</th><th>Absent</th><th>Att %</th><th>Status</th></tr></thead>
          <tbody>${rows.map(r => `
            <tr style="${r.defaulter?"background:rgba(232,76,107,.025)":""}">
              <td><span class="cell-name"><div class="ava" style="background:${avaColor(r.studentName)}">${initials(r.studentName)}</div>${r.studentName}</span></td>
              <td><span class="course-pill">${r.courseCode}</span></td>
              <td style="color:var(--text)">${r.total}</td>
              <td style="color:#00D98B;font-weight:700">${r.present}</td>
              <td style="color:#E84C6B;font-weight:700">${r.absent}</td>
              <td><div class="pct-cell"><span class="pct-num" style="color:${pClr(r.percentage)}">${r.percentage}%</span><div class="pct-bar"><div class="prog-bar-wrap"><div class="prog-bar ${pCls(r.percentage)}" style="width:${r.percentage}%"></div></div></div></div></td>
              <td>${r.defaulter ? '<span class="bdg bdg-red">⚠ Defaulter</span>' : '<span class="bdg bdg-green">✓ Regular</span>'}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    toast(`Report generated for ${rows.length} students`, "i");
  } catch (err) { toast("Report failed: " + err.message, "e"); }
}

async function expCSV() {
  try {
    const rows = await api("/reports");
    const lines = [["Name","Email","Roll","Course","Total","Present","Absent","Attendance%","Status"]];
    rows.forEach(r => lines.push([r.studentName, r.email, r.roll, r.courseName, r.total, r.present, r.absent, r.percentage+"%", r.defaulter?"Defaulter":"Regular"]));
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.map(l=>l.join(",")).join("\n"));
    a.download = "attendance_report.csv"; a.click();
    toast("CSV exported", "s");
  } catch (err) { toast(err.message, "e"); }
}
function expPDF() { toast("PDF export requires backend integration", "i"); }

// ════════════════════════════════════════════════════════
//  DEFAULTERS — GET /api/defaulters
// ════════════════════════════════════════════════════════
async function renderDef() {
  try {
    const defs = await api("/defaulters");
    const el = document.getElementById("defBadge");
    if (el) el.textContent = defs.length;

    document.getElementById("defBody").innerHTML = defs.map(d => {
      const sf = Math.ceil(0.75 * d.total - d.present);
      return `<tr>
        <td><span class="cell-name"><div class="ava" style="background:#E84C6B">${initials(d.studentName)}</div><span style="color:#E84C6B">${d.studentName}</span></span></td>
        <td><span class="course-pill">${d.courseCode}</span></td>
        <td style="font-weight:600;color:var(--text)">${d.total}</td>
        <td style="font-weight:700;color:#00D98B">${d.present}</td>
        <td><span style="font-family:'Sora',sans-serif;font-weight:800;font-size:1.05rem;color:#E84C6B">${d.percentage}%</span></td>
        <td><span class="bdg bdg-red">Need ${sf} more classes</span></td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" style="text-align:center;padding:36px;color:#00D98B;font-weight:700">✓ No defaulters — All students are above 75%!</td></tr>`;
  } catch (err) { toast("Failed to load defaulters: " + err.message, "e"); }
}

async function expDef() {
  try {
    const defs = await api("/defaulters");
    const lines = [["Name","Email","Course","Total","Present","Attendance%"]];
    defs.forEach(d => lines.push([d.studentName, d.email, d.courseName, d.total, d.present, d.percentage+"%"]));
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.map(l=>l.join(",")).join("\n"));
    a.download = "defaulters.csv"; a.click();
    toast("Defaulters list exported", "s");
  } catch (err) { toast(err.message, "e"); }
}

// ════════════════════════════════════════════════════════
//  ANALYTICS — GET /api/analytics
// ════════════════════════════════════════════════════════
let bC, pC, dC;
async function renderAna() {
  try {
    const data = await api("/analytics");

    const labels = (data.courses || []).map(c => c.courseCode);
    const avgs   = (data.courses || []).map(c => c.averagePercentage);

    if (bC) bC.destroy();
    bC = new Chart(document.getElementById("bChart"), {
      type: "bar",
      data: { labels, datasets: [{ data: avgs,
        backgroundColor: avgs.map(v => v>=75 ? "rgba(0,217,139,.8)" : v>=50 ? "rgba(245,166,35,.8)" : "rgba(232,76,107,.8)"),
        borderRadius: 8, borderSkipped: false }] },
      options: { responsive:true, plugins:{legend:{display:false}},
        scales:{ y:{min:0,max:100,grid:{color:"rgba(99,102,241,.08)"},ticks:{color:"#4B5563",font:{size:11}}},
                 x:{grid:{display:false},ticks:{color:"#4B5563",font:{size:11}}} } },
    });

    if (pC) pC.destroy();
    pC = new Chart(document.getElementById("pChart"), {
      type: "doughnut",
      data: { labels:["Present","Absent"], datasets:[{ data:[data.presentCount, data.absentCount],
        backgroundColor:["rgba(0,217,139,.85)","rgba(232,76,107,.85)"], borderColor:"#FFFFFF", borderWidth:4, hoverOffset:8 }] },
      options: { responsive:true, cutout:"68%", plugins:{legend:{labels:{color:"#4B5563",font:{size:12}}}} },
    });

    const dist = data.distribution || {};
    const distData = [dist["0_49"]||0, dist["50_74"]||0, dist["75_89"]||0, dist["90_100"]||0];
    if (dC) dC.destroy();
    dC = new Chart(document.getElementById("dChart"), {
      type: "bar",
      data: { labels:["0-49%","50-74%","75-89%","90-100%"], datasets:[{ data: distData,
        backgroundColor:["rgba(232,76,107,.8)","rgba(245,166,35,.8)","rgba(0,217,139,.7)","rgba(0,217,139,.9)"],
        borderRadius:6, borderSkipped:false }] },
      options: { responsive:true, plugins:{legend:{display:false}},
        scales:{ y:{grid:{color:"rgba(99,102,241,.08)"},ticks:{color:"#4B5563",font:{size:11}}},
                 x:{grid:{display:false},ticks:{color:"#4B5563",font:{size:10}}} } },
    });
  } catch (err) { toast("Analytics failed: " + err.message, "e"); }
}

// ════════════════════════════════════════════════════════
//  STUDENT PORTAL
// ════════════════════════════════════════════════════════
async function renderMyAtt() {
  if (!currentUser) return;
  try {
    const st = await api(`/dashboard/student/${currentUser.id}`);

    document.getElementById("stuKpiRow").innerHTML = `
      <div class="kpi ${st.percentage>=75?"kpi-green":st.percentage>=50?"kpi-amber":"kpi-red"}">
        <div class="kpi-glow"></div>
        <div class="kpi-label">My Attendance %</div>
        <div class="kpi-value">${st.percentage}%</div>
        <div class="kpi-sub">${st.present} of ${st.total} classes</div>
        <div class="kpi-icon">${st.percentage>=75?"✅":st.percentage>=50?"⚠️":"🚨"}</div>
      </div>
      <div class="kpi kpi-blue">
        <div class="kpi-glow"></div>
        <div class="kpi-label">Classes Attended</div>
        <div class="kpi-value">${st.present}</div>
        <div class="kpi-sub">out of ${st.total} total</div>
        <div class="kpi-icon">🎯</div>
      </div>
      <div class="kpi kpi-red">
        <div class="kpi-glow"></div>
        <div class="kpi-label">Classes Missed</div>
        <div class="kpi-value">${st.absent}</div>
        <div class="kpi-sub">Absent days</div>
        <div class="kpi-icon">📅</div>
      </div>
      <div class="kpi ${st.defaulter?"kpi-red":"kpi-green"}">
        <div class="kpi-glow"></div>
        <div class="kpi-label">Status</div>
        <div class="kpi-value" style="font-size:1.2rem">${st.defaulter?"Defaulter":st.total===0?"New":"Regular"}</div>
        <div class="kpi-sub">${st.defaulter?"Below 75% — action needed":st.total===0?"No classes recorded yet":"Above 75% threshold"}</div>
        <div class="kpi-icon">${st.defaulter?"⚠️":"✓"}</div>
      </div>`;

    if (st.defaulter) {
      document.getElementById("stuAttCards").innerHTML = `
        <div class="alert-banner alert-red" style="margin-bottom:16px">
          <span class="ab-icon">🚨</span>
          <div>
            <strong>Defaulter Warning</strong>
            <p>Your attendance is <strong style="color:#E84C6B">${st.percentage}%</strong> — below the required 75%.
            You need to attend <strong>${Math.ceil(0.75*st.total - st.present)} more classes</strong> to reach the threshold.</p>
          </div>
        </div>`;
    } else {
      document.getElementById("stuAttCards").innerHTML = `
        <div class="stu-att-card">
          <div class="stu-att-card-head">
            <div class="course-pill">${st.courseCode}</div>
            <div class="stu-att-course-name">${st.courseName}</div>
            <div class="stu-att-pct" style="color:${pClr(st.percentage)}">${st.percentage}%</div>
          </div>
          <div class="prog-bar-wrap" style="height:8px">
            <div class="prog-bar ${pCls(st.percentage)}" style="width:${st.percentage}%;height:8px"></div>
          </div>
          <div class="stu-att-grid">
            <div class="stu-att-stat"><div class="stu-att-stat-val" style="color:#00D98B">${st.present}</div><div class="stu-att-stat-lbl">Present</div></div>
            <div class="stu-att-stat"><div class="stu-att-stat-val" style="color:#E84C6B">${st.absent}</div><div class="stu-att-stat-lbl">Absent</div></div>
            <div class="stu-att-stat"><div class="stu-att-stat-val">${st.total}</div><div class="stu-att-stat-lbl">Total</div></div>
          </div>
        </div>`;
    }

    // Attendance log
    const records = await api(`/attendance/student/${currentUser.id}`);
    document.getElementById("stuAttLog").innerHTML = records.map(r => `
      <tr>
        <td><span class="course-pill">${r.courseId}</span></td>
        <td style="color:var(--text2);font-size:.82rem">${r.date}</td>
        <td><span class="bdg ${r.status==="PRESENT"?"bdg-green":"bdg-red"}">${r.status}</span></td>
      </tr>`).join("") ||
      `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text3)">No attendance records yet</td></tr>`;
  } catch (err) { toast("Failed to load attendance: " + err.message, "e"); }
}

async function renderMyProfile() {
  if (!currentUser) return;
  try {
    const st = await api(`/dashboard/student/${currentUser.id}`);
    document.getElementById("stuProfile").innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar" style="background:${avaColor(currentUser.name)}">${initials(currentUser.name)}</div>
        <div class="profile-name">${currentUser.name}</div>
        <div class="profile-roll">${currentUser.roll}</div>
        <div class="profile-fields">
          <div class="pf-row"><span class="pf-lbl">Roll Number</span><span class="pf-val">${currentUser.roll}</span></div>
          <div class="pf-row"><span class="pf-lbl">Email</span><span class="pf-val">${currentUser.email}</span></div>
          <div class="pf-row"><span class="pf-lbl">Course</span><span class="pf-val">${st.courseName}</span></div>
          <div class="pf-row"><span class="pf-lbl">Course Code</span><span class="pf-val"><span class="course-pill">${st.courseCode}</span></span></div>
          <div class="pf-row"><span class="pf-lbl">Attendance %</span><span class="pf-val" style="color:${pClr(st.percentage)};font-family:'Sora',sans-serif;font-weight:800">${st.percentage}%</span></div>
          <div class="pf-row"><span class="pf-lbl">Status</span><span class="pf-val">${st.defaulter?'<span class="bdg bdg-red">⚠ Defaulter</span>':st.total===0?'<span class="bdg bdg-amber">🆕 New Student</span>':'<span class="bdg bdg-green">✓ Regular</span>'}</span></div>
          <div class="pf-row"><span class="pf-lbl">Portal</span><span class="pf-val"><span class="bdg bdg-blue">Student</span></span></div>
        </div>
      </div>`;
  } catch (err) { toast("Failed to load profile: " + err.message, "e"); }
}

// ── NOTIFICATIONS ─────────────────────────────────────
async function openNP() {
  document.getElementById("npanel").classList.add("open");
  try {
    const url = currentPortal === "teacher"
      ? "/notifications/teacher"
      : `/notifications/student/${currentUser.id}`;
    const ns = await api(url);
    document.getElementById("npList").innerHTML = ns.map(n => `
      <div class="notif-item">
        <div class="notif-item-title">
          <div class="notif-dot" style="background:${n.type==="alert"?"#E84C6B":"#4D9EFF"}"></div>
          <span style="color:${n.type==="alert"?"#E84C6B":"var(--text)"}">${n.title}</span>
        </div>
        <div class="notif-item-body">${n.body}</div>
      </div>`).join("");
    const nb = document.getElementById("notifBadge");
    if (nb) nb.textContent = ns.filter(n => n.type==="alert").length || ns.length;
  } catch(_) {}
}
function closeNP() { document.getElementById("npanel").classList.remove("open"); }

// ── MODALS ────────────────────────────────────────────
function openM(id)  { document.getElementById(id).classList.add("open"); }
function closeM(id) { document.getElementById(id).classList.remove("open"); }
function openConf(msg, cb) {
  document.getElementById("confMsg").textContent = msg;
  confCb = cb;
  openM("mConf");
}
function doConf() { if (confCb) confCb(); closeM("mConf"); confCb = null; }
document.querySelectorAll(".modal-overlay").forEach(o =>
  o.addEventListener("click", e => { if (e.target === o) closeM(o.id); })
);

// ── TOAST ─────────────────────────────────────────────
function toast(msg, type = "i") {
  const dock = document.getElementById("toastDock");
  const t = document.createElement("div");
  t.className = `toast t${type}`;
  t.innerHTML = `<span style="font-size:.9rem">${{s:"✅",e:"❌",i:"ℹ️",w:"⚠️"}[type]||"•"}</span><span>${msg}</span>`;
  dock.appendChild(t);
  setTimeout(() => {
    t.style.transition = "all .3s";
    t.style.opacity = "0";
    t.style.transform = "translateX(22px)";
    setTimeout(() => t.remove(), 320);
  }, 4000);
}

// ── CHART.JS DEFAULTS ─────────────────────────────────
Chart.defaults.color = "#4B5563";
Chart.defaults.font.family = "'Outfit',sans-serif";

// ── KEYBOARD SHORTCUTS ────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach(m => closeM(m.id));
    closeNP();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    if (document.getElementById("page-attendance")?.classList.contains("active")) saveAtt();
  }
});

// ── CLEAR ERRORS ON INPUT ─────────────────────────────
document.addEventListener("input", e => {
  if (e.target.classList.contains("fi")) e.target.classList.remove("fi-error");
});
