class FavoritesManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const unfavoriteButtons = document.querySelectorAll('.btn-unfavorite');
        unfavoriteButtons.forEach(button => {
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
                },
                body: JSON.stringify({
                    cafe_id: cafeId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'removed') {
                const cafeCard = button.closest('.col-md-6');
                if (cafeCard) {
                    // Add fade-out animation
                    cafeCard.style.transition = 'opacity 0.3s ease';
                    cafeCard.style.opacity = '0';

                    // Remove the element after animation
                    setTimeout(() => {
                        cafeCard.remove();
                        
                        // Check if there are any cafes left
                        const remainingCafes = document.querySelector('.favorite-cafe-list .row').children;
                        if (remainingCafes.length === 0) {
                            window.location.reload(); // Reload to show "No favorites" message
                        }
                    }, 300);
                }

                this.showNotification('Removed from favorites', 'success');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error updating favorites', 'error');
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
        return token ? token.value : '';
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FavoritesManager();
});
