
"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('adminPanel')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('adminPanel')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t('comingSoon') || 'Content coming soon...'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
