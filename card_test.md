# Tarjetas de prueba de Stripe

> Solo funcionan en **modo test**. No mueven dinero real: simulan respuestas del
> procesador. Con claves `pk_live` / `sk_live` serán rechazadas.

## Antes de empezar

| Dónde | Variable | Valor |
|---|---|---|
| Frontend (`.env`) | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| Backend (`config.env` / `.env`) | `STRIPE_SECRET_KEY` | `sk_test_...` |

Las dos claves deben ser del **mismo modo** (test) y de la **misma cuenta** de
Stripe. Una `rk_test_...` (restricted key) **no sirve**: no tiene permiso para
crear PaymentIntents.

## Datos comunes a todas las tarjetas

| Campo | Qué poner | Ejemplo |
|---|---|---|
| **MM/YY** | Cualquier fecha **futura** | `12/34` |
| **CVC** | Cualquier **3 dígitos** | `123` |
| **CVC (Amex)** | Cualquier **4 dígitos** | `1234` |
| **ZIP / código postal** | Cualquiera | `12345` |
| **Nombre** | Cualquiera | `Test User` |

Stripe no valida estos campos en test: solo el **número de tarjeta** determina el
resultado. Una fecha pasada sí falla, pero por validación del formulario, no del
procesador.

---

## ✅ Pagos exitosos

| Número | MM/YY | CVC | Marca |
|---|---|---|---|
| `4242 4242 4242 4242` | `12/34` | `123` | Visa |
| `4000 0566 5566 5556` | `12/34` | `123` | Visa (débito) |
| `5555 5555 5555 4444` | `12/34` | `123` | Mastercard |
| `2223 0031 2200 3222` | `12/34` | `123` | Mastercard (serie 2) |
| `3782 822463 10005` | `12/34` | `1234` | American Express |
| `6011 1111 1111 1117` | `12/34` | `123` | Discover |

La más usada es la **`4242 4242 4242 4242`**. Úsala para el camino feliz.

---

## 🔐 3D Secure — flujo `requiresAction`

Abren el reto del banco. Sirven para probar que `processPayment` guarda el
`paymentIntentId` y que el frontend redirige al `clientSecret`.

| Número | MM/YY | CVC | Comportamiento |
|---|---|---|---|
| `4000 0025 0000 3155` | `12/34` | `123` | Pide autenticación la primera vez |
| `4000 0027 6000 3184` | `12/34` | `123` | Pide autenticación **en cada pago** |

En el modal de Stripe hay que pulsar **Complete** para simular el éxito, o
**Fail** para simular que el cliente no autentica.

---

## ❌ Tarjetas rechazadas

Para comprobar que los mensajes de error llegan traducidos al usuario
(`getFriendlyPaymentError` en `Payment.tsx`).

| Número | MM/YY | CVC | Código de error |
|---|---|---|---|
| `4000 0000 0000 0002` | `12/34` | `123` | `card_declined` (rechazo genérico) |
| `4000 0000 0000 9995` | `12/34` | `123` | `insufficient_funds` |
| `4000 0000 0000 9987` | `12/34` | `123` | `lost_card` |
| `4000 0000 0000 9979` | `12/34` | `123` | `stolen_card` |
| `4000 0000 0000 0069` | `12/34` | `123` | `expired_card` |
| `4000 0000 0000 0127` | `12/34` | `123` | `incorrect_cvc` |
| `4000 0000 0000 0119` | `12/34` | `123` | `processing_error` |

> `expired_card` se rechaza **aunque pongas una fecha futura**: el rechazo lo
> decide el número, no la fecha.

---

## Qué comprobar en cada prueba

Además de que el cobro pase o falle, conviene verificar que el flujo posterior
quedó completo. Al confirmarse un pago, `finalizeOrder` debe:

1. Marcar la orden como `paid` con `paymentIntentId`, `paidAt` y `invoiceNumber`.
2. Suscribir al jugador al getaway.
3. **Consumir el cupón**: el uid pasa a `usersUsed[]` y se borra su *hold*.
4. **Inscribir en las actividades**: el uid se añade a `scheduled[].players[]` de
   cada clase de academia, y a `players[]` de torneos y ladders.

Todo eso es *best-effort*: si algo de los puntos 2-4 falla, **el pago sigue
siendo válido** y el error queda en el log del backend.

## Errores de consola que NO son bugs

| Mensaje | Origen |
|---|---|
| `POST https://r.stripe.com/b net::ERR_BLOCKED_BY_CLIENT` | Telemetría de Stripe bloqueada por un ad-blocker |
| `Creating a worker from 'blob:...' violates ... worker-src` desde `content.bundle.js` | Una **extensión del navegador** inyectando código en el iframe de Stripe |

Ambos son ruido externo y no afectan al cobro. Para descartarlos, prueba en una
ventana de incógnito sin extensiones.

---

Más escenarios (disputas, reembolsos, métodos por país):
<https://stripe.com/docs/testing>
