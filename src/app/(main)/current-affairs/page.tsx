
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, Loader2, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const CURRENT_AFFAIRS_COLLECTION = 'currentAffairsArticles';

interface Article {
  id: string;
  title: string;
  summary: string;
  sourceName?: string;
  sourceUrl?: string;
  publishedAt: Timestamp;
}

export default function CurrentAffairsPage() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, CURRENT_AFFAIRS_COLLECTION), orderBy("publishedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedArticles: Article[] = [];
        querySnapshot.forEach((doc) => {
          fetchedArticles.push({ id: doc.id, ...doc.data() } as Article);
        });
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching current affairs from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Newspaper className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('navCurrentAffairs')}</CardTitle>
          <CardDescription className="text-lg">{t('currentAffairsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <Card key={article.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <CardTitle className="text-xl text-secondary-foreground mb-1">{article.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-2">
                  {t('publishedDate') || 'Published'}: {formatDate(article.publishedAt)}
                  {article.sourceName && ` | ${t('source') || 'Source'}: ${article.sourceName}`}
                </CardDescription>
                <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{article.summary}</p>
                {article.sourceUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {t('readMore') || 'Read More'} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('noCurrentAffairsAvailable') || "No current affairs articles available at the moment."}</p>
          )}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {t('adminManageCurrentAffairsNote') || "Admin: Please add/manage articles in the 'currentAffairsArticles' collection in Firestore."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add to translations:
// publishedDate: "Published" (EN/HI)
// source: "Source" (EN/HI)
// readMore: "Read More" (EN/HI)
// noCurrentAffairsAvailable: "No current affairs articles available at the moment." (EN/HI)
// adminManageCurrentAffairsNote: "Admin: Please add/manage articles in the 'currentAffairsArticles' collection in Firestore." (EN/HI)
