import { PrismaClient, Role, UserStatus, ArticleStatus, ProjectStatus, EventType } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // =====================
  // 1. Super Admin + Admin de test
  // =====================
  const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2026!';
  const hashedPassword = await hashPassword(seedPassword);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@youthcomputing.mg' },
    update: {
      password_hash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
    },
    create: {
      email: 'admin@youthcomputing.mg',
      password_hash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
    },
  });
  console.log('✅ Super Admin:', superAdmin.email);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin2@youthcomputing.mg' },
    update: {
      password_hash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Test',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
    },
    create: {
      email: 'admin2@youthcomputing.mg',
      password_hash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Test',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
    },
  });
  console.log('✅ Admin de test:', adminUser.email);

  // =====================
  // 2. Formations
  // =====================
  const formations = [
    {
      title: 'Développement Web avec Next.js',
      slug: 'dev-web-nextjs',
      description: 'Maîtrisez le framework Next.js pour créer des applications web modernes et performantes.',
      objectives: "Apprendre les bases de Next.js, le rendu SSR/SSG, le routing, et l'optimisation.",
      prerequisites: 'Connaissances de base en JavaScript et React.',
      duration: '8 semaines',
      level: 'Intermédiaire',
      price: 150000,
      category: 'Programmation Web',
      isPublished: true,
      maxParticipants: 20,
    },
    {
      title: "Introduction à l'Intelligence Artificielle",
      slug: 'intro-ia',
      description: "Découvrez les concepts fondamentaux de l'intelligence artificielle et du machine learning.",
      objectives: "Comprendre les bases de l'IA, les algorithmes de ML, et les applications pratiques.",
      prerequisites: 'Aucun prérequis spécifique.',
      duration: '6 semaines',
      level: 'Débutant',
      price: 120000,
      category: 'Intelligence Artificielle',
      isPublished: true,
      maxParticipants: 25,
    },
    {
      title: 'Programmation Python pour Data Science',
      slug: 'python-data-science',
      description: "Apprenez à utiliser Python pour l'analyse de données et la science des données.",
      objectives: 'Maîtriser les bibliothèques Pandas, NumPy, Matplotlib, et scikit-learn.',
      prerequisites: 'Bases de la programmation.',
      duration: '10 semaines',
      level: 'Intermédiaire',
      price: 180000,
      category: 'Data Science',
      isPublished: true,
      maxParticipants: 20,
    },
  ];

  for (const formation of formations) {
    await prisma.formation.upsert({
      where: { slug: formation.slug },
      update: formation,
      create: formation,
    });
  }
  console.log('✅ Formations créées');

  // =====================
  // 3. Articles
  // =====================
  const articles = [
    {
      title: 'Lancement de la Communauté Y2C',
      slug: 'lancement-communaute-y2c',
      content: `
        <h2>Une nouvelle ère pour Youth Computing</h2>
        <p>Nous sommes ravis d'annoncer le lancement officiel de la Communauté Y2C (Youth Computing Community). Cette initiative vise à rassembler les passionnés des NTIC à Madagascar.</p>
        <h3>Ce que la communauté offre :</h3>
        <ul>
          <li>Des formations exclusives</li>
          <li>Des événements mensuels</li>
          <li>Un réseau de professionnels</li>
          <li>Des opportunités de projets</li>
        </ul>
        <p>Rejoignez-nous dès maintenant !</p>
      `,
      excerpt: 'Découvrez la nouvelle communauté Y2C pour les passionnés des NTIC.',
      category: 'Actualités',
      tags: ['communauté', 'y2c', 'ntic'],
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: superAdmin.id,
      isFeatured: true,
    },
    {
      title: 'Hack a Town 2024 : Innovation et Collaboration',
      slug: 'hack-a-town-2024',
      content: `
        <h2>Un hackathon mémorable</h2>
        <p>Le Hack a Town 2024 a été un franc succès, réunissant plus de 100 participants autour de projets innovants.</p>
        <h3>Les gagnants :</h3>
        <ul>
          <li>1er prix : Équipe InnovTech</li>
          <li>2e prix : Équipe GreenCode</li>
          <li>3e prix : Équipe DataWizards</li>
        </ul>
        <p>Félicitations à tous les participants !</p>
      `,
      excerpt: 'Retour sur le Hack a Town 2024 qui a rassemblé les talents de la communauté.',
      category: 'Événements',
      tags: ['hackathon', 'innovation', 'collaboration'],
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: superAdmin.id,
      isFeatured: false,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log('✅ Articles créés');

  // =====================
  // 4. Projets
  // =====================
  const projects = [
    {
      title: "Plateforme d'Apprentissage en Ligne",
      slug: 'plateforme-apprentissage',
      description: "Une plateforme interactive pour l'apprentissage des NTIC avec des cours en ligne et des exercices pratiques.",
      objectives: "Rendre l'éducation numérique accessible à tous.",
      impact: 'Plus de 500 étudiants formés depuis le lancement.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
      images: ['project1.jpg', 'project2.jpg'],
      year: 2024,
      category: 'Éducation',
      isFeatured: true,
      status: ProjectStatus.COMPLETED,
    },
    {
      title: 'Application Mobile de Santé',
      slug: 'app-mobile-sante',
      description: 'Une application mobile pour le suivi de la santé et la télémédecine dans les zones rurales.',
      objectives: "Améliorer l'accès aux soins de santé.",
      impact: 'Utilisée par 10 000 personnes dans 3 régions.',
      technologies: ['Flutter', 'Firebase', 'TensorFlow'],
      images: ['project3.jpg', 'project4.jpg'],
      year: 2023,
      category: 'Santé',
      isFeatured: false,
      status: ProjectStatus.COMPLETED,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log('✅ Projets créés');

  // =====================
  // 5. Équipe
  // =====================
  await prisma.teamMember.upsert({
    where: { userId: superAdmin.id },
    update: {
      role: 'Fondateur & Président',
      department: 'Direction',
      bio: "Passionné par les NTIC et l'éducation numérique.",
      displayOrder: 1,
      isActive: true,
    },
    create: {
      userId: superAdmin.id,
      role: 'Fondateur & Président',
      department: 'Direction',
      bio: "Passionné par les NTIC et l'éducation numérique.",
      displayOrder: 1,
      isActive: true,
    },
  });
  console.log('✅ Équipe créée');

  // =====================
  // 6. Événements
  // =====================
  const events = [
    {
      title: 'Hack a Town 2025',
      slug: 'hack-a-town-2025',
      description: 'Le plus grand hackathon de Madagascar, rassemblant les innovateurs de demain.',
      eventType: EventType.HACKATHON,
      startDate: new Date('2025-03-15T08:00:00Z'),
      endDate: new Date('2025-03-17T18:00:00Z'),
      time: '08:00 - 18:00',
      location: 'Antananarivo, Madagascar',
      isPublished: true,
      maxAttendees: 100,
      isPaid: false,
    },
    {
      title: 'Conférence Tech & Innovation',
      slug: 'conf-tech-innovation',
      description: "Une conférence sur les tendances technologiques et l'innovation à Madagascar.",
      eventType: EventType.CONFERENCE,
      startDate: new Date('2025-04-10T09:00:00Z'),
      endDate: new Date('2025-04-11T17:00:00Z'),
      time: '09:00 - 17:00',
      location: 'En ligne (Zoom)',
      isPublished: true,
      maxAttendees: 500,
      isPaid: false,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }
  console.log('✅ Événements créés');

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });