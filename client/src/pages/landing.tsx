import React from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";
import {
  Coins,
  Users,
  FileText,
  BarChart3,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      document.getElementById("login-trigger")?.click();
    }
  };

  const features = [
    {
      icon: Coins,
      title: t('features.savings.title'),
      description: t('features.savings.description'),
      gradient: "from-emerald-400 to-emerald-600"
    },
    {
      icon: FileText,
      title: t('features.loans.title'),
      description: t('features.loans.description'),
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: Users,
      title: t('features.groups.title'),
      description: t('features.groups.description'),
      gradient: "from-purple-400 to-purple-600"
    },
    {
      icon: BarChart3,
      title: t('features.sdg.title'),
      description: t('features.sdg.description'),
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: BarChart3,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
      gradient: "from-amber-400 to-amber-600"
    },
    {
      icon: Globe,
      title: t('features.multilingual.title'),
      description: t('features.multilingual.description'),
      gradient: "from-rose-400 to-rose-600"
    }
  ];

  const stats = [
    { value: "50K+", label: t('stats.members') },
    { value: "₹100Cr+", label: t('stats.savings') },
    { value: "2000+", label: t('stats.groups') },
    { value: "98%", label: t('stats.repayment') }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "SHG President, Rajasthan",
      image: "👩‍🌾",
      quote: "SHG Digital Platform has transformed our group management. We can now track every rupee, ensure transparency, and our loan processing is 10x faster. The SDG tracking helps us show our impact to donors.",
      rating: 5
    },
    {
      name: "Meera Devi",
      role: "Group Treasurer, Bihar",
      image: "👩‍🏫",
      quote: "The mobile app works perfectly even with our slow internet. We can manage savings offline and sync when connected. Our members love the transparency and can check their savings anytime.",
      rating: 5
    },
    {
      name: "Sunita Singh",
      role: "Member, Uttar Pradesh",
      image: "👩‍⚕️",
      quote: "Getting loans is now so simple! The voting system helps our group make democratic decisions. I started my small business with a loan processed through this platform in just 3 days.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg py-20 lg:py-32">
        <div className="container relative z-10 px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            <div className="text-white space-y-8 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-xl opacity-90 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  {t('hero.getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300">
                  {t('hero.learnMore')}
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img src="/assets/images/shg1.jpg" alt="SHG Visual" className="w-full h-auto rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">{t('features.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card bg-card p-8 rounded-2xl shadow-lg border">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from SHG members across India who have transformed their lives using our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Hidden trigger for login modal */}
      <button id="login-trigger" className="hidden"></button>
    </div>
  );
}