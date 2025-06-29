"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import type { Profile } from "@/lib/types";

type FollowListDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  profiles: Profile[];
  currentUserId: string | null;
  onToggleFollow: (targetUserId: string) => void;
  followingList: string[];
};

export function FollowListDialog({ isOpen, onOpenChange, title, profiles, currentUserId, onToggleFollow, followingList }: FollowListDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    return profiles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [profiles, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_1fr_auto] max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Durchsuche die Liste der Nutzer.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nutzer suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[40vh]">
            {filteredProfiles.length > 0 ? (
              <div className="space-y-2 pr-4">
                {filteredProfiles.map(p => (
                  <div key={p.uid} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    {p.uid !== currentUserId && (
                      <Button
                        size="sm"
                        variant={followingList.includes(p.uid) ? 'outline' : 'default'}
                        onClick={() => onToggleFollow(p.uid)}
                      >
                        {followingList.includes(p.uid) ? 'Gefolgt' : 'Folgen'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground pt-10">Keine Nutzer gefunden.</p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
