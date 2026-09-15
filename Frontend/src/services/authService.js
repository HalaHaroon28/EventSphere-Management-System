const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthService {
  async safeJson(response, fallbackMsg) {
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      const text = await response.text();
      return { message: text || fallbackMsg || `Server returned error status ${response.status}` };
    } catch (e) {
      return { message: fallbackMsg || `Server error (${response.status})` };
    }
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Login failed');
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async verifyOtp(userId, otpCode) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'OTP verification failed');
      throw new Error(error.message || 'OTP verification failed');
    }

    return response.json();
  }

  async resendOtp(userIdOrEmail) {
    const body = typeof userIdOrEmail === 'object' && userIdOrEmail !== null
      ? userIdOrEmail
      : typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')
        ? { email: userIdOrEmail }
        : { user_id: userIdOrEmail };

    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Failed to resend OTP');
      throw new Error(error.message || 'Failed to resend OTP');
    }

    return response.json();
  }

  async uploadPfp(file) {
    const formData = new FormData();
    formData.append('profile_photo', file);

    const response = await fetch(`${API_BASE_URL}/auth/upload-pfp`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Profile photo upload failed');
      throw new Error(error.message || 'Profile photo upload failed');
    }

    return response.json();
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Registration failed');
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset request failed');
    }

    return response.json();
  }

  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return response.json();
  }

  async getCurrentUser() {
    const token = localStorage.getItem('eventsphere_token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('eventsphere_token');
    localStorage.removeItem('eventsphere_auth_user');
    localStorage.removeItem('eventsphere_user');
    localStorage.removeItem('eventsphere_role');
    localStorage.removeItem('eventsphere_view');
  }

  setToken(token) {
    localStorage.setItem('eventsphere_token', token);
  }

  getToken() {
    return localStorage.getItem('eventsphere_token');
  }

  setUser(user) {
    localStorage.setItem('eventsphere_auth_user', JSON.stringify(user));
  }

  getUser() {
    const userStr = localStorage.getItem('eventsphere_auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  async updateProfile(profileData) {
    const token = this.getToken();
    const isFormData = profileData instanceof FormData;

    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'PATCH',
      headers,
      body: isFormData ? profileData : JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Profile update failed');
      throw new Error(error.message || 'Profile update failed');
    }

    const data = await response.json();
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  }

  async updateCompanyProfile(companyData) {
    const token = this.getToken();
    const isFormData = companyData instanceof FormData;

    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/profile/company`, {
      method: 'PATCH',
      headers,
      body: isFormData ? companyData : JSON.stringify(companyData),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Company profile update failed');
      throw new Error(error.message || 'Company profile update failed');
    }

    const data = await response.json();
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  }

  async changePassword(current_password, new_password, confirm_password) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });

    if (!response.ok) {
      const error = await this.safeJson(response, 'Password change failed');
      throw new Error(error.message || 'Password change failed');
    }

    return response.json();
  }
}

export const authService = new AuthService();
