
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ListChecks } from 'lucide-react';
import { SchoolChoiceCertificate, type SchoolChoiceData } from '@/components/school/school-choice-certificate';

const formSchema = z.object({
  applicationNo: z.string().min(5, "Application No is required"),
  candidateName: z.string().min(3, "Candidate Name is required"),
  fatherName: z.string().min(3, "Father's Name is required"),
  category: z.string().min(3, "Category is required"),
  gender: z.string().min(3, "Gender is required"),
  domicile: z.string().min(3, "Domicile is required"),
});

export default function SchoolListPage() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<SchoolChoiceData | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            applicationNo: "251810200584",
            candidateName: "MR. MOHIT",
            fatherName: "RAM AKHETYAR",
            category: "OBC-NCL (Central List)",
            gender: "Male",
            domicile: "RAJASTHAN"
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setFormData(values);
    };

    if (formData) {
        return <SchoolChoiceCertificate data={formData} onBack={() => setFormData(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <ListChecks className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('schoolList')}</h1>
                <p className="text-muted-foreground">Generate your school priority list certificate.</p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Enter Your Details</CardTitle>
                    <CardDescription>Fill in the details below to generate your school priority list.</CardDescription>
                </CardHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Application No</Label><Input {...form.register('applicationNo')} /><p className="text-destructive text-xs">{form.formState.errors.applicationNo?.message}</p></div>
                        <div><Label>Candidate Name</Label><Input {...form.register('candidateName')} /><p className="text-destructive text-xs">{form.formState.errors.candidateName?.message}</p></div>
                        <div><Label>Father's Name</Label><Input {...form.register('fatherName')} /><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p></div>
                        <div><Label>Gender</Label><Input {...form.register('gender')} /><p className="text-destructive text-xs">{form.formState.errors.gender?.message}</p></div>
                        <div><Label>Category</Label><Input {...form.register('category')} /><p className="text-destructive text-xs">{form.formState.errors.category?.message}</p></div>
                        <div><Label>Domicile</Label><Input {...form.register('domicile')} /><p className="text-destructive text-xs">{form.formState.errors.domicile?.message}</p></div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Generate Certificate</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
