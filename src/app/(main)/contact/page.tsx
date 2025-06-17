
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from '@/hooks/use-language';
import { Mail, Phone, MessageSquare, User, Send, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { STUDENT_USERNAME_KEY, STUDENT_PROFILE_LOCALSTORAGE_KEY } from '../student-login/page'; // For prefilling

const USER_EMAIL = "mohitkansana82@gmail.com";
const USER_PHONE = "9694251069";

const emailFormSchemaDefinition = (t: (key: string) => string) => z.object({
  senderEmail: z.string().email({ message: t('emailValidation') }),
  subject: z.string().min(3, { message: t('subjectValidation') }),
  message: z.string().min(10, { message: t('messageValidation') }),
});
type EmailFormValues = z.infer<ReturnType<typeof emailFormSchemaDefinition>>;

const smsFormSchemaDefinition = (t: (key: string) => string) => z.object({
  senderName: z.string().min(2, { message: t('studentNameValidation') }),
  senderMobile: z.string().min(10, { message: t('phoneValidation') }),
  smsMessage: z.string().min(5, { message: t('messageValidationShort') }),
});
type SmsFormValues = z.infer<ReturnType<typeof smsFormSchemaDefinition>>;


export default function ContactPage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchemaDefinition(t)),
    defaultValues: { senderEmail: "", subject: "", message: "" },
  });

  const smsForm = useForm<SmsFormValues>({
    resolver: zodResolver(smsFormSchemaDefinition(t)),
    defaultValues: { senderName: "", senderMobile: "", smsMessage: "" },
  });

  // Prefill email if student is logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      const studentProfileRaw = localStorage.getItem(STUDENT_PROFILE_LOCALSTORAGE_KEY);
      const studentUsername = localStorage.getItem(STUDENT_USERNAME_KEY);
      if (studentProfileRaw) {
        try {
          const studentProfile = JSON.parse(studentProfileRaw);
          if (studentProfile.email) {
            emailForm.setValue('senderEmail', studentProfile.email);
          } else if (studentUsername) {
             emailForm.setValue('senderEmail', `${studentUsername}@example.com`); // Fallback
          }
          if (studentProfile.name) {
            smsForm.setValue('senderName', studentProfile.name);
          }
           if (studentProfile.mobile) {
            smsForm.setValue('senderMobile', studentProfile.mobile);
          }
        } catch (e) {
          console.error("Error parsing student profile for contact form:", e);
           if (studentUsername) {
             emailForm.setValue('senderEmail', `${studentUsername}@example.com`);
          }
        }
      } else if (studentUsername) {
        emailForm.setValue('senderEmail', `${studentUsername}@example.com`);
      }
    }
  }, [isClient, emailForm, smsForm]);


  const onEmailSubmit: SubmitHandler<EmailFormValues> = (data) => {
    const mailtoLink = `mailto:${USER_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`From: ${data.senderEmail}\n\n${data.message}`)}`;
    if (isClient) window.location.href = mailtoLink;
  };
  
  const onSmsSubmit: SubmitHandler<SmsFormValues> = (data) => {
    // The sms: URI scheme is not universally supported and might not work on all devices/browsers, especially desktops.
    // It usually just opens the default SMS app with prefilled number and message.
    const smsLink = `sms:${USER_PHONE}?body=${encodeURIComponent(`From ${data.senderName} (${data.senderMobile}):\n${data.smsMessage}`)}`;
     if (isClient) window.location.href = smsLink;
  };


  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('contactUsTitle')}</CardTitle>
          <CardDescription>{t('contactUsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-around items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Mail className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-semibold">{t('emailAddress')}</p>
              <a href={`mailto:${USER_EMAIL}`} className="text-primary hover:underline">{USER_EMAIL}</a>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-semibold">{t('phoneNumber')}</p>
              <a href={`tel:${USER_PHONE}`} className="text-primary hover:underline">{USER_PHONE}</a>
            </div>
          </div>
           <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">{t('importantNoteTitle')}</AlertTitle>
            <AlertDescription className="text-foreground/80">
             {t('contactFormNote')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Email Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-secondary-foreground">
            <Mail className="h-6 w-6 text-accent" /> {t('sendUsEmailTitle')}
          </CardTitle>
          <CardDescription>{t('sendUsEmailDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField control={emailForm.control} name="senderEmail" render={({ field }) => (<FormItem><FormLabel>{t('yourEmailLabel')}</FormLabel><FormControl><Input type="email" placeholder={t('yourEmailPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={emailForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>{t('subjectLabel')}</FormLabel><FormControl><Input placeholder={t('subjectPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={emailForm.control} name="message" render={({ field }) => (<FormItem><FormLabel>{t('messageLabel')}</FormLabel><FormControl><Textarea rows={5} placeholder={t('messagePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="mr-2 h-4 w-4" /> {t('sendEmailButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* SMS "Form" */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-secondary-foreground">
            <MessageSquare className="h-6 w-6 text-accent" /> {t('sendUsSmsTitle')}
          </CardTitle>
          <CardDescription>{t('sendUsSmsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...smsForm}>
            <form onSubmit={smsForm.handleSubmit(onSmsSubmit)} className="space-y-4">
              <FormField control={smsForm.control} name="senderName" render={({ field }) => (<FormItem><FormLabel>{t('yourNameLabel')}</FormLabel><FormControl><Input placeholder={t('yourNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={smsForm.control} name="senderMobile" render={({ field }) => (<FormItem><FormLabel>{t('yourMobileLabel')}</FormLabel><FormControl><Input type="tel" placeholder={t('yourMobilePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={smsForm.control} name="smsMessage" render={({ field }) => (<FormItem><FormLabel>{t('messageLabelShort')}</FormLabel><FormControl><Textarea rows={3} placeholder={t('messagePlaceholderShort')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="mr-2 h-4 w-4" /> {t('sendSmsButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
           {t('smsDisclaimer')}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
