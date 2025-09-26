import { SwitchSensorType } from "@/types/sensor-types"
import { MqttClient } from "mqtt"
import { useEffect, useState } from "react"

interface Props {
	client: MqttClient;
	isConnected: boolean;
}

export default function useSwitchSensor({ client, isConnected }: Props) {
	const [switchState, setSwitchState] = useState(false)

	const toggleSwitch = () => {
		const newState = !switchState
		setSwitchState(newState)
		if (client && isConnected) {
			const newState = !switchState
			setSwitchState(newState)
			publishSensorData(newState)
		}
	}

	useEffect(() => {
		publishSensorData(switchState)
	}, [])

	const publishSensorData = (newState: boolean) => {
		if (client && isConnected) {

			const message: SwitchSensorType = {
				state: newState,
				timestamp: new Date().toISOString(),
				device: "main-switch",
			}

			client.publish("switch/state", JSON.stringify(message), { qos: 0, retain: true }, (err) => {
				if (err) {
					console.error("Publish error:", err)
				} else {
					console.log("Switch state published:", message.state)
				}
			})
		}
	}

	return { toggleSwitch, switchState, setSwitchState }

}
