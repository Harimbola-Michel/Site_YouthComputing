'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Video,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronRight,
  User,
  GraduationCap,
  CreditCard,
  Shield,
  Globe,
  FileText,
  ExternalLink,
  Send,
  CheckCircle,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Données FAQ ──────────────────────────────────────────────
const faqData = [
  {
    id: 'general-1',
    category: 'Général',
    question: 'Qu\'est-ce que Youth Computing ?',
    answer:
      "Youth Computing est une association malgache qui promeut la culture numérique et l'inclusion technologique. Nous proposons des formations, des projets communautaires et un espace d'échange pour les passionnés du numérique.",
  },
  {
    id: 'general-2',
    category: 'Général',
    question: 'Comment puis-je rejoindre la communauté Y2C ?',
    answer:
      'Vous pouvez rejoindre la communauté Y2C en vous inscrivant sur notre site via la page "Communauté Y2C". L\'adhésion est gratuite et vous donne accès à nos événements, ateliers et groupes de discussion.',
  },
  {
    id: 'formations-1',
    category: 'Formations',
    question: 'Comment m\'inscrire à une formation ?',
    answer:
      'Pour vous inscrire à une formation, rendez-vous sur la page de la formation qui vous intéresse, sélectionnez une session disponible et cliquez sur "S\'inscrire". Vous recevrez une confirmation par email après validation de votre inscription.',
  },
  {
    id: 'formations-2',
    category: 'Formations',
    question: 'Les formations sont-elles payantes ?',
    answer:
      'Certaines formations sont gratuites, d\'autres sont payantes. Le prix est affiché sur chaque page de formation. Des réductions sont disponibles pour les étudiants et les membres de la communauté Y2C.',
  },
  {
    id: 'formations-3',
    category: 'Formations',
    question: 'Puis-je annuler mon inscription ?',
    answer:
      'Oui, vous pouvez annuler votre inscription jusqu\'à 48 heures avant le début de la session. Pour cela, contactez-nous par email ou via le formulaire de contact avec votre numéro d\'inscription.',
  },
  {
    id: 'paiement-1',
    category: 'Paiement',
    question: 'Quels sont les modes de paiement acceptés ?',
    answer:
      'Nous acceptons les paiements via Mobile Money (MVola, Airtel Money, Orange Money, Telma Money) et les virements bancaires. Les coordonnées bancaires vous sont communiquées lors de l\'inscription.',
  },
  {
    id: 'paiement-2',
    category: 'Paiement',
    question: 'Comment obtenir une facture ?',
    answer:
      'Une facture est automatiquement générée après la confirmation de votre paiement. Vous pouvez la télécharger depuis votre espace personnel ou la recevoir par email sur demande.',
  },
  {
    id: 'technique-1',
    category: 'Technique',
    question: 'Je n\'arrive pas à accéder à mon compte, que faire ?',
    answer:
      'Si vous rencontrez des difficultés pour accéder à votre compte, vérifiez que vous utilisez la bonne adresse email et le bon mot de passe. Utilisez la fonction "Mot de passe oublié" pour réinitialiser votre mot de passe. Si le problème persiste, contactez notre support technique.',
  },
  {
    id: 'technique-2',
    category: 'Technique',
    question: 'Comment signaler un bug sur le site ?',
    answer:
      'Vous pouvez signaler un bug en nous envoyant un email à support@youthcomputing.org avec une description détaillée du problème, les étapes pour le reproduire et une capture d\'écran si possible. Nous traitons les signalements dans les plus brefs délais.',
  },
  {
    id: 'projets-1',
    category: 'Projets',
    question: 'Comment proposer un projet ?',
    answer:
      'Si vous souhaitez proposer un projet, vous pouvez nous contacter via le formulaire de contact ou envoyer un email à projets@youthcomputing.org avec une description de votre idée, les objectifs et les compétences recherchées.',
  },
  {
    id: 'y2c-1',
    category: 'Communauté Y2C',
    question: 'Quels sont les avantages d\'être membre Y2C ?',
    answer:
      "Être membre Y2C vous donne accès à des formations à prix réduit, à des événements exclusifs, à un réseau de passionnés, à des opportunités de bénévolat et à des ressources éducatives. C'est aussi une chance de contribuer à la transformation numérique de Madagascar.",
  },
];

// ─── Sections ──────────────────────────────────────────────────
const guideSections = [
  {
    icon: User,
    title: 'Créer un compte',
    description: 'Inscrivez-vous et créez votre profil en quelques minutes.',
    steps: ['Aller sur la page d\'inscription', 'Remplir le formulaire', 'Vérifier votre email', 'Compléter votre profil'],
  },
  {
    icon: GraduationCap,
    title: 'S\'inscrire à une formation',
    description: 'Trouvez la formation qui vous correspond et inscrivez-vous.',
    steps: ['Parcourir les formations', 'Choisir une session', 'Remplir le formulaire d\'inscription', 'Effectuer le paiement si nécessaire'],
  },
  {
    icon: CreditCard,
    title: 'Effectuer un paiement',
    description: 'Payez en toute sécurité par Mobile Money ou virement.',
    steps: ['Choisir votre mode de paiement', 'Suivre les instructions', 'Valider le paiement', 'Recevoir votre confirmation'],
  },
  {
    icon: Shield,
    title: 'Sécurité et confidentialité',
    description: 'Vos données sont protégées et sécurisées.',
    steps: ['Consulter notre politique de confidentialité', 'Utiliser un mot de passe fort', 'Activer la vérification en deux étapes', 'Signaler toute activité suspecte'],
  },
];

// ─── Composant FAQ ─────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  category,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="border-b border-border last:border-0"
      initial={false}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-muted/30 px-4 -mx-4 rounded-lg transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 text-secondary">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <div>
            <span className="inline-block text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-1">
              {category}
            </span>
            <p className="font-medium">{question}</p>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-4 md:pl-10 text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function AidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // ─── Filtrage FAQ ──────────────────────────────────────────
  const categories = ['Tous', ...new Set(faqData.map((item) => item.category))];
  const filteredFaq = faqData.filter((item) => {
    const matchCategory = activeCategory === 'Tous' || item.category === activeCategory;
    const matchSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ─── Toggle FAQ ─────────────────────────────────────────────
  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // ─── Soumission formulaire ─────────────────────────────────
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      toast.success('Message envoyé ! Nous vous répondrons rapidement.');
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-16 md:py-24">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-4 text-sm font-medium">
                <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                Centre d'aide
              </Badge>
              <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
                Comment pouvons-nous vous <span className="text-secondary">aider</span> ?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Trouvez des réponses à vos questions, consultez nos guides ou contactez-nous directement.
              </p>

              {/* Barre de recherche */}
              <div className="mt-8 relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher une question, un sujet, un mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-base rounded-full border-2 focus-visible:ring-secondary"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Guides rapides ─────────────────────────────────────── */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-ubuntu text-2xl font-bold">Guides pas à pas</h2>
              <p className="text-muted-foreground">Tout ce que vous devez savoir pour bien démarrer</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {guideSections.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                        <guide.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="font-ubuntu text-lg">{guide.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5 text-sm">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Sidebar catégories */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h3 className="font-semibold mb-4">Catégories</h3>
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'justify-start w-full lg:w-auto',
                          activeCategory === cat && 'bg-secondary text-white hover:bg-secondary/90'
                        )}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Liste FAQ */}
              <div className="lg:col-span-3">
                <div className="rounded-lg border bg-card">
                  {filteredFaq.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Aucune question ne correspond à votre recherche.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredFaq.map((item) => (
                        <FAQItem
                          key={item.id}
                          question={item.question}
                          answer={item.answer}
                          category={item.category}
                          isOpen={openFaqId === item.id}
                          onToggle={() => toggleFaq(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Contact et support ────────────────────────────────── */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Formulaire de contact */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="font-ubuntu flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                      Nous contacter
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas trouvé de réponse ? Écrivez-nous, nous vous répondrons sous 24h.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {formSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-center"
                      >
                        <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                        <h3 className="font-semibold text-lg">Message envoyé !</h3>
                        <p className="text-muted-foreground text-sm">
                          Notre équipe vous répondra dans les plus brefs délais.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmitContact} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium">
                              Nom complet *
                            </label>
                            <Input
                              id="name"
                              placeholder="Jean Dupont"
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium">
                              Email *
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="jean@email.com"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Sujet *
                          </label>
                          <Input
                            id="subject"
                            placeholder="Objet de votre message"
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="message" className="text-sm font-medium">
                            Message *
                          </label>
                          <Textarea
                            id="message"
                            placeholder="Décrivez votre demande en détail..."
                            rows={4}
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Coordonnées */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="font-ubuntu flex items-center gap-2">
                      <Phone className="h-5 w-5 text-secondary" />
                      Nous joindre
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href="mailto:contact@youthcomputing.org" className="text-sm text-primary hover:underline">
                          contact@youthcomputing.org
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <a href="tel:+261341234567" className="text-sm text-primary hover:underline">
                          +261 34 12 345 67
                        </a>
                        <p className="text-xs text-muted-foreground">Lun-Ven, 8h-17h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Horaires de support</p>
                        <p className="text-sm text-muted-foreground">Lundi – Vendredi : 8h – 17h</p>
                        <p className="text-sm text-muted-foreground">Samedi : 9h – 13h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Adresse</p>
                        <p className="text-sm text-muted-foreground">
                          Antananarivo, Madagascar
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Liens utiles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-ubuntu text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-secondary" />
                      Ressources utiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <a
                      href="/politique-confidentialite"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Politique de confidentialité
                    </a>
                    <a
                      href="/mentions-legales"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Mentions légales
                    </a>
                    <a
                      href="/cookies"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Politique des cookies
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}