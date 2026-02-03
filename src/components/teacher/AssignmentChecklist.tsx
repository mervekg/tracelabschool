import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  label: string;
  passed: boolean;
  required: boolean;
}

interface AssignmentChecklistProps {
  title: string;
  description: string;
  dueDate: string;
  assignmentType: string;
  externalLink: string;
  pdfFile: File | null;
  includeRubric: boolean;
  rubricCreated: boolean;
}

const AssignmentChecklist = ({
  title,
  description,
  dueDate,
  assignmentType,
  externalLink,
  pdfFile,
  includeRubric,
  rubricCreated,
}: AssignmentChecklistProps) => {
  const checklistItems: ChecklistItem[] = [
    {
      label: "Assignment title added",
      passed: title.trim().length > 0,
      required: true,
    },
    {
      label: "Instructions or description provided",
      passed: description.trim().length > 0,
      required: false,
    },
    {
      label: "Due date set",
      passed: dueDate.length > 0,
      required: false,
    },
    ...(assignmentType === "link"
      ? [
          {
            label: "External link added",
            passed: externalLink.trim().length > 0,
            required: false,
          },
        ]
      : []),
    ...(assignmentType === "standard"
      ? [
          {
            label: "PDF worksheet uploaded",
            passed: pdfFile !== null,
            required: false,
          },
        ]
      : []),
    ...(includeRubric
      ? [
          {
            label: "Rubric created",
            passed: rubricCreated,
            required: true,
          },
        ]
      : []),
  ];

  const requiredPassed = checklistItems
    .filter((item) => item.required)
    .every((item) => item.passed);

  const allPassed = checklistItems.every((item) => item.passed);
  const passedCount = checklistItems.filter((item) => item.passed).length;

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Pre-Publish Checklist ({passedCount}/{checklistItems.length})
        </span>
        {allPassed && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ Ready to create
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {checklistItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-sm py-1 px-2 rounded",
              item.passed
                ? "text-muted-foreground"
                : item.required
                ? "text-destructive bg-destructive/5"
                : "text-muted-foreground"
            )}
          >
            {item.passed ? (
              <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <X
                className={cn(
                  "w-3.5 h-3.5 flex-shrink-0",
                  item.required ? "text-destructive" : "text-muted-foreground/50"
                )}
              />
            )}
            <span className={cn(item.passed && "line-through opacity-60")}>
              {item.label}
            </span>
            {item.required && !item.passed && (
              <span className="text-xs text-destructive">(required)</span>
            )}
          </div>
        ))}
      </div>

      {!requiredPassed && (
        <p className="text-xs text-destructive mt-2">
          Complete required items before creating
        </p>
      )}
    </div>
  );
};

export default AssignmentChecklist;
