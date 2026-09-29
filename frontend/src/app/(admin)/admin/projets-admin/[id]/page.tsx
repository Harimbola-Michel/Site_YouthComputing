import { redirect } from 'next/navigation';

interface ProjectPageProps {
  params: { id: string };
}

/**
 * The project editor is currently provided by the modal on the projects page.
 * Keep legacy detail URLs valid until a dedicated detail screen is introduced.
 */
export default function ProjectPage({ params }: ProjectPageProps) {
  void params.id;
  redirect('/admin/projets-admin');
}
