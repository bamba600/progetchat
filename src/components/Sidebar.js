import authService from '../services/auth.js';

export default {
  template: `
    <div class="bg-[#f0efe8] w-[7%] h-full rounded-tl-2xl rounded-bl-2xl flex justify-center items-center flex-col gap-5">
        <div class="flex flex-col border-[2px] border-solid border-[#d8d7b9] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="messages-button">
            <img src="images/mess.svg" class="h-8"/>
            <div>Messages</div>
        </div>
        <div class="flex flex-col border-[2px] border-solid border-[#d8d7b9] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="groups-button">
            <img src="images/group.svg" class="h-8"/>
            <div>Groupes</div>
        </div>
        <div class="flex flex-col border-[2px] border-solid border-[#d8d7b9] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="show-contacts-button">
            <img src="images/group.svg" class="h-8"/>
            <div>Diffusions</div>
        </div>
        <div class="flex flex-col border-[2px] border-solid border-[#d8d7b9] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="archives-button">
            <img src="images/ar.svg" class="h-8"/>
            <div>Archives</div>
        </div>
        <div class="flex flex-col border-[2px] border-solid border-[#d8d7b9] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="add-contact-button">
            <img src="images/aj.svg" class="h-8"/>
            <div>Nouveau</div>
        </div>
        <div class="flex flex-col border-[2px] border-solid border-[red] h-[100px] w-[100px] justify-center items-center rounded-xl cursor-pointer" id="logout-button" onclick="handleLogout()">
            <img src="images/logout.svg" class="h-8"/>
            <div>Déconnexion</div>
        </div>
    </div>
  `
};

// Ajouter cette fonction au niveau global
window.handleLogout = function() {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      authService.logout();
  }
};