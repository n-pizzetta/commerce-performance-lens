
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
import { Upload, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface CsvUploaderProps {
  onFileLoad: (name: string, data: any[]) => void;
  accept?: string;
  title?: string;
  description?: string;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({
  onFileLoad,
  accept = ".csv",
  title = "Charger un fichier CSV",
  description = "Sélectionnez un fichier CSV à charger pour l'analyse"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
      // Process the file
      // For now we just use a mock response
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const csvData = event.target.result.toString();
          const lines = csvData.split('\n');
          
          // Simple parsing - in real scenario, use Papa Parse
          const headers = lines[0].split(',');
          const result = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const obj: Record<string, string> = {};
            const currentLine = lines[i].split(',');
            
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : '';
            }
            
            result.push(obj);
          }
          
          onFileLoad(file.name, result);
          
          toast({
            title: "Succès",
            description: `${file.name} chargé avec succès (${result.length} enregistrements)`,
          });
          
          setOpen(false);
        }
      };
      
      reader.readAsText(file);
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
