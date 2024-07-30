import { Inter } from "next/font/google";
import "./globals.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const inter = Inter({ subsets: ["latin"] });

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "pantryapp-e8fe8",
  // Other config options should be added here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);

export const metadata = {
  title: "PantryChecker",
  description: "Keep track of your pantry items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}