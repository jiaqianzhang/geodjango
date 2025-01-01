// favourites.js
class FavoritesManager {
    constructor() {
        console.log('FavoritesManager initialized'); // Debug log
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Setting up event listeners'); // Debug log
        
        // Use querySelector to select all unfavorite buttons
        const unfavoriteButtons = document.querySelectorAll('.btn-unfavorite');
        console.log('Found buttons:', unfavoriteButtons.length); // Debug log

        unfavoriteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                console.log('Button clicked!'); // Debug log
                e.preventDefault();
                
                const cafeId = button.dataset.cafeId;
                console.log('Cafe ID:', cafeId); // Debug log
                
                try {
                    await this.toggleFavorite(cafeId, button);
                } catch (error) {
                    console.error('Error handling favorite button click:', error);
                }
            });
        });
    }

    async toggleFavorite(cafeId, button) {
        try {
            console.log('Attempting to remove favorite for cafe:', cafeId); // Debug log
            
            const response = await fetch('/api/favourite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken(),
                },
                body: JSON.stringify({
                    cafe_id: cafeId
                })
            });

            console.log('Response received:', response); // Debug log

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (data.status === 'removed') {
                // Handle removal animation and DOM update
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
                            const container = document.querySelector('.container');
                            container.innerHTML = `
                                <h2 class="mb-4">My Favourite Cafes</h2>
                                <div class="no-favorites">
                                    <i class="fas fa-heart text-muted mb-3" style="font-size: 3rem;"></i>
                                    <h3>No Favourite Cafes Yet</h3>
                                    <p class="text-muted">Start exploring cafes and add them to your favourites!</p>
                                    <a href="/map" class="btn btn-primary">
                                        <i class="fas fa-search me-2"></i>Find Cafes
                                    </a>
                                </div>
                            `;
                        }
                    }, 300);
                }

                this.showNotification('Removed from favorites', 'success');
            }

            return data;
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error updating favorites', 'error');
            throw error;
        }
    }

    getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]').value;
        console.log('CSRF Token:', token); // Debug log
        return token;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing FavoritesManager'); // Debug log
    new FavoritesManager();
});
