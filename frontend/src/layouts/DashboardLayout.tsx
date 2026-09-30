import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, BriefcaseBusiness, CalendarDays, CircleDollarSign, ClipboardList, FileImage, FileText, Gauge, LayoutDashboard, LifeBuoy, LogOut, Menu, MessageCircle, Package, Settings, ShieldCheck, TriangleAlert, UserRound, Users, UtensilsCrossed, X } from "lucide-react";
import { useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import type { Role } from "@/types";
import { BrandLogo } from "@/components/brand/BrandLogo";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };
const nav: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { to: "/customer/dashboard", label: "Tổng quan", icon: LayoutDashboard }, { to: "/customer/packages", label: "Gói cưới", icon: Package },
    { to: "/customer/contracts", label: "Hợp đồng", icon: FileText }, { to: "/customer/payments", label: "Thanh toán", icon: CircleDollarSign },
    { to: "/customer/chatbot", label: "Tư vấn AI", icon: MessageCircle }, { to: "/customer/notifications", label: "Thông báo", icon: Bell }, { to: "/customer/profile", label: "Hồ sơ", icon: UserRound },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard }, { to: "/admin/contracts", label: "Hợp đồng", icon: FileText },
    { to: "/admin/assignments", label: "Điều phối", icon: CalendarDays }, { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/packages", label: "Gói cưới", icon: Package }, { to: "/admin/menu-combos", label: "Thực đơn", icon: UtensilsCrossed }, { to: "/admin/catalog-items", label: "Danh mục", icon: ClipboardList },
    { to: "/admin/payments", label: "Thanh toán", icon: CircleDollarSign }, { to: "/admin/capacity", label: "Capacity", icon: Gauge },
    { to: "/admin/photos", label: "Ảnh hiện trường", icon: FileImage }, { to: "/admin/damages", label: "Hư hại", icon: TriangleAlert },
    { to: "/admin/staff-rates", label: "Đơn giá", icon: BriefcaseBusiness }, { to: "/admin/payroll", label: "Bảng công", icon: CircleDollarSign },
    { to: "/admin/chatbot/faqs", label: "FAQ chatbot", icon: MessageCircle }, { to: "/admin/support-requests", label: "Hỗ trợ", icon: LifeBuoy }, { to: "/admin/settings", label: "Cấu hình", icon: Settings }, { to: "/admin/audit-logs", label: "Nhật ký", icon: ShieldCheck },
  ],
  STAFF: [
    { to: "/staff/dashboard", label: "Hôm nay", icon: LayoutDashboard }, { to: "/staff/assignments", label: "Ca làm việc", icon: CalendarDays },
    { to: "/staff/payroll", label: "Bảng công", icon: CircleDollarSign }, { to: "/staff/notifications", label: "Thông báo", icon: Bell }, { to: "/staff/profile", label: "Hồ sơ", icon: UserRound },
  ],
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;
  const items = nav[user.role.code];
  const current = items.find((item) => location.pathname.startsWith(item.to));
  const sidebar = <><div className="flex h-16 items-center gap-2 border-b border-white/10 px-5"><BrandLogo compact light /><Button size="icon" variant="ghost" className="ml-auto text-white lg:hidden" onClick={() => setOpen(false)}><X /></Button></div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${isActive ? "bg-white text-primary-900" : "text-primary-50 hover:bg-white/10"}`}><Icon className="h-5 w-5" />{label}</NavLink>)}</nav><div className="border-t border-white/10 p-3"><button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-primary-50 hover:bg-white/10" onClick={async () => { await logout(); navigate("/"); }}><LogOut className="h-5 w-5" />Đăng xuất</button></div></>;
  return <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="hidden h-screen flex-col bg-primary-900 lg:sticky lg:top-0 lg:flex">{sidebar}</aside>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Đóng menu" className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} /><aside className="relative flex h-full w-[280px] flex-col bg-primary-900">{sidebar}</aside></div>}
    <div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6"><Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setOpen(true)}><Menu /></Button><div><h1 className="text-base font-bold text-slate-900">{current?.label || "Hệ thống quản lý"}</h1><p className="hidden text-xs text-slate-500 sm:block">{user.role.name}</p></div><div className="ml-auto text-right"><div className="text-sm font-semibold text-slate-800">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div></div></header><main className="p-4 sm:p-6 lg:p-8"><Outlet /></main></div>
  </div>;
};
