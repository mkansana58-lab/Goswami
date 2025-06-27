
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Info, User, BookOpen, MapPin, Upload, Loader2 } from "lucide-react";
import { ConfirmationCertificate } from "@/components/scholarship/confirmation-certificate";
import type { FormDataType } from "@/components/scholarship/confirmation-certificate";
import { addScholarshipApplication } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    fullName: z.string().min(3, "Full name is required"),
    fatherName: z.string().min(3, "Father's name is required"),
    mobile: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit number"),
    email: z.string().email("Invalid email address"),
    age: z.coerce.number().min(8, "Age must be at least 8").max(16, "Age must be at most 16"),
    class: z.enum(["5", "6", "7", "8", "9"]),
    school: z.string().min(3, "School name is required"),
    address: z.string().min(10, "Full address is required"),
    photo: z.any().refine((files) => files?.length === 1, "Photo is required."),
    signature: z.any().refine((files) => files?.length === 1, "Signature is required."),
});

const steps = [
    { id: 'instructions', title: 'scholarshipInstructionsTitle', icon: Info, fields: [] },
    { id: 'personal', title: 'step1Title', icon: User, fields: ['fullName', 'fatherName', 'mobile', 'email'] },
    { id: 'academic', title: 'step2Title', icon: BookOpen, fields: ['age', 'class', 'school'] },
    { id: 'address', title: 'step3Title', icon: MapPin, fields: ['address'] },
    { id: 'uploads', title: 'step4Title', icon: Upload, fields: ['photo', 'signature'] },
]

export default function ScholarshipPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [applicationNumber, setApplicationNumber] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            fatherName: "",
            mobile: "",
            email: "",
            age: 10,
            class: "6",
            school: "",
            address: "",
            photo: undefined,
            signature: undefined,
        },
    });

    type FieldName = keyof z.infer<typeof formSchema>;

    const processForm = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const appNum = `GSA${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;
        
        const readerPhoto = new FileReader();
        readerPhoto.onload = (ePhoto) => {
            const photoDataUrl = ePhoto.target?.result as string;
            
            const readerSignature = new FileReader();
            readerSignature.onload = async (eSignature) => {
                const signatureDataUrl = eSignature.target?.result as string;

                const finalData = { ...data, photoUrl: photoDataUrl, signatureUrl: signatureDataUrl };
                
                try {
                    await addScholarshipApplication({ ...data, applicationNumber: appNum, photoUrl: photoDataUrl, signatureUrl: signatureDataUrl });
                    setApplicationNumber(appNum);
                    setFormData(finalData);
                    setIsSubmitted(true);
                    toast({ title: "Success", description: "Application submitted successfully." });
                } catch (error) {
                    console.error("Failed to save scholarship application:", error);
                    toast({ variant: "destructive", title: "Submission Failed", description: "Could not save your application. Please try again." });
                } finally {
                    setIsSubmitting(false);
                }
            };
            readerSignature.readAsDataURL(data.signature[0]);
        };
        readerPhoto.readAsDataURL(data.photo[0]);
    };

    const next = async () => {
        if (currentStep === 0) {
            setCurrentStep(step => step + 1);
            return;
        }

        const fields = steps[currentStep].fields as FieldName[];
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
    
    if (isSubmitted && formData) {
        return <ConfirmationCertificate formData={formData} applicationNumber={applicationNumber} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('scholarshipForm')}</h1>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                   <Progress value={((currentStep) / (steps.length -1)) * 100} className="w-full mb-4" />
                   <div className="flex items-center gap-3">
                        {(() => {
                            const Icon = steps[currentStep].icon;
                            return <Icon className="h-6 w-6 text-primary" />;
                        })()}
                        <CardTitle>{t(steps[currentStep].title as any)}</CardTitle>
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
                                <Label>{t('fullName')}</Label><Input {...form.register('fullName')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.fullName?.message}</p>
                                <Label>{t('fathersName')}</Label><Input {...form.register('fatherName')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p>
                                <Label>{t('mobileNumber')}</Label><Input {...form.register('mobile')} type="tel" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.mobile?.message}</p>
                                <Label>{t('emailAddress')}</Label><Input {...form.register('email')} type="email" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.email?.message}</p>
                            </div>
                        )}
                         {currentStep === 2 && (
                            <div className="space-y-4">
                                <Label>{t('age')}</Label><Input {...form.register('age')} type="number" disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.age?.message}</p>
                                <Label>{t('selectClass')}</Label>
                                 <Select onValueChange={(value) => form.setValue('class', value as "5"|"6"|"7"|"8"|"9")} defaultValue={form.getValues('class')} disabled={isSubmitting}>
                                    <SelectTrigger><SelectValue placeholder={t('selectClass')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">Class 5</SelectItem><SelectItem value="6">Class 6</SelectItem><SelectItem value="7">Class 7</SelectItem><SelectItem value="8">Class 8</SelectItem><SelectItem value="9">Class 9</SelectItem>
                                    </SelectContent>
                                </Select><p className="text-destructive text-xs">{form.formState.errors.class?.message}</p>
                                <Label>{t('schoolName')}</Label><Input {...form.register('school')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.school?.message}</p>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <Label>{t('fullAddress')}</Label><Input {...form.register('address')} placeholder={t('fullAddressPlaceholder')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.address?.message}</p>
                            </div>
                        )}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                               <div><Label htmlFor="photo">{t('uploadPhoto')}</Label><Input id="photo" type="file" accept="image/*" {...form.register('photo')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.photo?.message as string}</p></div>
                               <div><Label htmlFor="signature">{t('uploadSignature')}</Label><Input id="signature" type="file" accept="image/*" {...form.register('signature')} disabled={isSubmitting}/><p className="text-destructive text-xs">{form.formState.errors.signature?.message as string}</p></div>
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
