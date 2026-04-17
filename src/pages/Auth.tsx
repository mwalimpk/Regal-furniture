import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import regalLogo from "@/assets/regal-logo.png";

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

  const redirectUserByRole = async (userId: string) => {
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
        navigate(adminRow ? "/admin" : "/dashboard", { replace: true });
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
            await redirectUserByRole(authData.user.id);
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
        await redirectUserByRole(data.user.id);
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      toast({
        title: "Error",
        description: result.error instanceof Error ? result.error.message : String(result.error),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={regalLogo} alt="Regal Office & Home" className="h-16 mx-auto mb-4" />
          </Link>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="bg-card p-8 border border-border space-y-5">
          <Button variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} type="button" disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector - shown on both login and signup */}
            {isLogin ? (
              <RoleSelector value={loginRole} onChange={setLoginRole} />
            ) : (
              <>
                <RoleSelector value={role} onChange={setRole} />
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+263..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
