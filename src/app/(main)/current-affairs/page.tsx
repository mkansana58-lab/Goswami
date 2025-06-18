
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, Loader2, ExternalLink, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CurrentAffairsItem } from '@/ai/flows/generate-current-affairs-flow';
import { getAIGeneratedCurrentAffairs } from './actions';
import { useToast } from "@/hooks/use-toast";

// Interface for the AI generated articles to be displayed
interface DisplayArticle extends CurrentAffairsItem {
  id: string; // Add an ID for React key purposes
}

export default function CurrentAffairsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchAIArticles = async () => {
    setIsLoading(true);
    setArticles([]); // Clear previous articles
    try {
      const result = await getAIGeneratedCurrentAffairs({ language, count: 10 }); // Fetch 10 articles
      if ('error' in result) {
        toast({
          title: t('errorOccurred'),
          description: result.error,
          variant: "destructive",
        });
        setArticles([]);
      } else {
        // Add a unique ID to each article for React keys
        const articlesWithId = result.articles.map((article, index) => ({
          ...article,
          id: `ai-article-${Date.now()}-${index}`
        }));
        setArticles(articlesWithId);
      }
    } catch (error) {
      console.error("Error fetching AI current affairs:", error);
      toast({
        title: t('errorOccurred'),
        description: language === 'hi' ? 'AI करेंट अफेयर्स लोड करने में विफल।' : 'Failed to load AI current affairs.',
        variant: "destructive",
      });
      setArticles([]);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };
  
  // Optional: Fetch initial articles on component mount
  // useEffect(() => {
  //   fetchAIArticles();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [language]);


  const formatDate = (dateString: string) => {
    try {
      // Assuming dateString is 'YYYY-MM-DD'
      const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
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
          <div className="text-center mb-6">
            <Button onClick={fetchAIArticles} disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isLoading ? t('loading') : (language === 'hi' ? 'नए करेंट अफेयर्स उत्पन्न करें' : 'Generate Fresh Current Affairs')}
            </Button>
          </div>

          {isLoading && isInitialLoad ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : !isLoading && articles.length === 0 && !isInitialLoad ? (
              <p className="text-center text-muted-foreground py-6">{language === 'hi' ? 'कोई करेंट अफेयर्स आइटम उत्पन्न नहीं हुआ या उपलब्ध नहीं है।' : 'No current affairs items generated or available.'}</p>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <Card key={article.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <CardTitle className="text-xl text-secondary-foreground mb-1">{article.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-2">
                  {article.publishedAtSuggestion ? `${t('publishedDate') || 'Published'}: ${formatDate(article.publishedAtSuggestion)}` : ''}
                  {article.category && ` | ${t('category') || 'Category'}: ${article.category}`}
                  {article.sourceName && ` | ${t('source') || 'Source'}: ${article.sourceName}`}
                </CardDescription>
                <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{article.summary}</p>
                {/* Removed ExternalLink as AI doesn't provide actual URLs */}
              </Card>
            ))
          ) : (
             !isInitialLoad && <p className="text-center text-muted-foreground py-6">{t('noCurrentAffairsAvailable')}</p>
          )}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {language === 'hi' ? 'करेंट अफेयर्स AI द्वारा उत्पन्न होते हैं। सटीकता भिन्न हो सकती है।' : 'Current affairs are AI-generated. Accuracy may vary.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
// Add/update to translations:
// category: "Category" (EN/HI)
// AI generated current affairs note: (The new note at the bottom)

// Also need to update translations for button:
// generateNewCurrentAffairs: "Generate Fresh Current Affairs" (EN)
// उत्पन्न नए करेंट अफेयर्स: "नए करेंट अफेयर्स उत्पन्न करें" (HI) (This is an example, use appropriate key)
// noCurrentAffairsGenerated: "No current affairs items generated or available."
// कोई करेंट अफेयर्स उत्पन्न नहीं हुआ: "कोई करेंट अफेयर्स आइटम उत्पन्न नहीं हुआ या उपलब्ध नहीं है।"
