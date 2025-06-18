
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, Loader2, Wand2, Languages } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { CurrentAffairsItem } from '@/ai/flows/generate-current-affairs-flow';
import { getAIGeneratedCurrentAffairs } from './actions';
import { useToast } from "@/hooks/use-toast";

// Interface for the AI generated articles to be displayed
interface DisplayArticle extends CurrentAffairsItem {
  id: string; // Add an ID for React key purposes
}

export default function CurrentAffairsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchAIArticles = useCallback(async (currentLang: 'en' | 'hi') => {
    setIsLoading(true);
    setArticles([]); // Clear previous articles
    try {
      const result = await getAIGeneratedCurrentAffairs({ language: currentLang, count: 25 }); // Fetch 25 articles
      if ('error' in result) {
        toast({
          title: t('errorOccurred'),
          description: result.error,
          variant: "destructive",
        });
        setArticles([]);
      } else {
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
  }, [toast, t, language]); // language is listed for t, but currentLang is passed to avoid stale closure for immediate fetch
  
  const handleLanguageChangeAndFetch = (newLang: 'en' | 'hi') => {
    setLanguage(newLang); // This will update context and trigger re-renders if other components depend on `language`
    fetchAIArticles(newLang); // Fetch immediately with the new language
  };

  // Optional: Fetch initial articles on component mount based on current language context
   useEffect(() => {
     fetchAIArticles(language);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Fetch only on initial mount with the initial language context

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00'); 
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-CA', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateString; 
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <Button onClick={() => fetchAIArticles(language)} disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading && articles.length === 0 ? ( // Show loader on button only if no articles are displayed yet
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isLoading && articles.length === 0 ? t('loading') : (t('generateNewCurrentAffairs') || (language === 'hi' ? 'नए करेंट अफेयर्स उत्पन्न करें' : 'Generate Fresh Current Affairs'))}
            </Button>
            <div className="flex gap-2">
                <Button onClick={() => handleLanguageChangeAndFetch('en')} variant={language === 'en' ? 'default' : 'outline'} disabled={isLoading} className="gap-1">
                    <Languages className="h-4 w-4" /> {t('english')}
                </Button>
                <Button onClick={() => handleLanguageChangeAndFetch('hi')} variant={language === 'hi' ? 'default' : 'outline'} disabled={isLoading} className="gap-1">
                    <Languages className="h-4 w-4" /> {t('hindi')}
                </Button>
            </div>
          </div>

          {isLoading && articles.length === 0 ? ( // Show main page loader only if no articles are displayed
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          ) : !isLoading && articles.length === 0 && !isInitialLoad ? (
              <p className="text-center text-muted-foreground py-6">{t('noCurrentAffairsGenerated') || (language === 'hi' ? 'कोई करेंट अफेयर्स आइटम उत्पन्न नहीं हुआ या उपलब्ध नहीं है।' : 'No current affairs items generated or available.')}</p>
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
              </Card>
            ))
          ) : (
             !isInitialLoad && <p className="text-center text-muted-foreground py-6">{t('noCurrentAffairsAvailable')}</p>
          )}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {language === 'hi' ? 'करेंट अफेयर्स AI द्वारा उत्पन्न होते हैं। सटीकता भिन्न हो सकती है। AI को भविष्य की घटनाओं या बहुत हाल की विशिष्ट तिथियों के बारे में जानकारी सीमित हो सकती है।' : 'Current affairs are AI-generated. Accuracy may vary. AI may have limited knowledge of future events or very recent specific dates.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    
