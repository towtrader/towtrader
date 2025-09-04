import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Phone, Mail } from 'lucide-react';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactType: 'email' | 'phone';
  truckId?: number;
  trailerId?: number;
  dealerId: number;
  truckTitle?: string;
  trailerTitle?: string;
  truckPrice?: string;
  trailerPrice?: string;
  dealerEmail?: string;
  dealerPhone?: string;
}

export function ContactForm({ 
  open, 
  onOpenChange, 
  contactType, 
  truckId, 
  trailerId,
  dealerId, 
  truckTitle, 
  trailerTitle,
  truckPrice,
  trailerPrice,
  dealerEmail,
  dealerPhone 
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createInquiry } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine if this is a truck or trailer inquiry
      const isTrailer = !!trailerId;
      const endpoint = isTrailer ? '/api/trailers/contact-form' : '/api/trucks/contact-form';
      const title = isTrailer ? trailerTitle : truckTitle;
      const price = isTrailer ? trailerPrice : truckPrice;
      const id = isTrailer ? trailerId : truckId;
      
      // Submit contact form data to create a proper lead
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isTrailer ? { trailerId: id, trailerTitle: title, trailerPrice: price } : { truckId: id, truckTitle: title, truckPrice: price }),
          dealerId,
          contactType,
          ...formData,
        }),
      });

      if (response.ok) {
        const isTrailer = !!trailerId;
        const title = isTrailer ? trailerTitle : truckTitle;
        const price = isTrailer ? trailerPrice : truckPrice;
        const id = isTrailer ? trailerId : truckId;
        
        // Note: Inquiry is already created by the contact-form API endpoint

        toast({
          title: "Contact Information Sent",
          description: `Your ${contactType === 'email' ? 'email' : 'call request'} has been sent to the dealer.`,
        });

        // Handle the actual contact action
        if (contactType === 'email' && dealerEmail) {
          const subject = `Interest in ${title}`;
          const body = `Hello,\n\nI'm interested in your ${title} listed for $${price}.\n\n${formData.message}\n\nBest regards,\n${formData.firstName} ${formData.lastName}\n${formData.email}\n${formData.phone}`;
          const mailtoLink = `mailto:${dealerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoLink;
        } else if (contactType === 'phone' && dealerPhone) {
          window.location.href = `tel:${dealerPhone}`;
        }

        onOpenChange(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send contact information');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send contact information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {contactType === 'email' ? (
              <Mail className="h-5 w-5" />
            ) : (
              <Phone className="h-5 w-5" />
            )}
            <span>
              {contactType === 'email' ? 'Email' : 'Call'} Seller
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-900">{truckTitle}</h4>
          <p className="text-sm text-gray-600">${truckPrice}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder={`I'm interested in the ${truckTitle}. Please contact me with more details.`}
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Sending...' : `Send ${contactType === 'email' ? 'Email' : 'Call Request'}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}