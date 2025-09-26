import { WaterSensorType } from "@/types/sensor-types";
import { MqttClient } from "mqtt"
import { useEffect, useState } from "react";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function useWaterSensor({ client, isConnected }: Props) {
	const [waterLevelData, setWaterLevelData] = useState<WaterSensorType>({
		level: 75,
		capacity: 1000,
		status: "normal",
		sensor: "Ultrasonic",
		location: "Main Tank",
		enabled: true,
		alertsEnabled: true
	})

	useEffect(() => {
		publishSensorData(waterLevelData)
	}, [])

	const publishSensorData = (data: WaterSensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish("sensors/waterlevel", JSON.stringify(message), { qos: 0, retain: true }, (err) => {
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

	return { waterLevelData, handleWaterLevelChange }
}
