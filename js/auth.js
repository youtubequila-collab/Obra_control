/**
 * ObraControl - auth.js
 * Autenticación de cuentas, roles y control de permisos de interfaz.
 * Compatible con Firebase Authentication y Modo Local / Demostración.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  const SESSION_KEY = 'obracontrol_active_session';
  let currentUser = null;

  function getCurrentUser() {
    return currentUser;
  }

  function setCurrentUser(user) {
    currentUser = user || null;
    if (user) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } catch (e) {}

      if (window.OC.storage) {
        const users = window.OC.storage.getUsers();
        const index = users.findIndex(entry => entry.id === user.id);
        if (index >= 0) users[index] = user;
        else users.push(user);
        window.OC.storage.saveUsers(users);
      }
    } else {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}
    }
  }

  async function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Intentar inicio de sesión mediante Firebase si está disponible
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      try {
        const user = await window.OC.firebase.signIn(cleanEmail, password);
        setCurrentUser(user);
        window.OC.storage.logAction(user, 'INICIO_SESION_FIREBASE', `Inicio de sesión con Firebase como [${getRoleLabel(user.role)}]`);
        return { success: true, user: user };
      } catch (firebaseErr) {
        // Si el usuario pertenece a las cuentas de prueba local, permitir acceso local
        const localUsers = window.OC.storage ? window.OC.storage.getUsers() : [];
        const match = localUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
        if (match) {
          setCurrentUser(match);
          window.OC.storage.logAction(match, 'INICIO_SESION_LOCAL', `Inicio de sesión local como [${getRoleLabel(match.role)}]`);
          return { success: true, user: match };
        }
        throw firebaseErr;
      }
    }

    // 2. Modo local / offline
    const localUsers = window.OC.storage ? window.OC.storage.getUsers() : [];
    const match = localUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (match) {
      setCurrentUser(match);
      window.OC.storage.logAction(match, 'INICIO_SESION_LOCAL', `Inicio de sesión local como [${getRoleLabel(match.role)}]`);
      return { success: true, user: match };
    }

    throw new Error('No se pudo iniciar sesión. Verifique su conexión o credenciales.');
  }

  function loginDemo(role = 'solicitante') {
    const localUsers = window.OC.storage ? window.OC.storage.getUsers() : [];
    let match = localUsers.find(u => u.role === role);
    if (!match) {
      const presets = {
        solicitante: {
          id: 'USR-003',
          name: 'Juan Pérez',
          email: 'juan.perez@obracontrol.pe',
          role: 'solicitante',
          jobTitle: 'Maestro de Obra (Cimentaciones y Estructuras)',
          active: true,
          status: 'active'
        },
        aprobador: {
          id: 'USR-002',
          name: 'Ing. Carlos Mendoza',
          email: 'carlos.mendoza@obracontrol.pe',
          role: 'aprobador',
          jobTitle: 'Ingeniero Residente Principal',
          active: true,
          status: 'active'
        },
        almacenero: {
          id: 'USR-004',
          name: 'Manuel Rivas',
          email: 'manuel.rivas@obracontrol.pe',
          role: 'almacenero',
          jobTitle: 'Jefe de Almacén y Logística de Obra',
          active: true,
          status: 'active'
        },
        admin: {
          id: 'USR-001',
          name: 'Superadministrador',
          email: 'quilalaime@gmail.com',
          role: 'superadmin',
          jobTitle: 'Superadministrador del Sistema',
          active: true,
          status: 'active'
        },
        superadmin: {
          id: 'USR-001',
          name: 'Superadministrador',
          email: 'quilalaime@gmail.com',
          role: 'superadmin',
          jobTitle: 'Superadministrador del Sistema',
          active: true,
          status: 'active'
        }
      };
      match = presets[role] || presets.solicitante;
    }
    setCurrentUser(match);
    window.OC.storage.logAction(match, 'ACCESO_DEMO', `Acceso en modo demostración como [${getRoleLabel(match.role)}]`);
    return match;
  }

  function switchRole(newRole) {
    return loginDemo(newRole);
  }

  async function register(profile) {
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      return window.OC.firebase.registerAccount(profile);
    }
    // Si está offline, registrarlo localmente
    const localUsers = window.OC.storage ? window.OC.storage.getUsers() : [];
    const newUser = {
      id: 'USR-' + Date.now(),
      name: profile.name.trim(),
      email: profile.email.trim().toLowerCase(),
      role: profile.role,
      jobTitle: profile.jobTitle.trim(),
      active: true,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    localUsers.push(newUser);
    window.OC.storage.saveUsers(localUsers);
    return {
      role: newUser.role,
      message: 'Cuenta registrada exitosamente en almacenamiento local.'
    };
  }

  async function restoreSession() {
    // 1. Intentar sesión Firebase
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      try {
        const user = await window.OC.firebase.restoreSession();
        if (user) {
          setCurrentUser(user);
          return user;
        }
      } catch (err) {
        console.warn('Firebase restoreSession:', err);
      }
    }

    // 2. Intentar sesión guardada local
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          currentUser = parsed;
          return parsed;
        }
      }
    } catch (e) {}

    return null;
  }

  async function logout() {
    const user = getCurrentUser();
    if (user) {
      window.OC.storage.logAction(user, 'CIERRE_SESION', 'Cierre de sesión del usuario.');
    }
    if (window.OC.firebase) {
      try {
        await window.OC.firebase.signOut();
      } catch (e) {}
    }
    setCurrentUser(null);
  }

  function isSuperAdmin(user = getCurrentUser()) {
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    const superEmail = (window.OC.firebase && window.OC.firebase.superAdminEmail) 
      ? window.OC.firebase.superAdminEmail.toLowerCase() 
      : 'quilalaime@gmail.com';
    return (user.role === 'superadmin' || user.role === 'admin') && (email === superEmail || user.role === 'superadmin');
  }

  function getRoleLabel(role) {
    switch (role) {
      case 'superadmin': return 'Superadministrador';
      case 'admin': return 'Administrador de Obra';
      case 'solicitante': return 'Maestro de Obra';
      case 'aprobador': return 'Ingeniero Residente';
      case 'almacenero': return 'Jefe de Almacén';
      default: return role || 'Usuario';
    }
  }

  function getRoleBadgeClass(role) {
    switch (role) {
      case 'superadmin':
      case 'admin': return 'badge-role-admin';
      case 'solicitante': return 'badge-role-solicitante';
      case 'aprobador': return 'badge-role-aprobador';
      case 'almacenero': return 'badge-role-almacenero';
      default: return 'badge-secondary';
    }
  }

  let freeMode = true;

  function isFreeMode() {
    return freeMode;
  }

  function setFreeMode(val) {
    freeMode = Boolean(val);
  }

  function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'superadmin' || isSuperAdmin(user)) return true;

    // En modo ágil / local, permitir el flujo operativo completo sin bloqueos
    if (freeMode && (!window.OC.firebase || !window.OC.firebase.isConnected())) {
      if (['create_request', 'approve_request', 'deliver_materials', 'view_reports'].includes(permission)) {
        return true;
      }
    }

    switch (permission) {
      case 'create_request':
        return user.role === 'solicitante';
      case 'approve_request':
        return user.role === 'aprobador';
      case 'deliver_materials':
        return user.role === 'almacenero';
      case 'manage_settings':
        return user.role === 'admin' || user.role === 'superadmin' || isSuperAdmin(user);
      case 'view_reports':
        return true;
      default:
        return false;
    }
  }

  window.OC.auth = {
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    login: login,
    loginDemo: loginDemo,
    switchRole: switchRole,
    register: register,
    restoreSession: restoreSession,
    logout: logout,
    isSuperAdmin: isSuperAdmin,
    getRoleLabel: getRoleLabel,
    getRoleBadgeClass: getRoleBadgeClass,
    hasPermission: hasPermission,
    isFreeMode: isFreeMode,
    setFreeMode: setFreeMode
  };
})();
