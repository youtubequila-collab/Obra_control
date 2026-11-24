========================================================================
OBRACONTROL - SISTEMA DE SOLICITUDES Y VALES DE INSUMOS DE CONSTRUCCIÓN
Versión 1.2.0 (Firebase Authentication + roles de usuario)
========================================================================

ObraControl usa Firebase Authentication y Cloud Firestore para iniciar sesión,
crear cuentas y administrar roles. Los datos operativos existentes se conservan
en el almacenamiento local y se pueden sincronizar con Firestore.

------------------------------------------------------------------------
1. CÓMO ABRIR LA APLICACIÓN
------------------------------------------------------------------------
1. Publique la aplicación en Firebase Hosting o en un servidor web autorizado
   en la configuración de Firebase Authentication. El inicio de sesión no funciona
   en modo de demostración ni debe usarse abriendo el archivo mediante file://.

------------------------------------------------------------------------
2. CÓMO CONECTAR A TU PROYECTO FIREBASE (PASO A PASO)
------------------------------------------------------------------------
Paso 1: Crear tu proyecto en Firebase (Gratis)
1. Ingresa a la consola de Firebase: https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en "Crear un proyecto" o "Add project".
4. Escribe el nombre del proyecto (ej: "ObraControl") y continúa.

Paso 2: Activar Cloud Firestore
1. En el menú lateral izquierdo de Firebase, ve a "Compilación" (Build) 
   > "Firestore Database".
2. Haz clic en "Crear base de datos".
3. Elige la ubicación (ej: "us-central1" o la más cercana a Perú/tu país).
4. Elige iniciar en modo de producción.
5. Haz clic en "Habilitar".

Paso 3: Obtener las Credenciales Web
1. En la consola de Firebase, haz clic en el ícono de engranaje ⚙️ (Configuración 
   del proyecto) en la parte superior izquierda.
2. En la pestaña "General", baja hasta la sección "Tus apps".
3. Haz clic en el ícono Web </> ("Agregar app").
4. Escribe un apodo (ej: "ObraControl Web") y haz clic en "Registrar app".
5. Verás un bloque de código con un objeto llamado `firebaseConfig`:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

Paso 4: Conectar en ObraControl
1. ObraControl ya incluye la configuración del proyecto Firebase `obracontrol-907fe`.
2. En Firebase Authentication, habilita el proveedor de correo y contraseña y agrega
   el dominio donde publicarás la app a los dominios autorizados.
3. Publica el contenido de `firestore.rules` en Firebase Console > Firestore Database > Reglas.
4. Abre la app desde el dominio autorizado y crea la primera cuenta con el correo
   `quilalaime@gmail.com`. Verifica el correo; esa cuenta recibirá el rol de superadministrador.
5. Maestros e ingenieros pueden registrarse y activar su cuenta al verificar el correo.
   Las solicitudes de administrador quedan pendientes hasta que el superadministrador
   las apruebe en Administración > Cuentas y roles.
6. El superadministrador puede asignar o cambiar roles desde esa misma sección.
   La cuenta de almacenero se asigna desde el panel, no mediante registro público.
7. En Administración > Eliminar solicitudes, solo el superadministrador puede borrar
   solicitudes. La eliminación también retira sus vales vinculados y deja una entrada
   de auditoría en Firestore y en el registro local.

Las cuentas de Firebase Authentication no se eliminan desde la aplicación. La
desactivación o eliminación definitiva de una cuenta se administra por separado
desde Firebase Console o un backend administrativo.

------------------------------------------------------------------------
3. SINCRONIZACIÓN EN TIEMPO REAL
------------------------------------------------------------------------
Con Firebase conectado:
- Cada nueva solicitud creada por un maestro se guarda al instante en 
  la colección `requests` de Cloud Firestore.
- Si el Ingeniero Residente aprueba una solicitud desde otro equipo conectado 
  al mismo proyecto, la pantalla del almacenero se actualizará automáticamente 
  sin necesidad de recargar la página gracias a los listeners en tiempo real.
- Los Vales de Salida quedan respaldados en la colección `deliveryVouchers`.

------------------------------------------------------------------------
4. REGLAS DE SEGURIDAD DE FIRESTORE (firestore.rules)
------------------------------------------------------------------------
En la carpeta encontrarás el archivo `firestore.rules`. Publica su contenido
en la pestaña "Reglas" (Rules) de Firestore antes de habilitar registros.
Las reglas verifican el correo, el estado activo y el rol en las operaciones
remotas; ocultar opciones en pantalla no sustituye estas reglas.

------------------------------------------------------------------------
5. ROLES DEL SISTEMA
------------------------------------------------------------------------
- Superadministrador: aprueba administradores de obra y administra los roles.
- Administrador de obra: administra las obras y la configuración operativa.
- Maestro de Obra: registra solicitudes de insumos.
- Ingeniero Residente: revisa y aprueba solicitudes.
- Almacenero: registra despachos y vales; lo asigna el superadministrador.

========================================================================
ObraControl © 2026 - Control Integral de Insumos y Materiales de Obra
========================================================================
