
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LogIn } from 'lucide-react';

const ADMIN_LOGGED_IN_KEY = 'adminLoggedInGoSwami';
const HARDCODED_USERNAME = 'admin';
const HARDCODED_PASSWORD = 'adminpass';

const formSchemaDefinition = (t: (key: any) => string) => z.object({
  username: z.string().min(1, { message: t('usernameLabel') + " is required." }),
  password: z.string().min(1, { message: t('passwordLabel') + " is required." }),
});

type LoginFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    if (data.username === HARDCODED_USERNAME && data.password === HARDCODED_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
      }
      router.push('/'); 
    } else {
      setLoginError(t('loginError'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogIn className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('errorOccurred')}</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('usernameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('usernameLabel')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordLabel')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('loading') : t('loginButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
