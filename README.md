# 📊 Tablero Kanban Colaborativo en Tiempo Real

Sistema completo de gestión de tareas tipo Trello con colaboración en tiempo real mediante WebSockets y exportación automatizada de backlog vía email.

## 🎯 Características

- ✅ **Tablero Kanban** con 5 columnas (Backlog, To Do, In Progress, Review, Done)
- 🔄 **Sincronización en Tiempo Real** con WebSockets
- 🎨 **Drag & Drop** fluido para mover tarjetas
- 👥 **Colaboración Multiusuario** simultánea
- 📧 **Exportación Automática** de backlog a CSV vía email
- 🎭 **Interfaz Moderna** y responsiva
- ⚡ **Actualizaciones Instantáneas** entre usuarios

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd useTeam-PT
```

### 2. Configurar Variables de Entorno

Copiar y configurar los archivos `.env`:

```bash
# Raíz del proyecto
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Editar los archivos `.env` con tus configuraciones.

### 3. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Configurar N8N

```bash
# Levantar N8N con Docker
docker-compose up -d n8n

# O ejecutar N8N standalone
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n:1.106.3
```

**Configuración de N8N:**
1. Acceder a `http://localhost:5678`
2. Crear cuenta de administrador
3. Importar el workflow desde `n8n/workflow.json`
4. Configurar credenciales SMTP
5. Activar el workflow

### 5. Iniciar el Backend

```bash
cd backend
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 6. Iniciar el Frontend

```bash
cd frontend
npm start
```

El frontend estará disponible en `http://localhost:3001`

## 📖 Uso

### Crear Tarjetas

1. Click en "+ Agregar tarjeta" en cualquier columna
2. Ingresar título y descripción (opcional)
3. Click en "Agregar"

### Mover Tarjetas (Drag & Drop)

1. Arrastrar una tarjeta
2. Soltar en la columna/posición deseada
3. Los cambios se sincronizan automáticamente con otros usuarios

### Editar Tarjetas

1. Click en el ícono de edición (✏️)
2. Modificar título y/o descripción
3. Click en "Guardar"

### Eliminar Tarjetas

1. Click en el ícono de eliminación (🗑️)
2. La tarjeta se elimina inmediatamente

### Exportar Backlog

1. Click en "📧 Exportar Backlog" en el header
2. Ingresar email de destino
3. Click en "Enviar CSV"
4. Recibirás el archivo CSV por email

## 🔌 API Endpoints

### Kanban

- `GET /api/kanban/cards` - Obtener todas las tarjetas
- `GET /api/kanban/cards/:id` - Obtener una tarjeta
- `POST /api/kanban/cards` - Crear tarjeta
- `PATCH /api/kanban/cards/:id` - Actualizar tarjeta
- `PATCH /api/kanban/cards/:id/move` - Mover tarjeta
- `DELETE /api/kanban/cards/:id` - Eliminar tarjeta

### Export

- `POST /api/export/backlog` - Exportar backlog
- `GET /api/export/health` - Verificar estado de N8N

## 🔄 WebSocket Events

### Eventos Emitidos por el Cliente

- `card:created` - Cuando se crea una tarjeta
- `card:moved` - Cuando se mueve una tarjeta
- `card:updated` - Cuando se actualiza una tarjeta
- `card:deleted` - Cuando se elimina una tarjeta

### Eventos Recibidos por el Cliente

- `card:created` - Tarjeta creada por otro usuario
- `card:moved` - Tarjeta movida por otro usuario
- `card:updated` - Tarjeta actualizada por otro usuario
- `card:deleted` - Tarjeta eliminada por otro usuario
- `users:count` - Número de usuarios conectados

**Desarrollado para useTeam** | Prueba Técnica - Tablero Kanban Colaborativo 🚀