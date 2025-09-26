import { Droplets, MapPin, Send, Thermometer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
import { formatValue, getStatusColor } from "@/lib/utils";
import { TemperatureSensorType } from "@/types/sensor-types";
import TemperatureModal from "./TemperatureModal";


interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function TemperatureSensor({ client, isConnected }: Props) {

	const [temperatureData, setTemperatureData] = useState<TemperatureSensorType>({
		temperature: 25.0,
		humidity: 60.0,
		sensor: "DHT22",
		location: "Living Room",
		enabled: true
	})
	const handleTemperatureChange = (field: string, value: any) => {
		const newData = { ...temperatureData, [field]: value }
		setTemperatureData(newData)
		publishSensorData(newData)
	}

	useEffect(() => {
		publishSensorData(temperatureData)
	}, [])

	const publishSensorData = (data: TemperatureSensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish("sensors/temperature", JSON.stringify(message), { qos: 0, retain: true }, (err) => {
				if (err) {
					console.error(`Publish error for Temperature:`, err)
				} else {
					console.log(`Temperature data published:`, message)
				}
			})
		}
	}

	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Thermometer className="h-5 w-5" />
						<div>
							<CardTitle>Temperature Sensor</CardTitle>
							<CardDescription>DHT22 - {temperatureData.location}</CardDescription>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							checked={temperatureData.enabled}
							onCheckedChange={(checked) => handleTemperatureChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<Badge variant={temperatureData.enabled ? "default" : "secondary"}>
							{temperatureData.enabled ? "ON" : "OFF"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Current Display */}
				<div className="text-center p-4 bg-muted/50 rounded-lg">
					<div className={`text-3xl font-bold ${getStatusColor(temperatureData.temperature, "temperature")}`}>
						{formatValue(temperatureData.temperature)}°C
					</div>
					<div className="text-lg text-muted-foreground mt-1">
						{formatValue(temperatureData.humidity)}% humidity
					</div>
				</div>
				<TemperatureModal
					onChange={handleTemperatureChange}
					isConnected={isConnected}
					temperatureData={temperatureData}
				/>

			</CardContent>
		</Card>


	)
}
