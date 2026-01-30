import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Users, Heart } from "lucide-react";

export type SignupRole = "student" | "teacher" | "parent";

interface RoleSelectorProps {
  role: SignupRole;
  setRole: (value: SignupRole) => void;
  disabled?: boolean;
}

const ROLES = [
  { value: "student" as SignupRole, label: "Student", icon: GraduationCap },
  { value: "teacher" as SignupRole, label: "Teacher", icon: Users },
  { value: "parent" as SignupRole, label: "Parent", icon: Heart },
];

const RoleSelector = ({ role, setRole, disabled }: RoleSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">I am a</Label>
      <Select value={role} onValueChange={(v) => setRole(v as SignupRole)} disabled={disabled}>
        <SelectTrigger id="role" className="bg-background">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <div className="flex items-center gap-2">
                <r.icon className="w-4 h-4" />
                <span>{r.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;
