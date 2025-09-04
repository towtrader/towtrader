import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Calculator, User, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useUserAuth } from "@/hooks/useUserAuth";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/FullLogo_NoBuffer_1752952018278.jpg";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout: userLogout, isAuthenticated: userIsAuthenticated } = useUserAuth();
  const { dealer, logout: dealerLogout, isAuthenticated: dealerIsAuthenticated } = useAuth();

  const currentUser = dealer || user;
  const isLoggedIn = dealerIsAuthenticated || userIsAuthenticated;
  const handleLogout = dealer ? dealerLogout : userLogout;
  const userDisplayName = dealer 
    ? dealer.contactName || dealer.companyName 
    : user 
      ? `${user.firstName} ${user.lastName}`.trim() || user.email
      : '';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center py-1">
                <img 
                  src={logoImage} 
                  alt="TowTrader - Commercial Tow Truck Marketplace" 
                  className="h-14 w-auto"
                />
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/search" className="text-gray-700 hover:text-primary-blue px-3 py-2 text-sm font-medium">
                Buy
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-primary-blue px-3 py-2 text-sm font-medium">
                Sell
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-blue px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              <Link href="/finance-calculator" className="text-gray-700 hover:text-primary-blue px-3 py-2 text-sm font-medium flex items-center">
                <Calculator className="w-4 h-4 mr-1" />
                Finance
              </Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-blue px-3 py-2 text-sm font-medium flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/saved" className="text-gray-700 hover:text-primary-blue flex items-center">
                <Heart className="w-4 h-4" />
                <span className="ml-1">Saved</span>
              </Link>
              
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{userDisplayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {dealer && (
                      <DropdownMenuItem>
                        <Link href="/dealer/dashboard" className="flex items-center w-full">
                          <User className="w-4 h-4 mr-2" />
                          Dealer Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user && (
                      <DropdownMenuItem>
                        <Link href="/dashboard" className="flex items-center w-full">
                          <User className="w-4 h-4 mr-2" />
                          My Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/dealer/login">
                    <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">
                      Dealer Portal
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button className="bg-secondary-orange text-white hover:bg-orange-600">
                      Sign In/Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2" data-testid="button-mobile-menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-6">
                    {/* User Section */}
                    {isLoggedIn ? (
                      <div className="border-b pb-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <User className="w-8 h-8 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{userDisplayName}</p>
                            <p className="text-sm text-gray-500">{dealer ? 'Dealer' : 'Individual'}</p>
                          </div>
                        </div>
                        {dealer && (
                          <Link href="/dealer/dashboard" onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full mb-2">
                              Dealer Dashboard
                            </Button>
                          </Link>
                        )}
                        {user && (
                          <Link href="/dashboard" onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full mb-2">
                              My Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 border-b pb-4">
                        <Link href="/sign-in" onClick={closeMobileMenu}>
                          <Button className="w-full bg-secondary-orange text-white hover:bg-orange-600">
                            Sign In/Up
                          </Button>
                        </Link>
                        <Link href="/dealer/login" onClick={closeMobileMenu}>
                          <Button variant="outline" className="w-full border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">
                            Dealer Portal
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-2">
                      <Link href="/search" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <span className="font-medium text-gray-900">Buy</span>
                        </div>
                      </Link>
                      <Link href="/sell" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <span className="font-medium text-gray-900">Sell Your Truck</span>
                        </div>
                      </Link>
                      <Link href="/pricing" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <span className="font-medium text-gray-900">Pricing</span>
                        </div>
                      </Link>
                      <Link href="/finance-calculator" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <Calculator className="w-5 h-5" />
                          <span className="font-medium">Finance Calculator</span>
                        </div>
                      </Link>
                      <Link href="/help" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <HelpCircle className="w-5 h-5" />
                          <span className="font-medium">Help</span>
                        </div>
                      </Link>
                      <Link href="/saved" onClick={closeMobileMenu}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Saved Trucks</span>
                        </div>
                      </Link>
                    </div>

                    {/* User Account Section */}
                    <div className="border-t pt-4">
                      {isLoggedIn ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Signed in as</p>
                            <p className="font-medium">{userDisplayName}</p>
                          </div>
                          {dealer && (
                            <Link href="/dealer/dashboard" onClick={closeMobileMenu}>
                              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <User className="w-5 h-5" />
                                <span className="font-medium">Dealer Dashboard</span>
                              </div>
                            </Link>
                          )}
                          {user && (
                            <Link href="/dashboard" onClick={closeMobileMenu}>
                              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <User className="w-5 h-5" />
                                <span className="font-medium">My Dashboard</span>
                              </div>
                            </Link>
                          )}
                          <div 
                            onClick={() => {
                              handleLogout();
                              closeMobileMenu();
                            }}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer text-red-600"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 text-center">Sign in to access your dashboard</p>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
