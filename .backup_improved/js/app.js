/**
 * ObraControl - app.js
 * Controlador principal de interfaz de usuario, navegación y vistas modulares.
 * Arquitectura 100% limpia, responsive y con soporte Híbrido (Local + Firebase).
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  // Estado global de la interfaz
  let currentView = 'dashboard';
  let activeProjectId = 'ALL';
  let activeFilters = {
    projectId: 'ALL',
    status: 'ALL',
    requester: '',
    dateFrom: '',
    dateTo: '',
    materialKeyword: '',
    quickTab: 'ALL'
  };

  // SVGs vectoriales de alta precisión para la interfaz
  const ICONS = {
    dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    requests: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    approvals: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    deliveries: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    vouchers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>',
    reports: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    admin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    print: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    logout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    package: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="9" y2="18.01"/><line x1="15" y1="18" x2="15" y2="18.01"/></svg>'
  };

  function isAdminUser(user) {
    return Boolean(user && (user.role === 'admin' || user.role === 'superadmin' || window.OC.auth.isSuperAdmin(user)));
  }

  // Notificaciones Toast flotantes
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content" style="display:flex; align-items:center; gap:0.6rem;">
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 350);
      }
    }, 4000);
  }

  // ----------------------------------------------------
  // INICIALIZACIÓN DE LA APLICACIÓN
  // ----------------------------------------------------
  async function initApp() {
    setupEventListeners();
    updateCloudStatusUI();

    try {
      const user = await window.OC.auth.restoreSession();
      if (user) {
        enterApp();
      } else {
        renderLoginView();
      }
    } catch (err) {
      console.warn('Error al restaurar sesión inicial:', err);
      renderLoginView();
    }
  }

  // ----------------------------------------------------
  // VISTA DE ACCESO / LOGIN (PORTAL SPLIT SCREEN)
  // ----------------------------------------------------
  function renderLoginView(message = '') {
    const nav = document.getElementById('sidebar-nav');
    const content = document.getElementById('main-content-area');
    const userHeader = document.getElementById('user-profile-header');
    if (nav) nav.innerHTML = '';
    if (userHeader) userHeader.innerHTML = '';
    if (!content) return;

    content.innerHTML = `
      <div class="auth-page-container">
        
        <!-- LADO IZQUIERDO: PRESENTACIÓN CORPORATIVA -->
        <div class="auth-hero-side">
          <div class="auth-hero-content">
            <div style="display:inline-flex; align-items:center; gap:0.65rem; background:rgba(37,99,235,0.2); border:1px solid rgba(56,189,248,0.3); padding:0.4rem 0.85rem; border-radius:9999px; font-size:0.8rem; font-weight:700; color:#38bdf8; margin-bottom:1.5rem;">
              <span>🏗️</span> ObraControl Enterprise v2.0
            </div>
            
            <h1 class="auth-hero-title">
              Control Integral de <span>Insumos y Vales</span> de Obra
            </h1>
            
            <p class="auth-hero-description">
              Plataforma digital para constructoras e inmobiliarias. Conecte al Maestro de Obra, Ingeniero Residente y Almacén con total trazabilidad técnica y vales oficiales con firmas.
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-icon">${ICONS.requests}</div>
                <div class="auth-feature-text">
                  <strong>Solicitudes de Insumos al Instante</strong>
                  <span>El maestro genera pedidos por frente de trabajo con control de partidas.</span>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">${ICONS.approvals}</div>
                <div class="auth-feature-text">
                  <strong>Aprobación Técnica y Metrados</strong>
                  <span>El residente aprueba o ajusta cantidades antes del despacho con observaciones.</span>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">${ICONS.vouchers}</div>
                <div class="auth-feature-text">
                  <strong>Vales de Salida con 3 Firmas</strong>
                  <span>Generación automática del comprobante oficial de entrega y control de saldos.</span>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">☁️</div>
                <div class="auth-feature-text">
                  <strong>Sincronización en la Nube con Cloud Firestore</strong>
                  <span>Funciona tanto en red local como en la nube en tiempo real.</span>
                </div>
              </div>
            </div>
          </div>

          <div style="font-size:0.75rem; color:#64748b; z-index:1;">
            ObraControl © 2026 - Sistema de Logística y Construcción Civil.
          </div>
        </div>

        <!-- LADO DERECHO: FORMULARIO Y ACCESO RÁPIDO DEMO -->
        <div class="auth-form-side">
          <div class="auth-form-card">
            
            <div style="margin-bottom: 1.5rem;">
              <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">Portal de Acceso</h2>
              <p class="subtitle">Inicie sesión con su cuenta o pruebe con los roles de evaluación.</p>
            </div>

            <div id="auth-message" class="card mb-3" style="${message ? '' : 'display:none;'}">
              ${message}
            </div>

            <div class="tabs-bar mb-3">
              <button class="tab-btn active" type="button" id="auth-show-login">Iniciar Sesión</button>
              <button class="tab-btn" type="button" id="auth-show-register">Crear Cuenta</button>
            </div>

            <!-- FORMULARIO DE LOGIN -->
            <form id="auth-login-form">
              <div class="form-group mb-3">
                <label for="auth-login-email">Correo Electrónico</label>
                <input id="auth-login-email" class="form-control" type="email" placeholder="ej. usuario@obracontrol.pe" autocomplete="username" required>
              </div>

              <div class="form-group mb-3">
                <label for="auth-login-password">Contraseña</label>
                <input id="auth-login-password" class="form-control" type="password" placeholder="••••••••" autocomplete="current-password" required>
              </div>

              <button class="btn btn-primary" type="submit" style="width: 100%; padding: 0.75rem;">
                Ingresar al Sistema
              </button>
            </form>

            <!-- FORMULARIO DE REGISTRO -->
            <form id="auth-register-form" style="display:none;">
              <div class="form-group mb-2">
                <label for="auth-register-name">Nombre y Apellidos</label>
                <input id="auth-register-name" class="form-control" placeholder="ej. Ing. Carlos Mendoza" required>
              </div>

              <div class="form-group mb-2">
                <label for="auth-register-email">Correo Institucional</label>
                <input id="auth-register-email" class="form-control" type="email" placeholder="usuario@correo.com" required>
              </div>

              <div class="form-group mb-2">
                <label for="auth-register-role">Perfil / Especialidad</label>
                <select id="auth-register-role" class="form-control">
                  <option value="solicitante">Maestro de Obra (Solicitante de Insumos)</option>
                  <option value="aprobador">Ingeniero Residente (Aprobador Técnico)</option>
                  <option value="almacenero">Jefe de Almacén (Despachos y Vales)</option>
                  <option value="admin">Administrador de Obra (Gestión Integral)</option>
                </select>
              </div>

              <div class="form-group mb-2">
                <label for="auth-register-title">Cargo / Frente de Obra</label>
                <input id="auth-register-title" class="form-control" placeholder="ej. Residente Torre A" required>
              </div>

              <div class="form-group mb-3">
                <label for="auth-register-password">Contraseña (Mínimo 6 caracteres)</label>
                <input id="auth-register-password" class="form-control" type="password" minlength="6" required>
              </div>

              <button class="btn btn-primary" type="submit" style="width: 100%; padding: 0.75rem;">
                Registrar Solicitud de Cuenta
              </button>
            </form>

            <!-- PANEL DE ACCESO RÁPIDO / MODO DEMO -->
            <div class="demo-access-panel">
              <div class="demo-access-title">
                <span>⚡</span> Acceso Rápido / Modo Demostración
              </div>
              <p style="font-size: 0.75rem; color: #475569; margin-bottom: 0.65rem;">
                Haga clic en cualquiera de los roles para ingresar inmediatamente y explorar las funciones:
              </p>
              
              <div class="demo-role-grid">
                <button type="button" class="btn-demo-role" data-demo-role="solicitante" title="Ingresar como Maestro de Obra">
                  <span>👷</span> Maestro de Obra
                </button>
                <button type="button" class="btn-demo-role" data-demo-role="aprobador" title="Ingresar como Ingeniero Residente">
                  <span>📐</span> Ing. Residente
                </button>
                <button type="button" class="btn-demo-role" data-demo-role="almacenero" title="Ingresar como Almacenero">
                  <span>📦</span> Jefe Almacén
                </button>
                <button type="button" class="btn-demo-role" data-demo-role="admin" title="Ingresar como Superadministrador">
                  <span>🛡️</span> Administrador
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    // Eventos de tabs Login / Registro
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const loginTab = document.getElementById('auth-show-login');
    const registerTab = document.getElementById('auth-show-register');
    const authMessage = document.getElementById('auth-message');

    const showMsg = (txt, isError) => {
      authMessage.textContent = txt;
      authMessage.style.display = 'block';
      authMessage.style.backgroundColor = isError ? '#fef2f2' : '#f0fdf4';
      authMessage.style.color = isError ? '#991b1b' : '#15803d';
      authMessage.style.borderColor = isError ? '#fca5a5' : '#86efac';
    };

    loginTab.addEventListener('click', () => {
      loginForm.style.display = '';
      registerForm.style.display = 'none';
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
      loginForm.style.display = 'none';
      registerForm.style.display = '';
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
    });

    // Envío Login
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando...';

      try {
        const email = document.getElementById('auth-login-email').value;
        const pass = document.getElementById('auth-login-password').value;
        await window.OC.auth.login(email, pass);
        showToast('¡Bienvenido a ObraControl!', 'success');
        enterApp();
      } catch (err) {
        showMsg(err.message || 'Credenciales no válidas.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar al Sistema';
      }
    });

    // Envío Registro
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando...';

      try {
        const res = await window.OC.auth.register({
          name: document.getElementById('auth-register-name').value,
          email: document.getElementById('auth-register-email').value,
          role: document.getElementById('auth-register-role').value,
          jobTitle: document.getElementById('auth-register-title').value,
          password: document.getElementById('auth-register-password').value
        });
        showMsg(res.message || 'Cuenta registrada.', false);
        registerForm.reset();
        loginTab.click();
      } catch (err) {
        showMsg(err.message || 'No se pudo crear la cuenta.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrar Solicitud de Cuenta';
      }
    });

    // Botones de Modo Demo / Evaluación Rápida
    content.querySelectorAll('.btn-demo-role').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-demo-role');
        const user = window.OC.auth.loginDemo(role);
        showToast(`Ingresó en Modo Evaluación como: ${user.name} (${window.OC.auth.getRoleLabel(user.role)})`, 'success');
        enterApp();
      });
    });
  }

  // ----------------------------------------------------
  // ENTRADA AL SISTEMA TRAS AUTENTICARSE
  // ----------------------------------------------------
  function enterApp() {
    renderProjectSelector();
    renderUserHeader();
    renderNavigation();
    updateCloudStatusUI();
    navigate('dashboard');

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      window.OC.firebase.startRealtimeSync(() => {
        navigate(currentView);
      });
    }
  }

  // ----------------------------------------------------
  // SELECTOR DE OBRA ACTIVA EN EL SIDEBAR: "Obra que estoy viendo"
  // ----------------------------------------------------
  function renderProjectSelector() {
    const select = document.getElementById('sidebar-active-project-select');
    if (!select) return;

    const projects = window.OC.storage.getProjects();
    select.innerHTML = `
      <option value="ALL">🏢 Todas mis obras (${projects.length})</option>
      ${projects.map(p => `
        <option value="${p.id}" ${activeProjectId === p.id ? 'selected' : ''}>
          ${p.name}
        </option>
      `).join('')}
    `;

    select.addEventListener('change', () => {
      activeProjectId = select.value;
      activeFilters.projectId = activeProjectId;
      showToast(activeProjectId === 'ALL' ? 'Mostrando todas mis obras' : `Viendo: ${select.options[select.selectedIndex].text}`, 'info');
      navigate(currentView);
    });
  }

  // ----------------------------------------------------
  // ENCABEZADO DE USUARIO (TOPBAR USER PROFILE & ROLE SWITCHER)
  // ----------------------------------------------------
  function renderUserHeader() {
    const user = window.OC.auth.getCurrentUser();
    const container = document.getElementById('user-profile-header');
    if (!container) return;

    if (!user) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        
        <!-- SELECTOR RÁPIDO DE ROL (Para alternar y probar vistas sin salir) -->
        <div class="quick-role-badge" title="Cambia de rol en tiempo real para evaluar las vistas de Maestro, Residente o Almacenero">
          <span class="quick-role-label">Rol:</span>
          <select class="quick-role-select" id="quick-role-switcher-select" aria-label="Cambiar rol activo para pruebas">
            <option value="solicitante" ${user.role === 'solicitante' ? 'selected' : ''}>Maestro de Obra</option>
            <option value="aprobador" ${user.role === 'aprobador' ? 'selected' : ''}>Ing. Residente</option>
            <option value="almacenero" ${user.role === 'almacenero' ? 'selected' : ''}>Jefe Almacén</option>
            <option value="admin" ${isAdminUser(user) ? 'selected' : ''}>Administrador</option>
          </select>
        </div>

        <!-- WIDGET DE PERFIL -->
        <div class="user-profile-widget">
          <div class="user-profile-avatar">
            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="user-profile-info">
            <span class="user-profile-name">${user.name}</span>
            <span class="user-profile-role">${window.OC.auth.getRoleLabel(user.role)}</span>
          </div>
          <button class="btn-logout-icon" id="btn-topbar-logout" title="Cerrar sesión" aria-label="Cerrar sesión">
            ${ICONS.logout}
          </button>
        </div>

      </div>
    `;

    // Cambio rápido de rol
    const roleSelect = document.getElementById('quick-role-switcher-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => {
        const newRole = roleSelect.value;
        const switched = window.OC.auth.switchRole(newRole);
        showToast(`Rol activo: ${window.OC.auth.getRoleLabel(switched.role)}`, 'info');
        renderUserHeader();
        renderNavigation();
        navigate(currentView);
      });
    }

    // Cerrar sesión
    const logoutBtn = document.getElementById('btn-topbar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await window.OC.auth.logout();
          if (window.OC.firebase) window.OC.firebase.stopRealtimeSync();
          showToast('Sesión cerrada correctamente.', 'info');
          renderLoginView();
        } catch (err) {
          showToast(`Error al salir: ${err.message}`, 'error');
        }
      });
    }
  }

  // ----------------------------------------------------
  // MENÚ LATERAL: 4 O 5 OPCIONES SEGÚN ROL + "MÁS OPCIONES"
  // ----------------------------------------------------
  let isMoreOptionsOpen = false;

  function renderNavigation() {
    const user = window.OC.auth.getCurrentUser();
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    const requests = window.OC.requests.getAllRequests();
    const vouchers = window.OC.deliveries.getAllVouchers();
    
    // Contadores de alertas operacionales
    const pendingApprovalsCount = requests.filter(r => r.status === window.OC.requests.STATUS.PENDIENTE_APROBACION).length;
    const pendingDeliveriesCount = requests.filter(r => 
      r.status === window.OC.requests.STATUS.APROBADA || 
      r.status === window.OC.requests.STATUS.PENDIENTE_ENTREGA || 
      r.status === window.OC.requests.STATUS.ENTREGA_PARCIAL
    ).length;

    // Menú adaptado según rol
    let primaryItems = [];
    let secondaryItems = [];

    if (!user || user.role === 'solicitante') {
      primaryItems = [
        { id: 'dashboard', label: 'Inicio', icon: ICONS.dashboard },
        { id: 'requests', label: 'Pedidos', icon: ICONS.requests, badge: requests.length, badgeClass: 'nav-badge-blue' },
        { id: 'materials_catalog', label: 'Lista de materiales', icon: ICONS.package },
        { id: 'vouchers', label: 'Entregas realizadas', icon: ICONS.vouchers, badge: vouchers.length, badgeClass: 'badge-secondary' }
      ];
      secondaryItems = [
        { id: 'reports', label: 'Reportes', icon: ICONS.reports },
        { id: 'projects_view', label: 'Mis obras', icon: ICONS.building }
      ];
    } else if (user.role === 'aprobador') {
      primaryItems = [
        { id: 'dashboard', label: 'Inicio', icon: ICONS.dashboard },
        { id: 'approvals', label: 'Pedidos por aprobar', icon: ICONS.approvals, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeClass: 'nav-badge-amber' },
        { id: 'requests', label: 'Pedidos', icon: ICONS.requests, badge: requests.length, badgeClass: 'nav-badge-blue' },
        { id: 'vouchers', label: 'Entregas realizadas', icon: ICONS.vouchers, badge: vouchers.length, badgeClass: 'badge-secondary' },
        { id: 'materials_catalog', label: 'Lista de materiales', icon: ICONS.package }
      ];
      secondaryItems = [
        { id: 'reports', label: 'Reportes', icon: ICONS.reports },
        { id: 'projects_view', label: 'Mis obras', icon: ICONS.building }
      ];
    } else if (user.role === 'almacenero') {
      primaryItems = [
        { id: 'dashboard', label: 'Inicio', icon: ICONS.dashboard },
        { id: 'deliveries', label: 'Entregar materiales', icon: ICONS.deliveries, badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : null, badgeClass: 'nav-badge-blue' },
        { id: 'vouchers', label: 'Entregas realizadas', icon: ICONS.vouchers, badge: vouchers.length, badgeClass: 'badge-secondary' },
        { id: 'materials_catalog', label: 'Lista de materiales', icon: ICONS.package },
        { id: 'requests', label: 'Pedidos', icon: ICONS.requests, badge: requests.length, badgeClass: 'nav-badge-blue' }
      ];
      secondaryItems = [
        { id: 'reports', label: 'Reportes', icon: ICONS.reports },
        { id: 'projects_view', label: 'Mis obras', icon: ICONS.building }
      ];
    } else {
      // Administrador / Superadministrador
      primaryItems = [
        { id: 'dashboard', label: 'Inicio', icon: ICONS.dashboard },
        { id: 'requests', label: 'Pedidos', icon: ICONS.requests, badge: requests.length, badgeClass: 'nav-badge-blue' },
        { id: 'approvals', label: 'Pedidos por aprobar', icon: ICONS.approvals, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeClass: 'nav-badge-amber' },
        { id: 'deliveries', label: 'Entregar materiales', icon: ICONS.deliveries, badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : null, badgeClass: 'nav-badge-blue' },
        { id: 'vouchers', label: 'Entregas realizadas', icon: ICONS.vouchers, badge: vouchers.length, badgeClass: 'badge-secondary' }
      ];
      secondaryItems = [
        { id: 'materials_catalog', label: 'Lista de materiales', icon: ICONS.package },
        { id: 'projects_view', label: 'Mis obras', icon: ICONS.building },
        { id: 'reports', label: 'Reportes', icon: ICONS.reports },
        { id: 'admin', label: 'Usuarios y permisos', icon: ICONS.admin }
      ];
    }

    // Si la vista activa está dentro de "Más opciones", mantenerlo desplegado
    const isCurrentInSecondary = secondaryItems.some(it => it.id === currentView);
    if (isCurrentInSecondary) {
      isMoreOptionsOpen = true;
    }

    function renderItemBtn(it) {
      const isActive = currentView === it.id;
      return `
        <button class="nav-item ${isActive ? 'active' : ''}" data-view="${it.id}">
          <div class="nav-content-left">
            <span class="nav-icon" aria-hidden="true">${it.icon}</span>
            <span class="nav-text">${it.label}</span>
          </div>
          ${it.badge ? `<span class="nav-badge-pill ${it.badgeClass || ''}">${it.badge}</span>` : ''}
        </button>
      `;
    }

    let html = primaryItems.map(renderItemBtn).join('');

    if (secondaryItems.length > 0) {
      html += `
        <button class="nav-item nav-item-more" id="btn-toggle-more-nav" type="button" aria-expanded="${isMoreOptionsOpen ? 'true' : 'false'}">
          <div class="nav-content-left">
            <span class="nav-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </span>
            <span class="nav-text">Más opciones</span>
          </div>
          <span style="font-size: 0.85rem; transform: ${isMoreOptionsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}; transition: transform 0.2s;">▾</span>
        </button>
        <div class="sidebar-more-options" id="sidebar-more-options" style="display: ${isMoreOptionsOpen ? 'flex' : 'none'};">
          ${secondaryItems.map(renderItemBtn).join('')}
        </div>
      `;
    }

    nav.innerHTML = html;

    // Asignar clics a los botones de navegación
    nav.querySelectorAll('.nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        navigate(view);
      });
    });

    const toggleMoreBtn = document.getElementById('btn-toggle-more-nav');
    if (toggleMoreBtn) {
      toggleMoreBtn.addEventListener('click', () => {
        isMoreOptionsOpen = !isMoreOptionsOpen;
        renderNavigation();
      });
    }
  }

  // ----------------------------------------------------
  // ENRUTADOR / NAVEGACIÓN ENTRE VISTAS CON TÍTULOS SIMPLES
  // ----------------------------------------------------
  function navigate(viewName, options = {}) {
    currentView = viewName;

    // Actualizar clase activa en sidebar
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Actualizar breadcrumb superior con títulos sencillos
    const breadcrumbLabel = document.getElementById('topbar-current-view');
    const titles = {
      dashboard: 'Inicio',
      requests: 'Pedidos',
      approvals: 'Pedidos por aprobar',
      deliveries: 'Entregar materiales',
      vouchers: 'Entregas realizadas',
      reports: 'Reportes',
      materials_catalog: 'Lista de materiales',
      projects_view: 'Mis obras',
      admin: 'Usuarios y permisos'
    };
    if (breadcrumbLabel) {
      breadcrumbLabel.textContent = titles[viewName] || 'Inicio';
    }

    const contentArea = document.getElementById('main-content-area');
    if (!contentArea) return;

    // Renderizar vista correspondiente
    switch (viewName) {
      case 'dashboard':
        renderDashboardView(contentArea);
        break;
      case 'requests':
        renderRequestsView(contentArea);
        break;
      case 'approvals':
        renderApprovalsView(contentArea);
        break;
      case 'deliveries':
        renderDeliveriesView(contentArea);
        break;
      case 'vouchers':
        renderVouchersView(contentArea);
        break;
      case 'reports':
        renderReportsView(contentArea);
        break;
      case 'materials_catalog':
        renderMaterialsCatalogView(contentArea);
        break;
      case 'projects_view':
        renderProjectsView(contentArea);
        break;
      case 'admin':
        renderAdminView(contentArea, options.tab);
        break;
      default:
        renderDashboardView(contentArea);
    }

    // Inicializar tooltips de ayuda "?" en la vista cargada
    initHelpTooltips();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
        break;
      case 'admin':
        renderAdminView(contentArea, options.tab);
        break;
      default:
        renderDashboardView(contentArea);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // VISTA 1: INICIO (PANEL PRINCIPAL OPTIMIZADO)
  // ----------------------------------------------------
  function renderDashboardView(container) {
    const kpis = window.OC.reports.calculateKPIs();
    const user = window.OC.auth.getCurrentUser();
    let requests = window.OC.requests.getAllRequests();

    // Filtro por obra activa si no es ALL
    if (activeProjectId !== 'ALL') {
      requests = requests.filter(r => r.projectId === activeProjectId);
    }

    const totalRequests = requests.length;
    const vouchers = window.OC.deliveries.getAllVouchers();
    // Requisito 3: Dejar solo los 5 pedidos más recientes
    const recentRequests = requests.slice(0, 5);
    const projects = window.OC.storage.getProjects();

    // Cálculo de porcentajes para la Barra de Flujo
    const pctDelivered = totalRequests ? Math.round((kpis.delivered / totalRequests) * 100) : 0;
    const pctApproved = totalRequests ? Math.round((kpis.approved / totalRequests) * 100) : 0;
    const pctPartial = totalRequests ? Math.round((kpis.partialDelivery / totalRequests) * 100) : 0;
    const pctPending = totalRequests ? Math.round((kpis.pendingApproval / totalRequests) * 100) : 0;
    const pctRejected = totalRequests ? Math.round((kpis.rejected / totalRequests) * 100) : 0;

    // Mensaje de bienvenida simplificado: "Hola, Edgar" y la fecha
    const rawName = user ? (user.name || '').trim().split(' ')[0] : 'Edgar';
    const rawDate = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

    container.innerHTML = `
      <!-- BANNER DE INICIO -->
      <div class="operational-banner">
        <div class="operational-banner-info">
          <h3>Hola, ${rawName}</h3>
          <p>
            📅 ${formattedDate} • 
            ${activeProjectId === 'ALL' ? 'Todas mis obras' : (projects.find(p => p.id === activeProjectId)?.name || 'Obra que estoy viendo')}
          </p>
        </div>

        <div class="operational-banner-actions">
          <!-- BOTÓN GRANDE Y VISIBLE: CREAR PEDIDO -->
          <button class="btn btn-primary btn-lg" id="btn-banner-new-request" style="font-size: 1.05rem; padding: 0.85rem 1.6rem; min-height: 48px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
            ➕ Crear pedido
          </button>

          ${(isAdminUser(user) || user?.role === 'aprobador') && kpis.pendingApproval > 0 ? `
            <button class="btn btn-warning" id="btn-banner-go-approvals" style="background:#f59e0b; color:#000;">
              ${ICONS.approvals} Revisar (${kpis.pendingApproval})
            </button>
          ` : ''}

          ${(isAdminUser(user) || user?.role === 'almacenero') && kpis.approved > 0 ? `
            <button class="btn btn-success" id="btn-banner-go-deliveries">
              ${ICONS.deliveries} Entregar (${kpis.approved})
            </button>
          ` : ''}
        </div>
      </div>

      <!-- GRID DE TARJETAS CLICABLES CON NÚMEROS GRANDES Y TEXTOS CLAROS -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-pending" id="kpi-card-pending" role="button" tabindex="0" title="Ver pedidos esperando aprobación" aria-label="Esperando aprobación: ${kpis.pendingApproval}. Esperan tu revisión.">
          <div class="kpi-content">
            <span class="kpi-label">Esperando aprobación</span>
            <div class="kpi-value">${kpis.pendingApproval}</div>
            <span class="kpi-subtext">Esperan tu revisión</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.clock}</div>
        </div>

        <div class="kpi-card kpi-approved" id="kpi-card-approved" role="button" tabindex="0" title="Ver pedidos aprobados listos para entregar" aria-label="Aprobados: ${kpis.approved}. Listos para entrega.">
          <div class="kpi-content">
            <span class="kpi-label">Aprobados</span>
            <div class="kpi-value">${kpis.approved}</div>
            <span class="kpi-subtext">Listos para entrega</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.check}</div>
        </div>

        <div class="kpi-card kpi-partial" id="kpi-card-partial" role="button" tabindex="0" title="Ver pedidos con entrega incompleta" aria-label="Entregas incompletas: ${kpis.partialDelivery}. Falta entregar materiales.">
          <div class="kpi-content">
            <span class="kpi-label">Entregas incompletas</span>
            <div class="kpi-value">${kpis.partialDelivery}</div>
            <span class="kpi-subtext">Falta entregar materiales</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.deliveries}</div>
        </div>

        <div class="kpi-card kpi-delivered" id="kpi-card-delivered" role="button" tabindex="0" title="Ver pedidos entregados" aria-label="Entregados: ${kpis.delivered}. Materiales ya en obra.">
          <div class="kpi-content">
            <span class="kpi-label">Entregados</span>
            <div class="kpi-value">${kpis.delivered}</div>
            <span class="kpi-subtext">Materiales ya en obra</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-vouchers" id="kpi-card-vouchers" role="button" tabindex="0" title="Ver entregas realizadas" aria-label="Entregas realizadas: ${kpis.vouchersCount}. Comprobantes firmados.">
          <div class="kpi-content">
            <span class="kpi-label">Entregas realizadas</span>
            <div class="kpi-value">${kpis.vouchersCount}</div>
            <span class="kpi-subtext">Comprobantes firmados</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-rejected" id="kpi-card-rejected" role="button" tabindex="0" title="Ver pedidos rechazados" aria-label="Rechazados: ${kpis.rejected}. Pedidos no aprobados.">
          <div class="kpi-content">
            <span class="kpi-label">Rechazados</span>
            <div class="kpi-value">${kpis.rejected}</div>
            <span class="kpi-subtext">Pedidos no aprobados</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.x}</div>
        </div>
      </div>

      <!-- BARRA DE FLUJO OPERACIONAL (PIPELINE VISUAL) -->
      <div class="pipeline-card">
        <div class="pipeline-header">
          <span class="pipeline-title">
            <span>📊</span> Flujo de atención de pedidos (${totalRequests} en total)
          </span>
          <span style="font-size:0.9rem; font-weight:700; color:#2563eb;">
            ${pctDelivered}% Entregado
          </span>
        </div>

        <div class="pipeline-bar-wrapper">
          <div class="pipeline-segment pipeline-seg-delivered" style="width: ${pctDelivered}%" title="Entregados: ${kpis.delivered} (${pctDelivered}%)"></div>
          <div class="pipeline-segment pipeline-seg-approved" style="width: ${pctApproved}%" title="Aprobados: ${kpis.approved} (${pctApproved}%)"></div>
          <div class="pipeline-segment pipeline-seg-partial" style="width: ${pctPartial}%" title="Incompletos: ${kpis.partialDelivery} (${pctPartial}%)"></div>
          <div class="pipeline-segment pipeline-seg-pending" style="width: ${pctPending}%" title="Esperando aprobación: ${kpis.pendingApproval} (${pctPending}%)"></div>
          <div class="pipeline-segment pipeline-seg-rejected" style="width: ${pctRejected}%" title="Rechazados: ${kpis.rejected} (${pctRejected}%)"></div>
        </div>

        <div class="pipeline-legend">
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--success);"></span> Entregados (${kpis.delivered})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--primary);"></span> Aprobados (${kpis.approved})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--accent-orange);"></span> Incompletos (${kpis.partialDelivery})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--accent-amber);"></span> Esperando aprobación (${kpis.pendingApproval})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--danger);"></span> Rechazados (${kpis.rejected})
          </div>
        </div>
      </div>

      <!-- DASHBOARD 2 COLUMNAS -->
      <div class="dashboard-grid-split">
        
        <!-- COLUMNA IZQUIERDA: 5 PEDIDOS MÁS RECIENTES -->
        <div class="card">
          <div class="card-header">
            <h3><span>📋</span> Pedidos recientes</h3>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn btn-sm btn-outline" id="btn-see-all-requests">Ver todos</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table data-table-responsive-cards">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Obra</th>
                  <th>Estado</th>
                  <th class="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${recentRequests.length === 0 ? `
                  <tr><td colspan="5" class="empty-table-box">
                    <div class="empty-table-icon">📄</div>
                    <div class="empty-table-title">No hay pedidos registrados</div>
                    <div class="empty-table-msg">Pulsa en "➕ Crear pedido" para hacer tu primer requerimiento de materiales.</div>
                    <button class="btn btn-primary mt-2" onclick="window.OC.ui.openCreateRequestModal ? window.OC.ui.openCreateRequestModal() : null;">➕ Crear pedido</button>
                  </td></tr>
                ` : recentRequests.map(r => `
                  <tr>
                    <td data-label="Código"><span class="cell-code">${r.code}</span></td>
                    <td data-label="Fecha" style="font-size:0.9rem; color:#475569;">${r.createdDate}</td>
                    <td data-label="Obra">
                      <strong style="display:block; font-size:0.95rem;">${r.projectName}</strong>
                      <span style="font-size:0.85rem; color:#64748b;">📍 ${r.workFront}</span>
                    </td>
                    <td data-label="Estado">
                      <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}">
                        <span class="badge-dot" aria-hidden="true"></span>
                        ${window.OC.requests.getStatusLabel(r.status, true)}
                      </span>
                    </td>
                    <td data-label="Acción" class="text-right">
                      <button class="btn btn-sm btn-outline view-req-details-btn" data-id="${r.id}" title="Ver detalle del pedido">
                        ${ICONS.eye} Ver detalle
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA: INSUMOS DE MAYOR ROTACIÓN Y ÚLTIMAS ENTREGAS -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- TARJETA: MATERIALES MÁS PEDIDOS -->
          <div class="card">
            <div class="card-header">
              <h3><span>🧱</span> Materiales más pedidos</h3>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.9rem; font-weight:700;">
                  <span>Cemento Portland Tipo I</span>
                  <span style="color:#2563eb;">210 Bolsas</span>
                </div>
                <div style="height:8px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:85%; height:100%; background:#2563eb;"></div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.9rem; font-weight:700;">
                  <span>Acero Corrugado Grado 60</span>
                  <span style="color:#f59e0b;">130 Varillas</span>
                </div>
                <div style="height:8px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:65%; height:100%; background:#f59e0b;"></div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.9rem; font-weight:700;">
                  <span>Arena Gruesa para Concreto</span>
                  <span style="color:#10b981;">21 m³</span>
                </div>
                <div style="height:8px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:50%; height:100%; background:#10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- TARJETA: ENTREGAS REALIZADAS RECIENTES -->
          <div class="card">
            <div class="card-header">
              <h3><span>🧾</span> Entregas realizadas recientes</h3>
              <button class="btn btn-sm btn-outline" id="btn-see-all-vouchers">Ver todos</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${vouchers.length === 0 ? `
                <p style="font-size:0.9rem; color:#64748b; padding:1rem 0; text-align:center;">Aún no se han emitido comprobantes de entrega.</p>
              ` : vouchers.slice(0, 3).map(v => `
                <div style="padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                  <div>
                    <span class="cell-code" style="font-size:0.95rem;">${v.voucherNumber}</span>
                    <span style="display:block; font-size:0.85rem; color:#475569;">${v.deliveryDate}</span>
                    <span style="font-size:0.85rem; color:#0f172a; font-weight:600;">Recibió: ${v.receiverName || 'Cuadrilla'}</span>
                  </div>
                  <button class="btn btn-sm btn-outline print-single-voucher-btn" data-id="${v.id}" title="Ver comprobante oficial">
                    ${ICONS.print} Comprobante
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    // Asignar eventos del Dashboard
    const btnNewReq = document.getElementById('btn-banner-new-request');
    if (btnNewReq) {
      btnNewReq.addEventListener('click', () => {
        openNewRequestModal();
      });
    }

    const btnGoApprovals = document.getElementById('btn-banner-go-approvals');
    if (btnGoApprovals) btnGoApprovals.addEventListener('click', () => navigate('approvals'));

    const btnGoDeliveries = document.getElementById('btn-banner-go-deliveries');
    if (btnGoDeliveries) btnGoDeliveries.addEventListener('click', () => navigate('deliveries'));

    const btnSeeAll = document.getElementById('btn-see-all-requests');
    if (btnSeeAll) btnSeeAll.addEventListener('click', () => {
      activeFilters.status = 'ALL';
      navigate('requests');
    });

    const btnSeeAllVouchers = document.getElementById('btn-see-all-vouchers');
    if (btnSeeAllVouchers) btnSeeAllVouchers.addEventListener('click', () => navigate('vouchers'));

    // Navegación interactiva desde cada tarjeta KPI
    const kpiPending = document.getElementById('kpi-card-pending');
    if (kpiPending) {
      kpiPending.onclick = () => {
        if (user && (user.role === 'aprobador' || isAdminUser(user))) {
          navigate('approvals');
        } else {
          activeFilters.status = 'PENDIENTE_APROBACION';
          navigate('requests');
        }
      };
      kpiPending.onkeydown = (e) => { if (e.key === 'Enter') kpiPending.click(); };
    }

    const kpiApproved = document.getElementById('kpi-card-approved');
    if (kpiApproved) {
      kpiApproved.onclick = () => {
        if (user && (user.role === 'almacenero' || isAdminUser(user))) {
          navigate('deliveries');
        } else {
          activeFilters.status = 'APROBADA';
          navigate('requests');
        }
      };
      kpiApproved.onkeydown = (e) => { if (e.key === 'Enter') kpiApproved.click(); };
    }

    const kpiPartial = document.getElementById('kpi-card-partial');
    if (kpiPartial) {
      kpiPartial.onclick = () => {
        if (user && (user.role === 'almacenero' || isAdminUser(user))) {
          navigate('deliveries');
        } else {
          activeFilters.status = 'ENTREGA_PARCIAL';
          navigate('requests');
        }
      };
      kpiPartial.onkeydown = (e) => { if (e.key === 'Enter') kpiPartial.click(); };
    }

    const kpiDelivered = document.getElementById('kpi-card-delivered');
    if (kpiDelivered) {
      kpiDelivered.onclick = () => {
        activeFilters.status = 'ENTREGADA';
        navigate('requests');
      };
      kpiDelivered.onkeydown = (e) => { if (e.key === 'Enter') kpiDelivered.click(); };
    }

    const kpiVouchers = document.getElementById('kpi-card-vouchers');
    if (kpiVouchers) {
      kpiVouchers.onclick = () => navigate('vouchers');
      kpiVouchers.onkeydown = (e) => { if (e.key === 'Enter') kpiVouchers.click(); };
    }

    const kpiRejected = document.getElementById('kpi-card-rejected');
    if (kpiRejected) {
      kpiRejected.onclick = () => {
        activeFilters.status = 'RECHAZADA';
        navigate('requests');
      };
      kpiRejected.onkeydown = (e) => { if (e.key === 'Enter') kpiRejected.click(); };
    }

    container.querySelectorAll('.view-req-details-btn').forEach(btn => {
      btn.addEventListener('click', () => openRequestDetailsModal(btn.getAttribute('data-id')));
    });

    container.querySelectorAll('.print-single-voucher-btn').forEach(btn => {
      btn.addEventListener('click', () => openVoucherPrintModal(btn.getAttribute('data-id')));
    });
  }

  // ----------------------------------------------------
  // VISTA 2: PEDIDOS (GESTIÓN SIMPLIFICADA)
  // ----------------------------------------------------
  function renderRequestsView(container) {
    const user = window.OC.auth.getCurrentUser();
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.requests.getAllRequests();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Pedidos <button type="button" class="help-btn" data-help="Aquí ves el listado de todos los pedidos de materiales, su estado y avance." title="Ayuda sobre pedidos">?</button></h2>
          <p class="subtitle">Consulta el avance y estado de los pedidos de materiales en tus obras.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btn-create-request-main">
            ➕ Crear pedido
          </button>
          <button class="btn btn-outline" id="btn-export-requests-csv">
            ${ICONS.download} Exportar Excel
          </button>
        </div>
      </div>

      <!-- BARRA DE FILTROS EN UNA SOLA FILA -->
      <div class="filter-toolbar">
        <div class="search-input-wrap">
          <span class="search-icon">${ICONS.search}</span>
          <input type="text" id="filter-search-req" class="search-control" placeholder="Buscar por código o material..." value="${activeFilters.materialKeyword}" aria-label="Buscar pedidos por código o material">
        </div>

        <select id="filter-project-req" class="filter-select" aria-label="Filtrar por obra">
          <option value="ALL">🏢 Todas mis obras</option>
          ${projects.map(p => `<option value="${p.id}" ${activeFilters.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>

        <select id="filter-status-req" class="filter-select" aria-label="Filtrar por estado">
          <option value="ALL">Todos los estados</option>
          <option value="PENDIENTE_APROBACION" ${activeFilters.status === 'PENDIENTE_APROBACION' ? 'selected' : ''}>⏳ Esperando aprobación</option>
          <option value="APROBADA" ${activeFilters.status === 'APROBADA' ? 'selected' : ''}>✅ Aprobados</option>
          <option value="ENTREGA_PARCIAL" ${activeFilters.status === 'ENTREGA_PARCIAL' ? 'selected' : ''}>📦 Entregas incompletas</option>
          <option value="ENTREGADA" ${activeFilters.status === 'ENTREGADA' ? 'selected' : ''}>🎉 Entregados</option>
          <option value="RECHAZADA" ${activeFilters.status === 'RECHAZADA' ? 'selected' : ''}>❌ Rechazados</option>
        </select>
      </div>

      <!-- TABLA DE PEDIDOS: MÁXIMO 5 COLUMNAS VISIBLES (RESTO EN VER DETALLE) -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table data-table-responsive-cards">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Obra</th>
                <th>Estado</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody id="requests-table-body">
              <!-- Renderizado dinámico de filas filtradas -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    function updateTable() {
      const tbody = document.getElementById('requests-table-body');
      if (!tbody) return;

      const filtered = window.OC.reports.filterRequests(activeFilters);

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="5" class="empty-table-box">
            <div class="empty-table-icon">📋</div>
            <div class="empty-table-title">No se encontraron pedidos</div>
            <div class="empty-table-msg">No hay pedidos con los filtros seleccionados o aún no has creado ninguno.</div>
            <button class="btn btn-primary mt-2" onclick="window.OC.ui.openCreateRequestModal ? window.OC.ui.openCreateRequestModal() : null;">➕ Crear pedido</button>
          </td></tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(r => `
        <tr>
          <td data-label="Código"><span class="cell-code">${r.code}</span></td>
          <td data-label="Fecha" style="font-size:0.9rem; color:#475569;">${r.createdDate}</td>
          <td data-label="Obra">
            <strong style="display:block; font-size:0.95rem;">${r.projectName}</strong>
            <span style="font-size:0.85rem; color:#64748b;">📍 ${r.workFront}</span>
          </td>
          <td data-label="Estado">
            <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}">
              <span class="badge-dot" aria-hidden="true"></span>
              ${window.OC.requests.getStatusLabel(r.status, true)}
            </span>
          </td>
          <td data-label="Acción" class="text-right">
            <div style="display:inline-flex; gap:0.4rem;">
              <button class="btn btn-sm btn-outline btn-view-req" data-id="${r.id}" title="Ver detalle del pedido">
                ${ICONS.eye} Ver detalle
              </button>
              ${isAdminUser(user) && window.OC.auth.isSuperAdmin() ? `
                <button class="btn btn-sm btn-danger-outline btn-delete-single-req" data-id="${r.id}" title="Eliminar pedido">
                  ${ICONS.trash}
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-view-req').forEach(btn => {
        btn.addEventListener('click', () => openRequestDetailsModal(btn.getAttribute('data-id')));
      });

      tbody.querySelectorAll('.btn-delete-single-req').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reqId = btn.getAttribute('data-id');
          const allReqs = window.OC.storage.getRequests();
          const targetReq = allReqs.find(r => r.id === reqId);
          if (confirm(`¿Confirma eliminar el pedido ${targetReq ? targetReq.code : reqId} y sus entregas asociadas?`)) {
            try {
              if (targetReq && targetReq.items) {
                const materialsCatalog = window.OC.storage.getMaterials();
                targetReq.items.forEach(it => {
                  const pendingQty = (it.approved > 0) ? Math.max(0, it.approved - (it.delivered || 0)) : (it.requested || 0);
                  if (pendingQty > 0) {
                    const mat = materialsCatalog.find(m => m.id === it.materialId);
                    if (mat) {
                      mat.stock = (mat.stock || 0) + pendingQty;
                    }
                  }
                });
                window.OC.storage.saveMaterials(materialsCatalog);
              }

              if (window.OC.firebase && window.OC.firebase.isConnected()) {
                await window.OC.firebase.deleteRequestAndVouchers(reqId);
              } else {
                const reqs = allReqs.filter(r => r.id !== reqId);
                window.OC.storage.saveRequests(reqs);
              }
              showToast('Pedido eliminado y materiales reintegrados a almacén.', 'success');
              navigate('requests');
            } catch (err) {
              showToast(`Error al eliminar: ${err.message}`, 'error');
            }
          }
        });
      });
    }

    // Eventos de filtros
    const searchInput = document.getElementById('filter-search-req');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        activeFilters.materialKeyword = searchInput.value;
        updateTable();
      });
    }

    const projectSelect = document.getElementById('filter-project-req');
    if (projectSelect) {
      projectSelect.addEventListener('change', () => {
        activeFilters.projectId = projectSelect.value;
        updateTable();
      });
    }

    const statusSelect = document.getElementById('filter-status-req');
    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        activeFilters.status = statusSelect.value;
        updateTable();
      });
    }

    const btnNew = document.getElementById('btn-create-request-main');
    if (btnNew) btnNew.addEventListener('click', openNewRequestModal);

    const btnExport = document.getElementById('btn-export-requests-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const filtered = window.OC.reports.filterRequests(activeFilters);
        window.OC.reports.exportRequestsToCSV(filtered);
      });
    }

    updateTable();
  }

  // ----------------------------------------------------
  // VISTA 3: PEDIDOS POR APROBAR (INGENIERO RESIDENTE)
  // ----------------------------------------------------
  function renderApprovalsView(container) {
    const user = window.OC.auth.getCurrentUser();
    const pendingList = window.OC.approvals.getPendingApprovals();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Pedidos por aprobar <button type="button" class="help-btn" data-help="Revisa los pedidos hechos por los maestros, ajusta cantidades si es necesario y aprueba para despacho." title="Ayuda sobre pedidos por aprobar">?</button></h2>
          <p class="subtitle">Revisa y autoriza los pedidos de materiales solicitados para las obras.</p>
        </div>
      </div>

      ${pendingList.length === 0 ? `
        <div class="card" style="text-align:center; padding: 4rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">¡Todo al día!</h3>
          <p style="color: #475569; font-size: 1rem; max-width: 440px; margin: 0 auto 1.5rem auto;">
            No tienes pedidos esperando aprobación en este momento.
          </p>
          <button class="btn btn-outline" onclick="window.OC.ui.navigate('requests')">Ver pedidos</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${pendingList.map(r => `
            <div class="card" style="border-left: 5px solid #f59e0b;">
              <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <span class="cell-code" style="font-size:1.15rem;">${r.code}</span>
                  <span class="badge badge-status-pending ml-2" style="margin-left:0.5rem;">Esperando aprobación</span>
                  <div style="font-size:0.9rem; color:#475569; margin-top:0.25rem;">
                    📅 Solicitado: ${r.createdDate} • Requerido para: <strong>${r.requiredDate}</strong>
                  </div>
                </div>
                <div>
                  <button class="btn btn-primary btn-sm btn-open-approval-modal" data-id="${r.id}">
                    ${ICONS.approvals} Aprobar pedido
                  </button>
                </div>
              </div>

              <div class="form-grid-3 mb-3" style="background:#f8fafc; padding:1.1rem; border-radius:8px; border:1px solid #e2e8f0; font-size:0.95rem;">
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Obra</span>
                  <strong>${r.projectName}</strong>
                </div>
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Frente de trabajo</span>
                  <strong>${r.workFront}</strong>
                </div>
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Solicitante</span>
                  <strong>${r.createdBy?.name || 'Maestro de Obra'}</strong>
                </div>
              </div>

              <div style="margin-bottom:1.2rem;">
                <span style="font-size:0.85rem; font-weight:700; color:#334155;">Sustento del pedido:</span>
                <p style="font-size:0.95rem; color:#0f172a; margin-top:0.25rem; font-style:italic; background:#fff; padding:0.6rem 0.8rem; border-radius:6px; border:1px solid #f1f5f9;">"${r.justification}"</p>
              </div>

              <div>
                <span style="font-size:0.85rem; font-weight:700; color:#334155;">Materiales solicitados (${(r.items || []).length}):</span>
                <div class="table-responsive mt-2">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Unidad</th>
                        <th>Cantidad pedida</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(r.items || []).map(it => `
                        <tr>
                          <td><strong>${it.materialName}</strong> (${it.materialCode})</td>
                          <td>${it.unit}</td>
                          <td><span class="badge badge-secondary" style="font-size:0.9rem;">${it.requested} ${it.unit}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          `).join('')}
        </div>
      `}
    `;

    container.querySelectorAll('.btn-open-approval-modal').forEach(btn => {
      btn.addEventListener('click', () => openApprovalModal(btn.getAttribute('data-id')));
    });
  }

  // ----------------------------------------------------
  // VISTA 4: ENTREGAR MATERIALES (ALMACÉN DE OBRA)
  // ----------------------------------------------------
  function renderDeliveriesView(container) {
    const user = window.OC.auth.getCurrentUser();
    const pendingDeliveries = window.OC.deliveries.getPendingDeliveries();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Entregar materiales <button type="button" class="help-btn" data-help="Aquí despachas los materiales aprobados y emites el comprobante de entrega oficial." title="Ayuda sobre entrega de materiales">?</button></h2>
          <p class="subtitle">Registra la entrega física de materiales aprobados y emite el comprobante de entrega.</p>
        </div>
      </div>

      ${pendingDeliveries.length === 0 ? `
        <div class="card" style="text-align:center; padding: 4rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">¡Todo entregado!</h3>
          <p style="color: #475569; font-size: 1rem; max-width: 440px; margin: 0 auto 1.5rem auto;">
            No hay pedidos pendientes de entrega en este momento.
          </p>
          <button class="btn btn-outline" onclick="window.OC.ui.navigate('requests')">Ver pedidos</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${pendingDeliveries.map(r => `
            <div class="card" style="border-left: 5px solid ${r.status === 'ENTREGA_PARCIAL' ? '#ea580c' : '#2563eb'};">
              <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <span class="cell-code" style="font-size:1.15rem;">${r.code}</span>
                  <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}" style="margin-left:0.5rem;">
                    ${window.OC.requests.getStatusLabel(r.status)}
                  </span>
                  <div style="font-size:0.9rem; color:#475569; margin-top:0.25rem;">
                    🏗️ <strong>${r.projectName}</strong> • Frente: <strong>${r.workFront}</strong>
                  </div>
                </div>
                <div>
                  <button class="btn btn-primary btn-sm btn-open-delivery-modal" data-id="${r.id}">
                    ${ICONS.deliveries} Entregar materiales
                  </button>
                </div>
              </div>

              <!-- RESUMEN DE SALDOS -->
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Unidad</th>
                      <th>Aprobado</th>
                      <th>Entregado antes</th>
                      <th>Falta entregar</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(r.items || []).map(it => {
                      const approved = it.approved || 0;
                      const delivered = it.delivered || 0;
                      const balance = Math.max(0, approved - delivered);
                      return `
                        <tr>
                          <td><strong>${it.materialName}</strong></td>
                          <td>${it.unit}</td>
                          <td>${approved}</td>
                          <td>${delivered}</td>
                          <td>
                            <strong style="color: ${balance > 0 ? '#ea580c' : '#10b981'}; font-size:1rem;">
                              ${balance} ${it.unit}
                            </strong>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

            </div>
          `).join('')}
        </div>
      `}
    `;

    container.querySelectorAll('.btn-open-delivery-modal').forEach(btn => {
      btn.addEventListener('click', () => openDeliveryModal(btn.getAttribute('data-id')));
    });
  }

  // ----------------------------------------------------
  // VISTA 5: ENTREGAS REALIZADAS (HISTORIAL DE VALES OFICIALES)
  // ----------------------------------------------------
  function renderVouchersView(container) {
    const vouchers = window.OC.deliveries.getAllVouchers();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Entregas realizadas <button type="button" class="help-btn" data-help="Historial de comprobantes oficiales generados tras cada entrega de materiales." title="Ayuda sobre entregas realizadas">?</button></h2>
          <p class="subtitle">Historial de comprobantes oficiales emitidos tras la entrega de materiales en obra.</p>
        </div>
      </div>

      <!-- TABLA DE ENTREGAS: MÁXIMO 5 COLUMNAS VISIBLES -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table data-table-responsive-cards">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th>Pedido vinculado</th>
                <th>Obra</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${vouchers.length === 0 ? `
                <tr><td colspan="5" class="empty-table-box">
                  <div class="empty-table-icon">🧾</div>
                  <div class="empty-table-title">Sin entregas registradas</div>
                  <div class="empty-table-msg">Los comprobantes aparecerán aquí cuando el almacenero entregue materiales de un pedido.</div>
                  <button class="btn btn-primary mt-2" onclick="window.OC.ui.navigate('deliveries')">Entregar materiales</button>
                </td></tr>
              ` : vouchers.map(v => `
                <tr>
                  <td data-label="Comprobante"><span class="cell-code">${v.voucherNumber}</span></td>
                  <td data-label="Fecha" style="font-size:0.9rem; color:#475569;">${v.deliveryDate}</td>
                  <td data-label="Pedido vinculado"><strong>${v.requestCode}</strong></td>
                  <td data-label="Obra">
                    <strong style="display:block; font-size:0.95rem;">${v.projectName}</strong>
                    <span style="font-size:0.85rem; color:#64748b;">📍 ${v.workFront} • Recibió: ${v.receiverName || 'Cuadrilla'}</span>
                  </td>
                  <td data-label="Acción" class="text-right">
                    <button class="btn btn-sm btn-primary print-voucher-action" data-id="${v.id}" title="Ver e imprimir comprobante oficial">
                      ${ICONS.print} Ver comprobante
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.print-voucher-action').forEach(btn => {
      btn.addEventListener('click', () => openVoucherPrintModal(btn.getAttribute('data-id')));
    });
  }

  // ----------------------------------------------------
  // VISTA 6: REPORTES
  // ----------------------------------------------------
  function renderReportsView(container) {
    const kpis = window.OC.reports.calculateKPIs();
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.requests.getAllRequests();
    const vouchers = window.OC.deliveries.getAllVouchers();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Reportes <button type="button" class="help-btn" data-help="Resumen general de pedidos, entregas y consumo en cada una de tus obras." title="Ayuda sobre reportes">?</button></h2>
          <p class="subtitle">Consolidado general de pedidos y entregas en todas tus obras.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btn-export-full-report">
            ${ICONS.download} Exportar Excel (CSV)
          </button>
        </div>
      </div>

      <div class="kpi-grid mb-4">
        <div class="kpi-card kpi-approved">
          <div class="kpi-content">
            <span class="kpi-label">Total pedidos</span>
            <div class="kpi-value">${kpis.total}</div>
            <span class="kpi-subtext">Pedidos registrados</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.requests}</div>
        </div>

        <div class="kpi-card kpi-delivered">
          <div class="kpi-content">
            <span class="kpi-label">Entregas realizadas</span>
            <div class="kpi-value">${kpis.vouchersCount}</div>
            <span class="kpi-subtext">Comprobantes emitidos</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-pending">
          <div class="kpi-content">
            <span class="kpi-label">Tasa de aprobación</span>
            <div class="kpi-value">${kpis.total ? Math.round(((kpis.approved + kpis.delivered + kpis.partialDelivery) / kpis.total) * 100) : 0}%</div>
            <span class="kpi-subtext">Aprobados por residente</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.check}</div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3><span>🏢</span> Distribución de pedidos por obra</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table data-table-responsive-cards">
            <thead>
              <tr>
                <th>Código</th>
                <th>Obra</th>
                <th>Ubicación</th>
                <th>Pedidos</th>
                <th>Entregas</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => {
                const reqCount = requests.filter(r => r.projectId === p.id).length;
                const vouCount = vouchers.filter(v => v.projectName === p.name).length;
                return `
                  <tr>
                    <td data-label="Código"><span class="cell-code">${p.code}</span></td>
                    <td data-label="Obra"><strong>${p.name}</strong></td>
                    <td data-label="Ubicación">📍 ${p.location}</td>
                    <td data-label="Pedidos"><span class="badge badge-secondary">${reqCount} pedidos</span></td>
                    <td data-label="Entregas"><span class="badge badge-success">${vouCount} entregas</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const btnExport = document.getElementById('btn-export-full-report');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        window.OC.reports.exportRequestsToCSV(requests);
      });
    }
  }

  // ----------------------------------------------------
  // VISTA: LISTA DE MATERIALES
  // ----------------------------------------------------
  function renderMaterialsCatalogView(container) {
    const materials = window.OC.storage.getMaterials();
    const user = window.OC.auth.getCurrentUser();
    const canManage = user && (isAdminUser(user) || user.role === 'almacenero' || window.OC.auth.isSuperAdmin(user));

    // Cálculos de Almacén
    const totalMaterials = materials.length;
    const totalUnits = materials.reduce((acc, m) => acc + (m.stock || 0), 0);
    const lowStockCount = materials.filter(m => (m.stock || 0) <= (m.minStock || 50)).length;
    const totalValuePEN = materials.reduce((acc, m) => acc + ((m.stock || 0) * (m.pricePEN || 0)), 0);
    const totalValueUSD = materials.reduce((acc, m) => acc + ((m.stock || 0) * (m.priceUSD || 0)), 0);

    const categories = [...new Set(materials.map(m => m.category))].filter(Boolean);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Lista de materiales <button type="button" class="help-btn" data-help="Catálogo completo de materiales con su saldo disponible en almacén y precio." title="Ayuda sobre lista de materiales">?</button></h2>
          <p class="subtitle">Materiales disponibles en almacén con sus cantidades y precios.</p>
        </div>
        <div class="header-actions">
          ${canManage ? `
            <button class="btn btn-outline" id="btn-mat-cat-adjust">
              📥 Registrar entrada / ajuste
            </button>
            <button class="btn btn-primary" id="btn-mat-cat-add">
              ➕ Nuevo material
            </button>
          ` : ''}
          <button class="btn btn-outline" id="btn-mat-cat-export">
            ${ICONS.download} Exportar CSV
          </button>
        </div>
      </div>

      <!-- TARJETAS DE VALORIZACIÓN Y EXISTENCIAS EN ALMACÉN -->
      <div class="finance-summary-grid">
        <div class="finance-summary-card finance-card-stock">
          <span class="finance-card-label">Total Insumos / Unidades</span>
          <div class="finance-card-value">${totalUnits.toLocaleString('es-PE')} <span style="font-size:0.9rem; font-weight:600; color:#64748b;">und</span></div>
          <span class="finance-card-sub">${totalMaterials} insumos registrados (${lowStockCount} con stock bajo)</span>
        </div>

        <div class="finance-summary-card finance-card-pen">
          <span class="finance-card-label">Valorización Almacén (Soles)</span>
          <div class="finance-card-value" style="color:#047857;">S/ ${totalValuePEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span class="finance-card-sub">Moneda Nacional (PEN)</span>
        </div>

        <div class="finance-summary-card finance-card-usd">
          <span class="finance-card-label">Valorización Almacén (Dólares)</span>
          <div class="finance-card-value" style="color:#2563eb;">$ ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span class="finance-card-sub">Moneda Extranjera (USD)</span>
        </div>
      </div>

      <!-- BARRA DE FILTROS Y BÚSQUEDA -->
      <div class="card mb-3">
        <div class="filter-toolbar">
          <input type="text" id="filter-mat-search" class="search-control" placeholder="Buscar por código, descripción o categoría..." style="flex:2; min-width:240px;">
          
          <select id="filter-mat-category" class="filter-select" style="flex:1; min-width:180px;">
            <option value="ALL">Todas las Categorías</option>
            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>

          <select id="filter-mat-stock" class="filter-select" style="flex:1; min-width:180px;">
            <option value="ALL">Todos los Saldos</option>
            <option value="OK">Con Stock Normal</option>
            <option value="LOW">Stock Bajo / Crítico</option>
            <option value="EMPTY">Agotados (Saldo 0)</option>
          </select>
        </div>
      </div>

      <!-- TABLA PRINCIPAL DE INSUMOS -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Material / Descripción</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Saldo en Almacén</th>
                <th>P. Unit. Soles (S/)</th>
                <th>P. Unit. Dólares ($)</th>
                <th>Valor Almacén (S/)</th>
                <th>Valor Almacén ($)</th>
                <th>Estado</th>
                ${canManage ? '<th class="text-right">Acciones</th>' : ''}
              </tr>
            </thead>
            <tbody id="materials-table-body">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    function updateTable() {
      const tbody = document.getElementById('materials-table-body');
      if (!tbody) return;

      const currentList = window.OC.storage.getMaterials();
      const q = (document.getElementById('filter-mat-search')?.value || '').toLowerCase().trim();
      const cat = document.getElementById('filter-mat-category')?.value || 'ALL';
      const stockFilter = document.getElementById('filter-mat-stock')?.value || 'ALL';

      const filtered = currentList.filter(m => {
        if (q) {
          const matchCode = (m.code || '').toLowerCase().includes(q);
          const matchName = (m.name || '').toLowerCase().includes(q);
          const matchCat = (m.category || '').toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchCat) return false;
        }
        if (cat !== 'ALL' && m.category !== cat) return false;

        const st = m.stock || 0;
        const minSt = m.minStock || 50;
        if (stockFilter === 'OK' && st <= minSt) return false;
        if (stockFilter === 'LOW' && (st <= 0 || st > minSt)) return false;
        if (stockFilter === 'EMPTY' && st > 0) return false;

        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${canManage ? 11 : 10}" class="empty-table-box">
              <div class="empty-table-icon">🔍</div>
              <div class="empty-table-title">No se encontraron insumos</div>
              <div class="empty-table-msg">Intente con otros términos de búsqueda o filtros de categoría.</div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(m => {
        const stock = m.stock || 0;
        const minStock = m.minStock || 50;
        let stockBadgeClass = 'badge-stock-ok';
        let stockLabel = 'Disponible';
        if (stock <= 0) {
          stockBadgeClass = 'badge-stock-empty';
          stockLabel = 'Agotado';
        } else if (stock <= minStock) {
          stockBadgeClass = 'badge-stock-low';
          stockLabel = 'Stock Bajo';
        }

        const valPEN = stock * (m.pricePEN || 0);
        const valUSD = stock * (m.priceUSD || 0);

        return `
          <tr>
            <td><span class="cell-code">${m.code}</span></td>
            <td>
              <strong>${m.name}</strong>
              ${stock <= minStock && stock > 0 ? `<div style="font-size:0.72rem; color:#b45309; font-weight:600;">⚠️ Por debajo del mínimo (${minStock} ${m.unit})</div>` : ''}
              ${stock <= 0 ? `<div style="font-size:0.72rem; color:#dc2626; font-weight:700;">⛔ Sin existencias para despacho</div>` : ''}
            </td>
            <td><span class="badge badge-secondary">${m.category}</span></td>
            <td>${m.unit}</td>
            <td>
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <strong style="font-size:0.95rem; font-family:'JetBrains Mono', monospace;">${stock.toLocaleString('es-PE')}</strong>
                <span class="badge ${stockBadgeClass}">${stockLabel}</span>
              </div>
            </td>
            <td><span class="price-tag-pen">S/ ${(m.pricePEN || 0).toFixed(2)}</span></td>
            <td><span class="price-tag-usd">$ ${(m.priceUSD || 0).toFixed(2)}</span></td>
            <td><strong style="color:#047857; font-size:0.85rem;">S/ ${valPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            <td><strong style="color:#2563eb; font-size:0.85rem;">$ ${valUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            <td><span class="badge ${m.active ? 'badge-success' : 'badge-danger'}">${m.active ? 'Activo' : 'Inactivo'}</span></td>
            ${canManage ? `
              <td class="text-right">
                <div style="display:inline-flex; gap:0.35rem;">
                  <button class="btn btn-xs btn-outline btn-edit-mat" data-id="${m.id}" title="Editar Material y Precios">
                    ✏️ Editar
                  </button>
                  <button class="btn btn-xs btn-outline btn-stock-mat" data-id="${m.id}" title="Registrar Entrada / Ingreso de Stock">
                    ➕ Stock
                  </button>
                </div>
              </td>
            ` : ''}
          </tr>
        `;
      }).join('');

      if (canManage) {
        tbody.querySelectorAll('.btn-edit-mat').forEach(btn => {
          btn.onclick = () => {
            const mId = btn.getAttribute('data-id');
            const target = window.OC.storage.getMaterials().find(item => item.id === mId);
            if (target) openNewMaterialModal(target);
          };
        });

        tbody.querySelectorAll('.btn-stock-mat').forEach(btn => {
          btn.onclick = () => {
            const mId = btn.getAttribute('data-id');
            openAdjustStockModal(mId);
          };
        });
      }
    }

    updateTable();

    // Eventos de controles
    document.getElementById('filter-mat-search')?.addEventListener('input', updateTable);
    document.getElementById('filter-mat-category')?.addEventListener('change', updateTable);
    document.getElementById('filter-mat-stock')?.addEventListener('change', updateTable);

    if (canManage) {
      document.getElementById('btn-mat-cat-add')?.addEventListener('click', () => openNewMaterialModal());
      document.getElementById('btn-mat-cat-adjust')?.addEventListener('click', () => openAdjustStockModal());
    }

    // Exportar CSV
    document.getElementById('btn-mat-cat-export')?.addEventListener('click', () => {
      const list = window.OC.storage.getMaterials();
      const headers = ['Código', 'Material', 'Categoría', 'Unidad', 'Saldo en Almacén', 'Stock Mínimo', 'Precio Soles (PEN)', 'Precio Dólares (USD)', 'Valor Total Soles', 'Valor Total Dólares', 'Estado'];
      const rows = list.map(m => {
        const st = m.stock || 0;
        const pPen = m.pricePEN || 0;
        const pUsd = m.priceUSD || 0;
        return [
          m.code,
          m.name,
          m.category,
          m.unit,
          st,
          m.minStock || 50,
          pPen.toFixed(2),
          pUsd.toFixed(2),
          (st * pPen).toFixed(2),
          (st * pUsd).toFixed(2),
          m.active ? 'Activo' : 'Inactivo'
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');
      });

      const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inventario_Almacen_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // ----------------------------------------------------
  // VISTA: OBRAS Y FRENTES DE TRABAJO
  // ----------------------------------------------------
  // ----------------------------------------------------
  // VISTA: MIS OBRAS (OBRAS Y FRENTES ASIGNADOS)
  // ----------------------------------------------------
  function renderProjectsView(container) {
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.storage.getRequests();
    const vouchers = window.OC.storage.getVouchers();
    const user = window.OC.auth.getCurrentUser();

    const totalFronts = projects.reduce((acc, p) => acc + ((p.workFronts || []).length), 0);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Mis obras <button type="button" class="help-btn" data-help="Listado de obras donde tienes frentes de trabajo asignados y control de materiales." title="Ayuda sobre mis obras">?</button></h2>
          <p class="subtitle">Obras activas y frentes de trabajo asignados.</p>
        </div>
      </div>

      <div class="finance-summary-grid">
        <div class="finance-summary-card finance-card-stock">
          <span class="finance-card-label">Total de obras</span>
          <div class="finance-card-value">${projects.length} <span style="font-size:0.9rem; font-weight:600; color:#64748b;">obras</span></div>
          <span class="finance-card-sub">Obras habilitadas en el sistema</span>
        </div>
        <div class="finance-summary-card finance-card-usd">
          <span class="finance-card-label">Frentes de trabajo activos</span>
          <div class="finance-card-value" style="color:#2563eb;">${totalFronts} <span style="font-size:0.9rem; font-weight:600; color:#64748b;">frentes</span></div>
          <span class="finance-card-sub">Zonas de trabajo y entrega en obra</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Listado de mis obras</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table data-table-responsive-cards">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre de la obra</th>
                <th>Ubicación</th>
                <th>Frentes de trabajo</th>
                <th>Pedidos</th>
                <th>Entregas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => {
                const reqCount = requests.filter(r => r.projectId === p.id).length;
                const vouCount = vouchers.filter(v => v.projectName === p.name).length;
                return `
                  <tr>
                    <td data-label="Código"><span class="cell-code">${p.code}</span></td>
                    <td data-label="Nombre"><strong>${p.name}</strong></td>
                    <td data-label="Ubicación">📍 ${p.location}</td>
                    <td data-label="Frentes">
                      <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
                        ${(p.workFronts || []).map(f => `<span class="badge badge-outline" style="font-size:0.75rem;">${f}</span>`).join('')}
                      </div>
                    </td>
                    <td data-label="Pedidos"><span class="badge badge-secondary">${reqCount}</span></td>
                    <td data-label="Entregas"><span class="badge badge-success">${vouCount}</span></td>
                    <td data-label="Estado"><span class="badge ${p.active !== false ? 'badge-success' : 'badge-danger'}">${p.active !== false ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // VISTA 7: USUARIOS Y PERMISOS (ADMINISTRACIÓN)
  // ----------------------------------------------------
  function renderAdminView(container, initialTab = 'tab-materials') {
    const projects = window.OC.storage.getProjects();
    const materials = window.OC.storage.getMaterials();
    const auditLogs = window.OC.storage.getAuditLogs();
    const users = window.OC.storage.getUsers();
    const isSuperAdmin = window.OC.auth.isSuperAdmin();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Usuarios y permisos <button type="button" class="help-btn" data-help="Panel de configuración para administrar cuentas de usuario, obras, materiales y permisos." title="Ayuda sobre usuarios y permisos">?</button></h2>
          <p class="subtitle">Administración de usuarios, roles, obras y auditoría del sistema.</p>
        </div>
      </div>

      <div class="tabs-bar">
        <button class="tab-btn ${initialTab === 'tab-materials' ? 'active' : ''}" data-tab="tab-materials">🧱 Lista de materiales (${materials.length})</button>
        <button class="tab-btn ${initialTab === 'tab-projects' ? 'active' : ''}" data-tab="tab-projects">🏢 Mis obras (${projects.length})</button>
        <button class="tab-btn ${initialTab === 'tab-users' ? 'active' : ''}" data-tab="tab-users">👥 Usuarios y permisos (${users.length})</button>
        <button class="tab-btn ${initialTab === 'tab-backup' ? 'active' : ''}" data-tab="tab-backup">💾 Respaldo y datos</button>
        <button class="tab-btn ${initialTab === 'tab-audit' ? 'active' : ''}" data-tab="tab-audit">🛡️ Auditoría (${auditLogs.length})</button>
      </div>

      <!-- TAB 1: MATERIALES -->
      <div class="tab-content ${initialTab === 'tab-materials' ? 'active' : ''}" id="tab-materials">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>Materiales de Construcción Registrados</h3>
              <p class="subtitle" style="margin:0;">Control de existencias físicas y tarifas en soles y dólares.</p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-outline btn-sm" id="btn-admin-adjust-stock">
                📥 Registrar Entrada / Ajuste
              </button>
              <button class="btn btn-primary btn-sm" id="btn-admin-add-mat">
                ${ICONS.plus} Nuevo Material
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción del Material</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Saldo en Almacén</th>
                  <th>P. Unit. Soles (S/)</th>
                  <th>P. Unit. Dólares ($)</th>
                  <th>Valor Almacén (S/)</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${materials.map(m => {
                  const stock = m.stock || 0;
                  const minStock = m.minStock || 50;
                  let stockBadgeClass = 'badge-stock-ok';
                  let stockLabel = 'Disponible';
                  if (stock <= 0) {
                    stockBadgeClass = 'badge-stock-empty';
                    stockLabel = 'Agotado';
                  } else if (stock <= minStock) {
                    stockBadgeClass = 'badge-stock-low';
                    stockLabel = 'Stock Bajo';
                  }
                  const valPEN = stock * (m.pricePEN || 0);
                  return `
                    <tr>
                      <td><span class="cell-code">${m.code}</span></td>
                      <td><strong>${m.name}</strong></td>
                      <td><span class="badge badge-secondary">${m.category}</span></td>
                      <td>${m.unit}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:0.4rem;">
                          <strong style="font-size:0.9rem;">${stock.toLocaleString('es-PE')}</strong>
                          <span class="badge ${stockBadgeClass}" style="font-size:0.68rem;">${stockLabel}</span>
                        </div>
                      </td>
                      <td><span class="price-tag-pen">S/ ${(m.pricePEN || 0).toFixed(2)}</span></td>
                      <td><span class="price-tag-usd">$ ${(m.priceUSD || 0).toFixed(2)}</span></td>
                      <td><strong style="color:#047857; font-size:0.85rem;">S/ ${valPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                      <td><span class="badge ${m.active ? 'badge-success' : 'badge-danger'}">${m.active ? 'Activo' : 'Inactivo'}</span></td>
                      <td class="text-right">
                        <div style="display:inline-flex; gap:0.3rem;">
                          <button class="btn btn-xs btn-outline btn-admin-edit-mat" data-id="${m.id}" title="Editar Material">✏️ Editar</button>
                          <button class="btn btn-xs btn-outline btn-admin-adjust-mat" data-id="${m.id}" title="Entrada de Stock">➕ Stock</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: OBRAS -->
      <div class="tab-content ${initialTab === 'tab-projects' ? 'active' : ''}" id="tab-projects">
        <div class="card">
          <div class="card-header">
            <h3>Obras y Frentes de Trabajo Asignados</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre de la Obra</th>
                  <th>Ubicación</th>
                  <th>Frentes de Trabajo Activos</th>
                </tr>
              </thead>
              <tbody>
                ${projects.map(p => `
                  <tr>
                    <td><span class="cell-code">${p.code}</span></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.location}</td>
                    <td>
                      ${(p.workFronts || []).map(f => `<span class="badge badge-outline" style="margin:2px;">📍 ${f}</span>`).join(' ')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: USUARIOS Y ROLES -->
      <div class="tab-content ${initialTab === 'tab-users' ? 'active' : ''}" id="tab-users">
        <div class="card">
          <div class="card-header">
            <h3>Cuentas y Asignación de Perfiles</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Institucional</th>
                  <th>Cargo / Obra</th>
                  <th>Rol Asignado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.jobTitle || 'N/A'}</td>
                    <td><span class="badge ${window.OC.auth.getRoleBadgeClass(u.role)}">${window.OC.auth.getRoleLabel(u.role)}</span></td>
                    <td><span class="badge badge-success">Activo</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: RESPALDO Y DATOS -->
      <div class="tab-content ${initialTab === 'tab-backup' ? 'active' : ''}" id="tab-backup">
        <div class="card mb-3">
          <div class="card-header">
            <h3>Copias de Seguridad del Sistema</h3>
          </div>
          <p class="subtitle mb-3">Exporte todos los datos del sistema en formato JSON seguro o restaure datos de prueba.</p>
          <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-backup-download">
              ${ICONS.download} Descargar Copia JSON
            </button>
            <button class="btn btn-outline" id="btn-load-demo-fresh">
              🔄 Restaurar Datos Demo de Prueba
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 5: AUDITORÍA -->
      <div class="tab-content ${initialTab === 'tab-audit' ? 'active' : ''}" id="tab-audit">
        <div class="card">
          <div class="card-header">
            <h3>Registro Histórico de Auditoría Operativa</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acción Realizada</th>
                  <th>Detalle Operativo</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.map(a => `
                  <tr>
                    <td style="font-size:0.8rem; color:#64748b;">${a.dateFormatted}</td>
                    <td><strong>${a.userName}</strong></td>
                    <td><span class="badge badge-secondary">${a.userRole}</span></td>
                    <td><strong>${a.action}</strong></td>
                    <td style="font-size:0.85rem;">${a.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Eventos de Pestañas
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    const btnBackup = document.getElementById('btn-backup-download');
    if (btnBackup) btnBackup.addEventListener('click', () => window.OC.storage.exportBackupJSON());

    const btnDemoFresh = document.getElementById('btn-load-demo-fresh');
    if (btnDemoFresh) {
      btnDemoFresh.addEventListener('click', () => {
        if (confirm('¿Desea restablecer los datos demostrativos completos?')) {
          window.OC.storage.loadDemoData();
          showToast('Datos de prueba cargados con éxito.', 'success');
          enterApp();
        }
      });
    }

    const btnAdminAddMat = document.getElementById('btn-admin-add-mat');
    if (btnAdminAddMat) {
      btnAdminAddMat.addEventListener('click', () => openNewMaterialModal());
    }

    const btnAdminAdjustStock = document.getElementById('btn-admin-adjust-stock');
    if (btnAdminAdjustStock) {
      btnAdminAdjustStock.addEventListener('click', () => openAdjustStockModal());
    }

    container.querySelectorAll('.btn-admin-edit-mat').forEach(btn => {
      btn.addEventListener('click', () => {
        const matId = btn.getAttribute('data-id');
        const mat = materials.find(m => m.id === matId);
        if (mat) openNewMaterialModal(mat);
      });
    });

    container.querySelectorAll('.btn-admin-adjust-mat').forEach(btn => {
      btn.addEventListener('click', () => {
        const matId = btn.getAttribute('data-id');
        openAdjustStockModal(matId);
      });
    });
  }

  // ----------------------------------------------------
  // MODAL: NUEVO / EDITAR MATERIAL EN CATÁLOGO
  // ----------------------------------------------------
  function openNewMaterialModal(materialToEdit = null) {
    const isEdit = !!materialToEdit;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const defaultExchangeRate = 3.75;
    const currentCode = isEdit ? materialToEdit.code : '';
    const currentName = isEdit ? materialToEdit.name : '';
    const currentCategory = isEdit ? materialToEdit.category : 'Albañilería';
    const currentUnit = isEdit ? materialToEdit.unit : 'unidad';
    const currentStock = isEdit ? (materialToEdit.stock || 0) : 100000;
    const currentMinStock = isEdit ? (materialToEdit.minStock || 0) : 10000;
    const currentPricePEN = isEdit ? (materialToEdit.pricePEN || 0) : 0.95;
    const currentPriceUSD = isEdit ? (materialToEdit.priceUSD || 0) : parseFloat((currentPricePEN / defaultExchangeRate).toFixed(2));
    const currentActive = isEdit ? (materialToEdit.active !== false) : true;

    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div>
            <h3>${isEdit ? '✏️ Editar Material de Catálogo' : '🧱 Nuevo Material para Almacén'}</h3>
            <span class="badge badge-secondary" style="font-size:0.75rem;">Control de Saldos y Precios Duales (PEN / USD)</span>
          </div>
          <button class="modal-close" id="modal-close-new-mat">&times;</button>
        </div>

        <form id="form-new-material">
          <div class="modal-body">
            <p class="subtitle mb-3">
              ${isEdit ? 'Actualice las características, precios y parámetros de inventario del insumo.' : 'Registre un nuevo insumo de construcción con su saldo disponible en almacén y sus precios oficiales en soles y dólares.'}
            </p>

            <div class="form-grid-3 mb-3">
              <div class="form-group">
                <label for="mat-code-input">Código de Insumo *</label>
                <input type="text" id="mat-code-input" class="form-control" value="${currentCode}" placeholder="ej. LAD-KIN-18, CEM-SOL-I" required>
              </div>

              <div class="form-group" style="grid-column: span 2;">
                <label for="mat-name-input">Nombre / Descripción del Material *</label>
                <input type="text" id="mat-name-input" class="form-control" value="${currentName}" placeholder="ej. Ladrillo King Kong 18 Huecos (9x13x24 cm)" required>
              </div>
            </div>

            <div class="form-grid-3 mb-3">
              <div class="form-group">
                <label for="mat-category-select">Categoría de Insumo *</label>
                <select id="mat-category-select" class="form-control" required>
                  <option value="Albañilería" ${currentCategory === 'Albañilería' ? 'selected' : ''}>Albañilería y Muros</option>
                  <option value="Conglomerantes" ${currentCategory === 'Conglomerantes' ? 'selected' : ''}>Conglomerantes (Cementos, Cales)</option>
                  <option value="Aceros" ${currentCategory === 'Aceros' ? 'selected' : ''}>Aceros y Mallas</option>
                  <option value="Agregados" ${currentCategory === 'Agregados' ? 'selected' : ''}>Agregados (Arenas, Gravas)</option>
                  <option value="Instalaciones" ${currentCategory === 'Instalaciones' ? 'selected' : ''}>Instalaciones Sanitarias y Eléctricas</option>
                  <option value="Ferretería" ${currentCategory === 'Ferretería' ? 'selected' : ''}>Ferretería y Clavería</option>
                  <option value="Químicos" ${currentCategory === 'Químicos' ? 'selected' : ''}>Químicos y Aditivos</option>
                  <option value="Acabados" ${currentCategory === 'Acabados' ? 'selected' : ''}>Acabados y Pinturas</option>
                  <option value="Madera" ${currentCategory === 'Madera' ? 'selected' : ''}>Maderas y Encofrados</option>
                  <option value="Varios" ${currentCategory === 'Varios' ? 'selected' : ''}>Varios / Otros</option>
                </select>
              </div>

              <div class="form-group">
                <label for="mat-unit-input">Unidad de Medida *</label>
                <select id="mat-unit-input" class="form-control" required>
                  <option value="unidad" ${currentUnit === 'unidad' ? 'selected' : ''}>Unidad (und)</option>
                  <option value="millar" ${currentUnit === 'millar' ? 'selected' : ''}>Millar</option>
                  <option value="bolsa" ${currentUnit === 'bolsa' ? 'selected' : ''}>Bolsa (42.5 kg)</option>
                  <option value="varilla" ${currentUnit === 'varilla' ? 'selected' : ''}>Varilla (9 m)</option>
                  <option value="m3" ${currentUnit === 'm3' ? 'selected' : ''}>Metro Cúbico (m³)</option>
                  <option value="m2" ${currentUnit === 'm2' ? 'selected' : ''}>Metro Cuadrado (m²)</option>
                  <option value="kg" ${currentUnit === 'kg' ? 'selected' : ''}>Kilogramo (kg)</option>
                  <option value="tubo" ${currentUnit === 'tubo' ? 'selected' : ''}>Tubo</option>
                  <option value="galón" ${currentUnit === 'galón' ? 'selected' : ''}>Galón</option>
                  <option value="rollo" ${currentUnit === 'rollo' ? 'selected' : ''}>Rollo</option>
                  <option value="plancha" ${currentUnit === 'plancha' ? 'selected' : ''}>Plancha</option>
                </select>
              </div>

              <div class="form-group">
                <label for="mat-status-select">Estado del Material *</label>
                <select id="mat-status-select" class="form-control" required>
                  <option value="1" ${currentActive ? 'selected' : ''}>Activo (Disponible para pedidos)</option>
                  <option value="0" ${!currentActive ? 'selected' : ''}>Inactivo (Deshabilitado)</option>
                </select>
              </div>
            </div>

            <div style="background:#f8fafc; padding:1.25rem; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:1.25rem;">
              <div style="font-size:0.8rem; font-weight:700; color:#0f766e; text-transform:uppercase; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
                <span>📦</span> Control de Saldo y Parámetros de Almacén
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="mat-stock-input">${isEdit ? 'Saldo Actual en Almacén *' : 'Saldo Inicial en Almacén *'}</label>
                  <input type="number" id="mat-stock-input" class="form-control" value="${currentStock}" min="0" step="any" required>
                  <small class="text-muted">Cantidad física disponible actualmente en el almacén de obra.</small>
                </div>

                <div class="form-group">
                  <label for="mat-minstock-input">Stock Mínimo de Alerta *</label>
                  <input type="number" id="mat-minstock-input" class="form-control" value="${currentMinStock}" min="0" step="any" required>
                  <small class="text-muted">Umbral para alertas visuales de reposición inmediata.</small>
                </div>
              </div>
            </div>

            <div style="background:#f0fdf4; padding:1.25rem; border-radius:10px; border:1px solid #bbf7d0; margin-bottom:1rem;">
              <div style="font-size:0.8rem; font-weight:700; color:#166534; text-transform:uppercase; margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between;">
                <span>💵 Precios Oficiales (Soles PEN y Dólares USD)</span>
                <span style="font-size:0.75rem; font-weight:600; color:#15803d;">Tipo de Cambio Ref.: S/ ${defaultExchangeRate.toFixed(2)}</span>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="mat-price-pen">Precio Unitario en Soles (S/.) *</label>
                  <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:#059669;">S/</span>
                    <input type="number" id="mat-price-pen" class="form-control" style="padding-left:36px;" value="${currentPricePEN}" min="0" step="0.01" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="mat-price-usd">Precio Unitario en Dólares ($ USD) *</label>
                  <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:#2563eb;">$</span>
                    <input type="number" id="mat-price-usd" class="form-control" style="padding-left:32px;" value="${currentPriceUSD}" min="0" step="0.01" required>
                  </div>
                </div>
              </div>

              <div style="font-size:0.75rem; color:#166534; margin-top:0.5rem;">
                💡 <em>Al modificar el precio en Soles o en Dólares, el sistema calcula automáticamente la equivalencia en la otra moneda.</em>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-mat-modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Material en Almacén'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-new-mat').onclick = close;
    document.getElementById('btn-cancel-mat-modal').onclick = close;

    // Sincronización automática de precios Soles <-> Dólares
    const pricePENInput = document.getElementById('mat-price-pen');
    const priceUSDInput = document.getElementById('mat-price-usd');

    pricePENInput.addEventListener('input', () => {
      const pen = parseFloat(pricePENInput.value);
      if (!isNaN(pen) && pen >= 0) {
        priceUSDInput.value = (pen / defaultExchangeRate).toFixed(2);
      }
    });

    priceUSDInput.addEventListener('input', () => {
      const usd = parseFloat(priceUSDInput.value);
      if (!isNaN(usd) && usd >= 0) {
        pricePENInput.value = (usd * defaultExchangeRate).toFixed(2);
      }
    });

    document.getElementById('form-new-material').onsubmit = (e) => {
      e.preventDefault();
      const code = document.getElementById('mat-code-input').value.trim();
      const name = document.getElementById('mat-name-input').value.trim();
      const category = document.getElementById('mat-category-select').value;
      const unit = document.getElementById('mat-unit-input').value;
      const stock = parseFloat(document.getElementById('mat-stock-input').value);
      const minStock = parseFloat(document.getElementById('mat-minstock-input').value);
      const pricePEN = parseFloat(pricePENInput.value);
      const priceUSD = parseFloat(priceUSDInput.value);
      const active = document.getElementById('mat-status-select').value === '1';

      if (isEdit) {
        const res = window.OC.storage.updateMaterial(materialToEdit.id, {
          code, name, category, unit, stock, minStock, pricePEN, priceUSD, active
        });
        if (res.success) {
          showToast(`Material "${name}" actualizado con éxito.`, 'success');
          close();
          if (currentView === 'materials_catalog') renderMaterialsCatalogView(document.getElementById('main-content-area'));
          else if (currentView === 'admin') renderAdminView(document.getElementById('main-content-area'), 'tab-materials');
        } else {
          alert(res.message);
        }
      } else {
        const res = window.OC.storage.addMaterial({
          code, name, category, unit, stock, minStock, pricePEN, priceUSD, active
        });
        if (res.success) {
          showToast(`Nuevo material "${name}" registrado en almacén.`, 'success');
          close();
          if (currentView === 'materials_catalog') renderMaterialsCatalogView(document.getElementById('main-content-area'));
          else if (currentView === 'admin') renderAdminView(document.getElementById('main-content-area'), 'tab-materials');
        } else {
          alert(res.message);
        }
      }
    };
  }

  // ----------------------------------------------------
  // MODAL: REGISTRAR ENTRADA / AJUSTE DE STOCK
  // ----------------------------------------------------
  function openAdjustStockModal(selectedMaterialId = null) {
    const materials = window.OC.storage.getMaterials();
    if (!materials.length) return alert('No hay materiales en el catálogo.');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>📥 Registro de Entrada o Ajuste de Almacén</h3>
          <button class="modal-close" id="modal-close-adjust">&times;</button>
        </div>

        <form id="form-adjust-stock">
          <div class="modal-body">
            <p class="subtitle mb-3">Incremente el saldo por compras/recepción de guías, o realice un ajuste de inventario físico.</p>

            <div class="form-group mb-3">
              <label for="adjust-mat-select">Material / Insumo *</label>
              <select id="adjust-mat-select" class="form-control" required>
                <option value="">Seleccione material...</option>
                ${materials.map(m => `<option value="${m.id}" ${selectedMaterialId === m.id ? 'selected' : ''}>[${m.code}] ${m.name} (Saldo actual: ${(m.stock || 0).toLocaleString('es-PE')} ${m.unit})</option>`).join('')}
              </select>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group">
                <label for="adjust-type-select">Tipo de Movimiento *</label>
                <select id="adjust-type-select" class="form-control" required>
                  <option value="IN">➕ Entrada / Ingreso por Compra (+Stock)</option>
                  <option value="OUT">➖ Ajuste por Merma / Salida (-Stock)</option>
                  <option value="SET">🔄 Establecer Conteo Físico Exacto</option>
                </select>
              </div>

              <div class="form-group">
                <label for="adjust-qty-input">Cantidad *</label>
                <input type="number" id="adjust-qty-input" class="form-control" min="0.01" step="any" placeholder="ej. 25000" required>
              </div>
            </div>

            <div class="form-group mb-3">
              <label for="adjust-reason-input">Motivo / Documento de Referencia *</label>
              <input type="text" id="adjust-reason-input" class="form-control" placeholder="ej. Guía de Remisión GR-001-45892 / Orden de Compra OC-2026-10" required>
            </div>

            <div id="adjust-projected-box" class="stock-preview-banner" style="display:none;">
              <!-- Proyección en tiempo real -->
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-adjust">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar Movimiento de Almacén</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-adjust').onclick = close;
    document.getElementById('btn-cancel-adjust').onclick = close;

    const matSelect = document.getElementById('adjust-mat-select');
    const typeSelect = document.getElementById('adjust-type-select');
    const qtyInput = document.getElementById('adjust-qty-input');
    const previewBox = document.getElementById('adjust-projected-box');

    function updateProjected() {
      const mat = materials.find(m => m.id === matSelect.value);
      const qty = parseFloat(qtyInput.value);
      if (!mat || isNaN(qty) || qty <= 0) {
        previewBox.style.display = 'none';
        return;
      }
      previewBox.style.display = 'flex';
      const prev = mat.stock || 0;
      let next = prev;
      if (typeSelect.value === 'IN') next = prev + qty;
      else if (typeSelect.value === 'OUT') next = Math.max(0, prev - qty);
      else next = qty;

      previewBox.innerHTML = `
        <div>
          <span style="font-size:0.75rem; color:#475569; display:block;">Saldo Actual: <strong>${prev.toLocaleString('es-PE')} ${mat.unit}</strong></span>
          <span style="font-size:0.85rem; color:#0f766e; font-weight:700;">Nuevo Saldo Proyectado: <strong>${next.toLocaleString('es-PE')} ${mat.unit}</strong></span>
        </div>
        <span class="badge ${next <= (mat.minStock || 0) ? 'badge-stock-low' : 'badge-stock-ok'}">
          ${next <= (mat.minStock || 0) ? 'Alerta: Stock Bajo' : 'Nivel Adecuado'}
        </span>
      `;
    }

    matSelect.addEventListener('change', updateProjected);
    typeSelect.addEventListener('change', updateProjected);
    qtyInput.addEventListener('input', updateProjected);
    if (matSelect.value) updateProjected();

    document.getElementById('form-adjust-stock').onsubmit = (e) => {
      e.preventDefault();
      const matId = matSelect.value;
      const type = typeSelect.value;
      const qty = parseFloat(qtyInput.value);
      const reason = document.getElementById('adjust-reason-input').value.trim();

      const res = window.OC.storage.adjustMaterialStock(matId, qty, reason, type);
      if (res.success) {
        showToast(`Stock actualizado: ${res.material.name} ahora tiene saldo de ${res.newStock.toLocaleString('es-PE')} ${res.material.unit}.`, 'success');
        close();
        if (currentView === 'materials_catalog') renderMaterialsCatalogView(document.getElementById('main-content-area'));
        else if (currentView === 'admin') renderAdminView(document.getElementById('main-content-area'), 'tab-materials');
      } else {
        alert(res.message);
      }
    };
  }

  // ----------------------------------------------------
  // MODAL 1: CREAR PEDIDO (FORMULARIO EN 3 PASOS CON BARRA DE AVANCE)
  // ----------------------------------------------------
  function openNewRequestModal() {
    const projects = window.OC.storage.getProjects();
    const materials = window.OC.storage.getMaterials().filter(m => m.active !== false);
    let currentItems = [];
    let currentStep = 1;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div>
            <h3>➕ Crear pedido de materiales</h3>
            <span class="badge badge-secondary" style="font-size:0.8rem;">Control de materiales y saldos de almacén</span>
          </div>
          <button class="modal-close" id="modal-close-new-req" aria-label="Cerrar ventana">&times;</button>
        </div>

        <!-- BARRA DE AVANCE EN PASOS (STEPPER WIZARD) -->
        <div style="padding: 1.25rem 1.5rem 0.5rem 1.5rem; background:#f8fafc; border-bottom:1px solid #e2e8f0;">
          <div class="form-stepper">
            <div class="form-stepper-progress-bar">
              <div class="form-stepper-progress-fill" id="stepper-fill" style="width: 0%;"></div>
            </div>
            
            <div class="step-node active" id="step-node-1">
              <div class="step-number">1</div>
              <span class="step-title">1. Obra y fecha</span>
            </div>

            <div class="step-node" id="step-node-2">
              <div class="step-number">2</div>
              <span class="step-title">2. Materiales</span>
            </div>

            <div class="step-node" id="step-node-3">
              <div class="step-number">3</div>
              <span class="step-title">3. Justificación</span>
            </div>
          </div>
        </div>

        <form id="form-new-request">
          <div class="modal-body" style="padding-top:1.5rem;">
            
            <!-- PASO 1: UBICACIÓN Y FECHA -->
            <div id="step-container-1">
              <div style="margin-bottom:1.25rem;">
                <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.25rem;">Paso 1 de 3: ¿Dónde y cuándo se usarán los materiales?</h4>
                <p style="font-size:0.9rem; color:#475569;">Indica la obra, el frente de trabajo y la fecha en que requieres los insumos.</p>
              </div>

              <div class="form-grid-3 mb-3">
                <div class="form-group">
                  <label for="req-proj-select">
                    Obra * 
                    <button type="button" class="help-btn" data-help="Selecciona la obra donde se realizarán los trabajos de construcción." title="Ayuda sobre obra">?</button>
                  </label>
                  <select id="req-proj-select" class="form-control" required>
                    <option value="">Selecciona una obra...</option>
                    ${projects.map(p => `<option value="${p.id}" ${activeProjectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                  </select>
                  <span class="form-help-text">Obra donde se destinarán los insumos.</span>
                </div>

                <div class="form-group">
                  <label for="req-front-select">
                    Frente de trabajo *
                    <button type="button" class="help-btn" data-help="Zona específica de trabajo dentro de la obra (ej. Cimentaciones, Muro perimétrico, Piso 2)." title="Ayuda sobre frente">?</button>
                  </label>
                  <select id="req-front-select" class="form-control" required>
                    <option value="">Primero elige una obra...</option>
                  </select>
                  <span class="form-help-text">Sector específico donde se trabajará.</span>
                </div>

                <div class="form-group">
                  <label for="req-date-input">
                    Fecha requerida en obra *
                    <button type="button" class="help-btn" data-help="Día programado en que los materiales deben estar disponibles en obra." title="Ayuda sobre fecha">?</button>
                  </label>
                  <input type="date" id="req-date-input" class="form-control" required>
                  <span class="form-help-text">Día en que se necesitan los materiales.</span>
                </div>
              </div>

              <div id="step-1-error" class="form-error-inline" style="display:none;"></div>
            </div>

            <!-- PASO 2: AGREGADOR DE MATERIALES -->
            <div id="step-container-2" style="display:none;">
              <div style="margin-bottom:1.25rem;">
                <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.25rem;">Paso 2 de 3: ¿Qué materiales necesitas?</h4>
                <p style="font-size:0.9rem; color:#475569;">Elige los insumos del catálogo de almacén y la cantidad que requieres.</p>
              </div>

              <div style="background:#f8fafc; padding:1.25rem; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:1.25rem;">
                <div class="form-grid-3" style="align-items:flex-end;">
                  <div class="form-group" style="grid-column: span 2;">
                    <label for="picker-material-select">
                      Elegir material de almacén *
                      <button type="button" class="help-btn" data-help="Solo se muestran los insumos activos en el catálogo de almacén." title="Ayuda sobre materiales">?</button>
                    </label>
                    <select id="picker-material-select" class="form-control">
                      <option value="">Buscar material en almacén...</option>
                      ${materials.map(m => {
                        const st = m.stock || 0;
                        return `<option value="${m.id}" data-stock="${st}" data-unit="${m.unit}" data-price-pen="${m.pricePEN || 0}" data-price-usd="${m.priceUSD || 0}">[${m.code}] ${m.name} - Disponible: ${st.toLocaleString('es-PE')} ${m.unit} (S/ ${(m.pricePEN || 0).toFixed(2)})</option>`;
                      }).join('')}
                    </select>
                    <span class="form-help-text">Selecciona un material con saldo disponible.</span>
                  </div>

                  <div class="form-group">
                    <label for="picker-qty-input">Cantidad a pedir</label>
                    <div style="display:flex; gap:0.5rem;">
                      <input type="number" id="picker-qty-input" class="form-control" step="any" min="0.01" placeholder="ej. 50">
                      <button type="button" class="btn btn-primary" id="btn-add-item-to-table" style="flex-shrink:0;">
                        ${ICONS.plus} Añadir
                      </button>
                    </div>
                  </div>
                </div>

                <!-- BANNER DINÁMICO DE SALDO Y PRECIOS -->
                <div id="picker-stock-info" class="stock-preview-banner mt-2" style="display:none;"></div>
                <div id="picker-stock-error" class="stock-warning-banner mt-2" style="display:none;"></div>
              </div>

              <!-- TABLA DE MATERIALES AGREGADOS -->
              <div class="table-responsive mb-2">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Unidad</th>
                      <th>Disponible</th>
                      <th>Cantidad pedida</th>
                      <th>Precio unitario</th>
                      <th>Subtotal estimado</th>
                      <th class="text-right">Quitar</th>
                    </tr>
                  </thead>
                  <tbody id="new-req-items-tbody">
                    <tr><td colspan="7" class="text-center text-muted" style="padding:1.5rem;">Aún no has agregado materiales a la lista. Elige uno arriba y pulsa "Añadir".</td></tr>
                  </tbody>
                  <tfoot id="new-req-items-tfoot" style="display:none; background:#f8fafc; font-weight:700;">
                    <tr>
                      <td colspan="5" class="text-right" style="padding:0.85rem 1rem;">TOTAL ESTIMADO DEL PEDIDO:</td>
                      <td colspan="2" style="padding:0.85rem 1rem;">
                        <div style="font-size:1rem; color:#047857;" id="foot-total-pen">S/ 0.00</div>
                        <div style="font-size:0.9rem; color:#2563eb;" id="foot-total-usd">$ 0.00</div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div id="step-2-error" class="form-error-inline" style="display:none;"></div>
            </div>

            <!-- PASO 3: JUSTIFICACIÓN TÉCNICA -->
            <div id="step-container-3" style="display:none;">
              <div style="margin-bottom:1.25rem;">
                <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.25rem;">Paso 3 de 3: ¿Para qué se usarán los materiales?</h4>
                <p style="font-size:0.9rem; color:#475569;">Escribe el motivo del pedido para que el Ingeniero Residente pueda revisarlo y aprobarlo.</p>
              </div>

              <!-- RESUMEN PREVIO -->
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
                <div style="font-size:0.9rem; color:#1e40af; font-weight:700; margin-bottom:0.4rem;">📋 Resumen de tu pedido:</div>
                <div style="font-size:0.85rem; color:#1e293b;" id="step-3-summary-text">
                  Cargando resumen...
                </div>
              </div>

              <div class="form-group mb-3">
                <label for="req-justification-input">
                  Sustento o motivo del pedido (Mínimo 10 letras) *
                  <button type="button" class="help-btn" data-help="Explica brevemente la actividad o partida donde se aplicarán los materiales." title="Ayuda sobre sustento">?</button>
                </label>
                <textarea id="req-justification-input" class="form-control" rows="3" placeholder="ej. Para vaciado de zapatas y vigas de cimentación según plano de estructuras E-02..." required></textarea>
                <span class="form-help-text">Explica con claridad la labor o partida en la que se usarán.</span>
              </div>

              <div class="form-group">
                <label for="req-obs-input">
                  Observaciones adicionales (Opcional)
                  <button type="button" class="help-btn" data-help="Cualquier indicación especial sobre horario de descarga o coordinación con almacén." title="Ayuda sobre observaciones">?</button>
                </label>
                <input type="text" id="req-obs-input" class="form-control" placeholder="ej. Coordinar descarga temprano en rampa norte">
                <span class="form-help-text">Instrucciones adicionales para almacén o residencia.</span>
              </div>

              <div id="step-3-error" class="form-error-inline" style="display:none;"></div>
            </div>

          </div>

          <div class="modal-footer flex-between">
            <button type="button" class="btn btn-secondary" id="btn-wizard-back">
              Volver
            </button>
            <button type="button" class="btn btn-primary" id="btn-wizard-next">
              Siguiente: Elegir materiales ➔
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    document.getElementById('modal-close-new-req').onclick = closeModal;

    const projSelect = document.getElementById('req-proj-select');
    const frontSelect = document.getElementById('req-front-select');
    const dateInput = document.getElementById('req-date-input');

    function updateFronts() {
      const p = projects.find(it => it.id === projSelect.value);
      if (p && p.workFronts && p.workFronts.length) {
        frontSelect.innerHTML = p.workFronts.map(f => `<option value="${f}">${f}</option>`).join('');
      } else {
        frontSelect.innerHTML = '<option value="Frente General">Frente General de Obra</option>';
      }
    }
    projSelect.addEventListener('change', updateFronts);
    if (projSelect.value) updateFronts();

    // Fecha sugerida por defecto: mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().slice(0, 10);

    // Stepper logic
    const step1Container = document.getElementById('step-container-1');
    const step2Container = document.getElementById('step-container-2');
    const step3Container = document.getElementById('step-container-3');
    const stepNode1 = document.getElementById('step-node-1');
    const stepNode2 = document.getElementById('step-node-2');
    const stepNode3 = document.getElementById('step-node-3');
    const stepperFill = document.getElementById('stepper-fill');
    const btnBack = document.getElementById('btn-wizard-back');
    const btnNext = document.getElementById('btn-wizard-next');

    function updateWizardUI() {
      step1Container.style.display = currentStep === 1 ? 'block' : 'none';
      step2Container.style.display = currentStep === 2 ? 'block' : 'none';
      step3Container.style.display = currentStep === 3 ? 'block' : 'none';

      stepNode1.className = 'step-node ' + (currentStep === 1 ? 'active' : (currentStep > 1 ? 'completed' : ''));
      stepNode2.className = 'step-node ' + (currentStep === 2 ? 'active' : (currentStep > 2 ? 'completed' : ''));
      stepNode3.className = 'step-node ' + (currentStep === 3 ? 'active' : '');

      stepperFill.style.width = currentStep === 1 ? '0%' : (currentStep === 2 ? '50%' : '100%');

      if (currentStep === 1) {
        btnBack.textContent = 'Cancelar';
        btnNext.textContent = 'Siguiente: Elegir materiales ➔';
      } else if (currentStep === 2) {
        btnBack.textContent = '⬅ Volver al paso 1';
        btnNext.textContent = 'Siguiente: Justificación ➔';
      } else if (currentStep === 3) {
        btnBack.textContent = '⬅ Volver al paso 2';
        btnNext.textContent = '✔ Crear pedido';

        // Actualizar resumen en paso 3
        const pObj = projects.find(it => it.id === projSelect.value);
        const totalItemsCount = currentItems.length;
        const totalPEN = currentItems.reduce((acc, it) => acc + (it.subtotalPEN || 0), 0);
        const summaryText = document.getElementById('step-3-summary-text');
        if (summaryText) {
          summaryText.innerHTML = `
            <strong>Obra:</strong> ${pObj ? pObj.name : 'No seleccionada'} • 
            <strong>Frente:</strong> ${frontSelect.value} • 
            <strong>Fecha requerida:</strong> ${dateInput.value}<br>
            <strong>Materiales:</strong> ${totalItemsCount} tipo(s) de insumo • 
            <strong>Total estimado:</strong> S/ ${totalPEN.toFixed(2)}
          `;
        }
      }
    }

    btnBack.onclick = () => {
      if (currentStep === 1) {
        closeModal();
      } else {
        currentStep--;
        updateWizardUI();
      }
    };

    btnNext.onclick = () => {
      const step1Error = document.getElementById('step-1-error');
      const step2Error = document.getElementById('step-2-error');
      const step3Error = document.getElementById('step-3-error');
      if (step1Error) step1Error.style.display = 'none';
      if (step2Error) step2Error.style.display = 'none';
      if (step3Error) step3Error.style.display = 'none';

      if (currentStep === 1) {
        if (!projSelect.value) {
          step1Error.textContent = 'Por favor selecciona la obra donde se usarán los materiales.';
          step1Error.style.display = 'flex';
          projSelect.focus();
          return;
        }
        if (!frontSelect.value) {
          step1Error.textContent = 'Por favor selecciona el frente de trabajo.';
          step1Error.style.display = 'flex';
          frontSelect.focus();
          return;
        }
        if (!dateInput.value) {
          step1Error.textContent = 'Por favor indica la fecha en que requieres los materiales.';
          step1Error.style.display = 'flex';
          dateInput.focus();
          return;
        }
        currentStep = 2;
        updateWizardUI();
      } else if (currentStep === 2) {
        if (currentItems.length === 0) {
          step2Error.textContent = 'Debes agregar al menos un material a tu pedido antes de continuar.';
          step2Error.style.display = 'flex';
          return;
        }
        currentStep = 3;
        updateWizardUI();
      } else if (currentStep === 3) {
        const justification = document.getElementById('req-justification-input').value.trim();
        if (justification.length < 10) {
          step3Error.textContent = 'Por favor escribe al menos 10 letras explicando en qué actividad o partida se usarán los materiales.';
          step3Error.style.display = 'flex';
          document.getElementById('req-justification-input').focus();
          return;
        }

        const res = window.OC.requests.createRequest({
          projectId: projSelect.value,
          workFront: frontSelect.value,
          requiredDate: dateInput.value,
          justification: justification,
          observations: document.getElementById('req-obs-input').value,
          items: currentItems
        });

        if (res.success) {
          // Requisito 7: Mensaje de confirmación amable tras crear pedido
          showToast('¡Pedido enviado! Esperando aprobación del Ingeniero Residente.', 'success');
          closeModal();
          navigate('requests');
        } else {
          step3Error.textContent = res.message || 'Error al crear el pedido. Intente nuevamente.';
          step3Error.style.display = 'flex';
        }
      }
    };

    // Renderizar tabla de items agregados
    const itemsTbody = document.getElementById('new-req-items-tbody');
    const itemsTfoot = document.getElementById('new-req-items-tfoot');
    const footTotalPEN = document.getElementById('foot-total-pen');
    const footTotalUSD = document.getElementById('foot-total-usd');

    function renderItems() {
      if (currentItems.length === 0) {
        itemsTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:1.5rem;">Aún no has agregado materiales a la lista. Elige uno arriba y pulsa "Añadir".</td></tr>`;
        itemsTfoot.style.display = 'none';
        return;
      }

      const totalPEN = currentItems.reduce((acc, it) => acc + (it.subtotalPEN || 0), 0);
      const totalUSD = currentItems.reduce((acc, it) => acc + (it.subtotalUSD || 0), 0);

      itemsTbody.innerHTML = currentItems.map((it, idx) => `
        <tr>
          <td>
            <strong>${it.materialName}</strong>
            <div style="font-size:0.75rem; color:#64748b;">${it.materialCode}</div>
          </td>
          <td>${it.unit}</td>
          <td><span class="badge badge-outline" style="font-size:0.8rem;">${(it.currentStock || 0).toLocaleString('es-PE')} ${it.unit}</span></td>
          <td><span class="badge badge-secondary font-bold" style="font-size:0.9rem;">${it.quantity.toLocaleString('es-PE')} ${it.unit}</span></td>
          <td>
            <div class="price-box-dual">
              <span class="price-tag-pen">S/ ${(it.pricePEN || 0).toFixed(2)}</span>
              <span class="price-tag-usd">$ ${(it.priceUSD || 0).toFixed(2)}</span>
            </div>
          </td>
          <td>
            <div class="price-box-dual">
              <strong style="color:#047857;">S/ ${(it.subtotalPEN || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <strong style="color:#2563eb;">$ ${(it.subtotalUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </td>
          <td class="text-right">
            <button type="button" class="btn btn-sm btn-danger-outline remove-item-btn" data-index="${idx}" title="Quitar material de la lista">&times; Quitar</button>
          </td>
        </tr>
      `).join('');

      itemsTfoot.style.display = 'table-footer-group';
      footTotalPEN.textContent = `S/ ${totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      footTotalUSD.textContent = `$ ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      itemsTbody.querySelectorAll('.remove-item-btn').forEach(b => {
        b.onclick = () => {
          currentItems.splice(parseInt(b.getAttribute('data-index')), 1);
          renderItems();
          updateLivePicker();
        };
      });
    }

    // Monitor en tiempo real del selector de material y cantidad
    const matSelect = document.getElementById('picker-material-select');
    const qtyInput = document.getElementById('picker-qty-input');
    const stockInfoBox = document.getElementById('picker-stock-info');
    const stockErrorBox = document.getElementById('picker-stock-error');
    const btnAdd = document.getElementById('btn-add-item-to-table');

    function updateLivePicker() {
      const matId = matSelect.value;
      const m = materials.find(it => it.id === matId);
      if (!m) {
        stockInfoBox.style.display = 'none';
        stockErrorBox.style.display = 'none';
        return;
      }

      const alreadyAdded = currentItems.filter(it => it.materialId === m.id).reduce((acc, it) => acc + it.quantity, 0);
      const effectiveStock = Math.max(0, (m.stock || 0) - alreadyAdded);
      const qty = parseFloat(qtyInput.value) || 0;

      stockInfoBox.style.display = 'flex';
      const pricePEN = m.pricePEN || 0;
      const priceUSD = m.priceUSD || 0;
      const subPEN = qty * pricePEN;
      const subUSD = qty * priceUSD;
      const projectedRem = effectiveStock - qty;

      stockInfoBox.innerHTML = `
        <div>
          <span style="font-size:0.85rem; color:#1e293b; display:block;">
            Disponible en almacén: <strong style="color:#0f172a; font-size:1rem;">${effectiveStock.toLocaleString('es-PE')} ${m.unit}</strong>
          </span>
          <span style="font-size:0.85rem; color:#065f46; font-weight:600;">
            Precio unitario: S/ ${pricePEN.toFixed(2)} (PEN) | $ ${priceUSD.toFixed(2)} (USD)
          </span>
          ${qty > 0 ? `
            <div style="font-size:0.85rem; margin-top:0.25rem;">
              Subtotal calculado: <strong style="color:#047857;">S/ ${subPEN.toFixed(2)}</strong> | <strong style="color:#2563eb;">$ ${subUSD.toFixed(2)}</strong>
              ${projectedRem >= 0 ? ` | Saldo restante proyectado: <strong>${projectedRem.toLocaleString('es-PE')} ${m.unit}</strong>` : ''}
            </div>
          ` : ''}
        </div>
        <span class="badge ${effectiveStock <= (m.minStock || 0) ? 'badge-stock-low' : 'badge-stock-ok'}">
          ${effectiveStock <= 0 ? 'Sin existencias' : (effectiveStock <= (m.minStock || 0) ? 'Stock bajo' : 'Disponible')}
        </span>
      `;

      if (qty > effectiveStock) {
        stockErrorBox.style.display = 'flex';
        stockErrorBox.innerHTML = `⚠️ La cantidad solicitada (${qty.toLocaleString('es-PE')} ${m.unit}) supera el saldo disponible (${effectiveStock.toLocaleString('es-PE')} ${m.unit}).`;
      } else {
        stockErrorBox.style.display = 'none';
      }
    }

    matSelect.addEventListener('change', updateLivePicker);
    qtyInput.addEventListener('input', updateLivePicker);

    // Botón añadir material a la lista
    btnAdd.onclick = () => {
      const matId = matSelect.value;
      const qty = parseFloat(qtyInput.value);
      const step2Error = document.getElementById('step-2-error');
      if (step2Error) step2Error.style.display = 'none';

      if (!matId) {
        if (step2Error) {
          step2Error.textContent = 'Por favor selecciona un material de la lista.';
          step2Error.style.display = 'flex';
        }
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        if (step2Error) {
          step2Error.textContent = 'Ingresa una cantidad mayor a 0.';
          step2Error.style.display = 'flex';
        }
        return;
      }

      const m = materials.find(it => it.id === matId);
      const alreadyAdded = currentItems.filter(it => it.materialId === m.id).reduce((acc, it) => acc + it.quantity, 0);
      const effectiveStock = Math.max(0, (m.stock || 0) - alreadyAdded);

      if (qty > effectiveStock) {
        if (step2Error) {
          step2Error.textContent = `Stock insuficiente para ${m.name}. Solo quedan ${effectiveStock.toLocaleString('es-PE')} ${m.unit} en almacén.`;
          step2Error.style.display = 'flex';
        }
        return;
      }

      const pricePEN = m.pricePEN || 0;
      const priceUSD = m.priceUSD || 0;

      currentItems.push({
        materialId: m.id,
        materialCode: m.code,
        materialName: m.name,
        unit: m.unit,
        currentStock: m.stock || 0,
        quantity: qty,
        pricePEN: pricePEN,
        priceUSD: priceUSD,
        subtotalPEN: parseFloat((qty * pricePEN).toFixed(2)),
        subtotalUSD: parseFloat((qty * priceUSD).toFixed(2))
      });

      qtyInput.value = '';
      matSelect.value = '';
      stockInfoBox.style.display = 'none';
      stockErrorBox.style.display = 'none';
      renderItems();
    };

    // Inicializar tooltips dentro del modal
    initHelpTooltips();
  }

  // ----------------------------------------------------
  // MODAL 2: DETALLES DE PEDIDO (VER DETALLE)
  // ----------------------------------------------------
  function openRequestDetailsModal(requestId) {
    const req = window.OC.requests.getRequestById(requestId);
    if (!req) return;

    const materialsCatalog = window.OC.storage.getMaterials();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div>
            <h3>Detalle del pedido: <span class="cell-code">${req.code}</span></h3>
            <span class="badge ${window.OC.requests.getStatusBadgeClass(req.status)} mt-1">
              ${window.OC.requests.getStatusLabel(req.status)}
            </span>
          </div>
          <button class="modal-close" id="modal-close-details" aria-label="Cerrar">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid-3 mb-3" style="background:#f8fafc; padding:1.25rem; border-radius:8px; border:1px solid #e2e8f0;">
            <div>
              <span class="text-muted" style="font-size:0.8rem; font-weight:700;">OBRA</span>
              <strong style="display:block; font-size:1rem;">${req.projectName}</strong>
            </div>
            <div>
              <span class="text-muted" style="font-size:0.8rem; font-weight:700;">FRENTE DE TRABAJO</span>
              <strong style="display:block; font-size:1rem;">${req.workFront}</strong>
            </div>
            <div>
              <span class="text-muted" style="font-size:0.8rem; font-weight:700;">FECHA REQUERIDA</span>
              <strong style="display:block; color:#2563eb; font-size:1rem;">${req.requiredDate}</strong>
            </div>
          </div>

          <!-- RESUMEN FINANCIERO DEL PEDIDO -->
          <div class="finance-summary-grid mb-3">
            <div class="finance-summary-card finance-card-pen">
              <span class="finance-card-label">Total estimado (Soles)</span>
              <div class="finance-card-value" style="color:#047857;">S/ ${(req.totalPEN || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span class="finance-card-sub">Moneda Nacional (PEN)</span>
            </div>
            <div class="finance-summary-card finance-card-usd">
              <span class="finance-card-label">Total estimado (Dólares)</span>
              <div class="finance-card-value" style="color:#2563eb;">$ ${(req.totalUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span class="finance-card-sub">Moneda Extranjera (USD)</span>
            </div>
          </div>

          <div class="mb-3">
            <span class="text-muted" style="font-size:0.85rem; font-weight:700;">SUSTENTO DEL PEDIDO:</span>
            <p style="margin-top:0.25rem; font-size:0.95rem; background:#fff; padding:0.75rem 1rem; border-radius:6px; border:1px solid #e2e8f0;">"${req.justification}"</p>
          </div>

          <div class="mb-3">
            <span class="text-muted" style="font-size:0.85rem; font-weight:700;">MATERIALES DEL PEDIDO:</span>
            <div class="table-responsive mt-2">
              <table class="data-table data-table-responsive-cards">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Unidad</th>
                    <th>Pedido</th>
                    <th>Aprobado</th>
                    <th>Entregado</th>
                    <th>Falta entregar</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${(req.items || []).map(it => {
                    const balance = Math.max(0, (it.approved || 0) - (it.delivered || 0));
                    const matInCatalog = materialsCatalog.find(m => m.id === it.materialId || m.code === it.materialCode);
                    const pricePEN = it.pricePEN || (matInCatalog ? matInCatalog.pricePEN : 0) || 0;
                    const subtotalPEN = it.subtotalPEN || (pricePEN * it.requested);

                    return `
                      <tr>
                        <td data-label="Material">
                          <strong>${it.materialName}</strong>
                          <div style="font-size:0.75rem; color:#64748b;">${it.materialCode}</div>
                        </td>
                        <td data-label="Unidad">${it.unit}</td>
                        <td data-label="Pedido"><strong>${it.requested.toLocaleString('es-PE')}</strong></td>
                        <td data-label="Aprobado">${it.approved ? it.approved.toLocaleString('es-PE') : 0}</td>
                        <td data-label="Entregado"><span style="color:#10b981; font-weight:700;">${(it.delivered || 0).toLocaleString('es-PE')}</span></td>
                        <td data-label="Falta entregar"><strong style="color:${balance > 0 ? '#ea580c' : '#10b981'};">${balance.toLocaleString('es-PE')}</strong></td>
                        <td data-label="Precio unit.">S/ ${pricePEN.toFixed(2)}</td>
                        <td data-label="Subtotal"><strong style="color:#047857;">S/ ${subtotalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <span class="text-muted" style="font-size:0.85rem; font-weight:700;">HISTORIAL DEL PEDIDO:</span>
            <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem;">
              ${(req.history || []).map(h => `
                <div style="font-size:0.85rem; padding:0.6rem 0.85rem; background:#f8fafc; border-left:3px solid #2563eb; border-radius:4px;">
                  <strong>${h.date}</strong> - ${h.user}: <em>${h.action}</em> - ${h.note || ''}
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-close-details">Volver</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-details').onclick = close;
    document.getElementById('btn-close-details').onclick = close;
  }

  // ----------------------------------------------------
  // MODAL 3: APROBAR PEDIDO (INGENIERO RESIDENTE)
  // ----------------------------------------------------
  function openApprovalModal(requestId) {
    const req = window.OC.requests.getRequestById(requestId);
    if (!req) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Aprobar pedido: <span class="cell-code">${req.code}</span></h3>
          <button class="modal-close" id="modal-close-approval" aria-label="Cerrar">&times;</button>
        </div>

        <div class="modal-body">
          <p class="subtitle mb-3">Revisa las cantidades pedidas para la obra <strong>${req.projectName}</strong> (${req.workFront}).</p>

          <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:1.25rem;">
            <strong style="display:block; font-size:0.9rem; color:#334155;">Sustento del pedido:</strong>
            <p style="font-size:0.95rem; font-style:italic; margin-top:0.25rem;">"${req.justification}"</p>
          </div>

          <div class="table-responsive mb-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidad</th>
                  <th>Pedido por Maestro</th>
                  <th style="width: 180px;">Cantidad a aprobar</th>
                </tr>
              </thead>
              <tbody>
                ${(req.items || []).map(it => `
                  <tr>
                    <td><strong>${it.materialName}</strong></td>
                    <td>${it.unit}</td>
                    <td>${it.requested} ${it.unit}</td>
                    <td>
                      <input type="number" class="form-control approval-qty-input" data-id="${it.materialId}" value="${it.requested}" min="0" max="${it.requested}" step="any" style="min-height:44px; font-weight:700;">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="form-group">
            <label for="approval-notes-input">
              Observaciones para almacén (Opcional)
              <button type="button" class="help-btn" data-help="Instrucciones para el almacenero al despachar los materiales." title="Ayuda sobre observaciones">?</button>
            </label>
            <textarea id="approval-notes-input" class="form-control" rows="2" placeholder="ej. Aprobado según avance de metrado en plano E-03. Despachar a partir de mañana..."></textarea>
            <span class="form-help-text">Escribe cualquier indicación técnica sobre este pedido.</span>
          </div>

          <div id="approval-error-inline" class="form-error-inline" style="display:none;"></div>
        </div>

        <div class="modal-footer flex-between">
          <button type="button" class="btn btn-secondary" id="btn-cancel-approval">Volver</button>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-danger-outline" id="btn-reject-req">Rechazar pedido</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-approve">Aprobar pedido</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-approval').onclick = close;
    document.getElementById('btn-cancel-approval').onclick = close;

    initHelpTooltips();

    // Confirmar Aprobación
    document.getElementById('btn-confirm-approve').onclick = () => {
      const itemsMap = {};
      overlay.querySelectorAll('.approval-qty-input').forEach(inp => {
        itemsMap[inp.getAttribute('data-id')] = parseFloat(inp.value);
      });
      const notes = document.getElementById('approval-notes-input').value;

      const res = window.OC.approvals.approveRequest(requestId, itemsMap, notes);
      if (res.success) {
        showToast('¡Pedido aprobado! Listo para entregar materiales.', 'success');
        close();
        navigate('approvals');
      } else {
        const errBox = document.getElementById('approval-error-inline');
        if (errBox) {
          errBox.textContent = res.message;
          errBox.style.display = 'flex';
        } else {
          alert(res.message);
        }
      }
    };

    // Rechazar
    document.getElementById('btn-reject-req').onclick = () => {
      const reason = prompt('Indica el motivo del rechazo del pedido (mínimo 8 letras):');
      if (!reason || reason.trim().length < 8) {
        const errBox = document.getElementById('approval-error-inline');
        if (errBox) {
          errBox.textContent = 'Por favor escribe al menos 8 letras explicando la razón del rechazo para que el maestro pueda corregirlo.';
          errBox.style.display = 'flex';
        } else {
          alert('Por favor escribe al menos 8 letras explicando la razón del rechazo.');
        }
        return;
      }
      const res = window.OC.approvals.rejectRequest(requestId, reason);
      if (res.success) {
        showToast('Pedido rechazado con el motivo indicado.', 'info');
        close();
        navigate('approvals');
      } else {
        alert(res.message);
      }
    };
  }

  // ----------------------------------------------------
  // MODAL 4: ENTREGAR MATERIALES Y EMISIÓN DE VALE
  // ----------------------------------------------------
  function openDeliveryModal(requestId) {
    const req = window.OC.requests.getRequestById(requestId);
    if (!req) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Entregar materiales: <span class="cell-code">${req.code}</span></h3>
          <button class="modal-close" id="modal-close-delivery" aria-label="Cerrar">&times;</button>
        </div>

        <div class="modal-body">
          <p class="subtitle mb-3">Indica las cantidades a entregar para la obra <strong>${req.projectName}</strong> (${req.workFront}). Se emitirá el comprobante oficial.</p>

          <div class="table-responsive mb-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidad</th>
                  <th>Aprobado</th>
                  <th>Saldo por entregar</th>
                  <th style="width: 180px;">Entregar ahora</th>
                </tr>
              </thead>
              <tbody>
                ${(req.items || []).map(it => {
                  const approved = it.approved || 0;
                  const delivered = it.delivered || 0;
                  const balance = Math.max(0, approved - delivered);
                  return `
                    <tr>
                      <td><strong>${it.materialName}</strong></td>
                      <td>${it.unit}</td>
                      <td>${approved}</td>
                      <td><strong style="color:#ea580c; font-size:1rem;">${balance} ${it.unit}</strong></td>
                      <td>
                        <input type="number" class="form-control delivery-qty-input" data-id="${it.materialId}" value="${balance}" min="0" max="${balance}" step="any" style="min-height:44px; font-weight:700;">
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="form-grid-2 mb-3">
            <div class="form-group">
              <label for="delivery-receiver-name">
                Nombre de quien recibe en obra *
                <button type="button" class="help-btn" data-help="Persona o cuadrilla que recepciona físicamente los materiales en la obra." title="Ayuda sobre receptor">?</button>
              </label>
              <input type="text" id="delivery-receiver-name" class="form-control" placeholder="ej. Juan Pérez (Maestro de Cuadrilla)" required>
              <span class="form-help-text">Nombre de la persona responsable que recibe.</span>
            </div>
            <div class="form-group">
              <label for="delivery-notes">Observaciones de la entrega</label>
              <input type="text" id="delivery-notes" class="form-control" placeholder="ej. Entrega completa en parihuelas protegidas">
              <span class="form-help-text">Detalles de transporte o empaque (opcional).</span>
            </div>
          </div>

          <div id="delivery-error-inline" class="form-error-inline" style="display:none;"></div>
        </div>

        <div class="modal-footer flex-between">
          <button type="button" class="btn btn-secondary" id="btn-cancel-delivery">Volver</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-delivery">
            ${ICONS.print} Entregar y generar comprobante
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-delivery').onclick = close;
    document.getElementById('btn-cancel-delivery').onclick = close;

    initHelpTooltips();

    document.getElementById('btn-confirm-delivery').onclick = () => {
      const receiver = document.getElementById('delivery-receiver-name').value;
      const errBox = document.getElementById('delivery-error-inline');
      if (errBox) errBox.style.display = 'none';

      if (!receiver || receiver.trim().length < 3) {
        if (errBox) {
          errBox.textContent = 'Por favor ingresa el nombre de la persona que recibe los materiales.';
          errBox.style.display = 'flex';
          document.getElementById('delivery-receiver-name').focus();
        } else {
          alert('Por favor ingresa el nombre de la persona que recibe los materiales.');
        }
        return;
      }

      const itemsMap = {};
      overlay.querySelectorAll('.delivery-qty-input').forEach(inp => {
        itemsMap[inp.getAttribute('data-id')] = parseFloat(inp.value);
      });
      const notes = document.getElementById('delivery-notes').value;

      const res = window.OC.deliveries.registerDelivery(requestId, itemsMap, receiver, notes);
      if (res.success) {
        showToast(`¡Materiales entregados! Vale emitido: ${res.voucher.voucherNumber}`, 'success');
        close();
        openVoucherPrintModal(res.voucher.id);
        navigate('deliveries');
      } else {
        if (errBox) {
          errBox.textContent = res.message;
          errBox.style.display = 'flex';
        } else {
          alert(res.message);
        }
      }
    };
  }

  // ----------------------------------------------------
  // TOOLTIPS DE AYUDA RÁPIDA (?)
  // ----------------------------------------------------
  function initHelpTooltips() {
    const bubble = document.getElementById('help-tooltip-bubble');
    if (!bubble) return;

    document.querySelectorAll('.help-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-help') || btn.getAttribute('title') || '';
        if (!text) return;

        const rect = btn.getBoundingClientRect();
        bubble.textContent = text;
        bubble.style.left = `${Math.min(window.innerWidth - 320, Math.max(10, rect.left - 120))}px`;
        bubble.style.top = `${rect.bottom + 8}px`;
        bubble.classList.add('active');
      };
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.help-btn') && !e.target.closest('#help-tooltip-bubble')) {
        bubble.classList.remove('active');
      }
    });
  }

  // ----------------------------------------------------
  // MODAL 5: FORMATO OFICIAL DE IMPRESIÓN DE VALE DE SALIDA
  // ----------------------------------------------------
  function openVoucherPrintModal(voucherId) {
    const v = window.OC.deliveries.getVoucherById(voucherId);
    if (!v) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Vale de Salida de Almacén de Obra</h3>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary btn-sm" id="btn-print-voucher-action">
              ${ICONS.print} Imprimir Comprobante Oficial
            </button>
            <button class="modal-close" id="modal-close-voucher">&times;</button>
          </div>
        </div>

        <div class="modal-body">
          <div class="voucher-document">
            
            <div class="voucher-header">
              <div class="voucher-brand-block">
                <h2>OBRACONTROL INGENIERÍA & CONSTRUCCIÓN</h2>
                <p>CONTROL INTEGRAL DE ALMACÉN Y SUMINISTROS</p>
                <span style="font-size:0.75rem; color:#64748b;">R.U.C. 20601234567 • Registro Oficial de Obra</span>
              </div>
              <div class="voucher-code-block">
                <span class="voucher-code-badge">VALE DE SALIDA</span>
                <div class="voucher-number">${v.voucherNumber}</div>
                <div style="font-size:0.8rem; color:#64748b;">Fecha: ${v.deliveryDate}</div>
              </div>
            </div>

            <div class="voucher-meta-grid">
              <div class="voucher-meta-row">
                <span class="voucher-meta-label">Obra / Proyecto:</span>
                <span class="voucher-meta-value">${v.projectName}</span>
              </div>
              <div class="voucher-meta-row">
                <span class="voucher-meta-label">Frente de Trabajo:</span>
                <span class="voucher-meta-value">${v.workFront}</span>
              </div>
              <div class="voucher-meta-row">
                <span class="voucher-meta-label">Solicitud N°:</span>
                <span class="voucher-meta-value">${v.requestCode}</span>
              </div>
              <div class="voucher-meta-row">
                <span class="voucher-meta-label">Despachado Por:</span>
                <span class="voucher-meta-value">${v.warehouseResponsible}</span>
              </div>
              <div class="voucher-meta-row" style="grid-column: span 2;">
                <span class="voucher-meta-label">Recepcionado Por:</span>
                <span class="voucher-meta-value">${v.receiverName}</span>
              </div>
            </div>

            <table class="voucher-table">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Código</th>
                  <th>Descripción del Material</th>
                  <th>Unidad</th>
                  <th class="text-right">Cant. Despachada</th>
                  <th class="text-right">Saldo Restante</th>
                </tr>
              </thead>
              <tbody>
                ${(v.items || []).map((it, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><span class="cell-code">${it.materialCode}</span></td>
                    <td><strong>${it.materialName}</strong></td>
                    <td>${it.unit}</td>
                    <td class="text-right font-bold" style="font-size:1rem;">${it.deliveredNow}</td>
                    <td class="text-right" style="color:#64748b;">${it.remainingBalance}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${v.notes ? `
              <div style="padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; font-size:0.85rem; margin-bottom:2rem;">
                <strong>Observaciones de Salida:</strong> ${v.notes}
              </div>
            ` : ''}

            <!-- SECCIÓN DE 3 FIRMAS FORMALES -->
            <div class="voucher-signatures-grid">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-role">Solicitado por</div>
                <div class="signature-name">Maestro de Obra</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-role">Despachado por</div>
                <div class="signature-name">${v.warehouseResponsible} (Almacén)</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-role">Recibido Conforme</div>
                <div class="signature-name">${v.receiverName}</div>
              </div>
            </div>

            <div style="text-align:center; font-size:0.75rem; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:0.75rem;">
              Comprobante de despacho oficial generado por ObraControl. Conservar en archivo de obra para liquidación técnica.
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-voucher').onclick = close;
    document.getElementById('btn-print-voucher-action').onclick = () => window.print();
  }

  // ----------------------------------------------------
  // MODAL FIREBASE Y CONFIGURACIÓN NUBE
  // ----------------------------------------------------
  function openFirebaseModal() {
    const isConn = window.OC.firebase && window.OC.firebase.isConnected();
    const config = window.OC.firebase ? window.OC.firebase.getSavedConfig() : {};

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>Conexión con Cloud Firestore</h3>
          <button class="modal-close" id="modal-close-fb">&times;</button>
        </div>

        <div class="modal-body">
          <div style="display:flex; align-items:center; gap:0.65rem; background:${isConn ? '#f0fdf4' : '#fffbeb'}; padding:1rem; border-radius:8px; border:1px solid ${isConn ? '#86efac' : '#fde68a'}; margin-bottom:1.25rem;">
            <span class="pulse-indicator" style="background:${isConn ? '#10b981' : '#f59e0b'};"></span>
            <div>
              <strong style="color:${isConn ? '#15803d' : '#92400e'};">${isConn ? 'Firebase Conectado en Tiempo Real' : 'Operando en Modo Local'}</strong>
              <span style="display:block; font-size:0.75rem; color:#475569;">
                Proyecto: <strong>${config.projectId || 'obracontrol-907fe'}</strong>
              </span>
            </div>
          </div>

          <div class="form-group mb-3">
            <label>API Key de Firebase</label>
            <input type="text" id="fb-apikey-input" class="form-control" value="${config.apiKey || ''}">
          </div>

          <div class="form-group mb-3">
            <label>Project ID</label>
            <input type="text" id="fb-projid-input" class="form-control" value="${config.projectId || ''}">
          </div>

          <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-primary" id="btn-sync-to-cloud">
              ☁️ Subir Datos Locales a Firestore
            </button>
            <button type="button" class="btn btn-outline" id="btn-sync-from-cloud">
              📥 Descargar de Firestore
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-close-fb">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-fb').onclick = close;
    document.getElementById('btn-close-fb').onclick = close;

    document.getElementById('btn-sync-to-cloud').onclick = async () => {
      showToast('Sincronizando con Cloud Firestore...', 'info');
      const res = await window.OC.firebase.uploadLocalToFirestore();
      if (res.success) showToast(res.message, 'success');
      else alert(res.message);
    };

    document.getElementById('btn-sync-from-cloud').onclick = async () => {
      showToast('Descargando de Cloud Firestore...', 'info');
      const res = await window.OC.firebase.downloadFirestoreToLocal();
      if (res.success) {
        showToast(res.message, 'success');
        navigate(currentView);
      } else {
        alert(res.message);
      }
    };
  }

  // ----------------------------------------------------
  // ACTUALIZACIÓN DE INDICADOR VISUAL DE CLOUD STATUS
  // ----------------------------------------------------
  function updateCloudStatusUI() {
    const dot = document.getElementById('cloud-status-dot');
    const text = document.getElementById('cloud-status-text');
    const btn = document.getElementById('btn-quick-firebase-setup');

    if (!dot || !text) return;

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      dot.style.backgroundColor = '#10b981';
      text.textContent = 'Firebase Conectado';
      text.title = 'Sincronización en tiempo real con Cloud Firestore activa';
      if (btn) btn.innerHTML = '🔥 Firebase Activo';
    } else {
      dot.style.backgroundColor = '#f59e0b';
      text.textContent = 'Modo Local Offline';
      text.title = 'Almacenamiento seguro en el equipo local';
      if (btn) btn.innerHTML = '🔥 Conectar Firebase';
    }
  }

  // ----------------------------------------------------
  // EVENT LISTENERS GLOBALES
  // ----------------------------------------------------
  function setupEventListeners() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
      });
    }

    const cloudPill = document.getElementById('cloud-status-pill');
    if (cloudPill) cloudPill.addEventListener('click', openFirebaseModal);

    const btnFbSetup = document.getElementById('btn-quick-firebase-setup');
    if (btnFbSetup) btnFbSetup.addEventListener('click', openFirebaseModal);
  }

  // EXPOSICIÓN GLOBAL DE LA UI
  window.OC.ui = {
    init: initApp,
    navigate: navigate,
    showToast: showToast,
    openNewRequestModal: openNewRequestModal,
    openRequestDetailsModal: openRequestDetailsModal,
    openApprovalModal: openApprovalModal,
    openDeliveryModal: openDeliveryModal,
    openVoucherPrintModal: openVoucherPrintModal,
    openFirebaseModal: openFirebaseModal
  };

  // Auto-iniciar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
