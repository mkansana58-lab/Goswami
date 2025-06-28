"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2, KeyRound, Clipboard, ClipboardCheck } from 'lucide-react';

const formSchema = z.object({
  accessKey: z.string().min(1, { message: "Access Key is required." }),
});

const ADMIN_ACCESS_KEY = 'G$DA_Director_Panel_#2024!_SecureAccessKey';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessKey: "",
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_ACCESS_KEY);
    setIsCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await loginAdmin(values.accessKey);
    if (success) {
      toast({ title: "Admin login successful!" });
      router.push('/admin');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid Access Key. Please try again.",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-2 text-2xl font-bold text-primary">Admin Panel</CardTitle>
          <CardDescription>Login to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <Label>Your Admin Access Key</Label>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                <code>{ADMIN_ACCESS_KEY}</code>
              </pre>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7"
                onClick={handleCopy}
              >
                {isCopied ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKey" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Enter Access Key
              </Label>
              <Input
                id="accessKey"
                type="password"
                placeholder="Paste your secure access key here"
                {...form.register('accessKey')}
                disabled={isLoading}
              />
              {form.formState.errors.accessKey && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.accessKey.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
