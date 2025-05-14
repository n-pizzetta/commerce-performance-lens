
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { 
  loadCsvFromInput,
  transformCustomers,
  transformGeolocation,
  transformOrderItems,
  transformOrderPayments,
  transformOrderReviews,
  transformOrders,
  transformProducts,
  transformSellers
} from '@/services/csvDataService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// File types that can be uploaded
export type FileType = 
  | 'customers'
  | 'geolocation'
  | 'order_items'
  | 'order_payments'
  | 'order_reviews'
  | 'orders'
  | 'products'
  | 'sellers'
  | 'category_translation'
  | 'unknown';

interface CsvUploaderProps {
  onFileLoad: (fileType: FileType, data: any[]) => void;
  accept?: string;
}

// File type mapping
const fileTypeMapping: Record<string, FileType> = {
  'olist_customers_dataset': 'customers',
  'olist_geolocation_dataset': 'geolocation',
  'olist_order_items_dataset': 'order_items',
  'olist_order_payments_dataset': 'order_payments',
  'olist_order_reviews_dataset': 'order_reviews',
  'olist_orders_dataset': 'orders',
  'olist_products_dataset': 'products',
  'olist_sellers_dataset': 'sellers',
  'product_category_name_translation': 'category_translation'
};

// File descriptions
const fileDescriptions: Record<FileType, string> = {
  'customers': 'Informations sur les clients',
  'geolocation': 'Données géographiques',
  'order_items': 'Produits commandés',
  'order_payments': 'Paiements des commandes',
  'order_reviews': 'Avis clients',
  'orders': 'Commandes',
  'products': 'Produits',
  'sellers': 'Vendeurs',
  'category_translation': 'Traduction des noms de catégories',
  'unknown': 'Fichier non reconnu'
};

const CsvUploader: React.FC<CsvUploaderProps> = ({
  onFileLoad,
  accept = ".csv"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [manualFileType, setManualFileType] = useState<FileType>('customers');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const detectFileType = (fileName: string): FileType => {
    for (const [pattern, type] of Object.entries(fileTypeMapping)) {
      if (fileName.toLowerCase().includes(pattern.toLowerCase())) {
        return type;
      }
    }
    return 'unknown';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const detectedType = detectFileType(selectedFile.name);
      setFileType(detectedType);
      if (detectedType !== 'unknown') {
        setManualFileType(detectedType);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Process the file with PapaParse
      const rawData = await loadCsvFromInput(file);
      
      // Determine the file type (either detected or manually selected)
      const actualFileType = fileType === 'unknown' ? manualFileType : fileType;
      
      // Transform the data based on file type
      let transformedData;
      switch (actualFileType) {
        case 'customers':
          transformedData = transformCustomers(rawData);
          break;
        case 'geolocation':
          transformedData = transformGeolocation(rawData);
          break;
        case 'order_items':
          transformedData = transformOrderItems(rawData);
          break;
        case 'order_payments':
          transformedData = transformOrderPayments(rawData);
          break;
        case 'order_reviews':
          transformedData = transformOrderReviews(rawData);
          break;
        case 'orders':
          transformedData = transformOrders(rawData);
          break;
        case 'products':
          transformedData = transformProducts(rawData);
          break;
        case 'sellers':
          transformedData = transformSellers(rawData);
          break;
        default:
          transformedData = rawData; // Default case - just pass through the raw data
      }
      
      // Pass the transformed data back to the parent
      onFileLoad(actualFileType, transformedData);
      
      toast({
        title: "Succès",
        description: `${file.name} chargé avec succès (${transformedData.length} enregistrements)`
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erreur de chargement",
        description: "Une erreur s'est produite lors du chargement du fichier",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Charger un fichier CSV</DialogTitle>
          <DialogDescription>
            Sélectionnez un fichier CSV à charger pour l'analyse
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-dashboard-purple" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          
          {file && fileType === 'unknown' && (
            <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Type de fichier non reconnu</AlertTitle>
              <AlertDescription>
                Veuillez sélectionner manuellement le type de fichier ci-dessous.
              </AlertDescription>
            </Alert>
          )}
          
          {file && (fileType === 'unknown' || true) && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Type de fichier
              </label>
              <Select
                value={fileType === 'unknown' ? manualFileType : fileType}
                onValueChange={(value) => setManualFileType(value as FileType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez le type de fichier" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fileDescriptions).map(([key, description]) => {
                    if (key === 'unknown') return null;
                    return (
                      <SelectItem key={key} value={key}>{description}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {fileType !== 'unknown' ? 'Type détecté automatiquement' : 'Sélection manuelle nécessaire'}
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="bg-dashboard-purple hover:bg-dashboard-blue transition-colors"
            >
              {isLoading ? "Chargement..." : "Charger le fichier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvUploader;
