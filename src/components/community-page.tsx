"use client";

import { Users } from "lucide-react";

export function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <Users className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h2 className="text-2xl font-semibold">Community-Funktionen in Kürze</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Hier wirst du bald Beiträge sehen, anderen Nutzern folgen und dich austauschen können. Wir arbeiten bereits daran!
        </p>
      </div>
    </div>
  );
}