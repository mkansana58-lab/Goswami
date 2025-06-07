
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchemaDefinition = (t: (key: any) => string) => z.object({
  studentName: z.string().min(2, { message: t('studentNameValidation') || "Name must be at least 2 characters." }),
  emailAddress: z.string().email({ message: t('emailValidation') || "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: t('phoneValidation') || "Phone number must be at least 10 digits." }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') || "Invalid characters in phone number." }),
  currentClass: z.string().min(1, { message: t('classValidation') || "Current class is required." }),
  address: z.string().min(5, { message: t('addressValidation') || "Address must be at least 5 characters." }),
});

type ScholarshipFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function ScholarshipPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      studentName: "",
      emailAddress: "",
      phoneNumber: "",
      currentClass: "",
      address: "",
    },
  });

  const onSubmit: SubmitHandler<ScholarshipFormValues> = (data) => {
    console.log("Scholarship Registration Data:", data);
    // Placeholder for form submission logic
    toast({
      title: t('registrationSuccess'),
      description: t('registrationSuccessMessage'),
    });
    form.reset();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('scholarshipRegistrationTitle')}</CardTitle>
          <CardDescription>{t('scholarshipFormDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('studentName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('studentName')} {...field} className="text-base md:text-sm h-12"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailAddress')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('emailAddress')} {...field} className="text-base md:text-sm h-12"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('phoneNumber')} {...field} className="text-base md:text-sm h-12"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currentClass')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('currentClass')} {...field} className="text-base md:text-sm h-12"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('address')} {...field} className="text-base md:text-sm min-h-[100px]"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-14" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('loading') : t('submitRegistration')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Add these validation message keys to translations.ts
// studentNameValidation: "Name must be at least 2 characters."
// emailValidation: "Invalid email address."
// phoneValidation: "Phone number must be at least 10 digits."
// phoneInvalidChars: "Invalid characters in phone number."
// classValidation: "Current class is required."
// addressValidation: "Address must be at least 5 characters."
