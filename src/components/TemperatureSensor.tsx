import { Droplets, MapPin, Send, Thermometer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select } from "./ui/select"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { MqttClient } from "mqtt";
import { formatValue, getStatusColor } from "@/lib/utils";
import { TemperatureSensorType } from "@/types/sensor-types";


interface Props {
	client: MqttClient;
	isConnected: boolean;
}
const locations = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Garage", "Basement", "Attic", "Outdoor"]

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

	const publishSensorData = (data: TemperatureSensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish("sensors/temperature", JSON.stringify(message), (err) => {
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

				{/* Temperature Slider */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Thermometer className="h-4 w-4" />
							Temperature
						</Label>
						<span className="text-sm font-medium">{formatValue(temperatureData.temperature)}°C</span>
					</div>
					<Slider
						value={[temperatureData.temperature]}
						onValueChange={(value) => handleTemperatureChange("temperature", value[0])}
						max={45}
						min={-10}
						step={0.1}
						disabled={!isConnected || !temperatureData.enabled}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>-10°C</span>
						<span>45°C</span>
					</div>
				</div>

				{/* Humidity Slider */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Droplets className="h-4 w-4" />
							Humidity
						</Label>
						<span className="text-sm font-medium">{formatValue(temperatureData.humidity)}%</span>
					</div>
					<Slider
						value={[temperatureData.humidity]}
						onValueChange={(value) => handleTemperatureChange("humidity", value[0])}
						max={100}
						min={0}
						step={0.1}
						disabled={!isConnected || !temperatureData.enabled}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>0%</span>
						<span>100%</span>
					</div>
				</div>

				{/* Location Dropdown */}
				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						Location
					</Label>
					<Select
						value={temperatureData.location}
						onValueChange={(value: string) => handleTemperatureChange("location", value)}
						disabled={!isConnected || !temperatureData.enabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{locations.map((location) => (
								<SelectItem key={location} value={location}>{location}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Send className="h-3 w-3" />
					<span>Auto-publishes to sensors/temperature</span>
				</div>
			</CardContent>
		</Card>


	)
}
