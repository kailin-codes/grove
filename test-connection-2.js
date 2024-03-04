import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwuqgbkiwsouwtdjnxu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXFxYmtpd3NvdXd0ZGpuanh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MjEsImV4cCI6MjA0NDUwNDgyMX0.ppvDVmOfDMIZ8PIHQcVf5_vZkoM9Mbxb8j5YQFjeHHg'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  fetch: (url, options) => {
    return fetch(url, { ...options, timeout: 30000 });
  }
})

async function testConnection() {
  try {
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1)
    if (error) throw error;
    console.log('Connected successfully. Data:', data)
  } catch (error) {
    console.error('Connection error:', error)
  }
}

testConnection()
