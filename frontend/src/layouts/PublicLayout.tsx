import { Link, NavLink, Outlet } from "react-router-dom";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, homeForRole } from "@/features/auth/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

const links = [["/", "Trang chủ"], ["/packages", "Gói cưới"], ["/about", "Về chúng tôi"], ["/faq", "Câu hỏi thường gặp"], ["/contact", "Liên hệ"]];

export const PublicLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  return <div className="min-h-screen bg-[#f8fffe]">
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/" aria-label="Green Wedding - Trang chủ"><BrandLogo compact /></Link>
        <nav className="hidden items-center gap-6 lg:flex">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-medium transition ${isActive ? "text-primary-700" : "text-slate-600 hover:text-primary-700"}`}>{label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 lg:flex">{user ? <><Button asChild><Link to={homeForRole(user.role.code)}>{user.fullName}</Link></Button><Button size="icon" variant="ghost" title="Đăng xuất" aria-label="Đăng xuất" onClick={() => void logout()}><LogOut className="h-4 w-4" /></Button></> : <Button asChild variant="secondary"><Link to="/login"><LogIn className="h-4 w-4" />Đăng nhập</Link></Button>}</div>
        <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Mở menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-slate-700">{label}</NavLink>)}<Link className="block py-3 text-sm font-semibold text-primary-700" to={user ? homeForRole(user.role.code) : "/login"} onClick={() => setOpen(false)}>{user ? `${user.fullName} · Vào hệ thống` : "Đăng nhập"}</Link>{user && <button className="flex w-full items-center gap-2 py-3 text-sm font-semibold text-red-600" onClick={() => { setOpen(false); void logout(); }}><LogOut className="h-4 w-4" />Đăng xuất</button>}</nav>}
    </header>
    <main><Outlet /></main>
    <footer className="border-t border-primary-100 bg-primary-900 py-10 text-primary-50"><div className="page-container grid gap-8 md:grid-cols-3"><div><BrandLogo light /><p className="mt-3 max-w-sm text-sm leading-6 text-primary-100">Dịch vụ tiệc cưới trọn gói tại gia, được theo dõi minh bạch từ tư vấn đến nghiệm thu.</p></div><div><div className="font-semibold">Liên hệ</div><p className="mt-3 text-sm text-primary-100">0799392717<br />hello@example.com<br />Điện Bàn Bắc, Đà Nẵng</p></div><div><div className="font-semibold">Thời gian phục vụ</div><p className="mt-3 text-sm text-primary-100">08:00 - 20:00, tất cả các ngày</p></div></div></footer>
  </div>;
};
