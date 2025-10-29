// ===== المتغيرات =====
let currentPatientId;
let socket;
let clinicalChart;
let wearableChart;

// ===== التهيئة =====
document.addEventListener('DOMContentLoaded', async () => {
  // الحصول على معرف المريض من URL
  const pathParts = window.location.pathname.split('/');
  currentPatientId = pathParts[pathParts.length - 1];
  
  if (!currentPatientId) {
    alert('معرف المريض غير صحيح');
    window.location.href = '/';
    return;
  }
  
  // تحميل بيانات المريض
  await loadPatientData();
  
  // الاتصال بـ Socket.IO
  initializeSocket();
});

// ===== Socket.IO =====
function initializeSocket() {
  socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    socket.emit('subscribe_patient', currentPatientId);
  });
  
  socket.on('patient_updated', (data) => {
    if (data.patientId === currentPatientId) {
      loadPatientData();
    }
  });
}

// ===== تحميل بيانات المريض =====
async function loadPatientData() {
  try {
    const response = await API.getPatientProfile(currentPatientId);
    
    if (response.success) {
      const { patient, latestClinical, images, wearableData, activeAlerts } = response.data;
      
      // عرض رأس المريض
      displayPatientHeader(patient);
      
      // عرض المعلومات الأساسية
      displayPatientInfo(patient);
      
      // عرض مؤشر الخطورة
      displayRiskIndicator(patient);
      
      // عرض آخر القراءات
      displayLatestReadings(latestClinical, wearableData);
      
      // عرض الجدول الزمني
      displayTimeline(patient, latestClinical, images);
      
      // تحميل البيانات الأخرى
      loadClinicalData();
      loadImages();
      loadWearableData();
      loadPatientAlerts();
    }
  } catch (error) {
    console.error('خطأ في تحميل بيانات المريض:', error);
    alert('فشل تحميل بيانات المريض');
  }
}

// ===== عرض رأس المريض =====
function displayPatientHeader(patient) {
  const header = document.getElementById('patientHeader');
  header.innerHTML = `
    <div class="patient-header-content">
      <div class="patient-info">
        <div class="patient-avatar">
          ${patient.gender === 'male' ? '👨' : '👩'}
        </div>
        <div class="patient-details">
          <h1>${patient.name}</h1>
          <div class="patient-meta">
            <span>📋 ${patient.patientId}</span>
            <span>🎂 ${patient.age} سنة</span>
            <span>📞 ${patient.contactInfo?.phone || '-'}</span>
            <span>📅 آخر زيارة: ${formatDate(patient.lastVisit)}</span>
          </div>
        </div>
      </div>
      <div class="patient-actions">
        <button class="btn" onclick="editPatient()">✏️ تعديل</button>
        <button class="btn" onclick="printReport()">🖨️ طباعة</button>
      </div>
    </div>
  `;
}

// ===== عرض معلومات المريض =====
function displayPatientInfo(patient) {
  const container = document.getElementById('patientInfo');
  container.innerHTML = `
    <div class="info-list">
      <div class="info-item">
        <span class="info-label">الحالة</span>
        <span class="info-value">${getStatusBadge(patient.status)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">الجنس</span>
        <span class="info-value">${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">البريد الإلكتروني</span>
        <span class="info-value">${patient.contactInfo?.email || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">تاريخ التسجيل</span>
        <span class="info-value">${formatDate(patient.registrationDate)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">تاريخ عائلي</span>
        <span class="info-value">${patient.medicalHistory?.familyHistory ? 'نعم' : 'لا'}</span>
      </div>
    </div>
  `;
}

// ===== عرض مؤشر الخطورة =====
function displayRiskIndicator(patient) {
  const container = document.getElementById('riskIndicator');
  const riskScore = patient.riskScore || 0;
  const riskLevel = getRiskLevel(riskScore);
  
  container.innerHTML = `
    <div class="risk-indicator">
      <div class="risk-score" style="--score: ${riskScore}">
        <div class="risk-score-value">${riskScore}</div>
        <div class="risk-score-label">من 100</div>
      </div>
      <div class="risk-level" style="color: ${getRiskColor(riskScore)}">
        ${riskLevel.text}
      </div>
      <p class="risk-description">${riskLevel.description}</p>
    </div>
  `;
}

// ===== عرض آخر القراءات =====
function displayLatestReadings(clinical, wearable) {
  const container = document.getElementById('latestReadings');
  
  if (!clinical && (!wearable || wearable.length === 0)) {
    container.innerHTML = '<p class="text-center">لا توجد قراءات حديثة</p>';
    return;
  }
  
  const latestWearable = wearable && wearable.length > 0 ? wearable[0] : null;
  
  container.innerHTML = `
    <div class="info-list">
      ${clinical ? `
        <div class="info-item">
          <span class="info-label">ESR</span>
          <span class="info-value">${clinical.bloodTests?.esr?.value || '-'} mm/hr</span>
        </div>
        <div class="info-item">
          <span class="info-label">CRP</span>
          <span class="info-value">${clinical.bloodTests?.crp?.value || '-'} mg/L</span>
        </div>
        <div class="info-item">
          <span class="info-label">RF</span>
          <span class="info-value">${clinical.bloodTests?.rf?.value || '-'} IU/mL</span>
        </div>
      ` : ''}
      ${latestWearable ? `
        <div class="info-item">
          <span class="info-label">درجة الحرارة</span>
          <span class="info-value">${latestWearable.temperature?.value || '-'}°C</span>
        </div>
        <div class="info-item">
          <span class="info-label">مستوى الألم</span>
          <span class="info-value">${latestWearable.painLevel || '-'}/10</span>
        </div>
      ` : ''}
    </div>
  `;
}

// ===== التبديل بين التبويبات =====
function switchTab(tabName) {
  // إخفاء جميع التبويبات
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // إظهار التبويب المحدد
  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.classList.add('active');
}

// ===== دوال المساعدة =====
function getStatusBadge(status) {
  const statusMap = {
    'healthy': '<span class="badge badge-success">سليم</span>',
    'at_risk': '<span class="badge badge-warning">معرض للخطر</span>',
    'diagnosed': '<span class="badge badge-danger">مشخص</span>',
    'under_treatment': '<span class="badge badge-info">تحت العلاج</span>'
  };
  return statusMap[status] || '<span class="badge">غير محدد</span>';
}

function getRiskLevel(score) {
  if (score < 25) {
    return { text: 'خطورة منخفضة', description: 'الحالة مستقرة ولا توجد مؤشرات مقلقة' };
  } else if (score < 50) {
    return { text: 'خطورة متوسطة', description: 'يُنصح بالمتابعة الدورية' };
  } else if (score < 75) {
    return { text: 'خطورة عالية', description: 'يحتاج لمتابعة دقيقة وفحوصات إضافية' };
  } else {
    return { text: 'خطورة حرجة', description: 'يحتاج لتدخل طبي فوري' };
  }
}

function getRiskColor(score) {
  if (score < 25) return '#22c55e';
  if (score < 50) return '#f59e0b';
  if (score < 75) return '#ef4444';
  return '#dc2626';
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA');
}

function displayTimeline(patient, clinical, images) {
  const container = document.getElementById('timeline');
  const events = [];
  
  // إضافة الأحداث
  if (patient.registrationDate) {
    events.push({
      date: patient.registrationDate,
      title: 'تسجيل المريض',
      description: 'تم تسجيل المريض في النظام'
    });
  }
  
  if (clinical) {
    events.push({
      date: clinical.testDate,
      title: 'تحليل سريري',
      description: `ESR: ${clinical.bloodTests?.esr?.value || '-'}, CRP: ${clinical.bloodTests?.crp?.value || '-'}`
    });
  }
  
  if (images && images.length > 0) {
    images.forEach(img => {
      events.push({
        date: img.imagingDate,
        title: `صورة ${img.imageType}`,
        description: `${img.bodyPart} - ${img.aiAnalysis?.classification || 'قيد التحليل'}`
      });
    });
  }
  
  // ترتيب الأحداث
  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // عرض الجدول الزمني
  container.innerHTML = `
    <div class="timeline">
      ${events.map(event => `
        <div class="timeline-item">
          <div class="timeline-content">
            <div class="timeline-date">${formatDate(event.date)}</div>
            <div class="timeline-title">${event.title}</div>
            <div class="timeline-description">${event.description}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function loadClinicalData() {
  // تحميل البيانات السريرية والرسوم البيانية
  console.log('تحميل البيانات السريرية...');
}

async function loadImages() {
  // تحميل الصور الطبية
  console.log('تحميل الصور الطبية...');
}

async function loadWearableData() {
  // تحميل بيانات الجهاز القابل للارتداء
  console.log('تحميل بيانات الجهاز...');
}

async function loadPatientAlerts() {
  // تحميل تنبيهات المريض
  console.log('تحميل التنبيهات...');
}

function editPatient() {
  alert('تعديل بيانات المريض');
}

function printReport() {
  window.print();
}
