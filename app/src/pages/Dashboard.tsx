import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Upload, Clock, CheckCircle, AlertCircle, TrendingUp, LogOut, Bell, Settings, Plus, Loader2, ChevronRight
} from 'lucide-react';
import { AnimatedMenuLink } from '@/components/ui/menu-hover-effects';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Submission {
  id: string;
  manuscript_title: string;
  journal: string;
  status: string;
  created_at: string;
}

const notifications = [
  {
    id: 1,
    message: 'Welcome to your Cornerstone dashboard!',
    time: 'Just now',
    type: 'success',
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Stats calculations based on fetched submissions
  const totalSubmissions = submissions.length;
  const completedCount = submissions.filter(s => s.status?.toLowerCase().includes('complete') || s.status?.toLowerCase().includes('accept')).length;
  const inProgressCount = totalSubmissions - completedCount;

  const stats = [
    { label: 'Total Submissions', value: totalSubmissions.toString(), icon: FileText, change: 'All time' },
    { label: 'In Progress', value: inProgressCount.toString(), icon: Clock, change: 'Pending review' },
    { label: 'Completed', value: completedCount.toString(), icon: CheckCircle, change: 'Published/Accepted' },
    { label: 'Journal Articles', value: totalSubmissions.toString(), icon: TrendingUp, change: 'Total Manuscripts' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user's real submissions from Supabase
    const fetchSubmissions = async () => {
      if (!user?.email) return;
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('id, manuscript_title, journal, status, created_at')
          .eq('author_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (err: any) {
        console.error('Error fetching submissions:', err);
        toast.error('Failed to load your submissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s.includes('complete') || s.includes('accept'))
      return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">Completed</Badge>;
    if (s.includes('progress') || s.includes('review'))
      return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">In Progress</Badge>;
    if (s.includes('reject'))
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
    return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">Pending</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s.includes('complete') || s.includes('accept')) return <CheckCircle className="w-5 h-5 text-pink-500" />;
    if (s.includes('progress') || s.includes('review')) return <Clock className="w-5 h-5 text-pink-500" />;
    if (s.includes('reject')) return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-pink-500" />;
  };

  const calculateProgress = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('complete') || s.includes('accept')) return 100;
    if (s.includes('progress') || s.includes('review')) return 50;
    if (s.includes('reject')) return 100;
    return 20; // pending
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600 mb-4" />
        <p className="text-gray-500 font-medium tracking-wide">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Cornerstone" className="w-10 h-10 object-contain rounded flex-shrink-0" />
              <span className="text-sm font-bold text-gray-900 leading-tight text-left hidden sm:block">
                Cornerstone Research<br />
                <span className="text-xs font-semibold text-[#FFB7C5]">Service and Publications</span>
              </span>
            </button>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-[#d63384]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#d63384] font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <AnimatedMenuLink onClick={() => navigate(-1 as never)} text="← Back" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your research publications.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-[#d63384] mt-1">{stat.change}</p>
                  </div>
                  <div className="w-10 h-10 bg-[#d63384]/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[#d63384]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-[#d63384] hover:bg-[#b5165a] text-white" onClick={() => navigate('/submit')}>
            <Plus className="w-4 h-4 mr-2" />
            New Submission
          </Button>
          <Button variant="outline" className="border-gray-300" onClick={() => window.open('/journal', '_blank')}>
            <FileText className="w-4 h-4 mr-2" />
            View Journal
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="journal">Journal Status</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-b-xl border border-dashed border-gray-200 m-4">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
                      <p className="text-gray-500 mt-1 mb-4">You haven't submitted any manuscripts for review.</p>
                      <Button onClick={() => navigate('/submit')} className="bg-[#d63384] hover:bg-[#b5165a]">
                        Submit Your First Manuscript
                      </Button>
                    </div>
                  ) : submissions.map((submission) => (
                    <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#d63384]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#d63384]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{submission.manuscript_title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{submission.journal}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Submitted: {new Date(submission.created_at).toLocaleDateString()}</span>
                            </div>
                            {submission.status === 'in_progress' && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="text-[#d63384]">{calculateProgress(submission.status)}%</span>
                                </div>
                                <Progress value={calculateProgress(submission.status)} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(submission.status)}
                          {getStatusBadge(submission.status)}
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.type === 'success' ? 'bg-pink-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                            'bg-pink-500'
                          }`} />
                        <div className="flex-1">
                          <p className="text-gray-900">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img src="/journal-logo.jpeg" alt="JCN-AHP" className="w-16 h-16 object-contain rounded" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Journal of Clinical Nursing and Allied Health Practice</h3>
                      <p className="text-gray-500">Your publication status</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-[#d63384] text-[#d63384]" onClick={() => window.open('/journal', '_blank')}>
                    View Journal
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#d63384]">5</p>
                    <p className="text-sm text-gray-500">Articles Submitted</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#d63384]">3</p>
                    <p className="text-sm text-gray-500">Published</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#d63384]">2</p>
                    <p className="text-sm text-gray-500">Under Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
