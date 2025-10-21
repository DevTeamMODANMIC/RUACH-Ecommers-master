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
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

// Mock data for demonstration
interface KycRecord {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  status: "pending" | "verified" | "rejected" | "flagged";
  createdAt: string;
  verifiedAt?: string;
  flaggedReason?: string;
}

const mockKycRecords: KycRecord[] = [
  {
    id: "kyc_1",
    customerId: "CUS_abc123",
    customerName: "Anna Bron",
    email: "anna@example.com",
    status: "verified",
    createdAt: "2023-05-15T10:30:00Z",
    verifiedAt: "2023-05-15T11:45:00Z"
  },
  {
    id: "kyc_2",
    customerId: "CUS_def456",
    customerName: "John Doe",
    email: "john@example.com",
    status: "pending",
    createdAt: "2023-05-16T14:20:00Z"
  },
  {
    id: "kyc_3",
    customerId: "CUS_ghi789",
    customerName: "Jane Smith",
    email: "jane@example.com",
    status: "flagged",
    createdAt: "2023-05-14T09:15:00Z",
    flaggedReason: "Name mismatch"
  }
];

export default function AdminKyc() {
  const { isAdmin, loading } = useAdmin();
  const [records, setRecords] = useState<KycRecord[]>(mockKycRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter records based on search term and status filter
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: KycRecord["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "flagged":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Flagged</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
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
                  placeholder="Search by name, email, or customer ID..."
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
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flagged</p>
                  <p className="text-xl font-bold">{records.filter(r => r.status === "flagged").length}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
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
                    <TableCell>{record.email}</TableCell>
                    <TableCell>{record.customerId}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}