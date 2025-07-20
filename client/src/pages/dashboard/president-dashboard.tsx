import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Users, Vote, Calendar, UserCheck, Plus, Settings } from 'lucide-react';
import { Link } from 'wouter';

export default function PresidentDashboard() {
  const { t } = useI18n();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: () => api.getMembers(),
  });

  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['/api/meetings'],
    queryFn: () => api.getMeetings(),
  });

  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ['/api/polls'],
    queryFn: () => api.getPolls(),
  });

  const activeMembers = members?.filter((member: any) => member.approved) || [];
  const pendingMembers = members?.filter((member: any) => !member.approved) || [];
  const activePolls = polls?.filter((poll: any) => poll.status === 'ACTIVE') || [];
  const upcomingMeetings = meetings?.filter((meeting: any) => new Date(meeting.scheduledDate) > new Date()) || [];

  const stats = [
    {
      title: 'Active Members',
      value: activeMembers.length,
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      change: `+${pendingMembers.length} pending approval`
    },
    {
      title: 'Active Polls',
      value: activePolls.length,
      icon: Vote,
      color: 'from-purple-400 to-purple-600',
      change: 'Ongoing voting'
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.length,
      icon: Calendar,
      color: 'from-green-400 to-green-600',
      change: 'Scheduled this month'
    },
    {
      title: 'Pending Approvals',
      value: pendingMembers.length,
      icon: UserCheck,
      color: 'from-amber-400 to-amber-600',
      change: 'Member applications'
    }
  ];

  const quickActions = [
    {
      title: 'Approve Members',
      description: 'Review and approve new member applications',
      href: '/management/members',
      icon: UserCheck,
      count: pendingMembers.length
    },
    {
      title: 'Create Poll',
      description: 'Start a new poll for group decisions',
      href: '/polls/create',
      icon: Vote
    },
    {
      title: 'Schedule Meeting',
      description: 'Organize group meetings',
      href: '/meetings/create',
      icon: Calendar
    },
    {
      title: 'Group Settings',
      description: 'Manage group configuration',
      href: '/management/groups',
      icon: Settings
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboard.president.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.president.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4 relative">
                    <action.icon className="w-6 h-6 text-white" />
                    {action.count && action.count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Member Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Member Approvals</CardTitle>
            <Link href="/management/members">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
                <p className="text-sm">All member applications are processed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.slice(0, 5).map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs">Approve</Button>
                      <Button size="sm" variant="outline" className="text-xs">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Polls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Polls</CardTitle>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Poll
            </Button>
          </CardHeader>
          <CardContent>
            {pollsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activePolls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active polls</p>
                <p className="text-sm">Create a poll to gather group opinions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePolls.slice(0, 3).map((poll: any) => (
                  <div key={poll.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{poll.title}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{poll.description}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Meetings</CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </CardHeader>
        <CardContent>
          {meetingsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming meetings</p>
              <p className="text-sm">Schedule your next group meeting</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.map((meeting: any) => (
                <div key={meeting.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{meeting.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{meeting.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <p>Date: {new Date(meeting.scheduledDate).toLocaleDateString()}</p>
                    <p>Time: {new Date(meeting.scheduledDate).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
