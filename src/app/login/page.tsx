
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Kept for visual consistency if we add password later
import { Label } from '@/components/ui/label';   // Kept for visual consistency
import { useLanguage } from '@/hooks/use-language';
import { ShieldAlert } from 'lucide-react';

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
// For this prototype, we'll use a simple "magic word" or a button press.
// A real admin login would require secure authentication.
const ADMIN_USERNAME = 'admin'; // Example, not strictly checked for this version

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState(''); // We can use this field if we expand later
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    // In a real app, you'd verify credentials here.
    // For this prototype, clicking the button logs in the admin.
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
      router.push('/admin');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <ShieldAlert className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary">{t('adminLoginNav')}</CardTitle>
          <CardDescription>{t('loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username field for future expansion or basic check */}
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernameLabel')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
            />
          </div>
           {/* We are not using a password field for this simplified admin login */}

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          
          <Button onClick={handleAdminLogin} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
            {t('loginButton')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t('adminLoginNav')}: {t('adminLoginSimplifiedNote') || 'For prototype, click to login.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Add to translations:
// adminLoginSimplifiedNote: "For prototype purposes, clicking the 'Login' button will grant admin access." (EN)
// adminLoginSimplifiedNote: "प्रोटोटाइप उद्देश्यों के लिए, 'लॉगिन' बटन पर क्लिक करने से एडमिन एक्सेस मिल जाएगा।" (HI)
    