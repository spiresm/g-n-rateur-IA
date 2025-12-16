import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';

export function useQuotaSystemStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkQuotaSystem() {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/health`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          setIsConfigured(false);
          setIsChecking(false);
          return;
        }

        const testResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-52811d4b/quota/test@example.com`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

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
