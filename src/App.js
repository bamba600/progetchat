import Sidebar from './components/Sidebar.js';
import ContactPanel from './components/ContactPanel.js';
import ChatPanel from './components/ChatPanel.js';
import Login from './components/login.js';
import authService from './services/auth.js';

export default {
    template: `
        <div id="app-container">
            ${authService.isAuthenticated() ? `
                <div class="flex h-screen bg-white justify-center items-center">
                    <div class="flex h-[95%] w-[95%] shadow-[0px_0px_13px_-4px_#000000] rounded-tl-2xl rounded-bl-2xl">
                        ${Sidebar.template}
                        ${ContactPanel.template}
                        ${ChatPanel.template}
                    </div>
                </div>
            ` : Login.template}
        </div>
    `,
    init() {
        if (!authService.isAuthenticated()) {
            document.getElementById('app').innerHTML = Login.template;
        }
    }
};