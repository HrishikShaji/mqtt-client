import { Droplets, MapPin, Send, Thermometer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
import { formatValue, getStatusColor } from "@/lib/utils";
import { TemperatureSensorType } from "@/types/sensor-types";
import TemperatureModal from "./TemperatureModal";
import useTemperatureSensor from "@/features/temperature/hooks/useTemperatureSensor";


interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function TemperatureCard({ client, isConnected }: Props) {
	const { handleTemperatureChange, temperatureData } = useTemperatureSensor({ client, isConnected })

	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex h-10 items-center justify-between">
					<div className="flex items-center gap-2">
						<Thermometer className="h-5 w-5" />
						<div>
							<CardTitle>Temperature Sensor</CardTitle>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							checked={temperatureData.enabled}
							onCheckedChange={(checked) => handleTemperatureChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<TemperatureModal
							onChange={handleTemperatureChange}
							isConnected={isConnected}
							temperatureData={temperatureData}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Current Display */}
				<div className="text-center p-4 ">
					<div className={`text-3xl font-bold ${getStatusColor(temperatureData.temperature, "temperature")}`}>
						{formatValue(temperatureData.temperature)}°C
					</div>
					<div className="text-lg text-muted-foreground mt-1">
						{formatValue(temperatureData.humidity)}% humidity
					</div>
				</div>

			</CardContent>
		</Card>


	)
}
