<<<<<<< HEAD
# servihaus-munchen

# 🏠 ServiHausMunchen

Web platform for the comprehensive management of domestic and business services.  
The system is designed to centralize **clients, properties, employees, services, materials, working time, and financial control**, with a scalable, phase-based architecture.

---

## 🎯 Project Goal

ServiHausMunchen aims to digitalize and optimize the daily operations of a service-based company by providing:

- Client management (private and business)
- Multiple locations per client
- Employee and role management
- Service booking and assignment
- Work time and material tracking
- Data visualization and analytics
- Future scalability (automation, external clients, integrations)

---

## 🧱 General Architecture

The project is divided into two main blocks:


---

## 🖥️ Frontend

Web application built with modern technologies, optimized for dashboards and complex workflows.

**Technologies:**
- React + TypeScript
- Next.js
- Tailwind CSS
- shadcn/ui
- Recharts / Chart.js

**Main roles:**
- Client
- Employee
- Administrator / Manager (full access)

---

## ⚙️ Backend

API responsible for business logic, authentication, permissions, and data persistence.

**Planned technologies:**
- Node.js
- NestJS
- Prisma ORM
- PostgreSQL

---

## 🔐 Authentication & Authorization

Role-based access control:
- **Administrator**: full system access
- **Employee**: limited access to assigned tasks and services
- **Client**: access only to their own data and services

Authentication is handled using JWT (access + refresh tokens).

---

## 📊 Core Features

- Service cycle management
- Employee assignment per property
- Work time tracking
- Material and equipment control
- Financial and performance dashboards
- Data export
- Notifications and reminders

---

## 🚀 Phase-Based Development

The project follows an incremental development approach:

1. Operational base (users, services, calendar)
2. Internal financial control
3. Optimization and light automation
4. Continuous improvement

---

## 🧑‍💻 Development Environment

**Requirements:**
- Node.js >= 18
- npm / pnpm / yarn
- Visual Studio Code

---

## ▶️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 0cd7527 (Initial commit from Create Next App)
