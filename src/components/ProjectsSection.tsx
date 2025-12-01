// Projects Section - Inline display for home page

'use client';

import { Card } from '@/components/ui/card';
import { ExternalLink, Rocket, Radio, Clock, Sparkles } from 'lucide-react';

export function ProjectsSection() {
  const projects = [
    {
      name: 'Base Tribe Community',
      status: 'live',
      description: 'A comprehensive community engagement platform for the base ecosystem. Features include real-time engagement tracking, token rewards ($BTRIBE), leaderboard systems, NFT minting, and seamless Web3 integration with Base Account and Farcaster protocols.',
      link: null,
      version: 'Beta',
      icon: '🏆',
    },
    {
      name: 'FOMO CLIX',
      status: 'private-beta',
      description: 'An AI-powered automated content coin and creator coin trader. Democratizing coin trading on Base blockchain with intelligent automation that makes trading accessible to everyone.',
      link: 'https://x.com/FomoClix',
      version: 'Private Beta',
      icon: '🤖',
    },
    {
      name: 'BaseBoost',
      status: 'private-beta',
      description: 'Your AI that boosts your posts on Base. Schedule buying of your own post coin, allocating a user\'s budget into their own creator coin. It\'s an automated profile investment agent. Paid service. Beta testing — community gets early access.',
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
    <div className="w-full max-w-6xl mx-auto mb-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#39FF14]/20 to-[#00D4FF]/20 border border-[#39FF14]/50 rounded-full px-6 py-2 mb-4">
          <Rocket className="w-5 h-5 text-[#39FF14]" />
          <span className="text-[#39FF14] font-bold tracking-wide uppercase text-sm">Our Projects Progress</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-[#39FF14] to-[#00D4FF] bg-clip-text text-transparent">
          Building the BaseTribe Ecosystem
        </h2>
        <p className="text-white/60 text-sm md:text-base max-w-3xl mx-auto">
          A comprehensive ecosystem of interconnected products designed for the next generation of Web3 communities on Base blockchain.
        </p>
      </div>

      {/* What Drives Our Projects Block */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#001F3F]/80 via-[#0A0F2B]/90 to-[#001F3F]/80 border-2 border-[#7B2CBF]/30 backdrop-blur-sm mx-4 mb-8">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7B2CBF]/0 via-[#00D4FF]/20 to-[#7B2CBF]/0 animate-shimmer pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative p-6 md:p-8 space-y-4">
          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-[#39FF14] via-[#00D4FF] to-[#7B2CBF] bg-clip-text text-transparent">
              WHAT DRIVES OUR PROJECTS?
            </span>
          </h3>
          
          {/* Description */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <p className="text-white/80 text-sm md:text-base leading-relaxed text-center">
              If we see something that could be helpful to the Base ecosystem but it's being exclusively kept for a limited few to use, we make it our mission to create better tooling and systems and make it available for everyone to use.
            </p>
            <p className="text-white/80 text-sm md:text-base leading-relaxed text-center font-semibold">
              We are not dreaming up random ideas — we build what the community needs.
            </p>
          </div>

          {/* Decorative bottom line */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent"></div>
            <Sparkles className="w-4 h-4 text-[#39FF14]" />
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#7B2CBF]/20 to-transparent rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#00D4FF]/20 to-transparent rounded-tl-full"></div>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-4 px-4">
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
              <p className="text-white/70 text-sm leading-relaxed pl-0 md:pl-16">
                {project.description}
              </p>

              {/* Bottom border with gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39FF14]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6 px-4">
        <p className="text-white/40 text-xs">
          BaseTribe Ecosystem • Powered by Farcaster, Neynar, and Base Protocol
        </p>
      </div>
    </div>
  );
}