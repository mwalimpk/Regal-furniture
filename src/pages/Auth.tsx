import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import regalLogo from "@/assets/regal-logo-brand.svg";
import regalLogoLight from "@/assets/regal-logo.png";

const ADMIN_EMAILS = ["paul.kiragu@gmail.com", "geshpk@gmail.com"];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const showLogin = () => {
    setIsLogin(true);
    setIsResettingPassword(false);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const showSignup = () => {
    setIsLogin(false);
    setIsResettingPassword(false);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const showPasswordReset = () => {
    setIsLogin(true);
    setIsResettingPassword(true);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const authEyebrow = isResettingPassword ? "Reset Access" : isLogin ? "Welcome Back" : "Create Access";
  const authTitle = isResettingPassword ? "Choose a new password." : isLogin ? "Sign in to continue." : "Create your account.";
  const authDescription = isResettingPassword
    ? "Enter your account email and set a new password directly."
    : "Use buyer access for client activity or admin access for catalog and operations management.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResettingPassword) {
        if (password.length < 6) {
          toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
          return;
        }

        if (password !== confirmPassword) {
          toast({ title: "Passwords do not match", description: "Confirm the new password before resetting.", variant: "destructive" });
          return;
        }

        const { error } = await supabase.auth.resetPasswordDirect({ email, password });

        if (error) {
          toast({ title: "Reset failed", description: error.message, variant: "destructive" });
          return;
        }

        toast({ title: "Password updated", description: "Use your new password to sign in." });
        showLogin();
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
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
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-[linear-gradient(180deg,rgb(var(--secondary)/0.58)_0%,rgb(var(--background)/1)_100%)] px-10 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden border border-grid/30 surface-elevated md:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-inverse relative hidden overflow-hidden p-10 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(var(--interactive-rgb)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgb(var(--heritage-rgb)/0.36),transparent_45%)]" />
          <div className="relative z-10">
            <img src={regalLogoLight} alt="Regal Office & Home" className="h-14 w-auto object-contain" />
          </div>
          <div className="relative z-10 max-w-lg space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[rgb(var(--inverse-foreground-rgb)/0.6)]">Client Access</p>
            <h1 className="font-serif text-5xl leading-[1.05] text-[rgb(var(--inverse-foreground-rgb)/1)]">
              Manage your showroom, orders, and catalog from one place.
            </h1>
            <p className="max-w-md text-sm leading-7 text-[rgb(var(--inverse-foreground-rgb)/0.72)]">
              We’ve removed the external dependency and kept access inside the project. Admins can manage products, leads, RFQs, and orders directly from the local store workspace.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="border border-[rgb(var(--inverse-foreground-rgb)/0.1)] bg-[rgb(var(--inverse-foreground-rgb)/0.06)] p-4">
                <div className="text-2xl font-serif text-interactive">1</div>
                <p className="mt-1 text-xs text-[rgb(var(--inverse-foreground-rgb)/0.65)]">Storefront</p>
              </div>
              <div className="border border-[rgb(var(--inverse-foreground-rgb)/0.1)] bg-[rgb(var(--inverse-foreground-rgb)/0.06)] p-4">
                <div className="text-2xl font-serif text-interactive">1</div>
                <p className="mt-1 text-xs text-[rgb(var(--inverse-foreground-rgb)/0.65)]">Admin space</p>
              </div>
              <div className="border border-[rgb(var(--inverse-foreground-rgb)/0.1)] bg-[rgb(var(--inverse-foreground-rgb)/0.06)] p-4">
                <div className="text-2xl font-serif text-interactive">0</div>
                <p className="mt-1 text-xs text-[rgb(var(--inverse-foreground-rgb)/0.65)]">Supabase calls</p>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-xs text-[rgb(var(--inverse-foreground-rgb)/0.55)]">
            Admin access is available for `geshpk@gmail.com`.
          </p>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <Link to="/" className="md:hidden">
                <img src={regalLogo} alt="Regal Office & Home" className="mx-auto mb-5 h-14 md:mx-0" />
              </Link>
              <p className="text-xs uppercase tracking-[0.28em] text-label">
                {authEyebrow}
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground">
                {authTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {authDescription}
              </p>
            </div>

            <div className="border border-grid/25 surface-soft p-7 shadow-[0_20px_60px_rgba(23,26,24,0.05)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isResettingPassword ? null : isLogin ? (
                  <RoleSelector value={loginRole} onChange={setLoginRole} />
                ) : (
                  <>
                    <RoleSelector value={role} onChange={setRole} />
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1.5 h-12 border-grid/40 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+263..." value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-12 border-grid/40 bg-background" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 h-12 border-grid/40 bg-background" />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="password">{isResettingPassword ? "New Password" : "Password"}</Label>
                    {isLogin && !isResettingPassword ? (
                      <button type="button" onClick={showPasswordReset} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-label hover:text-primary">
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 border-grid/40 bg-background pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-label"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {isResettingPassword ? (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1.5 h-12 border-grid/40 bg-background"
                    />
                  </div>
                ) : null}

                <Button type="submit" className="h-12 w-full rounded-none bg-heritage text-primary-foreground hover:bg-heritage/90" disabled={loading}>
                  {loading ? "Loading..." : isResettingPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="mt-5 border border-grid/20 bg-background px-4 py-3 text-xs leading-6 text-muted-foreground">
                <p>
                  {isResettingPassword
                    ? "Password changes apply immediately to the local project account."
                    : "Admin access uses local project data. That keeps the website and its management tools in one place while the backend migration is being finalized."}
                </p>
              </div>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isResettingPassword ? "Remembered it?" : isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={isResettingPassword || !isLogin ? showLogin : showSignup} className="font-semibold text-primary hover:underline">
                  {isResettingPassword || !isLogin ? "Sign In" : "Sign Up"}
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
