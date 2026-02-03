import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Plus, Target, FileText, AlertTriangle, Users, BarChart3 } from "lucide-react";
import { useStrategicInitiatives, type StrategicInitiative, type InitiativeStatus, type InitiativePriority } from "@/hooks/useStrategicInitiatives";
import { useCampaigns, type Campaign } from "@/hooks/useCampaigns";
import { InitiativeStatusBadge, InitiativePriorityBadge, DeleteInitiativeDialog } from "@/components/initiatives";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { format } from "date-fns";

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initiatives, isLoading: initiativesLoading, deleteInitiative } = useStrategicInitiatives();
  const { campaigns, isLoading: campaignsLoading, createCampaign } = useCampaigns();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  
  const initiative = useMemo(() => 
    initiatives.find(i => i.id === id), 
    [initiatives, id]
  );
  
  // Filter campaigns that belong to this initiative
  const linkedCampaigns = useMemo(() => 
    campaigns.filter(c => (c as any).initiative_id === id),
    [campaigns, id]
  );

  const handleDeleteConfirm = async () => {
    if (initiative) {
      await deleteInitiative(initiative.id);
      navigate("/initiatives");
    }
  };

  const handleCreateCampaign = async (data: any) => {
    await createCampaign({
      ...data,
      initiative_id: id,
      start_date: data.start_date?.toISOString().split('T')[0] || null,
      end_date: data.end_date?.toISOString().split('T')[0] || null,
      budget: data.budget ? parseFloat(data.budget) : null,
    });
  };

  if (initiativesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!initiative) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Initiative not found</p>
          <Button variant="link" onClick={() => navigate("/initiatives")}>
            Back to Initiatives
          </Button>
        </div>
      </AppLayout>
    );
  }

  const goals = initiative.strategic_goals as { goal: string; target: string }[] | null;
  const stakeholders = initiative.stakeholders as { name: string; role: string }[] | null;
  const metrics = initiative.success_metrics as { metric: string; target: string; current?: string }[] | null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/initiatives")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{initiative.name}</h1>
              <InitiativeStatusBadge status={initiative.status as InitiativeStatus} />
              <InitiativePriorityBadge priority={initiative.priority as InitiativePriority} />
            </div>
            {initiative.description && (
              <p className="text-muted-foreground">{initiative.description}</p>
            )}
            {(initiative.timeline_start || initiative.timeline_end) && (
              <p className="text-sm text-muted-foreground mt-1">
                {initiative.timeline_start && format(new Date(initiative.timeline_start), "MMM d, yyyy")}
                {initiative.timeline_start && initiative.timeline_end && " - "}
                {initiative.timeline_end && format(new Date(initiative.timeline_end), "MMM d, yyyy")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns ({linkedCampaigns.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Strategic Goals */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Strategic Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goals && goals.length > 0 ? (
                    <ul className="space-y-2">
                      {goals.map((goal, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span>{goal.goal}</span>
                          <span className="text-muted-foreground">{goal.target}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No goals defined</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {initiative.action_plan ? (
                    <p className="text-sm whitespace-pre-wrap">{initiative.action_plan}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No action plan defined</p>
                  )}
                </CardContent>
              </Card>

              {/* Risks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risks & Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {initiative.risks ? (
                    <p className="text-sm whitespace-pre-wrap">{initiative.risks}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No risks documented</p>
                  )}
                </CardContent>
              </Card>

              {/* Success Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics && metrics.length > 0 ? (
                    <ul className="space-y-2">
                      {metrics.map((metric, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{metric.metric}</span>
                            <span className="text-muted-foreground">Target: {metric.target}</span>
                          </div>
                          {metric.current && (
                            <div className="text-muted-foreground text-xs">Current: {metric.current}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No metrics defined</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stakeholders */}
            {stakeholders && stakeholders.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Stakeholders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {stakeholders.map((s, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground"> - {s.role}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Campaigns linked to this initiative
              </p>
              <Button onClick={() => setCreateCampaignOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
            <CampaignList 
              campaigns={linkedCampaigns} 
              isLoading={campaignsLoading}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
            />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources Needed</CardTitle>
              </CardHeader>
              <CardContent>
                {initiative.resources_needed ? (
                  <p className="whitespace-pre-wrap">{initiative.resources_needed}</p>
                ) : (
                  <p className="text-muted-foreground">No resources documented</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteInitiativeDialog
        initiative={initiative}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />

      <CreateCampaignDialog
        open={createCampaignOpen}
        onOpenChange={setCreateCampaignOpen}
        onSubmit={handleCreateCampaign}
      />
    </AppLayout>
  );
}
