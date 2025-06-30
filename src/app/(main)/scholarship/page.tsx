
"use client";

import { useState, useEffect, ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Info, User, BookOpen, MapPin, Upload, Loader2, AlertTriangle, Phone, CheckSquare, Target, Trophy } from "lucide-react";
import { ConfirmationCertificate } from "@/components/scholarship/confirmation-certificate";
import type { FormDataType } from "@/components/scholarship/confirmation-certificate";
import { addScholarshipApplication, getAppConfig, type AppConfig } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from 'react';
import { fileToDataUrl } from "@/lib/utils";

const formSchema = z.object({
    fullName: z.string().min(3, "Full name is required"),
    fatherName: z.string().min(3, "Father's name is required"),
    mobile: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit number"),
    email: z.string().email("Invalid email address"),
    age: z.coerce.number().min(8, "Age must be at most 8").max(16, "Age must be at most 16"),
    class: z.enum(["5", "6", "7", "8", "9"]),
    school: z.string().min(3, "School name is required"),
    address: z.string().min(10, "Full address is required"),
    targetExam: z.string().min(3, "Target exam is required (e.g., Sainik School, RMS)"),
    testMode: z.enum(['online', 'offline'], { required_error: "Please select a test mode." }),
    targetTestEnrollmentCode: z.string().min(5, "Enrollment code is required").max(5, "Must be 5 digits").optional(),
    photo: z.any().optional(),
    signature: z.any().optional(),
});

type ScholarshipFormValues = z.infer<typeof formSchema>;

const steps: { id: string; title: string; icon: React.ElementType; fields: (keyof ScholarshipFormValues)[] }[] = [
    { id: 'instructions', title: 'scholarshipInstructionsTitle', icon: Info, fields: [] },
    { id: 'personal', title: 'step1Title', icon: User, fields: ['fullName', 'fatherName', 'mobile', 'email'] },
    { id: 'academic', title: 'step2Title', icon: BookOpen, fields: ['age', 'class', 'school', 'targetExam'] },
    { id: 'options', title: 'Test Options', icon: CheckSquare, fields: ['testMode', 'targetTestEnrollmentCode'] },
    { id: 'address', title: 'step3Title', icon: MapPin, fields: ['address'] },
    { id: 'uploads', title: 'step4Title', icon: Upload, fields: ['photo', 'signature'] },
]

export default function ScholarshipPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { student } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [applicationNumber, setApplicationNumber] = useState("");
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const form = useForm<ScholarshipFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (student) {
            form.reset({
                fullName: student.name || "",
                fatherName: student.fatherName || "",
                class: student.class as any || undefined,
                age: student.age || undefined,
                address: student.address || "",
                school: student.school || ""
            });
        }
    }, [student, form]);


    useEffect(() => {
        getAppConfig().then(setAppConfig).finally(() => setIsLoadingConfig(false));
    }, []);


    const processForm = async (data: ScholarshipFormValues) => {
        setIsSubmitting(true);
        
        const { photo, signature, ...restOfData } = data;

        let photoDataUrl = "";
        if (data.photo?.[0]) {
            try {
                photoDataUrl = await fileToDataUrl(data.photo[0]);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Photo Error", description: error.message });
                setIsSubmitting(false);
                return;
            }
        }
        
        let signatureDataUrl = "";
        if (data.signature?.[0]) {
            try {
                signatureDataUrl = await fileToDataUrl(data.signature[0]);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Signature Error", description: error.message });
                setIsSubmitting(false);
                return;
            }
        }

        const dataForFirestore = { ...restOfData, photoUrl: photoDataUrl, signatureUrl: signatureDataUrl };
                
        try {
            const result = await addScholarshipApplication(dataForFirestore);
            setApplicationNumber(result.applicationNumber);
            
            const finalDataForUI: FormDataType = { 
                ...data,
                rollNumber: result.rollNumber,
                photoUrl: photoDataUrl,
                signatureUrl: signatureDataUrl 
            };

            setFormData(finalDataForUI);
            setIsSubmitted(true);
            toast({ title: "Success", description: "Application submitted successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Submission Failed", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const next = async () => {
        if (currentStep === 0) {
            setCurrentStep(step => step + 1);
            return;
        }
        const fields = steps[currentStep].fields;
        const output = await form.trigger(fields, { shouldFocus: true });
        if (!output) return;
        if (currentStep === steps.length - 1) {
            await form.handleSubmit(processForm)();
        } else {
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };
    
    if (isLoadingConfig) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    
    if (appConfig?.scholarshipDeadline && new Date() > appConfig.scholarshipDeadline.toDate()) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-2xl font-bold">{t('registrationsClosed')}</h2>
                <p className="text-muted-foreground">{t('registrationsClosedDesc')}</p>
            </div>
        );
    }
    
    if (isSubmitted && formData) {
        return <ConfirmationCertificate formData={formData} applicationNumber={applicationNumber} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('scholarshipForm')}</h1>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                   <Progress value={((currentStep) / (steps.length - 1)) * 100} className="w-full mb-4" />
                   <div className="flex items-center gap-3">
                        {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
                        <CardTitle>{t(steps[currentStep].title as any) || steps[currentStep].title}</CardTitle>
                   </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(processForm)}>
                        {currentStep === 0 && (
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>{t('scholarshipInstructionsP1')}</p>
                                <p>{t('scholarshipInstructionsP2')}</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>{t('scholarshipInstructionsL1')}</li>
                                    <li>{t('scholarshipInstructionsL2')}</li>
                                    <li>{t('scholarshipInstructionsL3')}</li>
                                </ul>
                                <p className="font-semibold text-primary">{t('scholarshipInstructionsP3')}</p>
                            </div>
                        )}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div><Label>{t('fullName')}</Label><Input {...form.register('fullName')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.fullName?.message}</p></div>
                                <div><Label>{t('fathersName')}</Label><Input {...form.register('fatherName')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p></div>
                                <div><Label>{t('mobileNumber')}</Label><Input {...form.register('mobile')} type="tel" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.mobile?.message}</p></div>
                                <div><Label>{t('emailAddress')}</Label><Input {...form.register('email')} type="email" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.email?.message}</p></div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div><Label>{t('age')}</Label><Input {...form.register('age')} type="number" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.age?.message}</p></div>
                                <div><Label>{t('selectClass')}</Label><Select onValueChange={(value) => form.setValue('class', value as "5"|"6"|"7"|"8"|"9")} defaultValue={form.getValues('class')} disabled={isSubmitting}><SelectTrigger><SelectValue placeholder={t('selectClass')} /></SelectTrigger><SelectContent><SelectItem value="5">Class 5</SelectItem><SelectItem value="6">Class 6</SelectItem><SelectItem value="7">Class 7</SelectItem><SelectItem value="8">Class 8</SelectItem><SelectItem value="9">Class 9</SelectItem></SelectContent></Select><p className="text-destructive text-xs">{form.formState.errors.class?.message}</p></div>
                                <div><Label>{t('schoolName')}</Label><Input {...form.register('school')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.school?.message}</p></div>
                                <div><Label>{t('targetExam')}</Label><Input {...form.register('targetExam')} placeholder="e.g., Sainik School, RMS" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.targetExam?.message}</p></div>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <Label>Test Mode</Label>
                                <RadioGroup onValueChange={(value) => form.setValue('testMode', value as 'online' | 'offline')} defaultValue={form.getValues('testMode')} className="grid grid-cols-2 gap-4">
                                    <div><RadioGroupItem value="online" id="online" className="peer sr-only" /><Label htmlFor="online" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Online</Label></div>
                                    <div><RadioGroupItem value="offline" id="offline" className="peer sr-only" /><Label htmlFor="offline" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Offline</Label></div>
                                </RadioGroup>
                                <p className="text-destructive text-xs">{form.formState.errors.testMode?.message}</p>
                                
                                <div className="pt-4">
                                    <Label htmlFor="targetTestEnrollmentCode">{t('targetTestEnrollmentCode')}</Label>
                                    <CardDescription className="text-xs mb-2">{t('targetTestEnrollmentCodeDesc')}</CardDescription>
                                    <Input id="targetTestEnrollmentCode" {...form.register('targetTestEnrollmentCode')} placeholder="e.g., 12345" disabled={isSubmitting} />
                                    <p className="text-destructive text-xs">{form.formState.errors.targetTestEnrollmentCode?.message}</p>
                                </div>
                            </div>
                        )}
                        {currentStep === 4 && (
                             <div className="space-y-4">
                                <div><Label>{t('fullAddress')}</Label><Input {...form.register('address')} placeholder={t('fullAddressPlaceholder')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.address?.message}</p></div>
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div className="space-y-4">
                                <div><Label htmlFor="photo">{t('uploadPhoto')} (Optional)</Label><Input id="photo" type="file" accept="image/*" {...form.register('photo')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.photo?.message as string}</p></div>
                                <div><Label htmlFor="signature">{t('uploadSignature')} (Optional)</Label><Input id="signature" type="file" accept="image/*" {...form.register('signature')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.signature?.message as string}</p></div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter>
                    <div className="w-full flex justify-between">
                        <Button variant="outline" onClick={prev} disabled={currentStep === 0 || isSubmitting}>{t('previousStep')}</Button>
                        <Button onClick={next} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {currentStep === 0 ? t('startApplication') : (currentStep === steps.length - 1 ? t('submitApplication') : t('nextStep'))}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
