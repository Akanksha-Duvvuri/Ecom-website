# 🛍️ TurNext >_ — Full Stack E-commerce Website

TurNext is a modern full-stack e-commerce web application built using Next.js, Firebase, and Stripe. It allows users to browse products, manage a cart, authenticate securely, and place real orders with live inventory updates and payment processing.

---

## 🚀 Features

- 🛒 Product browsing with dynamic data from Firestore
- 🔍 Search & filtering on the shop page
- 📦 Individual product pages with size selector and stock-aware quantity control
- ⭐ Product reviews with star ratings, stored in Firestore
- ❤️ Wishlist — add/remove products, synced to Firestore
- ➕ Add to cart with quantity controls
- ➖ Increase / decrease / remove items from cart
- 🔒 Stock limit enforcement (cannot exceed available inventory)
- 💰 Order summary with GST (18%) and real-time total calculation
- 💳 Stripe payment integration (card, Google Pay, Apple Pay)
- 📤 Checkout flow — Shipping → Payment → Confirmation
- 📉 Automatic stock reduction after purchase
- 🔄 Live cart badge updates in navbar
- 🔐 Firebase Authentication — email/password and Google sign-in
- 👤 Profile page with editable info, order history, and wishlist
- 🛠️ Admin dashboard (visible only to admin users)
- 🔁 Cart synced to Firestore on sign out, restored on sign in
- 🔒 Protected routes — unauthenticated users redirected to login
- 📱 Responsive UI with mobile hamburger menu

---

## 🧱 Tech Stack

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

### Deployment
- Vercel

---

## 🧠 Architecture

This project uses a serverless architecture:
```
Next.js (Frontend) → Firebase SDK → Firestore (Database)
                  → Stripe API  → Payment Processing
```

No custom backend server is required except for a single Next.js API route that creates Stripe Payment Intents securely.

---

## 🔁 Core Flow
```
Homepage
 → Browse / Search Products
 → View Product Page
   → Select size & quantity
   → Read / write reviews
   → Add to wishlist
 → Add to Cart
 → Manage Cart (increase / decrease / remove)
 → Checkout (shipping info)
 → Payment (Stripe)
 → Order stored in Firestore
 → Stock updated in Firestore
 → Order Confirmation page
 → View order history on Profile page
```

---

## ⚙️ Environment Variables

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
```

> `NEXT_PUBLIC_` variables are safe to expose to the browser.
> `STRIPE_SECRET_KEY` is server-side only — never exposed to the client.

---

## 🛠️ Installation
```bash
git clone https://github.com/your-username/tur-next.git
cd tur-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firebase Setup

1. Enable **Email/Password** and **Google** sign-in in Firebase Authentication
2. Create a Firestore database with these collections: `users`, `products`, `orders`
3. To make a user an admin, set `isAdmin: true` on their Firestore user document

---

## 🌐 Deployment

Deployed on Vercel:
```bash
npm run build
```

Add all `.env.local` variables to your Vercel project's environment settings.

---

## ✨ Future Improvements

- 📧 Order confirmation emails
- 🏷️ Discount codes and coupons
- 🌍 Multi-currency support
- ⭐ Filter and sort products by rating or price
- 🖼️ Multiple product images with gallery view
- 📊 Admin analytics dashboard (revenue, top products)
- 📦 Order tracking with real shipping integration

---

## 📸 Screenshots

*(Add screenshots here)*

---

## 📄 License

This project is for educational and portfolio purposes.