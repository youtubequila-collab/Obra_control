/**
 * ObraControl - firebase-config.js
 * Módulo de integración híbrido con Firebase (Authentication y Cloud Firestore).
 * Permite alternar entre almacenamiento local (offline) y sincronización con la nube (Firestore).
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  const FIREBASE_CONFIG_STORAGE_KEY = 'obracontrol_firebase_config';
  const FIREBASE_STATUS_STORAGE_KEY = 'obracontrol_firebase_enabled';
  const SUPER_ADMIN_EMAIL = 'quilalaime@gmail.com';
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAsMAzy-jnk37QmnLy7XfOpW6kw2Ogqn_8",
    authDomain: "obracontrol-907fe.firebaseapp.com",
    projectId: "obracontrol-907fe",
    storageBucket: "obracontrol-907fe.firebasestorage.app",
    messagingSenderId: "640638771902",
    appId: "1:640638771902:web:4abf4c4c8061ec481634ef",
    measurementId: "G-EVQG7K7GBC"
  };

  // Configuración predeterminada o guardada en localStorage
  function getSavedFirebaseConfig() {
    try {
      const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config && config.apiKey && config.projectId) return config;
      }
    } catch (e) {
      console.warn('Error al leer configuración de Firebase:', e);
    }

    return DEFAULT_FIREBASE_CONFIG;
  }

  function saveFirebaseConfig(config) {
    try {
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Error al guardar configuración de Firebase:', e);
      return false;
    }
  }

  function isFirebaseEnabled() {
    return localStorage.getItem(FIREBASE_STATUS_STORAGE_KEY) === 'true';
  }

  function setFirebaseEnabled(enabled) {
    localStorage.setItem(FIREBASE_STATUS_STORAGE_KEY, enabled ? 'true' : 'false');
  }

  // Estado del servicio Firebase
  let app = null;
  let auth = null;
  let db = null;
  let isConnected = false;
  let activeListeners = [];

  // Inicializar Firebase si el SDK está presente y hay configuración válida
  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.info('ObraControl: Firebase SDK no detectado o sin conexión a internet. Operando en Modo Local Offline.');
      isConnected = false;
      return false;
    }

    const config = getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      console.info('ObraControl: Firebase no configurado aún. Operando en Modo Local.');
      isConnected = false;
      return false;
    }

    try {
      if (!firebase.apps.length) {
        app = firebase.initializeApp(config);
      } else {
        app = firebase.app();
      }

      auth = firebase.auth();
      db = firebase.firestore();

      // Habilitar persistencia offline en Firestore si está soportada
      db.enablePersistence({ synchronizeTabs: true }).catch(err => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistencia de Firestore: Múltiples pestañas abiertas.');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistencia de Firestore no soportada por el navegador.');
        }
      });

      isConnected = true;
      console.log('✅ ObraControl conectado exitosamente a Firebase Firestore:', config.projectId);
      return true;
    } catch (err) {
      console.error('Error al inicializar Firebase:', err);
      isConnected = false;
      return false;
    }
  }

  // Probar conexión con credenciales dadas
  async function testConnection(testConfig) {
    if (typeof firebase === 'undefined') {
      return { success: false, message: 'El SDK de Firebase no está cargado. Verifique que cuenta con conexión a internet para conectar con los servidores de Google.' };
    }

    if (!testConfig.apiKey || !testConfig.projectId) {
      return { success: false, message: 'Debe ingresar al menos el "apiKey" y el "projectId" de su proyecto Firebase.' };
    }

    try {
      const testAppName = 'test-app-' + Date.now();
      const testApp = firebase.initializeApp(testConfig, testAppName);
      const testDb = testApp.firestore();

      // Intento de lectura simple de la colección 'materials' o 'metadata'
      await testDb.collection('metadata').limit(1).get();
      testApp.delete();

      return { success: true, message: `¡Conexión exitosa con el proyecto Firebase "${testConfig.projectId}"!` };
    } catch (err) {
      return { success: false, message: 'Error al conectar con Firebase: ' + (err.message || err.code || err) };
    }
  }

  // Sincronizar datos locales hacia Cloud Firestore
  async function uploadLocalToFirestore() {
    if (!isConnected || !db) {
      return { success: false, message: 'Firebase no está inicializado o no hay conexión con Firestore.' };
    }

    try {
      const batch = db.batch();

      // 1. Obras (projects)
      const projects = window.OC.storage.getProjects();
      projects.forEach(p => {
        const ref = db.collection('projects').doc(p.id);
        batch.set(ref, p, { merge: true });
      });

      // 2. Materiales (materials)
      const materials = window.OC.storage.getMaterials();
      materials.forEach(m => {
        const ref = db.collection('materials').doc(m.id);
        batch.set(ref, m, { merge: true });
      });

      // 3. Solicitudes (requests)
      const requests = window.OC.requests.getAllRequests();
      requests.forEach(r => {
        const ref = db.collection('requests').doc(r.id);
        batch.set(ref, r, { merge: true });
      });

      // 4. Vales de Salida (deliveryVouchers)
      const vouchers = window.OC.deliveries.getAllVouchers();
      vouchers.forEach(v => {
        const ref = db.collection('deliveryVouchers').doc(v.id);
        batch.set(ref, v, { merge: true });
      });

      await batch.commit();

      const user = window.OC.auth.getCurrentUser();
      window.OC.storage.logAction(user, 'FIREBASE_UPLOAD', `Se subieron a Firestore: ${requests.length} solicitudes y ${vouchers.length} vales.`);

      return { 
        success: true, 
        message: `Sincronización completada: ${projects.length} obras, ${materials.length} materiales, ${requests.length} solicitudes y ${vouchers.length} vales subidos a Cloud Firestore.` 
      };
    } catch (err) {
      console.error('Error al subir datos a Firestore:', err);
      return { success: false, message: 'Error al subir datos a Firestore: ' + err.message };
    }
  }

  // Descargar datos desde Cloud Firestore hacia LocalStorage
  async function downloadFirestoreToLocal() {
    if (!isConnected || !db) {
      return { success: false, message: 'Firebase no está inicializado o no hay conexión con Firestore.' };
    }

    try {
      // 1. Descargar Proyectos
      const projSnap = await db.collection('projects').get();
      if (!projSnap.empty) {
        const cloudProjects = projSnap.docs.map(d => d.data());
        window.OC.storage.saveProjects(cloudProjects);
      }

      // 2. Descargar Materiales
      const matSnap = await db.collection('materials').get();
      if (!matSnap.empty) {
        const cloudMaterials = matSnap.docs.map(d => d.data());
        window.OC.storage.saveMaterials(cloudMaterials);
      }

      // 3. Descargar Solicitudes
      const reqSnap = await db.collection('requests').get();
      if (!reqSnap.empty) {
        const cloudRequests = reqSnap.docs.map(d => d.data());
        window.OC.storage.saveRequests(cloudRequests);
      }

      // 4. Descargar Vales
      const vouSnap = await db.collection('deliveryVouchers').get();
      if (!vouSnap.empty) {
        const cloudVouchers = vouSnap.docs.map(d => d.data());
        window.OC.storage.saveVouchers(cloudVouchers);
      }

      const user = window.OC.auth.getCurrentUser();
      window.OC.storage.logAction(user, 'FIREBASE_DOWNLOAD', 'Se descargaron los datos más recientes desde Cloud Firestore a este dispositivo.');

      return { success: true, message: 'Datos descargados exitosamente desde Cloud Firestore.' };
    } catch (err) {
      console.error('Error al descargar de Firestore:', err);
      return { success: false, message: 'Error al descargar datos de Firestore: ' + err.message };
    }
  }

  // Activar escucha en tiempo real (Real-time listener) de solicitudes
  function startRealtimeSync(onUpdateCallback) {
    if (!isConnected || !db) return null;

    // Desuscribir escuchas anteriores si las hubiera
    stopRealtimeSync();

    const unsubscribe = db.collection('requests').onSnapshot(snapshot => {
      if (snapshot.metadata.hasPendingWrites) {
        // Cambios locales pendientes de confirmación en servidor
        return;
      }
      const cloudRequests = [];
      snapshot.forEach(doc => {
        cloudRequests.push(doc.data());
      });

      cloudRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      window.OC.storage.saveRequests(cloudRequests);
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(cloudRequests);
      }
    }, err => {
      console.warn('Error en listener de Firestore:', err);
    });

    activeListeners.push(unsubscribe);
    return unsubscribe;
  }

  function stopRealtimeSync() {
    activeListeners.forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
    activeListeners = [];
  }

  async function registerAccount(profile) {
    if (!isConnected || !auth || !db) {
      throw new Error('Firebase no está disponible. Verifique la conexión antes de crear una cuenta.');
    }

    const email = profile.email.trim().toLowerCase();
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
    const role = isSuperAdmin ? 'superadmin' : profile.role;
    if (!isSuperAdmin && !['admin', 'solicitante', 'aprobador'].includes(role)) {
      throw new Error('El rol seleccionado no se puede registrar.');
    }

    const credential = await auth.createUserWithEmailAndPassword(email, profile.password);
    const user = credential.user;
    const isPending = role === 'admin' || role === 'superadmin';
    try {
      await user.updateProfile({ displayName: profile.name.trim() });
      if (!isSuperAdmin) {
        const userProfile = {
          id: user.uid,
          name: profile.name.trim(),
          email: email,
          role: role,
          jobTitle: profile.jobTitle.trim(),
          phone: '',
          active: !isPending,
          status: isPending ? 'pending' : 'active',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('users').doc(user.uid).set(userProfile);
      }
      await user.sendEmailVerification();
      await auth.signOut();
    } catch (err) {
      console.error('Error al completar el registro:', err);
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error('No se pudo cerrar la sesión creada durante el registro:', signOutError);
      }
      throw new Error(`La cuenta se creó, pero no se pudo completar el registro o enviar el correo de verificación: ${err.message || err.code || 'error desconocido'}. Contacte al superadministrador.`);
    }

    return {
      role: role,
      pendingApproval: role === 'admin',
      message: `Se envió un correo de verificación a ${email}. Verifique su correo antes de iniciar sesión.${role === 'admin' ? ' Su solicitud de administrador también requiere aprobación del superadministrador.' : ''}`
    };
  }

  async function signIn(email, password) {
    if (!isConnected || !auth) {
      throw new Error('Firebase no está disponible. No se puede iniciar sesión sin conexión.');
    }

    const credential = await auth.signInWithEmailAndPassword(email.trim().toLowerCase(), password);
    if (!credential.user.emailVerified) {
      try {
        await credential.user.sendEmailVerification();
      } catch (err) {
        await auth.signOut();
        throw new Error(`No se pudo enviar el correo de verificación: ${err.message || err.code || 'error desconocido'}.`);
      }
      await auth.signOut();
      throw new Error('Debe verificar su correo electrónico antes de iniciar sesión. Enviamos un nuevo mensaje de verificación.');
    }
    try {
      return await loadUserProfile(credential.user);
    } catch (err) {
      await auth.signOut();
      throw err;
    }
  }

  async function loadUserProfile(firebaseUser) {
    if (!db) throw new Error('Firestore no está disponible.');

    const userRef = db.collection('users').doc(firebaseUser.uid);
    let snapshot = await userRef.get();
    const email = (firebaseUser.email || '').toLowerCase();

    if (email === SUPER_ADMIN_EMAIL && firebaseUser.emailVerified) {
      const profile = {
        id: firebaseUser.uid,
        name: snapshot.exists && snapshot.data().name
          ? snapshot.data().name
          : (firebaseUser.displayName || 'Superadministrador'),
        email: email,
        role: 'superadmin',
        jobTitle: 'Superadministrador',
        phone: '',
        active: true,
        status: 'active'
      };
      await userRef.set(profile, { merge: true });
      snapshot = await userRef.get();
    }

    if (!snapshot.exists) {
      throw new Error('No se encontró el perfil de esta cuenta. Vuelva a registrarse o contacte al superadministrador.');
    }

    const profile = snapshot.data();
    if (!profile.active || profile.status !== 'active') {
      throw new Error(profile.status === 'pending'
        ? 'Su cuenta está pendiente de aprobación del superadministrador.'
        : 'Esta cuenta está desactivada. Contacte al superadministrador.');
    }

    return {
      id: firebaseUser.uid,
      name: profile.name,
      email: firebaseUser.email,
      role: profile.role,
      jobTitle: profile.jobTitle || '',
      phone: profile.phone || '',
      active: profile.active,
      status: profile.status
    };
  }

  async function restoreSession() {
    if (!isConnected || !auth) return null;
    const user = await new Promise((resolve, reject) => {
      let unsubscribe = () => {};
      unsubscribe = auth.onAuthStateChanged(
        firebaseUser => {
          unsubscribe();
          resolve(firebaseUser);
        },
        err => {
          unsubscribe();
          reject(err);
        }
      );
    });
    if (!user) return null;
    if (!user.emailVerified) {
      await auth.signOut();
      return null;
    }
    try {
      return await loadUserProfile(user);
    } catch (err) {
      await auth.signOut();
      throw err;
    }
  }

  async function signOut() {
    if (auth) await auth.signOut();
  }

  async function getManagedUsers() {
    if (!db) throw new Error('Firestore no está disponible.');
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function setUserActive(userId, active) {
    if (!db) throw new Error('Firestore no está disponible.');
    await db.collection('users').doc(userId).update({
      active: active,
      status: active ? 'active' : 'inactive'
    });
  }

  async function setUserRole(userId, role, currentlyActive) {
    if (!db) throw new Error('Firestore no está disponible.');
    if (!['admin', 'solicitante', 'aprobador', 'almacenero'].includes(role)) {
      throw new Error('El rol seleccionado no es válido.');
    }
    const active = role === 'admin' ? currentlyActive : true;
    await db.collection('users').doc(userId).update({
      role: role,
      active: active,
      status: active ? 'active' : 'pending'
    });
  }

  async function deleteRequestAndVouchers(request) {
    if (!isConnected || !db) {
      throw new Error('Firebase no está conectado; no se puede eliminar la solicitud compartida.');
    }
    if (!window.OC.auth.isSuperAdmin()) {
      throw new Error('Solo el superadministrador puede eliminar solicitudes.');
    }

    const user = window.OC.auth.getCurrentUser();
    const vouchersSnapshot = await db.collection('deliveryVouchers')
      .where('requestId', '==', request.id)
      .get();
    const voucherRefs = vouchersSnapshot.docs.map(doc => doc.ref);
    const auditRef = db.collection('auditLogs').doc();
    const auditEntry = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'ELIMINAR_SOLICITUD',
      details: `Eliminó la solicitud ${request.code || request.id} de ${request.projectName || 'obra sin nombre'} y ${voucherRefs.length} vale(s) vinculado(s).`,
      requestId: request.id,
      requestCode: request.code || request.id,
      projectName: request.projectName || '',
      deletedVoucherCount: voucherRefs.length,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      dateFormatted: new Date().toLocaleString('es-PE')
    };

    try {
      for (let offset = 0; offset < voucherRefs.length; offset += 499) {
        const batch = db.batch();
        voucherRefs.slice(offset, offset + 499).forEach(ref => batch.delete(ref));
        await batch.commit();
      }

      const finalBatch = db.batch();
      finalBatch.delete(db.collection('requests').doc(request.id));
      finalBatch.set(auditRef, auditEntry);
      await finalBatch.commit();
    } catch (err) {
      console.error('Error al eliminar solicitud y vales en Firestore:', err);
      throw new Error(`No se pudo completar la eliminación en Firestore: ${err.message || err.code || 'error desconocido'}`);
    }

    const remainingRequests = window.OC.storage.getRequests().filter(item => item.id !== request.id);
    const remainingVouchers = window.OC.storage.getVouchers().filter(item => item.requestId !== request.id);
    if (!window.OC.storage.saveRequests(remainingRequests) || !window.OC.storage.saveVouchers(remainingVouchers)) {
      throw new Error('La solicitud se eliminó de Firestore, pero no se pudo actualizar el almacenamiento local. Recargue la aplicación.');
    }
    window.OC.storage.logAction(user, 'ELIMINAR_SOLICITUD', auditEntry.details);
    return { deletedVouchers: voucherRefs.length };
  }

  // Inicializar al cargar
  initFirebase();

  // Exponer API de Firebase
  window.OC.firebase = {
    initFirebase: initFirebase,
    isConnected: () => isConnected,
    getSavedConfig: getSavedFirebaseConfig,
    saveConfig: saveFirebaseConfig,
    isFirebaseEnabled: isFirebaseEnabled,
    setFirebaseEnabled: setFirebaseEnabled,
    testConnection: testConnection,
    uploadLocalToFirestore: uploadLocalToFirestore,
    downloadFirestoreToLocal: downloadFirestoreToLocal,
    startRealtimeSync: startRealtimeSync,
    stopRealtimeSync: stopRealtimeSync,
    registerAccount: registerAccount,
    signIn: signIn,
    loadUserProfile: loadUserProfile,
    restoreSession: restoreSession,
    signOut: signOut,
    getManagedUsers: getManagedUsers,
    setUserActive: setUserActive,
    setUserRole: setUserRole,
    deleteRequestAndVouchers: deleteRequestAndVouchers,
    superAdminEmail: SUPER_ADMIN_EMAIL,
    getDb: () => db,
    getAuth: () => auth
  };

})();
