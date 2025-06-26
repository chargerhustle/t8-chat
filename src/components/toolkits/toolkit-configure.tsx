import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import type {
  Toolkits,
  ServerToolkitParameters,
} from "@/toolkits/toolkits/shared";
import type { ClientToolkit } from "@/toolkits/types";
import type { SelectedToolkit } from "@/toolkits/types";

interface ClientToolkitConfigureProps {
  toolkit: ClientToolkit;
  id: Toolkits;
  schema: z.ZodObject<z.ZodRawShape>;
  onAdd: (toolkit: SelectedToolkit) => void;
}

export const ClientToolkitConfigure: React.FC<ClientToolkitConfigureProps> = ({
  toolkit,
  id,
  schema,
  onAdd,
}) => {
  const [parameters, setParameters] = useState<
    ServerToolkitParameters[typeof id]
  >({} as ServerToolkitParameters[typeof id]);

  const handleSubmit = () => {
    onAdd({ id, toolkit, parameters });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">{toolkit.name}</h4>
      </div>

      <div className="space-y-4">
        {toolkit.form && (
          <toolkit.form
            parameters={parameters}
            setParameters={(p) =>
              setParameters(p as ServerToolkitParameters[typeof id])
            }
          />
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!schema.safeParse(parameters).success}
        className="w-full"
      >
        <Plus className="mr-2 size-4" />
        Add {toolkit.name}
      </Button>
    </div>
  );
};
