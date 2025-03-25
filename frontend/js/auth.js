// frontend/js/auth.js
class AuthAPI {
    constructor() {
        this.baseUrl = '/api/auth';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    isAuthenticated() {
        return !!this.token;
    }

    async register(firstName, lastName, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            this.setSession(data.token, data.user);
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            this.setSession(data.token, data.user);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        this.clearSession();
        window.location.href = '/login.html';
    }

    async getProfile() {
        try {
            const response = await fetch(`${this.baseUrl}/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async updateProfile(updates) {
        try {
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Update failed');
            }

            const data = await response.json();
            
            // Update local user data
            this.user = { ...this.user, ...data };
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password change failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.baseUrl}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Request password reset error:', error);
            throw error;
        }
    }

    async resetPassword(resetToken, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resetToken,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    async addToFavorites(wineId) {
        try {
            const response = await fetch(`${this.baseUrl}/favorites/${wineId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add to favorites');
            }

            return await response.json();
        } catch (error) {
            console.error('Add to favorites error:', error);
            throw error;
        }
    }

    async removeFromFavorites(wineId) {
        try {
            const response = await fetch(`${this.baseUrl}/favorites/${wineId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove from favorites');
            }

            return await response.json();
        } catch (error) {
            console.error('Remove from favorites error:', error);
            throw error;
        }
    }

    async addTastingNote(note) {
        try {
            const response = await fetch(`${this.baseUrl}/tasting-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(note)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add tasting note');
            }

            return await response.json();
        } catch (error) {
            console.error('Add tasting note error:', error);
            throw error;
        }
    }

    async updatePreferences(preferences) {
        try {
            const response = await fetch(`${this.baseUrl}/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Update preferences error:', error);
            throw error;
        }
    }

    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearSession() {
        this.token = null;
        this.user = {};
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    setupAuthListeners() {
        // Add logout functionality to all logout buttons
        const logoutButtons = document.querySelectorAll('#logout-button');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Update UI based on authentication status
        this.updateAuthUI();
    }

    updateAuthUI() {
        const isAuth = this.isAuthenticated();
        
        // Elements to show when authenticated
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = isAuth ? 'block' : 'none';
        });
        
        // Elements to show when not authenticated
        document.querySelectorAll('.auth-hidden').forEach(el => {
            el.style.display = isAuth ? 'none' : 'block';
        });

        // Update user info if available
        if (isAuth && this.user) {
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = `${this.user.firstName} ${this.user.lastName}`;
            });
            
            document.querySelectorAll('.user-email').forEach(el => {
                el.textContent = this.user.email;
            });
        }
    }
}

// Create and export instance
const authApi = new AuthAPI();

// Setup auth listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    authApi.setupAuthListeners();
});