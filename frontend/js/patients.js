// ===== صفحة المرضى - البحث والفلاتر =====

let allPatients = [];
let filteredPatients = [];

// تحميل جميع المرضى عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تحميل صفحة المرضى...');
    loadAllPatients();
    setupSearchAndFilters();
});

// تحميل جميع المرضى
async function loadAllPatients() {
    try {
        const response = await API.getPatients();
        
        if (response.success && response.data) {
            allPatients = response.data;
            filteredPatients = [...allPatients];
            displayPatients(filteredPatients);
            updateStatistics();
        } else {
            // استخدام البيانات الثابتة إذا لم يكن هناك API
            allPatients = getStaticPatients();
            filteredPatients = [...allPatients];
            displayPatients(filteredPatients);
            updateStatistics();
        }
    } catch (error) {
        console.log('⚠️ استخدام البيانات الثابتة');
        allPatients = getStaticPatients();
        filteredPatients = [...allPatients];
        console.log(`✅ تم تحميل ${allPatients.length} مريض`);
        displayPatients(filteredPatients);
        updateStatistics();
    }
}

// البيانات الثابتة للمرضى
function getStaticPatients() {
    return [
        {
            id: 'P001',
            name: 'أحمد محمد علي',
            age: 45,
            gender: 'ذكر',
            phone: '0501234567',
            riskLevel: 'high',
            lastVisit: '2024-10-20',
            status: 'active'
        },
        {
            id: 'P002',
            name: 'فاطمة حسن',
            age: 38,
            gender: 'أنثى',
            phone: '0509876543',
            riskLevel: 'medium',
            lastVisit: '2024-10-18',
            status: 'active'
        },
        {
            id: 'P003',
            name: 'خالد عبدالله',
            age: 52,
            gender: 'ذكر',
            phone: '0551234567',
            riskLevel: 'low',
            lastVisit: '2024-10-15',
            status: 'active'
        },
        {
            id: 'P004',
            name: 'مريم سعيد',
            age: 41,
            gender: 'أنثى',
            phone: '0567891234',
            riskLevel: 'high',
            lastVisit: '2024-10-22',
            status: 'active'
        },
        {
            id: 'P005',
            name: 'عمر يوسف',
            age: 35,
            gender: 'ذكر',
            phone: '0543216789',
            riskLevel: 'medium',
            lastVisit: '2024-10-19',
            status: 'active'
        },
        {
            id: 'P006',
            name: 'سارة أحمد عبدالعزيز الحربي',
            age: 29,
            gender: 'أنثى',
            phone: '0556789012',
            riskLevel: 'low',
            lastVisit: '2024-10-24',
            status: 'active'
        },
        {
            id: 'P007',
            name: 'محمود إبراهيم خالد الزهراني',
            age: 48,
            gender: 'ذكر',
            phone: '0523456789',
            riskLevel: 'high',
            lastVisit: '2024-10-23',
            status: 'active'
        },
        {
            id: 'P008',
            name: 'نورة سالم عبدالرحمن المطيري',
            age: 33,
            gender: 'أنثى',
            phone: '0534567890',
            riskLevel: 'medium',
            lastVisit: '2024-10-22',
            status: 'active'
        },
        {
            id: 'P009',
            name: 'يوسف عبدالرحمن فهد العنزي',
            age: 56,
            gender: 'ذكر',
            phone: '0545678901',
            riskLevel: 'low',
            lastVisit: '2024-10-21',
            status: 'active'
        },
        {
            id: 'P010',
            name: 'ليلى محمد صالح السبيعي',
            age: 42,
            gender: 'أنثى',
            phone: '0512345678',
            riskLevel: 'medium',
            lastVisit: '2024-10-20',
            status: 'active'
        }
    ];
}

// عرض المرضى في الجدول
function displayPatients(patients) {
    const tableWrapper = document.querySelector('.table-wrapper');
    
    if (!tableWrapper) return;
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>رقم المريض</th>
                    <th>الاسم</th>
                    <th>العمر</th>
                    <th>الجنس</th>
                    <th>الهاتف</th>
                    <th>مستوى الخطر</th>
                    <th>آخر زيارة</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${patients.length > 0 ? patients.map(patient => `
                    <tr>
                        <td><strong>${patient.id}</strong></td>
                        <td>${patient.name}</td>
                        <td>${patient.age}</td>
                        <td>${patient.gender}</td>
                        <td>${patient.phone}</td>
                        <td>${getRiskBadge(patient.riskLevel)}</td>
                        <td>${patient.lastVisit}</td>
                        <td><span class="badge badge-success">نشط</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="window.location.href='patient-details.html?id=${patient.id}'">عرض</button>
                            <button class="btn btn-sm btn-secondary" onclick="editPatient('${patient.id}')">تعديل</button>
                        </td>
                    </tr>
                `).join('') : `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 2rem;">
                            <div style="color: var(--text-secondary);">
                                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">📋</p>
                                <p>لا توجد نتائج مطابقة للبحث</p>
                            </div>
                        </td>
                    </tr>
                `}
            </tbody>
        </table>
    `;
    
    tableWrapper.innerHTML = tableHTML;
}

// الحصول على شارة مستوى الخطر
function getRiskBadge(riskLevel) {
    const badges = {
        'high': '<span class="badge badge-danger">خطر عالي</span>',
        'medium': '<span class="badge badge-warning">خطر متوسط</span>',
        'low': '<span class="badge badge-success">خطر منخفض</span>'
    };
    return badges[riskLevel] || '<span class="badge badge-primary">غير محدد</span>';
}

// إعداد البحث والفلاتر
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchPatients');
    const filterRisk = document.getElementById('filterRisk');
    const filterStatus = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (filterRisk) {
        filterRisk.addEventListener('change', applyFilters);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }
}

// تطبيق الفلاتر
function applyFilters() {
    const searchQuery = document.getElementById('searchPatients')?.value.toLowerCase() || '';
    const riskFilter = document.getElementById('filterRisk')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    filteredPatients = allPatients.filter(patient => {
        // فلتر البحث
        const matchesSearch = !searchQuery || 
            patient.name.toLowerCase().includes(searchQuery) ||
            patient.id.toLowerCase().includes(searchQuery) ||
            patient.phone.includes(searchQuery);
        
        // فلتر مستوى الخطر
        const matchesRisk = !riskFilter || patient.riskLevel === riskFilter;
        
        // فلتر الحالة
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        
        return matchesSearch && matchesRisk && matchesStatus;
    });
    
    displayPatients(filteredPatients);
    updateStatistics();
}

// تحديث الإحصائيات
function updateStatistics() {
    // استخدام جميع المرضى للإحصائيات، وليس المفلترين فقط
    const totalCount = allPatients.length;
    const highRiskCount = allPatients.filter(p => p.riskLevel === 'high').length;
    const mediumRiskCount = allPatients.filter(p => p.riskLevel === 'medium').length;
    const lowRiskCount = allPatients.filter(p => p.riskLevel === 'low').length;
    
    const totalElement = document.getElementById('totalPatientsCount');
    const highElement = document.getElementById('highRiskCount');
    const mediumElement = document.getElementById('mediumRiskCount');
    const lowElement = document.getElementById('lowRiskCount');
    
    if (totalElement) totalElement.textContent = totalCount;
    if (highElement) highElement.textContent = highRiskCount;
    if (mediumElement) mediumElement.textContent = mediumRiskCount;
    if (lowElement) lowElement.textContent = lowRiskCount;
    
    // عرض عدد النتائج المفلترة إذا كان هناك فلتر نشط
    const searchQuery = document.getElementById('searchPatients')?.value || '';
    const riskFilter = document.getElementById('filterRisk')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    if (searchQuery || riskFilter || statusFilter) {
        console.log(`عرض ${filteredPatients.length} من أصل ${allPatients.length} مريض`);
    }
}

// تحديث المرضى
function refreshPatients() {
    loadAllPatients();
}

// تعديل مريض
function editPatient(patientId) {
    alert('سيتم فتح نموذج تعديل المريض: ' + patientId + ' (قريباً)');
}
