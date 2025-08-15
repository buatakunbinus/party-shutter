import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CameraCapture } from './CameraCapture';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuestSubmissionFormProps {
  onSubmissionComplete: () => void;
}

export const GuestSubmissionForm: React.FC<GuestSubmissionFormProps> = ({
  onSubmissionComplete,
}) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('party-photos')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Photo upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('party-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!photo) {
      toast({
        title: "Photo required",
        description: "Please take a selfie or upload a photo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrl = await uploadPhoto(photo);

      const { error } = await supabase
        .from('submissions')
        .insert({
          name: name.trim(),
          comment: comment.trim() || null,
          photo_url: photoUrl,
        });

      if (error) {
        throw new Error(`Submission failed: ${error.message}`);
      }

      toast({
        title: "🎉 Awesome!",
        description: "Your photo has been added to the party wall!",
      });

      // Reset form
      setName('');
      setComment('');
      setPhoto(null);
      onSubmissionComplete();

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Join the Party! 🎉
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="Enter your name"
              required
              maxLength={30}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground text-right">
              {name.length}/30
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Party Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 100))}
              placeholder="Share something fun! (optional)"
              maxLength={100}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label>Your Photo *</Label>
            <CameraCapture
              photo={photo}
              onPhotoCapture={setPhoto}
              onRemovePhoto={() => setPhoto(null)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !photo}
            className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              "Adding to party wall..."
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Join the Party!
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};