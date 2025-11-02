import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Banknote, 
  UserCheck,
  X
} from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define the KYC record interface based on actual user profile data
interface KycRecord {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  status: "not-started" | "pending" | "verified" | "rejected";
  createdAt: string;
  verifiedAt?: string;
  flaggedReason?: string;
  phone?: string;
  kycData?: {
    bvn?: string;
    bankAccount?: {
      bank_name: string;
      account_number: string;
    };
  };
}

export default function AdminKyc() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch KYC records from Firestore
  useEffect(() => {
    const fetchKycRecords = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        // Query users collection for those with KYC data
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const kycRecords: KycRecord[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Only include users who have started KYC process
          if (data.kycStatus) {
            kycRecords.push({
              id: doc.id,
              customerId: data.uid || doc.id,
              customerName: data.name || "Unknown",
              email: data.email || "No email",
              status: data.kycStatus || "not-started",
              createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
              verifiedAt: data.kycData?.verifiedAt?.toDate?.().toISOString(),
              phone: data.phone,
              kycData: data.kycData
            });
          }
        });
        
        setRecords(kycRecords);
      } catch (error: any) {
        console.error("Error fetching KYC records:", error);
        toast({
          title: "Error",
          description: "Failed to load KYC records: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && !adminLoading) {
      fetchKycRecords();
    }
  }, [isAdmin, adminLoading, toast]);

  // Fetch detailed user information
  const fetchUserDetails = async (userId: string) => {
    setDetailLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSelectedRecord({
          id: userDoc.id,
          customerId: data.uid || userDoc.id,
          customerName: data.name || "Unknown",
          email: data.email || "No email",
          status: data.kycStatus || "not-started",
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          verifiedAt: data.kycData?.verifiedAt?.toDate?.().toISOString(),
          phone: data.phone,
          kycData: data.kycData
        });
      }
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details: " + error.message,
        variant: "destructive"
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter records based on search term and status filter
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.phone && record.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: KycRecord["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><AlertCircle className="h-3 w-3 mr-1" /> Not Started</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const handleViewDetails = async (record: KycRecord) => {
    await fetchUserDetails(record.id);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  if (adminLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading KYC records...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Management</h1>
          <p className="text-gray-600">Manage customer verification records</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-xl font-bold">{records.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-xl font-bold">{records.filter(r => r.status === "verified").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">{records.filter(r => r.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Not Started</p>
                  <p className="text-xl font-bold">{records.filter(r => r.status === "not-started").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-xl font-bold">{records.filter(r => r.status === "rejected").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Records ({filteredRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No KYC records found.</p>
                {searchTerm && <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria.</p>}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.customerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{record.email}</p>
                          {record.phone && <p>{record.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{record.customerId}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(record)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>User KYC Details</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : selectedRecord ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  
                  <div className="flex items-start gap-3">
                    <UserCheck className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedRecord.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedRecord.email}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedRecord.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">
                        {new Date(selectedRecord.createdAt).toLocaleDateString()}{' '}
                        {new Date(selectedRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">KYC Status</h3>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedRecord.status === "verified" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {selectedRecord.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                      {selectedRecord.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                      {selectedRecord.status === "not-started" && <AlertCircle className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <p className="font-medium capitalize">{selectedRecord.status.replace('-', ' ')}</p>
                    </div>
                  </div>
                  
                  {selectedRecord.verifiedAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Verified At</p>
                        <p className="font-medium">
                          {new Date(selectedRecord.verifiedAt).toLocaleDateString()}{' '}
                          {new Date(selectedRecord.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.kycData?.bvn && (
                    <div className="flex items-start gap-3">
                      <UserCheck className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">BVN</p>
                        <p className="font-medium font-mono">{selectedRecord.kycData.bvn}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedRecord.kycData?.bankAccount && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-4">Bank Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{selectedRecord.kycData.bankAccount.bank_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Banknote className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium font-mono">{selectedRecord.kycData.bankAccount.account_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}