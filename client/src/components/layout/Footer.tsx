
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">SHG Platform</span>
            </div>
            <p className="text-muted-foreground">
              Empowering rural communities through digital savings management,
              transparent governance, and sustainable development.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 cursor-pointer" />
              <Twitter className="h-5 w-5 cursor-pointer" />
              <Instagram className="h-5 w-5 cursor-pointer" />
              <Linkedin className="h-5 w-5 cursor-pointer" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/features">Features</a></li>
              <li><a href="/login">Dashboard</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/pricing">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Training Videos</a></li>
              <li><a href="#">Community Forum</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@shgplatform.org
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                New Delhi, India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 SHG Digital Platform. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}