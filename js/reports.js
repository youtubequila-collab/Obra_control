/**
 * ObraControl - reports.js
 * Módulo de reportería, filtros avanzados, exportación a CSV e impresión.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  function calculateKPIs() {
    const requests = window.OC.requests.getAllRequests();
    const vouchers = window.OC.deliveries.getAllVouchers();

    const kpis = {
      total: requests.length,
      pendingApproval: 0,
      approved: 0,
      partialDelivery: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
      vouchersCount: vouchers.length
    };

    requests.forEach(r => {
      switch (r.status) {
        case window.OC.requests.STATUS.PENDIENTE_APROBACION:
          kpis.pendingApproval++;
          break;
        case window.OC.requests.STATUS.APROBADA:
        case window.OC.requests.STATUS.PENDIENTE_ENTREGA:
          kpis.approved++;
          break;
        case window.OC.requests.STATUS.ENTREGA_PARCIAL:
          kpis.partialDelivery++;
          break;
        case window.OC.requests.STATUS.ENTREGADA:
          kpis.delivered++;
          break;
        case window.OC.requests.STATUS.RECHAZADA:
          kpis.rejected++;
          break;
        case window.OC.requests.STATUS.CANCELADA:
          kpis.cancelled++;
          break;
      }
    });

    return kpis;
  }

  function filterRequests(filters) {
    const requests = window.OC.requests.getAllRequests();

    return requests.filter(r => {
      // Filtro por obra
      if (filters.projectId && filters.projectId !== 'ALL' && r.projectId !== filters.projectId) {
        return false;
      }

      // Filtro por estado
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) {
        return false;
      }

      // Filtro por solicitante
      if (filters.requester && filters.requester.trim()) {
        const query = filters.requester.toLowerCase();
        const reqName = r.createdBy ? r.createdBy.name.toLowerCase() : '';
        if (!reqName.includes(query)) return false;
      }

      // Filtro por rango de fechas (createdAt: YYYY-MM-DD...)
      const reqDateStr = r.createdAt ? r.createdAt.slice(0, 10) : '';
      if (filters.dateFrom && reqDateStr < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && reqDateStr > filters.dateTo) {
        return false;
      }

      // Filtro por material incluido
      if (filters.materialKeyword && filters.materialKeyword.trim()) {
        const matQuery = filters.materialKeyword.toLowerCase();
        const hasMat = (r.items || []).some(it => 
          it.materialName.toLowerCase().includes(matQuery) || 
          it.materialCode.toLowerCase().includes(matQuery)
        );
        if (!hasMat) return false;
      }

      return true;
    });
  }

  // Exportar datos filtrados a formato CSV (con BOM UTF-8 para compatibilidad perfecta con Excel en Windows)
  function exportRequestsToCSV(filteredList) {
    if (!filteredList || !filteredList.length) {
      alert('No hay registros en el reporte actual para exportar.');
      return;
    }

    const headers = [
      'Código Solicitud',
      'Fecha Creación',
      'Fecha Requerida',
      'Obra',
      'Frente de Trabajo',
      'Solicitante',
      'Estado',
      'Importe Soles (PEN)',
      'Importe Dólares (USD)',
      'Aprobado Por',
      'Fecha Aprobación',
      'Motivo Rechazo',
      'Materiales (Resumen)',
      'Total Ítems'
    ];

    const rows = filteredList.map(r => {
      const itemsSummary = (r.items || []).map(it => 
        `${it.materialCode} (${it.requested} ${it.unit} solicitados, ${it.delivered || 0} entregados - P.U: S/ ${(it.pricePEN || 0).toFixed(2)})`
      ).join(' | ');

      const approvedBy = r.approvalData && r.approvalData.approvedBy ? r.approvalData.approvedBy.name : '';
      const approvedDate = r.approvalData && r.approvalData.approvedDate ? r.approvalData.approvedDate : '';
      const rejectReason = r.approvalData && r.approvalData.rejectionReason ? r.approvalData.rejectionReason : '';

      return [
        r.code,
        r.createdDate || r.createdAt,
        r.requiredDate,
        r.projectName,
        r.workFront,
        r.createdBy ? r.createdBy.name : '',
        window.OC.requests.getStatusLabel(r.status),
        (r.totalPEN || 0).toFixed(2),
        (r.totalUSD || 0).toFixed(2),
        approvedBy,
        approvedDate,
        rejectReason,
        itemsSummary,
        (r.items || []).length
      ].map(field => {
        // Escapar comillas dobles y encerrar en comillas
        const safe = String(field || '').replace(/"/g, '""');
        return `"${safe}"`;
      }).join(';');
    });

    const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Reporte_ObraControl_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generador de vista imprimible del reporte
  function renderReportPrintHTML(filteredList, filters) {
    const rows = filteredList.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><strong>${r.code}</strong></td>
        <td>${r.createdDate}</td>
        <td>${r.projectName}<br><small style="color: #64748b;">${r.workFront}</small></td>
        <td>${r.createdBy ? r.createdBy.name : 'N/A'}</td>
        <td style="text-align: center;">${window.OC.requests.getStatusLabel(r.status)}</td>
        <td style="text-align: right; font-weight: bold; color: #065f46;">
          S/ ${(r.totalPEN || 0).toFixed(2)}<br>
          <small style="color: #2563eb;">$ ${(r.totalUSD || 0).toFixed(2)}</small>
        </td>
        <td>${(r.items || []).map(it => `${it.materialName}: <strong>${it.delivered || 0}/${it.approved || it.requested} ${it.unit}</strong>`).join('<br>')}</td>
      </tr>
    `).join('');

    return `
      <div class="print-report-container">
        <div class="report-header">
          <h2>🏗️ ObraControl - Informe General de Solicitudes y Vales</h2>
          <p>Generado el: ${new Date().toLocaleString('es-PE')}</p>
        </div>
        <table class="report-print-table">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Código</th>
              <th>Fecha</th>
              <th>Obra / Frente</th>
              <th>Solicitante</th>
              <th>Estado</th>
              <th>Importe (S/ y $)</th>
              <th>Detalle de Insumos (Entregado / Aprobado)</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="8" style="text-align: center;">No se encontraron registros con los filtros seleccionados.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  window.OC.reports = {
    calculateKPIs: calculateKPIs,
    filterRequests: filterRequests,
    exportRequestsToCSV: exportRequestsToCSV,
    renderReportPrintHTML: renderReportPrintHTML
  };
})();
