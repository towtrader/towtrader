import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">TowTrader</h3>
            <p className="text-gray-400 text-sm">
              The leading marketplace for commercial tow trucks and recovery vehicles. 
              Connect buyers and sellers nationwide.
            </p>
            <div className="text-gray-400 text-sm">
              <p>Est. 2025</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/search" className="text-gray-400 hover:text-white block">
                Browse Trucks
              </Link>
              <Link href="/sell" className="text-gray-400 hover:text-white block">
                Sell Your Truck
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white block">
                Pricing Plans
              </Link>
              <Link href="/finance-calculator" className="text-gray-400 hover:text-white block">
                Finance Calculator
              </Link>
            </div>
          </div>

          {/* For Dealers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Dealers</h3>
            <div className="space-y-2 text-sm">
              <Link href="/dealer/login" className="text-gray-400 hover:text-white block">
                Dealer Portal
              </Link>
              <Link href="/dealer/signup" className="text-gray-400 hover:text-white block">
                Become a Dealer
              </Link>
              <a href="mailto:dealers@tow-trader.com" className="text-gray-400 hover:text-white block">
                Dealer Support
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              <a href="mailto:support@tow-trader.com" className="text-gray-400 hover:text-white block">
                Contact Support
              </a>
              <Link href="/help" className="text-gray-400 hover:text-white block">
                Help Center
              </Link>
              <a href="#" className="text-gray-400 hover:text-white block">
                Privacy Policy
              </a>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white block">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 TowTrader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}