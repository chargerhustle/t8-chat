import { AgentStudioLayout } from "@/components/agents/agent-studio-layout";
import { AgentConfiguration } from "@/components/agents/configure/agent-configuration";

export default function CreateAgent() {
  return (
    <AgentStudioLayout mode="create">
      <AgentConfiguration mode="create" />
    </AgentStudioLayout>
  );
}
