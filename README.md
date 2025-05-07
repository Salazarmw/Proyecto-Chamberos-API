# Proyecto-Chamberos-API

API RESTful para la plataforma Chamberos, desarrollada en Node.js con Express y MongoDB.

## Características

- Autenticación JWT (incluye login social con Google y Facebook)
- Gestión de usuarios (clientes y chamberos)
- Gestión de cotizaciones, trabajos, reseñas y etiquetas (tags)
- Almacenamiento de imágenes en AWS S3
- Protección de rutas con middlewares
- Arquitectura orientada a servicios

## Requisitos

- Node.js >= 16
- MongoDB Atlas (o local)
- AWS S3 (para imágenes)
- Variables de entorno configuradas en `.env`

## Instalación

```bash
cd Proyecto-Chamberos-API
npm install
