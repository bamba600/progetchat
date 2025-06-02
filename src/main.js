import App from './App.js';
import './index.css';
import { initializeEventListeners } from './functions.js';
import { initializeLogin } from './components/login.js';
import authService from './services/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Injecter le template dans le DOM
    document.getElementById('app').innerHTML = App.template;

    // Initialiser les écouteurs d'événements en fonction de l'état d'authentification
    if (authService.isAuthenticated()) {
        initializeEventListeners();
    } else {
        initializeLogin();
    }
});