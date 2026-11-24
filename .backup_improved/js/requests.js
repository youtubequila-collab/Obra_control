/**
 * ObraControl - requests.js
 * Lógica para la creación, consulta y ciclo de vida de solicitudes de insumos.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  const STATUS = {
    PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
    APROBADA: 'APROBADA',
    RECHAZADA: 'RECHAZADA',
    PENDIENTE_ENTREGA: 'PENDIENTE_ENTREGA',
    ENTREGA_PARCIAL: 'ENTREGA_PARCIAL',
    ENTREGADA: 'ENTREGADA',
    CANCELADA: 'CANCELADA'
  };

  function getStatusLabel(status, short = false) {
    if (short) {
      switch (status) {
        case STATUS.PENDIENTE_APROBACION: return 'Esperando';
        case STATUS.APROBADA: return 'Aprobado';
        case STATUS.RECHAZADA: return 'Rechazado';
        case STATUS.PENDIENTE_ENTREGA: return 'Por entregar';
        case STATUS.ENTREGA_PARCIAL: return 'Incompleto';
        case STATUS.ENTREGADA: return 'Entregado';
        case STATUS.CANCELADA: return 'Cancelado';
        default: return status || 'Desconocido';
      }
    }
    switch (status) {
      case STATUS.PENDIENTE_APROBACION: return 'Esperando aprobación';
      case STATUS.APROBADA: return 'Aprobado';
      case STATUS.RECHAZADA: return 'Rechazado';
      case STATUS.PENDIENTE_ENTREGA: return 'Listo para entrega';
      case STATUS.ENTREGA_PARCIAL: return 'Entrega incompleta';
      case STATUS.ENTREGADA: return 'Entregado';
      case STATUS.CANCELADA: return 'Cancelado';
      default: return status || 'Desconocido';
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case STATUS.PENDIENTE_APROBACION: return 'badge-status-pending';
      case STATUS.APROBADA: return 'badge-status-approved';
      case STATUS.RECHAZADA: return 'badge-status-rejected';
      case STATUS.PENDIENTE_ENTREGA: return 'badge-status-ready';
      case STATUS.ENTREGA_PARCIAL: return 'badge-status-partial';
      case STATUS.ENTREGADA: return 'badge-status-delivered';
      case STATUS.CANCELADA: return 'badge-status-cancelled';
      default: return 'badge-secondary';
    }
  }

  function getAllRequests() {
    return window.OC.storage.getRequests();
  }

  function getRequestById(id) {
    const list = getAllRequests();
    return list.find(r => r.id === id) || null;
  }

  function createRequest(formData) {
    const user = window.OC.auth.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Debe iniciar sesión para crear un pedido.' };
    }

    // Validaciones obligatorias con orientación clara
    if (!formData.projectId) {
      return { success: false, message: 'Por favor selecciona la obra donde se utilizarán los materiales.' };
    }
    if (!formData.workFront || !formData.workFront.trim()) {
      return { success: false, message: 'Por favor indica el frente o sector de trabajo específico.' };
    }
    if (!formData.requiredDate) {
      return { success: false, message: 'Por favor indica la fecha en que necesitas los materiales en obra.' };
    }
    if (!formData.justification || formData.justification.trim().length < 10) {
      return { success: false, message: 'Por favor escribe al menos 10 letras en el sustento explicando para qué actividad se usarán los materiales.' };
    }
    if (!formData.items || !formData.items.length) {
      return { success: false, message: 'Agrega al menos un material a tu pedido antes de enviarlo.' };
    }

    // Validar cada material agregado y disponibilidad de saldo en almacén
    const validatedItems = [];
    const materialsCatalog = window.OC.storage.getMaterials();

    for (let i = 0; i < formData.items.length; i++) {
      const it = formData.items[i];
      const qty = parseFloat(it.quantity);

      if (isNaN(qty) || qty <= 0) {
        return { success: false, message: `La cantidad para el material en la fila #${i + 1} debe ser mayor a 0.` };
      }

      const mat = materialsCatalog.find(m => m.id === it.materialId);
      if (!mat) {
        return { success: false, message: `El material seleccionado en la fila #${i + 1} no existe en el catálogo.` };
      }

      const currentStock = typeof mat.stock === 'number' ? mat.stock : 0;
      if (qty > currentStock) {
        return { 
          success: false, 
          message: `Stock insuficiente en almacén para "${mat.name}". Saldo disponible: ${currentStock.toLocaleString('es-PE')} ${mat.unit}. No puede solicitar ${qty.toLocaleString('es-PE')} ${mat.unit}.` 
        };
      }

      const pricePEN = typeof mat.pricePEN === 'number' ? mat.pricePEN : 0;
      const priceUSD = typeof mat.priceUSD === 'number' ? mat.priceUSD : parseFloat((pricePEN / 3.75).toFixed(2));
      const subtotalPEN = parseFloat((qty * pricePEN).toFixed(2));
      const subtotalUSD = parseFloat((qty * priceUSD).toFixed(2));

      validatedItems.push({
        materialId: mat.id,
        materialCode: mat.code,
        materialName: mat.name,
        unit: mat.unit,
        requested: qty,
        approved: 0,
        delivered: 0,
        pricePEN: pricePEN,
        priceUSD: priceUSD,
        subtotalPEN: subtotalPEN,
        subtotalUSD: subtotalUSD
      });
    }

    // Descontar inmediatamente las cantidades solicitadas del saldo de almacén
    const updatedMaterials = materialsCatalog.map(m => {
      const reqItem = validatedItems.find(v => v.materialId === m.id);
      if (reqItem) {
        return { ...m, stock: Math.max(0, (m.stock || 0) - reqItem.requested) };
      }
      return m;
    });
    window.OC.storage.saveMaterials(updatedMaterials);

    const totalPEN = parseFloat(validatedItems.reduce((acc, it) => acc + (it.subtotalPEN || 0), 0).toFixed(2));
    const totalUSD = parseFloat(validatedItems.reduce((acc, it) => acc + (it.subtotalUSD || 0), 0).toFixed(2));

    const projects = window.OC.storage.getProjects();
    const proj = projects.find(p => p.id === formData.projectId);
    const projectName = proj ? proj.name : 'Obra no identificada';

    const requests = getAllRequests();
    const requestCode = window.OC.storage.generateCode('SOL', requests);
    const now = new Date();

    const newRequest = {
      id: 'REQ-' + Date.now(),
      code: requestCode,
      createdAt: now.toISOString(),
      createdDate: now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      requiredDate: formData.requiredDate,
      createdBy: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      projectId: formData.projectId,
      projectName: projectName,
      workFront: formData.workFront.trim(),
      justification: formData.justification.trim(),
      observations: (formData.observations || '').trim(),
      status: STATUS.PENDIENTE_APROBACION,
      approvalData: null,
      items: validatedItems,
      totalPEN: totalPEN,
      totalUSD: totalUSD,
      history: [
        {
          date: now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          user: user.name,
          action: 'CREADA',
          note: `Solicitud creada con ${validatedItems.length} material(es). Saldo descontado de almacén (Total: S/ ${totalPEN.toFixed(2)} | $ ${totalUSD.toFixed(2)}).`
        }
      ]
    };

    requests.unshift(newRequest);
    window.OC.storage.saveRequests(requests);
    window.OC.storage.logAction(user, 'CREAR_SOLICITUD', `Creó la solicitud ${requestCode} para la obra "${projectName}". Insumos descontados de almacén (Total: S/ ${totalPEN.toFixed(2)} / $ ${totalUSD.toFixed(2)}).`);

    // Sincronización automática con Firebase Firestore si está conectado
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('requests').doc(newRequest.id).set(newRequest).catch(err => {
          console.warn('Error al sincronizar solicitud con Firestore:', err);
        });
        // Sincronizar stock de materiales en Firestore
        validatedItems.forEach(v => {
          const mat = updatedMaterials.find(m => m.id === v.materialId);
          if (mat) {
            db.collection('materials').doc(mat.id).set({ stock: mat.stock }, { merge: true }).catch(err => {
              console.warn('Error al actualizar stock de material en Firestore:', err);
            });
          }
        });
      }
    }

    return { success: true, request: newRequest };
  }

  function cancelRequest(requestId, reason) {
    const user = window.OC.auth.getCurrentUser();
    if (!user) return { success: false, message: 'Sesión no válida.' };

    const requests = getAllRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Solicitud no encontrada.' };

    // Regla: Solo se puede cancelar si está pendiente de aprobación
    if (req.status !== STATUS.PENDIENTE_APROBACION) {
      return { success: false, message: `No se puede cancelar una solicitud en estado: ${getStatusLabel(req.status)}.` };
    }

    // Solo el solicitante que la creó o el administrador pueden cancelar
    if (user.role !== 'admin' && !window.OC.auth.isSuperAdmin(user) && req.createdBy.id !== user.id) {
      return { success: false, message: 'Solo el solicitante creador o el Administrador pueden cancelar esta solicitud.' };
    }

    req.status = STATUS.CANCELADA;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Reintegrar los insumos al saldo del almacén
    const materialsCatalog = window.OC.storage.getMaterials();
    (req.items || []).forEach(it => {
      const mat = materialsCatalog.find(m => m.id === it.materialId);
      if (mat) {
        mat.stock = (mat.stock || 0) + (it.requested || 0);
      }
    });
    window.OC.storage.saveMaterials(materialsCatalog);

    req.history.push({
      date: dateFormatted,
      user: user.name,
      action: 'CANCELADA',
      note: reason ? `Motivo: ${reason}. Materiales reintegrados al saldo de almacén.` : 'Cancelada por el usuario. Materiales reintegrados al saldo de almacén.'
    });

    window.OC.storage.saveRequests(requests);
    window.OC.storage.logAction(user, 'CANCELAR_SOLICITUD', `Canceló la solicitud ${req.code}. Motivo: ${reason || 'Sin motivo'}. Se reintegró el stock a almacén.`);

    // Sincronizar cancelación en Firestore si está conectado
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('requests').doc(req.id).set(req, { merge: true }).catch(err => {
          console.warn('Error al sincronizar cancelación con Firestore:', err);
        });
        (req.items || []).forEach(it => {
          const mat = materialsCatalog.find(m => m.id === it.materialId);
          if (mat) {
            db.collection('materials').doc(mat.id).set({ stock: mat.stock }, { merge: true }).catch(err => {
              console.warn('Error al reintegrar stock en Firestore:', err);
            });
          }
        });
      }
    }

    return { success: true, message: 'Solicitud cancelada correctamente.' };
  }

  window.OC.requests = {
    STATUS: STATUS,
    getStatusLabel: getStatusLabel,
    getStatusBadgeClass: getStatusBadgeClass,
    getAllRequests: getAllRequests,
    getRequestById: getRequestById,
    createRequest: createRequest,
    cancelRequest: cancelRequest
  };
})();
