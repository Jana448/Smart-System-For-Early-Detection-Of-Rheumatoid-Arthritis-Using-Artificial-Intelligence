// ===== إعدادات API =====
// ملاحظة: حالياً نستخدم Mock Data للتطوير
// سيتم استبدالها بـ API حقيقي لاحقاً
const USE_MOCK_API = true; // غيّر إلى false عند توفر Backend حقيقي

const API_BASE_URL = 'http://localhost:3000/api';
const PYTHON_API_URL = 'http://localhost:5000/api';

// ===== دوال API العامة =====
class API {
  static async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في الطلب');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== المرضى =====
  static async getPatients(params = {}) {
    if (USE_MOCK_API) {
      return await MockAPI.getAllPatients();
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/patients?${queryString}`);
  }

  static async getPatient(patientId) {
    if (USE_MOCK_API) {
      return await MockAPI.getPatientById(patientId);
    }
    return this.request(`${API_BASE_URL}/patients/${patientId}`);
  }

  static async getPatientProfile(patientId) {
    return this.request(`${API_BASE_URL}/patients/${patientId}/complete-profile`);
  }

  static async addPatient(patientData) {
    if (USE_MOCK_API) {
      return await MockAPI.addPatient(patientData);
    }
    // توليد معرف فريد للمريض
    const patientId = 'P' + Date.now().toString().slice(-8);
    
    return this.request(`${API_BASE_URL}/patients`, {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        ...patientData
      })
    });
  }

  static async updatePatient(patientId, patientData) {
    if (USE_MOCK_API) {
      return await MockAPI.updatePatient(patientId, patientData);
    }
    return this.request(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  }

  static async getPatientStats() {
    if (USE_MOCK_API) {
      return await MockAPI.getStatistics();
    }
    return this.request(`${API_BASE_URL}/patients/stats/overview`);
  }

  // ===== البيانات السريرية =====
  static async getClinicalData(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/clinical/patient/${patientId}?${queryString}`);
  }

  static async addClinicalData(clinicalData) {
    return this.request(`${API_BASE_URL}/clinical`, {
      method: 'POST',
      body: JSON.stringify(clinicalData)
    });
  }

  static async getClinicalTrends(patientId, days = 30) {
    return this.request(`${API_BASE_URL}/clinical/patient/${patientId}/trends?days=${days}`);
  }

  // ===== الصور الطبية =====
  static async uploadMedicalImage(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'فشل رفع الصورة');
      }
      
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  static async getPatientImages(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/images/patient/${patientId}?${queryString}`);
  }

  static async updateImageReview(imageId, reviewData) {
    return this.request(`${API_BASE_URL}/images/${imageId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  }

  // ===== بيانات الأجهزة القابلة للارتداء =====
  static async getWearableData(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/wearable/patient/${patientId}?${queryString}`);
  }

  static async addWearableData(wearableData) {
    return this.request(`${API_BASE_URL}/wearable`, {
      method: 'POST',
      body: JSON.stringify(wearableData)
    });
  }

  static async getWearableTrends(patientId, days = 7) {
    return this.request(`${API_BASE_URL}/wearable/patient/${patientId}/trends?days=${days}`);
  }

  static async getLatestWearableData(patientId) {
    return this.request(`${API_BASE_URL}/wearable/patient/${patientId}/latest`);
  }

  // ===== التنبيهات =====
  static async getAlerts(params = {}) {
    if (USE_MOCK_API) {
      return await MockAPI.getNotifications();
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/alerts?${queryString}`);
  }

  static async getPatientAlerts(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_BASE_URL}/alerts/patient/${patientId}?${queryString}`);
  }

  static async updateAlertStatus(alertId, status, handledBy, notes) {
    return this.request(`${API_BASE_URL}/alerts/${alertId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, handledBy, notes })
    });
  }

  static async getAlertStats() {
    return this.request(`${API_BASE_URL}/alerts/stats/overview`);
  }

  // ===== خدمات الذكاء الاصطناعي =====
  static async analyzeImage(formData) {
    try {
      const response = await fetch(`${PYTHON_API_URL}/analyze-image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'فشل تحليل الصورة');
      }
      
      return data;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  }

  static async analyzeClinical(clinicalData) {
    return this.request(`${PYTHON_API_URL}/analyze-clinical`, {
      method: 'POST',
      body: JSON.stringify(clinicalData)
    });
  }

  static async predictProgression(patientHistory) {
    return this.request(`${PYTHON_API_URL}/predict-progression`, {
      method: 'POST',
      body: JSON.stringify({ history: patientHistory })
    });
  }

  static async generateSyntheticImages(numImages) {
    return this.request(`${PYTHON_API_URL}/generate-images`, {
      method: 'POST',
      body: JSON.stringify({ numImages })
    });
  }

  // ===== فحص صحة الخوادم =====
  static async checkHealth() {
    try {
      const [nodeHealth, pythonHealth] = await Promise.all([
        this.request(`${API_BASE_URL}/health`),
        this.request(`${PYTHON_API_URL}/health`)
      ]);
      
      return {
        node: nodeHealth,
        python: pythonHealth
      };
    } catch (error) {
      console.error('Health Check Error:', error);
      return null;
    }
  }
}

// تصدير للاستخدام
window.API = API;
