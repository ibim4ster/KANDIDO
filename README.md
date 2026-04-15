# Kandido - AI-Powered Recruitment Management System

<details>
<summary>🇺🇸 English Version</summary>

## English Version

Kandido is an intelligent recruitment management system that transforms unstructured resume data into structured, searchable candidate profiles using Google's Gemini AI. Built as a modern Single Page Application, it streamlines the entire recruitment workflow from CV ingestion to AI-powered candidate analysis.

### ✨ Key Features

- **AI-Powered CV Processing**: Automatically extracts and structures information from PDF and TXT files
- **Semantic Search**: Natural language search to find candidates matching specific criteria
- **Interview Question Generation**: Creates personalized interview questions based on candidate profiles
- **Gap Analysis**: Identifies inconsistencies and potential red flags in resumes
- **Profile Translation**: Translates candidate profiles to multiple languages
- **Real-time Dashboard**: Live updates and candidate management interface

### 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript | UI components and state management |
| **Styling** | Tailwind CSS v4 | Modern utility-first styling |
| **Backend** | Firebase (Auth + Firestore) | Authentication and real-time database |
| **AI Engine** | Google Gemini API | Natural language processing and analysis |
| **Build Tool** | Vite | Fast development and optimized builds |

### 🚀 Quick Start

1. **Prerequisites**: Node.js installed
2. **Installation**:
   ```bash
   npm install
   ```
3. **Environment Setup**: Create `.env.local` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the provided local URL

### 📋 Usage Guide

1. **Upload CV**: Drag and drop PDF or TXT files containing resumes
2. **AI Processing**: The system automatically extracts and structures candidate information
3. **Review Profiles**: View detailed candidate profiles with organized sections
4. **AI Analysis**: Use AI tools to generate feedback, interview questions, and perform gap analysis
5. **Search Candidates**: Use semantic search to find candidates matching specific requirements

### 🏗 Architecture Overview

The application follows a three-layer architecture:

- **UI Layer**: React components managing user interactions and real-time updates
- **AI Utility Layer**: Centralized Gemini API interactions for text processing and analysis
- **Data Layer**: Firebase for authentication and persistent storage

### 🔧 Configuration

- **Firebase**: Configure your Firebase project credentials in `src/firebase.ts`
- **Gemini API**: Obtain API key from Google AI Studio and set in environment variables
- **Multi-tenant**: Each user only sees their own uploaded candidates

</details>

<details>
<summary>🇪🇸 Versión en Español</summary>

## Versión en Español

Kandido es un sistema inteligente de gestión de reclutamiento que transforma datos no estructurados de currículums en perfiles de candidatos estructurados y buscables utilizando la IA de Google Gemini. Construido como una Aplicación de Página Única moderna, optimiza todo el flujo de trabajo de reclutamiento desde la ingesta de CV hasta el análisis de candidatos impulsado por IA.

### ✨ Características Principales

- **Procesamiento de CV con IA**: Extrae y estructura automáticamente información de archivos PDF y TXT
- **Búsqueda Semántica**: Búsqueda en lenguaje natural para encontrar candidatos que coincidan con criterios específicos
- **Generación de Preguntas de Entrevista**: Crea preguntas de entrevista personalizadas basadas en los perfiles de los candidatos
- **Análisis de Huecos**: Identifica inconsistencias y posibles banderas rojas en los currículums
- **Traducción de Perfiles**: Traduce perfiles de candidatos a múltiples idiomas
- **Panel en Tiempo Real**: Interfaz de gestión de candidatos con actualizaciones en vivo

### 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Frontend** | React + TypeScript | Componentes UI y gestión de estado |
| **Estilos** | Tailwind CSS v4 | Estilizado moderno utility-first |
| **Backend** | Firebase (Auth + Firestore) | Autenticación y base de datos en tiempo real |
| **Motor IA** | Google Gemini API | Procesamiento de lenguaje natural y análisis |
| **Build Tool** | Vite | Desarrollo rápido y builds optimizados |

### 🚀 Inicio Rápido

1. **Prerrequisitos**: Node.js instalado
2. **Instalación**:
   ```bash
   npm install
   ```
3. **Configuración de Entorno**: Crea `.env.local` con tu API key de Gemini:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   ```
4. **Ejecutar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
5. Abre tu navegador y navega a la URL local proporcionada

### 📋 Guía de Uso

1. **Subir CV**: Arrastra y suelta archivos PDF o TXT que contengan currículums
2. **Procesamiento IA**: El sistema extrae y estructura automáticamente la información del candidato
3. **Revisar Perfiles**: Visualiza perfiles detallados de candidatos con secciones organizadas
4. **Análisis IA**: Utiliza herramientas de IA para generar feedback, preguntas de entrevista y realizar análisis de huecos
5. **Buscar Candidatos**: Usa búsqueda semántica para encontrar candidatos que cumplan requisitos específicos

### 🏗 Visión General de la Arquitectura

La aplicación sigue una arquitectura de tres capas:

- **Capa UI**: Componentes React que gestionan interacciones del usuario y actualizaciones en tiempo real
- **Capa de Utilidades IA**: Interacciones centralizadas con la API de Gemini para procesamiento y análisis de texto
- **Capa de Datos**: Firebase para autenticación y almacenamiento persistente

### 🔧 Configuración

- **Firebase**: Configura las credenciales de tu proyecto Firebase en `src/firebase.ts`
- **Gemini API**: Obtén la API key de Google AI Studio y configúrala en variables de entorno
- **Multi-tenant**: Cada usuario solo ve sus propios candidatos subidos

</details>

## Notes

This README provides comprehensive documentation in both English and Spanish with separate collapsible sections for each language. The content describes the application's functionality, features, and setup instructions without including code citations or hyperlinks to the codebase. The documentation covers the AI-powered CV processing pipeline, real-time dashboard, semantic search capabilities, and various analysis features available in the recruitment management system.

Wiki pages you might want to explore:
- [Kandido — Project Overview (ibim4ster/KANDIDO)](/wiki/ibim4ster/KANDIDO#1)
- [Core Architecture (ibim4ster/KANDIDO)](/wiki/ibim4ster/KANDIDO#2)
