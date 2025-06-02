class AuthService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Récupérer l'utilisateur du localStorage au démarrage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        // Initialiser le contact par défaut
        this.initializeDefaultContact();
    }

    login(phoneNumber) {
        if (!phoneNumber) return false;
        
        // Récupérer les contacts stockés
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const user = contacts.find(contact => contact.number === phoneNumber);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '/'; // Redirection vers la page de connexion
    }

    isAuthenticated() {
        return Boolean(this.currentUser);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    initializeDefaultContact() {
        let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        
        if (!contacts.some(contact => contact.number === '0000000000')) {
            const defaultUser = {
                firstName: 'Support',
                lastName: 'Technique',
                number: '0000000000'
            };
            
            contacts.push(defaultUser);
            localStorage.setItem('contacts', JSON.stringify(contacts));
        }
    }
}

export default new AuthService();