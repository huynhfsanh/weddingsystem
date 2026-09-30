import { useState } from "react";
import { Bell, ChevronDown, CreditCard, FileText, LayoutDashboard, LogOut, Menu, MessageCircle, Package, UserRound, X, type LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface CustomerNavItem { to: string; label: string; icon: LucideIcon }
const navigation: CustomerNavItem[] = [
  { to: "/customer/dashboard", label: "Ngày vui của tôi", icon: LayoutDashboard },
  { to: "/customer/packages", label: "Gói cưới", icon: Package },
  { to: "/customer/contracts", label: "Hợp đồng", icon: FileText },
  { to: "/customer/payments", label: "Thanh toán", icon: CreditCard },
  { to: "/customer/chatbot", label: "Tư vấn", icon: MessageCircle },
];

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  if (!user) return null;
  const packagesPage = location.pathname.startsWith("/customer/packages");
  const signOut = async () => { await logout(); navigate("/", { replace: true }); };

  return <div className="min-h-screen bg-[#f8fffe]">
    <div className="bg-primary-900 px-4 py-2 text-center text-xs text-primary-50">Đồng hành cùng bạn từ ý tưởng đầu tiên đến phút bàn giao cuối cùng</div>
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/95 backdrop-blur">
      <div className="page-container flex h-[72px] items-center gap-6">
        <Link to="/customer/dashboard" aria-label="Green Wedding - Trang khách hàng" className="shrink-0"><BrandLogo /></Link>
        <nav className="hidden h-full flex-1 items-stretch justify-center lg:flex">{navigation.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center border-b-2 px-3 text-sm font-medium transition ${isActive ? "border-primary-600 text-primary-800" : "border-transparent text-slate-600 hover:text-primary-700"}`}>{label}</NavLink>)}</nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex"><Button asChild size="icon" variant="ghost"><Link to="/customer/notifications" title="Thông báo" aria-label="Thông báo"><Bell className="h-5 w-5" /></Link></Button><div className="relative"><button className="flex h-11 items-center gap-3 rounded-md px-2 text-left hover:bg-primary-50" onClick={() => setAccountOpen(!accountOpen)}><span className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-primary-800"><UserRound className="h-5 w-5" /></span><span className="max-w-36"><span className="block truncate text-sm font-semibold text-ink">{user.fullName}</span><span className="block truncate text-xs text-slate-500">Khách hàng</span></span><ChevronDown className="h-4 w-4 text-slate-400" /></button>{accountOpen && <div className="absolute right-0 top-12 z-50 w-52 rounded-md border border-slate-200 bg-white p-2 shadow-lg"><Link to="/customer/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded px-3 py-2 text-sm text-slate-700 hover:bg-primary-50"><UserRound className="h-4 w-4" />Hồ sơ cá nhân</Link><button onClick={signOut} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Đăng xuất</button></div>}</div></div>
        <Button size="icon" variant="ghost" className="ml-auto lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Mở menu">{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
      {mobileOpen && <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${isActive ? "bg-primary-50 text-primary-800" : "text-slate-700"}`}><Icon className="h-5 w-5" />{label}</NavLink>)}<div className="my-2 border-t border-slate-100" /><Link to="/customer/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-slate-700"><Bell className="h-5 w-5" />Thông báo</Link><Link to="/customer/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-slate-700"><UserRound className="h-5 w-5" />{user.fullName}</Link><button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-red-600"><LogOut className="h-5 w-5" />Đăng xuất</button></nav>}
    </header>
    <main className="min-h-[calc(100vh-280px)]">{packagesPage ? <Outlet /> : <div className="page-container py-8 sm:py-10"><Outlet /></div>}</main>
    <footer className="mt-12 border-t border-primary-100 bg-white"><div className="page-container flex flex-col justify-between gap-5 py-8 sm:flex-row sm:items-center"><div><BrandLogo compact /><p className="mt-1 text-sm text-slate-500">Ngày vui trọn vẹn, tiến độ minh bạch.</p></div><div className="flex flex-wrap gap-5 text-sm text-slate-600"><Link to="/customer/packages" className="hover:text-primary-700">Gói cưới</Link><Link to="/customer/contracts" className="hover:text-primary-700">Hợp đồng</Link><Link to="/contact" className="hover:text-primary-700">Liên hệ</Link></div></div></footer>
  </div>;
};
