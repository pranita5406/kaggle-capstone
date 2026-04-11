import { useQuery } from "@tanstack/react-query";
import { useDashboard } from "@/context/DashboardContext";

export function useVitalsData() {
  const { patientId, phiRedacted } = useDashboard();
  
  return useQuery({
    queryKey: ['vitals', patientId, phiRedacted],
    queryFn: async () => {
      const res = await fetch(`/api/vitals/${patientId}`, {
        headers: { 'x-redact-pii': phiRedacted.toString() }
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        throw new Error("Data Stream Interrupted: Check Clinical Data Source.");
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useHandoffData() {
  const { patientId, phiRedacted } = useDashboard();
  
  return useQuery({
    queryKey: ['handoff', patientId, phiRedacted],
    queryFn: async () => {
      const res = await fetch(`/api/handoff/${patientId}`, {
        headers: { 'x-redact-pii': phiRedacted.toString() }
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        throw new Error("Data Stream Interrupted: Check Clinical Data Source.");
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
  });
}

export function usePatientData() {
  const vitals = useVitalsData();
  const handoff = useHandoffData();
  
  return {
    vitals,
    handoff,
    isLoading: vitals.isLoading || handoff.isLoading,
    isError: vitals.error || handoff.error,
    error: vitals.error || handoff.error,
  };
}

export function useIntelligenceFeedUpdates() {
  const { lastIntelligenceUpdate, patientId } = useDashboard();
  
  // Re-fetch whenever lastIntelligenceUpdate changes
  return useQuery({
    queryKey: ['intelligence-feed', patientId, lastIntelligenceUpdate],
    queryFn: async () => {
      const res = await fetch(`/api/handoff/${patientId}`);
      const json = await res.json();
      return json.intelligenceFeed || [];
    },
  });
}
