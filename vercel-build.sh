#!/bin/bash
# Script para asegurar que Git LFS descargue los archivos antes del build

# Instalar Git LFS si no está instalado
if ! command -v git-lfs &> /dev/null; then
  echo "Instalando Git LFS..."
  # En Vercel, Git LFS debería estar disponible, pero verificamos
  git lfs version || echo "Git LFS no disponible, continuando..."
fi

# Descargar archivos LFS
echo "Descargando archivos de Git LFS..."
git lfs pull || echo "No se pudieron descargar archivos LFS, continuando con el build..."

# Continuar con el build normal
npm run build
