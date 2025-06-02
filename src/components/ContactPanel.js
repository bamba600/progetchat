export default {
  template: `
    <div class="bg-[#f9f7f5] w-[30%] flex flex-col gap-2 h-full">
        <div class="p-5 text-[20px]">
            Discussions
        </div>
        <div class="w-[93%]">
            <input type="text" 
                   id="contact-search" 
                   placeholder="Rechercher (* pour tout afficher)" 
                   class="w-full mx-5 rounded-[15px] h-[30px] p-3 text-black"
                   onkeyup="filterContacts(this.value)"/>
        </div>
        <div id="add-contact-form" class="hidden p-5">
            <form id="contact-form">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contact-firstName">
                        Prénom
                    </label>
                    <input id="contact-firstName" type="text" placeholder="Prénom du contact" 
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contact-lastName">
                        Nom
                    </label>
                    <input id="contact-lastName" type="text" placeholder="Nom du contact" 
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contact-number">
                        Numéro
                    </label>
                    <input id="contact-number" type="text" placeholder="Numéro du contact" 
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Ajouter
                    </button>
                </div>
            </form>
        </div>
        <div id="contact-list" class="hidden p-5">
            <div class="flex flex-col gap-2">
                <!-- Contacts will be dynamically added here -->
            </div>
        </div>
        <div id="add-group-form" class="hidden p-5">
            <form id="group-form">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="group-name">
                        Nom du Groupe
                    </label>
                    <input id="group-name" type="text" placeholder="Nom du groupe" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Ajouter
                    </button>
                </div>
            </form>
        </div>
        <div id="group-list" class="hidden p-5">
            <div class="flex flex-col gap-2">
                <!-- Groupes seront ajoutés dynamiquement ici -->
            </div>
        </div>
        <div id="archived-contacts-list" class="hidden p-5">
            <div class="mb-3 text-lg font-semibold text-gray-600">Contacts Archivés</div>
            <div class="flex flex-col gap-2">
                <!-- Contacts archivés seront ajoutés dynamiquement ici -->
            </div>
        </div>
        <div id="group-members-form" class="hidden p-5">
            <div id="member-selection">
                <!-- Interface de sélection des membres sera ajoutée dynamiquement ici -->
            </div>
        </div>
    </div>
  `
};