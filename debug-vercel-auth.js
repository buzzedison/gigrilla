// Debug script to test Supabase connection on Vercel
// Add this to a page temporarily to debug auth issues

const debugSupabaseAuth = async () => {
  console.log('=== SUPABASE AUTH DEBUG ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.href);
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('Anon Key Length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
  
  try {
    // Test Supabase connection
    const { createClient } = await import('./lib/supabase/client');
    const supabase = createClient();
    
    console.log('Supabase client created successfully');
    
    // Test auth endpoint
    console.log('Testing auth endpoint...');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session check result:', { hasSession: !!session, error });
    
    // Test a simple query to verify connection
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('Database test result:', { 
      success: !testError, 
      error: testError?.message,
      hasData: !!testData 
    });
    
  } catch (error) {
    console.error('Supabase debug error:', error);
  }
  
  console.log('=== END DEBUG ===');
};

// Call this function from your component
export default debugSupabaseAuth;
