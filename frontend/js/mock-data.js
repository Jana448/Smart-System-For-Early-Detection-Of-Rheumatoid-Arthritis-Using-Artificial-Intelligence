// ====================================
// Mock Data - بيانات تجريبية للتطوير
// ====================================
// هذا الملف يحتوي على بيانات تجريبية لاستخدامها أثناء تطوير Frontend
// سيتم استبدالها بـ API حقيقي لاحقاً

const MockData = {
    // بيانات المرضى
    patients: [
        {
            id: 'P001',
            name: 'أحمد محمد علي',
            age: 45,
            gender: 'ذكر',
            phone: '0501234567',
            email: 'ahmed@example.com',
            registrationDate: '2024-01-15',
            riskLevel: 'high',
            lastVisit: '2024-10-20',
            status: 'active',
            medicalHistory: {
                chronicDiseases: ['ضغط الدم', 'السكري'],
                allergies: ['البنسلين'],
                familyHistory: 'تاريخ عائلي للروماتويد'
            },
            labResults: {
                rf: 85,
                antiCCP: 120,
                esr: 45,
                crp: 25,
                date: '2024-10-15'
            }
        },
        {
            id: 'P002',
            name: 'فاطمة حسن',
            age: 38,
            gender: 'أنثى',
            phone: '0509876543',
            email: 'fatima@example.com',
            registrationDate: '2024-02-20',
            riskLevel: 'medium',
            lastVisit: '2024-10-18',
            status: 'active',
            medicalHistory: {
                chronicDiseases: [],
                allergies: [],
                familyHistory: 'لا يوجد'
            },
            labResults: {
                rf: 45,
                antiCCP: 60,
                esr: 28,
                crp: 15,
                date: '2024-10-10'
            }
        },
        {
            id: 'P003',
            name: 'خالد عبدالله',
            age: 52,
            gender: 'ذكر',
            phone: '0551234567',
            email: 'khaled@example.com',
            registrationDate: '2024-03-10',
            riskLevel: 'low',
            lastVisit: '2024-10-15',
            status: 'active',
            medicalHistory: {
                chronicDiseases: ['ضغط الدم'],
                allergies: [],
                familyHistory: 'لا يوجد'
            },
            labResults: {
                rf: 15,
                antiCCP: 20,
                esr: 12,
                crp: 5,
                date: '2024-10-05'
            }
        },
        {
            id: 'P004',
            name: 'مريم سعيد',
            age: 41,
            gender: 'أنثى',
            phone: '0567891234',
            email: 'mariam@example.com',
            registrationDate: '2024-04-05',
            riskLevel: 'high',
            lastVisit: '2024-10-22',
            status: 'active',
            medicalHistory: {
                chronicDiseases: [],
                allergies: ['الأسبرين'],
                familyHistory: 'تاريخ عائلي للروماتويد'
            },
            labResults: {
                rf: 95,
                antiCCP: 140,
                esr: 52,
                crp: 30,
                date: '2024-10-18'
            }
        },
        {
            id: 'P005',
            name: 'عمر يوسف',
            age: 35,
            gender: 'ذكر',
            phone: '0543216789',
            email: 'omar@example.com',
            registrationDate: '2024-05-12',
            riskLevel: 'medium',
            lastVisit: '2024-10-19',
            status: 'active',
            medicalHistory: {
                chronicDiseases: [],
                allergies: [],
                familyHistory: 'لا يوجد'
            },
            labResults: {
                rf: 55,
                antiCCP: 70,
                esr: 32,
                crp: 18,
                date: '2024-10-12'
            }
        }
    ],

    // الإحصائيات
    statistics: {
        totalPatients: 5,
        highRiskPatients: 2,
        newPatientsThisMonth: 1,
        pendingAnalysis: 3,
        monthlyGrowth: 12,
        riskDistribution: {
            high: 40,
            medium: 40,
            low: 20
        }
    },

    // التنبيهات
    notifications: [
        {
            id: 'N001',
            type: 'warning',
            title: 'مريض يحتاج متابعة',
            message: 'المريض أحمد محمد علي - نتائج تحليل مرتفعة',
            date: '2024-10-28T10:30:00',
            read: false,
            patientId: 'P001'
        },
        {
            id: 'N002',
            type: 'info',
            title: 'موعد قادم',
            message: 'موعد المريضة مريم سعيد غداً الساعة 10:00 صباحاً',
            date: '2024-10-28T09:00:00',
            read: false,
            patientId: 'P004'
        },
        {
            id: 'N003',
            type: 'success',
            title: 'تحليل مكتمل',
            message: 'اكتمل تحليل الصور الطبية للمريض خالد عبدالله',
            date: '2024-10-27T15:45:00',
            read: true,
            patientId: 'P003'
        }
    ],

    // بيانات الرسوم البيانية
    chartData: {
        monthlyPatients: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            data: [12, 15, 18, 22, 28, 32]
        },
        riskDistribution: {
            labels: ['خطر عالي', 'خطر متوسط', 'خطر منخفض'],
            data: [40, 40, 20],
            colors: ['#ef4444', '#f59e0b', '#10b981']
        },
        labTrends: {
            labels: ['أسبوع 1', 'أسبوع 2', 'أسبوع 3', 'أسبوع 4'],
            rf: [65, 70, 68, 72],
            antiCCP: [80, 85, 82, 88],
            esr: [35, 38, 36, 40]
        }
    }
};

// ====================================
// Mock API Functions
// ====================================

class MockAPI {
    // محاكاة تأخير الشبكة
    static async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // الحصول على جميع المرضى
    static async getAllPatients() {
        await this.delay();
        return {
            success: true,
            data: MockData.patients,
            count: MockData.patients.length
        };
    }

    // الحصول على مريض بواسطة ID
    static async getPatientById(id) {
        await this.delay();
        const patient = MockData.patients.find(p => p.id === id);
        if (patient) {
            return { success: true, data: patient };
        }
        return { success: false, error: 'المريض غير موجود' };
    }

    // إضافة مريض جديد
    static async addPatient(patientData) {
        await this.delay();
        const newPatient = {
            id: `P${String(MockData.patients.length + 1).padStart(3, '0')}`,
            ...patientData,
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'active',
            riskLevel: 'medium'
        };
        MockData.patients.push(newPatient);
        MockData.statistics.totalPatients++;
        return { success: true, data: newPatient };
    }

    // تحديث بيانات مريض
    static async updatePatient(id, updates) {
        await this.delay();
        const index = MockData.patients.findIndex(p => p.id === id);
        if (index !== -1) {
            MockData.patients[index] = { ...MockData.patients[index], ...updates };
            return { success: true, data: MockData.patients[index] };
        }
        return { success: false, error: 'المريض غير موجود' };
    }

    // حذف مريض
    static async deletePatient(id) {
        await this.delay();
        const index = MockData.patients.findIndex(p => p.id === id);
        if (index !== -1) {
            MockData.patients.splice(index, 1);
            MockData.statistics.totalPatients--;
            return { success: true, message: 'تم حذف المريض بنجاح' };
        }
        return { success: false, error: 'المريض غير موجود' };
    }

    // الحصول على الإحصائيات
    static async getStatistics() {
        await this.delay();
        return { success: true, data: MockData.statistics };
    }

    // الحصول على التنبيهات
    static async getNotifications() {
        await this.delay();
        return { success: true, data: MockData.notifications };
    }

    // تحديث حالة التنبيه
    static async markNotificationAsRead(id) {
        await this.delay();
        const notification = MockData.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            return { success: true };
        }
        return { success: false, error: 'التنبيه غير موجود' };
    }

    // الحصول على بيانات الرسوم البيانية
    static async getChartData() {
        await this.delay();
        return { success: true, data: MockData.chartData };
    }

    // البحث عن المرضى
    static async searchPatients(query) {
        await this.delay();
        const results = MockData.patients.filter(p => 
            p.name.includes(query) || 
            p.id.includes(query) ||
            p.phone.includes(query)
        );
        return { success: true, data: results, count: results.length };
    }

    // تصفية المرضى حسب مستوى الخطر
    static async filterPatientsByRisk(riskLevel) {
        await this.delay();
        const results = MockData.patients.filter(p => p.riskLevel === riskLevel);
        return { success: true, data: results, count: results.length };
    }
}

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MockData, MockAPI };
}
