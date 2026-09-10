import { useCallback, useEffect, useRef, useState } from 'react'

// Recibe el ref del <video> desde el componente: así el objeto que este hook
// retorna no mezcla un ref con el resto del estado (evita falsos positivos
// de la regla react-hooks/refs con el React Compiler).
export const useCamara = (videoRef) => {
  const streamRef = useRef(null)
  const [activa, setActiva] = useState(false)
  const [error, setError] = useState('')

  const detener = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((pista) => pista.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActiva(false)
  }, [videoRef])

  const iniciar = useCallback(async () => {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador o dispositivo no permite acceder a la cámara.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setActiva(true)
    } catch (err) {
      setError(`No se pudo acceder a la cámara: ${err.message}`)
      setActiva(false)
    }
  }, [videoRef])

  const capturarFoto = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current

      if (!video || !streamRef.current) {
        reject(new Error('La cámara no está activa.'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const contexto = canvas.getContext('2d')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('No se pudo capturar la fotografía.'))
          }
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [videoRef])

  // Libera la cámara al desmontar el componente o cambiar de vista.
  useEffect(() => () => detener(), [detener])

  return { activa, error, iniciar, detener, capturarFoto }
}
