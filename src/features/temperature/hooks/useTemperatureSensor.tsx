import { TemperatureSensorType } from "@/types/sensor-types";
import { MqttClient } from "mqtt"
import { useEffect, useState } from "react";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function useTemperatureSensor({ client, isConnected }: Props) {
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

	return { temperatureData, handleTemperatureChange }

}
