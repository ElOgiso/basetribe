// Projects Modal - Professional showcase of BaseTribe ecosystem projects

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Rocket, Radio, Clock, Sparkles } from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectsModal({ isOpen, onClose }: ProjectsModalProps) {
  const projects = [
    {
      name: 'Base Tribe Community',
      status: 'live',
      description: 'A comprehensive community engagement platform for the Base ecosystem. Features include real-time engagement tracking, token rewards ($BTRIBE),($JESSE),($USDC), leaderboard systems, NFT minting, and seamless Web3 integration with Base Account and Farcaster protocols.',
      link: null,
      version: 'Beta',
      icon: '🏆',
    },
    {
      name: 'FOMO CLIX',
      status: 'private-beta',
      description: 'An AI-powered automated content coin and creator coin trader. Democratizing coin trading on Base blockchain with intelligent automation that makes trading accessible to everyone on base.',
      link: 'https://x.com/FomoClix',
      version: 'Private Beta',
      icon: '🤖',
    },
    {
      name: 'BaseBoost',
      status: 'private-beta',
      description: 'Your AI that boosts your posts on Base. Schedule buying of your own post coin, allocating a user\'s budget into their own creator coin. It\'s an automated profile investment agent. Paid service. Beta testing - community gets early access.',
      link: null,
      version: 'Private Beta',
      icon: '🚀',
    },
    {
      name: 'ɖòɖò',
      status: 'coming-soon',
      description: 'A cultural home celebrating traditions, customs, and heritage. A revolutionary marketplace bridging digital and physical merchandise, preserving and promoting cultural authenticity in the Web3 era.',
      link: 'https://x.com/dododotxyz',
      version: 'Coming Soon',
      icon: '🌍',
    },
    {
      name: 'Base Tribe PFP NFT Generator',
      status: 'coming-soon',
      description: 'Community-driven profile picture NFT collection generator. Empowering Base Tribe members to create unique, personalized digital identities that represent their journey and contributions.',
      link: null,
      version: 'Coming Soon',
      icon: '🎨',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#39FF14] blur-md opacity-70 animate-pulse"></div>
              <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-[#39FF14]/30 to-[#2ECC11]/30 border border-[#39FF14] rounded-full px-3 py-1">
                <Radio className="w-3.5 h-3.5 text-[#39FF14] animate-pulse" />
                <span className="text-[#39FF14] font-bold text-xs tracking-wider uppercase">LIVE</span>
              </div>
            </div>
          </div>
        );
      case 'private-beta':
        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00D4FF] blur-md opacity-50"></div>
              <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-[#00D4FF]/30 to-[#0095FF]/30 border border-[#00D4FF] rounded-full px-3 py-1">
                <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-[#00D4FF] font-bold text-xs tracking-wider uppercase">LIVE: PRIVATE BETA</span>
              </div>
            </div>
          </div>
        );
      case 'coming-soon':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#7B2CBF]/30 to-[#9D4EDD]/30 border border-[#7B2CBF] rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-[#9D4EDD]" />
            <span className="text-[#9D4EDD] font-bold text-xs tracking-wider uppercase">COMING SOON</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-white/10 backdrop-blur-2xl p-0">
        {/* Header with glassmorphic effect */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black via-black/98 to-transparent backdrop-blur-xl border-b border-white/10 p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#39FF14]/20 to-[#00D4FF]/20 border border-[#39FF14]/30">
                <Rocket className="w-6 h-6 text-[#39FF14]" />
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-white via-[#39FF14] to-[#00D4FF] bg-clip-text text-transparent">
                Our Projects Progress
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/60 text-sm max-w-2xl">
              Building the future of Web3 community engagement and cultural preservation on Base blockchain. 
              A comprehensive ecosystem of interconnected products designed for the next generation of decentralized communities.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Projects Grid */}
        <div className="p-6 space-y-4">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-white/10 hover:border-[#39FF14]/30 transition-all duration-300"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14]/5 via-[#00D4FF]/5 to-[#7B2CBF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glass morphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-sm"></div>
              
              <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0 mt-1 grayscale group-hover:grayscale-0 transition-all duration-300">
                      {project.icon}
                    </div>
                    
                    {/* Title and Status */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#39FF14] transition-colors">
                        {project.name}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* External Link */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D4FF]/50 transition-all group/link"
                    >
                      <ExternalLink className="w-5 h-5 text-white/60 group-hover/link:text-[#00D4FF] transition-colors" />
                    </a>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/70 text-sm leading-relaxed pl-16">
                  {project.description}
                </p>

                {/* Bottom border with gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39FF14]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/98 to-transparent backdrop-blur-xl border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-white/50 text-xs">
              <p>BaseTribe Ecosystem • Building on Base</p>
              <p className="text-white/30 mt-1">Powered by Farcaster, Neynar, and Base Protocol</p>
            </div>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-[#39FF14]/20 to-[#2ECC11]/20 hover:from-[#39FF14]/30 hover:to-[#2ECC11]/30 border border-[#39FF14]/50 text-[#39FF14] hover:text-white transition-all"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export the trigger button component
export function ProjectsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="relative group bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#004d99] border border-[#39FF14]/30 text-white font-semibold shadow-lg shadow-[#39FF14]/10 hover:shadow-[#39FF14]/20 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14]/0 via-[#39FF14]/10 to-[#00D4FF]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Rocket className="w-4 h-4 mr-2 relative z-10" />
        <span className="relative z-10">Our Projects</span>
      </Button>
      
      <ProjectsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}