(() => {
  const navButtons = document.querySelectorAll('header button[data-page]');
  const pages = document.querySelectorAll('.page');
  const addonForm = document.getElementById('addonForm');
  const addonsList = document.getElementById('addonsList');
  const userAddonsList = document.getElementById('userAddonsList');
  const searchInput = document.getElementById('searchInput');
  const profilePic = document.getElementById('profilePic');
  const profileName = document.getElementById('profileName');

  // Cargar datos
  let addons = JSON.parse(localStorage.getItem('addons') || '[]');
  let profile = JSON.parse(localStorage.getItem('profile') || '{"name":"Usuario","pic":"https://via.placeholder.com/120?text=Perfil"}');

  // Cambiar página activa
  function showPage(id) {
    pages.forEach(p => p.classList.toggle('active', p.id === id));
    if (id === 'mainPage') renderAddons();
    if (id === 'profilePage') renderUserAddons();
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Render lista addons (filtra con búsqueda)
  function renderAddons(filter = '') {
    addonsList.innerHTML = '';
    const f = filter.trim().toLowerCase();
    const filtered = addons.filter(a =>
      a.description.toLowerCase().includes(f) ||
      a.link.toLowerCase().includes(f)
    );
    if (!filtered.length) {
      addonsList.innerHTML = `<p style="text-align:center; color:#999; margin-top:30px;">No se encontraron addons.</p>`;
      return;
    }
    filtered.forEach(addon => {
      addonsList.appendChild(createAddonCard(addon, false));
    });
  }

  // Crear tarjeta addon
  function createAddonCard(addon, isUserAddon) {
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.dataset.id = addon.id;

    const img = document.createElement('img');
    img.className = 'addon-img';
    img.alt = 'Imagen del addon';
    img.src = addon.imageData || 'https://via.placeholder.com/70?text=Addon';

    const info = document.createElement('div');
    info.className = 'addon-info';

    const desc = document.createElement('div');
    desc.className = 'addon-desc';
    desc.textContent = addon.description;

    const link = document.createElement('div');
    link.className = 'addon-link';
    link.textContent = addon.link;
    link.title = addon.link;
    link.addEventListener('click', () => window.open(addon.link, '_blank'));

    info.appendChild(desc);
    info.appendChild(link);

    const actions = document.createElement('div');
    actions.className = 'addon-actions';

    const btnDownload = document.createElement('button');
    btnDownload.textContent = 'Descargar';
    btnDownload.addEventListener('click', () => window.open(addon.link, '_blank'));
    actions.appendChild(btnDownload);

    if (isUserAddon) {
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Borrar';
      btnDelete.className = 'delete-btn';
      btnDelete.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres borrar este addon?')) {
          addons = addons.filter(a => a.id !== addon.id);
          saveAddons();
          renderAddons(searchInput.value);
          renderUserAddons();
        }
      });
      actions.appendChild(btnDelete);
    }

    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  // Render addons del usuario (perfil)
  function renderUserAddons() {
    userAddonsList.innerHTML = '';
    // Si quieres filtrar por usuario real, aquí agregarías filtro
    if (addons.length === 0) {
      userAddonsList.innerHTML = `<p style="text-align:center; color:#999; margin-top:30px;">No has subido addons aún.</p>`;
      return;
    }
    addons.forEach(addon => {
      userAddonsList.appendChild(createAddonCard(addon, true));
    });
  }

  // Guardar addons
  function saveAddons() {
    localStorage.setItem('addons', JSON.stringify(addons));
  }

  // Guardar perfil
  function saveProfile() {
    localStorage.setItem('profile', JSON.stringify(profile));
  }

  // Subir addon con imagen desde PC
  addonForm.addEventListener('submit', e => {
    e.preventDefault();

    const description = addonForm.description.value.trim();
    const link = addonForm.link.value.trim();
    const file = addonForm.image.files[0];

    if (!description || !link) {
      alert('Por favor, completa descripción y link.');
      return;
    }

    if (file && file.size > 3 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 3 MB.');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        addNewAddon(description, link, event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      addNewAddon(description, link, null);
    }
  });

  // Añadir nuevo addon
  function addNewAddon(description, link, imageData) {
    const newAddon = {
      id: Date.now(),
      description,
      link,
      imageData
    };
    addons.push(newAddon);
    saveAddons();
    addonForm.reset();
    alert('Addon subido exitosamente.');
    showPage('mainPage');
    renderAddons();
  }

  // Búsqueda en tiempo real
  searchInput.addEventListener('input', () => {
    renderAddons(searchInput.value);
  });

  // Cambiar foto perfil (por URL)
  profilePic.addEventListener('click', () => {
    const url = prompt('Pega la URL de una imagen o GIF para tu perfil:');
    if (url && url.trim()) {
      profile.pic = url.trim();
      saveProfile();
      profilePic.src = profile.pic;
    }
  });

  // Editar nombre perfil
  profileName.addEventListener('input', () => {
    profile.name = profileName.textContent.trim() || 'Usuario';
    saveProfile();
  });

  // Cargar perfil guardado
  function loadProfile() {
    profileName.textContent = profile.name || 'Usuario';
    profilePic.src = profile.pic || 'https://via.placeholder.com/120?text=Perfil';
  }
  loadProfile();

  // Inicial mostrar página principal
  showPage('mainPage');
})();
