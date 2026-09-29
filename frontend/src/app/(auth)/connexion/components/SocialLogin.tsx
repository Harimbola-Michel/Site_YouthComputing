'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Chrome, Facebook, Github, Linkedin, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const socialProviders: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'hover:text-[#DB4437]',
    bgColor: 'hover:bg-[#DB4437]/10',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'hover:text-[#1877F2]',
    bgColor: 'hover:bg-[#1877F2]/10',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'hover:text-[#0A66C2]',
    bgColor: 'hover:bg-[#0A66C2]/10',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'hover:text-foreground',
    bgColor: 'hover:bg-muted',
  },
];

export function SocialLogin() {
  const router = useRouter();

  const handleSocialLogin = async (provider: string) => {
    try {
      // Simuler une redirection OAuth
      toast.loading(`Redirection vers ${provider}...`);
      
      // Dans un cas réel, rediriger vers l'URL OAuth
      // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
      
      // Simuler un délai
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.dismiss();
      toast.info(`Connexion avec ${provider} en cours de développement`, {
        duration: 4000,
      });
      
      console.log(`Login with ${provider}`);
    } catch (error) {
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {socialProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-11 w-11 rounded-full border-2 transition-all duration-300 ${provider.bgColor} ${provider.color} hover:border-current hover:shadow-md`}
                  onClick={() => handleSocialLogin(provider.id)}
                  aria-label={`Se connecter avec ${provider.name}`}
                >
                  <provider.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">
                  Continuer avec {provider.name}
                </p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}