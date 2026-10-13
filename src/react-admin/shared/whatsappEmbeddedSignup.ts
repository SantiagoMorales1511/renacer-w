// Fuente de verdad para el frontend (src/pages/WhatsAppConnectAdmin.tsx).
// NOTA: api/whatsapp-embedded-signup-exchange.ts NO importa este archivo —
// un import cross-directorio hacia src/ rompe esa función en runtime de
// Vercel — así que mantiene sus propios literales duplicados. Si cambias
// WA_APP_ID o WA_EMBEDDED_SIGNUP_REDIRECT_URI aquí, actualiza también ese
// archivo.

// App ID de "Renacer Automation" — público por diseño del SDK de Facebook.
export const WA_APP_ID = '1057632283566600'

// Configuration ID de Facebook Login for Business para Embedded Signup.
export const WA_EMBEDDED_SIGNUP_CONFIG_ID = '1392010019794916'

// Debe coincidir EXACTAMENTE (protocolo, dominio, path, sin trailing slash,
// sin query params) con lo que Meta usó al abrir el diálogo de OAuth y con lo
// registrado en Meta App Dashboard > Facebook Login for Business >
// Configuración > URI de redireccionamiento OAuth válidos.
export const WA_EMBEDDED_SIGNUP_REDIRECT_URI = 'https://renacer-ahora.com/admin/whatsapp-connect'

export const GRAPH_API_VERSION = 'v25.0'
