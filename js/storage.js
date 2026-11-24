/**
 * ObraControl - storage.js
 * Capa de almacenamiento local utilizando localStorage.
 * Compatible con file:// sin dependencias externas.
 */
(function() {
  'use strict';
  window.OC = window.OC || {};

  const KEYS = {
    USERS: 'obracontrol_users',
    PROJECTS: 'obracontrol_projects',
    MATERIALS: 'obracontrol_materials',
    REQUESTS: 'obracontrol_requests',
    VOUCHERS: 'obracontrol_vouchers',
    AUDIT: 'obracontrol_audit_logs'
  };

  // Datos iniciales base si el sistema está vacío
  const INITIAL_USERS = [
    {
      id: 'USR-001',
      name: 'Superadministrador',
      email: 'quilalaime@gmail.com',
      role: 'superadmin',
      jobTitle: 'Superadministrador del Sistema',
      active: true,
      status: 'active'
    },
    {
      id: 'USR-002',
      name: 'Ing. Carlos Mendoza',
      email: 'carlos.mendoza@obracontrol.pe',
      role: 'aprobador',
      jobTitle: 'Ingeniero Residente Principal',
      active: true,
      status: 'active'
    },
    {
      id: 'USR-003',
      name: 'Juan Pérez',
      email: 'juan.perez@obracontrol.pe',
      role: 'solicitante',
      jobTitle: 'Maestro de Obra (Cimentaciones)',
      active: true,
      status: 'active'
    },
    {
      id: 'USR-004',
      name: 'Manuel Rivas',
      email: 'manuel.rivas@obracontrol.pe',
      role: 'almacenero',
      jobTitle: 'Jefe de Almacén y Logística',
      active: true,
      status: 'active'
    }
  ];

  const INITIAL_PROJECTS = [
    {
      id: 'PRJ-001',
      code: 'OBRA-2026-01',
      name: 'Condominio Los Álamos - Torre A y B',
      location: 'Av. Las Palmas 450, Surco, Lima',
      active: true,
      workFronts: ['Torre A - Cimentaciones', 'Torre A - Estructuras Piso 1-5', 'Torre B - Acabados', 'Áreas Comunes y Sótano']
    },
    {
      id: 'PRJ-002',
      code: 'OBRA-2026-02',
      name: 'Puente Bicentenario y Accesos',
      location: 'Km 14.5 Carretera Central',
      active: true,
      workFronts: ['Estribo Norte', 'Estribo Sur', 'Pilote Central', 'Vía de Acceso Este']
    },
    {
      id: 'PRJ-003',
      code: 'OBRA-2026-03',
      name: 'Centro de Salud Nivel II San Isidro',
      location: 'Jr. Los Cipreses 120',
      active: true,
      workFronts: ['Módulo de Emergencia', 'Hospitalización', 'Instalaciones Sanitarias']
    }
  ];

  const INITIAL_MATERIALS = [
    { id: 'MAT-001', code: 'CEM-SOL-I', name: 'Cemento Portland Tipo I (42.5 kg)', category: 'Conglomerantes', unit: 'bolsa', stock: 1500, minStock: 200, pricePEN: 28.50, priceUSD: 7.60, active: true },
    { id: 'MAT-002', code: 'ACE-COR-12', name: 'Acero Corrugado Grado 60 de 1/2" (9 m)', category: 'Aceros', unit: 'varilla', stock: 2500, minStock: 300, pricePEN: 38.00, priceUSD: 10.13, active: true },
    { id: 'MAT-003', code: 'ACE-COR-38', name: 'Acero Corrugado Grado 60 de 3/8" (9 m)', category: 'Aceros', unit: 'varilla', stock: 1800, minStock: 250, pricePEN: 22.50, priceUSD: 6.00, active: true },
    { id: 'MAT-004', code: 'AGR-ARE-GR', name: 'Arena Gruesa Seleccionada para Concreto', category: 'Agregados', unit: 'm3', stock: 350, minStock: 40, pricePEN: 55.00, priceUSD: 14.67, active: true },
    { id: 'MAT-005', code: 'AGR-PIE-CH', name: 'Piedra Chancada de 1/2"', category: 'Agregados', unit: 'm3', stock: 280, minStock: 30, pricePEN: 60.00, priceUSD: 16.00, active: true },
    { id: 'MAT-006', code: 'LAD-KIN-18', name: 'Ladrillo King Kong 18 Huecos (9x13x24 cm)', category: 'Albañilería', unit: 'unidad', stock: 100000, minStock: 10000, pricePEN: 0.95, priceUSD: 0.25, active: true },
    { id: 'MAT-007', code: 'TUB-PVC-04', name: 'Tubería PVC Desagüe 4" Clase Pesada x 3 m', category: 'Instalaciones', unit: 'tubo', stock: 450, minStock: 50, pricePEN: 32.00, priceUSD: 8.53, active: true },
    { id: 'MAT-008', code: 'ALA-NEG-16', name: 'Alambre Negro Recocido N° 16', category: 'Aceros', unit: 'kg', stock: 800, minStock: 100, pricePEN: 6.50, priceUSD: 1.73, active: true },
    { id: 'MAT-009', code: 'CLA-MAD-03', name: 'Clavos para Madera de 3" con Cabeza', category: 'Ferretería', unit: 'kg', stock: 600, minStock: 80, pricePEN: 7.00, priceUSD: 1.87, active: true },
    { id: 'MAT-010', code: 'ADI-IMP-SI', name: 'Aditivo Impermeabilizante Integral para Mezcla', category: 'Químicos', unit: 'galón', stock: 200, minStock: 25, pricePEN: 45.00, priceUSD: 12.00, active: true }
  ];

  // Helper de lectura y escritura seguro
  function read(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (err) {
      console.error('Error al leer de localStorage (' + key + '):', err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Error al escribir en localStorage (' + key + '):', err);
      alert('Error de almacenamiento local: Espacio lleno o permisos denegados en su navegador.');
      return false;
    }
  }

  // Inicialización primaria si no existen claves
  function init() {
    if (!localStorage.getItem(KEYS.USERS)) {
      write(KEYS.USERS, INITIAL_USERS);
    } else {
      const users = read(KEYS.USERS, INITIAL_USERS);
      if (Array.isArray(users) && users.length === 0) {
        write(KEYS.USERS, INITIAL_USERS);
      }
    }
    if (!localStorage.getItem(KEYS.PROJECTS)) {
      write(KEYS.PROJECTS, INITIAL_PROJECTS);
    }
    if (!localStorage.getItem(KEYS.MATERIALS)) {
      write(KEYS.MATERIALS, INITIAL_MATERIALS);
    }
    if (!localStorage.getItem(KEYS.REQUESTS) || read(KEYS.REQUESTS, []).length === 0) {
      loadDemoData();
    }
    if (!localStorage.getItem(KEYS.VOUCHERS)) {
      write(KEYS.VOUCHERS, []);
    }
    if (!localStorage.getItem(KEYS.AUDIT)) {
      write(KEYS.AUDIT, []);
    }
  }

  // Auditoría
  function logAction(user, action, details) {
    const logs = read(KEYS.AUDIT, []);
    const entry = {
      id: 'AUD-' + Date.now(),
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleString('es-PE'),
      userId: user ? user.id : 'SISTEMA',
      userName: user ? user.name : 'Sistema Local',
      userRole: user ? user.role : 'sistema',
      action: action,
      details: details
    };
    logs.unshift(entry);
    // Mantener máximo 500 registros para no saturar localStorage
    if (logs.length > 500) logs.pop();
    write(KEYS.AUDIT, logs);
    return entry;
  }

  // Generador de código correlativo
  function generateCode(prefix, list) {
    const year = new Date().getFullYear();
    const count = list.length + 1;
    const padded = String(count).padStart(4, '0');
    return `${prefix}-${year}-${padded}`;
  }

  // Carga de datos de demostración completos y realistas
  function loadDemoData() {
    const demoRequests = [
      {
        id: 'REQ-DEMO-001',
        code: 'SOL-2026-0001',
        createdAt: '2026-10-20T08:30:00.000Z',
        createdDate: '20/10/2026 08:30',
        requiredDate: '2026-10-22',
        createdBy: { id: 'USR-002', name: 'Juan Pérez', role: 'solicitante' },
        projectId: 'PRJ-001',
        projectName: 'Condominio Los Álamos - Torre A y B',
        workFront: 'Torre A - Cimentaciones',
        justification: 'Vaciado masivo de zapatas aisladas y vigas de cimentación según cronograma valorizado.',
        observations: 'Prioridad alta. Se requiere mixer y descarga en rampa sur.',
        status: 'ENTREGADA', // Totalmente entregada
        approvalData: {
          approvedBy: { id: 'USR-003', name: 'Ing. Roberto Silva' },
          approvedAt: '2026-10-20T10:15:00.000Z',
          approvedDate: '20/10/2026 10:15',
          notes: 'Aprobado conforme a metrados del expediente técnico.'
        },
        items: [
          { materialId: 'MAT-001', materialCode: 'CEM-SOL-I', materialName: 'Cemento Portland Tipo I (42.5 kg)', unit: 'bolsa', requested: 120, approved: 120, delivered: 120, pricePEN: 28.50, priceUSD: 7.60, subtotalPEN: 3420.00, subtotalUSD: 912.00 },
          { materialId: 'MAT-004', materialCode: 'AGR-ARE-GR', materialName: 'Arena Gruesa Seleccionada para Concreto', unit: 'm3', requested: 15, approved: 15, delivered: 15, pricePEN: 55.00, priceUSD: 14.67, subtotalPEN: 825.00, subtotalUSD: 220.05 },
          { materialId: 'MAT-008', materialCode: 'ALA-NEG-16', materialName: 'Alambre Negro Recocido N° 16', unit: 'kg', requested: 30, approved: 30, delivered: 30, pricePEN: 6.50, priceUSD: 1.73, subtotalPEN: 195.00, subtotalUSD: 51.90 }
        ],
        totalPEN: 4440.00,
        totalUSD: 1183.95,
        history: [
          { date: '20/10/2026 08:30', user: 'Juan Pérez', action: 'CREADA', note: 'Solicitud enviada a revisión' },
          { date: '20/10/2026 10:15', user: 'Ing. Roberto Silva', action: 'APROBADA', note: 'Aprobada en su totalidad' },
          { date: '21/10/2026 09:00', user: 'Manuel Rojas', action: 'ENTREGA_TOTAL', note: 'Despacho completado con Vale VAL-2026-0001' }
        ]
      },
      {
        id: 'REQ-DEMO-002',
        code: 'SOL-2026-0002',
        createdAt: '2026-10-22T09:15:00.000Z',
        createdDate: '22/10/2026 09:15',
        requiredDate: '2026-10-24',
        createdBy: { id: 'USR-002', name: 'Juan Pérez', role: 'solicitante' },
        projectId: 'PRJ-001',
        projectName: 'Condominio Los Álamos - Torre A y B',
        workFront: 'Torre A - Estructuras Piso 1-5',
        justification: 'Habilitación de armadura para columnas principales del primer nivel.',
        observations: 'Revisar certificado de calidad del acero.',
        status: 'ENTREGA_PARCIAL', // Entrega parcial
        approvalData: {
          approvedBy: { id: 'USR-003', name: 'Ing. Roberto Silva' },
          approvedAt: '2026-10-22T11:45:00.000Z',
          approvedDate: '22/10/2026 11:45',
          notes: 'Aprobado. Despachar según capacidad de doblado en cancha.'
        },
        items: [
          { materialId: 'MAT-002', materialCode: 'ACE-COR-12', materialName: 'Acero Corrugado Grado 60 de 1/2" (9 m)', unit: 'varilla', requested: 80, approved: 80, delivered: 50, pricePEN: 38.00, priceUSD: 10.13, subtotalPEN: 3040.00, subtotalUSD: 810.40 },
          { materialId: 'MAT-003', materialCode: 'ACE-COR-38', materialName: 'Acero Corrugado Grado 60 de 3/8" (9 m)', unit: 'varilla', requested: 60, approved: 60, delivered: 30, pricePEN: 22.50, priceUSD: 6.00, subtotalPEN: 1350.00, subtotalUSD: 360.00 },
          { materialId: 'MAT-008', materialCode: 'ALA-NEG-16', materialName: 'Alambre Negro Recocido N° 16', unit: 'kg', requested: 25, approved: 25, delivered: 25, pricePEN: 6.50, priceUSD: 1.73, subtotalPEN: 162.50, subtotalUSD: 43.25 }
        ],
        totalPEN: 4552.50,
        totalUSD: 1213.65,
        history: [
          { date: '22/10/2026 09:15', user: 'Juan Pérez', action: 'CREADA', note: 'Solicitud creada' },
          { date: '22/10/2026 11:45', user: 'Ing. Roberto Silva', action: 'APROBADA', note: 'Aprobado' },
          { date: '23/10/2026 14:20', user: 'Manuel Rojas', action: 'ENTREGA_PARCIAL', note: 'Primera entrega con Vale VAL-2026-0002. Queda saldo pendiente.' }
        ]
      },
      {
        id: 'REQ-DEMO-003',
        code: 'SOL-2026-0003',
        createdAt: '2026-10-25T14:00:00.000Z',
        createdDate: '25/10/2026 14:00',
        requiredDate: '2026-10-28',
        createdBy: { id: 'USR-002', name: 'Juan Pérez', role: 'solicitante' },
        projectId: 'PRJ-002',
        projectName: 'Puente Bicentenario y Accesos',
        workFront: 'Pilote Central',
        justification: 'Vaciado de pilotes con aditivo impermeabilizante para contacto con humedad del río.',
        observations: 'Urgente para no detener la perforadora hidráulica.',
        status: 'APROBADA', // Aprobada, pendiente de primera entrega
        approvalData: {
          approvedBy: { id: 'USR-003', name: 'Ing. Roberto Silva' },
          approvedAt: '2026-10-25T16:30:00.000Z',
          approvedDate: '25/10/2026 16:30',
          notes: 'Aprobado prioritario. Coordinar con almacén la disponibilidad del aditivo.'
        },
        items: [
          { materialId: 'MAT-001', materialCode: 'CEM-SOL-I', materialName: 'Cemento Portland Tipo I (42.5 kg)', unit: 'bolsa', requested: 90, approved: 90, delivered: 0, pricePEN: 28.50, priceUSD: 7.60, subtotalPEN: 2565.00, subtotalUSD: 684.00 },
          { materialId: 'MAT-010', materialCode: 'ADI-IMP-SI', materialName: 'Aditivo Impermeabilizante Integral para Mezcla', unit: 'galón', requested: 12, approved: 12, delivered: 0, pricePEN: 45.00, priceUSD: 12.00, subtotalPEN: 540.00, subtotalUSD: 144.00 }
        ],
        totalPEN: 3105.00,
        totalUSD: 828.00,
        history: [
          { date: '25/10/2026 14:00', user: 'Juan Pérez', action: 'CREADA', note: 'Solicitud creada' },
          { date: '25/10/2026 16:30', user: 'Ing. Roberto Silva', action: 'APROBADA', note: 'Aprobada sin modificaciones' }
        ]
      },
      {
        id: 'REQ-DEMO-004',
        code: 'SOL-2026-0004',
        createdAt: '2026-10-26T10:10:00.000Z',
        createdDate: '26/10/2026 10:10',
        requiredDate: '2026-10-27',
        createdBy: { id: 'USR-002', name: 'Juan Pérez', role: 'solicitante' },
        projectId: 'PRJ-001',
        projectName: 'Condominio Los Álamos - Torre A y B',
        workFront: 'Torre B - Acabados',
        justification: 'Levantamiento de tabiquería interior en departamentos del segundo piso.',
        observations: 'Material requerido a pie de obra en Torre B.',
        status: 'PENDIENTE_APROBACION', // Pendiente de revisión por el residente
        approvalData: null,
        items: [
          { materialId: 'MAT-006', materialCode: 'LAD-KIN-18', materialName: 'Ladrillo King Kong 18 Huecos (9x13x24 cm)', unit: 'unidad', requested: 25000, approved: 0, delivered: 0, pricePEN: 0.95, priceUSD: 0.25, subtotalPEN: 23750.00, subtotalUSD: 6250.00 },
          { materialId: 'MAT-001', materialCode: 'CEM-SOL-I', materialName: 'Cemento Portland Tipo I (42.5 kg)', unit: 'bolsa', requested: 45, approved: 0, delivered: 0, pricePEN: 28.50, priceUSD: 7.60, subtotalPEN: 1282.50, subtotalUSD: 342.00 },
          { materialId: 'MAT-004', materialCode: 'AGR-ARE-GR', materialName: 'Arena Gruesa Seleccionada para Concreto', unit: 'm3', requested: 6, approved: 0, delivered: 0, pricePEN: 55.00, priceUSD: 14.67, subtotalPEN: 330.00, subtotalUSD: 88.02 }
        ],
        totalPEN: 25362.50,
        totalUSD: 6680.02,
        history: [
          { date: '26/10/2026 10:10', user: 'Juan Pérez', action: 'CREADA', note: 'Enviada para revisión del residente' }
        ]
      },
      {
        id: 'REQ-DEMO-005',
        code: 'SOL-2026-0005',
        createdAt: '2026-10-24T15:20:00.000Z',
        createdDate: '24/10/2026 15:20',
        requiredDate: '2026-10-25',
        createdBy: { id: 'USR-002', name: 'Juan Pérez', role: 'solicitante' },
        projectId: 'PRJ-003',
        projectName: 'Centro de Salud Nivel II San Isidro',
        workFront: 'Módulo de Emergencia',
        justification: 'Requerimiento extraordinario no contemplado en el cronograma semanal.',
        observations: 'Solicitud fuera de ciclo de programación.',
        status: 'RECHAZADA', // Solicitud rechazada
        approvalData: {
          approvedBy: { id: 'USR-003', name: 'Ing. Roberto Silva' },
          approvedAt: '2026-10-24T17:00:00.000Z',
          approvedDate: '24/10/2026 17:00',
          rejectionReason: 'Excede el presupuesto asignado para esta fase del módulo de emergencia. Debe presentarse sustentación adicional con valorización aprobada por supervisión.'
        },
        items: [
          { materialId: 'MAT-007', materialCode: 'TUB-PVC-04', materialName: 'Tubería PVC Desagüe 4" Clase Pesada x 3 m', unit: 'tubo', requested: 50, approved: 0, delivered: 0, pricePEN: 32.00, priceUSD: 8.53, subtotalPEN: 1600.00, subtotalUSD: 426.50 }
        ],
        totalPEN: 1600.00,
        totalUSD: 426.50,
        history: [
          { date: '24/10/2026 15:20', user: 'Juan Pérez', action: 'CREADA', note: 'Solicitud creada' },
          { date: '24/10/2026 17:00', user: 'Ing. Roberto Silva', action: 'RECHAZADA', note: 'Rechazada por exceso presupuestal' }
        ]
      }
    ];

    const demoVouchers = [
      {
        id: 'VOU-DEMO-001',
        voucherNumber: 'VAL-2026-0001',
        requestId: 'REQ-DEMO-001',
        requestCode: 'SOL-2026-0001',
        projectName: 'Condominio Los Álamos - Torre A y B',
        workFront: 'Torre A - Cimentaciones',
        deliveryDate: '21/10/2026 09:00',
        warehouseResponsible: 'Manuel Rojas',
        receiverName: 'Juan Pérez (Maestro de Obra)',
        notes: 'Despacho completo en parihuelas protegidas.',
        items: [
          { materialCode: 'CEM-SOL-I', materialName: 'Cemento Portland Tipo I (42.5 kg)', unit: 'bolsa', requested: 120, approved: 120, deliveredNow: 120, remainingBalance: 0 },
          { materialCode: 'AGR-ARE-GR', materialName: 'Arena Gruesa Seleccionada para Concreto', unit: 'm3', requested: 15, approved: 15, deliveredNow: 15, remainingBalance: 0 },
          { materialCode: 'ALA-NEG-16', materialName: 'Alambre Negro Recocido N° 16', unit: 'kg', requested: 30, approved: 30, deliveredNow: 30, remainingBalance: 0 }
        ]
      },
      {
        id: 'VOU-DEMO-002',
        voucherNumber: 'VAL-2026-0002',
        requestId: 'REQ-DEMO-002',
        requestCode: 'SOL-2026-0002',
        projectName: 'Condominio Los Álamos - Torre A y B',
        workFront: 'Torre A - Estructuras Piso 1-5',
        deliveryDate: '23/10/2026 14:20',
        warehouseResponsible: 'Manuel Rojas',
        receiverName: 'Juan Pérez (Maestro de Obra)',
        notes: 'Entrega parcial por falta de espacio de acopio en obra. Saldo se despachará mañana.',
        items: [
          { materialCode: 'ACE-COR-12', materialName: 'Acero Corrugado Grado 60 de 1/2" (9 m)', unit: 'varilla', requested: 80, approved: 80, deliveredNow: 50, remainingBalance: 30 },
          { materialCode: 'ACE-COR-38', materialName: 'Acero Corrugado Grado 60 de 3/8" (9 m)', unit: 'varilla', requested: 60, approved: 60, deliveredNow: 30, remainingBalance: 30 },
          { materialCode: 'ALA-NEG-16', materialName: 'Alambre Negro Recocido N° 16', unit: 'kg', requested: 25, approved: 25, deliveredNow: 25, remainingBalance: 0 }
        ]
      }
    ];

    write(KEYS.USERS, INITIAL_USERS);
    write(KEYS.PROJECTS, INITIAL_PROJECTS);
    write(KEYS.MATERIALS, INITIAL_MATERIALS);
    write(KEYS.REQUESTS, demoRequests);
    write(KEYS.VOUCHERS, demoVouchers);

    logAction({ id: 'USR-001', name: 'Carlos Mendoza', role: 'admin' }, 'CARGAR_DATOS_DEMO', 'Se cargaron datos demostrativos completos con solicitudes pendientes, aprobadas, rechazadas y vales.');
    return true;
  }

  // Restablecimiento total
  function resetAllData() {
    write(KEYS.USERS, []);
    write(KEYS.PROJECTS, INITIAL_PROJECTS);
    write(KEYS.MATERIALS, INITIAL_MATERIALS);
    write(KEYS.REQUESTS, []);
    write(KEYS.VOUCHERS, []);
    write(KEYS.AUDIT, []);
    logAction({ id: 'SISTEMA', name: 'Sistema', role: 'sistema' }, 'REINICIO_SISTEMA', 'Se restableció el sistema a sus valores iniciales limpios.');
    return true;
  }

  // Exportar backup en formato JSON
  function exportBackupJSON() {
    const backup = {
      app: 'ObraControl',
      version: '1.0.0-offline',
      exportedAt: new Date().toISOString(),
      data: {
        users: read(KEYS.USERS),
        projects: read(KEYS.PROJECTS),
        materials: read(KEYS.MATERIALS),
        requests: read(KEYS.REQUESTS),
        vouchers: read(KEYS.VOUCHERS),
        audit: read(KEYS.AUDIT)
      }
    };
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `ObraControl_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Importar backup JSON
  function importBackupJSON(jsonString, callback) {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !backup.data || !backup.data.users || !backup.data.requests) {
        return callback(false, 'El archivo seleccionado no corresponde a una copia de seguridad válida de ObraControl.');
      }
      const importedUsers = Array.isArray(backup.data.users) ? backup.data.users : INITIAL_USERS;
      write(KEYS.USERS, importedUsers.filter(user => !/@obracontrol\.local$/i.test(user.email || '')));
      write(KEYS.PROJECTS, backup.data.projects || INITIAL_PROJECTS);
      write(KEYS.MATERIALS, backup.data.materials || INITIAL_MATERIALS);
      write(KEYS.REQUESTS, backup.data.requests || []);
      write(KEYS.VOUCHERS, backup.data.vouchers || []);
      write(KEYS.AUDIT, backup.data.audit || []);

      logAction(null, 'IMPORTAR_BACKUP', 'Se importó exitosamente una copia de seguridad con fecha: ' + (backup.exportedAt || 'desconocida'));
      callback(true, 'Copia de seguridad restaurada con éxito.');
    } catch (err) {
      callback(false, 'Error al procesar el archivo JSON: ' + err.message);
    }
  }

  // Funciones de gestión de Materiales y Almacén
  function getMaterials() {
    const list = read(KEYS.MATERIALS, INITIAL_MATERIALS);
    let changed = false;
    const normalized = list.map(m => {
      let updated = false;
      let stock = typeof m.stock === 'number' ? m.stock : null;
      let minStock = typeof m.minStock === 'number' ? m.minStock : 50;
      let pricePEN = typeof m.pricePEN === 'number' ? m.pricePEN : null;
      let priceUSD = typeof m.priceUSD === 'number' ? m.priceUSD : null;

      if (stock === null) {
        if (m.code === 'LAD-KIN-18') stock = 100000;
        else if (m.code === 'CEM-SOL-I') stock = 1500;
        else if (m.code === 'ACE-COR-12') stock = 2500;
        else if (m.code === 'ACE-COR-38') stock = 1800;
        else if (m.code === 'AGR-ARE-GR') stock = 350;
        else if (m.code === 'AGR-PIE-CH') stock = 280;
        else if (m.code === 'TUB-PVC-04') stock = 450;
        else if (m.code === 'ALA-NEG-16') stock = 800;
        else if (m.code === 'CLA-MAD-03') stock = 600;
        else if (m.code === 'ADI-IMP-SI') stock = 200;
        else stock = 500;
        updated = true;
      }
      if (m.code === 'LAD-KIN-18' && (m.unit === 'millar' || !m.unit)) {
        m.unit = 'unidad';
        updated = true;
      }
      if (pricePEN === null) {
        if (m.code === 'LAD-KIN-18') pricePEN = 0.95;
        else if (m.code === 'CEM-SOL-I') pricePEN = 28.50;
        else if (m.code === 'ACE-COR-12') pricePEN = 38.00;
        else if (m.code === 'ACE-COR-38') pricePEN = 22.50;
        else if (m.code === 'AGR-ARE-GR') pricePEN = 55.00;
        else if (m.code === 'AGR-PIE-CH') pricePEN = 60.00;
        else if (m.code === 'TUB-PVC-04') pricePEN = 32.00;
        else if (m.code === 'ALA-NEG-16') pricePEN = 6.50;
        else if (m.code === 'CLA-MAD-03') pricePEN = 7.00;
        else if (m.code === 'ADI-IMP-SI') pricePEN = 45.00;
        else pricePEN = 10.00;
        updated = true;
      }
      if (priceUSD === null) {
        priceUSD = parseFloat((pricePEN / 3.75).toFixed(2));
        updated = true;
      }

      if (updated) {
        changed = true;
        return { ...m, stock, minStock, pricePEN, priceUSD };
      }
      return m;
    });

    if (changed) {
      write(KEYS.MATERIALS, normalized);
    }
    return normalized;
  }

  function addMaterial(materialData) {
    const user = window.OC.auth ? window.OC.auth.getCurrentUser() : null;
    const list = getMaterials();

    const code = (materialData.code || '').trim().toUpperCase() || ('MAT-' + String(list.length + 1).padStart(3, '0'));
    if (list.some(m => m.code.toUpperCase() === code)) {
      return { success: false, message: `Ya existe un material registrado con el código "${code}".` };
    }
    if (!materialData.name || materialData.name.trim().length < 3) {
      return { success: false, message: 'El nombre o descripción del material debe tener al menos 3 caracteres.' };
    }

    const stock = Math.max(0, parseFloat(materialData.stock) || 0);
    const minStock = Math.max(0, parseFloat(materialData.minStock) || 50);
    const pricePEN = Math.max(0, parseFloat(materialData.pricePEN) || 0);
    const priceUSD = typeof materialData.priceUSD === 'number' && !isNaN(materialData.priceUSD)
      ? Math.max(0, parseFloat(materialData.priceUSD))
      : parseFloat((pricePEN / 3.75).toFixed(2));

    const newMat = {
      id: 'MAT-' + Date.now(),
      code: code,
      name: materialData.name.trim(),
      category: materialData.category || 'Varios',
      unit: materialData.unit || 'unidad',
      stock: stock,
      minStock: minStock,
      pricePEN: pricePEN,
      priceUSD: priceUSD,
      active: materialData.active !== false
    };

    list.push(newMat);
    write(KEYS.MATERIALS, list);
    logAction(user, 'CREAR_MATERIAL', `Registró nuevo material: [${newMat.code}] ${newMat.name} con saldo inicial de ${newMat.stock} ${newMat.unit} (S/ ${newMat.pricePEN} / $ ${newMat.priceUSD}).`);

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('materials').doc(newMat.id).set(newMat).catch(err => {
          console.warn('Error al guardar material en Firestore:', err);
        });
      }
    }

    return { success: true, material: newMat };
  }

  function updateMaterial(materialId, materialData) {
    const user = window.OC.auth ? window.OC.auth.getCurrentUser() : null;
    const list = getMaterials();
    const idx = list.findIndex(m => m.id === materialId || m.code === materialId);
    if (idx === -1) {
      return { success: false, message: 'Material no encontrado.' };
    }

    const m = list[idx];
    if (materialData.code && materialData.code.trim().toUpperCase() !== m.code) {
      const newCode = materialData.code.trim().toUpperCase();
      if (list.some((other, i) => i !== idx && other.code.toUpperCase() === newCode)) {
        return { success: false, message: `El código "${newCode}" ya está en uso por otro material.` };
      }
      m.code = newCode;
    }

    if (materialData.name) m.name = materialData.name.trim();
    if (materialData.category) m.category = materialData.category.trim();
    if (materialData.unit) m.unit = materialData.unit.trim();
    if (materialData.stock !== undefined && !isNaN(parseFloat(materialData.stock))) {
      m.stock = Math.max(0, parseFloat(materialData.stock));
    }
    if (materialData.minStock !== undefined && !isNaN(parseFloat(materialData.minStock))) {
      m.minStock = Math.max(0, parseFloat(materialData.minStock));
    }
    if (materialData.pricePEN !== undefined && !isNaN(parseFloat(materialData.pricePEN))) {
      m.pricePEN = Math.max(0, parseFloat(materialData.pricePEN));
    }
    if (materialData.priceUSD !== undefined && !isNaN(parseFloat(materialData.priceUSD))) {
      m.priceUSD = Math.max(0, parseFloat(materialData.priceUSD));
    } else if (materialData.pricePEN !== undefined) {
      m.priceUSD = parseFloat((m.pricePEN / 3.75).toFixed(2));
    }
    if (materialData.active !== undefined) {
      m.active = !!materialData.active;
    }

    write(KEYS.MATERIALS, list);
    logAction(user, 'ACTUALIZAR_MATERIAL', `Actualizó información del material: [${m.code}] ${m.name}. Saldo: ${m.stock} ${m.unit}.`);

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('materials').doc(m.id).set(m, { merge: true }).catch(err => {
          console.warn('Error al actualizar material en Firestore:', err);
        });
      }
    }

    return { success: true, material: m };
  }

  function adjustMaterialStock(materialId, amount, reason, movementType = 'IN') {
    const user = window.OC.auth ? window.OC.auth.getCurrentUser() : null;
    const list = getMaterials();
    const m = list.find(item => item.id === materialId || item.code === materialId);
    if (!m) return { success: false, message: 'Material no encontrado.' };

    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, message: 'La cantidad debe ser un número positivo mayor a 0.' };
    }

    const previousStock = m.stock || 0;
    let newStock = previousStock;

    if (movementType === 'IN') {
      newStock = previousStock + qty;
    } else if (movementType === 'OUT') {
      if (qty > previousStock) {
        return { success: false, message: `No se puede egresar ${qty} ${m.unit}. Saldo disponible en almacén: ${previousStock} ${m.unit}.` };
      }
      newStock = previousStock - qty;
    } else {
      newStock = qty;
    }

    m.stock = newStock;
    write(KEYS.MATERIALS, list);

    const detailText = movementType === 'IN' 
      ? `Ingreso de +${qty} ${m.unit}. Saldo previo: ${previousStock}, Nuevo saldo: ${newStock}. Motivo: ${reason || 'Ingreso regular a almacén'}`
      : `Ajuste/Egreso de -${qty} ${m.unit}. Saldo previo: ${previousStock}, Nuevo saldo: ${newStock}. Motivo: ${reason || 'Ajuste manual de inventario'}`;

    logAction(user, 'AJUSTE_STOCK', `[${m.code}] ${m.name}: ${detailText}`);

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('materials').doc(m.id).set({ stock: newStock }, { merge: true }).catch(err => {
          console.warn('Error al sincronizar stock con Firestore:', err);
        });
      }
    }

    return { success: true, material: m, previousStock: previousStock, newStock: newStock };
  }

  function deleteMaterial(materialId) {
    const user = window.OC.auth ? window.OC.auth.getCurrentUser() : null;
    const list = getMaterials();
    const idx = list.findIndex(m => m.id === materialId || m.code === materialId);
    if (idx === -1) return { success: false, message: 'Material no encontrado.' };

    const m = list[idx];
    list.splice(idx, 1);
    write(KEYS.MATERIALS, list);
    logAction(user, 'ELIMINAR_MATERIAL', `Eliminó el material [${m.code}] ${m.name} del catálogo.`);

    if (window.OC.firebase && window.OC.firebase.isConnected()) {
      const db = window.OC.firebase.getDb();
      if (db) {
        db.collection('materials').doc(m.id).delete().catch(err => {
          console.warn('Error al eliminar material de Firestore:', err);
        });
      }
    }

    return { success: true, message: `Material ${m.name} eliminado del catálogo.` };
  }

  // Inicializar al cargar el script
  init();

  // Exponer API pública del storage
  window.OC.storage = {
    getUsers: () => read(KEYS.USERS, INITIAL_USERS),
    saveUsers: (list) => write(KEYS.USERS, list),

    getProjects: () => read(KEYS.PROJECTS, INITIAL_PROJECTS),
    saveProjects: (list) => write(KEYS.PROJECTS, list),

    getMaterials: getMaterials,
    saveMaterials: (list) => write(KEYS.MATERIALS, list),
    addMaterial: addMaterial,
    updateMaterial: updateMaterial,
    adjustMaterialStock: adjustMaterialStock,
    deleteMaterial: deleteMaterial,

    getRequests: () => read(KEYS.REQUESTS, []),
    saveRequests: (list) => write(KEYS.REQUESTS, list),

    getVouchers: () => read(KEYS.VOUCHERS, []),
    saveVouchers: (list) => write(KEYS.VOUCHERS, list),

    getAuditLogs: () => read(KEYS.AUDIT, []),
    logAction: logAction,

    generateCode: generateCode,
    loadDemoData: loadDemoData,
    resetAllData: resetAllData,
    exportBackupJSON: exportBackupJSON,
    importBackupJSON: importBackupJSON
  };

})();
