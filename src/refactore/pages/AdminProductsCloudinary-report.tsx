import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Link from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "../hooks/use-toast";
import { Product } from "../types";
import { getProducts, listenToProducts } from "../lib/firebase-products";
import CloudinaryImage from "../components/cloudinary-image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function CloudinaryReportPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [migratingId, setMigratingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Auth + realtime products
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
        const unsubProducts = listenToProducts((data) => {
          setProducts(data);
          setLoading(false);
        });
        return () => unsubProducts();
      } else {
        navigate("/login");
      }
    });

    return () => unsubAuth();
  }, [router]);

  const missing = products.filter(
    (p) => !p.cloudinaryImages || p.cloudinaryImages.length === 0
  );

  const handleMigrate = async (id: string) => {
    setMigratingId(id);
    try {
      const res = await fetch(`/api/cloudinary/migrate/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Migration complete", description: id });
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err: any) {
      toast({ title: "Migration error", description: err.message, variant: "destructive" });
    } finally {
      setMigratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">Loading...</div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container py-10">
      <Button variant="outline" size="sm" className="mb-6" asChild>
        <Link to="/admin/products">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Products missing Cloudinary images</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {missing.length} product{missing.length !== 1 && "s"} without Cloudinary images
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missing.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleMigrate(p.id)}
                      disabled={!!migratingId}
                    >
                      {migratingId === p.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" /> Migrating
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" /> Migrate now
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {missing.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-green-600">
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> All products have Cloudinary images!
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 