"use client";
import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award } from '@/lib/types';
import { AwardsShareCard } from './awards-share-card';
import * as htmlToImage from 'html-to-image';
import { Loader2, Download } from 'lucide-react';

type AwardsShareDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    unlockedAwards: Award[];
    gradeLevel: number;
};

export function AwardsShareDialog({ isOpen, onOpenChange, unlockedAwards, gradeLevel }: AwardsShareDialogProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        try {
            const dataUrl = await htmlToImage.toPng(cardRef.current, {
                cacheBust: true,
                quality: 1.0,
                pixelRatio: 2, // for higher resolution
            });
            const link = document.createElement('a');
            link.download = `noten-meister-awards-grade-${gradeLevel}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to generate image", error);
        } finally {
            setIsDownloading(false);
        }
    }, [gradeLevel]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share Your Achievements</DialogTitle>
                    <DialogDescription>
                        Here's a preview of your shareable awards card. Download it as an image to share with friends!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center p-4 bg-muted/50 rounded-lg">
                   <AwardsShareCard ref={cardRef} unlockedAwards={unlockedAwards} gradeLevel={gradeLevel} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
