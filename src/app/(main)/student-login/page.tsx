
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const STUDENT_LOGGED_IN_KEY = 'studentLoggedInGoSwami';
export const STUDENT_USERNAME_KEY = 'studentUsernameGoSwami';
const DUMMY_USERNAME = 'student';
const DUMMY_PASSWORD = 'goswami123';

export default function StudentLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true') {
      router.replace('/student-profile'); // Or home page
    }
  }, [router]);

  const handleStudentLogin = () => {
    if (username === DUMMY_USERNAME && password === DUMMY_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STUDENT_LOGGED_IN_KEY, 'true');
        localStorage.setItem(STUDENT_USERNAME_KEY, username); // Store username
        // Clear any minimal profile from localStorage to force fetch or show defaults
        localStorage.removeItem('studentProfileGoSwami'); 
        toast({ title: t('loginSuccessTitle'), description: t('loginSuccessMessageStudent') });
        router.push('/student-profile'); 
      }
    } else {
      setError(t('loginError') || 'Invalid username or password.');
    }
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <UserCircle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary">{t('studentLoginTitle')}</CardTitle>
          <CardDescription>{t('studentLoginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernamePlaceholder')}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); 
              }}
              className="h-12"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          
          <Button onClick={handleStudentLogin} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
            {t('loginButton')}
          </Button>
          <Card className="mt-4 p-3 bg-primary/10 border-primary/30">
            <CardDescription className="text-center text-sm text-primary-foreground/80">
              {t('dummyCredentialsInfo')}<br />
              <strong>{t('usernameLabel')}:</strong> {DUMMY_USERNAME}<br />
              <strong>{t('passwordLabel')}:</strong> {DUMMY_PASSWORD}
            </CardDescription>
          </Card>
           <div className="text-center mt-4">
            <Button variant="link" onClick={() => router.push('/login')} className="text-sm">
              <ShieldCheck className="mr-2 h-4 w-4" /> {t('adminLoginNav')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
