import "server-only";
import { query } from "@/lib/db";

export type EnquiryChannel = "web_form" | "phone_call" | "whatsapp" | "walk_in" | "chat_bot";
export type EnquiryStatus = "new" | "contacted" | "booked" | "completed" | "cancelled";

export type Enquiry = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  service_category: string | null;
  message: string | null;
  channel: EnquiryChannel;
  status: EnquiryStatus;
  notes: string | null;
};

export async function listEnquiries(filters: { status?: string; channel?: string } = {}): Promise<Enquiry[]> {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.channel) {
    clauses.push("channel = ?");
    params.push(filters.channel);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return query<Enquiry[]>(
    `SELECT * FROM enquiries ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
}

export type DashboardStats = {
  totalEnquiries: number;
  newThisWeek: number;
  booked: number;
  byChannel: { channel: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byService: { service: string; count: number }[];
  dailyTrend: { day: string; count: number }[];
  chatSessions: number;
  chatMessages: number;
  recentEnquiries: Enquiry[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totals,
    byChannel,
    byStatus,
    byService,
    dailyTrend,
    chatStats,
    recentEnquiries,
  ] = await Promise.all([
    query<{ total: number; newThisWeek: number; booked: number }[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS newThisWeek,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) AS booked
      FROM enquiries`
    ),
    query<{ channel: string; count: number }[]>(
      `SELECT channel, COUNT(*) AS count FROM enquiries GROUP BY channel ORDER BY count DESC`
    ),
    query<{ status: string; count: number }[]>(
      `SELECT status, COUNT(*) AS count FROM enquiries GROUP BY status ORDER BY count DESC`
    ),
    query<{ service: string; count: number }[]>(
      `SELECT COALESCE(NULLIF(service_category, ''), 'Not specified') AS service, COUNT(*) AS count
       FROM enquiries GROUP BY service ORDER BY count DESC LIMIT 8`
    ),
    query<{ day: string; count: number }[]>(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM enquiries
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY day ORDER BY day ASC`
    ),
    query<{ sessions: number; messages: number }[]>(
      `SELECT COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS messages FROM chat_messages`
    ),
    listEnquiries(),
  ]);

  const totalsRow = totals[0] ?? { total: 0, newThisWeek: 0, booked: 0 };
  const chatRow = chatStats[0] ?? { sessions: 0, messages: 0 };

  return {
    totalEnquiries: Number(totalsRow.total ?? 0),
    newThisWeek: Number(totalsRow.newThisWeek ?? 0),
    booked: Number(totalsRow.booked ?? 0),
    byChannel: byChannel.map((r) => ({ channel: r.channel, count: Number(r.count) })),
    byStatus: byStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    byService: byService.map((r) => ({ service: r.service, count: Number(r.count) })),
    dailyTrend: dailyTrend.map((r) => ({ day: r.day, count: Number(r.count) })),
    chatSessions: Number(chatRow.sessions ?? 0),
    chatMessages: Number(chatRow.messages ?? 0),
    recentEnquiries: recentEnquiries.slice(0, 8),
  };
}
