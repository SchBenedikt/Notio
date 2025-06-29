"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  content: z.string().min(1, "Der Beitrag darf nicht leer sein.").max(1000, "Der Beitrag darf nicht länger als 1000 Zeichen sein."),
});

type EditPostDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (postId: string, newContent: string) => Promise<void>;
  post: Post;
};

export function EditPostDialog({ isOpen, onOpenChange, onUpdate, post }: EditPostDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        content: post.content,
      });
    }
  }, [isOpen, post, form]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    await onUpdate(post.id, values.content);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Beitrag bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere den Inhalt deines Beitrags.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Beitragstext</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Was möchtest du teilen?"
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Änderungen speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
