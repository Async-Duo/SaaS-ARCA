# 🚀 FacturAR - SaaS de Facturación Electrónica ARCA (AFIP)

Sistema web full-stack desarrollado para la gestión integral de usuarios y la emisión automatizada de comprobantes electrónicos (Facturas C) homologados contra **ARCA (ex-AFIP)** en Argentina.

---

## 🛠️ Stack Tecnológico

### Backend
* **Node.js** con **Express** (TypeScript)
* **Prisma ORM** + PostgreSQL
* **Bcrypt** para seguridad y hash de contraseñas
* **XML2JS & Axios** para consumo de Servicios Web SOAP de ARCA (WSAA y WSFE)

### Frontend
* **React** con **Vite** y TypeScript
* **Tailwind CSS** para el diseño de interfaces modernas y responsivas

---

## 📂 Estructura del Repositorio

```text
SaaS-ARCA/
├── backend/
│   ├── prisma/             # Esquema de base de datos y migraciones
│   ├── src/
│   │   ├── certificates/   # Almacenamiento seguro de certificados PKI (ignorados en git)
│   │   ├── routes/         # Endpoints de Autenticación, Comprobantes y Padrón
│   │   ├── arcaAuth.ts     # Lógica de autenticación con WSAA (Token y Sign)
│   │   ├── wsfeService.ts  # Servicio de emisión de comprobantes (WSFE)
│   │   └── index.ts        # Servidor principal Express
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Modales y componentes reutilizables
    │   └── pages/          # Vistas principales (Auth y Dashboard)
    └── package.json
⚙️ Configuración y Ejecución Local
Prerrequisitos
Node.js (versión 18 o superior recomendada)

PostgreSQL instalado y corriendo localmente

1. Clonar el repositorio
Bash
git clone [https://github.com/Async-Duo/SaaS-ARCA.git](https://github.com/Async-Duo/SaaS-ARCA.git)
cd SaaS-ARCA
2. Configurar el Backend
Bash
cd backend
npm install
Creá un archivo .env en la carpeta backend/ basado en tus credenciales locales de base de datos:

Fragmento de código
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tu_base"
PORT=3000
Ejecutá las migraciones de Prisma y levanta el servidor:

Bash
npx prisma migrate dev
npm run server
3. Configurar el Frontend
Abrí una nueva terminal en la raíz del proyecto:

Bash
cd frontend
npm install
npm run dev
