import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { AgentStudioLayout } from "@/components/agents/agent-studio-layout";
import { AgentConfiguration } from "@/components/agents/configure/agent-configuration";
import { api } from "@/convex/_generated/api";

export default function EditAgent() {
  const { agentId } = useParams<{ agentId: string }>();

  const agent = useQuery(
    api.agents.getAgentById,
    agentId ? { agentId } : "skip"
  );

  return (
    <AgentStudioLayout mode="edit" agent={agent}>
      <AgentConfiguration mode="edit" agent={agent} />
    </AgentStudioLayout>
  );
}
