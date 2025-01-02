// pwa-install.js
console.log('PWA Installer loaded - version 2'); // Increment version

// Add this at the very top of your file, before the class definition
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event captured');
    e.preventDefault();
    window.deferredPromptEvent = e;  // Store it globally
});


class PWAInstaller {
    constructor() {
        console.log('PWA Installer initialized');
        this.deferredPrompt = null;
        this.installContainer = document.getElementById('pwaInstallContainer');
        this.installButton = document.getElementById('pwaInstallBtn');
        this.installMessage = this.installContainer?.querySelector('p');
        this.init();
        this.debugInstallState();
    }

    debugInstallState() {
        console.log('Debugging PWA install state:');
        console.log('- In standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
        console.log('- Install button exists:', !!this.installButton);
        console.log('- Install container exists:', !!this.installContainer);
        console.log('- Deferred prompt available:', !!this.deferredPrompt); // Fixed property name
        console.log('- Container display style:', this.installContainer?.style.display);
        console.log('- Button display style:', this.installButton?.style.display);
        
        // Check if installed through platform-specific APIs
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                console.log('- Installed related apps:', apps);
            });
        }
    }

    showInstallButton() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            if (this.installButton) {
                this.installButton.style.display = 'block';
            }
            console.log('Install button shown');
            this.debugInstallState(); // Add debug after showing
        }
    }

    init() {
        console.log('Initializing PWA installer');
        
        // Listen for 'beforeinstallprompt' event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show the install container
            this.showInstallPrompt();
            this.debugInstallState(); // Debug after prompt
        });

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Already in standalone mode');
            this.showInstalledMessage();
            return;
        }

        // Force show the install button for testing
        this.showInstallButton();

        // Handle install button click
        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                console.log('Install button clicked');
                this.installPWA();
            });
        }

        // Update message when app is installed
        window.addEventListener('appinstalled', (e) => {
            console.log('App installed event fired');
            this.showInstalledMessage();
        });
    }

    showInstallPrompt() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            if (this.installMessage) {
                this.installMessage.textContent = 'Get our app for a better experience';
            }
            if (this.installButton) {
                this.installButton.style.display = 'block';
            }
            requestAnimationFrame(() => {
                this.installContainer.classList.add('show');
            });
            console.log('Install prompt shown');
            this.debugInstallState();
        }
    }

    showInstalledMessage() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            if (this.installMessage) {
                this.installMessage.textContent = 'App is already installed';
            }
            if (this.installButton) {
                this.installButton.style.display = 'none';
            }
            requestAnimationFrame(() => {
                this.installContainer.classList.add('show');
            });
            console.log('Installed message shown');
            this.debugInstallState();
        }
    }

    async installPWA() {
        console.log('Installing PWA...');
        console.log('Deferred prompt available:', !!this.deferredPrompt);
        
        if (this.deferredPrompt) {
            try {
                // Show the install prompt
                this.deferredPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                
                // Clear the deferredPrompt
                this.deferredPrompt = null;
                
                // Show installed message if installation was successful
                if (outcome === 'accepted') {
                    this.showInstalledMessage();
                }
            } catch (error) {
                console.error('Error during PWA installation:', error);
            }
        } else {
            console.log('No deferred prompt available - cannot install');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - creating PWA installer');
    new PWAInstaller();
});
