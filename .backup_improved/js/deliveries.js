/**
 * ObraControl - deliveries.js
 * Módulo para control de entregas por el almacenero, cálculo de saldos y emisión de vales de salida.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  function getPendingDeliveries() {
    const list = window.OC.requests.getAllRequests();
    return list.filter(r => 
      r.status === window.OC.requests.STATUS.APROBADA ||
      r.status === window.OC.requests.STATUS.PENDIENTE_ENTREGA ||
      r.status === window.OC.requests.STATUS.ENTREGA_PARCIAL
    );
  }

  function getAllVouchers() {
    return window.OC.storage.getVouchers();
  }

  function getVoucherById(id) {
    const list = getAllVouchers();
    return list.find(v => v.id === id || v.voucherNumber === id) || null;
  }

  function registerDelivery(requestId, deliveryItemsMap, receiverName, notes) {
    const user = window.OC.auth.getCurrentUser();
    if (!user) return { success: false, message: 'Sesión no válida.' };

    if (!window.OC.auth.hasPermission('deliver_materials')) {
      return { success: false, message: 'No tiene permisos para registrar entregas de almacén.' };
    }

    if (!receiverName || receiverName.trim().length < 3) {
      return { success: false, message: 'Por favor ingresa el nombre de la persona o cuadrilla que recibe los materiales en obra.' };
    }

    const requests = window.OC.requests.getAllRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Pedido no encontrado.' };

    // Validar estado válido para despacho
    const validStatuses = [
      window.OC.requests.STATUS.APROBADA,
      window.OC.requests.STATUS.PENDIENTE_ENTREGA,
      window.OC.requests.STATUS.ENTREGA_PARCIAL
    ];
    if (!validStatuses.includes(req.status)) {
      return { success: false, message: `El pedido no está disponible para entrega (Estado: ${window.OC.requests.getStatusLabel(req.status)}).` };
    }

    let itemsDeliveredCount = 0;
    const voucherItems = [];

    // Validar cantidades de entrega contra el saldo pendiente
    for (let i = 0; i < req.items.length; i++) {
      const it = req.items[i];
      const approved = it.approved || 0;
      const previouslyDelivered = it.delivered || 0;
      const pendingBalance = Math.max(0, approved - previouslyDelivered);

      let deliverNow = 0;
      if (deliveryItemsMap && deliveryItemsMap[it.materialId] !== undefined) {
        deliverNow = parseFloat(deliveryItemsMap[it.materialId]);
        if (isNaN(deliverNow) || deliverNow < 0) deliverNow = 0;
      }

      if (deliverNow > pendingBalance) {
        return { 
          success: false, 
          message: `Error en ${it.materialName}: No puedes entregar ${deliverNow} ${it.unit}. El saldo pendiente es de solo ${pendingBalance} ${it.unit}.` 
        };
      }

      if (deliverNow > 0) {
        itemsDeliveredCount++;
      }

      const newRemaining = pendingBalance - deliverNow;

      voucherItems.push({
        materialId: it.materialId,
        materialCode: it.materialCode,
        materialName: it.materialName,
        unit: it.unit,
        requested: it.requested,
        approved: approved,
        previouslyDelivered: previouslyDelivered,
        deliveredNow: deliverNow,
        remainingBalance: newRemaining
      });
    }

    if (itemsDeliveredCount === 0) {
      return { success: false, message: 'Indica una cantidad mayor a 0 para al menos un material que vayas a entregar.' };
    }

    // Aplicar los cambios en los ítems de la solicitud
    let allCompleted = true;
    for (let i = 0; i < req.items.length; i++) {
      const it = req.items[i];
      const vItem = voucherItems.find(v => v.materialId === it.materialId);
      if (vItem) {
        it.delivered = (it.delivered || 0) + vItem.deliveredNow;
        if (it.delivered < (it.approved || 0)) {
          allCompleted = false;
        }
      }
    }

    // Actualizar estado de la solicitud
    req.status = allCompleted ? window.OC.requests.STATUS.ENTREGADA : window.OC.requests.STATUS.ENTREGA_PARCIAL;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Generar correlativo del Vale de Salida
    const vouchers = getAllVouchers();
    const voucherNumber = window.OC.storage.generateCode('VAL', vouchers);

    const newVoucher = {
      id: 'VOU-' + Date.now(),
      voucherNumber: voucherNumber,
      requestId: req.id,
      requestCode: req.code,
      projectName: req.projectName,
      workFront: req.workFront,
      requestedBy: req.createdBy ? req.createdBy.name : 'No registrado',
      deliveryDate: dateFormatted,
      warehouseResponsible: user.name,
      receiverName: receiverName.trim(),
      notes: (notes || '').trim(),
      isCompleteDelivery: allCompleted,
      items: voucherItems
    };

    vouchers.unshift(newVoucher);
    window.OC.storage.saveVouchers(vouchers);

    req.history.push({
      date: dateFormatted,
      user: user.name,
      action: allCompleted ? 'ENTREGA_TOTAL' : 'ENTREGA_PARCIAL',
      note: `Emisión del Vale de Salida ${voucherNumber}. Receptor: ${receiverName.trim()}. ${allCompleted ? 'Entrega completada.' : 'Queda saldo pendiente.'}`
    });

    window.OC.storage.saveRequests(requests);
    window.OC.storage.logAction(user, 'EMITIR_VALE_SALIDA', `Emitió el vale ${voucherNumber} para la solicitud ${req.code}. Receptor: ${receiverName.trim()}`);

    // Sincronizar en Firestore (Solicitud y Vale de Salida)
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('requests').doc(req.id).set(req, { merge: true }).catch(err => {
          console.warn('Error al sincronizar solicitud en Firestore:', err);
        });
        db.collection('deliveryVouchers').doc(newVoucher.id).set(newVoucher).catch(err => {
          console.warn('Error al sincronizar vale en Firestore:', err);
        });
      }
    }

    return { success: true, voucher: newVoucher, request: req };
  }

  // Generador de HTML para vista previa e impresión de Vale
  function renderVoucherHTML(voucher) {
    if (!voucher) return '<p>Vale no encontrado.</p>';

    const itemsRows = voucher.items.map((it, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${it.materialCode}</strong></td>
        <td>${it.materialName}</td>
        <td style="text-align: center;">${it.unit}</td>
        <td style="text-align: right;">${it.approved}</td>
        <td style="text-align: right; font-weight: bold; color: #166534; background: #f0fdf4;">${it.deliveredNow}</td>
        <td style="text-align: right; color: ${it.remainingBalance > 0 ? '#b45309' : '#64748b'};">${it.remainingBalance}</td>
      </tr>
    `).join('');

    return `
      <div class="voucher-document">
        <div class="voucher-header">
          <div class="voucher-logo-area">
            <h2>🏗️ ObraControl</h2>
            <p>Control y Gestión de Insumos de Obra</p>
          </div>
          <div class="voucher-number-box">
            <span class="voucher-tag">VALE DE SALIDA DE ALMACÉN</span>
            <div class="voucher-code">${voucher.voucherNumber}</div>
            <div class="voucher-date">Fecha/Hora: ${voucher.deliveryDate}</div>
          </div>
        </div>

        <div class="voucher-grid-info">
          <div><strong>Obra:</strong> ${voucher.projectName}</div>
          <div><strong>Frente de Trabajo:</strong> ${voucher.workFront}</div>
          <div><strong>Solicitud Asociada:</strong> ${voucher.requestCode}</div>
          <div><strong>Solicitante Original:</strong> ${voucher.requestedBy || 'N/A'}</div>
          <div><strong>Responsable de Almacén:</strong> ${voucher.warehouseResponsible}</div>
          <div><strong>Receptor (Entrega a):</strong> ${voucher.receiverName}</div>
        </div>

        ${voucher.notes ? `<div class="voucher-notes-box"><strong>Observaciones de Entrega:</strong> ${voucher.notes}</div>` : ''}

        <table class="voucher-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th>Cód. Material</th>
              <th>Descripción del Material</th>
              <th style="text-align: center;">Unidad</th>
              <th style="text-align: right;">Aprobado</th>
              <th style="text-align: right;">Entregado Ahora</th>
              <th style="text-align: right;">Saldo Pendiente</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="voucher-signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>${voucher.warehouseResponsible}</strong></p>
            <span>Despachado por (Almacén)</span>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>${voucher.receiverName}</strong></p>
            <span>Recibido Conforme (Cuadrilla / Maestro)</span>
          </div>
        </div>

        <div class="voucher-footer">
          <p>Documento generado por ObraControl. Válido como comprobante interno de control de materiales.</p>
        </div>
      </div>
    `;
  }

  window.OC.deliveries = {
    getPendingDeliveries: getPendingDeliveries,
    getAllVouchers: getAllVouchers,
    getVoucherById: getVoucherById,
    registerDelivery: registerDelivery,
    renderVoucherHTML: renderVoucherHTML
  };
})();
