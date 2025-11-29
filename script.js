// ==========================================================
// 1. بيانات التطبيق
// ==========================================================
const SUPER_ADMIN_CODE = "0112838183800"; // الكود الجديد للمشرف
const subjectsDB = {
    arabic: { name: "لغة عربية", icon: "fas fa-language", image: "images (1).jpeg", teachers: ["محمد صلاح","رضا الفاروق"] },
    english: { name: "لغة إنجليزية", icon: "fas fa-globe", image: "4a228f61e5d68443a9ddd56e6cc39ef6d.jpg", teachers: ["ميس مي مجدي","انجلشاوي","عبدالحميد حامد","شريف المصري","وائل ميلاد","عبقري اللغة"] },
    math: { name: "رياضيات", icon: "fas fa-calculator", image: "3e2863389ead3a7805e35e40cb3a3c79.jpg", teachers: ["أحمد عصام","لطفي زهران"] },
    biology: { name: "أحياء", icon: "fas fa-dna", image: "295156.jpg", teachers: ["أحمد الجوهري","محمد أيمن","جيو ماجد","سامح أحمد","أحمد رضوان"] },
    physics: { name: "فيزياء", icon: "fas fa-atom", image: "182cab24fa011264cc32e446d507b617.jpg", teachers: ["محمد عبدالمعبود","حسام خليل","كيرلس","محمود مجدي"] },
    chemistry: { name: "كيمياء", icon: "fas fa-flask", image: "77-1-1024x1024.jpg", teachers: ["محمد عبدالجواد","خالد صقر","عبدالله حبشي","عمرو الصيفي","جون جهب"] }
};
const teacherCoursesDB = {
    "محمد صلاح": { "نوفمبر 2025": { "الأسبوع الأول (النحو)":"https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    "أحمد عصام": { "نوفمبر 2025": { "الأسبوع الأول (التفاضل)":"https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    "ميس مي مجدي": { "نوفمبر 2025": { "Week 1 - Unit 1":"https://www.youtube.com/embed/dQw4w9WgXcQ" } }
};
let generatedCodesList = JSON.parse(localStorage.getItem('khatwatak_codes_db')) || [];
let currentUserSession = JSON.parse(localStorage.getItem('khatwatak_active_session'));
let studentProgress = JSON.parse(localStorage.getItem('khatwatak_student_progress')) || {}; 

// ==========================================================
// 2. وظائف عامة
// ==========================================================
function generateStars() {
    const starContainer = document.getElementById('star-container');
    if (!starContainer) return;
    for(let i=0;i<50;i++){
        const star=document.createElement('div');
        star.className='star';
        star.style.width=star.style.height=(Math.random()*3+1)+'px';
        star.style.left=(Math.random()*100)+'%';
        star.style.top=(Math.random()*100)+'%';
        star.style.animationDuration=(Math.random()*5+3)+'s';
        star.style.animationDelay=(Math.random()*5)+'s';
        starContainer.appendChild(star);
    }
}
window.showView=function(viewId){
    document.querySelectorAll('.view-section').forEach(s=>s.classList.remove('active'));
    const target=document.getElementById(viewId);
    if(target) target.classList.add('active');
}

// ==========================================================
// 3. تسجيل الدخول
// ==========================================================
window.attemptLogin=function(){
    const code=document.getElementById('access-code-input').value.trim();
    if(code===SUPER_ADMIN_CODE){
        showView('admin-panel-view');
        initAdminPage();
        return;
    }
    const studentData=generatedCodesList.find(s=>s.code===code);
    if(studentData){
        const now=Date.now();
        if(now>studentData.expiryTimestamp){ alert("⛔ انتهت صلاحية الكود"); return; }
        if(!studentData.start){ studentData.start=now; localStorage.setItem('khatwatak_codes_db', JSON.stringify(generatedCodesList)); }
        localStorage.setItem('khatwatak_active_session', JSON.stringify(studentData));
        currentUserSession=studentData;
        showView('student-dashboard-view');
        loadStudentDataIntoDashboard();
    }else{ alert("❌ الكود غير صحيح!"); }
}

// ==========================================================
// 4. لوحة الطالب
// ==========================================================
function getGreeting(){ const h=new Date().getHours(); if(h>=4&&h<12)return"صباح الخير ☀️!"; if(h>=12&&h<17)return"مساء الخير 👋!"; if(h>=17&&h<22)return"مرحباً بك!"; return"وقت متأخر، بالتوفيق!"; }
function calculateAndRenderProgress(){
    const code=currentUserSession.code;
    const stream=currentUserSession.stream;
    const availableSubjects=Object.keys(subjectsDB).filter(s=>!(stream==='science'&&s==='math')&&!(stream==='math'&&s==='biology'));
    const totalSubjects=availableSubjects.length;
    const exploredSubjects=Object.keys(studentProgress[code]||{});
    const progress=Math.min(100,Math.round(new Set(exploredSubjects).size/totalSubjects*100));
    document.getElementById('progress-percentage').innerText=progress+'%';
    document.getElementById('academic-progress-bar').style.width=progress+'%';
}
function loadStudentDataIntoDashboard(){
    if(!currentUserSession){ showView('login-view'); return; }
    document.getElementById('student-name-display').innerText=currentUserSession.name;
    document.getElementById('student-stream-display').innerText=currentUserSession.stream==='science'?'علمي علوم':'علمي رياضة';
    document.getElementById('student-code-display').innerText=currentUserSession.code;
    document.getElementById('expiry-date-display').innerText=new Date(currentUserSession.expiryTimestamp).toLocaleDateString('ar-EG');
    document.getElementById('dynamic-greeting').innerHTML=getGreeting()+' <strong>'+currentUserSession.name+'</strong>';
    if(!studentProgress[currentUserSession.code]) studentProgress[currentUserSession.code]={};
    calculateAndRenderProgress();
    const grid=document.getElementById('subjects-grid');
    grid.innerHTML='';
    for(const [key,data] of Object.entries(subjectsDB)){
        if(currentUserSession.stream==='science'&&key==='math')continue;
        if(currentUserSession.stream==='math'&&key==='biology')continue;
        const card=document.createElement('div');
        card.className='subject-card';
        card.innerHTML=`<img src="${data.image}" alt=""><h3>${data.name}</h3>`;
        card.onclick=()=>loadTeachersForSubject(key);
        grid.appendChild(card);
    }
}
window.loadTeachersForSubject=function(key){
    const code=currentUserSession.code;
    studentProgress[code][key]=true;
    localStorage.setItem('khatwatak_student_progress', JSON.stringify(studentProgress));
    calculateAndRenderProgress();
    const data=subjectsDB[key];
    document.getElementById('selected-subject-header').innerHTML=`<i class="${data.icon}"></i> ${data.name}`;
    const grid=document.getElementById('teachers-grid'); grid.innerHTML='';
    data.teachers.forEach(t=>{
        const card=document.createElement('div');
        card.className='teacher-card';
        card.innerHTML=`<i class="fas fa-chalkboard-user"></i> ${t}`;
        card.onclick=()=>loadCoursesForTeacher(t);
        grid.appendChild(card);
    });
    showView('teachers-view');
}
window.loadCoursesForTeacher=function(teacherName){
    document.getElementById('selected-teacher-header').innerText='كورسات '+teacherName;
    const data=teacherCoursesDB[teacherName];
    const flex=document.querySelector('#courses-view .courses-flex'); flex.innerHTML='';
    if(data){ let colors=['#1abc9c','#3498db','#f1c40f','#e74c3c']; let i=0; Object.entries(data).forEach(([month,weeks])=>{
        const card=document.createElement('div');
        card.className='month-card';
        card.style.background=colors[i%colors.length]; card.innerText=month;
        card.onclick=()=>loadWeeksForMonth(teacherName,month,weeks);
        flex.appendChild(card); i++;
    }); } else flex.innerHTML='<p style="text-align:center;color:red">لا توجد كورسات</p>';
    showView('courses-view');
}
window.loadWeeksForMonth=function(teacherName,month,weeks){
    document.getElementById('selected-week-header').innerHTML=`${teacherName} - ${month}`;
    const grid=document.getElementById('weeks-grid'); grid.innerHTML='';
    let colors=['#007bff','#ffc107','#17a2b8','#28a745']; let i=0;
    Object.entries(weeks).forEach(([week,link])=>{
        const card=document.createElement('div');
        card.className='week-card subject-card';
        card.style.background=colors[i%colors.length];
        card.innerHTML=`<i class="fas fa-video"></i><h3>${week}</h3>`;
        card.onclick=()=>openVideoModal(link,`${teacherName} - ${month} - ${week}`);
        grid.appendChild(card); i++;
    });
    showView('weeks-view');
}

// ==========================================================
// 5. فيديو Modal
// ==========================================================
window.openVideoModal=function(link,title){
    const modal=document.getElementById('video-modal');
    const iframe=document.getElementById('video-iframe');
    document.getElementById('modal-video-title').innerText=title;
    iframe.src=link; modal.classList.add('active'); document.body.style.overflow='hidden';
}
window.closeVideoModal=function(){
    const modal=document.getElementById('video-modal');
    document.getElementById('video-iframe').src='';
    modal.classList.remove('active'); document.body.style.overflow='auto';
}

// ==========================================================
// 6. لوحة المشرف
// ==========================================================
window.generateNewCode=function(){
    const name=document.getElementById('new-student-name').value;
    const stream=document.getElementById('new-student-stream').value;
    const hours=parseInt(document.getElementById('new-code-duration').value);
    if(!name){ alert("⚠️ اكتب اسم الطالب"); return; }
    const code=Math.floor(100000+Math.random()*900000).toString();
    const now=Date.now();
    const expiry=now+(hours*3600*1000);
    const student={name:name,code:code,stream:stream,start:null,expiryTimestamp:expiry};
    generatedCodesList.push(student);
    localStorage.setItem('khatwatak_codes_db', JSON.stringify(generatedCodesList));
    alert(`✅ الكود تم إنشاؤه: ${code} للطالب ${name}`);
    document.getElementById('new-student-name').value='';
    renderAdminTable();
}
function renderAdminTable(){
    const tbody=document.getElementById('codes-table-body'); tbody.innerHTML='';
    const now=Date.now();
    generatedCodesList.forEach(s=>{
        const status=now>s.expiryTimestamp?'<span class="expired">منتهي</span>':'<span style="color:green">نشط</span>';
        const streamName=s.stream==='science'?'علمي علوم':'علمي رياضة';
        tbody.innerHTML+=`<tr><td>${s.name}</td><td class="code-cell">${s.code}</td><td>${streamName}</td><td>${new Date(s.expiryTimestamp).toLocaleString('ar-EG')}</td><td>${status}</td></tr>`;
    });
}
function initAdminPage(){ renderAdminTable(); }

// ==========================================================
// 7. التهيئة
// ==========================================================
window.logoutUser=function(){ localStorage.removeItem('khatwatak_active_session'); showView('login-view'); }
window.initApp=function(){ generateStars(); if(currentUserSession) loadStudentDataIntoDashboard(); else showView('login-view'); }
window.onload=initApp;
