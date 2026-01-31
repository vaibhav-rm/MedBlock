# WalletConnect Setup (Optional)

If you want to use WalletConnect for wallet authentication:

1. Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

3. Restart the development server

**Note**: Without a valid WalletConnect project ID, the wallet connection features will be disabled but the app will work fine for testing the UI.
