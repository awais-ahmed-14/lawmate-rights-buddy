import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Send, Users, Gavel, Mail, Phone, Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

interface ApprovedLawyer {
  id: string; name: string; email: string; phone: string; district: string;
}
interface CaseTypeRow {
  id: string; name: string; display_name: string;
}

const OTHERS_KEY = 'others';

export const Contact = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [caseTypes, setCaseTypes] = useState<CaseTypeRow[]>([]);
  const [selectedCaseTypeId, setSelectedCaseTypeId] = useState('');
  const [othersText, setOthersText] = useState('');

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [lawyers, setLawyers] = useState<ApprovedLawyer[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState('');

  const [complaint, setComplaint] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (profile) {
      setUserEmail(profile.email || '');
      setUserPhone((profile as any).phone || '');
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('case_types').select('id, name, display_name').order('display_name');
      if (data) setCaseTypes(data as CaseTypeRow[]);
      const { data: lw } = await supabase
        .from('lawyers')
        .select('id, name, email, phone, district')
        .eq('approved', true);
      if (lw) setLawyers(lw as ApprovedLawyer[]);
    })();
  }, []);

  useEffect(() => { setSelectedLawyerId(''); }, [selectedDistrict]);

  const districtLawyers = lawyers.filter(l => l.district === selectedDistrict);
  const selectedCaseType = caseTypes.find(ct => ct.id === selectedCaseTypeId);
  const isOthers = selectedCaseType?.name === OTHERS_KEY;

  const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    const valid = incoming.filter(f => f.size <= 25 * 1024 * 1024); // 25MB
    if (valid.length < incoming.length) {
      toast({ title: 'Some files were too large', description: 'Max 25MB per file.', variant: 'destructive' });
    }
    setFiles(prev => [...prev, ...valid].slice(0, 5));
    e.target.value = '';
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const uploadProofs = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('complaint-proofs').upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data } = supabase.storage.from('complaint-proofs').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const submitComplaint = async () => {
    if (!selectedCaseTypeId) return toast({ title: 'Please select your case type', variant: 'destructive' });
    if (isOthers && !othersText.trim()) return toast({ title: 'Please describe your case type', variant: 'destructive' });
    if (!selectedDistrict) return toast({ title: 'Please select your district', variant: 'destructive' });
    if (!selectedLawyerId) return toast({ title: 'Please select a lawyer', variant: 'destructive' });
    if (!complaint.trim()) return toast({ title: 'Please describe your complaint', variant: 'destructive' });
    if (!/^\+?[\d\s-]{7,15}$/.test(userPhone.trim())) return toast({ title: 'Valid phone number required', variant: 'destructive' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail.trim())) return toast({ title: 'Valid email required', variant: 'destructive' });

    setIsSending(true);
    try {
      let caseTypeId = selectedCaseTypeId;

      // For "Others", create a custom subtype on the fly
      if (isOthers) {
        const customName = `others_${othersText.toLowerCase().replace(/\s+/g, '_').slice(0, 40)}`;
        const { data: existing } = await supabase.from('case_types').select('id').eq('name', customName).maybeSingle();
        if (existing) {
          caseTypeId = existing.id;
        } else {
          const { data: created, error: cErr } = await supabase
            .from('case_types')
            .insert({ name: customName, display_name: `Others: ${othersText.trim().slice(0, 80)}` })
            .select('id').single();
          if (cErr) throw cErr;
          caseTypeId = created!.id;
        }
      }

      const proofUrls = await uploadProofs();

      const { error: insErr } = await supabase.from('case_records').insert({
        case_type_id: caseTypeId,
        status: 'pending',
        language: i18n.language || 'en',
        user_message: complaint,
        user_email: userEmail,
        user_phone: userPhone,
        assigned_lawyer_id: selectedLawyerId,
        proof_files: proofUrls,
      } as any);

      if (insErr) {
        if ((insErr as any).code === '23505') {
          toast({ title: 'Duplicate complaint', description: 'You already filed this case type today.' });
          setIsSending(false);
          return;
        }
        throw insErr;
      }

      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-cases'] });

      toast({ title: 'Complaint Sent ✅', description: 'Delivered to the selected lawyer.' });
      setComplaint(''); setFiles([]); setSelectedCaseTypeId(''); setOthersText(''); setSelectedLawyerId('');
    } catch (err: any) {
      console.error('Complaint submit error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to send complaint.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          <MapPin className="inline h-7 w-7 text-primary mr-2" /> File a Complaint
        </h2>
        <p className="text-muted-foreground">
          Choose your case type, attach proof, and send it to a verified lawyer.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Complaint Form</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Case type → Description → District → Lawyer → Contact → Proof → Send
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">

          {/* 1. Case Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Your Case Type</label>
            <Select value={selectedCaseTypeId} onValueChange={setSelectedCaseTypeId}>
              <SelectTrigger><SelectValue placeholder="Choose a case category..." /></SelectTrigger>
              <SelectContent className="max-h-72">
                {caseTypes.map(ct => (
                  <SelectItem key={ct.id} value={ct.id}>{ct.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOthers && (
              <Input
                className="mt-3"
                placeholder="Briefly specify your case type..."
                value={othersText}
                onChange={e => setOthersText(e.target.value)}
                maxLength={80}
              />
            )}
          </div>

          {/* 2. Complaint */}
          <div>
            <label className="text-sm font-medium mb-2 block">Enter Your Complaint</label>
            <Textarea
              placeholder="Describe what happened in detail..."
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              className="min-h-[140px]"
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">{complaint.length}/2000</p>
          </div>

          {/* 3. District */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Your District</label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger><SelectValue placeholder="Choose a Telangana district..." /></SelectTrigger>
              <SelectContent>
                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Lawyer */}
          {selectedDistrict && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Users className="h-4 w-4" /> Select Lawyer for {selectedDistrict}
              </label>
              {districtLawyers.length === 0 ? (
                <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No approved lawyers in {selectedDistrict} yet. Try another district.
                  </p>
                </div>
              ) : (
                <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
                  <SelectTrigger><SelectValue placeholder="Choose a verified lawyer..." /></SelectTrigger>
                  <SelectContent>
                    {districtLawyers.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        <div className="flex items-center gap-2">
                          <Gavel className="h-3.5 w-3.5 text-primary" />
                          <span>{l.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* 5. Contact */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </label>
              <Input type="tel" placeholder="e.g. +91 98765 43210" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <Input type="email" placeholder="you@example.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
            </div>
          </div>

          {/* 6. Proof Upload (optional) */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Proof (optional)
            </label>
            <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
              <input
                id="proof-upload"
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFilesAdd}
                className="hidden"
              />
              <label htmlFor="proof-upload" className="cursor-pointer text-sm text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
                Click to attach documents, images, or videos (max 5 files, 25MB each)
              </label>
            </div>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            className="w-full" size="lg"
            onClick={submitComplaint}
            disabled={isSending}
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Complaint to Lawyer
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
