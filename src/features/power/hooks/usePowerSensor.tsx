import { PowerSensorType } from "@/types/sensor-types";
import { MqttClient } from "mqtt"
import { useEffect, useState } from "react";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function usePowerSensor({ client, isConnected }: Props) {
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

	return { powerData, handlePowerChange }

}
