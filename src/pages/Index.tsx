import React, { useState } from 'react';
import { GuestSubmissionForm } from '@/components/GuestSubmissionForm';
import { PartyWall } from '@/components/PartyWall';
import { Button } from '@/components/ui/button';
import { Users, Camera } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState<'form' | 'wall'>('wall');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Party Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Share your moments, celebrate together! 🎉
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={activeView === 'wall' ? 'default' : 'outline'}
              onClick={() => setActiveView('wall')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Party Wall
            </Button>
            <Button
              variant={activeView === 'form' ? 'default' : 'outline'}
              onClick={() => setActiveView('form')}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Join Party
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          {activeView === 'form' ? (
            <div className="flex justify-center">
              <GuestSubmissionForm 
                onSubmissionComplete={() => setActiveView('wall')}
              />
            </div>
          ) : (
            <PartyWall />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
