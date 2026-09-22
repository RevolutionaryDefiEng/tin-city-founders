/**
 * Shared type for the Tin City Founders events archive.
 * Consumed by the server (sheet/seed sync) and the client (EventsSection).
 */
export type TcfEvent = {
  id: string;
  title: string;
  /** yyyy-mm or yyyy-mm-dd */
  date: string;
  location: string;
  participantCount: number | null;
  sectors: string[];
  partners: string[];
  summary: string;
  outcome: string;
  photoUrl: string;
};
