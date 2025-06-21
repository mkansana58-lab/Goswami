
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Loader2 } from 'lucide-react';
import { STUDENT_LOGGED_IN_KEY, STUDENT_USERNAME_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '@/lib/constants';
import type { StudentProfileData } from '../student-profile/page'; 

const DUMMY_USERNAME = "student";
const DUMMY_PASSWORD = "password123";

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
      // Allow any username/password for this prototype version as requested
      if (username.trim() !== '' && password.trim() !== '') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STUDENT_LOGGED_IN_KEY, 'true');
          localStorage.setItem(STUDENT_USERNAME_KEY, username);
          
          const existingProfile = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
          if (!existingProfile) {
            const dummyProfile: StudentProfileData = {
              name: username, // Use the entered username
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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-muted/20 py-8 px-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <UserCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('studentLoginTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('studentLoginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">{t('usernameLabel')}</Label>
            <Input
              id="username"
              placeholder={t('usernamePlaceholder') || "Enter any username"}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="h-12 text-base"
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
              className="h-12 text-base"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          
          <Button onClick={handleStudentLogin} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLoading ? t('loading') : t('loginButton')}
          </Button>
          <Card className="mt-4 bg-primary/5 border-primary/30 p-3">
            <CardDescription className="text-xs text-center text-primary/80">
              {t('dummyCredentialsInfo') || "For demonstration purposes, you can use any username and password to log in."}<br />
              <strong className="font-medium">{t('usernameLabel')}:</strong> student <strong className="font-medium">{t('passwordLabel')}:</strong> password123
            </CardDescription>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
