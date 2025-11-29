// ==========================================================
// 1. 🗄️ بيانات التطبيق (المواد والمدرسين)
// ==========================================================

const SUPER_ADMIN_CODE = "0112838183800";
let generatedCodesList = [];

const subjectsDB = { 
    arabic: { name: "لغة عربية", icon: "fas fa-language", image: "images (1).jpeg", teachers: ["محمد صلاح", "رضا الفاروق"] },
    english: { name: "لغة إنجليزية", icon: "fas fa-globe", image: "4a228f61e5d68443a9ddd56e6cc39ef6d.jpg", teachers: ["ميس مي مجدي", "انجلشاوي", "عبدالحميد حامد", "شريف المصري", "وائل ميلاد", "عبقري اللغة"] },
    math: { name: "رياضيات", icon: "fas fa-calculator", image: "3e2863389ead3a7805e35e40cb3a3c79.jpg", teachers: ["أحمد عصام", "لطفي زهران"] },
    biology: { name: "أحياء", icon: "fas fa-dna", image: "295156.jpg", teachers: ["أحمد الجوهري", "محمد أيمن", "جيو ماجد", "سامح أحمد", "أحمد رضوان"] },
    physics: { name: "فيزياء", icon: "fas fa-atom", image: "182cab24fa011264cc32e446d507b617.jpg", teachers: ["محمد عبدالمعبود", "حسام خليل", "كيرلس", "محمود مجدي"] },
    chemistry: { name: "كيمياء", icon: "fas fa-flask", image: "77-1-1024x1024.jpg", teachers: ["محمد عبدالجواد", "خالد صقر", "عبدالله حبشي", "عمرو الصيفي", "جون جهب"] }
};

const teacherCoursesDB = {
    "محمد صلاح": { 
        "نوفمبر 2025": {
            "الأسبوع الأول (النحو)": "https://www.youtube.com/embed/dQw4w9WgXcQ", 
            "الأسبوع الثاني (البلاغة)": "https://www.youtube.com/embed/QhA_1J4E47M",
            "الأسبوع الثالث (قراءة)": "https://www.youtube.com/embed/d-g1Gg_U85g",
            "الأسبوع الرابع (امتحان)": "https://www.youtube.com/embed/j1u09k1nBWA"
        }
    },
    "أحمد عصام": { 
        "نوفمبر 2025": {
            "الأسبوع الأول (التفاضل)": "https://www.youtube.com/embed/رابط_رياضة_عصام_نوفمبر_اسبوع1",
            "الأسبوع الثاني (التكامل)": "https://www.youtube.com/embed/رابط_رياضة_عصام_نوفمبر_اسبوع2",
            "الأسبوع الثالث (مراجعة)": "https://www.youtube.com/embed/رابط_رياضة_عصام_نوفمبر_اسبوع3",
            "الأسبوع الرابع (اختبار)": "https://www.youtube.com/embed/رابط_رياضة_عصام_نوفمبر_اسبوع4"
        }
    },
    "ميس مي مجدي": {
        "نوفمبر 2025": {
            "Week 1 - Unit 1": "https://www.youtube.com/embed/رابط_انجليزي_مي_نوفمبر_اسبوع1",
            "Week 2 - Unit 2": "https://www.youtube.com/embed/رابط_انجليزي_مي_نوفمبر_اسبوع2",
            "Week 3 - Grammar": "https://www.youtube.com/embed/رابط_انجليزي_مي_نوفمبر_اسبوع3",
            "Week 4 - Exam": "https://www.youtube.com/embed/رابط_انجليزي_مي_نوفمبر_اسبوع4"
        }
    }
};

let currentUserSession = JSON.parse(localStorage.getItem('khatwatak_active_session'));
let studentProgress = JSON.parse(localStorage.getItem('khatwatak_student_progress')) || {}; 

// ==========================================================
// 2. ⚙️ وظائف عامة
// ==========================================================

function generateStars() {
    const starContainer = document.getElementById('star-container');
    if (!starContainer) return;
    const numStars = 50;
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
        star.style.left = (Math.random() * 100) + '%';
        star.style.top = (Math.random() * 100) + '%';
        star.style.animationDuration = (Math.random() * 5 + 3) + 's';
        star.style.animationDelay = (Math.random() * 5) + 's';
        starContainer.appendChild(star);
    }
}

window.showView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');
    window.scrollTo(0,0);
    const subTitleElement = document.getElementById('sub-title');
    if (subTitleElement) {
        if (viewId.includes('admin')) subTitleElement.innerText = "إدارة الأكواد والطلاب";
        else if (viewId.includes('student')) subTitleElement.innerText = "اكتشف موادك التعليمية";
        else subTitleElement.innerText = "منصتك التعليمية المتكاملة";
    }
};

window.logoutUser = function() {
    localStorage.removeItem('khatwatak_active_session');
    showView('login-view');
};

// ==========================================================
// 3. 🔑 منطق تسجيل الدخول
// ==========================================================

window.attemptLogin = function() {
    const codeInput = document.getElementById('access-code-input').value.trim();
    if (codeInput === SUPER_ADMIN_CODE) {
        showView('admin-panel-view');
        initAdminPage();
        return;
    }
    const studentData = generatedCodesList.find(user => user.code === codeInput);
    if (studentData) {
        const now = new Date().getTime();
        if (now > studentData.expiryTimestamp) alert("⛔ انتهت صلاحية الكود.");
        else {
            if (!studentData.start) studentData.start = now;
            localStorage.setItem('khatwatak_active_session', JSON.stringify(studentData));
            currentUserSession = studentData;
            showView('student-dashboard-view');
            loadStudentDataIntoDashboard();
        }
    } else alert("❌ الكود غير صحيح!");
};

function validateAndLoadSession(code) {
    if (!code) return;
    if (code === SUPER_ADMIN_CODE) { showView('admin-panel-view'); initAdminPage(); return; }
    const studentData = generatedCodesList.find(user => user.code === code);
    if (studentData && new Date().getTime() < studentData.expiryTimestamp) {
        currentUserSession = studentData;
        showView('student-dashboard-view');
        loadStudentDataIntoDashboard();
    } else {
        localStorage.removeItem('khatwatak_active_session');
        showView('login-view');
    }
}

// ==========================================================
// 4. 📚 لوحة الطالب
// ==========================================================

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return "صباح الخير ☀️! يوم دراسي موفق بإذن الله.";
    if (hour >= 12 && hour < 17) return "مساء الخير 👋! وقت مثالي للإنجاز.";
    if (hour >= 17 && hour < 22) return "مرحباً بك! لا تنسى مراجعة مواد اليوم 🌙.";
    return "وقت متأخر، لا بأس ببعض المذاكرة الخفيفة. بالتوفيق!";
}

function calculateAndRenderProgress() {
    const studentCode = currentUserSession.code;
    const stream = currentUserSession.stream;
    const availableSubjects = Object.keys(subjectsDB).filter(key => {
        if (stream==='science' && key==='math') return false;
        if (stream==='math' && key==='biology') return false;
        return true;
    });
    const totalSubjects = availableSubjects.length;
    const exploredSubjects = Object.keys(studentProgress[studentCode]||{});
    const uniqueExploredCount = new Set(exploredSubjects).size;
    const progressPercentage = totalSubjects===0 ? 0 : Math.min(100, Math.round((uniqueExploredCount/totalSubjects)*100));
    document.getElementById('progress-percentage').innerText = `${progressPercentage}%`;
    document.getElementById('academic-progress-bar').style.width = `${progressPercentage}%`;
}

function loadStudentDataIntoDashboard() {
    if (!currentUserSession) { showView('login-view'); return; }
    const streamArabic = currentUserSession.stream==='science'?'علمي علوم 🧬':'علمي رياضة 📐';
    const expiryDateStr = new Date(currentUserSession.expiryTimestamp).toLocaleDateString('ar-EG');
    document.getElementById('student-name-display').innerText = currentUserSession.name||'عزيزي الطالب';
    document.getElementById('student-stream-display').innerText = streamArabic;
    document.getElementById('student-code-display').innerText = currentUserSession.code;
    document.getElementById('expiry-date-display').innerText = expiryDateStr;
    document.getElementById('dynamic-greeting').innerHTML = `${getGreeting()} يا <strong>${currentUserSession.name}</strong>.`;
    if (!studentProgress[currentUserSession.code]) studentProgress[currentUserSession.code]={};
    calculateAndRenderProgress();

    const subjectsGrid = document.getElementById('subjects-grid');
    subjectsGrid.innerHTML='';
    for(const [key, data] of Object.entries(subjectsDB)){
        if(currentUserSession.stream==='science' && key==='math') continue;
        if(currentUserSession.stream==='math' && key==='biology') continue;
        const card=document.createElement('div');
        card.className='subject-card';
        card.innerHTML=`<img src="${data.image}" alt="صورة مادة ${data.name}"><h3>${data.name}</h3>`;
        card.onclick=()=>loadTeachersForSubject(key);
        subjectsGrid.appendChild(card);
    }
}

window.loadTeachersForSubject = function(subjectKey){
    const studentCode = currentUserSession.code;
    studentProgress[studentCode][subjectKey]=true;
    localStorage.setItem('khatwatak_student_progress', JSON.stringify(studentProgress));
    calculateAndRenderProgress();
    const data = subjectsDB[subjectKey];
    document.getElementById('selected-subject-header').innerHTML=`<i class="${data.icon}" style="font-size:2rem;margin-left:10px;"></i> ${data.name}`;
    const teachersGrid=document.getElementById('teachers-grid'); teachersGrid.innerHTML='';
    data.teachers.forEach(name=>{
        const card=document.createElement('div'); card.className='teacher-card';
        card.innerHTML=`<i class="fas fa-chalkboard-user"></i> مستر/ ${name}`;
        card.onclick=()=>loadCoursesForTeacher(name);
        teachersGrid.appendChild(card);
    });
    showView('teachers-view');
}

window.loadCoursesForTeacher=function(name){
    document.getElementById('selected-teacher-header').innerText=`كورسات مستر/ ${name}`;
    const coursesByMonth = teacherCoursesDB[name];
    const coursesFlex = document.querySelector('#courses-view .courses-flex'); coursesFlex.innerHTML='';
    if(coursesByMonth){
        const colors=['linear-gradient(135deg,#1abc9c,#16a085)','linear-gradient(135deg,#3498db,#2980b9)','linear-gradient(135deg,#f1c40f,#f39c12)','linear-gradient(135deg,#e74c3c,#c0392b)'];
        let index=0;
        Object.entries(coursesByMonth).forEach(([month, weeks])=>{
            const card=document.createElement('div'); card.className='month-card';
            card.style.background=colors[index%colors.length]; card.innerText=month;
            card.onclick=()=>loadWeeksForMonth(name, month, weeks); coursesFlex.appendChild(card); index++;
        });
    } else coursesFlex.innerHTML=`<p style="text-align:center;color:#eb4d4b;">لا توجد كورسات لهذا المدرس حالياً.</p>`;
    showView('courses-view');
}

window.loadWeeksForMonth=function(name, month, weeksData){
    document.getElementById('selected-week-header').innerHTML=`<i class="fas fa-calendar-alt"></i> ${name} - ${month}`;
    const weeksGrid=document.getElementById('weeks-grid'); weeksGrid.innerHTML='';
    const colors=['linear-gradient(135deg,#007bff,#0056b3)','linear-gradient(135deg,#ffc107,#d39e00)','linear-gradient(135deg,#17a2b8,#117a8b)','linear-gradient(135deg,#28a745,#1e7e34)'];
    let index=0;
    Object.entries(weeksData).forEach(([week, link])=>{
        const card=document.createElement('div'); card.className='week-card subject-card';
        card.style.background=colors[index%colors.length];
        card.innerHTML=`<i class="fas fa-video" style="font-size:3rem;margin-bottom:10px;"></i><h3>${week}</h3>`;
        card.onclick=()=>openVideoModal(link, `${name} - ${month} - ${week}`);
        weeksGrid.appendChild(card); index++;
    });
    showView('weeks-view');
}

// ==========================================================
// 5. 🎥 الفيديو
// ==========================================================

window.openVideoModal=function(link, title){
    const modal=document.getElementById('video-modal');
    const iframe=document.getElementById('video-iframe');
    const modalTitle=document.getElementById('modal-video-title');
    modalTitle.innerText=title; iframe.src=link; modal.classList.add('active'); document.body.style.overflow='hidden';
}

window.closeVideoModal=function(){
    const modal=document.getElementById('video-modal'); const iframe=document.getElementById('video-iframe');
    iframe.src=''; modal.classList.remove('active'); document.body.style.overflow='auto';
}

// ==========================================================
// 6. 📝 لوحة المشرف
// ==========================================================

window.generateNewCode=function(){
    const name=document.getElementById('new-student-name').value;
    const stream=document.getElementById('new-student-stream').value;
    const hours=parseInt(document.getElementById('new-code-duration').value);
    if(!name){alert("⚠️ يجب كتابة اسم الطالب أولاً"); return;}
    const randomCode=Math.floor(100000 + Math.random()*900000).toString();
    const now=new Date().getTime();
    const expiryTimestamp=now+(hours*60*60*1000);
    const codeDataToCopy=`{\n"name": "${name}",\n"code": "${randomCode}",\n"stream": "${stream}",\n"start": null,\n"expiryTimestamp": ${expiryTimestamp}\n},`;
    alert(`✅ تم توليد الكود للطالب: ${name}\n🔑 الكود: ${randomCode}\n\n🛑 انسخ هذا إلى ملف codes.json:\n${codeDataToCopy}`);
    document.getElementById('new-student-name').value='';
    renderAdminTable();
}

function renderAdminTable(){
    const tbody=document.getElementById('codes-table-body'); if(!tbody) return; tbody.innerHTML='';
    const now=new Date().getTime();
    generatedCodesList.forEach(student=>{
        const tr=document.createElement('tr');
        const streamName=student.stream==='science'?'علمي علوم':'علمي رياضة';
        const expiryDate=new Date(student.expiryTimestamp).toLocaleString('ar-EG');
        const status=now>student.expiryTimestamp?'<span class="expired">منتهي</span>':'<span style="color:green;">نشط</span>';
        tr.innerHTML=`<td>${student.name}</td><td class="code-cell">${student.code}</td><td>${streamName}</td><td>${expiryDate}</td><td>${status}</td>`;
        tbody.appendChild(tr);
    });
}

function initAdminPage(){ renderAdminTable(); }

// ==========================================================
// 7. 🚀 التهيئة
// ==========================================================

window.initApp=function(){
    generateStars();
    fetch('./codes.json')
        .then(res=>res.ok?res.json():Promise.reject('فشل تحميل codes.json'))
        .then(data=>{generatedCodesList=data; validateAndLoadSession(currentUserSession?.code);})
        .catch(err=>{console.error("Error loading codes.json:",err); generatedCodesList=[];});
};
