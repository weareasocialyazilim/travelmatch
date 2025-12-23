# TravelMatch Admin Dashboard

This is the administrative dashboard for the TravelMatch platform. It is built using [Refine](https://refine.dev/) and connects directly to the Supabase backend.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Create a `.env` file based on your Supabase credentials:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## Features

*   **User Management:** View, verify (KYC), and ban users.
*   **Content Moderation:** Review and approve/reject Moments.
*   **Dispute Resolution:** Handle transaction disputes and view proofs.
*   **Analytics:** View platform growth and transaction volume.

## Deployment

This dashboard is a static React app and can be deployed to Vercel, Netlify, or any static host.
