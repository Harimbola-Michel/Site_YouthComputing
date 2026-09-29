import { redirect } from 'next/navigation';

/** The project creation form is provided by the modal on the projects page. */
export default function NewProjectPage() {
  redirect('/admin/projets-admin');
}
