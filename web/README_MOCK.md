# ShareTaxi - Mock Mode Guide 🚖

This application is currently configured to run in **Mock Mode**. This allows you to explore the full user interface and user journey without requiring a connection to the Supabase database.

## 🚀 How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000) (or port 3011 if configured).

## 🛠️ Features Available in Mock Mode

*   **Authentication:** Login with any phone number. Use OTP `123456`.
*   **Dashboard:** View active rides and stats.
*   **Create Ride:** Create a new ride request (data is not saved to DB).
*   **Ride Search:** Find available rides.
*   **My Rides:** View active and past ride history.
*   **Ride Details:** View ride info, participants, and cost.
*   **Join/Cancel:** Simulate joining or cancelling a ride.
*   **Social:** View matches, chat with mock users, and check notifications.

## ⚠️ Limitations

*   **Data Persistence:** No data is saved to the database. Refreshing the page may reset some state.
*   **Real-time:** Real-time features (chat, live tracking) are simulated.
*   **Authentication:** Security is bypassed for demonstration purposes.

## 🔄 Switching to Real Mode

To connect to the real Supabase backend:

1.  Ensure your `.env.local` file has valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2.  Remove the `mock-session` cookie logic from `middleware.ts` and `lib/auth.ts`.
3.  Uncomment the real database calls in `app/actions/*.ts` and remove the `// MOCK MODE` blocks.

## 🔧 Troubleshooting

### "npm" is not recognized
If you see an error like `'npm' is not recognized`, it means Node.js is not installed or not in your PATH.
1.  Download and install Node.js from [nodejs.org](https://nodejs.org/).
2.  Restart your terminal/VS Code.
3.  Run `npm install` again.

### "next" command not found
If the server fails to start:
1.  Delete the `node_modules` folder.
2.  Run `npm install` to reinstall dependencies.
3.  Run `npm run dev`.
