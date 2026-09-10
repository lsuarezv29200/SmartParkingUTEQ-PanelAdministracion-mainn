# UTEQ Smart Parking: vehículos y propietarios
<img width="1880" height="940" alt="image" src="https://github.com/user-attachments/assets/3ce892e5-1619-46e5-8dc3-0cfd8e5b0c85" />
<img width="1908" height="948" alt="image" src="https://github.com/user-attachments/assets/b7b0b5bd-80b0-4edc-ade4-5330344bf39b" />



Panel administrativo desarrollado con React, Vite y CoreUI para consultar y visualizar los vehículos autorizados del sistema UTEQ Smart Parking, y para monitorear el ingreso vehicular mediante reconocimiento automático de placas.

## Prácticas realizadas

### 1. Vehículos y propietarios (`/parqueadero/vehiculos`)

Consulta de la tabla `vehiculos` de Supabase con:

- Fotografía del vehículo con enlace a la fuente original.
- Fotografía circular del propietario.
- Matrícula, marca, modelo, año y color.
- Nombre del propietario, cédula enmascarada y correo institucional.
- Estado de autorización del vehículo.
- Búsqueda por placa, marca, modelo, color, propietario o correo.
- Paginación de 10 registros por página.
- Indicador de carga, mensaje de error y botón **Actualizar**.

Solo consulta y visualización: no incluye formularios CRUD, sensores, Firebase ni autenticación.

### 2. Monitoreo de entrada (`/parqueadero/monitoreo-entrada`)

Vista de dos columnas para el reconocimiento automático de placas al ingreso del parqueadero:

**Captura del vehículo (izquierda)**

- Vista previa de la cámara en tiempo real (`navigator.mediaDevices.getUserMedia`), con preferencia por la cámara trasera en dispositivos móviles (`facingMode: 'environment'`).
- Botones para activar/detener la cámara y capturar una fotografía (canvas → Blob JPEG).
- Alternativa para seleccionar una imagen JPG o PNG desde el dispositivo.
- Validación de formato (`image/jpeg`, `image/png`) y tamaño máximo (4 MiB) antes de enviar.
- Botón **Detectar placa**, deshabilitado mientras se procesa la solicitud.
- Mensajes de error claros (cámara no disponible, permiso denegado, archivo inválido).

**Resultado del reconocimiento (derecha)**

- Imagen devuelta por la API con la placa marcada (`imagen_marcada.base64` + `mime_type`).
- Estado del reconocimiento, placa detectada y confianza del OCR.
- Datos del vehículo y propietario cuando la placa está registrada en Supabase.
- Mensaje de **vehículo no registrado** cuando la placa no existe.
- Manejo de los estados `sin_placa`, `baja_confianza`, `multiples_placas` y de errores HTTP (400, 413, 415, 502, 504).

La cámara se libera automáticamente al salir de la vista (cleanup del hook `useCamara`).

## Tecnologías utilizadas

- React 19
- Vite
- CoreUI React
- Supabase JavaScript Client
- Sass

## Configuración

Crear un archivo `.env.local` en la raíz del proyecto (no se publica en el repositorio):

```dotenv
VITE_SUPABASE_URL=https://SU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SU_CLAVE
VITE_OCR_ENDPOINT=https://SU_ENDPOINT_OCR/api/detectar-placa?code=SU_CODIGO
```

No se deben publicar `.env.local`, claves secretas, `service_role` ni el código de acceso del endpoint OCR en el repositorio ni en los componentes de React.

## Instalación y ejecución

```powershell
npm.cmd install
npm.cmd start
```

Abrir en el navegador (la cámara requiere HTTPS o `localhost`):

```text
http://localhost:3000/#/parqueadero/monitoreo-entrada
```

Para generar la compilación de producción:

```powershell
npm.cmd run build
```

## Estructura principal

```text
src/
├── _nav.jsx                              # Opciones laterales de Parqueadero
├── routes.js                             # Rutas /parqueadero/*
├── hooks/
│   ├── useVehiculos.js                   # Consulta y recarga de Supabase
│   ├── useCamara.js                      # getUserMedia, captura y liberación de cámara
│   └── useDeteccionPlaca.js              # Consumo del endpoint OCR
├── lib/
│   └── supabase.js                       # Cliente de Supabase
├── components/
│   ├── AppSidebar.jsx                    # Logo del panel
│   └── ...
└── views/
    └── parqueadero/
        ├── ListaVehiculos.jsx            # Tabla, búsqueda y paginación
        └── MonitoreoEntrada.jsx          # Captura + resultado del reconocimiento
```

## Despliegue en Azure Static Web Apps

1. Crear un recurso **Azure Static Web App** (plan gratuito) en Azure Portal, apuntando a este repositorio de GitHub (rama `main`), con:
   - App location: `/`
   - Output location: `build`
2. Azure crea automáticamente un secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` en el repositorio de GitHub.
3. Agregar además estos secretos en **GitHub → Settings → Secrets and variables → Actions**:
   - `VITE_OCR_ENDPOINT`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. El workflow [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml) compila el proyecto inyectando esos secretos como variables de entorno de Vite y despliega el contenido de `build/`.
5. Azure Static Web Apps expone la aplicación con **HTTPS habilitado por defecto**, necesario para que el navegador autorice el acceso a la cámara.

## Verificación de la práctica

1. Se carguen los 38 vehículos en `Vehículos y propietarios`.
2. Se visualicen las fotografías del vehículo y del propietario, y la cédula aparezca enmascarada.
3. La búsqueda y la paginación funcionen correctamente.
4. En `Monitoreo de entrada`, la cámara y la carga de archivos funcionen, con validación de formato y tamaño.
5. El endpoint OCR se consuma con `fetch` y `Content-Type` binario (no JSON con Base64).
6. Se muestre correctamente la imagen con la placa marcada, y los datos del vehículo/propietario cuando la placa está registrada.
7. Se controlen los estados `no_registrado`, `sin_placa`, `baja_confianza`, `multiples_placas` y los errores HTTP.
8. No existan opciones ni formularios para insertar, modificar o eliminar vehículos.
