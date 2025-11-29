// pages/login.js (أو المكون الذي يحتوي على نموذج تسجيل الدخول)

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { useRouter } from 'next/router'; // أو navigate

// تأكد من المسار الصحيح لاستيراد المصادقة وخاصية الحفظ
import { auth, setPersistence, browserLocalPersistence } from '../utils/firebaseConfig'; 

const LoginPage = () => {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState(''); // قد تحتاج هذا إذا كان الكود يتحول إلى إيميل
    const [password, setPassword] = useState(''); // وقد تحتاج هذا إذا كان الكود يتحول إلى كلمة سر

    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        // **الخطوة الأولى: تفعيل خاصية حفظ الجلسة (Keep Me Logged In)**
        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (error) {
            console.error("Failed to set persistence:", error);
            alert("حدث خطأ أثناء إعداد خاصية حفظ الدخول.");
            return;
        }

        // **الخطوة الثانية: تنفيذ عملية تسجيل الدخول**
        try {
            // **ملاحظة هامة:** // يجب عليك استبدال هذا السطر بمنطقك الفعلي الذي يحول "الكود" إلى
            // إيميل وكلمة سر صالحة لـ Firebase Authentication.
            // هنا نفترض أن لديك الإيميل والباسورد جاهزين:
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // **الخطوة الثالثة: التحويل بعد النجاح**
            if (userCredential.user) {
                alert('تم تسجيل الدخول بنجاح! يتم التحويل لصفحة المواد.');
                // **قم بتغيير '/materials' إلى المسار الفعلي لصفحة المواد لديك**
                router.replace('/materials'); 
            }

        } catch (error) {
            console.error("Login failed:", error);
            alert('فشل تسجيل الدخول: الكود غير صحيح أو خطأ في النظام.');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>تسجيل الدخول بالكود</h2>
            {/* حقل إدخال الكود (أو الإيميل/الباسورد) */}
            <input 
                type="text" 
                placeholder="أدخل الكود الخاص بك"
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                required
            />
            {/* إذا كان تسجيل الدخول يعتمد على الإيميل/الباسورد المخزنين مسبقاً */}
            {/* <input type="email" ... />
            <input type="password" ... /> */}

            <button type="submit">دخول</button>
        </form>
    );
};

export default LoginPage;
