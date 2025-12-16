import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function useQuotaSystemStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkQuotaSystem() {
      try {
        // Test endpoint to check if tables exist
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/health`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          setIsConfigured(false);
          setIsChecking(false);
          return;
        }

        // Try to fetch a test quota
        const testResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/quota/test@example.com`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        // If we get a 500 error, tables likely don't exist
        // If we get 200, tables exist and are working
        setIsConfigured(testResponse.ok);
      } catch (error) {
        console.error('Error checking quota system status:', error);
        setIsConfigured(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkQuotaSystem();
  }, []);

  return { isConfigured, isChecking };
}
