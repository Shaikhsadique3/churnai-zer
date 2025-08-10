import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { Upload } from 'lucide-react';

export const CSVUploadPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {
    'text/csv': ['.csv'],
    'text/plain': ['.txt'],
  } })

  const uploadCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const fileExt = file.name.split('.').pop();
      const filePath = `csv_uploads/${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('churn_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Call function to process the CSV file
      const { error: processError } = await supabase.functions.invoke('process-csv', {
        body: {
          filePath: filePath,
          userId: session.user.id
        }
      });

      if (processError) {
        console.error("Error processing CSV:", processError);
        // Optionally delete the uploaded file if processing fails
        await supabase.storage.from('churn_files').remove([filePath]);
        throw processError;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "CSV file uploaded and processing started.",
      });
      queryClient.invalidateQueries({ queryKey: ['csv-history'] });
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const CSVUploader = () => (
    <Card>
      <CardContent>
        <div {...getRootProps()} className="relative border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center hover:border-primary transition-colors">
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p className="text-center">Drop the files here ...</p> :
              <div className="text-center">
                <p className="text-muted-foreground">
                  Drag 'n' drop some files here, or click to select files
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Only *.csv and *.txt files will be accepted
                </p>
              </div>
          }
          {csvFile && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{csvFile.name}</Badge>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Button onClick={() => {
            if (csvFile) {
              uploadCSVMutation.mutate(csvFile);
            } else {
              toast({
                title: "No File Selected",
                description: "Please select a CSV file to upload.",
                variant: "destructive",
              });
            }
          }} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  interface CSVRecord {
    id: string;
    file_path: string;
    created_at: string;
    status: string;
    error_message?: string;
  }

  const { data: csvHistory = [], isLoading } = useQuery({
    queryKey: ['csv-history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('csv_upload_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as CSVRecord[];
    },
  });

  const CSVHistoryTable = () => (
    <Card>
      <CardContent className="space-y-4">
        <h4 className="text-lg font-semibold">Upload History</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : csvHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No CSV upload history found.</TableCell>
              </TableRow>
            ) : (
              csvHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.file_path.split('/').pop()}</TableCell>
                  <TableCell>{format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>{record.error_message || 'No Error'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout 
      title="CSV Upload" 
      description="Upload and manage your customer data files"
      icon={<Upload className="h-8 w-8 text-primary" />}
    >
      <CSVUploader />
      <CSVHistoryTable />
    </PageLayout>
  );
};
