import { Droplets, MapPin, Power, Send, Thermometer, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import { MqttClient } from "mqtt";
import { Button } from "./ui/button";
import { SwitchSensorType } from "@/types/sensor-types";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}


export default function SwitchControl({ client, isConnected }: Props) {
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

	return (
		<Card className="border-2">
			<CardHeader className="text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-2xl">
					<Power className="h-6 w-6" />
					Main Switch Control
				</CardTitle>
				<CardDescription>Control the main device switch remotely</CardDescription>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="flex flex-col items-center space-y-6">
					<Button
						onClick={toggleSwitch}
						disabled={!isConnected}
						size="lg"
						variant={switchState ? "default" : "outline"}
						className={`h-20 w-40 text-xl font-bold transition-all duration-300 ${switchState
							? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
							: "hover:bg-muted"
							} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{switchState ? "ON" : "OFF"}
					</Button>

					<div className="text-center space-y-2">
						<p className="text-lg font-semibold">
							Switch is{" "}
							<span
								className={switchState ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
							>
								{switchState ? "ON" : "OFF"}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">Click the button to toggle state</p>
					</div>
				</div>
			</CardContent>
		</Card>

	)
}
