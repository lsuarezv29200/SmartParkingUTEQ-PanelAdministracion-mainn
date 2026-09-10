import { useCallback, useState } from 'react'

const OCR_ENDPOINT = import.meta.env.VITE_OCR_ENDPOINT

const MENSAJES_HTTP = {
  400: 'La imagen está vacía, no es válida o tiene dimensiones no permitidas.',
  413: 'La imagen supera el tamaño máximo permitido (4 MiB).',
  415: 'El formato de la imagen no es compatible. Usa JPG o PNG.',
  502: 'El servicio de reconocimiento o Supabase no respondió correctamente. Intenta nuevamente.',
  504: 'Se agotó el tiempo de espera del servicio. Intenta nuevamente.',
}

export const useDeteccionPlaca = () => {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  const detectar = useCallback(async (archivo) => {
    if (!OCR_ENDPOINT) {
      setError('Falta configurar la variable de entorno VITE_OCR_ENDPOINT.')
      return
    }

    setProcesando(true)
    setError('')
    setResultado(null)

    try {
      const respuesta = await fetch(OCR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': archivo.type || 'application/octet-stream',
        },
        body: archivo,
      })

      if (!respuesta.ok) {
        setError(
          MENSAJES_HTTP[respuesta.status] ||
            `El servicio respondió con un error (HTTP ${respuesta.status}).`,
        )
        return
      }

      const datos = await respuesta.json()
      setResultado(datos)
    } catch (err) {
      setError(`No se pudo contactar el servicio de reconocimiento: ${err.message}`)
    } finally {
      setProcesando(false)
    }
  }, [])

  const reiniciar = useCallback(() => {
    setResultado(null)
    setError('')
  }, [])

  return { detectar, procesando, error, resultado, reiniciar }
}
