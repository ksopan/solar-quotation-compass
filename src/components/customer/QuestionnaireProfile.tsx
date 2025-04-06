
import React, { useState, useEffect } from "react";
import { useQuestionnaire, QuestionnaireData } from "@/hooks/useQuestionnaire";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "./questionnaire/FileUploader";
import { FilesList } from "./questionnaire/FilesList";
import { Loader } from "lucide-react";

export const QuestionnaireProfile: React.FC = () => {
  const { 
    questionnaire, 
    loading, 
    isSaving,
    updateQuestionnaire, 
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl
  } = useQuestionnaire();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [files, setFiles] = useState<Array<{name: string, size: number, id?: string}>>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // Load files when questionnaire is loaded
  useEffect(() => {
    if (questionnaire) {
      loadFiles();
    }
  }, [questionnaire]);
  
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const attachments = await getAttachments();
      setFiles(attachments);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };
  
  const handleEdit = () => {
    setFormData(questionnaire || {});
    setIsEditing(true);
  };
  
  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : { [field]: value });
  };
  
  const handleSave = async () => {
    if (!formData) return;
    
    let success = false;
    
    if (questionnaire) {
      success = await updateQuestionnaire(formData);
    } else {
      // Create a new questionnaire if user doesn't have one
      const requiredFields = [
        'property_type', 'ownership_status', 'monthly_electric_bill',
        'interested_in_batteries', 'purchase_timeline', 'willing_to_remove_trees',
        'roof_age_status', 'first_name', 'last_name', 'email'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !formData[field as keyof QuestionnaireData]
      );
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const newQuestionnaire = await createQuestionnaire(formData as any);
      success = !!newQuestionnaire;
    }
    
    if (success) {
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setFormData(questionnaire || {});
    setIsEditing(false);
  };
  
  const handleFileUpload = async (file: File) => {
    const path = await uploadAttachment(file);
    if (path) {
      await loadFiles();
    }
  };
  
  const handleFileDelete = async (fileName: string) => {
    const success = await deleteAttachment(fileName);
    if (success) {
      await loadFiles();
    }
  };
  
  // Create a new empty questionnaire profile
  const handleCreateProfile = () => {
    setFormData({
      property_type: "home",
      ownership_status: "own",
      monthly_electric_bill: 170,
      interested_in_batteries: false,
      battery_reason: null,
      purchase_timeline: "within_year",
      willing_to_remove_trees: false,
      roof_age_status: "no",
      first_name: "",
      last_name: "",
      email: ""
    });
    setIsEditing(true);
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-8 w-8 animate-spin" />
            <p>Loading your profile information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!questionnaire && !isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Solar Profile</CardTitle>
          <CardDescription>You haven't created a solar profile yet</CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex justify-center">
          <Button onClick={handleCreateProfile}>Create Your Solar Profile</Button>
        </CardContent>
      </Card>
    );
  }
  
  const data = isEditing ? formData : questionnaire;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Solar Profile</CardTitle>
            <CardDescription>Details about your solar requirements</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit}>Edit Profile</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Property Type</Label>
              {isEditing ? (
                <Select 
                  value={data?.property_type} 
                  onValueChange={(value) => handleChange("property_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 text-lg">
                  {data?.property_type === "home" ? "Home" : 
                   data?.property_type === "business" ? "Business" : 
                   data?.property_type === "nonprofit" ? "Nonprofit" : ""}
                </div>
              )}
            </div>
            
            <div>
              <Label>Ownership Status</Label>
              {isEditing ? (
                <Select 
                  value={data?.ownership_status} 
                  onValueChange={(value) => handleChange("ownership_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">I own</SelectItem>
                    <SelectItem value="rent">I rent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 text-lg">
                  {data?.ownership_status === "own" ? "I own" : "I rent"}
                </div>
              )}
            </div>
            
            <div>
              <Label>Monthly Electric Bill</Label>
              {isEditing ? (
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${data?.monthly_electric_bill}</span>
                  </div>
                  <Slider 
                    value={[data?.monthly_electric_bill || 170]} 
                    min={50} 
                    max={1200} 
                    step={10}
                    onValueChange={(values) => handleChange("monthly_electric_bill", values[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$50</span>
                    <span>$1200</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-lg">${data?.monthly_electric_bill}</div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Interested in Batteries</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    checked={data?.interested_in_batteries} 
                    onCheckedChange={(checked) => handleChange("interested_in_batteries", checked)}
                  />
                  <span>{data?.interested_in_batteries ? "Yes" : "No"}</span>
                </div>
              ) : (
                <div className="mt-1 text-lg">
                  {data?.interested_in_batteries ? "Yes" : "No"}
                </div>
              )}
            </div>
            
            {data?.interested_in_batteries && (
              <div>
                <Label>Battery Reason</Label>
                {isEditing ? (
                  <Select 
                    value={data?.battery_reason || ""} 
                    onValueChange={(value) => handleChange("battery_reason", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backup_power">Back up power</SelectItem>
                      <SelectItem value="maximize_savings">Maximize savings</SelectItem>
                      <SelectItem value="self_supply">Self supply</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 text-lg">
                    {data?.battery_reason === "backup_power" ? "Back up power" : 
                     data?.battery_reason === "maximize_savings" ? "Maximize savings" : 
                     data?.battery_reason === "self_supply" ? "Self supply" : "Not specified"}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label>Purchase Timeline</Label>
              {isEditing ? (
                <Select 
                  value={data?.purchase_timeline} 
                  onValueChange={(value) => handleChange("purchase_timeline", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="within_months">Within the next few months</SelectItem>
                    <SelectItem value="within_year">Within the next year</SelectItem>
                    <SelectItem value="not_sure">I'm not sure</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 text-lg">
                  {data?.purchase_timeline === "within_months" ? "Within the next few months" : 
                   data?.purchase_timeline === "within_year" ? "Within the next year" : 
                   data?.purchase_timeline === "not_sure" ? "I'm not sure" : ""}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Remove Trees for Solar</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  checked={data?.willing_to_remove_trees} 
                  onCheckedChange={(checked) => handleChange("willing_to_remove_trees", checked)}
                />
                <span>{data?.willing_to_remove_trees ? "Yes" : "No"}</span>
              </div>
            ) : (
              <div className="mt-1 text-lg">
                {data?.willing_to_remove_trees ? "Yes" : "No"}
              </div>
            )}
          </div>
          
          <div>
            <Label>Roof Age Status</Label>
            {isEditing ? (
              <Select 
                value={data?.roof_age_status} 
                onValueChange={(value) => handleChange("roof_age_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select roof age status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, more than 20 years old</SelectItem>
                  <SelectItem value="no">No, less than 20 years old</SelectItem>
                  <SelectItem value="replace">Yes, but I plan to replace it</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 text-lg">
                {data?.roof_age_status === "yes" ? "More than 20 years old" : 
                 data?.roof_age_status === "no" ? "Less than 20 years old" : 
                 data?.roof_age_status === "replace" ? "More than 20 years old, but planning to replace" : ""}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              {isEditing ? (
                <Input 
                  value={data?.first_name || ""} 
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              ) : (
                <div className="mt-1 text-lg">{data?.first_name}</div>
              )}
            </div>
            
            <div>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input 
                  value={data?.last_name || ""} 
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
              ) : (
                <div className="mt-1 text-lg">{data?.last_name}</div>
              )}
            </div>
          </div>
          
          <div>
            <Label>Email</Label>
            {isEditing ? (
              <Input 
                type="email"
                value={data?.email || ""} 
                onChange={(e) => handleChange("email", e.target.value)}
              />
            ) : (
              <div className="mt-1 text-lg">{data?.email}</div>
            )}
          </div>
        </div>
        
        {questionnaire && (
          <div className="pt-4">
            <Label>Property Documents & Photos</Label>
            <div className="mt-2">
              <FileUploader onUpload={handleFileUpload} />
              {isLoadingFiles ? (
                <div className="flex items-center justify-center h-20">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <FilesList 
                  files={files} 
                  onDelete={handleFileDelete} 
                  getFileUrl={getFileUrl} 
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {isEditing && (
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
