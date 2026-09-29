import { redirect } from 'next/navigation';

/** Candidatures are submitted from an individual recruitment offer. */
export default function CandidaturesPage() {
  redirect('/recrutements');
}
