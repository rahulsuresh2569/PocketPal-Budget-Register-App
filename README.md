# PocketPal : Your Personal Budget Companion

PocketPal is a personal budget management application designed to help users track their income and expenses, offering a clear view of their financial habits. To be honest, I created this mobile app for my grandpa who faced difficulties in managing his expenses manually :) - he used to write down the expenses and used a calculator.  


## 🎯 What It Does & Why It's Useful

Many people struggle to keep track of their daily spending, understand where their money goes, and stick to a budget. PocketPal solves this by providing:

*   **Effortless Tracking:** Quickly log your spending and earnings.
*   **Organized Finances:** Use dynamic categories (e.g., "Food", "Transport") and subjects (e.g., "Groceries", "Train Ticket") to see detailed breakdowns.
*   **Clear Overview:** The main entries list acts as your financial dashboard, showing all transactions at a glance.

---

## 🎬 App Demo

![FinFlow Mobile Demo GIF](./resources/pocketpal_demo.gif.gif)

---

## ✨ Core Features

*   **Entries Dashboard:** View all your financial entries (date, category, subject, debit/credit) in one place.
*   **Quick Entry:** Seamlessly add new transactions.
*   **Dynamic Categories & Subjects:** Create custom categories, and then add specific subjects under them. Add new ones on-the-fly directly from the entry form!
*   **Real-time Updates:** Your entries list refreshes instantly after any additions.
*   **Persistent Storage:** Your financial data is saved in a MongoDB database.
*   **Tech:** Built with React Native (Frontend) & Node.js/Express/MongoDB (Backend).

---

## 🚀 Getting Started & Setup

To get the app running locally:

**1. Backend Setup:**

   ```bash
   # Clone the repository (if you haven't already)
   git clone https://github.com/YOUR_USERNAME/YOUR_PROJECT_REPO.git
   cd YOUR_PROJECT_REPO/backend

   # Install dependencies
   npm install

   # Create .env file (copy from .env.example) and add your MongoDB URI & Port
   # Example .env:
   # PORT=5001
   # MONGO_URI=your_mongodb_connection_string

   # Start the backend server
   npm run dev
   ```

**2. Frontend Setup:**

   ```bash
   cd ../frontend # Navigate from backend to frontend directory

   # Install dependencies
   npm install

   # IMPORTANT: Configure API URL
   # Open frontend/services/api.js
   # Ensure baseURL points to your backend:
   # - Android Emulator: 'http://10.0.2.2:5001/api' (or your backend PORT)
   # - Physical Device/Other: 'http://YOUR_COMPUTER_LOCAL_IP:5001/api'

   # Start the Expo development server
   npx expo start
   ```
   Scan the QR code with the Expo Go app on your mobile device.

---



## 🛠️ Tech Stack Highlights

*   **Frontend:** React Native, Expo, Axios, React Context API
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose
*   **Key Libraries:** `@react-native-community/datetimepicker`, `@react-native-picker/picker`

---

## 💡 Suggested Future Enhancements

*   **User Authentication:** Secure individual user accounts.
*   **Data Visualization:** Charts to illustrate spending trends.
*   **Advanced Filtering & Search:** For easier entry retrieval.
*   **Enhanced Error Handling & Input Validation:** For a more robust user experience.

---
