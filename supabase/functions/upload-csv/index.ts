import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Function upload-csv/index.ts - START"); // Debug log
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("CSV received. Starting upload process."); // Log CSV reception
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const formData = await req.formData();
    const email = formData.get("email") as string;
    const file = formData.get("file") as File;

    console.log(`Input Summary: Email: ${email ? 'Provided' : 'Missing'}, File: ${file ? file.name : 'Missing'}`); // Debug log

    if (!email || !file) {
      console.error("Error: Email or file missing."); // Log missing email/file
      console.log("Function upload-csv/index.ts - END (Error: Missing email or file)"); // Debug log
      return new Response(
        JSON.stringify({ error: "Email and file are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      console.error(`Error: Invalid file type. Received: ${file.name}`); // Log invalid file type
      console.log("Function upload-csv/index.ts - END (Error: Invalid file type)"); // Debug log
      return new Response(
        JSON.stringify({ error: "Only CSV files are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      console.error(`Error: File size too large. Received: ${file.size} bytes`); // Log large file size
      console.log("Function upload-csv/index.ts - END (Error: File size too large)"); // Debug log
      return new Response(
        JSON.stringify({ error: "File size must be less than 20MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File validation successful for ${file.name}. Proceeding to upload.`); // Log file validation success

    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("csv-uploads")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError); // Log upload error with stack trace
      console.log("Function upload-csv/index.ts - END (Error: Failed to upload file)"); // Debug log
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File ${fileName} uploaded to storage. Public URL generation.`); // Log upload success

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("csv-uploads")
      .getPublicUrl(fileName);

    console.log(`Public URL generated: ${publicUrl}. Inserting record into database.`); // Log public URL generation

    // Insert upload record
    const { data: upload, error: dbError } = await supabase
      .from("churn_uploads")
      .insert({
        email,
        filename: file.name,
        csv_url: publicUrl,
        status: "received"
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError); // Log database error with stack trace
      console.log("Function upload-csv/index.ts - END (Error: Failed to save upload record)"); // Debug log
      return new Response(
        JSON.stringify({ error: "Failed to save upload record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Upload record for ${upload.id} inserted into database. Triggering processing.`); // Log database insertion success

    // Trigger processing
    await supabase.functions.invoke("process-churn-data", {
      body: { upload_id: upload.id }
    });

    console.log(`Processing triggered for upload ID: ${upload.id}.`); // Log processing trigger

    console.log(`Output Summary: Upload ID: ${upload.id}, Status: received`); // Debug log
    console.log("Function upload-csv/index.ts - END (Success)"); // Debug log
    return new Response(
      JSON.stringify({ upload_id: upload.id, status: "received" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Internal server error:", error); // Log internal server error with stack trace
    console.log("Function upload-csv/index.ts - END (Internal Server Error)"); // Debug log
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});