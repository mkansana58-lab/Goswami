
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Loader2, LogIn } from 'lucide-react';
import { STUDENT_LOGGED_IN_KEY, STUDENT_USERNAME_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import type { StudentProfileData } from '../student-profile/page'; 

export default function StudentLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage.getItem(STUDENT_LOGGED_IN_KEY) === 'true') {
      router.push('/');
    }
  }, [router]);

  const handleStudentLogin = () => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (username.trim() !== '' && password.trim() !== '') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STUDENT_LOGGED_IN_KEY, 'true');
          localStorage.setItem(STUDENT_USERNAME_KEY, username);
          
          const existingProfile = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
          if (!existingProfile) {
            const dummyProfile: StudentProfileData = {
              name: username,
              email: `${username}@example.com`,
              mobile: "9876543210",
              currentClass: "9",
              address: "123 Defence Colony, New Delhi",
              photoDataUrl: "https://placehold.co/150x150.png",
              dataAiHint: "student avatar",
              enrolledCourses: [
                { id: "SAMPLE001", titleKey: "sainikSchoolCourseTitle", progress: 25, descriptionKey: "sainikSchoolCourseDesc" },
              ]
            };
            localStorage.setItem(STUDENT_PROFILE_LOCALSTORAGE_KEY, JSON.stringify(dummyProfile));
          }
          
          toast({ title: t('loginSuccessTitle'), description: t('loginSuccessMessageStudent')});
          window.dispatchEvent(new Event('studentProfileUpdated'));
          router.push('/');
        }
      } else {
        setError(t('loginError') || 'Invalid username or password.');
      }
      setIsLoading(false);
    }, 500);
  };

  if (!isClient) {
    return (
       <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border/50">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-3">
            <UserCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">{t('studentLoginTitle')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('studentLoginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernamePlaceholder') || "Enter any username"}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="h-12 bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder') || "Enter any password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="h-12 bg-muted/50 border-border"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
          
          <Button onClick={handleStudentLogin} className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5"/>}
            {isLoading ? t('loading') : t('loginButton')}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-4">
              {t('dummyCredentialsInfo')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
