import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface District {
  name: string;
  lat: number;
  lng: number;
  lawyerName?: string;
  lawyerPhone: string;
  lawyerEmail: string;
}

const defaultDistricts: District[] = [
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Ranga Reddy', lat: 17.2543, lng: 78.2035, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Warangal', lat: 17.9784, lng: 79.5941, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Karimnagar', lat: 18.4386, lng: 79.1288, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Nizamabad', lat: 18.6725, lng: 78.094, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Khammam', lat: 17.2473, lng: 80.1514, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Nalgonda', lat: 17.0583, lng: 79.2671, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Mahabubnagar', lat: 16.7388, lng: 77.9855, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Medak', lat: 18.0529, lng: 78.2639, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
  { name: 'Adilabad', lat: 19.664, lng: 78.532, lawyerPhone: '8897166877', lawyerEmail: 'awaisahmedmbnr@gmail.com' },
];

export const DistrictMap = () => {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState<District[]>(defaultDistricts);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data } = await (supabase.from as any)('lawyers')
        .select('name, email, phone, district')
        .eq('approved', true);
      if (data && data.length > 0) {
        setDistricts(prev =>
          prev.map(d => {
            const lawyer = data.find((l: any) => l.district === d.name);
            return lawyer
              ? { ...d, lawyerName: lawyer.name, lawyerPhone: lawyer.phone, lawyerEmail: lawyer.email }
              : d;
          })
        );
      }
    };
    fetchLawyers();
  }, []);

  return (
    <section id="district-map" className="py-20 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            <MapPin className="inline h-8 w-8 text-primary mr-2" />
            {t('districtMap.title', 'Telangana District Lawyer Map')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('districtMap.subtitle', 'Find and contact lawyers assigned to your district')}
          </p>
        </div>

        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[450px] w-full">
              <MapContainer
                center={[17.9, 78.9]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {districts.map(d => (
                  <Marker key={d.name} position={[d.lat, d.lng]}>
                    <Popup>
                      <div className="text-sm min-w-[200px]">
                        <h3 className="font-bold text-base mb-1">{d.name}</h3>
                        {d.lawyerName && (
                          <p className="text-xs text-gray-600 mb-2">Lawyer: <strong>{d.lawyerName}</strong></p>
                        )}
                        <div className="space-y-1">
                          <a href={`tel:+91${d.lawyerPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Phone className="h-3 w-3" /> +91 {d.lawyerPhone}
                          </a>
                          <a href={`mailto:${d.lawyerEmail}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Mail className="h-3 w-3" /> {d.lawyerEmail}
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* District Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {districts.map(d => (
            <Card key={d.name} className="hover-lift text-center">
              <CardContent className="p-4">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{d.name}</h3>
                {d.lawyerName && <p className="text-xs text-muted-foreground mb-2">{d.lawyerName}</p>}
                <div className="flex gap-1 justify-center">
                  <Button size="sm" variant="outline" className="h-7 px-2" asChild>
                    <a href={`tel:+91${d.lawyerPhone}`}><Phone className="h-3 w-3" /></a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2" asChild>
                    <a href={`mailto:${d.lawyerEmail}`}><Mail className="h-3 w-3" /></a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
