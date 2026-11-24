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

  /** Solo el rol 'admin' exacto — el superadmin está excluido del portal de gestión */
  function isAdminOnly(user) {
    return Boolean(user && user.role === 'admin');
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
  // SELECTOR DE OBRA ACTIVA EN EL SIDEBAR
  // ----------------------------------------------------
  function renderProjectSelector() {
    const select = document.getElementById('sidebar-active-project-select');
    if (!select) return;

    const projects = window.OC.storage.getProjects();
    select.innerHTML = `
      <option value="ALL">🏢 Todas las Obras (${projects.length})</option>
      ${projects.map(p => `
        <option value="${p.id}" ${activeProjectId === p.id ? 'selected' : ''}>
          ${p.name}
        </option>
      `).join('')}
    `;

    select.addEventListener('change', () => {
      activeProjectId = select.value;
      activeFilters.projectId = activeProjectId;
      showToast(activeProjectId === 'ALL' ? 'Mostrando todas las obras' : `Filtrado por: ${select.options[select.selectedIndex].text}`, 'info');
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
        <div class="quick-role-badge" title="Cambie de rol en tiempo real para evaluar permisos de Maestro, Residente o Almacenero">
          <span class="quick-role-label">Rol Activo:</span>
          <select class="quick-role-select" id="quick-role-switcher-select">
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
          <button class="btn-logout-icon" id="btn-topbar-logout" title="Cerrar sesión">
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
        showToast(`Rol cambiado a: ${window.OC.auth.getRoleLabel(switched.role)}`, 'info');
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
  // MENÚ LATERAL DE NAVEGACIÓN ORGANIZADO POR CATEGORÍAS
  // ----------------------------------------------------
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

    // Secciones estructuradas
    const navStructure = [
      {
        section: 'OPERACIONES DE OBRA',
        items: [
          { id: 'dashboard', label: 'Panel Principal', icon: ICONS.dashboard, visible: true },
          { id: 'requests', label: 'Solicitudes', icon: ICONS.requests, badge: requests.length, badgeClass: 'nav-badge-blue', visible: true },
          { id: 'approvals', label: 'Aprobaciones', icon: ICONS.approvals, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeClass: 'nav-badge-amber', visible: user && (isAdminUser(user) || user.role === 'aprobador') },
          { id: 'deliveries', label: 'Despacho y Almacén', icon: ICONS.deliveries, badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : null, badgeClass: 'nav-badge-blue', visible: user && (isAdminUser(user) || user.role === 'almacenero') },
          { id: 'vouchers', label: 'Vales de Salida', icon: ICONS.vouchers, badge: vouchers.length, badgeClass: 'badge-secondary', visible: true }
        ]
      },
      {
        section: 'ANÁLISIS Y CONSULTAS',
        items: [
          { id: 'reports', label: 'Reportes e Indicadores', icon: ICONS.reports, visible: true },
          { id: 'materials_catalog', label: 'Catálogo de Insumos', icon: ICONS.package, visible: true },
          { id: 'projects_view', label: 'Obras y Frentes', icon: ICONS.building, visible: true }
        ]
      },
      {
        section: 'ADMINISTRACIÓN',
        items: [
          { id: 'admin', label: 'Panel de Configuración', icon: ICONS.admin, visible: user && isAdminUser(user) }
        ]
      }
    ];

    let html = '';
    navStructure.forEach(sec => {
      const visibleItems = sec.items.filter(it => it.visible);
      if (visibleItems.length > 0) {
        html += `<div class="sidebar-section-title">${sec.section}</div>`;
        visibleItems.forEach(it => {
          const isActive = currentView === it.id;
          html += `
            <button class="nav-item ${isActive ? 'active' : ''}" data-view="${it.id}">
              <div class="nav-content-left">
                <span class="nav-icon">${it.icon}</span>
                <span class="nav-text">${it.label}</span>
              </div>
              ${it.badge ? `<span class="nav-badge-pill ${it.badgeClass || ''}">${it.badge}</span>` : ''}
            </button>
          `;
        });
      }
    });

    nav.innerHTML = html;

    // Enlace especial al Portal de Análisis y Gestión (solo para rol 'admin', NO superadmin)
    if (user && isAdminOnly(user)) {
      nav.innerHTML += `
        <div class="sidebar-section-title" style="margin-top:0.75rem;">PORTAL EXCLUSIVO</div>
        <a href="admin.html" class="nav-item" style="text-decoration:none; color:inherit;" title="Ir al Portal de Análisis y Gestión">
          <div class="nav-content-left">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span class="nav-text">Análisis y Gestión</span>
          </div>
          <span style="font-size:0.65rem; opacity:0.7;">↗</span>
        </a>
      `;
    }

    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        navigate(view);
      });
    });
  }

  // ----------------------------------------------------
  // ENRUTADOR / NAVEGACIÓN ENTRE VISTAS
  // ----------------------------------------------------
  function navigate(viewName, options = {}) {
    currentView = viewName;

    // Actualizar clase activa en sidebar
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Actualizar breadcrumb superior
    const breadcrumbLabel = document.getElementById('topbar-current-view');
    const titles = {
      dashboard: 'Panel Principal',
      requests: 'Solicitudes de Insumos',
      approvals: 'Aprobaciones Técnicas',
      deliveries: 'Despacho de Almacén',
      vouchers: 'Vales de Salida',
      reports: 'Reportes e Indicadores',
      materials_catalog: 'Almacén Central y Catálogo de Insumos',
      projects_view: 'Obras y Frentes de Trabajo',
      admin: 'Administración del Sistema'
    };
    if (breadcrumbLabel) {
      breadcrumbLabel.textContent = titles[viewName] || 'ObraControl';
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // VISTA 1: DASHBOARD (PANEL DE CONTROL PROFESIONAL)
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
    const recentRequests = requests.slice(0, 6);
    const materials = window.OC.storage.getMaterials();
    const projects = window.OC.storage.getProjects();

    // Cálculo de porcentajes para el Pipeline
    const pctDelivered = totalRequests ? Math.round((kpis.delivered / totalRequests) * 100) : 0;
    const pctApproved = totalRequests ? Math.round((kpis.approved / totalRequests) * 100) : 0;
    const pctPartial = totalRequests ? Math.round((kpis.partialDelivery / totalRequests) * 100) : 0;
    const pctPending = totalRequests ? Math.round((kpis.pendingApproval / totalRequests) * 100) : 0;
    const pctRejected = totalRequests ? Math.round((kpis.rejected / totalRequests) * 100) : 0;

    const todayDate = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    container.innerHTML = `
      <!-- BANNER OPERACIONAL SUPERIOR -->
      <div class="operational-banner">
        <div class="operational-banner-info">
          <h3>Bienvenido, ${user ? user.name : 'Usuario'}</h3>
          <p>
            📅 ${todayDate.charAt(0).toUpperCase() + todayDate.slice(1)} • 
            ${activeProjectId === 'ALL' ? 'Mostrando consolidado de todas las obras' : projects.find(p => p.id === activeProjectId)?.name || 'Obra seleccionada'}
          </p>
        </div>

        <div class="operational-banner-actions">
          ${window.OC.auth.hasPermission('create_request') ? `
            <button class="btn btn-primary" id="btn-banner-new-request">
              ${ICONS.plus} Nueva Solicitud
            </button>
          ` : ''}

          ${(isAdminUser(user) || user?.role === 'aprobador') && kpis.pendingApproval > 0 ? `
            <button class="btn btn-warning" id="btn-banner-go-approvals" style="background:#f59e0b; color:#000;">
              ${ICONS.approvals} Revisar Pendientes (${kpis.pendingApproval})
            </button>
          ` : ''}

          ${(isAdminUser(user) || user?.role === 'almacenero') && kpis.approved > 0 ? `
            <button class="btn btn-success" id="btn-banner-go-deliveries">
              ${ICONS.deliveries} Despachos Listos (${kpis.approved})
            </button>
          ` : ''}
        </div>
      </div>

      <!-- GRID DE TARJETAS KPI -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-pending">
          <div class="kpi-content">
            <span class="kpi-label">Pendientes Aprobación</span>
            <div class="kpi-value">${kpis.pendingApproval}</div>
            <span class="kpi-subtext">Por revisar por Residente</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.clock}</div>
        </div>

        <div class="kpi-card kpi-approved">
          <div class="kpi-content">
            <span class="kpi-label">Aprobadas / En Almacén</span>
            <div class="kpi-value">${kpis.approved}</div>
            <span class="kpi-subtext">Listas para despacho</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.check}</div>
        </div>

        <div class="kpi-card kpi-partial">
          <div class="kpi-content">
            <span class="kpi-label">Entregas Parciales</span>
            <div class="kpi-value">${kpis.partialDelivery}</div>
            <span class="kpi-subtext">Con saldo pendiente</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.deliveries}</div>
        </div>

        <div class="kpi-card kpi-delivered">
          <div class="kpi-content">
            <span class="kpi-label">Despachos Completos</span>
            <div class="kpi-value">${kpis.delivered}</div>
            <span class="kpi-subtext">Material en obra</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-vouchers">
          <div class="kpi-content">
            <span class="kpi-label">Vales Oficiales</span>
            <div class="kpi-value">${kpis.vouchersCount}</div>
            <span class="kpi-subtext">Comprobantes emitidos</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-rejected">
          <div class="kpi-content">
            <span class="kpi-label">Rechazadas</span>
            <div class="kpi-value">${kpis.rejected}</div>
            <span class="kpi-subtext">Con sustento técnico</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.x}</div>
        </div>
      </div>

      <!-- BARRA DE PIPELINE / FLUJO OPERACIONAL -->
      <div class="pipeline-card">
        <div class="pipeline-header">
          <span class="pipeline-title">
            <span>📊</span> Flujo y Estado de Atención de Solicitudes (${totalRequests} en total)
          </span>
          <span style="font-size:0.8rem; font-weight:700; color:#2563eb;">
            ${pctDelivered}% Completado
          </span>
        </div>

        <div class="pipeline-bar-wrapper">
          <div class="pipeline-segment pipeline-seg-delivered" style="width: ${pctDelivered}%" title="Entregadas: ${kpis.delivered} (${pctDelivered}%)"></div>
          <div class="pipeline-segment pipeline-seg-approved" style="width: ${pctApproved}%" title="Aprobadas: ${kpis.approved} (${pctApproved}%)"></div>
          <div class="pipeline-segment pipeline-seg-partial" style="width: ${pctPartial}%" title="Parciales: ${kpis.partialDelivery} (${pctPartial}%)"></div>
          <div class="pipeline-segment pipeline-seg-pending" style="width: ${pctPending}%" title="Pendientes: ${kpis.pendingApproval} (${pctPending}%)"></div>
          <div class="pipeline-segment pipeline-seg-rejected" style="width: ${pctRejected}%" title="Rechazadas: ${kpis.rejected} (${pctRejected}%)"></div>
        </div>

        <div class="pipeline-legend">
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--success);"></span> Entregadas (${kpis.delivered})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--primary);"></span> Aprobadas (${kpis.approved})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--accent-orange);"></span> Parciales (${kpis.partialDelivery})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--accent-amber);"></span> Pendientes (${kpis.pendingApproval})
          </div>
          <div class="pipeline-legend-item">
            <span class="legend-dot" style="background:var(--danger);"></span> Rechazadas (${kpis.rejected})
          </div>
        </div>
      </div>

      <!-- DASHBOARD 2 COLUMNAS -->
      <div class="dashboard-grid-split">
        
        <!-- COLUMNA IZQUIERDA: SOLICITUDES RECIENTES -->
        <div class="card">
          <div class="card-header">
            <h3><span>📋</span> Solicitudes Recientes de Obra</h3>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn btn-xs btn-outline" id="btn-see-all-requests">Ver todas (${totalRequests})</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Obra / Frente</th>
                  <th>Insumos</th>
                  <th>Estado</th>
                  <th class="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${recentRequests.length === 0 ? `
                  <tr><td colspan="6" class="empty-table-box">
                    <div class="empty-table-icon">📄</div>
                    <div class="empty-table-title">No hay solicitudes registradas</div>
                    <div class="empty-table-msg">Haga clic en "+ Nueva Solicitud" para generar su primer pedido de insumos.</div>
                  </td></tr>
                ` : recentRequests.map(r => `
                  <tr>
                    <td><span class="cell-code">${r.code}</span></td>
                    <td style="font-size:0.8rem; color:#64748b;">${r.createdDate}</td>
                    <td>
                      <strong style="display:block; font-size:0.85rem;">${r.projectName}</strong>
                      <span style="font-size:0.75rem; color:#64748b;">📍 ${r.workFront}</span>
                    </td>
                    <td>
                      <div class="cell-items-summary">
                        <span class="cell-items-count">${(r.items || []).length} ítems</span>
                        <span class="cell-items-preview">${(r.items || []).slice(0, 2).map(i => i.materialName.split(' ')[0]).join(', ')}...</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}">
                        <span class="badge-dot"></span>
                        ${window.OC.requests.getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-xs btn-outline view-req-details-btn" data-id="${r.id}" title="Ver Ficha Técnica">
                        ${ICONS.eye} Ver
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA: INSUMOS DE MAYOR ROTACIÓN Y ÚLTIMOS VALES -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- TARJETA: INSUMOS CON MAYOR ROTACIÓN -->
          <div class="card">
            <div class="card-header">
              <h3><span>🧱</span> Insumos Más Pedidos</h3>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.825rem; font-weight:700;">
                  <span>Cemento Portland Tipo I</span>
                  <span style="color:#2563eb;">210 Bolsas</span>
                </div>
                <div style="height:6px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:85%; height:100%; background:#2563eb;"></div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.825rem; font-weight:700;">
                  <span>Acero Corrugado Grado 60</span>
                  <span style="color:#f59e0b;">130 Varillas</span>
                </div>
                <div style="height:6px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:65%; height:100%; background:#f59e0b;"></div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div class="flex-between" style="font-size:0.825rem; font-weight:700;">
                  <span>Arena Gruesa para Concreto</span>
                  <span style="color:#10b981;">21 m³</span>
                </div>
                <div style="height:6px; background:#f1f5f9; border-radius:9999px; overflow:hidden;">
                  <div style="width:50%; height:100%; background:#10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- TARJETA: ÚLTIMOS VALES DE SALIDA -->
          <div class="card">
            <div class="card-header">
              <h3><span>🧾</span> Vales de Salida Recientes</h3>
              <button class="btn btn-xs btn-outline" id="btn-see-all-vouchers">Ver todos</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${vouchers.slice(0, 3).map(v => `
                <div style="padding:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">
                  <div>
                    <span class="cell-code" style="font-size:0.85rem;">${v.voucherNumber}</span>
                    <span style="display:block; font-size:0.75rem; color:#64748b;">${v.deliveryDate}</span>
                    <span style="font-size:0.75rem; color:#0f172a; font-weight:600;">Receptor: ${v.receiverName || 'Cuadrilla'}</span>
                  </div>
                  <button class="btn btn-xs btn-outline print-single-voucher-btn" data-id="${v.id}" title="Imprimir Comprobante Oficial">
                    ${ICONS.print}
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
    if (btnNewReq) btnNewReq.addEventListener('click', openNewRequestModal);

    const btnGoApprovals = document.getElementById('btn-banner-go-approvals');
    if (btnGoApprovals) btnGoApprovals.addEventListener('click', () => navigate('approvals'));

    const btnGoDeliveries = document.getElementById('btn-banner-go-deliveries');
    if (btnGoDeliveries) btnGoDeliveries.addEventListener('click', () => navigate('deliveries'));

    const btnSeeAll = document.getElementById('btn-see-all-requests');
    if (btnSeeAll) btnSeeAll.addEventListener('click', () => navigate('requests'));

    const btnSeeAllVouchers = document.getElementById('btn-see-all-vouchers');
    if (btnSeeAllVouchers) btnSeeAllVouchers.addEventListener('click', () => navigate('vouchers'));

    container.querySelectorAll('.view-req-details-btn').forEach(btn => {
      btn.addEventListener('click', () => openRequestDetailsModal(btn.getAttribute('data-id')));
    });

    container.querySelectorAll('.print-single-voucher-btn').forEach(btn => {
      btn.addEventListener('click', () => openVoucherPrintModal(btn.getAttribute('data-id')));
    });
  }

  // ----------------------------------------------------
  // VISTA 2: GESTIÓN DE SOLICITUDES DE INSUMOS
  // ----------------------------------------------------
  function renderRequestsView(container) {
    const user = window.OC.auth.getCurrentUser();
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.requests.getAllRequests();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Solicitudes de Insumos</h2>
          <p class="subtitle">Administre, filtre y monitoree el ciclo de vida de los pedidos de materiales en obra.</p>
        </div>
        <div class="header-actions">
          ${window.OC.auth.hasPermission('create_request') ? `
            <button class="btn btn-primary" id="btn-create-request-main">
              ${ICONS.plus} Nueva Solicitud
            </button>
          ` : ''}
          <button class="btn btn-outline" id="btn-export-requests-csv">
            ${ICONS.download} Exportar Excel
          </button>
        </div>
      </div>

      <!-- BARRA DE FILTROS SUPERIOR -->
      <div class="filter-toolbar">
        <div class="search-input-wrap">
          <span class="search-icon">${ICONS.search}</span>
          <input type="text" id="filter-search-req" class="search-control" placeholder="Buscar por código, material o solicitante..." value="${activeFilters.materialKeyword}">
        </div>

        <select id="filter-project-req" class="filter-select">
          <option value="ALL">🏢 Todas las Obras</option>
          ${projects.map(p => `<option value="${p.id}" ${activeFilters.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>

        <select id="filter-status-req" class="filter-select">
          <option value="ALL">Todos los Estados</option>
          <option value="PENDIENTE_APROBACION" ${activeFilters.status === 'PENDIENTE_APROBACION' ? 'selected' : ''}>⏳ Pendiente de Aprobación</option>
          <option value="APROBADA" ${activeFilters.status === 'APROBADA' ? 'selected' : ''}>✅ Aprobada</option>
          <option value="ENTREGA_PARCIAL" ${activeFilters.status === 'ENTREGA_PARCIAL' ? 'selected' : ''}>📦 Entrega Parcial</option>
          <option value="ENTREGADA" ${activeFilters.status === 'ENTREGADA' ? 'selected' : ''}>🎉 Entregada Completa</option>
          <option value="RECHAZADA" ${activeFilters.status === 'RECHAZADA' ? 'selected' : ''}>❌ Rechazada</option>
        </select>
      </div>

      <!-- TABLA PRINCIPAL DE SOLICITUDES -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha Emisión</th>
                <th>Fecha Requerida</th>
                <th>Obra y Frente</th>
                <th>Solicitante</th>
                <th>Insumos</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
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
          <tr><td colspan="8" class="empty-table-box">
            <div class="empty-table-icon">🔍</div>
            <div class="empty-table-title">No se encontraron solicitudes</div>
            <div class="empty-table-msg">Intente ajustar los filtros de búsqueda u obra activa.</div>
          </td></tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(r => `
        <tr>
          <td><span class="cell-code">${r.code}</span></td>
          <td style="font-size:0.8rem; color:#64748b;">${r.createdDate}</td>
          <td>
            <span style="font-weight:700; font-size:0.85rem; color:#0f172a;">${r.requiredDate || 'Inmediato'}</span>
          </td>
          <td>
            <strong style="display:block; font-size:0.85rem;">${r.projectName}</strong>
            <span style="font-size:0.75rem; color:#64748b;">📍 ${r.workFront}</span>
          </td>
          <td>
            <span style="font-size:0.85rem; font-weight:600;">${r.createdBy?.name || 'N/A'}</span>
          </td>
          <td>
            <div class="cell-items-summary">
              <span class="cell-items-count">${(r.items || []).length} materiales</span>
              <span class="cell-items-preview">${(r.items || []).map(i => `${i.requested} ${i.unit}`).slice(0, 2).join(', ')}${(r.items || []).length > 2 ? '...' : ''}</span>
              <span class="badge badge-outline" style="font-size:0.72rem; font-weight:700; color:#065f46; background:#f0fdf4; margin-top:2px;">
                S/ ${(r.totalPEN || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | $ ${(r.totalUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </td>
          <td>
            <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}">
              <span class="badge-dot"></span>
              ${window.OC.requests.getStatusLabel(r.status)}
            </span>
          </td>
          <td class="text-right">
            <div style="display:inline-flex; gap:0.4rem;">
              <button class="btn btn-xs btn-outline btn-view-req" data-id="${r.id}" title="Ver Ficha Técnica Detallada">
                ${ICONS.eye} Ver
              </button>
              ${isAdminUser(user) && window.OC.auth.isSuperAdmin() ? `
                <button class="btn btn-xs btn-danger-outline btn-delete-single-req" data-id="${r.id}" title="Eliminar Solicitud">
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
          if (confirm(`¿Confirma eliminar la solicitud ${targetReq ? targetReq.code : reqId} y sus vales asociados? Esta acción quedará en auditoría.`)) {
            try {
              // Reintegrar al almacén cualquier saldo pendiente no entregado
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
              showToast('Solicitud eliminada y saldo de materiales reintegrado al almacén.', 'success');
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
  // VISTA 3: APROBACIONES TÉCNICAS (INGENIERO RESIDENTE)
  // ----------------------------------------------------
  function renderApprovalsView(container) {
    const user = window.OC.auth.getCurrentUser();
    const pendingList = window.OC.approvals.getPendingApprovals();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Aprobaciones Técnicas</h2>
          <p class="subtitle">Bandeja de revisión del Ingeniero Residente. Verifique sustentos, cantidades y frentes.</p>
        </div>
      </div>

      ${pendingList.length === 0 ? `
        <div class="card" style="text-align:center; padding: 4rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Bandeja al Día</h3>
          <p style="color: #64748b; max-width: 420px; margin: 0 auto 1.5rem auto;">
            No hay solicitudes de insumos pendientes de aprobación técnica en este momento.
          </p>
          <button class="btn btn-outline" onclick="window.OC.ui.navigate('requests')">Ver Todas las Solicitudes</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${pendingList.map(r => `
            <div class="card" style="border-left: 5px solid #f59e0b;">
              <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <span class="cell-code" style="font-size:1.1rem;">${r.code}</span>
                  <span class="badge badge-status-pending ml-2" style="margin-left:0.5rem;">Pendiente de Revisión</span>
                  <div style="font-size:0.85rem; color:#64748b; margin-top:0.25rem;">
                    📅 Solicitado el: ${r.createdDate} • Requerido en obra para: <strong>${r.requiredDate}</strong>
                  </div>
                </div>
                <div>
                  <button class="btn btn-primary btn-sm btn-open-approval-modal" data-id="${r.id}">
                    ${ICONS.approvals} Evaluar y Aprobar
                  </button>
                </div>
              </div>

              <div class="form-grid-3 mb-3" style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; font-size:0.875rem;">
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Obra y Proyecto</span>
                  <strong>${r.projectName}</strong>
                </div>
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Frente de Trabajo</span>
                  <strong>${r.workFront}</strong>
                </div>
                <div>
                  <span style="color:#64748b; font-weight:600; display:block;">Maestro Solicitante</span>
                  <strong>${r.createdBy?.name || 'Maestro'}</strong>
                </div>
              </div>

              <div style="margin-bottom:1rem;">
                <span style="font-size:0.8rem; font-weight:700; color:#475569; text-transform:uppercase;">Justificación Técnica de Obra:</span>
                <p style="font-size:0.9rem; color:#0f172a; margin-top:0.25rem; font-style:italic;">"${r.justification}"</p>
              </div>

              <div>
                <span style="font-size:0.8rem; font-weight:700; color:#475569; text-transform:uppercase;">Materiales Solicitados (${(r.items || []).length}):</span>
                <div class="table-responsive mt-2">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Unidad</th>
                        <th>Cantidad Pedida</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(r.items || []).map(it => `
                        <tr>
                          <td><strong>${it.materialName}</strong> (${it.materialCode})</td>
                          <td>${it.unit}</td>
                          <td><span class="badge badge-secondary" style="font-size:0.85rem;">${it.requested} ${it.unit}</span></td>
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
  // VISTA 4: DESPACHO DE ALMACÉN (JEFATURA DE ALMACÉN)
  // ----------------------------------------------------
  function renderDeliveriesView(container) {
    const user = window.OC.auth.getCurrentUser();
    const pendingDeliveries = window.OC.deliveries.getPendingDeliveries();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Despacho de Almacén de Obra</h2>
          <p class="subtitle">Controle la salida de materiales aprobados, registre entregas parciales y emita vales oficiales.</p>
        </div>
      </div>

      ${pendingDeliveries.length === 0 ? `
        <div class="card" style="text-align:center; padding: 4rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Almacén Despachado</h3>
          <p style="color: #64748b; max-width: 420px; margin: 0 auto 1.5rem auto;">
            No hay órdenes de materiales pendientes de despacho en este momento.
          </p>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${pendingDeliveries.map(r => `
            <div class="card" style="border-left: 5px solid ${r.status === 'ENTREGA_PARCIAL' ? '#ea580c' : '#2563eb'};">
              <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <span class="cell-code" style="font-size:1.1rem;">${r.code}</span>
                  <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}" style="margin-left:0.5rem;">
                    ${window.OC.requests.getStatusLabel(r.status)}
                  </span>
                  <div style="font-size:0.85rem; color:#64748b; margin-top:0.25rem;">
                    🏗️ <strong>${r.projectName}</strong> • Frente: <strong>${r.workFront}</strong>
                  </div>
                </div>
                <div>
                  <button class="btn btn-primary btn-sm btn-open-delivery-modal" data-id="${r.id}">
                    ${ICONS.deliveries} Registrar Entrega y Vale
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
                      <th>Entregado Previo</th>
                      <th>Saldo por Entregar</th>
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
                            <strong style="color: ${balance > 0 ? '#ea580c' : '#10b981'}; font-size:0.95rem;">
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
  // VISTA 5: VALES DE SALIDA (HISTORIAL DE VALES OFICIALES)
  // ----------------------------------------------------
  function renderVouchersView(container) {
    const vouchers = window.OC.deliveries.getAllVouchers();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Vales de Salida de Almacén</h2>
          <p class="subtitle">Comprobantes oficiales de despacho emitidos con firmas de responsabilidad.</p>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>N° de Vale</th>
                <th>Fecha Emisión</th>
                <th>Solicitud Vinculada</th>
                <th>Obra y Frente</th>
                <th>Responsable Almacén</th>
                <th>Receptor en Obra</th>
                <th>Ítems</th>
                <th class="text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              ${vouchers.length === 0 ? `
                <tr><td colspan="8" class="empty-table-box">
                  <div class="empty-table-icon">🧾</div>
                  <div class="empty-table-title">No hay vales emitidos aún</div>
                  <div class="empty-table-msg">Los vales se generan automáticamente cuando el almacenero registra una entrega.</div>
                </td></tr>
              ` : vouchers.map(v => `
                <tr>
                  <td><span class="cell-code">${v.voucherNumber}</span></td>
                  <td style="font-size:0.8rem; color:#64748b;">${v.deliveryDate}</td>
                  <td><strong>${v.requestCode}</strong></td>
                  <td>
                    <strong style="display:block; font-size:0.85rem;">${v.projectName}</strong>
                    <span style="font-size:0.75rem; color:#64748b;">${v.workFront}</span>
                  </td>
                  <td>${v.warehouseResponsible}</td>
                  <td><strong>${v.receiverName}</strong></td>
                  <td><span class="badge badge-secondary">${(v.items || []).length} insumos</span></td>
                  <td class="text-right">
                    <button class="btn btn-xs btn-primary print-voucher-action" data-id="${v.id}">
                      ${ICONS.print} Ver / Imprimir
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
  // VISTA 6: REPORTES Y ESTADÍSTICAS
  // ----------------------------------------------------
  function renderReportsView(container) {
    const kpis = window.OC.reports.calculateKPIs();
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.requests.getAllRequests();
    const vouchers = window.OC.deliveries.getAllVouchers();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Reportes e Indicadores de Obra</h2>
          <p class="subtitle">Consolidado métrico, trazabilidad de consumo y exportación de datos.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btn-export-full-report">
            ${ICONS.download} Exportar a Excel (CSV)
          </button>
        </div>
      </div>

      <div class="kpi-grid mb-4">
        <div class="kpi-card kpi-approved">
          <div class="kpi-content">
            <span class="kpi-label">Total Solicitudes</span>
            <div class="kpi-value">${kpis.total}</div>
            <span class="kpi-subtext">Emitidas a la fecha</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.requests}</div>
        </div>

        <div class="kpi-card kpi-delivered">
          <div class="kpi-content">
            <span class="kpi-label">Vales de Salida</span>
            <div class="kpi-value">${kpis.vouchersCount}</div>
            <span class="kpi-subtext">Despachos confirmados</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.vouchers}</div>
        </div>

        <div class="kpi-card kpi-pending">
          <div class="kpi-content">
            <span class="kpi-label">Tasa de Aprobación</span>
            <div class="kpi-value">${kpis.total ? Math.round(((kpis.approved + kpis.delivered + kpis.partialDelivery) / kpis.total) * 100) : 0}%</div>
            <span class="kpi-subtext">Aprobadas por Residente</span>
          </div>
          <div class="kpi-icon-wrap">${ICONS.check}</div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3><span>🏢</span> Distribución de Consumo por Obra</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código de Obra</th>
                <th>Nombre de Obra</th>
                <th>Ubicación</th>
                <th>Solicitudes</th>
                <th>Vales Emitidos</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => {
                const reqCount = requests.filter(r => r.projectId === p.id).length;
                const vouCount = vouchers.filter(v => v.projectName === p.name).length;
                return `
                  <tr>
                    <td><span class="cell-code">${p.code}</span></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.location}</td>
                    <td><span class="badge badge-secondary">${reqCount} pedidos</span></td>
                    <td><span class="badge badge-success">${vouCount} vales</span></td>
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
  // VISTA: ALMACÉN CENTRAL Y CATÁLOGO DE INSUMOS
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
          <h2>Almacén Central y Catálogo de Insumos</h2>
          <p class="subtitle">Control de saldos físicos de materiales de construcción, valorización en soles y dólares, y registro de entradas y salidas.</p>
        </div>
        <div class="header-actions">
          ${canManage ? `
            <button class="btn btn-outline" id="btn-mat-cat-adjust">
              📥 Registrar Entrada / Ajuste
            </button>
            <button class="btn btn-primary" id="btn-mat-cat-add">
              ${ICONS.plus} Nuevo Material
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
  function renderProjectsView(container) {
    const projects = window.OC.storage.getProjects();
    const requests = window.OC.storage.getRequests();
    const vouchers = window.OC.storage.getVouchers();
    const user = window.OC.auth.getCurrentUser();

    const totalFronts = projects.reduce((acc, p) => acc + ((p.workFronts || []).length), 0);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-title">
          <h2>Obras y Frentes de Trabajo Asignados</h2>
          <p class="subtitle">Administre las obras civiles activas, localizaciones y los frentes operativos de acopio y trabajo.</p>
        </div>
      </div>

      <div class="finance-summary-grid">
        <div class="finance-summary-card finance-card-stock">
          <span class="finance-card-label">Total de Obras Registradas</span>
          <div class="finance-card-value">${projects.length} <span style="font-size:0.9rem; font-weight:600; color:#64748b;">obras</span></div>
          <span class="finance-card-sub">Proyectos habilitados en el sistema</span>
        </div>
        <div class="finance-summary-card finance-card-usd">
          <span class="finance-card-label">Frentes de Trabajo Activos</span>
          <div class="finance-card-value" style="color:#2563eb;">${totalFronts} <span style="font-size:0.9rem; font-weight:600; color:#64748b;">frentes</span></div>
          <span class="finance-card-sub">Puntos de recepción y control en obra</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Listado de Obras y Frentes</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Proyecto / Obra</th>
                <th>Ubicación</th>
                <th>Frentes de Trabajo Habilitados</th>
                <th>Pedidos</th>
                <th>Vales</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => {
                const reqCount = requests.filter(r => r.projectId === p.id).length;
                const vouCount = vouchers.filter(v => v.projectName === p.name).length;
                return `
                  <tr>
                    <td><span class="cell-code">${p.code}</span></td>
                    <td><strong>${p.name}</strong></td>
                    <td>📍 ${p.location}</td>
                    <td>
                      <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
                        ${(p.workFronts || []).map(f => `<span class="badge badge-outline" style="font-size:0.75rem;">${f}</span>`).join('')}
                      </div>
                    </td>
                    <td><span class="badge badge-secondary">${reqCount}</span></td>
                    <td><span class="badge badge-success">${vouCount}</span></td>
                    <td><span class="badge ${p.active !== false ? 'badge-success' : 'badge-danger'}">${p.active !== false ? 'Activo' : 'Inactivo'}</span></td>
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
  // VISTA 7: ADMINISTRACIÓN DEL SISTEMA
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
          <h2>Módulo de Administración</h2>
          <p class="subtitle">Gestión centralizada de catálogos, obras, cuentas, copias de seguridad y auditoría.</p>
        </div>
      </div>

      <div class="tabs-bar">
        <button class="tab-btn ${initialTab === 'tab-materials' ? 'active' : ''}" data-tab="tab-materials">🧱 Catálogo de Materiales (${materials.length})</button>
        <button class="tab-btn ${initialTab === 'tab-projects' ? 'active' : ''}" data-tab="tab-projects">🏢 Obras y Frentes (${projects.length})</button>
        <button class="tab-btn ${initialTab === 'tab-users' ? 'active' : ''}" data-tab="tab-users">👥 Cuentas y Roles (${users.length})</button>
        <button class="tab-btn ${initialTab === 'tab-backup' ? 'active' : ''}" data-tab="tab-backup">💾 Respaldo y Datos</button>
        <button class="tab-btn ${initialTab === 'tab-audit' ? 'active' : ''}" data-tab="tab-audit">🛡️ Bitácora de Auditoría (${auditLogs.length})</button>
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
          showToast(res.message || 'No se pudo actualizar el material. Verifique los datos.', 'error');
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
          showToast(res.message || 'No se pudo registrar el material. Verifique los datos.', 'error');
        }
      }
    };
  }

  // ----------------------------------------------------
  // MODAL: REGISTRAR ENTRADA / AJUSTE DE STOCK
  // ----------------------------------------------------
  function openAdjustStockModal(selectedMaterialId = null) {
    const materials = window.OC.storage.getMaterials();
    if (!materials.length) { showToast('⚠️ No hay materiales en el catálogo para ajustar el stock.', 'warning'); return; }

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
        showToast(res.message || 'No se pudo realizar el ajuste de stock. Verifique los datos.', 'error');
      }
    };
  }

  // ----------------------------------------------------
  // MODAL 1: NUEVA SOLICITUD DE INSUMOS
  // ----------------------------------------------------
  function openNewRequestModal() {
    const projects = window.OC.storage.getProjects();
    const materials = window.OC.storage.getMaterials().filter(m => m.active !== false);
    let currentItems = [];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div>
            <h3>Nueva Solicitud de Insumos</h3>
            <span class="badge badge-secondary" style="font-size:0.75rem;">Control Automatizado de Saldos de Almacén</span>
          </div>
          <button class="modal-close" id="modal-close-new-req">&times;</button>
        </div>

        <form id="form-new-request">
          <div class="modal-body">
            
            <!-- SECCIÓN 1: DATOS GENERALES -->
            <div style="font-size:0.8rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
              <span>1️⃣</span> Ubicación y Programación de la Obra
            </div>

            <div class="form-grid-3 mb-3">
              <div class="form-group">
                <label for="req-proj-select">Obra / Proyecto *</label>
                <select id="req-proj-select" class="form-control" required>
                  <option value="">Seleccione Obra...</option>
                  ${projects.map(p => `<option value="${p.id}" ${activeProjectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="req-front-select">Frente de Trabajo *</label>
                <select id="req-front-select" class="form-control" required>
                  <option value="">Seleccione primero una obra...</option>
                </select>
              </div>

              <div class="form-group">
                <label for="req-date-input">Fecha Requerida en Obra *</label>
                <input type="date" id="req-date-input" class="form-control" required>
              </div>
            </div>

            <!-- SECCIÓN 2: AGREGADOR DE MATERIALES -->
            <div style="font-size:0.8rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:0.75rem; margin-top:1.5rem; display:flex; align-items:center; justify-content:space-between;">
              <span>2️⃣ Insumos y Materiales a Solicitar (Descuento de Saldo)</span>
              <span style="font-size:0.75rem; color:#64748b; font-weight:500;">TC Referencial: S/ 3.75 = $ 1.00 USD</span>
            </div>

            <div style="background:#f8fafc; padding:1.25rem; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:1rem;">
              <div class="form-grid-3" style="align-items:flex-end;">
                <div class="form-group" style="grid-column: span 2;">
                  <label for="picker-material-select">Seleccionar Material del Almacén *</label>
                  <select id="picker-material-select" class="form-control">
                    <option value="">Buscar insumo en almacén...</option>
                    ${materials.map(m => {
                      const st = m.stock || 0;
                      return `<option value="${m.id}" data-stock="${st}" data-unit="${m.unit}" data-price-pen="${m.pricePEN || 0}" data-price-usd="${m.priceUSD || 0}">[${m.code}] ${m.name} - Saldo: ${st.toLocaleString('es-PE')} ${m.unit} (S/ ${(m.pricePEN || 0).toFixed(2)} | $ ${(m.priceUSD || 0).toFixed(2)})</option>`;
                    }).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label for="picker-qty-input">Cantidad a Pedir</label>
                  <div style="display:flex; gap:0.5rem;">
                    <input type="number" id="picker-qty-input" class="form-control" step="any" min="0.01" placeholder="ej. 25000">
                    <button type="button" class="btn btn-primary" id="btn-add-item-to-table" style="flex-shrink:0;">
                      ${ICONS.plus} Añadir
                    </button>
                  </div>
                </div>
              </div>

              <!-- BANNER DINÁMICO DE SALDO Y PRECIOS -->
              <div id="picker-stock-info" class="stock-preview-banner" style="display:none;"></div>
              <div id="picker-stock-error" class="stock-warning-banner" style="display:none;"></div>
            </div>

            <!-- TABLA DE MATERIALES AGREGADOS -->
            <div class="table-responsive mb-2">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Unidad</th>
                    <th>Saldo Almacén</th>
                    <th>Cant. Solicitada</th>
                    <th>P. Unitario</th>
                    <th>Subtotal Estimado</th>
                    <th class="text-right">Quitar</th>
                  </tr>
                </thead>
                <tbody id="new-req-items-tbody">
                  <tr><td colspan="7" class="text-center text-muted" style="padding:1.5rem;">Aún no ha agregado insumos a la solicitud.</td></tr>
                </tbody>
                <tfoot id="new-req-items-tfoot" style="display:none; background:#f8fafc; font-weight:700;">
                  <tr>
                    <td colspan="5" class="text-right" style="padding:0.75rem 1rem;">TOTAL ESTIMADO DE LA SOLICITUD:</td>
                    <td colspan="2" style="padding:0.75rem 1rem;">
                      <div style="font-size:0.95rem; color:#047857;" id="foot-total-pen">S/ 0.00</div>
                      <div style="font-size:0.95rem; color:#2563eb;" id="foot-total-usd">$ 0.00</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- SECCIÓN 3: JUSTIFICACIÓN -->
            <div style="font-size:0.8rem; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:0.75rem; margin-top:1.5rem; display:flex; align-items:center; gap:0.4rem;">
              <span>3️⃣</span> Justificación Técnica de Obra
            </div>

            <div class="form-group mb-2">
              <label for="req-justification-input">Sustento del Pedido (Mínimo 10 caracteres) *</label>
              <textarea id="req-justification-input" class="form-control" rows="2" placeholder="ej. Para levantamiento de tabiquería en segundo piso según cronograma valorizado..." required></textarea>
            </div>

            <div class="form-group">
              <label for="req-obs-input">Observaciones adicionales (Opcional)</label>
              <input type="text" id="req-obs-input" class="form-control" placeholder="ej. Descarga en rampa norte, coordinar con almacén central">
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-new-req">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar y Enviar Solicitud</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    // Funciones del modal
    const closeModal = () => overlay.remove();
    document.getElementById('modal-close-new-req').onclick = closeModal;
    document.getElementById('btn-cancel-new-req').onclick = closeModal;

    const projSelect = document.getElementById('req-proj-select');
    const frontSelect = document.getElementById('req-front-select');

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

    // Fecha por defecto mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('req-date-input').value = tomorrow.toISOString().slice(0, 10);

    // Renderizar tabla de items agregados
    const itemsTbody = document.getElementById('new-req-items-tbody');
    const itemsTfoot = document.getElementById('new-req-items-tfoot');
    const footTotalPEN = document.getElementById('foot-total-pen');
    const footTotalUSD = document.getElementById('foot-total-usd');

    function renderItems() {
      if (currentItems.length === 0) {
        itemsTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:1.5rem;">Aún no ha agregado insumos a la solicitud.</td></tr>`;
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
          <td><span class="badge badge-outline" style="font-size:0.75rem;">${(it.currentStock || 0).toLocaleString('es-PE')} ${it.unit}</span></td>
          <td><span class="badge badge-secondary font-bold" style="font-size:0.85rem;">${it.quantity.toLocaleString('es-PE')} ${it.unit}</span></td>
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
            <button type="button" class="btn btn-xs btn-danger-outline remove-item-btn" data-index="${idx}">&times;</button>
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

      // Descontar lo que ya se agregó en esta misma solicitud provisionalmente
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
          <span style="font-size:0.75rem; color:#475569; display:block;">
            Saldo Disponible en Almacén: <strong style="color:#0f172a; font-size:0.9rem;">${effectiveStock.toLocaleString('es-PE')} ${m.unit}</strong>
          </span>
          <span style="font-size:0.8rem; color:#065f46; font-weight:600;">
            Precio Unitario: S/ ${pricePEN.toFixed(2)} (PEN) | $ ${priceUSD.toFixed(2)} (USD)
          </span>
          ${qty > 0 ? `
            <div style="font-size:0.8rem; margin-top:0.25rem;">
              Subtotal Calculado: <strong style="color:#047857;">S/ ${subPEN.toFixed(2)}</strong> | <strong style="color:#2563eb;">$ ${subUSD.toFixed(2)}</strong>
              ${projectedRem >= 0 ? ` | Saldo restante proyectado: <strong>${projectedRem.toLocaleString('es-PE')} ${m.unit}</strong>` : ''}
            </div>
          ` : ''}
        </div>
        <span class="badge ${effectiveStock <= (m.minStock || 0) ? 'badge-stock-low' : 'badge-stock-ok'}">
          ${effectiveStock <= 0 ? 'Sin Stock' : (effectiveStock <= (m.minStock || 0) ? 'Stock Bajo' : 'Stock Normal')}
        </span>
      `;

      if (qty > effectiveStock) {
        stockErrorBox.style.display = 'flex';
        stockErrorBox.innerHTML = `⚠️ La cantidad solicitada (${qty.toLocaleString('es-PE')} ${m.unit}) excede el saldo disponible en almacén (${effectiveStock.toLocaleString('es-PE')} ${m.unit}).`;
      } else {
        stockErrorBox.style.display = 'none';
      }
    }

    matSelect.addEventListener('change', updateLivePicker);
    qtyInput.addEventListener('input', updateLivePicker);

    // Botón añadir insumo
    btnAdd.onclick = () => {
      const matId = matSelect.value;
      const qty = parseFloat(qtyInput.value);

      if (!matId) { showToast('⚠️ Seleccione un material del almacén antes de continuar.', 'warning'); return; }
      if (isNaN(qty) || qty <= 0) { showToast('⚠️ Ingrese una cantidad válida mayor a 0.', 'warning'); return; }

      const m = materials.find(it => it.id === matId);
      const alreadyAdded = currentItems.filter(it => it.materialId === m.id).reduce((acc, it) => acc + it.quantity, 0);
      const effectiveStock = Math.max(0, (m.stock || 0) - alreadyAdded);

      if (qty > effectiveStock) {
        showToast(`⚠️ Stock insuficiente: "${m.name}" tiene solo ${effectiveStock.toLocaleString('es-PE')} ${m.unit} disponibles en almacén.`, 'warning');
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

    // Envío del formulario
    document.getElementById('form-new-request').onsubmit = (e) => {
      e.preventDefault();
      if (currentItems.length === 0) {
        showToast('⚠️ Debe agregar al menos un material a la solicitud antes de enviarla.', 'warning');
        return;
      }

      const res = window.OC.requests.createRequest({
        projectId: projSelect.value,
        workFront: frontSelect.value,
        requiredDate: document.getElementById('req-date-input').value,
        justification: document.getElementById('req-justification-input').value,
        observations: document.getElementById('req-obs-input').value,
        items: currentItems
      });

      if (res.success) {
        showToast('Solicitud creada con éxito. Los insumos han sido descontados del saldo de almacén.', 'success');
        closeModal();
        navigate('requests');
      } else {
        showToast(res.message || 'No se pudo crear la solicitud. Verifique los datos ingresados.', 'error');
      }
    };
  }

  // ----------------------------------------------------
  // MODAL 2: DETALLES DE SOLICITUD (FICHA TÉCNICA)
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
            <h3>Ficha de Solicitud <span class="cell-code">${req.code}</span></h3>
            <span class="badge ${window.OC.requests.getStatusBadgeClass(req.status)} mt-1">
              ${window.OC.requests.getStatusLabel(req.status)}
            </span>
          </div>
          <button class="modal-close" id="modal-close-details">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid-3 mb-3" style="background:#f8fafc; padding:1.25rem; border-radius:8px; border:1px solid #e2e8f0;">
            <div>
              <span class="text-muted" style="font-size:0.75rem; font-weight:700;">OBRA / PROYECTO</span>
              <strong style="display:block;">${req.projectName}</strong>
            </div>
            <div>
              <span class="text-muted" style="font-size:0.75rem; font-weight:700;">FRENTE ASIGNADO</span>
              <strong style="display:block;">${req.workFront}</strong>
            </div>
            <div>
              <span class="text-muted" style="font-size:0.75rem; font-weight:700;">FECHA REQUERIDA</span>
              <strong style="display:block; color:#2563eb;">${req.requiredDate}</strong>
            </div>
          </div>

          <!-- RESUMEN FINANCIERO DE LA SOLICITUD -->
          <div class="finance-summary-grid mb-3">
            <div class="finance-summary-card finance-card-pen">
              <span class="finance-card-label">Importe Total Solicitud (Soles)</span>
              <div class="finance-card-value" style="color:#047857;">S/ ${(req.totalPEN || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span class="finance-card-sub">Moneda Nacional (PEN)</span>
            </div>
            <div class="finance-summary-card finance-card-usd">
              <span class="finance-card-label">Importe Total Solicitud (Dólares)</span>
              <div class="finance-card-value" style="color:#2563eb;">$ ${(req.totalUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span class="finance-card-sub">Moneda Extranjera (USD)</span>
            </div>
          </div>

          <div class="mb-3">
            <span class="text-muted" style="font-size:0.75rem; font-weight:700;">JUSTIFICACIÓN TÉCNICA:</span>
            <p style="margin-top:0.25rem; font-size:0.9rem;">${req.justification}</p>
          </div>

          <div class="mb-3">
            <span class="text-muted" style="font-size:0.75rem; font-weight:700;">MATERIALES, VALORIZACIÓN Y SALDOS:</span>
            <div class="table-responsive mt-2">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Unidad</th>
                    <th>Pedido</th>
                    <th>Aprobado</th>
                    <th>Entregado</th>
                    <th>Saldo Pedido</th>
                    <th>Saldo Almacén Actual</th>
                    <th>P. Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${(req.items || []).map(it => {
                    const balance = Math.max(0, (it.approved || 0) - (it.delivered || 0));
                    const matInCatalog = materialsCatalog.find(m => m.id === it.materialId || m.code === it.materialCode);
                    const currentWhStock = matInCatalog ? matInCatalog.stock : 'N/D';
                    const pricePEN = it.pricePEN || (matInCatalog ? matInCatalog.pricePEN : 0) || 0;
                    const priceUSD = it.priceUSD || (matInCatalog ? matInCatalog.priceUSD : 0) || 0;
                    const subtotalPEN = it.subtotalPEN || (pricePEN * it.requested);
                    const subtotalUSD = it.subtotalUSD || (priceUSD * it.requested);

                    return `
                      <tr>
                        <td>
                          <strong>${it.materialName}</strong>
                          <div style="font-size:0.75rem; color:#64748b;">${it.materialCode}</div>
                        </td>
                        <td>${it.unit}</td>
                        <td><strong>${it.requested.toLocaleString('es-PE')}</strong></td>
                        <td>${it.approved ? it.approved.toLocaleString('es-PE') : 0}</td>
                        <td><span style="color:#10b981; font-weight:700;">${(it.delivered || 0).toLocaleString('es-PE')}</span></td>
                        <td><strong style="color:${balance > 0 ? '#ea580c' : '#64748b'};">${balance.toLocaleString('es-PE')}</strong></td>
                        <td><span class="badge badge-outline" style="font-size:0.75rem;">${typeof currentWhStock === 'number' ? currentWhStock.toLocaleString('es-PE') : currentWhStock} ${it.unit}</span></td>
                        <td>
                          <div class="price-box-dual">
                            <span class="price-tag-pen">S/ ${pricePEN.toFixed(2)}</span>
                            <span class="price-tag-usd">$ ${priceUSD.toFixed(2)}</span>
                          </div>
                        </td>
                        <td>
                          <div class="price-box-dual">
                            <strong style="color:#047857;">S/ ${subtotalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            <strong style="color:#2563eb;">$ ${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <span class="text-muted" style="font-size:0.75rem; font-weight:700;">HISTORIAL DE TRAZABILIDAD:</span>
            <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem;">
              ${(req.history || []).map(h => `
                <div style="font-size:0.8rem; padding:0.5rem 0.75rem; background:#f8fafc; border-left:3px solid #2563eb; border-radius:4px;">
                  <strong>${h.date}</strong> - ${h.user}: <em>${h.action}</em> - ${h.note || ''}
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-close-details">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-details').onclick = close;
    document.getElementById('btn-close-details').onclick = close;
  }

  // ----------------------------------------------------
  // MODAL 3: EVALUACIÓN Y APROBACIÓN TÉCNICA
  // ----------------------------------------------------
  function openApprovalModal(requestId) {
    const req = window.OC.requests.getRequestById(requestId);
    if (!req) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Aprobación Técnica: <span class="cell-code">${req.code}</span></h3>
          <button class="modal-close" id="modal-close-approval">&times;</button>
        </div>

        <div class="modal-body">
          <p class="subtitle mb-3">Revisión del Ing. Residente para la obra <strong>${req.projectName}</strong> (${req.workFront}).</p>

          <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:1.25rem;">
            <strong style="display:block; font-size:0.85rem; color:#475569;">Justificación:</strong>
            <p style="font-size:0.9rem; font-style:italic;">"${req.justification}"</p>
          </div>

          <div class="table-responsive mb-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidad</th>
                  <th>Pedido por Maestro</th>
                  <th style="width: 160px;">Cantidad a Aprobar</th>
                </tr>
              </thead>
              <tbody>
                ${(req.items || []).map(it => `
                  <tr>
                    <td><strong>${it.materialName}</strong></td>
                    <td>${it.unit}</td>
                    <td>${it.requested} ${it.unit}</td>
                    <td>
                      <input type="number" class="form-control approval-qty-input" data-id="${it.materialId}" value="${it.requested}" min="0" max="${it.requested}" step="any">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="form-group">
            <label for="approval-notes-input">Observaciones / Especificaciones para Almacén</label>
            <textarea id="approval-notes-input" class="form-control" rows="2" placeholder="ej. Aprobado según metrado del plano E-03. Despachar según avance..."></textarea>
          </div>
        </div>

        <div class="modal-footer flex-between">
          <button type="button" class="btn btn-danger-outline" id="btn-reject-req">Rechazar Solicitud</button>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-approval">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-approve">Aprobar Solicitud</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-approval').onclick = close;
    document.getElementById('btn-cancel-approval').onclick = close;

    // Confirmar Aprobación
    document.getElementById('btn-confirm-approve').onclick = () => {
      const itemsMap = {};
      overlay.querySelectorAll('.approval-qty-input').forEach(inp => {
        itemsMap[inp.getAttribute('data-id')] = parseFloat(inp.value);
      });
      const notes = document.getElementById('approval-notes-input').value;

      const res = window.OC.approvals.approveRequest(requestId, itemsMap, notes);
      if (res.success) {
        showToast('Solicitud aprobada y lista para despacho en almacén.', 'success');
        close();
        navigate('approvals');
      } else {
        showToast(res.message || 'No se pudo aprobar la solicitud. Verifique los datos.', 'error');
      }
    };

    // Rechazar
    document.getElementById('btn-reject-req').onclick = () => {
      const reason = prompt('Indique el motivo técnico del rechazo de la solicitud:');
      if (!reason || reason.trim().length < 5) {
        showToast('⚠️ Debe especificar un motivo válido de al menos 5 caracteres para rechazar la solicitud.', 'warning');
        return;
      }
      const res = window.OC.approvals.rejectRequest(requestId, reason);
      if (res.success) {
        showToast('Solicitud rechazada. Se notificará al solicitante.', 'info');
        close();
        navigate('approvals');
      } else {
        showToast(res.message || 'No se pudo rechazar la solicitud. Intente nuevamente.', 'error');
      }
    };
  }

  // ----------------------------------------------------
  // MODAL 4: DESPACHO DE MATERIALES Y EMISIÓN DE VALE
  // ----------------------------------------------------
  function openDeliveryModal(requestId) {
    const req = window.OC.requests.getRequestById(requestId);
    if (!req) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Despacho de Materiales: <span class="cell-code">${req.code}</span></h3>
          <button class="modal-close" id="modal-close-delivery">&times;</button>
        </div>

        <div class="modal-body">
          <p class="subtitle mb-3">Indique las cantidades despachadas en esta salida. Se emitirá el Vale Oficial de Almacén.</p>

          <div class="table-responsive mb-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidad</th>
                  <th>Aprobado</th>
                  <th>Saldo Pendiente</th>
                  <th style="width: 160px;">Despachar Ahora</th>
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
                      <td><strong style="color:#ea580c;">${balance} ${it.unit}</strong></td>
                      <td>
                        <input type="number" class="form-control delivery-qty-input" data-id="${it.materialId}" value="${balance}" min="0" max="${balance}" step="any">
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="form-grid-2 mb-3">
            <div class="form-group">
              <label for="delivery-receiver-name">Nombre de quien Recibe en Obra *</label>
              <input type="text" id="delivery-receiver-name" class="form-control" placeholder="ej. Juan Pérez (Maestro de Cuadrilla)" required>
            </div>
            <div class="form-group">
              <label for="delivery-notes">Observaciones del Despacho</label>
              <input type="text" id="delivery-notes" class="form-control" placeholder="ej. Entrega completa en parihuelas protegidas">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-delivery">Cancelar</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-delivery">
            ${ICONS.print} Confirmar Despacho y Emitir Vale
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close-delivery').onclick = close;
    document.getElementById('btn-cancel-delivery').onclick = close;

    document.getElementById('btn-confirm-delivery').onclick = () => {
      const receiver = document.getElementById('delivery-receiver-name').value;
      if (!receiver || receiver.trim().length < 3) {
        showToast('⚠️ Debe ingresar el nombre completo (mínimo 3 caracteres) de la persona que recibe el material en obra.', 'warning');
        return;
      }

      const itemsMap = {};
      overlay.querySelectorAll('.delivery-qty-input').forEach(inp => {
        itemsMap[inp.getAttribute('data-id')] = parseFloat(inp.value);
      });
      const notes = document.getElementById('delivery-notes').value;

      const res = window.OC.deliveries.registerDelivery(requestId, itemsMap, receiver, notes);
      if (res.success) {
        showToast(`Despacho registrado. Vale oficial emitido: ${res.voucher.voucherNumber}`, 'success');
        close();
        openVoucherPrintModal(res.voucher.id);
        navigate('deliveries');
      } else {
        showToast(res.message || 'No se pudo registrar el despacho. Verifique las cantidades ingresadas.', 'error');
      }
    };
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
      else showToast(res.message || 'Error al sincronizar con la nube. Verifique la conexión.', 'error');
    };

    document.getElementById('btn-sync-from-cloud').onclick = async () => {
      showToast('Descargando de Cloud Firestore...', 'info');
      const res = await window.OC.firebase.downloadFirestoreToLocal();
      if (res.success) {
        showToast(res.message, 'success');
        navigate(currentView);
      } else {
        showToast(res.message || 'Error al descargar desde la nube. Verifique la conexión.', 'error');
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
