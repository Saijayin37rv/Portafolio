// script.js: handles dynamic projects, filters, simple animations and contact form

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.proyect__gallery');
    const categories = document.querySelector('.gallery__categories');
    const contactForm = createContactForm();
  
    // Insert contact form into footer contact area (if placeholder exists)
    const contactCol = document.querySelector('footer .contact');
    if (contactCol) {
      contactCol.appendChild(contactForm);
    }
  
    // Fetch projects from backend
    fetch('/api/projects')
      .then(res => res.json())
      .then(projects => renderProjects(projects))
      .catch(err => console.error('Error fetching projects', err));
  
    // Category filter
    categories.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-item')) return;
      categories.querySelector('.active')?.classList.remove('active');
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      document.querySelectorAll('.project__card').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hide');
          card.classList.add('show');
        } else {
          card.classList.remove('show');
          card.classList.add('hide');
        }
      });
      // After applying filter, scroll to portfolio section so the user sees results
      const portfolioSection = document.getElementById('portfolio');
      if (portfolioSection) {
        portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  
    // Smooth scroll handler already in-page; keep consistency
  });
  
  function renderProjects(projects) {
    const gallery = document.querySelector('.proyect__gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project__card ' + (p.category || 'uncategorized');
      card.dataset.category = p.category || 'uncategorized';
      card.innerHTML = `
        <img src="${p.image || './assets/proyecto1.png'}" alt="${escapeHtml(p.title)}">
        <div class="overlay"></div>
        <div class="project__info flex w-full flex-column justify-content-center align-items-center text-center">
          <h2>${escapeHtml(p.title)}</h2>
          <p>${escapeHtml(p.description)}</p>
          <a href="${p.url || '#'}" target="_blank" aria-label="Ver detalles del proyecto">
            <span><i class="fa-solid fa-arrow-right-long"></i></span>
          </a>
        </div>
      `;
      gallery.appendChild(card);
      // small fade-in animation
      requestAnimationFrame(() => card.classList.add('show'));
    });
  }
  
  function createContactForm() {
    const form = document.createElement('form');
    form.id = 'contactForm';
    form.className = 'contact-form';
    form.innerHTML = `
      <div class="form-row">
        <label for="name">Nombre</label>
        <input id="name" name="name" placeholder="Tu nombre" required />
      </div>
      <div class="form-row">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="tu@correo.com" required />
      </div>
      <div class="form-row">
        <label for="message">Mensaje</label>
        <textarea id="message" name="message" placeholder="Escribe tu mensaje..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Enviar por WhatsApp</button>
        <button type="button" id="sendAndSave" class="btn btn-secondary">Enviar y guardar</button>
      </div>
      <div id="contactStatus" class="contact-status" aria-live="polite"></div>
    `;
  
    // Primary submit: open WhatsApp with prefilled message
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();
      const status = form.querySelector('#contactStatus');
  
      if (!name || !email || !message) {
        status.textContent = 'Por favor completa todos los campos.';
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.textContent = 'Ingresa un correo válido.';
        return;
      }
  
      const phone = '5218116939340'; // número destinatario en formato wa.me (sin +)
      const text = `Nombre: ${name}%0AEmail: ${email}%0AMensaje: ${encodeURIComponent(message)}`;
      const url = `https://wa.me/${phone}?text=${text}`;
      // Open WhatsApp in new tab (will open web or app según dispositivo)
      window.open(url, '_blank');
      status.textContent = 'Se abrirá WhatsApp para enviar tu mensaje...';
      setTimeout(() => status.textContent = '', 4000);
    });
  
    // Secondary button: send to WhatsApp AND save to backend
    form.querySelector('#sendAndSave').addEventListener('click', (e) => {
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();
      const status = form.querySelector('#contactStatus');
      if (!name || !email || !message) {
        status.textContent = 'Por favor completa todos los campos.';
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.textContent = 'Ingresa un correo válido.';
        return;
      }
  
      // First open WhatsApp
      const phone = '5218116939340';
      const text = `Nombre: ${name}%0AEmail: ${email}%0AMensaje: ${encodeURIComponent(message)}`;
      const url = `https://wa.me/${phone}?text=${text}`;
      window.open(url, '_blank');
  
      // Then attempt to save to backend (best-effort)
      fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, message})
      }).then(r => {
        if (!r.ok) throw r;
        return r.json();
      }).then(() => {
        status.textContent = 'Mensaje enviado y guardado. ¡Gracias!';
        form.reset();
        setTimeout(()=> status.textContent = '', 4000);
      }).catch(() => {
        status.textContent = 'Enviado por WhatsApp. No se pudo guardar localmente.';
      });
    });
  
    return form;
  }
  
  function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(s){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
    });
  }
