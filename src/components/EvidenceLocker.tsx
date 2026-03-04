import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Image, Video, Trash2, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  file: File;
}

interface EvidenceLockerProps {
  onFilesChanged?: (files: File[]) => void;
}

export const EvidenceLocker = ({ onFilesChanged }: EvidenceLockerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onFilesChanged?.(files.map(f => f.file));
  }, [files, onFilesChanged]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive",
        });
        continue;
      }
      newFiles.push({ name: file.name, type: file.type, size: file.size, file });
    }

    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: t('evidence.uploaded', 'Files Added'),
      description: `${newFiles.length} file(s) added to evidence locker`,
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-orange-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('evidence.title', '🔒 Evidence Locker')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          {t('evidence.description', 'Securely upload photos, videos, or documents as legal evidence to attach with your complaint.')}
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4 hover:border-primary/50 transition-colors">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            {t('evidence.dragDrop', 'Click to upload photos, videos, or documents')}
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-muted-foreground mt-2">Max 20MB per file</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {files.length} file(s) ready
            </p>
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
