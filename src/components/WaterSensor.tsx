import { Droplets, Gauge, MapPin, Send, Thermometer } from "lucide-react";
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
import { Progress } from "./ui/progress";
import { WaterSensorType } from "@/types/sensor-types";


interface Props {
	client: MqttClient;
	isConnected: boolean;
}
const tankLocations = ["Main Tank", "Backup Tank", "Storage Tank", "Emergency Tank", "Roof Tank"]
const tankCapacities = [500, 750, 1000, 1500, 2000, 2500, 3000, 5000]

export default function WaterSensor({ client, isConnected }: Props) {
	const [waterLevelData, setWaterLevelData] = useState<WaterSensorType>({
		level: 75,
		capacity: 1000,
		status: "normal",
		sensor: "Ultrasonic",
		location: "Main Tank",
		enabled: true,
		alertsEnabled: true
	})
	const publishSensorData = (data: WaterSensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish("sensors/waterlevel", JSON.stringify(message), (err) => {
				if (err) {
					console.error(`Publish error for water:`, err)
				} else {
					console.log(`water data published:`, message)
				}
			})
		}
	}


	const handleWaterLevelChange = (field: string, value: any) => {
		const newData = { ...waterLevelData, [field]: value }
		setWaterLevelData(newData)
		publishSensorData(newData)
	}

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

				{/* Water Level Slider */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Gauge className="h-4 w-4" />
							Water Level
						</Label>
						<span className="text-sm font-medium">{waterLevelData.level}%</span>
					</div>
					<Slider
						value={[waterLevelData.level]}
						onValueChange={(value) => handleWaterLevelChange("level", value[0])}
						max={100}
						min={0}
						step={1}
						disabled={!isConnected || !waterLevelData.enabled}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Empty</span>
						<span>Full</span>
					</div>
				</div>

				{/* Tank Capacity Dropdown */}
				<div className="space-y-2">
					<Label>Tank Capacity</Label>
					<Select
						value={waterLevelData.capacity.toString()}
						onValueChange={(value) => handleWaterLevelChange("capacity", parseInt(value))}
						disabled={!isConnected || !waterLevelData.enabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{tankCapacities.map((capacity) => (
								<SelectItem key={capacity} value={capacity.toString()}>{capacity}L</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Status Dropdown */}
				<div className="space-y-2">
					<Label>Status</Label>
					<Select
						value={waterLevelData.status}
						onValueChange={(value) => handleWaterLevelChange("status", value)}
						disabled={!isConnected || !waterLevelData.enabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="normal">Normal</SelectItem>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="critical">Critical</SelectItem>
							<SelectItem value="full">Full</SelectItem>
							<SelectItem value="overflow">Overflow</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Location and Alerts */}
				<div className="space-y-3">
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Location
						</Label>
						<Select
							value={waterLevelData.location}
							onValueChange={(value) => handleWaterLevelChange("location", value)}
							disabled={!isConnected || !waterLevelData.enabled}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{tankLocations.map((location) => (
									<SelectItem key={location} value={location}>{location}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							id="alerts"
							checked={waterLevelData.alertsEnabled}
							onCheckedChange={(checked) => handleWaterLevelChange("alertsEnabled", checked)}
							disabled={!isConnected || !waterLevelData.enabled}
						/>
						<Label htmlFor="alerts">Low level alerts</Label>
					</div>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Send className="h-3 w-3" />
					<span>Auto-publishes to sensors/waterlevel</span>
				</div>
			</CardContent>
		</Card>

	)
}
