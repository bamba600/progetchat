import App from './App.js';
import './index.css';
import { initializeEventListeners } from './functions.js';

// Injecter le template dans le DOM
document.getElementById('app').innerHTML = App.template;

// Initialiser les écouteurs d'événements APRÈS que le template soit injecté
initializeEventListeners();