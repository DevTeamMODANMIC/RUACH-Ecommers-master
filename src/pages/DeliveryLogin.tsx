import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Separator } from "../components/ui/separator";
import { Truck, LogIn, Mail } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

// Form validation schema
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Load authorized emails from Firebase
      const querySnapshot = await getDocs(collection(db, "deliveryAuthorizedEmails"));
      const authorizedEmails = querySnapshot.docs.map(doc => doc.data().email);
      
      // Check if the email is in the authorized list
      const isAuthorized = authorizedEmails.some(
        email => email.toLowerCase() === values.email.toLowerCase()
      );
      
      if (isAuthorized) {
        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome to the delivery dashboard!",
        });
        
        // Navigate to delivery dashboard
        navigate("/delivery-dashboard");
      } else {
        throw new Error("Unauthorized email address");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Unauthorized email address. Please contact your supervisor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Delivery Personnel Login</h1>
          <p className="text-muted-foreground mt-2">
            RUACH E-STORE Logistics System
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email to access the delivery dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your email address" 
                            className="pl-10" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help accessing your account?</p>
              <p className="mt-1">Contact your supervisor for assistance</p>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RUACH E-STORE. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}