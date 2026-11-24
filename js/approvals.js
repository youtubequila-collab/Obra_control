/**
 * ObraControl - approvals.js
 * Módulo para revisión, aprobación y rechazo de solicitudes por el Ingeniero Residente.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  function getPendingApprovals() {
    const list = window.OC.requests.getAllRequests();
    return list.filter(r => r.status === window.OC.requests.STATUS.PENDIENTE_APROBACION);
  }

  function approveRequest(requestId, approvedItemsMap, notes) {
    let user = window.OC.auth.getCurrentUser();
    if (!user) {
      user = window.OC.auth.loginDemo('aprobador');
    }

    if (!window.OC.auth.hasPermission('approve_request')) {
      if (!window.OC.firebase || !window.OC.firebase.isConnected()) {
        user = window.OC.auth.switchRole('aprobador');
      } else {
        return { success: false, message: 'No tiene permisos para aprobar solicitudes. Solo Ingeniero Residente o Administrador.' };
      }
    }

    const requests = window.OC.requests.getAllRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Solicitud no encontrada.' };

    if (req.status !== window.OC.requests.STATUS.PENDIENTE_APROBACION) {
      return { success: false, message: `La solicitud ya no está pendiente de aprobación (Estado: ${window.OC.requests.getStatusLabel(req.status)}).` };
    }

    // Actualizar cantidades aprobadas por ítem y reintegrar a almacén cualquier diferencia no aprobada
    let totalApprovedCount = 0;
    const materialsCatalog = window.OC.storage.getMaterials();
    let stockReintegrated = false;

    req.items.forEach((item, index) => {
      // Si se especificó una cantidad aprobada personalizada, se usa; de lo contrario se aprueba lo solicitado
      let appQty = item.requested;
      if (approvedItemsMap && approvedItemsMap[item.materialId] !== undefined) {
        appQty = parseFloat(approvedItemsMap[item.materialId]);
        if (isNaN(appQty) || appQty < 0) appQty = 0;
        if (appQty > item.requested) appQty = item.requested; // No se puede aprobar más de lo solicitado
      }

      // Si se aprueba menos de lo solicitado, la diferencia se reintegra al almacén
      const rejectedDiff = item.requested - appQty;
      if (rejectedDiff > 0) {
        const mat = materialsCatalog.find(m => m.id === item.materialId);
        if (mat) {
          mat.stock = (mat.stock || 0) + rejectedDiff;
          stockReintegrated = true;
        }
      }

      item.approved = appQty;
      item.delivered = 0; // Inicia en 0 entregado
      if (appQty > 0) totalApprovedCount++;
    });

    if (stockReintegrated) {
      window.OC.storage.saveMaterials(materialsCatalog);
    }

    if (totalApprovedCount === 0) {
      return { success: false, message: 'No puede aprobar una solicitud con 0 insumos aprobados en total. Si no procede, debe rechazarla.' };
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    req.status = window.OC.requests.STATUS.APROBADA;
    req.approvalData = {
      approvedBy: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      approvedAt: now.toISOString(),
      approvedDate: dateFormatted,
      notes: (notes || '').trim()
    };

    req.history.push({
      date: dateFormatted,
      user: user.name,
      action: 'APROBADA',
      note: notes ? `Aprobada. Observaciones: ${notes}` : 'Aprobada según especificaciones.'
    });

    window.OC.storage.saveRequests(requests);
    window.OC.storage.logAction(user, 'APROBAR_SOLICITUD', `Aprobó la solicitud ${req.code} para ${req.projectName}.`);

    // Sincronizar aprobación en Firestore si está conectado
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('requests').doc(req.id).set(req, { merge: true }).catch(err => {
          console.warn('Error al sincronizar aprobación con Firestore:', err);
        });
        if (stockReintegrated) {
          req.items.forEach(it => {
            const mat = materialsCatalog.find(m => m.id === it.materialId);
            if (mat) {
              db.collection('materials').doc(mat.id).set({ stock: mat.stock }, { merge: true }).catch(err => {
                console.warn('Error al actualizar stock reintegrado en Firestore:', err);
              });
            }
          });
        }
      }
    }

    return { success: true, message: `Solicitud ${req.code} aprobada correctamente y enviada al Almacén.` };
  }

  function rejectRequest(requestId, reason) {
    const user = window.OC.auth.getCurrentUser();
    if (!user) return { success: false, message: 'Sesión no válida.' };

    if (!window.OC.auth.hasPermission('approve_request')) {
      return { success: false, message: 'No tiene permisos para rechazar solicitudes.' };
    }

    if (!reason || reason.trim().length < 8) {
      return { success: false, message: 'El motivo del rechazo es obligatorio y debe ser explicativo (mínimo 8 caracteres).' };
    }

    const requests = window.OC.requests.getAllRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Solicitud no encontrada.' };

    if (req.status !== window.OC.requests.STATUS.PENDIENTE_APROBACION) {
      return { success: false, message: `La solicitud ya no está pendiente de aprobación (Estado: ${window.OC.requests.getStatusLabel(req.status)}).` };
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    req.status = window.OC.requests.STATUS.RECHAZADA;
    req.approvalData = {
      approvedBy: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      approvedAt: now.toISOString(),
      approvedDate: dateFormatted,
      rejectionReason: reason.trim()
    };

    // Al rechazar, reintegrar los insumos al saldo del almacén
    const materialsCatalog = window.OC.storage.getMaterials();
    req.items.forEach(it => {
      const mat = materialsCatalog.find(m => m.id === it.materialId);
      if (mat) {
        mat.stock = (mat.stock || 0) + (it.requested || 0);
      }
      it.approved = 0;
      it.delivered = 0;
    });
    window.OC.storage.saveMaterials(materialsCatalog);

    req.history.push({
      date: dateFormatted,
      user: user.name,
      action: 'RECHAZADA',
      note: `Motivo del rechazo: ${reason.trim()}. Insumos reintegrados al saldo de almacén.`
    });

    window.OC.storage.saveRequests(requests);
    window.OC.storage.logAction(user, 'RECHAZAR_SOLICITUD', `Rechazó la solicitud ${req.code}. Motivo: ${reason.trim()}. Se reintegró el stock a almacén.`);

    // Sincronizar rechazo y stock en Firestore si está conectado
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('requests').doc(req.id).set(req, { merge: true }).catch(err => {
          console.warn('Error al sincronizar rechazo con Firestore:', err);
        });
        req.items.forEach(it => {
          const mat = materialsCatalog.find(m => m.id === it.materialId);
          if (mat) {
            db.collection('materials').doc(mat.id).set({ stock: mat.stock }, { merge: true }).catch(err => {
              console.warn('Error al actualizar stock reintegrado en Firestore:', err);
            });
          }
        });
      }
    }

    return { success: true, message: `Solicitud ${req.code} rechazada.` };
  }

  window.OC.approvals = {
    getPendingApprovals: getPendingApprovals,
    approveRequest: approveRequest,
    rejectRequest: rejectRequest
  };
})();
