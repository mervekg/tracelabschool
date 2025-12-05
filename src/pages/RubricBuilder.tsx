import { ArrowLeft, Plus, Save, Trash2, Copy, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const RubricBuilder = () => {
  const navigate = useNavigate();
  const [rubricName, setRubricName] = useState("ELA Paragraph Writing Rubric");
  const [categories, setCategories] = useState([
    { name: "Content & Ideas", maxScore: 25, description: "Clear main idea with supporting details" },
    { name: "Organization", maxScore: 25, description: "Logical flow and paragraph structure" },
    { name: "Mechanics", maxScore: 25, description: "Grammar, punctuation, capitalization" },
    { name: "Word Choice", maxScore: 25, description: "Descriptive and appropriate vocabulary" },
  ]);

  const handleSave = () => {
    toast.success("Rubric saved successfully!");
    setTimeout(() => navigate('/teacher'), 1000);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "New Category", maxScore: 10, description: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const presetRubrics = [
    { name: "ELA Paragraph", icon: "📝", categories: 4 },
    { name: "Math Multi-Step", icon: "🔢", categories: 5 },
    { name: "Science CER", icon: "🔬", categories: 3 },
    { name: "Creative Writing", icon: "✍️", categories: 6 },
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Rubric Builder</h1>
              <p className="text-sm text-muted-foreground">Create custom rubrics for your assignments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80">
              <Save className="w-4 h-4 mr-2" />
              Save & Use
            </Button>
          </div>
        </div>

        {/* Preset Templates */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Quick Start Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presetRubrics.map((preset, index) => (
              <Card 
                key={index}
                className="p-4 text-center cursor-pointer hover:shadow-paper transition-all border-2 hover:border-primary"
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <p className="font-semibold text-sm mb-1">{preset.name}</p>
                <Badge variant="outline" className="text-xs">{preset.categories} categories</Badge>
              </Card>
            ))}
          </div>
        </Card>

        {/* Rubric Name */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Rubric Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Rubric Name</label>
              <Input 
                value={rubricName}
                onChange={(e) => setRubricName(e.target.value)}
                placeholder="Enter rubric name..."
                className="text-lg font-semibold"
              />
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rubric Categories</h2>
            <Button onClick={addCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div className="space-y-4">
            {categories.map((category, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Category Name</label>
                        <Input 
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].name = e.target.value;
                            setCategories(newCategories);
                          }}
                          placeholder="e.g., Content & Ideas"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Points</label>
                        <Input 
                          type="number"
                          value={category.maxScore}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].maxScore = parseInt(e.target.value) || 0;
                            setCategories(newCategories);
                          }}
                          placeholder="25"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                      <Textarea
                        value={category.description}
                        onChange={(e) => {
                          const newCategories = [...categories];
                          newCategories[index].description = e.target.value;
                          setCategories(newCategories);
                        }}
                        placeholder="Describe what this category measures..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-accent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-destructive/10"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Total Score */}
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-primary">Total Points</p>
              <p className="text-2xl font-bold text-primary">
                {categories.reduce((sum, cat) => sum + cat.maxScore, 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* AI Alignment Settings */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-foreground" />
            AI Alignment Settings
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Learnion AI will automatically analyze student work based on your rubric categories and provide 
            initial scoring suggestions. You can always override these suggestions.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure AI Weighting
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RubricBuilder;
