import logoUrl from '../assets/Logo_SinFondo.png'

function BrandLogo({ className = '' }) {
	return <img className={`object-contain ${className}`} src={logoUrl} alt="Logotipo de Antilow" />
}

export default BrandLogo