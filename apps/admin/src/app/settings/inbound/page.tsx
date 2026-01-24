"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or similar toast lib is used

// Types
interface InboundRules {
  followers_only: boolean;
  min_tier: number;
  daily_cap: number;
}

export default function InboundSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // NOTE: In a real app this would manage specific user settings or global defaults.
  // For MVP Admin, let's assume we are editing a "Global Default Template" or a test user.
  // We'll simulate fetching for a specific test user ID for now or just mock the flow.
  const [rules, setRules] = useState<InboundRules>({
    followers_only: false,
    min_tier: 0,
    daily_cap: 10
  });

  // Supabase Init
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Fetch logic placeholder
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbound Settings</h1>
          <p className="text-muted-foreground mt-2">Manage default anti-spam rules and limits for Offers.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Restrictions</CardTitle>
            <CardDescription>Control who can send offers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Followers Only</Label>
                <p className="text-sm text-muted-foreground">Only allow offers from users following the creator.</p>
              </div>
              <Switch 
                checked={rules.followers_only}
                onCheckedChange={(checked) => setRules({...rules, followers_only: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Tier (Credits)</Label>
              <Input 
                type="number" 
                value={rules.min_tier}
                onChange={(e) => setRules({...rules, min_tier: parseInt(e.target.value) || 0})}
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">Offers below this amount will be auto-rejected.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Velocity Limits</CardTitle>
            <CardDescription>Prevent spam bursts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label>Daily Offer Cap</Label>
              <Input 
                type="number" 
                value={rules.daily_cap}
                onChange={(e) => setRules({...rules, daily_cap: parseInt(e.target.value) || 0})}
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">Maximum pending offers per day per user.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
