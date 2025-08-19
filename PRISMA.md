# 🗄️ Configuración de Prisma - Plataforma de Transparencia

Este proyecto utiliza Prisma como ORM para gestionar la base de datos PostgreSQL.

## 📋 Modelos de Base de Datos

### Document

Modelo para almacenar documentos de transparencia:

- `id`: Identificador único
- `title`: Título del documento
- `description`: Descripción opcional
- `category`: Categoría del documento
- `fileUrl`: URL del archivo
- `fileType`: Tipo de archivo (PDF, DOC, etc.)
- `fileSize`: Tamaño del archivo en bytes
- `isPublic`: Indica si el documento es público
- `publishedAt`: Fecha de publicación
- `updatedAt`: Fecha de última actualización
- `createdAt`: Fecha de creación

### Category

Modelo para categorías de documentos:

- `id`: Identificador único
- `name`: Nombre de la categoría
- `description`: Descripción opcional
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### User

Modelo para usuarios del sistema:

- `id`: Identificador único
- `email`: Email único del usuario
- `name`: Nombre del usuario
- `role`: Rol del usuario (USER, ADMIN, MODERATOR)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

## 🚀 Comandos Disponibles

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear y ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (interfaz visual)
npm run prisma:studio

# Resetear la base de datos
npm run prisma:reset

# Ejecutar el seed de datos de prueba
npm run prisma:seed
```

## 🔧 Configuración Inicial

1. **Base de datos local**: El proyecto está configurado para usar Prisma Postgres local
2. **Variables de entorno**: La URL de conexión está en el archivo `.env`
3. **Cliente generado**: El cliente se genera en `src/generated/prisma`

## 🌱 Datos de Prueba

El archivo `prisma/seed.ts` contiene datos de ejemplo que incluyen:

- 4 categorías predefinidas (Presupuesto, Contratos, Normatividad, Informes)
- 4 documentos de ejemplo
- 1 usuario administrador

## 📡 API Routes

### Documentos

- `GET /api/documents` - Obtener todos los documentos públicos
- `POST /api/documents` - Crear un nuevo documento

### Categorías

- `GET /api/categories` - Obtener todas las categorías
- `POST /api/categories` - Crear una nueva categoría

## 💡 Uso en el Código

```typescript
// Importar el cliente de Prisma
import { prisma } from "@/lib/prisma";

// Ejemplo de consulta
const documents = await prisma.document.findMany({
  where: {
    isPublic: true,
    category: "Presupuesto",
  },
  orderBy: {
    publishedAt: "desc",
  },
});
```

## 🔗 Enlaces Útiles

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
