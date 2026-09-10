import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBan,
  cilCamera,
  cilCheckCircle,
  cilCloudUpload,
  cilImage,
  cilReload,
  cilWarning,
} from '@coreui/icons'

import { useCamara } from '../../hooks/useCamara'
import { useDeteccionPlaca } from '../../hooks/useDeteccionPlaca'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png']
const TAMANIO_MAXIMO = 4 * 1024 * 1024 // 4 MiB

const formatearConfianza = (confianza) => {
  if (confianza === undefined || confianza === null) return undefined
  const porcentaje = confianza <= 1 ? confianza * 100 : confianza
  return `${porcentaje.toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`
}

const formatearFecha = (fecha) => {
  const dia = fecha.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const hora = fecha.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1)
  return `${diaCapitalizado} · ${hora}`
}

const MonitoreoEntrada = () => {
  const videoRef = useRef(null)
  const camara = useCamara(videoRef)
  const { detectar, procesando, error: errorDeteccion, resultado, reiniciar } = useDeteccionPlaca()

  const inputArchivoRef = useRef(null)
  const [imagen, setImagen] = useState(null)
  const [errorValidacion, setErrorValidacion] = useState('')
  const [ahora, setAhora] = useState(new Date())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 30000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    return () => {
      if (imagen?.previewUrl) URL.revokeObjectURL(imagen.previewUrl)
    }
  }, [imagen])

  const establecerImagen = (blob, nombre) => {
    if (imagen?.previewUrl) URL.revokeObjectURL(imagen.previewUrl)
    setImagen({ blob, previewUrl: URL.createObjectURL(blob), nombre })
    setErrorValidacion('')
    reiniciar()
  }

  const validarArchivo = (archivo) => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return 'Formato no admitido. Selecciona una imagen JPG o PNG.'
    }
    if (archivo.size > TAMANIO_MAXIMO) {
      return 'La imagen supera el tamaño máximo permitido (4 MiB).'
    }
    return ''
  }

  const manejarCapturaFoto = async () => {
    try {
      const blob = await camara.capturarFoto()
      const problema = validarArchivo(blob)
      if (problema) {
        setErrorValidacion(problema)
        return
      }
      establecerImagen(blob, 'captura-camara.jpg')
    } catch (err) {
      setErrorValidacion(err.message)
    }
  }

  const manejarArchivoSeleccionado = (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    const problema = validarArchivo(archivo)
    if (problema) {
      setErrorValidacion(problema)
      return
    }
    establecerImagen(archivo, archivo.name)
  }

  const manejarDetectar = () => {
    if (imagen?.blob) detectar(imagen.blob)
  }

  const manejarNuevaCaptura = () => {
    if (imagen?.previewUrl) URL.revokeObjectURL(imagen.previewUrl)
    setImagen(null)
    setErrorValidacion('')
    reiniciar()
  }

  const imagenMarcada =
    resultado?.imagen_marcada?.base64 && resultado?.imagen_marcada?.mime_type
      ? `data:${resultado.imagen_marcada.mime_type};base64,${resultado.imagen_marcada.base64}`
      : null

  const vehiculo = resultado?.vehiculo

  const renderCampo = (etiqueta, valor) => (
    <CRow className="mb-1">
      <CCol xs={5} className="text-body-secondary">
        {etiqueta}
      </CCol>
      <CCol xs={7}>
        <strong>{valor ?? '—'}</strong>
      </CCol>
    </CRow>
  )

  const renderResultado = () => {
    if (procesando) {
      return (
        <div className="text-center py-5">
          <CSpinner color="success" />
          <p className="mt-3">Procesando imagen...</p>
        </div>
      )
    }

    if (errorDeteccion) {
      return (
        <>
          <CAlert color="danger" className="d-flex align-items-center gap-2">
            <CIcon icon={cilWarning} />
            {errorDeteccion}
          </CAlert>
          {imagen && (
            <CButton color="secondary" variant="outline" onClick={manejarDetectar}>
              <CIcon icon={cilReload} className="me-1" />
              Reintentar
            </CButton>
          )}
        </>
      )
    }

    if (!resultado) {
      return (
        <div className="text-center text-body-secondary py-5">
          <CIcon icon={cilImage} size="xl" className="mb-2" />
          <p className="mb-0">
            Aún no se ha procesado ninguna imagen. Captura o selecciona una fotografía y presiona{' '}
            <strong>Detectar placa</strong>.
          </p>
        </div>
      )
    }

    return (
      <>
        {resultado.estado === 'encontrado' && (
          <CAlert color="success" className="d-flex align-items-center gap-2 fw-bold">
            <CIcon icon={cilCheckCircle} />
            VEHÍCULO ENCONTRADO
          </CAlert>
        )}

        {resultado.estado === 'no_registrado' && (
          <CAlert color="danger" className="d-flex align-items-center gap-2 fw-bold">
            <CIcon icon={cilBan} />
            VEHÍCULO NO REGISTRADO
          </CAlert>
        )}

        {resultado.estado === 'sin_placa' && (
          <CAlert color="warning" className="d-flex align-items-center gap-2">
            <CIcon icon={cilWarning} />
            No se detectó ninguna placa en la imagen. Captura nuevamente con mejor encuadre.
          </CAlert>
        )}

        {resultado.estado === 'baja_confianza' && (
          <CAlert color="warning" className="d-flex align-items-center gap-2">
            <CIcon icon={cilWarning} />
            La confianza del reconocimiento es baja. Vuelve a capturar la imagen con mejor
            iluminación y enfoque.
          </CAlert>
        )}

        {resultado.estado === 'multiples_placas' && (
          <CAlert color="warning" className="d-flex align-items-center gap-2">
            <CIcon icon={cilWarning} />
            Se detectaron varias placas en la imagen. Captura únicamente el vehículo que ingresa.
          </CAlert>
        )}

        {![
          'encontrado',
          'no_registrado',
          'sin_placa',
          'baja_confianza',
          'multiples_placas',
        ].includes(resultado.estado) && (
          <CAlert color="secondary">
            Estado no reconocido devuelto por el servicio: <code>{resultado.estado}</code>
          </CAlert>
        )}

        {imagenMarcada && (
          <img
            src={imagenMarcada}
            alt="Vehículo con placa detectada"
            className="img-fluid rounded mb-3 border"
          />
        )}

        {(resultado.placa || resultado.confianza !== undefined) && (
          <CCard className="mb-3">
            <CCardBody>
              {renderCampo('Placa detectada', resultado.placa)}
              {renderCampo('Confianza OCR', formatearConfianza(resultado.confianza))}
              {renderCampo('Estado', resultado.estado)}
              {renderCampo('Vehículo encontrado', resultado.vehiculo_encontrado ? 'Sí' : 'No')}
            </CCardBody>
          </CCard>
        )}

        {resultado.estado === 'no_registrado' && (
          <CAlert color="danger">
            <strong>Ingreso no autorizado.</strong> La placa no existe en la base de datos de
            Supabase.
          </CAlert>
        )}

        {resultado.estado === 'encontrado' && vehiculo && (
          <CCard>
            <CCardBody>
              <CRow className="mb-3">
                <CCol xs={6} className="text-center">
                  {vehiculo.foto_url && (
                    <img
                      src={vehiculo.foto_url}
                      alt={`${vehiculo.marca ?? ''} ${vehiculo.modelo ?? ''}`}
                      className="img-fluid rounded mb-1"
                      style={{ maxHeight: '120px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="small text-body-secondary">Vehículo</div>
                </CCol>
                <CCol xs={6} className="text-center">
                  {vehiculo.foto_propietario_url && (
                    <img
                      src={vehiculo.foto_propietario_url}
                      alt={`Fotografía de ${vehiculo.propietario_nombre ?? 'propietario'}`}
                      className="rounded-circle mb-1"
                      width="80"
                      height="80"
                      style={{ objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="small text-body-secondary">Propietario</div>
                </CCol>
              </CRow>

              {renderCampo('Marca', vehiculo.marca)}
              {renderCampo('Modelo', vehiculo.modelo)}
              {renderCampo('Año', vehiculo.anio)}
              {renderCampo('Color', vehiculo.color)}
              {renderCampo('Tipo', vehiculo.tipo)}
              {renderCampo('Propietario', vehiculo.propietario_nombre)}
              {renderCampo('Cédula', vehiculo.cedula_enmascarada)}
              <CRow className="mb-1">
                <CCol xs={5} className="text-body-secondary">
                  Autorización
                </CCol>
                <CCol xs={7}>
                  <CBadge color={vehiculo.autorizado ? 'success' : 'danger'}>
                    {vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}
                  </CBadge>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        )}

        <CButton color="success" variant="outline" className="mt-3" onClick={manejarNuevaCaptura}>
          <CIcon icon={cilReload} className="me-1" />
          Procesar otra imagen
        </CButton>
      </>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>Monitoreo de entrada</strong>
          <div className="small text-body-secondary">
            Reconocimiento automático de placas en tiempo real.
          </div>
        </div>
        <small className="text-body-secondary">{formatearFecha(ahora)}</small>
      </CCardHeader>

      <CCardBody>
        <CRow className="g-4">
          <CCol md={6}>
            <CCard className="h-100">
              <CCardHeader>
                <CIcon icon={cilImage} className="me-2" />
                Captura del vehículo
              </CCardHeader>
              <CCardBody>
                <div
                  className="d-flex align-items-center justify-content-center bg-body-tertiary rounded mb-3"
                  style={{ minHeight: '260px', overflow: 'hidden' }}
                >
                  {imagen ? (
                    <img
                      src={imagen.previewUrl}
                      alt="Imagen seleccionada del vehículo"
                      className="img-fluid"
                      style={{ maxHeight: '320px' }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-100"
                      style={{
                        maxHeight: '320px',
                        display: camara.activa ? 'block' : 'none',
                        objectFit: 'cover',
                      }}
                    />
                  )}

                  {!imagen && !camara.activa && (
                    <div className="text-center text-body-secondary p-4">
                      <CIcon icon={cilCamera} size="xl" className="mb-2" />
                      <p className="mb-0">
                        Activa la cámara o selecciona una imagen para comenzar.
                      </p>
                    </div>
                  )}
                </div>

                {camara.error && <CAlert color="danger">{camara.error}</CAlert>}
                {errorValidacion && <CAlert color="danger">{errorValidacion}</CAlert>}

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {!camara.activa ? (
                    <CButton color="success" onClick={camara.iniciar} disabled={Boolean(imagen)}>
                      <CIcon icon={cilCamera} className="me-1" />
                      Activar cámara
                    </CButton>
                  ) : (
                    <CButton color="secondary" onClick={camara.detener}>
                      Detener cámara
                    </CButton>
                  )}

                  <CButton color="primary" onClick={manejarCapturaFoto} disabled={!camara.activa}>
                    <CIcon icon={cilCamera} className="me-1" />
                    Nueva captura
                  </CButton>

                  <CButton
                    color="secondary"
                    variant="outline"
                    onClick={() => inputArchivoRef.current?.click()}
                  >
                    <CIcon icon={cilCloudUpload} className="me-1" />
                    Subir otra imagen
                  </CButton>

                  <input
                    ref={inputArchivoRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    onChange={manejarArchivoSeleccionado}
                  />
                </div>

                <p className="small text-body-secondary mb-3">
                  Formatos admitidos: JPG o PNG. Tamaño máximo: 4 MiB.
                </p>

                <CButton
                  color="success"
                  size="lg"
                  className="w-100"
                  disabled={!imagen || procesando}
                  onClick={manejarDetectar}
                >
                  {procesando && <CSpinner size="sm" className="me-2" />}
                  Detectar placa
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol md={6}>
            <CCard className="h-100">
              <CCardHeader>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Resultado del reconocimiento
              </CCardHeader>
              <CCardBody>{renderResultado()}</CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default MonitoreoEntrada
