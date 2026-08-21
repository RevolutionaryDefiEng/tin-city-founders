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
import { DatabaseZap, Download, ExternalLink, FileSpreadsheet, Filter, Loader2, LockKeyhole, LogOut, RefreshCw, Search, ShieldCheck, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvValue(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const MAX_CSV_BYTES = 1_500_000;

async function serializeCsv(file: File, label: string) {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error(`${label} must be a CSV file.`);
  }
  if (file.size > MAX_CSV_BYTES) {
    throw new Error(`${label} is larger than the 1.5 MB upload limit.`);
  }
  return { name: file.name, content: await file.text() };
}

function EnquiriesDashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [directoryFile, setDirectoryFile] = useState<File | null>(null);
  const [mixerFile, setMixerFile] = useState<File | null>(null);
  const [giveAndGrowFile, setGiveAndGrowFile] = useState<File | null>(null);
  const directoryFileInput = useRef<HTMLInputElement>(null);
  const mixerFileInput = useRef<HTMLInputElement>(null);
  const giveAndGrowFileInput = useRef<HTMLInputElement>(null);

  const dashboardSession = trpc.dashboard.session.useQuery();
  const isLocalDashboardSession = Boolean(dashboardSession.data?.authenticated);
  const isAdmin = user?.role === "admin" || isLocalDashboardSession;
  const dashboardLogin = trpc.dashboard.login.useMutation({
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error("The username or password is not correct. Please try again.");
        return;
      }
      setPassword("");
      await Promise.all([
        utils.dashboard.session.invalidate(),
        utils.admin.partnerEnquiries.list.invalidate(),
        utils.admin.partnerEnquiries.summary.invalidate(),
        utils.admin.directoryImports.latest.invalidate(),
      ]);
      toast.success("Partner Team dashboard unlocked.");
    },
    onError: () => toast.error("The dashboard is temporarily unavailable. Please try again."),
  });
  const dashboardLogout = trpc.dashboard.logout.useMutation({
    onSuccess: async () => {
      await utils.dashboard.session.invalidate();
      toast.success("Local dashboard session ended.");
    },
  });

  const filters = useMemo(
    () => ({ search, ...(status === "all" ? {} : { status }) }),
    [search, status],
  );

  const enquiriesQuery = trpc.admin.partnerEnquiries.list.useQuery(filters, { enabled: isAdmin });
  const summaryQuery = trpc.admin.partnerEnquiries.summary.useQuery(undefined, { enabled: isAdmin });
  const latestDirectoryImport = trpc.admin.directoryImports.latest.useQuery(undefined, { enabled: isAdmin });
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
  const refreshDirectory = trpc.admin.directoryImports.refresh.useMutation({
    onSuccess: async (summary) => {
      setDirectoryFile(null);
      setMixerFile(null);
      setGiveAndGrowFile(null);
      if (directoryFileInput.current) directoryFileInput.current.value = "";
      if (mixerFileInput.current) mixerFileInput.current.value = "";
      if (giveAndGrowFileInput.current) giveAndGrowFileInput.current.value = "";
      await Promise.all([
        utils.admin.directoryImports.latest.invalidate(),
        utils.directory.stats.invalidate(),
      ]);
      toast.success(`Directory refreshed: ${summary.publicFounderCount} public founder profiles are now live.`);
    },
    onError: (error) => toast.error(error.message || "The directory refresh could not be completed."),
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

  const handleDirectoryRefresh = async () => {
    if (!directoryFile || !mixerFile || !giveAndGrowFile) {
      toast.error("Add all three CSV exports before refreshing the directory.");
      return;
    }
    try {
      const [directory, mixer, giveAndGrow] = await Promise.all([
        serializeCsv(directoryFile, "Built In Jos directory export"),
        serializeCsv(mixerFile, "Mixer guest export"),
        serializeCsv(giveAndGrowFile, "Give & Grow guest export"),
      ]);
      await refreshDirectory.mutateAsync({ directory, mixer, giveAndGrow });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The selected CSV files could not be prepared.");
    }
  };

  if (loading || dashboardSession.isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-[#234536]" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto grid max-w-md gap-6 py-14">
        <div className="grid gap-4 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#d58c24]" />
          <span className="text-xs font-extrabold tracking-[0.16em] text-[#7d4a24]">RESTRICTED PARTNER TEAM AREA</span>
          <h1 className="font-serif text-4xl tracking-tight text-[#234536]">Sign in to continue.</h1>
          <p className="text-sm leading-7 text-[#59665b]">Use the Partner Team credentials to review and manage submitted enquiries.</p>
        </div>
        <form className="grid gap-4 border border-[#d9cfbf] bg-[#fffdfa] p-6 shadow-[0_12px_30px_rgba(35,54,43,0.07)]" onSubmit={(event) => { event.preventDefault(); dashboardLogin.mutate({ username, password }); }}>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#45584a]">Username
            <Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-11 border-[#cfc5b5] text-sm normal-case tracking-normal" />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#45584a]">Password
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="h-11 border-[#cfc5b5] text-sm normal-case tracking-normal" />
          </label>
          <Button type="submit" disabled={dashboardLogin.isPending} className="mt-2 h-11 bg-[#234536] text-white hover:bg-[#35634e]">
            {dashboardLogin.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
            {dashboardLogin.isPending ? "Verifying access…" : "Open partner dashboard"}
          </Button>
        </form>
        <Button asChild variant="outline" className="border-[#234536] bg-transparent text-[#234536] hover:bg-[#e6ede3]"><Link href="/">Return to website</Link></Button>
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
        <div className="flex flex-wrap gap-2">
          {isLocalDashboardSession ? <Button onClick={() => dashboardLogout.mutate()} variant="outline" className="border-[#cfc5b5] bg-transparent text-[#59665b] hover:bg-[#f4efe5]"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button> : null}
          <Button onClick={exportVisibleEnquiries} variant="outline" className="border-[#234536] bg-transparent text-[#234536] hover:bg-[#e6ede3]"><Download className="mr-2 h-4 w-4" /> Export visible CSV</Button>
        </div>
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]" aria-label="Directory CSV refresh">
        <div className="border border-[#d9cfbf] bg-[#234536] p-5 text-white shadow-[0_16px_34px_rgba(35,54,43,0.12)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/20 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.16em] text-[#f4c775]"><DatabaseZap className="h-4 w-4" /> BUILT IN JOS DATA REFRESH</span>
              <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em]">Refresh the live directory.</h2>
              <p className="mt-2 text-sm leading-6 text-[#d8e0d7]">Upload the current Built In Jos response export and both Tin City Founders guest exports. The refresh validates each file, consolidates overlaps, updates the live count, and records an audit summary.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 border border-[#f4c775]/50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#f4c775]"><ShieldCheck className="h-3.5 w-3.5" /> Partner Team only</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="group grid min-h-35 cursor-pointer content-between border border-white/25 bg-white/5 p-4 transition-colors hover:border-[#f4c775]/80 hover:bg-white/10">
              <input ref={directoryFileInput} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setDirectoryFile(event.target.files?.[0] ?? null)} />
              <span className="grid gap-2"><FileSpreadsheet className="h-5 w-5 text-[#f4c775]" /><span className="text-xs font-bold leading-5">Built In Jos directory</span></span>
              <span className="truncate text-[11px] text-[#d8e0d7]">{directoryFile?.name ?? "Choose CSV"}</span>
            </label>
            <label className="group grid min-h-35 cursor-pointer content-between border border-white/25 bg-white/5 p-4 transition-colors hover:border-[#f4c775]/80 hover:bg-white/10">
              <input ref={mixerFileInput} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setMixerFile(event.target.files?.[0] ?? null)} />
              <span className="grid gap-2"><FileSpreadsheet className="h-5 w-5 text-[#f4c775]" /><span className="text-xs font-bold leading-5">Mixer guests</span></span>
              <span className="truncate text-[11px] text-[#d8e0d7]">{mixerFile?.name ?? "Choose CSV"}</span>
            </label>
            <label className="group grid min-h-35 cursor-pointer content-between border border-white/25 bg-white/5 p-4 transition-colors hover:border-[#f4c775]/80 hover:bg-white/10">
              <input ref={giveAndGrowFileInput} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setGiveAndGrowFile(event.target.files?.[0] ?? null)} />
              <span className="grid gap-2"><FileSpreadsheet className="h-5 w-5 text-[#f4c775]" /><span className="text-xs font-bold leading-5">Give &amp; Grow guests</span></span>
              <span className="truncate text-[11px] text-[#d8e0d7]">{giveAndGrowFile?.name ?? "Choose CSV"}</span>
            </label>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-white/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-[#c7d5ca]">Files remain private to the Partner Team. Only consent-safe aggregate directory statistics are shown publicly. Maximum file size: 1.5 MB each.</p>
            <Button onClick={handleDirectoryRefresh} disabled={refreshDirectory.isPending} className="h-11 bg-[#f3b13a] text-[#1f2e25] hover:bg-[#f7c765]">
              {refreshDirectory.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {refreshDirectory.isPending ? "Refreshing directory…" : "Validate and refresh"}
            </Button>
          </div>
        </div>

        <div className="border border-[#d9cfbf] bg-[#fffdfa] p-5 shadow-[0_12px_30px_rgba(35,54,43,0.06)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.14em] text-[#7d4a24]"><Upload className="h-4 w-4" /> LATEST IMPORT SUMMARY</span>
              <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#234536]">Current data snapshot.</h2>
            </div>
            {latestDirectoryImport.data ? <span className="text-right text-[10px] leading-4 text-[#637065]">{formatDateTime(latestDirectoryImport.data.createdAt)}<br />by {latestDirectoryImport.data.importedBy}</span> : null}
          </div>
          {latestDirectoryImport.isLoading ? (
            <div className="grid min-h-48 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-[#234536]" /></div>
          ) : latestDirectoryImport.data ? (
            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-3 gap-px bg-[#d9cfbf]">
                {[
                  ["Source rows", latestDirectoryImport.data.sourceRowCount],
                  ["Unique people", latestDirectoryImport.data.uniqueCommunityRecords],
                  ["Duplicates merged", latestDirectoryImport.data.duplicateRecordsCollapsed],
                ].map(([label, count]) => <div key={String(label)} className="bg-[#f4efe5] p-3"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#637065]">{label}</p><p className="mt-1 font-serif text-2xl text-[#234536]">{count}</p></div>)}
              </div>
              <dl className="grid gap-2 border-t border-[#e0d7c8] pt-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-[#637065]">Built In Jos form submissions</dt><dd className="font-bold text-[#234536]">{latestDirectoryImport.data.directoryRows}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#637065]">Public profiles after consent &amp; deduplication</dt><dd className="font-bold text-[#234536]">{latestDirectoryImport.data.publicFounderCount}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#637065]">Responses kept private</dt><dd className="font-bold text-[#234536]">{latestDirectoryImport.data.privateDirectoryRows}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#637065]">Venture / sector / location coverage</dt><dd className="font-bold text-[#234536]">{latestDirectoryImport.data.ventureProfiles} / {latestDirectoryImport.data.sectorsRepresented} / {latestDirectoryImport.data.locationsRepresented}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#637065]">Form / Mixer / Give &amp; Grow rows</dt><dd className="font-bold text-[#234536]">{latestDirectoryImport.data.directoryRows} / {latestDirectoryImport.data.mixerRows} / {latestDirectoryImport.data.giveAndGrowRows}</dd></div>
              </dl>
            </div>
          ) : (
            <div className="mt-6 border border-dashed border-[#cfc5b5] bg-[#f4efe5] p-5 text-sm leading-6 text-[#637065]">No dashboard refresh has been recorded yet. Upload the three current exports to create the first audit summary.</div>
          )}
        </div>
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
  return <DashboardLayout allowLocalAccess><EnquiriesDashboard /></DashboardLayout>;
}
