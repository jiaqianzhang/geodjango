// Global event capture
let deferredPromptEvent = null;

// Add diagnostic information
const checkInstallationCriteria = () => {
    const criteria = {
        isHttps: window.location.protocol === 'https:',
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent),
        isChrome: /Chrome/.test(navigator.userAgent)
    };
    console.log('PWA Installation Criteria:', criteria);
    return criteria;
};

// Capture the event globally
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Global beforeinstallprompt captured');
    e.preventDefault();
    deferredPromptEvent = e;
});

class PWAInstaller {
    constructor() {
        console.log('PWA Installer initialized');
        this.deferredPrompt = null;
        this.installContainer = document.getElementById('pwaInstallContainer');
        this.installButton = document.getElementById('pwaInstallBtn');
        this.installMessage = this.installContainer?.querySelector('p');
        
        // Check installation criteria immediately
        this.criteria = checkInstallationCriteria();
        
        this.init();
        this.debugInstallState(); // This call needs the method below
    }

    // Add back the debugInstallState method
    debugInstallState() {
        console.log('Debugging PWA install state:');
        console.log('- In standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
        console.log('- Install button exists:', !!this.installButton);
        console.log('- Install container exists:', !!this.installContainer);
        console.log('- Deferred prompt available:', !!this.deferredPrompt);
        console.log('- Container display style:', this.installContainer?.style.display);
        console.log('- Button display style:', this.installButton?.style.display);
        
        // Check if installed through platform-specific APIs
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                console.log('- Installed related apps:', apps);
            });
        }
    }

    init() {
        console.log('Initializing PWA installer');

        // Check if already installed
        if (this.criteria.isStandalone) {
            console.log('App is already in standalone mode');
            this.showInstalledMessage();
            return;
        }

        // Platform-specific checks
        if (this.criteria.isIOS && this.criteria.isSafari) {
            console.log('iOS device detected - showing iOS install instructions');
            this.showIOSInstructions();
            return;
        }

        // Listen for the install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event captured in init');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // If we already captured the prompt globally, use it
        if (deferredPromptEvent) {
            console.log('Using previously captured install prompt');
            this.deferredPrompt = deferredPromptEvent;
            this.showInstallPrompt();
        }

        // Listen for successful installation
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            this.showInstalledMessage();
        });

        this.installButton?.addEventListener('click', () => {
            console.log('Install button clicked');
            this.installPWA();
        });

        // Debug current state
        this.debugInstallState();
    }

    showIOSInstructions() {
        if (this.installContainer && this.installMessage) {
            this.installMessage.textContent = 'To install: tap Share then Add to Home Screen';
            this.installContainer.style.display = 'block';
        }
    }

    async installPWA() {
        console.log('Installing PWA...');
        console.log('Installation state:', {
            hasPrompt: !!this.deferredPrompt,
            criteria: this.criteria
        });

        if (!this.deferredPrompt) {
            console.log('No deferred prompt available - checking browser support');
            
            // Check if browser supports PWA installation
            if ('getInstalledRelatedApps' in navigator) {
                try {
                    const relatedApps = await navigator.getInstalledRelatedApps();
                    console.log('Related apps:', relatedApps);
                } catch (error) {
                    console.error('Error checking installed apps:', error);
                }
            }
            
            return;
        }

        try {
            console.log('Triggering install prompt...');
            await this.deferredPrompt.prompt();
            
            const choiceResult = await this.deferredPrompt.userChoice;
            console.log('User install choice:', choiceResult.outcome);
            
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted installation');
                this.showInstalledMessage();
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('Installation error:', error);
        }
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
