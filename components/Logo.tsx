import { Link } from "wouter";
import logoImage from "@assets/FullLogo_NoBuffer_1752952018278.jpg";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <img 
        src={logoImage} 
        alt="TowTrader - Commercial Tow Truck Marketplace" 
        className="h-12 w-auto"
      />
    </Link>
  );
}