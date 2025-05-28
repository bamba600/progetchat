let contacts = [];
let groups = [];
let archivedContacts = [];
let selectedGroupIndex = null;

function hideAllForms() {
  document.getElementById('add-contact-form').classList.add('hidden');
  document.getElementById('contact-list').classList.add('hidden');
  document.getElementById('add-group-form').classList.add('hidden');
  document.getElementById('group-list').classList.add('hidden');
  document.getElementById('archived-contacts-list').classList.add('hidden');
  document.getElementById('group-members-form').classList.add('hidden');
}

function showAddContactForm() {
  hideAllForms();
  document.getElementById('add-contact-form').classList.remove('hidden');
}

function addContact(event) {
  event.preventDefault();
  const firstName = document.getElementById('contact-firstName').value;
  const lastName = document.getElementById('contact-lastName').value;
  const number = document.getElementById('contact-number').value;

  // Vérifier que le numéro ne contient que des chiffres
  if (!/^\d+$/.test(number)) {
    alert('Le numéro de téléphone ne doit contenir que des chiffres');
    return;
  }

  // Vérifier si le numéro existe déjà
  const numberExists = contacts.some(contact => contact.number === number);
  
  if (numberExists) {
    alert('Ce numéro est déjà attribué à un contact. Veuillez utiliser un autre numéro.');
    return;
  }

  // Vérifier si tous les champs sont renseignés
  if (firstName && lastName && number) {
    // Vérifier les doublons de noms et ajouter une numérotation si nécessaire
    let finalFirstName = firstName;
    let count = 1;
    
    while (contacts.some(contact => 
      contact.firstName === finalFirstName && 
      contact.lastName === lastName
    )) {
      finalFirstName = `${firstName} ${count}`;
      count++;
    }

    contacts.push({ 
      firstName: finalFirstName, 
      lastName, 
      number,
      originalFirstName: firstName // Garder le prénom original pour référence
    });

    alert(`Nouveau contact ajouté : ${finalFirstName} ${lastName}, ${number}`);
    document.getElementById('contact-firstName').value = '';
    document.getElementById('contact-lastName').value = '';
    document.getElementById('contact-number').value = '';
    hideAllForms();
    showContactList();
  } else {
    alert('Veuillez remplir tous les champs');
  }
}

function updateContactList() {
  const contactListDiv = document.getElementById('contact-list').querySelector('div');
  const isDiffusionMode = document.getElementById('show-contacts-button').classList.contains('bg-orange-300');
  
  contactListDiv.innerHTML = contacts.map((contact, index) => {
    const initials = (contact.firstName.charAt(0) + contact.lastName.charAt(0)).toUpperCase();
    
    return `
    <div class="flex rounded-lg ${isDiffusionMode ? 'border-r-2 border-b-2 border-orange-500' : ''} px-3 py-2 mb-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 contact-item">
      <div class="flex items-center gap-3 w-full">
        <div class="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 h-[45px] w-[45px] flex items-center justify-center text-white font-bold text-lg shadow-md">
          ${initials}
        </div>
        <div>
          <div class="font-medium text-gray-800">${contact.firstName} ${contact.lastName}</div>
          <div class="text-sm text-gray-600">${contact.number}</div>
        </div>
      </div>
      ${isDiffusionMode ? 
        `<div class="flex items-center">
          <input type="checkbox" class="h-4 w-4 text-blue-600 rounded" onchange="handleDiffusionSelection(${index})">
        </div>` 
        : ''
      }
    </div>
  `}).join('');

  // Gérer les événements de clic uniquement en mode Messages
  if (!isDiffusionMode) {
    const contactItems = contactListDiv.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        contactItems.forEach(contact => {
          contact.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
        });
        item.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
        displayConversation(index);
      });
    });
  }
}

// Ajouter cette nouvelle fonction pour gérer la sélection des contacts pour la diffusion
function handleDiffusionSelection(index) {
  // Cette fonction peut être utilisée plus tard pour gérer la sélection des contacts
  // pour l'envoi en diffusion
  console.log(`Contact ${index} sélectionné pour la diffusion`);
}

function displayConversation(contactId) {
  const contact = contacts[contactId];
  const conversationHeader = document.querySelector('.flex.gap-2.justify-center.items-center');
  
  // Mettre à jour l'en-tête de la conversation
  conversationHeader.innerHTML = `
    <div class="rounded-full bg-[#747474] h-[50px] w-[50px] flex items-center justify-center text-white font-bold">
      ${(contact.firstName.charAt(0) + contact.lastName.charAt(0)).toUpperCase()}
    </div>
    <div>${contact.firstName} ${contact.lastName}</div>
  `;

  // Ajouter l'ID du contact actif au bouton d'archive
  const archiveBtn = document.getElementById('conversation-archive-btn');
  archiveBtn.dataset.contactId = contactId;

  // Réinitialiser les événements d'archive
  initializeArchiveButton();
}

// Modifions la fonction initializeArchiveButton
function initializeArchiveButton() {
  const archiveBtn = document.getElementById('conversation-archive-btn');
  archiveBtn.onclick = () => {
    const contactId = archiveBtn.dataset.contactId;
    if (contactId !== undefined) {
      // Archiver le contact
      archiveContact(parseInt(contactId));
      
      // Effacer la conversation après l'archivage
      const conversationHeader = document.querySelector('.flex.gap-2.justify-center.items-center');
      conversationHeader.innerHTML = '<div class="rounded-full bg-[#747474] h-[50px] w-[50px]"></div><div>Sélectionnez un contact</div>';
      
      // Mettre à jour la liste des contacts
      updateContactList();
      
      // Afficher une notification
      alert(`Contact archivé avec succès. Consultez les archives pour le retrouver.`);
    }
  };
}

function showContactList() {
  hideAllForms();
  updateContactList();
  document.getElementById('contact-list').classList.remove('hidden');
}

function showGroupForm() {
  hideAllForms();
  document.getElementById('add-group-form').classList.remove('hidden');
}

function addGroup(event) {
  event.preventDefault();
  const name = document.getElementById('group-name').value;
  
  if (!name) {
    alert("Veuillez saisir un nom pour le groupe");
    return;
  }

  if (contacts.length === 0) {
    alert("Vous devez avoir au moins un contact disponible avant de créer un groupe");
    hideAllForms();
    return;
  }

  // Créer le groupe temporairement sans l'ajouter encore à la liste des groupes
  const adminUser = { name: 'Current User', number: 'Admin' };
  const newGroup = {
    name,
    admin: 'Current User',
    members: [adminUser]
  };

  // Forcer l'ajout immédiat d'au moins un membre
  selectedGroupIndex = groups.length;
  hideAllForms();
  
  // Sauvegarder temporairement le groupe
  const tempGroup = newGroup;
  
  // Afficher le formulaire de sélection des membres
  document.getElementById('member-selection').innerHTML = `
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Sélectionnez au moins un membre pour le groupe: ${name}</h3>
      <div class="max-h-40 overflow-y-auto border rounded p-2">
        ${contacts.map((contact, index) => `
          <div class="flex items-center mb-2">
            <input type="checkbox" 
                   id="contact-${index}"
                   class="mr-2 h-4 w-4 text-blue-600">
            <label for="contact-${index}" class="text-sm">
              ${contact.firstName} ${contact.lastName}
            </label>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="flex gap-2">
      <button onclick="confirmGroupCreation('${name}')" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Créer le groupe
      </button>
      <button onclick="cancelGroupCreation()" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
        Annuler
      </button>
    </div>
  `;
  
  document.getElementById('group-members-form').classList.remove('hidden');
}

// Ajouter ces nouvelles fonctions
function confirmGroupCreation(groupName) {
  const checkboxes = document.querySelectorAll('#member-selection input[type="checkbox"]:checked');
  
  if (checkboxes.length === 0) {
    alert('Veuillez sélectionner au moins un membre pour le groupe');
    return;
  }

  // Créer le groupe avec l'admin
  const adminUser = { name: 'Current User', number: 'Admin' };
  const newGroup = {
    name: groupName,
    admin: 'Current User',
    members: [adminUser]
  };

  // Ajouter les membres sélectionnés
  checkboxes.forEach((checkbox) => {
    const contactIndex = parseInt(checkbox.id.split('-')[1]);
    const contact = contacts[contactIndex];
    newGroup.members.push({
      firstName: contact.firstName,
      lastName: contact.lastName,
      number: contact.number
    });
  });

  // Ajouter le groupe à la liste des groupes
  groups.push(newGroup);
  
  alert(`Groupe "${groupName}" créé avec ${checkboxes.length} membre(s)`);
  document.getElementById('group-name').value = '';
  showGroupList();
}

function cancelGroupCreation() {
  document.getElementById('group-name').value = '';
  showGroupList();
}

function updateGroupList() {
  const groupListDiv = document.getElementById('group-list').querySelector('div');
  groupListDiv.innerHTML = groups.map((group, index) => `
    <div class="group flex flex-col mb-4 cursor-pointer">
      <div class="flex justify-between px-3 py-2 items-center gap-1 hover:bg-gray-100 rounded-lg transition-all duration-200">
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-[#747474] h-[50px] w-[50px] flex items-center justify-center text-white text-xl">
            ${group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold text-gray-800">${group.name}</div>
            <div class="text-xs text-gray-500">${group.members.length} membre(s)</div>
          </div>
        </div>
      </div>
      
      <!-- Boutons cachés qui apparaissent au clic -->
      <div class="hidden group-actions mx-3 mt-2 space-y-2">
        <button onclick="showAddMembersForm(${index})" 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200">
          Ajouter des membres
        </button>
        <button onclick="showGroupMembers(${index})" 
                class="w-full bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200">
          Voir les membres
        </button>
      </div>
    </div>
  `).join('');

  // Ajouter les écouteurs d'événements pour le clic
  const groupElements = groupListDiv.querySelectorAll('.group');
  groupElements.forEach(groupElement => {
    groupElement.querySelector(':first-child').addEventListener('click', () => {
      // Cacher d'abord tous les menus d'actions
      document.querySelectorAll('.group-actions').forEach(actions => {
        actions.classList.add('hidden');
      });
      // Afficher le menu d'actions du groupe cliqué
      const actions = groupElement.querySelector('.group-actions');
      actions.classList.toggle('hidden');
    });
  });
}

function showGroupList() {
  hideAllForms();
  updateGroupList();
  document.getElementById('group-list').classList.remove('hidden');
}

// Fonction archiveContact mise à jour
function archiveContact(index) {
  const contact = contacts[index];
  archivedContacts.push(contact);
  contacts.splice(index, 1);
  updateContactList();
  // Si on est dans la vue archives, mettre à jour la liste
  if (!document.getElementById('archived-contacts-list').classList.contains('hidden')) {
    updateArchivedContactsList();
  }
}

function unarchiveContact(index) {
  const contact = archivedContacts[index];
  contacts.push(contact);
  archivedContacts.splice(index, 1);
  
  // Mettre à jour les deux listes
  updateArchivedContactsList();
  updateContactList();
  
  // Afficher une notification
  alert(`Contact ${contact.firstName} ${contact.lastName} désarchivé avec succès !`);
}

function updateArchivedContactsList() {
  const archivedListDiv = document.getElementById('archived-contacts-list').querySelector('div');
  
  if (archivedContacts.length === 0) {
    archivedListDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun contact archivé</p>';
    return;
  }
  
  archivedListDiv.innerHTML = archivedContacts.map((contact, index) => {
    const initials = (contact.firstName.charAt(0) + contact.lastName.charAt(0)).toUpperCase();
    
    return `
    <div class="flex rounded-lg border-r-2 border-b-2 border-gray-300 px-3 py-2 mb-2 hover:bg-gray-50 transition-colors duration-200">
      <div class="flex items-center gap-3 w-full">
        <div class="rounded-full bg-gray-400 h-[45px] w-[45px] flex items-center justify-center text-white font-bold text-lg">
          ${initials}
        </div>
        <div>
          <div class="font-medium text-gray-800">${contact.firstName} ${contact.lastName}</div>
          <div class="text-sm text-gray-600">${contact.number}</div>
        </div>
      </div>
      <div class="flex items-center">
        <button onclick="unarchiveContact(${index})" 
                class="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg transition-colors duration-200">
          Désarchiver
        </button>
      </div>
    </div>
    `;
  }).join('');
}

function showArchivedContacts() {
  hideAllForms();
  const archivedContactsList = document.getElementById('archived-contacts-list');
  archivedContactsList.classList.remove('hidden');
  updateArchivedContactsList();
}

function showAddMembersForm(groupIndex) {
  selectedGroupIndex = groupIndex;
  hideAllForms();
  updateMemberSelectionList();
  document.getElementById('group-members-form').classList.remove('hidden');
}

function updateMemberSelectionList() {
  const memberSelectionDiv = document.getElementById('member-selection');
  if (contacts.length === 0) {
    memberSelectionDiv.innerHTML = '<p class="text-gray-500">Aucun contact disponible. Ajoutez d\'abord des contacts.</p>';
    return;
  }

  const group = groups[selectedGroupIndex];
  memberSelectionDiv.innerHTML = `
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Ajouter des membres au groupe: ${group.name}</h3>
      <div class="max-h-40 overflow-y-auto border rounded p-2">
        ${contacts.map((contact, index) => {
          // Vérifier si le contact est déjà membre en comparant le numéro de téléphone
          const isAlreadyMember = group.members.some(member => 
            member.number === contact.number
          );
          return `
            <div class="flex items-center mb-2 ${isAlreadyMember ? 'opacity-50' : ''}">
              <input type="checkbox" 
                     id="contact-${index}" 
                     ${isAlreadyMember ? 'disabled checked' : ''} 
                     class="mr-2 h-4 w-4 text-blue-600">
              <label for="contact-${index}" class="text-sm">
                ${contact.firstName} ${contact.lastName} ${isAlreadyMember ? '(Déjà membre)' : ''}
              </label>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="flex gap-2">
      <button onclick="addSelectedMembers()" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Ajouter Sélectionnés
      </button>
      <button onclick="cancelAddMembers()" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
        Annuler
      </button>
    </div>
  `;
}

function addSelectedMembers() {
  if (selectedGroupIndex === null) return;
  
  const group = groups[selectedGroupIndex];
  const checkboxes = document.querySelectorAll('#member-selection input[type="checkbox"]:checked:not(:disabled)');
  
  // Vérifier si au moins un membre est sélectionné
  if (checkboxes.length === 0) {
    alert('Veuillez sélectionner au moins un membre pour le groupe.');
    return;
  }
  
  let addedCount = 0;
  checkboxes.forEach((checkbox) => {
    const contactIndex = parseInt(checkbox.id.split('-')[1]);
    const contact = contacts[contactIndex];
    
    // Vérifier si le contact n'est pas déjà membre en utilisant le numéro
    if (!group.members.some(member => member.number === contact.number)) {
      group.members.push({
        firstName: contact.firstName,
        lastName: contact.lastName,
        number: contact.number
      });
      addedCount++;
    }
  });

  if (group.members.length < 2) { // Admin + au moins un membre
    alert('Le groupe doit avoir au moins un membre en plus de l\'admin.');
    // Supprimer le groupe si pas assez de membres
    groups.pop();
    showGroupList();
    return;
  }
  
  if (addedCount > 0) {
    alert(`${addedCount} membre(s) ajouté(s) au groupe ${group.name}`);
    showGroupList();
  } else {
    alert('Aucun nouveau membre sélectionné.');
  }
}

// Nouvelle fonction pour gérer le bouton Annuler
function cancelAddMembers() {
  showGroupList();
}

function showGroupMembers(groupIndex) {
  const group = groups[groupIndex];
  hideAllForms();
  
  const memberSelectionDiv = document.getElementById('member-selection');
  memberSelectionDiv.innerHTML = `
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Membres du groupe: ${group.name}</h3>
      <div class="text-sm text-gray-600 mb-3">Admin: ${group.admin}</div>
      ${group.members.length === 0 ? 
        '<p class="text-gray-500">Aucun membre dans ce groupe.</p>' :
        `<div class="max-h-40 overflow-y-auto border rounded p-2">
          ${group.members.map((member, index) => `
            <div class="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
              <div>
                <div class="font-medium">
                  ${member.number === 'Admin' ? 
                    member.name : 
                    `${member.firstName} ${member.lastName}`
                  }
                  ${member.number === 'Admin' ? '(Admin)' : ''}
                </div>
                <div class="text-sm text-gray-600">${member.number}</div>
              </div>
              ${member.number !== 'Admin' ? 
                `<button onclick="removeMember(${groupIndex}, ${index})" class="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">
                  Retirer
                </button>` : 
                '<span class="text-xs text-gray-500">Admin</span>'
              }
            </div>
          `).join('')}
        </div>`
      }
    </div>
    <div class="flex gap-2">
      <button onclick="showAddMembersForm(${groupIndex})" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Ajouter Membres
      </button>
      <button onclick="returnToGroupList()" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
        Retour
      </button>
    </div>
  `;
  
  document.getElementById('group-members-form').classList.remove('hidden');
}

// Nouvelle fonction pour gérer le bouton Retour
function returnToGroupList() {
  showGroupList();
}

function removeMember(groupIndex, memberIndex) {
  const group = groups[groupIndex];
  const member = group.members[memberIndex];
  
  // Empêcher la suppression de l'admin
  if (member.number === 'Admin') {
    alert('Impossible de retirer l\'administrateur du groupe.');
    return;
  }
  
  const memberName = `${member.firstName} ${member.lastName}`;
  if (confirm(`Voulez-vous retirer ${memberName} du groupe ${group.name} ?`)) {
    group.members.splice(memberIndex, 1);
    alert(`${memberName} a été retiré du groupe.`);
    showGroupMembers(groupIndex);
  }
}

function handleGroupsButton() {
  // Si aucun groupe n'existe, afficher le formulaire d'ajout
  if (groups.length === 0) {
    showGroupForm();
  } else {
    // Si des groupes existent, afficher la liste
    showGroupList();
  }
}

function initializeEventListeners() {
  const buttons = document.querySelectorAll('.cursor-pointer');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('bg-orange-300'));
      button.classList.add('bg-orange-300');
    });
  });

  // Event listeners pour les contacts
  document.getElementById('add-contact-button').addEventListener('click', showAddContactForm);
  
  // Modifier l'event listener pour le bouton Diffusion
  document.getElementById('show-contacts-button').addEventListener('click', () => {
    if (contacts.length === 0) {
      hideAllForms();
      
    } else {
      showContactList();
    }
  });

  // Event listeners pour les groupes
  document.getElementById('groups-button').addEventListener('click', handleGroupsButton);

  // Event listener pour le bouton Messages
  document.getElementById('messages-button').addEventListener('click', () => {
    hideAllForms();
    updateContactList();
    document.getElementById('contact-list').classList.remove('hidden');
  });

  // Event listener pour le bouton Archives
  document.getElementById('archives-button').addEventListener('click', () => {
    if (archivedContacts.length === 0) {
      //alert('Aucun contact archivé. Archivez d\'abord un contact.');
      hideAllForms();
    } else {
      showArchivedContacts();
    }
  });

  // Ajouter un bouton pour basculer entre formulaire et liste de groupes
  // On peut ajouter cette fonctionnalité avec un double-clic ou un menu contextuel
  document.getElementById('groups-button').addEventListener('dblclick', () => {
    if (groups.length > 0) {
      showGroupForm();
    }
  });

  // Event listeners pour les formulaires
  document.getElementById('contact-form').addEventListener('submit', addContact);
  document.getElementById('group-form').addEventListener('submit', addGroup);

  // Initialiser le bouton d'archive dans la conversation
  initializeArchiveButton();
}

// Rendre les fonctions globales pour les boutons onclick
window.archiveContact = archiveContact;
window.unarchiveContact = unarchiveContact;
window.showAddMembersForm = showAddMembersForm;
window.addSelectedMembers = addSelectedMembers;
window.showGroupMembers = showGroupMembers;
window.removeMember = removeMember;
window.cancelAddMembers = cancelAddMembers;
window.returnToGroupList = returnToGroupList;
window.handleDiffusionSelection = handleDiffusionSelection;
window.confirmGroupCreation = confirmGroupCreation;
window.cancelGroupCreation = cancelGroupCreation;

// Exporter les fonctions nécessaires
export { initializeEventListeners };