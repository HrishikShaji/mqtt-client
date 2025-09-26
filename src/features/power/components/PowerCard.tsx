import { Send, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MqttClient } from "mqtt";
import { formatValue } from "@/lib/utils";
import PowerModal from "./PowerModal";
import usePowerSensor from "@/features/power/hooks/usePowerSensor";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function PowerCard({ client, isConnected }: Props) {
	const { powerData, handlePowerChange } = usePowerSensor({ client, isConnected })

	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						<div>
							<CardTitle>Power Sensor</CardTitle>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							checked={powerData.enabled}
							onCheckedChange={(checked) => handlePowerChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<PowerModal
							onChange={handlePowerChange}
							isConnected={isConnected}
							powerData={powerData}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="text-center p-4 ">
					<div className={`text-3xl font-bold text-green-500`}>
						{formatValue(powerData.voltage)}V
					</div>
					<div className="text-sm text-muted-foreground mt-2 capitalize">
						stable
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
