import { Droplets } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
import { getStatusColor } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { WaterSensorType } from "@/types/sensor-types";
import WaterModal from "./WaterModal";
import useWaterSensor from "@/features/water/hooks/useWaterSensor";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function WaterSensor({ client, isConnected }: Props) {
	const { waterLevelData, handleWaterLevelChange } = useWaterSensor({ client, isConnected })
	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Droplets className="h-5 w-5" />
						<div>
							<CardTitle>Water Level Sensor</CardTitle>
							<CardDescription>Ultrasonic - {waterLevelData.location}</CardDescription>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							checked={waterLevelData.enabled}
							onCheckedChange={(checked) => handleWaterLevelChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<Badge variant={waterLevelData.enabled ? "default" : "secondary"}>
							{waterLevelData.enabled ? "ON" : "OFF"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Current Display */}
				<div className="text-center p-4 bg-muted/50 rounded-lg">
					<div className={`text-3xl font-bold ${getStatusColor(waterLevelData.level, "waterLevel")}`}>
						{waterLevelData.level}%
					</div>
					<Progress value={waterLevelData.level} className="mt-3" />
					<div className="text-sm text-muted-foreground mt-2 capitalize">
						Status: {waterLevelData.status}
					</div>
					<div className="text-xs text-muted-foreground mt-1">
						{Math.round((waterLevelData.level / 100) * waterLevelData.capacity)}L / {waterLevelData.capacity}L
					</div>
				</div>

				<WaterModal
					onChange={handleWaterLevelChange}
					isConnected={isConnected}
					waterData={waterLevelData}
				/>
			</CardContent>
		</Card>
	)
}
