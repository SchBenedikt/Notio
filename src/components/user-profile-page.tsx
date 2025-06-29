"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Profile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User, Users } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type UserProfilePageProps = {
  userId: string;
  onBack: () => void;
  onToggleFollow: (targetUserId: string) => void;
  currentUserProfile: Profile | null;
};

const ProfileSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Card>
            <CardHeader className="items-center text-center">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="w-full space-y-2 mt-2">
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
            </CardHeader>
            <CardContent className="flex justify-center gap-6">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </CardContent>
        </Card>
    </div>
);


export function UserProfilePage({ userId, onBack, onToggleFollow, currentUserProfile }: UserProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const profileRef = doc(db, 'profiles', userId);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ uid: docSnap.id, ...docSnap.data() } as Profile);
      } else {
        setProfile(null); // User not found
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);
  
  const isFollowing = currentUserProfile?.following?.includes(userId) || false;
  const isOwnProfile = user?.uid === userId;


  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 text-center">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Community
            </Button>
            <h2 className="text-2xl font-bold">Profil nicht gefunden</h2>
            <p className="text-muted-foreground">Der gesuchte Nutzer existiert nicht.</p>
        </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button variant="ghost" onClick={onBack}>
         <ArrowLeft className="mr-2 h-4 w-4" />
         Zurück zur Community
       </Button>

       <Card>
            <CardHeader className="items-center text-center space-y-4">
                <Avatar className="h-24 w-24 text-4xl">
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    {profile.bio && <CardDescription className="mt-2 text-base">{profile.bio}</CardDescription>}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="flex gap-6 text-center">
                    <div>
                        <p className="text-2xl font-bold">{profile.followers?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Follower</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">{profile.following?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Folgt</p>
                    </div>
                </div>
                {!isOwnProfile && (
                    <Button 
                        onClick={() => onToggleFollow(userId)}
                        variant={isFollowing ? 'outline' : 'default'}
                        className="w-full max-w-xs"
                    >
                        {isFollowing ? 'Gefolgt' : 'Folgen'}
                    </Button>
                )}
            </CardContent>
       </Card>
    </div>
  );
}
