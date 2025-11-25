import { ArrowLeft, Calendar, TrendingUp, Award, Download, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ParentPortfolio = () => {
  const navigate = useNavigate();

  const timeline = [
    { 
      date: "December 2024", 
      title: "Paragraph Writing: My Weekend", 
      score: 88, 
      subject: "ELA",
      growth: "+5 points",
      highlight: "Excellent descriptive vocabulary"
    },
    { 
      date: "December 2024", 
      title: "Fraction Word Problems", 
      score: 92, 
      subject: "Math",
      growth: "+8 points",
      highlight: "Showed all work clearly"
    },
    { 
      date: "November 2024", 
      title: "Plant Life Cycle Diagram", 
      score: 95, 
      subject: "Science",
      growth: "+12 points",
      highlight: "Great CER reasoning"
    },
    { 
      date: "November 2024", 
      title: "Creative Story Writing", 
      score: 83, 
      subject: "ELA",
      growth: "Baseline",
      highlight: "Good sentence structure"
    },
  ];

  const badges = [
    { icon: "🏆", name: "Writing Master", desc: "10 ELA assignments completed" },
    { icon: "📚", name: "Bookworm", desc: "Read 15 books this quarter" },
    { icon: "🔬", name: "Science Explorer", desc: "Perfect score in Science CER" },
    { icon: "🎯", name: "Perfect Attendance", desc: "No missed assignments" },
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/parent')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Emma's Portfolio</h1>
              <p className="text-sm text-muted-foreground">5th Grade • Progress Timeline</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Portfolio
          </Button>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Writing Fluency</h3>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-4xl font-bold text-success mb-1">+23%</p>
            <p className="text-xs text-muted-foreground">Since September</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{width: '78%'}}></div>
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Math Problem Solving</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-4xl font-bold text-primary mb-1">+18%</p>
            <p className="text-xs text-muted-foreground">Since September</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{width: '85%'}}></div>
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Reading Comprehension</h3>
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <p className="text-4xl font-bold text-accent-foreground mb-1">+15%</p>
            <p className="text-xs text-muted-foreground">Since September</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{width: '82%'}}></div>
            </div>
          </Card>
        </div>

        {/* Celebration Badges */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-warning/5 to-success/5 border-warning/20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-warning-foreground" />
            Celebration Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <Card key={index} className="p-4 text-center bg-card hover:shadow-paper transition-all cursor-pointer">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Work Timeline */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Work Timeline
          </h2>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-success' : 'bg-primary'}`}></div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border my-1"></div>
                  )}
                </div>

                {/* Content */}
                <Card className="flex-1 p-4 hover:shadow-paper transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">{item.subject}</Badge>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success text-success-foreground mb-1">{item.score}%</Badge>
                      <p className="text-xs text-success font-semibold">{item.growth}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning-foreground" />
                    {item.highlight}
                  </p>

                  {/* Sample Work Preview */}
                  <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="lined-paper bg-white p-3 rounded">
                      <p className="font-handwriting text-xs leading-5 opacity-70">
                        {index === 0 && "Once upon a time, there was a curious student named Emma..."}
                        {index === 1 && "To solve 3/4 + 1/2, first I found a common denominator..."}
                        {index === 2 && "The plant life cycle begins with a seed..."}
                        {index === 3 && "On a bright sunny day, I discovered a mysterious box..."}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentPortfolio;
