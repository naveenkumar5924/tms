# TMS - Complaint Management System (Mobile App & API)

A modern, high-performance Complaint & Facilities Management mobile application built with **React Native & Expo**, backed by **Node.js, Express, and MongoDB**.

---

## 📱 Mobile App Features

- **Executive & Clean UI/UX**: Built with an elegant design system featuring deep indigo & vibrant cyan accents, smooth cards, status badges, and native mobile gestures.
- **Role-Based Workflows**:
  - **SuperAdmin**: Complete dashboard metrics, staff ticket assignment, status updates, master data infrastructure management (Departments, Programmes, Blocks, Rooms, Roles, Users), and audit reports with CSV export.
  - **Staff / Technicians**: Work orders assigned directly to their specialization (PC Hardware, Network, Plumbing, Electrician, etc.), with status updater (Pending -> Assigned -> In-Progress -> Closed).
  - **Regular Users**: Fast complaint registration, photo attachment via Camera/Gallery, and personal ticket tracking.
- **Real-time Master Pickers**: Cascading selection (Department ➔ Block ➔ Room Number or Custom Room).
- **Attachment Support**: Integrated `expo-image-picker` with photo preview and tap-to-enlarge inspector.
- **Audit Reports & CSV Export**: Filter tickets by Department, Programme, Status, Assignee, and Category, and export/share CSV directly to WhatsApp, Drive, or Files with `expo-sharing`.
- **Dynamic Server IP Configuration**: Easily toggle between `localhost` (web/simulator) and your machine's Wi-Fi IP (e.g. `http://192.168.209.29:5000/api`) right inside the app settings!

---

## 🚀 Quick Start Guide

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

The Express server will start on port `5000`:
- Health check: `http://localhost:5000/api/health`

*(Optional) To initialize the default SuperAdmin user:*
```bash
node scripts/initAdmin.js
```

---

### 2. Start the Expo Mobile App

In a new terminal window:

```bash
cd mobile
npx expo start
```

Or from the project root:
```bash
npm run mobile
```

### How to Run:
- **On Physical Mobile Device**: Download **Expo Go** from Google Play Store or iOS App Store, then scan the QR code displayed in your terminal.
- **On Web Browser**: Press `w` in the Expo terminal or run `npm run mobile:web`.
- **On Android Emulator**: Press `a` in the Expo terminal.
- **On iOS Simulator**: Press `i` in the Expo terminal (macOS only).

---

## 🔑 Demo Credentials

Fast-fill buttons are provided on the Login screen, or you can enter manually:

| Role | Email | Password |
|---|---|---|
| **SuperAdmin** | `admin@example.com` | `Passw0rd!` |
| **User** | `user@example.com` | `Passw0rd!` |
| **Staff / Technician** | `staff@example.com` | `Passw0rd!` |

---

## 📂 Project Structure

```
TMS-TEST-PROJECT/
├── backend/                  # Node.js + Express API
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Auth, Complaints, Departments, etc.
│   ├── models/              # Mongoose models
│   ├── routes/              # Express API endpoints
│   ├── uploads/             # Ticket photo uploads
│   └── server.js            # Server entry point
│
├── mobile/                   # React Native (Expo SDK 58) App
│   ├── assets/              # Icons, splash screen
│   ├── src/
│   │   ├── components/      # StatusBadge, StatCard, CustomInput,
│   │   │                    # ComplaintCard, ComplaintDetailModal, ModalPicker
│   │   ├── context/         # AuthContext (JWT, user state, persistent storage)
│   │   ├── navigation/      # Stack & Bottom Tabs navigation
│   │   ├── screens/
│   │   │   ├── auth/        # LoginScreen (with server IP config modal)
│   │   │   ├── dashboard/   # HomeScreen (metrics, quick actions, recent tickets)
│   │   │   ├── complaints/  # ComplaintsListScreen, CreateComplaintScreen
│   │   │   ├── masters/     # MasterHub, Departments, Programmes, Blocks, Rooms, Roles, Users
│   │   │   ├── reports/     # ReportsScreen (filters + CSV export)
│   │   │   └── profile/     # ProfileScreen (account details + server settings)
│   │   ├── services/        # Axios API client with dynamic base URL
│   │   └── theme/           # Design system palette, shadows, typography
│   ├── App.js               # Root App with AuthProvider & SafeAreas
│   └── app.json             # Expo application manifest
│
└── package.json             # Workspace convenience scripts
```
