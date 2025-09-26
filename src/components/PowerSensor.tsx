import { Send, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
import { formatValue } from "@/lib/utils";
import { PowerSensorType } from "@/types/sensor-types";
import { Separator } from "./ui/separator";
import PowerModal from "./PowerModal";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function PowerSensor({ client, isConnected }: Props) {
	const [powerData, setPowerData] = useState<PowerSensorType>({
		voltage: 220.0,
		current: 5.5,
		power: 1210,
		frequency: 50.0,
		powerFactor: 0.95,
		sensor: "Power Meter",
		phase: "Single",
		enabled: true,
		monitoring: true
	})

	useEffect(() => {
		publishSensorData(powerData)
	}, [])

	const publishSensorData = (data: PowerSensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish("sensors/power", JSON.stringify(message), { qos: 0, retain: true }, (err) => {
				if (err) {
					console.error(`Publish error for power:`, err)
				} else {
					console.log(`power data published:`, message)
				}
			})
		}
	}

	const handlePowerChange = (field: string, value: any) => {
		const newData = { ...powerData, [field]: value }
		setPowerData(newData)
		publishSensorData(newData)
	}

	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						<div>
							<CardTitle>Power Sensor</CardTitle>
							<CardDescription>Power Meter - Single Phase</CardDescription>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							checked={powerData.enabled}
							onCheckedChange={(checked) => handlePowerChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<Badge variant={powerData.enabled ? "default" : "secondary"}>
							{powerData.enabled ? "ON" : "OFF"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Current Display */}
				<div className="p-4 bg-muted/50 rounded-lg">
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Voltage:</span>
							<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.voltage)}V</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Current:</span>
							<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.current, 2)}A</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Power:</span>
							<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.power, 0)}W</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Frequency:</span>
							<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.frequency, 2)}Hz</span>
						</div>
					</div>
					<Separator className="my-3" />
					<div className="flex justify-center">
						<div className="flex justify-between w-full">
							<span className="text-muted-foreground">Power Factor:</span>
							<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.powerFactor, 3)}</span>
						</div>
					</div>
				</div>

				<PowerModal
					onChange={handlePowerChange}
					isConnected={isConnected}
					powerData={powerData}
				/>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Send className="h-3 w-3" />
					<span>Auto-publishes to sensors/power</span>
				</div>
			</CardContent>
		</Card>
	)
}
