import { SimplifiedSDKIntegration } from "@/components/integration/SimplifiedSDKIntegration";
import { TestIntegration } from "@/components/integration/TestIntegration";

const Integration = () => {
  return (
    <div className="space-y-8">
      <SimplifiedSDKIntegration />
      <TestIntegration />
    </div>
  );
};

export default Integration;