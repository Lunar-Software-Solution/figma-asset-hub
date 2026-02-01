import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Brand {
  id: string;
  team_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  created_at: string;
}

interface BrandContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  setCurrentBrand: (brand: Brand | null) => void;
  isLoading: boolean;
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = async () => {
    if (!user) {
      setBrands([]);
      setCurrentBrand(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (error) throw error;

      setBrands(data || []);
      
      // Set first brand as current if none selected
      if (!currentBrand && data && data.length > 0) {
        setCurrentBrand(data[0]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user]);

  const refreshBrands = async () => {
    await fetchBrands();
  };

  return (
    <BrandContext.Provider
      value={{
        brands,
        currentBrand,
        setCurrentBrand,
        isLoading,
        refreshBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
