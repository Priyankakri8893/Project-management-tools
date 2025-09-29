
# Project Management Tool

A basic project management tool to manage projects effectively with a **frontend** and **backend** setup.

---

## 🚀 Features

* Manage projects efficiently
* Backend powered by **Node.js & MongoDB**
* Frontend powered by **React.js**
* Seed data support for testing

---

## 📦 Installation & Setup

### 1. Frontend Setup

```bash
cd project-management-frontend
npm install
npm start
```

* Runs the frontend on development server.
* Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

### 2. Backend Setup

```bash
cd project-management-backend
npm install
npm start
```

* Starts the backend server.
* Default environment is already configured with a **testing MongoDB URI**.

#### 🔧 Custom MongoDB URI

If you want to use your own MongoDB URI, update the configuration file:

```
project-management-backend/src/environment/environment.json
```

---

### 3. Seed Data (Optional)

To load sample/seed data into the database:

```bash
cd project-management-backend
npm install
npm run seed
```

---
