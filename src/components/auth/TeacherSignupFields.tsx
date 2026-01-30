import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
  "Social Studies",
  "Other",
];

const GRADE_LEVELS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "University",
];

interface TeacherSignupFieldsProps {
  subject: string;
  setSubject: (value: string) => void;
  customSubject: string;
  setCustomSubject: (value: string) => void;
  gradeLevel: string;
  setGradeLevel: (value: string) => void;
  disabled?: boolean;
}

const TeacherSignupFields = ({
  subject,
  setSubject,
  customSubject,
  setCustomSubject,
  gradeLevel,
  setGradeLevel,
  disabled,
}: TeacherSignupFieldsProps) => {
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <p className="text-sm text-muted-foreground font-medium">Teacher Information</p>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject Teaching</Label>
        <Select value={subject} onValueChange={setSubject} disabled={disabled}>
          <SelectTrigger id="subject" className="bg-background">
            <SelectValue placeholder="Select your subject" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {SUBJECTS.map((subj) => (
              <SelectItem key={subj} value={subj}>
                {subj}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subject === "Other" && (
        <div className="space-y-2">
          <Label htmlFor="custom-subject">Specify Subject</Label>
          <Input
            id="custom-subject"
            type="text"
            placeholder="Enter your subject"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="grade-level">Grade Level</Label>
        <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={disabled}>
          <SelectTrigger id="grade-level" className="bg-background">
            <SelectValue placeholder="Select grade level" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {GRADE_LEVELS.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TeacherSignupFields;
