import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    console.log(`[csv-preview] Received CSV preview request. Filename: ${file.name}, Size: ${file.size} bytes`);

    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.name.endsWith('.csv')) {
      throw new Error('File must be a CSV');
    }

    // Read CSV content
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    const validationErrors = [];

    // Validate required columns
    const requiredColumns = ['user_id', 'email'];
    const recommendedColumns = ['plan_type', 'monthly_revenue', 'last_login_days_ago', 'total_logins'];
    
    requiredColumns.forEach(col => {
      if (!headers.includes(col) && !headers.find(h => h.toLowerCase().includes(col.toLowerCase()))) {
        validationErrors.push(`Missing required column: ${col}`);
      }
    });

    recommendedColumns.forEach(col => {
      if (!headers.includes(col) && !headers.find(h => h.toLowerCase().includes(col.toLowerCase()))) {
        validationErrors.push(`Recommended column missing: ${col} (this will improve prediction accuracy)`);
      }
    });

    // Parse first 10 rows for preview
    const previewLines = lines.slice(1, 11);
    for (let i = 0; i < previewLines.length; i++) {
      const values = previewLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        validationErrors.push(`Row ${i + 2}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    // Additional validation
    const userIdColumn = headers.find(h => h.toLowerCase().includes('user_id') || h.toLowerCase().includes('id'));
    const emailColumn = headers.find(h => h.toLowerCase().includes('email'));

    if (userIdColumn && rows.length > 0) {
      const uniqueIds = new Set(rows.map(row => row[userIdColumn]));
      if (uniqueIds.size !== rows.length) {
        validationErrors.push('Duplicate user IDs found in the data');
      }
    }

    if (emailColumn && rows.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = rows.filter(row => row[emailColumn] && !emailRegex.test(row[emailColumn]));
      if (invalidEmails.length > 0) {
        validationErrors.push(`${invalidEmails.length} invalid email format(s) found`);
      }
    }

    return new Response(JSON.stringify({
      columns: headers,
      rows: rows,
      total_rows: lines.length - 1,
      validation_errors: validationErrors,
      recommendations: [
        'Include usage metrics (logins, feature usage, session duration)',
        'Add billing data (revenue, payment failures, plan changes)',
        'Include support data (tickets, response times, satisfaction)',
        'Add engagement scores if available'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[csv-preview] CSV Preview error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        columns: [],
        rows: [],
        total_rows: 0,
        validation_errors: [error.message]
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});