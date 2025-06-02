let contacts = [];
let groups = [];
let archivedContacts = [];
let selectedGroupIndex = null;
let drafts = {}; // Ajouter cette variable au début du fichier

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

  // Récupérer les contacts existants du localStorage
  let storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');

  // Vérifier si le numéro existe déjà
  const numberExists = storedContacts.some(contact => contact.number === number);
  
  if (numberExists) {
    alert('Ce numéro est déjà attribué à un contact. Veuillez utiliser un autre numéro.');
    return;
  }

  // Vérifier si tous les champs sont renseignés
  if (firstName && lastName && number) {
    // Vérifier les doublons de noms et ajouter une numérotation si nécessaire
    let finalFirstName = firstName;
    let count = 1;
    
    while (storedContacts.some(contact => 
      contact.firstName === finalFirstName && 
      contact.lastName === lastName
    )) {
      finalFirstName = `${firstName} ${count}`;
      count++;
    }

    const newContact = { 
      firstName: finalFirstName, 
      lastName, 
      number,
      originalFirstName: firstName
    };

    // Ajouter le contact à la liste locale
    contacts.push(newContact);

    // Ajouter le contact au localStorage
    storedContacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(storedContacts));

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
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const messages = JSON.parse(localStorage.getItem('messages') || '{}');
  
  const contactsToDisplay = isDiffusionMode ? 
    contacts : 
    contacts.filter(contact => {
      const conversationKey = [currentUser.number, contact.number].sort().join('-');
      return messages[conversationKey] && messages[conversationKey].length > 0;
    });

  if (contactsToDisplay.length === 0) {
    contactListDiv.innerHTML = `
      <p class="text-gray-500 text-center py-4">
        ${isDiffusionMode ? 'Aucun contact disponible.' : 'Aucune conversation. Utilisez la recherche avec "*" pour voir tous vos contacts.'}
      </p>`;
    return;
  }

  contactListDiv.innerHTML = contactsToDisplay.map((contact, index) => {
    const initials = `${contact.firstName.charAt(0).toUpperCase()}${contact.lastName.charAt(0).toUpperCase()}`;
    const conversationKey = [currentUser.number, contact.number].sort().join('-');
    const lastMessage = messages[conversationKey] ? 
      messages[conversationKey][messages[conversationKey].length - 1] : null;
    const hasDraft = !isDiffusionMode && drafts[contact.number] ? true : false;
    
    // Formatter l'heure du dernier message seulement si on n'est pas en mode diffusion
    const messageTime = !isDiffusionMode && lastMessage ? 
      new Date(lastMessage.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }) : '';

    return `
      <div class="flex rounded-lg ${isDiffusionMode ? 'border-r-2 border-b-2 border-orange-500' : ''} px-3 py-2 mb-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 contact-item"
           data-contact-index="${contacts.findIndex(c => c.number === contact.number)}" 
           data-contact-number="${contact.number}">
        <div class="flex items-center gap-3 w-full">
          <div class="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 h-[45px] w-[45px] flex items-center justify-center text-white font-bold text-lg shadow-md">
            ${initials}
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <div class="font-medium text-gray-800">${contact.firstName} ${contact.lastName}</div>
              ${!isDiffusionMode && messageTime ? `<div class="text-xs text-gray-500">${messageTime}</div>` : ''}
            </div>
            <div class="flex items-center justify-between">
              <div class="text-sm ${!lastMessage?.read && lastMessage?.recipient === currentUser.number ? 'text-gray-800 font-semibold' : 'text-gray-600'}">
                ${isDiffusionMode ? contact.number : 
                  hasDraft ? 
                    `<span class="text-xs italic text-orange-500 font-medium">Brouillon: ${drafts[contact.number].substring(0, 30)}${drafts[contact.number].length > 30 ? '...' : ''}</span>` :
                  lastMessage ? 
                    `<span class="text-xs">${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}</span>` : 
                    contact.number}
              </div>
              ${!isDiffusionMode && (lastMessage && !lastMessage.read && lastMessage.recipient === currentUser.number) ? 
                '<div class="w-3 h-3 bg-green-500 rounded-full"></div>' : 
                hasDraft ? '<div class="text-xs text-orange-500 font-medium">brouillon</div>' : ''}
            </div>
          </div>
        </div>
        ${isDiffusionMode ? `
          <div class="flex items-center">
            <div class="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center diffusion-checkbox">
              <div class="hidden w-4 h-4 bg-blue-500 rounded-full check-mark"></div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Gérer les événements de clic
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      if (isDiffusionMode) {
        const checkMark = item.querySelector('.check-mark');
        if (checkMark) {
          checkMark.classList.toggle('hidden');
          updateDiffusionHeader(); // Appel de la nouvelle fonction
        }
      } else {
        contactItems.forEach(contact => {
          contact.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
        });
        
        item.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
        
        const contactIndex = item.dataset.contactIndex;
        const contactNumber = item.dataset.contactNumber;
        displayConversation(contactIndex);
        displayConversationMessages(contactNumber);
        setupMessageInput(contactNumber);
      }
    });
  });
}

function setupMessageInput(recipientNumber) {
  const messageInput = document.querySelector('input[placeholder="Tapez votre message..."]');
  const sendButton = messageInput.nextElementSibling;
  const isDiffusionMode = document.getElementById('show-contacts-button').classList.contains('bg-orange-300');

  // Sauvegarder le brouillon du contact précédent si nécessaire
  const previousInput = messageInput.value.trim();
  const previousRecipient = messageInput.dataset.currentRecipient;
  if (previousInput && previousRecipient && previousRecipient !== recipientNumber) {
    drafts[previousRecipient] = previousInput;
    updateContactList();
  }

  // Mettre à jour le recipient courant
  messageInput.dataset.currentRecipient = recipientNumber;

  // Charger le brouillon existant s'il y en a un
  messageInput.value = getDraft(recipientNumber);

  const sendMessageHandler = () => {
    const content = messageInput.value.trim();
    if (content) {
      if (isDiffusionMode) {
        handleDiffusionSelection();
      } else {
        sendMessage(recipientNumber, content);
        messageInput.value = '';
        // Supprimer le brouillon après l'envoi
        delete drafts[recipientNumber];
        // Mettre à jour l'affichage immédiatement
        updateContactList();
      }
    }
  };

  // Supprimer les anciens event listeners
  messageInput.removeEventListener('keypress', messageInput._keypressHandler);
  messageInput.removeEventListener('input', messageInput._inputHandler);
  sendButton.removeEventListener('click', sendButton._clickHandler);

  // Ajouter les nouveaux event listeners
  messageInput._keypressHandler = (e) => {
    if (e.key === 'Enter') {
      sendMessageHandler();
    }
  };
  
  // Gestionnaire d'événement input pour gérer les brouillons
  messageInput._inputHandler = () => {
    const content = messageInput.value.trim();
    if (content === '') {
      // Si le message est vide, supprimer le brouillon
      delete drafts[recipientNumber];
    } else {
      // Sinon, sauvegarder le brouillon
      drafts[recipientNumber] = content;
    }
    updateContactList();
  };
  
  sendButton._clickHandler = sendMessageHandler;

  messageInput.addEventListener('keypress', messageInput._keypressHandler);
  messageInput.addEventListener('input', messageInput._inputHandler);
  sendButton.addEventListener('click', sendButton._clickHandler);
}

function setupGroupMessageInput(groupId) {
  const messageInput = document.querySelector('input[placeholder="Tapez votre message..."]');
  const sendButton = messageInput.nextElementSibling;

  if (!messageInput || !sendButton) return;

  const sendMessageHandler = () => {
    const content = messageInput.value.trim();
    if (content && groupId) {
      sendGroupMessage(groupId, content);
      messageInput.value = '';
    }
  };

  // Supprimer les anciens event listeners
  messageInput.removeEventListener('keypress', messageInput._keypressHandler);
  sendButton.removeEventListener('click', sendButton._clickHandler);

  // Ajouter les nouveaux event listeners
  messageInput._keypressHandler = (e) => {
    if (e.key === 'Enter') {
      sendMessageHandler();
    }
  };
  sendButton._clickHandler = sendMessageHandler;

  messageInput.addEventListener('keypress', messageInput._keypressHandler);
  sendButton.addEventListener('click', sendButton._clickHandler);
}

function displayConversation(contactId) {
  const contact = contacts[contactId];
  const conversationHeader = document.querySelector('.flex.gap-2.justify-center.items-center');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (conversationHeader && contact) {
    // Vérifier si le contact est l'utilisateur connecté
    const isCurrentUser = contact.number === currentUser.number;
    
    conversationHeader.innerHTML = `
      <div class="rounded-full bg-[#747474] h-[50px] w-[50px] flex items-center justify-center text-white font-bold">
        ${isCurrentUser ? 'V' : `${contact.firstName.charAt(0).toUpperCase()}${contact.lastName.charAt(0).toUpperCase()}`}
      </div>
      <div class="font-semibold">${isCurrentUser ? 'Vous' : `${contact.firstName} ${contact.lastName}`}</div>
    `;

    const archiveBtn = document.getElementById('conversation-archive-btn');
    if (archiveBtn) {
      archiveBtn.dataset.contactId = contactId;
    }
  }
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

// Modifier la fonction addGroup pour utiliser l'utilisateur connecté comme admin
function addGroup(event) {
  event.preventDefault();
  const name = document.getElementById('group-name').value;
  
  if (!name) {
    alert('Veuillez entrer un nom pour le groupe');
    return;
  }

  if (contacts.length === 0) {
    alert('Vous devez avoir des contacts avant de créer un groupe');
    return;
  }

  // Récupérer l'utilisateur connecté depuis le service d'authentification
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Créer le groupe avec l'utilisateur connecté comme admin
  const newGroup = {
    name,
    admin: `${currentUser.firstName} ${currentUser.lastName}`,
    adminNumber: currentUser.number, // Ajouter le numéro de l'admin pour identification
    members: [{
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      number: currentUser.number,
      role: 'superadmin'
    }]
  };

  selectedGroupIndex = groups.length;
  hideAllForms();

  // Afficher le formulaire de sélection des membres
  document.getElementById('member-selection').innerHTML = `
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Sélectionnez au moins un membre pour le groupe: ${name}</h3>
      <div class="max-h-40 overflow-y-auto border rounded p-2">
        ${contacts.map((contact, index) => `
          <div class="flex items-center mb-2">
            <input type="checkbox" 
                   id="contact-${index}"
                   class="mr-2 h-4 w-4 text-blue-600"
                   ${contact.number === currentUser.number ? 'checked disabled' : ''}>
            <label for="contact-${index}" class="text-sm">
              ${contact.firstName} ${contact.lastName}
              ${contact.number === currentUser.number ? ' (Admin)' : ''}
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

// Modifier la fonction confirmGroupCreation
function confirmGroupCreation(groupName) {
  const checkboxes = document.querySelectorAll('#member-selection input[type="checkbox"]:checked:not(:disabled)');
  
  // Vérifier qu'au moins un membre (en plus de l'admin) est sélectionné
  if (checkboxes.length === 0) {
    alert('Veuillez sélectionner au moins un membre pour le groupe');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Créer le groupe avec l'utilisateur connecté comme admin
  const newGroup = {
    name: groupName,
    admin: `${currentUser.firstName} ${currentUser.lastName}`,
    adminNumber: currentUser.number,
    members: [{
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      number: currentUser.number,
      role: 'superadmin'
    }]
  };

  // Ajouter les membres sélectionnés
  checkboxes.forEach((checkbox) => {
    const contactIndex = parseInt(checkbox.id.split('-')[1]);
    const contact = contacts[contactIndex];
    
    // Ne pas ajouter l'admin deux fois
    if (contact.number !== currentUser.number) {
      newGroup.members.push({
        ...contact,
        role: 'member'
      });
    }
  });

  // Vérifier que le groupe a au moins 2 membres (admin + 1 membre)
  if (newGroup.members.length < 2) {
    alert('Un groupe doit avoir au moins un membre en plus de l\'administrateur');
    return;
  }

  // Ajouter le groupe à la liste
  groups.push(newGroup);
  saveGroups();
  
  alert(`Groupe "${groupName}" créé avec ${newGroup.members.length} membre(s)`);
  document.getElementById('group-name').value = '';
  showGroupList();
}

function cancelGroupCreation() {
  document.getElementById('group-name').value = '';
  showGroupList();
}

function updateGroupList() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const groupListDiv = document.getElementById('group-list').querySelector('div');
  
  if (!currentUser || groups.length === 0) {
    groupListDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun groupe disponible</p>';
    return;
  }

  groupListDiv.innerHTML = groups.map((group, index) => {
    // Trouver le rôle de l'utilisateur dans ce groupe
    const userRole = group.members.find(member => member.number === currentUser.number)?.role || 'member';
    
    // Vérifier si l'utilisateur est admin ou superadmin
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    
    return `
    <div class="group flex flex-col mb-4 cursor-pointer">
      <div class="flex justify-between px-3 py-2 items-center gap-1 hover:bg-gray-100 rounded-lg transition-all duration-200">
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-[#747474] h-[50px] w-[50px] flex items-center justify-center text-white text-xl">
            ${group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold text-gray-800">${group.name}</div>
            <div class="text-xs text-gray-500">
              ${group.members.length} membre(s)
              ${userRole !== 'member' ? ` • ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Boutons d'action - visibles pour admin et superadmin -->
      <div class="hidden group-actions mx-3 mt-2 space-y-2">
        ${isAdmin ? `
          <button onclick="showAddMembersForm(${index})" 
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200">
            Ajouter des membres
          </button>
        ` : ''}
        <button onclick="showGroupMembers(${index})" 
                class="w-full ${isAdmin ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200">
          ${isAdmin ? 'Gérer les membres' : 'Voir les membres'}
        </button>
      </div>
    </div>
    `;
  }).join('');

  // Modifier cette partie pour corriger la gestion des clics
  const groupElements = groupListDiv.querySelectorAll('.group');
  groupElements.forEach((groupElement, index) => {
    groupElement.querySelector(':first-child').addEventListener('click', () => {
      document.querySelectorAll('.group-actions').forEach(actions => {
        actions.classList.add('hidden');
      });
      const actions = groupElement.querySelector('.group-actions');
      actions.classList.toggle('hidden');
      
      // Récupérer le groupe correspondant
      const group = groups[index];
      
      // Vider la zone de chat actuelle
      const messagesContainer = document.querySelector('.flex.flex-col.gap-3.p-4.overflow-y-auto');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }
      
      // Afficher la conversation du groupe
      displayGroupConversation(group);
      displayGroupMessages(group.name);
      
      // Configurer l'input pour les messages de groupe
      setupGroupMessageInput(group.name);
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

  // Mettre à jour les contacts dans le localStorage
  let storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  storedContacts = storedContacts.filter(c => c.number !== contact.number);
  localStorage.setItem('contacts', JSON.stringify(storedContacts));

  // Mettre à jour les contacts archivés dans le localStorage
  let storedArchivedContacts = JSON.parse(localStorage.getItem('archivedContacts') || '[]');
  storedArchivedContacts.push(contact);
  localStorage.setItem('archivedContacts', JSON.stringify(storedArchivedContacts));

  updateContactList();
  
  if (!document.getElementById('archived-contacts-list').classList.contains('hidden')) {
    updateArchivedContactsList();
  }
}

function unarchiveContact(index) {
  const contact = archivedContacts[index];
  contacts.push(contact);
  archivedContacts.splice(index, 1);
  
  // Mettre à jour les contacts dans le localStorage
  let storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  storedContacts.push(contact);
  localStorage.setItem('contacts', JSON.stringify(storedContacts));

  // Mettre à jour les contacts archivés dans le localStorage
  let storedArchivedContacts = JSON.parse(localStorage.getItem('archivedContacts') || '[]');
  storedArchivedContacts = storedArchivedContacts.filter(c => c.number !== contact.number);
  localStorage.setItem('archivedContacts', JSON.stringify(storedArchivedContacts));
  
  updateArchivedContactsList();
  updateContactList();
  
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
    
    if (!group.members.some(member => member.number === contact.number)) {
      group.members.push({
        firstName: contact.firstName,
        lastName: contact.lastName,
        number: contact.number,
        role: 'member'
      });
      addedCount++;
    }
  });
  
  if (group.members.length < 2) {
    alert('Le groupe doit avoir au moins un membre en plus de l\'admin.');
    // Supprimer le groupe si pas assez de membres
    groups.pop();
    showGroupList();
    return;
  }
  
  if (addedCount > 0) {
    // Mettre à jour le localStorage avec les nouveaux membres
    const allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
    const groupIndex = allGroups.findIndex(g => g.name === group.name);
    
    if (groupIndex !== -1) {
      allGroups[groupIndex] = group;
    } else {
      allGroups.push(group);
    }
    
    localStorage.setItem('groups', JSON.stringify(allGroups));
    alert(`${addedCount} membre(s) ajouté(s) au groupe ${group.name}`);
    
    // Sauvegarder l'état actuel des groupes
    saveGroups();
    
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
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const group = groups[groupIndex];
  const userRole = group.members.find(member => member.number === currentUser.number)?.role || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  
  hideAllForms();
  
  const memberSelectionDiv = document.getElementById('member-selection');
  memberSelectionDiv.innerHTML = `
    <div class="mb-4">
      <h3 class="font-semibold mb-2">Membres du groupe: ${group.name}</h3>
      <div class="text-sm text-gray-600 mb-3">Admin Principal: ${group.admin}</div>
      ${group.members.length === 0 ? 
        '<p class="text-gray-500">Aucun membre dans ce groupe.</p>' :
        `<div class="max-h-40 overflow-y-auto border rounded p-2">
          ${group.members.map((member, index) => `
            <div class="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
              <div>
                <div class="font-medium">
                  ${member.firstName} ${member.lastName}
                  <span class="text-xs text-blue-600">(${member.role})</span>
                </div>
                <div class="text-sm text-gray-600">${member.number}</div>
              </div>
              ${isAdmin && member.role !== 'superadmin' && member.number !== currentUser.number ? `
                <div class="flex gap-2">
                  <select 
                    onchange="changeUserRole(${groupIndex}, ${index}, this.value)"
                    class="text-sm border rounded px-2 py-1"
                  >
                    <option value="member" ${member.role === 'member' ? 'selected' : ''}>Membre</option>
                    <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                  </select>
                  <button onclick="removeMember(${groupIndex}, ${index})" 
                    class="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">
                    Retirer
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>`
      }
    </div>
    ${isAdmin ? `
      <div class="flex gap-2">
        <button onclick="showAddMembersForm(${groupIndex})" 
                class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Ajouter Membres
        </button>
        <button onclick="returnToGroupList(${groupIndex})" 
                class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Retour
        </button>
      </div>
    ` : `
      <div class="flex justify-end">
        <button onclick="returnToGroupList(${groupIndex})" 
                class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Retour
        </button>
      </div>
    `}
  `;
  
  document.getElementById('group-members-form').classList.remove('hidden');
  
  // Sauvegarder les changements
  saveGroups();
}

function returnToGroupList(groupIndex) {
  if (groupIndex !== undefined) {
    // Recharger le groupe pour s'assurer d'avoir les derniers changements
    const group = groups[groupIndex];
    if (group) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userRole = group.members.find(member => member.number === currentUser.number)?.role;
      
      // Mettre à jour le rôle dans le localStorage si nécessaire
      if (userRole === 'admin' || userRole === 'superadmin') {
        const updatedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
        const groupToUpdate = updatedGroups.find(g => g.name === group.name);
        if (groupToUpdate) {
          const memberToUpdate = groupToUpdate.members.find(m => m.number === currentUser.number);
          if (memberToUpdate) {
            memberToUpdate.role = userRole;
          }
        }
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
      }
    }
  }
  
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

function initializeContacts() {
  // Charger les contacts depuis le localStorage
  const storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  contacts = storedContacts;

  // Charger les contacts archivés
  const storedArchivedContacts = JSON.parse(localStorage.getItem('archivedContacts') || '[]');
  archivedContacts = storedArchivedContacts;
}

// Ajoutez ces fonctions au début du fichier functions.js

function saveGroups() {
  localStorage.setItem('groups', JSON.stringify(groups));
}

function loadGroups() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return [];

  const allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
  
  // Filtrer les groupes en fonction du rôle de l'utilisateur
  return allGroups.filter(group => {
    const userMember = group.members.find(member => member.number === currentUser.number);
    return userMember !== undefined; // Retourne uniquement les groupes dont l'utilisateur est membre
  });
}

// Ajouter cette fonction avant la ligne "export function initializeEventListeners()"
function handleDiffusionSelection() {
    const selectedContacts = [];
    const checkboxes = document.querySelectorAll('.diffusion-checkbox');
    const messageInput = document.querySelector('input[placeholder="Tapez votre message..."]');
    const message = messageInput.value.trim();

    if (!message) {
        alert('Veuillez entrer un message à diffuser');
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const checkMark = checkbox.querySelector('.check-mark');
        const isSelected = !checkMark.classList.contains('hidden');
        if (isSelected) {
            const contactItem = checkbox.closest('.contact-item');
            const contactNumber = contactItem.dataset.contactNumber;
            if (contactNumber) {
                selectedContacts.push(contactNumber);
            }
        }
    });

    if (selectedContacts.length === 0) {
        alert('Veuillez sélectionner au moins un contact pour la diffusion');
        return;
    }

    // Envoyer le message à tous les contacts sélectionnés
    selectedContacts.forEach(contactNumber => {
        sendMessage(contactNumber, message);
    });

    // Réinitialiser
    messageInput.value = '';
    document.querySelectorAll('.check-mark').forEach(mark => mark.classList.add('hidden'));
    
    // Notification de succès
    alert(`Message diffusé avec succès à ${selectedContacts.length} contact(s)`);

    // Mettre à jour l'en-tête
    updateDiffusionHeader();

    // Rafraîchir la liste des contacts
    updateContactList();
}

export function initializeEventListeners() {
  initializeContacts();
  // Charger les groupes au démarrage
  groups = loadGroups();
  
  const buttons = document.querySelectorAll('.cursor-pointer');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('bg-orange-300'));
      button.classList.add('bg-orange-300');
    });
  });

  // Event listeners pour les contacts
  document.getElementById('add-contact-button').addEventListener('click', showAddContactForm);
  
  // Modifier l'event listener du bouton de diffusion
  document.getElementById('show-contacts-button').addEventListener('click', () => {
  if (contacts.length === 0) {
    alert('Aucun contact disponible pour la diffusion');
    return;
  }
  
  hideAllForms();
  document.getElementById('contact-list').classList.remove('hidden');
  
  // Vider la zone de chat
  const messagesContainer = document.querySelector('.flex.flex-col.gap-3.p-4.overflow-y-auto');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
  }

  // Vider la zone d'entête de conversation
  const conversationHeader = document.querySelector('.flex.gap-2.justify-center.items-center');
  if (conversationHeader) {
    conversationHeader.innerHTML = '';
  }
  
  // Initialiser l'en-tête du mode diffusion
  updateDiffusionHeader();
  
  // Mettre à jour la liste des contacts avec les cases à cocher
  updateContactList();

  // Configurer l'input pour le mode diffusion
  setupMessageInput();
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

  // Ajouter l'écouteur d'événements pour le champ de recherche
  const searchInput = document.getElementById('contact-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (document.getElementById('messages-button').classList.contains('bg-orange-300')) {
        filterContacts(e.target.value);
      }
    });
  }
}

// Exposer les fonctions globales
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
window.changeUserRole = changeUserRole;
window.filterContacts = filterContacts;
window.updateDiffusionHeader = updateDiffusionHeader;

// Ajouter aux fonctions globales existantes
window.displayGroupConversation = displayGroupConversation;
window.sendGroupMessage = sendGroupMessage;
window.displayGroupMessages = displayGroupMessages;
window.setupGroupMessageInput = setupGroupMessageInput;

// Ne pas ajouter d'export supplémentaire ici

// Ajouter cette fonction après les autres fonctions et avant les exports
function changeUserRole(groupIndex, memberIndex, newRole) {
  const group = groups[groupIndex];
  const member = group.members[memberIndex];
  
  // Vérifier si l'utilisateur n'est pas le super admin
  if (member.role === 'superadmin') {
    alert('Impossible de modifier le rôle du super administrateur.');
    return;
  }

  // Vérifier le nombre d'admins avant de rétrograder un admin
  if (member.role === 'admin' && newRole === 'member') {
    const adminCount = group.members.filter(m => 
      m.role === 'admin' || m.role === 'superadmin'
    ).length;
    
    if (adminCount <= 1) {
      alert('Impossible de rétrograder le dernier administrateur du groupe.');
      showGroupMembers(groupIndex); // Rafraîchir l'affichage
      return;
    }
  }

  // Mettre à jour le rôle
  member.role = newRole;
  
  // Afficher une confirmation
  const memberName = member.number === 'Admin' ? 
    member.name : 
    `${member.firstName} ${member.lastName}`;
  
  alert(`Le rôle de ${memberName} a été changé en : ${newRole}`);
  
  // Rafraîchir l'affichage
  showGroupMembers(groupIndex);
}

// Nouvelle fonction pour filtrer les contacts
function filterContacts(searchValue) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const messages = JSON.parse(localStorage.getItem('messages') || '{}');
  const contactListDiv = document.getElementById('contact-list').querySelector('div');

  // Si la valeur de recherche est '*', afficher tous les contacts triés par ordre alphabétique
  if (searchValue === '*') {
    if (contacts.length === 0) {
      contactListDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun contact</p>';
      return;
    }

    // Trier les contacts par ordre alphabétique
    const sortedContacts = [...contacts].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    contactListDiv.innerHTML = sortedContacts.map((contact) => {
      const initials = `${contact.firstName.charAt(0).toUpperCase()}${contact.lastName.charAt(0).toUpperCase()}`;
      const conversationKey = [currentUser.number, contact.number].sort().join('-');
      const lastMessage = messages[conversationKey] ? 
        messages[conversationKey][messages[conversationKey].length - 1] : null;

      return `
        <div class="flex rounded-lg px-3 py-2 mb-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 contact-item"
             data-contact-index="${contacts.findIndex(c => c.number === contact.number)}"
             data-contact-number="${contact.number}">
          <div class="flex items-center gap-3 w-full">
            <div class="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 h-[45px] w-[45px] flex items-center justify-center text-white font-bold text-lg shadow-md">
              ${initials}
            </div>
            <div>
              <div class="font-medium text-gray-800">${contact.firstName} ${contact.lastName}</div>
              <div class="text-sm text-gray-600">${contact.number}</div>
            </div>
            ${lastMessage && !lastMessage.read && lastMessage.recipient === currentUser.number ? 
              '<div class="w-3 h-3 bg-blue-500 rounded-full ml-auto"></div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Filtrer les contacts selon le critère de recherche
    const searchTerm = searchValue.toLowerCase();
    const filteredContacts = contacts.filter(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      return fullName.includes(searchTerm) || contact.number.includes(searchTerm);
    });

    if (filteredContacts.length === 0) {
      contactListDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun contact trouvé</p>';
      return;
    }

    contactListDiv.innerHTML = filteredContacts.map((contact) => {
      const initials = `${contact.firstName.charAt(0).toUpperCase()}${contact.lastName.charAt(0).toUpperCase()}`;
      const conversationKey = [currentUser.number, contact.number].sort().join('-');
      const lastMessage = messages[conversationKey] ? 
        messages[conversationKey][messages[conversationKey].length - 1] : null;

      return `
        <div class="flex rounded-lg px-3 py-2 mb-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 contact-item"
             data-contact-index="${contacts.findIndex(c => c.number === contact.number)}"
             data-contact-number="${contact.number}">
          <div class="flex items-center gap-3 w-full">
            <div class="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 h-[45px] w-[45px] flex items-center justify-center text-white font-bold text-lg shadow-md">
              ${initials}
            </div>
            <div>
              <div class="font-medium text-gray-800">${contact.firstName} ${contact.lastName}</div>
              <div class="text-sm text-gray-600">${contact.number}</div>
            </div>
            ${lastMessage && !lastMessage.read && lastMessage.recipient === currentUser.number ? 
              '<div class="w-3 h-3 bg-blue-500 rounded-full ml-auto"></div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Réattacher les écouteurs d'événements pour les contacts
  const contactItems = contactListDiv.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      contactItems.forEach(contact => {
        contact.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
      });
      item.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
      
      const contactIndex = parseInt(item.dataset.contactIndex);
      const contactNumber = item.dataset.contactNumber;
      displayConversation(contactIndex);
      displayConversationMessages(contactNumber);
      setupMessageInput(contactNumber);
    });
  });
}

// Ajouter ces fonctions après les fonctions existantes
function sendMessage(recipientNumber, messageContent) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const messages = JSON.parse(localStorage.getItem('messages') || '{}');
  
  // Créer une clé unique pour la conversation
  const conversationKey = [currentUser.number, recipientNumber].sort().join('-');
  
  if (!messages[conversationKey]) {
    messages[conversationKey] = [];
  }

  const newMessage = {
    sender: currentUser.number,
    recipient: recipientNumber,
    content: messageContent,
    timestamp: new Date().toISOString(),
    status: '✓', // Un seul check par défaut (envoyé mais pas lu)
    read: false // Nouveau champ pour tracker si le message a été lu
  };

  messages[conversationKey].push(newMessage);
  localStorage.setItem('messages', JSON.stringify(messages));
  
  // Mettre à jour l'affichage des messages
  displayConversationMessages(recipientNumber);
}

function displayConversationMessages(contactNumber) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const conversationKey = [currentUser.number, contactNumber].sort().join('-');
  const messages = JSON.parse(localStorage.getItem('messages') || '{}');
  const conversationMessages = messages[conversationKey] || [];

  const messagesContainer = document.querySelector('.flex.flex-col.gap-3.p-4.overflow-y-auto');
  if (!messagesContainer) return;

  // Marquer les messages reçus comme lus
  let hasUnreadMessages = false;
  conversationMessages.forEach(message => {
    if (message.recipient === currentUser.number && !message.read) {
      message.read = true;
      hasUnreadMessages = true;
    }
  });

  // Si des messages ont été marqués comme lus, mettre à jour le localStorage et rafraîchir la liste des contacts
  if (hasUnreadMessages) {
    localStorage.setItem('messages', JSON.stringify(messages));
    // Rafraîchir la liste des contacts pour mettre à jour les indicateurs de messages non lus
    updateContactList();
  }

  // Afficher les messages
  messagesContainer.innerHTML = conversationMessages.map(message => {
    const isSentByMe = message.sender === currentUser.number;
    const messageStatus = isSentByMe ? 
      (message.read ? '✓✓' : '✓') : '';

    return `
      <div class="flex ${isSentByMe ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[70%] ${isSentByMe ? 
          'bg-green-500 text-white rounded-tr-none ml-auto' : 
          'bg-gray-100 text-black rounded-tl-none mr-auto'} 
          rounded-2xl px-4 py-2 shadow-sm relative">
          <div class="text-[14px]">${message.content}</div>
          <div class="text-[11px] ${isSentByMe ? 'text-white' : 'text-gray-600'} mt-1 flex items-center gap-1 ${isSentByMe ? 'justify-end' : ''}">
            ${new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            ${isSentByMe ? `<span class="${isSentByMe ? 'text-white' : 'text-blue-600'}">${messageStatus}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateDiffusionHeader() {
  const selectedCheckmarks = document.querySelectorAll('.check-mark:not(.hidden)');
  const selectedContacts = Array.from(selectedCheckmarks).map(checkmark => {
    const contactItem = checkmark.closest('.contact-item');
    const index = contactItem.dataset.contactIndex;
    return contacts[index];
  }).filter(Boolean);

  const header = document.querySelector('.flex.gap-2.justify-center.items-center');
  if (header) {
    header.innerHTML = `
      <div class="flex items-center gap-3 w-full">
        <div class="rounded-full bg-orange-500 h-[50px] w-[50px] flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="font-semibold">Mode Diffusion (${selectedContacts.length} destinataire${selectedContacts.length > 1 ? 's' : ''})</div>
          <div class="text-sm text-gray-600 truncate">
            ${selectedContacts.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
          </div>
        </div>
      </div>
    `;

    // Ajouter un tooltip pour voir la liste complète si elle est tronquée
    const namesDiv = header.querySelector('.text-gray-600');
    if (namesDiv.scrollWidth > namesDiv.clientWidth) {
      namesDiv.title = selectedContacts.map(c => `${c.firstName} ${c.lastName}`).join(', ');
    }
  }
}

function displayGroupConversation(group) {
  const conversationHeader = document.querySelector('.flex.gap-2.justify-center.items-center');
  if (conversationHeader && group) {
    conversationHeader.innerHTML = `
      <div class="flex items-center gap-3 w-full">
        <div class="rounded-full bg-[#747474] h-[50px] w-[50px] flex items-center justify-center text-white font-bold">
          ${group.name.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1">
          <div class="font-semibold">${group.name}</div>
          <div class="text-sm text-gray-600 truncate">
            ${group.members.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
          </div>
        </div>
      </div>
    `;
  }
}

function sendGroupMessage(groupId, messageContent) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const messages = JSON.parse(localStorage.getItem('groupMessages') || '{}');
  
  if (!messages[groupId]) {
    messages[groupId] = [];
  }

  const newMessage = {
    sender: currentUser.number,
    senderName: `${currentUser.firstName} ${currentUser.lastName}`,
    content: messageContent,
    timestamp: new Date().toISOString(),
    read: {} // Objet pour suivre qui a lu le message
  };

  // Initialiser le statut de lecture pour tous les membres
  const group = groups.find(g => g.name === groupId);
  if (group) {
    group.members.forEach(member => {
      newMessage.read[member.number] = member.number === currentUser.number;
    });
  }

  messages[groupId].push(newMessage);
  localStorage.setItem('groupMessages', JSON.stringify(messages));
  
  displayGroupMessages(groupId);
}

function displayGroupMessages(groupId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const messages = JSON.parse(localStorage.getItem('groupMessages') || '{}');
  const groupMessages = messages[groupId] || [];

  const messagesContainer = document.querySelector('.flex.flex-col.gap-3.p-4.overflow-y-auto');
  if (!messagesContainer) return;

  messagesContainer.innerHTML = groupMessages.map(message => {
    const isSentByMe = message.sender === currentUser.number;

    return `
      <div class="flex ${isSentByMe ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[70%] ${isSentByMe ? 
          'bg-green-500 text-white rounded-tr-none ml-auto' : 
          'bg-gray-100 text-black rounded-tl-none mr-auto'} 
          rounded-2xl px-4 py-2 shadow-sm relative">
          ${!isSentByMe ? `<div class="text-xs text-gray-600 mb-1">${message.senderName}</div>` : ''}
          <div class="text-[14px]">${message.content}</div>
          <div class="text-[11px] ${isSentByMe ? 'text-white' : 'text-gray-600'} mt-1">
            ${new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    `;
  }).join('');

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Nouvelle fonction pour gérer les brouillons
function saveDraft(recipientId, message) {
  if (message.trim()) {
    drafts[recipientId] = message;
  } else {
    delete drafts[recipientId];
  }
}

// Nouvelle fonction pour récupérer un brouillon
function getDraft(recipientId) {
  return drafts[recipientId] || '';
}