
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Camera, Save, X } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const router = useRouter();

  // Local state to track form changes
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) return <div>Please log in</div>;

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: `${firstName} ${lastName}`.trim(),
      email,
    };

    setUser(updatedUser);

    // 2️⃣ Send update to API
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!res.ok) {
      console.error("Failed to update user");
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex flex-col font-sans bg-background min-h-screen">
      <main className="flex flex-1">
        <div className="flex-1 p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-2xl">
                        {getUserInitials(user.name || "User")}
                      </div>
                    )}
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    Upload New Picture
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary">Reset</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
