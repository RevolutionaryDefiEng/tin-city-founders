import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ExternalLink, Filter, Loader2, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type EnquiryStatus = "new" | "reviewing" | "closed";

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  closed: "Closed",
};

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function csvValue(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function EnquiriesDashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");

  const filters = useMemo(
    () => ({ search, ...(status === "all" ? {} : { status }) }),
    [search, status],
  );

  const isAdmin = user?.role === "admin";
  const enquiriesQuery = trpc.admin.partnerEnquiries.list.useQuery(filters, { enabled: isAdmin });
  const summaryQuery = trpc.admin.partnerEnquiries.summary.useQuery(undefined, { enabled: isAdmin });
  const updateStatus = trpc.admin.partnerEnquiries.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.admin.partnerEnquiries.list.invalidate(),
        utils.admin.partnerEnquiries.summary.invalidate(),
      ]);
      toast.success("Enquiry status updated.");
    },
    onError: () => toast.error("The status could not be updated. Please try again."),
  });

  const statusCounts = useMemo(() => {
    const counts = { new: 0, reviewing: 0, closed: 0 };
    summaryQuery.data?.forEach((item) => {
      counts[item.status] = Number(item.count);
    });
    return counts;
  }, [summaryQuery.data]);

  const exportVisibleEnquiries = () => {
    const enquiries = enquiriesQuery.data ?? [];
    if (!enquiries.length) {
      toast.message("There are no visible enquiries to export.");
      return;
    }

    const header = [
      "Submitted", "Organization", "Contact", "Email", "Organization type",
      "Intended support", "Activation timing", "Status", "Message",
    ];
    const rows = enquiries.map((enquiry) => [
      formatDate(enquiry.createdAt),
      enquiry.organizationName,
      enquiry.contactName,
      enquiry.contactEmail,
      humanize(enquiry.organizationType),
      humanize(enquiry.intendedSupport),
      humanize(enquiry.activationTiming),
      statusLabels[enquiry.status],
      enquiry.message,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tin-city-founders-partner-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${enquiries.length} visible ${enquiries.length === 1 ? "enquiry" : "enquiries"}.`);
  };

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-[#234536]" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto grid max-w-xl gap-5 py-20 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-[#d58c24]" />
        <span className="text-xs font-extrabold tracking-[0.16em] text-[#7d4a24]">RESTRICTED PARTNER TEAM AREA</span>
        <h1 className="font-serif text-4xl tracking-tight text-[#234536]">This dashboard is reserved for authorized administrators.</h1>
        <p className="text-sm leading-7 text-[#59665b]">Sign in with the Tin City Founders account that has administrator access to review partnership enquiries.</p>
        <Button asChild className="mx-auto bg-[#234536] text-white hover:bg-[#35634e]"><Link href="/">Return to website</Link></Button>
      </div>
    );
  }

  const enquiries = enquiriesQuery.data ?? [];
  const total = statusCounts.new + statusCounts.reviewing + statusCounts.closed;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <div className="flex flex-col gap-5 border-b border-[#d9cfbf] pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.16em] text-[#7d4a24]"><ShieldCheck className="h-4 w-4" /> PARTNER TEAM WORKSPACE</span>
          <h1 className="font-serif text-5xl tracking-[-0.045em] text-[#234536]">Partnership enquiries</h1>
          <p className="max-w-xl text-sm leading-6 text-[#59665b]">Review incoming organization details, track follow-up, and export the visible enquiry list for the team.</p>
        </div>
        <Button onClick={exportVisibleEnquiries} variant="outline" className="border-[#234536] bg-transparent text-[#234536] hover:bg-[#e6ede3]"><Download className="mr-2 h-4 w-4" /> Export visible CSV</Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Enquiry summary">
        {[
          ["Total enquiries", total, "bg-[#234536] text-white"],
          ["New", statusCounts.new, "bg-[#f3b13a] text-[#1f2e25]"],
          ["Reviewing", statusCounts.reviewing, "bg-[#e6ede3] text-[#234536]"],
          ["Closed", statusCounts.closed, "bg-[#fffdfa] text-[#234536]"],
        ].map(([label, count, className]) => (
          <div key={String(label)} className={`min-h-28 border border-[#d9cfbf] p-5 ${className}`}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] opacity-75">{label}</p>
            <p className="mt-2 font-serif text-4xl tracking-tight">{count}</p>
          </div>
        ))}
      </section>

      <section className="border border-[#d9cfbf] bg-[#fffdfa] p-4 shadow-[0_12px_30px_rgba(35,54,43,0.06)] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#234536]"><Filter className="h-4 w-4 text-[#d58c24]" /> Filter partnership pipeline</div>
          <span className="text-xs text-[#637065]">Showing {enquiries.length} of {total} enquiries</span>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b897d]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search organization, contact, or email" className="h-11 border-[#cfc5b5] pl-10" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as EnquiryStatus | "all")} className="h-11 border border-[#cfc5b5] bg-white px-3 text-sm text-[#234536] outline-none focus:border-[#d58c24] focus:ring-2 focus:ring-[#f3b13a]/30">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden border border-[#d9cfbf] bg-[#fffdfa]">
        <Table>
          <TableHeader className="bg-[#f4efe5]">
            <TableRow className="hover:bg-transparent">
              <TableHead>Organization</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiriesQuery.isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-48 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-[#234536]" /></TableCell></TableRow>
            ) : enquiries.length ? enquiries.map((enquiry) => (
              <TableRow key={enquiry.id} className="align-top">
                <TableCell className="min-w-64 py-5">
                  <p className="font-semibold text-[#234536]">{enquiry.organizationName}</p>
                  <p className="mt-1 text-xs text-[#5f6d61]">{humanize(enquiry.organizationType)}</p>
                  {enquiry.message ? <p className="mt-3 max-w-sm text-xs leading-5 text-[#59665b]">“{enquiry.message}”</p> : null}
                </TableCell>
                <TableCell className="min-w-48 py-5">
                  <p className="font-medium text-[#234536]">{humanize(enquiry.intendedSupport)}</p>
                  <p className="mt-1 text-xs text-[#5f6d61]">{humanize(enquiry.activationTiming)}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap py-5 text-xs text-[#5f6d61]">{formatDate(enquiry.createdAt)}</TableCell>
                <TableCell className="min-w-36 py-5">
                  <select aria-label={`Update status for ${enquiry.organizationName}`} value={enquiry.status} onChange={(event) => updateStatus.mutate({ id: enquiry.id, status: event.target.value as EnquiryStatus })} disabled={updateStatus.isPending} className="h-9 border border-[#cfc5b5] bg-white px-2 text-xs font-semibold text-[#234536] outline-none focus:border-[#d58c24]">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </TableCell>
                <TableCell className="min-w-56 py-5 text-right">
                  <p className="font-medium text-[#234536]">{enquiry.contactName}</p>
                  <a href={`mailto:${enquiry.contactEmail}`} className="mt-1 inline-flex items-center gap-1 text-xs text-[#7d4a24] hover:underline">{enquiry.contactEmail}<ExternalLink className="h-3 w-3" /></a>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="h-48 text-center text-sm text-[#5f6d61]">No partner enquiries match the current filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

export default function AdminEnquiries() {
  return <DashboardLayout><EnquiriesDashboard /></DashboardLayout>;
}
