import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  History, MoreHorizontal, Download, RotateCcw, Calendar, 
  FileText, CheckCircle, XCircle, Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CSVUpload {
  id: string;
  filename: string;
  status: string;
  rows_processed: number;
  rows_failed: number;
  created_at: string;
}

interface UploadHistorySectionProps {
  onRollback?: (uploadId: string) => void;
  onRedownload?: (uploadId: string) => void;
}

const UploadHistorySection = ({ onRollback, onRedownload }: UploadHistorySectionProps) => {
  const [uploads, setUploads] = useState<CSVUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching upload history:', error);
      toast({
        title: "Error",
        description: "Failed to load upload history.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      case 'processing':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRollback = async (uploadId: string, filename: string) => {
    try {
      // This would implement rollback logic
      onRollback?.(uploadId);
      toast({
        title: "Rollback initiated",
        description: `Rolling back to data from ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Rollback failed",
        description: "Unable to rollback to previous data version.",
        variant: "destructive"
      });
    }
  };

  const handleRedownload = async (uploadId: string, filename: string) => {
    try {
      // This would implement re-download logic
      onRedownload?.(uploadId);
      toast({
        title: "Download started",
        description: `Downloading processed data from ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the processed data.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Upload History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Upload History
          <Badge variant="outline" className="ml-auto">
            {uploads.length} Uploads
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upload history yet. Upload your first CSV file to get started.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Filename</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Processed</TableHead>
                  <TableHead className="font-semibold">Failed</TableHead>
                  <TableHead className="font-semibold">Upload Time</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload, index) => (
                  <TableRow key={upload.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]" title={upload.filename}>
                          {upload.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(upload.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {upload.rows_processed || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={upload.rows_failed && upload.rows_failed > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                        {upload.rows_failed || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span title={new Date(upload.created_at).toLocaleString()}>
                          {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRedownload(upload.id, upload.filename)}
                            disabled={upload.status !== 'completed'}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Re-download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRollback(upload.id, upload.filename)}
                            disabled={upload.status !== 'completed'}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Rollback to this version
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {uploads.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>• <strong>Rollback:</strong> Restore your database to the state from a previous upload</p>
            <p>• <strong>Re-download:</strong> Download the processed CSV with churn predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadHistorySection;