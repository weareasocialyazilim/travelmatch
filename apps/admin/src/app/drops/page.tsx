'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'; // Or use your admin client
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Types
interface Drop {
  id: string;
  city: string;
  status: string;
  starts_at: string;
  ends_at: string;
  creator: {
    email: string;
    full_name: string;
  };
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase Client (Use env vars or context)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const fetchDrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('creator_drops')
      .select('*, creator:users!creator_id(email, full_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrops(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrops();
    // fetchDrops is stable - no external dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Call API or Supabase update
    await supabase
      .from('creator_drops')
      .update({ status: newStatus })
      .eq('id', id);
    fetchDrops(); // Refresh
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Drops Console</h1>
        <Button onClick={fetchDrops} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Drops</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drops.map((drop) => (
                  <TableRow key={drop.id}>
                    <TableCell className="font-medium">{drop.city}</TableCell>
                    <TableCell>
                      {drop.creator?.full_name} <br />
                      <span className="text-xs text-muted-foreground">
                        {drop.creator?.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          drop.status === 'live' ? 'default' : 'secondary'
                        }
                      >
                        {drop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(drop.starts_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {drop.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(drop.id, 'live')}
                        >
                          Publish
                        </Button>
                      )}
                      {drop.status === 'live' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(drop.id, 'ended')}
                        >
                          End
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
