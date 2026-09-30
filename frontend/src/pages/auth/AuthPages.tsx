import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { errorMessage } from "@/lib/api";
import { homeForRole, useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";

const AuthFrame = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_520px]"><div className="relative hidden lg:block"><img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=90" className="h-full w-full object-cover" alt="Cặp đôi trong ngày cưới" /><div className="absolute inset-0 bg-primary-900/55" /><Link to="/" className="absolute left-10 top-8"><BrandLogo light /></Link><div className="absolute bottom-12 left-10 max-w-xl text-white"><p className="font-display text-4xl font-bold">Ngày vui được chăm chút bằng cả trái tim và một quy trình rõ ràng.</p></div></div><main className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-sm"><Link to="/" className="mb-10 block text-primary-800"><BrandLogo compact /></Link><h1 className="font-display text-3xl font-bold text-ink">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p><div className="mt-8">{children}</div></div></main></div>;

export const LoginPage = () => {
  const { user, isInitializing, login } = useAuth(); const navigate = useNavigate();
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (isInitializing) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  if (user) return <Navigate to={homeForRole(user.role.code)} replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { const current = await login(String(data.get("email")), String(data.get("password"))); navigate(homeForRole(current.role.code)); } catch (reason) { setError(errorMessage(reason)); } finally { setLoading(false); } };
  return <AuthFrame title="Chào mừng trở lại" subtitle="Đăng nhập để theo dõi ngày vui của bạn."><form className="space-y-4" onSubmit={submit}><label><span className="field-label">Email</span><input required name="email" type="email" className="form-control" placeholder="ban@example.com" /></label><label><span className="field-label">Mật khẩu</span><input required name="password" type="password" minLength={8} className="form-control" /></label>{error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Đăng nhập</Button><p className="text-center text-sm text-slate-500">Chưa có tài khoản? <Link to="/register" className="font-semibold text-primary-700">Đăng ký</Link></p></form></AuthFrame>;
};

export const RegisterPage = () => {
  const { user, isInitializing, register } = useAuth(); const navigate = useNavigate();
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (isInitializing) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  if (user) return <Navigate to={homeForRole(user.role.code)} replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { const current = await register({ fullName: String(data.get("fullName")), phone: String(data.get("phone")), email: String(data.get("email")), password: String(data.get("password")) }); navigate(homeForRole(current.role.code)); } catch (reason) { setError(errorMessage(reason)); } finally { setLoading(false); } };
  return <AuthFrame title="Tạo tài khoản" subtitle="Bắt đầu chọn gói và quản lý hợp đồng trực tuyến."><form className="space-y-4" onSubmit={submit}><label><span className="field-label">Họ và tên</span><input required name="fullName" className="form-control" /></label><label><span className="field-label">Số điện thoại</span><input required name="phone" className="form-control" /></label><label><span className="field-label">Email</span><input required name="email" type="email" className="form-control" /></label><label><span className="field-label">Mật khẩu</span><input required name="password" type="password" minLength={8} className="form-control" /><span className="mt-1 block text-xs text-slate-400">Tối thiểu 8 ký tự.</span></label>{error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Đăng ký</Button><p className="text-center text-sm text-slate-500">Đã có tài khoản? <Link to="/login" className="font-semibold text-primary-700">Đăng nhập</Link></p></form></AuthFrame>;
};
