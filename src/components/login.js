import authService from '../services/auth.js';

export default {
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gray-100">
            <div class="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="phone">
                            Numéro de téléphone
                        </label>
                        <input 
                            id="phone" 
                            type="tel" 
                            pattern="[0-9]*"
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Entrez votre numéro de téléphone"
                            required
                        >
                    </div>
                    <div id="error-message" class="text-red-500 text-sm hidden">
                        Numéro de téléphone non trouvé
                    </div>
                    <button 
                        type="submit"
                        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    `
};

export function initializeLogin() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const phoneInput = document.getElementById('phone');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phoneNumber = phoneInput.value.trim();

            if (authService.login(phoneNumber)) {
                errorMessage.classList.add('hidden');
                window.location.reload();
            } else {
                errorMessage.classList.remove('hidden');
            }
        });
    }
}