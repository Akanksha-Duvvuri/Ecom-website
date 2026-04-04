# TurNext >_ — Full Stack E-commerce Website

TurNext is a modern full-stack e-commerce web application built using Next.js, Firebase, and Stripe. It allows users to browse products, manage a cart, authenticate securely, and place real orders with live inventory updates and payment processing.

---

## Features

- Product browsing with dynamic data from Firestore
- Search & filtering on the shop page
- Price range slider and star rating filter
- Category-based filtering
- Sorting (price low–high, high–low, name A–Z)
- Individual product pages with size selector and stock-aware quantity control
- Product reviews with star ratings, stored in Firestore
- Wishlist — add/remove products, synced to Firestore
- Add to cart with quantity controls
- Increase / decrease / remove items from cart
- Stock limit enforcement (cannot exceed available inventory)
- Low stock badge ("Only X left") on product cards
- Order summary with GST (18%) and real-time total calculation
- Stripe payment integration (card, Google Pay, Apple Pay)
- Checkout flow — Shipping → Payment → Confirmation
- Order confirmation email via Resend
- Automatic stock reduction after purchase
- Live cart badge updates in navbar
- Firebase Authentication — email/password and Google sign-in
- Password reset via email
- Profile page with editable info, order history, and wishlist
- Admin dashboard with analytics, orders, products, and users
- Cart synced to Firestore on sign out, restored on sign in
- Protected routes — unauthenticated users redirected to login
- Responsive UI with mobile hamburger menu
- Toast notifications for cart, wishlist, and profile actions
- Error boundary — graceful error screen instead of white crashes
- Custom 404 page
- SEO metadata per product page
- Scroll to top on page navigation
- Accessibility — aria-labels on all icon buttons

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- React
- Lucide React (icons)

### Auth & Database
- Firebase Authentication (email/password + Google)
- Cloud Firestore

### Payments
- Stripe (card, Google Pay, Apple Pay)

### Email
- Resend (order confirmation emails)

### Deployment
- Vercel

---

## Architecture

This project uses a serverless architecture:
```
Next.js (Frontend) → Firebase SDK → Firestore (Database)
                  → Stripe API  → Payment Processing
                  → Resend API  → Transactional Email
```

No custom backend server is required except for Next.js API routes that handle Stripe Payment Intents and order confirmation emails securely.

---

## Database Structure

### `users` collection
```json
{
  "uid": "abc123",
  "email": "user@email.com",
  "name": "John Doe",
  "phone": "+1 234 567 8900",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "country": "United States"
  },
  "cart": [],
  "wishlist": ["productId1", "productId2"],
  "isAdmin": false,
  "createdAt": "timestamp"
}
```

### `products` collection
```json
{
  "name": "Socks",
  "price": 10,
  "stock": 5,
  "img": "https://...",
  "category": "Accessories"
}
```

### `products/{id}/reviews` subcollection
```json
{
  "userId": "abc123",
  "userName": "John Doe",
  "rating": 5,
  "comment": "Great product!",
  "createdAt": "timestamp"
}
```

### `orders` collection
```json
{
  "userId": "abc123",
  "userEmail": "user@email.com",
  "items": [...],
  "total": 45.00,
  "shipping": { "firstName": "John", "address": "...", ... },
  "status": "paid",
  "paymentIntentId": "pi_xxx",
  "createdAt": "timestamp"
}
```

---

## Core Flow
```
Homepage
 → Browse / Search / Filter Products
 → View Product Page
   → Select size & quantity
   → Read / write reviews
   → Add to wishlist
 → Add to Cart
 → Manage Cart (increase / decrease / remove)
 → Checkout (shipping info + validation)
 → Payment (Stripe)
 → Order stored in Firestore
 → Stock updated in Firestore
 → Confirmation email sent via Resend
 → Order Confirmation page
 → View order history on Profile page
```

---

## Environment Variables

Create a `.env.local` file in the root:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
```

`NEXT_PUBLIC_` variables are safe to expose to the browser.
`STRIPE_SECRET_KEY` and `RESEND_API_KEY` are server-side only — never exposed to the client.

---

## Installation
```bash
git clone https://github.com/your-username/tur-next.git
cd tur-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Firebase Setup

1. Enable **Email/Password** and **Google** sign-in in Firebase Authentication
2. Create a Firestore database with these collections: `users`, `products`, `orders`
3. To make a user an admin, set `isAdmin: true` on their Firestore user document
4. Deploy Firestore security rules from `firestore.rules`

---

## Deployment

Deployed on Vercel:
```bash
npm run build
```

Add all `.env.local` variables to your Vercel project's environment settings.

---

### Future updates

- Stripe webhook — handle `payment_intent.succeeded` server-side (needed for production hosting)
- Product image gallery — multiple images per product with thumbnail strip
- Discount / coupon codes — coupon collection in Firestore + Stripe coupon API
- Shop pagination — Firestore cursor-based pagination using `startAfter`
- Multi-currency support — requires geo-IP, exchange rates, and Stripe currency config
- Real shipping integration — ShipStation / EasyPost
- Order tracking — needs carrier API integration
---