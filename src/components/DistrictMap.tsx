import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send, Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AUTHORITY_EMAIL = 'awaisahmedmbnr@outlook.com';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

interface ApprovedLawyer {
  name: string;
  email: string;
  phone: string;
  district: string;
}

export const DistrictMap = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [complaint, setComplaint] = useState('');
  const [lawyers, setLawyers] = useState<ApprovedLawyer[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data } = await supabase
        .from('lawyers')
        .select('name, email, phone, district')
        .eq('approved', true);
      if (data) setLawyers(data as ApprovedLawyer[]);
    };
    fetchLawyers();
  }, []);

  const districtLawyers = lawyers.filter(l => l.district === selectedDistrict);

  const handleSendToAuthority = () => {
    if (!complaint.trim()) {
      toast({ title: 'Please enter your complaint', variant: 'destructive' });
      return;
    }
    const subject = encodeURIComponent(`District Complaint - ${selectedDistrict}`);
    const body = encodeURIComponent(
      `Dear Authority,\n\nDistrict: ${selectedDistrict}\n\nComplaint:\n${complaint}\n\nFrom:\nEmail: ${profile?.email || 'N/A'}\nPhone: ${profile?.phone || 'N/A'}\nName: ${profile?.full_name || 'N/A'}\n\nRegards`
    );
    window.open(`mailto:${AUTHORITY_EMAIL}?subject=${subject}&body=${body}`, '_self');
  };

  const handleContactLawyer = (lawyer: ApprovedLawyer) => {
    if (!complaint.trim()) {
      toast({ title: 'Please enter your complaint first', variant: 'destructive' });
      return;
    }
    const subject = encodeURIComponent(`Legal Complaint - ${selectedDistrict}`);
    const body = encodeURIComponent(
      `Dear ${lawyer.name},\n\nDistrict: ${selectedDistrict}\n\nComplaint:\n${complaint}\n\nFrom:\nEmail: ${profile?.email || 'N/A'}\nPhone: ${profile?.phone || 'N/A'}\nName: ${profile?.full_name || 'N/A'}\n\nRegards`
    );
    window.open(`mailto:${lawyer.email}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <section id="district-map" className="py-20 bg-background">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            <MapPin className="inline h-8 w-8 text-primary mr-2" />
            {t('districtMap.title', 'Telangana District Legal Help')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('districtMap.subtitle', 'Select your district to contact authority or assigned lawyer')}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Select Your District
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* District Selection */}
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a Telangana district..." />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDistrict && (
              <>
                {/* Complaint Field */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Enter Your Complaint</label>
                  <Textarea
                    placeholder="Describe your complaint in detail..."
                    value={complaint}
                    onChange={e => setComplaint(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Contact Options */}
                <div className="space-y-4">
                  {/* Authority Contact */}
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" /> District Authority Contact
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">{AUTHORITY_EMAIL}</p>
                      <Button
                        className="w-full"
                        onClick={handleSendToAuthority}
                        disabled={!complaint.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" /> Send Complaint to Authority
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Approved Lawyers */}
                  {districtLawyers.length > 0 && (
                    <Card className="border-2 border-accent/20">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-accent-foreground" /> Approved Lawyers for {selectedDistrict}
                        </h4>
                        <div className="space-y-3">
                          {districtLawyers.map((lawyer, i) => (
                            <div key={i} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-sm">{lawyer.name}</p>
                                <p className="text-xs text-muted-foreground">{lawyer.email} · {lawyer.phone}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleContactLawyer(lawyer)} disabled={!complaint.trim()}>
                                  <Mail className="h-3 w-3 mr-1" /> Mail
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:+91${lawyer.phone}`}><Phone className="h-3 w-3" /></a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {districtLawyers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No approved lawyers for {selectedDistrict} yet. Use the authority contact above.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
