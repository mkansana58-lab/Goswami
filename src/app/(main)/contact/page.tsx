
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ImagePlus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addContactInquiry } from '@/lib/firebase';
import { fileToDataUrl } from '@/lib/utils';

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  message: z.string().min(10, "Please describe your issue in at least 10 characters."),
  image: z.any().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: { email: "", mobile: "", message: "", image: undefined },
    });

    const onSubmit = async (values: ContactFormValues) => {
        setIsSubmitting(true);
        try {
            const { image, ...dataToSave } = values;
            let imageUrl: string | undefined = undefined;
            const imageFile = image?.[0];

            if (imageFile) {
                imageUrl = await fileToDataUrl(imageFile);
            }

            await addContactInquiry({ ...dataToSave, imageUrl });
            toast({
                title: "Inquiry Sent",
                description: "Thank you for contacting us. We will get back to you soon.",
            });
            form.reset();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send your inquiry. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Mail className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('contactUs')}</h1>
                <p className="text-muted-foreground">We'd love to hear from you!</p>
            </div>
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>Fill out the form below and we will contact you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">{t('emailAddress')}</Label>
                            <Input id="email" type="email" {...form.register('email')} disabled={isSubmitting} />
                            <p className="text-destructive text-sm mt-1">{form.formState.errors.email?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="mobile">{t('mobileNumber')}</Label>
                            <Input id="mobile" type="tel" {...form.register('mobile')} disabled={isSubmitting} />
                            <p className="text-destructive text-sm mt-1">{form.formState.errors.mobile?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="message" className="flex items-center gap-2">
                                <MessageSquare className='h-4 w-4'/> Your Message
                            </Label>
                            <Textarea id="message" {...form.register('message')} disabled={isSubmitting} placeholder="Describe your problem or question here..."/>
                            <p className="text-destructive text-sm mt-1">{form.formState.errors.message?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="image" className='flex items-center gap-2'><ImagePlus className='h-4 w-4'/> Attach an Image (Optional)</Label>
                            <Input id="image" type="file" accept="image/*" {...form.register('image')} disabled={isSubmitting} />
                             <p className="text-destructive text-sm mt-1">{form.formState.errors.image?.message as string}</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Inquiry"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
