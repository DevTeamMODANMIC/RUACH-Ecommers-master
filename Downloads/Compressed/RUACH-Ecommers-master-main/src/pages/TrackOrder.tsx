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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Separator } from "../components/ui/separator";
import { Package, Search, Truck, ArrowRight, Clock, Calendar } from "lucide-react";
import { getOrderByIdAndEmail } from "../lib/firebase-orders";
import { useToast } from "../hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  orderIdOrNumber: z
    .string()
    .min(1, { message: "Order ID or Number is required" })
    .max(100),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TrackOrder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderIdOrNumber: "",
      email: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const order = await getOrderByIdAndEmail(values.orderIdOrNumber, values.email);
      
      if (order) {
        // If order found, navigate to the order details page
        navigate(`/order-tracking/${order.id}`, { state: { guestAccess: true, email: values.email } });
      } else {
        // If no order found, show error
        toast({
          title: "Order not found",
          description: "We couldn't find an order matching those details. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast({
        title: "Error tracking order",
        description: "There was a problem tracking your order. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Package className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">
            Enter your order details to check the status of your delivery
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>
              Enter your order ID or order number and the email address used for the order
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="orderIdOrNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID or Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AYO-1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the order ID or order number from your confirmation email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the email address used when placing the order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Track Order
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex-col space-y-4 pt-6">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Already have an account?</p>
              <p>
                Sign in to your account to easily view all your orders and track deliveries
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Sign In to Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-12 space-y-8">
          <h2 className="text-xl font-semibold text-center">How Order Tracking Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Enter Your Details</h3>
              <p className="text-sm text-muted-foreground">
                Provide your order number and email address used for the purchase
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Check Status</h3>
              <p className="text-sm text-muted-foreground">
                View the current status of your order in our fulfillment process
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Track Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Once shipped, follow your package with real-time tracking information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}