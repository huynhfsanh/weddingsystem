import { LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { homeForRole, useAuth } from "@/features/auth/AuthContext";

export const ForbiddenPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const switchAccount = async () => { await logout(); navigate("/login", { replace: true }); };
  return <div className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center"><div><div className="font-display text-7xl font-bold text-primary-700">403</div><h1 className="mt-4 text-2xl font-bold">Bạn không có quyền truy cập</h1><p className="mt-2 text-slate-500">{user ? `Bạn đang đăng nhập bằng tài khoản ${user.fullName} (${user.role.name}).` : "Phiên đăng nhập hiện tại không phù hợp với khu vực này."}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{user && <Button asChild><Link to={homeForRole(user.role.code)}>Vào đúng khu vực</Link></Button>}<Button variant="secondary" onClick={switchAccount}>{user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}Đăng nhập tài khoản khác</Button><Button asChild variant="ghost"><Link to="/">Về trang chủ</Link></Button></div></div></div>;
};
export const NotFoundPage = () => <div className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center"><div><div className="font-display text-7xl font-bold text-primary-700">404</div><h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1><Button asChild className="mt-6"><Link to="/">Về trang chủ</Link></Button></div></div>;
