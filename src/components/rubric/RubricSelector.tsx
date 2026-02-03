import { useState, useEffect } from "react";
import { Check, Plus, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseRubricToRubric, type Rubric } from "./RubricTypes";

interface RubricSelectorProps {
  classId: string;
  selectedRubricId?: string | null;
  onSelect: (rubric: Rubric) => void;
  onCreateNew: () => void;
}

const RubricSelector = ({ 
  classId, 
  selectedRubricId, 
  onSelect, 
  onCreateNew 
}: RubricSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRubrics();
    }
  }, [isOpen, classId]);

  useEffect(() => {
    if (selectedRubricId) {
      fetchSelectedRubric();
    }
  }, [selectedRubricId]);

  const fetchRubrics = async () => {
    setIsLoading(true);
    try {
      // Fetch rubrics for this class (including templates)
      const { data: rubricData, error: rubricError } = await supabase
        .from("rubrics")
        .select("*")
        .or(`class_id.eq.${classId},is_template.eq.true`)
        .order("created_at", { ascending: false });

      if (rubricError) throw rubricError;

      // Fetch categories for each rubric
      const rubricsWithCategories = await Promise.all(
        (rubricData || []).map(async (rubric) => {
          const { data: categories } = await supabase
            .from("rubric_categories")
            .select("*")
            .eq("rubric_id", rubric.id)
            .order("sort_order");

          return mapDatabaseRubricToRubric(rubric, categories || []);
        })
      );

      setRubrics(rubricsWithCategories);
    } catch (error) {
      console.error("Error fetching rubrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSelectedRubric = async () => {
    if (!selectedRubricId) return;

    try {
      const { data: rubric } = await supabase
        .from("rubrics")
        .select("*")
        .eq("id", selectedRubricId)
        .single();

      if (rubric) {
        const { data: categories } = await supabase
          .from("rubric_categories")
          .select("*")
          .eq("rubric_id", rubric.id)
          .order("sort_order");

        setSelectedRubric(mapDatabaseRubricToRubric(rubric, categories || []));
      }
    } catch (error) {
      console.error("Error fetching selected rubric:", error);
    }
  };

  const handleSelect = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    onSelect(rubric);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start h-auto py-3">
            <FileText className="w-4 h-4 mr-2 shrink-0" />
            <div className="text-left flex-1">
              {selectedRubric ? (
                <div>
                  <p className="font-medium">{selectedRubric.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRubric.criteria.length} criteria • {selectedRubric.totalPoints} points
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Select or create a rubric</p>
              )}
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select a Rubric</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Button onClick={() => { setIsOpen(false); onCreateNew(); }} variant="outline" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Create New Rubric
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : rubrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No rubrics yet</p>
                <p className="text-sm">Create your first rubric to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rubrics.map((rubric) => (
                  <Card
                    key={rubric.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRubricId === rubric.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleSelect(rubric)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rubric.name}</h4>
                            {rubric.isTemplate && (
                              <Badge variant="secondary" className="text-xs">Template</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rubric.criteria.map((c) => (
                              <Badge key={c.id} variant="outline" className="text-xs">
                                {c.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rubric.totalPoints} pts</Badge>
                          {selectedRubricId === rubric.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Preview of selected rubric */}
      {selectedRubric && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex flex-wrap gap-1">
            {selectedRubric.criteria.map((c) => (
              <Badge key={c.id} variant="secondary" className="text-xs">
                {c.name} ({c.maxScore}pts)
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricSelector;
