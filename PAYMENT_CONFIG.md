# Stripe y PayPal Configuration

## Variábles de Entorno a Agregar

Actualiza tu `.env.local` con lo siguiente:

### Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### PayPal
```env
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx
PAYPAL_MODE=sandbox  # o 'live' para producción
```

## Instalación de Dependencias

```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

## Configuración en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega todas las variables anteriores

## URLs de Callback

Cuando configures PayPal, agrega estas URLs:

- **Return URL (Success):** `https://tudominio.com/paypal-return`
- **Cancel URL:** `https://tudominio.com/checkout`

## Testing en Desarrollo

### Tarjetas de Prueba Stripe:
- **Éxito:** 4242 4242 4242 4242
- **Rechazada:** 4000 0000 0000 0002
- Fecha: cualquiera en el futuro
- CVC: cualquier 3 dígitos

### PayPal Sandbox:
- Usa cuentas de prueba desde tu dashboard de PayPal
