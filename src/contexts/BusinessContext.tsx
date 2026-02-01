import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Business {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
  isLoading: boolean;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("name");

      if (error) throw error;

      setBusinesses(data || []);
      
      // Set first business as current if none selected
      if (!currentBusiness && data && data.length > 0) {
        setCurrentBusiness(data[0]);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const refreshBusinesses = async () => {
    await fetchBusinesses();
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        isLoading,
        refreshBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
