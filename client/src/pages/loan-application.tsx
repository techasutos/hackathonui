import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/lib/api";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import MainFrame from "@/components/layout/MainFrame";

const step1Schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  phone: z.string().regex(/^\+?91?\d{10}$/, "Invalid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(10, "Address must be at least 10 characters")
});

const step2Schema = z.object({
  amount: z.string().refine((val) => parseFloat(val) >= 1000 && parseFloat(val) <= 100000, {
    message: "Loan amount must be between ₹1,000 and ₹1,00,000"
  }),
  purpose: z.string().min(1, "Loan purpose is required"),
  purposeDescription: z.string().min(20, "Purpose description must be at least 20 characters"),
  tenure: z.string().min(1, "Loan tenure is required"),
  monthlyIncome: z.string().refine((val) => parseFloat(val) > 0, {
    message: "Monthly income must be greater than 0"
  })
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: "",
      aadhaar: "",
      phone: "",
      email: "",
      address: ""
    }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      amount: "",
      purpose: "",
      purposeDescription: "",
      tenure: "",
      monthlyIncome: ""
    }
  });

  const createLoanMutation = useMutation({
    mutationFn: (data: any) => apiService.createLoanApplication(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan application submitted successfully! You will receive updates soon.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-applications'] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    if (!step1Data) return;

    const loanApplication = {
      memberId: user?.id || 1, // Mock member ID
      amount: data.amount,
      purpose: data.purpose,
      purposeDescription: data.purposeDescription,
      tenure: parseInt(data.tenure),
      monthlyIncome: data.monthlyIncome
    };

    createLoanMutation.mutate(loanApplication);
  };

  const goBack = () => {
    if (currentStep === 1) {
      setLocation("/dashboard");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const purposeOptions = [
    { value: "business", label: "Small Business Setup" },
    { value: "agriculture", label: "Agriculture/Farming" },
    { value: "education", label: "Education" },
    { value: "medical", label: "Medical Emergency" },
    { value: "housing", label: "Housing Improvement" },
    { value: "other", label: "Other" }
  ];

  const tenureOptions = [
    { value: "6", label: "6 Months" },
    { value: "12", label: "12 Months" },
    { value: "18", label: "18 Months" },
    { value: "24", label: "24 Months" }
  ];

  const calculateEMI = (amount: number, tenure: number) => {
    const rate = 0.12; // 12% annual interest
    const monthlyRate = rate / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  return (
    <div className="min-h-screen bg-background">
     <MainFrame>
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={goBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{t('loanApplication.title')}</h1>
          <p className="text-muted-foreground">{t('loanApplication.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className="ml-3">
                <div className={`text-sm font-semibold ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('loanApplication.step1')}
                </div>
              </div>
            </div>
            
            <div className={`flex-1 mx-4 h-1 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className="ml-3">
                <div className={`text-sm font-semibold ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('loanApplication.step2')}
                </div>
              </div>
            </div>
            
            <div className={`flex-1 mx-4 h-1 rounded ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <div className="ml-3">
                <div className={`text-sm font-semibold ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('loanApplication.step3')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={step1Form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.fullName')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={step1Form.control}
                        name="aadhaar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.aadhaar')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="XXXX XXXX XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={step1Form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.phone')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={step1Form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.email')}</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={step1Form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <FormLabel>{t('form.address')} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your complete address" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="btn-primary">
                      {t('form.next')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Loan Details */}
            {currentStep === 2 && (
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Loan Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={step2Form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.loanAmount')} *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="25000" 
                                type="number"
                                min="1000"
                                max="100000"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={step2Form.control}
                        name="tenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.loanTenure')} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tenure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tenureOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={step2Form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.loanPurpose')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purposeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={step2Form.control}
                      name="purposeDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.purposeDetails')} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed information about how you plan to use this loan..." 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={step2Form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.monthlyIncome')} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="15000" 
                              type="number"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* EMI Calculator Preview */}
                    {step2Form.watch('amount') && step2Form.watch('tenure') && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">EMI Calculation</h4>
                        <p className="text-blue-700 dark:text-blue-200 text-sm">
                          Estimated Monthly EMI: ₹{calculateEMI(
                            parseFloat(step2Form.watch('amount')) || 0, 
                            parseInt(step2Form.watch('tenure')) || 12
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('form.previous')}
                    </Button>
                    <Button type="submit" className="btn-primary">
                      {t('form.next')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && step1Data && step2Form.getValues() && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Review Your Application</h3>
                
                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Application Summary</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Applicant Name:</span>
                      <span className="ml-2 font-medium">{step1Data.fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loan Amount:</span>
                      <span className="ml-2 font-medium text-primary">₹{parseFloat(step2Form.getValues('amount')).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Purpose:</span>
                      <span className="ml-2 font-medium">{purposeOptions.find(p => p.value === step2Form.getValues('purpose'))?.label}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Repayment Period:</span>
                      <span className="ml-2 font-medium">{step2Form.getValues('tenure')} months</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly EMI:</span>
                      <span className="ml-2 font-medium">₹{calculateEMI(
                        parseFloat(step2Form.getValues('amount')), 
                        parseInt(step2Form.getValues('tenure'))
                      ).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-amber-400 mr-3 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Important Note</h5>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Your loan application will be reviewed by the group president and treasurer. You will receive updates via SMS and in-app notifications.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('form.previous')}
                  </Button>
                  <Button 
                    onClick={() => handleStep2Submit(step2Form.getValues())}
                    disabled={createLoanMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {createLoanMutation.isPending ? (
                      <div className="loading-spinner mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {t('form.submit')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
	  </MainFrame>
    </div>
  );
}
