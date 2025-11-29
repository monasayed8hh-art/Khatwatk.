// pages/index.js (أو المكون الذي يمثل الصفحة الرئيسية للزوار)

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router'; // إذا كنت تستخدم Next.js
// إذا كنت تستخدم React Router، استبدلها بـ 'import { useNavigate } from "react-router-dom";'

// تأكد من المسار الصحيح لاستيراد المصادقة
import { auth } from '../utils/firebaseConfig'; 

const HomePage = () => {
    const router = useRouter(); 
    // const navigate = useNavigate(); // إذا كنت تستخدم React Router
    
    // حالة لتحميل بيانات المستخدم، لمنع ظهور المحتوى الرئيسي للحظة
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // الاستماع لتغيير حالة المصادقة
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // المستخدم مسجل دخوله، يتم تحويله فوراً
                console.log("User is logged in, redirecting...");
                // **قم بتغيير '/materials' إلى المسار الفعلي لصفحة المواد لديك**
                router.replace('/materials'); 
                // navigate('/materials', { replace: true }); // إذا كنت تستخدم React Router
            } else {
                // لا يوجد مستخدم، يمكنه رؤية الصفحة الرئيسية
                setIsLoading(false);
            }
        });

        return () => unsubscribe(); // تنظيف عند إغلاق المكون
    }, []);

    if (isLoading) {
        // عرض شاشة تحميل بسيطة أثناء فحص حالة المصادقة
        return <div style={{ textAlign: 'center', padding: '100px' }}>جاري التحقق من حالة الدخول...</div>;
    }

    return (
        // هذا هو محتوى الصفحة الرئيسية الذي يظهر فقط للزوار
        <div>
            <h1>مرحباً بك في منصة خطوتك التعليمية!</h1>
            <p>سجل دخولك بالكود للاطلاع على المواد.</p>
            {/* هنا تضع رابط أو زر الانتقال لصفحة تسجيل الدخول */}
            {/* مثال: <Link href="/login">تسجيل الدخول بالكود</Link> */}
        </div>
    );
};

export default HomePage;
