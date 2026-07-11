// frontend/src/app/layout.js
import './global.css';

export const metadata = {
  title: 'GrowEasy CSV Importer',
  description: 'AI-powered CSV to CRM mapping',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}