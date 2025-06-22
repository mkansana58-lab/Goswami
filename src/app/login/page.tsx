
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Mohit@123';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
        toast({ title: t('loginSuccessTitle'), description: t('loginSuccessMessageStudent') });
        router.push('/admin');
      }
    } else {
      setError(t('loginError') || 'Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border/50">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-3">
            <ShieldAlert className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('adminLoginNav')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernameLabel')}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(''); 
              }}
              className="h-12 bg-muted/50 border-border"
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
                setError(''); 
              }}
              className="h-12 bg-muted/50 border-border"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
          
          <Button onClick={handleAdminLogin} className="w-full h-12 text-lg font-semibold">
            <LogIn className="mr-2 h-5 w-5"/>
            {t('loginButton')}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-4">
            {t('adminLoginCredentialsNote') || 'Enter admin credentials to login.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
