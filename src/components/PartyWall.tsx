import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Submission {
  id: string;
  name: string;
  comment: string | null;
  photo_url: string;
  created_at: string;
}

export const PartyWall: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();

    // Set up real-time subscription
    const channel = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
        },
        (payload) => {
          const newSubmission = payload.new as Submission;
          setSubmissions(prev => [newSubmission, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="text-center p-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold mb-2">Be the first to join!</h3>
        <p className="text-muted-foreground">
          Share your photo to get this party started!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={submission.photo_url}
                    alt={`Photo by ${submission.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-primary truncate">
                      {submission.name}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(submission.created_at)}
                    </span>
                  </div>
                  {submission.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {submission.comment}
                    </p>
                  )}
                </CardContent>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <div className="space-y-4">
                <img
                  src={submission.photo_url}
                  alt={`Photo by ${submission.name}`}
                  className="w-full rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    {submission.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                  {submission.comment && (
                    <p className="mt-2 text-foreground">
                      {submission.comment}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      ))}
    </div>
  );
};