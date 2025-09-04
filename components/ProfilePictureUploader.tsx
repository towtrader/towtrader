import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploaderProps {
  userType: "dealer" | "user";
  userEmail?: string; // Required for individual users
  onUploadComplete?: (profilePictureUrl: string) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Simplified profile picture uploader component for dealers and individual users.
 * 
 * Features:
 * - Handles both dealer and individual user profile pictures
 * - Basic file upload functionality
 * - Updates database after successful upload
 * - Provides visual feedback via toast notifications
 */
export function ProfilePictureUploader({
  userType,
  userEmail,
  onUploadComplete,
  className = "",
  children,
}: ProfilePictureUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/profile-picture/upload-url");
      const { uploadURL } = await uploadResponse.json();

      // Upload file directly to cloud storage
      const fileUploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!fileUploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Update profile picture in database based on user type
      let endpoint, body;
      if (userType === "dealer") {
        endpoint = "/api/dealers/profile-picture";
        body = { profilePictureURL: uploadURL.split('?')[0] }; // Remove query parameters
      } else {
        if (!userEmail) {
          throw new Error("User email is required for individual users");
        }
        endpoint = "/api/users/profile-picture";
        body = { profilePictureURL: uploadURL.split('?')[0], userEmail };
      }

      const response = await apiRequest("PUT", endpoint, body);
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

      // Notify parent component
      if (onUploadComplete && data.profilePicturePath) {
        onUploadComplete(data.profilePicturePath);
      }

    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`profile-upload-${userType}`}
        disabled={isUploading}
      />
      <label htmlFor={`profile-upload-${userType}`}>
        <Button
          type="button"
          disabled={isUploading}
          className={className}
          asChild
        >
          <span className="cursor-pointer">
            {children || (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Update Profile Picture"}</span>
              </div>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}