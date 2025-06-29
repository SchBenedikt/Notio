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
import type { Comment } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  content: z.string().min(1, "Der Kommentar darf nicht leer sein.").max(1000, "Der Kommentar darf nicht länger als 1000 Zeichen sein."),
});

type EditCommentDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (commentId: string, newContent: string) => Promise<void>;
  comment: Comment;
};

export function EditCommentDialog({ isOpen, onOpenChange, onUpdate, comment }: EditCommentDialogProps) {
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
        content: comment.content,
      });
    }
  }, [isOpen, comment, form]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    await onUpdate(comment.id, values.content);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kommentar bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere den Inhalt deines Kommentars.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Kommentartext</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Was möchtest du sagen?"
                      className="resize-y min-h-[100px]"
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
