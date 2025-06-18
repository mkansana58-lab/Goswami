
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { ShieldAlert } from 'lucide-react';

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Mohit@123';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
        router.push('/admin');
      }
    } else {
      setError(t('loginError') || 'Invalid username or password.');
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
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernameLabel')}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(''); // Clear error on input change
              }}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel') || 'Password'}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordLabel') || 'Password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear error on input change
              }}
              className="h-12"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          
          <Button onClick={handleAdminLogin} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
            {t('loginButton')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t('adminLoginCredentialsNote') || 'Enter admin credentials to login.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    
