// pwa-install.js
console.log('PWA Installer loaded - version 1'); // Change this number to verify you're getting the new file

class PWAInstaller {
    constructor() {
        console.log('PWA Installer initialized'); // Add this to verify the class is instantiated
        this.deferredPrompt = null;
        this.installContainer = document.getElementById('pwaInstallContainer');
        this.installButton = document.getElementById('pwaInstallBtn');
        this.installMessage = this.installContainer?.querySelector('p');
        this.init();
        this.debugInstallState(); // Add this
    }

    debugInstallState() {
        console.log('Debugging PWA install state:');
        console.log('- In standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
        console.log('- Install button exists:', !!this.installButton);
        console.log('- Install container exists:', !!this.installContainer);
        console.log('- Install prompt available:', !!this.installPrompt);
        
        // Check if installed through platform-specific APIs
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                console.log('- Installed related apps:', apps);
            });
        }
    }
    showInstallButton() {
        if (this.installContainer) {
            // Force show for testing
            this.installContainer.style.display = 'block';
            console.log('Install button shown');
        }
    }

    init() {
        // Force show the install button for testing
        this.showInstallButton();
        // Check if the app is already installed first
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.showInstalledMessage();
            console.log('Already running in standalone mode');
            return;
        }

        // Listen for 'beforeinstallprompt' event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show the install container with animation
            this.showInstallPrompt();
        });

        // Handle install button click
        this.installButton?.addEventListener('click', () => this.installPWA());

        // Update message when app is installed
        window.addEventListener('appinstalled', () => {
            this.showInstalledMessage();
        });
    }

    showInstallPrompt() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            this.installMessage.textContent = 'Get our app for a better experience';
            this.installButton.style.display = 'block';
            requestAnimationFrame(() => {
                this.installContainer.classList.add('show');
            });
        }
    }

    showInstalledMessage() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            this.installMessage.textContent = 'App is already installed';
            this.installButton.style.display = 'none';
            requestAnimationFrame(() => {
                this.installContainer.classList.add('show');
            });
        }
    }

    async installPWA() {
        if (this.deferredPrompt) {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            try {
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
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
});
