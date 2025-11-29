// ==========================================================
// 1. 🗄️ بيانات التطبيق (DATA)
// ==========================================================
const SUPER_ADMIN_CODE = "0112838183800"; 

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

// 💾 تحميل البيانات من الذاكرة المحلية (Local Storage)
let generatedCodesList = JSON.parse(localStorage.getItem('khatwatak_codes_db')) || [];
let currentUserSession = JSON.parse(localStorage.getItem('khatwatak_active_session'));
let studentProgress = JSON.parse(localStorage.getItem('khatwatak_student_progress')) || {}; 

// ==========================================================
// 2. ⚙️ وظائف عامة (GLOBAL UTILITIES)
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
    if(target) {
        target.classList.add('active');
        window.scrollTo(0, 0); // للعودة لأعلى الصفحة
    }
}

window.logoutUser=function(){ 
    localStorage.removeItem('khatwatak_active_session'); 
    currentUserSession = null;
    showView('login-view'); 
}

// ==========================================================
// 3. 🔑 تسجيل الدخول (LOGIN LOGIC)
// ==========================================================
window.attemptLogin=function(){
    const code=document.getElementById('access-code-input').value.trim();
    if(code===SUPER_ADMIN_CODE){
        showView('admin-panel-view');
        initAdminPage();
        return;
    }
    
    // البحث في الأكواد المخزنة محلياً
    const studentData=generatedCodesList.find(s=>s.code===code);
    if(studentData){
        const now=Date.now();
        if(now>studentData.expiryTimestamp){ 
            alert("⛔ عذراً، انتهت صلاحية هذا الكود."); 
            return; 
        }
        
        // تحديث وقت البدء إذا لم يكن موجوداً
        if(!studentData.start){ 
            studentData.start=now; 
            localStorage.setItem('khatwatak_codes_db', JSON.stringify(generatedCodesList)); // حفظ التغيير
        }
        
        localStorage.setItem('khatwatak_active_session', JSON.stringify(studentData));
        currentUserSession=studentData;
        showView('student-dashboard-view');
        loadStudentDataIntoDashboard();
    }else{ 
        alert("❌ الكود غير صحيح! تأكد من الرقم."); 
    }
}

// ==========================================================
// 4. 📚 لوحة الطالب (STUDENT DASHBOARD)
// ==========================================================
function getGreeting(){ 
    const h=new Date().getHours(); 
    if(h>=4&&h<12)return"صباح الخير ☀️! يوم دراسي موفق بإذن الله."; 
    if(h>=12&&h<17)return"مساء الخير 👋! وقت مثالي للإنجاز."; 
    if(h>=17&&h<22)return"مرحباً بك! لا تنسى مراجعة مواد اليوم 🌙."; 
    return"وقت متأخر، لا بأس ببعض المذاكرة الخفيفة. بالتوفيق!"; 
}

function calculateAndRenderProgress(){
    if(!currentUserSession) return;
    const code=currentUserSession.code;
    const stream=currentUserSession.stream;
    
    // تحديد المواد المتاحة حسب التخصص
    const availableSubjects=Object.keys(subjectsDB).filter(s=>!(stream==='science'&&s==='math')&&!(stream==='math'&&s==='biology'));
    const totalSubjects=availableSubjects.length;
    const exploredSubjects=Object.keys(studentProgress[code]||{});
    
    const progress=totalSubjects === 0 
        ? 0 
        : Math.min(100,Math.round(new Set(exploredSubjects).size/totalSubjects*100));
        
    document.getElementById('progress-percentage').innerText=`${progress}%`;
    document.getElementById('academic-progress-bar').style.width=`${progress}%`;
}

function loadStudentDataIntoDashboard(){
    if(!currentUserSession){ showView('login-view'); return; }
    
    // عرض بيانات الطالب
    document.getElementById('student-name-display').innerText=currentUserSession.name || 'عزيزي الطالب';
    document.getElementById('student-stream-display').innerText=currentUserSession.stream==='science'?'علمي علوم 🧬':'علمي رياضة 📐';
    document.getElementById('student-code-display').innerText=currentUserSession.code;
    document.getElementById('expiry-date-display').innerText=new Date(currentUserSession.expiryTimestamp).toLocaleDateString('ar-EG');
    document.getElementById('dynamic-greeting').innerHTML=`${getGreeting()} يا <strong>${currentUserSession.name}</strong>`;
    
    // تهيئة سجل التقدم
    if(!studentProgress[currentUserSession.code]) studentProgress[currentUserSession.code]={};
    calculateAndRenderProgress();
    
    // عرض المواد
    const grid=document.getElementById('subjects-grid');
    if(!grid) return;
    grid.innerHTML='';
    for(const [key,data] of Object.entries(subjectsDB)){
        if(currentUserSession.stream==='science'&&key==='math')continue;
        if(currentUserSession.stream==='math'&&key==='biology')continue;
        const card=document.createElement('div');
        card.className='subject-card';
        card.innerHTML=`<img src="${data.image}" alt="صورة مادة ${data.name}"><h3>${data.name}</h3>`;
        card.onclick=()=>loadTeachersForSubject(key);
        grid.appendChild(card);
    }
}

window.loadTeachersForSubject=function(key){
    const code=currentUserSession.code;
    // تسجيل المادة كـ 'مستكشفة'
    studentProgress[code][key]=true;
    localStorage.setItem('khatwatak_student_progress', JSON.stringify(studentProgress));
    calculateAndRenderProgress();
    
    const data=subjectsDB[key];
    document.getElementById('selected-subject-header').innerHTML=`<i class="${data.icon}" style="font-size: 2rem; margin-left: 10px;"></i> ${data.name}`;
    
    const grid=document.getElementById('teachers-grid'); grid.innerHTML='';
    data.teachers.forEach(t=>{
        const card=document.createElement('div');
        card.className='teacher-card';
        card.innerHTML=`<i class="fas fa-chalkboard-user"></i> مستر/ ${t}`;
        card.onclick=()=>loadCoursesForTeacher(t);
        grid.appendChild(card);
    });
    showView('teachers-view');
}

window.loadCoursesForTeacher=function(teacherName){
    document.getElementById('selected-teacher-header').innerText=`كورسات مستر/ ${teacherName}`;
    const data=teacherCoursesDB[teacherName];
    const flex=document.querySelector('#courses-view .courses-flex'); flex.innerHTML='';
    
    if(data){ 
        let colors=['linear-gradient(135deg, #1abc9c, #16a085)','linear-gradient(135deg, #3498db, #2980b9)','linear-gradient(135deg, #f1c40f, #f39c12)','linear-gradient(135deg, #e74c3c, #c0392b)']; 
        let i=0; 
        Object.entries(data).forEach(([month,weeks])=>{
            const card=document.createElement('div');
            card.className='month-card';
            card.style.background=colors[i%colors.length]; card.innerText=month;
            card.onclick=()=>loadWeeksForMonth(teacherName,month,weeks);
            flex.appendChild(card); i++;
        }); 
    } else {
        flex.innerHTML='<p style="text-align:center; color: #eb4d4b;">لا توجد كورسات شهرية متاحة لهذا المدرس حالياً.</p>';
    }
    showView('courses-view');
}

window.loadWeeksForMonth=function(teacherName,month,weeks){
    document.getElementById('selected-week-header').innerHTML=`<i class="fas fa-calendar-alt"></i> ${teacherName} - ${month}`;
    const grid=document.getElementById('weeks-grid'); grid.innerHTML='';
    let colors=['linear-gradient(135deg, #007bff, #0056b3)','linear-gradient(135deg, #ffc107, #d39e00)','linear-gradient(135deg, #17a2b8, #117a8b)','linear-gradient(135deg, #28a745, #1e7e34)']; 
    let i=0;
    Object.entries(weeks).forEach(([week,link])=>{
        const card=document.createElement('div');
        card.className='week-card subject-card';
        card.style.background=colors[i%colors.length];
        card.innerHTML=`<i class="fas fa-video" style="font-size: 3rem; margin-bottom: 10px;"></i><h3>${week}</h3>`;
        card.onclick=()=>openVideoModal(link,`${teacherName} - ${month} - ${week}`);
        grid.appendChild(card); i++;
    });
    showView('weeks-view');
}

// ==========================================================
// 5. 🎥 فيديو Modal
// ==========================================================
window.openVideoModal=function(link,title){
    const modal=document.getElementById('video-modal');
    const iframe=document.getElementById('video-iframe');
    document.getElementById('modal-video-title').innerText=title;
    iframe.src=link; 
    modal.classList.add('active'); 
    document.body.style.overflow='hidden';
}

window.closeVideoModal=function(){
    const modal=document.getElementById('video-modal');
    document.getElementById('video-iframe').src='';
    modal.classList.remove('active'); 
    document.body.style.overflow='auto';
}

// ==========================================================
// 6. 📝 لوحة المشرف (ADMIN PANEL)
// ==========================================================
window.generateNewCode=function(){
    const name=document.getElementById('new-student-name').value;
    const stream=document.getElementById('new-student-stream').value;
    const hours=parseInt(document.getElementById('new-code-duration').value);
    if(!name){ alert("⚠️ يجب كتابة اسم الطالب أولاً"); return; }
    
    // توليد كود عشوائي
    const code=Math.floor(100000+Math.random()*900000).toString();
    const now=Date.now();
    const expiry=now+(hours*3600*1000); // تحويل الساعات إلى مللي ثانية
    
    const student={name:name,code:code,stream:stream,start:null,expiryTimestamp:expiry};
    generatedCodesList.push(student);
    
    // حفظ القائمة المحدثة في الذاكرة المحلية
    localStorage.setItem('khatwatak_codes_db', JSON.stringify(generatedCodesList));
    
    alert(`✅ تم توليد الكود بنجاح للطالب: ${name}\n🔑 الكود هو: ${code}\n\nيجب استخدام هذا الكود للدخول.`);
    
    document.getElementById('new-student-name').value='';
    renderAdminTable();
}

function renderAdminTable(){
    const tbody=document.getElementById('codes-table-body'); 
    if(!tbody) return;
    tbody.innerHTML='';
    const now=Date.now();
    
    generatedCodesList.forEach(s=>{
        const status=now>s.expiryTimestamp?'<span class="expired">منتهي</span>':'<span style="color:green">نشط</span>';
        const streamName=s.stream==='science'?'علمي علوم':'علمي رياضة';
        const expiryDate = new Date(s.expiryTimestamp).toLocaleString('ar-EG');
        
        tbody.innerHTML+=`<tr><td>${s.name}</td><td class="code-cell">${s.code}</td><td>${streamName}</td><td>${expiryDate}</td><td>${status}</td></tr>`;
    });
}

function initAdminPage(){ 
    renderAdminTable(); 
}

// ==========================================================
// 7. 🚀 التهيئة والتشغيل (INITIALIZATION)
// ==========================================================
window.initApp=function(){ 
    generateStars(); 
    if(currentUserSession) {
        // التحقق من صلاحية الجلسة المحفوظة
        const studentData = generatedCodesList.find(s=>s.code===currentUserSession.code);
        if(studentData && Date.now() < studentData.expiryTimestamp) {
            loadStudentDataIntoDashboard(); 
        } else {
            // الجلسة منتهية أو الكود غير موجود
            localStorage.removeItem('khatwatak_active_session');
            currentUserSession = null;
            showView('login-view');
        }
    } else {
        showView('login-view'); 
    }
}

// تشغيل التطبيق عند تحميل الصفحة
window.onload=initApp;
