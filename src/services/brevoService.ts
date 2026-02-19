// Servicio para integrar con Brevo API
const BREVO_API_URL = 'https://api.brevo.com/v3'
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY
const BREVO_LIST_ID = import.meta.env.VITE_BREVO_LIST_ID


export interface BrevoContact {
  email: string
  attributes: {
    NOMBRE_COMPLETO: string
  }
  listIds: number[]
  updateEnabled: boolean
}

export interface BrevoResponse {
  id: number
  email: string
  emailBlacklisted: boolean
  smsBlacklisted: boolean
  createdAt: string
  modifiedAt: string
  attributes: Record<string, any>
  listIds: number[]
  statistics: Record<string, any>
}

export class BrevoService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!BREVO_API_KEY) {
      throw new Error('Brevo API key no configurada')
    }

    const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorData = {}
      try {
        const responseText = await response.text()
        errorData = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Error de Brevo: ${response.status} - ${response.statusText}`)
      }
      throw new Error(`Error de Brevo: ${response.status} - ${(errorData as any).message || response.statusText}`)
    }

    try {
      const responseText = await response.text()
      return JSON.parse(responseText)
    } catch (parseError) {
      throw new Error('Error parseando respuesta de Brevo')
    }
  }

  static async addContactToRenacerList(name: string, email: string): Promise<BrevoResponse> {
    if (!BREVO_LIST_ID) {
      throw new Error(
        'VITE_BREVO_LIST_ID no configurado. Crea .env.local con VITE_BREVO_LIST_ID=<id> (el ID está en Brevo: Contacts > Lists).'
      )
    }

    const contactData: BrevoContact = {
      email: email.toLowerCase().trim(),
      attributes: {
        NOMBRE_COMPLETO: name.trim(),
      },
      listIds: [parseInt(BREVO_LIST_ID)],
      updateEnabled: true, // Actualizar si el contacto ya existe
    }

    try {
      // Intentar crear/actualizar el contacto
      const response = await this.makeRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      })

      return response
    } catch (error: any) {
      // Si el contacto ya existe, intentar actualizarlo
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        try {
          const updateResponse = await this.makeRequest(`/contacts/${email}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
          })
          return updateResponse
        } catch (updateError) {
          // Si no se puede actualizar, consideramos que ya está en la lista como éxito
          return {
            id: 0,
            email: email,
            emailBlacklisted: false,
            smsBlacklisted: false,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            attributes: contactData.attributes,
            listIds: contactData.listIds,
            statistics: {}
          }
        }
      }
      throw error
    }
  }

  static async getContact(email: string): Promise<BrevoResponse | null> {
    try {
      const response = await this.makeRequest(`/contacts/${email}`)
      return response
    } catch (error: any) {
      if (error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  static async getRenacerListInfo(): Promise<any> {
    if (!BREVO_LIST_ID) {
      throw new Error(
        'VITE_BREVO_LIST_ID no configurado. Crea .env.local con VITE_BREVO_LIST_ID=<id> (el ID está en Brevo: Contacts > Lists).'
      )
    }

    try {
      const response = await this.makeRequest(`/contacts/lists/${BREVO_LIST_ID}`)
      return response
    } catch (error) {
      console.error('Error obteniendo información de la lista:', error)
      throw error
    }
  }
}
