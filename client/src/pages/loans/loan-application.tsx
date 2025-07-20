import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { MultiStepForm } from '@/components/forms/multi-step-form';
import { ArrowLeft, ArrowRight, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  aadhaar: z.string().min(12, 'Valid Aadhaar number is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().min(10, 'Complete address is required'),
});

const loanDetailsSchema = z.object({
  amount: z.number().min(1000, 'Minimum loan amount is ₹1,000').max(100000, 'Maximum loan amount is ₹1,00,000'),
  tenure: z.number().min(3, 'Minimum tenure is 3 months').max(24, 'Maximum tenure is 24 months'),
  purpose: z.string().min(1, 'Loan purpose is required'),
  purposeDescription: z.string().min(20, 'Please provide detailed description (minimum 20 characters)'),
  monthlyIncome: z.number().min(1000, 'Monthly income is required'),
});

const fullSchema = personalInfoSchema.merge(loanDetailsSchema);

type FormData = z.infer<typeof fullSchema>;

const steps = [
  {
    title: 'Personal Details',
    description: 'Basic information about the applicant',
    fields: ['fullName', 'aadhaar', 'phone', 'email', 'address']
  },
  {
    title: 'Loan Details',
    description: 'Loan amount and purpose information',
    fields: ['amount', 'tenure', 'purpose', 'purposeDescription', 'monthlyIncome']
  },
  {
    title: 'Review & Submit',
    description: 'Review your application before submission',
    fields: []
  }
];

const loanPurposes = [
  { value: 'business', label: 'Small Business Setup' },
  { value: 'agriculture', label: 'Agriculture/Farming' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'housing', label: 'Housing Improvement' },
  { value: 'other', label: 'Other' },
];

const tenureOptions = [
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months' },
  { value: 18, label: '18 Months' },
  { value: 24, label: '24 Months' },
];

export default function LoanApplication() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      aadhaar: '',
      phone: '',
      email: '',
      address: '',
      amount: 0,
      tenure: 12,
      purpose: '',
      purposeDescription: '',
      monthlyIncome: 0,
    },
  });

  const submitLoanMutation = useMutation({
    mutationFn: (data: FormData) => api.createLoanApplication({
      memberId: 1, // In real app, get from user context
      groupId: 1, // In real app, get from user context
      amount: data.amount.toString(),
      purpose: data.purpose,
      purposeDescription: data.purposeDescription,
      tenure: data.tenure,
      monthlyIncome: data.monthlyIncome.toString(),
    }),
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully and is under review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-applications'] });
      setLocation('/dashboard/member');
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateCurrentStep = async () => {
    const currentStepFields = steps[currentStep].fields;
    if (currentStepFields.length === 0) return true; // Review step
    
    const result = await form.trigger(currentStepFields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    submitLoanMutation.mutate(data);
  };

  const calculateEMI = (amount: number, tenure: number) => {
    const interestRate = 0.12; // 12% annual interest
    const monthlyRate = interestRate / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const watchedValues = form.watch();
  const monthlyEMI = calculateEMI(watchedValues.amount || 0, watchedValues.tenure || 12);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('loanApplication.title')}</h1>
          <p className="text-muted-foreground">{t('loanApplication.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center space-x-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-medium ${
                      index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={((currentStep) / (steps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.address')} *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your complete address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Loan Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.loanAmount')} *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25000" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.loanTenure')} *</FormLabel>
                            <Select value={field.value.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tenure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tenureOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
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
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.loanPurpose')} *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loanPurposes.map((purpose) => (
                                <SelectItem key={purpose.value} value={purpose.value}>
                                  {purpose.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purposeDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.purposeDetails')} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed information about how you plan to use this loan..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.monthlyIncome')} *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* EMI Calculator */}
                    {watchedValues.amount > 0 && watchedValues.tenure > 0 && (
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Loan Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Loan Amount:</span>
                              <span className="ml-2 font-semibold">₹{watchedValues.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tenure:</span>
                              <span className="ml-2 font-semibold">{watchedValues.tenure} months</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Interest Rate:</span>
                              <span className="ml-2 font-semibold">12% per annum</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly EMI:</span>
                              <span className="ml-2 font-semibold text-primary">₹{monthlyEMI.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">{t('form.reviewTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-sm text-muted-foreground">Applicant Name:</span>
                            <div className="font-semibold">{watchedValues.fullName}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Loan Amount:</span>
                            <div className="font-semibold">₹{watchedValues.amount?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Purpose:</span>
                            <div className="font-semibold">
                              {loanPurposes.find(p => p.value === watchedValues.purpose)?.label}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Tenure:</span>
                            <div className="font-semibold">{watchedValues.tenure} months</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Monthly EMI:</span>
                            <div className="font-semibold text-primary">₹{monthlyEMI.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Monthly Income:</span>
                            <div className="font-semibold">₹{watchedValues.monthlyIncome?.toLocaleString()}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Note</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              Your loan application will be reviewed by the group president and treasurer. 
                              You will receive updates via notifications and can track the status in your dashboard.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('form.previous')}
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                      {t('form.next')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="gradient-bg"
                      disabled={submitLoanMutation.isPending}
                    >
                      {submitLoanMutation.isPending ? (
                        <>
                          <FileText className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          {t('form.submit')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
