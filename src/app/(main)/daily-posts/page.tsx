
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { getPosts, type Post } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Newspaper } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function DailyPostsPage() {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPosts()
            .then(setPosts)
            .catch(err => console.error("Failed to fetch posts:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <Newspaper className="h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold text-primary mt-2">{t('dailyPosts')}</h1>
                <p className="text-muted-foreground">Latest news and notifications from the academy.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>{t('comingSoon') || 'No posts available at the moment. Please check back later.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <Card key={post.id} className="flex flex-col">
                            {post.imageUrl && (
                                <div className="w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
                                    <Image
                                        src={post.imageUrl}
                                        alt={post.title}
                                        width={400}
                                        height={225}
                                        className="w-full h-full object-cover"
                                        data-ai-hint="post"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                                <p className="text-sm text-muted-foreground pt-1">{format(new Date(post.createdAt), 'PPP')}</p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p>{post.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
