'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { RegisterForm } from './components/RegisterForm';
import { SocialLogin } from '../connexion/components/SocialLogin';

export default function RegisterPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Colonne gauche : animation Lottie (visible uniquement sur grand écran) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-lg aspect-square relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10" />
          <DotLottieReact
            src="https://lottie.host/6a11d6d3-14bd-4a69-8ede-0fd94ff4059e/OoRymvn6jn.lottie"
            loop
            autoplay
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground/60 text-sm font-light">
            <p>Rejoignez la communauté</p>
            <p className="text-xs mt-1">Youth Computing</p>
          </div>
        </motion.div>
      </div>

      {/* Colonne droite : formulaire d'inscription */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl space-y-8">
          {/* En-tête */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Créer un compte
            </h1>
            <p className="text-muted-foreground/70 text-base">
              Rejoignez la communauté Youth Computing
            </p>
          </div>

          <RegisterForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/60 px-4 text-muted-foreground/60 backdrop-blur-sm">
                Ou continuer avec
              </span>
            </div>
          </div>

          <SocialLogin />

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground/80">
              Déjà un compte ?{' '}
              <Link
                href="/connexion"
                className="font-semibold text-secondary hover:text-secondary/80 transition-colors hover:underline underline-offset-2"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}