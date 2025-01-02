// Global event capture - must be at the very top of the file
let deferredPromptEvent = null;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Global beforeinstallprompt captured');
    e.preventDefault();
    deferredPromptEvent = e;
});

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

class PWAInstaller {
    constructor() {
        console.log('PWA Installer initialized');
        this.deferredPrompt = deferredPromptEvent; // Use the globally captured event
        this.installContainer = document.getElementById('pwaInstallContainer');
        this.installButton = document.getElementById('pwaInstallBtn');
        this.installMessage = this.installContainer?.querySelector('p');
        
        this.criteria = checkInstallationCriteria();
        this.init();
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
        async init() {
            console.log('Initializing PWA installer');
    
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('Already in standalone mode');
                this.showInstalledMessage();
                return;
            }
    
            // Check if installable
            const isInstallable = await this.checkInstallability();
            if (!isInstallable) {
                console.log('App is not installable at the moment');
                this.showManualInstallInstructions();
                return;
            }
    
            // Listen for the install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                console.log('beforeinstallprompt event captured in init');
                e.preventDefault();
                this.deferredPrompt = e;
                this.showInstallPrompt();
            });
    
            // Handle install button click
            if (this.installButton) {
                this.installButton.addEventListener('click', () => {
                    console.log('Install button clicked');
                    this.installPWA();
                });
            }
    
            // Show initial state
            if (this.deferredPrompt) {
                this.showInstallPrompt();
            } else {
                this.showManualInstallInstructions();
            }
    
            this.debugInstallState();
        }
    
        async checkInstallability() {
            // Check basic criteria
            const basicCriteriaMet = 
                this.criteria.isHttps && 
                this.criteria.hasServiceWorker && 
                this.criteria.hasManifest;
    
            if (!basicCriteriaMet) {
                console.log('Basic installation criteria not met');
                return false;
            }
    
            // Check if already installed
            if ('getInstalledRelatedApps' in navigator) {
                try {
                    const relatedApps = await navigator.getInstalledRelatedApps();
                    if (relatedApps.length > 0) {
                        console.log('App is already installed');
                        return false;
                    }
                } catch (error) {
                    console.error('Error checking installed apps:', error);
                }
            }
    
            return true;
        }
    
        showManualInstallInstructions() {
            if (this.installContainer) {
                this.installContainer.style.display = 'block';
                if (this.installMessage) {
                    if (this.criteria.isIOS) {
                        this.installMessage.textContent = 'To install: tap Share then Add to Home Screen';
                    } else {
                        this.installMessage.textContent = 'To install: click the menu button (⋮) and select "Install app"';
                    }
                }
                if (this.installButton) {
                    this.installButton.textContent = 'Install from Browser Menu';
                }
            }
        }
    
        async installPWA() {
            console.log('Installing PWA...');
            console.log('Installation state:', {
                hasPrompt: !!this.deferredPrompt,
                criteria: this.criteria
            });
    
            if (!this.deferredPrompt) {
                console.log('No deferred prompt available - showing manual instructions');
                this.showManualInstallInstructions();
                return;
            }
    
            try {
                await this.deferredPrompt.prompt();
                const choiceResult = await this.deferredPrompt.userChoice;
                console.log('User install choice:', choiceResult.outcome);
                
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted installation');
                    this.showInstalledMessage();
                } else {
                    console.log('User declined installation');
                    this.showManualInstallInstructions();
                }
                
                this.deferredPrompt = null;
            } catch (error) {
                console.error('Installation error:', error);
                this.showManualInstallInstructions();
            }
        }

    showInstallButton() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
            if (this.installButton) {
                this.installButton.style.display = 'block';
            }
            console.log('Install button shown');
            this.debugInstallState();
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
        if (this.criteria.isIOS) {
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

        // Handle install button click
        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                console.log('Install button clicked');
                this.installPWA();
            });
        }

        // Listen for successful installation
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            this.showInstalledMessage();
        });

        // Show install UI if we meet the criteria
        if (!this.criteria.isStandalone && !this.criteria.isIOS) {
            this.showInstallButton();
        }

        this.debugInstallState();
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
            console.log('Install prompt shown');
            this.debugInstallState();
        }
    }

    async installPWA() {
        console.log('Installing PWA...');
        console.log('Installation state:', {
            hasPrompt: !!this.deferredPrompt,
            criteria: this.criteria
        });

        if (!this.deferredPrompt) {
            console.log('No deferred prompt available - showing manual instructions');
            if (this.installMessage) {
                this.installMessage.textContent = 'Click the menu button (⋮) in your browser and select "Install app"';
            }
            return;
        }

        try {
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
    }

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - creating PWA installer');
    new PWAInstaller();
});