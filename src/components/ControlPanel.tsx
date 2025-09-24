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
import SwitchControl from "./SwitchControl"
import { SERVER_URL } from "@/lib/variables"

export default function ControlPanel() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect(SERVER_URL)

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

				{/* Sensor Controls Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<SwitchControl
						isConnected={isConnected}
						client={client}
					/>
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
