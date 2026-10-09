import logoUrl from '../assets/Logo_SinFondo.png'

/** Presenta el logotipo oficial con dimensiones configurables desde el llamador. */
function BrandLogo({ className = '' }) {
	return <img className={`object-contain ${className}`} src={logoUrl} alt="Logotipo de Antilow" />
}

export default BrandLogo