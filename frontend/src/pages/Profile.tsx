/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  User,  
  Shield, 
  Activity, 
  KeyRound, 
  Link as LinkIcon,
  Mail, 
  Phone,
  Building,
  Pencil,
} from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  avatarUrl: string;
}

// Animation variants


const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const tabContentAnimation = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  exit: { 
    opacity: 0, 
    x: 10,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Reconciliation Inc.",
    avatarUrl: "/api/placeholder/150/150"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile>(profile);
  const [activeTab, setActiveTab] = useState("personal");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile({
      ...editableProfile,
      [name]: value
    });
  };
  
  const saveProfile = () => {
    setProfile(editableProfile);
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    setEditableProfile(profile);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 lg:p-8"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-bold mb-6"
      >
        Profile Settings
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Profile Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                  <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
              <CardDescription>Account Administrator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <motion.div variants={itemAnimation} className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-500" />
                  <span>{profile.email}</span>
                </motion.div>
                <motion.div variants={itemAnimation} className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-500" />
                  <span>{profile.phone}</span>
                </motion.div>
                <motion.div variants={itemAnimation} className="flex items-center gap-3">
                  <Building size={18} className="text-gray-500" />
                  <span>{profile.company}</span>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={itemAnimation}
                className="pt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setEditableProfile(profile);
                    setIsEditing(true);
                  }}
                >
                  <Pencil size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right content area - Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <motion.div layout>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsTrigger value="personal">
                  <User size={16} className="mr-2 hidden md:inline" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="roles">
                  <Shield size={16} className="mr-2 hidden md:inline" />
                  Roles
                </TabsTrigger>
                <TabsTrigger value="security">
                  <KeyRound size={16} className="mr-2 hidden md:inline" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="connected">
                  <LinkIcon size={16} className="mr-2 hidden md:inline" />
                  Connected
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity size={16} className="mr-2 hidden md:inline" />
                  Activity
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentAnimation}
              >
                {/* Personal Info Tab */}
                <TabsContent value="personal">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <motion.div 
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          <motion.div variants={itemAnimation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName" 
                                name="firstName"
                                value={editableProfile.firstName} 
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName" 
                                name="lastName"
                                value={editableProfile.lastName} 
                                onChange={handleInputChange}
                              />
                            </div>
                          </motion.div>
                          <motion.div variants={itemAnimation} className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              name="email"
                              type="email" 
                              value={editableProfile.email} 
                              onChange={handleInputChange}
                            />
                          </motion.div>
                          <motion.div variants={itemAnimation} className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              name="phone"
                              value={editableProfile.phone} 
                              onChange={handleInputChange}
                            />
                          </motion.div>
                          <motion.div variants={itemAnimation} className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input 
                              id="company" 
                              name="company"
                              value={editableProfile.company} 
                              onChange={handleInputChange}
                            />
                          </motion.div>
                          <motion.div 
                            variants={itemAnimation}
                            className="flex gap-2 pt-4"
                          >
                            <motion.button 
                              onClick={saveProfile}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="btn btn-primary"
                            >
                              Save Changes
                            </motion.button>
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button 
                                variant="outline" 
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          <motion.div variants={itemAnimation} className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500">First Name</div>
                              <div className="text-lg">{profile.firstName}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500">Last Name</div>
                              <div className="text-lg">{profile.lastName}</div>
                            </div>
                          </motion.div>
                          <motion.div variants={itemAnimation}>
                            <div className="text-sm font-medium text-gray-500">Email</div>
                            <div className="text-lg">{profile.email}</div>
                          </motion.div>
                          <motion.div variants={itemAnimation}>
                            <div className="text-sm font-medium text-gray-500">Phone Number</div>
                            <div className="text-lg">{profile.phone}</div>
                          </motion.div>
                          <motion.div variants={itemAnimation}>
                            <div className="text-sm font-medium text-gray-500">Company</div>
                            <div className="text-lg">{profile.company}</div>
                          </motion.div>
                          <motion.div 
                            variants={itemAnimation}
                            className="pt-4"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              onClick={() => {
                                setEditableProfile(profile);
                                setIsEditing(true);
                              }}
                            >
                              Edit Information
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Roles & Permissions Tab */}
                <TabsContent value="roles">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle>Roles & Permissions</CardTitle>
                      <CardDescription>Manage your account access and capabilities</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {[
                          {
                            title: "Administrator",
                            description: "Full system access including user management",
                            checked: true
                          },
                          {
                            title: "Reconciliation Manager",
                            description: "Create and manage all reconciliation tasks",
                            checked: true
                          },
                          {
                            title: "Report Access",
                            description: "Generate and export financial reports",
                            checked: true
                          },
                          {
                            title: "User Manager",
                            description: "Add and manage system users",
                            checked: false
                          }
                        ].map((role, _index) => (
                          <motion.div
                            key={role.title}
                            variants={itemAnimation}
                            className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="font-medium">{role.title}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                            <Switch checked={role.checked} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        <motion.div variants={itemAnimation}>
                          <h3 className="text-lg font-medium">Password</h3>
                          <p className="text-sm text-muted-foreground mb-4">Last changed 3 months ago</p>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-outline"
                          >
                            Change Password
                          </motion.button>
                        </motion.div>
                        
                        <motion.div variants={itemAnimation} className="pt-4">
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <div>Enable 2FA</div>
                            <Switch checked={false} />
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemAnimation} className="pt-4">
                          <h3 className="text-lg font-medium">Session Management</h3>
                          <p className="text-sm text-muted-foreground mb-4">Manage your active sessions</p>
                          <div className="space-y-2">
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow"
                            >
                              <div>
                                <div className="font-medium">Current Session</div>
                                <div className="text-sm text-muted-foreground">Chrome on Windows • IP: 192.168.1.1</div>
                              </div>
                              <div className="text-green-500 text-sm font-medium">Active</div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Connected Accounts Tab */}
                <TabsContent value="connected">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle>Connected Accounts</CardTitle>
                      <CardDescription>Manage your external account connections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {[
                          {
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            ),
                            title: "QuickBooks Online",
                            description: "Connected on Apr 15, 2025",
                            bgColor: "bg-blue-100",
                            action: "Disconnect"
                          },
                          {
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                              </svg>
                            ),
                            title: "Bank Connection",
                            description: "Connected on Apr 10, 2025",
                            bgColor: "bg-green-100",
                            action: "Disconnect"
                          },
                          {
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                            ),
                            title: "Connect New Service",
                            description: "Add accounting or banking service",
                            bgColor: "bg-gray-100",
                            action: "Connect",
                            isDashed: true
                          }
                        ].map((account, index) => (
                          <motion.div
                            key={index}
                            variants={itemAnimation}
                            whileHover={{ y: -2 }}
                            className={`flex items-center justify-between p-3 rounded-md ${account.isDashed ? "border-dashed" : ""} hover:shadow-sm transition-shadow`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`${account.bgColor} p-2 rounded-md`}>
                                {account.icon}
                              </div>
                              <div>
                                <div className="font-medium">{account.title}</div>
                                <div className="text-sm text-muted-foreground">{account.description}</div>
                              </div>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {account.action}
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle>Activity History</CardTitle>
                      <CardDescription>Review your recent account activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {[
                          {
                            icon: <Activity size={16} className="text-blue-600" />,
                            bgColor: "bg-blue-100",
                            title: "Login from new device",
                            time: "2 hours ago",
                            description: "Chrome on Windows • IP: 192.168.1.1"
                          },
                          {
                            icon: <Activity size={16} className="text-green-600" />,
                            bgColor: "bg-green-100",
                            title: "Bank connection updated",
                            time: "Yesterday",
                            description: "Synchronized 25 new transactions"
                          },
                          {
                            icon: <Activity size={16} className="text-yellow-600" />,
                            bgColor: "bg-yellow-100",
                            title: "Password changed",
                            time: "2 days ago",
                            description: "Through account settings"
                          },
                          {
                            icon: <Activity size={16} className="text-purple-600" />,
                            bgColor: "bg-purple-100",
                            title: "Reconciliation completed",
                            time: "4 days ago",
                            description: "April 2025 statements • 98% match rate"
                          }
                        ].map((activity, index) => (
                          <motion.div
                            key={index}
                            variants={itemAnimation}
                            className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                          >
                            <div className={`${activity.bgColor} p-2 rounded-full mt-1`}>
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}