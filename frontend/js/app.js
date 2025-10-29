// ===== المتغيرات العامة =====
let socket;
let currentPage = 1;
let detectionChart;

// ===== التهيئة عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 تحميل النظام...');
  
  // الاتصال بـ Socket.IO
  initializeSocket();
  
  // تحميل البيانات الأولية
  await loadInitialData();
  
  // إنشاء الرسوم البيانية
  initializeCharts();
  
  // إعداد البحث
  setupSearch();
  
  console.log('✅ النظام جاهز');
});

// ===== Socket.IO =====
function initializeSocket() {
  socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    console.log('✅ متصل بالخادم');
  });
  
  socket.on('disconnect', () => {
    console.log('⚠️ انقطع الاتصال بالخادم');
  });
  
  socket.on('new_alert', (alert) => {
    showNotification('تنبيه جديد', alert.message, 'warning');
    refreshAlerts();
    updateNotificationBadge();
  });
  
  socket.on('patient_updated', (data) => {
    console.log('تحديث بيانات المريض:', data);
    refreshPatients();
  });
}

// ===== تحميل البيانات الأولية =====
async function loadInitialData() {
  try {
    // تحميل الإحصائيات
    await loadStats();
    
    // تحميل المرضى
    await loadPatients();
    
    // تحميل التنبيهات
    await loadAlerts();
    
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
    showNotification('خطأ', 'فشل تحميل البيانات الأولية', 'error');
  }
}

// ===== تحميل الإحصائيات =====
async function loadStats() {
  try {
    const stats = await API.getPatientStats();
    
    if (stats.success) {
      document.getElementById('totalPatients').textContent = stats.data.totalPatients || 0;
      document.getElementById('atRiskPatients').textContent = stats.data.atRisk || 0;
      document.getElementById('stablePatients').textContent = stats.data.underTreatment || 0;
      document.getElementById('activeAlerts').textContent = stats.data.activeAlerts || 0;
    }
  } catch (error) {
    console.error('خطأ في تحميل الإحصائيات:', error);
  }
}

// ===== تحميل المرضى =====
async function loadPatients(page = 1) {
  try {
    const container = document.getElementById('patientsTableContainer');
    
    if (page === 1) {
      container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
    
    const response = await API.getPatients({ limit: 10, page });
    
    if (response.success && response.data.length > 0) {
      const tableHTML = `
        <table class="patients-table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>الاسم</th>
              <th>العمر</th>
              <th>الحالة</th>
              <th>درجة الخطورة</th>
              <th>آخر زيارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${response.data.map(patient => `
              <tr onclick="viewPatient('${patient.patientId}')">
                <td><strong>${patient.patientId}</strong></td>
                <td>${patient.name}</td>
                <td>${patient.age} سنة</td>
                <td>${getStatusBadge(patient.status)}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill ${getRiskClass(patient.riskScore)}" 
                         style="width: ${patient.riskScore}%"></div>
                  </div>
                  <small>${patient.riskScore}%</small>
                </td>
                <td>${formatDate(patient.lastVisit)}</td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); viewPatient('${patient.patientId}')">
                    عرض
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      container.innerHTML = tableHTML;
      currentPage = page;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">لا يوجد مرضى</h3>
          <p class="empty-state-message">ابدأ بإضافة مريض جديد</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('خطأ في تحميل المرضى:', error);
    document.getElementById('patientsTableContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3 class="empty-state-title">خطأ في التحميل</h3>
        <p class="empty-state-message">${error.message}</p>
      </div>
    `;
  }
}

// ===== تحميل التنبيهات =====
async function loadAlerts() {
  try {
    const container = document.getElementById('alertsList');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const response = await API.getAlerts({ 
      status: 'new,acknowledged', 
      limit: 5 
    });
    
    if (response.success && response.data.length > 0) {
      container.innerHTML = `
        <div class="alerts-list">
          ${response.data.map(alert => `
            <div class="alert-item ${alert.priority}" onclick="viewAlert('${alert._id}')">
              <div class="alert-header">
                <span class="alert-title">${alert.title}</span>
                <span class="alert-time">${formatTimeAgo(alert.createdAt)}</span>
              </div>
              <p class="alert-message">${alert.message}</p>
              <div class="alert-patient">
                <span class="badge badge-${getPriorityColor(alert.priority)}">
                  ${getPriorityText(alert.priority)}
                </span>
                <span style="margin-right: 0.5rem;">المريض: ${alert.patientId}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // تحديث عداد التنبيهات
      updateNotificationBadge(response.data.length);
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <h3 class="empty-state-title">لا توجد تنبيهات</h3>
          <p class="empty-state-message">جميع الحالات مستقرة</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('خطأ في تحميل التنبيهات:', error);
  }
}

// ===== الرسوم البيانية =====
function initializeCharts() {
  const ctx = document.getElementById('detectionChart');
  
  if (!ctx) return;
  
  detectionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
      datasets: [
        {
          label: 'حالات مكتشفة مبكراً',
          data: [12, 19, 15, 25, 22, 30],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: 'حالات عالية الخطورة',
          data: [5, 8, 6, 10, 9, 12],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        },
        {
          label: 'حالات مستقرة',
          data: [30, 28, 32, 29, 35, 38],
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          rtl: true
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// ===== دوال المساعدة =====
function getStatusBadge(status) {
  const statusMap = {
    'healthy': '<span class="badge badge-success">سليم</span>',
    'at_risk': '<span class="badge badge-warning">معرض للخطر</span>',
    'diagnosed': '<span class="badge badge-danger">مشخص</span>',
    'under_treatment': '<span class="badge badge-info">تحت العلاج</span>'
  };
  return statusMap[status] || '<span class="badge badge-primary">غير محدد</span>';
}

function getRiskClass(score) {
  if (score < 25) return 'success';
  if (score < 50) return 'warning';
  return 'danger';
}

function getPriorityColor(priority) {
  const colorMap = {
    'low': 'success',
    'medium': 'info',
    'high': 'warning',
    'critical': 'danger'
  };
  return colorMap[priority] || 'primary';
}

function getPriorityText(priority) {
  const textMap = {
    'low': 'منخفض',
    'medium': 'متوسط',
    'high': 'عالي',
    'critical': 'حرج'
  };
  return textMap[priority] || priority;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA');
}

function formatTimeAgo(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

// ===== التفاعلات =====
function viewPatient(patientId) {
  window.location.href = `/patient/${patientId}`;
}

function showAddPatientModal() {
  document.getElementById('addPatientModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function submitAddPatient() {
  try {
    const form = document.getElementById('addPatientForm');
    const formData = new FormData(form);
    
    const patientData = {
      name: formData.get('name'),
      age: parseInt(formData.get('age')),
      gender: formData.get('gender'),
      contactInfo: {
        phone: formData.get('phone'),
        email: formData.get('email')
      }
    };
    
    const response = await API.addPatient(patientData);
    
    if (response.success) {
      showNotification('نجح', 'تم إضافة المريض بنجاح', 'success');
      closeModal('addPatientModal');
      form.reset();
      await loadPatients();
      await loadStats();
    }
  } catch (error) {
    showNotification('خطأ', error.message, 'error');
  }
}

function refreshPatients() {
  loadPatients(currentPage);
}

function loadMorePatients() {
  loadPatients(currentPage + 1);
}

function refreshAlerts() {
  loadAlerts();
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notificationCount');
  if (badge) {
    badge.textContent = count || 0;
  }
}

function showNotifications() {
  // يمكن إضافة نافذة منبثقة للتنبيهات
  alert('عرض جميع التنبيهات');
}

function changeChartPeriod(period) {
  console.log('تغيير الفترة إلى:', period);
  // يمكن تحديث البيانات حسب الفترة
}

function setupSearch() {
  const searchInput = document.getElementById('searchPatients');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      const query = e.target.value;
      if (query.length > 2) {
        await loadPatients(1, { search: query });
      } else if (query.length === 0) {
        await loadPatients(1);
      }
    }, 500));
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showNotification(title, message, type = 'info') {
  // يمكن استخدام مكتبة للإشعارات أو إنشاء نظام مخصص
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  alert(`${title}\n${message}`);
}
