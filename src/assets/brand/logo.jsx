import React from 'react'

const Logo = ({
  width = 599,
  height = 116,
  className = '',
  title = 'Smart Parking UTEQ',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 599 116"
    width={width}
    height={height}
    className={className}
    role="img"
    aria-label={title}
    {...props}
  >
    <title>{title}</title>

    <g fill="none" fillRule="evenodd">
      {/* Símbolo principal */}
      <rect x="6" y="8" width="100" height="100" rx="24" fill="#00843D" />
      <rect
        x="13"
        y="15"
        width="86"
        height="86"
        rx="19"
        stroke="#7EE2A8"
        strokeWidth="2"
      />

      {/* Letra P de parqueadero */}
      <path
        fill="#FFFFFF"
        fillRule="nonzero"
        d="M28 29h31.5C79.3 29 91 39.2 91 55.5S79.3 82 59.5 82H49v15H28V29Zm21 17v19h10.5C66.8 65 71 61.6 71 55.5S66.8 46 59.5 46H49Z"
      />

      {/* Señal inalámbrica del sensor */}
      <path
        d="M68 28c8.8 0 16.6 3.9 22 10"
        stroke="#80D0FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M72 37c5.1 0 9.8 2.2 13 5.8"
        stroke="#80D0FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="78" cy="48" r="3.5" fill="#80D0FF" />

      {/* Indicador de puesto disponible */}
      <circle cx="87" cy="89" r="8" fill="#7EE2A8" />
      <path
        d="m83.5 89 2.4 2.5 4.8-5"
        stroke="#00843D"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nombre del sistema */}
      <g fontFamily="Arial, Helvetica, sans-serif">
        <text
          x="128"
          y="57"
          fill="currentColor"
          fontSize="36"
          fontWeight="800"
          letterSpacing="1.2"
        >
          SMART
        </text>
        <text
          x="278"
          y="57"
          fill="#00843D"
          fontSize="36"
          fontWeight="800"
          letterSpacing="1.2"
        >
          PARKING
        </text>

        {/* Identidad UTEQ */}
        <rect x="129" y="69" width="54" height="25" rx="6" fill="#00843D" />
        <text
          x="156"
          y="87"
          fill="#FFFFFF"
          fontSize="16"
          fontWeight="800"
          textAnchor="middle"
          letterSpacing="1"
        >
          UTEQ
        </text>
        <text
          x="196"
          y="87"
          fill="currentColor"
          fillOpacity="0.72"
          fontSize="14"
          fontWeight="600"
          letterSpacing="1.1"
        >
          PARQUEADERO INTELIGENTE
        </text>
      </g>
    </g>
  </svg>
)

export { Logo }
export default Logo
