import Sidebar from './components/Sidebar.js';
import ContactPanel from './components/ContactPanel.js';
import ChatPanel from './components/ChatPanel.js';

export default {
  template: `
    <div class="flex h-screen bg-white justify-center items-center">
        <div class="flex h-[95%] w-[95%] shadow-[0px_0px_13px_-4px_#000000] rounded-tl-2xl rounded-bl-2xl">
            ${Sidebar.template}
            ${ContactPanel.template}
            ${ChatPanel.template}
        </div>
    </div>
  `
};