/**
 * ObraControl - admin-panel.js
 * Portal de Análisis y Gestión — Acceso exclusivo para Administrador de Obra (role: 'admin').
 * El Superadministrador NO tiene acceso a este portal.
 *
 * Incluye mejora de errores: reemplaza alert() con showToast() y mensajes descriptivos.
 */
(function () {
  'use strict';
  window.OC = window.OC || {};

  // ============================================================
  // UTILIDADES DE UI
  // ============================================================

  /** Toast moderno en lugar de alert() */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content" style="display:flex;align-items:center;gap:0.6rem;">
        <span>${icons[type] || icons.info}</span>
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
    }, 5000);
  }

  /**
   * Muestra un cuadro de error visible en el DOM (alternativa accesible a alert).
   * @param {string} message - Texto del error
   * @param {string} containerId - ID del elemento donde insertar el error
   */
  function showInlineError(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const existing = container.querySelector('.inline-error-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = 'inline-error-banner';
    banner.style.cssText = `
      background:#fef2f2; border:1px solid #fca5a5; border-radius:8px;
      padding:0.85rem 1.1rem; margin-bottom:1rem; display:flex;
      align-items:center; gap:0.6rem; color:#991b1b; font-size:0.88rem; font-weight:600;
    `;
    banner.innerHTML = `<span>❌</span><span>${message}</span>`;
    container.prepend(banner);

    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 6000);
  }

  // ============================================================
  // VERIFICACIÓN DE ACCESO (Solo role === 'admin', no superadmin)
  // ============================================================

  function isAdminOnly(user) {
    if (!user) return false;
    // Solo el rol exacto 'admin' — superadmin está excluido explícitamente
    return user.role === 'admin';
  }

  // ============================================================
  // INDICADOR DE CLOUD STATUS
  // ============================================================

  function updateCloudStatus() {
    const dot = document.getElementById('admin-cloud-dot');
    const txt = document.getElementById('admin-cloud-text');
    if (!dot || !txt) return;
    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      dot.style.backgroundColor = '#10b981';
      txt.textContent = 'Firebase Activo';
    } else {
      dot.style.backgroundColor = '#f59e0b';
      txt.textContent = 'Modo Local';
    }
  }

  // ============================================================
  // WIDGET DE PERFIL DEL ADMIN EN EL HEADER
  // ============================================================

  function renderAdminUserWidget(user) {
    const widget = document.getElementById('admin-user-widget');
    if (!widget || !user) return;

    widget.innerHTML = `
      <div class="admin-role-pill">🛡️ ${window.OC.auth.getRoleLabel(user.role)}</div>
      <div class="user-profile-widget" style="cursor:default;">
        <div class="user-profile-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
        <div class="user-profile-info">
          <span class="user-profile-name">${user.name}</span>
          <span class="user-profile-role">${user.email}</span>
        </div>
        <button class="btn-logout-icon" id="admin-btn-logout" title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
      <a href="index.html" class="btn-go-main">
        ← Panel Principal
      </a>
    `;

    document.getElementById('admin-btn-logout').addEventListener('click', async () => {
      try {
        await window.OC.auth.logout();
        showToast('Sesión cerrada correctamente.', 'info');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      } catch (err) {
        showToast(`Error al cerrar sesión: ${err.message || 'Error desconocido'}`, 'error');
      }
    });
  }

  // ============================================================
  // NAVEGACIÓN DE PANELES
  // ============================================================

  function setupNavTabs() {
    const tabs = document.querySelectorAll('#admin-nav-tabs .admin-nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Desactivar todos
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-view-panel').forEach(p => p.classList.remove('active'));

        // Activar el seleccionado
        tab.classList.add('active');
        const panelId = tab.getAttribute('data-panel');
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ============================================================
  // RENDERIZADO PRINCIPAL DEL PORTAL
  // ============================================================

  function renderAdminPortal(user) {
    const content = document.getElementById('admin-main-content');
    if (!content) return;

    const projects = window.OC.storage.getProjects();
    const materials = window.OC.storage.getMaterials();
    const auditLogs = window.OC.storage.getAuditLogs();
    const users = window.OC.storage.getUsers();
    const requests = window.OC.requests.getAllRequests();
    const vouchers = window.OC.deliveries.getAllVouchers();
    const kpis = window.OC.reports.calculateKPIs();

    const todayDate = new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // SVG icons inline
    const ICONS = {
      download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
      check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      requests: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    };

    content.innerHTML = `
      <!-- BANNER DE BIENVENIDA -->
      <div class="admin-welcome-banner">
        <div>
          <h2>Portal de Análisis y Gestión</h2>
          <p>📅 ${todayDate.charAt(0).toUpperCase() + todayDate.slice(1)} • Administrador: <strong>${user.name}</strong></p>
        </div>
        <a href="index.html" class="btn-go-main">
          ← Volver al Panel Principal
        </a>
      </div>

      <!-- PANEL 1: REPORTES E INDICADORES -->
      <div class="admin-view-panel active" id="panel-reports">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Reportes e Indicadores de Gestión</h2>
            <p class="subtitle">Consolidado de métricas operativas, consumo por obra y exportación de datos para administración.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" id="btn-admin-export-report">
              ${ICONS.download} Exportar a Excel (CSV)
            </button>
          </div>
        </div>

        <!-- KPI CARDS -->
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
              <span class="kpi-label">Vales Emitidos</span>
              <div class="kpi-value">${kpis.vouchersCount}</div>
              <span class="kpi-subtext">Despachos confirmados</span>
            </div>
          </div>
          <div class="kpi-card kpi-pending">
            <div class="kpi-content">
              <span class="kpi-label">Pendientes Aprobación</span>
              <div class="kpi-value">${kpis.pendingApproval}</div>
              <span class="kpi-subtext">Por revisar</span>
            </div>
          </div>
          <div class="kpi-card kpi-rejected">
            <div class="kpi-content">
              <span class="kpi-label">Rechazadas</span>
              <div class="kpi-value">${kpis.rejected}</div>
              <span class="kpi-subtext">Con sustento técnico</span>
            </div>
          </div>
          <div class="kpi-card kpi-partial">
            <div class="kpi-content">
              <span class="kpi-label">Entregas Parciales</span>
              <div class="kpi-value">${kpis.partialDelivery}</div>
              <span class="kpi-subtext">Con saldo pendiente</span>
            </div>
          </div>
          <div class="kpi-card" style="border-left: 3px solid #10b981;">
            <div class="kpi-content">
              <span class="kpi-label">Tasa de Aprobación</span>
              <div class="kpi-value">${kpis.total ? Math.round(((kpis.approved + kpis.delivered + kpis.partialDelivery) / kpis.total) * 100) : 0}%</div>
              <span class="kpi-subtext">Aprobadas por Residente</span>
            </div>
          </div>
        </div>

        <!-- TABLA POR OBRA -->
        <div class="card mb-4">
          <div class="card-header">
            <h3><span>🏢</span> Distribución de Consumo por Obra</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Obra</th>
                  <th>Ubicación</th>
                  <th>Solicitudes</th>
                  <th>Vales</th>
                  <th>Monto Total (S/)</th>
                </tr>
              </thead>
              <tbody>
                ${projects.map(p => {
                  const reqs = requests.filter(r => r.projectId === p.id);
                  const voucherCount = vouchers.filter(v => v.projectName === p.name).length;
                  const totalPEN = reqs.reduce((acc, r) => acc + (r.totalPEN || 0), 0);
                  return `
                    <tr>
                      <td><span class="cell-code">${p.code}</span></td>
                      <td><strong>${p.name}</strong></td>
                      <td>📍 ${p.location}</td>
                      <td><span class="badge badge-secondary">${reqs.length} pedidos</span></td>
                      <td><span class="badge badge-success">${voucherCount} vales</span></td>
                      <td><strong style="color:#047857;">S/ ${totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TABLA COMPLETA DE SOLICITUDES -->
        <div class="card">
          <div class="card-header">
            <h3><span>📋</span> Historial Completo de Solicitudes</h3>
            <button class="btn btn-xs btn-outline" id="btn-admin-export-reqs">
              ${ICONS.download} Exportar CSV
            </button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Obra / Frente</th>
                  <th>Solicitante</th>
                  <th>Ítems</th>
                  <th>Total (S/)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${requests.length === 0 ? `
                  <tr><td colspan="7" class="empty-table-box">
                    <div class="empty-table-icon">📄</div>
                    <div class="empty-table-title">Sin solicitudes registradas</div>
                  </td></tr>
                ` : requests.map(r => `
                  <tr>
                    <td><span class="cell-code">${r.code}</span></td>
                    <td style="font-size:0.8rem; color:#64748b;">${r.createdDate}</td>
                    <td>
                      <strong style="display:block; font-size:0.85rem;">${r.projectName}</strong>
                      <span style="font-size:0.75rem; color:#64748b;">📍 ${r.workFront}</span>
                    </td>
                    <td>${r.createdBy ? r.createdBy.name : 'N/A'}</td>
                    <td><span class="badge badge-secondary">${(r.items || []).length}</span></td>
                    <td><strong style="color:#047857;">S/ ${(r.totalPEN || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    <td>
                      <span class="badge ${window.OC.requests.getStatusBadgeClass(r.status)}">
                        <span class="badge-dot"></span>
                        ${window.OC.requests.getStatusLabel(r.status)}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PANEL 2: CATÁLOGO DE MATERIALES -->
      <div class="admin-view-panel" id="panel-materials">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Catálogo de Materiales</h2>
            <p class="subtitle">Control de saldos físicos, valorización y precios en soles y dólares.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" id="btn-admin-adjust-stock">📥 Ajustar Stock</button>
            <button class="btn btn-primary" id="btn-admin-add-mat">${ICONS.plus} Nuevo Material</button>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Saldo en Almacén</th>
                  <th>P. Unit. (S/)</th>
                  <th>P. Unit. ($)</th>
                  <th>Valor Total (S/)</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody id="admin-materials-tbody">
                ${renderMaterialsRows(materials)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PANEL 3: OBRAS Y FRENTES -->
      <div class="admin-view-panel" id="panel-projects">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Obras y Frentes de Trabajo</h2>
            <p class="subtitle">Gestión de proyectos activos, ubicaciones y frentes de trabajo asignados.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" id="btn-admin-add-project">${ICONS.plus} Nueva Obra</button>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre de la Obra</th>
                  <th>Ubicación</th>
                  <th>Frentes de Trabajo</th>
                  <th>Solicitudes</th>
                  <th>Vales</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${projects.length === 0 ? `
                  <tr><td colspan="7" class="empty-table-box">
                    <div class="empty-table-icon">🏢</div>
                    <div class="empty-table-title">No hay obras registradas</div>
                  </td></tr>
                ` : projects.map(p => {
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
      </div>

      <!-- PANEL 4: USUARIOS Y ROLES -->
      <div class="admin-view-panel" id="panel-users">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Usuarios y Roles del Sistema</h2>
            <p class="subtitle">Gestión de cuentas, perfiles y asignación de roles de acceso.</p>
          </div>
        </div>

        <div class="card">
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
                ${users.length === 0 ? `
                  <tr><td colspan="5" class="empty-table-box">
                    <div class="empty-table-icon">👥</div>
                    <div class="empty-table-title">No hay usuarios registrados</div>
                  </td></tr>
                ` : users.map(u => `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.jobTitle || 'N/A'}</td>
                    <td>
                      <span class="badge ${window.OC.auth.getRoleBadgeClass(u.role)}">
                        ${window.OC.auth.getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${u.active !== false ? 'badge-success' : 'badge-danger'}">
                        ${u.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PANEL 5: AUDITORÍA -->
      <div class="admin-view-panel" id="panel-audit">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Bitácora de Auditoría Operativa</h2>
            <p class="subtitle">Registro histórico de todas las acciones realizadas en el sistema con trazabilidad completa.</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" id="btn-admin-clear-audit">🗑️ Limpiar Bitácora</button>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acción</th>
                  <th>Detalle Operativo</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.length === 0 ? `
                  <tr><td colspan="5" class="empty-table-box">
                    <div class="empty-table-icon">🛡️</div>
                    <div class="empty-table-title">La bitácora está vacía</div>
                  </td></tr>
                ` : auditLogs.map(a => `
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

      <!-- PANEL 6: RESPALDO -->
      <div class="admin-view-panel" id="panel-backup">
        <div class="view-header">
          <div class="view-header-title">
            <h2>Respaldo y Gestión de Datos</h2>
            <p class="subtitle">Exporte una copia de seguridad completa o restaure los datos de demostración del sistema.</p>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <h3>💾 Copia de Seguridad Completa</h3>
          </div>
          <p class="subtitle" style="margin-bottom:1.25rem;">
            Descargue todos los datos del sistema (solicitudes, materiales, obras, vales, usuarios y auditoría) en formato JSON.
          </p>
          <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-admin-backup">
              ${ICONS.download} Descargar Copia JSON Completa
            </button>
          </div>
        </div>

        <div class="card" style="border-left: 4px solid #f59e0b;">
          <div class="card-header">
            <h3>🔄 Restaurar Datos de Demostración</h3>
          </div>
          <p class="subtitle" style="margin-bottom:1.25rem; color:#92400e;">
            <strong>⚠️ Precaución:</strong> Esta acción reemplazará todos los datos actuales con la información de prueba.
            Se recomienda hacer una copia de seguridad antes de proceder.
          </p>
          <button class="btn btn-warning" id="btn-admin-demo-restore" style="background:#f59e0b; color:#000;">
            🔄 Restaurar Datos Demo
          </button>
        </div>
      </div>
    `;

    // ============================================================
    // EVENTOS DE BOTONES
    // ============================================================

    // Exportar reporte completo
    const btnExport = document.getElementById('btn-admin-export-report');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        try {
          window.OC.reports.exportRequestsToCSV(requests);
          showToast('Reporte exportado correctamente a CSV.', 'success');
        } catch (err) {
          showToast(`No se pudo exportar el reporte: ${err.message || 'Error desconocido'}`, 'error');
        }
      });
    }

    const btnExportReqs = document.getElementById('btn-admin-export-reqs');
    if (btnExportReqs) {
      btnExportReqs.addEventListener('click', () => {
        try {
          if (!requests.length) {
            showToast('No hay solicitudes para exportar.', 'warning');
            return;
          }
          window.OC.reports.exportRequestsToCSV(requests);
          showToast('Solicitudes exportadas correctamente.', 'success');
        } catch (err) {
          showToast(`Error al exportar: ${err.message || 'Error desconocido'}`, 'error');
        }
      });
    }

    // Materiales
    const btnAddMat = document.getElementById('btn-admin-add-mat');
    if (btnAddMat) btnAddMat.addEventListener('click', () => openNewMaterialModal());

    const btnAdjustStock = document.getElementById('btn-admin-adjust-stock');
    if (btnAdjustStock) btnAdjustStock.addEventListener('click', () => openAdjustStockModal());

    content.querySelectorAll('.btn-mat-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const matId = btn.getAttribute('data-id');
        const mat = materials.find(m => m.id === matId);
        if (mat) openNewMaterialModal(mat);
        else showToast('No se encontró el material seleccionado.', 'warning');
      });
    });

    content.querySelectorAll('.btn-mat-stock').forEach(btn => {
      btn.addEventListener('click', () => openAdjustStockModal(btn.getAttribute('data-id')));
    });

    // Nueva obra
    const btnAddProject = document.getElementById('btn-admin-add-project');
    if (btnAddProject) {
      btnAddProject.addEventListener('click', () => {
        showToast('Funcionalidad de nueva obra disponible próximamente. Use el Panel Principal para gestionarlas.', 'info');
      });
    }

    // Limpiar auditoría
    const btnClearAudit = document.getElementById('btn-admin-clear-audit');
    if (btnClearAudit) {
      btnClearAudit.addEventListener('click', () => {
        if (!confirm('¿Confirma limpiar toda la bitácora de auditoría? Esta acción no se puede deshacer.')) return;
        try {
          localStorage.removeItem('obracontrol_audit_logs');
          showToast('Bitácora de auditoría limpiada correctamente.', 'success');
          setTimeout(() => renderAdminPortal(user), 500);
        } catch (err) {
          showToast(`Error al limpiar bitácora: ${err.message || 'Error desconocido'}`, 'error');
        }
      });
    }

    // Respaldo
    const btnBackup = document.getElementById('btn-admin-backup');
    if (btnBackup) {
      btnBackup.addEventListener('click', () => {
        try {
          window.OC.storage.exportBackupJSON();
          showToast('Copia de seguridad descargada correctamente.', 'success');
        } catch (err) {
          showToast(`Error al crear la copia de seguridad: ${err.message || 'Error desconocido'}`, 'error');
        }
      });
    }

    const btnDemoRestore = document.getElementById('btn-admin-demo-restore');
    if (btnDemoRestore) {
      btnDemoRestore.addEventListener('click', () => {
        if (!confirm('⚠️ Esta acción reemplazará TODOS los datos actuales con datos de demostración. ¿Desea continuar?')) return;
        try {
          window.OC.storage.loadDemoData();
          showToast('Datos de demostración restaurados correctamente.', 'success');
          setTimeout(() => renderAdminPortal(user), 800);
        } catch (err) {
          showToast(`Error al restaurar datos demo: ${err.message || 'Error desconocido'}`, 'error');
        }
      });
    }
  }

  // ============================================================
  // HELPER: FILAS DE MATERIALES
  // ============================================================

  function renderMaterialsRows(materials) {
    if (!materials.length) {
      return `<tr><td colspan="10" class="empty-table-box">
        <div class="empty-table-icon">🧱</div>
        <div class="empty-table-title">Sin materiales registrados</div>
      </td></tr>`;
    }

    return materials.map(m => {
      const stock = m.stock || 0;
      const minStock = m.minStock || 50;
      let stockClass = 'badge-stock-ok', stockLabel = 'Disponible';
      if (stock <= 0) { stockClass = 'badge-stock-empty'; stockLabel = 'Agotado'; }
      else if (stock <= minStock) { stockClass = 'badge-stock-low'; stockLabel = 'Stock Bajo'; }
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
              <span class="badge ${stockClass}" style="font-size:0.68rem;">${stockLabel}</span>
            </div>
          </td>
          <td><span class="price-tag-pen">S/ ${(m.pricePEN || 0).toFixed(2)}</span></td>
          <td><span class="price-tag-usd">$ ${(m.priceUSD || 0).toFixed(2)}</span></td>
          <td><strong style="color:#047857; font-size:0.85rem;">S/ ${valPEN.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
          <td><span class="badge ${m.active ? 'badge-success' : 'badge-danger'}">${m.active ? 'Activo' : 'Inactivo'}</span></td>
          <td class="text-right">
            <div style="display:inline-flex; gap:0.3rem;">
              <button class="btn btn-xs btn-outline btn-mat-edit" data-id="${m.id}" title="Editar material">✏️ Editar</button>
              <button class="btn btn-xs btn-outline btn-mat-stock" data-id="${m.id}" title="Ajustar stock">➕ Stock</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================
  // MODAL: NUEVO / EDITAR MATERIAL
  // ============================================================

  function openNewMaterialModal(materialToEdit = null) {
    const isEdit = !!materialToEdit;
    const defaultExchangeRate = 3.75;

    const vals = {
      code: isEdit ? materialToEdit.code : '',
      name: isEdit ? materialToEdit.name : '',
      category: isEdit ? materialToEdit.category : 'Albañilería',
      unit: isEdit ? materialToEdit.unit : 'unidad',
      stock: isEdit ? (materialToEdit.stock || 0) : 100000,
      minStock: isEdit ? (materialToEdit.minStock || 0) : 10000,
      pricePEN: isEdit ? (materialToEdit.pricePEN || 0) : 0.95,
      priceUSD: isEdit ? (materialToEdit.priceUSD || 0) : parseFloat((0.95 / defaultExchangeRate).toFixed(2)),
      active: isEdit ? (materialToEdit.active !== false) : true,
    };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div>
            <h3>${isEdit ? '✏️ Editar Material' : '🧱 Nuevo Material'}</h3>
            <span class="badge badge-secondary" style="font-size:0.75rem;">Control de Almacén (PEN / USD)</span>
          </div>
          <button class="modal-close" id="modal-mat-close">&times;</button>
        </div>

        <form id="admin-form-material">
          <div class="modal-body" id="admin-mat-form-body">

            <div class="form-grid-3 mb-3">
              <div class="form-group">
                <label for="adm-mat-code">Código *</label>
                <input type="text" id="adm-mat-code" class="form-control" value="${vals.code}" placeholder="ej. LAD-KIN-18" required>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label for="adm-mat-name">Nombre del Material *</label>
                <input type="text" id="adm-mat-name" class="form-control" value="${vals.name}" placeholder="ej. Ladrillo King Kong 18 Huecos" required>
              </div>
            </div>

            <div class="form-grid-3 mb-3">
              <div class="form-group">
                <label for="adm-mat-cat">Categoría *</label>
                <select id="adm-mat-cat" class="form-control" required>
                  ${['Albañilería','Conglomerantes','Aceros','Agregados','Instalaciones','Ferretería','Químicos','Acabados','Madera','Varios'].map(c =>
                    `<option value="${c}" ${vals.category === c ? 'selected' : ''}>${c}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="adm-mat-unit">Unidad *</label>
                <select id="adm-mat-unit" class="form-control" required>
                  ${['unidad','millar','bolsa','varilla','m3','m2','kg','tubo','galón','rollo','plancha'].map(u =>
                    `<option value="${u}" ${vals.unit === u ? 'selected' : ''}>${u}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="adm-mat-status">Estado *</label>
                <select id="adm-mat-status" class="form-control" required>
                  <option value="1" ${vals.active ? 'selected' : ''}>Activo</option>
                  <option value="0" ${!vals.active ? 'selected' : ''}>Inactivo</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group">
                <label for="adm-mat-stock">Saldo en Almacén *</label>
                <input type="number" id="adm-mat-stock" class="form-control" value="${vals.stock}" min="0" step="any" required>
              </div>
              <div class="form-group">
                <label for="adm-mat-minstock">Stock Mínimo de Alerta *</label>
                <input type="number" id="adm-mat-minstock" class="form-control" value="${vals.minStock}" min="0" step="any" required>
              </div>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group">
                <label for="adm-mat-pen">Precio Unitario (S/) *</label>
                <input type="number" id="adm-mat-pen" class="form-control" value="${vals.pricePEN}" min="0" step="0.01" required>
              </div>
              <div class="form-group">
                <label for="adm-mat-usd">Precio Unitario (USD) *</label>
                <input type="number" id="adm-mat-usd" class="form-control" value="${vals.priceUSD}" min="0" step="0.01" required>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-mat-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Material'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-mat-close').onclick = close;
    document.getElementById('modal-mat-cancel').onclick = close;

    // Sincronización automática de precios
    const penInput = document.getElementById('adm-mat-pen');
    const usdInput = document.getElementById('adm-mat-usd');
    penInput.addEventListener('input', () => {
      const v = parseFloat(penInput.value);
      if (!isNaN(v) && v >= 0) usdInput.value = (v / defaultExchangeRate).toFixed(2);
    });
    usdInput.addEventListener('input', () => {
      const v = parseFloat(usdInput.value);
      if (!isNaN(v) && v >= 0) penInput.value = (v * defaultExchangeRate).toFixed(2);
    });

    document.getElementById('admin-form-material').onsubmit = (e) => {
      e.preventDefault();

      const code = document.getElementById('adm-mat-code').value.trim();
      const name = document.getElementById('adm-mat-name').value.trim();
      const category = document.getElementById('adm-mat-cat').value;
      const unit = document.getElementById('adm-mat-unit').value;
      const stock = parseFloat(document.getElementById('adm-mat-stock').value);
      const minStock = parseFloat(document.getElementById('adm-mat-minstock').value);
      const pricePEN = parseFloat(penInput.value);
      const priceUSD = parseFloat(usdInput.value);
      const active = document.getElementById('adm-mat-status').value === '1';

      // Validación mejorada
      if (!code) { showToast('El código del material es obligatorio.', 'warning'); return; }
      if (!name || name.length < 3) { showToast('El nombre debe tener al menos 3 caracteres.', 'warning'); return; }
      if (isNaN(stock) || stock < 0) { showToast('El saldo en almacén debe ser un número mayor o igual a 0.', 'warning'); return; }
      if (isNaN(pricePEN) || pricePEN < 0) { showToast('El precio en soles debe ser un número válido mayor o igual a 0.', 'warning'); return; }
      if (isNaN(priceUSD) || priceUSD < 0) { showToast('El precio en dólares debe ser un número válido mayor o igual a 0.', 'warning'); return; }

      try {
        let res;
        if (isEdit) {
          res = window.OC.storage.updateMaterial(materialToEdit.id, { code, name, category, unit, stock, minStock, pricePEN, priceUSD, active });
        } else {
          res = window.OC.storage.addMaterial({ code, name, category, unit, stock, minStock, pricePEN, priceUSD, active });
        }

        if (res && res.success) {
          showToast(`Material "${name}" ${isEdit ? 'actualizado' : 'registrado'} correctamente.`, 'success');
          close();
          // Refrescar tabla de materiales
          const tbody = document.getElementById('admin-materials-tbody');
          if (tbody) tbody.innerHTML = renderMaterialsRows(window.OC.storage.getMaterials());
        } else {
          showToast(res && res.message ? res.message : 'No se pudo guardar el material. Verifique los datos.', 'error');
        }
      } catch (err) {
        showToast(`Error inesperado: ${err.message || 'Error al guardar el material'}`, 'error');
      }
    };
  }

  // ============================================================
  // MODAL: AJUSTE DE STOCK
  // ============================================================

  function openAdjustStockModal(selectedMatId = null) {
    const materials = window.OC.storage.getMaterials();
    if (!materials.length) {
      showToast('No hay materiales en el catálogo para ajustar.', 'warning');
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>📥 Ajuste de Stock en Almacén</h3>
          <button class="modal-close" id="modal-adj-close">&times;</button>
        </div>
        <form id="admin-form-adjust">
          <div class="modal-body" id="admin-adj-form-body">
            <p class="subtitle mb-3">Registre entradas por compras, ajustes por mermas o establezca el conteo físico exacto.</p>

            <div class="form-group mb-3">
              <label for="adm-adj-mat">Material / Insumo *</label>
              <select id="adm-adj-mat" class="form-control" required>
                <option value="">Seleccione material...</option>
                ${materials.map(m => `
                  <option value="${m.id}" ${selectedMatId === m.id ? 'selected' : ''}>
                    [${m.code}] ${m.name} — Saldo: ${(m.stock || 0).toLocaleString('es-PE')} ${m.unit}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group">
                <label for="adm-adj-type">Tipo de Movimiento *</label>
                <select id="adm-adj-type" class="form-control" required>
                  <option value="IN">➕ Entrada / Ingreso por Compra (+Stock)</option>
                  <option value="OUT">➖ Ajuste por Merma / Salida (-Stock)</option>
                  <option value="SET">🔄 Establecer Conteo Físico Exacto</option>
                </select>
              </div>
              <div class="form-group">
                <label for="adm-adj-qty">Cantidad *</label>
                <input type="number" id="adm-adj-qty" class="form-control" min="0.01" step="any" placeholder="ej. 500" required>
              </div>
            </div>

            <div class="form-group mb-3">
              <label for="adm-adj-reason">Motivo / Documento de Referencia *</label>
              <input type="text" id="adm-adj-reason" class="form-control" placeholder="ej. Guía de Remisión GR-001-45892" required>
            </div>

            <div id="adm-adj-preview" class="stock-preview-banner" style="display:none;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-adj-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar Movimiento</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-adj-close').onclick = close;
    document.getElementById('modal-adj-cancel').onclick = close;

    const matSel = document.getElementById('adm-adj-mat');
    const typeSel = document.getElementById('adm-adj-type');
    const qtyInp = document.getElementById('adm-adj-qty');
    const preview = document.getElementById('adm-adj-preview');

    function updatePreview() {
      const mat = materials.find(m => m.id === matSel.value);
      const qty = parseFloat(qtyInp.value);
      if (!mat || isNaN(qty) || qty <= 0) { preview.style.display = 'none'; return; }

      preview.style.display = 'flex';
      const prev = mat.stock || 0;
      let next = prev;
      if (typeSel.value === 'IN') next = prev + qty;
      else if (typeSel.value === 'OUT') next = Math.max(0, prev - qty);
      else next = qty;

      preview.innerHTML = `
        <div>
          <span style="font-size:0.75rem; color:#475569; display:block;">Saldo Actual: <strong>${prev.toLocaleString('es-PE')} ${mat.unit}</strong></span>
          <span style="font-size:0.85rem; color:#0f766e; font-weight:700;">Nuevo Saldo Proyectado: <strong>${next.toLocaleString('es-PE')} ${mat.unit}</strong></span>
        </div>
        <span class="badge ${next <= (mat.minStock || 0) ? 'badge-stock-low' : 'badge-stock-ok'}">
          ${next <= (mat.minStock || 0) ? '⚠️ Stock Bajo' : '✅ Nivel Adecuado'}
        </span>
      `;
    }

    matSel.addEventListener('change', updatePreview);
    typeSel.addEventListener('change', updatePreview);
    qtyInp.addEventListener('input', updatePreview);
    if (matSel.value) updatePreview();

    document.getElementById('admin-form-adjust').onsubmit = (e) => {
      e.preventDefault();

      const matId = matSel.value;
      const type = typeSel.value;
      const qty = parseFloat(qtyInp.value);
      const reason = document.getElementById('adm-adj-reason').value.trim();

      // Validaciones mejoradas
      if (!matId) { showToast('Debe seleccionar un material para ajustar.', 'warning'); return; }
      if (isNaN(qty) || qty <= 0) { showToast('La cantidad debe ser un número positivo mayor a 0.', 'warning'); return; }
      if (!reason || reason.length < 5) { showToast('El motivo del movimiento debe tener al menos 5 caracteres.', 'warning'); return; }

      try {
        const res = window.OC.storage.adjustMaterialStock(matId, qty, reason, type);
        if (res && res.success) {
          showToast(
            `Stock de "${res.material.name}" actualizado correctamente. Nuevo saldo: ${res.newStock.toLocaleString('es-PE')} ${res.material.unit}.`,
            'success'
          );
          close();
          const tbody = document.getElementById('admin-materials-tbody');
          if (tbody) tbody.innerHTML = renderMaterialsRows(window.OC.storage.getMaterials());
        } else {
          showToast(res && res.message ? res.message : 'No se pudo realizar el ajuste de stock. Verifique los datos.', 'error');
        }
      } catch (err) {
        showToast(`Error inesperado al ajustar stock: ${err.message || 'Error desconocido'}`, 'error');
      }
    };
  }

  // ============================================================
  // INICIALIZACIÓN DEL PORTAL
  // ============================================================

  async function initAdminPortal() {
    const loading = document.getElementById('admin-loading-screen');
    const denied = document.getElementById('admin-denied-screen');
    const portal = document.getElementById('admin-portal');

    try {
      // Intentar restaurar sesión
      let user = null;
      if (window.OC.firebase && window.OC.firebase.isConnected()) {
        try { user = await window.OC.firebase.restoreSession(); } catch (e) {}
      }
      if (!user) {
        try {
          const saved = localStorage.getItem('obracontrol_active_session');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id && parsed.role) user = parsed;
          }
        } catch (e) {}
      }

      // Verificar que sea EXACTAMENTE un 'admin' (NO superadmin)
      if (!isAdminOnly(user)) {
        // Acceso denegado
        loading.style.display = 'none';
        denied.style.display = 'flex';
        return;
      }

      // Acceso concedido
      loading.style.display = 'none';
      portal.style.display = 'flex';

      updateCloudStatus();
      renderAdminUserWidget(user);
      setupNavTabs();
      renderAdminPortal(user);

    } catch (err) {
      loading.style.display = 'none';
      denied.style.display = 'flex';
      console.error('Error al inicializar portal admin:', err);
    }
  }

  // Auto-iniciar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPortal);
  } else {
    initAdminPortal();
  }

})();
