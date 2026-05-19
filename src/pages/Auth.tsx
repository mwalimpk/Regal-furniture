import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import regalLogo from "@/assets/regal-logo-brand.svg";

const ADMIN_EMAILS = ["paul.kiragu@gmail.com", "geshpk@gmail.com"];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loginRole, setLoginRole] = useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const redirectUserByRole = async (userId: string, email?: string | null) => {
    if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
      navigate("/admin", { replace: true });
      return;
    }

    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    navigate(adminRow ? "/admin" : "/dashboard", { replace: true });
  };

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const handleAuthenticatedUser = async () => {
      const { data: adminRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) {
        navigate(adminRow || ADMIN_EMAILS.includes(user.email?.toLowerCase() || "") ? "/admin" : "/dashboard", { replace: true });
      }
    };
    void handleAuthenticatedUser();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          // Check role matches selected login role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", authData.user.id)
            .eq("role", loginRole === "admin" ? "admin" : "user")
            .maybeSingle();

          if (loginRole === "admin" && !roleData) {
            toast({ title: "Access denied", description: "You do not have admin privileges.", variant: "destructive" });
            await supabase.auth.signOut();
          } else {
            await redirectUserByRole(authData.user.id, authData.user.email);
          }
        }
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data.user) {
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role,
        });
        toast({ title: "Welcome!", description: "Account created successfully." });
        await redirectUserByRole(data.user.id, data.user.email);
      }
    }

    setLoading(false);
  };

  const RoleSelector = ({ value, onChange }: { value: "user" | "admin"; onChange: (v: "user" | "admin") => void }) => (
    <div>
      <Label>{isLogin ? "Sign in as" : "I am a"}</Label>
      <div className="grid grid-cols-2 gap-2 mt-1.5">
        <button
          type="button"
          onClick={() => onChange("user")}
          className={`py-3 border text-sm font-medium transition-colors ${
            value === "user"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          Client / Buyer
        </button>
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={`py-3 border text-sm font-medium transition-colors ${
            value === "admin"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          Admin / Staff
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#efe8dc_0%,#fbf8f3_32%,#ffffff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#ded6ca] bg-white shadow-[0_30px_90px_rgba(28,33,30,0.08)] md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[#1d241f] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,175,131,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(123,31,52,0.45),transparent_45%)]" />
          <div className="relative z-10">
            <img src={regalLogo} alt="Regal Office & Home" className="h-14 w-auto object-contain" />
          </div>
          <div className="relative z-10 max-w-lg space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Client Access</p>
            <h1 className="font-serif text-5xl leading-[1.05] text-[#f7f1e8]">
              Manage your showroom, orders, and catalog from one place.
            </h1>
            <p className="max-w-md text-sm leading-7 text-white/72">
              We’ve removed the external dependency and kept access inside the project. Admins can manage products, leads, RFQs, and orders directly from the local store workspace.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="text-2xl font-serif text-[#f3dcc0]">1</div>
                <p className="mt-1 text-xs text-white/65">Storefront</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="text-2xl font-serif text-[#f3dcc0]">1</div>
                <p className="mt-1 text-xs text-white/65">Admin space</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="text-2xl font-serif text-[#f3dcc0]">0</div>
                <p className="mt-1 text-xs text-white/65">Supabase calls</p>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-xs text-white/55">
            Admin access is available for `geshpk@gmail.com`.
          </p>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <Link to="/" className="md:hidden">
                <img src={regalLogo} alt="Regal Office & Home" className="mx-auto mb-5 h-14 md:mx-0" />
              </Link>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8c8274]">
                {isLogin ? "Welcome Back" : "Create Access"}
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#171a18]">
                {isLogin ? "Sign in to continue." : "Create your account."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6f6659]">
                Use buyer access for client activity or admin access for catalog and operations management.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e7dfd3] bg-[#fdfbf8] p-7 shadow-[0_20px_60px_rgba(23,26,24,0.05)]">
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector - shown on both login and signup */}
                {isLogin ? (
                  <RoleSelector value={loginRole} onChange={setLoginRole} />
                ) : (
                  <>
                    <RoleSelector value={role} onChange={setRole} />
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1.5 rounded-2xl border-[#d9d1c6] bg-white h-12" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+263..." value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 rounded-2xl border-[#d9d1c6] bg-white h-12" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 rounded-2xl border-[#d9d1c6] bg-white h-12" />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-2xl border-[#d9d1c6] bg-white pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a705f]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="h-12 w-full rounded-full bg-[#7b1f34] text-white hover:bg-[#63182a]" disabled={loading}>
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="mt-5 rounded-2xl border border-[#ece4d8] bg-white px-4 py-3 text-xs leading-6 text-[#6f6659]">
                <p>Admin access uses local project data. That keeps the website and its management tools in one place while the backend migration is being finalized.</p>
              </div>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary hover:underline">
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
