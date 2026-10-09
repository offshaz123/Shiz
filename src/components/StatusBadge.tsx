import { type OrderStatus, statusLabels } from "@/lib/orders";

const colours: Record<OrderStatus, string> = {
  pending: "bg-[#fff5ec] text-[#8a4a12]",
  unpaid: "bg-[#fff5ec] text-[#8a4a12]",
  paid: "bg-[#e7f6ec] text-[#1f7a3d]",
  in_production: "bg-[#eaf1ff] text-[#1d4ed8]",
  dispatched: "bg-[#f1e9ff] text-[#6b21a8]",
  expired: "bg-[#f3f3f3] text-[#555]",
  cancelled: "bg-[#fdecec] text-[#b42318]",
};

export function StatusBadge({ status, customer = false }: { status: OrderStatus; customer?: boolean }) {
  const label = customer && status === "unpaid" ? "Awaiting payment" : statusLabels[status];
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${colours[status]}`}>{label}</span>;
}
