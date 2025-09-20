"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TemperatureSensor from "./TemperatureSensor"
import WaterSensor from "./WaterSensor"
import PowerSensor from "./PowerSensor"
import { Power, Wifi, WifiOff } from "lucide-react"

export default function ControlPanel() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [switchState, setSwitchState] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect("ws://localhost:8883")

		mqttClient.on("connect", () => {
			console.log("Connected to MQTT broker")
			setIsConnected(true)
			setConnectionStatus("Connected")
			setClient(mqttClient)
		})

		mqttClient.on("error", (err) => {
			console.error("MQTT connection error:", err)
			setConnectionStatus(`Error: ${err.message}`)
		})

		mqttClient.on("offline", () => {
			setIsConnected(false)
			setConnectionStatus("Offline")
		})

		mqttClient.on("reconnect", () => {
			setConnectionStatus("Reconnecting...")
		})

		return () => {
			if (mqttClient) {
				mqttClient.end()
			}
		}
	}, [])

	const toggleSwitch = () => {
		if (client && isConnected) {
			const newState = !switchState
			setSwitchState(newState)

			const message = {
				state: newState,
				timestamp: new Date().toISOString(),
				device: "main-switch",
			}

			client.publish("switch/state", JSON.stringify(message), (err) => {
				if (err) {
					console.error("Publish error:", err)
				} else {
					console.log("Switch state published:", newState)
				}
			})
		}
	}

	if (!client) return null

	return (
		<div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight text-balance">Trailer Control Panel</h1>
					<p className="text-muted-foreground text-lg">Interactive sensor control with sliders and toggles</p>
				</div>

				{/* Connection Status */}
				<Card className="border-2">
					<CardContent className="pt-6">
						<div className="flex items-center justify-center gap-3">
							{isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
							<Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-3 py-1">
								{connectionStatus}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Main Switch Control */}
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

				{/* Sensor Controls Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Temperature Sensor Control */}
					<TemperatureSensor
						isConnected={isConnected}
						client={client}
					/>
					{/* Water Level Sensor Control */}
					<WaterSensor
						isConnected={isConnected}
						client={client}
					/>
					{/* Power Sensor Control */}
					<PowerSensor
						isConnected={isConnected}
						client={client}
					/>
				</div>

			</div>
		</div>
	)
}
