class FavoritesManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Listen for both unfavorite and favorite buttons
        const favoriteButtons = document.querySelectorAll('.btn-unfavorite, .btn-favorite');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const cafeId = button.dataset.cafeId;
                await this.toggleFavorite(cafeId, button);
            });
        });
    }

    async toggleFavorite(cafeId, button) {
        try {
            const response = await fetch('/favourite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    cafe_id: cafeId,
                    cafe_data: {}  // Empty object for unfavoriting is fine
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Response data:', data); // Debug log
    
            if (data.status === 'removed') {
                const cafeCard = button.closest('.col-md-6');
                if (cafeCard) {
                    cafeCard.style.transition = 'opacity 0.3s ease';
                    cafeCard.style.opacity = '0';
                    setTimeout(() => {
                        cafeCard.remove();
                        const remainingCafes = document.querySelector('.favorite-cafe-list .row');
                        if (remainingCafes && remainingCafes.children.length === 0) {
                            window.location.reload();
                        }
                    }, 300);
                }
                this.showNotification('Removed from favorites', 'success');
            } else if (data.status === 'added') {
                this.showNotification('Added to favorites', 'success');
            }
    
        } catch (error) {
            console.error('Error details:', error);
            this.showNotification(error.message || 'Error updating favorites', 'error');
        }
    }
    

    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        if (!token) {
            console.error('CSRF token element not found');
            return '';
        }
        return token.value;
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FavoritesManager();
});
