class CafeMap {
    constructor() {
        if (window.cafeMapInstance) {
            return window.cafeMapInstance;
        }
        this.map = null;
        this.markers = [];
        this.favoritedCafes = new Set(); // Keep track of favorited cafes
        this.initMap();
        this.initEventListeners();
        window.cafeMapInstance = this;
        this.isOnline = navigator.onLine;
        this.initNetworkListeners();
        this.favoriteButtons = new Map();
        this.loadFavoritedCafes(); // Add this to load existing favorites
    }

    // Update your createCafeListItem method
    createCafeListItem(cafe) {
        const div = document.createElement('div');
        div.className = 'cafe-item';
        
        // Check if cafe is already favorited
        const isFavorited = this.favoritedCafes.has(cafe.place_id);
        
        div.innerHTML = `
            <div class="cafe-header">
                <h5>${cafe.name}</h5>
                <button class="btn-favorite" data-cafe-id="${cafe.place_id}">
                    <i class="fas fa-heart ${isFavorited ? 'favorited' : ''}"></i>
                </button>
            </div>
            <p><i class="fas fa-map-marker-alt"></i>${cafe.address.formatted || cafe.address.street}</p>
            
            <div class="meta-info">
                ${cafe.rating ? 
                    `<span class="rating">
                        <i class="fas fa-star"></i>
                        ${cafe.rating}/5 
                    </span>` : ''
                }
                ${cafe.distance ? 
                    `<span class="distance">
                        <i class="fas fa-walking"></i>
                        ${Math.round(cafe.distance)}m
                    </span>` : ''
                }
            </div>
            
            ${cafe.phone ? 
                `<p><i class="fas fa-phone"></i>${cafe.phone}</p>` : ''
            }
            ${cafe.hours ? 
                `<p><i class="far fa-clock"></i>${Array.isArray(cafe.hours) ? cafe.hours[0] : cafe.hours}</p>` : ''
            }
        `;

        // Add favorite button click handler
        const favoriteBtn = div.querySelector('.btn-favorite');
        const heartIcon = favoriteBtn.querySelector('.fa-heart');
        
        favoriteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering the parent div's click event
            try {
                const result = await this.toggleFavorite(cafe);
                
                if (result.status === 'added') {
                    heartIcon.classList.add('favorited');
                    this.favoritedCafes.add(cafe.place_id);
                    this.showNotification('Added to favorites', 'success');
                } else if (result.status === 'removed') {
                    heartIcon.classList.remove('favorited');
                    this.favoritedCafes.delete(cafe.place_id);
                    this.showNotification('Removed from favorites', 'success');
                }
            } catch (error) {
                console.error('Error in favourite button click:', error);
                this.showNotification('Error updating favorites', 'error');
            }
        });

        // Add initial tooltip
        favoriteBtn.setAttribute('title', isFavorited ? 'Remove from favorites' : 'Add to favorites');

        // Add click event listener to the entire cafe item for map centering
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-favorite')) {
                if (cafe.lat && cafe.lon) {
                    this.map.setView([cafe.lat, cafe.lon], 16);
                    
                    this.markers.forEach(marker => {
                        if (marker.cafeId === cafe.place_id) {
                            marker.openPopup();
                        }
                    });
                }
            }
        });

        return div;
    }

    // Add this method to your CafeMap class
    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    // Utility function used by both regular map and favorites
    async toggleFavorite(cafe) {
        try {
            const cafeId = cafe.place_id || cafe.cafe_id || cafe.id;
            
            const payload = {
                cafe_id: cafeId,
                cafe_data: {
                    name: cafe.name,
                    address: cafe.address?.formatted || '',
                    lat: cafe.lat || 0,
                    lon: cafe.lon || 0,
                    rating: cafe.rating || null,
                    user_ratings_total: cafe.user_ratings_total || null,
                    phone: cafe.phone || null,
                    website: cafe.website || null
                }
            };
    
            const response = await fetch('/favourite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken(),
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            // Update the UI and tracked favorites
            if (data.status === 'added') {
                this.favoritedCafes.add(cafeId);
                this.showNotification('Added to favorites', 'success');
            } else {
                this.favoritedCafes.delete(cafeId);
                this.showNotification('Removed from favorites', 'success');
            }
    
            // Update heart icon
            const heartIcon = document.querySelector(`[data-cafe-id="${cafeId}"] .fa-heart`);
            if (heartIcon) {
                heartIcon.classList.toggle('favorited');
            }
    
            return data;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showNotification('Error toggling favorite status', 'error');
            throw error;
        }
    }

    

    initNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineMessage();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineMessage();
        });
    }

    showOfflineMessage() {
        const offlineAlert = document.createElement('div');
        offlineAlert.id = 'offlineAlert';
        offlineAlert.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x m-3';
        offlineAlert.innerHTML = `
            <i class="fas fa-wifi-slash me-2"></i>
            You are offline. Some features may be limited.
        `;
        document.body.appendChild(offlineAlert);
    }

    hideOfflineMessage() {
        const offlineAlert = document.getElementById('offlineAlert');
        if (offlineAlert) {
            offlineAlert.remove();
        }
    }

    async initMap() {
        const mapContainer = document.getElementById('map');
        if (!this.map && mapContainer) {
            if (mapContainer._leaflet_id) {
                console.log('Map already initialized, skipping initialization');
                return;
            }
            
            this.map = L.map('map').setView([0, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
    
            // await this.fetchFavoritedCafes(); // Add this line
    
            const locationPrompt = document.getElementById('locationPrompt');
            if (locationPrompt) {
                locationPrompt.style.display = 'block';
            }
        }
    }
    

    initEventListeners() {
        const locationButton = document.getElementById('enableLocation');
        if (locationButton) {
            locationButton.addEventListener('click', () => this.getCurrentLocation());
        }
    }

    async getCurrentLocation() {
        const locationPrompt = document.getElementById('locationPrompt');
        const loadingIndicator = document.getElementById('loadingIndicator');

        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.error('Geolocation is not supported by your browser');
                reject(new Error('Geolocation not supported'));
                return;
            }

            if (locationPrompt) locationPrompt.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'block';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('Location found:', latitude, longitude);
                    
                    // Clear existing markers
                    this.clearMarkers();
                    
                    this.map.setView([latitude, longitude], 15);
                    
                    // Add marker for user's location
                    L.marker([latitude, longitude])
                        .addTo(this.map)
                        .bindPopup('Your Location')
                        .openPopup();

                    this.loadNearbyCafes(latitude, longitude);
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    resolve(position);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    if (locationPrompt) locationPrompt.style.display = 'block';
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }


    async loadNearbyCafes(latitude, longitude) {
        try {
            if (!this.isOnline) {
                throw new Error('offline');
            }
            console.log('Fetching cafes for:', latitude, longitude);
    
            const response = await fetch(`/map/?latitude=${latitude}&longitude=${longitude}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Received cafe data:', data);
    
            // Check for data.cafes since your view returns { cafes: [...], source: '...' }
            if (data.cafes && Array.isArray(data.cafes)) {
                this.displayCafes(data.cafes);
                console.log('Data source:', data.source); // Log whether from cache or Google Places
            } else {
                this.displayNoCafesMessage();
            }
    
        } catch (error) {
            console.error('Error fetching cafes:', error);
            if (error.message === 'offline') {
                this.displayOfflineCafes();
            } else {
                this.displayErrorMessage();
            }
        }
    }
    
    
    // Helper function to get CSRF token
    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
    
    // Helper function to show notifications
    showNotification(message, type = 'info') {
        // Implement your notification system here
        console.log(`${type}: ${message}`);
    }
    displayOfflineMessage() {
        const popup = L.popup()
            .setLatLng(this.map.getCenter())
            .setContent(`
                <div class="offline-message">
                    <i class="fas fa-wifi-slash mb-2"></i>
                    <p>You are currently offline</p>
                    <p>Please check your internet connection</p>
                </div>
            `)
            .openOn(this.map);
    }

    

    displayCafes(cafes) {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Get cafe list container
        const cafeListContainer = document.getElementById('cafeListContainer');
        const cafeList = document.getElementById('cafeList');
        
        // Clear existing cafe list
        if (cafeList) {
            cafeList.innerHTML = '';
        }

        if (cafes.length === 0) {
            this.displayNoCafesMessage();
            if (cafeListContainer) {
                cafeListContainer.style.display = 'none';
            }
            return;
        }

        // Show cafe list container
        if (cafeListContainer) {
            cafeListContainer.style.display = 'block';
        }

        // Sort cafes by distance if available
        if (cafes[0].distance) {
            cafes.sort((a, b) => a.distance - b.distance);
        }

        cafes.forEach(cafe => {
            if (cafe.lat && cafe.lon) {
                // Create and add marker
                const marker = L.marker([cafe.lat, cafe.lon]);
                marker.cafeId = cafe.place_id;  // Add this line to store the cafe ID
                const popupContent = `
                    <div class="cafe-popup">
                        <h3>${cafe.name}</h3>
                        ${cafe.address.formatted ? `<p>${cafe.address.formatted}</p>` : ''}
                        ${cafe.rating ? `<p>Rating: ${cafe.rating} ⭐ (${cafe.user_ratings_total} reviews)</p>` : ''}
                        ${cafe.phone ? `<p>📞 ${cafe.phone}</p>` : ''}
                        ${cafe.website ? `<p><a href="${cafe.website}" target="_blank">🌐 Website</a></p>` : ''}
                        ${cafe.hours ? `
                            <div class="hours-section">
                                <p onclick="this.nextElementSibling.classList.toggle('show')">
                                    ⏰ Opening Hours
                                </p>
                                <div class="hours-details">
                                    ${cafe.hours.join('<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
        
                marker.bindPopup(popupContent);
                marker.addTo(this.map);
                this.markers.push(marker);
        
                // Add to cafe list
                if (cafeList) {
                    cafeList.appendChild(this.createCafeListItem(cafe));
                }
            }
        });        
    }

    displayNoCafesMessage() {
        const popup = L.popup()
            .setLatLng(this.map.getCenter())
            .setContent(`
                <div class="no-cafes-message">
                    <p>No cafes found in this area</p>
                    <p>Try searching in a different location</p>
                </div>
            `)
            .openOn(this.map);
    }

    displayErrorMessage() {
        const popup = L.popup()
            .setLatLng(this.map.getCenter())
            .setContent(`
                <div class="error-message">
                    <p>Error loading cafes</p>
                    <p>Please try again later</p>
                </div>
            `)
            .openOn(this.map);
    }
}

// Check for service worker updates
function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}

// Show update notification
function showUpdateNotification() {
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.innerHTML = `
        <div class="update-toast-content">
            <p>New version available!</p>
            <button onclick="updateApp()" class="btn btn-light btn-sm">Update Now</button>
        </div>
    `;
    document.body.appendChild(toast);
}

// Update the app
function updateApp() {
    navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
            registration.waiting.postMessage('skipWaiting');
        }
    });
}

// Call this when your app initializes
checkForUpdates();


// Single instance initialization
if (!window.cafeMapInstance) {
    document.addEventListener('DOMContentLoaded', () => {
        window.cafeMapInstance = new CafeMap();
    });
}

// static/js/cafe-map.js
// class CafeMap {
//     constructor() {
//         this.map = null;
//         this.markers = [];
//         this.initMap();
//     }

//     async initMap() {
//         // Initialize map
//         this.map = new google.maps.Map(document.getElementById('map'), {
//             zoom: 15,
//             center: { lat: 53.3498, lng: -6.2603 } // Default to Dublin
//         });

//         // Get user location and load cafes
//         await this.getCurrentLocation();
//     }

//     async getCurrentLocation() {
//         if (navigator.geolocation) {
//             try {
//                 const position = await new Promise((resolve, reject) => {
//                     navigator.geolocation.getCurrentPosition(resolve, reject);
//                 });

//                 const { latitude, longitude } = position.coords;
                
//                 // Center map on user location
//                 const userLocation = new google.maps.LatLng(latitude, longitude);
//                 this.map.setCenter(userLocation);

//                 // Add marker for user location
//                 new google.maps.Marker({
//                     position: userLocation,
//                     map: this.map,
//                     title: 'Your Location',
//                     icon: {
//                         url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
//                     }
//                 });

//                 // Search for nearby cafes
//                 await this.searchNearbyCafes(latitude, longitude);

//             } catch (error) {
//                 console.error('Error getting location:', error);
//                 alert('Unable to get your location. Please enable location services.');
//             }
//         }
//     }

//     async searchNearbyCafes(lat, lng) {
//         const service = new google.maps.places.PlacesService(this.map);
        
//         const request = {
//             location: new google.maps.LatLng(lat, lng),
//             radius: '1000',
//             type: ['cafe']
//         };

//         service.nearbySearch(request, (results, status) => {
//             if (status === google.maps.places.PlacesServiceStatus.OK) {
//                 // Store in IndexedDB for offline use
//                 this.storeCafesInIndexedDB(results);
//                 // Display the cafes
//                 this.displayCafes(results);
//             } else {
//                 // Try to get cached data if the Places API fails
//                 this.loadCafesFromIndexedDB(lat, lng);
//             }
//         });
//     }

//     async storeCafesInIndexedDB(cafes) {
//         const db = await this.openIndexedDB();
//         const tx = db.transaction('cafes', 'readwrite');
//         const store = tx.objectStore('cafes');

//         cafes.forEach(cafe => {
//             store.put({
//                 id: cafe.place_id,
//                 name: cafe.name,
//                 location: {
//                     lat: cafe.geometry.location.lat(),
//                     lng: cafe.geometry.location.lng()
//                 },
//                 vicinity: cafe.vicinity,
//                 rating: cafe.rating,
//                 timestamp: Date.now()
//             });
//         });
//     }

//     async loadCafesFromIndexedDB(lat, lng) {
//         const db = await this.openIndexedDB();
//         const tx = db.transaction('cafes', 'readonly');
//         const store = tx.objectStore('cafes');

//         store.getAll().onsuccess = (event) => {
//             const cafes = event.target.result;
//             if (cafes.length > 0) {
//                 this.displayCafes(cafes);
//             }
//         };
//     }

//     async openIndexedDB() {
//         return new Promise((resolve, reject) => {
//             const request = indexedDB.open('CafeFinderDB', 1);

//             request.onerror = () => reject(request.error);
//             request.onsuccess = () => resolve(request.result);

//             request.onupgradeneeded = (event) => {
//                 const db = event.target.result;
//                 if (!db.objectStoreNames.contains('cafes')) {
//                     db.createObjectStore('cafes', { keyPath: 'id' });
//                 }
//             };
//         });
//     }

//     displayCafes(cafes) {
//         // Clear existing markers
//         this.markers.forEach(marker => marker.setMap(null));
//         this.markers = [];

//         cafes.forEach(cafe => {
//             const position = cafe.geometry ? 
//                 cafe.geometry.location : 
//                 new google.maps.LatLng(cafe.location.lat, cafe.location.lng);

//             const marker = new google.maps.Marker({
//                 position: position,
//                 map: this.map,
//                 title: cafe.name
//             });

//             const infoWindow = new google.maps.InfoWindow({
//                 content: `
//                     <div>
//                         <h3>${cafe.name}</h3>
//                         <p>${cafe.vicinity || ''}</p>
//                         ${cafe.rating ? `<p>Rating: ${cafe.rating}</p>` : ''}
//                     </div>
//                 `
//             });

//             marker.addListener('click', () => {
//                 infoWindow.open(this.map, marker);
//             });

//             this.markers.push(marker);
//         });

//         this.updateCafeList(cafes);
//     }

//     updateCafeList(cafes) {
//         const cafeList = document.getElementById('cafe-list');
//         if (!cafeList) return;

//         cafeList.innerHTML = '';
//         cafes.forEach(cafe => {
//             const div = document.createElement('div');
//             div.className = 'cafe-item';
//             div.innerHTML = `
//                 <h3>${cafe.name}</h3>
//                 <p>${cafe.vicinity || ''}</p>
//                 ${cafe.rating ? `<p>Rating: ${cafe.rating}</p>` : ''}
//             `;
            
//             div.addEventListener('click', () => {
//                 const position = cafe.geometry ? 
//                     cafe.geometry.location : 
//                     new google.maps.LatLng(cafe.location.lat, cafe.location.lng);
//                 this.map.setCenter(position);
//                 this.map.setZoom(17);
//             });

//             cafeList.appendChild(div);
//         });
//     }
// }

// // Initialize when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     new CafeMap();
// });

