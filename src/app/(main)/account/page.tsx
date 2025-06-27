"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('profile')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('accountDetails')}</CardTitle>
                    <CardDescription>{t('accountDetailsDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="User profile" data-ai-hint="user avatar" />
                            <AvatarFallback>GS</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">Student Name</h2>
                            <p className="text-muted-foreground">student.email@example.com</p>
                        </div>
                   </div>
                   <Button>{t('editProfile')}</Button>
                </CardContent>
            </Card>
        </div>
    );
}
