import React, { useState } from 'react';
import { Search, TestTube2, Package } from 'lucide-react';
import { useGetAllLabTests, useHealthPackages } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LabTestBookingModal from '../components/LabTestBookingModal';
import HealthPackageCard from '../components/HealthPackageCard';
import LabTestCard from '../components/LabTestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { LabTest } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function LabTests() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: labTests, isLoading: labTestsLoading } = useGetAllLabTests();
  const { data: healthPackages, isLoading: packagesLoading } = useHealthPackages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const filteredTests = labTests?.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.testParameters.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredPackages = healthPackages?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.includedTests.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.testParameters.some(param => param.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleBookTest = (test: LabTest) => {
    if (!identity) {
      navigate({ to: '/profile' });
      return;
    }
    setSelectedTest(test);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <img
          src="/assets/generated/jd-health-packages-banner.dim_1200x400.png"
          alt="JD Health Lab Packages"
          className="w-full h-48 md:h-64 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <div className="px-6 md:px-10">
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
              Flat 60% OFF
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
              Lab Tests & Health Packages
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Book from home · Certified labs · Fast results
            </p>
          </div>
        </div>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['Free Home Collection', 'Certified Labs', 'Fast Results', 'Online Reports'].map(tag => (
          <span key={tag} className="bg-card text-xs font-medium px-3 py-1.5 rounded-full border border-border">
            ✓ {tag}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search tests, packages, or parameters..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="packages" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Package className="w-4 h-4" />
            Health Packages
            {!packagesLoading && filteredPackages.length > 0 && (
              <span className="ml-1 bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {filteredPackages.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2 flex-1 sm:flex-none">
            <TestTube2 className="w-4 h-4" />
            Individual Tests
            {!labTestsLoading && filteredTests.length > 0 && (
              <span className="ml-1 bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {filteredTests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Health Packages Tab */}
        <TabsContent value="packages">
          {packagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="pharma-card p-4">
                  <Skeleton className="h-40 w-full rounded-xl mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map(pkg => (
                <HealthPackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold text-foreground mb-1">No packages found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </TabsContent>

        {/* Individual Tests Tab */}
        <TabsContent value="tests">
          {labTestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="pharma-card p-4">
                  <Skeleton className="h-36 w-full rounded-xl mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <LabTestCard key={test.id} test={test} onBookNow={handleBookTest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <TestTube2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold text-foreground mb-1">No tests found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LabTestBookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        labTest={selectedTest}
        onLoginRequired={() => {
          setBookingModalOpen(false);
          navigate({ to: '/profile' });
        }}
      />
    </div>
  );
}
